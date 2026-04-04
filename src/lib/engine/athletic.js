// ---------------------------------------------------------------------------
// Athletic Scoring Engine — OAI & AAA
//
// Computes OAI (Overall Athleticism Index) and AAA (Advanced Athletic
// Aggregate) from raw combine measurables stored in the measurables table.
//
// Sub-metrics:
//   MAS  = √(weight / 200) ÷ sprint_time          (mass-adjusted speed)
//   MAV  = (vertical ÷ height) × √(weight / 200)  (mass-adjusted vertical)
//   MAMI = (height × √(weight / 200)) ÷ agility   (mass-adjusted mobility)
//
// OAI  = MAS × 0.4 + MAV × 0.4 + MAMI × 0.2
// AAA  = OAI × 0.6 + MAMI × 0.2 + SizeScore × 0.2
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
 * Uses max_vertical if available, otherwise standing vertical
 */
export function computeMAV(vertical, height, weight) {
  if (!vertical || !height || !weight || height === 0) return null
  return (vertical / height) * Math.sqrt(weight / 200)
}

/**
 * Compute MAMI (Mass-Adjusted Mobility Index)
 * MAMI = (height × √(weight / 200)) ÷ agility_time
 * Uses lane_agility if available, otherwise shuttle
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
  const ws = wingspan || height // fallback to height if no wingspan
  return (height / 80) + (ws / height)
}

/**
 * Compute raw OAI from sub-metrics
 * OAI = MAS × 0.4 + MAV × 0.4 + MAMI × 0.2
 */
export function computeRawOAI(mas, mav, mami) {
  if (mas == null && mav == null && mami == null) return null

  // If we have at least one component, weight proportionally
  let total = 0, weightSum = 0
  if (mas != null) { total += mas * 0.4; weightSum += 0.4 }
  if (mav != null) { total += mav * 0.4; weightSum += 0.4 }
  if (mami != null) { total += mami * 0.2; weightSum += 0.2 }

  if (weightSum === 0) return null
  return total / weightSum // normalize if missing components
}

/**
 * Compute raw AAA from OAI, MAMI, and SizeScore
 * AAA = OAI × 0.6 + MAMI × 0.2 + SizeScore × 0.2
 */
export function computeRawAAA(oai, mami, sizeScore) {
  if (oai == null) return null

  let total = oai * 0.6, weightSum = 0.6
  if (mami != null) { total += mami * 0.2; weightSum += 0.2 }
  if (sizeScore != null) { total += sizeScore * 0.2; weightSum += 0.2 }

  return total / weightSum
}

// ---------------------------------------------------------------------------
// Normalization: Convert raw values to 0-10 scale using z-score approach
// These baselines are derived from typical NBA combine distributions
// ---------------------------------------------------------------------------

const RAW_BASELINES = {
  mas:  { mean: 0.295, std: 0.025 },  // typical range ~0.24-0.35
  mav:  { mean: 0.42,  std: 0.05  },  // typical range ~0.30-0.55
  mami: { mean: 7.2,   std: 0.6   },  // typical range ~5.8-8.8
  oai:  { mean: 0.80,  std: 0.10  },  // weighted composite
  sizeScore: { mean: 2.28, std: 0.10 }, // typical ~2.05-2.55
  aaa:  { mean: 1.20,  std: 0.15  },  // weighted composite
}

/**
 * Normalize a raw value to 0-10 scale using z-score.
 * score = 5.0 + z × 2.5, clamped [1.0, 10.0]
 */
function normalizeToScale(value, baseline) {
  if (value == null || !baseline || baseline.std === 0) return null
  const z = (value - baseline.mean) / baseline.std
  return Math.max(1.0, Math.min(10.0, 5.0 + z * 2.5))
}

/**
 * Full athletic computation for a single player.
 *
 * @param {object} meas - measurables row (height, weight, wingspan, vertical,
 *   max_vertical, three_quarter_sprint, lane_agility, shuttle, bench, standing_reach)
 * @returns {object} { mas_sqrt, mav, mami, oai, aaa, oai_raw, aaa_raw }
 */
export function computeAthleticScores(meas) {
  if (!meas) return null

  const height = meas.height
  const weight = meas.weight
  const wingspan = meas.wingspan
  const vert = meas.max_vertical || meas.vertical
  const sprint = meas.three_quarter_sprint
  const agility = meas.lane_agility || meas.shuttle

  // Compute sub-metrics
  const masRaw = computeMAS(weight, sprint)
  const mavRaw = computeMAV(vert, height, weight)
  const mamiRaw = computeMAMI(height, weight, agility)
  const sizeScoreRaw = computeSizeScore(height, wingspan)

  // Compute raw composites
  const oaiRaw = computeRawOAI(masRaw, mavRaw, mamiRaw)
  const aaaRaw = computeRawAAA(oaiRaw, mamiRaw, sizeScoreRaw)

  // Normalize to 0-10 scale
  const oai = round(normalizeToScale(oaiRaw, RAW_BASELINES.oai))
  const aaa = round(normalizeToScale(aaaRaw, RAW_BASELINES.aaa))

  return {
    mas_sqrt: round(masRaw),
    mav: round(mavRaw),
    mami: round(mamiRaw),
    oai,
    aaa,
    oai_raw: round(oaiRaw),
    aaa_raw: round(aaaRaw),
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
