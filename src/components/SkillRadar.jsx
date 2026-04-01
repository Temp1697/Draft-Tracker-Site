import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

const SKILL_LABELS = {
  scr_auto: 'SCR',
  rpi_auto: 'RPI',
  sci_auto: 'SCI',
  ucs_auto: 'UCS',
  fcs_auto: 'FCS',
  adr_auto: 'ADR',
  sti_auto: 'STI',
  rsm_auto: 'RSM',
  dri_auto: 'DRI',
}

export default function SkillRadar({ raus, height = 300 }) {
  if (!raus) return null

  const data = Object.entries(SKILL_LABELS).map(([key, label]) => ({
    skill: label,
    value: raus[key] ?? 0,
    fullMark: 10,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="#242C45" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={{ fill: '#3E4766', fontSize: 9 }}
          tickCount={6}
        />
        <Radar
          name="Skills"
          dataKey="value"
          stroke="#DFFF00"
          fill="#DFFF00"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{ background: '#161B2B', border: '1px solid #242C45', borderRadius: 6, fontSize: 12 }}
          labelStyle={{ color: '#94A3B8' }}
          itemStyle={{ color: '#DFFF00' }}
          formatter={(val) => val?.toFixed(2)}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
