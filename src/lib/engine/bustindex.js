// ---------------------------------------------------------------------------
// Bust Index Engine — computes bust risk score (0-10)
//
// Sub-categories:
//   1. Statistical Red Flags (40%) — SFR, usage/efficiency, FT%, AST:TOV, etc.
//   2. Injury History (25%) — severity, recurrence, lower body for guards
//   3. Physical Red Flags (20%) — size multiplier, wingspan, OAI, AAA
//   4. Contextual Red Flags (15%) — age, PTC, improvement, class multiplier
//
// Activation Gate: Only activates for high-caliber prospects (composite >= 6.5,
// RAUS >= 6.6, SSA >= 6.5, Star Index >= 6.0, elite athleticism, or combo check)
// ---------------------------------------------------------------------------

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)) }
function round(v, d = 2) { return v == null ? null : Math.round(v * 10 ** d) / 10 ** d }

// ---------------------------------------------------------------------------
// 1. Statistical Red Flags (40% weight)
// ---------------------------------------------------------------------------
export function computeStatisticalRedFlags(stats, derived) {
  if (!stats) return { score: 0, flags: [] }

  const flags = []
  let sfrScore = 0, usgEffScore = 0, ftScore = 0, astTovScore = 0, astdScore = 0, lciScore = 0, surfaceScore = 0

  // SFR (15%)
  const sfr = derived?.sfr
  if (sfr != null) {
    if (sfr < 0.6) { sfrScore = 10; flags.push(`SFR: ${sfr.toFixed(2)} (Gambler)`) }
    else if (sfr < 0.8) { sfrScore = 6; flags.push(`SFR: ${sfr.toFixed(2)} (Below Avg)`) }
    else if (sfr < 1.0) sfrScore = 3
  }

  // Usage vs Efficiency (20%)
  if (stats?.usg != null && stats?.ts_pct != null) {
    const usg = stats.usg, ts = stats.ts_pct
    if (usg > 0.22 && ts < 0.54) {
      const gap = ((usg - 0.22) / 0.05) * ((0.54 - ts) / 0.05)
      usgEffScore = clamp(gap * 2, 0, 10)
      flags.push(`USG/TS gap: ${(usg * 100).toFixed(1)}% USG, ${(ts * 100).toFixed(1)}% TS`)
    }
  }

  // FT% (15%)
  if (stats?.ft_pct != null) {
    const ft = stats.ft_pct <= 1 ? stats.ft_pct : stats.ft_pct / 100
    if (ft < 0.65) { ftScore = 9; flags.push(`FT%: ${(ft * 100).toFixed(1)}% (Mechanical Concern)`) }
    else if (ft < 0.72) { ftScore = 6; flags.push(`FT%: ${(ft * 100).toFixed(1)}% (Below Avg)`) }
    else if (ft < 0.80) ftScore = 2
  }

  // AST:TOV (15%)
  if (stats?.ast_tov != null) {
    const at = stats.ast_tov, usg = stats.usg ?? 0
    if (at < 0.8 && usg > 0.25) { astTovScore = 9; flags.push(`AST/TOV: ${at.toFixed(2)} at ${(usg * 100).toFixed(1)}% USG`) }
    else if (at < 1.0) { astTovScore = 6; flags.push(`AST/TOV: ${at.toFixed(2)}`) }
    else if (at < 1.5) astTovScore = 2
  }

  // AST'd Total% (15%)
  if (stats?.astd_tot_pct != null) {
    const a = stats.astd_tot_pct
    if (a > 0.75) { astdScore = 9; flags.push(`AST'd Total: ${(a * 100).toFixed(1)}% (Creation Dependent)`) }
    else if (a > 0.70) { astdScore = 6; flags.push(`AST'd Total: ${(a * 100).toFixed(1)}%`) }
    else if (a > 0.60) astdScore = 2
  }

  // LCI (10%)
  const lci = derived?.lci
  if (lci != null) {
    if (lci < 1.60) { lciScore = 8; flags.push(`LCI: ${lci.toFixed(2)} (Low Load Capacity)`) }
    else if (lci < 2.00) { lciScore = 5; flags.push(`LCI: ${lci.toFixed(2)}`) }
    else if (lci < 2.40) lciScore = 2
  }

  // Surface vs Substance (10%)
  if (stats?.ppg != null && stats?.ts_pct != null && stats?.usg != null) {
    let surfFlags = []
    if (stats.ppg > 18 && stats.ts_pct < 0.52) { surfaceScore += 4; surfFlags.push('High PPG + low TS%') }
    if (stats.spg > 1.5 && sfr != null && sfr < 0.7) { surfaceScore += 3; surfFlags.push('High STL + low SFR') }
    if (stats.apg > 4 && stats.tov_pct != null && stats.tov_pct > 20) { surfaceScore += 3; surfFlags.push('High AST + high TOV%') }
    surfaceScore = clamp(surfaceScore, 0, 10)
    if (surfFlags.length > 0) flags.push(`Surface gap: ${surfFlags.join(', ')}`)
  }

  const score = round(
    sfrScore * 0.15 + usgEffScore * 0.20 + ftScore * 0.15 + astTovScore * 0.15 +
    astdScore * 0.15 + lciScore * 0.10 + surfaceScore * 0.10
  )

  return { score: clamp(score, 0, 10), flags }
}

