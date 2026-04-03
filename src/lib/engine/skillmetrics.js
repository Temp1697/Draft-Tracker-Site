// ---------------------------------------------------------------------------
// Skill Metrics Engine — computes RAUS skill sub-metrics from raw stats
//
// Each metric is computed by:
//   1. Computing the player's percentile rank for each stat within the full
//      prospect pool (~130 players)
//   2. Mapping percentiles to a 1-10 scale (50th pctl → 5.0)
//   3. Taking a weighted average of the mapped inputs
//   4. Applying a position multiplier for the player's bucket
//   5. Clamping the result to [1.0, 10.0]
//
// Exported:
//   computeSkillMetrics(stats, bucket, allStats) -> { scr, rpi, sci, ucs, fcs, adr, sti, rsm, dri }
//   computePTC(leagueConf) -> multiplier (number)
// ---------------------------------------------------------------------------

// ---- Stats stored as decimals that represent percentages -------------------
// These are multiplied by 100 before normalization so 0.43 AST% → 43%.
// This lookup is also exported for use by SSA auto engine and Nerd Stuff.

export const DECIMAL_PCT_STATS = new Set([
  'ast_pct', 'stl_pct', 'blk_pct', 'orb_pct', 'drb_pct', 'tov_pct',
  'usg', 'ts_pct', 'efg_pct', 'fg_pct', 'three_pt_pct', 'ft_pct',
  'three_pta_rate', 'ft_rate', 'three_pt_share_pct',
  'at_rim_share_pct', 'inside_arc_share_pct',
  'astd_at_rim_pct', 'astd_inside_arc_pct', 'astd_three_pct', 'astd_tot_pct',
  'dunk_pct', 'two_pt_close_pct',
])

/** Convert a decimal-stored percentage to whole-number form for normalization. */
export function pctConvert(value, key) {
  if (value == null || isNaN(value)) return null
  return DECIMAL_PCT_STATS.has(key) ? value * 100 : value
}

// ---- Normalization baselines (for ScoutingCard.jsx Nerd Stuff panel) -------
// All values in whole-number percentage form (matching pctConvert output).

export const BASELINES = {
  pts_per40:           { mean: 18.0,  std: 5.0  },
  ast_per40:           { mean: 3.5,   std: 2.0  },
  reb_per40:           { mean: 8.0,   std: 3.5  },
  stl_per40:           { mean: 1.5,   std: 0.6  },
  blk_per40:           { mean: 1.0,   std: 0.8  },
  tov_per40:           { mean: 3.0,   std: 1.0  },
  usg:                 { mean: 22.0,  std: 5.0  },
  ast_pct:             { mean: 15.0,  std: 7.0  },
  tov_pct:             { mean: 15.0,  std: 4.0  },
  ast_tov:             { mean: 1.2,   std: 0.5  },
  ts_pct:              { mean: 54.0,  std: 5.0  },
  efg_pct:             { mean: 50.0,  std: 5.0  },
  ft_pct:              { mean: 72.0,  std: 8.0  },
  ft_rate:             { mean: 35.0,  std: 10.0 },
  three_pt_pct:        { mean: 33.0,  std: 6.0  },
  three_pta_rate:      { mean: 35.0,  std: 10.0 },
  three_pt_share_pct:  { mean: 30.0,  std: 10.0 },
  three_pta_per40:     { mean: 5.0,   std: 2.5  },
  dunk_pct:            { mean: 60.0,  std: 15.0 },
  dunks_per_game:      { mean: 1.0,   std: 0.8  },
  two_pt_close_pct:    { mean: 55.0,  std: 10.0 },
  at_rim_share_pct:    { mean: 30.0,  std: 12.0 },
  astd_at_rim_pct:     { mean: 35.0,  std: 15.0 },
  astd_inside_arc_pct: { mean: 30.0,  std: 15.0 },
  astd_three_pct:      { mean: 60.0,  std: 15.0 },
  astd_tot_pct:        { mean: 45.0,  std: 15.0 },
  obpm:                { mean: 2.0,   std: 3.0  },
  dbpm:                { mean: 1.5,   std: 2.5  },
  dporpagatu:          { mean: 5.0,   std: 3.0  },
  orb_pct:             { mean: 5.0,   std: 3.0  },
  drb_pct:             { mean: 15.0,  std: 5.0  },
  orb_total:           { mean: 30,    std: 20   },
  drb_total:           { mean: 100,   std: 50   },
  stl_pct:             { mean: 2.0,   std: 0.8  },
  blk_pct:             { mean: 3.0,   std: 2.5  },
  drtg:                { mean: 100,   std: 5    },
  per:                 { mean: 17.0,  std: 5.0  },
  bpm:                 { mean: 2.0,   std: 3.0  },
  pf_per40:            { mean: 4.5,   std: 1.2  },
}

