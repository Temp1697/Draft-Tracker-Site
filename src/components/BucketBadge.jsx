const BUCKET_COLORS = {
  Guard: { bg: '#60A5FA22', text: '#60A5FA', border: '#60A5FA44' },
  Wing:  { bg: '#34D39922', text: '#34D399', border: '#34D39944' },
  Big:   { bg: '#FBBF2422', text: '#FBBF24', border: '#FBBF2444' },
}

export default function BucketBadge({ bucket }) {
  const colors = BUCKET_COLORS[bucket] || { bg: '#6b728022', text: '#6b7280', border: '#6b728044' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      backgroundColor: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
    }}>
      {bucket || '—'}
    </span>
  )
}
