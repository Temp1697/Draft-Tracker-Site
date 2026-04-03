import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TierBadge from '../components/TierBadge'
import BucketBadge from '../components/BucketBadge'
import { compositeTier, RAUS_TIERS } from '../lib/tiers'
import { recalculateAll } from '../lib/engine/index'

/* ── Draft class metadata ── */
const DRAFT_CLASSES = [
  { year: '1984', label: '1984 NBA Draft', tagline: 'Featuring Michael Jordan, Hakeem Olajuwon, Charles Barkley, John Stockton' },
  { year: '1987', label: '1987 NBA Draft', tagline: 'Featuring David Robinson, Scottie Pippen, Reggie Miller, Horace Grant' },
  { year: '1996', label: '1996 NBA Draft', tagline: 'Featuring Allen Iverson, Kobe Bryant, Steve Nash, Ray Allen' },
  { year: '1998', label: '1998 NBA Draft', tagline: 'Featuring Dirk Nowitzki, Paul Pierce, Vince Carter, Antawn Jamison' },
  { year: '2003', label: '2003 NBA Draft', tagline: 'Featuring LeBron James, Carmelo Anthony, Chris Bosh, Dwyane Wade' },
  { year: '2008', label: '2008 NBA Draft', tagline: 'Featuring Derrick Rose, Russell Westbrook, Kevin Love, Brook Lopez' },
  { year: '2009', label: '2009 NBA Draft', tagline: 'Featuring Blake Griffin, James Harden, Stephen Curry, DeMar DeRozan' },
  { year: '2011', label: '2011 NBA Draft', tagline: 'Featuring Kyrie Irving, Klay Thompson, Kawhi Leonard, Kemba Walker' },
  { year: '2012', label: '2012 NBA Draft', tagline: 'Featuring Anthony Davis, Damian Lillard, Bradley Beal, Andre Drummond' },
  { year: '2018', label: '2018 NBA Draft', tagline: 'Featuring Luka Doncic, Trae Young, Shai Gilgeous-Alexander, Jaren Jackson Jr' },
  { year: '2020', label: '2020 NBA Draft', tagline: 'Featuring Anthony Edwards, LaMelo Ball, Tyrese Haliburton, Jalen Suggs' },
]

const SORTABLE_COLS = [
  { key: 'overall_rank', label: '#' },
  { key: 'display_name', label: 'Name' },
  { key: 'primary_bucket', label: 'Pos' },
  { key: 'style_archetype', label: 'Archetype' },
  { key: 'raus_final', label: 'RAUS' },
  { key: 'ssa', label: 'SSA' },
  { key: 'composite_score', label: 'Comp' },
  { key: 'tier', label: 'Tier' },
  { key: 'actual_pick', label: 'Actual Pick' },
  { key: 'nba_outcome', label: 'NBA Outcome' },
  { key: 'career_ppg', label: 'Career PPG' },
]

const ALL_TIERS = RAUS_TIERS.map(t => t.label)

function scoreCell(val) {
  if (val == null) return <span style={{ color: '#9ca3af' }}>--</span>
  const formatted = typeof val === 'number' ? val.toFixed(2) : val
  return <span>{formatted}</span>
}

function outcomeColor(outcome) {
  const colors = {
    'MVP': '#DFFF00',
    'All-NBA': '#2DD4BF',
    'All-Star': '#34D399',
    'Starter': '#60A5FA',
    'Role Player': '#94A3B8',
    'Rotation': '#94A3B8',
    'Bench': '#FBBF24',
    'Out of League': '#F87171',
    'Bust': '#EF4444',
  }
  return colors[outcome] || '#94A3B8'
}

