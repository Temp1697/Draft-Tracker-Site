// ---------------------------------------------------------------------------
// SSA Auto-Grade Engine
//
// Auto-calculates SSA input grades (0-10) from player stats using
// percentile ranks within the current prospect pool. Intended as a
// starting point that can be overridden by manual slider adjustments.
//
// Percentile-to-grade formula:
//   grade = clamp(percentile / 10 * 0.9 + 0.5, 0, 10)
//
//   0th percentile  ->  ~0.5
//   10th percentile ->  ~1.4
//   50th percentile ->  ~5.0
//   90th percentile ->  ~8.6
//   100th percentile -> ~9.5
// ---------------------------------------------------------------------------

import { pctConvert, BASELINES } from './skillmetrics.js'

// ---- Category Definitions ------------------------------------------------
// Each category lists the stats that feed into it.
// Stats marked inverse: true mean lower values are better (the percentile
// is flipped so that a low raw value yields a high grade).

const SSA_CATEGORIES = {
  role_translation: {
    label: 'Role Translation',
    stats: [
      { key: 'usg', inverse: false },
      { key: 'pts_per40', inverse: false },
      { key: 'per', inverse: false },
      { key: 'bpm', inverse: false },
    ],
  },
  shooting_profile: {
    label: 'Shooting Profile',
    stats: [
      { key: 'three_pt_pct', inverse: false },
      { key: 'ft_pct', inverse: false },
      { key: 'efg_pct', inverse: false },
      { key: 'ts_pct', inverse: false },
      { key: 'three_pta_rate', inverse: false },
      { key: 'three_pt_share_pct', inverse: false },
    ],
  },
  creation_scalability: {
    label: 'Creation Scalability',
    stats: [
      { key: 'usg', inverse: false },
      { key: 'ast_pct', inverse: false },
      { key: 'astd_tot_pct', inverse: true }, // lower = more self-creation
      { key: 'pts_per40', inverse: false },
    ],
  },
  playmaking_efficiency: {
    label: 'Playmaking Efficiency',
    stats: [
      { key: 'ast_per40', inverse: false },
      { key: 'ast_tov', inverse: false },
      { key: 'ast_pct', inverse: false },
      { key: 'tov_pct', inverse: true }, // lower TOV is better
    ],
  },
  defensive_impact: {
    label: 'Defensive Impact',
    stats: [
      { key: 'stl_per40', inverse: false },
      { key: 'blk_per40', inverse: false },
      { key: 'dbpm', inverse: false },
      { key: 'dporpagatu', inverse: false },
      { key: 'drtg', inverse: true }, // lower defensive rating is better
    ],
  },
  offball_value: {
    label: 'Off-Ball Value',
    stats: [
      { key: 'at_rim_share_pct', inverse: false },
      { key: 'three_pt_share_pct', inverse: false },
      { key: 'orb_pct', inverse: false },
      { key: 'inside_arc_share_pct', inverse: false },
    ],
  },
  decision_making: {
    label: 'Decision-Making',
    stats: [
      { key: 'ast_tov', inverse: false },
      { key: 'tov_pct', inverse: true }, // lower TOV is better
      { key: 'obpm', inverse: false },
      { key: 'usg', inverse: false },
    ],
  },
  hustle_impact: {
    label: 'Hustle Impact',
    stats: [
      { key: 'stl_pct', inverse: false },
      { key: 'orb_pct', inverse: false },
      { key: 'drb_pct', inverse: false },
      { key: 'pf_per40', inverse: true }, // fewer fouls = smarter hustle
    ],
  },
}

// ---- Utility Functions ---------------------------------------------------

/**
 * Clamp a value between min and max.
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Convert a percentile (0-100) to a 0-10 SSA grade.
 *
 * Formula: grade = clamp(percentile / 10 * 0.9 + 0.5, 0, 10)
 *
 * This produces a comfortable spread:
 *   0th pctile  -> 0.5
 *   50th pctile -> 5.0
 *   100th pctile -> 9.5
 */
function percentileToGrade(percentile) {
  return clamp(percentile / 10 * 0.9 + 0.5, 0, 10)
}

