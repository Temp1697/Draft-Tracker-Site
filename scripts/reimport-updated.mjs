import XLSX from 'xlsx'
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const buf = readFileSync('./Draft Model v1 Final 4 Update Stats.xlsx')
const wb = XLSX.read(buf, { type: 'buffer' })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function readSheet(name) {
  const ws = wb.Sheets[name]
  if (!ws) { console.warn(`Sheet "${name}" not found`); return [] }
  return XLSX.utils.sheet_to_json(ws)
}

function cleanRows(rows) {
  return rows
    .filter(r => r.player_id && String(r.player_id).trim() !== '')
    .map(r => {
      const out = {}
      for (const [k, v] of Object.entries(r)) {
        out[k] = typeof v === 'string' ? v.trim() : v
      }
      return out
    })
}

function naToNull(v) {
  if (v === 'N/A' || v === '' || v === 'n/a' || v === '#N/A' || v === '#VALUE!' || v === '#DIV/0!' || v === '#REF!') return null
  return v
}

function num(v) {
  const n = naToNull(v)
  if (n === null || n === undefined) return null
  const parsed = Number(n)
  return isNaN(parsed) ? null : parsed
}

function excelDate(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  if (!isNaN(n) && n > 10000 && n < 100000) {
    const d = new Date((n - 25569) * 86400 * 1000)
    return d.toISOString().split('T')[0]
  }
  const d = new Date(v)
  if (!isNaN(d.getTime()) && String(v).includes('-')) return d.toISOString().split('T')[0]
  return null
}

function int(v) {
  const n = num(v)
  return n === null ? null : Math.round(n)
}

function str(v) {
  const s = naToNull(v)
  if (s === null || s === undefined) return null
  return String(s).trim() || null
}

async function upsertBatch(table, rows, conflictCol = 'player_id', batchSize = 50) {
  if (rows.length === 0) { console.log(`  ${table}: 0 rows, skipping`); return }
  let inserted = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase.from(table).upsert(batch, { onConflict: conflictCol })
    if (error) {
      console.error(`  ${table} batch ${i}: ${error.message}`)
      console.error('  Sample row:', JSON.stringify(batch[0]).slice(0, 300))
    } else {
      inserted += batch.length
    }
  }
  console.log(`  ${table}: ${inserted}/${rows.length} rows upserted`)
}

// ---------------------------------------------------------------------------
// Track existing vs new players
// ---------------------------------------------------------------------------
let existingPlayerIds = new Set()
let newPlayerCount = 0
let updatedPlayerCount = 0

// ---------------------------------------------------------------------------
// 1. Players
// ---------------------------------------------------------------------------
async function importPlayers() {
  console.log('\n--- Players ---')

  // Get existing player IDs from DB
  const { data: existing } = await supabase.from('players').select('player_id')
  existingPlayerIds = new Set((existing || []).map(r => r.player_id))
  console.log(`  Existing players in DB: ${existingPlayerIds.size}`)

  const raw = cleanRows(readSheet('Players'))
  const rows = raw.map(r => ({
    player_id: str(r.player_id),
    display_name: str(r.display_name),
    school_team: str(r.school_team),
    primary_bucket: str(r.primary_bucket),
    style_archetype: str(r.style_archetype),
    birth_year: int(r.birth_year),
  }))

  for (const r of rows) {
    if (existingPlayerIds.has(r.player_id)) {
      updatedPlayerCount++
    } else {
      newPlayerCount++
    }
  }

  await upsertBatch('players', rows)
  return new Set(rows.map(r => r.player_id))
}

