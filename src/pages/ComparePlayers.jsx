import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TierBadge from '../components/TierBadge'
import BucketBadge from '../components/BucketBadge'
import CompareRadar from '../components/CompareRadar'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444']

const STAT_FIELDS = [
  { key: 'ppg', label: 'PPG', fmt: v => v?.toFixed(1) },
  { key: 'rpg', label: 'RPG', fmt: v => v?.toFixed(1) },
  { key: 'apg', label: 'APG', fmt: v => v?.toFixed(1) },
  { key: 'spg', label: 'SPG', fmt: v => v?.toFixed(1) },
  { key: 'bpg', label: 'BPG', fmt: v => v?.toFixed(1) },
  { key: 'mpg', label: 'MPG', fmt: v => v?.toFixed(1) },
  { key: 'fg_pct', label: 'FG%', fmt: v => v != null ? (v * 100).toFixed(1) + '%' : null },
  { key: 'three_pt_pct', label: '3P%', fmt: v => v != null ? (v * 100).toFixed(1) + '%' : null },
  { key: 'ft_pct', label: 'FT%', fmt: v => v != null ? (v * 100).toFixed(1) + '%' : null },
  { key: 'ts_pct', label: 'TS%', fmt: v => v != null ? (v * 100).toFixed(1) + '%' : null },
  { key: 'usg', label: 'USG', fmt: v => v != null ? (v * 100).toFixed(1) + '%' : null },
  { key: 'per', label: 'PER', fmt: v => v?.toFixed(1) },
  { key: 'bpm', label: 'BPM', fmt: v => v?.toFixed(1) },
  { key: 'ws', label: 'WS', fmt: v => v?.toFixed(1) },
]

const SCORE_FIELDS = [
  { key: 'raus_final', label: 'RAUS Final', src: 'raus' },
  { key: 'star_index', label: 'Star Index', src: 'raus' },
  { key: 'raus_base', label: 'RAUS Base', src: 'raus' },
  { key: 'raus_weighted', label: 'RAUS Weighted', src: 'raus' },
  { key: 'ppi_auto', label: 'PPI', src: 'raus' },
  { key: 'ssa_auto_final', label: 'SSA', src: 'ssa' },
  { key: 'ssa_age_adjusted', label: 'SSA (Age-Adj)', src: 'master' },
  { key: 'composite_score', label: 'Composite', src: 'master' },
]

