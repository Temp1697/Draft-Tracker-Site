#!/usr/bin/env node
// Seed script for 2020 NBA Draft — Legendary Archives
// Populates players, prospects, stats, measurables, and historical_players tables
//
// Usage: node scripts/seed-legendary-2020.mjs

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const DRAFT_YEAR = 2020
const DRAFT_CLASS = '2020'
const SEASON = '19-20'

// Helper: generate player_id from name + birth year
function pid(name, birthYear) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + birthYear
}

// Position bucket mapping
function bucket(pos) {
  if (['PG', 'SG', 'PG/SG'].includes(pos)) return 'Guard'
  if (['SF', 'SF/PF', 'SG/SF'].includes(pos)) return 'Wing'
  if (['PF', 'C', 'PF/C', 'C/PF'].includes(pos)) return 'Big'
  return 'Wing'
}

// 26 players from the 2020 NBA Draft with stats from final pre-draft season
// Sources: Basketball Reference, Barttorvik, ESPN
// NOTE: International/G-League players use translated/estimated stats
const PLAYERS = [
  {
    pick: 1, team: 'Minnesota Timberwolves', name: 'Anthony Edwards', school: 'Georgia', pos: 'SG',
    birthYear: 2001, height: 77, weight: 225, wingspan: 82, conf: 'SEC',
    archetype: 'Two Way Star Wing',
    // 2019-20 Georgia: 19.1 PPG, 5.2 RPG, 2.8 APG in 32 games
    stats: { games: 32, mpg: 30.6, ppg: 19.1, rpg: 5.2, apg: 2.8, spg: 1.0, bpg: 0.5, tov: 2.2, pf: 2.8, fg_pct: 0.405, three_pt_pct: 0.294, ft_pct: 0.772, pts_per40: 25.2, reb_per40: 6.8, ast_per40: 3.7, stl_per40: 1.3, blk_per40: 0.7, tov_per40: 2.9, usg: 0.310, per: 17.8, bpm: 3.5, obpm: 4.0, dbpm: -0.5, ws: 3.4, efg_pct: 0.444, ts_pct: 0.510, ast_pct: 0.164, tov_pct: 0.132, stl_pct: 0.020, blk_pct: 0.017, orb_pct: 0.036, drb_pct: 0.131, drtg: 97.0 },
    nba: { ppg: 22.7, rpg: 5.3, apg: 4.1, spg: 1.3, bpg: 0.6, ws48: 0.105, outcome: 'All-NBA' },
  },
  {
    pick: 2, team: 'Golden State Warriors', name: 'James Wiseman', school: 'Memphis', pos: 'C',
    birthYear: 2001, height: 84, weight: 247, wingspan: 90, conf: 'AAC',
    archetype: 'Drop Coverage Big',
    // 2019-20 Memphis: 19.7 PPG, 10.7 RPG, 0.7 APG in 3 games
    stats: { games: 3, mpg: 28.6, ppg: 19.7, rpg: 10.7, apg: 0.7, spg: 0.3, bpg: 3.0, tov: 2.0, pf: 2.7, fg_pct: 0.647, three_pt_pct: null, ft_pct: 0.700, pts_per40: 27.6, reb_per40: 15.0, ast_per40: 1.0, stl_per40: 0.4, blk_per40: 4.2, tov_per40: 2.8, usg: 0.265, per: 25.5, bpm: 7.8, obpm: 4.0, dbpm: 3.8, ws: 0.5, efg_pct: 0.647, ts_pct: 0.697, ast_pct: 0.048, tov_pct: 0.110, stl_pct: 0.006, blk_pct: 0.118, orb_pct: 0.125, drb_pct: 0.228, drtg: 92.5 },
    nba: { ppg: 7.0, rpg: 3.8, apg: 0.6, spg: 0.3, bpg: 0.7, ws48: 0.040, outcome: 'Bust' },
  },
  {
    pick: 3, team: 'Charlotte Hornets', name: 'LaMelo Ball', school: 'Illawarra Hawks Australia', pos: 'PG',
    birthYear: 2001, height: 79, weight: 180, wingspan: 83, conf: null,
    archetype: 'Primary Playmaker',
    // 2019-20 NBL Illawarra: ~17.0 PPG, 7.6 RPG, 7.5 APG (translated)
    stats: { games: 12, mpg: 30.8, ppg: 17.0, rpg: 7.6, apg: 7.5, spg: 1.6, bpg: 0.4, tov: 3.8, pf: 2.5, fg_pct: 0.370, three_pt_pct: 0.252, ft_pct: 0.670, pts_per40: 22.1, reb_per40: 9.9, ast_per40: 9.7, stl_per40: 2.1, blk_per40: 0.5, tov_per40: 4.9, usg: 0.295, per: 19.5, bpm: 5.2, obpm: 4.5, dbpm: 0.7, ws: 1.8, efg_pct: 0.415, ts_pct: 0.445, ast_pct: 0.380, tov_pct: 0.175, stl_pct: 0.028, blk_pct: 0.010, orb_pct: 0.045, drb_pct: 0.165, drtg: 99.0 },
    nba: { ppg: 18.8, rpg: 6.2, apg: 7.0, spg: 1.5, bpg: 0.4, ws48: 0.085, outcome: 'All-Star' },
  },
  {
    pick: 4, team: 'Chicago Bulls', name: 'Patrick Williams', school: 'Florida State', pos: 'SF/PF',
    birthYear: 2001, height: 80, weight: 225, wingspan: 84, conf: 'ACC',
    archetype: '3-and-D Wing',
    // 2019-20 Florida State: 9.2 PPG, 4.0 RPG, 1.1 APG in 35 games
    stats: { games: 35, mpg: 25.0, ppg: 9.2, rpg: 4.0, apg: 1.1, spg: 1.0, bpg: 1.0, tov: 0.9, pf: 2.4, fg_pct: 0.530, three_pt_pct: 0.326, ft_pct: 0.839, pts_per40: 14.7, reb_per40: 6.4, ast_per40: 1.8, stl_per40: 1.6, blk_per40: 1.6, tov_per40: 1.4, usg: 0.173, per: 16.5, bpm: 2.5, obpm: 1.0, dbpm: 1.5, ws: 3.5, efg_pct: 0.522, ts_pct: 0.582, ast_pct: 0.098, tov_pct: 0.078, stl_pct: 0.024, blk_pct: 0.040, orb_pct: 0.052, drb_pct: 0.112, drtg: 96.0 },
    nba: { ppg: 9.2, rpg: 3.8, apg: 1.3, spg: 0.7, bpg: 0.6, ws48: 0.050, outcome: 'Starter' },
  },
  {
    pick: 5, team: 'Cleveland Cavaliers', name: 'Isaac Okoro', school: 'Auburn', pos: 'SF',
    birthYear: 2001, height: 78, weight: 225, wingspan: 84, conf: 'SEC',
    archetype: 'POA Defender',
    // 2019-20 Auburn: 12.9 PPG, 4.4 RPG, 2.0 APG in 32 games
    stats: { games: 32, mpg: 32.3, ppg: 12.9, rpg: 4.4, apg: 2.0, spg: 1.0, bpg: 0.5, tov: 1.7, pf: 2.4, fg_pct: 0.466, three_pt_pct: 0.233, ft_pct: 0.672, pts_per40: 16.0, reb_per40: 5.5, ast_per40: 2.5, stl_per40: 1.2, blk_per40: 0.6, tov_per40: 2.1, usg: 0.212, per: 14.8, bpm: 1.5, obpm: 0.5, dbpm: 1.0, ws: 3.2, efg_pct: 0.472, ts_pct: 0.518, ast_pct: 0.137, tov_pct: 0.118, stl_pct: 0.017, blk_pct: 0.013, orb_pct: 0.042, drb_pct: 0.120, drtg: 93.8 },
    nba: { ppg: 9.0, rpg: 2.9, apg: 1.8, spg: 0.7, bpg: 0.3, ws48: 0.045, outcome: 'Role Player' },
  },
  {
    pick: 6, team: 'Atlanta Hawks', name: 'Onyeka Okongwu', school: 'USC', pos: 'PF/C',
    birthYear: 2001, height: 81, weight: 245, wingspan: 88, conf: 'Pac-12',
    archetype: 'Rim Protector',
    // 2019-20 USC: 16.2 PPG, 8.6 RPG, 1.1 APG in 31 games
    stats: { games: 31, mpg: 29.0, ppg: 16.2, rpg: 8.6, apg: 1.1, spg: 0.9, bpg: 2.7, tov: 2.2, pf: 2.7, fg_pct: 0.618, three_pt_pct: null, ft_pct: 0.720, pts_per40: 22.3, reb_per40: 11.8, ast_per40: 1.5, stl_per40: 1.2, blk_per40: 3.7, tov_per40: 3.0, usg: 0.270, per: 24.0, bpm: 7.5, obpm: 3.5, dbpm: 4.0, ws: 5.5, efg_pct: 0.618, ts_pct: 0.680, ast_pct: 0.078, tov_pct: 0.118, stl_pct: 0.017, blk_pct: 0.082, orb_pct: 0.088, drb_pct: 0.220, drtg: 90.5 },
    nba: { ppg: 9.5, rpg: 5.8, apg: 1.1, spg: 0.5, bpg: 1.2, ws48: 0.135, outcome: 'Starter' },
  },
  {
    pick: 7, team: 'Detroit Pistons', name: 'Killian Hayes', school: 'Ulm Germany', pos: 'PG',
    birthYear: 2001, height: 77, weight: 195, wingspan: 83, conf: null,
    archetype: 'Secondary Playmaker',
    // 2019-20 Ratiopharm Ulm BBL: ~9.2 PPG, 3.6 RPG, 5.9 APG (translated)
    stats: { games: 29, mpg: 25.4, ppg: 9.2, rpg: 3.6, apg: 5.9, spg: 0.9, bpg: 0.3, tov: 2.4, pf: 2.1, fg_pct: 0.415, three_pt_pct: 0.310, ft_pct: 0.720, pts_per40: 14.5, reb_per40: 5.7, ast_per40: 9.3, stl_per40: 1.4, blk_per40: 0.5, tov_per40: 3.8, usg: 0.210, per: 14.5, bpm: 2.0, obpm: 1.5, dbpm: 0.5, ws: 2.5, efg_pct: 0.465, ts_pct: 0.524, ast_pct: 0.320, tov_pct: 0.160, stl_pct: 0.020, blk_pct: 0.008, orb_pct: 0.025, drb_pct: 0.105, drtg: 102.0 },
    nba: { ppg: 7.2, rpg: 3.1, apg: 4.2, spg: 0.9, bpg: 0.3, ws48: 0.010, outcome: 'Bust' },
  },
  {
    pick: 8, team: 'New York Knicks', name: 'Obi Toppin', school: 'Dayton', pos: 'PF',
    birthYear: 1998, height: 82, weight: 220, wingspan: 85, conf: 'A-10',
    archetype: 'Stretch Big',
    // 2019-20 Dayton: 20.0 PPG, 7.5 RPG, 2.2 APG in 29 games
    stats: { games: 29, mpg: 29.8, ppg: 20.0, rpg: 7.5, apg: 2.2, spg: 1.0, bpg: 1.2, tov: 2.4, pf: 2.4, fg_pct: 0.634, three_pt_pct: 0.390, ft_pct: 0.700, pts_per40: 26.8, reb_per40: 10.1, ast_per40: 2.9, stl_per40: 1.3, blk_per40: 1.6, tov_per40: 3.2, usg: 0.288, per: 27.5, bpm: 9.2, obpm: 6.5, dbpm: 2.7, ws: 5.8, efg_pct: 0.752, ts_pct: 0.750, ast_pct: 0.155, tov_pct: 0.123, stl_pct: 0.017, blk_pct: 0.031, orb_pct: 0.072, drb_pct: 0.168, drtg: 94.5 },
    nba: { ppg: 8.2, rpg: 3.0, apg: 1.1, spg: 0.4, bpg: 0.4, ws48: 0.065, outcome: 'Role Player' },
  },
  {
    pick: 9, team: 'Washington Wizards', name: 'Deni Avdija', school: 'Maccabi Tel Aviv Israel', pos: 'SF',
    birthYear: 2001, height: 81, weight: 210, wingspan: 85, conf: null,
    archetype: 'Versatile Wing',
    // 2019-20 Maccabi Tel Aviv Israeli BSL: ~12.0 PPG, 4.8 RPG, 4.0 APG (translated)
    stats: { games: 28, mpg: 26.5, ppg: 12.0, rpg: 4.8, apg: 4.0, spg: 0.9, bpg: 0.4, tov: 2.0, pf: 2.3, fg_pct: 0.470, three_pt_pct: 0.322, ft_pct: 0.710, pts_per40: 18.1, reb_per40: 7.2, ast_per40: 6.0, stl_per40: 1.4, blk_per40: 0.6, tov_per40: 3.0, usg: 0.225, per: 17.0, bpm: 3.5, obpm: 2.0, dbpm: 1.5, ws: 3.0, efg_pct: 0.500, ts_pct: 0.552, ast_pct: 0.255, tov_pct: 0.135, stl_pct: 0.020, blk_pct: 0.010, orb_pct: 0.038, drb_pct: 0.128, drtg: 98.5 },
    nba: { ppg: 8.8, rpg: 5.5, apg: 2.8, spg: 0.9, bpg: 0.4, ws48: 0.060, outcome: 'Starter' },
  },
  {
    pick: 10, team: 'Phoenix Suns', name: 'Jalen Smith', school: 'Maryland', pos: 'PF/C',
    birthYear: 2000, height: 82, weight: 225, wingspan: 87, conf: 'Big Ten',
    archetype: 'Stretch Big',
    // 2019-20 Maryland: 14.7 PPG, 10.5 RPG, 1.0 APG in 31 games
    stats: { games: 31, mpg: 30.8, ppg: 14.7, rpg: 10.5, apg: 1.0, spg: 0.6, bpg: 2.6, tov: 1.6, pf: 3.2, fg_pct: 0.511, three_pt_pct: 0.331, ft_pct: 0.747, pts_per40: 19.1, reb_per40: 13.6, ast_per40: 1.3, stl_per40: 0.8, blk_per40: 3.4, tov_per40: 2.1, usg: 0.228, per: 21.5, bpm: 6.0, obpm: 2.5, dbpm: 3.5, ws: 4.5, efg_pct: 0.593, ts_pct: 0.640, ast_pct: 0.060, tov_pct: 0.103, stl_pct: 0.010, blk_pct: 0.082, orb_pct: 0.085, drb_pct: 0.268, drtg: 92.5 },
    nba: { ppg: 9.0, rpg: 5.5, apg: 1.0, spg: 0.5, bpg: 0.9, ws48: 0.085, outcome: 'Role Player' },
  },
  {
    pick: 11, team: 'San Antonio Spurs', name: 'Devin Vassell', school: 'Florida State', pos: 'SG/SF',
    birthYear: 2000, height: 79, weight: 194, wingspan: 83, conf: 'ACC',
    archetype: '3-and-D Wing',
    // 2019-20 Florida State: 12.7 PPG, 5.1 RPG, 1.6 APG in 31 games
    stats: { games: 31, mpg: 30.2, ppg: 12.7, rpg: 5.1, apg: 1.6, spg: 1.9, bpg: 1.2, tov: 1.1, pf: 2.2, fg_pct: 0.537, three_pt_pct: 0.411, ft_pct: 0.782, pts_per40: 16.8, reb_per40: 6.7, ast_per40: 2.1, stl_per40: 2.5, blk_per40: 1.6, tov_per40: 1.5, usg: 0.195, per: 18.5, bpm: 5.5, obpm: 2.5, dbpm: 3.0, ws: 4.8, efg_pct: 0.641, ts_pct: 0.680, ast_pct: 0.108, tov_pct: 0.082, stl_pct: 0.030, blk_pct: 0.037, orb_pct: 0.040, drb_pct: 0.142, drtg: 91.5 },
    nba: { ppg: 14.5, rpg: 4.0, apg: 2.8, spg: 1.0, bpg: 0.7, ws48: 0.100, outcome: 'Starter' },
  },
  {
    pick: 12, team: 'Sacramento Kings', name: 'Tyrese Haliburton', school: 'Iowa State', pos: 'PG',
    birthYear: 2000, height: 77, weight: 185, wingspan: 83, conf: 'Big 12',
    archetype: 'Primary Playmaker',
    // 2019-20 Iowa State: 15.2 PPG, 5.9 RPG, 6.5 APG in 21 games
    stats: { games: 21, mpg: 31.3, ppg: 15.2, rpg: 5.9, apg: 6.5, spg: 2.5, bpg: 0.8, tov: 1.9, pf: 1.7, fg_pct: 0.533, three_pt_pct: 0.420, ft_pct: 0.822, pts_per40: 19.4, reb_per40: 7.5, ast_per40: 8.3, stl_per40: 3.2, blk_per40: 1.0, tov_per40: 2.4, usg: 0.228, per: 24.0, bpm: 8.5, obpm: 5.5, dbpm: 3.0, ws: 3.5, efg_pct: 0.615, ts_pct: 0.660, ast_pct: 0.362, tov_pct: 0.118, stl_pct: 0.038, blk_pct: 0.019, orb_pct: 0.025, drb_pct: 0.152, drtg: 91.0 },
    nba: { ppg: 17.8, rpg: 4.0, apg: 8.8, spg: 1.6, bpg: 0.5, ws48: 0.165, outcome: 'All-NBA' },
  },
  {
    pick: 14, team: 'Boston Celtics', name: 'Aaron Nesmith', school: 'Vanderbilt', pos: 'SF',
    birthYear: 1999, height: 78, weight: 215, wingspan: 83, conf: 'SEC',
    archetype: 'Off Ball Shooter',
    // 2019-20 Vanderbilt: 23.0 PPG, 4.9 RPG, 0.9 APG in 14 games
    stats: { games: 14, mpg: 31.8, ppg: 23.0, rpg: 4.9, apg: 0.9, spg: 1.0, bpg: 0.6, tov: 1.9, pf: 2.1, fg_pct: 0.528, three_pt_pct: 0.521, ft_pct: 0.828, pts_per40: 28.9, reb_per40: 6.2, ast_per40: 1.1, stl_per40: 1.3, blk_per40: 0.8, tov_per40: 2.4, usg: 0.280, per: 21.0, bpm: 5.2, obpm: 5.0, dbpm: 0.2, ws: 2.0, efg_pct: 0.662, ts_pct: 0.715, ast_pct: 0.058, tov_pct: 0.110, stl_pct: 0.016, blk_pct: 0.016, orb_pct: 0.028, drb_pct: 0.118, drtg: 96.0 },
    nba: { ppg: 6.5, rpg: 2.8, apg: 1.0, spg: 0.6, bpg: 0.3, ws48: 0.050, outcome: 'Starter' },
  },
  {
    pick: 15, team: 'Orlando Magic', name: 'Cole Anthony', school: 'North Carolina', pos: 'PG',
    birthYear: 2000, height: 75, weight: 185, wingspan: 79, conf: 'ACC',
    archetype: 'Scoring Lead Guard',
    // 2019-20 North Carolina: 18.5 PPG, 5.7 RPG, 4.0 APG in 32 games
    stats: { games: 32, mpg: 32.2, ppg: 18.5, rpg: 5.7, apg: 4.0, spg: 1.1, bpg: 0.5, tov: 3.1, pf: 2.9, fg_pct: 0.382, three_pt_pct: 0.297, ft_pct: 0.750, pts_per40: 23.0, reb_per40: 7.1, ast_per40: 5.0, stl_per40: 1.4, blk_per40: 0.6, tov_per40: 3.9, usg: 0.302, per: 15.5, bpm: 1.5, obpm: 2.0, dbpm: -0.5, ws: 3.0, efg_pct: 0.413, ts_pct: 0.477, ast_pct: 0.220, tov_pct: 0.178, stl_pct: 0.018, blk_pct: 0.013, orb_pct: 0.040, drb_pct: 0.138, drtg: 100.5 },
    nba: { ppg: 14.0, rpg: 5.0, apg: 4.5, spg: 0.9, bpg: 0.3, ws48: 0.065, outcome: 'Starter' },
  },
  {
    pick: 16, team: 'Houston Rockets', name: 'Isaiah Stewart', school: 'Washington', pos: 'PF/C',
    birthYear: 2001, height: 81, weight: 250, wingspan: 87, conf: 'Pac-12',
    archetype: 'Rim Runner',
    // 2019-20 Washington: 17.0 PPG, 8.8 RPG, 0.8 APG in 31 games
    stats: { games: 31, mpg: 32.5, ppg: 17.0, rpg: 8.8, apg: 0.8, spg: 0.7, bpg: 2.0, tov: 1.6, pf: 3.1, fg_pct: 0.581, three_pt_pct: 0.306, ft_pct: 0.646, pts_per40: 20.9, reb_per40: 10.8, ast_per40: 1.0, stl_per40: 0.9, blk_per40: 2.5, tov_per40: 2.0, usg: 0.254, per: 22.5, bpm: 6.5, obpm: 3.5, dbpm: 3.0, ws: 5.2, efg_pct: 0.594, ts_pct: 0.617, ast_pct: 0.044, tov_pct: 0.100, stl_pct: 0.011, blk_pct: 0.062, orb_pct: 0.092, drb_pct: 0.202, drtg: 93.0 },
    nba: { ppg: 8.5, rpg: 6.0, apg: 1.0, spg: 0.5, bpg: 0.8, ws48: 0.075, outcome: 'Starter' },
  },
  {
    pick: 17, team: 'Oklahoma City Thunder', name: 'Aleksej Pokusevski', school: 'Olympiacos B Greece', pos: 'PF',
    birthYear: 2002, height: 84, weight: 190, wingspan: 88, conf: null,
    archetype: 'Stretch Big',
    // 2019-20 Olympiacos B Greek A2: ~10.0 PPG, 5.5 RPG, 2.2 APG (translated)
    stats: { games: 22, mpg: 24.0, ppg: 10.0, rpg: 5.5, apg: 2.2, spg: 0.8, bpg: 0.8, tov: 2.2, pf: 2.5, fg_pct: 0.440, three_pt_pct: 0.305, ft_pct: 0.720, pts_per40: 16.7, reb_per40: 9.2, ast_per40: 3.7, stl_per40: 1.3, blk_per40: 1.3, tov_per40: 3.7, usg: 0.225, per: 15.0, bpm: 2.0, obpm: 1.0, dbpm: 1.0, ws: 1.5, efg_pct: 0.480, ts_pct: 0.538, ast_pct: 0.178, tov_pct: 0.155, stl_pct: 0.018, blk_pct: 0.025, orb_pct: 0.055, drb_pct: 0.165, drtg: 102.0 },
    nba: { ppg: 6.8, rpg: 4.2, apg: 1.8, spg: 0.6, bpg: 0.5, ws48: -0.010, outcome: 'Bust' },
  },
  {
    pick: 18, team: 'Dallas Mavericks', name: 'Josh Green', school: 'Arizona', pos: 'SG',
    birthYear: 2000, height: 78, weight: 210, wingspan: 83, conf: 'Pac-12',
    archetype: '3-and-D Wing',
    // 2019-20 Arizona: 11.9 PPG, 4.5 RPG, 2.1 APG in 32 games
    stats: { games: 32, mpg: 31.3, ppg: 11.9, rpg: 4.5, apg: 2.1, spg: 1.3, bpg: 0.5, tov: 1.5, pf: 1.9, fg_pct: 0.465, three_pt_pct: 0.278, ft_pct: 0.727, pts_per40: 15.2, reb_per40: 5.7, ast_per40: 2.7, stl_per40: 1.7, blk_per40: 0.6, tov_per40: 1.9, usg: 0.195, per: 14.2, bpm: 1.5, obpm: 0.5, dbpm: 1.0, ws: 3.0, efg_pct: 0.481, ts_pct: 0.534, ast_pct: 0.137, tov_pct: 0.115, stl_pct: 0.022, blk_pct: 0.012, orb_pct: 0.038, drb_pct: 0.122, drtg: 94.5 },
    nba: { ppg: 5.8, rpg: 2.4, apg: 1.3, spg: 0.6, bpg: 0.2, ws48: 0.035, outcome: 'Role Player' },
  },
  {
    pick: 19, team: 'Detroit Pistons', name: 'Saddiq Bey', school: 'Villanova', pos: 'SF',
    birthYear: 1999, height: 80, weight: 216, wingspan: 83, conf: 'Big East',
    archetype: 'Off Ball Shooter',
    // 2019-20 Villanova: 16.1 PPG, 5.6 RPG, 2.3 APG in 30 games
    stats: { games: 30, mpg: 31.0, ppg: 16.1, rpg: 5.6, apg: 2.3, spg: 0.8, bpg: 0.3, tov: 1.5, pf: 2.2, fg_pct: 0.496, three_pt_pct: 0.424, ft_pct: 0.775, pts_per40: 20.8, reb_per40: 7.2, ast_per40: 3.0, stl_per40: 1.0, blk_per40: 0.4, tov_per40: 1.9, usg: 0.230, per: 17.5, bpm: 4.0, obpm: 3.0, dbpm: 1.0, ws: 4.0, efg_pct: 0.624, ts_pct: 0.663, ast_pct: 0.143, tov_pct: 0.100, stl_pct: 0.013, blk_pct: 0.008, orb_pct: 0.032, drb_pct: 0.145, drtg: 96.5 },
    nba: { ppg: 13.5, rpg: 5.0, apg: 2.2, spg: 0.7, bpg: 0.3, ws48: 0.055, outcome: 'Starter' },
  },
  {
    pick: 20, team: 'Miami Heat', name: 'Precious Achiuwa', school: 'Memphis', pos: 'PF',
    birthYear: 2000, height: 81, weight: 225, wingspan: 86, conf: 'AAC',
    archetype: 'Rim Runner',
    // 2019-20 Memphis: 14.0 PPG, 10.9 RPG, 0.7 APG in 32 games
    stats: { games: 32, mpg: 28.9, ppg: 14.0, rpg: 10.9, apg: 0.7, spg: 1.1, bpg: 1.3, tov: 1.8, pf: 3.0, fg_pct: 0.568, three_pt_pct: null, ft_pct: 0.600, pts_per40: 19.4, reb_per40: 15.1, ast_per40: 1.0, stl_per40: 1.5, blk_per40: 1.8, tov_per40: 2.5, usg: 0.247, per: 21.5, bpm: 5.8, obpm: 2.5, dbpm: 3.3, ws: 4.5, efg_pct: 0.568, ts_pct: 0.590, ast_pct: 0.047, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.040, orb_pct: 0.145, drb_pct: 0.260, drtg: 94.0 },
    nba: { ppg: 7.5, rpg: 5.2, apg: 1.0, spg: 0.5, bpg: 0.6, ws48: 0.055, outcome: 'Starter' },
  },
  {
    pick: 21, team: 'Philadelphia 76ers', name: 'Tyrese Maxey', school: 'Kentucky', pos: 'PG/SG',
    birthYear: 2000, height: 75, weight: 198, wingspan: 80, conf: 'SEC',
    archetype: 'Scoring Lead Guard',
    // 2019-20 Kentucky: 14.0 PPG, 4.3 RPG, 3.2 APG in 25 games
    stats: { games: 25, mpg: 28.9, ppg: 14.0, rpg: 4.3, apg: 3.2, spg: 0.9, bpg: 0.6, tov: 2.1, pf: 2.3, fg_pct: 0.471, three_pt_pct: 0.298, ft_pct: 0.833, pts_per40: 19.4, reb_per40: 5.9, ast_per40: 4.4, stl_per40: 1.2, blk_per40: 0.8, tov_per40: 2.9, usg: 0.239, per: 17.5, bpm: 2.5, obpm: 2.5, dbpm: 0.0, ws: 2.5, efg_pct: 0.519, ts_pct: 0.575, ast_pct: 0.202, tov_pct: 0.135, stl_pct: 0.017, blk_pct: 0.015, orb_pct: 0.040, drb_pct: 0.120, drtg: 97.0 },
    nba: { ppg: 18.5, rpg: 3.2, apg: 4.2, spg: 0.8, bpg: 0.4, ws48: 0.130, outcome: 'All-Star' },
  },
  {
    pick: 24, team: 'Denver Nuggets', name: 'RJ Hampton', school: 'NZ Breakers Australia', pos: 'SG',
    birthYear: 2001, height: 76, weight: 195, wingspan: 80, conf: null,
    archetype: 'Athletic Wing',
    // 2019-20 NBL New Zealand Breakers: ~8.5 PPG, 3.3 RPG, 2.2 APG (translated)
    stats: { games: 14, mpg: 20.5, ppg: 8.5, rpg: 3.3, apg: 2.2, spg: 0.9, bpg: 0.3, tov: 1.8, pf: 2.0, fg_pct: 0.380, three_pt_pct: 0.255, ft_pct: 0.740, pts_per40: 16.6, reb_per40: 6.4, ast_per40: 4.3, stl_per40: 1.8, blk_per40: 0.6, tov_per40: 3.5, usg: 0.230, per: 12.5, bpm: 0.5, obpm: 0.5, dbpm: 0.0, ws: 0.8, efg_pct: 0.420, ts_pct: 0.490, ast_pct: 0.210, tov_pct: 0.168, stl_pct: 0.022, blk_pct: 0.008, orb_pct: 0.048, drb_pct: 0.120, drtg: 104.0 },
    nba: { ppg: 5.0, rpg: 1.8, apg: 1.5, spg: 0.5, bpg: 0.1, ws48: 0.020, outcome: 'Role Player' },
  },
  {
    pick: 25, team: 'New York Knicks', name: 'Immanuel Quickley', school: 'Kentucky', pos: 'PG',
    birthYear: 1999, height: 76, weight: 188, wingspan: 81, conf: 'SEC',
    archetype: 'Scoring Lead Guard',
    // 2019-20 Kentucky: 16.1 PPG, 4.0 RPG, 2.9 APG in 25 games
    stats: { games: 25, mpg: 28.0, ppg: 16.1, rpg: 4.0, apg: 2.9, spg: 1.0, bpg: 0.3, tov: 2.0, pf: 2.0, fg_pct: 0.462, three_pt_pct: 0.410, ft_pct: 0.924, pts_per40: 23.0, reb_per40: 5.7, ast_per40: 4.1, stl_per40: 1.4, blk_per40: 0.4, tov_per40: 2.9, usg: 0.270, per: 20.5, bpm: 5.5, obpm: 5.0, dbpm: 0.5, ws: 3.5, efg_pct: 0.553, ts_pct: 0.650, ast_pct: 0.198, tov_pct: 0.130, stl_pct: 0.019, blk_pct: 0.008, orb_pct: 0.022, drb_pct: 0.105, drtg: 98.5 },
    nba: { ppg: 13.5, rpg: 3.5, apg: 4.8, spg: 0.8, bpg: 0.2, ws48: 0.085, outcome: 'Starter' },
  },
  {
    pick: 26, team: 'Boston Celtics', name: 'Payton Pritchard', school: 'Oregon', pos: 'PG',
    birthYear: 1998, height: 73, weight: 195, wingspan: 76, conf: 'Pac-12',
    archetype: 'Movement Shooter',
    // 2019-20 Oregon: 20.5 PPG, 5.6 RPG, 6.3 APG in 31 games
    stats: { games: 31, mpg: 32.5, ppg: 20.5, rpg: 5.6, apg: 6.3, spg: 1.8, bpg: 0.3, tov: 2.3, pf: 1.8, fg_pct: 0.476, three_pt_pct: 0.393, ft_pct: 0.876, pts_per40: 25.2, reb_per40: 6.9, ast_per40: 7.7, stl_per40: 2.2, blk_per40: 0.4, tov_per40: 2.8, usg: 0.275, per: 23.5, bpm: 7.5, obpm: 5.5, dbpm: 2.0, ws: 5.5, efg_pct: 0.560, ts_pct: 0.620, ast_pct: 0.320, tov_pct: 0.118, stl_pct: 0.028, blk_pct: 0.005, orb_pct: 0.030, drb_pct: 0.128, drtg: 97.0 },
    nba: { ppg: 9.5, rpg: 2.5, apg: 3.0, spg: 0.5, bpg: 0.2, ws48: 0.080, outcome: 'Starter' },
  },
  {
    pick: 28, team: 'Minnesota Timberwolves', name: 'Jaden McDaniels', school: 'Washington', pos: 'SF/PF',
    birthYear: 2001, height: 82, weight: 195, wingspan: 88, conf: 'Pac-12',
    archetype: 'Versatile Wing',
    // 2019-20 Washington: 13.1 PPG, 5.9 RPG, 1.5 APG in 31 games
    stats: { games: 31, mpg: 28.5, ppg: 13.1, rpg: 5.9, apg: 1.5, spg: 1.0, bpg: 1.2, tov: 1.7, pf: 2.6, fg_pct: 0.405, three_pt_pct: 0.324, ft_pct: 0.760, pts_per40: 18.4, reb_per40: 8.3, ast_per40: 2.1, stl_per40: 1.4, blk_per40: 1.7, tov_per40: 2.4, usg: 0.240, per: 16.5, bpm: 3.0, obpm: 1.5, dbpm: 1.5, ws: 3.2, efg_pct: 0.469, ts_pct: 0.523, ast_pct: 0.095, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.035, orb_pct: 0.055, drb_pct: 0.148, drtg: 97.5 },
    nba: { ppg: 9.0, rpg: 4.5, apg: 1.5, spg: 0.7, bpg: 0.8, ws48: 0.095, outcome: 'Starter' },
  },
  {
    pick: 29, team: 'Toronto Raptors', name: 'Malachi Flynn', school: 'San Diego State', pos: 'PG',
    birthYear: 1999, height: 73, weight: 175, wingspan: 76, conf: 'MWC',
    archetype: 'Secondary Playmaker',
    // 2019-20 San Diego State: 17.6 PPG, 5.1 RPG, 5.1 APG in 31 games
    stats: { games: 31, mpg: 33.0, ppg: 17.6, rpg: 5.1, apg: 5.1, spg: 2.4, bpg: 0.5, tov: 2.2, pf: 2.3, fg_pct: 0.450, three_pt_pct: 0.392, ft_pct: 0.841, pts_per40: 21.3, reb_per40: 6.2, ast_per40: 6.2, stl_per40: 2.9, blk_per40: 0.6, tov_per40: 2.7, usg: 0.272, per: 21.5, bpm: 6.8, obpm: 4.5, dbpm: 2.3, ws: 5.2, efg_pct: 0.548, ts_pct: 0.612, ast_pct: 0.290, tov_pct: 0.128, stl_pct: 0.036, blk_pct: 0.010, orb_pct: 0.030, drb_pct: 0.132, drtg: 95.5 },
    nba: { ppg: 6.0, rpg: 2.2, apg: 3.0, spg: 0.7, bpg: 0.2, ws48: 0.040, outcome: 'Role Player' },
  },
  {
    pick: 30, team: 'Boston Celtics', name: 'Desmond Bane', school: 'TCU', pos: 'SG',
    birthYear: 1999, height: 77, weight: 215, wingspan: 81, conf: 'Big 12',
    archetype: 'Movement Shooter',
    // 2019-20 TCU: 15.7 PPG, 4.9 RPG, 2.6 APG in 31 games
    stats: { games: 31, mpg: 32.0, ppg: 15.7, rpg: 4.9, apg: 2.6, spg: 1.5, bpg: 0.4, tov: 1.5, pf: 2.2, fg_pct: 0.495, three_pt_pct: 0.451, ft_pct: 0.882, pts_per40: 19.6, reb_per40: 6.1, ast_per40: 3.3, stl_per40: 1.9, blk_per40: 0.5, tov_per40: 1.9, usg: 0.215, per: 19.5, bpm: 5.5, obpm: 4.5, dbpm: 1.0, ws: 5.5, efg_pct: 0.609, ts_pct: 0.672, ast_pct: 0.158, tov_pct: 0.098, stl_pct: 0.024, blk_pct: 0.008, orb_pct: 0.035, drb_pct: 0.122, drtg: 95.5 },
    nba: { ppg: 18.0, rpg: 4.5, apg: 2.5, spg: 1.0, bpg: 0.3, ws48: 0.145, outcome: 'All-Star' },
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
  console.log(`Navigate to /legendary-archives?year=2020 to view the board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
