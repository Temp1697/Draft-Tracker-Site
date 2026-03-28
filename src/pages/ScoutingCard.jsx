import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TierBadge from '../components/TierBadge'
import BucketBadge from '../components/BucketBadge'
import SkillRadar from '../components/SkillRadar'
import SSABreakdown from '../components/SSABreakdown'
import DNAProfile from '../components/DNAProfile'

function StatPill({ label, value, sub }) {
  return (
    <div className="sc-stat-pill">
      <span className="sc-stat-value">{value ?? '—'}</span>
      <span className="sc-stat-label">{label}</span>
      {sub && <span className="sc-stat-sub">{sub}</span>}
    </div>
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="sc-info-row">
      <span className="sc-info-label">{label}</span>
      <span className="sc-info-value">{value}</span>
    </div>
  )
}

export default function ScoutingCard() {
  const { playerId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { data: player },
        { data: prospect },
        { data: raus },
        { data: ssa },
        { data: ssaInput },
        { data: athletic },
        { data: measurables },
        { data: master },
        { data: dna },
        { data: stats },
        { data: alerts },
        { data: derived },
        { data: comps },
      ] = await Promise.all([
        supabase.from('players').select('*').eq('player_id', playerId).single(),
        supabase.from('prospects').select('*').eq('player_id', playerId).single(),
        supabase.from('raus_scores').select('*').eq('player_id', playerId).single(),
        supabase.from('ssa_scores').select('*').eq('player_id', playerId).single(),
        supabase.from('ssa_input').select('*').eq('player_id', playerId).single(),
        supabase.from('athletic_scores').select('*').eq('player_id', playerId).single(),
        supabase.from('measurables').select('*').eq('player_id', playerId).single(),
        supabase.from('master_board').select('*').eq('player_id', playerId).single(),
        supabase.from('dna_scores').select('*').eq('player_id', playerId).single(),
        supabase.from('stats').select('*').eq('player_id', playerId).order('season', { ascending: false }),
        supabase.from('player_alerts').select('*').eq('player_id', playerId),
        supabase.from('derived_metrics').select('*').eq('player_id', playerId).single(),
        supabase.from('player_comps').select('*, historical_players(*)').eq('player_id', playerId).order('similarity_distance'),
      ])

      setData({ player, prospect, raus, ssa, ssaInput, athletic, measurables, master, dna, stats: stats || [], alerts: alerts || [], derived, comps: comps || [] })
      setLoading(false)
    }
    load()
  }, [playerId])

  if (loading) return <div className="bb-loading">Loading scouting card...</div>
  if (!data?.player) return <div className="bb-loading">Player not found</div>

  const { player, prospect, raus, ssa, athletic, measurables, master, dna, stats, alerts, derived, comps } = data
  const currentStats = stats[0]

  return (
    <div className="sc-container">
      {/* Nav buttons */}
      <div className="sc-nav">
        <button className="sc-back" onClick={() => navigate('/')}>
          &larr; Big Board
        </button>
        <button className="sc-edit-btn" onClick={() => navigate(`/player/${playerId}/edit`)}>
          Edit Player
        </button>
      </div>

      {/* Header */}
      <div className="sc-header">
        <div className="sc-photo-placeholder">
          {player.display_name?.split(' ').map(n => n[0]?.toUpperCase()).join('')}
        </div>
        <div className="sc-header-info">
          <h1 className="sc-name">{player.display_name}</h1>
          <div className="sc-meta">
            <BucketBadge bucket={player.primary_bucket} />
            <span className="sc-archetype-label">{player.style_archetype}</span>
            {prospect?.team && <span className="sc-team">{prospect.team}</span>}
            {prospect?.league_conf && <span className="sc-conf">({prospect.league_conf})</span>}
          </div>
          <div className="sc-bio-row">
            {prospect?.height && <span>{Math.floor(prospect.height / 12)}'{prospect.height % 12}"</span>}
            {prospect?.weight && <span>{prospect.weight} lbs</span>}
            {measurables?.wingspan && <span>WS {Math.floor(measurables.wingspan / 12)}'{Math.round(measurables.wingspan % 12)}"</span>}
            {measurables?.ws_minus_h != null && <span>(+{measurables.ws_minus_h}")</span>}
            {prospect?.class && <span className="sc-class">{prospect.class.toUpperCase()}</span>}
            {player.birth_year && <span>b. {player.birth_year}</span>}
          </div>
        </div>
      </div>

      {/* Alert banner */}
      {master?.alert_status && master.alert_status !== 'Clean' && (
        <div className="sc-alert-banner">
          <span className="sc-alert-status">{master.alert_status}</span>
          {master.risk_notes && <span className="sc-alert-notes">{master.risk_notes}</span>}
        </div>
      )}

      {/* Score pills row */}
      <div className="sc-scores-row">
        <StatPill label="RAUS Final" value={raus?.raus_final?.toFixed(2)} sub={master?.tier} />
        <StatPill label="SSA" value={ssa?.ssa_auto_final?.toFixed(2)} sub={ssa?.ssa_rank_label} />
        {master?.ssa_age_adjusted != null && master.ssa_age_adjusted !== master.ssa && (
          <StatPill label="SSA (Age-Adj)" value={master.ssa_age_adjusted.toFixed(2)} sub={`×${master.class_multiplier?.toFixed(2)}`} />
        )}
        <StatPill label="OAI" value={athletic?.oai?.toFixed(2)} sub={athletic?.oai_band} />
        <StatPill label="AAA" value={athletic?.aaa?.toFixed(2)} sub={athletic?.aaa_band} />
        <StatPill label="Board Rank" value={`#${master?.overall_rank ?? '—'}`} />
        <StatPill label="Composite" value={master?.composite_score?.toFixed(4)} />
        {dna?.dna_flag && <StatPill label="DNA Max" value={dna.dna_max} sub="DNA Match" />}
      </div>

      {/* Main grid */}
      <div className="sc-grid">
        {/* Left column — Radar + RAUS breakdown */}
        <div className="sc-card">
          <h3 className="sc-section-title">RAUS Skill Profile</h3>
          <SkillRadar raus={raus} height={280} />
          {raus && (
            <div className="sc-raus-details">
              <div className="sc-raus-row">
                <span>RAUS Base</span><span>{raus.raus_base?.toFixed(2)}</span>
              </div>
              <div className="sc-raus-row">
                <span>RAUS Weighted</span><span>{raus.raus_weighted?.toFixed(2)}</span>
              </div>
              <div className="sc-raus-row">
                <span>PTC</span><span>{raus.ptc_auto?.toFixed(2)}</span>
              </div>
              <div className="sc-raus-row">
                <span>Star Index</span><span>{raus.star_index?.toFixed(2)}</span>
              </div>
              <div className="sc-raus-row">
                <span>PPI</span><span>{raus.ppi_auto?.toFixed(2)}</span>
              </div>
              {raus.raus_override != null && (
                <div className="sc-raus-row sc-override">
                  <span>Override</span><span>{raus.raus_override?.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Middle column — SSA */}
        <div className="sc-card">
          <h3 className="sc-section-title">
            SSA Breakdown
            {ssa?.ssa_rank_label && <span className="sc-section-sub">{ssa.ssa_rank_label}</span>}
          </h3>
          <SSABreakdown ssa={ssa} bucket={player.primary_bucket} />
        </div>

        {/* Right column — DNA */}
        <div className="sc-card">
          <h3 className="sc-section-title">DNA Archetypes</h3>
          <DNAProfile dna={dna} />
        </div>
      </div>

      {/* Derived Metrics row */}
      {derived && (derived.lci != null || derived.sfr != null || derived.wsh_factor != null || derived.ft_pct_label != null) && (
        <div className="sc-derived-row">
          {derived.lci != null && (
            <div className="sc-derived-card">
              <span className="sc-derived-value">{derived.lci.toFixed(2)}</span>
              <span className="sc-derived-label">LCI</span>
              <span className="sc-derived-sub">Load Capacity Index</span>
            </div>
          )}
          {derived.sfr != null && (
            <div className="sc-derived-card">
              <span className="sc-derived-value">{derived.sfr.toFixed(2)}</span>
              <span className="sc-derived-label">SFR</span>
              <span className={`sc-derived-badge sc-sfr-${derived.sfr_label?.toLowerCase()}`}>{derived.sfr_label}</span>
            </div>
          )}
          {derived.wsh_factor != null && (
            <div className="sc-derived-card">
              <span className="sc-derived-value">{derived.wsh_factor.toFixed(2)}</span>
              <span className="sc-derived-label">WS-H Factor</span>
              <span className="sc-derived-sub">Wingspan-Height</span>
            </div>
          )}
          {derived.ft_pct_label != null && (
            <div className="sc-derived-card">
              <span className={`sc-derived-ft sc-ft-${derived.ft_pct_label === 'Projectable Stroke' ? 'good' : derived.ft_pct_label === 'Developing Stroke' ? 'mid' : 'concern'}`}>
                {derived.ft_pct_label}
              </span>
              <span className="sc-derived-label">FT% Projection</span>
            </div>
          )}
        </div>
      )}

      {/* Historical Comps */}
      {comps.length > 0 && (
        <div className="sc-card sc-comps-card">
          <h3 className="sc-section-title">Historical Comps</h3>
          <div className="sc-comps-grid">
            {comps.filter(c => c.comp_tier === 'modern').map((c, i) => {
              const h = c.historical_players
              if (!h) return null
              return (
                <div key={i} className="sc-comp-item">
                  <div className="sc-comp-name">{h.name}</div>
                  <div className="sc-comp-meta">
                    <span>{h.draft_year} Draft</span>
                    <span>Pick #{h.draft_pick}</span>
                    <span>{h.position}</span>
                  </div>
                  <div className="sc-comp-meta">
                    <span>{h.college_team}</span>
                    {h.class_year && <span>{h.class_year.toUpperCase()}</span>}
                  </div>
                  {h.nba_outcome_label && (
                    <span className={`sc-comp-outcome sc-outcome-${h.nba_outcome_label.toLowerCase().replace(/[^a-z]/g, '')}`}>
                      {h.nba_outcome_label}
                    </span>
                  )}
                  {h.nba_ppg_first4 != null && (
                    <div className="sc-comp-nba">
                      {h.nba_ppg_first4.toFixed(1)} PPG / {h.nba_ws48_first4?.toFixed(3)} WS/48
                      <span className="sc-comp-span">(first 4 yrs)</span>
                    </div>
                  )}
                  <div className="sc-comp-dist">Similarity: {(100 - c.similarity_distance * 10).toFixed(0)}%</div>
                </div>
              )
            })}
          </div>
          {comps.filter(c => c.comp_tier === 'legend').length > 0 && (
            <div className="sc-legend-echo">
              <span className="sc-legend-label">Legend Echo:</span>
              {comps.filter(c => c.comp_tier === 'legend').map((c, i) => {
                const h = c.historical_players
                return h ? (
                  <span key={i} className="sc-legend-name">{h.name}</span>
                ) : null
              })}
            </div>
          )}
          {comps.filter(c => c.comp_tier === 'modern' && c.historical_players?.nba_ppg_first4 != null).length >= 2 && (
            <div className="sc-comp-cluster">
              Avg cluster outcome: {' '}
              {(comps.filter(c => c.comp_tier === 'modern' && c.historical_players?.nba_ppg_first4 != null)
                .reduce((s, c) => s + c.historical_players.nba_ppg_first4, 0) /
                comps.filter(c => c.comp_tier === 'modern' && c.historical_players?.nba_ppg_first4 != null).length
              ).toFixed(1)} PPG, {' '}
              {(comps.filter(c => c.comp_tier === 'modern' && c.historical_players?.nba_ws48_first4 != null)
                .reduce((s, c) => s + c.historical_players.nba_ws48_first4, 0) /
                comps.filter(c => c.comp_tier === 'modern' && c.historical_players?.nba_ws48_first4 != null).length
              ).toFixed(3)} WS/48
              <span className="sc-comp-span">(first 4 seasons)</span>
            </div>
          )}
        </div>
      )}

      {/* Stats + Scouting notes row */}
      <div className="sc-grid sc-grid-2">
        {/* Key stats */}
        <div className="sc-card">
          <h3 className="sc-section-title">
            Season Stats
            {currentStats?.season && <span className="sc-section-sub">{currentStats.season}</span>}
          </h3>
          {currentStats ? (
            <div className="sc-stats-grid">
              <div className="sc-stat-box"><span className="sc-stat-big">{currentStats.ppg?.toFixed(1)}</span><span>PPG</span></div>
              <div className="sc-stat-box"><span className="sc-stat-big">{currentStats.rpg?.toFixed(1)}</span><span>RPG</span></div>
              <div className="sc-stat-box"><span className="sc-stat-big">{currentStats.apg?.toFixed(1)}</span><span>APG</span></div>
              <div className="sc-stat-box"><span className="sc-stat-big">{currentStats.spg?.toFixed(1)}</span><span>SPG</span></div>
              <div className="sc-stat-box"><span className="sc-stat-big">{currentStats.bpg?.toFixed(1)}</span><span>BPG</span></div>
              <div className="sc-stat-box"><span className="sc-stat-big">{currentStats.mpg?.toFixed(1)}</span><span>MPG</span></div>
              <div className="sc-stat-box"><span className="sc-stat-big">{currentStats.games}</span><span>GP</span></div>
              <div className="sc-stat-box"><span className="sc-stat-big">{(currentStats.fg_pct * 100)?.toFixed(1)}%</span><span>FG%</span></div>
              <div className="sc-stat-box"><span className="sc-stat-big">{(currentStats.three_pt_pct * 100)?.toFixed(1)}%</span><span>3P%</span></div>
              <div className="sc-stat-box"><span className="sc-stat-big">{(currentStats.ft_pct * 100)?.toFixed(1)}%</span><span>FT%</span></div>
              <div className="sc-stat-box"><span className="sc-stat-big">{(currentStats.ts_pct * 100)?.toFixed(1)}%</span><span>TS%</span></div>
              <div className="sc-stat-box"><span className="sc-stat-big">{(currentStats.usg * 100)?.toFixed(1)}%</span><span>USG</span></div>
              <div className="sc-stat-box"><span className="sc-stat-big">{currentStats.per?.toFixed(1)}</span><span>PER</span></div>
              <div className="sc-stat-box"><span className="sc-stat-big">{currentStats.bpm?.toFixed(1)}</span><span>BPM</span></div>
              <div className="sc-stat-box"><span className="sc-stat-big">{currentStats.ws?.toFixed(1)}</span><span>WS</span></div>
            </div>
          ) : (
            <div className="sc-section-empty">No stats available</div>
          )}
        </div>

        {/* Scouting notes */}
        <div className="sc-card">
          <h3 className="sc-section-title">Scouting Notes</h3>
          <InfoRow label="Accolades" value={prospect?.accolades} />
          <InfoRow label="Strengths" value={prospect?.strengths} />
          <InfoRow label="Weaknesses" value={prospect?.weaknesses} />
          <InfoRow label="Comp (Ceiling)" value={prospect?.comp_upper} />
          <InfoRow label="Comp (Floor)" value={prospect?.comp_lower} />
          <InfoRow label="Tier" value={prospect?.tier} />

          {alerts.length > 0 && (
            <>
              <h4 className="sc-subsection-title">Alerts</h4>
              {alerts.map((a, i) => (
                <div key={i} className="sc-alert-item">
                  <span className="sc-alert-type">{a.report_type}</span>
                  {a.report_date && <span className="sc-alert-date">{a.report_date}</span>}
                  {a.notes && <p className="sc-alert-note">{a.notes}</p>}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
