import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TierBadge from '../components/TierBadge'
import BucketBadge from '../components/BucketBadge'

const NBA_TEAMS = [
  'ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DAL', 'DEN', 'DET', 'GSW',
  'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA', 'MIL', 'MIN', 'NOP', 'NYK',
  'OKC', 'ORL', 'PHI', 'PHX', 'POR', 'SAC', 'SAS', 'TOR', 'UTA', 'WAS',
]

export default function DraftResults() {
  const navigate = useNavigate()
  const [players, setPlayers] = useState([])
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [draftClass, setDraftClass] = useState('2026')

  // Draft result entries: { player_id: { status, pick, team } }
  const [results, setResults] = useState({})

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: b }] = await Promise.all([
        supabase.from('players').select('*').eq('draft_status', 'prospect'),
        supabase.from('master_board').select('*').order('overall_rank'),
      ])
      setPlayers(p || [])
      setBoard(b || [])

      // Initialize results from existing data
      const init = {}
      for (const pl of (p || [])) {
        init[pl.player_id] = {
          status: pl.draft_status || 'prospect',
          pick: pl.draft_pick || '',
          team: pl.draft_team || '',
        }
      }
      setResults(init)
      setLoading(false)
    }
    load()
  }, [])

  const boardMap = useMemo(() => new Map(board.map(b => [b.player_id, b])), [board])

  // Merge and sort by rank
  const playerList = useMemo(() => {
    return players
      .map(p => ({ ...p, ...(boardMap.get(p.player_id) || {}) }))
      .sort((a, b) => (a.overall_rank || 999) - (b.overall_rank || 999))
  }, [players, boardMap])

  function updateResult(pid, field, val) {
    setResults(prev => ({
      ...prev,
      [pid]: { ...prev[pid], [field]: val },
    }))
  }

  function markDrafted(pid) {
    setResults(prev => ({
      ...prev,
      [pid]: { ...prev[pid], status: 'drafted' },
    }))
  }

  function markUndrafted(pid) {
    setResults(prev => ({
      ...prev,
      [pid]: { ...prev[pid], status: 'undrafted', pick: '', team: '' },
    }))
  }

  async function handleSaveAll() {
    setSaving(true)
    setMessage(null)
    const errors = []

    for (const [pid, r] of Object.entries(results)) {
      if (r.status === 'prospect') continue // unchanged

      const update = {
        draft_status: r.status,
        draft_pick: r.status === 'drafted' && r.pick ? parseInt(r.pick) : null,
        draft_team: r.status === 'drafted' && r.team ? r.team : null,
        draft_date: new Date().toISOString().split('T')[0],
      }

      const { error } = await supabase
        .from('players')
        .update(update)
        .eq('player_id', pid)

      if (error) errors.push(`${pid}: ${error.message}`)
    }

    setSaving(false)
    if (errors.length > 0) {
      setMessage({ type: 'error', text: `Errors: ${errors.join('; ')}` })
    } else {
      setMessage({ type: 'success', text: 'Draft results saved!' })
    }
  }

  async function handleArchive() {
    if (!confirm('Archive all drafted/undrafted players? This will copy their scouting profiles to the historical database and mark them as archived.')) return

    setSaving(true)
    setMessage(null)
    const errors = []

    for (const [pid, r] of Object.entries(results)) {
      if (r.status !== 'drafted' && r.status !== 'undrafted') continue

      const mb = boardMap.get(pid)
      if (!mb) continue

      // Copy scouting profile to historical_players
      const histRow = {
        name: mb.display_name,
        draft_year: parseInt(draftClass),
        draft_pick: r.status === 'drafted' ? parseInt(r.pick) || null : null,
        tier: mb.tier || null,
        position: mb.primary_bucket || null,
        original_raus: mb.raus_final || null,
        original_ssa: mb.ssa || null,
        original_composite: mb.composite_score || null,
        original_tier: mb.tier || null,
        original_rank: mb.overall_rank || null,
        original_archetype: mb.style_archetype || null,
        original_bucket: mb.primary_bucket || null,
        source_player_id: pid,
      }

      const { error: e1 } = await supabase.from('historical_players').insert(histRow)
      if (e1) errors.push(`Archive ${pid}: ${e1.message}`)

      // Mark as archived
      const { error: e2 } = await supabase
        .from('players')
        .update({ draft_status: 'archived' })
        .eq('player_id', pid)
      if (e2) errors.push(`Status ${pid}: ${e2.message}`)
    }

    setSaving(false)
    if (errors.length > 0) {
      setMessage({ type: 'error', text: `Errors: ${errors.join('; ')}` })
    } else {
      setMessage({ type: 'success', text: 'Players archived successfully! Scouting profiles saved to historical database.' })
    }
  }

  const draftedCount = Object.values(results).filter(r => r.status === 'drafted').length
  const undraftedCount = Object.values(results).filter(r => r.status === 'undrafted').length

  if (loading) return <div className="bb-loading">Loading draft results...</div>

  return (
    <div className="dr-container">
      <div className="dr-header">
        <h1>Draft Results</h1>
        <button className="sc-back" onClick={() => navigate('/')}>&larr; Big Board</button>
      </div>

      <div className="dr-status-bar">
        <div className="dr-stat"><span className="dr-stat-num">{playerList.length}</span> Total</div>
        <div className="dr-stat"><span className="dr-stat-num dr-drafted">{draftedCount}</span> Drafted</div>
        <div className="dr-stat"><span className="dr-stat-num dr-undrafted">{undraftedCount}</span> Undrafted</div>
        <div className="dr-stat">
          <label>Draft Class: </label>
          <input
            type="text"
            value={draftClass}
            onChange={e => setDraftClass(e.target.value)}
            className="dr-class-input"
            placeholder="2026"
          />
        </div>
      </div>

      {message && <div className={`ed-message ${message.type}`}>{message.text}</div>}

      <div className="dr-table-wrap">
        <table className="bb-table dr-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Pos</th>
              <th>Tier</th>
              <th>RAUS</th>
              <th>Comp</th>
              <th>Status</th>
              <th>Pick #</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            {playerList.map((p, i) => {
              const r = results[p.player_id] || { status: 'prospect', pick: '', team: '' }
              return (
                <tr
                  key={p.player_id}
                  className={`${i % 2 === 0 ? 'bb-row-even' : ''} ${r.status === 'drafted' ? 'dr-row-drafted' : ''} ${r.status === 'undrafted' ? 'dr-row-undrafted' : ''}`}
                >
                  <td className="bb-rank">{p.overall_rank}</td>
                  <td className="bb-name">{p.display_name}</td>
                  <td><BucketBadge bucket={p.primary_bucket} /></td>
                  <td><TierBadge tier={p.tier} /></td>
                  <td className="bb-num">{p.raus_final?.toFixed(2) || '—'}</td>
                  <td className="bb-num">{p.composite_score?.toFixed(4) || '—'}</td>
                  <td className="dr-status-cell" onClick={e => e.stopPropagation()}>
                    <div className="dr-status-btns">
                      <button
                        className={`dr-btn ${r.status === 'drafted' ? 'dr-btn-active-drafted' : ''}`}
                        onClick={() => markDrafted(p.player_id)}
                      >
                        Drafted
                      </button>
                      <button
                        className={`dr-btn ${r.status === 'undrafted' ? 'dr-btn-active-undrafted' : ''}`}
                        onClick={() => markUndrafted(p.player_id)}
                      >
                        UDFA
                      </button>
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    {r.status === 'drafted' && (
                      <input
                        type="number"
                        className="dr-pick-input"
                        value={r.pick}
                        onChange={e => updateResult(p.player_id, 'pick', e.target.value)}
                        placeholder="#"
                        min={1}
                        max={60}
                      />
                    )}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    {r.status === 'drafted' && (
                      <select
                        className="dr-team-select"
                        value={r.team}
                        onChange={e => updateResult(p.player_id, 'team', e.target.value)}
                      >
                        <option value="">Team...</option>
                        {NBA_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="dr-actions">
        <button className="dr-save-btn" onClick={handleSaveAll} disabled={saving}>
          {saving ? 'Saving...' : 'Save Draft Results'}
        </button>
        {(draftedCount > 0 || undraftedCount > 0) && (
          <button className="dr-archive-btn" onClick={handleArchive} disabled={saving}>
            Archive & Move to Historical
          </button>
        )}
      </div>
    </div>
  )
}
