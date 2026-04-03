// ---------------------------------------------------------------------------
// Tier Definitions — centralized tier labels, thresholds, and colors
// Used across scouting cards, big board, dashboard, mock draft, etc.
// ---------------------------------------------------------------------------

// ---- LCI Tiers -----------------------------------------------------------
export const LCI_TIERS = [
  { min: 2.80, label: 'Elite Load Carrier',    color: '#2DD4BF' },
  { min: 2.40, label: 'High-Volume Efficient', color: '#60A5FA' },
  { min: 2.00, label: 'Solid Load Handler',    color: '#93C5FD' },
  { min: 1.60, label: 'Role Player Load',      color: '#FBBF24' },
  { min: -Infinity, label: 'Low Load Capacity', color: '#F87171' },
]

export function lciTier(lci) {
  if (lci == null) return null
  for (const t of LCI_TIERS) {
    if (lci >= t.min) return t
  }
  return LCI_TIERS[LCI_TIERS.length - 1]
}

// ---- WS-H Factor Tiers ---------------------------------------------------
export const WSH_TIERS = [
  { min: 1.14, label: 'Elite Length',          color: '#2DD4BF' },
  { min: 1.06, label: 'Plus Length',           color: '#60A5FA' },
  { min: 0.98, label: 'Average Length',        color: '#94A3B8' },
  { min: 0.92, label: 'Below Average Length',  color: '#FBBF24' },
  { min: -Infinity, label: 'Short Reach',      color: '#F87171' },
]

export function wshTier(wshFactor) {
  if (wshFactor == null) return null
  for (const t of WSH_TIERS) {
    if (wshFactor >= t.min) return t
  }
  return WSH_TIERS[WSH_TIERS.length - 1]
}

// ---- RAUS Tiers -----------------------------------------------------------
export const RAUS_TIERS = [
  { min: 9.00, label: 'Generational',       color: '#DFFF00' },
  { min: 8.20, label: 'Franchise',          color: '#2DD4BF' },
  { min: 7.40, label: 'All-Star',           color: '#34D399' },
  { min: 6.60, label: 'High-End Starter',   color: '#60A5FA' },
  { min: 5.80, label: 'Solid Starter',      color: '#60A5FA' },
  { min: 5.00, label: 'Rotation',           color: '#FBBF24' },
  { min: 4.20, label: 'Development',        color: '#FB923C' },
  { min: -Infinity, label: 'Longshot',      color: '#F87171' },
]

export function rausTier(rausFinal) {
  if (rausFinal == null) return null
  for (const t of RAUS_TIERS) {
    if (rausFinal >= t.min) return t
  }
  return RAUS_TIERS[RAUS_TIERS.length - 1]
}

// ---- SSA Tiers -----------------------------------------------------------
export const SSA_TIERS = [
  { min: 8.50, label: 'Elite Prospect',     color: '#DFFF00' },
  { min: 7.50, label: 'Lottery Talent',     color: '#2DD4BF' },
  { min: 6.50, label: 'First Round Grade',  color: '#34D399' },
  { min: 5.80, label: 'Second Round Grade', color: '#60A5FA' },
  { min: 5.00, label: 'Fringe Prospect',    color: '#FBBF24' },
  { min: -Infinity, label: 'Undrafted Grade', color: '#F87171' },
]

export function ssaTier(ssaFinal) {
  if (ssaFinal == null) return null
  for (const t of SSA_TIERS) {
    if (ssaFinal >= t.min) return t
  }
  return SSA_TIERS[SSA_TIERS.length - 1]
}

// ---- Big Board Composite Tiers -------------------------------------------
export const COMPOSITE_TIERS = [
  { min: 8.50, label: 'Franchise Cornerstone', color: '#FFD700' },
  { min: 7.00, label: 'Lottery Lock',          color: '#166534' },
  { min: 6.50, label: 'First Round Value',     color: '#34D399' },
  { min: 5.90, label: 'Second Round Value',    color: '#60A5FA' },
  { min: 4.90, label: 'Draft-and-Stash',       color: '#FBBF24' },
  { min: -Infinity, label: 'Camp Invite',      color: '#F87171' },
]

export function compositeTier(composite) {
  if (composite == null) return null
  for (const t of COMPOSITE_TIERS) {
    if (composite >= t.min) return t
  }
  return COMPOSITE_TIERS[COMPOSITE_TIERS.length - 1]
}

// ---- Star Index Tiers ----------------------------------------------------
export const STAR_INDEX_TIERS = [
  { min: 9.00, label: 'Franchise Ceiling',   color: '#DFFF00' },
  { min: 7.50, label: 'All-Star Upside',     color: '#34D399' },
  { min: 6.00, label: 'Starter Upside',      color: '#60A5FA' },
  { min: 4.50, label: 'Role Player Ceiling',  color: '#FBBF24' },
  { min: -Infinity, label: 'Limited Upside',  color: '#F87171' },
]

export function starIndexTier(starIndex) {
  if (starIndex == null) return null
  for (const t of STAR_INDEX_TIERS) {
    if (starIndex >= t.min) return t
  }
  return STAR_INDEX_TIERS[STAR_INDEX_TIERS.length - 1]
}

// ---- PPI Tiers -----------------------------------------------------------
export const PPI_TIERS = [
  { min: 8.50, label: 'Elite Producer',       color: '#DFFF00' },
  { min: 7.00, label: 'High-Level Producer',  color: '#34D399' },
  { min: 5.50, label: 'Solid Producer',       color: '#60A5FA' },
  { min: 4.00, label: 'Low-Volume Producer',  color: '#FBBF24' },
  { min: -Infinity, label: 'Minimal Production', color: '#F87171' },
]

export function ppiTier(ppi) {
  if (ppi == null) return null
  for (const t of PPI_TIERS) {
    if (ppi >= t.min) return t
  }
  return PPI_TIERS[PPI_TIERS.length - 1]
}

// ---- SFR Tiers (existing, moved here for consistency) --------------------
export const SFR_TIERS = [
  { min: 1.00, label: 'Disciplined', color: '#34D399' },
  { min: 0.70, label: 'Solid',       color: '#60A5FA' },
  { min: -Infinity, label: 'Gambler', color: '#F87171' },
]

export function sfrTier(sfr) {
  if (sfr == null) return null
  for (const t of SFR_TIERS) {
    if (sfr >= t.min) return t
  }
  return SFR_TIERS[SFR_TIERS.length - 1]
}

// ---- Generic tier badge helper -------------------------------------------
// Returns { label, color } or null
export function getTierBadge(value, tierFn) {
  if (value == null) return null
  return tierFn(value)
}
