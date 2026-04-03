import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TierBadge from '../components/TierBadge'
import BucketBadge from '../components/BucketBadge'
import SkillRadar from '../components/SkillRadar'
import SSABreakdown from '../components/SSABreakdown'
import DNAProfile from '../components/DNAProfile'
import InjuryHistory from '../components/InjuryHistory'
import BustIndex from '../components/BustIndex'
import { computeBustIndex } from '../lib/engine/bustindex'
import { computeSizeMultiplier } from '../lib/engine/bigboard'
import { rausTier, ssaTier, compositeTier, lciTier, wshTier, starIndexTier, ppiTier } from '../lib/tiers'
import { getPositionalDefaults } from '../lib/positionalDefaults'
import { fillDefaultsSync } from '../lib/fillDefaults'
import { pctConvert } from '../lib/engine/skillmetrics'
import CompSwapModal from '../components/CompSwapModal'

/* ── Constants for detail panels ── */

const RAUS_WEIGHTS = {
  ucs: 0.18, fcs: 0.12, adr: 0.10, sti: 0.10,
  rsm: 0.08, dri: 0.07, scr: 0.15, rpi: 0.10,
  sci: 0.05, star_index: 0.05,
}

const RAUS_METRIC_LABELS = {
  scr: 'SCR', rpi: 'RPI', sci: 'SCI', star_index: 'Star Index',
  ucs: 'UCS', fcs: 'FCS', adr: 'ADR', sti: 'STI', rsm: 'RSM', dri: 'DRI',
}

const SSA_WEIGHTS = {
  Guard: { role: 1.1, shooting: 1.2, creation: 1.3, playmaking: 1.3, defense: 0.8, offball: 0.8, decision: 1.2, hustle: 0.3 },
  Wing:  { role: 1.2, shooting: 1.1, creation: 1.1, playmaking: 0.7, defense: 1.2, offball: 1.1, decision: 1.0, hustle: 0.6 },
  Big:   { role: 1.1, shooting: 0.8, creation: 0.8, playmaking: 0.6, defense: 1.4, offball: 1.2, decision: 0.9, hustle: 1.2 },
}

const SSA_GRADE_LABELS = {
  role: 'Role Translation',
  shooting: 'Shooting',
  creation: 'Creation',
  playmaking: 'Playmaking',
  defense: 'Defense',
  offball: 'Off-Ball',
  decision: 'Decision-Making',
  hustle: 'Hustle',
}

const SSA_INPUT_KEYS = {
  role: 'role_translation',
  shooting: 'shooting_profile',
  creation: 'creation_scalability',
  playmaking: 'playmaking_efficiency',
  defense: 'defensive_impact',
  offball: 'offball_value',
  decision: 'decision_making',
  hustle: 'hustle_impact',
}

/* ── BASELINES for Nerd Stuff normalization (from skillmetrics.js) ── */

const BASELINES = {
  pts_per40:           { mean: 18.0,  std: 5.0  },
  ast_per40:           { mean: 3.5,   std: 2.0  },
  reb_per40:           { mean: 8.0,   std: 3.5  },
  stl_per40:           { mean: 1.5,   std: 0.6  },
  blk_per40:           { mean: 1.0,   std: 0.8  },
  tov_per40:           { mean: 3.0,   std: 1.0  },
  usg:                 { mean: 22.0,  std: 5.0  },
  ast_pct:             { mean: 15.0,  std: 7.0  },
  tov_pct:             { mean: 15.0,  std: 4.0  },
  ast_tov:             { mean: 1.2,   std: 0.5  },
  ts_pct:              { mean: 54.0,  std: 5.0  },
  efg_pct:             { mean: 50.0,  std: 5.0  },
  ft_pct:              { mean: 72.0,  std: 8.0  },
  ft_rate:             { mean: 35.0,  std: 10.0 },
  three_pt_pct:        { mean: 33.0,  std: 6.0  },
  three_pta_rate:      { mean: 35.0,  std: 10.0 },
  three_pt_share_pct:  { mean: 30.0,  std: 10.0 },
  three_pta_per40:     { mean: 5.0,   std: 2.5  },
  dunk_pct:            { mean: 60.0,  std: 15.0 },
  dunks_per_game:      { mean: 1.0,   std: 0.8  },
  two_pt_close_pct:    { mean: 55.0,  std: 10.0 },
  at_rim_share_pct:    { mean: 30.0,  std: 12.0 },
  astd_at_rim_pct:     { mean: 35.0,  std: 15.0 },
  astd_inside_arc_pct: { mean: 30.0,  std: 15.0 },
  astd_three_pct:      { mean: 60.0,  std: 15.0 },
  astd_tot_pct:        { mean: 45.0,  std: 15.0 },
  obpm:                { mean: 2.0,   std: 3.0  },
  dbpm:                { mean: 1.5,   std: 2.5  },
  dporpagatu:          { mean: 5.0,   std: 3.0  },
  orb_pct:             { mean: 5.0,   std: 3.0  },
  drb_pct:             { mean: 15.0,  std: 5.0  },
  orb_total:           { mean: 30,    std: 20   },
  drb_total:           { mean: 100,   std: 50   },
  stl_pct:             { mean: 2.0,   std: 0.8  },
  blk_pct:             { mean: 3.0,   std: 2.5  },
  drtg:                { mean: 100,   std: 5    },
  per:                 { mean: 17.0,  std: 5.0  },
  bpm:                 { mean: 2.0,   std: 3.0  },
  pf_per40:            { mean: 4.5,   std: 1.2  },
}

/* ── RAUS Nerd Stuff: stat inputs per metric ── */

