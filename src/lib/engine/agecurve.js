// ---------------------------------------------------------------------------
// Age-Relative Production Curve
//
// Two-layer age adjustment:
// 1. Class Multiplier — base adjustment by class year
// 2. Improvement Velocity — YoY delta from multi-season stats
//
// Replaces the simple linear age factor in the Big Board composite.
// ---------------------------------------------------------------------------

const CLASS_MULTIPLIERS = {
  hs: 1.15,
  fr: 1.15,
  so: 1.05,
  jr: 1.00,
  sr: 0.92,
  '5th': 0.85,
  grad: 0.85,
}

// For international / unknown class, interpolate by age
function classMultiplierByAge(age) {
  if (age == null) return 1.00
  if (age <= 18) return 1.15
  if (age <= 19) return 1.10
  if (age <= 20) return 1.05
  if (age <= 21) return 1.00
  if (age <= 22) return 0.92
  return 0.85
}

/**
 * Get the class multiplier for a player.
 * @param {string|null} playerClass - fr, so, jr, sr, 5th, grad, intl, or null
 * @param {number|null} birthYear - for age-based interpolation
 * @returns {number} multiplier (0.85 – 1.15)
 */
export function getClassMultiplier(playerClass, birthYear, draftYear) {
  if (playerClass) {
    // Direct match first
    if (CLASS_MULTIPLIERS[playerClass] != null) {
      return CLASS_MULTIPLIERS[playerClass]
    }
    // Normalize common full names to abbreviations
    const normalized = playerClass.toLowerCase().trim()
    const CLASS_ALIASES = {
      'freshman': 'fr', 'sophomore': 'so', 'junior': 'jr', 'senior': 'sr',
      'high school': 'hs', 'highschool': 'hs', 'graduate': 'grad', '5th year': '5th',
    }
    const alias = CLASS_ALIASES[normalized] || normalized
    if (CLASS_MULTIPLIERS[alias] != null) {
      return CLASS_MULTIPLIERS[alias]
    }
  }
  // International or unknown — use age
  if (birthYear != null) {
    const age = (draftYear && draftYear < 2026) ? draftYear - birthYear : 2026 - birthYear
    return classMultiplierByAge(age)
  }
  return 1.00
}

// Key stats for improvement velocity calculation
const VELOCITY_STATS = ['ts_pct', 'usg', 'ast_pct', 'stl_pct', 'tov_pct']

/**
 * Compute improvement velocity from two season stat rows.
 * Returns a clamped delta between -0.10 and +0.10.
 *
 * @param {object} current - most recent season stats
 * @param {object} prior - previous season stats
 * @returns {number|null} improvement delta, or null if insufficient data
 */
export function computeImprovementVelocity(current, prior) {
  if (!current || !prior) return null

  const deltas = []
  for (const key of VELOCITY_STATS) {
    const cur = current[key]
    const prev = prior[key]
    if (cur == null || prev == null || prev === 0) continue

    // tov_pct is inverted — lower is better
    const rawDelta = (cur - prev) / Math.abs(prev)
    const delta = key === 'tov_pct' ? -rawDelta : rawDelta
    deltas.push(delta)
  }

  if (deltas.length < 2) return null

  const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length
  return Math.max(-0.10, Math.min(0.10, avg))
}

/**
 * Compute the full age-adjusted score.
 *
 * age_adjusted_score = raw_score × class_multiplier × (1 + improvement_delta)
 *
 * @param {number} rawScore - the score to adjust (e.g. SSA)
 * @param {string|null} playerClass
 * @param {number|null} birthYear
 * @param {object|null} currentStats - most recent season
 * @param {object|null} priorStats - previous season
 * @returns {{ adjusted: number, class_multiplier: number, improvement_delta: number|null }}
 */
export function computeAgeAdjustedScore(rawScore, playerClass, birthYear, currentStats, priorStats, draftYear) {
  if (rawScore == null) return { adjusted: null, class_multiplier: null, improvement_delta: null }

  const classMult = getClassMultiplier(playerClass, birthYear, draftYear)
  const impDelta = computeImprovementVelocity(currentStats, priorStats)

  const adjusted = round(rawScore * classMult * (1 + (impDelta ?? 0)))

  return {
    adjusted,
    class_multiplier: classMult,
    improvement_delta: impDelta,
  }
}

/**
 * Compute an age-curve score (0-10 scale) for use in Big Board composite.
 * This replaces the simple `26 - age` linear factor.
 *
 * class_multiplier is on a 0.85–1.15 scale. We map it to 0–10:
 *   score = ((class_multiplier - 0.85) / 0.30) × 10
 *   then add improvement_delta bonus (scaled ×10)
 *
 * @returns {number} 0-10 score
 */
export function computeAgeCurveScore(playerClass, birthYear, currentStats, priorStats, draftYear) {
  const classMult = getClassMultiplier(playerClass, birthYear, draftYear)
  const impDelta = computeImprovementVelocity(currentStats, priorStats)

  // Map 0.85–1.15 → 0–10
  const baseScore = ((classMult - 0.85) / 0.30) * 10
  // Improvement delta bonus: ±0.10 → ±1.0 points on 10-scale
  const bonus = (impDelta ?? 0) * 10

  return {
    score: round(Math.max(0, Math.min(10, baseScore + bonus))),
    class_multiplier: classMult,
    improvement_delta: impDelta,
  }
}

function round(v, d = 4) {
  if (v == null || isNaN(v)) return null
  return Math.round(v * 10 ** d) / 10 ** d
}