// ---- Helpers -------------------------------------------------------------

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Compute the percentile rank of a value within an array of all values.
 * Uses the "mean rank" method: percentile = (below + 0.5 * equal) / total * 100
 *
 * @param {number} value
 * @param {number[]} allValues - all non-null values for this stat across the pool
 * @returns {number|null} percentile 0-100, or null if no data
 */
function computePercentileRank(value, allValues) {
  const sorted = allValues.filter(v => v != null && !isNaN(v)).sort((a, b) => a - b)
  if (sorted.length === 0) return null
  const below = sorted.filter(v => v < value).length
  const equal = sorted.filter(v => v === value).length
  return ((below + equal * 0.5) / sorted.length) * 100
}

/**
 * Map a percentile (0-100) to a 1.0-10.0 score.
 * 0th → 1.0, 50th → 5.0, 100th → 10.0
 * Piecewise linear: steeper above 50th to reward elite performers.
 *
 * @param {number} percentile - 0 to 100
 * @returns {number} score 1.0 to 10.0
 */
function percentileToScore(percentile) {
  if (percentile <= 50) {
    return 1.0 + (percentile / 50) * 4.0   // 0→1.0, 50→5.0
  } else {
    return 5.0 + ((percentile - 50) / 50) * 5.0  // 50→5.0, 100→10.0
  }
}

/**
 * Normalize a stat value to the 1-10 scale.
 *
 * Uses a hybrid approach:
 *   - If the stat has a BASELINES entry, use z-score normalization against
 *     known college basketball means/stds. This ensures that elite values
 *     score elite regardless of the prospect pool composition.
 *   - Falls back to percentile-based normalization against the pool if no
 *     baseline exists.
 *
 * Z-score formula: score = 5 + (z * 2.5), clamped [1.0, 10.0]
 *   mean → 5.0, +1 std → 7.5, +2 std → 10.0, -1 std → 2.5, -2 std → 0 (clamped to 1.0)
 *
 * @param {number|null} value - stat value (already pctConverted if needed)
 * @param {number[]} poolValues - all values for this stat across the prospect pool
 * @param {boolean} inverse - if true, lower raw values score higher
 * @param {string} [statKey] - stat key for BASELINES lookup
 * @returns {number|null} normalized value in [1.0, 10.0], or null if input is null/undefined
 */
function normalize(value, poolValues, inverse = false, statKey = null) {
  if (value == null || isNaN(value)) return null

  // Try z-score normalization against BASELINES
  const b = statKey ? BASELINES[statKey] : null
  if (b && b.std > 0) {
    const z = (value - b.mean) / b.std
    const effectiveZ = inverse ? -z : z
    return clamp(5.0 + effectiveZ * 2.5, 1.0, 10.0)
  }

  // Fallback: percentile-based normalization against the pool
  if (!poolValues || poolValues.length === 0) return null
  const pctile = computePercentileRank(value, poolValues)
  if (pctile == null) return null
  const effectivePctile = inverse ? (100 - pctile) : pctile
  return clamp(percentileToScore(effectivePctile), 1.0, 10.0)
}

/**
 * Range-based DRTG normalization for college basketball.
 * Uses piecewise linear interpolation within known DRTG ranges:
 *   90-95  → 9.0-10.0 (elite defense)
 *   95-100 → 7.0-9.0  (good)
 *   100-105 → 5.0-7.0 (average)
 *   105-110 → 3.0-5.0 (below average)
 *   110-115 → 1.0-3.0 (poor)
 *   115+    → 1.0
 *   <90     → 10.0
 */