// ---------------------------------------------------------------------------
// 2. Stats — delete existing for spreadsheet players, then insert new
// ---------------------------------------------------------------------------
async function importStats(validIds) {
  console.log('\n--- Stats ---')
  const raw = cleanRows(readSheet('Stats'))
  const filtered = raw.filter(r => validIds.has(str(r.player_id)))
  console.log(`  ${filtered.length} stat rows for ${validIds.size} players`)

  const rows = filtered.map(r => ({
    player_id: str(r.player_id),
    season: str(r.season),
    games: int(r.games),
    mpg: num(r.mpg),
    ppg: num(r.ppg),
    rpg: num(r.rpg),
    apg: num(r.apg),
    spg: num(r.spg),
    bpg: num(r.bpg),
    tov: num(r.tov),
    pf: num(r.pf),
    fgm: num(r.fgm),
    fga: num(r.fga),
    three_ptm: num(r['3ptm']),
    three_pta: num(r['3pta']),
    ftm: num(r.ftm),
    fta: num(r.fta),
    fg_pct: num(r['fg%']),
    three_pt_pct: num(r['3pt%']),
    ft_pct: num(r['ft%']),
    efg_pct: num(r['efg%']),
    ts_pct: num(r['ts%']),
    three_pta_rate: num(r['3ptaR']),
    ft_rate: num(r.ftR),
    ast_tov: num(r['ast:tov']),
    pts_per40: num(r['pts/40']),
    reb_per40: num(r['reb/40']),
    ast_per40: num(r['ast/40']),
    stl_per40: num(r['stl/40']),
    blk_per40: num(r['blk/40']),
    tov_per40: num(r['tov/40']),
    orb_total: num(r['orb totals']),
    drb_total: num(r['drb totals']),
    per: num(r.PER),
    ws: num(r.WS),
    dws: num(r.DWS),
    ortg: num(r.Ortg),
    drtg: num(r.Drtg),
    bpm: num(r.BPM),
    obpm: num(r.OBPM),
    dbpm: num(r.DBPM),
    // Note: rim_fg_pct, mid_fg_pct, cs_three_pct, pu_three_pct,
    // pnr_bh_ppp, pnr_rm_ppp, su_ppp, iso_ppp, trans_freq_pct, trans_ppp
    // columns don't exist in the DB table — omitted
    pts_total: int(r['pts total']),
    reb_total: int(r['reb total']),
    ast_total: int(r['ast total']),
    tov_total: int(r['tov total']),
    min_total: int(r['min total']),
    stl_total: int(r['stl total']),
    blk_total: int(r['blk total']),
    pf_total: int(r['pf total']),
    fgm_total: int(r['fgm total']),
    fga_total: int(r['fga total']),
    three_ptm_total: int(r['3ptm total']),
    three_pta_total: int(r['3pta total']),
    ftm_total: int(r['ftm total']),
    fta_total: int(r['fta total']),
    blk_pct: num(r['blk%']),
    stl_pct: num(r['stl%']),
    dunks: int(r.dunks),
    dunks_att: int(r['dunks att']),
    dunk_pct: num(r['dunk%']),
    two_pt_close: num(r['2pt close']),
    two_pt_close_att: num(r['2pt close att']),
    two_pt_close_pct: num(r['2pt close%']),
    two_pt_far: num(r['2pt far']),
    two_pt_far_att: num(r['2pt far att']),
    two_pt_far_pct: num(r['2pt far%']),
    porpagatu: num(r.PORPAGATU),
    dporpagatu: num(r.DPORPAGATU),
    orb_pct: num(r['orb%']),
    drb_pct: num(r['drb%']),
    ast_pct: num(r['ast%']),
    tov_pct: num(r['tov%']),
    usg: num(r.usg),
    astd_at_rim_pct: num(r["AST'D At The Rim%"]),
    astd_inside_arc_pct: num(r["AST'D Inside The Arc%"]),
    astd_three_pct: num(r["AST'D 3pt%"]),
    astd_tot_pct: num(r["AST'D Tot%"]),
    at_rim_share_pct: num(r['At The Rim Share%']),
    inside_arc_share_pct: num(r['Inside The Arc Share%']),
    three_pt_share_pct: num(r['3pt Share%']),
    three_pta_per40: num(r['3pta/40']),
    fta_per40: num(r['FTA/40']),
    dunks_per_game: num(r.Dunks_Gm),
  }))

  // Delete existing stats for these players only (not all players in DB)
  console.log('  Deleting old stats for spreadsheet players...')
  const idsArr = [...validIds]
  for (let i = 0; i < idsArr.length; i += 20) {
    const chunk = idsArr.slice(i, i + 20)
    const { error } = await supabase.from('stats').delete().in('player_id', chunk)
    if (error) console.error(`  stats delete batch ${i}: ${error.message}`)
  }

  // Insert new stats
  let inserted = 0
  const batchSize = 50
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase.from('stats').insert(batch)
    if (error) {
      console.error(`  stats batch ${i}: ${error.message}`)
    } else {
      inserted += batch.length
    }
  }
  console.log(`  stats: ${inserted}/${rows.length} rows inserted`)
}

