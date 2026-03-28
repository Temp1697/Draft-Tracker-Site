// ---------------------------------------------------------------------------
// Historical Comp Engine
//
// Matches prospects against historical draft picks using weighted Euclidean
// distance across key metrics. Returns top 3 modern comps + legend echo.
// ---------------------------------------------------------------------------

// Default similarity weights (tunable via settings table)
const DEFAULT_WEIGHTS = {
  ssa: 1.5,
  scr: 1.2,
  sci: 1.0,
  ts_pct: 8.0,    // scaled up because raw values are 0-1
  usg: 6.0,       // scaled up because raw values are 0-1
  oai: 1.0,
  age: 0.8,
}

/**
 * Compute weighted Euclidean distance between a prospect and a historical player.
 *
 * @param {object} prospect - { ssa, scr, sci, ts_pct, usg, oai, age }
 * @param {object} historical - { ssa_estimate, scr_estimate, sci_estimate, college_ts_pct, college_usg, oai_estimate, age_at_draft }
 * @param {object} weights - custom weights (optional)
 * @returns {number} distance (lower = more similar)
 */
export function computeDistance(prospect, historical, weights = DEFAULT_WEIGHTS) {
  let sum = 0

  const pairs = [
    [prospect.ssa, historical.ssa_estimate, weights.ssa],
    [prospect.scr, historical.scr_estimate, weights.scr],
    [prospect.sci, historical.sci_estimate, weights.sci],
    [prospect.ts_pct, historical.college_ts_pct, weights.ts_pct],
    [prospect.usg, historical.college_usg, weights.usg],
    [prospect.oai, historical.oai_estimate, weights.oai],
    [prospect.age, historical.age_at_draft, weights.age],
  ]

  let validPairs = 0
  for (const [pVal, hVal, w] of pairs) {
    if (pVal != null && hVal != null) {
      sum += w * (pVal - hVal) ** 2
      validPairs++
    }
  }

  // Need at least 3 valid dimensions for a meaningful comparison
  if (validPairs < 3) return Infinity

  return Math.sqrt(sum)
}

/**
 * Find closest comps for a prospect from a list of historical players.
 *
 * @param {object} prospect - normalized prospect metrics
 * @param {Array} historicalPlayers - full list from DB
 * @param {object} [options]
 * @param {number} [options.modernCount=3] - number of modern comps to return
 * @param {number} [options.legendCount=1] - number of legend comps to return
 * @param {string|null} [options.positionFilter] - only match same position bucket
 * @param {object} [options.weights] - custom weights
 * @returns {{ modern: Array, legend: Array }}
 */
export function findComps(prospect, historicalPlayers, options = {}) {
  const {
    modernCount = 3,
    legendCount = 1,
    positionFilter = null,
    weights = DEFAULT_WEIGHTS,
  } = options

  let candidates = historicalPlayers
  if (positionFilter) {
    // Map position buckets — allow cross-position comps within adjacent buckets
    candidates = historicalPlayers.filter(h => {
      if (positionFilter === h.position) return true
      // Allow Wing ↔ Guard/Big crossover (wings are versatile)
      if (positionFilter === 'Wing') return true
      if (h.position === 'Wing') return true
      return false
    })
  }

  const scored = candidates.map(h => ({
    ...h,
    distance: computeDistance(prospect, h, weights),
  }))

  const modern = scored
    .filter(h => h.tier === 'modern' && h.distance !== Infinity)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, modernCount)

  const legend = scored
    .filter(h => h.tier === 'legend' && h.distance !== Infinity)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, legendCount)

  return { modern, legend }
}

/**
 * Build the normalized prospect profile for comp matching.
 * Pulls from multiple tables' data.
 */
export function buildProspectProfile(raus, ssa, stats, player) {
  const age = player?.birth_year ? (2026 - player.birth_year) : null

  return {
    ssa: ssa?.ssa_auto_final ?? null,
    scr: raus?.scr_auto ?? null,
    sci: raus?.sci_auto ?? null,
    ts_pct: stats?.ts_pct ?? null,
    usg: stats?.usg ?? null,
    oai: 0, // placeholder — would come from athletic_scores
    age,
  }
}