const RAUS_METRIC_STATS = {
  scr: [
    { key: 'usg', label: 'USG', inverse: false },
    { key: 'pts_per40', label: 'PTS/40', inverse: false },
    { key: 'at_rim_share_pct', label: 'At-Rim Share %', inverse: false },
    { key: 'astd_at_rim_pct', label: "AST'd At-Rim %", inverse: true },
    { key: 'astd_inside_arc_pct', label: "AST'd Inside Arc %", inverse: true },
    { key: 'astd_three_pct', label: "AST'd 3PT %", inverse: true },
    { key: 'astd_tot_pct', label: "AST'd Total %", inverse: true },
  ],
  rpi: [
    { key: 'ft_rate', label: 'FT Rate', inverse: false },
    { key: 'at_rim_share_pct', label: 'At-Rim Share %', inverse: false },
    { key: 'dunk_pct', label: 'Dunk %', inverse: false },
    { key: 'dunks_per_game', label: 'Dunks/Game', inverse: false },
    { key: 'two_pt_close_pct', label: '2PT Close %', inverse: false },
  ],
  sci: [
    { key: 'usg', label: 'USG', inverse: false },
    { key: 'ast_pct', label: 'AST %', inverse: false },
    { key: 'ast_tov', label: 'AST/TOV', inverse: false },
    { key: 'pts_per40', label: 'PTS/40', inverse: false },
    { key: 'efg_pct', label: 'eFG%', inverse: false },
  ],
  ucs: [
    { key: 'three_pt_pct', label: '3PT %', inverse: false },
    { key: 'three_pta_rate', label: '3PTA Rate', inverse: false },
    { key: 'efg_pct', label: 'eFG%', inverse: false },
    { key: 'ft_pct', label: 'FT %', inverse: false },
    { key: 'three_pt_share_pct', label: '3PT Share %', inverse: false },
    { key: 'three_pta_per40', label: '3PTA/40', inverse: false },
  ],
  fcs: [
    { key: 'two_pt_close_pct', label: '2PT Close %', inverse: false },
    { key: 'dunk_pct', label: 'Dunk %', inverse: false },
    { key: 'ft_rate', label: 'FT Rate', inverse: false },
    { key: 'dunks_per_game', label: 'Dunks/Game', inverse: false },
    { key: 'at_rim_share_pct', label: 'At-Rim Share %', inverse: false },
  ],
  adr: [
    { key: 'ast_tov', label: 'AST/TOV', inverse: false },
    { key: 'tov_pct', label: 'TOV %', inverse: true },
    { key: 'ast_pct', label: 'AST %', inverse: false },
    { key: 'usg', label: 'USG', inverse: false },
    { key: 'obpm', label: 'OBPM', inverse: false },
  ],
  sti: [
    { key: 'stl_per40', label: 'STL/40', inverse: false },
    { key: 'blk_per40', label: 'BLK/40', inverse: false },
    { key: 'stl_pct', label: 'STL %', inverse: false },
    { key: 'blk_pct', label: 'BLK %', inverse: false },
    { key: 'dbpm', label: 'DBPM', inverse: false },
    { key: 'dporpagatu', label: 'DPOR/PAGATU', inverse: false },
  ],
  rsm: [
    { key: 'reb_per40', label: 'REB/40', inverse: false },
    { key: 'orb_pct', label: 'ORB %', inverse: false },
    { key: 'drb_pct', label: 'DRB %', inverse: false },
    { key: 'orb_total', label: 'ORB Total', inverse: false },
    { key: 'drb_total', label: 'DRB Total', inverse: false },
  ],
  dri: [
    { key: 'dbpm', label: 'DBPM', inverse: false },
    { key: 'dporpagatu', label: 'DPOR/PAGATU', inverse: false },
    { key: 'stl_per40', label: 'STL/40', inverse: false },
    { key: 'blk_per40', label: 'BLK/40', inverse: false },
    { key: 'drtg', label: 'DRTG', inverse: true },
    { key: 'pf_per40', label: 'PF/40', inverse: true, derived: true },
  ],
}

const RSM_POSITION_MULTIPLIERS = { Guard: 1.4, Wing: 1.1, Big: 0.85 }

/* ── SSA Nerd Stuff: stat inputs per category ── */

const SSA_CATEGORY_STATS = {
  role: [
    { key: 'usg', label: 'USG', inverse: false },
    { key: 'pts_per40', label: 'PTS/40', inverse: false },
    { key: 'per', label: 'PER', inverse: false },
    { key: 'bpm', label: 'BPM', inverse: false },
  ],
  shooting: [
    { key: 'three_pt_pct', label: '3PT %', inverse: false },
    { key: 'ft_pct', label: 'FT %', inverse: false },
    { key: 'efg_pct', label: 'eFG%', inverse: false },
    { key: 'ts_pct', label: 'TS %', inverse: false },
    { key: 'three_pta_rate', label: '3PTA Rate', inverse: false },
    { key: 'three_pt_share_pct', label: '3PT Share %', inverse: false },
  ],
  creation: [
    { key: 'usg', label: 'USG', inverse: false },
    { key: 'ast_pct', label: 'AST %', inverse: false },
    { key: 'astd_tot_pct', label: "AST'd Total %", inverse: true },
    { key: 'pts_per40', label: 'PTS/40', inverse: false },
  ],
  playmaking: [
    { key: 'ast_per40', label: 'AST/40', inverse: false },
    { key: 'ast_tov', label: 'AST/TOV', inverse: false },
    { key: 'ast_pct', label: 'AST %', inverse: false },
    { key: 'tov_pct', label: 'TOV %', inverse: true },
  ],
  defense: [
    { key: 'stl_per40', label: 'STL/40', inverse: false },
    { key: 'blk_per40', label: 'BLK/40', inverse: false },
    { key: 'dbpm', label: 'DBPM', inverse: false },
    { key: 'dporpagatu', label: 'DPOR/PAGATU', inverse: false },
    { key: 'drtg', label: 'DRTG', inverse: true },
  ],
  offball: [
    { key: 'at_rim_share_pct', label: 'At-Rim Share %', inverse: false },
    { key: 'three_pt_share_pct', label: '3PT Share %', inverse: false },
    { key: 'orb_pct', label: 'ORB %', inverse: false },
    { key: 'inside_arc_share_pct', label: 'Inside Arc Share %', inverse: false },
  ],
  decision: [
    { key: 'ast_tov', label: 'AST/TOV', inverse: false },
    { key: 'tov_pct', label: 'TOV %', inverse: true },
    { key: 'obpm', label: 'OBPM', inverse: false },
    { key: 'usg', label: 'USG', inverse: false },
  ],
  hustle: [
    { key: 'stl_pct', label: 'STL %', inverse: false },
    { key: 'orb_pct', label: 'ORB %', inverse: false },
    { key: 'drb_pct', label: 'DRB %', inverse: false },
    { key: 'pf_per40', label: 'PF/40', inverse: true, derived: true },
  ],
}

/* ── Normalization helper ── */

function nerdNormalize(value, statKey, inverse = false) {
  if (value == null || isNaN(value)) return null
  const b = BASELINES[statKey]
  if (!b) return null
  // Convert decimal-stored percentages to whole-number form before z-score
  const v = pctConvert(value, statKey) ?? value
  if (inverse) {
    return Math.min(10, Math.max(0, 5 - ((v - b.mean) / b.std) * 2.0))
  }
  return Math.min(10, Math.max(0, 5 + ((v - b.mean) / b.std) * 2.0))
}