function normalizeDRTG(drtg) {
  if (drtg == null || isNaN(drtg)) return null
  if (drtg <= 90)  return 10.0
  if (drtg >= 115) return 1.0
  // Piecewise linear: higher DRTG = worse defense = lower score
  const ranges = [
    { lo: 90,  hi: 95,  scoreLo: 10.0, scoreHi: 9.0 },
    { lo: 95,  hi: 100, scoreLo: 9.0,  scoreHi: 7.0 },
    { lo: 100, hi: 105, scoreLo: 7.0,  scoreHi: 5.0 },
    { lo: 105, hi: 110, scoreLo: 5.0,  scoreHi: 3.0 },
    { lo: 110, hi: 115, scoreLo: 3.0,  scoreHi: 1.0 },
  ]
  for (const r of ranges) {
    if (drtg >= r.lo && drtg < r.hi) {
      const t = (drtg - r.lo) / (r.hi - r.lo)
      return clamp(r.scoreLo + t * (r.scoreHi - r.scoreLo), 1.0, 10.0)
    }
  }
  return 1.0
}

/**
 * Compute a weighted average from an array of { value, weight } entries.
 * Skips null values and re-distributes their weight proportionally.
 *
 * @param {{ value: number|null, weight: number }[]} components
 * @returns {number|null} weighted average, or null if all inputs are null
 */
function weightedAverage(components) {
  let totalWeight = 0
  let totalValue = 0

  for (const { value, weight } of components) {
    if (value == null) continue
    totalWeight += weight
    totalValue += value * weight
  }

  if (totalWeight === 0) return null
  return totalValue / totalWeight
}

function round(v, decimals = 2) {
  if (v == null || isNaN(v)) return null
  return Math.round(v * 10 ** decimals) / 10 ** decimals
}

// ---- Position multipliers for all 9 metrics ------------------------------

const POSITION_MULTIPLIERS = {
  scr: { Guard: 1.05, Wing: 1.00, Big: 0.90 },
  rpi: { Guard: 0.90, Wing: 1.00, Big: 1.10 },
  sci: { Guard: 1.10, Wing: 1.00, Big: 0.85 },
  ucs: { Guard: 1.05, Wing: 1.00, Big: 0.85 },
  fcs: { Guard: 0.85, Wing: 1.00, Big: 1.10 },
  adr: { Guard: 1.10, Wing: 1.00, Big: 0.90 },
  sti: { Guard: 1.00, Wing: 1.00, Big: 1.05 },
  rsm: { Guard: 1.40, Wing: 1.10, Big: 0.85 },
  dri: { Guard: 0.95, Wing: 1.00, Big: 1.10 },
}

/**
 * Apply position multiplier and clamp to [1.0, 10.0].
 */
function applyPositionMultiplier(raw, metricKey, bucket) {
  if (raw == null) return null
  const multiplier = POSITION_MULTIPLIERS[metricKey]?.[bucket] ?? 1.0
  return clamp(raw * multiplier, 1.0, 10.0)
}

// ---- Pre-compute percentile arrays from the pool -------------------------

/**
 * Extract all non-null values for a given stat key from the allStats array.
 */
function extractPoolValues(allStats, key) {
  const values = []
  for (const row of allStats) {
    const v = pctConvert(row[key], key)
    if (v != null && !isNaN(v)) {
      values.push(v)
    }
  }
  return values
}

/**
 * Build a map of stat key → sorted pool values for all stats used in metric formulas.
 */
function buildPoolMap(allStats) {
  const statKeys = [
    'usg', 'pts_per40', 'at_rim_share_pct', 'astd_at_rim_pct',
    'astd_inside_arc_pct', 'astd_three_pct', 'astd_tot_pct',
    'ft_rate', 'dunk_pct', 'dunks_per_game', 'two_pt_close_pct',
    'ast_pct', 'ast_tov', 'efg_pct',
    'three_pt_pct', 'three_pta_rate', 'ft_pct', 'three_pt_share_pct', 'three_pta_per40',
    'tov_pct', 'obpm',
    'stl_per40', 'blk_per40', 'stl_pct', 'blk_pct', 'dbpm', 'dporpagatu',
    'reb_per40', 'orb_pct', 'drb_pct', 'orb_total', 'drb_total',
    'drtg',
  ]

  const pool = {}
  for (const key of statKeys) {
    pool[key] = extractPoolValues(allStats, key)
  }

  // Also pre-compute pf_per40 pool for DRI
  const pfPer40Values = []
  for (const row of allStats) {
    if (row.pf != null && row.mpg != null && row.mpg > 0) {
      pfPer40Values.push((row.pf / row.mpg) * 40)
    }
  }
  pool._pf_per40 = pfPer40Values

  return pool
}

// ---- Metric formulas -----------------------------------------------------

/**
 * SCR (Self-Creation)
 * Measures a player's ability to create his own shot.
 * AST'd percentages are inverted: lower assisted % = more self-creation.
 */
