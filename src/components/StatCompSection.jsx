// ---------------------------------------------------------------------------
// StatCompSection — Statistical Comp Engine display component
//
// Runs the two-pass comp algorithm on mount, caches result in player_comps
// (comp_slot='stat_comp'), and renders either the closest historical match
// or the "1 of 1" card when no precedent exists.
// ---------------------------------------------------------------------------

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { buildProspectProfile, runStatComp } from '../lib/engine/statcomp'

// Module-level session cache — historical players fetched once per tab
let _historicalCache = null
let _fetchPromise = null

async function getHistoricalPlayers() {
  if (_historicalCache) return _historicalCache
  if (!_fetchPromise) {
    _fetchPromise = supabase
      .from('historical_players')
      .select('*')
      .then(({ data }) => {
        _historicalCache = data || []
        return _historicalCache
      })
  }
  return _fetchPromise
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function matchColor(pct) {
  if (pct >= 75) return '#34D399'
  if (pct >= 50) return '#FBBF24'
  if (pct >= 25) return '#FB923C'
  return '#F87171'
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CompStatBox({ value, label }) {
  return (
    <div className="sc-stat-box">
      <span className="sc-stat-big">{value ?? '--'}</span>
      <span>{label}</span>
    </div>
  )
}

function OneOfOneCard({ onRecalc }) {
  return (
    <div className="sc-card sc-one-of-one-card" style={{ gridColumn: '1 / -1' }}>
      <div className="sc-one-of-one-inner">
        <div className="sc-one-of-one-diamond">◆</div>
        <div className="sc-one-of-one-label">1 OF 1</div>
        <div className="sc-one-of-one-sub">
          Based on historical data, this player's profile has no statistical
          precedent in the database.
        </div>
        <button className="sc-recalc-btn" onClick={onRecalc}>↺ Recalculate</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StatCompSection({ player, currentStats, measurables }) {
  const [phase, setPhase] = useState('idle') // idle | loading | done | one_of_one | no_data
  const [compPlayer, setCompPlayer] = useState(null)
  const [matchPct, setMatchPct] = useState(null)
  const runningRef = useRef(false)

  useEffect(() => {
    if (player?.player_id) {
      runningRef.current = false
      loadComp(false)
    }
  }, [player?.player_id])

  async function loadComp(forceRecalc) {
    if (!player?.player_id || runningRef.current) return
    runningRef.current = true
    setPhase('loading')

    // ---- Check cache --------------------------------------------------------
    if (!forceRecalc) {
      const { data: cached } = await supabase
        .from('player_comps')
        .select('similarity_distance, updated_at, historical_players(*)')
        .eq('player_id', player.player_id)
        .eq('comp_slot', 'stat_comp')
        .maybeSingle()

      if (cached) {
        const age = Date.now() - new Date(cached.updated_at).getTime()
        if (age < CACHE_TTL_MS) {
          if (cached.historical_players) {
            setCompPlayer(cached.historical_players)
            setMatchPct(cached.similarity_distance)
            setPhase('done')
          } else {
            // null hp = cached 1-of-1 result
            setPhase('one_of_one')
          }
          runningRef.current = false
          return
        }
      }
    }

    // ---- Run engine ---------------------------------------------------------
    const profile = buildProspectProfile(
      currentStats,
      measurables,
      player.primary_bucket
    )

    if (!profile) {
      setPhase('no_data')
      runningRef.current = false
      return
    }

    const allHistorical = await getHistoricalPlayers()
    const result = runStatComp(profile, allHistorical)

    // ---- Save cache ---------------------------------------------------------
    // Delete old entry first
    await supabase
      .from('player_comps')
      .delete()
      .eq('player_id', player.player_id)
      .eq('comp_slot', 'stat_comp')

    if (result) {
      await supabase.from('player_comps').insert({
        player_id: player.player_id,
        historical_player_id: result.compPlayer.id,
        comp_slot: 'stat_comp',
        is_manual: false,
        similarity_distance: result.matchPct,
        comp_rank: 1,
        comp_tier: result.compPlayer.tier || 'modern',
      })
      setCompPlayer(result.compPlayer)
      setMatchPct(result.matchPct)
      setPhase('done')
    } else {
      // Cache 1-of-1 with null hp — we insert nothing (delete was enough)
      setPhase('one_of_one')
    }

    runningRef.current = false
  }

  function handleRecalc() {
    runningRef.current = false
    loadComp(true)
  }

  // ---- Render ---------------------------------------------------------------

  if (phase === 'idle' || phase === 'loading') {
    return (
      <div className="sc-card sc-stat-comp-card" style={{ gridColumn: '1 / -1' }}>
        <h3 className="sc-section-title">Statistical Comp</h3>
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
          {phase === 'loading' ? 'Computing statistical comp…' : ''}
        </div>
      </div>
    )
  }

  if (phase === 'no_data') {
    return (
      <div className="sc-card sc-stat-comp-card" style={{ gridColumn: '1 / -1' }}>
        <h3 className="sc-section-title">Statistical Comp</h3>
        <div className="sc-section-empty">
          Insufficient data for comp — minutes not recorded.
        </div>
      </div>
    )
  }

  if (phase === 'one_of_one') {
    return <OneOfOneCard onRecalc={handleRecalc} />
  }

  if (phase === 'done' && compPlayer) {
    const hp = compPlayer
    const pct = matchPct ?? 0
    const color = matchColor(pct)

    return (
      <div className="sc-card sc-stat-comp-card" style={{ gridColumn: '1 / -1' }}>

        {/* Header row */}
        <div className="sc-stat-comp-header">
          <div>
            <h3 className="sc-section-title" style={{ marginBottom: 2 }}>Statistical Comp</h3>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              Based on pre-NBA profile similarity
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              className="sc-match-badge"
              style={{
                background: color + '20',
                color,
                border: `1px solid ${color}50`,
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {pct}% COMP MATCH
            </span>
            <button className="sc-recalc-btn" onClick={handleRecalc} title="Force fresh calculation">
              ↺
            </button>
          </div>
        </div>

        {/* Player identity */}
        <div className="sc-stat-comp-name">{hp.name}</div>
        <div className="sc-stat-comp-meta">
          {hp.draft_year && <span>{hp.draft_year} Draft</span>}
          {hp.draft_pick != null && <span>Pick #{hp.draft_pick}</span>}
          {hp.position && <span>{hp.position}</span>}
        </div>

        {/* NBA career stat grid (first-4-years) */}
        {(hp.nba_ppg_first4 != null || hp.rpg_first4 != null || hp.per_first4 != null) ? (
          <div className="sc-stats-grid" style={{ marginTop: 14 }}>
            <CompStatBox value={hp.nba_ppg_first4?.toFixed(1)} label="PPG" />
            <CompStatBox value={hp.rpg_first4?.toFixed(1)}     label="RPG" />
            <CompStatBox value={hp.apg_first4?.toFixed(1)}     label="APG" />
            <CompStatBox value={hp.spg_first4?.toFixed(1)}     label="SPG" />
            <CompStatBox value={hp.bpg_first4?.toFixed(1)}     label="BPG" />
            <CompStatBox value={hp.per_first4?.toFixed(1)}     label="PER" />
            <CompStatBox value={hp.bpm_first4?.toFixed(1)}     label="BPM" />
            <CompStatBox value={hp.vorp_first4?.toFixed(1)}    label="VORP" />
            <CompStatBox value={hp.nba_ws48_first4?.toFixed(3)} label="WS/48" />
          </div>
        ) : (
          <div className="sc-section-empty" style={{ marginTop: 14 }}>
            NBA outcome data not available
          </div>
        )}

        {/* Outcome label */}
        {hp.nba_outcome_label && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            {hp.nba_outcome_label}
          </div>
        )}
      </div>
    )
  }

  return null
}