// ---------------------------------------------------------------------------
// 2. Injury History (25% weight)
// ---------------------------------------------------------------------------
export function computeInjuryRedFlags(injuries, bucket) {
  if (!injuries || injuries.length === 0) return { score: 0, flags: ['No injury history'] }

  const flags = []
  let seasonEndScore = 0, recurringScore = 0, totalScore = 0, lowerBodyScore = 0, activeScore = 0

  // Season-ending injury (30%)
  const seasonEnding = injuries.filter(i => i.season_ending || i.severity === 'severe' || i.severity === 'career_threatening')
  if (seasonEnding.length > 0) {
    seasonEndScore = 10
    flags.push(`Season-ending injury: ${seasonEnding.map(i => i.body_part || i.type || 'unknown').join(', ')}`)
  }

  // Recurring same body part (25%)
  const partCounts = {}
  for (const inj of injuries) {
    const part = inj.body_part || inj.type || 'unknown'
    partCounts[part] = (partCounts[part] || 0) + 1
  }
  const recurring = Object.entries(partCounts).filter(([, c]) => c >= 2)
  if (recurring.length > 0) {
    recurringScore = clamp(recurring.length * 5, 0, 10)
    flags.push(`Recurring: ${recurring.map(([p, c]) => `${p} (${c}x)`).join(', ')}`)
  }

  // Total injuries (20%)
  const count = injuries.length
  if (count >= 5) { totalScore = 8; flags.push(`${count} total injuries`) }
  else if (count >= 3) { totalScore = 5; flags.push(`${count} total injuries`) }
  else if (count >= 1) totalScore = 2

  // Lower body for guards (15%)
  const lowerBodyParts = ['knee', 'ankle', 'foot', 'hamstring', 'calf', 'quad', 'leg', 'hip', 'achilles']
  const lowerInjuries = injuries.filter(i => {
    const part = (i.body_part || i.type || '').toLowerCase()
    return lowerBodyParts.some(lb => part.includes(lb))
  })
  if (lowerInjuries.length > 0) {
    const isGuard = bucket === 'Guard'
    lowerBodyScore = isGuard ? 8 : 4
    flags.push(`Lower body: ${lowerInjuries.map(i => i.body_part || i.type).join(', ')}${isGuard ? ' (Guard - higher risk)' : ''}`)
  }

  // Active vs recovered (10%)
  const hasActive = injuries.some(i => i.status === 'active' || i.status === 'current')
  if (hasActive) {
    activeScore = 8
    flags.push('Currently injured')
  }

  const score = round(
    seasonEndScore * 0.30 + recurringScore * 0.25 + totalScore * 0.20 +
    lowerBodyScore * 0.15 + activeScore * 0.10
  )

  return { score: clamp(score, 0, 10), flags }
}

