import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SSASliders from '../components/SSASliders'

const BUCKETS = ['Guard', 'Wing', 'Big']

const STYLE_ARCHETYPES = {
  Guard: ['Primary Playmaker', 'Scoring Lead Guard', 'Shot Creator Combo Guard', 'Off Ball Shooter', 'Movement Shooter', 'Secondary Playmaker', 'Rim Pressure Guard', 'Transition Guard', 'POA Defender', 'Energy Guard'],
  Wing: ['Offensive Engine', 'Shot Creating Wing', 'Three Level Scorer', 'Mid Post Wing', '3 and D Wing', 'Off Ball Scoring Wing', 'Connector Wing', 'Perimeter Stopper', 'Switchable Defensive Wing', 'Point Forward', 'Slasher Wing', 'Transition Wing', 'Two Way Star Wing'],
  Big: ['Rim Protector', 'Paint Anchor', 'Drop Coverage Big', 'Rim Runner', 'Vertical Lob Threat', 'Offensive Rebounder', 'Stretch Big', 'Pick and Pop Big', 'High Post Facilitator', 'Switch Big', 'Mobile Defensive Big', 'Weakside Shot Blocker', 'Unicorn'],
}

const ALERT_STATUSES = ['Clean', 'Minor Injury', 'Major Injury', 'Season Ending Injury', 'Arrested', 'Suspended', 'Off-Court', 'Transfer/Leaving', 'Unknown']

