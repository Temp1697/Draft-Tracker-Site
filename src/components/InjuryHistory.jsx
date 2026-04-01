import { useState } from 'react'

const SEVERITY_COLORS = {
  minor:             { color: '#FBBF24', label: 'Minor',             bg: 'rgba(251,191,36,0.1)',  stroke: null },
  moderate:          { color: '#F97316', label: 'Moderate',          bg: 'rgba(249,115,22,0.1)',  stroke: null },
  major:             { color: '#EF4444', label: 'Major',             bg: 'rgba(239,68,68,0.1)',   stroke: null },
  severe:            { color: '#1a1a1a', label: 'Severe',            bg: 'rgba(26,26,26,0.15)',   stroke: '#ffffff' },
  season_ending:     { color: '#1a1a1a', label: 'Season Ending',     bg: 'rgba(26,26,26,0.15)',   stroke: '#ffffff' },
  career_threatening:{ color: '#1a1a1a', label: 'Career Threatening', bg: 'rgba(26,26,26,0.2)',   stroke: '#EF4444' },
}

const BODY_PARTS = {
  head:        { label: 'Head/Concussion',   x: 200, y: 30 },
  neck:        { label: 'Neck',              x: 200, y: 68 },
  shoulder_l:  { label: 'Left Shoulder',     x: 140, y: 105 },
  shoulder_r:  { label: 'Right Shoulder',    x: 260, y: 105 },
  chest:       { label: 'Chest',             x: 200, y: 145 },
  back:        { label: 'Back',              x: 200, y: 180 },
  elbow_l:     { label: 'Left Elbow',        x: 114, y: 195 },
  elbow_r:     { label: 'Right Elbow',       x: 286, y: 195 },
  abdomen:     { label: 'Abdomen',           x: 200, y: 220 },
  wrist_l:     { label: 'Left Wrist/Hand',   x: 92,  y: 270 },
  wrist_r:     { label: 'Right Wrist/Hand',  x: 308, y: 270 },
  hip:         { label: 'Hip',               x: 200, y: 262 },
  groin:       { label: 'Groin',             x: 200, y: 300 },
  quad_l:      { label: 'Left Quad',         x: 176, y: 345 },
  quad_r:      { label: 'Right Quad',        x: 224, y: 345 },
  hamstring_l: { label: 'Left Hamstring',    x: 176, y: 370 },
  hamstring_r: { label: 'Right Hamstring',   x: 224, y: 370 },
  knee_l:      { label: 'Left Knee',         x: 176, y: 396 },
  knee_r:      { label: 'Right Knee',        x: 224, y: 396 },
  calf_l:      { label: 'Left Calf',         x: 174, y: 434 },
  calf_r:      { label: 'Right Calf',        x: 226, y: 434 },
  shin_l:      { label: 'Left Shin',         x: 174, y: 458 },
  shin_r:      { label: 'Right Shin',        x: 226, y: 458 },
  ankle_l:     { label: 'Left Ankle',        x: 174, y: 478 },
  ankle_r:     { label: 'Right Ankle',       x: 226, y: 478 },
  foot_l:      { label: 'Left Foot',         x: 166, y: 504 },
  foot_r:      { label: 'Right Foot',        x: 234, y: 504 },
}

/**
 * Clean solid male body silhouette — front-facing, arms slightly out at sides.
 * Built from overlapping simple shapes sharing the same fill for seamless look:
 *  1. Head (ellipse)
 *  2. Torso+arms (one path, V-shaped bottom ending at crotch)
 *  3. Right leg (simple tapered column with foot)
 *  4. Left leg (simple tapered column with foot)
 */
