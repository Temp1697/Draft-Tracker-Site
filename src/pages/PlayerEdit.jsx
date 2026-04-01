import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BODY_PARTS, SEVERITY_COLORS } from '../components/InjuryHistory'

const BUCKETS = ['Guard', 'Wing', 'Big']

const STYLE_ARCHETYPES = {
  Guard: ['Primary Playmaker', 'Scoring Lead Guard', 'Shot Creator Combo Guard', 'Off Ball Shooter', 'Movement Shooter', 'Secondary Playmaker', 'Rim Pressure Guard', 'Transition Guard', 'POA Defender', 'Energy Guard'],
  Wing: ['Offensive Engine', 'Shot Creating Wing', 'Three Level Scorer', 'Mid Post Wing', '3 and D Wing', 'Off Ball Scoring Wing', 'Connector Wing', 'Perimeter Stopper', 'Switchable Defensive Wing', 'Point Forward', 'Slasher Wing', 'Transition Wing', 'Two Way Star Wing'],
  Big: ['Rim Protector', 'Paint Anchor', 'Drop Coverage Big', 'Rim Runner', 'Vertical Lob Threat', 'Offensive Rebounder', 'Stretch Big', 'Pick and Pop Big', 'High Post Facilitator', 'Switch Big', 'Mobile Defensive Big', 'Weakside Shot Blocker', 'Unicorn'],
}

const ALERT_STATUSES = ['Clean', 'Minor Injury', 'Major Injury', 'Season Ending Injury', 'Arrested', 'Suspended', 'Off-Court', 'Transfer/Leaving', 'Unknown']

const TAB_KEYS = ['stats', 'ssa', 'measurables', 'bio', 'alerts', 'injuries']
const TAB_LABELS = { stats: 'Stats', ssa: 'SSA', measurables: 'Measurables', bio: 'Bio', alerts: 'Alerts', injuries: 'Injuries' }

const INJURY_SEVERITY_OPTIONS = ['minor', 'moderate', 'major', 'severe', 'career_threatening']
const INJURY_STATUS_OPTIONS = ['active', 'recovered', 'chronic']

/* ── Stat field definitions by group ── */

const STAT_GROUPS = [
  {
    label: 'Basic Box Score',
    fields: [
      { key: 'ppg', label: 'PPG', step: 0.1 },
      { key: 'rpg', label: 'RPG', step: 0.1 },
      { key: 'apg', label: 'APG', step: 0.1 },
      { key: 'spg', label: 'SPG', step: 0.1 },
      { key: 'bpg', label: 'BPG', step: 0.1 },
      { key: 'tov', label: 'TOV', step: 0.1 },
      { key: 'pf', label: 'PF', step: 0.1 },
      { key: 'mpg', label: 'MPG', step: 0.1 },
      { key: 'games', label: 'Games', step: 1 },
    ],
  },
  {
    label: 'Shooting',
    fields: [
      { key: 'fg_pct', label: 'FG%', step: 0.1 },
      { key: 'three_pt_pct', label: '3PT%', step: 0.1 },
      { key: 'ft_pct', label: 'FT%', step: 0.1 },
      { key: 'efg_pct', label: 'eFG%', step: 0.1 },
      { key: 'ts_pct', label: 'TS%', step: 0.1 },
      { key: 'fgm', label: 'FGM', step: 0.1 },
      { key: 'fga', label: 'FGA', step: 0.1 },
      { key: 'three_ptm', label: '3PM', step: 0.1 },
      { key: 'three_pta', label: '3PA', step: 0.1 },
      { key: 'ftm', label: 'FTM', step: 0.1 },
      { key: 'fta', label: 'FTA', step: 0.1 },
    ],
  },
  {
    label: 'Per-40',
    fields: [
      { key: 'pts_per40', label: 'PTS/40', step: 0.1 },
      { key: 'reb_per40', label: 'REB/40', step: 0.1 },
      { key: 'ast_per40', label: 'AST/40', step: 0.1 },
      { key: 'stl_per40', label: 'STL/40', step: 0.1 },
      { key: 'blk_per40', label: 'BLK/40', step: 0.1 },
      { key: 'tov_per40', label: 'TOV/40', step: 0.1 },
      { key: 'three_pta_per40', label: '3PA/40', step: 0.1 },
      { key: 'fta_per40', label: 'FTA/40', step: 0.1 },
      { key: 'dunks_per_game', label: 'Dunks/G', step: 0.1 },
    ],
  },
  {
    label: 'Rates & Advanced',
    fields: [
      { key: 'usg', label: 'USG%', step: 0.1 },
      { key: 'per', label: 'PER', step: 0.1 },
      { key: 'ws', label: 'WS', step: 0.1 },
      { key: 'dws', label: 'DWS', step: 0.1 },
      { key: 'bpm', label: 'BPM', step: 0.1 },
      { key: 'obpm', label: 'OBPM', step: 0.1 },
      { key: 'dbpm', label: 'DBPM', step: 0.1 },
      { key: 'ortg', label: 'ORTG', step: 0.1 },
      { key: 'drtg', label: 'DRTG', step: 0.1 },
      { key: 'ft_rate', label: 'FT Rate', step: 0.1 },
      { key: 'three_pta_rate', label: '3PA Rate', step: 0.1 },
      { key: 'ast_tov', label: 'AST/TOV', step: 0.01 },
      { key: 'ast_pct', label: 'AST%', step: 0.1 },
      { key: 'tov_pct', label: 'TOV%', step: 0.1 },
      { key: 'stl_pct', label: 'STL%', step: 0.1 },
      { key: 'blk_pct', label: 'BLK%', step: 0.1 },
      { key: 'orb_pct', label: 'ORB%', step: 0.1 },
      { key: 'drb_pct', label: 'DRB%', step: 0.1 },
      { key: 'porpagatu', label: 'PORPAGATU', step: 0.01 },
      { key: 'dporpagatu', label: 'DPORPAGATU', step: 0.01 },
    ],
  },
  {
    label: 'Totals',
    fields: [
      { key: 'pts_total', label: 'PTS Total', step: 1 },
      { key: 'reb_total', label: 'REB Total', step: 1 },
      { key: 'ast_total', label: 'AST Total', step: 1 },
      { key: 'tov_total', label: 'TOV Total', step: 1 },
      { key: 'min_total', label: 'MIN Total', step: 1 },
      { key: 'stl_total', label: 'STL Total', step: 1 },
      { key: 'blk_total', label: 'BLK Total', step: 1 },
      { key: 'pf_total', label: 'PF Total', step: 1 },
      { key: 'fgm_total', label: 'FGM Total', step: 1 },
      { key: 'fga_total', label: 'FGA Total', step: 1 },
      { key: 'three_ptm_total', label: '3PM Total', step: 1 },
      { key: 'three_pta_total', label: '3PA Total', step: 1 },
      { key: 'ftm_total', label: 'FTM Total', step: 1 },
      { key: 'fta_total', label: 'FTA Total', step: 1 },
      { key: 'orb_total', label: 'ORB Total', step: 1 },
      { key: 'drb_total', label: 'DRB Total', step: 1 },
    ],
  },
  {
    label: 'Shot Profile',
    fields: [
      { key: 'dunks', label: 'Dunks', step: 1 },
      { key: 'dunks_att', label: 'Dunk Att', step: 1 },
      { key: 'dunk_pct', label: 'Dunk%', step: 0.1 },
      { key: 'two_pt_close', label: '2PT Close', step: 0.1 },
      { key: 'two_pt_close_att', label: '2PT Close Att', step: 0.1 },
      { key: 'two_pt_close_pct', label: '2PT Close%', step: 0.1 },
      { key: 'two_pt_far', label: '2PT Far', step: 0.1 },
      { key: 'two_pt_far_att', label: '2PT Far Att', step: 0.1 },
      { key: 'two_pt_far_pct', label: '2PT Far%', step: 0.1 },
      { key: 'at_rim_share_pct', label: 'At Rim Share%', step: 0.1 },
      { key: 'inside_arc_share_pct', label: 'Inside Arc Share%', step: 0.1 },
      { key: 'three_pt_share_pct', label: '3PT Share%', step: 0.1 },
    ],
  },
  {
    label: 'Assist Profile',
    fields: [
      { key: 'astd_at_rim_pct', label: 'Ast\'d At Rim%', step: 0.1 },
      { key: 'astd_inside_arc_pct', label: 'Ast\'d Inside Arc%', step: 0.1 },
      { key: 'astd_three_pct', label: 'Ast\'d 3PT%', step: 0.1 },
      { key: 'astd_tot_pct', label: 'Ast\'d Total%', step: 0.1 },
    ],
  },
]

