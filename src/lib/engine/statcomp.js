// ---------------------------------------------------------------------------
// Statistical Comp Engine v1
//
// Two-pass algorithm:
//   Pass 1 — Filter historical players by eligibility → rank by outcome →
//             take top 3 → average their stats into a composite profile
//   Pass 2 — Re-filter historical players against the composite → score by
//             normalized Euclidean proximity → return closest match + pct
// ---------------------------------------------------------------------------

const OUTCOME_ORDER = {
  'MVP': 0, 'All-NBA': 1, 'All-Star': 2, 'Starter': 3,
  'Role Player': 4, 'Rotation': 5, 'Bench': 6, 'Bust': 7, 'Out of League': 8,
}

// Eligibility half-ranges (player must be within ±range of prospect value)
const STAT_HALF = {
  ppg40:   2.5,
  rpg40:   1.5,
  apg40:   1.5,
  stkpg:   0.8,
  ft_pct:  0.05,
  efg_pct: 0.05,
  ts_pct:  0.05,
  usg:     0.07,
}

const PHYS_HALF = {
  height:     2,
  weight:     10,
  ws_minus_h: 1,
}

// Full ranges (2 × half) used as denominators in Euclidean normalization
const FULL_RANGE = {
  ppg40:   5.0,
  rpg40:   3.0,
  apg40:   3.0,
  stkpg:   1.6,
  ft_pct:  0.10,
  efg_pct: 0.10,
  ts_pct:  0.10,
  usg:     0.14,
}

// ---------------------------------------------------------------------------
// Per/40 conversion
// ---------------------------------------------------------------------------

/**
 * Build a prospect profile from raw stats + measurables.
 * All counting stats are converted to per/40 using MPG.
 * Returns null if MPG is null or zero (insufficient data).
 *
 * @param {object} stats       - row from the stats table
 * @param {object} measurables - row from the measurables table
 * @param {string} position    - 'Guard' | 'Wing' | 'Big'
 */
