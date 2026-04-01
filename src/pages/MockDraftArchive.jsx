import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TierBadge from '../components/TierBadge'
import BucketBadge from '../components/BucketBadge'

export default function MockDraftArchive() {
  const navigate = useNavigate()

  const [mocks, setMocks] = useState([])
  const [teams, setTeams] = useState([])
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)

  // Selected mock for viewing
  const [selectedMockId, setSelectedMockId] = useState(null)
  const [selectedPicks, setSelectedPicks] = useState([])
  const [loadingPicks, setLoadingPicks] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: m }, { data: t }, { data: b }] = await Promise.all([
        supabase.from('mock_drafts').select('*').eq('status', 'completed').order('updated_at', { ascending: false }),
        supabase.from('nba_teams').select('*'),
        supabase.from('master_board').select('*').order('composite_score', { ascending: false, nullsFirst: false }),
      ])
      setMocks(m || [])
      setTeams(t || [])
      setBoard(b || [])
      setLoading(false)
    }
    load()
  }, [])

  const teamMap = useMemo(() => new Map(teams.map(t => [t.team_id, t])), [teams])
  const playerMap = useMemo(() => new Map(board.map(p => [p.player_id, p])), [board])

  const selectedMock = useMemo(() => mocks.find(m => m.id === selectedMockId), [mocks, selectedMockId])

  async function viewMock(mockId) {
    setLoadingPicks(true)
    setSelectedMockId(mockId)
    const { data: picks } = await supabase
      .from('mock_draft_picks')
      .select('*')
      .eq('mock_draft_id', mockId)
      .order('pick_number')
    setSelectedPicks(picks || [])
    setLoadingPicks(false)
  }

  function closeMock() {
    setSelectedMockId(null)
    setSelectedPicks([])
  }

  const getTierColor = (tier) => {
    const colors = {
      'Tier 1 — Generational': '#a855f7',
      'Tier 2 — Franchise': '#3b82f6',
      'Tier 3 — All-Star': '#06b6d4',
      'Tier 4 — High-End Starter': '#22c55e',
      'Tier 5 — Rotation': '#f59e0b',
      'Tier 6 — Development': '#ef4444',
      'Tier 7 — Longshot': '#6b7280',
    }
    return colors[tier] || '#334155'
  }

  if (loading) return <div className="bb-loading">Loading Archive...</div>

  // Viewing a specific mock
  if (selectedMockId && selectedMock) {
    return (
      <div className="mock-container">
        <div className="mock-header">
          <h1>{selectedMock.name}</h1>
          <span className="bb-count">Completed {new Date(selectedMock.updated_at || selectedMock.created_at).toLocaleDateString()}</span>
          <button className="sc-back" onClick={closeMock}>&larr; Back to Archive</button>
          <Link to="/mock-draft" className="bb-dash-btn" style={{ textDecoration: 'none' }}>Mock Draft</Link>
          <button className="sc-back" onClick={() => navigate('/')}>&larr; Big Board</button>
        </div>

        {loadingPicks ? (
          <div className="bb-loading">Loading picks...</div>
        ) : (
          <div>
            {/* Round 1 */}
            <h3 className="mock-round-title">Round 1</h3>
            <div className="mock-picks-grid">
              {selectedPicks.filter(p => p.round === 1).map(pick => {
                const team = teamMap.get(pick.current_team_id)
                const player = pick.player_id ? playerMap.get(pick.player_id) : null
                return (
                  <div
                    key={pick.pick_number}
                    className="mock-pick-slot mock-pick-made"
                    style={player ? { borderLeftColor: getTierColor(player.tier) } : {}}
                  >
                    <div className="mock-pick-top">
                      <span className="mock-pick-num">#{pick.pick_number}</span>
                      <span className="mock-pick-team">{team?.team_name || pick.current_team_id}</span>
                      {pick.is_traded && (
                        <span className="mock-pick-traded">via {pick.original_team_id}</span>
                      )}
                    </div>
                    {player ? (
                      <div className="mock-pick-player">
                        <span className="mock-pick-player-name">{player.display_name}</span>
                        <BucketBadge bucket={player.primary_bucket} />
                      </div>
                    ) : (
                      <div className="mock-pick-empty">--</div>
                    )}
                    {player && (
                      <div className="mock-archive-tier">
                        <TierBadge tier={player.tier} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Round 2 */}
            <h3 className="mock-round-title">Round 2</h3>
            <div className="mock-picks-grid">
              {selectedPicks.filter(p => p.round === 2).map(pick => {
                const team = teamMap.get(pick.current_team_id)
                const player = pick.player_id ? playerMap.get(pick.player_id) : null
                return (
                  <div
                    key={pick.pick_number}
                    className="mock-pick-slot mock-pick-made"
                    style={player ? { borderLeftColor: getTierColor(player.tier) } : {}}
                  >
                    <div className="mock-pick-top">
                      <span className="mock-pick-num">#{pick.pick_number}</span>
                      <span className="mock-pick-team">{team?.team_name || pick.current_team_id}</span>
                      {pick.is_traded && (
                        <span className="mock-pick-traded">via {pick.original_team_id}</span>
                      )}
                    </div>
                    {player ? (
                      <div className="mock-pick-player">
                        <span className="mock-pick-player-name">{player.display_name}</span>
                        <BucketBadge bucket={player.primary_bucket} />
                      </div>
                    ) : (
                      <div className="mock-pick-empty">--</div>
                    )}
                    {player && (
                      <div className="mock-archive-tier">
                        <TierBadge tier={player.tier} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Archive list
  return (
    <div className="mock-container">
      <div className="mock-header">
        <h1>Mock Draft Archive</h1>
        <Link to="/mock-draft" className="bb-dash-btn" style={{ textDecoration: 'none' }}>Back to Mock Draft</Link>
        <button className="sc-back" onClick={() => navigate('/')}>&larr; Big Board</button>
      </div>

      {mocks.length === 0 ? (
        <div className="mock-new-modal">
          <h2>No Completed Mocks</h2>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            Complete a mock draft to see it here.
          </p>
        </div>
      ) : (
        <div className="mock-archive-list">
          {mocks.map(m => (
            <div
              key={m.id}
              className="mock-archive-item"
              onClick={() => viewMock(m.id)}
            >
              <div className="mock-archive-item-main">
                <span className="mock-history-name">{m.name}</span>
                <span className="mock-history-date">
                  {new Date(m.updated_at || m.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="mock-archive-item-meta">
                <span className={`mock-history-status mock-status-${m.status}`}>{m.status}</span>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {m.draft_class} class
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