// ---------------------------------------------------------------------------
// 3. Prospects
// ---------------------------------------------------------------------------
async function importProspects(validIds) {
  console.log('\n--- Prospects ---')
  const raw = cleanRows(readSheet('Prospects_DB'))
  const filtered = raw.filter(r => validIds.has(str(r.player_id)))

  const rows = filtered.map(r => ({
    player_id: str(r.player_id),
    team: str(r.team),
    league_conf: str(r.league_conf),
    height: num(r.height),
    weight: num(r.weight),
    wingspan: num(r.wingspan),
    age_year: str(r['age/year']),
    class: str(r.class),
    tier: str(r.tier),
    // Don't overwrite strength_1-3 or weakness_1-3 — those are manually entered
  }))
  await upsertBatch('prospects', rows)
}

// ---------------------------------------------------------------------------
// 4. SSA Input
// ---------------------------------------------------------------------------
async function importSSAInput(validIds) {
  console.log('\n--- SSA Input ---')
  const raw = cleanRows(readSheet('SSA_Input').map(r => ({ ...r, player_id: r.Player_ID || r.player_id })))
  const filtered = raw.filter(r => validIds.has(str(r.player_id)))

  const rows = filtered.map(r => ({
    player_id: str(r.player_id),
    role_translation: num(r.Role_Translation),
    shooting_profile: num(r.Shooting_Profile),
    creation_scalability: num(r.Creation_Scalability),
    playmaking_efficiency: num(r.Playmaking_Efficiency),
    defensive_impact: num(r.Defensive_Impact),
    offball_value: num(r.OffBall_Value),
    decision_making: num(r.Decision_Making),
    hustle_impact: num(r.Hustle_Impact),
  }))
  await upsertBatch('ssa_input', rows)
}

// ---------------------------------------------------------------------------
// 5. Measurables
// ---------------------------------------------------------------------------
async function importMeasurables(validIds) {
  console.log('\n--- Measurables ---')
  const raw = cleanRows(readSheet('Measurables').map(r => ({ ...r, player_id: r.Player_ID || r.player_id })))
  const filtered = raw.filter(r => validIds.has(str(r.player_id)))

  const rows = filtered.map(r => ({
    player_id: str(r.player_id),
    height: num(r.Height),
    weight: num(r.Weight),
    wingspan: num(r.Wingspan),
    standing_reach: num(r.Standing_Reach),
    ws_minus_h: num(r.WS_minus_H),
  }))
  await upsertBatch('measurables', rows)
}