function getStatValue(stats, key) {
  if (!stats) return null
  if (key === 'pf_per40') {
    if (stats.pf != null && stats.mpg != null && stats.mpg > 0) {
      return (stats.pf / stats.mpg) * 40
    }
    return null
  }
  return stats[key] ?? null
}

function formatStatValue(val) {
  if (val == null) return '--'
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return val.toString()
    return val.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
  }
  return String(val)
}

/* ── Detail panel styles (inline to keep it self-contained) ── */

const detailPanelStyle = {
  background: 'rgba(168,85,247,0.05)',
  borderLeft: '3px solid rgba(168,85,247,0.4)',
  borderRadius: '6px',
  padding: '12px 16px',
  marginTop: '10px',
  fontSize: '13px',
  lineHeight: '1.6',
}

const detailTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
  fontSize: '12px',
}

const detailThStyle = {
  textAlign: 'left',
  padding: '4px 8px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.5)',
  fontWeight: 500,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const detailTdStyle = {
  padding: '4px 8px',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  color: 'rgba(255,255,255,0.85)',
}

const detailTdNumStyle = {
  ...detailTdStyle,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
}

const detailSummaryRowStyle = {
  padding: '6px 0',
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  color: 'rgba(255,255,255,0.75)',
}

const detailSummaryLabelStyle = {
  color: 'rgba(255,255,255,0.5)',
}

const detailSummaryValueStyle = {
  fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
  color: 'rgba(255,255,255,0.9)',
}

const detailToggleStyle = {
  background: 'rgba(168,85,247,0.15)',
  border: '1px solid rgba(168,85,247,0.3)',
  borderRadius: '4px',
  color: 'rgba(168,85,247,0.9)',
  cursor: 'pointer',
  fontSize: '11px',
  padding: '2px 8px',
  marginLeft: '8px',
  transition: 'all 0.15s',
}

const overrideHighlightStyle = {
  background: 'rgba(251,191,36,0.08)',
  borderLeft: '2px solid rgba(251,191,36,0.5)',
  padding: '6px 10px',
  borderRadius: '4px',
  marginTop: '6px',
}

/* ── Nerd Stuff styles ── */

const nerdPanelStyle = {
  background: '#1C2236',
  borderRadius: '6px',
  padding: '12px 14px',
  marginTop: '10px',
}

const nerdSectionStyle = {
  marginBottom: '12px',
}

const nerdSectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '4px 0',
  borderBottom: '1px solid rgba(168,85,247,0.2)',
  marginBottom: '4px',
}

const nerdTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
  fontSize: '11px',
}

const nerdThStyle = {
  textAlign: 'left',
  padding: '2px 6px',
  color: 'rgba(255,255,255,0.4)',
  fontWeight: 500,
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
}

const nerdTdStyle = {
  padding: '2px 6px',
  color: 'rgba(255,255,255,0.75)',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
}

const nerdTdNumStyle = {
  ...nerdTdStyle,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
}

/* ── Tier badge helper ── */

function TierLabel({ tier }) {
  if (!tier) return null
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
      background: tier.color + '18', color: tier.color, marginLeft: 6,
    }}>{tier.label}</span>
  )
}

/* ── Helper components ── */

function StatPill({ label, value, sub, tier }) {
  return (
    <div className="sc-stat-pill">
      <span className="sc-stat-value">
        {value ?? '--'}
        {tier && <TierLabel tier={tier} />}
      </span>
      <span className="sc-stat-label">{label}</span>
      {sub && <span className="sc-stat-sub">{sub}</span>}
    </div>
  )
}

