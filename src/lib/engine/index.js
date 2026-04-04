// ---------------------------------------------------------------------------
// Scoring Engine Orchestrator
//
// Fetches all data from Supabase, runs RAUS + SSA + Big Board calculations,
// and writes the results back. This is the single entry point for a full
// recalculation of the entire board.
// ---------------------------------------------------------------------------

import { supabase } from '../supabase.js'
import { computeRAUS, assignTier } from './raus.js'
import { computeSSA } from './ssa.js'
import { computeComposite, assignAllBands, computeSizeMultiplier, computeAgeMultiplier } from './bigboard.js'
import { computeDerivedMetrics } from './derived.js'
import { computeAgeAdjustedScore, computeAgeCurveScore } from './agecurve.js'
import { computeSkillMetrics, computePTC } from './skillmetrics.js'
import { computeAutoSSAGrades } from './ssaauto.js'
import { getPositionalDefaults } from '../positionalDefaults.js'
import { fillDefaultsSync } from '../fillDefaults.js'
import { computeAthleticScores, ATHLETIC_DEFAULTS, fillAthleticDefaults } from './athletic.js'

/**
 * Run full recalculation for all players.
 * Returns { success, errors, playerCount }.
 */
export async function recalculateAll(onProgress) {
  const errors = []
  const progress = (msg) => { onProgress?.(msg); console.log(msg) }

  // -----------------------------------------------------------------------
  // 1. Fetch all source data
  // -----------------------------------------------------------------------
  progress('Fetching data...')

  const [
    { data: players, error: e1 },
    { data: rausRows, error: e2 },
    { data: ssaInputs, error: e3 },
    { data: prospects, error: e4 },
    { data: athleticRows, error: e5 },
    { data: measurables, error: e6 },
  ] = await Promise.all([
    supabase.from('players').select('*'),
    supabase.from('raus_scores').select('*'),
    supabase.from('ssa_input').select('*'),
    supabase.from('prospects').select('player_id, league_conf, class, height'),
    supabase.from('athletic_scores').select('*'),
    supabase.from('measurables').select('player_id, ws_minus_h'),
  ])

  for (const [label, err] of [['players', e1], ['raus', e2], ['ssa_input', e3], ['prospects', e4], ['athletic', e5], ['measurables', e6]]) {
    if (err) { errors.push(`Fetch ${label}: ${err.message}`); return { success: false, errors, playerCount: 0 } }
  }

  // Build lookup maps
  const rausMap = new Map(rausRows.map(r => [r.player_id, r]))
  const ssaInputMap = new Map(ssaInputs.map(r => [r.player_id, r]))
  const prospectMap = new Map(prospects.map(r => [r.player_id, r]))
  const athleticMap = new Map(athleticRows.map(r => [r.player_id, r]))
  const measMap = new Map(measurables.map(r => [r.player_id, r]))

  // -----------------------------------------------------------------------
  // 1b. Compute OAI/AAA from measurables for all players
  //     - Players WITH raw combine data: compute from formulas
  //     - Players WITHOUT measurables: fill positional average (5.0/5.0)
  // -----------------------------------------------------------------------
  progress('Computing athletic scores (OAI/AAA)...')

  // Fetch full measurables for athletic computation
  const { data: fullMeasForAthletic } = await supabase.from('measurables').select('*')
  const fullMeasForAthMap = new Map((fullMeasForAthletic || []).map(r => [r.player_id, r]))

  const athleticUpserts = []
  let computedCount = 0, filledCount = 0

  for (const player of players) {
    const pid = player.player_id
    const meas = fullMeasForAthMap.get(pid)
    const bucket = player.primary_bucket || 'Wing'

    // Fill missing measurables with 50th-percentile positional defaults
    // so every player gets a full computation chain
    const { filled } = fillAthleticDefaults(meas, bucket)

    // Compute OAI/AAA from merged measurables (real + defaults)
    const computed = computeAthleticScores(filled)

    if (computed && computed.oai != null) {
      const hasRealData = meas && (meas.three_quarter_sprint != null || meas.max_vertical != null || meas.vertical != null || meas.lane_agility != null || meas.shuttle != null)
      const entry = {
        player_id: pid,
        mas_sqrt: computed.mas_sqrt,
        mav: computed.mav,
        mami: computed.mami,
        oai: computed.oai,
        aaa: computed.aaa,
      }
      athleticMap.set(pid, entry)
      athleticUpserts.push(entry)
      if (hasRealData) computedCount++
      else filledCount++
    }
  }

  if (athleticUpserts.length > 0) {
    const { error: athErr } = await supabase.from('athletic_scores').upsert(athleticUpserts, { onConflict: 'player_id' })
    if (athErr) errors.push(`Athletic scores upsert: ${athErr.message}`)
    else progress(`  Athletic: ${computedCount} from real data, ${filledCount} from positional defaults`)
  }

  // -----------------------------------------------------------------------
  // 2. Compute skill metrics from stats + PTC from conference
  // -----------------------------------------------------------------------
  progress('Computing skill metrics from stats...')

  // Fetch stats for skill metric computation
  const { data: allStatsForMetrics } = await supabase.from('stats').select('*')
  const statsForMetricsMap = new Map()
  const playerStatsForMetrics = new Map()
  for (const s of (allStatsForMetrics || [])) {
    if (!playerStatsForMetrics.has(s.player_id)) playerStatsForMetrics.set(s.player_id, [])
    playerStatsForMetrics.get(s.player_id).push(s)
  }
  for (const [pid, rows] of playerStatsForMetrics) {
    rows.sort((a, b) => (b.season || '').localeCompare(a.season || ''))
    statsForMetricsMap.set(pid, rows[0]) // most recent season
  }

  // -----------------------------------------------------------------------
  // 2a. Load positional defaults and fill NULL stats/measurables
  // -----------------------------------------------------------------------
  progress('Loading positional defaults...')
  let posDefaults = { guard: {}, wing: {}, big: {} }
  try {
    posDefaults = await getPositionalDefaults()
  } catch (err) {
    progress(`  Warning: Could not load positional defaults: ${err.message}`)
  }

  // Build filled stats map (originals + defaults for NULLs)
  const filledStatsMap = new Map()
  for (const [pid, rawStats] of statsForMetricsMap) {
    const player = players.find(p => p.player_id === pid)
    if (!player) { filledStatsMap.set(pid, rawStats); continue }
    const meas = measMap.get(pid)
    const { stats: filled } = fillDefaultsSync(rawStats, meas, player.primary_bucket, posDefaults)
    filledStatsMap.set(pid, filled)
  }

  // Also fill defaults for players with NO stats at all
  for (const player of players) {
    if (!filledStatsMap.has(player.player_id)) {
      const meas = measMap.get(player.player_id)
      const { stats: filled } = fillDefaultsSync(null, meas, player.primary_bucket, posDefaults)
      if (Object.keys(filled).length > 0) {
        filled.player_id = player.player_id
        filledStatsMap.set(player.player_id, filled)
      }
    }
  }

  // Pre-compute the full stats array ONCE for percentile-based normalization
  // Use filled stats so players with defaults contribute to the pool
  const allStatsArray = Array.from(filledStatsMap.values())

  const skillMetricUpdates = []
  for (const player of players) {
    const pid = player.player_id
    const playerStats = filledStatsMap.get(pid)
    const prospect = prospectMap.get(pid)

    // Compute PTC from conference
    const ptc = computePTC(prospect?.league_conf)

    // Compute skill metrics from stats (percentile-based against full pool)
    const metrics = computeSkillMetrics(playerStats, player.primary_bucket, allStatsArray)

    skillMetricUpdates.push({
      player_id: pid,
      scr_auto: metrics.scr,
      rpi_auto: metrics.rpi,
      sci_auto: metrics.sci,
      ucs_auto: metrics.ucs,
      fcs_auto: metrics.fcs,
      adr_auto: metrics.adr,
      sti_auto: metrics.sti,
      rsm_auto: metrics.rsm,
      dri_auto: metrics.dri,
      ptc_auto: ptc,
    })
  }

  // Batch upsert skill metrics to raus_scores
  if (skillMetricUpdates.length > 0) {
    for (let i = 0; i < skillMetricUpdates.length; i += 50) {
      const batch = skillMetricUpdates.slice(i, i + 50)
      const { error } = await supabase.from('raus_scores').upsert(batch, { onConflict: 'player_id' })
      if (error) errors.push(`Skill metrics batch ${i}: ${error.message}`)
    }
    progress(`  Skill metrics: ${skillMetricUpdates.length} players computed`)
  }

  // Build updated raus map with new skill metrics
  const updatedRausMap = new Map()
  for (const u of skillMetricUpdates) {
    const existing = rausMap.get(u.player_id) || {}
    updatedRausMap.set(u.player_id, { ...existing, ...u })
  }

  // -----------------------------------------------------------------------
  // 3. Recalculate RAUS for each player
  // -----------------------------------------------------------------------
  progress(`Recalculating RAUS for ${players.length} players...`)

  const rausUpdates = []
  for (const player of players) {
    const pid = player.player_id
    const raus = updatedRausMap.get(pid) || rausMap.get(pid)
    if (!raus) continue

    const computed = computeRAUS({
      ...raus,
      primary_bucket: player.primary_bucket,
    })

    rausUpdates.push({
      player_id: pid,
      star_index: computed.star_index,
      raus_base: computed.raus_base,
      raus_weighted: computed.raus_weighted,
      raus_final_auto: computed.raus_final_auto,
      raus_final: computed.raus_final,
      ppi_auto: computed.ppi_auto,
    })
  }

  // Batch upsert RAUS
  if (rausUpdates.length > 0) {
    for (let i = 0; i < rausUpdates.length; i += 50) {
      const batch = rausUpdates.slice(i, i + 50)
      const { error } = await supabase.from('raus_scores').upsert(batch, { onConflict: 'player_id' })
      if (error) errors.push(`RAUS upsert batch ${i}: ${error.message}`)
    }
    progress(`  RAUS: ${rausUpdates.length} players updated`)
  }

  // Refresh raus data after update
  const rausFinalMap = new Map(rausUpdates.map(r => [r.player_id, r.raus_final]))

  // -----------------------------------------------------------------------
  // 3.5. Compute auto SSA grades from stats
  // -----------------------------------------------------------------------
  progress('Computing auto SSA grades from stats...')

  // Use filled stats for all players to build percentile ranks
  const statsForSSA = []
  for (const player of players) {
    const s = filledStatsMap.get(player.player_id)
    if (s) statsForSSA.push(s)
  }

  const autoSSAMap = computeAutoSSAGrades(statsForSSA)

  // Upsert auto grades to ssa_input (only for players who don't have manual overrides)
  const ssaAutoUpdates = []
  for (const player of players) {
    const pid = player.player_id
    const autoGrades = autoSSAMap.get(pid)
    if (!autoGrades) continue

    const existing = ssaInputMap.get(pid)
    // If no existing ssa_input row, create one with auto grades
    // If existing, only update fields that are still at default (5.0) or null
    const row = { player_id: pid }
    let hasUpdate = false

    for (const [key, val] of Object.entries(autoGrades)) {
      if (val == null) continue
      if (!existing || existing[key] == null || existing[key] === 5) {
        row[key] = val
        hasUpdate = true
      }
    }

    if (hasUpdate) {
      ssaAutoUpdates.push(row)
    }
  }

  if (ssaAutoUpdates.length > 0) {
    for (let i = 0; i < ssaAutoUpdates.length; i += 50) {
      const batch = ssaAutoUpdates.slice(i, i + 50)
      const { error } = await supabase.from('ssa_input').upsert(batch, { onConflict: 'player_id' })
      if (error) errors.push(`SSA auto grades batch ${i}: ${error.message}`)
    }
    progress(`  SSA auto grades: ${ssaAutoUpdates.length} players updated`)
  }

  // Refresh ssa_input map after auto grades
  const { data: refreshedSSAInput } = await supabase.from('ssa_input').select('*')
  const updatedSSAInputMap = new Map((refreshedSSAInput || []).map(r => [r.player_id, r]))

  // -----------------------------------------------------------------------
  // 4. Recalculate SSA for each player
  // -----------------------------------------------------------------------
  progress(`Recalculating SSA for ${players.length} players...`)

  const ssaUpdates = []
  for (const player of players) {
    const pid = player.player_id
    const input = updatedSSAInputMap.get(pid) || ssaInputMap.get(pid)
    if (!input) continue

    const bucket = player.primary_bucket
    const meas = measMap.get(pid)

    // WS-H modifier: 1 + ((ws_minus_h - 2.5) / 25)
    // Use positional default if real ws_minus_h is missing
    const wsH = meas?.ws_minus_h ?? posDefaults[bucket?.toLowerCase()]?.ws_minus_h
    let wsHMod = 1.0
    if (wsH != null) {
      wsHMod = 1 + ((wsH - 2.5) / 25)
    }

    // Age modifier: younger gets a bump
    // For historical players, use draft year instead of current year
    let ageMod = 1.0
    if (player.birth_year != null) {
      const draftYr = player.draft_class ? parseInt(player.draft_class) : null
      const age = (draftYr && draftYr < 2026) ? draftYr - player.birth_year : 2026 - player.birth_year
      // 18 → 1.05, 19 → 1.025, 20 → 1.0, 21 → 0.975, 22 → 0.95
      ageMod = 1 + (20 - age) * 0.025
      ageMod = Math.max(0.9, Math.min(1.15, ageMod))
    }

    const computed = computeSSA(input, bucket, ageMod, wsHMod)
    if (!computed) continue

    ssaUpdates.push({ player_id: pid, ...computed })
  }

  if (ssaUpdates.length > 0) {
    const { error } = await supabase.from('ssa_scores').upsert(ssaUpdates, { onConflict: 'player_id' })
    if (error) errors.push(`SSA upsert: ${error.message}`)
    else progress(`  SSA: ${ssaUpdates.length} players updated`)
  }

  // Fetch ALL ssa_scores (includes pre-imported values for players without input grades)
  const { data: allSSA } = await supabase.from('ssa_scores').select('player_id, ssa_auto_final')
  const ssaFinalMap = new Map((allSSA || []).map(r => [r.player_id, r.ssa_auto_final]))

  // -----------------------------------------------------------------------
  // 5. Fetch measurables + build stats maps (used by age curve and derived)
  // -----------------------------------------------------------------------
  const { data: allMeas } = await supabase.from('measurables').select('*')

  // Build maps: player_id → most recent stats, player_id → prior season stats
  // Re-use the stats we already fetched for skill metrics
  const currentStatsMap = new Map()
  const priorStatsMap = new Map()
  for (const [pid, rows] of playerStatsForMetrics) {
    currentStatsMap.set(pid, rows[0])
    if (rows.length > 1) priorStatsMap.set(pid, rows[1])
  }
  const fullMeasMap = new Map((allMeas || []).map(r => [r.player_id, r]))

  // Build filled measurables map (originals + positional defaults for NULLs)
  const filledMeasMap = new Map()
  for (const player of players) {
    const pid = player.player_id
    const rawMeas = fullMeasMap.get(pid)
    const { measurables: filledMeas } = fillDefaultsSync(null, rawMeas, player.primary_bucket, posDefaults)
    filledMeasMap.set(pid, filledMeas)
  }

  // -----------------------------------------------------------------------
  // 6. Compute Big Board composite with age curve + assign bands + tiers
  // -----------------------------------------------------------------------
  progress('Computing Big Board composite (with age curve)...')

  // Gather band data for percentile calculations
  const bandInput = players.map(p => {
    const ath = athleticMap.get(p.player_id)
    return {
      player_id: p.player_id,
      primary_bucket: p.primary_bucket,
      oai: ath?.oai ?? 0,
      aaa: ath?.aaa ?? 0,
    }
  })
  const bands = assignAllBands(bandInput)

  const masterUpdates = []
  for (const player of players) {
    const pid = player.player_id
    const rausFinal = rausFinalMap.get(pid) ?? rausMap.get(pid)?.raus_final
    const ssaRaw = ssaFinalMap.get(pid) ?? null
    const ath = athleticMap.get(pid)
    const oai = ath?.oai ?? 0
    const aaa = ath?.aaa ?? 0
    const playerBands = bands.get(pid) || { oai_band: 'Limited Burst', aaa_band: 'Limited Physical' }
    const prospect = prospectMap.get(pid)
    const curStats = currentStatsMap.get(pid)
    const prevStats = priorStatsMap.get(pid)

    // Age curve: compute age-adjusted SSA and age curve score for composite
    // For historical players, use draft year to compute age-at-draft
    const draftYr = player.draft_class ? parseInt(player.draft_class) : null
    const { adjusted: ssaAdjusted, class_multiplier, improvement_delta } =
      computeAgeAdjustedScore(ssaRaw, prospect?.class, player.birth_year, curStats, prevStats, draftYr)
    const ageCurve = computeAgeCurveScore(prospect?.class, player.birth_year, curStats, prevStats, draftYr)

    // Task 19: Size multiplier from prospect height vs position prototype
    const sizeMultiplier = computeSizeMultiplier(prospect?.height, player.primary_bucket)

    // Task 20: Age multiplier (separate from SSA age modifier)
    const ageMultiplier = computeAgeMultiplier(player.birth_year, draftYr)

    // Use age-adjusted SSA in composite, age curve score replaces simple age factor
    const { composite } = computeComposite(rausFinal, ssaAdjusted ?? ssaRaw, aaa, oai, null, ageCurve.score, sizeMultiplier, ageMultiplier, draftYr)
    const tier = assignTier(rausFinal)

    masterUpdates.push({
      player_id: pid,
      display_name: player.display_name,
      primary_bucket: player.primary_bucket,
      style_archetype: player.style_archetype,
      raus_final: rausFinal,
      tier,
      ssa: ssaRaw,
      ssa_age_adjusted: ssaAdjusted,
      class_multiplier,
      improvement_delta,
      oai,
      oai_band: playerBands.oai_band,
      aaa,
      aaa_band: playerBands.aaa_band,
      composite_score: composite,
    })
  }

  // Sort by composite and assign ranks
  masterUpdates.sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
  masterUpdates.forEach((row, i) => { row.overall_rank = i + 1 })

  if (masterUpdates.length > 0) {
    // Batch upsert in chunks of 50
    for (let i = 0; i < masterUpdates.length; i += 50) {
      const batch = masterUpdates.slice(i, i + 50)
      const { error } = await supabase.from('master_board').upsert(batch, { onConflict: 'player_id' })
      if (error) errors.push(`Master board batch ${i}: ${error.message}`)
    }
    progress(`  Master Board: ${masterUpdates.length} players ranked`)
  }

  // -----------------------------------------------------------------------
  // 7. Compute derived metrics (LCI, SFR, WS-H Factor, FT% label)
  // -----------------------------------------------------------------------
  progress('Computing derived metrics...')

  const derivedUpdates = []
  for (const player of players) {
    const pid = player.player_id
    const stats = filledStatsMap.get(pid) || currentStatsMap.get(pid)
    const meas = filledMeasMap.get(pid) || fullMeasMap.get(pid)
    const dm = computeDerivedMetrics(stats, meas)
    if (!dm) continue
    derivedUpdates.push({ player_id: pid, ...dm })
  }

  if (derivedUpdates.length > 0) {
    for (let i = 0; i < derivedUpdates.length; i += 50) {
      const batch = derivedUpdates.slice(i, i + 50)
      const { error } = await supabase.from('derived_metrics').upsert(batch, { onConflict: 'player_id' })
      if (error) errors.push(`Derived metrics batch ${i}: ${error.message}`)
    }
    progress(`  Derived metrics: ${derivedUpdates.length} players updated`)
  }

  // -----------------------------------------------------------------------
  // Done
  // -----------------------------------------------------------------------
  const success = errors.length === 0
  progress(success ? 'Recalculation complete!' : `Recalculation finished with ${errors.length} error(s)`)

  return { success, errors, playerCount: players.length }
}
