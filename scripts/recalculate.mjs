// ---------------------------------------------------------------------------
// CLI script to run the full scoring engine recalculation.
// Usage: node scripts/recalculate.mjs
//
// This is a Node-compatible version of the engine that doesn't rely on
// import.meta.env (Vite-only). It duplicates the engine logic to run
// outside the browser.
// ---------------------------------------------------------------------------

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ---- RAUS Engine ----

const BUCKET_MODS = { Guard: 1.0, Wing: 1.05, Big: 1.15 }

const RAUS_WEIGHTS = {
  ucs: 0.18, fcs: 0.12, adr: 0.10, sti: 0.10,
  rsm: 0.08, dri: 0.07, scr: 0.15, rpi: 0.10,
  sci: 0.05, star_index: 0.05,
}

const TIERS = [
  { tier: 'Tier 1 — Generational', anchor: 9.7, sigma: 0.4 },
  { tier: 'Tier 2 — Franchise', anchor: 8.8, sigma: 0.55 },
  { tier: 'Tier 3 — All-Star', anchor: 7.9, sigma: 0.65 },
  { tier: 'Tier 4 — High-End Starter', anchor: 7.0, sigma: 0.7 },
  { tier: 'Tier 5 — Rotation', anchor: 6.0, sigma: 0.75 },
  { tier: 'Tier 6 — Development', anchor: 5.0, sigma: 0.85 },
  { tier: 'Tier 7 — Longshot', anchor: 4.0, sigma: 1.0 },
]

const SSA_WEIGHTS = {
  Guard: { role: 1.1, shooting: 1.2, creation: 1.3, playmaking: 1.3, defense: 0.8, offball: 0.8, decision: 1.2, hustle: 0.3 },
  Wing:  { role: 1.2, shooting: 1.1, creation: 1.1, playmaking: 0.7, defense: 1.2, offball: 1.1, decision: 1.0, hustle: 0.6 },
  Big:   { role: 1.1, shooting: 0.8, creation: 0.8, playmaking: 0.6, defense: 1.4, offball: 1.2, decision: 0.9, hustle: 1.2 },
}

const SSA_RANK_LABELS = [
  { min: 9.0,  label: 'Top 3 Pick' },
  { min: 8.25, label: 'Lottery (4-14)' },
  { min: 7.25, label: 'Mid-Late 1st' },
  { min: 6.75, label: '2nd Round' },
  { min: 6.25, label: 'Bench/Specialist' },
  { min: -Infinity, label: 'Fringe/Two-Way' },
]

const SSA_WEIGHTED_RANK_LABELS = [
  { min: 8.75, label: 'Elite Statistical Résumé' },
  { min: 8.0,  label: 'High-End Profile' },
  { min: 7.25, label: 'Starter-Level Indicators' },
  { min: 6.75, label: 'Rotation Statistical Profile' },
  { min: 6.25, label: 'Partial Skill Profile' },
  { min: -Infinity, label: 'Insufficient Résumé' },
]

const BB_WEIGHTS = { raus: 0.45, ssa: 0.25, aaa: 0.15, oai: 0.05, age: 0.10 }

function round(v, d = 2) {
  if (v == null || isNaN(v)) return null
  return Math.round(v * 10 ** d) / 10 ** d
}

function getLabel(score, labels) {
  if (score == null) return null
  for (const l of labels) { if (score >= l.min) return l.label }
  return labels[labels.length - 1].label
}

function assignTier(rausFinal) {
  if (rausFinal == null) return null
  for (const t of TIERS) { if (rausFinal >= t.anchor - t.sigma) return t.tier }
  return TIERS[TIERS.length - 1].tier
}

// ---- Main ----

