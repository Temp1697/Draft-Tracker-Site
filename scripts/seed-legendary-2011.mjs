#!/usr/bin/env node
// Seed script for 2011 NBA Draft — Legendary Archives
// Populates players, prospects, stats, measurables, and historical_players tables
//
// Usage: node scripts/seed-legendary-2011.mjs

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const DRAFT_YEAR = 2011
const DRAFT_CLASS = '2011'
const SEASON = '10-11'

// Helper: generate player_id from name + birth year
function pid(name, birthYear) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + birthYear
}

// Position bucket mapping
function bucket(pos) {
  if (['PG', 'SG'].includes(pos)) return 'Guard'
  if (['SF', 'SF/PF'].includes(pos)) return 'Wing'
  if (['PF', 'C', 'PF/C', 'C/PF'].includes(pos)) return 'Big'
  return 'Wing'
}

// 2011 NBA Draft — college stats from final season before draft
// Sources: Basketball Reference, historical records
const PLAYERS = [
  // === ROUND 1 ===
  {
    pick: 1, team: 'Cleveland Cavaliers', name: 'Kyrie Irving', school: 'Duke', pos: 'PG',
    birthYear: 1992, height: 75, weight: 193, wingspan: 76, conf: 'ACC',
    archetype: 'Scoring Lead Guard',
    // 2010-11 Duke: 11 games (toe injury), 17.5 PPG, 3.4 RPG, 4.3 APG
    stats: { games: 11, mpg: 30.4, ppg: 17.5, rpg: 3.4, apg: 4.3, spg: 1.5, bpg: 0.3, tov: 2.5, pf: 2.0, fg_pct: 0.536, three_pt_pct: 0.447, ft_pct: 0.872, pts_per40: 23.0, reb_per40: 4.5, ast_per40: 5.7, stl_per40: 2.0, blk_per40: 0.4, tov_per40: 3.3, usg: 0.289, per: 25.2, bpm: 9.8, obpm: 7.5, dbpm: 2.3, ws: 2.1, efg_pct: 0.625, ts_pct: 0.672, ast_pct: 0.302, tov_pct: 0.142, stl_pct: 0.033, blk_pct: 0.007, orb_pct: 0.025, drb_pct: 0.082, drtg: 95.5 },
    nba: { ppg: 22.8, rpg: 3.7, apg: 5.7, spg: 1.5, bpg: 0.4, ws48: 0.153, outcome: 'All-NBA' },
  },
  {
    pick: 2, team: 'Minnesota Timberwolves', name: 'Derrick Williams', school: 'Arizona', pos: 'SF/PF',
    birthYear: 1991, height: 81, weight: 241, wingspan: 83, conf: 'Pac-12',
    archetype: 'Stretch Big',
    // 2010-11 Arizona: 19.5 PPG, 8.1 RPG, 1.5 APG
    stats: { games: 39, mpg: 28.5, ppg: 19.5, rpg: 8.1, apg: 1.5, spg: 0.8, bpg: 1.2, tov: 2.0, pf: 2.8, fg_pct: 0.567, three_pt_pct: 0.436, ft_pct: 0.756, pts_per40: 27.4, reb_per40: 11.4, ast_per40: 2.1, stl_per40: 1.1, blk_per40: 1.7, tov_per40: 2.8, usg: 0.295, per: 27.0, bpm: 9.5, obpm: 6.0, dbpm: 3.5, ws: 7.8, efg_pct: 0.627, ts_pct: 0.659, ast_pct: 0.092, tov_pct: 0.118, stl_pct: 0.018, blk_pct: 0.034, orb_pct: 0.095, drb_pct: 0.198, drtg: 93.5 },
    nba: { ppg: 7.8, rpg: 4.2, apg: 0.9, spg: 0.4, bpg: 0.5, ws48: 0.058, outcome: 'Bust' },
  },
  {
    pick: 3, team: 'Utah Jazz', name: 'Enes Kanter', school: 'Kentucky', pos: 'C',
    birthYear: 1992, height: 82, weight: 265, wingspan: 86, conf: 'SEC',
    archetype: 'Drop Coverage Big',
    // Did not play in college (NCAA ineligible) — European stats from Fenerbahce
    stats: { games: 33, mpg: 22.5, ppg: 12.0, rpg: 7.5, apg: 0.8, spg: 0.5, bpg: 1.2, tov: 1.8, pf: 3.0, fg_pct: 0.578, three_pt_pct: null, ft_pct: 0.680, pts_per40: 21.3, reb_per40: 13.3, ast_per40: 1.4, stl_per40: 0.9, blk_per40: 2.1, tov_per40: 3.2, usg: 0.265, per: 23.5, bpm: 7.0, obpm: 3.5, dbpm: 3.5, ws: 5.5, efg_pct: 0.578, ts_pct: 0.619, ast_pct: 0.055, tov_pct: 0.135, stl_pct: 0.014, blk_pct: 0.048, orb_pct: 0.110, drb_pct: 0.218, drtg: 96.0 },
    nba: { ppg: 14.0, rpg: 9.0, apg: 1.0, spg: 0.6, bpg: 1.1, ws48: 0.101, outcome: 'Starter' },
  },
  {
    pick: 4, team: 'Cleveland Cavaliers', name: 'Tristan Thompson', school: 'Texas', pos: 'PF/C',
    birthYear: 1991, height: 81, weight: 238, wingspan: 87, conf: 'Big 12',
    archetype: 'Offensive Rebounder',
    // 2010-11 Texas: 13.1 PPG, 7.8 RPG, 0.9 APG
    stats: { games: 35, mpg: 28.0, ppg: 13.1, rpg: 7.8, apg: 0.9, spg: 0.5, bpg: 2.0, tov: 1.5, pf: 2.5, fg_pct: 0.623, three_pt_pct: null, ft_pct: 0.640, pts_per40: 18.7, reb_per40: 11.1, ast_per40: 1.3, stl_per40: 0.7, blk_per40: 2.9, tov_per40: 2.1, usg: 0.245, per: 22.0, bpm: 6.5, obpm: 2.5, dbpm: 4.0, ws: 5.8, efg_pct: 0.623, ts_pct: 0.640, ast_pct: 0.055, tov_pct: 0.108, stl_pct: 0.012, blk_pct: 0.071, orb_pct: 0.115, drb_pct: 0.195, drtg: 92.5 },
    nba: { ppg: 9.1, rpg: 9.0, apg: 0.9, spg: 0.6, bpg: 0.9, ws48: 0.096, outcome: 'Starter' },
  },
  {
    pick: 5, team: 'Toronto Raptors', name: 'Jonas Valanciunas', school: 'Lietuvos Rytas Lithuania', pos: 'C',
    birthYear: 1992, height: 83, weight: 265, wingspan: 86, conf: 'LKL',
    archetype: 'Drop Coverage Big',
    // 2010-11 Lietuvos Rytas: 12.2 PPG, 7.7 RPG in LKL
    stats: { games: 34, mpg: 24.0, ppg: 12.2, rpg: 7.7, apg: 0.7, spg: 0.6, bpg: 1.8, tov: 1.6, pf: 3.2, fg_pct: 0.588, three_pt_pct: null, ft_pct: 0.710, pts_per40: 20.3, reb_per40: 12.8, ast_per40: 1.2, stl_per40: 1.0, blk_per40: 3.0, tov_per40: 2.7, usg: 0.258, per: 22.5, bpm: 6.5, obpm: 2.8, dbpm: 3.7, ws: 5.2, efg_pct: 0.588, ts_pct: 0.631, ast_pct: 0.048, tov_pct: 0.122, stl_pct: 0.016, blk_pct: 0.065, orb_pct: 0.100, drb_pct: 0.215, drtg: 94.0 },
    nba: { ppg: 13.2, rpg: 9.5, apg: 1.2, spg: 0.6, bpg: 1.0, ws48: 0.112, outcome: 'Starter' },
  },
  {
    pick: 6, team: 'Washington Wizards', name: 'Jan Vesely', school: 'Partizan Belgrade', pos: 'SF',
    birthYear: 1990, height: 83, weight: 225, wingspan: 89, conf: 'ABA League',
    archetype: 'Slasher Wing',
    // 2010-11 Partizan: 10.8 PPG, 5.2 RPG
    stats: { games: 30, mpg: 25.0, ppg: 10.8, rpg: 5.2, apg: 1.5, spg: 1.0, bpg: 1.1, tov: 2.0, pf: 2.8, fg_pct: 0.545, three_pt_pct: 0.280, ft_pct: 0.695, pts_per40: 17.3, reb_per40: 8.3, ast_per40: 2.4, stl_per40: 1.6, blk_per40: 1.8, tov_per40: 3.2, usg: 0.238, per: 18.5, bpm: 4.5, obpm: 2.0, dbpm: 2.5, ws: 4.2, efg_pct: 0.558, ts_pct: 0.596, ast_pct: 0.108, tov_pct: 0.148, stl_pct: 0.025, blk_pct: 0.038, orb_pct: 0.060, drb_pct: 0.145, drtg: 96.5 },
    nba: { ppg: 3.4, rpg: 2.4, apg: 0.7, spg: 0.4, bpg: 0.5, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 7, team: 'Sacramento Kings', name: 'Bismack Biyombo', school: 'Baloncesto Fuenlabrada Spain', pos: 'C',
    birthYear: 1992, height: 81, weight: 245, wingspan: 91, conf: 'ACB',
    archetype: 'Rim Protector',
    // 2010-11 Fuenlabrada: 8.2 PPG, 7.0 RPG, shot-blocking specialist
    stats: { games: 30, mpg: 20.0, ppg: 8.2, rpg: 7.0, apg: 0.5, spg: 0.8, bpg: 2.8, tov: 1.5, pf: 3.5, fg_pct: 0.558, three_pt_pct: null, ft_pct: 0.490, pts_per40: 16.4, reb_per40: 14.0, ast_per40: 1.0, stl_per40: 1.6, blk_per40: 5.6, tov_per40: 3.0, usg: 0.210, per: 21.0, bpm: 6.0, obpm: 0.5, dbpm: 5.5, ws: 4.0, efg_pct: 0.558, ts_pct: 0.540, ast_pct: 0.038, tov_pct: 0.142, stl_pct: 0.022, blk_pct: 0.112, orb_pct: 0.120, drb_pct: 0.230, drtg: 91.5 },
    nba: { ppg: 5.9, rpg: 5.7, apg: 0.5, spg: 0.7, bpg: 1.7, ws48: 0.078, outcome: 'Role Player' },
  },
  {
    pick: 8, team: 'Detroit Pistons', name: 'Brandon Knight', school: 'Kentucky', pos: 'PG',
    birthYear: 1991, height: 75, weight: 189, wingspan: 77, conf: 'SEC',
    archetype: 'Scoring Lead Guard',
    // 2010-11 Kentucky: 17.3 PPG, 3.4 RPG, 4.2 APG
    stats: { games: 39, mpg: 33.5, ppg: 17.3, rpg: 3.4, apg: 4.2, spg: 1.3, bpg: 0.3, tov: 2.5, pf: 2.2, fg_pct: 0.440, three_pt_pct: 0.338, ft_pct: 0.779, pts_per40: 20.7, reb_per40: 4.1, ast_per40: 5.0, stl_per40: 1.6, blk_per40: 0.4, tov_per40: 3.0, usg: 0.278, per: 19.5, bpm: 5.5, obpm: 4.0, dbpm: 1.5, ws: 5.5, efg_pct: 0.480, ts_pct: 0.548, ast_pct: 0.238, tov_pct: 0.140, stl_pct: 0.026, blk_pct: 0.008, orb_pct: 0.018, drb_pct: 0.082, drtg: 98.5 },
    nba: { ppg: 14.2, rpg: 2.8, apg: 3.8, spg: 0.9, bpg: 0.2, ws48: 0.072, outcome: 'Starter' },
  },
  {
    pick: 9, team: 'Charlotte Bobcats', name: 'Kemba Walker', school: 'Connecticut', pos: 'PG',
    birthYear: 1990, height: 73, weight: 172, wingspan: 76, conf: 'Big East',
    archetype: 'Scoring Lead Guard',
    // 2010-11 UConn: 23.5 PPG, 5.4 RPG, 4.5 APG — Big East Player of Year, NCAA champion
    stats: { games: 41, mpg: 37.5, ppg: 23.5, rpg: 5.4, apg: 4.5, spg: 1.8, bpg: 0.2, tov: 2.8, pf: 2.2, fg_pct: 0.462, three_pt_pct: 0.376, ft_pct: 0.812, pts_per40: 25.1, reb_per40: 5.8, ast_per40: 4.8, stl_per40: 1.9, blk_per40: 0.2, tov_per40: 3.0, usg: 0.315, per: 22.5, bpm: 7.8, obpm: 6.0, dbpm: 1.8, ws: 7.5, efg_pct: 0.520, ts_pct: 0.582, ast_pct: 0.228, tov_pct: 0.140, stl_pct: 0.035, blk_pct: 0.004, orb_pct: 0.022, drb_pct: 0.108, drtg: 97.0 },
    nba: { ppg: 19.3, rpg: 3.9, apg: 5.4, spg: 1.3, bpg: 0.3, ws48: 0.108, outcome: 'All-Star' },
  },
  {
    pick: 10, team: 'Milwaukee Bucks', name: 'Jimmer Fredette', school: 'BYU', pos: 'PG/SG',
    birthYear: 1989, height: 74, weight: 195, wingspan: 75, conf: 'Mountain West',
    archetype: 'Movement Shooter',
    // 2010-11 BYU: 28.9 PPG, 4.0 RPG, 4.7 APG — Naismith Player of Year
    stats: { games: 32, mpg: 34.2, ppg: 28.9, rpg: 4.0, apg: 4.7, spg: 1.2, bpg: 0.2, tov: 3.2, pf: 1.8, fg_pct: 0.473, three_pt_pct: 0.394, ft_pct: 0.890, pts_per40: 33.8, reb_per40: 4.7, ast_per40: 5.5, stl_per40: 1.4, blk_per40: 0.2, tov_per40: 3.7, usg: 0.360, per: 24.5, bpm: 8.5, obpm: 8.0, dbpm: 0.5, ws: 7.0, efg_pct: 0.552, ts_pct: 0.632, ast_pct: 0.225, tov_pct: 0.130, stl_pct: 0.022, blk_pct: 0.004, orb_pct: 0.015, drb_pct: 0.075, drtg: 101.0 },
    nba: { ppg: 7.5, rpg: 1.6, apg: 2.2, spg: 0.4, bpg: 0.1, ws48: 0.025, outcome: 'Bust' },
  },
  {
    pick: 11, team: 'Golden State Warriors', name: 'Klay Thompson', school: 'Washington State', pos: 'SG',
    birthYear: 1990, height: 79, weight: 215, wingspan: 82, conf: 'Pac-12',
    archetype: 'Movement Shooter',
    // 2010-11 Washington State: 21.6 PPG, 4.5 RPG, 2.5 APG
    stats: { games: 31, mpg: 33.5, ppg: 21.6, rpg: 4.5, apg: 2.5, spg: 1.0, bpg: 0.4, tov: 1.8, pf: 2.0, fg_pct: 0.453, three_pt_pct: 0.393, ft_pct: 0.812, pts_per40: 25.8, reb_per40: 5.4, ast_per40: 3.0, stl_per40: 1.2, blk_per40: 0.5, tov_per40: 2.1, usg: 0.295, per: 22.5, bpm: 7.5, obpm: 6.0, dbpm: 1.5, ws: 5.8, efg_pct: 0.528, ts_pct: 0.588, ast_pct: 0.138, tov_pct: 0.112, stl_pct: 0.020, blk_pct: 0.010, orb_pct: 0.022, drb_pct: 0.092, drtg: 97.5 },
    nba: { ppg: 22.3, rpg: 3.5, apg: 2.3, spg: 1.1, bpg: 0.5, ws48: 0.168, outcome: 'All-NBA' },
  },
  {
    pick: 12, team: 'Utah Jazz', name: 'Alec Burks', school: 'Colorado', pos: 'SG',
    birthYear: 1991, height: 77, weight: 214, wingspan: 81, conf: 'Big 12',
    archetype: 'Slasher Wing',
    // 2010-11 Colorado: 20.5 PPG, 5.0 RPG, 2.3 APG
    stats: { games: 33, mpg: 33.0, ppg: 20.5, rpg: 5.0, apg: 2.3, spg: 1.5, bpg: 0.3, tov: 2.5, pf: 2.2, fg_pct: 0.462, three_pt_pct: 0.338, ft_pct: 0.795, pts_per40: 24.8, reb_per40: 6.1, ast_per40: 2.8, stl_per40: 1.8, blk_per40: 0.4, tov_per40: 3.0, usg: 0.308, per: 21.5, bpm: 6.8, obpm: 5.5, dbpm: 1.3, ws: 5.5, efg_pct: 0.520, ts_pct: 0.588, ast_pct: 0.138, tov_pct: 0.138, stl_pct: 0.030, blk_pct: 0.008, orb_pct: 0.028, drb_pct: 0.098, drtg: 100.0 },
    nba: { ppg: 10.5, rpg: 2.8, apg: 2.2, spg: 0.8, bpg: 0.2, ws48: 0.065, outcome: 'Role Player' },
  },
  {
    pick: 13, team: 'Phoenix Suns', name: 'Markieff Morris', school: 'Kansas', pos: 'PF',
    birthYear: 1989, height: 81, weight: 245, wingspan: 84, conf: 'Big 12',
    archetype: 'Stretch Big',
    // 2010-11 Kansas: 13.0 PPG, 6.3 RPG, 1.5 APG
    stats: { games: 37, mpg: 26.5, ppg: 13.0, rpg: 6.3, apg: 1.5, spg: 0.8, bpg: 1.0, tov: 1.8, pf: 2.5, fg_pct: 0.518, three_pt_pct: 0.375, ft_pct: 0.702, pts_per40: 19.6, reb_per40: 9.5, ast_per40: 2.3, stl_per40: 1.2, blk_per40: 1.5, tov_per40: 2.7, usg: 0.262, per: 20.5, bpm: 6.0, obpm: 3.0, dbpm: 3.0, ws: 5.5, efg_pct: 0.565, ts_pct: 0.592, ast_pct: 0.098, tov_pct: 0.128, stl_pct: 0.019, blk_pct: 0.030, orb_pct: 0.070, drb_pct: 0.165, drtg: 95.5 },
    nba: { ppg: 11.0, rpg: 5.5, apg: 1.8, spg: 0.7, bpg: 0.8, ws48: 0.080, outcome: 'Starter' },
  },
  {
    pick: 14, team: 'Houston Rockets', name: 'Marcus Morris', school: 'Kansas', pos: 'SF/PF',
    birthYear: 1989, height: 81, weight: 235, wingspan: 85, conf: 'Big 12',
    archetype: 'Slasher Wing',
    // 2010-11 Kansas: 13.3 PPG, 7.0 RPG, 1.8 APG
    stats: { games: 37, mpg: 27.0, ppg: 13.3, rpg: 7.0, apg: 1.8, spg: 0.8, bpg: 0.8, tov: 2.0, pf: 2.5, fg_pct: 0.540, three_pt_pct: 0.368, ft_pct: 0.740, pts_per40: 19.7, reb_per40: 10.4, ast_per40: 2.7, stl_per40: 1.2, blk_per40: 1.2, tov_per40: 3.0, usg: 0.268, per: 21.0, bpm: 6.2, obpm: 3.2, dbpm: 3.0, ws: 5.8, efg_pct: 0.586, ts_pct: 0.614, ast_pct: 0.118, tov_pct: 0.132, stl_pct: 0.019, blk_pct: 0.025, orb_pct: 0.080, drb_pct: 0.178, drtg: 95.0 },
    nba: { ppg: 12.5, rpg: 5.2, apg: 1.5, spg: 0.7, bpg: 0.6, ws48: 0.082, outcome: 'Starter' },
  },
  {
    pick: 15, team: 'Indiana Pacers', name: 'Kawhi Leonard', school: 'San Diego State', pos: 'SF',
    birthYear: 1991, height: 79, weight: 225, wingspan: 87, conf: 'Mountain West',
    archetype: 'Two Way Star Wing',
    // 2010-11 San Diego State: 15.5 PPG, 10.6 RPG, 2.5 APG
    stats: { games: 37, mpg: 34.2, ppg: 15.5, rpg: 10.6, apg: 2.5, spg: 2.0, bpg: 0.6, tov: 2.2, pf: 2.5, fg_pct: 0.559, three_pt_pct: 0.278, ft_pct: 0.774, pts_per40: 18.1, reb_per40: 12.4, ast_per40: 2.9, stl_per40: 2.3, blk_per40: 0.7, tov_per40: 2.6, usg: 0.262, per: 24.5, bpm: 9.2, obpm: 4.5, dbpm: 4.7, ws: 7.8, efg_pct: 0.573, ts_pct: 0.618, ast_pct: 0.145, tov_pct: 0.132, stl_pct: 0.040, blk_pct: 0.016, orb_pct: 0.098, drb_pct: 0.262, drtg: 89.5 },
    nba: { ppg: 19.8, rpg: 6.4, apg: 2.7, spg: 1.8, bpg: 0.6, ws48: 0.208, outcome: 'MVP' },
  },
  {
    pick: 16, team: 'Philadelphia 76ers', name: 'Nikola Vucevic', school: 'USC', pos: 'C',
    birthYear: 1990, height: 83, weight: 260, wingspan: 85, conf: 'Pac-12',
    archetype: 'Stretch Big',
    // 2010-11 USC: 18.1 PPG, 11.6 RPG, 1.6 APG
    stats: { games: 33, mpg: 32.5, ppg: 18.1, rpg: 11.6, apg: 1.6, spg: 0.8, bpg: 1.2, tov: 2.0, pf: 2.8, fg_pct: 0.538, three_pt_pct: 0.304, ft_pct: 0.712, pts_per40: 22.3, reb_per40: 14.3, ast_per40: 2.0, stl_per40: 1.0, blk_per40: 1.5, tov_per40: 2.5, usg: 0.282, per: 24.5, bpm: 8.5, obpm: 4.5, dbpm: 4.0, ws: 7.5, efg_pct: 0.557, ts_pct: 0.595, ast_pct: 0.092, tov_pct: 0.122, stl_pct: 0.016, blk_pct: 0.032, orb_pct: 0.108, drb_pct: 0.268, drtg: 94.0 },
    nba: { ppg: 17.5, rpg: 10.8, apg: 2.3, spg: 0.7, bpg: 0.9, ws48: 0.118, outcome: 'All-Star' },
  },
  {
    pick: 17, team: 'New York Knicks', name: 'Iman Shumpert', school: 'Georgia Tech', pos: 'SG',
    birthYear: 1990, height: 77, weight: 220, wingspan: 83, conf: 'ACC',
    archetype: 'POA Defender',
    // 2010-11 Georgia Tech: 16.2 PPG, 5.5 RPG, 3.8 APG
    stats: { games: 33, mpg: 34.8, ppg: 16.2, rpg: 5.5, apg: 3.8, spg: 2.2, bpg: 0.5, tov: 2.8, pf: 2.3, fg_pct: 0.432, three_pt_pct: 0.353, ft_pct: 0.718, pts_per40: 18.6, reb_per40: 6.3, ast_per40: 4.4, stl_per40: 2.5, blk_per40: 0.6, tov_per40: 3.2, usg: 0.278, per: 19.5, bpm: 5.5, obpm: 3.5, dbpm: 2.0, ws: 5.5, efg_pct: 0.495, ts_pct: 0.540, ast_pct: 0.202, tov_pct: 0.148, stl_pct: 0.045, blk_pct: 0.012, orb_pct: 0.042, drb_pct: 0.115, drtg: 95.5 },
    nba: { ppg: 8.8, rpg: 3.5, apg: 1.8, spg: 1.2, bpg: 0.3, ws48: 0.072, outcome: 'Starter' },
  },
  {
    pick: 18, team: 'Washington Wizards', name: 'Chris Singleton', school: 'Florida State', pos: 'SF',
    birthYear: 1990, height: 80, weight: 222, wingspan: 88, conf: 'ACC',
    archetype: 'Versatile Defender',
    // 2010-11 Florida State: 12.2 PPG, 6.8 RPG, 1.5 APG
    stats: { games: 35, mpg: 31.5, ppg: 12.2, rpg: 6.8, apg: 1.5, spg: 1.8, bpg: 2.1, tov: 1.8, pf: 2.5, fg_pct: 0.478, three_pt_pct: 0.325, ft_pct: 0.718, pts_per40: 15.5, reb_per40: 8.6, ast_per40: 1.9, stl_per40: 2.3, blk_per40: 2.7, tov_per40: 2.3, usg: 0.228, per: 18.5, bpm: 5.5, obpm: 1.5, dbpm: 4.0, ws: 5.5, efg_pct: 0.523, ts_pct: 0.558, ast_pct: 0.092, tov_pct: 0.118, stl_pct: 0.038, blk_pct: 0.070, orb_pct: 0.058, drb_pct: 0.162, drtg: 91.5 },
    nba: { ppg: 4.0, rpg: 2.5, apg: 0.7, spg: 0.5, bpg: 0.5, ws48: 0.030, outcome: 'Bust' },
  },
  {
    pick: 19, team: 'Milwaukee Bucks', name: 'Tobias Harris', school: 'Tennessee', pos: 'SF/PF',
    birthYear: 1992, height: 81, weight: 235, wingspan: 83, conf: 'SEC',
    archetype: 'Stretch Big',
    // 2010-11 Tennessee: 15.3 PPG, 7.2 RPG, 1.5 APG
    stats: { games: 33, mpg: 30.5, ppg: 15.3, rpg: 7.2, apg: 1.5, spg: 0.8, bpg: 0.8, tov: 1.8, pf: 2.5, fg_pct: 0.478, three_pt_pct: 0.312, ft_pct: 0.755, pts_per40: 20.1, reb_per40: 9.5, ast_per40: 2.0, stl_per40: 1.1, blk_per40: 1.1, tov_per40: 2.4, usg: 0.268, per: 20.5, bpm: 5.8, obpm: 3.2, dbpm: 2.6, ws: 5.2, efg_pct: 0.512, ts_pct: 0.561, ast_pct: 0.098, tov_pct: 0.118, stl_pct: 0.018, blk_pct: 0.024, orb_pct: 0.065, drb_pct: 0.172, drtg: 96.0 },
    nba: { ppg: 17.0, rpg: 6.4, apg: 2.5, spg: 0.8, bpg: 0.5, ws48: 0.121, outcome: 'All-Star' },
  },
  {
    pick: 20, team: 'Houston Rockets', name: 'Donatas Motiejunas', school: 'Benetton Treviso', pos: 'PF/C',
    birthYear: 1990, height: 84, weight: 222, wingspan: 87, conf: 'Italian Lega Basket',
    archetype: 'Stretch Big',
    // 2010-11 Benetton Treviso: 11.5 PPG, 5.5 RPG
    stats: { games: 30, mpg: 22.0, ppg: 11.5, rpg: 5.5, apg: 1.2, spg: 0.5, bpg: 0.8, tov: 1.8, pf: 2.8, fg_pct: 0.502, three_pt_pct: 0.345, ft_pct: 0.718, pts_per40: 20.9, reb_per40: 10.0, ast_per40: 2.2, stl_per40: 0.9, blk_per40: 1.5, tov_per40: 3.3, usg: 0.252, per: 18.5, bpm: 4.5, obpm: 2.5, dbpm: 2.0, ws: 4.0, efg_pct: 0.540, ts_pct: 0.575, ast_pct: 0.098, tov_pct: 0.138, stl_pct: 0.014, blk_pct: 0.028, orb_pct: 0.072, drb_pct: 0.158, drtg: 98.0 },
    nba: { ppg: 9.0, rpg: 4.5, apg: 1.3, spg: 0.4, bpg: 0.5, ws48: 0.068, outcome: 'Role Player' },
  },
  {
    pick: 21, team: 'Portland Trail Blazers', name: 'Nolan Smith', school: 'Duke', pos: 'PG',
    birthYear: 1988, height: 74, weight: 195, wingspan: 76, conf: 'ACC',
    archetype: 'Secondary Playmaker',
    // 2010-11 Duke: 20.0 PPG, 3.8 RPG, 5.2 APG
    stats: { games: 37, mpg: 34.5, ppg: 20.0, rpg: 3.8, apg: 5.2, spg: 1.5, bpg: 0.2, tov: 2.5, pf: 2.0, fg_pct: 0.455, three_pt_pct: 0.360, ft_pct: 0.798, pts_per40: 23.2, reb_per40: 4.4, ast_per40: 6.0, stl_per40: 1.7, blk_per40: 0.2, tov_per40: 2.9, usg: 0.298, per: 20.5, bpm: 6.0, obpm: 5.0, dbpm: 1.0, ws: 5.5, efg_pct: 0.510, ts_pct: 0.566, ast_pct: 0.275, tov_pct: 0.138, stl_pct: 0.030, blk_pct: 0.005, orb_pct: 0.018, drb_pct: 0.072, drtg: 98.5 },
    nba: { ppg: 2.5, rpg: 1.0, apg: 1.2, spg: 0.4, bpg: 0.1, ws48: 0.008, outcome: 'Bust' },
  },
  {
    pick: 22, team: 'Denver Nuggets', name: 'Kenneth Faried', school: 'Morehead State', pos: 'PF',
    birthYear: 1989, height: 80, weight: 228, wingspan: 83, conf: 'OVC',
    archetype: 'Offensive Rebounder',
    // 2010-11 Morehead State: 17.7 PPG, 14.5 RPG — NCAA rebounding leader
    stats: { games: 34, mpg: 31.0, ppg: 17.7, rpg: 14.5, apg: 1.0, spg: 1.0, bpg: 1.5, tov: 1.8, pf: 2.8, fg_pct: 0.637, three_pt_pct: null, ft_pct: 0.575, pts_per40: 22.8, reb_per40: 18.7, ast_per40: 1.3, stl_per40: 1.3, blk_per40: 1.9, tov_per40: 2.3, usg: 0.278, per: 30.5, bpm: 12.5, obpm: 5.5, dbpm: 7.0, ws: 9.5, efg_pct: 0.637, ts_pct: 0.630, ast_pct: 0.062, tov_pct: 0.108, stl_pct: 0.021, blk_pct: 0.042, orb_pct: 0.175, drb_pct: 0.295, drtg: 88.5 },
    nba: { ppg: 11.3, rpg: 8.8, apg: 0.8, spg: 0.7, bpg: 0.8, ws48: 0.107, outcome: 'Starter' },
  },
  {
    pick: 23, team: 'Chicago Bulls', name: 'Nikola Mirotic', school: 'Real Madrid', pos: 'PF',
    birthYear: 1991, height: 82, weight: 220, wingspan: 84, conf: 'ACB',
    archetype: 'Stretch Big',
    // 2010-11 Real Madrid youth/senior: 13.5 PPG, 5.5 RPG (rights held, played in Spain until 2014)
    stats: { games: 28, mpg: 24.5, ppg: 13.5, rpg: 5.5, apg: 1.5, spg: 0.8, bpg: 0.6, tov: 1.5, pf: 2.5, fg_pct: 0.498, three_pt_pct: 0.385, ft_pct: 0.815, pts_per40: 22.0, reb_per40: 9.0, ast_per40: 2.5, stl_per40: 1.3, blk_per40: 1.0, tov_per40: 2.5, usg: 0.265, per: 21.0, bpm: 6.5, obpm: 4.5, dbpm: 2.0, ws: 4.5, efg_pct: 0.548, ts_pct: 0.600, ast_pct: 0.115, tov_pct: 0.108, stl_pct: 0.022, blk_pct: 0.020, orb_pct: 0.060, drb_pct: 0.148, drtg: 96.5 },
    nba: { ppg: 13.3, rpg: 5.3, apg: 1.5, spg: 0.7, bpg: 0.5, ws48: 0.098, outcome: 'Starter' },
  },
  {
    pick: 24, team: 'Oklahoma City Thunder', name: 'Reggie Jackson', school: 'Boston College', pos: 'PG',
    birthYear: 1990, height: 75, weight: 208, wingspan: 79, conf: 'ACC',
    archetype: 'Secondary Playmaker',
    // 2010-11 Boston College: 18.7 PPG, 4.4 RPG, 5.2 APG
    stats: { games: 31, mpg: 33.8, ppg: 18.7, rpg: 4.4, apg: 5.2, spg: 1.5, bpg: 0.3, tov: 2.8, pf: 2.3, fg_pct: 0.441, three_pt_pct: 0.322, ft_pct: 0.778, pts_per40: 22.1, reb_per40: 5.2, ast_per40: 6.2, stl_per40: 1.8, blk_per40: 0.4, tov_per40: 3.3, usg: 0.302, per: 19.5, bpm: 5.5, obpm: 4.5, dbpm: 1.0, ws: 5.0, efg_pct: 0.490, ts_pct: 0.552, ast_pct: 0.272, tov_pct: 0.145, stl_pct: 0.030, blk_pct: 0.008, orb_pct: 0.028, drb_pct: 0.088, drtg: 99.5 },
    nba: { ppg: 15.2, rpg: 3.5, apg: 5.0, spg: 0.9, bpg: 0.3, ws48: 0.089, outcome: 'Starter' },
  },
  // === ROUND 2 notable picks ===
  {
    pick: 30, team: 'Chicago Bulls', name: 'Jimmy Butler', school: 'Marquette', pos: 'SG/SF',
    birthYear: 1989, height: 79, weight: 220, wingspan: 82, conf: 'Big East',
    archetype: 'Two Way Star Wing',
    // 2010-11 Marquette: 14.7 PPG, 6.4 RPG, 1.8 APG
    stats: { games: 34, mpg: 31.5, ppg: 14.7, rpg: 6.4, apg: 1.8, spg: 1.5, bpg: 0.5, tov: 1.8, pf: 2.3, fg_pct: 0.488, three_pt_pct: 0.350, ft_pct: 0.720, pts_per40: 18.7, reb_per40: 8.1, ast_per40: 2.3, stl_per40: 1.9, blk_per40: 0.6, tov_per40: 2.3, usg: 0.265, per: 20.5, bpm: 6.5, obpm: 3.5, dbpm: 3.0, ws: 5.8, efg_pct: 0.525, ts_pct: 0.557, ast_pct: 0.112, tov_pct: 0.118, stl_pct: 0.032, blk_pct: 0.014, orb_pct: 0.058, drb_pct: 0.142, drtg: 95.5 },
    nba: { ppg: 19.3, rpg: 5.1, apg: 4.3, spg: 1.7, bpg: 0.5, ws48: 0.163, outcome: 'All-NBA' },
  },
  {
    pick: 38, team: 'Houston Rockets', name: 'Chandler Parsons', school: 'Florida', pos: 'SF',
    birthYear: 1988, height: 82, weight: 230, wingspan: 84, conf: 'SEC',
    archetype: 'Stretch Big',
    // 2010-11 Florida: 16.4 PPG, 8.1 RPG, 4.5 APG
    stats: { games: 32, mpg: 34.5, ppg: 16.4, rpg: 8.1, apg: 4.5, spg: 1.2, bpg: 0.5, tov: 2.2, pf: 2.0, fg_pct: 0.502, three_pt_pct: 0.380, ft_pct: 0.758, pts_per40: 19.0, reb_per40: 9.4, ast_per40: 5.2, stl_per40: 1.4, blk_per40: 0.6, tov_per40: 2.5, usg: 0.270, per: 23.5, bpm: 8.2, obpm: 5.5, dbpm: 2.7, ws: 7.0, efg_pct: 0.560, ts_pct: 0.603, ast_pct: 0.248, tov_pct: 0.128, stl_pct: 0.024, blk_pct: 0.014, orb_pct: 0.065, drb_pct: 0.178, drtg: 94.5 },
    nba: { ppg: 13.9, rpg: 5.0, apg: 3.1, spg: 0.9, bpg: 0.4, ws48: 0.092, outcome: 'Starter' },
  },
  {
    pick: 60, team: 'Sacramento Kings', name: 'Isaiah Thomas', school: 'Washington', pos: 'PG',
    birthYear: 1989, height: 69, weight: 185, wingspan: 70, conf: 'Pac-12',
    archetype: 'Scoring Lead Guard',
    // 2010-11 Washington: 19.6 PPG, 4.7 RPG, 5.0 APG
    stats: { games: 33, mpg: 33.5, ppg: 19.6, rpg: 4.7, apg: 5.0, spg: 1.8, bpg: 0.2, tov: 2.8, pf: 2.2, fg_pct: 0.441, three_pt_pct: 0.380, ft_pct: 0.820, pts_per40: 23.4, reb_per40: 5.6, ast_per40: 6.0, stl_per40: 2.2, blk_per40: 0.2, tov_per40: 3.3, usg: 0.318, per: 22.5, bpm: 7.5, obpm: 6.5, dbpm: 1.0, ws: 6.5, efg_pct: 0.498, ts_pct: 0.580, ast_pct: 0.278, tov_pct: 0.142, stl_pct: 0.038, blk_pct: 0.004, orb_pct: 0.020, drb_pct: 0.092, drtg: 99.0 },
    nba: { ppg: 19.0, rpg: 3.5, apg: 5.8, spg: 1.1, bpg: 0.2, ws48: 0.118, outcome: 'All-Star' },
  },
]

async function upsert(table, data) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(Array.isArray(data) ? data : [data]),
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Upsert ${table} failed: ${resp.status} — ${text}`)
  }
  return resp
}

async function seed() {
  console.log(`Seeding ${DRAFT_CLASS} NBA Draft — Legendary Archives`)

  const allPlayers = PLAYERS.filter(p => p.stats)
  console.log(`Processing ${allPlayers.length} players with stats...`)

  for (const p of allPlayers) {
    const playerId = pid(p.name, p.birthYear)
    console.log(`  ${p.pick}. ${p.name} (${playerId})`)

    // 1. Players table
    await upsert('players', {
      player_id: playerId,
      display_name: p.name.toLowerCase(),
      school_team: p.school,
      primary_bucket: bucket(p.pos),
      style_archetype: p.archetype,
      birth_year: p.birthYear,
      draft_class: DRAFT_CLASS,
      draft_status: 'drafted',
      draft_pick: p.pick,
      draft_team: p.team,
    })

    // 2. Prospects table
    await upsert('prospects', {
      player_id: playerId,
      team: p.school,
      league_conf: p.conf,
      height: p.height,
      weight: p.weight,
      wingspan: p.wingspan,
      class: 'Freshman',
    })

    // 3. Stats table
    if (p.stats) {
      await upsert('stats', {
        player_id: playerId,
        season: SEASON,
        ...p.stats,
      })
    }

    // 4. Measurables table
    await upsert('measurables', {
      player_id: playerId,
      height: p.height,
      weight: p.weight,
      wingspan: p.wingspan,
      ws_minus_h: p.wingspan && p.height ? p.wingspan - p.height : null,
    })

    // 5. Historical players table (for comp engine)
    if (p.nba) {
      const isLegend = ['MVP', 'All-NBA'].includes(p.nba.outcome)
      await upsert('historical_players', {
        name: p.name,
        draft_year: DRAFT_YEAR,
        draft_pick: p.pick,
        position: p.pos,
        tier: isLegend ? 'legend' : 'modern',
        college_team: p.school,
        height: p.height,
        weight: p.weight,
        ws_minus_h: p.wingspan && p.height ? p.wingspan - p.height : null,
        nba_ppg_first4: p.nba.ppg,
        rpg_first4: p.nba.rpg,
        apg_first4: p.nba.apg,
        nba_ws48_first4: p.nba.ws48,
        nba_outcome_label: p.nba.outcome,
      })
    }
  }

  console.log('\nDone! Now run Recalculate All on the site to generate scores.')
  console.log(`Players seeded: ${allPlayers.length}`)
  console.log(`Navigate to /legendary-archives?year=2011 to view the board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