// ---------------------------------------------------------------------------
// 6. RAUS Scores — preserve existing raus_override
// ---------------------------------------------------------------------------
async function importRAUS(validIds) {
  console.log('\n--- RAUS Scores ---')

  // Fetch existing overrides to preserve them
  const { data: existingRaus } = await supabase.from('raus_scores').select('player_id, raus_override')
  const overrideMap = new Map()
  for (const r of (existingRaus || [])) {
    if (r.raus_override != null) overrideMap.set(r.player_id, r.raus_override)
  }

  const raw = cleanRows(readSheet('RAUS_Auto'))
  const filtered = raw.filter(r => validIds.has(str(r.player_id)))

  const rows = filtered.map(r => {
    const pid = str(r.player_id)
    const existingOverride = overrideMap.get(pid) ?? null
    return {
      player_id: pid,
      primary_bucket: str(r.Primary_bucket),
      scr_auto: num(r.SCR_Auto),
      rpi_auto: num(r.RPI_Auto),
      sci_auto: num(r.SCI_Auto),
      star_index: num(r.Star_Index),
      ptc_auto: num(r.PTC_Auto),
      ucs_auto: num(r.UCS_Auto),
      fcs_auto: num(r.FCS_Auto),
      adr_auto: num(r.ADR_Auto),
      sti_auto: num(r.STI_Auto),
      rsm_auto: num(r.RSM_Auto),
      dri_auto: num(r.DRI_Auto),
      ppi_auto: num(r.PPI_Auto),
      raus_base: num(r.RAUS_Base_Auto),
      raus_weighted: num(r.RAUS_Weighted_Auto),
      raus_final_auto: num(r.RAUS_Final_Auto),
      raus_override: existingOverride,
      raus_final: num(r.RAUS_Final),
    }
  })
  await upsertBatch('raus_scores', rows)
}

// ---------------------------------------------------------------------------
// 7. SSA Scores
// ---------------------------------------------------------------------------
async function importSSAScores(validIds) {
  console.log('\n--- SSA Scores ---')
  const raw = cleanRows(readSheet('SSA_Auto'))
  const filtered = raw.filter(r => validIds.has(str(r.player_id)))

  const rows = filtered.map(r => ({
    player_id: str(r.player_id),
    position: str(r.position),
    role: num(r.role),
    shooting: num(r.shooting),
    creation: num(r['creation ']),
    playmaking: num(r.playmaking),
    defense: num(r.defense),
    offball: num(r.offball),
    decision: num(r.decision),
    hustle: num(r.hustle),
    age_mod: num(r.age_mod),
    ws_h_mod: num(r['ws-h_mod']),
    ssa_auto_final: num(r.SSA_Auto_Final),
    ssa_rank_label: str(r.Rank),
    ssa_weighted: num(r.SSA_Weighted),
    ssa_weighted_rank_label: str(r.Rank_Weighted),
  }))
  await upsertBatch('ssa_scores', rows)
}

// ---------------------------------------------------------------------------
// 8. Athletic Scores
// ---------------------------------------------------------------------------
async function importAthleticScores(validIds) {
  console.log('\n--- Athletic Scores ---')
  const raw = cleanRows(readSheet('Measurables').map(r => ({ ...r, player_id: r.Player_ID || r.player_id })))
  const filtered = raw.filter(r => validIds.has(str(r.player_id)))

  const rows = filtered.map(r => ({
    player_id: str(r.player_id),
    mas_sqrt: num(r.MAS_Sqrt),
    mav: num(r.MAV),
    mami: num(r.MAMI),
    oai: num(r.OAI),
    oai_band: str(r.OAI_Band),
    aaa: num(r.AAA),
    aaa_band: str(r.AAA_Band),
  }))
  await upsertBatch('athletic_scores', rows)
}

