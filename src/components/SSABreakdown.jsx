const CATEGORIES = [
  { key: 'role', label: 'Role Translation' },
  { key: 'shooting', label: 'Shooting' },
  { key: 'creation', label: 'Creation' },
  { key: 'playmaking', label: 'Playmaking' },
  { key: 'defense', label: 'Defense' },
  { key: 'offball', label: 'Off-Ball' },
  { key: 'decision', label: 'Decision' },
  { key: 'hustle', label: 'Hustle' },
]

const SSA_WEIGHTS = {
  Guard: { role: 1.1, shooting: 1.2, creation: 1.3, playmaking: 1.3, defense: 0.8, offball: 0.8, decision: 1.2, hustle: 0.3 },
  Wing:  { role: 1.2, shooting: 1.1, creation: 1.1, playmaking: 0.7, defense: 1.2, offball: 1.1, decision: 1.0, hustle: 0.6 },
  Big:   { role: 1.1, shooting: 0.8, creation: 0.8, playmaking: 0.6, defense: 1.4, offball: 1.2, decision: 0.9, hustle: 1.2 },
}

function barColor(val) {
  if (val == null) return '#242C45'
  if (val >= 8.5) return '#DFFF00'
  if (val >= 7.0) return '#2DD4BF'
  if (val >= 5.5) return '#60A5FA'
  if (val >= 4.0) return '#FBBF24'
  return '#F87171'
}

export default function SSABreakdown({ ssa, bucket }) {
  if (!ssa) return <div className="sc-section-empty">No SSA scores available</div>

  const weights = SSA_WEIGHTS[bucket] || SSA_WEIGHTS.Guard

  return (
    <div className="ssa-breakdown">
      {CATEGORIES.map(({ key, label }) => {
        const val = ssa[key]
        const weight = weights[key]
        const pct = val != null ? (val / 10) * 100 : 0

        return (
          <div key={key} className="ssa-row">
            <div className="ssa-label">
              <span className="ssa-cat">{label}</span>
              <span className="ssa-weight">x{weight.toFixed(1)}</span>
            </div>
            <div className="ssa-bar-track">
              <div
                className="ssa-bar-fill"
                style={{ width: `${pct}%`, backgroundColor: barColor(val) }}
              />
            </div>
            <span className="ssa-val">{val?.toFixed(1) ?? '—'}</span>
          </div>
        )
      })}
      <div className="ssa-footer">
        <span>Age Mod: <b>{ssa.age_mod?.toFixed(2) ?? '—'}</b></span>
        <span>WS-H Mod: <b>{ssa.ws_h_mod?.toFixed(2) ?? '—'}</b></span>
      </div>
    </div>
  )
}
