const BUCKET_COLORS = {
  Guard: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  Wing:  { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  Big:   { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
}

export default function BucketBadge({ bucket }) {
  const colors = BUCKET_COLORS[bucket] || { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
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