const SSA_CATEGORIES = [
  { key: 'role_translation', label: 'Role Translation' },
  { key: 'shooting_profile', label: 'Shooting Profile' },
  { key: 'creation_scalability', label: 'Creation Scalability' },
  { key: 'playmaking_efficiency', label: 'Playmaking Efficiency' },
  { key: 'defensive_impact', label: 'Defensive Impact' },
  { key: 'offball_value', label: 'Off-Ball Value' },
  { key: 'decision_making', label: 'Decision Making' },
  { key: 'hustle_impact', label: 'Hustle Impact' },
]

const MEASURABLE_FIELDS = [
  { key: 'height', label: 'Height (inches)', step: 0.25, placeholder: '78' },
  { key: 'weight', label: 'Weight (lbs)', step: 1, placeholder: '205' },
  { key: 'wingspan', label: 'Wingspan (inches)', step: 0.25, placeholder: '83' },
  { key: 'standing_reach', label: 'Standing Reach (inches)', step: 0.5, placeholder: '103' },
  { key: 'vertical', label: 'Standing Vertical (inches)', step: 0.5, placeholder: '' },
  { key: 'max_vertical', label: 'Max Vertical (inches)', step: 0.5, placeholder: '' },
  { key: 'three_quarter_sprint', label: '3/4 Sprint (sec)', step: 0.01, placeholder: '' },
  { key: 'lane_agility', label: 'Lane Agility (sec)', step: 0.01, placeholder: '' },
  { key: 'shuttle', label: 'Shuttle (sec)', step: 0.01, placeholder: '' },
  { key: 'bench', label: 'Bench Reps', step: 1, placeholder: '' },
  { key: 'ws_minus_h', label: 'Wingspan - Height', step: 0.25, placeholder: '5' },
]

function gradeColor(val) {
  if (val == null) return '#475569'
  if (val >= 8.5) return '#22c55e'
  if (val >= 7.0) return '#3b82f6'
  if (val >= 5.5) return '#eab308'
  if (val >= 4.0) return '#f97316'
  return '#ef4444'
}

/* ── Helper: build an empty stats object from the STAT_GROUPS definition ── */
function emptyStats() {
  const obj = {}
  for (const g of STAT_GROUPS) {
    for (const f of g.fields) obj[f.key] = ''
  }
  return obj
}

