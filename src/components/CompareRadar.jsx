import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const SKILL_KEYS = ['scr_auto', 'rpi_auto', 'sci_auto', 'ucs_auto', 'fcs_auto', 'adr_auto', 'sti_auto', 'rsm_auto', 'dri_auto']
const SKILL_LABELS = { scr_auto: 'SCR', rpi_auto: 'RPI', sci_auto: 'SCI', ucs_auto: 'UCS', fcs_auto: 'FCS', adr_auto: 'ADR', sti_auto: 'STI', rsm_auto: 'RSM', dri_auto: 'DRI' }
const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444']

/**
 * Overlaid radar chart for comparing 2-4 players.
 * @param {{ players: Array<{ name: string, raus: object }> }} props
 */
export default function CompareRadar({ players, height = 320 }) {
  if (!players || players.length === 0) return null

  const data = SKILL_KEYS.map(key => {
    const point = { skill: SKILL_LABELS[key], fullMark: 10 }
    players.forEach((p, i) => {
      point[`p${i}`] = p.raus?.[key] ?? 0
    })
    return point
  })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
        <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#475569', fontSize: 9 }} tickCount={6} />
        {players.map((p, i) => (
          <Radar
            key={i}
            name={p.name}
            dataKey={`p${i}`}
            stroke={COLORS[i]}
            fill={COLORS[i]}
            fillOpacity={0.1}
            strokeWidth={2}
          />
        ))}
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6, fontSize: 12 }}
          labelStyle={{ color: '#94a3b8' }}
          formatter={(val) => val?.toFixed(2)}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