// ---------------------------------------------------------------------------
// 9. Master Board
// ---------------------------------------------------------------------------
async function importMasterBoard(validIds) {
  console.log('\n--- Master Board ---')
  const raw = cleanRows(readSheet('Master_Board'))
  const filtered = raw.filter(r => validIds.has(str(r.player_id)))

  const rows = filtered.map(r => ({
    player_id: str(r.player_id),
    display_name: str(r.name),
    primary_bucket: str(r.primary_bucket),
    style_archetype: str(r.archetype),
    raus_final: num(r.RAUS_Final),
    tier: str(r.Tier),
    overall_rank: int(r['Overall Rank']),
    ssa: num(r.SSA),
    oai: num(r.OAI),
    oai_band: str(r.OAI_Band),
    aaa: num(r.AAA),
    aaa_band: str(r.AAA_Band),
    alert_status: str(r.Alert_Status) || 'Clean',
    risk_notes: str(r['Risk Notes']),
    dna_flag: r.DNA_Flag === true || r.DNA_Flag === 'TRUE' || r.DNA_Flag === '🃏',
    dna_max: num(r.DNA_Max),
  }))
  await upsertBatch('master_board', rows)
}

// ---------------------------------------------------------------------------
// 10. Player Alerts
// ---------------------------------------------------------------------------
async function importAlerts(validIds) {
  console.log('\n--- Player Alerts ---')
  const raw = cleanRows(readSheet('Player_Alerts'))
  const filtered = raw.filter(r => validIds.has(str(r.player_id)))

  if (filtered.length === 0) { console.log('  No alerts to import'); return }

  // Delete existing alerts for these players only
  const idsArr = [...validIds]
  for (let i = 0; i < idsArr.length; i += 20) {
    const chunk = idsArr.slice(i, i + 20)
    await supabase.from('player_alerts').delete().in('player_id', chunk)
  }

  const rows = filtered
    .filter(r => str(r.report_type) || str(r.notes))
    .map(r => ({
      player_id: str(r.player_id),
      report_date: excelDate(r.report_date),
      report_type: str(r.report_type) || str(r.report_date),
      notes: str(r.notes),
    }))

  let inserted = 0
  const batchSize = 50
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase.from('player_alerts').insert(batch)
    if (error) {
      console.error(`  player_alerts batch ${i}: ${error.message}`)
    } else {
      inserted += batch.length
    }
  }
  console.log(`  player_alerts: ${inserted}/${rows.length} rows inserted`)
}

