import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { generateAllComps } from '../lib/generateComps'

const POSITIONS = ['Guard', 'Wing', 'Big']
const CLASS_YEARS = ['fr', 'so', 'jr', 'sr', 'hs', 'intl']
const OUTCOME_LABELS = ['All-NBA', 'All-Star', 'Starter', 'Rotation', 'Bench', 'Bust', 'Legend', 'TBD']

const SORTABLE_COLS = [
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'draft_year', label: 'Year', type: 'number' },
  { key: 'draft_pick', label: 'Pick', type: 'number' },
  { key: 'position', label: 'Pos', type: 'string' },
  { key: 'college_team', label: 'College', type: 'string' },
  { key: 'age_at_draft', label: 'Age', type: 'number' },
  { key: 'height', label: 'Ht', type: 'number' },
  { key: 'wingspan', label: 'WS', type: 'number' },
  { key: 'oai_estimate', label: 'OAI', type: 'number' },
  { key: 'ssa_estimate', label: 'SSA', type: 'number' },
  { key: 'scr_estimate', label: 'SCR', type: 'number' },
  { key: 'sci_estimate', label: 'SCI', type: 'number' },
  { key: 'nba_ppg_first4', label: 'PPG', type: 'number' },
  { key: 'rpg_first4', label: 'RPG', type: 'number' },
  { key: 'apg_first4', label: 'APG', type: 'number' },
  { key: 'per_first4', label: 'PER', type: 'number' },
  { key: 'nba_ws48_first4', label: 'WS/48', type: 'number' },
  { key: 'nba_outcome_label', label: 'Outcome', type: 'string' },
]

// All numeric fields that should be parsed as float when saving
const FLOAT_FIELDS = [
  'age_at_draft', 'height', 'weight', 'wingspan', 'ws_minus_h', 'standing_reach',
  'vertical', 'max_vertical', 'three_quarter_sprint', 'lane_agility', 'shuttle',
  'pts_per40', 'ast_per40', 'tov_per40', 'reb_per40', 'stl_per40', 'blk_per40',
  'college_ts_pct', 'college_ft_pct', 'efg_pct', 'college_usg', 'college_ast_pct',
  'college_stl_pct', 'college_blk_pct',
  'oai_estimate', 'ssa_estimate', 'scr_estimate', 'sci_estimate',
  'nba_ppg_first4', 'rpg_first4', 'apg_first4', 'spg_first4', 'bpg_first4',
  'per_first4', 'bpm_first4', 'vorp_first4', 'nba_ws48_first4',
]

const STRING_FIELDS = ['name', 'tier', 'position', 'college_team', 'class_year', 'nba_outcome_label']
const INT_FIELDS = ['draft_year', 'draft_pick']

const EMPTY_PLAYER = {
  name: '', draft_year: '', draft_pick: '', tier: 'modern', position: 'Guard',
  college_team: '', class_year: 'fr', age_at_draft: '',
  height: '', weight: '', wingspan: '', ws_minus_h: '', standing_reach: '',
  vertical: '', max_vertical: '', three_quarter_sprint: '', lane_agility: '', shuttle: '',
  pts_per40: '', ast_per40: '', tov_per40: '', reb_per40: '', stl_per40: '', blk_per40: '',
  college_ts_pct: '', college_ft_pct: '', efg_pct: '', college_usg: '',
  college_ast_pct: '', college_stl_pct: '', college_blk_pct: '',
  oai_estimate: '', ssa_estimate: '', scr_estimate: '', sci_estimate: '',
  nba_ppg_first4: '', rpg_first4: '', apg_first4: '', spg_first4: '', bpg_first4: '',
  per_first4: '', bpm_first4: '', vorp_first4: '', nba_ws48_first4: '',
  nba_outcome_label: '',
}

