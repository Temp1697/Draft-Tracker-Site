import { RAUS_TIERS } from '../lib/tiers'

const TIER_COLORS = Object.fromEntries(
  RAUS_TIERS.map(t => [t.label, { bg: t.color + '22', text: t.color }])
)

export default function TierBadge({ tier }) {
  if (!tier) return <span style={{ color: '#64748b', fontSize: 11 }}>—</span>

  // Support both old format "Tier N — Label" and new format "Label"
  const label = tier.replace(/^Tier \d+ — /, '')
  const colors = TIER_COLORS[label] || TIER_COLORS[tier] || { bg: '#6b728022', text: '#6b7280' }

  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.3,
      whiteSpace: 'nowrap',
      backgroundColor: colors.bg,
      color: colors.text,
    }}>
      {label}
    </span>
  )
}

export { TIER_COLORS }