function computeSCR(s, pool) {
  return weightedAverage([
    { value: normalize(pctConvert(s.usg, 'usg'),                               pool.usg,                 false, 'usg'),                weight: 0.20 },
    { value: normalize(pctConvert(s.pts_per40, 'pts_per40'),                   pool.pts_per40,           false, 'pts_per40'),            weight: 0.20 },
    { value: normalize(pctConvert(s.at_rim_share_pct, 'at_rim_share_pct'),     pool.at_rim_share_pct,    false, 'at_rim_share_pct'),     weight: 0.15 },
    { value: normalize(pctConvert(s.astd_at_rim_pct, 'astd_at_rim_pct'),       pool.astd_at_rim_pct,     true,  'astd_at_rim_pct'),      weight: 0.12 },
    { value: normalize(pctConvert(s.astd_inside_arc_pct, 'astd_inside_arc_pct'), pool.astd_inside_arc_pct, true, 'astd_inside_arc_pct'), weight: 0.12 },
    { value: normalize(pctConvert(s.astd_three_pct, 'astd_three_pct'),         pool.astd_three_pct,      true,  'astd_three_pct'),       weight: 0.10 },
    { value: normalize(pctConvert(s.astd_tot_pct, 'astd_tot_pct'),             pool.astd_tot_pct,        true,  'astd_tot_pct'),         weight: 0.11 },
  ])
}

/**
 * RPI (Rim Pressure)
 * Measures a player's ability to attack and finish at the rim.
 */
function computeRPI(s, pool) {
  return weightedAverage([
    { value: normalize(pctConvert(s.ft_rate, 'ft_rate'),                   pool.ft_rate,          false, 'ft_rate'),          weight: 0.20 },
    { value: normalize(pctConvert(s.at_rim_share_pct, 'at_rim_share_pct'), pool.at_rim_share_pct, false, 'at_rim_share_pct'), weight: 0.25 },
    { value: normalize(pctConvert(s.dunk_pct, 'dunk_pct'),                 pool.dunk_pct,         false, 'dunk_pct'),         weight: 0.15 },
    { value: normalize(pctConvert(s.dunks_per_game, 'dunks_per_game'),     pool.dunks_per_game,   false, 'dunks_per_game'),   weight: 0.20 },
    { value: normalize(pctConvert(s.two_pt_close_pct, 'two_pt_close_pct'), pool.two_pt_close_pct, false, 'two_pt_close_pct'), weight: 0.20 },
  ])
}

/**
 * SCI (Shot Creation Index)
 * Measures overall offensive creation ability (scoring + playmaking).
 */
function computeSCI(s, pool) {
  return weightedAverage([
    { value: normalize(pctConvert(s.usg, 'usg'),             pool.usg,       false, 'usg'),       weight: 0.20 },
    { value: normalize(pctConvert(s.ast_pct, 'ast_pct'),     pool.ast_pct,   false, 'ast_pct'),   weight: 0.25 },
    { value: normalize(pctConvert(s.ast_tov, 'ast_tov'),     pool.ast_tov,   false, 'ast_tov'),   weight: 0.20 },
    { value: normalize(pctConvert(s.pts_per40, 'pts_per40'), pool.pts_per40, false, 'pts_per40'), weight: 0.20 },
    { value: normalize(pctConvert(s.efg_pct, 'efg_pct'),     pool.efg_pct,   false, 'efg_pct'),   weight: 0.15 },
  ])
}

/**
 * UCS (Perimeter Scoring)
 * Measures outside shooting and perimeter scoring efficiency.
 */
function computeUCS(s, pool) {
  return weightedAverage([
    { value: normalize(pctConvert(s.three_pt_pct, 'three_pt_pct'),             pool.three_pt_pct,       false, 'three_pt_pct'),       weight: 0.25 },
    { value: normalize(pctConvert(s.three_pta_rate, 'three_pta_rate'),         pool.three_pta_rate,     false, 'three_pta_rate'),     weight: 0.15 },
    { value: normalize(pctConvert(s.efg_pct, 'efg_pct'),                       pool.efg_pct,            false, 'efg_pct'),            weight: 0.15 },
    { value: normalize(pctConvert(s.ft_pct, 'ft_pct'),                         pool.ft_pct,             false, 'ft_pct'),             weight: 0.15 },
    { value: normalize(pctConvert(s.three_pt_share_pct, 'three_pt_share_pct'), pool.three_pt_share_pct, false, 'three_pt_share_pct'), weight: 0.15 },
    { value: normalize(pctConvert(s.three_pta_per40, 'three_pta_per40'),       pool.three_pta_per40,    false, 'three_pta_per40'),    weight: 0.15 },
  ])
}

