import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TierBadge from '../components/TierBadge'
import BucketBadge from '../components/BucketBadge'

const SORTABLE_COLS = [
  { key: 'overall_rank', label: '#' },
  { key: 'display_name', label: 'Name' },
  { key: 'primary_bucket', label: 'Pos' },
  { key: 'style_archetype', label: 'Archetype' },
  { key: 'raus_final', label: 'RAUS' },
  { key: 'ssa', label: 'SSA' },
  { key: 'aaa', label: 'AAA' },
  { key: 'oai', label: 'OAI' },
  { key: 'composite_score', label: 'Comp' },
  { key: 'tier', label: 'Tier' },
]

const ALL_TIERS = [
  'Tier 1 — Generational', 'Tier 2 — Franchise', 'Tier 3 — All-Star',
  'Tier 4 — High-End Starter', 'Tier 3 — High-End Starter',
  'Tier 5 — Rotation', 'Tier 6 — Development', 'Tier 7 — Longshot',
]

function scoreCell(val, highlight) {
  if (val == null) return <span style={{ color: '#9ca3af' }}>—</span>
  const formatted = typeof val === 'number' ? val.toFixed(2) : val
  return <span style={{ fontWeight: highlight ? 600 : 400 }}>{formatted}</span>
}

export default function BigBoard() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState('overall_rank')
  const [sortAsc, setSortAsc] = useState(true)
  const [bucketFilter, setBucketFilter] = useState('All')
  const [tierFilter, setTierFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [compareIds, setCompareIds] = useState([])
  const [draftClassFilter, setDraftClassFilter] = useState('current')
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      // Fetch board data joined with player draft status
      const [{ data, error }, { data: playerData }] = await Promise.all([
        supabase.from('master_board').select('*').order('composite_score', { ascending: false, nullsFirst: false }),
        supabase.from('players').select('player_id, draft_class, draft_status'),
      ])

      if (error) { console.error(error); setLoading(false); return }

      // Merge draft info into board data
      const draftMap = new Map((playerData || []).map(p => [p.player_id, p]))
      const merged = (data || []).map(b => ({
        ...b,
        draft_class: draftMap.get(b.player_id)?.draft_class || '2026',
        draft_status: draftMap.get(b.player_id)?.draft_status || 'prospect',
      }))

      setPlayers(merged)
      setLoading(false)
    }
    load()
  }, [])

  // Derive available archetypes from current data
  const archetypes = useMemo(() => {
    const set = new Set(players.map(p => p.style_archetype).filter(Boolean))
    return ['All', ...Array.from(set).sort()]
  }, [players])

  const [archetypeFilter, setArchetypeFilter] = useState('All')

  // Derive available draft classes
  const draftClasses = useMemo(() => {
    const set = new Set(players.map(p => p.draft_class).filter(Boolean))
    return Array.from(set).sort().reverse()
  }, [players])

  // Filter and sort
  const filtered = useMemo(() => {
    let list = players

    // Draft class filter — "current" shows only active prospects
    if (draftClassFilter === 'current') {
      list = list.filter(p => p.draft_status === 'prospect' || !p.draft_status)
    } else if (draftClassFilter !== 'All') {
      list = list.filter(p => p.draft_class === draftClassFilter)
    }

    if (bucketFilter !== 'All') {
      list = list.filter(p => p.primary_bucket === bucketFilter)
    }
    if (tierFilter !== 'All') {
      list = list.filter(p => p.tier === tierFilter)
    }
    if (archetypeFilter !== 'All') {
      list = list.filter(p => p.style_archetype === archetypeFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p => p.display_name?.toLowerCase().includes(q))
    }

    const sorted = [...list].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (av == null) av = sortAsc ? Infinity : -Infinity
      if (bv == null) bv = sortAsc ? Infinity : -Infinity
      if (typeof av === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortAsc ? av - bv : bv - av
    })

    return sorted
  }, [players, draftClassFilter, bucketFilter, tierFilter, archetypeFilter, search, sortKey, sortAsc])

  function handleSort(key) {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(key === 'overall_rank' || key === 'display_name' || key === 'primary_bucket')
    }
  }

  const tierOptions = useMemo(() => {
    const present = new Set(players.map(p => p.tier).filter(Boolean))
    return ['All', ...ALL_TIERS.filter(t => present.has(t))]
  }, [players])

  if (loading) {
    return <div className="bb-loading">Loading Big Board...</div>
  }

  return (
    <div className="bb-container">
      <div className="bb-header">
        <h1>Big Board</h1>
        <span className="bb-count">{filtered.length} of {players.length} prospects</span>
        <button className="bb-dash-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
        <button className="bb-dash-btn" onClick={() => navigate('/draft-results')}>Draft Results</button>
        <button className="bb-dash-btn" onClick={() => navigate('/archive')}>Archive</button>
        <button className="bb-dash-btn" style={{ background: 'rgba(168,85,247,0.15)', borderColor: '#a855f7', color: '#c084fc' }} onClick={() => navigate('/mock-draft')}>Mock Draft</button>
        {compareIds.length >= 2 && (
          <button className="bb-compare-btn" onClick={() => navigate(`/compare?ids=${compareIds.join(',')}`)}>
            Compare ({compareIds.length})
          </button>
        )}
        <button className="bb-add-btn" onClick={() => navigate('/player/new')}>+ Add Player</button>
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
        <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="bb-select">
          {tierOptions.map(t => <option key={t} value={t}>{t === 'All' ? 'All Tiers' : t.replace(/Tier \d — /, '')}</option>)}
        </select>
        <select value={archetypeFilter} onChange={e => setArchetypeFilter(e.target.value)} className="bb-select">
          {archetypes.map(a => <option key={a} value={a}>{a === 'All' ? 'All Archetypes' : a}</option>)}
        </select>
        <select value={draftClassFilter} onChange={e => setDraftClassFilter(e.target.value)} className="bb-select">
          <option value="current">Active Prospects</option>
          <option value="All">All Classes</option>
          {draftClasses.map(c => <option key={c} value={c}>{c} Class</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bb-table-wrap">
        <table className="bb-table">
          <colgroup>
            <col style={{ width: 36 }} />
            <col className="col-rank" />
            <col className="col-name" />
            <col className="col-pos" />
            <col className="col-archetype" />
            <col className="col-score" />
            <col className="col-score" />
            <col className="col-score" />
            <col className="col-score" />
            <col className="col-comp" />
            <col className="col-tier" />
          </colgroup>
          <thead>
            <tr>
              <th style={{ width: 36 }}></th>
              {SORTABLE_COLS.map(col => (
                <th
                  key={col.key}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort(col.key)}
                  className={sortKey === col.key ? 'bb-sorted' : ''}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="bb-sort-arrow">{sortAsc ? ' \u25B2' : ' \u25BC'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.player_id} className={i % 2 === 0 ? 'bb-row-even' : ''} onClick={() => navigate(`/player/${p.player_id}`)}>
                <td className="bb-check" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={compareIds.includes(p.player_id)}
                    disabled={!compareIds.includes(p.player_id) && compareIds.length >= 4}
                    onChange={e => {
                      if (e.target.checked) setCompareIds(prev => [...prev, p.player_id])
                      else setCompareIds(prev => prev.filter(id => id !== p.player_id))
                    }}
                  />
                </td>
                <td className="bb-rank">{p.overall_rank}</td>
                <td className="bb-name">
                  {p.display_name}
                  {p.dna_flag && <span className="bb-dna" title={`DNA Max: ${p.dna_max}`}> DNA</span>}
                </td>
                <td><BucketBadge bucket={p.primary_bucket} /></td>
                <td className="bb-archetype">{p.style_archetype || '—'}</td>
                <td className="bb-num">{scoreCell(p.raus_final, true)}</td>
                <td className="bb-num">{scoreCell(p.ssa)}</td>
                <td className="bb-num">{scoreCell(p.aaa)}</td>
                <td className="bb-num">{scoreCell(p.oai)}</td>
                <td className="bb-num bb-comp">{scoreCell(p.composite_score)}</td>
                <td><TierBadge tier={p.tier} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={SORTABLE_COLS.length + 1} className="bb-empty">No players match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
