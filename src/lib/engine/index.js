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
import { computeComposite, assignAllBands } from './bigboard.js'
import { computeDerivedMetrics } from './derived.js'
import { computeAgeAdjustedScore, computeAgeCurveScore } from './agecurve.js'

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
    supabase.from('prospects').select('player_id, league_conf, class'),
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
  // 2. Recalculate RAUS for each player
  // -----------------------------------------------------------------------
  progress(`Recalculating RAUS for ${players.length} players...`)

  const rausUpdates = []
  for (const player of players) {
    const pid = player.player_id
    const raus = rausMap.get(pid)
    if (!raus) continue

    // Get PTC from prospects league_conf
    const prospect = prospectMap.get(pid)
    const ptc = raus.ptc_auto ?? 1

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
    const { error } = await supabase.from('raus_scores').upsert(rausUpdates, { onConflict: 'player_id' })
    if (error) errors.push(`RAUS upsert: ${error.message}`)
    else progress(`  RAUS: ${rausUpdates.length} players updated`)
  }

  // Refresh raus data after update
  const rausFinalMap = new Map(rausUpdates.map(r => [r.player_id, r.raus_final]))

  // -----------------------------------------------------------------------
  // 3. Recalculate SSA for each player
  // -----------------------------------------------------------------------
  progress(`Recalculating SSA for ${players.length} players...`)

  const ssaUpdates = []
  for (const player of players) {
    const pid = player.player_id
    const input = ssaInputMap.get(pid)
    if (!input) continue

    const bucket = player.primary_bucket
    const meas = measMap.get(pid)

    // WS-H modifier: 1 + ((ws_minus_h - 2.5) / 25)
    let wsHMod = 1.0
    if (meas?.ws_minus_h != null) {
      wsHMod = 1 + ((meas.ws_minus_h - 2.5) / 25)
    }

    // Age modifier: younger gets a bump
    let ageMod = 1.0
    if (player.birth_year != null) {
      const age = 2026 - player.birth_year
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
  // 4. Fetch stats + measurables (used by age curve and derived metrics)
  // -----------------------------------------------------------------------
  const { data: allStats } = await supabase.from('stats').select('*')
  const { data: allMeas } = await supabase.from('measurables').select('*')

  // Build maps: player_id → most recent stats, player_id → prior season stats
  const currentStatsMap = new Map()
  const priorStatsMap = new Map()
  const playerStatsGrouped = new Map()
  for (const s of (allStats || [])) {
    if (!playerStatsGrouped.has(s.player_id)) playerStatsGrouped.set(s.player_id, [])
    playerStatsGrouped.get(s.player_id).push(s)
  }
  for (const [pid, rows] of playerStatsGrouped) {
    rows.sort((a, b) => (b.season || '').localeCompare(a.season || ''))
    currentStatsMap.set(pid, rows[0])
    if (rows.length > 1) priorStatsMap.set(pid, rows[1])
  }
  const fullMeasMap = new Map((allMeas || []).map(r => [r.player_id, r]))

  // -----------------------------------------------------------------------
  // 5. Compute Big Board composite with age curve + assign bands + tiers
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
    const { adjusted: ssaAdjusted, class_multiplier, improvement_delta } =
      computeAgeAdjustedScore(ssaRaw, prospect?.class, player.birth_year, curStats, prevStats)
    const ageCurve = computeAgeCurveScore(prospect?.class, player.birth_year, curStats, prevStats)

    // Use age-adjusted SSA in composite, age curve score replaces simple age factor
    const { composite } = computeComposite(rausFinal, ssaAdjusted ?? ssaRaw, aaa, oai, null, ageCurve.score)
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
  // 6. Compute derived metrics (LCI, SFR, WS-H Factor, FT% label)
  // -----------------------------------------------------------------------
  progress('Computing derived metrics...')

  const derivedUpdates = []
  for (const player of players) {
    const pid = player.player_id
    const stats = statsMap.get(pid)
    const meas = fullMeasMap.get(pid)
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