export default function PlayerEdit() {
  const { playerId } = useParams()
  const navigate = useNavigate()
  const isNew = !playerId

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(!isNew)

  // Player fields
  const [player, setPlayer] = useState({
    player_id: '', display_name: '', school_team: '',
    primary_bucket: 'Guard', style_archetype: '', birth_year: '',
  })

  // Prospect fields
  const [prospect, setProspect] = useState({
    team: '', league_conf: '', height: '', weight: '', wingspan: '',
    age_year: '', class: '', accolades: '', strengths: '', weaknesses: '',
    comp_upper: '', comp_lower: '', tier: '',
  })

  // SSA Input
  const [ssaInput, setSSAInput] = useState({
    role_translation: 5, shooting_profile: 5, creation_scalability: 5,
    playmaking_efficiency: 5, defensive_impact: 5, offball_value: 5,
    decision_making: 5, hustle_impact: 5,
  })

  // RAUS Override
  const [rausOverride, setRausOverride] = useState('')

  // Alert
  const [alert, setAlert] = useState({ report_type: '', notes: '', report_date: '' })

  // Measurables
  const [measurables, setMeasurables] = useState({
    height: '', weight: '', wingspan: '', standing_reach: '',
    vertical: '', max_vertical: '', three_quarter_sprint: '',
    lane_agility: '', shuttle: '', bench: '', ws_minus_h: '',
  })

  useEffect(() => {
    if (isNew) return
    async function load() {
      const [
        { data: p }, { data: pr }, { data: ssa },
        { data: raus }, { data: meas },
      ] = await Promise.all([
        supabase.from('players').select('*').eq('player_id', playerId).single(),
        supabase.from('prospects').select('*').eq('player_id', playerId).single(),
        supabase.from('ssa_input').select('*').eq('player_id', playerId).single(),
        supabase.from('raus_scores').select('raus_override').eq('player_id', playerId).single(),
        supabase.from('measurables').select('*').eq('player_id', playerId).single(),
      ])

      if (p) setPlayer({ ...p, birth_year: p.birth_year ?? '' })
      if (pr) setProspect(prev => ({ ...prev, ...Object.fromEntries(Object.entries(pr).map(([k, v]) => [k, v ?? ''])) }))
      if (ssa) {
        const { player_id: _, updated_at: __, ...grades } = ssa
        setSSAInput(prev => ({ ...prev, ...Object.fromEntries(Object.entries(grades).map(([k, v]) => [k, v ?? 5])) }))
      }
      if (raus?.raus_override != null) setRausOverride(String(raus.raus_override))
      if (meas) {
        const { player_id: _, updated_at: __, ...m } = meas
        setMeasurables(prev => ({ ...prev, ...Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v ?? ''])) }))
      }

      setLoading(false)
    }
    load()
  }, [playerId, isNew])

  function generatePlayerId(name, year) {
    return name.toLowerCase().replace(/[^a-z]/g, '') + '_' + year
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    const errors = []

    const pid = isNew ? generatePlayerId(player.display_name, player.birth_year) : playerId

    // Save player
    const playerRow = {
      player_id: pid,
      display_name: player.display_name,
      school_team: player.school_team || null,
      primary_bucket: player.primary_bucket,
      style_archetype: player.style_archetype || null,
      birth_year: player.birth_year ? parseInt(player.birth_year) : null,
    }

    const { error: e1 } = await supabase.from('players').upsert(playerRow, { onConflict: 'player_id' })
    if (e1) errors.push(`Player: ${e1.message}`)

    // Save prospect
    const prospectRow = {
      player_id: pid,
      team: prospect.team || null,
      league_conf: prospect.league_conf || null,
      height: prospect.height ? parseFloat(prospect.height) : null,
      weight: prospect.weight ? parseFloat(prospect.weight) : null,
      wingspan: prospect.wingspan ? parseFloat(prospect.wingspan) : null,
      age_year: prospect.age_year || null,
      class: prospect.class || null,
      accolades: prospect.accolades || null,
      strengths: prospect.strengths || null,
      weaknesses: prospect.weaknesses || null,
      comp_upper: prospect.comp_upper || null,
      comp_lower: prospect.comp_lower || null,
      tier: prospect.tier || null,
    }

    const { error: e2 } = await supabase.from('prospects').upsert(prospectRow, { onConflict: 'player_id' })
    if (e2) errors.push(`Prospect: ${e2.message}`)

    // Save SSA Input
    const ssaRow = { player_id: pid, ...ssaInput }
    const { error: e3 } = await supabase.from('ssa_input').upsert(ssaRow, { onConflict: 'player_id' })
    if (e3) errors.push(`SSA: ${e3.message}`)

    // Save RAUS Override
    if (rausOverride !== '') {
      const { error: e4 } = await supabase.from('raus_scores').upsert(
        { player_id: pid, raus_override: parseFloat(rausOverride) },
        { onConflict: 'player_id' }
      )
      if (e4) errors.push(`RAUS Override: ${e4.message}`)
    } else if (!isNew) {
      // Clear override
      const { error: e4 } = await supabase.from('raus_scores').update({ raus_override: null }).eq('player_id', pid)
      if (e4) errors.push(`Clear Override: ${e4.message}`)
    }

    // Save Measurables
    const measRow = {
      player_id: pid,
      ...Object.fromEntries(
        Object.entries(measurables).map(([k, v]) => [k, v !== '' ? (k === 'bench' ? parseInt(v) : parseFloat(v)) : null])
      ),
    }
    const { error: e5 } = await supabase.from('measurables').upsert(measRow, { onConflict: 'player_id' })
    if (e5) errors.push(`Measurables: ${e5.message}`)

    // Save Alert (if filled)
    if (alert.report_type) {
      const alertRow = {
        player_id: pid,
        report_type: alert.report_type,
        notes: alert.notes || null,
        report_date: alert.report_date || null,
      }
      const { error: e6 } = await supabase.from('player_alerts').insert(alertRow)
      if (e6) errors.push(`Alert: ${e6.message}`)
      else setAlert({ report_type: '', notes: '', report_date: '' })
    }

    setSaving(false)
    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join('; ') })
    } else {
      setMessage({ type: 'success', text: 'Saved successfully!' })
      if (isNew) navigate(`/player/${pid}/edit`, { replace: true })
    }
  }

  const archetypeOptions = STYLE_ARCHETYPES[player.primary_bucket] || []

  if (loading) return <div className="bb-loading">Loading...</div>

  return (
    <div className="ed-container">
      <div className="ed-top-bar">
        <button className="sc-back" onClick={() => navigate(isNew ? '/' : `/player/${playerId}`)}>
          &larr; {isNew ? 'Big Board' : 'Scouting Card'}
        </button>
        <h1 className="ed-title">{isNew ? 'Add New Player' : `Edit: ${player.display_name}`}</h1>
      </div>

      {message && (
        <div className={`ed-message ${message.type}`}>{message.text}</div>
      )}

      <div className="ed-grid">
        {/* Column 1: Player Info + Prospect */}
        <div className="ed-section">
          <h3 className="ed-section-title">Player Info</h3>

          {isNew && (
            <div className="ed-field">
              <label>Display Name *</label>
              <input value={player.display_name} onChange={e => setPlayer(p => ({ ...p, display_name: e.target.value }))} placeholder="First Last" />
            </div>
          )}
          {!isNew && <div className="ed-field"><label>Name</label><div className="ed-readonly">{player.display_name}</div></div>}

          <div className="ed-row">
            <div className="ed-field">
              <label>Position Bucket *</label>
              <select value={player.primary_bucket} onChange={e => setPlayer(p => ({ ...p, primary_bucket: e.target.value, style_archetype: '' }))}>
                {BUCKETS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="ed-field">
              <label>Style Archetype</label>
              <select value={player.style_archetype} onChange={e => setPlayer(p => ({ ...p, style_archetype: e.target.value }))}>
                <option value="">Select...</option>
                {archetypeOptions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="ed-row">
            <div className="ed-field">
              <label>School/Team</label>
              <input value={player.school_team} onChange={e => setPlayer(p => ({ ...p, school_team: e.target.value }))} />
            </div>
            <div className="ed-field">
              <label>Birth Year</label>
              <input type="number" value={player.birth_year} onChange={e => setPlayer(p => ({ ...p, birth_year: e.target.value }))} placeholder="2007" />
            </div>
          </div>

          <h3 className="ed-section-title" style={{ marginTop: 20 }}>Prospect Details</h3>

          <div className="ed-row">
            <div className="ed-field">
              <label>Team</label>
              <input value={prospect.team} onChange={e => setProspect(p => ({ ...p, team: e.target.value }))} />
            </div>
            <div className="ed-field">
              <label>Conference/League</label>
              <input value={prospect.league_conf} onChange={e => setProspect(p => ({ ...p, league_conf: e.target.value }))} placeholder="Big 12, ACC, etc." />
            </div>
            <div className="ed-field">
              <label>Class</label>
              <select value={prospect.class} onChange={e => setProspect(p => ({ ...p, class: e.target.value }))}>
                <option value="">—</option>
                <option value="fr">Freshman</option>
                <option value="so">Sophomore</option>
                <option value="jr">Junior</option>
                <option value="sr">Senior</option>
                <option value="intl">International</option>
              </select>
            </div>
          </div>

          <div className="ed-field">
            <label>Strengths</label>
            <textarea value={prospect.strengths} onChange={e => setProspect(p => ({ ...p, strengths: e.target.value }))} rows={2} />
          </div>
          <div className="ed-field">
            <label>Weaknesses</label>
            <textarea value={prospect.weaknesses} onChange={e => setProspect(p => ({ ...p, weaknesses: e.target.value }))} rows={2} />
          </div>

          <div className="ed-row">
            <div className="ed-field">
              <label>Comp (Ceiling)</label>
              <input value={prospect.comp_upper} onChange={e => setProspect(p => ({ ...p, comp_upper: e.target.value }))} />
            </div>
            <div className="ed-field">
              <label>Comp (Floor)</label>
              <input value={prospect.comp_lower} onChange={e => setProspect(p => ({ ...p, comp_lower: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Column 2: SSA Grades + RAUS Override */}
        <div className="ed-section">
          <h3 className="ed-section-title">SSA Grades (0-10)</h3>
          <SSASliders values={ssaInput} onChange={setSSAInput} />

          <h3 className="ed-section-title" style={{ marginTop: 24 }}>RAUS Override</h3>
          <div className="ed-field">
            <label>Override Score (leave blank for auto)</label>
            <input
              type="number"
              step={0.01}
              min={0}
              max={10}
              value={rausOverride}
              onChange={e => setRausOverride(e.target.value)}
              placeholder="e.g. 7.50"
              className="ed-override-input"
            />
            {rausOverride && (
              <button className="ed-clear-btn" onClick={() => setRausOverride('')}>Clear Override</button>
            )}
          </div>

          <h3 className="ed-section-title" style={{ marginTop: 24 }}>Log Alert</h3>
          <div className="ed-field">
            <label>Alert Type</label>
            <select value={alert.report_type} onChange={e => setAlert(a => ({ ...a, report_type: e.target.value }))}>
              <option value="">No alert</option>
              {ALERT_STATUSES.filter(s => s !== 'Clean').map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {alert.report_type && (
            <>
              <div className="ed-field">
                <label>Date</label>
                <input type="date" value={alert.report_date} onChange={e => setAlert(a => ({ ...a, report_date: e.target.value }))} />
              </div>
              <div className="ed-field">
                <label>Notes</label>
                <textarea value={alert.notes} onChange={e => setAlert(a => ({ ...a, notes: e.target.value }))} rows={2} />
              </div>
            </>
          )}
        </div>

        {/* Column 3: Measurables */}
        <div className="ed-section">
          <h3 className="ed-section-title">Measurables</h3>
          {[
            { key: 'height', label: 'Height (inches)', placeholder: '78' },
            { key: 'weight', label: 'Weight (lbs)', placeholder: '205' },
            { key: 'wingspan', label: 'Wingspan (inches)', placeholder: '83' },
            { key: 'standing_reach', label: 'Standing Reach', placeholder: '103' },
            { key: 'vertical', label: 'Standing Vertical', placeholder: '' },
            { key: 'max_vertical', label: 'Max Vertical', placeholder: '' },
            { key: 'three_quarter_sprint', label: '3/4 Sprint', placeholder: '' },
            { key: 'lane_agility', label: 'Lane Agility', placeholder: '' },
            { key: 'shuttle', label: 'Shuttle', placeholder: '' },
            { key: 'bench', label: 'Bench Reps', placeholder: '' },
            { key: 'ws_minus_h', label: 'Wingspan - Height', placeholder: '5' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="ed-field ed-field-compact">
              <label>{label}</label>
              <input
                type="number"
                step={key === 'bench' ? 1 : 0.1}
                value={measurables[key]}
                onChange={e => setMeasurables(m => ({ ...m, [key]: e.target.value }))}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save bar */}
      <div className="ed-save-bar">
        <button className="ed-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : isNew ? 'Create Player' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