// ---------------------------------------------------------------------------
// 3. Physical Red Flags (20% weight)
// ---------------------------------------------------------------------------
export function computePhysicalRedFlags(sizeMultiplier, wshFactor, oai, aaa) {
  let sizeScore = 0, wshScore = 0, oaiScore = 0, aaaScore = 0
  const flags = []

  // Size multiplier below 0.95 (30%)
  if (sizeMultiplier != null && sizeMultiplier < 0.95) {
    sizeScore = clamp((0.95 - sizeMultiplier) / 0.03 * 10, 0, 10)
    flags.push(`Size multiplier: ${sizeMultiplier.toFixed(3)} (Undersized)`)
  }

  // WS-H Factor below 0.95 (25%)
  if (wshFactor != null && wshFactor < 0.95) {
    wshScore = clamp((0.95 - wshFactor) / 0.05 * 10, 0, 10)
    flags.push(`WS-H Factor: ${wshFactor.toFixed(3)} (Short arms)`)
  }

  // OAI below 50th percentile (25%)
  if (oai != null && oai < 50) {
    oaiScore = clamp((50 - oai) / 50 * 10, 0, 10)
    flags.push(`OAI: ${oai.toFixed(0)}th percentile (Below Avg Burst)`)
  }

  // AAA below 50th percentile (20%)
  if (aaa != null && aaa < 50) {
    aaaScore = clamp((50 - aaa) / 50 * 10, 0, 10)
    flags.push(`AAA: ${aaa.toFixed(0)}th percentile (Below Avg Physical)`)
  }

  const score = round(
    sizeScore * 0.30 + wshScore * 0.25 + oaiScore * 0.25 + aaaScore * 0.20
  )

  return { score: clamp(score, 0, 10), flags }
}

// ---------------------------------------------------------------------------
// 4. Contextual Red Flags (15% weight)
// ---------------------------------------------------------------------------
export function computeContextualRedFlags(player, prospect, stats, master, measurables) {
  let ageScore = 0, ptcScore = 0, improvementScore = 0, classScore = 0, dataScore = 0
  const flags = []

  // Age relative to class (25%)
  if (player?.birth_year != null) {
    const age = 2026 - player.birth_year
    if (age >= 22) { ageScore = 9; flags.push(`Age ${age} — very old for prospect`) }
    else if (age === 21) { ageScore = 6; flags.push(`Age ${age} — old for class`) }
    else if (age === 20) ageScore = 2
  }

  // PTC (25%)
  const ptc = master?.ptc ?? prospect?.ptc
  if (ptc != null) {
    if (ptc <= 0.95) { ptcScore = 8; flags.push(`PTC: ${ptc.toFixed(2)} (Low production ceiling)`) }
    else if (ptc < 1.0) { ptcScore = 5; flags.push(`PTC: ${ptc.toFixed(2)} (Below Avg ceiling)`) }
    else if (ptc >= 1.10) ptcScore = 0
    else ptcScore = 2
  }

  // Improvement velocity (20%)
  const delta = master?.improvement_delta
  if (delta != null) {
    if (delta < -0.5) { improvementScore = 9; flags.push(`Improvement delta: ${delta.toFixed(2)} (Regressing)`) }
    else if (delta < 0) { improvementScore = 5; flags.push(`Improvement delta: ${delta.toFixed(2)} (Declining)`) }
    else if (delta < 0.3) improvementScore = 2
  }

  // Class multiplier (15%)
  const classMult = master?.class_multiplier
  if (classMult != null) {
    if (classMult < 0.95) { classScore = 7; flags.push(`Class multiplier: ${classMult.toFixed(2)} (Less runway)`) }
    else if (classMult < 1.0) { classScore = 4; flags.push(`Class multiplier: ${classMult.toFixed(2)}`) }
  }

  // Data completeness (15%)
  let missing = 0
  if (!stats || Object.keys(stats).length === 0) missing++
  if (!measurables || Object.keys(measurables).length === 0) missing++
  if (!master?.oai && !master?.aaa) missing++
  if (!master?.raus_final) missing++
  if (missing > 0) {
    dataScore = clamp(missing * 3, 0, 10)
    flags.push(`Missing ${missing} key data area${missing > 1 ? 's' : ''}`)
  }

  const score = round(
    ageScore * 0.25 + ptcScore * 0.25 + improvementScore * 0.20 +
    classScore * 0.15 + dataScore * 0.15
  )

  return { score: clamp(score, 0, 10), flags }
}

