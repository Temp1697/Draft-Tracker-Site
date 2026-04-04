import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { recalculateAll } from '../lib/engine/index.js'
import TierBadge from '../components/TierBadge'
import BucketBadge from '../components/BucketBadge'
import { RAUS_TIERS } from '../lib/tiers'

const TIER_ORDER = RAUS_TIERS.map(t => t.label)

const TIER_COLORS = Object.fromEntries(RAUS_TIERS.map(t => [t.label, t.color]))

const BUCKET_COLORS = { Guard: '#60A5FA', Wing: '#34D399', Big: '#FBBF24' }

export default function Dashboard() {
  const navigate = useNavigate()
  const [board, setBoard] = useState([])
  const [prospects, setProspects] = useState([])
  const [alerts, setAlerts] = useState([])
  const [athletic, setAthletic] = useState([])
  const [ssaScores, setSSA] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [recalcStatus, setRecalcStatus] = useState(null)
  const [recalcLog, setRecalcLog] = useState([])

  useEffect(() => {
    async function load() {
      const [
        { data: b }, { data: p }, { data: a }, { data: ath }, { data: ssa }, { data: st }, { data: pl },
      ] = await Promise.all([
        supabase.from('master_board').select('*').order('overall_rank'),
        supabase.from('prospects').select('player_id, class, team'),
        supabase.from('player_alerts').select('*').order('report_date', { ascending: false }).limit(20),
        supabase.from('athletic_scores').select('player_id, oai, aaa'),
        supabase.from('ssa_scores').select('player_id, ssa_auto_final'),
        supabase.from('stats').select('player_id'),
        supabase.from('players').select('player_id, draft_status'),
      ])
      // Filter to active prospects only (exclude historical/legendary archive players)
      const activeIds = new Set((pl || []).filter(p => p.draft_status === 'prospect' || !p.draft_status).map(p => p.player_id))
      setBoard((b || []).filter(r => activeIds.has(r.player_id)))
      setProspects(p || [])
      setAlerts(a || [])
      setAthletic((ath || []).filter(r => activeIds.has(r.player_id)))
      setSSA((ssa || []).filter(r => activeIds.has(r.player_id)))
      setStats((st || []).filter(r => activeIds.has(r.player_id)))
      setLoading(false)
    }
    load()
  }, [])

  const prospectMap = useMemo(() => new Map(prospects.map(p => [p.player_id, p])), [prospects])

  // Class overview
  const classStats = useMemo(() => {
    const counts = {}
    for (const p of board) {
      const cls = prospectMap.get(p.player_id)?.class || 'Unknown'
      if (!counts[cls]) counts[cls] = { count: 0, totalRaus: 0, totalComp: 0 }
      counts[cls].count++
      counts[cls].totalRaus += p.raus_final || 0
      counts[cls].totalComp += p.composite_score || 0
    }
    return Object.entries(counts)
      .map(([cls, d]) => ({
        class: cls.toUpperCase(),
        count: d.count,
        avgRaus: d.count > 0 ? (d.totalRaus / d.count).toFixed(2) : '—',
        avgComp: d.count > 0 ? (d.totalComp / d.count).toFixed(4) : '—',
      }))
      .sort((a, b) => b.count - a.count)
  }, [board, prospectMap])

  // Tier distribution
  const tierDist = useMemo(() => {
    const counts = {}
    for (const p of board) {
      const t = p.tier || 'Unclassified'
      counts[t] = (counts[t] || 0) + 1
    }
    return TIER_ORDER.filter(t => counts[t]).map(t => ({ tier: t, count: counts[t] }))
  }, [board])

  const maxTierCount = Math.max(...tierDist.map(t => t.count), 1)

  // Bucket breakdown
  const bucketDist = useMemo(() => {
    const counts = {}
    for (const p of board) {
      const b = p.primary_bucket || 'Unknown'
      if (!counts[b]) counts[b] = { count: 0, avgRaus: 0, topPlayer: null, topComp: -1 }
      counts[b].count++
      counts[b].avgRaus += p.raus_final || 0
      if ((p.composite_score || 0) > counts[b].topComp) {
        counts[b].topComp = p.composite_score || 0
        counts[b].topPlayer = p.display_name
      }
    }
    return ['Guard', 'Wing', 'Big'].map(b => ({
      bucket: b,
      count: counts[b]?.count || 0,
      avgRaus: counts[b]?.count > 0 ? (counts[b].avgRaus / counts[b].count).toFixed(2) : '—',
      topPlayer: counts[b]?.topPlayer || '—',
    }))
  }, [board])

  // Data gaps
  const dataGaps = useMemo(() => {
    const athSet = new Set(athletic.filter(a => (a.oai > 0 || a.aaa > 0)).map(a => a.player_id))
    const ssaSet = new Set(ssaScores.filter(s => s.ssa_auto_final != null).map(s => s.player_id))
    const statsSet = new Set(stats.map(s => s.player_id))

    const gaps = []
    for (const p of board) {
      const missing = []
      if (!athSet.has(p.player_id)) missing.push('OAI/AAA')
      if (!ssaSet.has(p.player_id)) missing.push('SSA')
      if (!statsSet.has(p.player_id)) missing.push('Stats')
      if (missing.length > 0) {
        gaps.push({
          player_id: p.player_id,
          display_name: p.display_name,
          rank: p.overall_rank,
          bucket: p.primary_bucket,
          missing,
        })
      }
    }
    return gaps.sort((a, b) => a.rank - b.rank)
  }, [board, athletic, ssaScores, stats])

  async function handleRecalculate() {
    if (recalculating) return
    setRecalculating(true)
    setRecalcLog([])
    setRecalcStatus(null)
    try {
      const result = await recalculateAll((msg) => {
        setRecalcLog(prev => [...prev, msg])
      })
      setRecalcStatus(result)
      if (result.success) {
        // Reload board data — active prospects only
        const [{ data: b }, { data: pl }] = await Promise.all([
          supabase.from('master_board').select('*').order('overall_rank'),
          supabase.from('players').select('player_id, draft_status'),
        ])
        const activeIds = new Set((pl || []).filter(p => p.draft_status === 'prospect' || !p.draft_status).map(p => p.player_id))
        if (b) setBoard(b.filter(r => activeIds.has(r.player_id)))
      }
    } catch (err) {
      setRecalcStatus({ success: false, errors: [err.message], playerCount: 0 })
    }
    setRecalculating(false)
  }

  if (loading) return <div className="bb-loading">Loading dashboard...</div>

  return (
    <div className="dash-container">
      <div className="dash-header">
        <h1>Dashboard</h1>
        <button className="sc-back" onClick={() => navigate('/')}>&larr; Big Board</button>
        <button
          className="dr-save-btn"
          onClick={handleRecalculate}
          disabled={recalculating}
          style={{ marginLeft: 'auto' }}
        >
          {recalculating ? 'Recalculating...' : 'Recalculate All'}
        </button>
      </div>

      {/* Recalculation log */}
      {(recalcLog.length > 0 || recalcStatus) && (
        <div style={{
          background: '#0f172a', border: '1px solid #334155', borderRadius: 10,
          padding: '12px 16px', marginBottom: 16, maxHeight: 200, overflowY: 'auto',
          fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6,
        }}>
          {recalcLog.map((msg, i) => (
            <div key={i} style={{ color: '#94a3b8' }}>{msg}</div>
          ))}
          {recalcStatus && (
            <div style={{
              marginTop: 8, fontWeight: 700,
              color: recalcStatus.success ? '#4ade80' : '#f87171',
            }}>
              {recalcStatus.success
                ? `Done! ${recalcStatus.playerCount} players recalculated.`
                : `Finished with ${recalcStatus.errors.length} error(s): ${recalcStatus.errors.join('; ')}`
              }
            </div>
          )}
        </div>
      )}

      {/* Top stats row */}
      <div className="dash-stats-row">
        <div className="dash-stat-card">
          <span className="dash-stat-big">{board.length}</span>
          <span className="dash-stat-label">Total Prospects</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-big">{board.filter(p => p.raus_final >= 7).length}</span>
          <span className="dash-stat-label">RAUS 7.0+</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-big">{dataGaps.length}</span>
          <span className="dash-stat-label dash-stat-warn">Data Gaps</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-big">{alerts.length}</span>
          <span className="dash-stat-label">Recent Alerts</span>
        </div>
      </div>

      <div className="dash-grid">
        {/* Tier Distribution */}
        <div className="dash-card">
          <h3 className="dash-section-title">Tier Distribution</h3>
          <div className="dash-bars">
            {tierDist.map(t => (
              <div key={t.tier} className="dash-bar-row">
                <div className="dash-bar-label">
                  <TierBadge tier={t.tier} />
                </div>
                <div className="dash-bar-track">
                  <div
                    className="dash-bar-fill"
                    style={{
                      width: `${(t.count / maxTierCount) * 100}%`,
                      background: TIER_COLORS[t.tier] || '#6b7280',
                    }}
                  />
                </div>
                <span className="dash-bar-count">{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bucket Breakdown */}
        <div className="dash-card">
          <h3 className="dash-section-title">Position Breakdown</h3>
          <div className="dash-bucket-grid">
            {bucketDist.map(b => (
              <div key={b.bucket} className="dash-bucket-card" style={{ borderLeftColor: BUCKET_COLORS[b.bucket] }}>
                <div className="dash-bucket-header">
                  <BucketBadge bucket={b.bucket} />
                  <span className="dash-bucket-count">{b.count}</span>
                </div>
                <div className="dash-bucket-row">
                  <span className="dash-bucket-label">Avg RAUS</span>
                  <span className="dash-bucket-val">{b.avgRaus}</span>
                </div>
                <div className="dash-bucket-row">
                  <span className="dash-bucket-label">Top</span>
                  <span className="dash-bucket-val dash-bucket-top">{b.topPlayer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class Overview */}
        <div className="dash-card">
          <h3 className="dash-section-title">Class Overview</h3>
          <table className="dash-table">
            <thead>
              <tr><th>Class</th><th>Count</th><th>Avg RAUS</th><th>Avg Composite</th></tr>
            </thead>
            <tbody>
              {classStats.map(c => (
                <tr key={c.class}>
                  <td><span className="sc-class">{c.class}</span></td>
                  <td>{c.count}</td>
                  <td>{c.avgRaus}</td>
                  <td>{c.avgComp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Alerts */}
        <div className="dash-card">
          <h3 className="dash-section-title">Recent Alerts</h3>
          {alerts.length === 0 ? (
            <div className="dash-empty">No alerts logged</div>
          ) : (
            <div className="dash-alerts-list">
              {alerts.slice(0, 10).map((a, i) => {
                const player = board.find(p => p.player_id === a.player_id)
                return (
                  <div
                    key={i}
                    className="dash-alert-row"
                    onClick={() => navigate(`/player/${a.player_id}`)}
                  >
                    <span className="dash-alert-name">{player?.display_name || a.player_id}</span>
                    <span className={`dash-alert-type dash-alert-${a.report_type?.toLowerCase().replace(/[^a-z]/g, '') || 'info'}`}>
                      {a.report_type}
                    </span>
                    {a.report_date && <span className="dash-alert-date">{a.report_date}</span>}
                    {a.notes && <span className="dash-alert-note">{a.notes.slice(0, 60)}{a.notes.length > 60 ? '...' : ''}</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Data Gaps */}
      <div className="dash-card dash-gaps-card">
        <h3 className="dash-section-title">
          Data Gaps
          <span className="dash-section-count">{dataGaps.length} players</span>
        </h3>
        {dataGaps.length === 0 ? (
          <div className="dash-empty dash-empty-good">All players have complete data</div>
        ) : (
          <div className="dash-gaps-grid">
            {dataGaps.slice(0, 30).map(g => (
              <div
                key={g.player_id}
                className="dash-gap-item"
                onClick={() => navigate(`/player/${g.player_id}/edit`)}
              >
                <div className="dash-gap-top">
                  <span className="dash-gap-rank">#{g.rank}</span>
                  <span className="dash-gap-name">{g.display_name}</span>
                  <BucketBadge bucket={g.bucket} />
                </div>
                <div className="dash-gap-missing">
                  {g.missing.map(m => (
                    <span key={m} className="dash-gap-tag">{m}</span>
                  ))}
                </div>
              </div>
            ))}
            {dataGaps.length > 30 && (
              <div className="dash-empty">...and {dataGaps.length - 30} more</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