export function buildProspectProfile(stats, measurables, position) {
  if (!stats) return null
  const mpg = stats.mpg
  if (!mpg || mpg === 0) return null

  const per40 = (v) => (v != null ? (v / mpg) * 40 : null)
  const spg40 = per40(stats.spg)
  const bpg40 = per40(stats.bpg)

  return {
    position,
    ppg40:      per40(stats.ppg),
    rpg40:      per40(stats.rpg),
    apg40:      per40(stats.apg),
    stkpg:      spg40 != null && bpg40 != null ? spg40 + bpg40 : null,
    ft_pct:     stats.ft_pct,
    efg_pct:    stats.efg_pct,
    ts_pct:     stats.ts_pct,
    usg:        stats.usg,
    height:     measurables?.height ?? null,
    weight:     measurables?.weight ?? null,
    ws_minus_h: measurables?.ws_minus_h ?? null,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Compute STKPG fresh for a historical player — never rely on a cached value. */
function hpStkpg(hp) {
  const s = hp.stl_per40
  const b = hp.blk_per40
  return s != null && b != null ? s + b : null
}

/** Average a numeric column across an array, ignoring nulls. */
function avg(arr, key) {
  const vals = arr.map(p => p[key]).filter(v => v != null)
  if (vals.length === 0) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

// ---------------------------------------------------------------------------
// Eligibility filter
// ---------------------------------------------------------------------------

/**
 * Returns true if a historical player passes every eligibility parameter
 * against the given profile. NULL values on either side skip that dimension.
 */
function isEligible(hp, profile) {
  // Position: exact match only
  if (hp.position !== profile.position) return false

  // Height: ±2 inches
  if (profile.height != null && hp.height != null) {
    if (Math.abs(hp.height - profile.height) > PHYS_HALF.height) return false
  }

  // Weight: ±10 lbs with special buckets
  if (profile.weight != null && hp.weight != null) {
    const pw = profile.weight
    const hw = hp.weight
    if (pw <= 150) {
      if (hw > 150) return false
    } else if (pw >= 270) {
      if (hw < 270) return false
    } else {
      if (Math.abs(hw - pw) > PHYS_HALF.weight) return false
    }
  }

  // WS-H: ±1 inch
  if (profile.ws_minus_h != null && hp.ws_minus_h != null) {
    if (Math.abs(hp.ws_minus_h - profile.ws_minus_h) > PHYS_HALF.ws_minus_h) return false
  }

  // Statistical dimensions — skip if either value is null
  const statChecks = [
    [hp.pts_per40,      profile.ppg40,   STAT_HALF.ppg40],
    [hp.reb_per40,      profile.rpg40,   STAT_HALF.rpg40],
    [hp.ast_per40,      profile.apg40,   STAT_HALF.apg40],
    [hpStkpg(hp),       profile.stkpg,   STAT_HALF.stkpg],
    [hp.college_ft_pct, profile.ft_pct,  STAT_HALF.ft_pct],
    [hp.efg_pct,        profile.efg_pct, STAT_HALF.efg_pct],
    [hp.college_ts_pct, profile.ts_pct,  STAT_HALF.ts_pct],
    [hp.college_usg,    profile.usg,     STAT_HALF.usg],
  ]
  for (const [hv, pv, half] of statChecks) {
    if (hv != null && pv != null && Math.abs(hv - pv) > half) return false
  }

  return true
}

// ---------------------------------------------------------------------------
// Pass 1: build composite profile
// ---------------------------------------------------------------------------

function buildComposite(top3, position) {
  const stkVals = top3.map(hpStkpg).filter(v => v != null)
  return {
    position,
    ppg40:      avg(top3, 'pts_per40'),
    rpg40:      avg(top3, 'reb_per40'),
    apg40:      avg(top3, 'ast_per40'),
    stkpg:      stkVals.length > 0 ? stkVals.reduce((a, b) => a + b, 0) / stkVals.length : null,
    ft_pct:     avg(top3, 'college_ft_pct'),
    efg_pct:    avg(top3, 'efg_pct'),
    ts_pct:     avg(top3, 'college_ts_pct'),
    usg:        avg(top3, 'college_usg'),
    height:     avg(top3, 'height'),
    weight:     avg(top3, 'weight'),
    ws_minus_h: avg(top3, 'ws_minus_h'),
  }
}

// ---------------------------------------------------------------------------
// Pass 2: proximity scoring (normalized Euclidean distance)
// ---------------------------------------------------------------------------

function proximityScore(hp, composite) {
  const dims = [
    [hp.pts_per40,      composite.ppg40,   FULL_RANGE.ppg40],
    [hp.reb_per40,      composite.rpg40,   FULL_RANGE.rpg40],
    [hp.ast_per40,      composite.apg40,   FULL_RANGE.apg40],
    [hpStkpg(hp),       composite.stkpg,   FULL_RANGE.stkpg],
    [hp.college_ft_pct, composite.ft_pct,  FULL_RANGE.ft_pct],
    [hp.efg_pct,        composite.efg_pct, FULL_RANGE.efg_pct],
    [hp.college_ts_pct, composite.ts_pct,  FULL_RANGE.ts_pct],
    [hp.college_usg,    composite.usg,     FULL_RANGE.usg],
  ]

  let sumSq = 0
  let n = 0
  for (const [hv, cv, range] of dims) {
    if (hv != null && cv != null) {
      sumSq += (Math.abs(hv - cv) / range) ** 2
      n++
    }
  }

  if (n === 0) return 0
  return Math.max(0, 1 - Math.sqrt(sumSq / n))
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Run the full two-pass comp algorithm.
 *
 * @param {object} prospectProfile - from buildProspectProfile()
 * @param {Array}  allHistoricalPlayers - full historical_players array from DB
 * @returns {{ compPlayer: object, matchPct: number } | null}
 *   Returns null if no eligible players found in either pass → 1 of 1
 */
export function runStatComp(prospectProfile, allHistoricalPlayers) {
  if (!prospectProfile || !allHistoricalPlayers?.length) return null

  // ---- Pass 1 ---------------------------------------------------------------
  const eligible1 = allHistoricalPlayers.filter(hp => isEligible(hp, prospectProfile))
  if (eligible1.length === 0) return null

  // Rank by outcome tier (highest first), break ties by WS/48 desc
  const sorted1 = [...eligible1].sort((a, b) => {
    const ao = OUTCOME_ORDER[a.nba_outcome_label] ?? 4
    const bo = OUTCOME_ORDER[b.nba_outcome_label] ?? 4
    if (ao !== bo) return ao - bo
    return (b.nba_ws48_first4 ?? 0) - (a.nba_ws48_first4 ?? 0)
  })
  const top3 = sorted1.slice(0, 3)

  const composite = buildComposite(top3, prospectProfile.position)

  // ---- Pass 2 ---------------------------------------------------------------
  const eligible2 = allHistoricalPlayers.filter(hp => isEligible(hp, composite))
  if (eligible2.length === 0) return null

  let best = null
  let bestScore = -Infinity
  for (const hp of eligible2) {
    const score = proximityScore(hp, composite)
    if (score > bestScore) {
      bestScore = score
      best = hp
    }
  }

  if (!best) return null
  return { compPlayer: best, matchPct: Math.round(bestScore * 100) }
}
