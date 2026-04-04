// ---------------------------------------------------------------------------
// Athletic Scoring Engine — OAI & AAA
//
// Computes OAI (Overall Athleticism Index) and AAA (Advanced Athletic
// Aggregate) from raw combine measurables stored in the measurables table.
//
// Sub-metrics (raw):
//   MAS  = √(weight / 200) ÷ sprint_time          (mass-adjusted speed)
//   MAV  = (vertical ÷ height) × √(weight / 200)  (mass-adjusted vertical)
//   MAMI = (height × √(weight / 200)) ÷ agility   (mass-adjusted mobility)
//
// Each sub-metric is normalized to 0-10 via z-score, then combined:
//   OAI  = norm(MAS) × 0.4 + norm(MAV) × 0.4 + norm(MAMI) × 0.2
//   AAA  = OAI × 0.6 + norm(MAMI) × 0.2 + norm(SizeScore) × 0.2
// ---------------------------------------------------------------------------

function round(v, d = 4) {
  if (v == null || isNaN(v)) return null
  return Math.round(v * 10 ** d) / 10 ** d
}

/**
 * Compute MAS (Mass-Adjusted Speed)
 * MAS = √(weight / 200) ÷ sprint_time
 */
export function computeMAS(weight, sprintTime) {
  if (!weight || !sprintTime || sprintTime === 0) return null
  return Math.sqrt(weight / 200) / sprintTime
}

/**
 * Compute MAV (Mass-Adjusted Vertical)
 * MAV = (vertical ÷ height) × √(weight / 200)
 */
export function computeMAV(vertical, height, weight) {
  if (!vertical || !height || !weight || height === 0) return null
  return (vertical / height) * Math.sqrt(weight / 200)
}

/**
 * Compute MAMI (Mass-Adjusted Mobility Index)
 * MAMI = (height × √(weight / 200)) ÷ agility_time
 */
export function computeMAMI(height, weight, agilityTime) {
  if (!height || !weight || !agilityTime || agilityTime === 0) return null
  return (height * Math.sqrt(weight / 200)) / agilityTime
}

/**
 * Compute SizeScore (used for AAA)
 * SizeScore = (height ÷ 80) + (wingspan ÷ height)
 */
export function computeSizeScore(height, wingspan) {
  if (!height || height === 0) return null
  const ws = wingspan || height
  return (height / 80) + (ws / height)
}

// ---------------------------------------------------------------------------
// Sub-metric baselines for z-score normalization
//
// Derived from typical NBA combine distributions. The 50th-percentile
// positional defaults should produce values very close to these means,
// giving a normalized score of ~5.0 (by design).
//
// Guard defaults:  MAS=0.309, MAV=0.500, MAMI=6.794, Size=1.991
// Wing defaults:   MAS=0.316, MAV=0.473, MAMI=7.379, Size=2.038
// Big defaults:    MAS=0.324, MAV=0.441, MAMI=7.879, Size=2.086
// Average:         MAS≈0.316, MAV≈0.471, MAMI≈7.35,  Size≈2.04
// ---------------------------------------------------------------------------
const SUB_BASELINES = {
  mas:       { mean: 0.316, std: 0.020 },   // range ~0.27-0.37
  mav:       { mean: 0.471, std: 0.045 },   // range ~0.35-0.60
  mami:      { mean: 7.35,  std: 0.50  },   // range ~6.0-9.0
  sizeScore: { mean: 2.04,  std: 0.08  },   // range ~1.85-2.30
}

/**
 * Normalize a raw value to 0-10 scale using z-score.
 * score = 5.0 + z × 2.0, clamped [1.0, 10.0]
 */
function norm(value, baseline) {
  if (value == null || !baseline || baseline.std === 0) return null
  const z = (value - baseline.mean) / baseline.std
  return Math.max(1.0, Math.min(10.0, 5.0 + z * 2.0))
}

/**
 * Full athletic computation for a single player.
 *
 * Steps:
 *   1. Compute raw sub-metrics (MAS, MAV, MAMI, SizeScore)
 *   2. Normalize each to 0-10 via z-score
 *   3. Combine normalized scores into OAI and AAA
 *
 * @param {object} meas - measurables row
 * @returns {object|null} { mas_sqrt, mav, mami, oai, aaa }
 */
