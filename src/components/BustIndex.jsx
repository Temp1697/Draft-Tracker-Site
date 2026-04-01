import { useState } from 'react'

const SUB_CATEGORIES = [
  { key: 'statistical', label: 'Statistical Red Flags', weight: '40%' },
  { key: 'injury', label: 'Injury History', weight: '25%' },
  { key: 'physical', label: 'Physical Red Flags', weight: '20%' },
  { key: 'contextual', label: 'Contextual Red Flags', weight: '15%' },
]

function riskBarColor(score) {
  if (score >= 8.0) return '#1a1a1a'
  if (score >= 6.5) return '#DC2626'
  if (score >= 5.0) return '#F97316'
  if (score >= 3.5) return '#FBBF24'
  if (score >= 2.0) return '#86EFAC'
  return '#2DD4BF'
}

export default function BustIndex({ bustData }) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  if (!bustData || !bustData.activated) {
    return (
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, padding: '12px 0', textAlign: 'center' }}>
        N/A — Below evaluation threshold
      </div>
    )
  }

  const { bust_index, tier, statistical, injury, physical, contextual } = bustData
  const subs = { statistical, injury, physical, contextual }

  const scoreColor = tier.textColor || tier.color
  const isExtreme = bust_index >= 8.0

  return (
    <div className="bust-index">
      {/* Header: large score + tier + probability */}
      <div className="bust-header">
        <div
          className="bust-score-circle"
          style={{
            borderColor: tier.color,
            color: scoreColor,
            backgroundColor: isExtreme ? tier.color : 'transparent',
          }}
        >
          {bust_index.toFixed(1)}
        </div>
        <div className="bust-header-info">
          <span className="bust-tier" style={{ color: tier.color }}>{tier.label}</span>
          {tier.prob && (
            <span className="bust-prob">{tier.prob}</span>
          )}
          <span className="bust-subtitle">Bust Index</span>
        </div>
      </div>

      {/* Sub-category bars */}
      <div className="bust-bars">
        {SUB_CATEGORIES.map(cat => {
          const sub = subs[cat.key]
          const pct = (sub.score / 10) * 100
          return (
            <div key={cat.key} className="bust-bar-row">
              <div className="bust-bar-label">
                <span>{cat.label}</span>
                <span className="bust-bar-weight">{cat.weight}</span>
              </div>
              <div className="bust-bar-track">
                <div
                  className="bust-bar-fill"
                  style={{ width: `${pct}%`, backgroundColor: riskBarColor(sub.score) }}
                />
              </div>
              <span className="bust-bar-val" style={{ color: riskBarColor(sub.score) }}>
                {sub.score.toFixed(1)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Details toggle */}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <button className="bust-details-btn" onClick={() => setDetailsOpen(v => !v)}>
          {detailsOpen ? 'Hide Details' : 'Details'}
        </button>
      </div>

      {/* Expanded details panel */}
      {detailsOpen && (
        <div className="bust-details">
          {SUB_CATEGORIES.map(cat => {
            const sub = subs[cat.key]
            return (
              <div key={cat.key} className="bust-detail-section">
                <div className="bust-detail-header" style={{ color: riskBarColor(sub.score) }}>
                  {cat.label}: {sub.score.toFixed(1)}/10
                  {sub.flags.length > 0 && (
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
                      {' '}— {sub.flags.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
          {Object.values(subs).every(s => s.flags.length === 0) && (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
              No specific flags identified
            </div>
          )}
        </div>
      )}
    </div>
  )
}
