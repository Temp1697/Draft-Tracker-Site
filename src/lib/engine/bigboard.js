// ---------------------------------------------------------------------------
// Big Board Composite — final ranking engine
//
// Combines RAUS, SSA, AAA, OAI, and age into a single composite score.
// Also handles tier assignment and OAI/AAA band labeling.
// ---------------------------------------------------------------------------

const BB_WEIGHTS = { raus: 0.45, ssa: 0.25, aaa: 0.15, oai: 0.05, age: 0.10 }

const OAI_BANDS = [
  { min: 99, label: 'Outlier Burst' },
  { min: 90, label: 'Elite Burst' },
  { min: 70, label: 'Plus Burst' },
  { min: 50, label: 'Average Burst' },
  { min: 0,  label: 'Limited Burst' },
]

const AAA_BANDS = [
  { min: 99, label: 'Outlier Physical' },
  { min: 90, label: 'Elite Physical' },
  { min: 70, label: 'Plus Physical' },
  { min: 50, label: 'Average Physical' },
  { min: 0,  label: 'Limited Physical' },
]

function round(v, decimals = 4) {
  if (v == null || isNaN(v)) return null
  return Math.round(v * 10 ** decimals) / 10 ** decimals
}

/**
 * Compute percentile rank of a value within an array.
 * Returns 0-100.
 */
function percentileRank(value, allValues) {
  if (value == null || allValues.length === 0) return null
  const below = allValues.filter(v => v < value).length
  return (below / allValues.length) * 100
}

/**
 * Assign OAI/AAA bands based on percentile within bucket.
 *
 * @param {number} percentile - 0-100
 * @param {Array} bands - band definitions
 * @returns {string} band label
 */
function assignBand(percentile, bands) {
  if (percentile == null) return bands[bands.length - 1].label
  for (const b of bands) {
    if (percentile >= b.min) return b.label
  }
  return bands[bands.length - 1].label
}

/**
 * Compute age score from birth year.
 * Younger = higher score (more projection upside).
 */
function computeAgeScore(birthYear) {
  if (birthYear == null) return null
  // Age in 2026 draft year
  const age = 2026 - birthYear
  // Normalize: 18yr = ~8.0, 19yr = ~7.0, 20yr = ~6.0, 21yr = ~5.0, 22yr = ~4.0, 23yr = ~3.0
  // Linear scale: score = 26 - age (clamped to 0-10)
  return Math.max(0, Math.min(10, 26 - age))
}

/**
 * Compute Big Board composite for a single player.
 * @param {number|null} ageCurveScore - if provided, use this instead of computing from birthYear
 */
export function computeComposite(rausFinal, ssa, aaa, oai, birthYear, ageCurveScore) {
  const ageScore = ageCurveScore ?? computeAgeScore(birthYear)

  const composite = round(
    (rausFinal ?? 0) * BB_WEIGHTS.raus +
    (ssa ?? 0) * BB_WEIGHTS.ssa +
    (aaa ?? 0) * BB_WEIGHTS.aaa +
    (oai ?? 0) * BB_WEIGHTS.oai +
    (ageScore ?? 0) * BB_WEIGHTS.age
  )

  return { composite, age_score: ageScore }
}

/**
 * Assign OAI and AAA bands for all players, grouped by bucket.
 *
 * @param {Array} players - array of { player_id, primary_bucket, oai, aaa }
 * @returns {Map} player_id → { oai_band, aaa_band }
 */
export function assignAllBands(players) {
  const result = new Map()

  // Group by bucket
  const buckets = {}
  for (const p of players) {
    const b = p.primary_bucket || 'Unknown'
    if (!buckets[b]) buckets[b] = []
    buckets[b].push(p)
  }

  for (const [bucket, group] of Object.entries(buckets)) {
    const oaiValues = group.map(p => p.oai).filter(v => v != null && v > 0)
    const aaaValues = group.map(p => p.aaa).filter(v => v != null && v > 0)

    for (const p of group) {
      const oaiPct = percentileRank(p.oai, oaiValues)
      const aaaPct = percentileRank(p.aaa, aaaValues)

      result.set(p.player_id, {
        oai_band: assignBand(oaiPct, OAI_BANDS),
        aaa_band: assignBand(aaaPct, AAA_BANDS),
      })
    }
  }

  return result
}

export { computeAgeScore }