// ---------------------------------------------------------------------------
// 11. DNA Scores
// ---------------------------------------------------------------------------
async function importDNA(validIds) {
  console.log('\n--- DNA Scores ---')
  const raw = cleanRows(readSheet('DNA_Archetype'))
  const filtered = raw.filter(r => validIds.has(str(r.player_id)))

  const rows = filtered.map(r => ({
    player_id: str(r.player_id),
    klaw_score: num(r.Klaw_Score),
    king_score: num(r.King_Score),
    reaper_score: num(r.Reaper_Score),
    wilt_score: num(r.Wilt_Score),
    pointgod_score: num(r.PointGod_Score),
    brow_score: num(r.Brow_Score),
    air_score: num(r.Air_Score),
    beard_score: num(r.Beard_Score),
    chef_score: num(r.Chef_Score),
    joker_score: num(r.Joker_Score),
    diesel_score: num(r.Diesel_Score),
    klaw_components: {
      c1: num(r.Klaw_C1_Defense), c2: num(r.Klaw_C2_Length),
      c3: num(r.Klaw_C3_InsideArc), c4: num(r.Klaw_C4_EffDecision), c5: num(r.Klaw_C5_OffBall)
    },
    king_components: {
      c1: num(r.King_C1_Freak), c2: num(r.King_C2_Passing),
      c3: num(r.King_C3_RimPressure), c4: num(r.King_C4_IQ_Eff), c5: num(r.King_C5_Versatility)
    },
    reaper_components: {
      c1: num(r.Reaper_C1), c2: num(r.Reaper_C2),
      c3: num(r.Reaper_C3), c4: num(r.Reaper_C4), c5: num(r.Reaper_C5)
    },
    wilt_components: {
      c1: num(r.Wilt_C1), c2: num(r.Wilt_C2),
      c3: num(r.Wilt_C3), c4: num(r.Wilt_C4), c5: num(r.Wilt_C5)
    },
    pointgod_components: {
      c1: num(r.PG_C1), c2: num(r.PG_C2),
      c3: num(r.PG_C3), c4: num(r.PG_C4), c5: num(r.PG_C5)
    },
    brow_components: {
      c1: num(r.Brow_C1), c2: num(r.Brow_C2),
      c3: num(r.Brow_C3), c4: num(r.Brow_C4), c5: num(r.Brow_C5)
    },
    air_components: {
      c1: num(r.Air_C1_Exp2WayAth), c2: num(r.Air_C2_InsideArc),
      c3: num(r.Air_C3_AlphaVolume), c4: num(r.Air_C4_RimPressure), c5: num(r.Air_C5_PerimeterD)
    },
    beard_components: {
      c1: num(r.Beard_C1), c2: num(r.Beard_C2),
      c3: num(r.Beard_C3), c4: num(r.Beard_C4), c5: num(r.Beard_C5)
    },
    chef_components: {
      c1: num(r.Chef_C1), c2: num(r.Chef_C2),
      c3: num(r.Chef_C3), c4: num(r.Chef_C4), c5: num(r.Chef_C5)
    },
    joker_components: {
      c1: num(r.Joker_C1), c2: num(r.Joker_C2),
      c3: num(r.Joker_C3), c4: num(r.Joker_C4), c5: num(r.Joker_C5)
    },
    diesel_components: {
      c1: num(r.Diesel_C1), c2: num(r.Diesel_C2),
      c3: num(r.Diesel_C3), c4: num(r.Diesel_C4), c5: num(r.Diesel_C5)
    },
    primary_archetype: str(r.Primary_Archetype),
    secondary_archetype: str(r.Secondary_Archetype),
    dna_flag: (() => {
      const scores = [num(r.Klaw_Score), num(r.King_Score), num(r.Reaper_Score),
        num(r.Wilt_Score), num(r.PointGod_Score), num(r.Brow_Score), num(r.Air_Score),
        num(r.Beard_Score), num(r.Chef_Score), num(r.Joker_Score), num(r.Diesel_Score)]
      return scores.some(s => s !== null && s >= 80)
    })(),
    dna_max: (() => {
      const scores = [num(r.Klaw_Score), num(r.King_Score), num(r.Reaper_Score),
        num(r.Wilt_Score), num(r.PointGod_Score), num(r.Brow_Score), num(r.Air_Score),
        num(r.Beard_Score), num(r.Chef_Score), num(r.Joker_Score), num(r.Diesel_Score)]
        .filter(s => s !== null)
      return scores.length > 0 ? Math.max(...scores) : null
    })(),
  }))
  await upsertBatch('dna_scores', rows)
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== NBA Draft Tracker v2 — Updated Data Import ===')
  console.log(`Workbook sheets: ${wb.SheetNames.join(', ')}`)

  // Test connection
  const { data, error } = await supabase.from('players').select('player_id').limit(1)
  if (error) {
    console.error('Supabase connection failed:', error.message)
    process.exit(1)
  }
  console.log('Supabase connected successfully.\n')

  const validIds = await importPlayers()
  console.log(`\nImporting data for ${validIds.size} players (${newPlayerCount} new, ${updatedPlayerCount} updated)...\n`)

  await importStats(validIds)
  await importProspects(validIds)
  await importSSAInput(validIds)
  await importMeasurables(validIds)
  await importRAUS(validIds)
  await importSSAScores(validIds)
  await importAthleticScores(validIds)
  await importMasterBoard(validIds)
  await importAlerts(validIds)
  await importDNA(validIds)

  console.log('\n=== Import Summary ===')
  console.log(`Players updated: ${updatedPlayerCount}`)
  console.log(`Players added (new): ${newPlayerCount}`)
  console.log(`Total in spreadsheet: ${validIds.size}`)
  console.log('\n=== Import complete — now trigger recalculation ===')
}

main().catch(err => { console.error(err); process.exit(1) })