function BodySilhouette({ fill, stroke, strokeWidth, opacity }) {
  return (
    <g opacity={opacity ?? 1} fill={fill} stroke="none">
      {/* Head */}
      <ellipse cx="200" cy="28" rx="24" ry="26" />

      {/* Torso + arms — V-bottom at crotch so legs can fit naturally */}
      <path d={`
        M192,54 L208,54
        L208,72
        C228,78 250,90 262,104
        C272,114 280,128 286,146
        C292,164 296,184 300,204
        L306,234 C308,246 310,256 312,264
        L314,276 C315,282 314,286 312,286
        C310,286 308,282 306,276
        L300,254 C296,240 292,224 286,208
        L278,182 C274,170 268,158 262,148
        C258,142 254,138 250,134
        C252,160 254,196 256,230
        C258,248 258,262 256,274
        L252,290
        C248,302 240,312 228,318
        C218,322 210,324 200,324
        C190,324 182,322 172,318
        C160,312 152,302 148,290
        L144,274
        C142,262 142,248 144,230
        C146,196 148,160 150,134
        C146,138 142,142 138,148
        C132,158 126,170 122,182
        L114,208 C108,224 104,240 100,254
        L94,276 C92,282 90,286 88,286
        C86,286 85,282 86,276
        L88,264 C90,256 92,246 94,234
        L100,204 C104,184 108,164 114,146
        C120,128 128,114 138,104
        C150,90 172,78 192,72
        Z
      `} />

      {/* Right leg — simple column from hip to foot */}
      <path d={`
        M244,280
        C246,296 248,316 248,332
        L248,360
        C248,380 246,398 244,412
        L240,440
        C238,454 236,468 236,480
        C236,490 238,498 242,504
        L248,510
        C250,512 248,516 244,516
        L218,516
        C214,516 212,512 214,510
        C216,506 218,500 218,494
        L218,480
        C218,466 216,450 214,436
        L210,408
        C208,392 206,376 206,360
        L206,332
        C206,316 208,300 210,288
        C214,296 224,302 236,304
        C240,298 242,290 244,280
        Z
      `} />

      {/* Left leg — simple column from hip to foot */}
      <path d={`
        M156,280
        C158,290 160,298 164,304
        C176,302 186,296 190,288
        C192,300 194,316 194,332
        L194,360
        C194,376 192,392 190,408
        L186,436
        C184,450 182,466 182,480
        L182,494
        C182,500 184,506 186,510
        C188,512 186,516 182,516
        L156,516
        C152,516 150,512 152,510
        L158,504
        C162,498 164,490 164,480
        C164,468 162,454 160,440
        L156,412
        C154,398 152,380 152,360
        L152,332
        C152,316 154,296 156,280
        Z
      `} />
    </g>
  )
}