/**
 * Round a number to a given number of decimal places.
 */
function round(v, decimals = 2) {
  if (v == null || isNaN(v)) return null
  return Math.round(v * 10 ** decimals) / 10 ** decimals
}

// ---- Percentile Computation ----------------------------------------------

/**
 * Build a percentile lookup from an array of stat rows.
 *
 * For each stat key used across all SSA categories, this computes the
 * percentile rank of every player who has a non-null value for that stat.
 *
 * For inverse stats, lower raw values receive higher percentile ranks.
 *
 * @param {Array<object>} allStats - array of player stat rows
 * @returns {object} percentiles - { [statKey]: Map<playerId, percentile> }
 *   Also includes a special `_inverse` set for quick lookup.
 */
export function buildPercentileLookup(allStats) {
  // Collect all unique stat keys and their inverse flags
  const statMeta = new Map() // key -> { inverse: boolean }
  for (const cat of Object.values(SSA_CATEGORIES)) {
    for (const s of cat.stats) {
      if (!statMeta.has(s.key)) {
        statMeta.set(s.key, { inverse: s.inverse })
      }
    }
  }

  const percentiles = {}
  const inverseSet = new Set()

  for (const [statKey, meta] of statMeta) {
    if (meta.inverse) inverseSet.add(statKey)

    // Gather all players with non-null values for this stat
    // Convert decimal-percentage stats to whole-number form (e.g. 0.43 → 43)
    const entries = []
    for (const row of allStats) {
      const converted = pctConvert(row[statKey] != null ? Number(row[statKey]) : null, statKey)
      if (converted != null && !isNaN(converted)) {
        entries.push({ id: row.player_id, value: converted })
      }
    }

    if (entries.length === 0) {
      percentiles[statKey] = new Map()
      continue
    }

    // Sort ascending by value
    entries.sort((a, b) => a.value - b.value)

    const total = entries.length
    const pctileMap = new Map()

    // Handle ties: players with the same value get the same percentile
    // (average of the ranks they span).
    let i = 0
    while (i < total) {
      let j = i
      // Find the end of this tied group
      while (j < total && entries[j].value === entries[i].value) {
        j++
      }

      // Average rank for this group (1-based ranks, then convert to percentile)
      // Percentile = (average_rank / total) * 100
      const avgRank = (i + j + 1) / 2 // average of (i+1) through j
      let pctile = (avgRank / total) * 100

      // For inverse stats, flip the percentile
      if (meta.inverse) {
        pctile = 100 - pctile
      }

      for (let k = i; k < j; k++) {
        pctileMap.set(entries[k].id, pctile)
      }

      i = j
    }

    percentiles[statKey] = pctileMap
  }

  percentiles._inverse = inverseSet
  return percentiles
}

// ---- Single Player Grade Computation -------------------------------------

/**
 * Compute auto SSA grades for a single player, given pre-computed
 * percentile data.
 *
 * For each SSA category, the grade is the average of the percentile-to-grade
 * values for all stats in that category that the player has data for.
 * If a player has no data for any stat in a category, that category returns
 * null.
 *
 * @param {object} stats - single player stats row (must include player_id)
 * @param {object} percentiles - precomputed percentile lookup from buildPercentileLookup()
 * @returns {object} { role_translation, shooting_profile, creation_scalability,
 *                     playmaking_efficiency, defensive_impact, offball_value,
 *                     decision_making, hustle_impact }
 *                   Each value is a number 0-10 (rounded to 2 decimals) or null.
 */
/**
 * Range-based DRTG grade for SSA (matches RAUS engine logic).
 * 90-95 → 9.0-10.0, 95-100 → 7.0-9.0, 100-105 → 5.0-7.0,
 * 105-110 → 3.0-5.0, 110-115 → 1.0-3.0
 */
