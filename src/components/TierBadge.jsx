const TIER_COLORS = {
  'Tier 1 — Generational':      { bg: '#7c3aed', text: '#fff' },
  'Tier 2 — Franchise':         { bg: '#2563eb', text: '#fff' },
  'Tier 3 — All-Star':          { bg: '#0891b2', text: '#fff' },
  'Tier 4 — High-End Starter':  { bg: '#059669', text: '#fff' },
  'Tier 3 — High-End Starter':  { bg: '#059669', text: '#fff' },
  'Tier 5 — Rotation':          { bg: '#d97706', text: '#fff' },
  'Tier 6 — Development':       { bg: '#dc2626', text: '#fff' },
  'Tier 7 — Longshot':          { bg: '#6b7280', text: '#fff' },
}

function shortTier(tier) {
  if (!tier) return '—'
  const match = tier.match(/Tier \d — (.+)/)
  return match ? match[1] : tier
}

export default function TierBadge({ tier }) {
  const colors = TIER_COLORS[tier] || { bg: '#6b7280', text: '#fff' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 0.3,
      whiteSpace: 'nowrap',
      backgroundColor: colors.bg,
      color: colors.text,
    }}>
      {shortTier(tier)}
    </span>
  )
}

export { TIER_COLORS, shortTier }
