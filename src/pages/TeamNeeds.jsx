import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { NEED_OPTIONS } from '../lib/needMap'

export default function TeamNeeds() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [edits, setEdits] = useState({}) // { team_id: { need_1, need_2, need_3, notes } }

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('nba_teams').select('*').order('team_name')
      setTeams(data || [])
      const init = {}
      for (const t of (data || [])) {
        init[t.team_id] = {
          need_1: t.need_1 || '',
          need_2: t.need_2 || '',
          need_3: t.need_3 || '',
          notes: t.notes || '',
        }
      }
      setEdits(init)
      setLoading(false)
    }
    load()
  }, [])

  function updateTeam(teamId, field, val) {
    setEdits(prev => ({
      ...prev,
      [teamId]: { ...prev[teamId], [field]: val },
    }))
  }

  async function saveAll() {
    setSaving(true)
    setMessage(null)
    const errors = []

    for (const [teamId, data] of Object.entries(edits)) {
      const { error } = await supabase
        .from('nba_teams')
        .update({
          need_1: data.need_1 || null,
          need_2: data.need_2 || null,
          need_3: data.need_3 || null,
          notes: data.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('team_id', teamId)

      if (error) errors.push(`${teamId}: ${error.message}`)
    }

    setSaving(false)
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join('; ') })
    } else {
      setMessage({ type: 'success', text: 'Team needs saved!' })
    }
  }

  if (loading) return <div className="bb-loading">Loading teams...</div>

  return (
    <div className="tn-container">
      <div className="tn-header">
        <h1>Team Needs</h1>
        <button className="sc-back" onClick={() => navigate('/mock-draft')}>&larr; Mock Draft</button>
        <button className="dr-save-btn" onClick={saveAll} disabled={saving}>
          {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {message && <div className={`ed-message ${message.type}`}>{message.text}</div>}

      <div className="tn-grid">
        {teams.map(team => {
          const e = edits[team.team_id] || {}
          return (
            <div key={team.team_id} className="tn-card">
              <div className="tn-card-header">
                <span className="tn-team-abbr">{team.team_id}</span>
                <span className="tn-team-name">{team.team_name}</span>
                <span className="tn-conf">{team.conference}</span>
              </div>
              <div className="tn-needs">
                {[1, 2, 3].map(n => (
                  <select
                    key={n}
                    value={e[`need_${n}`] || ''}
                    onChange={ev => updateTeam(team.team_id, `need_${n}`, ev.target.value)}
                    className="tn-need-select"
                  >
                    <option value="">Need {n}...</option>
                    {NEED_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ))}
              </div>
              <input
                value={e.notes || ''}
                onChange={ev => updateTeam(team.team_id, 'notes', ev.target.value)}
                placeholder="Notes..."
                className="tn-notes"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
