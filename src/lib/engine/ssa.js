// ---------------------------------------------------------------------------
// SSA (Skill Set Assessment) Engine
//
// Takes manual SSA input grades (8 categories, 0-10) and computes
// position-weighted SSA scores with age and wingspan-height modifiers.
// ---------------------------------------------------------------------------

const SSA_WEIGHTS = {
  Guard: { role: 1.1, shooting: 1.2, creation: 1.3, playmaking: 1.3, defense: 0.8, offball: 0.8, decision: 1.2, hustle: 0.3 },
  Wing:  { role: 1.2, shooting: 1.1, creation: 1.1, playmaking: 0.7, defense: 1.2, offball: 1.1, decision: 1.0, hustle: 0.6 },
  Big:   { role: 1.1, shooting: 0.8, creation: 0.8, playmaking: 0.6, defense: 1.4, offball: 1.2, decision: 0.9, hustle: 1.2 },
}

const SSA_RANK_LABELS = [
  { min: 9.0,  label: 'Top 3 Pick' },
  { min: 8.25, label: 'Lottery (4-14)' },
  { min: 7.25, label: 'Mid-Late 1st' },
  { min: 6.75, label: '2nd Round' },
  { min: 6.25, label: 'Bench/Specialist' },
  { min: -Infinity, label: 'Fringe/Two-Way' },
]

const SSA_WEIGHTED_RANK_LABELS = [
  { min: 8.75, label: 'Elite Statistical Résumé' },
  { min: 8.0,  label: 'High-End Profile' },
  { min: 7.25, label: 'Starter-Level Indicators' },
  { min: 6.75, label: 'Rotation Statistical Profile' },
  { min: 6.25, label: 'Partial Skill Profile' },
  { min: -Infinity, label: 'Insufficient Résumé' },
]

function round(v, decimals = 2) {
  if (v == null || isNaN(v)) return null
  return Math.round(v * 10 ** decimals) / 10 ** decimals
}

function getLabel(score, labels) {
  if (score == null) return null
  for (const l of labels) {
    if (score >= l.min) return l.label
  }
  return labels[labels.length - 1].label
}

/**
 * Compute SSA scores for a player.
 *
 * @param {object} input - SSA input grades from ssa_input table
 * @param {string} bucket - 'Guard', 'Wing', or 'Big'
 * @param {number} ageMod - age modifier (default 1.0)
 * @param {number} wsHMod - wingspan-height modifier (default 1.0)
 * @returns {object} - fields for ssa_scores table
 */
export function computeSSA(input, bucket, ageMod = 1.0, wsHMod = 1.0) {
  const weights = SSA_WEIGHTS[bucket]
  if (!weights) return null

  const grades = {
    role: input.role_translation,
    shooting: input.shooting_profile,
    creation: input.creation_scalability,
    playmaking: input.playmaking_efficiency,
    defense: input.defensive_impact,
    offball: input.offball_value,
    decision: input.decision_making,
    hustle: input.hustle_impact,
  }

  // Check we have at least some grades
  const gradeValues = Object.values(grades).filter(v => v != null)
  if (gradeValues.length === 0) return null

  // Weighted sum and denominator
  let weightedSum = 0
  let denom = 0
  for (const [key, weight] of Object.entries(weights)) {
    const grade = grades[key]
    if (grade != null) {
      weightedSum += grade * weight
      denom += weight
    }
  }

  if (denom === 0) return null

  const ssaRaw = (weightedSum / denom) * (ageMod ?? 1) * (wsHMod ?? 1)
  const ssaAutoFinal = round(ssaRaw)

  // SSA Weighted uses the raw weighted sum (not divided by denom) — this matches
  // the v1 pattern where SSA_Weighted is the raw weighted aggregate
  const ssaWeighted = round(weightedSum / denom)

  return {
    position: bucket,
    role: round(grades.role),
    shooting: round(grades.shooting),
    creation: round(grades.creation),
    playmaking: round(grades.playmaking),
    defense: round(grades.defense),
    offball: round(grades.offball),
    decision: round(grades.decision),
    hustle: round(grades.hustle),
    age_mod: round(ageMod),
    ws_h_mod: round(wsHMod),
    ssa_auto_final: ssaAutoFinal,
    ssa_rank_label: getLabel(ssaAutoFinal, SSA_RANK_LABELS),
    ssa_weighted: ssaWeighted,
    ssa_weighted_rank_label: getLabel(ssaWeighted, SSA_WEIGHTED_RANK_LABELS),
  }
}