// ---------------------------------------------------------------------------
// Main: Compute full Bust Index
// ---------------------------------------------------------------------------
export function computeBustIndex({ stats, injuries, derived, sizeMultiplier, wshFactor, oai, aaa,
  player, prospect, master, measurables, raus, ssa }) {

  // Activation gate
  const composite = master?.composite_score
  const rausFinal = raus?.raus_final ?? master?.raus_final
  const ssaFinal = ssa?.ssa_auto_final ?? master?.ssa
  const starIndex = raus?.star_index

  const checks = [
    composite >= 6.5,
    rausFinal >= 6.6,
    ssaFinal >= 6.5,
    starIndex >= 6.0,
    oai >= 90,
    aaa >= 90,
    sizeMultiplier >= 1.05,
  ]

  // Combination check
  let combo = 0
  if (rausFinal >= 6.0) combo++
  if (ssaFinal >= 6.0) combo++
  if (oai >= 70) combo++
  if (aaa >= 70) combo++

  const activated = checks.some(Boolean) || combo >= 2

  if (!activated) {
    return {
      activated: false,
      bust_index: null,
      tier: null,
      statistical: { score: 0, flags: [] },
      injury: { score: 0, flags: [] },
      physical: { score: 0, flags: [] },
      contextual: { score: 0, flags: [] },
    }
  }

  // Calculate all sub-scores
  const statistical = computeStatisticalRedFlags(stats, derived)
  const injury = computeInjuryRedFlags(injuries, player?.primary_bucket)
  const physical = computePhysicalRedFlags(sizeMultiplier, wshFactor, oai, aaa)
  const contextual = computeContextualRedFlags(player, prospect, stats, master, measurables)

  const bustIndex = round(
    statistical.score * 0.40 +
    injury.score * 0.25 +
    physical.score * 0.20 +
    contextual.score * 0.15
  )

  // Tier labels with probability text
  let tier
  if (bustIndex >= 8.0) tier = { label: 'Extreme Risk', color: '#1a1a1a', textColor: '#ffffff', prob: '~70-85% of similar profiles underperformed draft position' }
  else if (bustIndex >= 6.5) tier = { label: 'High Risk', color: '#DC2626', prob: '~50-65% of similar profiles underperformed draft position' }
  else if (bustIndex >= 5.0) tier = { label: 'Moderate Risk', color: '#F97316', prob: '~35-45% of similar profiles underperformed draft position' }
  else if (bustIndex >= 3.5) tier = { label: 'Low Risk', color: '#FBBF24', prob: '~20-30% of similar profiles underperformed draft position' }
  else if (bustIndex >= 2.0) tier = { label: 'Minimal Risk', color: '#86EFAC', prob: '~10-15% of similar profiles underperformed draft position' }
  else tier = { label: 'Clean Profile', color: '#2DD4BF', prob: 'Under 10% historically bust' }

  return { activated: true, bust_index: bustIndex, tier, statistical, injury, physical, contextual }
}