export default function PlayerEdit() {
  const { playerId } = useParams()
  const navigate = useNavigate()
  const isNew = !playerId

  const [activeTab, setActiveTab] = useState('stats')
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
    strength_1: '', strength_2: '', strength_3: '',
    weakness_1: '', weakness_2: '', weakness_3: '',
    comp_upper: '', comp_lower: '', tier: '', scouting_notes: '',
  })

  // Stats
  const [stats, setStats] = useState(emptyStats)

  // SSA Input
  const [ssaInput, setSSAInput] = useState({
    role_translation: 5, shooting_profile: 5, creation_scalability: 5,
    playmaking_efficiency: 5, defensive_impact: 5, offball_value: 5,
    decision_making: 5, hustle_impact: 5,
  })

  // SSA auto grades (loaded from ssa_scores or computed)
  const [ssaAuto, setSSAuto] = useState({})

  // RAUS Override
  const [rausOverride, setRausOverride] = useState('')

  // Measurables
  const [measurables, setMeasurables] = useState({
    height: '', weight: '', wingspan: '', standing_reach: '',
    vertical: '', max_vertical: '', three_quarter_sprint: '',
    lane_agility: '', shuttle: '', bench: '', ws_minus_h: '',
  })

  // Photo upload
  const [photoFile, setPhotoFile] = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  // Alerts
  const [alerts, setAlerts] = useState([])
  const [newAlert, setNewAlert] = useState({ report_type: '', notes: '', report_date: '' })
  const [editingAlertId, setEditingAlertId] = useState(null)
  const [editingAlert, setEditingAlert] = useState({ report_type: '', notes: '', report_date: '' })

  // Injuries
  const [injuries, setInjuries] = useState([])
  const [newInjury, setNewInjury] = useState({ body_part: '', severity: 'minor', injury_date: '', games_missed: '', notes: '', status: 'active' })
  const [editingInjuryId, setEditingInjuryId] = useState(null)
  const [editingInjury, setEditingInjury] = useState({ body_part: '', severity: 'minor', injury_date: '', games_missed: '', notes: '', status: 'active' })

  /* ── Load data ── */
  useEffect(() => {
    if (isNew) return
    async function load() {
      const [
        { data: p }, { data: pr }, { data: st },
        { data: ssa }, { data: ssaScores },
        { data: raus }, { data: meas }, { data: al },
        { data: inj },
      ] = await Promise.all([
        supabase.from('players').select('*').eq('player_id', playerId).single(),
        supabase.from('prospects').select('*').eq('player_id', playerId).single(),
        supabase.from('stats').select('*').eq('player_id', playerId).order('season', { ascending: false }).limit(1).single(),
        supabase.from('ssa_input').select('*').eq('player_id', playerId).single(),
        supabase.from('ssa_scores').select('*').eq('player_id', playerId).single(),
        supabase.from('raus_scores').select('raus_override').eq('player_id', playerId).single(),
        supabase.from('measurables').select('*').eq('player_id', playerId).single(),
        supabase.from('player_alerts').select('*').eq('player_id', playerId).order('report_date', { ascending: false }),
        supabase.from('player_injuries').select('*').eq('player_id', playerId).order('injury_date', { ascending: false }),
      ])

      if (p) {
        setPlayer({ ...p, birth_year: p.birth_year ?? '' })
        if (p.photo_url) setPhotoPreview(p.photo_url)
      }
      if (pr) setProspect(prev => ({ ...prev, ...Object.fromEntries(Object.entries(pr).map(([k, v]) => [k, v ?? ''])) }))

      if (st) {
        const { player_id: _, updated_at: __, created_at: ___, season, ...rest } = st
        setStats(prev => ({ ...prev, season: season || '25-26', ...Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v ?? ''])) }))
      }

      if (ssa) {
        const { player_id: _, updated_at: __, ...grades } = ssa
        setSSAInput(prev => ({ ...prev, ...Object.fromEntries(Object.entries(grades).map(([k, v]) => [k, v ?? 5])) }))
      }

      if (ssaScores) {
        const auto = {}
        for (const cat of SSA_CATEGORIES) {
          if (ssaScores[cat.key] != null) auto[cat.key] = ssaScores[cat.key]
        }
        setSSAuto(auto)
      }

      if (raus?.raus_override != null) setRausOverride(String(raus.raus_override))
      if (meas) {
        const { player_id: _, updated_at: __, ...m } = meas
        setMeasurables(prev => ({ ...prev, ...Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v ?? ''])) }))
      }
      if (al) setAlerts(al)
      if (inj) setInjuries(inj)

      setLoading(false)
    }
    load()
  }, [playerId, isNew])

  /* ── Helpers ── */
  function generatePlayerId(name, year) {
    return name.toLowerCase().replace(/[^a-z]/g, '') + '_' + year
  }

  function handleStatChange(key, value) {
    setStats(prev => ({ ...prev, [key]: value }))
  }

  function handleSSASlider(key, raw) {
    const val = Math.round(parseFloat(raw) * 2) / 2
    setSSAInput(prev => ({ ...prev, [key]: val }))
  }

  async function handlePhotoUpload() {
    if (!photoFile || isNew) return
    setPhotoUploading(true)
    setMessage(null)
    const ext = photoFile.name.split('.').pop()
    const filePath = `${playerId}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('player-photos')
      .upload(filePath, photoFile, { upsert: true })
    if (uploadErr) {
      setMessage({ type: 'error', text: `Photo upload failed: ${uploadErr.message}` })
      setPhotoUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage
      .from('player-photos')
      .getPublicUrl(filePath)
    const { error: updateErr } = await supabase
      .from('players')
      .update({ photo_url: publicUrl })
      .eq('player_id', playerId)
    if (updateErr) {
      setMessage({ type: 'error', text: `Failed to save photo URL: ${updateErr.message}` })
    } else {
      setPlayer(p => ({ ...p, photo_url: publicUrl }))
      setPhotoPreview(publicUrl)
      setPhotoFile(null)
      setMessage({ type: 'success', text: 'Photo uploaded successfully!' })
    }
    setPhotoUploading(false)
  }

  function resetSSAToAuto(key) {
    if (ssaAuto[key] != null) {
      setSSAInput(prev => ({ ...prev, [key]: ssaAuto[key] }))
    }
  }

  function resetAllSSAToAuto() {
    const next = { ...ssaInput }
    for (const cat of SSA_CATEGORIES) {
      if (ssaAuto[cat.key] != null) next[cat.key] = ssaAuto[cat.key]
    }
    setSSAInput(next)
  }

  /* ── Alert CRUD ── */
  async function handleDeleteAlert(alertId) {
    const { error } = await supabase.from('player_alerts').delete().eq('id', alertId)
    if (!error) setAlerts(prev => prev.filter(a => a.id !== alertId))
    else setMessage({ type: 'error', text: `Delete alert failed: ${error.message}` })
  }

  async function handleUpdateAlert(alertId) {
    const row = {
      report_type: editingAlert.report_type,
      notes: editingAlert.notes || null,
      report_date: editingAlert.report_date || null,
    }
    const { error } = await supabase.from('player_alerts').update(row).eq('id', alertId)
    if (!error) {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, ...row } : a))
      setEditingAlertId(null)
    } else {
      setMessage({ type: 'error', text: `Update alert failed: ${error.message}` })
    }
  }

  /* ── Injury CRUD ── */
  async function handleDeleteInjury(injuryId) {
    const { error } = await supabase.from('player_injuries').delete().eq('id', injuryId)
    if (!error) setInjuries(prev => prev.filter(i => i.id !== injuryId))
    else setMessage({ type: 'error', text: `Delete injury failed: ${error.message}` })
  }

  async function handleUpdateInjury(injuryId) {
    const row = {
      body_part: editingInjury.body_part,
      severity: editingInjury.severity,
      injury_date: editingInjury.injury_date || null,
      games_missed: editingInjury.games_missed !== '' ? parseInt(editingInjury.games_missed) : null,
      notes: editingInjury.notes || null,
      status: editingInjury.status || null,
    }
    const { error } = await supabase.from('player_injuries').update(row).eq('id', injuryId)
    if (!error) {
      setInjuries(prev => prev.map(i => i.id === injuryId ? { ...i, ...row } : i))
      setEditingInjuryId(null)
    } else {
      setMessage({ type: 'error', text: `Update injury failed: ${error.message}` })
    }
  }

  async function handleAddInjury() {
    if (!newInjury.body_part) return
    const pid = isNew ? generatePlayerId(player.display_name, player.birth_year) : playerId
    const row = {
      player_id: pid,
      body_part: newInjury.body_part,
      severity: newInjury.severity,
      injury_date: newInjury.injury_date || null,
      games_missed: newInjury.games_missed !== '' ? parseInt(newInjury.games_missed) : null,
      notes: newInjury.notes || null,
      status: newInjury.status || null,
    }
    const { data: inserted, error } = await supabase.from('player_injuries').insert(row).select()
    if (!error && inserted) {
      setInjuries(prev => [inserted[0], ...prev])
      setNewInjury({ body_part: '', severity: 'minor', injury_date: '', games_missed: '', notes: '', status: 'active' })
      setMessage({ type: 'success', text: 'Injury added!' })
    } else {
      setMessage({ type: 'error', text: `Add injury failed: ${error?.message}` })
    }
  }

  /* ── Save ── */
  async function handleSave() {
    setSaving(true)
    setMessage(null)
    const errors = []

    const pid = isNew ? generatePlayerId(player.display_name, player.birth_year) : playerId

    // 1. Player
    const playerRow = {
      player_id: pid,
      display_name: player.display_name,
      school_team: player.school_team || null,
      primary_bucket: player.primary_bucket,
      style_archetype: player.style_archetype || null,
      birth_year: player.birth_year ? parseInt(player.birth_year) : null,
      photo_url: player.photo_url || null,
    }
    const { error: e1 } = await supabase.from('players').upsert(playerRow, { onConflict: 'player_id' })
    if (e1) errors.push(`Player: ${e1.message}`)

    // 2. Prospect
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
      strength_1: prospect.strength_1 || null,
      strength_2: prospect.strength_2 || null,
      strength_3: prospect.strength_3 || null,
      weakness_1: prospect.weakness_1 || null,
      weakness_2: prospect.weakness_2 || null,
      weakness_3: prospect.weakness_3 || null,
      comp_upper: prospect.comp_upper || null,
      comp_lower: prospect.comp_lower || null,
      tier: prospect.tier || null,
      scouting_notes: prospect.scouting_notes || null,
    }
    const { error: e2 } = await supabase.from('prospects').upsert(prospectRow, { onConflict: 'player_id' })
    if (e2) errors.push(`Prospect: ${e2.message}`)

    // 3. Stats — unique constraint is on player_id only
    const statsRow = { player_id: pid, season: stats.season || '25-26' }
    for (const g of STAT_GROUPS) {
      for (const f of g.fields) {
        const v = stats[f.key]
        statsRow[f.key] = v !== '' && v != null ? parseFloat(v) : null
      }
    }
    const { error: e3 } = await supabase.from('stats').upsert(statsRow, { onConflict: 'player_id' })
    if (e3) errors.push(`Stats: ${e3.message}`)

    // 4. SSA Input
    const ssaRow = { player_id: pid, ...ssaInput }
    const { error: e4 } = await supabase.from('ssa_input').upsert(ssaRow, { onConflict: 'player_id' })
    if (e4) errors.push(`SSA: ${e4.message}`)

    // 5. RAUS Override
    if (rausOverride !== '') {
      const { error: e5 } = await supabase.from('raus_scores').upsert(
        { player_id: pid, raus_override: parseFloat(rausOverride) },
        { onConflict: 'player_id' }
      )
      if (e5) errors.push(`RAUS Override: ${e5.message}`)
    } else if (!isNew) {
      const { error: e5 } = await supabase.from('raus_scores').update({ raus_override: null }).eq('player_id', pid)
      if (e5) errors.push(`Clear Override: ${e5.message}`)
    }

    // 6. Measurables
    const measRow = {
      player_id: pid,
      ...Object.fromEntries(
        Object.entries(measurables).map(([k, v]) => [k, v !== '' ? (k === 'bench' ? parseInt(v) : parseFloat(v)) : null])
      ),
    }
    const { error: e6 } = await supabase.from('measurables').upsert(measRow, { onConflict: 'player_id' })
    if (e6) errors.push(`Measurables: ${e6.message}`)

    // 7. New Alert (if filled)
    if (newAlert.report_type) {
      const alertRow = {
        player_id: pid,
        report_type: newAlert.report_type,
        notes: newAlert.notes || null,
        report_date: newAlert.report_date || null,
      }
      const { error: e7 } = await supabase.from('player_alerts').insert(alertRow)
      if (e7) errors.push(`Alert: ${e7.message}`)
      else {
        // Reload alerts
        const { data: al } = await supabase.from('player_alerts').select('*').eq('player_id', pid).order('report_date', { ascending: false })
        if (al) setAlerts(al)
        setNewAlert({ report_type: '', notes: '', report_date: '' })
      }
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

  /* ── Tab renderers ── */

  function renderStatsTab() {
    return (
      <div className="ed-tab-content">
        {STAT_GROUPS.map(group => (
          <div key={group.label} className="ha-form-section" style={{ marginBottom: 20 }}>
            <h4>{group.label}</h4>
            <div className="ha-form-grid">
              {group.fields.map(({ key, label, step }) => (
                <div key={key} className="ed-field ed-field-compact">
                  <label>{label}</label>
                  <input
                    type="number"
                    step={step}
                    value={stats[key]}
                    onChange={e => handleStatChange(key, e.target.value)}
                    placeholder="--"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  function renderSSATab() {
    return (
      <div className="ed-tab-content">
        <div className="ed-section" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="ed-section-title" style={{ margin: 0, border: 'none', paddingBottom: 0 }}>SSA Grades (0-10)</h3>
            <button
              className="ed-reset-all-btn"
              onClick={resetAllSSAToAuto}
              style={{
                background: 'none', border: '1px solid #475569', color: '#94a3b8',
                padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
              }}
            >
              Reset All to Auto
            </button>
          </div>

          <div className="ssa-sliders">
            {SSA_CATEGORIES.map(({ key, label }) => {
              const val = ssaInput[key] ?? 5
              const autoVal = ssaAuto[key]
              const isAuto = autoVal != null && val === autoVal
              return (
                <div key={key} className="ssa-slider-row" style={{ flexWrap: 'wrap', gap: 8 }}>
                  <label className="ssa-slider-label">{label}</label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={val}
                    onChange={e => handleSSASlider(key, e.target.value)}
                    className="ssa-slider-input"
                    style={{ accentColor: gradeColor(val) }}
                  />
                  <span className="ssa-slider-val" style={{ color: gradeColor(val) }}>
                    {val.toFixed(1)}
                  </span>
                  <span style={{
                    fontSize: 10, color: autoVal != null ? '#64748b' : '#334155',
                    width: 70, textAlign: 'right',
                  }}>
                    {autoVal != null ? `Auto: ${autoVal.toFixed(1)}` : 'Auto: --'}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, width: 50,
                    color: isAuto ? '#22c55e' : '#f59e0b',
                  }}>
                    {autoVal != null ? (isAuto ? 'Auto' : 'Manual') : ''}
                  </span>
                  {autoVal != null && !isAuto && (
                    <button
                      onClick={() => resetSSAToAuto(key)}
                      style={{
                        background: 'none', border: 'none', color: '#3b82f6',
                        fontSize: 11, cursor: 'pointer', padding: 0, textDecoration: 'underline',
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="ed-section">
          <h3 className="ed-section-title">RAUS Override</h3>
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
        </div>
      </div>
    )
  }

  function renderMeasurablesTab() {
    return (
      <div className="ed-tab-content">
        <div className="ed-section">
          <h3 className="ed-section-title">Combine / Measurables</h3>
          <div className="ha-form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {MEASURABLE_FIELDS.map(({ key, label, step, placeholder }) => (
              <div key={key} className="ed-field ed-field-compact">
                <label>{label}</label>
                <input
                  type="number"
                  step={step}
                  value={measurables[key]}
                  onChange={e => setMeasurables(m => ({ ...m, [key]: e.target.value }))}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function renderBioTab() {
    return (
      <div className="ed-tab-content">
        <div className="ed-section" style={{ marginBottom: 20 }}>
          <h3 className="ed-section-title">Player Identity</h3>

          {/* Photo upload */}
          {!isNew && (
            <div className="ed-field" style={{ marginBottom: 16 }}>
              <label>Player Photo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {(photoPreview || player.photo_url) && (
                  <img
                    src={photoPreview || player.photo_url}
                    alt={player.display_name}
                    style={{
                      width: 64, height: 64, borderRadius: '50%',
                      objectFit: 'cover', border: '2px solid rgba(168,85,247,0.4)',
                    }}
                  />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setPhotoFile(file)
                        setPhotoPreview(URL.createObjectURL(file))
                      }
                    }}
                    style={{ fontSize: 13 }}
                  />
                  {photoFile && (
                    <button
                      onClick={handlePhotoUpload}
                      disabled={photoUploading}
                      style={{
                        background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)',
                        color: '#c084fc', padding: '6px 16px', borderRadius: 6,
                        cursor: photoUploading ? 'not-allowed' : 'pointer', fontSize: 13,
                        alignSelf: 'flex-start',
                      }}
                    >
                      {photoUploading ? 'Uploading...' : 'Upload Photo'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="ed-field">
            <label>Display Name {isNew ? '*' : ''}</label>
            {isNew ? (
              <input
                value={player.display_name}
                onChange={e => setPlayer(p => ({ ...p, display_name: e.target.value }))}
                placeholder="First Last"
              />
            ) : (
              <input
                value={player.display_name}
                onChange={e => setPlayer(p => ({ ...p, display_name: e.target.value }))}
              />
            )}
          </div>

          <div className="ed-row">
            <div className="ed-field">
              <label>School / Team (players)</label>
              <input
                value={player.school_team}
                onChange={e => setPlayer(p => ({ ...p, school_team: e.target.value }))}
              />
            </div>
            <div className="ed-field">
              <label>Birth Year</label>
              <input
                type="number"
                value={player.birth_year}
                onChange={e => setPlayer(p => ({ ...p, birth_year: e.target.value }))}
                placeholder="2007"
              />
            </div>
          </div>

          <div className="ed-row">
            <div className="ed-field">
              <label>Position Bucket *</label>
              <select
                value={player.primary_bucket}
                onChange={e => setPlayer(p => ({ ...p, primary_bucket: e.target.value, style_archetype: '' }))}
              >
                {BUCKETS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="ed-field">
              <label>Style Archetype</label>
              <select
                value={player.style_archetype}
                onChange={e => setPlayer(p => ({ ...p, style_archetype: e.target.value }))}
              >
                <option value="">Select...</option>
                {archetypeOptions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="ed-section" style={{ marginBottom: 20 }}>
          <h3 className="ed-section-title">Prospect Details</h3>

          <div className="ed-row">
            <div className="ed-field">
              <label>Team (prospects)</label>
              <input value={prospect.team} onChange={e => setProspect(p => ({ ...p, team: e.target.value }))} />
            </div>
            <div className="ed-field">
              <label>Conference / League</label>
              <input
                value={prospect.league_conf}
                onChange={e => setProspect(p => ({ ...p, league_conf: e.target.value }))}
                placeholder="Big 12, ACC, etc."
              />
            </div>
          </div>

          <div className="ed-row">
            <div className="ed-field">
              <label>Class</label>
              <select value={prospect.class} onChange={e => setProspect(p => ({ ...p, class: e.target.value }))}>
                <option value="">--</option>
                <option value="fr">Freshman</option>
                <option value="so">Sophomore</option>
                <option value="jr">Junior</option>
                <option value="sr">Senior</option>
                <option value="intl">International</option>
              </select>
            </div>
            <div className="ed-field">
              <label>Age / Year</label>
              <input value={prospect.age_year} onChange={e => setProspect(p => ({ ...p, age_year: e.target.value }))} />
            </div>
            <div className="ed-field">
              <label>Tier</label>
              <input value={prospect.tier} onChange={e => setProspect(p => ({ ...p, tier: e.target.value }))} placeholder="e.g. 1, 2, 3" />
            </div>
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

          <div className="ed-field">
            <label>Accolades</label>
            <textarea
              value={prospect.accolades}
              onChange={e => setProspect(p => ({ ...p, accolades: e.target.value }))}
              rows={3}
              placeholder="All-American, etc."
            />
          </div>
          <div className="ed-field">
            <label>Strength 1</label>
            <input type="text" placeholder="e.g. Elite shot creation" value={prospect.strength_1 || ''} onChange={e => setProspect(p => ({...p, strength_1: e.target.value}))} />
          </div>
          <div className="ed-field">
            <label>Strength 2</label>
            <input type="text" placeholder="e.g. Switchable defender" value={prospect.strength_2 || ''} onChange={e => setProspect(p => ({...p, strength_2: e.target.value}))} />
          </div>
          <div className="ed-field">
            <label>Strength 3</label>
            <input type="text" placeholder="e.g. High motor rebounder" value={prospect.strength_3 || ''} onChange={e => setProspect(p => ({...p, strength_3: e.target.value}))} />
          </div>
          <div className="ed-field">
            <label>Weakness 1</label>
            <input type="text" placeholder="e.g. Inconsistent 3PT shooting" value={prospect.weakness_1 || ''} onChange={e => setProspect(p => ({...p, weakness_1: e.target.value}))} />
          </div>
          <div className="ed-field">
            <label>Weakness 2</label>
            <input type="text" placeholder="e.g. Turnover-prone in traffic" value={prospect.weakness_2 || ''} onChange={e => setProspect(p => ({...p, weakness_2: e.target.value}))} />
          </div>
          <div className="ed-field">
            <label>Weakness 3</label>
            <input type="text" placeholder="e.g. Limited lateral quickness" value={prospect.weakness_3 || ''} onChange={e => setProspect(p => ({...p, weakness_3: e.target.value}))} />
          </div>
        </div>
      </div>
    )
  }

  function renderAlertsTab() {
    return (
      <div className="ed-tab-content">
        {/* Existing alerts */}
        <div className="ed-section" style={{ marginBottom: 20 }}>
          <h3 className="ed-section-title">Existing Alerts ({alerts.length})</h3>
          {alerts.length === 0 && (
            <div style={{ color: '#475569', fontSize: 13, padding: '8px 0' }}>No alerts on file.</div>
          )}
          {alerts.map(a => (
            <div
              key={a.id}
              style={{
                background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
                padding: 12, marginBottom: 10,
              }}
            >
              {editingAlertId === a.id ? (
                <>
                  <div className="ed-row" style={{ marginBottom: 8 }}>
                    <div className="ed-field" style={{ marginBottom: 0 }}>
                      <label>Type</label>
                      <select
                        value={editingAlert.report_type}
                        onChange={e => setEditingAlert(ea => ({ ...ea, report_type: e.target.value }))}
                      >
                        {ALERT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="ed-field" style={{ marginBottom: 0 }}>
                      <label>Date</label>
                      <input
                        type="date"
                        value={editingAlert.report_date || ''}
                        onChange={e => setEditingAlert(ea => ({ ...ea, report_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="ed-field" style={{ marginBottom: 8 }}>
                    <label>Notes</label>
                    <textarea
                      value={editingAlert.notes || ''}
                      onChange={e => setEditingAlert(ea => ({ ...ea, notes: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleUpdateAlert(a.id)}
                      style={{
                        background: '#22c55e', color: '#fff', border: 'none',
                        padding: '5px 14px', borderRadius: 5, fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingAlertId(null)}
                      style={{
                        background: 'none', color: '#94a3b8', border: '1px solid #475569',
                        padding: '5px 14px', borderRadius: 5, fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                      fontSize: 11, fontWeight: 700, marginRight: 8,
                      background: a.report_type === 'Clean' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color: a.report_type === 'Clean' ? '#4ade80' : '#fca5a5',
                    }}>
                      {a.report_type}
                    </span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{a.report_date || 'No date'}</span>
                    {a.notes && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{a.notes}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        setEditingAlertId(a.id)
                        setEditingAlert({
                          report_type: a.report_type || '',
                          notes: a.notes || '',
                          report_date: a.report_date || '',
                        })
                      }}
                      style={{
                        background: 'none', border: 'none', color: '#3b82f6',
                        fontSize: 11, cursor: 'pointer', textDecoration: 'underline',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(a.id)}
                      style={{
                        background: 'none', border: 'none', color: '#ef4444',
                        fontSize: 11, cursor: 'pointer', textDecoration: 'underline',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* New alert form */}
        <div className="ed-section">
          <h3 className="ed-section-title">Add New Alert</h3>
          <div className="ed-row" style={{ marginBottom: 10 }}>
            <div className="ed-field">
              <label>Alert Type</label>
              <select
                value={newAlert.report_type}
                onChange={e => setNewAlert(a => ({ ...a, report_type: e.target.value }))}
              >
                <option value="">Select type...</option>
                {ALERT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="ed-field">
              <label>Date</label>
              <input
                type="date"
                value={newAlert.report_date}
                onChange={e => setNewAlert(a => ({ ...a, report_date: e.target.value }))}
              />
            </div>
          </div>
          <div className="ed-field">
            <label>Notes</label>
            <textarea
              value={newAlert.notes}
              onChange={e => setNewAlert(a => ({ ...a, notes: e.target.value }))}
              rows={3}
              placeholder="Details about the alert..."
            />
          </div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
            New alerts are saved when you click "Save Changes" below.
          </div>
        </div>
      </div>
    )
  }

  function renderInjuriesTab() {
    return (
      <div className="ed-tab-content">
        {/* Existing injuries */}
        <div className="ed-section" style={{ marginBottom: 20 }}>
          <h3 className="ed-section-title">Existing Injuries ({injuries.length})</h3>
          {injuries.length === 0 && (
            <div style={{ color: '#475569', fontSize: 13, padding: '8px 0' }}>No injuries on file.</div>
          )}
          {injuries.map(inj => {
            const sevColor = SEVERITY_COLORS[inj.severity]?.color || '#FBBF24'
            return (
              <div
                key={inj.id}
                style={{
                  background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
                  padding: 12, marginBottom: 10, borderLeft: `3px solid ${sevColor}`,
                }}
              >
                {editingInjuryId === inj.id ? (
                  <>
                    <div className="ed-row" style={{ marginBottom: 8 }}>
                      <div className="ed-field" style={{ marginBottom: 0 }}>
                        <label>Body Part</label>
                        <select
                          value={editingInjury.body_part}
                          onChange={e => setEditingInjury(ei => ({ ...ei, body_part: e.target.value }))}
                        >
                          <option value="">Select...</option>
                          {Object.entries(BODY_PARTS).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="ed-field" style={{ marginBottom: 0 }}>
                        <label>Severity</label>
                        <select
                          value={editingInjury.severity}
                          onChange={e => setEditingInjury(ei => ({ ...ei, severity: e.target.value }))}
                        >
                          {INJURY_SEVERITY_OPTIONS.map(s => (
                            <option key={s} value={s}>{SEVERITY_COLORS[s]?.label || s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="ed-field" style={{ marginBottom: 0 }}>
                        <label>Status</label>
                        <select
                          value={editingInjury.status}
                          onChange={e => setEditingInjury(ei => ({ ...ei, status: e.target.value }))}
                        >
                          {INJURY_STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="ed-row" style={{ marginBottom: 8 }}>
                      <div className="ed-field" style={{ marginBottom: 0 }}>
                        <label>Date</label>
                        <input
                          type="date"
                          value={editingInjury.injury_date || ''}
                          onChange={e => setEditingInjury(ei => ({ ...ei, injury_date: e.target.value }))}
                        />
                      </div>
                      <div className="ed-field" style={{ marginBottom: 0 }}>
                        <label>Games Missed</label>
                        <input
                          type="number"
                          min={0}
                          value={editingInjury.games_missed}
                          onChange={e => setEditingInjury(ei => ({ ...ei, games_missed: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="ed-field" style={{ marginBottom: 8 }}>
                      <label>Notes</label>
                      <textarea
                        value={editingInjury.notes || ''}
                        onChange={e => setEditingInjury(ei => ({ ...ei, notes: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleUpdateInjury(inj.id)}
                        style={{
                          background: '#22c55e', color: '#fff', border: 'none',
                          padding: '5px 14px', borderRadius: 5, fontSize: 12, cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingInjuryId(null)}
                        style={{
                          background: 'none', color: '#94a3b8', border: '1px solid #475569',
                          padding: '5px 14px', borderRadius: 5, fontSize: 12, cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                        fontSize: 11, fontWeight: 700, marginRight: 8,
                        background: sevColor + '22', color: sevColor,
                      }}>
                        {BODY_PARTS[inj.body_part]?.label || inj.body_part}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: sevColor, textTransform: 'uppercase', marginRight: 8,
                      }}>
                        {SEVERITY_COLORS[inj.severity]?.label || inj.severity}
                      </span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{inj.injury_date || 'No date'}</span>
                      {inj.games_missed != null && (
                        <span style={{ fontSize: 11, color: '#64748b', marginLeft: 8 }}>{inj.games_missed} games missed</span>
                      )}
                      {inj.status && (
                        <span style={{
                          fontSize: 10, fontWeight: 600, marginLeft: 8,
                          color: inj.status === 'active' ? '#EF4444' : inj.status === 'recovered' ? '#2DD4BF' : '#FBBF24',
                        }}>
                          {inj.status}
                        </span>
                      )}
                      {inj.notes && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontStyle: 'italic' }}>{inj.notes}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => {
                          setEditingInjuryId(inj.id)
                          setEditingInjury({
                            body_part: inj.body_part || '',
                            severity: inj.severity || 'minor',
                            injury_date: inj.injury_date || '',
                            games_missed: inj.games_missed != null ? String(inj.games_missed) : '',
                            notes: inj.notes || '',
                            status: inj.status || 'active',
                          })
                        }}
                        style={{
                          background: 'none', border: 'none', color: '#3b82f6',
                          fontSize: 11, cursor: 'pointer', textDecoration: 'underline',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteInjury(inj.id)}
                        style={{
                          background: 'none', border: 'none', color: '#ef4444',
                          fontSize: 11, cursor: 'pointer', textDecoration: 'underline',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* New injury form */}
        <div className="ed-section">
          <h3 className="ed-section-title">Add New Injury</h3>
          <div className="ed-row" style={{ marginBottom: 10 }}>
            <div className="ed-field">
              <label>Body Part *</label>
              <select
                value={newInjury.body_part}
                onChange={e => setNewInjury(i => ({ ...i, body_part: e.target.value }))}
              >
                <option value="">Select body part...</option>
                {Object.entries(BODY_PARTS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="ed-field">
              <label>Severity</label>
              <select
                value={newInjury.severity}
                onChange={e => setNewInjury(i => ({ ...i, severity: e.target.value }))}
              >
                {INJURY_SEVERITY_OPTIONS.map(s => (
                  <option key={s} value={s}>{SEVERITY_COLORS[s]?.label || s}</option>
                ))}
              </select>
            </div>
            <div className="ed-field">
              <label>Status</label>
              <select
                value={newInjury.status}
                onChange={e => setNewInjury(i => ({ ...i, status: e.target.value }))}
              >
                {INJURY_STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="ed-row" style={{ marginBottom: 10 }}>
            <div className="ed-field">
              <label>Date</label>
              <input
                type="date"
                value={newInjury.injury_date}
                onChange={e => setNewInjury(i => ({ ...i, injury_date: e.target.value }))}
              />
            </div>
            <div className="ed-field">
              <label>Games Missed</label>
              <input
                type="number"
                min={0}
                value={newInjury.games_missed}
                onChange={e => setNewInjury(i => ({ ...i, games_missed: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>
          <div className="ed-field">
            <label>Notes</label>
            <textarea
              value={newInjury.notes}
              onChange={e => setNewInjury(i => ({ ...i, notes: e.target.value }))}
              rows={3}
              placeholder="Details about the injury..."
            />
          </div>
          <button
            onClick={handleAddInjury}
            disabled={!newInjury.body_part}
            style={{
              marginTop: 10, background: newInjury.body_part ? 'rgba(168,85,247,0.2)' : '#1e293b',
              border: `1px solid ${newInjury.body_part ? 'rgba(168,85,247,0.4)' : '#334155'}`,
              color: newInjury.body_part ? '#c084fc' : '#475569',
              padding: '8px 20px', borderRadius: 6, fontSize: 13,
              cursor: newInjury.body_part ? 'pointer' : 'not-allowed',
            }}
          >
            Add Injury
          </button>
        </div>
      </div>
    )
  }

  /* ── Render ── */
  return (
    <div className="ed-container" style={{ maxWidth: 1100 }}>
      {/* Top bar */}
      <div className="ed-top-bar">
        <button className="sc-back" onClick={() => navigate('/')}>
          &larr; Big Board
        </button>
        {!isNew && (
          <button className="sc-back" onClick={() => navigate(`/player/${playerId}`)}>
            &larr; Scouting Card
          </button>
        )}
        <h1 className="ed-title">{isNew ? 'Add New Player' : `Edit: ${player.display_name}`}</h1>
      </div>

      {/* Message */}
      {message && (
        <div className={`ed-message ${message.type}`}>{message.text}</div>
      )}

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #1e293b',
      }}>
        {TAB_KEYS.map(key => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === key ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === key ? '#e2e8f0' : '#64748b',
              fontSize: 14,
              fontWeight: activeTab === key ? 700 : 500,
              cursor: 'pointer',
              marginBottom: -2,
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {TAB_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'stats' && renderStatsTab()}
      {activeTab === 'ssa' && renderSSATab()}
      {activeTab === 'measurables' && renderMeasurablesTab()}
      {activeTab === 'bio' && renderBioTab()}
      {activeTab === 'alerts' && renderAlertsTab()}
      {activeTab === 'injuries' && renderInjuriesTab()}

      {/* Save bar */}
      <div className="ed-save-bar">
        <button className="ed-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : isNew ? 'Create Player' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
