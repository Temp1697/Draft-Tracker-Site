// ---------------------------------------------------------------------------
// RAUS Pipeline — computes Star Index, RAUS Base/Weighted/Final, PPI
//
// Skill metrics (SCR, RPI, SCI, UCS, FCS, ADR, STI, RSM, DRI) are treated
// as pre-computed inputs. This module handles the aggregation layer.
// ---------------------------------------------------------------------------

const BUCKET_MODS = { Guard: 1.0, Wing: 1.05, Big: 1.15 }

const RAUS_WEIGHTS = {
  ucs: 0.18, fcs: 0.12, adr: 0.10, sti: 0.10,
  rsm: 0.08, dri: 0.07, scr: 0.15, rpi: 0.10,
  sci: 0.05, star_index: 0.05,
}

const TIERS = [
  { tier: 'Tier 1 — Generational', anchor: 9.7, sigma: 0.4 },
  { tier: 'Tier 2 — Franchise', anchor: 8.8, sigma: 0.55 },
  { tier: 'Tier 3 — All-Star', anchor: 7.9, sigma: 0.65 },
  { tier: 'Tier 4 — High-End Starter', anchor: 7.0, sigma: 0.7 },
  { tier: 'Tier 5 — Rotation', anchor: 6.0, sigma: 0.75 },
  { tier: 'Tier 6 — Development', anchor: 5.0, sigma: 0.85 },
  { tier: 'Tier 7 — Longshot', anchor: 4.0, sigma: 1.0 },
]

function round(v, decimals = 2) {
  if (v == null || isNaN(v)) return null
  return Math.round(v * 10 ** decimals) / 10 ** decimals
}

export function computeStarIndex(scr, rpi, sci, bucket) {
  if (scr == null || rpi == null || sci == null) return null
  const mod = BUCKET_MODS[bucket] ?? 1.0
  return round((0.35 * scr + 0.25 * rpi + 0.4 * sci) * mod)
}

export function computeRAUSBase(metrics) {
  const { scr, rpi, sci, star_index, ucs, fcs, adr, sti, rsm, dri } = metrics
  const vals = [scr, rpi, sci, star_index, ucs, fcs, adr, sti, rsm, dri].filter(v => v != null)
  if (vals.length === 0) return null
  return round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export function computeRAUSWeighted(metrics) {
  const { scr, rpi, sci, star_index, ucs, fcs, adr, sti, rsm, dri } = metrics
  const w = RAUS_WEIGHTS
  const sum =
    (ucs ?? 0) * w.ucs + (fcs ?? 0) * w.fcs + (adr ?? 0) * w.adr +
    (sti ?? 0) * w.sti + (rsm ?? 0) * w.rsm + (dri ?? 0) * w.dri +
    (scr ?? 0) * w.scr + (rpi ?? 0) * w.rpi + (sci ?? 0) * w.sci +
    (star_index ?? 0) * w.star_index
  return round(sum)
}

export function computeRAUSFinalAuto(rausWeighted, ptc) {
  if (rausWeighted == null || ptc == null) return null
  return round(rausWeighted * ptc)
}

export function computeRAUSFinal(rausFinalAuto, rausOverride) {
  return rausOverride != null ? rausOverride : rausFinalAuto
}

export function computePPI(metrics, ptc) {
  const { raus_weighted, raus_base, star_index, sci, rpi, scr } = metrics
  if (raus_weighted == null) return null
  const raw =
    (raus_weighted ?? 0) * 0.35 +
    (raus_base ?? 0) * 0.20 +
    (star_index ?? 0) * 0.15 +
    (sci ?? 0) * 0.10 +
    (rpi ?? 0) * 0.10 +
    (scr ?? 0) * 0.05
  return round(raw * (ptc ?? 1))
}

export function assignTier(rausFinal) {
  if (rausFinal == null) return null
  for (const t of TIERS) {
    if (rausFinal >= t.anchor - t.sigma) return t.tier
  }
  return TIERS[TIERS.length - 1].tier
}

/**
 * Run the full RAUS aggregation for a single player.
 * Input: existing skill metrics row (scr_auto, rpi_auto, etc.) + ptc + override
 * Output: updated fields for raus_scores table
 */
export function computeRAUS(row) {
  const scr = row.scr_auto
  const rpi = row.rpi_auto
  const sci = row.sci_auto
  const bucket = row.primary_bucket

  const star_index = computeStarIndex(scr, rpi, sci, bucket)

  const metrics = {
    scr, rpi, sci, star_index,
    ucs: row.ucs_auto, fcs: row.fcs_auto, adr: row.adr_auto,
    sti: row.sti_auto, rsm: row.rsm_auto, dri: row.dri_auto,
  }

  const raus_base = computeRAUSBase(metrics)
  const raus_weighted = computeRAUSWeighted(metrics)
  const ptc = row.ptc_auto ?? 1
  const raus_final_auto = computeRAUSFinalAuto(raus_weighted, ptc)
  const raus_final = computeRAUSFinal(raus_final_auto, row.raus_override)

  const ppi = computePPI(
    { raus_weighted, raus_base, star_index, sci, rpi, scr },
    ptc
  )

  return {
    star_index,
    raus_base,
    raus_weighted,
    raus_final_auto,
    raus_final,
    ppi_auto: ppi,
  }
}