export default function ComparePlayers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [allPlayers, setAllPlayers] = useState([])
  const [playerData, setPlayerData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const selectedIds = (searchParams.get('ids') || '').split(',').filter(Boolean)

  // Load all players for the picker
  useEffect(() => {
    supabase.from('master_board').select('player_id, display_name, primary_bucket, overall_rank')
      .order('overall_rank')
      .then(({ data }) => setAllPlayers(data || []))
  }, [])

  // Load full data for selected players
  useEffect(() => {
    if (selectedIds.length === 0) { setPlayerData([]); setLoading(false); return }

    async function loadAll() {
      setLoading(true)
      const results = await Promise.all(selectedIds.map(async (pid) => {
        const [
          { data: player },
          { data: raus },
          { data: ssa },
          { data: master },
          { data: dna },
          { data: stats },
          { data: derived },
          { data: prospect },
          { data: measurables },
        ] = await Promise.all([
          supabase.from('players').select('*').eq('player_id', pid).single(),
          supabase.from('raus_scores').select('*').eq('player_id', pid).single(),
          supabase.from('ssa_scores').select('*').eq('player_id', pid).single(),
          supabase.from('master_board').select('*').eq('player_id', pid).single(),
          supabase.from('dna_scores').select('*').eq('player_id', pid).single(),
          supabase.from('stats').select('*').eq('player_id', pid).order('season', { ascending: false }).limit(1),
          supabase.from('derived_metrics').select('*').eq('player_id', pid).single(),
          supabase.from('prospects').select('*').eq('player_id', pid).single(),
          supabase.from('measurables').select('*').eq('player_id', pid).single(),
        ])
        return {
          player_id: pid,
          name: player?.display_name || pid,
          player, raus, ssa, master, dna,
          stats: stats?.[0] || null,
          derived, prospect, measurables,
        }
      }))
      setPlayerData(results)
      setLoading(false)
    }
    loadAll()
  }, [searchParams.get('ids')])

  function addPlayer(pid) {
    if (selectedIds.includes(pid) || selectedIds.length >= 4) return
    setSearchParams({ ids: [...selectedIds, pid].join(',') })
  }

  function removePlayer(pid) {
    setSearchParams({ ids: selectedIds.filter(id => id !== pid).join(',') })
  }

  const filteredPicker = allPlayers.filter(p =>
    !selectedIds.includes(p.player_id) &&
    (!search || p.display_name?.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 15)

  // Find leader for each stat (highest value)
  function isLeader(key, pidx) {
    const vals = playerData.map(p => p.stats?.[key])
    if (vals.every(v => v == null)) return false
    const max = Math.max(...vals.filter(v => v != null))
    return playerData[pidx]?.stats?.[key] === max && vals.filter(v => v === max).length === 1
  }

  function isScoreLeader(key, src, pidx) {
    const vals = playerData.map(p => {
      const obj = src === 'raus' ? p.raus : src === 'ssa' ? p.ssa : p.master
      return obj?.[key]
    })
    if (vals.every(v => v == null)) return false
    const max = Math.max(...vals.filter(v => v != null))
    return vals[pidx] === max && vals.filter(v => v === max).length === 1
  }

  return (
    <div className="cmp-container">
      <div className="sc-nav">
        <button className="sc-back" onClick={() => navigate('/')}>&larr; Big Board</button>
      </div>

      <h1 className="cmp-title">Player Comparison</h1>

      {/* Player picker */}
      <div className="cmp-picker">
        <div className="cmp-selected">
          {playerData.map((p, i) => (
            <div key={p.player_id} className="cmp-chip" style={{ borderColor: COLORS[i] }}>
              <span className="cmp-chip-dot" style={{ background: COLORS[i] }} />
              <span>{p.name}</span>
              <button className="cmp-chip-x" onClick={() => removePlayer(p.player_id)}>&times;</button>
            </div>
          ))}
          {selectedIds.length === 0 && <span className="cmp-hint">Select 2-4 players to compare</span>}
        </div>
        {selectedIds.length < 4 && (
          <div className="cmp-search-wrap">
            <input
              className="cmp-search"
              placeholder="Search player to add..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <div className="cmp-dropdown">
                {filteredPicker.map(p => (
                  <div key={p.player_id} className="cmp-dropdown-item" onClick={() => { addPlayer(p.player_id); setSearch('') }}>
                    <span className="cmp-dropdown-rank">#{p.overall_rank}</span>
                    <span>{p.display_name}</span>
                    <BucketBadge bucket={p.primary_bucket} />
                  </div>
                ))}
                {filteredPicker.length === 0 && <div className="cmp-dropdown-empty">No matches</div>}
              </div>
            )}
          </div>
        )}
      </div>

      {loading && selectedIds.length > 0 && <div className="bb-loading">Loading comparison...</div>}

      {playerData.length >= 2 && !loading && (
        <>
          {/* Header cards */}
          <div className="cmp-headers" style={{ gridTemplateColumns: `repeat(${playerData.length}, 1fr)` }}>
            {playerData.map((p, i) => (
              <div key={p.player_id} className="cmp-header-card" style={{ borderTopColor: COLORS[i] }}>
                <div className="cmp-header-rank" style={{ color: COLORS[i] }}>#{p.master?.overall_rank}</div>
                <h3 className="cmp-header-name" onClick={() => navigate(`/player/${p.player_id}`)}>{p.name}</h3>
                <div className="cmp-header-meta">
                  <BucketBadge bucket={p.player?.primary_bucket} />
                  <span className="cmp-header-arch">{p.player?.style_archetype}</span>
                </div>
                <div className="cmp-header-bio">
                  {p.prospect?.height && <span>{Math.floor(p.prospect.height / 12)}'{p.prospect.height % 12}"</span>}
                  {p.prospect?.weight && <span>{p.prospect.weight} lbs</span>}
                  {p.prospect?.class && <span className="sc-class">{p.prospect.class.toUpperCase()}</span>}
                </div>
                <TierBadge tier={p.master?.tier} />
              </div>
            ))}
          </div>

          {/* Overlaid radar */}
          <div className="cmp-card">
            <h3 className="sc-section-title">RAUS Skill Overlay</h3>
            <CompareRadar
              players={playerData.map(p => ({ name: p.name, raus: p.raus }))}
              height={360}
            />
          </div>

          {/* Score comparison table */}
          <div className="cmp-card">
            <h3 className="sc-section-title">Scores</h3>
            <table className="cmp-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {playerData.map((p, i) => (
                    <th key={i} style={{ color: COLORS[i] }}>{p.name.split(' ').pop()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCORE_FIELDS.map(f => (
                  <tr key={f.key}>
                    <td className="cmp-stat-label">{f.label}</td>
                    {playerData.map((p, i) => {
                      const obj = f.src === 'raus' ? p.raus : f.src === 'ssa' ? p.ssa : p.master
                      const val = obj?.[f.key]
                      return (
                        <td key={i} className={isScoreLeader(f.key, f.src, i) ? 'cmp-leader' : ''}>
                          {val?.toFixed(2) ?? '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stat comparison table */}
          <div className="cmp-card">
            <h3 className="sc-section-title">Season Stats</h3>
            <table className="cmp-table">
              <thead>
                <tr>
                  <th>Stat</th>
                  {playerData.map((p, i) => (
                    <th key={i} style={{ color: COLORS[i] }}>{p.name.split(' ').pop()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAT_FIELDS.map(f => (
                  <tr key={f.key}>
                    <td className="cmp-stat-label">{f.label}</td>
                    {playerData.map((p, i) => {
                      const val = p.stats?.[f.key]
                      return (
                        <td key={i} className={isLeader(f.key, i) ? 'cmp-leader' : ''}>
                          {val != null ? f.fmt(val) : '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Derived metrics comparison */}
          <div className="cmp-card">
            <h3 className="sc-section-title">Derived Metrics</h3>
            <table className="cmp-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {playerData.map((p, i) => (
                    <th key={i} style={{ color: COLORS[i] }}>{p.name.split(' ').pop()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="cmp-stat-label">LCI</td>
                  {playerData.map((p, i) => (
                    <td key={i}>{p.derived?.lci?.toFixed(2) ?? '—'}</td>
                  ))}
                </tr>
                <tr>
                  <td className="cmp-stat-label">SFR</td>
                  {playerData.map((p, i) => (
                    <td key={i}>
                      {p.derived?.sfr?.toFixed(2) ?? '—'}
                      {p.derived?.sfr_label && <span className={`cmp-badge sc-sfr-${p.derived.sfr_label.toLowerCase()}`}>{p.derived.sfr_label}</span>}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="cmp-stat-label">WS-H Factor</td>
                  {playerData.map((p, i) => (
                    <td key={i}>{p.derived?.wsh_factor?.toFixed(2) ?? '—'}</td>
                  ))}
                </tr>
                <tr>
                  <td className="cmp-stat-label">FT% Projection</td>
                  {playerData.map((p, i) => (
                    <td key={i}>{p.derived?.ft_pct_label ?? '—'}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* DNA archetype comparison */}
          <div className="cmp-card">
            <h3 className="sc-section-title">DNA Archetypes</h3>
            <div className="cmp-dna-grid" style={{ gridTemplateColumns: `repeat(${playerData.length}, 1fr)` }}>
              {playerData.map((p, i) => {
                const d = p.dna
                if (!d) return <div key={i} className="cmp-dna-col">No DNA data</div>
                const archetypes = [
                  { name: 'King', score: d.king_score }, { name: 'Klaw', score: d.klaw_score },
                  { name: 'Air', score: d.air_score }, { name: 'Reaper', score: d.reaper_score },
                  { name: 'Wilt', score: d.wilt_score }, { name: 'PointGod', score: d.pointgod_score },
                  { name: 'Brow', score: d.brow_score }, { name: 'Beard', score: d.beard_score },
                  { name: 'Chef', score: d.chef_score }, { name: 'Joker', score: d.joker_score },
                  { name: 'Diesel', score: d.diesel_score },
                ].filter(a => a.score != null).sort((a, b) => b.score - a.score)

                return (
                  <div key={i} className="cmp-dna-col">
                    <div className="cmp-dna-name" style={{ color: COLORS[i] }}>{p.name.split(' ').pop()}</div>
                    {archetypes.slice(0, 3).map(a => (
                      <div key={a.name} className="cmp-dna-row">
                        <span className="cmp-dna-arch">{a.name}</span>
                        <div className="cmp-dna-bar-bg">
                          <div className="cmp-dna-bar" style={{ width: `${a.score}%`, background: COLORS[i] }} />
                        </div>
                        <span className="cmp-dna-score">{a.score}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