/**
 * FCS (Finishing)
 * Measures interior finishing ability.
 */
function computeFCS(s, pool) {
  return weightedAverage([
    { value: normalize(pctConvert(s.two_pt_close_pct, 'two_pt_close_pct'), pool.two_pt_close_pct, false, 'two_pt_close_pct'), weight: 0.25 },
    { value: normalize(pctConvert(s.dunk_pct, 'dunk_pct'),                 pool.dunk_pct,         false, 'dunk_pct'),         weight: 0.20 },
    { value: normalize(pctConvert(s.ft_rate, 'ft_rate'),                   pool.ft_rate,          false, 'ft_rate'),          weight: 0.20 },
    { value: normalize(pctConvert(s.dunks_per_game, 'dunks_per_game'),     pool.dunks_per_game,   false, 'dunks_per_game'),   weight: 0.15 },
    { value: normalize(pctConvert(s.at_rim_share_pct, 'at_rim_share_pct'), pool.at_rim_share_pct, false, 'at_rim_share_pct'), weight: 0.20 },
  ])
}

/**
 * ADR (Decision-Making)
 * Measures playmaking quality and ball security.
 * tov_pct is inverted: lower turnover rate = better decision-making.
 */
function computeADR(s, pool) {
  return weightedAverage([
    { value: normalize(pctConvert(s.ast_tov, 'ast_tov'), pool.ast_tov, false, 'ast_tov'), weight: 0.25 },
    { value: normalize(pctConvert(s.tov_pct, 'tov_pct'), pool.tov_pct, true,  'tov_pct'), weight: 0.20 },
    { value: normalize(pctConvert(s.ast_pct, 'ast_pct'), pool.ast_pct, false, 'ast_pct'), weight: 0.20 },
    { value: normalize(pctConvert(s.usg, 'usg'),         pool.usg,     false, 'usg'),     weight: 0.15 },
    { value: normalize(pctConvert(s.obpm, 'obpm'),       pool.obpm,    false, 'obpm'),    weight: 0.20 },
  ])
}

/**
 * STI (Defensive Events)
 * Measures steal/block production and defensive impact.
 */
function computeSTI(s, pool) {
  return weightedAverage([
    { value: normalize(pctConvert(s.stl_per40, 'stl_per40'),     pool.stl_per40,   false, 'stl_per40'),   weight: 0.18 },
    { value: normalize(pctConvert(s.blk_per40, 'blk_per40'),     pool.blk_per40,   false, 'blk_per40'),   weight: 0.18 },
    { value: normalize(pctConvert(s.stl_pct, 'stl_pct'),         pool.stl_pct,     false, 'stl_pct'),     weight: 0.15 },
    { value: normalize(pctConvert(s.blk_pct, 'blk_pct'),         pool.blk_pct,     false, 'blk_pct'),     weight: 0.15 },
    { value: normalize(pctConvert(s.dbpm, 'dbpm'),               pool.dbpm,        false, 'dbpm'),        weight: 0.17 },
    { value: normalize(pctConvert(s.dporpagatu, 'dporpagatu'),   pool.dporpagatu,  false, 'dporpagatu'),  weight: 0.17 },
  ])
}

/**
 * RSM (Size/Rebounding)
 * Measures rebounding production.
 */
function computeRSM(s, pool) {
  return weightedAverage([
    { value: normalize(pctConvert(s.reb_per40, 'reb_per40'), pool.reb_per40, false, 'reb_per40'), weight: 0.25 },
    { value: normalize(pctConvert(s.orb_pct, 'orb_pct'),     pool.orb_pct,   false, 'orb_pct'),   weight: 0.20 },
    { value: normalize(pctConvert(s.drb_pct, 'drb_pct'),     pool.drb_pct,   false, 'drb_pct'),   weight: 0.20 },
    { value: normalize(pctConvert(s.orb_total, 'orb_total'), pool.orb_total, false, 'orb_total'), weight: 0.15 },
    { value: normalize(pctConvert(s.drb_total, 'drb_total'), pool.drb_total, false, 'drb_total'), weight: 0.20 },
  ])
}

/**
 * DRI (Defensive Versatility)
 * Measures overall defensive impact and versatility.
 * drtg and fouls-per-40 are inverted: lower = better.
 */
