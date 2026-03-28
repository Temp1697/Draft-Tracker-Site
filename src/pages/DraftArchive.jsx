import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TierBadge from '../components/TierBadge'
import BucketBadge from '../components/BucketBadge'

export default function DraftArchive() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedClass = searchParams.get('class') || ''

  const [archived, setArchived] = useState([])
  const [board, setBoard] = useState([])
  const [historical, setHistorical] = useState([])
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState([])

  useEffect(() => {
    async function load() {
      // Get all archived/drafted players
      const { data: players } = await supabase
        .from('players')
        .select('*')
        .in('draft_status', ['drafted', 'undrafted', 'archived'])

      // Get their board data
      const { data: boardData } = await supabase
        .from('master_board')
        .select('*')

      // Get historical records (for accuracy tracking)
      const { data: hist } = await supabase
        .from('historical_players')
        .select('*')
        .not('source_player_id', 'is', null)

      setArchived(players || [])
      setBoard(boardData || [])
      setHistorical(hist || [])

      // Derive available classes
      const classSet = new Set((players || []).map(p => p.draft_class).filter(Boolean))
      const sorted = Array.from(classSet).sort().reverse()
      setClasses(sorted)

      // Default to most recent if none selected
      if (!selectedClass && sorted.length > 0) {
        setSearchParams({ class: sorted[0] })
      }

      setLoading(false)
    }
    load()
  }, [])

  const boardMap = useMemo(() => new Map(board.map(b => [b.player_id, b])), [board])
  const histMap = useMemo(() => new Map(historical.map(h => [h.source_player_id, h])), [historical])

  const filteredPlayers = useMemo(() => {
    if (!selectedClass) return []
    return archived
      .filter(p => p.draft_class === selectedClass)
      .map(p => ({
        ...p,
        ...(boardMap.get(p.player_id) || {}),
        hist: histMap.get(p.player_id),
      }))
      .sort((a, b) => {
        // Drafted first (by pick), then undrafted
        if (a.draft_status === 'drafted' && b.draft_status !== 'drafted') return -1
        if (a.draft_status !== 'drafted' && b.draft_status === 'drafted') return 1
        if (a.draft_pick && b.draft_pick) return a.draft_pick - b.draft_pick
        return (a.overall_rank || 999) - (b.overall_rank || 999)
      })
  }, [archived, selectedClass, boardMap, histMap])

  // Accuracy stats
  const accuracy = useMemo(() => {
    const drafted = filteredPlayers.filter(p => p.draft_status === 'drafted' || p.draft_status === 'archived')
    if (drafted.length === 0) return null

    let pickDeviations = []
    let tierHits = 0
    let tierTotal = 0

    for (const p of drafted) {
      if (p.draft_pick && p.overall_rank) {
        pickDeviations.push(Math.abs(p.draft_pick - p.overall_rank))
      }

      // Check tier accuracy against actual NBA outcome (if available)
      const h = p.hist
      if (h && h.outcome_label && p.tier) {
        tierTotal++
        const tierNum = parseInt(p.tier.match(/Tier (\d)/)?.[1] || '0')
        const isGoodOutcome = ['Star', 'All-Star', 'Starter', 'Quality Starter'].includes(h.outcome_label)
        const isGoodTier = tierNum <= 4
        if ((isGoodOutcome && isGoodTier) || (!isGoodOutcome && !isGoodTier)) tierHits++
      }
    }

    const avgDeviation = pickDeviations.length > 0
      ? (pickDeviations.reduce((a, b) => a + b, 0) / pickDeviations.length).toFixed(1)
      : null

    return {
      totalDrafted: drafted.length,
      avgDeviation,
      tierAccuracy: tierTotal > 0 ? Math.round((tierHits / tierTotal) * 100) : null,
      tierTotal,
    }
  }, [filteredPlayers])

  if (loading) return <div className="bb-loading">Loading archive...</div>

  return (
    <div className="arch-container">
      <div className="arch-header">
        <h1>Draft Archive</h1>
        <button className="sc-back" onClick={() => navigate('/')}>&larr; Big Board</button>
      </div>

      {classes.length === 0 ? (
        <div className="arch-empty">
          <p>No archived draft classes yet.</p>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
            Use the Draft Results page to record picks after the draft, then archive players to build your historical database.
          </p>
        </div>
      ) : (
        <>
          <div className="arch-controls">
            <select
              value={selectedClass}
              onChange={e => setSearchParams({ class: e.target.value })}
              className="bb-select arch-class-select"
            >
              {classes.map(c => (
                <option key={c} value={c}>{c} Draft Class</option>
              ))}
            </select>
          </div>

          {/* Accuracy Report Card */}
          {accuracy && (
            <div className="arch-accuracy">
              <h3 className="dash-section-title">
                {selectedClass} Draft — Model Report Card
              </h3>
              <div className="arch-accuracy-row">
                <div className="dash-stat-card">
                  <span className="dash-stat-big">{accuracy.totalDrafted}</span>
                  <span className="dash-stat-label">Players Drafted</span>
                </div>
                {accuracy.avgDeviation && (
                  <div className="dash-stat-card">
                    <span className="dash-stat-big">{accuracy.avgDeviation}</span>
                    <span className="dash-stat-label">Avg Pick Deviation</span>
                  </div>
                )}
                {accuracy.tierAccuracy !== null && (
                  <div className="dash-stat-card">
                    <span className="dash-stat-big">{accuracy.tierAccuracy}%</span>
                    <span className="dash-stat-label">Tier Accuracy ({accuracy.tierTotal} tracked)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Archived Big Board */}
          <div className="bb-table-wrap">
            <table className="bb-table">
              <thead>
                <tr>
                  <th>Board #</th>
                  <th>Player</th>
                  <th>Pos</th>
                  <th>Archetype</th>
                  <th>Tier</th>
                  <th>RAUS</th>
                  <th>Composite</th>
                  <th>Draft Result</th>
                  <th>NBA Outcome</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((p, i) => (
                  <tr
                    key={p.player_id}
                    className={`${i % 2 === 0 ? 'bb-row-even' : ''} ${p.draft_status === 'undrafted' ? 'dr-row-undrafted' : ''}`}
                    onClick={() => navigate(`/player/${p.player_id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="bb-rank">{p.overall_rank || '—'}</td>
                    <td className="bb-name">{p.display_name}</td>
                    <td><BucketBadge bucket={p.primary_bucket} /></td>
                    <td className="bb-archetype">{p.style_archetype || '—'}</td>
                    <td><TierBadge tier={p.tier} /></td>
                    <td className="bb-num">{p.raus_final?.toFixed(2) || '—'}</td>
                    <td className="bb-num">{p.composite_score?.toFixed(4) || '—'}</td>
                    <td>
                      {p.draft_status === 'drafted' || p.draft_status === 'archived' ? (
                        <span className="arch-pick">
                          #{p.draft_pick} — {p.draft_team || '?'}
                        </span>
                      ) : (
                        <span className="arch-undrafted">Undrafted</span>
                      )}
                    </td>
                    <td>
                      {p.hist ? (
                        <span className={`sc-outcome-${p.hist.outcome_label?.toLowerCase().replace(/\s/g, '') || 'unknown'}`}>
                          {p.hist.outcome_label || '—'}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredPlayers.length === 0 && (
                  <tr><td colSpan={9} className="bb-empty">No archived players for this class</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