/* Renders concentric rings for multiple injuries at a single body part */
function InjuryMarker({ x, y, injList, worstColor, worstStroke, isSelected, onClick }) {
  const count = injList.length
  const severityOrder = ['career_threatening', 'severe', 'season_ending', 'major', 'moderate', 'minor']
  const sorted = [...injList].sort((a, b) => {
    const ai = severityOrder.indexOf(a.severity)
    const bi = severityOrder.indexOf(b.severity)
    return ai - bi
  })

  const baseRadius = 12
  const ringSpacing = 5

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Glow behind marker */}
      <circle cx={x} cy={y} r={baseRadius + 6} fill={worstStroke || worstColor} fillOpacity="0.15" />

      {sorted.map((inj, i) => {
        const sev = SEVERITY_COLORS[inj.severity] || SEVERITY_COLORS.minor
        const r = baseRadius + (count - 1 - i) * ringSpacing
        const hasCustomStroke = sev.stroke != null
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill={i === sorted.length - 1 ? sev.color : 'none'}
            fillOpacity={i === sorted.length - 1 ? 0.85 : 0}
            stroke={hasCustomStroke ? sev.stroke : sev.color}
            strokeWidth={hasCustomStroke ? 2 : 2.5}
            opacity={isSelected ? 1 : 0.85}
          />
        )
      })}
      {/* Bright center dot */}
      <circle cx={x} cy={y} r={4} fill={worstStroke || worstColor} opacity="1" />
      {/* Pulse ring when selected */}
      {isSelected && (
        <circle
          cx={x} cy={y}
          r={baseRadius + count * ringSpacing + 2}
          fill="none"
          stroke={worstStroke || worstColor}
          strokeWidth="1.5"
          opacity="0.5"
        >
          <animate attributeName="r" from={baseRadius + count * ringSpacing + 2} to={baseRadius + count * ringSpacing + 14} dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.5" to="0" dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  )
}

export default function InjuryHistory({ injuries }) {
  const [selected, setSelected] = useState(null)

  const hasInjuries = injuries && injuries.length > 0
  const isHealthy = !hasInjuries

  // Group injuries by body part
  const bodyPartInjuries = {}
  if (hasInjuries) {
    for (const inj of injuries) {
      const key = inj.body_part
      if (!bodyPartInjuries[key]) bodyPartInjuries[key] = []
      bodyPartInjuries[key].push(inj)
    }
  }

  const severityOrder = ['career_threatening', 'severe', 'season_ending', 'major', 'moderate', 'minor']
  function worstSeverity(injList) {
    for (const s of severityOrder) {
      if (injList.some(i => i.severity === s)) return s
    }
    return 'minor'
  }

  return (
    <div className="injury-history">
      <div className="injury-grid" style={isHealthy ? { gridTemplateColumns: '1fr', justifyItems: 'center' } : undefined}>
        {/* Body silhouette */}
        <div className="injury-body" style={isHealthy ? { maxWidth: 180 } : undefined}>
          <svg viewBox="60 -2 280 540" className="injury-silhouette" preserveAspectRatio="xMidYMid meet">
            {isHealthy ? (
              <>
                <BodySilhouette fill="#2DD4BF" stroke="#2DD4BF" strokeWidth="0.5" opacity="0.9" />
                <text x="200" y="536" textAnchor="middle" fontSize="16" fill="#2DD4BF" fontWeight="700" letterSpacing="2">
                  HEALTHY
                </text>
              </>
            ) : (
              <>
                <BodySilhouette fill="#242C45" stroke="#3E4766" strokeWidth="1" opacity="0.6" />
                {/* Injury markers */}
                {Object.entries(bodyPartInjuries).map(([partKey, injList]) => {
                  const part = BODY_PARTS[partKey]
                  if (!part) return null
                  const sev = worstSeverity(injList)
                  const sevConfig = SEVERITY_COLORS[sev] || SEVERITY_COLORS.minor
                  return (
                    <InjuryMarker
                      key={partKey}
                      x={part.x}
                      y={part.y}
                      injList={injList}
                      worstColor={sevConfig.color}
                      worstStroke={sevConfig.stroke}
                      isSelected={selected === partKey}
                      onClick={() => setSelected(partKey === selected ? null : partKey)}
                    />
                  )
                })}
              </>
            )}
          </svg>
        </div>

        {/* Injury list (only when injuries exist) */}
        {hasInjuries && (
          <div className="injury-list">
            {[...injuries].sort((a, b) => new Date(b.injury_date || 0) - new Date(a.injury_date || 0)).map((inj, i) => {
              const sev = SEVERITY_COLORS[inj.severity] || SEVERITY_COLORS.minor
              const isItemSelected = selected === inj.body_part
              return (
                <div
                  key={i}
                  className={`injury-item ${isItemSelected ? 'injury-item-selected' : ''}`}
                  style={{ borderLeftColor: sev.stroke || sev.color, background: isItemSelected ? sev.bg : 'transparent' }}
                  onClick={() => setSelected(inj.body_part === selected ? null : inj.body_part)}
                >
                  <div className="injury-item-header">
                    <span className="injury-part">{BODY_PARTS[inj.body_part]?.label || inj.body_part}</span>
                    <span className="injury-severity" style={{ color: sev.stroke || sev.color }}>{sev.label}</span>
                  </div>
                  <div className="injury-item-meta">
                    {inj.injury_date && <span>{inj.injury_date}</span>}
                    {inj.games_missed != null && <span>{inj.games_missed} games missed</span>}
                    {inj.status && <span className={`injury-status injury-status-${inj.status}`}>{inj.status}</span>}
                  </div>
                  {inj.notes && <div className="injury-notes">{inj.notes}</div>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Severity legend */}
      {hasInjuries && (
        <div className="injury-legend">
          {Object.entries(SEVERITY_COLORS)
            .filter(([key]) => key !== 'season_ending')
            .map(([key, sev]) => (
              <span key={key} className="injury-legend-item">
                <span
                  className="injury-legend-dot"
                  style={{
                    background: sev.color,
                    border: sev.stroke ? `2px solid ${sev.stroke}` : 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {sev.label}
              </span>
            ))}
        </div>
      )}
    </div>
  )
}

export { BODY_PARTS, SEVERITY_COLORS }
