import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getRecommendations } from '../lib/needMap'
import TierBadge from '../components/TierBadge'
import BucketBadge from '../components/BucketBadge'

const DEFAULT_DRAFT_ORDER = [
  // 2025-style lottery — customize as needed
  'WAS','BKN','CHA','TOR','PHI','CHI','POR','SAS','NOP','DET',
  'SAC','OKC','MIA','GSW','ATL','MIN','MEM','ORL','MIL','IND',
  'LAC','DEN','PHX','LAL','NYK','HOU','DAL','BOS','CLE','UTA',
  // Round 2
  'WAS','BKN','CHA','TOR','PHI','CHI','POR','SAS','NOP','DET',
  'SAC','OKC','MIA','GSW','ATL','MIN','MEM','ORL','MIL','IND',
  'LAC','DEN','PHX','LAL','NYK','HOU','DAL','BOS','CLE','UTA',
]

export default function MockDraft() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mockIdParam = searchParams.get('id')

  const [teams, setTeams] = useState([])
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)

  // Mock state
  const [mockId, setMockId] = useState(null)
  const [mockName, setMockName] = useState('')
  const [picks, setPicks] = useState([]) // { pick_number, round, original_team_id, current_team_id, player_id, is_traded, trade_notes }
  const [currentPick, setCurrentPick] = useState(1)

  // UI state
  const [poolSearch, setPoolSearch] = useState('')
  const [poolBucket, setPoolBucket] = useState('All')
  const [showNewModal, setShowNewModal] = useState(!mockIdParam)
  const [showTradeModal, setShowTradeModal] = useState(null) // pick_number
  const [tradeTeam, setTradeTeam] = useState('')
  const [tradeNotes, setTradeNotes] = useState('')
  const [confirmPick, setConfirmPick] = useState(null) // { player, pickNumber, team }
  const [showCard, setShowCard] = useState(null) // player_id
  const [saving, setSaving] = useState(false)
  const [savedMocks, setSavedMocks] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  // Auto-save indicator
  const [showSaved, setShowSaved] = useState(false)
  const savedTimerRef = useRef(null)

  // Draft order setup state
  const [showDraftSetup, setShowDraftSetup] = useState(false)
  const [customDraftOrder, setCustomDraftOrder] = useState([...DEFAULT_DRAFT_ORDER])

  useEffect(() => {
    async function load() {
      const [{ data: t }, { data: b }, { data: mocks }] = await Promise.all([
        supabase.from('nba_teams').select('*'),
        supabase.from('master_board').select('*').order('composite_score', { ascending: false, nullsFirst: false }),
        supabase.from('mock_drafts').select('*').order('created_at', { ascending: false }),
      ])
      setTeams(t || [])
      setBoard(b || [])
      setSavedMocks(mocks || [])

      // Load existing mock if ID provided
      if (mockIdParam) {
        const { data: existingPicks } = await supabase
          .from('mock_draft_picks')
          .select('*')
          .eq('mock_draft_id', parseInt(mockIdParam))
          .order('pick_number')

        const mock = (mocks || []).find(m => m.id === parseInt(mockIdParam))
        if (mock) {
          setMockId(mock.id)
          setMockName(mock.name)
          setPicks(existingPicks || [])
          // Find next unpicked
          const lastPicked = (existingPicks || []).filter(p => p.player_id).length
          setCurrentPick(lastPicked + 1)
          setShowNewModal(false)
        }
      }

      setLoading(false)
    }
    load()
  }, [mockIdParam])

  // Cleanup saved timer on unmount
  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  const teamMap = useMemo(() => new Map(teams.map(t => [t.team_id, t])), [teams])

  // Players already drafted in this mock
  const draftedIds = useMemo(() => new Set(picks.filter(p => p.player_id).map(p => p.player_id)), [picks])

  // Available players (not yet drafted)
  const availablePlayers = useMemo(() => {
    return board.filter(p => !draftedIds.has(p.player_id))
  }, [board, draftedIds])

  // Filtered pool for sidebar
  const filteredPool = useMemo(() => {
    let list = availablePlayers
    if (poolBucket !== 'All') {
      list = list.filter(p => p.primary_bucket === poolBucket)
    }
    if (poolSearch.trim()) {
      const q = poolSearch.trim().toLowerCase()
      list = list.filter(p => p.display_name?.toLowerCase().includes(q))
    }
    return list
  }, [availablePlayers, poolBucket, poolSearch])

  // Current team picking
  const currentPickData = useMemo(() => {
    if (currentPick > 60) return null
    const pick = picks.find(p => p.pick_number === currentPick)
    const teamId = pick?.current_team_id || DEFAULT_DRAFT_ORDER[currentPick - 1] || 'WAS'
    return { ...pick, teamId, team: teamMap.get(teamId) }
  }, [currentPick, picks, teamMap])

  // Recommendations for current pick
  const recommendations = useMemo(() => {
    if (!currentPickData?.team) return availablePlayers.slice(0, 3).map(p => ({ ...p, matchedNeed: 'BPA' }))
    return getRecommendations(currentPickData.team, availablePlayers, 3)
  }, [currentPickData, availablePlayers])

  // Flash the "Saved" indicator
  function flashSaved() {
    setShowSaved(true)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => setShowSaved(false), 2000)
  }

  // Create new mock draft - now goes to draft order setup
  function handleCreateClick() {
    setCustomDraftOrder([...DEFAULT_DRAFT_ORDER])
    setShowDraftSetup(true)
  }

  // Actually create the mock with the custom draft order
  async function createMock(name, draftOrder) {
    setSaving(true)
    const { data: mock, error } = await supabase
      .from('mock_drafts')
      .insert({ name, draft_class: '2026', status: 'in_progress' })
      .select()
      .single()

    if (error) { console.error(error); setSaving(false); return }

    // Create 60 pick slots using custom draft order
    const pickRows = draftOrder.map((teamId, i) => ({
      mock_draft_id: mock.id,
      pick_number: i + 1,
      round: i < 30 ? 1 : 2,
      original_team_id: DEFAULT_DRAFT_ORDER[i],
      current_team_id: teamId,
      is_traded: teamId !== DEFAULT_DRAFT_ORDER[i],
    }))

    const { data: createdPicks, error: e2 } = await supabase
      .from('mock_draft_picks')
      .insert(pickRows)
      .select()

    if (e2) { console.error(e2); setSaving(false); return }

    setMockId(mock.id)
    setMockName(mock.name)
    setPicks(createdPicks || [])
    setCurrentPick(1)
    setShowNewModal(false)
    setShowDraftSetup(false)
    setSaving(false)

    // Update URL
    window.history.replaceState(null, '', `/mock-draft?id=${mock.id}`)
  }

  // Make a pick
  async function makePick(playerId) {
    const pick = picks.find(p => p.pick_number === currentPick)
    if (!pick) return

    const { error } = await supabase
      .from('mock_draft_picks')
      .update({ player_id: playerId })
      .eq('id', pick.id)

    if (error) { console.error(error); return }

    // Update the mock_drafts updated_at timestamp
    if (mockId) {
      await supabase
        .from('mock_drafts')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', mockId)
    }

    setPicks(prev => prev.map(p =>
      p.pick_number === currentPick ? { ...p, player_id: playerId } : p
    ))
    setCurrentPick(prev => prev + 1)
    setConfirmPick(null)
    flashSaved()
  }

  // Undo last pick
  async function undoLastPick() {
    const lastPick = currentPick - 1
    if (lastPick < 1) return

    const pick = picks.find(p => p.pick_number === lastPick)
    if (!pick) return

    const { error } = await supabase
      .from('mock_draft_picks')
      .update({ player_id: null })
      .eq('id', pick.id)

    if (error) { console.error(error); return }

    setPicks(prev => prev.map(p =>
      p.pick_number === lastPick ? { ...p, player_id: null } : p
    ))
    setCurrentPick(lastPick)
  }

  // Trade a pick
  async function executeTrade() {
    if (!showTradeModal || !tradeTeam) return

    const pick = picks.find(p => p.pick_number === showTradeModal)
    if (!pick) return

    const { error } = await supabase
      .from('mock_draft_picks')
      .update({
        current_team_id: tradeTeam,
        is_traded: true,
        trade_notes: tradeNotes || null,
      })
      .eq('id', pick.id)

    if (error) { console.error(error); return }

    setPicks(prev => prev.map(p =>
      p.pick_number === showTradeModal
        ? { ...p, current_team_id: tradeTeam, is_traded: true, trade_notes: tradeNotes || null }
        : p
    ))
    setShowTradeModal(null)
    setTradeTeam('')
    setTradeNotes('')
  }

  // Complete mock
  async function completeMock() {
    if (!mockId) return
    await supabase.from('mock_drafts').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', mockId)
  }

  function getPlayerName(playerId) {
    return board.find(p => p.player_id === playerId)?.display_name || playerId
  }

  function getPlayerData(playerId) {
    return board.find(p => p.player_id === playerId)
  }

  const getTierColor = (tier) => {
    const colors = {
      'Generational': '#DFFF00',
      'Franchise': '#2DD4BF',
      'All-Star': '#34D399',
      'High-End Starter': '#60A5FA',
      'Solid Starter': '#60A5FA',
      'Rotation': '#FBBF24',
      'Development': '#FB923C',
      'Longshot': '#F87171',
    }
    // Support both old and new tier formats
    const label = tier?.replace(/^Tier \d+ — /, '') || ''
    return colors[label] || colors[tier] || '#242C45'
  }

  // Update a single pick in the custom draft order
  function updateDraftOrderPick(index, newTeamId) {
    setCustomDraftOrder(prev => {
      const next = [...prev]
      next[index] = newTeamId
      return next
    })
  }

  if (loading) return <div className="bb-loading">Loading Mock Draft...</div>

  // Draft Order Setup Screen
  if (showDraftSetup) {
    return (
      <div className="mock-container">
        <div className="mock-header">
          <h1>Draft Order Setup</h1>
          <button className="sc-back" onClick={() => { setShowDraftSetup(false) }}>&larr; Back</button>
        </div>
        <div className="mock-new-modal" style={{ maxWidth: 1200 }}>
          <h2>Customize Draft Order</h2>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
            Edit the team for any pick to reflect trades. Pre-populated with the default 2025-style lottery order.
          </p>

          <h3 className="mock-round-title">Round 1</h3>
          <div className="mock-setup-grid">
            {customDraftOrder.slice(0, 30).map((teamId, i) => (
              <div key={i} className="mock-setup-pick">
                <div className="mock-setup-pick-header">
                  <span className="mock-pick-num">#{i + 1}</span>
                  <span style={{ fontSize: 10, color: '#64748b' }}>R1</span>
                </div>
                <select
                  className="mock-setup-select"
                  value={teamId}
                  onChange={e => updateDraftOrderPick(i, e.target.value)}
                >
                  {teams.map(t => (
                    <option key={t.team_id} value={t.team_id}>{t.team_id}</option>
                  ))}
                </select>
                {teamId !== DEFAULT_DRAFT_ORDER[i] && (
                  <span className="mock-setup-traded">Traded</span>
                )}
              </div>
            ))}
          </div>

          <h3 className="mock-round-title">Round 2</h3>
          <div className="mock-setup-grid">
            {customDraftOrder.slice(30, 60).map((teamId, i) => (
              <div key={i + 30} className="mock-setup-pick">
                <div className="mock-setup-pick-header">
                  <span className="mock-pick-num">#{i + 31}</span>
                  <span style={{ fontSize: 10, color: '#64748b' }}>R2</span>
                </div>
                <select
                  className="mock-setup-select"
                  value={teamId}
                  onChange={e => updateDraftOrderPick(i + 30, e.target.value)}
                >
                  {teams.map(t => (
                    <option key={t.team_id} value={t.team_id}>{t.team_id}</option>
                  ))}
                </select>
                {teamId !== DEFAULT_DRAFT_ORDER[i + 30] && (
                  <span className="mock-setup-traded">Traded</span>
                )}
              </div>
            ))}
          </div>

          <div className="mock-new-actions" style={{ marginTop: 20 }}>
            <button
              className="dr-save-btn"
              onClick={() => createMock(mockName || 'Mock Draft', customDraftOrder)}
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Start Draft'}
            </button>
            <button
              className="mock-cancel-btn"
              onClick={() => {
                setCustomDraftOrder([...DEFAULT_DRAFT_ORDER])
              }}
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    )
  }

  // New mock modal
  if (showNewModal) {
    return (
      <div className="mock-container">
        <div className="mock-header">
          <h1>Mock Draft</h1>
          <button className="sc-back" onClick={() => navigate('/')}>&larr; Big Board</button>
        </div>
        <div className="mock-new-modal">
          <h2>Start New Mock Draft</h2>
          <div className="ed-field">
            <label>Mock Name</label>
            <input
              value={mockName}
              onChange={e => setMockName(e.target.value)}
              placeholder="e.g. Post-Lottery Mock v1"
              className="mock-name-input"
            />
          </div>
          <div className="mock-new-actions">
            <button
              className="dr-save-btn"
              onClick={handleCreateClick}
              disabled={saving}
            >
              Next: Set Draft Order
            </button>
          </div>

          {savedMocks.length > 0 && (
            <div className="mock-history-section">
              <h3 className="dash-section-title">Previous Mocks</h3>
              <div className="mock-history-list">
                {savedMocks.map(m => (
                  <div
                    key={m.id}
                    className="mock-history-item"
                    onClick={() => {
                      window.location.href = `/mock-draft?id=${m.id}`
                    }}
                  >
                    <span className="mock-history-name">{m.name}</span>
                    <span className={`mock-history-status mock-status-${m.status}`}>{m.status}</span>
                    <span className="mock-history-date">{new Date(m.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const isComplete = currentPick > 60

  return (
    <div className="mock-container">
      <div className="mock-header">
        <h1>{mockName || 'Mock Draft'}</h1>
        <span className="bb-count">Pick {Math.min(currentPick, 60)} of 60</span>
        {showSaved && <span className="mock-saved-indicator">Saved</span>}
        <button className="sc-back" onClick={() => navigate('/')}>&larr; Big Board</button>
        {currentPick > 1 && (
          <button className="mock-undo-btn" onClick={undoLastPick}>Undo Last Pick</button>
        )}
        {isComplete && (
          <button className="dr-save-btn" onClick={completeMock}>Mark Complete</button>
        )}
        <button className="bb-dash-btn" onClick={() => navigate('/team-needs')}>Team Needs</button>
        <Link to="/mock-draft/archive" className="bb-dash-btn" style={{ textDecoration: 'none' }}>Archive</Link>
        <button className="bb-dash-btn" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? 'Hide History' : 'History'}
        </button>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="mock-history-section" style={{ marginBottom: 20 }}>
          <h3 className="dash-section-title">Saved Mocks</h3>
          <div className="mock-history-list">
            {savedMocks.map(m => (
              <div
                key={m.id}
                className={`mock-history-item ${m.id === mockId ? 'mock-history-active' : ''}`}
                onClick={() => { window.location.href = `/mock-draft?id=${m.id}` }}
              >
                <span className="mock-history-name">{m.name}</span>
                <span className={`mock-history-status mock-status-${m.status}`}>{m.status}</span>
                <span className="mock-history-date">{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mock-layout">
        {/* Left: Draft Board */}
        <div className="mock-board">
          {/* Recommendations */}
          {!isComplete && currentPickData && (
            <div className="mock-recs">
              <div className="mock-recs-header">
                <h3>Recommended for {teamMap.get(currentPickData.teamId)?.team_name || currentPickData.teamId}</h3>
                <span className="mock-recs-needs">
                  {[currentPickData.team?.need_1, currentPickData.team?.need_2, currentPickData.team?.need_3]
                    .filter(Boolean).join(' · ') || 'No needs set'}
                </span>
              </div>
              <div className="mock-recs-list">
                {recommendations.map(r => (
                  <div
                    key={r.player_id}
                    className="mock-rec-card"
                    onClick={() => setConfirmPick({
                      player: r,
                      pickNumber: currentPick,
                      team: teamMap.get(currentPickData.teamId),
                    })}
                  >
                    <div className="mock-rec-top">
                      <span className="mock-rec-name">{r.display_name}</span>
                      <BucketBadge bucket={r.primary_bucket} />
                    </div>
                    <div className="mock-rec-bottom">
                      <span className="mock-rec-archetype">{r.style_archetype || '—'}</span>
                      <span className="mock-rec-score">{r.composite_score?.toFixed(4)}</span>
                      <span className="mock-rec-need">{r.matchedNeed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Round 1 */}
          <h3 className="mock-round-title">Round 1</h3>
          <div className="mock-picks-grid">
            {picks.filter(p => p.round === 1).map(pick => {
              const team = teamMap.get(pick.current_team_id)
              const player = pick.player_id ? getPlayerData(pick.player_id) : null
              const isCurrent = pick.pick_number === currentPick
              return (
                <div
                  key={pick.pick_number}
                  className={`mock-pick-slot ${isCurrent ? 'mock-pick-current' : ''} ${pick.player_id ? 'mock-pick-made' : ''}`}
                  style={player ? { borderLeftColor: getTierColor(player.tier) } : {}}
                >
                  <div className="mock-pick-top">
                    <span className="mock-pick-num">#{pick.pick_number}</span>
                    <span className="mock-pick-team">{team?.team_name || pick.current_team_id}</span>
                    {pick.is_traded && (
                      <span className="mock-pick-traded">via {pick.original_team_id}</span>
                    )}
                    {!pick.player_id && (
                      <button
                        className="mock-trade-btn"
                        onClick={e => { e.stopPropagation(); setShowTradeModal(pick.pick_number); setTradeTeam(''); setTradeNotes('') }}
                      >
                        Trade
                      </button>
                    )}
                  </div>
                  {player ? (
                    <div className="mock-pick-player" onClick={() => setShowCard(player.player_id)}>
                      <span className="mock-pick-player-name">{player.display_name}</span>
                      <BucketBadge bucket={player.primary_bucket} />
                    </div>
                  ) : (
                    <div className="mock-pick-empty">
                      {isCurrent ? 'On the clock...' : '—'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Round 2 */}
          <h3 className="mock-round-title">Round 2</h3>
          <div className="mock-picks-grid">
            {picks.filter(p => p.round === 2).map(pick => {
              const team = teamMap.get(pick.current_team_id)
              const player = pick.player_id ? getPlayerData(pick.player_id) : null
              const isCurrent = pick.pick_number === currentPick
              return (
                <div
                  key={pick.pick_number}
                  className={`mock-pick-slot ${isCurrent ? 'mock-pick-current' : ''} ${pick.player_id ? 'mock-pick-made' : ''}`}
                  style={player ? { borderLeftColor: getTierColor(player.tier) } : {}}
                >
                  <div className="mock-pick-top">
                    <span className="mock-pick-num">#{pick.pick_number}</span>
                    <span className="mock-pick-team">{team?.team_name || pick.current_team_id}</span>
                    {pick.is_traded && (
                      <span className="mock-pick-traded">via {pick.original_team_id}</span>
                    )}
                    {!pick.player_id && (
                      <button
                        className="mock-trade-btn"
                        onClick={e => { e.stopPropagation(); setShowTradeModal(pick.pick_number); setTradeTeam(''); setTradeNotes('') }}
                      >
                        Trade
                      </button>
                    )}
                  </div>
                  {player ? (
                    <div className="mock-pick-player" onClick={() => setShowCard(player.player_id)}>
                      <span className="mock-pick-player-name">{player.display_name}</span>
                      <BucketBadge bucket={player.primary_bucket} />
                    </div>
                  ) : (
                    <div className="mock-pick-empty">
                      {isCurrent ? 'On the clock...' : '—'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Prospect Pool Sidebar */}
        <div className="mock-pool">
          <div className="mock-pool-header">
            <h3>Prospect Pool</h3>
            <span className="mock-pool-count">{availablePlayers.length} of {board.length} remaining</span>
          </div>
          <div className="mock-pool-filters">
            <input
              type="text"
              placeholder="Search..."
              value={poolSearch}
              onChange={e => setPoolSearch(e.target.value)}
              className="mock-pool-search"
            />
            <select value={poolBucket} onChange={e => setPoolBucket(e.target.value)} className="mock-pool-select">
              <option value="All">All</option>
              <option value="Guard">G</option>
              <option value="Wing">W</option>
              <option value="Big">B</option>
            </select>
          </div>
          <div className="mock-pool-list">
            {filteredPool.map(p => (
              <div
                key={p.player_id}
                className="mock-pool-item"
                onClick={() => {
                  if (currentPick <= 60) {
                    setConfirmPick({
                      player: p,
                      pickNumber: currentPick,
                      team: teamMap.get(picks.find(pk => pk.pick_number === currentPick)?.current_team_id),
                    })
                  }
                }}
              >
                <span className="mock-pool-rank">#{p.overall_rank}</span>
                <span className="mock-pool-name">{p.display_name}</span>
                <BucketBadge bucket={p.primary_bucket} />
                <span className="mock-pool-score">{p.composite_score?.toFixed(3)}</span>
                <button
                  className="mock-pool-view"
                  onClick={e => { e.stopPropagation(); setShowCard(p.player_id) }}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Pick Modal */}
      {confirmPick && (
        <div className="mock-modal-overlay" onClick={() => setConfirmPick(null)}>
          <div className="mock-modal" onClick={e => e.stopPropagation()}>
            <h3>Confirm Pick</h3>
            <p className="mock-confirm-text">
              <strong>{confirmPick.player.display_name}</strong> to{' '}
              <strong>{confirmPick.team?.team_name || 'Team'}</strong> at pick{' '}
              <strong>#{confirmPick.pickNumber}</strong>?
            </p>
            <div className="mock-confirm-details">
              <BucketBadge bucket={confirmPick.player.primary_bucket} />
              <span>{confirmPick.player.style_archetype}</span>
              <TierBadge tier={confirmPick.player.tier} />
            </div>
            <div className="mock-modal-actions">
              <button className="dr-save-btn" onClick={() => makePick(confirmPick.player.player_id)}>
                Confirm Pick
              </button>
              <button className="mock-cancel-btn" onClick={() => setConfirmPick(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Modal */}
      {showTradeModal && (
        <div className="mock-modal-overlay" onClick={() => setShowTradeModal(null)}>
          <div className="mock-modal" onClick={e => e.stopPropagation()}>
            <h3>Trade Pick #{showTradeModal}</h3>
            <div className="ed-field">
              <label>New Team</label>
              <select value={tradeTeam} onChange={e => setTradeTeam(e.target.value)} className="bb-select">
                <option value="">Select team...</option>
                {teams.map(t => (
                  <option key={t.team_id} value={t.team_id}>{t.team_name}</option>
                ))}
              </select>
            </div>
            <div className="ed-field">
              <label>Trade Notes</label>
              <input
                value={tradeNotes}
                onChange={e => setTradeNotes(e.target.value)}
                placeholder="e.g. Via BKN in Simmons trade"
                className="mock-name-input"
              />
            </div>
            <div className="mock-modal-actions">
              <button className="dr-save-btn" onClick={executeTrade} disabled={!tradeTeam}>Execute Trade</button>
              <button className="mock-cancel-btn" onClick={() => setShowTradeModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Scouting Card Popup */}
      {showCard && (
        <div className="mock-modal-overlay" onClick={() => setShowCard(null)}>
          <div className="mock-card-popup" onClick={e => e.stopPropagation()}>
            <div className="mock-card-popup-header">
              <button className="mock-cancel-btn" onClick={() => setShowCard(null)}>Close</button>
              <button
                className="dr-save-btn"
                onClick={() => navigate(`/player/${showCard}`)}
              >
                Full Card
              </button>
            </div>
            <ScoutingMiniCard playerId={showCard} board={board} />
          </div>
        </div>
      )}
    </div>
  )
}

// Mini scouting card for popup overlay
function ScoutingMiniCard({ playerId, board }) {
  const player = board.find(p => p.player_id === playerId)
  if (!player) return <div className="bb-loading">Player not found</div>

  return (
    <div className="mock-mini-card">
      <h2>{player.display_name}</h2>
      <div className="mock-mini-row">
        <BucketBadge bucket={player.primary_bucket} />
        <span className="mock-mini-archetype">{player.style_archetype || '—'}</span>
        <TierBadge tier={player.tier} />
      </div>
      <div className="mock-mini-scores">
        <div className="mock-mini-score">
          <span className="mock-mini-score-label">RAUS</span>
          <span className="mock-mini-score-val">{player.raus_final?.toFixed(2) || '—'}</span>
        </div>
        <div className="mock-mini-score">
          <span className="mock-mini-score-label">SSA</span>
          <span className="mock-mini-score-val">{player.ssa?.toFixed(2) || '—'}</span>
        </div>
        <div className="mock-mini-score">
          <span className="mock-mini-score-label">AAA</span>
          <span className="mock-mini-score-val">{player.aaa?.toFixed(2) || '—'}</span>
        </div>
        <div className="mock-mini-score">
          <span className="mock-mini-score-label">OAI</span>
          <span className="mock-mini-score-val">{player.oai?.toFixed(2) || '—'}</span>
        </div>
        <div className="mock-mini-score">
          <span className="mock-mini-score-label">Composite</span>
          <span className="mock-mini-score-val mock-mini-comp">{player.composite_score?.toFixed(4) || '—'}</span>
        </div>
      </div>
      {player.dna_flag && (
        <div className="mock-mini-dna">DNA Flag: Max {player.dna_max}</div>
      )}
      <div className="mock-mini-rank">
        Big Board Rank: <strong>#{player.overall_rank}</strong>
      </div>
    </div>
  )
}