export default function LegendaryArchives() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedYear = searchParams.get('year') || '1984'
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState('overall_rank')
  const [sortAsc, setSortAsc] = useState(true)
  const [bucketFilter, setBucketFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [recalculating, setRecalculating] = useState(false)
  const [recalcMsg, setRecalcMsg] = useState('')
  const navigate = useNavigate()

  const selectedClass = DRAFT_CLASSES.find(c => c.year === selectedYear) || DRAFT_CLASSES[0]

  useEffect(() => {
    async function load() {
      setLoading(true)

      // Fetch board data for this draft class
      const [{ data: boardData }, { data: playerData }] = await Promise.all([
        supabase.from('master_board').select('*'),
        supabase.from('players').select('player_id, draft_class, draft_pick, draft_team, draft_status'),
      ])

      // Build draft info map
      const draftMap = new Map((playerData || []).map(p => [p.player_id, p]))

      // Filter to this draft class
      const classPlayers = (boardData || [])
        .map(b => ({
          ...b,
          draft_class: draftMap.get(b.player_id)?.draft_class,
          draft_pick: draftMap.get(b.player_id)?.draft_pick,
          draft_team: draftMap.get(b.player_id)?.draft_team,
        }))
        .filter(b => b.draft_class === selectedYear)

      // Fetch actual NBA outcomes from historical_players
      const names = classPlayers.map(p => p.display_name?.toLowerCase())
      const { data: historicalData } = await supabase
        .from('historical_players')
        .select('name, draft_pick, nba_outcome_label, nba_ppg_first4, draft_year')
        .eq('draft_year', parseInt(selectedYear))

      const histMap = new Map()
      for (const h of (historicalData || [])) {
        histMap.set(h.name?.toLowerCase(), h)
      }

      // Merge actual outcomes
      const merged = classPlayers.map(p => {
        const hist = histMap.get(p.display_name?.toLowerCase())
        return {
          ...p,
          actual_pick: p.draft_pick || hist?.draft_pick,
          nba_outcome: hist?.nba_outcome_label || null,
          career_ppg: hist?.nba_ppg_first4 || null,
        }
      })

      // Sort by composite_score descending, assign rank within class
      merged.sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
      merged.forEach((p, i) => { p.class_rank = i + 1 })

      setPlayers(merged)
      setLoading(false)
    }
    load()
  }, [selectedYear])

  const filtered = useMemo(() => {
    let list = players
    if (bucketFilter !== 'All') list = list.filter(p => p.primary_bucket === bucketFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p => p.display_name?.toLowerCase().includes(q))
    }

    const sorted = [...list].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (sortKey === 'overall_rank') { av = a.class_rank; bv = b.class_rank }
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortAsc ? av - bv : bv - av
    })

    return sorted
  }, [players, bucketFilter, search, sortKey, sortAsc])

  function handleSort(key) {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(key === 'overall_rank' || key === 'display_name' || key === 'actual_pick')
    }
  }

  async function handleRecalculate() {
    setRecalculating(true)
    setRecalcMsg('Starting recalculation...')
    try {
      const result = await recalculateAll((msg) => setRecalcMsg(msg))
      if (result.success) {
        setRecalcMsg('Recalculation complete! Reloading...')
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setRecalcMsg(`Errors: ${result.errors.join(', ')}`)
      }
    } catch (err) {
      setRecalcMsg(`Error: ${err.message}`)
    }
    setRecalculating(false)
  }

  return (
    <div className="bb-container">
      <div className="bb-header">
        <h1>Legendary Draft Archives</h1>
        <button className="bb-dash-btn" onClick={() => navigate('/')}>Big Board</button>
        <button className="bb-dash-btn" onClick={() => navigate('/historical')}>Historical DB</button>
        <button
          className="bb-dash-btn"
          style={{ background: 'rgba(223,255,0,0.1)', borderColor: '#DFFF00', color: '#DFFF00' }}
          onClick={handleRecalculate}
          disabled={recalculating}
        >
          {recalculating ? 'Recalculating...' : 'Recalculate All'}
        </button>
      </div>

      {recalcMsg && (
        <div style={{ padding: '8px 16px', background: '#1C2236', color: '#60A5FA', fontSize: 12, marginBottom: 8 }}>
          {recalcMsg}
        </div>
      )}

      {/* Draft class selector */}
      <div className="la-class-selector">
        {DRAFT_CLASSES.map(c => (
          <button
            key={c.year}
            className={`la-class-tab ${selectedYear === c.year ? 'la-class-tab-active' : ''}`}
            onClick={() => setSearchParams({ year: c.year })}
          >
            {c.year}
          </button>
        ))}
      </div>

      {/* Draft class header */}
      <div className="la-class-header">
        <h2>{selectedClass.label}</h2>
        <p>{selectedClass.tagline}</p>
        <span className="la-class-count">{filtered.length} players</span>
      </div>

      {/* Filters */}
      <div className="bb-filters">
        <input
          type="text"
          placeholder="Search player..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bb-search"
        />
        <select value={bucketFilter} onChange={e => setBucketFilter(e.target.value)} className="bb-select">
          <option value="All">All Positions</option>
          <option value="Guard">Guards</option>
          <option value="Wing">Wings</option>
          <option value="Big">Bigs</option>
        </select>
      </div>

      {loading ? (
        <div className="bb-loading">Loading {selectedClass.label}...</div>
      ) : filtered.length === 0 ? (
        <div className="bb-loading" style={{ color: '#666' }}>
          No players found for {selectedClass.label}. Data may not be populated yet.
        </div>
      ) : (
        <table className="bb-table">
          <thead>
            <tr>
              {SORTABLE_COLS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="bb-th"
                >
                  {col.label}
                  {sortKey === col.key && (sortAsc ? ' \u25B2' : ' \u25BC')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const ct = compositeTier(p.composite_score)
              return (
                <tr
                  key={p.player_id}
                  className="bb-row"
                  onClick={() => navigate(`/player/${p.player_id}`)}
                >
                  <td className="bb-rank">{p.class_rank}</td>
                  <td className="bb-name">
                    {p.display_name?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </td>
                  <td><BucketBadge bucket={p.primary_bucket} /></td>
                  <td className="bb-arch">{p.style_archetype || '--'}</td>
                  <td>{scoreCell(p.raus_final)}</td>
                  <td>{scoreCell(p.ssa)}</td>
                  <td style={{ fontWeight: 600 }}>{scoreCell(p.composite_score)}</td>
                  <td>{ct ? <TierBadge label={ct.label} color={ct.color} /> : '--'}</td>
                  <td className="bb-actual">
                    {p.actual_pick ? (
                      <span>#{p.actual_pick}{p.draft_team ? ` ${p.draft_team}` : ''}</span>
                    ) : '--'}
                  </td>
                  <td>
                    {p.nba_outcome ? (
                      <span
                        className="la-outcome-badge"
                        style={{ background: outcomeColor(p.nba_outcome) + '20', color: outcomeColor(p.nba_outcome), borderColor: outcomeColor(p.nba_outcome) + '40' }}
                      >
                        {p.nba_outcome}
                      </span>
                    ) : '--'}
                  </td>
                  <td>{p.career_ppg != null ? Number(p.career_ppg).toFixed(1) : '--'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
