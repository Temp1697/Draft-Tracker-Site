const ARCHETYPES = [
  { key: 'king_score', label: 'King', icon: 'LBJ', comp: 'king_components' },
  { key: 'klaw_score', label: 'Klaw', icon: 'KL', comp: 'klaw_components' },
  { key: 'air_score', label: 'Air', icon: 'MJ', comp: 'air_components' },
  { key: 'reaper_score', label: 'Reaper', icon: 'KD', comp: 'reaper_components' },
  { key: 'wilt_score', label: 'Wilt', icon: 'WC', comp: 'wilt_components' },
  { key: 'pointgod_score', label: 'PointGod', icon: 'CP', comp: 'pointgod_components' },
  { key: 'brow_score', label: 'Brow', icon: 'AD', comp: 'brow_components' },
  { key: 'beard_score', label: 'Beard', icon: 'JH', comp: 'beard_components' },
  { key: 'chef_score', label: 'Chef', icon: 'SC', comp: 'chef_components' },
  { key: 'joker_score', label: 'Joker', icon: 'NJ', comp: 'joker_components' },
  { key: 'diesel_score', label: 'Diesel', icon: 'SO', comp: 'diesel_components' },
]

function scoreColor(score) {
  if (score == null) return { bg: '#1e293b', text: '#475569', border: '#334155' }
  if (score >= 80) return { bg: '#7c3aed', text: '#fff', border: '#7c3aed' }
  if (score >= 70) return { bg: '#2563eb', text: '#fff', border: '#2563eb' }
  if (score >= 60) return { bg: '#1e293b', text: '#60a5fa', border: '#3b82f6' }
  return { bg: '#1e293b', text: '#475569', border: '#334155' }
}

function ComponentBar({ components }) {
  if (!components) return null
  const entries = [
    { label: 'C1', val: components.c1 },
    { label: 'C2', val: components.c2 },
    { label: 'C3', val: components.c3 },
    { label: 'C4', val: components.c4 },
    { label: 'C5', val: components.c5 },
  ]

  return (
    <div className="dna-components">
      {entries.map(({ label, val }) => (
        <div key={label} className="dna-comp-item">
          <div className="dna-comp-bar-track">
            <div
              className="dna-comp-bar-fill"
              style={{ height: `${(val ?? 0) / 20 * 100}%` }}
            />
          </div>
          <span className="dna-comp-val">{val ?? 0}</span>
        </div>
      ))}
    </div>
  )
}

export default function DNAProfile({ dna }) {
  if (!dna) return <div className="sc-section-empty">No DNA data available</div>

  // Sort by score descending, filter out nulls
  const ranked = ARCHETYPES
    .map(a => ({ ...a, score: dna[a.key], components: dna[a.comp] }))
    .filter(a => a.score != null)
    .sort((a, b) => b.score - a.score)

  const top3 = ranked.slice(0, 3)
  const rest = ranked.slice(3)

  return (
    <div className="dna-profile">
      {dna.primary_archetype && (
        <div className="dna-headline">
          <span className="dna-primary">{dna.primary_archetype}</span>
          {dna.secondary_archetype && (
            <span className="dna-secondary"> / {dna.secondary_archetype}</span>
          )}
        </div>
      )}

      <div className="dna-top-grid">
        {top3.map(a => {
          const colors = scoreColor(a.score)
          return (
            <div key={a.key} className="dna-card" style={{ borderColor: colors.border }}>
              <div className="dna-card-header">
                <span className="dna-archetype-name">{a.label}</span>
                <span className="dna-score" style={{ backgroundColor: colors.bg, color: colors.text }}>
                  {a.score}
                </span>
              </div>
              <ComponentBar components={a.components} />
            </div>
          )
        })}
      </div>

      {rest.length > 0 && (
        <div className="dna-rest">
          {rest.map(a => {
            const colors = scoreColor(a.score)
            return (
              <div key={a.key} className="dna-rest-item">
                <span className="dna-rest-name">{a.label}</span>
                <span className="dna-rest-score" style={{ color: colors.text }}>{a.score}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