/** Stat box with estimated (~) indicator */
function EstStatBox({ value, label, field, estimated }) {
  const isEst = estimated?.(field)
  return (
    <div className={`sc-stat-box${isEst ? ' sc-stat-estimated' : ''}`} title={isEst ? 'Estimated (positional average)' : undefined}>
      <span className="sc-stat-big">
        {value ?? '--'}
        {isEst && <span className="sc-est-marker">~</span>}
      </span>
      <span>{label}</span>
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

/* ── RAUS Nerd Stuff Panel ── */

function RAUSNerdStuff({ raus, currentStats, bucket, estimatedFields }) {
  if (!currentStats) return <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>No stats available for nerd breakdown.</div>

  const metricOrder = ['scr', 'rpi', 'sci', 'ucs', 'fcs', 'adr', 'sti', 'rsm', 'dri']

  return (
    <div style={nerdPanelStyle}>
      {metricOrder.map(metricKey => {
        const statDefs = RAUS_METRIC_STATS[metricKey]
        if (!statDefs) return null
        const score = raus?.[metricKey + '_auto']
        return (
          <div key={metricKey} style={nerdSectionStyle}>
            <div style={nerdSectionHeaderStyle}>
              <span style={{ color: 'rgba(168,85,247,0.9)', fontWeight: 700, fontSize: 12 }}>
                {RAUS_METRIC_LABELS[metricKey]}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: 12 }}>
                {score != null ? score.toFixed(2) : '--'}
              </span>
            </div>
            {metricKey === 'rsm' && bucket && (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
                Position multiplier: {RSM_POSITION_MULTIPLIERS[bucket] ?? 1.0}x ({bucket})
              </div>
            )}
            <table style={nerdTableStyle}>
              <thead>
                <tr>
                  <th style={nerdThStyle}>Stat</th>
                  <th style={{ ...nerdThStyle, textAlign: 'right' }}>Value</th>
                  <th style={{ ...nerdThStyle, textAlign: 'right' }}>Norm (0-10)</th>
                  <th style={{ ...nerdThStyle, textAlign: 'center', width: 40 }}>Inv</th>
                </tr>
              </thead>
              <tbody>
                {statDefs.map(sd => {
                  const rawVal = getStatValue(currentStats, sd.key)
                  const normVal = nerdNormalize(rawVal, sd.key, sd.inverse)
                  const isEst = estimatedFields?.includes(sd.key)
                  return (
                    <tr key={sd.key} style={isEst ? { opacity: 0.6, fontStyle: 'italic' } : undefined}>
                      <td style={nerdTdStyle}>{sd.label}{isEst && <span style={{ color: '#FBBF24', marginLeft: 4, fontSize: 10 }}>~</span>}</td>
                      <td style={nerdTdNumStyle}>{formatStatValue(rawVal)}</td>
                      <td style={nerdTdNumStyle}>{normVal != null ? normVal.toFixed(2) : '--'}</td>
                      <td style={{ ...nerdTdStyle, textAlign: 'center', color: sd.inverse ? 'rgba(251,191,36,0.8)' : 'rgba(255,255,255,0.2)' }}>
                        {sd.inverse ? 'INV' : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

/* ── SSA Nerd Stuff Panel ── */

function SSANerdStuff({ ssa, ssaInput, currentStats, estimatedFields }) {
  if (!currentStats) return <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>No stats available for nerd breakdown.</div>

  const gradeKeys = ['role', 'shooting', 'creation', 'playmaking', 'defense', 'offball', 'decision', 'hustle']

  return (
    <div style={nerdPanelStyle}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 8, lineHeight: 1.4 }}>
        SSA grades are computed from pool-wide percentile ranks. Raw stat values shown below; the auto grade reflects how this player ranks relative to the entire prospect pool.
      </div>
      {gradeKeys.map(catKey => {
        const statDefs = SSA_CATEGORY_STATS[catKey]
        if (!statDefs) return null
        const inputKey = SSA_INPUT_KEYS[catKey]
        const autoVal = ssa?.[inputKey + '_auto'] ?? ssaInput?.[inputKey]
        const inputVal = ssaInput?.[inputKey]
        const isManual = autoVal != null && inputVal != null && Math.abs(autoVal - inputVal) > 0.01

        return (
          <div key={catKey} style={nerdSectionStyle}>
            <div style={nerdSectionHeaderStyle}>
              <span style={{ color: 'rgba(168,85,247,0.9)', fontWeight: 700, fontSize: 12 }}>
                {SSA_GRADE_LABELS[catKey]}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 3,
                  background: isManual ? 'rgba(251,191,36,0.15)' : 'rgba(168,85,247,0.1)',
                  color: isManual ? 'rgba(251,191,36,0.9)' : 'rgba(168,85,247,0.7)',
                }}>
                  {isManual ? 'Manual' : 'Auto'}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: 12 }}>
                  {inputVal != null ? inputVal.toFixed(2) : '--'}
                </span>
              </span>
            </div>
            <table style={nerdTableStyle}>
              <thead>
                <tr>
                  <th style={nerdThStyle}>Stat</th>
                  <th style={{ ...nerdThStyle, textAlign: 'right' }}>Value</th>
                  <th style={{ ...nerdThStyle, textAlign: 'center', width: 40 }}>Inv</th>
                </tr>
              </thead>
              <tbody>
                {statDefs.map(sd => {
                  const rawVal = getStatValue(currentStats, sd.key)
                  const isEst = estimatedFields?.includes(sd.key)
                  return (
                    <tr key={sd.key} style={isEst ? { opacity: 0.6, fontStyle: 'italic' } : undefined}>
                      <td style={nerdTdStyle}>{sd.label}{isEst && <span style={{ color: '#FBBF24', marginLeft: 4, fontSize: 10 }}>~</span>}</td>
                      <td style={nerdTdNumStyle}>{formatStatValue(rawVal)}</td>
                      <td style={{ ...nerdTdStyle, textAlign: 'center', color: sd.inverse ? 'rgba(251,191,36,0.8)' : 'rgba(255,255,255,0.2)' }}>
                        {sd.inverse ? 'INV' : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

/* ── RAUS Details Panel ── */

function RAUSDetailsPanel({ raus, prospect, currentStats, bucket, estimatedFields }) {
  const [nerdOpen, setNerdOpen] = useState(false)

  const metrics = {
    scr: raus.scr_auto,
    rpi: raus.rpi_auto,
    sci: raus.sci_auto,
    star_index: raus.star_index,
    ucs: raus.ucs_auto,
    fcs: raus.fcs_auto,
    adr: raus.adr_auto,
    sti: raus.sti_auto,
    rsm: raus.rsm_auto,
    dri: raus.dri_auto,
  }

  const metricOrder = ['scr', 'rpi', 'sci', 'star_index', 'ucs', 'fcs', 'adr', 'sti', 'rsm', 'dri']

  return (
    <div style={detailPanelStyle}>
      <table style={detailTableStyle}>
        <thead>
          <tr>
            <th style={detailThStyle}>Metric</th>
            <th style={{ ...detailThStyle, textAlign: 'right' }}>Value</th>
            <th style={{ ...detailThStyle, textAlign: 'right' }}>Weight</th>
            <th style={{ ...detailThStyle, textAlign: 'right' }}>Contribution</th>
          </tr>
        </thead>
        <tbody>
          {metricOrder.map(key => {
            const val = metrics[key]
            const weight = RAUS_WEIGHTS[key]
            const contribution = val != null ? val * weight : null
            return (
              <tr key={key}>
                <td style={detailTdStyle}>{RAUS_METRIC_LABELS[key]}</td>
                <td style={detailTdNumStyle}>{val != null ? val.toFixed(2) : '--'}</td>
                <td style={detailTdNumStyle}>{weight.toFixed(2)}</td>
                <td style={detailTdNumStyle}>{contribution != null ? contribution.toFixed(3) : '--'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div style={{ marginTop: '12px' }}>
        <div style={detailSummaryRowStyle}>
          <span style={detailSummaryLabelStyle}>RAUS Base (simple avg)</span>
          <span style={detailSummaryValueStyle}>{raus.raus_base?.toFixed(2) ?? '--'}</span>
        </div>
        <div style={detailSummaryRowStyle}>
          <span style={detailSummaryLabelStyle}>RAUS Weighted (sum of contributions)</span>
          <span style={detailSummaryValueStyle}>{raus.raus_weighted?.toFixed(2) ?? '--'}</span>
        </div>
        <div style={detailSummaryRowStyle}>
          <span style={detailSummaryLabelStyle}>
            PTC Multiplier
            {prospect?.league_conf && <span style={{ opacity: 0.6, marginLeft: 6 }}>({prospect.league_conf})</span>}
          </span>
          <span style={detailSummaryValueStyle}>{raus.ptc_auto?.toFixed(2) ?? '--'}</span>
        </div>
        <div style={detailSummaryRowStyle}>
          <span style={detailSummaryLabelStyle}>RAUS Final Auto (weighted x PTC)</span>
          <span style={detailSummaryValueStyle}>{raus.raus_final_auto?.toFixed(2) ?? '--'}</span>
        </div>

        {raus.raus_override != null && (
          <div style={overrideHighlightStyle}>
            <div style={{ ...detailSummaryRowStyle, borderBottom: 'none', marginBottom: 0 }}>
              <span style={{ color: 'rgba(251,191,36,0.9)' }}>Override Applied</span>
            </div>
            <div style={{ ...detailSummaryRowStyle, borderBottom: 'none', paddingTop: 0 }}>
              <span style={detailSummaryLabelStyle}>Auto</span>
              <span style={detailSummaryValueStyle}>{raus.raus_final_auto?.toFixed(2) ?? '--'}</span>
            </div>
            <div style={{ ...detailSummaryRowStyle, borderBottom: 'none', paddingTop: 0 }}>
              <span style={detailSummaryLabelStyle}>Override</span>
              <span style={{ ...detailSummaryValueStyle, color: 'rgba(251,191,36,1)' }}>{raus.raus_override.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div style={{ ...detailSummaryRowStyle, fontWeight: 600 }}>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>
            RAUS Final
            <TierLabel tier={rausTier(raus.raus_final)} />
          </span>
          <span style={{ ...detailSummaryValueStyle, fontSize: '14px' }}>{raus.raus_final?.toFixed(2) ?? '--'}</span>
        </div>

        <div style={detailSummaryRowStyle}>
          <span style={detailSummaryLabelStyle}>
            Star Index
            <TierLabel tier={starIndexTier(raus.star_index)} />
          </span>
          <span style={detailSummaryValueStyle}>{raus.star_index?.toFixed(2) ?? '--'}</span>
        </div>

        <div style={{ ...detailSummaryRowStyle, borderBottom: 'none' }}>
          <span style={detailSummaryLabelStyle}>
            PPI
            <TierLabel tier={ppiTier(raus.ppi_auto)} />
          </span>
          <span style={detailSummaryValueStyle}>{raus.ppi_auto?.toFixed(2) ?? '--'}</span>
        </div>
      </div>

      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <button
          style={{ ...detailToggleStyle, marginLeft: 0 }}
          onClick={() => setNerdOpen(v => !v)}
        >
          {nerdOpen ? 'Hide Nerd Stuff' : 'Nerd Stuff'}
        </button>
      </div>
      {nerdOpen && <RAUSNerdStuff raus={raus} currentStats={currentStats} bucket={bucket} estimatedFields={estimatedFields} />}
    </div>
  )
}

/* ── SSA Details Panel ── */

function SSADetailsPanel({ ssa, ssaInput, bucket, prospect, measurables, currentStats, estimatedFields }) {
  const [nerdOpen, setNerdOpen] = useState(false)
  const weights = SSA_WEIGHTS[bucket]
  if (!weights || !ssaInput) return null

  const gradeKeys = ['role', 'shooting', 'creation', 'playmaking', 'defense', 'offball', 'decision', 'hustle']

  const grades = {
    role: ssaInput.role_translation,
    shooting: ssaInput.shooting_profile,
    creation: ssaInput.creation_scalability,
    playmaking: ssaInput.playmaking_efficiency,
    defense: ssaInput.defensive_impact,
    offball: ssaInput.offball_value,
    decision: ssaInput.decision_making,
    hustle: ssaInput.hustle_impact,
  }

  let weightedSum = 0
  let denom = 0
  for (const key of gradeKeys) {
    const grade = grades[key]
    if (grade != null) {
      weightedSum += grade * weights[key]
      denom += weights[key]
    }
  }

  const rawWeightedAvg = denom > 0 ? weightedSum / denom : null

  return (
    <div style={detailPanelStyle}>
      <table style={detailTableStyle}>
        <thead>
          <tr>
            <th style={detailThStyle}>Category</th>
            <th style={{ ...detailThStyle, textAlign: 'right' }}>Grade</th>
            <th style={{ ...detailThStyle, textAlign: 'right' }}>Pos Weight</th>
            <th style={{ ...detailThStyle, textAlign: 'right' }}>Weighted</th>
          </tr>
        </thead>
        <tbody>
          {gradeKeys.map(key => {
            const grade = grades[key]
            const weight = weights[key]
            const weighted = grade != null ? grade * weight : null
            return (
              <tr key={key}>
                <td style={detailTdStyle}>{SSA_GRADE_LABELS[key]}</td>
                <td style={detailTdNumStyle}>{grade != null ? grade.toFixed(2) : '--'}</td>
                <td style={detailTdNumStyle}>{weight.toFixed(2)}</td>
                <td style={detailTdNumStyle}>{weighted != null ? weighted.toFixed(3) : '--'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div style={{ marginTop: '12px' }}>
        <div style={detailSummaryRowStyle}>
          <span style={detailSummaryLabelStyle}>Sum of Weights (denominator)</span>
          <span style={detailSummaryValueStyle}>{denom.toFixed(2)}</span>
        </div>
        <div style={detailSummaryRowStyle}>
          <span style={detailSummaryLabelStyle}>Raw Weighted Average</span>
          <span style={detailSummaryValueStyle}>{rawWeightedAvg != null ? rawWeightedAvg.toFixed(4) : '--'}</span>
        </div>
        <div style={detailSummaryRowStyle}>
          <span style={detailSummaryLabelStyle}>
            Age Modifier
            {prospect?.class && <span style={{ opacity: 0.6, marginLeft: 6 }}>({prospect.class.toUpperCase()})</span>}
          </span>
          <span style={detailSummaryValueStyle}>{ssa?.age_mod?.toFixed(2) ?? '1.00'}</span>
        </div>
        <div style={detailSummaryRowStyle}>
          <span style={detailSummaryLabelStyle}>
            WS-H Modifier
            {measurables?.ws_minus_h != null && <span style={{ opacity: 0.6, marginLeft: 6 }}>(ws_minus_h = {measurables.ws_minus_h}")</span>}
          </span>
          <span style={detailSummaryValueStyle}>{ssa?.ws_h_mod?.toFixed(2) ?? '1.00'}</span>
        </div>
        <div style={{ ...detailSummaryRowStyle, fontWeight: 600 }}>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>
            SSA Final
            <TierLabel tier={ssaTier(ssa?.ssa_auto_final)} />
          </span>
          <span style={{ ...detailSummaryValueStyle, fontSize: '14px' }}>{ssa?.ssa_auto_final?.toFixed(2) ?? '--'}</span>
        </div>
        <div style={detailSummaryRowStyle}>
          <span style={detailSummaryLabelStyle}>SSA Rank Label</span>
          <span style={detailSummaryValueStyle}>{ssa?.ssa_rank_label ?? '--'}</span>
        </div>
        <div style={{ ...detailSummaryRowStyle, borderBottom: 'none' }}>
          <span style={detailSummaryLabelStyle}>SSA Weighted Rank Label</span>
          <span style={detailSummaryValueStyle}>{ssa?.ssa_weighted_rank_label ?? '--'}</span>
        </div>
      </div>

      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <button
          style={{ ...detailToggleStyle, marginLeft: 0 }}
          onClick={() => setNerdOpen(v => !v)}
        >
          {nerdOpen ? 'Hide Nerd Stuff' : 'Nerd Stuff'}
        </button>
      </div>
      {nerdOpen && <SSANerdStuff ssa={ssa} ssaInput={ssaInput} currentStats={currentStats} estimatedFields={estimatedFields} />}
    </div>
  )
}

/* ── Main Component ── */

export default function ScoutingCard() {
  const { playerId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rausDetailsOpen, setRausDetailsOpen] = useState(false)
  const [ssaDetailsOpen, setSsaDetailsOpen] = useState(false)
  const [compSwapOpen, setCompSwapOpen] = useState(false)
  const [compSwapSlot, setCompSwapSlot] = useState(null) // 'star' | 'average' | 'bust'
  const [manualComps, setManualComps] = useState({}) // { star: hp, average: hp, bust: hp }

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
        { data: injuries },
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
        supabase.from('player_injuries').select('*').eq('player_id', playerId).order('injury_date', { ascending: false }),
      ])

      // Load positional defaults and fill NULL values for display
      let estimatedFields = []
      let filledStats = stats || []
      let filledMeasurables = measurables
      try {
        const defaults = await getPositionalDefaults()
        const bucket = player?.primary_bucket
        const currentStats = stats?.[0] || null
        const { stats: fs, measurables: fm, estimatedFields: ef } = fillDefaultsSync(currentStats, measurables, bucket, defaults)
        estimatedFields = ef
        // Replace the first (current) stats entry with filled version
        if (stats && stats.length > 0) {
          filledStats = [fs, ...stats.slice(1)]
        } else if (Object.keys(fs).length > 0) {
          filledStats = [fs]
        }
        filledMeasurables = fm
      } catch { /* defaults table may not exist yet */ }

      setData({ player, prospect, raus, ssa, ssaInput, athletic, measurables: filledMeasurables, master, dna, stats: filledStats, alerts: alerts || [], derived, comps: comps || [], injuries: injuries || [], estimatedFields })
      setLoading(false)
    }
    load()
  }, [playerId])

  // Load manual comp overrides from DB
  useEffect(() => {
    if (!playerId) return
    supabase
      .from('player_comps')
      .select('comp_slot, historical_players(*)')
      .eq('player_id', playerId)
      .eq('is_manual', true)
      .then(({ data: manuals }) => {
        if (!manuals || manuals.length === 0) return
        const overrides = {}
        for (const m of manuals) {
          if (m.comp_slot && m.historical_players) {
            overrides[m.comp_slot] = m.historical_players
          }
        }
        setManualComps(overrides)
      })
  }, [playerId])

  async function handleCompSwap(historicalPlayer) {
    const slot = compSwapSlot
    setCompSwapOpen(false)
    if (!slot || !historicalPlayer) return

    // Save to database
    // First remove any existing manual override for this slot
    await supabase
      .from('player_comps')
      .delete()
      .eq('player_id', playerId)
      .eq('comp_slot', slot)
      .eq('is_manual', true)

    // Insert new manual override
    await supabase
      .from('player_comps')
      .insert({
        player_id: playerId,
        historical_player_id: historicalPlayer.id,
        comp_slot: slot,
        is_manual: true,
        comp_tier: historicalPlayer.tier || 'modern',
        similarity_distance: 0,
      })

    setManualComps(prev => ({ ...prev, [slot]: historicalPlayer }))
  }

  async function handleResetComp(slot) {
    await supabase
      .from('player_comps')
      .delete()
      .eq('player_id', playerId)
      .eq('comp_slot', slot)
      .eq('is_manual', true)

    setManualComps(prev => {
      const next = { ...prev }
      delete next[slot]
      return next
    })
  }

  async function handleResetAllComps() {
    await supabase
      .from('player_comps')
      .delete()
      .eq('player_id', playerId)
      .eq('is_manual', true)

    setManualComps({})
  }

  if (loading) return <div className="bb-loading">Loading scouting card...</div>
  if (!data?.player) return <div className="bb-loading">Player not found</div>

  const { player, prospect, raus, ssa, ssaInput, athletic, measurables, master, dna, stats, alerts, derived, comps, injuries, estimatedFields = [] } = data
  const isEstimated = (field) => estimatedFields.includes(field)
  const currentStats = stats[0]
  const sizeMultiplier = computeSizeMultiplier(prospect?.height, player.primary_bucket)
  const bustData = computeBustIndex({
    stats: currentStats,
    injuries: injuries || [],
    derived,
    sizeMultiplier,
    wshFactor: derived?.wsh_factor,
    oai: athletic?.oai,
    aaa: athletic?.aaa,
    player,
    prospect,
    master,
    measurables,
    raus,
    ssa,
  })

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
        {player.photo_url ? (
          <img src={player.photo_url} alt={player.display_name} className="sc-photo" />
        ) : (
          <div className="sc-photo-placeholder">
            {player.display_name?.split(' ').map(n => n[0]?.toUpperCase()).join('')}
          </div>
        )}
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
            {measurables?.wingspan && (
              <span className={isEstimated('wingspan') ? 'sc-est-text' : ''}>
                WS {Math.floor(measurables.wingspan / 12)}'{Math.round(measurables.wingspan % 12)}"
                {isEstimated('wingspan') && <span className="sc-est-marker">~</span>}
              </span>
            )}
            {measurables?.ws_minus_h != null && (
              <span className={isEstimated('ws_minus_h') ? 'sc-est-text' : ''}>
                (+{measurables.ws_minus_h}")
                {isEstimated('ws_minus_h') && <span className="sc-est-marker">~</span>}
              </span>
            )}
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
        <StatPill label="RAUS Final" value={raus?.raus_final?.toFixed(2)} sub={master?.tier} tier={rausTier(raus?.raus_final)} />
        <StatPill label="SSA" value={ssa?.ssa_auto_final?.toFixed(2)} sub={ssa?.ssa_rank_label} tier={ssaTier(ssa?.ssa_auto_final)} />
        {master?.ssa_age_adjusted != null && master.ssa_age_adjusted !== master.ssa && (
          <StatPill label="SSA (Age-Adj)" value={master.ssa_age_adjusted.toFixed(2)} sub={`x${master.class_multiplier?.toFixed(2)}`} />
        )}
        <StatPill label="OAI" value={athletic?.oai?.toFixed(2)} sub={athletic?.oai_band} />
        <StatPill label="AAA" value={athletic?.aaa?.toFixed(2)} sub={athletic?.aaa_band} />
        <StatPill label="Board Rank" value={`#${master?.overall_rank ?? '--'}`} />
        <StatPill label="Composite" value={master?.composite_score?.toFixed(4)} tier={compositeTier(master?.composite_score)} />
        {dna?.dna_flag && <StatPill label="DNA Max" value={dna.dna_max} sub="DNA Match" />}
      </div>

      {/* Main grid */}
      <div className="sc-grid">
        {/* Left column -- Radar + RAUS breakdown */}
        <div className="sc-card">
          <h3 className="sc-section-title">
            RAUS Skill Profile
            {raus && (
              <button
                style={detailToggleStyle}
                onClick={() => setRausDetailsOpen(v => !v)}
              >
                {rausDetailsOpen ? 'Hide Details' : 'Details'}
              </button>
            )}
          </h3>
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
          {rausDetailsOpen && raus && (
            <RAUSDetailsPanel raus={raus} prospect={prospect} currentStats={currentStats} bucket={player.primary_bucket} estimatedFields={estimatedFields} />
          )}
        </div>

        {/* Middle column -- SSA */}
        <div className="sc-card">
          <h3 className="sc-section-title">
            SSA Breakdown
            {ssa?.ssa_rank_label && <span className="sc-section-sub">{ssa.ssa_rank_label}</span>}
            {ssa && ssaInput && (
              <button
                style={detailToggleStyle}
                onClick={() => setSsaDetailsOpen(v => !v)}
              >
                {ssaDetailsOpen ? 'Hide Details' : 'Details'}
              </button>
            )}
          </h3>
          <SSABreakdown ssa={ssa} bucket={player.primary_bucket} />
          {ssaDetailsOpen && ssa && ssaInput && (
            <SSADetailsPanel
              ssa={ssa}
              ssaInput={ssaInput}
              bucket={player.primary_bucket}
              prospect={prospect}
              measurables={measurables}
              currentStats={currentStats}
              estimatedFields={estimatedFields}
            />
          )}
        </div>

      </div>

      {/* Derived Metrics row */}
      {derived && (derived.lci != null || derived.sfr != null || derived.wsh_factor != null || derived.ft_pct_label != null) && (
        <div className="sc-derived-row">
          {derived.lci != null && (() => {
            const tier = lciTier(derived.lci)
            return (
              <div className="sc-derived-card">
                <span className="sc-derived-value">{derived.lci.toFixed(2)}</span>
                <span className="sc-derived-label">LCI</span>
                {tier && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                    background: tier.color + '18', color: tier.color,
                  }}>{tier.label}</span>
                )}
              </div>
            )
          })()}
          {derived.sfr != null && (
            <div className="sc-derived-card">
              <span className="sc-derived-value">{derived.sfr.toFixed(2)}</span>
              <span className="sc-derived-label">SFR</span>
              <span className={`sc-derived-badge sc-sfr-${derived.sfr_label?.toLowerCase()}`}>{derived.sfr_label}</span>
            </div>
          )}
          {derived.wsh_factor != null && (() => {
            const tier = wshTier(derived.wsh_factor)
            return (
              <div className="sc-derived-card">
                <span className="sc-derived-value">{derived.wsh_factor.toFixed(2)}</span>
                <span className="sc-derived-label">WS-H Factor</span>
                {measurables?.ws_minus_h != null && (
                  <span className="sc-derived-sub">WS-H diff: {measurables.ws_minus_h > 0 ? '+' : ''}{measurables.ws_minus_h}"</span>
                )}
                {tier && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                    background: tier.color + '18', color: tier.color, marginTop: 2,
                  }}>{tier.label}</span>
                )}
              </div>
            )
          })()}
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

      {/* Strengths & Weaknesses */}
      <div className="sc-card sc-sw-card">
        <h3 className="sc-section-title">Strengths & Weaknesses</h3>
        <div className="sc-sw-grid">
          <div className="sc-sw-col sc-sw-strengths">
            <h4 className="sc-sw-header" style={{ color: '#2DD4BF' }}>
              <span style={{ marginRight: 6 }}>▲</span>Strengths
            </h4>
            {[prospect?.strength_1, prospect?.strength_2, prospect?.strength_3].map((s, i) => (
              s ? <div key={i} className="sc-sw-item sc-sw-strength">{s}</div> : null
            ))}
            {![prospect?.strength_1, prospect?.strength_2, prospect?.strength_3].some(Boolean) && (
              <div className="sc-section-empty">No strengths entered</div>
            )}
          </div>
          <div className="sc-sw-col sc-sw-weaknesses">
            <h4 className="sc-sw-header" style={{ color: '#F87171' }}>
              <span style={{ marginRight: 6 }}>▼</span>Weaknesses
            </h4>
            {[prospect?.weakness_1, prospect?.weakness_2, prospect?.weakness_3].map((w, i) => (
              w ? <div key={i} className="sc-sw-item sc-sw-weakness">{w}</div> : null
            ))}
            {![prospect?.weakness_1, prospect?.weakness_2, prospect?.weakness_3].some(Boolean) && (
              <div className="sc-section-empty">No weaknesses entered</div>
            )}
          </div>
        </div>
      </div>

      {/* Shades of... Historical Comps */}
      {comps.length > 0 && (
        <div className="sc-card sc-comps-card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="sc-section-title">Shades of...</h3>
          <div className="sc-shades-grid">
            {(() => {
              const outcomeOrder = {
                'MVP': 0, 'All-NBA': 1, 'All-Star': 2, 'Starter': 3,
                'Role Player': 4, 'Out of League': 5, 'Bust': 6,
              }
              const sorted = [...comps]
                .filter(c => c.historical_players && !c.is_manual)
                .sort((a, b) => {
                  const aO = outcomeOrder[a.historical_players.nba_outcome_label] ?? 3
                  const bO = outcomeOrder[b.historical_players.nba_outcome_label] ?? 3
                  return aO - bO
                })

              const autoStar = sorted[0]?.historical_players
              const autoBust = sorted[sorted.length - 1]?.historical_players
              const autoAvg = sorted[Math.floor(sorted.length / 2)]?.historical_players
              const autoSimStar = sorted[0]?.similarity_distance
              const autoSimAvg = sorted[Math.floor(sorted.length / 2)]?.similarity_distance
              const autoSimBust = sorted[sorted.length - 1]?.similarity_distance

              const shades = [
                { label: 'The Star', slot: 'star', icon: '⭐', hp: manualComps.star || autoStar, isManual: !!manualComps.star, simDist: manualComps.star ? null : autoSimStar, color: '#DFFF00' },
                { label: 'The Average', slot: 'average', icon: '📊', hp: manualComps.average || autoAvg, isManual: !!manualComps.average, simDist: manualComps.average ? null : autoSimAvg, color: '#60A5FA' },
                { label: 'The Bust', slot: 'bust', icon: '📉', hp: manualComps.bust || autoBust, isManual: !!manualComps.bust, simDist: manualComps.bust ? null : autoSimBust, color: '#F87171' },
              ].filter(s => s.hp)

              if (shades.length === 0) return <div className="sc-section-empty">No historical comps available</div>

              return shades.map(shade => {
                const hp = shade.hp
                if (!hp) return null
                const stkpg = ((hp.spg_first4 ?? 0) + (hp.bpg_first4 ?? 0)).toFixed(1)
                return (
                  <div key={shade.label} className="sc-shade-card" style={{ borderColor: shade.color + '40' }}>
                    <div className="sc-shade-header">
                      <span className="sc-shade-label" style={{ color: shade.color }}>{shade.label}</span>
                      <div className="sc-shade-actions">
                        {shade.isManual && (
                          <span className="sc-shade-manual-tag">Manual</span>
                        )}
                        <button
                          className="sc-shade-btn"
                          onClick={() => { setCompSwapSlot(shade.slot); setCompSwapOpen(true) }}
                        >Swap</button>
                        {shade.isManual && (
                          <button
                            className="sc-shade-btn sc-shade-btn-reset"
                            onClick={() => handleResetComp(shade.slot)}
                          >Reset</button>
                        )}
                      </div>
                    </div>
                    <div className="sc-shade-name">{hp.name}</div>
                    <div className="sc-shade-meta">
                      {hp.draft_year && <span>Draft {hp.draft_year}</span>}
                      {hp.draft_pick && <span>Pick #{hp.draft_pick}</span>}
                      {hp.position && <span>{hp.position}</span>}
                    </div>
                    <div className="sc-shade-stats">
                      {hp.nba_ppg_first4 != null && <span>{Number(hp.nba_ppg_first4).toFixed(1)} PPG</span>}
                      {hp.rpg_first4 != null && <span>{Number(hp.rpg_first4).toFixed(1)} RPG</span>}
                      {hp.apg_first4 != null && <span>{Number(hp.apg_first4).toFixed(1)} APG</span>}
                      <span>{stkpg} STKPG</span>
                      {hp.nba_ws48_first4 != null && <span>{Number(hp.nba_ws48_first4).toFixed(3)} WS/48</span>}
                    </div>
                    <div className="sc-shade-similarity">
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                        {hp.nba_outcome_label && <span style={{ marginRight: 8 }}>{hp.nba_outcome_label}</span>}
                        {shade.simDist != null && (
                          <>Similarity: {Math.max(0, (100 - shade.simDist * 10)).toFixed(0)}%</>
                        )}
                      </span>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
          {Object.keys(manualComps).length > 0 && (
            <button
              className="sc-shade-reset-all"
              onClick={handleResetAllComps}
            >Reset All Comps to Auto</button>
          )}
        </div>
      )}

      <CompSwapModal
        open={compSwapOpen}
        onClose={() => setCompSwapOpen(false)}
        onSelect={handleCompSwap}
        currentPlayerId={playerId}
        currentComps={comps}
      />

      {/* DNA Archetypes */}
      <div className="sc-card" style={{ gridColumn: '1 / -1' }}>
        <h3 className="sc-section-title">DNA Archetypes</h3>
        <DNAProfile dna={dna} />
      </div>

      {/* Injury History */}
      <div className="sc-card" style={{ gridColumn: '1 / -1' }}>
        <h3 className="sc-section-title">Injury History</h3>
        <InjuryHistory injuries={injuries} />
      </div>

      {/* Bust Index */}
      <div className="sc-card" style={{ gridColumn: '1 / -1' }}>
        <h3 className="sc-section-title">Bust Index</h3>
        <BustIndex bustData={bustData} />
      </div>

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
              <EstStatBox value={currentStats.ppg?.toFixed(1)} label="PPG" field="ppg" estimated={isEstimated} />
              <EstStatBox value={currentStats.rpg?.toFixed(1)} label="RPG" field="rpg" estimated={isEstimated} />
              <EstStatBox value={currentStats.apg?.toFixed(1)} label="APG" field="apg" estimated={isEstimated} />
              <EstStatBox value={currentStats.spg?.toFixed(1)} label="SPG" field="spg" estimated={isEstimated} />
              <EstStatBox value={currentStats.bpg?.toFixed(1)} label="BPG" field="bpg" estimated={isEstimated} />
              <EstStatBox value={currentStats.mpg?.toFixed(1)} label="MPG" field="mpg" estimated={isEstimated} />
              <EstStatBox value={currentStats.games} label="GP" field="games" estimated={isEstimated} />
              <EstStatBox value={currentStats.fg_pct != null ? `${(currentStats.fg_pct * 100).toFixed(1)}%` : null} label="FG%" field="fg_pct" estimated={isEstimated} />
              <EstStatBox value={currentStats.three_pt_pct != null ? `${(currentStats.three_pt_pct * 100).toFixed(1)}%` : null} label="3P%" field="three_pt_pct" estimated={isEstimated} />
              <EstStatBox value={currentStats.ft_pct != null ? `${(currentStats.ft_pct * 100).toFixed(1)}%` : null} label="FT%" field="ft_pct" estimated={isEstimated} />
              <EstStatBox value={currentStats.ts_pct != null ? `${(currentStats.ts_pct * 100).toFixed(1)}%` : null} label="TS%" field="ts_pct" estimated={isEstimated} />
              <EstStatBox value={currentStats.usg != null ? `${(currentStats.usg * 100).toFixed(1)}%` : null} label="USG" field="usg" estimated={isEstimated} />
              <EstStatBox value={currentStats.per?.toFixed(1)} label="PER" field="per" estimated={isEstimated} />
              <EstStatBox value={currentStats.bpm?.toFixed(1)} label="BPM" field="bpm" estimated={isEstimated} />
              <EstStatBox value={currentStats.ws?.toFixed(1)} label="WS" field="ws" estimated={isEstimated} />
            </div>
          ) : (
            <div className="sc-section-empty">No stats available</div>
          )}
        </div>

        {/* Scouting notes */}
        <div className="sc-card">
          <h3 className="sc-section-title">Scouting Notes</h3>
          <InfoRow label="Accolades" value={prospect?.accolades} />
          <InfoRow label="Comp (Ceiling)" value={prospect?.comp_upper} />
          <InfoRow label="Comp (Floor)" value={prospect?.comp_lower} />

          {/* Editable notes */}
          <div style={{ marginTop: 12 }}>
            <textarea
              className="sc-notes-textarea"
              placeholder="Add scouting notes..."
              defaultValue={prospect?.scouting_notes || ''}
              onBlur={async (e) => {
                const val = e.target.value
                await supabase.from('prospects').update({ scouting_notes: val }).eq('player_id', playerId)
              }}
              rows={6}
            />
          </div>

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