export function computeAthleticScores(meas) {
  if (!meas) return null

  const height = meas.height
  const weight = meas.weight
  const wingspan = meas.wingspan
  const vert = meas.max_vertical || meas.vertical
  const sprint = meas.three_quarter_sprint
  const agility = meas.lane_agility || meas.shuttle

  // 1. Compute raw sub-metrics
  const masRaw = computeMAS(weight, sprint)
  const mavRaw = computeMAV(vert, height, weight)
  const mamiRaw = computeMAMI(height, weight, agility)
  const sizeRaw = computeSizeScore(height, wingspan)

  // 2. Normalize each to 0-10
  const masNorm = norm(masRaw, SUB_BASELINES.mas)
  const mavNorm = norm(mavRaw, SUB_BASELINES.mav)
  const mamiNorm = norm(mamiRaw, SUB_BASELINES.mami)
  const sizeNorm = norm(sizeRaw, SUB_BASELINES.sizeScore)

  // Need at least one athletic sub-metric
  if (masNorm == null && mavNorm == null && mamiNorm == null) return null

  // 3. Compute OAI from normalized sub-metrics
  //    OAI = norm(MAS) × 0.4 + norm(MAV) × 0.4 + norm(MAMI) × 0.2
  let oaiTotal = 0, oaiWeight = 0
  if (masNorm != null)  { oaiTotal += masNorm * 0.4;  oaiWeight += 0.4 }
  if (mavNorm != null)  { oaiTotal += mavNorm * 0.4;  oaiWeight += 0.4 }
  if (mamiNorm != null) { oaiTotal += mamiNorm * 0.2; oaiWeight += 0.2 }
  const oai = oaiWeight > 0 ? round(oaiTotal / oaiWeight) : null

  // 4. Compute AAA from OAI + MAMI + SizeScore (all already on 0-10)
  //    AAA = OAI × 0.6 + norm(MAMI) × 0.2 + norm(SizeScore) × 0.2
  let aaaTotal = 0, aaaWeight = 0
  if (oai != null)      { aaaTotal += oai * 0.6;       aaaWeight += 0.6 }
  if (mamiNorm != null) { aaaTotal += mamiNorm * 0.2;  aaaWeight += 0.2 }
  if (sizeNorm != null) { aaaTotal += sizeNorm * 0.2;  aaaWeight += 0.2 }
  const aaa = aaaWeight > 0 ? round(aaaTotal / aaaWeight) : null

  return {
    mas_sqrt: round(masRaw),
    mav: round(mavRaw),
    mami: round(mamiRaw),
    oai,
    aaa,
  }
}

// ---------------------------------------------------------------------------
// 50th-percentile combine measurables by position
// Used to fill missing testing data so every player gets a computed score.
// As real combine data comes in, these placeholders get replaced.
// ---------------------------------------------------------------------------
export const COMBINE_DEFAULTS = {
  Guard: {
    height: 75,       // 6'3"
    weight: 195,
    wingspan: 79,     // +4"
    max_vertical: 38,
    vertical: 32,
    three_quarter_sprint: 3.20,
    lane_agility: 10.90,
    shuttle: 3.10,
  },
  Wing: {
    height: 79,       // 6'7"
    weight: 215,
    wingspan: 83,     // +4"
    max_vertical: 36,
    vertical: 30,
    three_quarter_sprint: 3.28,
    lane_agility: 11.10,
    shuttle: 3.18,
  },
  Big: {
    height: 82,       // 6'10"
    weight: 240,
    wingspan: 87,     // +5"
    max_vertical: 33,
    vertical: 28,
    three_quarter_sprint: 3.38,
    lane_agility: 11.40,
    shuttle: 3.28,
  },
}

/**
 * Build a complete measurables object by merging real data with positional
 * defaults for any missing fields. Returns the merged object and a list
 * of which fields were estimated.
 */
export function fillAthleticDefaults(meas, bucket) {
  const defaults = COMBINE_DEFAULTS[bucket] || COMBINE_DEFAULTS.Wing
  const filled = { ...defaults }
  const estimated = []

  const FIELDS = ['height', 'weight', 'wingspan', 'max_vertical', 'vertical',
    'three_quarter_sprint', 'lane_agility', 'shuttle']

  for (const f of FIELDS) {
    if (meas && meas[f] != null) {
      filled[f] = meas[f]
    } else {
      estimated.push(f)
    }
  }

  return { filled, estimated }
}

/**
 * Positional average athletic defaults (0-10 scale) for players
 * with NO measurables data at all. Represents 50th percentile.
 */
export const ATHLETIC_DEFAULTS = {
  Guard: { oai: 5.0, aaa: 5.0 },
  Wing:  { oai: 5.0, aaa: 5.0 },
  Big:   { oai: 5.0, aaa: 5.0 },
}