function computeDRI(s, pool) {
  // Convert personal fouls to per-40 if we have mpg
  let pfPer40 = null
  if (s.pf != null && s.mpg != null && s.mpg > 0) {
    pfPer40 = (s.pf / s.mpg) * 40
  }

  // Normalize pf_per40 using the pre-computed pool (inverted: lower fouls = better)
  const pfNorm = pfPer40 != null
    ? normalize(pfPer40, pool._pf_per40, true, 'pf_per40')
    : null

  return weightedAverage([
    { value: normalize(pctConvert(s.dbpm, 'dbpm'),             pool.dbpm,       false, 'dbpm'),       weight: 0.20 },
    { value: normalize(pctConvert(s.dporpagatu, 'dporpagatu'), pool.dporpagatu, false, 'dporpagatu'), weight: 0.18 },
    { value: normalize(pctConvert(s.stl_per40, 'stl_per40'),   pool.stl_per40,  false, 'stl_per40'),  weight: 0.15 },
    { value: normalize(pctConvert(s.blk_per40, 'blk_per40'),   pool.blk_per40,  false, 'blk_per40'),  weight: 0.15 },
    { value: normalizeDRTG(s.drtg),                                                                   weight: 0.17 },
    { value: pfNorm,                                                                                   weight: 0.15 },
  ])
}

// ---- PTC (Playing-Time Conference multiplier) ----------------------------

const PTC_MAP = {
  // Power conferences
  'SEC':             1.10,
  'ACC':             1.10,
  'Big 12':          1.10,
  'Big Ten':         1.10,

  // Strong mid-major
  'Big East':        1.06,

  // International
  'EuroLeague':      1.15,
  'Adriatic':        1.15,

  // Solid mid-major / former power
  'AAC':             1.03,
  'A-10':            1.03,
  'Mountain West':   1.03,
  'WCC':             1.03,
  'Missouri Valley': 1.03,
  'Pac-12':          1.03,

  // Below college level
  'JUCO':            0.95,
  'Prep':            0.95,
}

/**
 * Returns the PTC multiplier for a given conference.
 * Conferences not explicitly listed default to 1.00.
 *
 * @param {string} leagueConf - conference name (e.g. "SEC", "Big East", "JUCO")
 * @returns {number} multiplier in the range [0.95, 1.15]
 */
export function computePTC(leagueConf) {
  if (!leagueConf) return 1.00
  return PTC_MAP[leagueConf] ?? 1.00
}

// ---- Main export ---------------------------------------------------------

/**
 * Compute all nine RAUS skill sub-metrics from a stats row using
 * percentile-based normalization against the full prospect pool.
 *
 * @param {object} stats - row from the `stats` table (flat object with stat columns)
 * @param {string} bucket - position bucket: 'Guard', 'Wing', or 'Big'
 * @param {object[]} allStats - array of ALL prospect stat rows for percentile computation
 * @returns {{ scr: number|null, rpi: number|null, sci: number|null, ucs: number|null,
 *             fcs: number|null, adr: number|null, sti: number|null, rsm: number|null,
 *             dri: number|null }}
 */
export function computeSkillMetrics(stats, bucket, allStats) {
  if (!stats) {
    return { scr: null, rpi: null, sci: null, ucs: null, fcs: null, adr: null, sti: null, rsm: null, dri: null }
  }

  // Build percentile pool map once (if allStats provided; fallback to empty)
  const pool = buildPoolMap(allStats || [])

  return {
    scr: round(applyPositionMultiplier(computeSCR(stats, pool), 'scr', bucket)),
    rpi: round(applyPositionMultiplier(computeRPI(stats, pool), 'rpi', bucket)),
    sci: round(applyPositionMultiplier(computeSCI(stats, pool), 'sci', bucket)),
    ucs: round(applyPositionMultiplier(computeUCS(stats, pool), 'ucs', bucket)),
    fcs: round(applyPositionMultiplier(computeFCS(stats, pool), 'fcs', bucket)),
    adr: round(applyPositionMultiplier(computeADR(stats, pool), 'adr', bucket)),
    sti: round(applyPositionMultiplier(computeSTI(stats, pool), 'sti', bucket)),
    rsm: round(applyPositionMultiplier(computeRSM(stats, pool), 'rsm', bucket)),
    dri: round(applyPositionMultiplier(computeDRI(stats, pool), 'dri', bucket)),
  }
}