export default function HistoricalAdmin() {
  const navigate = useNavigate()
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('modern')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('draft_year')
  const [sortAsc, setSortAsc] = useState(false)
  const [draftYearFilter, setDraftYearFilter] = useState('All')

  const [editPlayer, setEditPlayer] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [compStatus, setCompStatus] = useState(null) // null | 'running' | { text, type }

  async function handleRegenComps() {
    setCompStatus('running')
    try {
      const result = await generateAllComps(msg => setCompStatus({ text: msg, type: 'info' }))
      setCompStatus({ text: `Generated ${result.total} comps for ${result.withComps} prospects (${result.withLegend} with legend echo)`, type: 'success' })
    } catch (err) {
      setCompStatus({ text: `Error: ${err.message}`, type: 'error' })
    }
  }

  useEffect(() => { loadPlayers() }, [])

  async function loadPlayers() {
    const { data, error } = await supabase
      .from('historical_players')
      .select('*')
      .order('draft_year', { ascending: false })
    if (error) console.error(error)
    setPlayers(data || [])
    setLoading(false)
  }

  const draftYears = useMemo(() => {
    const set = new Set(players.filter(p => p.tier === tab).map(p => p.draft_year).filter(Boolean))
    return Array.from(set).sort().reverse()
  }, [players, tab])

  const filtered = useMemo(() => {
    let list = players.filter(p => p.tier === tab)

    if (draftYearFilter !== 'All') {
      list = list.filter(p => p.draft_year === parseInt(draftYearFilter))
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.college_team?.toLowerCase().includes(q) ||
        p.nba_outcome_label?.toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (av == null) av = sortAsc ? Infinity : -Infinity
      if (bv == null) bv = sortAsc ? Infinity : -Infinity
      if (typeof av === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortAsc ? av - bv : bv - av
    })

    return list
  }, [players, tab, draftYearFilter, search, sortKey, sortAsc])

  const modernCount = players.filter(p => p.tier === 'modern').length
  const legendCount = players.filter(p => p.tier === 'legend').length

  function handleSort(key) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(key === 'name' || key === 'position') }
  }

  function openNew() {
    setEditPlayer({ ...EMPTY_PLAYER, tier: tab })
    setIsNew(true)
    setMessage(null)
  }

  function openEdit(player) {
    const p = { ...player }
    for (const k of Object.keys(EMPTY_PLAYER)) {
      if (p[k] == null) p[k] = ''
    }
    setEditPlayer(p)
    setIsNew(false)
    setMessage(null)
  }

  async function handleSave() {
    if (!editPlayer.name?.trim()) {
      setMessage({ type: 'error', text: 'Name is required' })
      return
    }

    setSaving(true)
    setMessage(null)

    const row = {}
    for (const k of STRING_FIELDS) row[k] = editPlayer[k]?.trim() || null
    for (const k of INT_FIELDS) row[k] = editPlayer[k] ? parseInt(editPlayer[k]) : null
    for (const k of FLOAT_FIELDS) row[k] = editPlayer[k] !== '' && editPlayer[k] != null ? parseFloat(editPlayer[k]) : null
    row.name = editPlayer.name.trim()
    row.tier = editPlayer.tier

    let error
    if (isNew) {
      ({ error } = await supabase.from('historical_players').insert(row))
    } else {
      ({ error } = await supabase.from('historical_players').update(row).eq('id', editPlayer.id))
    }

    setSaving(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: isNew ? 'Player added!' : 'Player updated!' })
      setEditPlayer(null)
      loadPlayers()
    }
  }

  async function handleDelete(player) {
    const { error } = await supabase.from('historical_players').delete().eq('id', player.id)
    if (error) alert(`Delete failed: ${error.message}`)
    else { setDeleteConfirm(null); loadPlayers() }
  }

  function updateField(field, value) {
    setEditPlayer(prev => ({ ...prev, [field]: value }))
  }

  const fmtPct = v => v != null && v !== '' ? (parseFloat(v) * 100).toFixed(1) + '%' : '—'
  const fmtNum = (v, d = 1) => v != null && v !== '' ? parseFloat(v).toFixed(d) : '—'
  const fmtIn = v => v != null && v !== '' ? `${Math.floor(v / 12)}'${(v % 12).toFixed(0)}"` : '—'

  const outcomeColor = label => {
    const colors = {
      'All-NBA': '#f472b6', 'All-Star': '#a855f7', 'Starter': '#22c55e', 'Rotation': '#f59e0b',
      'Bench': '#94a3b8', 'Bust': '#ef4444', 'Legend': '#facc15', 'TBD': '#64748b',
    }
    return colors[label] || '#94a3b8'
  }

  function NumField({ label, field, step = '0.1', placeholder = '' }) {
    return (
      <div className="ed-field">
        <label>{label}</label>
        <input type="number" step={step} value={editPlayer[field]} onChange={e => updateField(field, e.target.value)} placeholder={placeholder} />
      </div>
    )
  }

  if (loading) return <div className="bb-loading">Loading historical database...</div>

  return (
    <div className="ha-container">
      <div className="ha-header">
        <h1>Historical Players</h1>
        <span className="bb-count">{filtered.length} shown · {players.length} total ({modernCount} modern, {legendCount} legends)</span>
        <button className="sc-back" onClick={() => navigate('/')}>&larr; Big Board</button>
      </div>

      {/* Tabs */}
      <div className="ha-tabs">
        <button className={`ha-tab ${tab === 'modern' ? 'ha-tab-active' : ''}`} onClick={() => { setTab('modern'); setDraftYearFilter('All') }}>
          Modern ({modernCount})
        </button>
        <button className={`ha-tab ${tab === 'legend' ? 'ha-tab-active' : ''}`} onClick={() => { setTab('legend'); setDraftYearFilter('All') }}>
          Legends ({legendCount})
        </button>
      </div>

      {/* Controls */}
      <div className="ha-controls">
        <input
          type="text"
          placeholder="Search name, college, outcome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bb-search"
        />
        <select value={draftYearFilter} onChange={e => setDraftYearFilter(e.target.value)} className="bb-select">
          <option value="All">All Years</option>
          {draftYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button className="bb-add-btn" onClick={openNew}>+ Add Player</button>
        <button
          className="bb-dash-btn"
          style={{ background: 'rgba(168,85,247,0.15)', borderColor: '#a855f7', color: '#c084fc' }}
          onClick={handleRegenComps}
          disabled={compStatus === 'running'}
        >
          {compStatus === 'running' ? 'Generating...' : '⟳ Regenerate Comps'}
        </button>
        {compStatus && compStatus !== 'running' && (
          <span style={{ fontSize: '0.75rem', color: compStatus.type === 'error' ? '#ef4444' : compStatus.type === 'success' ? '#22c55e' : '#94a3b8', marginLeft: 8 }}>
            {compStatus.text}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="ha-table-wrap">
        <table className="bb-table ha-table">
          <thead>
            <tr>
              {SORTABLE_COLS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{ cursor: 'pointer' }}
                  className={sortKey === col.key ? 'bb-sorted' : ''}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="bb-sort-arrow">{sortAsc ? ' \u25B2' : ' \u25BC'}</span>
                  )}
                </th>
              ))}
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} className={i % 2 === 0 ? 'bb-row-even' : ''}>
                <td className="bb-name ha-name">{p.name}</td>
                <td className="bb-num">{p.draft_year || '—'}</td>
                <td className="bb-num">{p.draft_pick || 'UDFA'}</td>
                <td>
                  <span className={`ha-pos ha-pos-${p.position?.toLowerCase()}`}>{p.position || '—'}</span>
                </td>
                <td className="ha-college">{p.college_team || '—'}</td>
                <td className="bb-num">{fmtNum(p.age_at_draft)}</td>
                <td className="bb-num">{p.height ? fmtIn(p.height) : '—'}</td>
                <td className="bb-num">{p.wingspan ? fmtNum(p.wingspan, 1) + '"' : '—'}</td>
                <td className="bb-num">{fmtNum(p.oai_estimate)}</td>
                <td className="bb-num">{fmtNum(p.ssa_estimate)}</td>
                <td className="bb-num">{fmtNum(p.scr_estimate)}</td>
                <td className="bb-num">{fmtNum(p.sci_estimate)}</td>
                <td className="bb-num" style={{ fontWeight: 600 }}>{fmtNum(p.nba_ppg_first4)}</td>
                <td className="bb-num">{fmtNum(p.rpg_first4)}</td>
                <td className="bb-num">{fmtNum(p.apg_first4)}</td>
                <td className="bb-num">{fmtNum(p.per_first4)}</td>
                <td className="bb-num">{fmtNum(p.nba_ws48_first4, 3)}</td>
                <td>
                  <span className="ha-outcome" style={{ color: outcomeColor(p.nba_outcome_label) }}>
                    {p.nba_outcome_label || '—'}
                  </span>
                </td>
                <td className="ha-actions">
                  <button className="ha-edit-btn" onClick={() => openEdit(p)}>Edit</button>
                  <button className="ha-del-btn" onClick={() => setDeleteConfirm(p)}>Del</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={SORTABLE_COLS.length + 1} className="bb-empty">No players found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit / Add Modal */}
      {editPlayer && (
        <div className="mock-modal-overlay" onClick={() => setEditPlayer(null)}>
          <div className="ha-modal" onClick={e => e.stopPropagation()}>
            <h3>{isNew ? 'Add Historical Player' : `Edit: ${editPlayer.name}`}</h3>

            {message && <div className={`ed-message ${message.type}`}>{message.text}</div>}

            <div className="ha-form">
              {/* Section 1: Identity */}
              <div className="ha-form-section">
                <h4>Player Info</h4>
                <div className="ha-form-grid">
                  <div className="ed-field">
                    <label>Name *</label>
                    <input value={editPlayer.name} onChange={e => updateField('name', e.target.value)} />
                  </div>
                  <div className="ed-field">
                    <label>Draft Year</label>
                    <input type="number" value={editPlayer.draft_year} onChange={e => updateField('draft_year', e.target.value)} placeholder="2020" />
                  </div>
                  <div className="ed-field">
                    <label>Draft Pick</label>
                    <input type="number" value={editPlayer.draft_pick} onChange={e => updateField('draft_pick', e.target.value)} placeholder="0=UDFA" />
                  </div>
                  <div className="ed-field">
                    <label>Position</label>
                    <select value={editPlayer.position} onChange={e => updateField('position', e.target.value)}>
                      {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="ed-field">
                    <label>Tier</label>
                    <select value={editPlayer.tier} onChange={e => updateField('tier', e.target.value)}>
                      <option value="modern">Modern</option>
                      <option value="legend">Legend</option>
                    </select>
                  </div>
                  <div className="ed-field">
                    <label>College/Team</label>
                    <input value={editPlayer.college_team} onChange={e => updateField('college_team', e.target.value)} />
                  </div>
                  <div className="ed-field">
                    <label>Class Year</label>
                    <select value={editPlayer.class_year} onChange={e => updateField('class_year', e.target.value)}>
                      <option value="">—</option>
                      {CLASS_YEARS.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <NumField label="Age at Draft" field="age_at_draft" placeholder="19.5" />
                </div>
              </div>

              {/* Section 2: Physical Measurements */}
              <div className="ha-form-section">
                <h4>Physical Measurements (Combine)</h4>
                <div className="ha-form-grid">
                  <NumField label="Height (in.)" field="height" placeholder="78.5" />
                  <NumField label="Weight (lbs)" field="weight" step="1" placeholder="210" />
                  <NumField label="Wingspan (in.)" field="wingspan" placeholder="82.5" />
                  <NumField label="WS-H Diff (in.)" field="ws_minus_h" placeholder="5.0" />
                  <NumField label="Stand. Reach (in.)" field="standing_reach" placeholder="105.0" />
                  <NumField label="Vert (in.)" field="vertical" placeholder="32.0" />
                  <NumField label="Max Vert (in.)" field="max_vertical" placeholder="37.0" />
                  <NumField label="3/4 Sprint (s)" field="three_quarter_sprint" step="0.01" placeholder="3.20" />
                  <NumField label="Lane Agility (s)" field="lane_agility" step="0.01" placeholder="10.50" />
                  <NumField label="Shuttle (s)" field="shuttle" step="0.01" placeholder="2.90" />
                </div>
              </div>

              {/* Section 3: College Per-40 Stats */}
              <div className="ha-form-section">
                <h4>College Stats (Per 40 Min)</h4>
                <div className="ha-form-grid">
                  <NumField label="PTS/40" field="pts_per40" placeholder="18.5" />
                  <NumField label="AST/40" field="ast_per40" placeholder="3.5" />
                  <NumField label="TOV/40" field="tov_per40" placeholder="2.5" />
                  <NumField label="REB/40" field="reb_per40" placeholder="7.5" />
                  <NumField label="STL/40" field="stl_per40" placeholder="1.5" />
                  <NumField label="BLK/40" field="blk_per40" placeholder="1.0" />
                </div>
              </div>

              {/* Section 4: College Shooting/Advanced */}
              <div className="ha-form-section">
                <h4>College Shooting & Advanced</h4>
                <div className="ha-form-grid">
                  <NumField label="TS%" field="college_ts_pct" step="0.001" placeholder="0.580" />
                  <NumField label="FT%" field="college_ft_pct" step="0.001" placeholder="0.780" />
                  <NumField label="eFG%" field="efg_pct" step="0.001" placeholder="0.520" />
                  <NumField label="USG" field="college_usg" step="0.001" placeholder="0.250" />
                  <NumField label="AST%" field="college_ast_pct" step="0.001" placeholder="0.200" />
                  <NumField label="STL%" field="college_stl_pct" step="0.001" placeholder="0.020" />
                  <NumField label="BLK%" field="college_blk_pct" step="0.001" placeholder="0.030" />
                </div>
              </div>

              {/* Section 5: Model Estimates */}
              <div className="ha-form-section">
                <h4>Model Estimates (1-10)</h4>
                <div className="ha-form-grid">
                  <NumField label="OAI" field="oai_estimate" placeholder="7.0" />
                  <NumField label="SSA" field="ssa_estimate" placeholder="7.0" />
                  <NumField label="SCR" field="scr_estimate" placeholder="7.0" />
                  <NumField label="SCI" field="sci_estimate" placeholder="7.0" />
                </div>
              </div>

              {/* Section 6: NBA Outcomes */}
              <div className="ha-form-section">
                <h4>NBA Outcomes (First 4 Seasons)</h4>
                <div className="ha-form-grid">
                  <NumField label="PPG" field="nba_ppg_first4" placeholder="18.5" />
                  <NumField label="RPG" field="rpg_first4" placeholder="5.0" />
                  <NumField label="APG" field="apg_first4" placeholder="3.0" />
                  <NumField label="SPG" field="spg_first4" placeholder="1.0" />
                  <NumField label="BPG" field="bpg_first4" placeholder="0.5" />
                  <NumField label="PER" field="per_first4" placeholder="15.0" />
                  <NumField label="BPM" field="bpm_first4" placeholder="1.0" />
                  <NumField label="VORP" field="vorp_first4" placeholder="5.0" />
                  <NumField label="WS/48" field="nba_ws48_first4" step="0.001" placeholder="0.120" />
                  <div className="ed-field">
                    <label>Outcome Label</label>
                    <select value={editPlayer.nba_outcome_label} onChange={e => updateField('nba_outcome_label', e.target.value)}>
                      <option value="">—</option>
                      {OUTCOME_LABELS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="ha-modal-actions">
              <button className="dr-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : isNew ? 'Add Player' : 'Save Changes'}
              </button>
              <button className="mock-cancel-btn" onClick={() => setEditPlayer(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="mock-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="mock-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Player</h3>
            <p className="mock-confirm-text">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong> from the historical database?
              This cannot be undone.
            </p>
            <div className="mock-modal-actions">
              <button className="ha-del-confirm-btn" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
              <button className="mock-cancel-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
