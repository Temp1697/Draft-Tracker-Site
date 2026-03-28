// ---------------------------------------------------------------------------
// Derived Metrics Engine — LCI, SFR, WS-H Factor, FT% Projection
// ---------------------------------------------------------------------------

/**
 * Load Capacity Index — usage-efficiency tension metric.
 * High LCI = player handles offensive burden efficiently.
 *
 * lci = ts_pct × log(usg) × (1 + ast_pct / 100)
 */
export function computeLCI(ts_pct, usg, ast_pct) {
  if (ts_pct == null || usg == null || usg <= 0) return null
  const logUsg = Math.log(usg * 100) // usg stored as decimal (0.335), convert to percentage for log
  return round(ts_pct * logUsg * (1 + (ast_pct ?? 0) / 100))
}

/**
 * Stocks-to-Foul Ratio — defensive discipline metric.
 * sfr = (stl_per40 + blk_per40) / pf_per40
 *
 * > 1.0 = Disciplined
 * 0.7–1.0 = Solid
 * < 0.7 = Gambler
 */
export function computeSFR(stl_per40, blk_per40, pf, mpg) {
  if (stl_per40 == null || blk_per40 == null) return null
  // Calculate pf_per40 from per-game foul and minutes
  let pf_per40 = null
  if (pf != null && mpg != null && mpg > 0) {
    pf_per40 = (pf / mpg) * 40
  }
  if (pf_per40 == null || pf_per40 <= 0) return null

  const sfr = (stl_per40 + blk_per40) / pf_per40
  return round(sfr)
}

export function sfrLabel(sfr) {
  if (sfr == null) return null
  if (sfr >= 1.0) return 'Disciplined'
  if (sfr >= 0.7) return 'Solid'
  return 'Gambler'
}

/**
 * Wingspan-Height Differential Factor.
 * wsh_factor = 1 + ((ws_minus_h - 2.5) / 25)
 * Baseline is +2.5 inches (NBA average).
 */
export function computeWSHFactor(ws_minus_h) {
  if (ws_minus_h == null) return null
  return round(1 + ((ws_minus_h - 2.5) / 25))
}

/**
 * FT% Projection Label.
 * ≥ 80% = "Projectable Stroke"
 * 72-79% = "Developing Stroke"
 * < 72% = "Mechanical Concern"
 */
export function ftPctLabel(ft_pct) {
  if (ft_pct == null) return null
  // ft_pct may be stored as decimal (0.82) or percentage (82)
  const pct = ft_pct <= 1 ? ft_pct * 100 : ft_pct
  if (pct >= 80) return 'Projectable Stroke'
  if (pct >= 72) return 'Developing Stroke'
  return 'Mechanical Concern'
}

/**
 * Compute all derived metrics for a player.
 * @param {object} stats - current season stats row
 * @param {object} measurables - measurables row (for ws_minus_h)
 * @returns {object} derived_metrics fields
 */
export function computeDerivedMetrics(stats, measurables) {
  if (!stats) return null

  const lci = computeLCI(stats.ts_pct, stats.usg, stats.ast_pct)
  const sfr = computeSFR(stats.stl_per40, stats.blk_per40, stats.pf, stats.mpg)
  const wsh_factor = measurables?.ws_minus_h != null ? computeWSHFactor(measurables.ws_minus_h) : null
  const ft_pct_label = ftPctLabel(stats.ft_pct)

  return {
    lci,
    sfr,
    sfr_label: sfrLabel(sfr),
    wsh_factor,
    ft_pct_label,
  }
}

function round(v, d = 2) {
  if (v == null || isNaN(v)) return null
  return Math.round(v * 10 ** d) / 10 ** d
}