async function main() {
  console.log('=== Scoring Engine Recalculation ===\n')

  // Fetch all data
  const [
    { data: players }, { data: rausRows }, { data: ssaInputs },
    { data: prospects }, { data: athleticRows }, { data: measurables },
    { data: dnaRows },
  ] = await Promise.all([
    supabase.from('players').select('*'),
    supabase.from('raus_scores').select('*'),
    supabase.from('ssa_input').select('*'),
    supabase.from('prospects').select('player_id, league_conf, class'),
    supabase.from('athletic_scores').select('*'),
    supabase.from('measurables').select('player_id, ws_minus_h'),
    supabase.from('dna_scores').select('player_id, dna_flag, dna_max'),
  ])

  console.log(`Loaded ${players.length} players\n`)

  const rausMap = new Map(rausRows.map(r => [r.player_id, r]))
  const ssaInputMap = new Map(ssaInputs.map(r => [r.player_id, r]))
  const prospectMap = new Map(prospects.map(r => [r.player_id, r]))
  const athleticMap = new Map(athleticRows.map(r => [r.player_id, r]))
  const measMap = new Map(measurables.map(r => [r.player_id, r]))
  const dnaMap = new Map(dnaRows.map(r => [r.player_id, r]))

  // ---- RAUS Recalculation ----
  console.log('Recalculating RAUS...')
  const rausUpdates = []

  for (const player of players) {
    const pid = player.player_id
    const raus = rausMap.get(pid)
    if (!raus) continue

    const bucket = player.primary_bucket
    const mod = BUCKET_MODS[bucket] ?? 1.0
    const scr = raus.scr_auto, rpi = raus.rpi_auto, sci = raus.sci_auto

    const star_index = (scr != null && rpi != null && sci != null)
      ? round((0.35 * scr + 0.25 * rpi + 0.4 * sci) * mod)
      : null

    const metrics = { scr, rpi, sci, star_index, ucs: raus.ucs_auto, fcs: raus.fcs_auto, adr: raus.adr_auto, sti: raus.sti_auto, rsm: raus.rsm_auto, dri: raus.dri_auto }
    const vals = Object.values(metrics).filter(v => v != null)
    const raus_base = vals.length > 0 ? round(vals.reduce((a, b) => a + b, 0) / vals.length) : null

    const w = RAUS_WEIGHTS
    const raus_weighted = round(
      (metrics.ucs ?? 0) * w.ucs + (metrics.fcs ?? 0) * w.fcs + (metrics.adr ?? 0) * w.adr +
      (metrics.sti ?? 0) * w.sti + (metrics.rsm ?? 0) * w.rsm + (metrics.dri ?? 0) * w.dri +
      (metrics.scr ?? 0) * w.scr + (metrics.rpi ?? 0) * w.rpi + (metrics.sci ?? 0) * w.sci +
      (metrics.star_index ?? 0) * w.star_index
    )

    const ptc = raus.ptc_auto ?? 1
    const raus_final_auto = round(raus_weighted * ptc)
    const raus_final = raus.raus_override != null ? raus.raus_override : raus_final_auto

    const ppi = round((
      (raus_weighted ?? 0) * 0.35 + (raus_base ?? 0) * 0.20 + (star_index ?? 0) * 0.15 +
      (sci ?? 0) * 0.10 + (rpi ?? 0) * 0.10 + (scr ?? 0) * 0.05
    ) * ptc)

    rausUpdates.push({ player_id: pid, star_index, raus_base, raus_weighted, raus_final_auto, raus_final, ppi_auto: ppi })
  }

  for (let i = 0; i < rausUpdates.length; i += 50) {
    const { error } = await supabase.from('raus_scores').upsert(rausUpdates.slice(i, i + 50), { onConflict: 'player_id' })
    if (error) console.error('  RAUS error:', error.message)
  }
  console.log(`  ${rausUpdates.length} RAUS scores updated`)

  const rausFinalMap = new Map(rausUpdates.map(r => [r.player_id, r.raus_final]))

  // ---- SSA Recalculation ----
  console.log('Recalculating SSA...')
  const ssaUpdates = []

  for (const player of players) {
    const pid = player.player_id
    const input = ssaInputMap.get(pid)
    if (!input) continue

    const bucket = player.primary_bucket
    const weights = SSA_WEIGHTS[bucket]
    if (!weights) continue

    const meas = measMap.get(pid)
    let wsHMod = 1.0
    if (meas?.ws_minus_h != null) wsHMod = 1 + ((meas.ws_minus_h - 2.5) / 25)

    let ageMod = 1.0
    if (player.birth_year != null) {
      const age = 2026 - player.birth_year
      ageMod = Math.max(0.9, Math.min(1.15, 1 + (20 - age) * 0.025))
    }

    const grades = {
      role: input.role_translation, shooting: input.shooting_profile,
      creation: input.creation_scalability, playmaking: input.playmaking_efficiency,
      defense: input.defensive_impact, offball: input.offball_value,
      decision: input.decision_making, hustle: input.hustle_impact,
    }

    let weightedSum = 0, denom = 0
    for (const [key, w] of Object.entries(weights)) {
      if (grades[key] != null) { weightedSum += grades[key] * w; denom += w }
    }
    if (denom === 0) continue

    const ssaRaw = (weightedSum / denom) * ageMod * wsHMod
    const ssaAutoFinal = round(ssaRaw)
    const ssaWeighted = round(weightedSum / denom)

    ssaUpdates.push({
      player_id: pid, position: bucket,
      role: round(grades.role), shooting: round(grades.shooting),
      creation: round(grades.creation), playmaking: round(grades.playmaking),
      defense: round(grades.defense), offball: round(grades.offball),
      decision: round(grades.decision), hustle: round(grades.hustle),
      age_mod: round(ageMod), ws_h_mod: round(wsHMod),
      ssa_auto_final: ssaAutoFinal,
      ssa_rank_label: getLabel(ssaAutoFinal, SSA_RANK_LABELS),
      ssa_weighted: ssaWeighted,
      ssa_weighted_rank_label: getLabel(ssaWeighted, SSA_WEIGHTED_RANK_LABELS),
    })
  }

  for (let i = 0; i < ssaUpdates.length; i += 50) {
    const { error } = await supabase.from('ssa_scores').upsert(ssaUpdates.slice(i, i + 50), { onConflict: 'player_id' })
    if (error) console.error('  SSA error:', error.message)
  }
  console.log(`  ${ssaUpdates.length} SSA scores recomputed from input grades`)

  // Fetch ALL ssa_scores (includes pre-imported values from Excel for players without input grades)
  const { data: allSSA } = await supabase.from('ssa_scores').select('player_id, ssa_auto_final')
  const ssaFinalMap = new Map(allSSA.map(r => [r.player_id, r.ssa_auto_final]))

  // ---- Big Board Composite ----
  console.log('Computing Big Board composite...')

  // OAI/AAA band assignment by bucket percentile
  const bucketGroups = {}
  for (const p of players) {
    const b = p.primary_bucket || 'Unknown'
    if (!bucketGroups[b]) bucketGroups[b] = []
    const ath = athleticMap.get(p.player_id)
    bucketGroups[b].push({ player_id: p.player_id, oai: ath?.oai ?? 0, aaa: ath?.aaa ?? 0 })
  }

  const bandMap = new Map()
  const OAI_BANDS = [
    { min: 99, label: 'Outlier Burst' }, { min: 90, label: 'Elite Burst' },
    { min: 70, label: 'Plus Burst' }, { min: 50, label: 'Average Burst' },
    { min: 0, label: 'Limited Burst' },
  ]
  const AAA_BANDS = [
    { min: 99, label: 'Outlier Physical' }, { min: 90, label: 'Elite Physical' },
    { min: 70, label: 'Plus Physical' }, { min: 50, label: 'Average Physical' },
    { min: 0, label: 'Limited Physical' },
  ]

  for (const [, group] of Object.entries(bucketGroups)) {
    const oaiVals = group.map(p => p.oai).filter(v => v > 0)
    const aaaVals = group.map(p => p.aaa).filter(v => v > 0)
    for (const p of group) {
      const oaiPct = oaiVals.length > 0 ? (oaiVals.filter(v => v < p.oai).length / oaiVals.length) * 100 : 0
      const aaaPct = aaaVals.length > 0 ? (aaaVals.filter(v => v < p.aaa).length / aaaVals.length) * 100 : 0
      const oaiBand = OAI_BANDS.find(b => oaiPct >= b.min)?.label ?? 'Limited Burst'
      const aaaBand = AAA_BANDS.find(b => aaaPct >= b.min)?.label ?? 'Limited Physical'
      bandMap.set(p.player_id, { oai_band: oaiBand, aaa_band: aaaBand })
    }
  }

  // ---- Fetch stats for age curve + derived metrics ----
  const { data: allStats } = await supabase.from('stats').select('*')
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

  // ---- Age Curve Engine ----
  const CLASS_MULTIPLIERS = { fr: 1.15, so: 1.05, jr: 1.00, sr: 0.92, '5th': 0.85, grad: 0.85 }
  const VELOCITY_STATS = ['ts_pct', 'usg', 'ast_pct', 'stl_pct', 'tov_pct']

  function classMultiplierByAge(age) {
    if (age == null) return 1.00
    if (age <= 18) return 1.15
    if (age <= 19) return 1.10
    if (age <= 20) return 1.05
    if (age <= 21) return 1.00
    if (age <= 22) return 0.92
    return 0.85
  }

  function getClassMultiplier(playerClass, birthYear) {
    if (playerClass && CLASS_MULTIPLIERS[playerClass] != null) return CLASS_MULTIPLIERS[playerClass]
    if (birthYear != null) return classMultiplierByAge(2026 - birthYear)
    return 1.00
  }

  function computeImprovementVelocity(current, prior) {
    if (!current || !prior) return null
    const deltas = []
    for (const key of VELOCITY_STATS) {
      const cur = current[key], prev = prior[key]
      if (cur == null || prev == null || prev === 0) continue
      const rawDelta = (cur - prev) / Math.abs(prev)
      deltas.push(key === 'tov_pct' ? -rawDelta : rawDelta)
    }
    if (deltas.length < 2) return null
    const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length
    return Math.max(-0.10, Math.min(0.10, avg))
  }

  const masterUpdates = []
  let ageAdjCount = 0
  for (const player of players) {
    const pid = player.player_id
    const rausFinal = rausFinalMap.get(pid) ?? rausMap.get(pid)?.raus_final
    const ssaRaw = ssaFinalMap.get(pid) ?? null
    const ath = athleticMap.get(pid)
    const oai = ath?.oai ?? 0
    const aaa = ath?.aaa ?? 0
    const playerBands = bandMap.get(pid) || { oai_band: 'Limited Burst', aaa_band: 'Limited Physical' }
    const dna = dnaMap.get(pid)
    const prospect = prospectMap.get(pid)
    const curStats = currentStatsMap.get(pid)
    const prevStats = priorStatsMap.get(pid)

    // Age curve
    const classMult = getClassMultiplier(prospect?.class, player.birth_year)
    const impDelta = computeImprovementVelocity(curStats, prevStats)
    const ssaAdjusted = ssaRaw != null ? round(ssaRaw * classMult * (1 + (impDelta ?? 0))) : null
    if (ssaAdjusted != null && ssaAdjusted !== ssaRaw) ageAdjCount++

    // Age curve score for composite (maps 0.85–1.15 → 0–10)
    const ageCurveBase = ((classMult - 0.85) / 0.30) * 10
    const ageCurveBonus = (impDelta ?? 0) * 10
    const ageCurveScore = round(Math.max(0, Math.min(10, ageCurveBase + ageCurveBonus)), 4)

    const composite = round(
      (rausFinal ?? 0) * BB_WEIGHTS.raus + (ssaAdjusted ?? ssaRaw ?? 0) * BB_WEIGHTS.ssa +
      (aaa ?? 0) * BB_WEIGHTS.aaa + (oai ?? 0) * BB_WEIGHTS.oai +
      (ageCurveScore ?? 0) * BB_WEIGHTS.age
    , 4)

    masterUpdates.push({
      player_id: pid,
      display_name: player.display_name,
      primary_bucket: player.primary_bucket,
      style_archetype: player.style_archetype,
      raus_final: rausFinal,
      tier: assignTier(rausFinal),
      ssa: ssaRaw,
      ssa_age_adjusted: ssaAdjusted,
      class_multiplier: classMult,
      improvement_delta: impDelta,
      oai, oai_band: playerBands.oai_band, aaa, aaa_band: playerBands.aaa_band,
      dna_flag: dna?.dna_flag ?? false,
      dna_max: dna?.dna_max ?? null,
      composite_score: composite,
    })
  }

  // Sort and rank
  masterUpdates.sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
  masterUpdates.forEach((row, i) => { row.overall_rank = i + 1 })

  for (let i = 0; i < masterUpdates.length; i += 50) {
    const { error } = await supabase.from('master_board').upsert(masterUpdates.slice(i, i + 50), { onConflict: 'player_id' })
    if (error) console.error('  Master Board error:', error.message)
  }
  console.log(`  ${masterUpdates.length} players ranked on Big Board`)
  console.log(`  Age-adjusted SSA: ${ageAdjCount} players modified (class multipliers applied)`)
  console.log(`  Multi-season players with velocity: ${priorStatsMap.size}`)

  // ---- Derived Metrics (LCI, SFR, WS-H, FT% Label) ----
  console.log('Computing derived metrics...')

  const statsMap = currentStatsMap

  const derivedUpdates = []
  for (const player of players) {
    const pid = player.player_id
    const stats = statsMap.get(pid)
    const meas = measMap.get(pid)
    if (!stats) continue

    // LCI = ts_pct × log(usg%) × (1 + ast_pct / 100)
    let lci = null
    if (stats.ts_pct != null && stats.usg != null && stats.usg > 0) {
      const logUsg = Math.log(stats.usg * 100)
      lci = round(stats.ts_pct * logUsg * (1 + (stats.ast_pct ?? 0) / 100))
    }

    // SFR = (stl_per40 + blk_per40) / pf_per40
    let sfr = null, sfr_label = null
    if (stats.stl_per40 != null && stats.blk_per40 != null && stats.pf != null && stats.mpg > 0) {
      const pf_per40 = (stats.pf / stats.mpg) * 40
      if (pf_per40 > 0) {
        sfr = round((stats.stl_per40 + stats.blk_per40) / pf_per40)
        sfr_label = sfr >= 1.0 ? 'Disciplined' : sfr >= 0.7 ? 'Solid' : 'Gambler'
      }
    }

    // WS-H Factor
    let wsh_factor = null
    if (meas?.ws_minus_h != null) {
      wsh_factor = round(1 + ((meas.ws_minus_h - 2.5) / 25))
    }

    // FT% Projection Label
    let ft_pct_label = null
    if (stats.ft_pct != null) {
      const pct = stats.ft_pct <= 1 ? stats.ft_pct * 100 : stats.ft_pct
      ft_pct_label = pct >= 80 ? 'Projectable Stroke' : pct >= 72 ? 'Developing Stroke' : 'Mechanical Concern'
    }

    derivedUpdates.push({ player_id: pid, lci, sfr, sfr_label, wsh_factor, ft_pct_label })
  }

  for (let i = 0; i < derivedUpdates.length; i += 50) {
    const { error } = await supabase.from('derived_metrics').upsert(derivedUpdates.slice(i, i + 50), { onConflict: 'player_id' })
    if (error) console.error('  Derived metrics error:', error.message)
  }

  // Summary stats
  const withLCI = derivedUpdates.filter(d => d.lci != null)
  const withSFR = derivedUpdates.filter(d => d.sfr != null)
  console.log(`  ${derivedUpdates.length} players processed`)
  console.log(`  LCI: ${withLCI.length} computed | SFR: ${withSFR.length} computed`)
  if (withLCI.length > 0) {
    const sorted = withLCI.sort((a, b) => b.lci - a.lci)
    console.log(`  Top LCI: ${sorted.slice(0, 5).map(d => d.player_id.split('_')[0] + '=' + d.lci).join(', ')}`)
  }

  // ---- Historical Comp Engine ----
  console.log('Computing historical comps...')

  const { data: historicalPlayers } = await supabase.from('historical_players').select('*')
  if (historicalPlayers && historicalPlayers.length > 0) {
    // Clear existing comps
    await supabase.from('player_comps').delete().neq('player_id', '__none__')

    const COMP_WEIGHTS = { ssa: 1.5, scr: 1.2, sci: 1.0, ts_pct: 8.0, usg: 6.0, oai: 1.0, age: 0.8 }

    function compDistance(prospect, hist) {
      const pairs = [
        [prospect.ssa, hist.ssa_estimate, COMP_WEIGHTS.ssa],
        [prospect.scr, hist.scr_estimate, COMP_WEIGHTS.scr],
        [prospect.sci, hist.sci_estimate, COMP_WEIGHTS.sci],
        [prospect.ts_pct, hist.college_ts_pct, COMP_WEIGHTS.ts_pct],
        [prospect.usg, hist.college_usg, COMP_WEIGHTS.usg],
        [prospect.oai, hist.oai_estimate, COMP_WEIGHTS.oai],
        [prospect.age, hist.age_at_draft, COMP_WEIGHTS.age],
      ]
      let sum = 0, valid = 0
      for (const [pv, hv, w] of pairs) {
        if (pv != null && hv != null) { sum += w * (pv - hv) ** 2; valid++ }
      }
      return valid >= 3 ? Math.sqrt(sum) : Infinity
    }

    const compInserts = []
    for (const player of players) {
      const pid = player.player_id
      const raus = rausMap.get(pid)
      const ssa = ssaFinalMap.get(pid)
      const stats = currentStatsMap.get(pid)
      const ath = athleticMap.get(pid)
      const age = player.birth_year ? 2026 - player.birth_year : null

      const profile = {
        ssa: ssa ?? null,
        scr: raus?.scr_auto ?? null,
        sci: raus?.sci_auto ?? null,
        ts_pct: stats?.ts_pct ?? null,
        usg: stats?.usg ?? null,
        oai: ath?.oai ?? 0,
        age,
      }

      const scored = historicalPlayers.map(h => ({
        id: h.id,
        tier: h.tier,
        distance: compDistance(profile, h),
      })).filter(s => s.distance !== Infinity)

      const modern = scored.filter(s => s.tier === 'modern').sort((a, b) => a.distance - b.distance).slice(0, 3)
      const legend = scored.filter(s => s.tier === 'legend').sort((a, b) => a.distance - b.distance).slice(0, 1)

      for (const c of [...modern, ...legend]) {
        compInserts.push({
          player_id: pid,
          historical_player_id: c.id,
          comp_tier: c.tier,
          similarity_distance: round(c.distance, 4),
        })
      }
    }

    // Batch insert
    for (let i = 0; i < compInserts.length; i += 50) {
      const { error } = await supabase.from('player_comps').insert(compInserts.slice(i, i + 50))
      if (error) console.error('  Comp insert error:', error.message)
    }

    const modernComps = compInserts.filter(c => c.comp_tier === 'modern').length
    const legendComps = compInserts.filter(c => c.comp_tier === 'legend').length
    console.log(`  ${compInserts.length} comps generated (${modernComps} modern, ${legendComps} legend)`)
  } else {
    console.log('  No historical players found — skipping comp engine')
  }

  // Print top 15
  console.log('\n=== Top 15 Big Board ===')
  console.log('Rank  Name                          Bucket  RAUS   SSA   SSA-Adj  ClsMul  Composite  Tier')
  console.log('-'.repeat(120))
  for (const row of masterUpdates.slice(0, 15)) {
    console.log(
      String(row.overall_rank).padStart(3) + '   ' +
      (row.display_name || '').padEnd(30) +
      (row.primary_bucket || '').padEnd(8) +
      String(row.raus_final?.toFixed(2) ?? '-').padStart(6) +
      String(row.ssa?.toFixed(2) ?? '-').padStart(6) +
      String(row.ssa_age_adjusted?.toFixed(2) ?? '-').padStart(9) +
      String(row.class_multiplier?.toFixed(2) ?? '-').padStart(7) +
      String(row.composite_score?.toFixed(4) ?? '-').padStart(11) + '  ' +
      (row.tier || '')
    )
  }

  console.log('\n=== Recalculation complete ===')
}

main().catch(err => { console.error(err); process.exit(1) })
