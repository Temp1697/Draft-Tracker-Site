import { useState, useEffect } from 'react'

const CATEGORIES = [
  { key: 'role_translation', label: 'Role Translation' },
  { key: 'shooting_profile', label: 'Shooting Profile' },
  { key: 'creation_scalability', label: 'Creation Scalability' },
  { key: 'playmaking_efficiency', label: 'Playmaking Efficiency' },
  { key: 'defensive_impact', label: 'Defensive Impact' },
  { key: 'offball_value', label: 'Off-Ball Value' },
  { key: 'decision_making', label: 'Decision Making' },
  { key: 'hustle_impact', label: 'Hustle Impact' },
]

function gradeColor(val) {
  if (val == null) return '#475569'
  if (val >= 8.5) return '#22c55e'
  if (val >= 7.0) return '#3b82f6'
  if (val >= 5.5) return '#eab308'
  if (val >= 4.0) return '#f97316'
  return '#ef4444'
}

export default function SSASliders({ values, onChange }) {
  const [local, setLocal] = useState({})

  useEffect(() => {
    if (values) setLocal(values)
  }, [values])

  function handleChange(key, raw) {
    // Snap to 0.5 increments
    const val = Math.round(parseFloat(raw) * 2) / 2
    const next = { ...local, [key]: val }
    setLocal(next)
    onChange?.(next)
  }

  return (
    <div className="ssa-sliders">
      {CATEGORIES.map(({ key, label }) => {
        const val = local[key] ?? 5
        return (
          <div key={key} className="ssa-slider-row">
            <label className="ssa-slider-label">{label}</label>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={val}
              onChange={e => handleChange(key, e.target.value)}
              className="ssa-slider-input"
              style={{
                accentColor: gradeColor(val),
              }}
            />
            <span className="ssa-slider-val" style={{ color: gradeColor(val) }}>
              {val.toFixed(1)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
