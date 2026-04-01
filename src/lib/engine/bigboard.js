// ---------------------------------------------------------------------------
// Big Board Composite — final ranking engine
//
// Combines RAUS, SSA, AAA, OAI, and age into a single composite score.
// When OAI/AAA data is missing (0 or null), their weights are redistributed
// proportionally to RAUS/SSA/age so missing athletic data doesn't penalize.
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

function percentileRank(value, allValues) {
  if (value == null || allValues.length === 0) return null
  const below = allValues.filter(v => v < value).length
  return (below / allValues.length) * 100
}

function assignBand(percentile, bands) {
  if (percentile == null) return bands[bands.length - 1].label
  for (const b of bands) {
    if (percentile >= b.min) return b.label
  }
  return bands[bands.length - 1].label
}

function computeAgeScore(birthYear) {
  if (birthYear == null) return null
  const age = 2026 - birthYear
  return Math.max(0, Math.min(10, 26 - age))
}

/**
 * Compute Big Board composite for a single player.
 *
 * Key fix: When OAI or AAA is missing/zero, redistribute their weight
 * proportionally to RAUS, SSA, and age. This prevents missing combine
 * data from artificially deflating a player's composite.
 *
 * @param {number|null} ageCurveScore - if provided, use this instead of computing from birthYear
 */
export function computeComposite(rausFinal, ssa, aaa, oai, birthYear, ageCurveScore, sizeMultiplier, ageMultiplier) {
  const ageScore = ageCurveScore ?? computeAgeScore(birthYear)

  // Determine which components are available
  const hasOAI = oai != null && oai > 0
  const hasAAA = aaa != null && aaa > 0

  // Build active weights, redistributing missing component weights
  let weights = { ...BB_WEIGHTS }

  if (!hasOAI && !hasAAA) {
    // Neither athletic metric available — redistribute 20% to RAUS/SSA/age
    // Proportional split of the 20% across the 80% that remains:
    // raus gets 0.45/0.80 share, ssa gets 0.25/0.80 share, age gets 0.10/0.80 share
    const redistTotal = weights.aaa + weights.oai  // 0.20
    const activeTotal = weights.raus + weights.ssa + weights.age  // 0.80
    weights = {
      raus: weights.raus + redistTotal * (weights.raus / activeTotal),
      ssa:  weights.ssa  + redistTotal * (weights.ssa / activeTotal),
      aaa:  0,
      oai:  0,
      age:  weights.age  + redistTotal * (weights.age / activeTotal),
    }
  } else if (!hasOAI) {
    // Only OAI missing — redistribute its 5%
    const redistTotal = weights.oai
    const activeTotal = weights.raus + weights.ssa + weights.aaa + weights.age
    weights = {
      raus: weights.raus + redistTotal * (weights.raus / activeTotal),
      ssa:  weights.ssa  + redistTotal * (weights.ssa / activeTotal),
      aaa:  weights.aaa  + redistTotal * (weights.aaa / activeTotal),
      oai:  0,
      age:  weights.age  + redistTotal * (weights.age / activeTotal),
    }
  } else if (!hasAAA) {
    // Only AAA missing — redistribute its 15%
    const redistTotal = weights.aaa
    const activeTotal = weights.raus + weights.ssa + weights.oai + weights.age
    weights = {
      raus: weights.raus + redistTotal * (weights.raus / activeTotal),
      ssa:  weights.ssa  + redistTotal * (weights.ssa / activeTotal),
      aaa:  0,
      oai:  weights.oai  + redistTotal * (weights.oai / activeTotal),
      age:  weights.age  + redistTotal * (weights.age / activeTotal),
    }
  }

  const rawComposite =
    (rausFinal ?? 0) * weights.raus +
    (ssa ?? 0) * weights.ssa +
    (hasAAA ? aaa : 0) * weights.aaa +
    (hasOAI ? oai : 0) * weights.oai +
    (ageScore ?? 0) * weights.age

  const composite = round(rawComposite * (sizeMultiplier ?? 1.0) * (ageMultiplier ?? 1.0))

  return { composite, age_score: ageScore }
}

/**
 * Assign OAI and AAA bands for all players, grouped by bucket.
 */
export function assignAllBands(players) {
  const result = new Map()

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
        oai_band: (p.oai && p.oai > 0) ? assignBand(oaiPct, OAI_BANDS) : 'No Data',
        aaa_band: (p.aaa && p.aaa > 0) ? assignBand(aaaPct, AAA_BANDS) : 'No Data',
      })
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Task 19: Size-Relative-to-Position Multiplier
// ---------------------------------------------------------------------------
export function computeSizeMultiplier(heightInches, bucket) {
  if (heightInches == null || !bucket) return 1.0

  const ranges = {
    Guard: { min: 73, max: 76 },
    Wing:  { min: 77, max: 80 },
    Big:   { min: 81, max: 84 },
  }

  const range = ranges[bucket]
  if (!range) return 1.0

  if (heightInches >= range.min && heightInches <= range.max) return 1.0
  if (heightInches > range.max) {
    return Math.min(1.08, 1.0 + (heightInches - range.max) * 0.02)
  }
  return Math.max(0.92, 1.0 - (range.min - heightInches) * 0.02)
}

// ---------------------------------------------------------------------------
// Task 20: Age Multiplier for Composite
// ---------------------------------------------------------------------------
export function computeAgeMultiplier(birthYear) {
  if (birthYear == null) return 1.0
  const age = 2026 - birthYear
  if (age <= 17) return 1.10
  if (age === 18) return 1.06
  if (age === 19) return 1.02
  if (age === 20) return 1.00
  if (age === 21) return 0.96
  return 0.92
}

export { computeAgeScore }