function gradeDRTG(drtg) {
  if (drtg == null || isNaN(drtg)) return null
  if (drtg <= 90)  return 10.0
  if (drtg >= 115) return 1.0
  const ranges = [
    { lo: 90,  hi: 95,  gLo: 10.0, gHi: 9.0 },
    { lo: 95,  hi: 100, gLo: 9.0,  gHi: 7.0 },
    { lo: 100, hi: 105, gLo: 7.0,  gHi: 5.0 },
    { lo: 105, hi: 110, gLo: 5.0,  gHi: 3.0 },
    { lo: 110, hi: 115, gLo: 3.0,  gHi: 1.0 },
  ]
  for (const r of ranges) {
    if (drtg >= r.lo && drtg < r.hi) {
      const t = (drtg - r.lo) / (r.hi - r.lo)
      return clamp(r.gLo + t * (r.gHi - r.gLo), 1.0, 10.0)
    }
  }
  return 1.0
}

/**
 * Compute a z-score based grade for a stat using BASELINES.
 * Same formula as RAUS: grade = 5 + z * 2.5, clamped [0, 10]
 * For inverse stats, the z-score is negated.
 */
function baselineGrade(value, statKey, inverse) {
  const converted = pctConvert(value, statKey)
  if (converted == null || isNaN(converted)) return null
  const b = BASELINES[statKey]
  if (!b || b.std <= 0) return null
  const z = (converted - b.mean) / b.std
  const effectiveZ = inverse ? -z : z
  return clamp(5.0 + effectiveZ * 2.5, 0, 10)
}

export function computeSingleAutoSSA(stats, percentiles) {
  const playerId = stats.player_id
  const result = {}

  for (const [catKey, catDef] of Object.entries(SSA_CATEGORIES)) {
    const grades = []

    for (const s of catDef.stats) {
      // Use range-based normalization for DRTG
      if (s.key === 'drtg') {
        const drtgGrade = gradeDRTG(stats.drtg)
        if (drtgGrade != null) grades.push(drtgGrade)
        continue
      }

      // Try z-score BASELINES first (gives absolute quality measure)
      const rawVal = stats[s.key]
      const blGrade = baselineGrade(rawVal, s.key, s.inverse)
      if (blGrade != null) {
        grades.push(blGrade)
        continue
      }

      // Fallback to percentile-based grade
      const pctileMap = percentiles[s.key]
      if (!pctileMap) continue

      const pctile = pctileMap.get(playerId)
      if (pctile == null) continue

      grades.push(percentileToGrade(pctile))
    }

    if (grades.length === 0) {
      result[catKey] = null
    } else {
      const avg = grades.reduce((sum, g) => sum + g, 0) / grades.length
      result[catKey] = round(avg)
    }
  }

  return result
}

// ---- Batch Grade Computation ---------------------------------------------

/**
 * Compute auto SSA grades for all players.
 *
 * This is the main entry point. It takes the full array of player stat rows,
 * builds percentile ranks across the pool, and then computes per-player
 * SSA input grades for all 8 categories.
 *
 * @param {Array<object>} allStats - array of all players' stats rows.
 *   Each row must have a `player_id` field plus stat columns (e.g., usg,
 *   pts_per40, per, bpm, three_pt_pct, ft_pct, etc.).
 *   Stat values can be null/undefined for missing data.
 *
 * @returns {Map<string, object>} player_id -> {
 *   role_translation: number|null,
 *   shooting_profile: number|null,
 *   creation_scalability: number|null,
 *   playmaking_efficiency: number|null,
 *   defensive_impact: number|null,
 *   offball_value: number|null,
 *   decision_making: number|null,
 *   hustle_impact: number|null,
 * }
 */
export function computeAutoSSAGrades(allStats) {
  if (!allStats || allStats.length === 0) return new Map()

  // Step 1: Build percentile lookup across the entire pool
  const percentiles = buildPercentileLookup(allStats)

  // Step 2: Compute grades for each player
  const results = new Map()
  for (const row of allStats) {
    const grades = computeSingleAutoSSA(row, percentiles)
    results.set(row.player_id, grades)
  }

  return results
}

// ---- Exports for testing / introspection ---------------------------------

/**
 * Exposed for testing and UI introspection (e.g., showing which stats
 * feed into which category).
 */
export { SSA_CATEGORIES, percentileToGrade }
