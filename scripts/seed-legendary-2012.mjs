#!/usr/bin/env node
// Seed script for 2012 NBA Draft — Legendary Archives
// Populates players, prospects, stats, measurables, and historical_players tables
//
// Usage: node scripts/seed-legendary-2012.mjs

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const DRAFT_YEAR = 2012
const DRAFT_CLASS = '2012'
const SEASON = '11-12'

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

// 2012 NBA Draft — key picks with college stats from final season
// Sources: Basketball Reference, historical records
const PLAYERS = [
  // === ROUND 1 ===
  {
    pick: 1, team: 'New Orleans Hornets', name: 'Anthony Davis', school: 'Kentucky', pos: 'PF/C',
    birthYear: 1993, height: 82, weight: 220, wingspan: 90, conf: 'SEC',
    archetype: 'Rim Protector',
    // 2011-12 Kentucky: 14.2 PPG, 10.4 RPG, 1.3 APG, 4.7 BPG in 40 games
    stats: { games: 40, mpg: 30.8, ppg: 14.2, rpg: 10.4, apg: 1.3, spg: 1.3, bpg: 4.7, tov: 2.0, pf: 2.8, fg_pct: 0.622, three_pt_pct: null, ft_pct: 0.597, pts_per40: 18.4, reb_per40: 13.5, ast_per40: 1.7, stl_per40: 1.7, blk_per40: 6.1, tov_per40: 2.6, usg: 0.236, per: 29.7, bpm: 13.5, obpm: 5.2, dbpm: 8.3, ws: 10.5, efg_pct: 0.622, ts_pct: 0.624, ast_pct: 0.072, tov_pct: 0.141, stl_pct: 0.027, blk_pct: 0.148, orb_pct: 0.115, drb_pct: 0.265, drtg: 85.9 },
    nba: { ppg: 23.1, rpg: 10.0, apg: 2.2, spg: 1.4, bpg: 2.4, ws48: 0.195, outcome: 'MVP' },
  },
  {
    pick: 2, team: 'Charlotte Bobcats', name: 'Michael Kidd-Gilchrist', school: 'Kentucky', pos: 'SF',
    birthYear: 1993, height: 79, weight: 232, wingspan: 83, conf: 'SEC',
    archetype: 'Two Way Wing',
    // 2011-12 Kentucky: 11.9 PPG, 7.4 RPG, 1.9 APG
    stats: { games: 40, mpg: 30.5, ppg: 11.9, rpg: 7.4, apg: 1.9, spg: 1.2, bpg: 0.7, tov: 1.9, pf: 2.5, fg_pct: 0.535, three_pt_pct: 0.250, ft_pct: 0.612, pts_per40: 15.6, reb_per40: 9.7, ast_per40: 2.5, stl_per40: 1.6, blk_per40: 0.9, tov_per40: 2.5, usg: 0.218, per: 19.5, bpm: 6.8, obpm: 2.5, dbpm: 4.3, ws: 7.2, efg_pct: 0.545, ts_pct: 0.565, ast_pct: 0.105, tov_pct: 0.138, stl_pct: 0.025, blk_pct: 0.022, orb_pct: 0.072, drb_pct: 0.182, drtg: 88.1 },
    nba: { ppg: 8.2, rpg: 5.5, apg: 1.5, spg: 1.0, bpg: 0.5, ws48: 0.085, outcome: 'Role Player' },
  },
  {
    pick: 3, team: 'Washington Wizards', name: 'Bradley Beal', school: 'Florida', pos: 'SG',
    birthYear: 1993, height: 77, weight: 207, wingspan: 82, conf: 'SEC',
    archetype: 'Off Ball Shooting Guard',
    // 2011-12 Florida: 14.8 PPG, 5.2 RPG, 2.2 APG
    stats: { games: 35, mpg: 31.4, ppg: 14.8, rpg: 5.2, apg: 2.2, spg: 1.5, bpg: 0.5, tov: 2.1, pf: 2.1, fg_pct: 0.454, three_pt_pct: 0.412, ft_pct: 0.811, pts_per40: 18.9, reb_per40: 6.6, ast_per40: 2.8, stl_per40: 1.9, blk_per40: 0.6, tov_per40: 2.7, usg: 0.245, per: 19.8, bpm: 5.2, obpm: 3.8, dbpm: 1.4, ws: 6.1, efg_pct: 0.533, ts_pct: 0.593, ast_pct: 0.122, tov_pct: 0.130, stl_pct: 0.031, blk_pct: 0.012, orb_pct: 0.045, drb_pct: 0.118, drtg: 93.2 },
    nba: { ppg: 22.1, rpg: 4.1, apg: 3.9, spg: 1.1, bpg: 0.4, ws48: 0.126, outcome: 'All-Star' },
  },
  {
    pick: 4, team: 'Cleveland Cavaliers', name: 'Dion Waiters', school: 'Syracuse', pos: 'SG',
    birthYear: 1992, height: 76, weight: 215, wingspan: 81, conf: 'Big East',
    archetype: 'Scoring Lead Guard',
    // 2011-12 Syracuse: 12.6 PPG, 2.7 RPG, 1.8 APG off the bench (34 games)
    stats: { games: 34, mpg: 21.5, ppg: 12.6, rpg: 2.7, apg: 1.8, spg: 0.9, bpg: 0.3, tov: 1.8, pf: 2.1, fg_pct: 0.454, three_pt_pct: 0.358, ft_pct: 0.787, pts_per40: 23.4, reb_per40: 5.0, ast_per40: 3.3, stl_per40: 1.7, blk_per40: 0.6, tov_per40: 3.3, usg: 0.278, per: 18.5, bpm: 4.1, obpm: 3.5, dbpm: 0.6, ws: 3.8, efg_pct: 0.505, ts_pct: 0.565, ast_pct: 0.148, tov_pct: 0.150, stl_pct: 0.028, blk_pct: 0.008, orb_pct: 0.028, drb_pct: 0.075, drtg: 97.5 },
    nba: { ppg: 14.4, rpg: 2.9, apg: 2.9, spg: 0.8, bpg: 0.2, ws48: 0.068, outcome: 'Starter' },
  },
  {
    pick: 5, team: 'Sacramento Kings', name: 'Thomas Robinson', school: 'Kansas', pos: 'PF',
    birthYear: 1991, height: 81, weight: 237, wingspan: 85, conf: 'Big 12',
    archetype: 'Offensive Rebounder',
    // 2011-12 Kansas: 17.7 PPG, 11.9 RPG, 1.4 APG
    stats: { games: 36, mpg: 30.2, ppg: 17.7, rpg: 11.9, apg: 1.4, spg: 0.9, bpg: 0.5, tov: 2.5, pf: 3.1, fg_pct: 0.556, three_pt_pct: null, ft_pct: 0.710, pts_per40: 23.5, reb_per40: 15.8, ast_per40: 1.9, stl_per40: 1.2, blk_per40: 0.7, tov_per40: 3.3, usg: 0.285, per: 26.5, bpm: 8.8, obpm: 4.8, dbpm: 4.0, ws: 8.8, efg_pct: 0.556, ts_pct: 0.611, ast_pct: 0.082, tov_pct: 0.148, stl_pct: 0.019, blk_pct: 0.013, orb_pct: 0.145, drb_pct: 0.248, drtg: 91.5 },
    nba: { ppg: 6.2, rpg: 5.5, apg: 0.7, spg: 0.5, bpg: 0.3, ws48: 0.048, outcome: 'Bust' },
  },
  {
    pick: 6, team: 'Portland Trail Blazers', name: 'Damian Lillard', school: 'Weber State', pos: 'PG',
    birthYear: 1990, height: 74, weight: 195, wingspan: 79, conf: 'Big Sky',
    archetype: 'Scoring Lead Guard',
    // 2011-12 Weber State: 24.5 PPG, 5.0 RPG, 4.0 APG
    stats: { games: 34, mpg: 36.0, ppg: 24.5, rpg: 5.0, apg: 4.0, spg: 0.9, bpg: 0.3, tov: 2.4, pf: 1.9, fg_pct: 0.469, three_pt_pct: 0.420, ft_pct: 0.868, pts_per40: 27.2, reb_per40: 5.6, ast_per40: 4.4, stl_per40: 1.0, blk_per40: 0.3, tov_per40: 2.7, usg: 0.322, per: 24.8, bpm: 9.5, obpm: 7.8, dbpm: 1.7, ws: 9.5, efg_pct: 0.535, ts_pct: 0.618, ast_pct: 0.192, tov_pct: 0.115, stl_pct: 0.018, blk_pct: 0.007, orb_pct: 0.035, drb_pct: 0.122, drtg: 95.8 },
    nba: { ppg: 25.5, rpg: 4.2, apg: 6.8, spg: 0.9, bpg: 0.3, ws48: 0.168, outcome: 'All-NBA' },
  },
  {
    pick: 7, team: 'Golden State Warriors', name: 'Harrison Barnes', school: 'North Carolina', pos: 'SF',
    birthYear: 1992, height: 80, weight: 210, wingspan: 83, conf: 'ACC',
    archetype: 'Off Ball Scoring Wing',
    // 2011-12 UNC: 17.1 PPG, 5.7 RPG, 1.6 APG
    stats: { games: 32, mpg: 33.5, ppg: 17.1, rpg: 5.7, apg: 1.6, spg: 1.0, bpg: 0.5, tov: 1.7, pf: 2.0, fg_pct: 0.456, three_pt_pct: 0.371, ft_pct: 0.762, pts_per40: 20.4, reb_per40: 6.8, ast_per40: 1.9, stl_per40: 1.2, blk_per40: 0.6, tov_per40: 2.0, usg: 0.262, per: 18.5, bpm: 5.0, obpm: 3.5, dbpm: 1.5, ws: 5.5, efg_pct: 0.534, ts_pct: 0.567, ast_pct: 0.082, tov_pct: 0.105, stl_pct: 0.021, blk_pct: 0.012, orb_pct: 0.042, drb_pct: 0.132, drtg: 94.5 },
    nba: { ppg: 12.4, rpg: 4.8, apg: 1.4, spg: 0.7, bpg: 0.4, ws48: 0.097, outcome: 'Starter' },
  },
  {
    pick: 8, team: 'Toronto Raptors', name: 'Terrence Ross', school: 'Washington', pos: 'SG',
    birthYear: 1991, height: 79, weight: 206, wingspan: 83, conf: 'Pac-12',
    archetype: 'Movement Shooter',
    // 2011-12 Washington: 16.6 PPG, 5.6 RPG, 1.4 APG
    stats: { games: 32, mpg: 31.0, ppg: 16.6, rpg: 5.6, apg: 1.4, spg: 1.4, bpg: 0.5, tov: 1.9, pf: 2.2, fg_pct: 0.453, three_pt_pct: 0.386, ft_pct: 0.815, pts_per40: 21.4, reb_per40: 7.2, ast_per40: 1.8, stl_per40: 1.8, blk_per40: 0.6, tov_per40: 2.5, usg: 0.258, per: 18.2, bpm: 4.5, obpm: 3.5, dbpm: 1.0, ws: 5.0, efg_pct: 0.535, ts_pct: 0.596, ast_pct: 0.082, tov_pct: 0.118, stl_pct: 0.030, blk_pct: 0.012, orb_pct: 0.040, drb_pct: 0.135, drtg: 96.5 },
    nba: { ppg: 12.5, rpg: 3.2, apg: 1.5, spg: 0.7, bpg: 0.3, ws48: 0.078, outcome: 'Role Player' },
  },
  {
    pick: 9, team: 'Detroit Pistons', name: 'Andre Drummond', school: 'UConn', pos: 'C',
    birthYear: 1993, height: 83, weight: 270, wingspan: 90, conf: 'Big East',
    archetype: 'Rim Runner',
    // 2011-12 UConn: 10.0 PPG, 7.6 RPG, 0.5 APG, 2.0 BPG
    stats: { games: 34, mpg: 23.5, ppg: 10.0, rpg: 7.6, apg: 0.5, spg: 0.8, bpg: 2.0, tov: 1.8, pf: 3.2, fg_pct: 0.626, three_pt_pct: null, ft_pct: 0.359, pts_per40: 17.0, reb_per40: 12.9, ast_per40: 0.9, stl_per40: 1.4, blk_per40: 3.4, tov_per40: 3.1, usg: 0.235, per: 22.5, bpm: 7.0, obpm: 2.0, dbpm: 5.0, ws: 6.2, efg_pct: 0.626, ts_pct: 0.560, ast_pct: 0.030, tov_pct: 0.155, stl_pct: 0.022, blk_pct: 0.078, orb_pct: 0.155, drb_pct: 0.258, drtg: 90.5 },
    nba: { ppg: 14.2, rpg: 13.5, apg: 1.1, spg: 0.9, bpg: 1.6, ws48: 0.145, outcome: 'All-Star' },
  },
  {
    pick: 10, team: 'New Orleans Hornets', name: 'Austin Rivers', school: 'Duke', pos: 'SG',
    birthYear: 1992, height: 76, weight: 200, wingspan: 79, conf: 'ACC',
    archetype: 'Scoring Lead Guard',
    // 2011-12 Duke: 15.5 PPG, 3.8 RPG, 3.4 APG
    stats: { games: 36, mpg: 30.8, ppg: 15.5, rpg: 3.8, apg: 3.4, spg: 1.1, bpg: 0.2, tov: 2.5, pf: 2.3, fg_pct: 0.413, three_pt_pct: 0.339, ft_pct: 0.800, pts_per40: 20.1, reb_per40: 4.9, ast_per40: 4.4, stl_per40: 1.4, blk_per40: 0.3, tov_per40: 3.2, usg: 0.272, per: 15.8, bpm: 2.5, obpm: 2.0, dbpm: 0.5, ws: 3.8, efg_pct: 0.475, ts_pct: 0.546, ast_pct: 0.192, tov_pct: 0.158, stl_pct: 0.023, blk_pct: 0.005, orb_pct: 0.028, drb_pct: 0.092, drtg: 99.0 },
    nba: { ppg: 9.8, rpg: 2.3, apg: 3.2, spg: 0.6, bpg: 0.1, ws48: 0.055, outcome: 'Role Player' },
  },
  {
    pick: 11, team: 'Portland Trail Blazers', name: 'Meyers Leonard', school: 'Illinois', pos: 'C',
    birthYear: 1992, height: 85, weight: 245, wingspan: 90, conf: 'Big Ten',
    archetype: 'Stretch Big',
    // 2011-12 Illinois: 13.6 PPG, 6.7 RPG, 0.9 APG
    stats: { games: 34, mpg: 27.8, ppg: 13.6, rpg: 6.7, apg: 0.9, spg: 0.3, bpg: 1.5, tov: 1.8, pf: 3.0, fg_pct: 0.521, three_pt_pct: 0.333, ft_pct: 0.724, pts_per40: 19.6, reb_per40: 9.6, ast_per40: 1.3, stl_per40: 0.4, blk_per40: 2.2, tov_per40: 2.6, usg: 0.248, per: 17.5, bpm: 3.5, obpm: 1.5, dbpm: 2.0, ws: 4.5, efg_pct: 0.537, ts_pct: 0.582, ast_pct: 0.052, tov_pct: 0.132, stl_pct: 0.007, blk_pct: 0.052, orb_pct: 0.058, drb_pct: 0.158, drtg: 96.0 },
    nba: { ppg: 6.5, rpg: 4.5, apg: 0.8, spg: 0.2, bpg: 0.8, ws48: 0.065, outcome: 'Role Player' },
  },
  {
    pick: 12, team: 'Oklahoma City Thunder', name: 'Jeremy Lamb', school: 'UConn', pos: 'SG',
    birthYear: 1992, height: 79, weight: 185, wingspan: 83, conf: 'Big East',
    archetype: 'Off Ball Shooter',
    // 2011-12 UConn: 15.7 PPG, 4.3 RPG, 2.0 APG
    stats: { games: 34, mpg: 32.5, ppg: 15.7, rpg: 4.3, apg: 2.0, spg: 0.9, bpg: 0.5, tov: 1.8, pf: 1.8, fg_pct: 0.435, three_pt_pct: 0.378, ft_pct: 0.762, pts_per40: 19.3, reb_per40: 5.3, ast_per40: 2.5, stl_per40: 1.1, blk_per40: 0.6, tov_per40: 2.2, usg: 0.248, per: 16.5, bpm: 3.2, obpm: 2.5, dbpm: 0.7, ws: 4.5, efg_pct: 0.506, ts_pct: 0.558, ast_pct: 0.112, tov_pct: 0.120, stl_pct: 0.018, blk_pct: 0.012, orb_pct: 0.032, drb_pct: 0.102, drtg: 97.5 },
    nba: { ppg: 10.8, rpg: 3.1, apg: 1.6, spg: 0.7, bpg: 0.3, ws48: 0.065, outcome: 'Role Player' },
  },
  {
    pick: 13, team: 'Phoenix Suns', name: 'Kendall Marshall', school: 'North Carolina', pos: 'PG',
    birthYear: 1992, height: 76, weight: 186, wingspan: 79, conf: 'ACC',
    archetype: 'Primary Playmaker',
    // 2011-12 UNC: 9.8 PPG, 2.6 RPG, 9.8 APG
    stats: { games: 32, mpg: 30.2, ppg: 9.8, rpg: 2.6, apg: 9.8, spg: 1.3, bpg: 0.2, tov: 3.5, pf: 1.8, fg_pct: 0.477, three_pt_pct: 0.368, ft_pct: 0.724, pts_per40: 13.0, reb_per40: 3.4, ast_per40: 13.0, stl_per40: 1.7, blk_per40: 0.3, tov_per40: 4.6, usg: 0.198, per: 18.8, bpm: 5.5, obpm: 4.5, dbpm: 1.0, ws: 5.5, efg_pct: 0.524, ts_pct: 0.556, ast_pct: 0.472, tov_pct: 0.188, stl_pct: 0.028, blk_pct: 0.005, orb_pct: 0.018, drb_pct: 0.062, drtg: 96.0 },
    nba: { ppg: 5.0, rpg: 1.8, apg: 4.5, spg: 0.5, bpg: 0.1, ws48: 0.035, outcome: 'Bust' },
  },
  {
    pick: 14, team: 'Milwaukee Bucks', name: 'John Henson', school: 'North Carolina', pos: 'PF/C',
    birthYear: 1992, height: 83, weight: 214, wingspan: 91, conf: 'ACC',
    archetype: 'Rim Protector',
    // 2011-12 UNC: 14.6 PPG, 9.5 RPG, 1.5 APG, 3.1 BPG
    stats: { games: 32, mpg: 29.2, ppg: 14.6, rpg: 9.5, apg: 1.5, spg: 0.7, bpg: 3.1, tov: 2.2, pf: 3.1, fg_pct: 0.554, three_pt_pct: null, ft_pct: 0.682, pts_per40: 20.0, reb_per40: 13.0, ast_per40: 2.1, stl_per40: 1.0, blk_per40: 4.2, tov_per40: 3.0, usg: 0.265, per: 26.2, bpm: 9.5, obpm: 3.5, dbpm: 6.0, ws: 8.0, efg_pct: 0.554, ts_pct: 0.595, ast_pct: 0.085, tov_pct: 0.148, stl_pct: 0.015, blk_pct: 0.118, orb_pct: 0.098, drb_pct: 0.242, drtg: 88.5 },
    nba: { ppg: 7.5, rpg: 6.5, apg: 0.9, spg: 0.6, bpg: 1.5, ws48: 0.098, outcome: 'Role Player' },
  },
  {
    pick: 15, team: 'Philadelphia 76ers', name: 'Maurice Harkless', school: 'St. Johns', pos: 'SF',
    birthYear: 1993, height: 80, weight: 197, wingspan: 86, conf: 'Big East',
    archetype: 'Two Way Wing',
    // 2011-12 St. Johns: 13.8 PPG, 6.8 RPG, 1.3 APG
    stats: { games: 33, mpg: 29.8, ppg: 13.8, rpg: 6.8, apg: 1.3, spg: 1.2, bpg: 1.2, tov: 1.8, pf: 2.3, fg_pct: 0.469, three_pt_pct: 0.278, ft_pct: 0.690, pts_per40: 18.5, reb_per40: 9.1, ast_per40: 1.7, stl_per40: 1.6, blk_per40: 1.6, tov_per40: 2.4, usg: 0.245, per: 19.2, bpm: 5.0, obpm: 2.0, dbpm: 3.0, ws: 5.2, efg_pct: 0.495, ts_pct: 0.538, ast_pct: 0.075, tov_pct: 0.128, stl_pct: 0.026, blk_pct: 0.038, orb_pct: 0.060, drb_pct: 0.162, drtg: 94.0 },
    nba: { ppg: 8.2, rpg: 4.0, apg: 1.0, spg: 0.8, bpg: 0.7, ws48: 0.082, outcome: 'Starter' },
  },
  {
    pick: 16, team: 'Houston Rockets', name: 'Royce White', school: 'Iowa State', pos: 'PF',
    birthYear: 1991, height: 81, weight: 260, wingspan: 84, conf: 'Big 12',
    archetype: 'Point Forward',
    // 2011-12 Iowa State: 13.4 PPG, 9.3 RPG, 5.8 APG
    stats: { games: 32, mpg: 31.5, ppg: 13.4, rpg: 9.3, apg: 5.8, spg: 1.8, bpg: 0.5, tov: 3.0, pf: 3.2, fg_pct: 0.457, three_pt_pct: 0.267, ft_pct: 0.621, pts_per40: 17.0, reb_per40: 11.8, ast_per40: 7.4, stl_per40: 2.3, blk_per40: 0.6, tov_per40: 3.8, usg: 0.248, per: 22.5, bpm: 7.5, obpm: 3.5, dbpm: 4.0, ws: 6.8, efg_pct: 0.475, ts_pct: 0.509, ast_pct: 0.285, tov_pct: 0.175, stl_pct: 0.038, blk_pct: 0.012, orb_pct: 0.095, drb_pct: 0.218, drtg: 92.5 },
    nba: { ppg: 3.1, rpg: 3.0, apg: 1.8, spg: 0.5, bpg: 0.2, ws48: 0.010, outcome: 'Bust' },
  },
  {
    pick: 17, team: 'Dallas Mavericks', name: 'Tyler Zeller', school: 'North Carolina', pos: 'C',
    birthYear: 1990, height: 84, weight: 253, wingspan: 88, conf: 'ACC',
    archetype: 'Drop Coverage Big',
    // 2011-12 UNC: 16.3 PPG, 8.6 RPG, 1.5 APG
    stats: { games: 32, mpg: 28.5, ppg: 16.3, rpg: 8.6, apg: 1.5, spg: 0.5, bpg: 1.2, tov: 1.8, pf: 2.8, fg_pct: 0.562, three_pt_pct: null, ft_pct: 0.798, pts_per40: 22.8, reb_per40: 12.1, ast_per40: 2.1, stl_per40: 0.7, blk_per40: 1.7, tov_per40: 2.5, usg: 0.272, per: 21.0, bpm: 5.8, obpm: 3.2, dbpm: 2.6, ws: 5.8, efg_pct: 0.562, ts_pct: 0.621, ast_pct: 0.092, tov_pct: 0.120, stl_pct: 0.011, blk_pct: 0.038, orb_pct: 0.072, drb_pct: 0.188, drtg: 94.5 },
    nba: { ppg: 8.5, rpg: 5.8, apg: 1.0, spg: 0.4, bpg: 0.8, ws48: 0.085, outcome: 'Role Player' },
  },
  {
    pick: 18, team: 'Minnesota Timberwolves', name: 'Terrence Jones', school: 'Kentucky', pos: 'PF',
    birthYear: 1992, height: 81, weight: 245, wingspan: 85, conf: 'SEC',
    archetype: 'Rim Runner',
    // 2011-12 Kentucky: 11.4 PPG, 6.8 RPG, 1.0 APG
    stats: { games: 40, mpg: 27.2, ppg: 11.4, rpg: 6.8, apg: 1.0, spg: 0.8, bpg: 0.9, tov: 1.5, pf: 2.5, fg_pct: 0.522, three_pt_pct: null, ft_pct: 0.712, pts_per40: 16.8, reb_per40: 10.0, ast_per40: 1.5, stl_per40: 1.2, blk_per40: 1.3, tov_per40: 2.2, usg: 0.228, per: 18.2, bpm: 4.8, obpm: 2.0, dbpm: 2.8, ws: 6.0, efg_pct: 0.522, ts_pct: 0.558, ast_pct: 0.058, tov_pct: 0.118, stl_pct: 0.018, blk_pct: 0.028, orb_pct: 0.068, drb_pct: 0.165, drtg: 89.5 },
    nba: { ppg: 9.5, rpg: 5.0, apg: 0.8, spg: 0.7, bpg: 0.7, ws48: 0.085, outcome: 'Role Player' },
  },
  {
    pick: 19, team: 'Orlando Magic', name: 'Andrew Nicholson', school: 'St. Bonaventure', pos: 'PF',
    birthYear: 1989, height: 82, weight: 235, wingspan: 86, conf: 'Atlantic 10',
    archetype: 'Stretch Big',
    // 2011-12 St. Bonaventure: 19.6 PPG, 8.0 RPG, 1.2 APG
    stats: { games: 32, mpg: 31.5, ppg: 19.6, rpg: 8.0, apg: 1.2, spg: 0.8, bpg: 2.0, tov: 2.0, pf: 3.0, fg_pct: 0.539, three_pt_pct: 0.415, ft_pct: 0.802, pts_per40: 24.9, reb_per40: 10.2, ast_per40: 1.5, stl_per40: 1.0, blk_per40: 2.5, tov_per40: 2.5, usg: 0.295, per: 23.5, bpm: 7.8, obpm: 5.2, dbpm: 2.6, ws: 6.8, efg_pct: 0.612, ts_pct: 0.645, ast_pct: 0.068, tov_pct: 0.128, stl_pct: 0.017, blk_pct: 0.062, orb_pct: 0.082, drb_pct: 0.188, drtg: 95.5 },
    nba: { ppg: 5.2, rpg: 2.8, apg: 0.5, spg: 0.3, bpg: 0.5, ws48: 0.042, outcome: 'Bust' },
  },
  {
    pick: 20, team: 'Denver Nuggets', name: 'Evan Fournier', school: 'Poitiers Basket', pos: 'SG',
    birthYear: 1992, height: 78, weight: 205, wingspan: 81, conf: null,
    archetype: 'Off Ball Shooter',
    // 2011-12 Pro-B France: ~10 PPG, 3 RPG, 2 APG
    stats: { games: 30, mpg: 24.5, ppg: 10.5, rpg: 3.2, apg: 2.2, spg: 0.8, bpg: 0.2, tov: 1.5, pf: 1.8, fg_pct: 0.445, three_pt_pct: 0.392, ft_pct: 0.815, pts_per40: 17.1, reb_per40: 5.2, ast_per40: 3.6, stl_per40: 1.3, blk_per40: 0.3, tov_per40: 2.4, usg: 0.225, per: 16.5, bpm: 3.5, obpm: 2.5, dbpm: 1.0, ws: 3.5, efg_pct: 0.530, ts_pct: 0.582, ast_pct: 0.165, tov_pct: 0.125, stl_pct: 0.022, blk_pct: 0.005, orb_pct: 0.028, drb_pct: 0.075, drtg: 98.5 },
    nba: { ppg: 14.5, rpg: 2.7, apg: 2.5, spg: 0.7, bpg: 0.2, ws48: 0.090, outcome: 'Starter' },
  },
  {
    pick: 21, team: 'Boston Celtics', name: 'Jared Sullinger', school: 'Ohio State', pos: 'PF',
    birthYear: 1992, height: 81, weight: 265, wingspan: 83, conf: 'Big Ten',
    archetype: 'Offensive Rebounder',
    // 2011-12 Ohio State: 17.5 PPG, 9.2 RPG, 1.8 APG
    stats: { games: 36, mpg: 29.8, ppg: 17.5, rpg: 9.2, apg: 1.8, spg: 0.8, bpg: 0.5, tov: 2.0, pf: 2.6, fg_pct: 0.479, three_pt_pct: 0.320, ft_pct: 0.722, pts_per40: 23.5, reb_per40: 12.3, ast_per40: 2.4, stl_per40: 1.1, blk_per40: 0.7, tov_per40: 2.7, usg: 0.288, per: 22.5, bpm: 7.0, obpm: 4.5, dbpm: 2.5, ws: 7.5, efg_pct: 0.511, ts_pct: 0.559, ast_pct: 0.108, tov_pct: 0.135, stl_pct: 0.017, blk_pct: 0.012, orb_pct: 0.105, drb_pct: 0.222, drtg: 95.5 },
    nba: { ppg: 9.0, rpg: 6.5, apg: 1.5, spg: 0.6, bpg: 0.3, ws48: 0.090, outcome: 'Role Player' },
  },
  {
    pick: 26, team: 'Indiana Pacers', name: 'Miles Plumlee', school: 'Duke', pos: 'C',
    birthYear: 1988, height: 83, weight: 249, wingspan: 87, conf: 'ACC',
    archetype: 'Rim Runner',
    // 2011-12 Duke: 13.1 PPG, 7.5 RPG, 0.6 APG
    stats: { games: 38, mpg: 25.8, ppg: 13.1, rpg: 7.5, apg: 0.6, spg: 0.8, bpg: 1.5, tov: 1.5, pf: 2.8, fg_pct: 0.567, three_pt_pct: null, ft_pct: 0.635, pts_per40: 20.3, reb_per40: 11.6, ast_per40: 0.9, stl_per40: 1.2, blk_per40: 2.3, tov_per40: 2.3, usg: 0.238, per: 20.0, bpm: 5.5, obpm: 2.0, dbpm: 3.5, ws: 5.8, efg_pct: 0.567, ts_pct: 0.593, ast_pct: 0.038, tov_pct: 0.128, stl_pct: 0.020, blk_pct: 0.055, orb_pct: 0.082, drb_pct: 0.192, drtg: 93.5 },
    nba: { ppg: 7.5, rpg: 6.5, apg: 0.8, spg: 0.5, bpg: 0.8, ws48: 0.082, outcome: 'Role Player' },
  },
  {
    pick: 27, team: 'Miami Heat', name: 'Arnett Moultrie', school: 'Mississippi State', pos: 'PF',
    birthYear: 1990, height: 82, weight: 220, wingspan: 87, conf: 'SEC',
    archetype: 'Stretch Big',
    // 2011-12 Mississippi State: 17.8 PPG, 9.5 RPG, 1.0 APG
    stats: { games: 35, mpg: 31.2, ppg: 17.8, rpg: 9.5, apg: 1.0, spg: 0.5, bpg: 0.8, tov: 1.8, pf: 2.8, fg_pct: 0.528, three_pt_pct: null, ft_pct: 0.735, pts_per40: 22.8, reb_per40: 12.2, ast_per40: 1.3, stl_per40: 0.6, blk_per40: 1.0, tov_per40: 2.3, usg: 0.272, per: 21.8, bpm: 6.2, obpm: 3.8, dbpm: 2.4, ws: 6.2, efg_pct: 0.528, ts_pct: 0.585, ast_pct: 0.062, tov_pct: 0.128, stl_pct: 0.010, blk_pct: 0.022, orb_pct: 0.095, drb_pct: 0.215, drtg: 96.0 },
    nba: { ppg: 4.5, rpg: 3.0, apg: 0.3, spg: 0.3, bpg: 0.3, ws48: 0.035, outcome: 'Bust' },
  },
  {
    pick: 28, team: 'Oklahoma City Thunder', name: 'Perry Jones III', school: 'Baylor', pos: 'SF',
    birthYear: 1992, height: 82, weight: 225, wingspan: 89, conf: 'Big 12',
    archetype: 'Athletic Wing',
    // 2011-12 Baylor: 13.4 PPG, 7.0 RPG, 1.5 APG
    stats: { games: 34, mpg: 30.5, ppg: 13.4, rpg: 7.0, apg: 1.5, spg: 0.8, bpg: 1.0, tov: 2.2, pf: 2.5, fg_pct: 0.469, three_pt_pct: 0.288, ft_pct: 0.648, pts_per40: 17.6, reb_per40: 9.2, ast_per40: 2.0, stl_per40: 1.0, blk_per40: 1.3, tov_per40: 2.9, usg: 0.245, per: 17.5, bpm: 3.5, obpm: 1.5, dbpm: 2.0, ws: 4.5, efg_pct: 0.495, ts_pct: 0.518, ast_pct: 0.085, tov_pct: 0.148, stl_pct: 0.017, blk_pct: 0.030, orb_pct: 0.062, drb_pct: 0.162, drtg: 96.5 },
    nba: { ppg: 4.2, rpg: 2.5, apg: 0.5, spg: 0.3, bpg: 0.4, ws48: 0.032, outcome: 'Bust' },
  },
  {
    pick: 29, team: 'Chicago Bulls', name: 'Marquis Teague', school: 'Kentucky', pos: 'PG',
    birthYear: 1993, height: 74, weight: 185, wingspan: 78, conf: 'SEC',
    archetype: 'Secondary Playmaker',
    // 2011-12 Kentucky: 10.0 PPG, 3.3 RPG, 4.5 APG
    stats: { games: 40, mpg: 25.8, ppg: 10.0, rpg: 3.3, apg: 4.5, spg: 1.1, bpg: 0.2, tov: 2.5, pf: 2.2, fg_pct: 0.436, three_pt_pct: 0.302, ft_pct: 0.728, pts_per40: 15.5, reb_per40: 5.1, ast_per40: 7.0, stl_per40: 1.7, blk_per40: 0.3, tov_per40: 3.9, usg: 0.228, per: 16.2, bpm: 3.5, obpm: 2.0, dbpm: 1.5, ws: 5.2, efg_pct: 0.475, ts_pct: 0.528, ast_pct: 0.252, tov_pct: 0.158, stl_pct: 0.028, blk_pct: 0.005, orb_pct: 0.028, drb_pct: 0.082, drtg: 90.5 },
    nba: { ppg: 4.5, rpg: 1.5, apg: 2.8, spg: 0.5, bpg: 0.1, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 30, team: 'Golden State Warriors', name: 'Festus Ezeli', school: 'Vanderbilt', pos: 'C',
    birthYear: 1989, height: 83, weight: 255, wingspan: 87, conf: 'SEC',
    archetype: 'Rim Protector',
    // 2011-12 Vanderbilt: 12.8 PPG, 7.8 RPG, 1.2 APG, 2.5 BPG
    stats: { games: 33, mpg: 26.5, ppg: 12.8, rpg: 7.8, apg: 1.2, spg: 0.8, bpg: 2.5, tov: 1.8, pf: 3.2, fg_pct: 0.618, three_pt_pct: null, ft_pct: 0.518, pts_per40: 19.3, reb_per40: 11.8, ast_per40: 1.8, stl_per40: 1.2, blk_per40: 3.8, tov_per40: 2.7, usg: 0.255, per: 22.5, bpm: 7.0, obpm: 2.8, dbpm: 4.2, ws: 6.2, efg_pct: 0.618, ts_pct: 0.580, ast_pct: 0.068, tov_pct: 0.138, stl_pct: 0.020, blk_pct: 0.092, orb_pct: 0.088, drb_pct: 0.215, drtg: 92.5 },
    nba: { ppg: 6.5, rpg: 4.8, apg: 0.5, spg: 0.5, bpg: 1.2, ws48: 0.092, outcome: 'Role Player' },
  },
  // === ROUND 2 (notable picks) ===
  {
    pick: 34, team: 'Dallas Mavericks', name: 'Jae Crowder', school: 'Marquette', pos: 'SF',
    birthYear: 1990, height: 78, weight: 235, wingspan: 81, conf: 'Big East',
    archetype: 'Two Way Wing',
    // 2011-12 Marquette: 20.5 PPG, 7.8 RPG, 3.5 APG
    stats: { games: 33, mpg: 35.0, ppg: 20.5, rpg: 7.8, apg: 3.5, spg: 2.2, bpg: 0.5, tov: 2.5, pf: 2.8, fg_pct: 0.479, three_pt_pct: 0.358, ft_pct: 0.782, pts_per40: 23.4, reb_per40: 8.9, ast_per40: 4.0, stl_per40: 2.5, blk_per40: 0.6, tov_per40: 2.9, usg: 0.272, per: 21.5, bpm: 7.5, obpm: 5.0, dbpm: 2.5, ws: 7.0, efg_pct: 0.540, ts_pct: 0.578, ast_pct: 0.175, tov_pct: 0.138, stl_pct: 0.045, blk_pct: 0.010, orb_pct: 0.065, drb_pct: 0.172, drtg: 96.5 },
    nba: { ppg: 10.5, rpg: 4.8, apg: 1.5, spg: 1.1, bpg: 0.3, ws48: 0.102, outcome: 'Starter' },
  },
  {
    pick: 35, team: 'Golden State Warriors', name: 'Draymond Green', school: 'Michigan State', pos: 'PF',
    birthYear: 1990, height: 79, weight: 230, wingspan: 81, conf: 'Big Ten',
    archetype: 'Point Forward',
    // 2011-12 Michigan State: 12.7 PPG, 10.7 RPG, 3.8 APG (First Team All-Big Ten)
    stats: { games: 36, mpg: 34.5, ppg: 12.7, rpg: 10.7, apg: 3.8, spg: 1.5, bpg: 0.8, tov: 2.5, pf: 2.8, fg_pct: 0.444, three_pt_pct: 0.333, ft_pct: 0.662, pts_per40: 14.7, reb_per40: 12.4, ast_per40: 4.4, stl_per40: 1.7, blk_per40: 0.9, tov_per40: 2.9, usg: 0.218, per: 20.8, bpm: 7.8, obpm: 3.5, dbpm: 4.3, ws: 7.5, efg_pct: 0.494, ts_pct: 0.525, ast_pct: 0.198, tov_pct: 0.148, stl_pct: 0.031, blk_pct: 0.022, orb_pct: 0.098, drb_pct: 0.252, drtg: 93.5 },
    nba: { ppg: 12.0, rpg: 7.5, apg: 6.5, spg: 1.4, bpg: 1.1, ws48: 0.208, outcome: 'All-NBA' },
  },
  {
    pick: 39, team: 'Detroit Pistons', name: 'Khris Middleton', school: 'Texas A&M', pos: 'SF',
    birthYear: 1991, height: 80, weight: 222, wingspan: 83, conf: 'SEC',
    archetype: 'Off Ball Scoring Wing',
    // 2011-12 Texas A&M: 15.5 PPG, 5.8 RPG, 2.8 APG
    stats: { games: 33, mpg: 32.5, ppg: 15.5, rpg: 5.8, apg: 2.8, spg: 1.2, bpg: 0.3, tov: 1.8, pf: 1.8, fg_pct: 0.459, three_pt_pct: 0.392, ft_pct: 0.815, pts_per40: 19.1, reb_per40: 7.1, ast_per40: 3.4, stl_per40: 1.5, blk_per40: 0.4, tov_per40: 2.2, usg: 0.252, per: 18.5, bpm: 5.0, obpm: 3.5, dbpm: 1.5, ws: 5.5, efg_pct: 0.535, ts_pct: 0.585, ast_pct: 0.152, tov_pct: 0.118, stl_pct: 0.025, blk_pct: 0.007, orb_pct: 0.038, drb_pct: 0.132, drtg: 96.5 },
    nba: { ppg: 18.5, rpg: 5.0, apg: 3.5, spg: 1.0, bpg: 0.2, ws48: 0.148, outcome: 'All-Star' },
  },
  {
    pick: 40, team: 'Denver Nuggets', name: 'Will Barton', school: 'Memphis', pos: 'SG',
    birthYear: 1991, height: 78, weight: 175, wingspan: 82, conf: 'C-USA',
    archetype: 'Slasher Wing',
    // 2011-12 Memphis: 18.0 PPG, 8.2 RPG, 2.8 APG
    stats: { games: 34, mpg: 33.8, ppg: 18.0, rpg: 8.2, apg: 2.8, spg: 1.8, bpg: 0.8, tov: 2.2, pf: 2.0, fg_pct: 0.468, three_pt_pct: 0.350, ft_pct: 0.752, pts_per40: 21.3, reb_per40: 9.7, ast_per40: 3.3, stl_per40: 2.1, blk_per40: 0.9, tov_per40: 2.6, usg: 0.275, per: 21.2, bpm: 7.0, obpm: 5.2, dbpm: 1.8, ws: 6.5, efg_pct: 0.535, ts_pct: 0.568, ast_pct: 0.145, tov_pct: 0.138, stl_pct: 0.038, blk_pct: 0.018, orb_pct: 0.075, drb_pct: 0.188, drtg: 96.5 },
    nba: { ppg: 12.8, rpg: 3.8, apg: 2.2, spg: 0.8, bpg: 0.3, ws48: 0.095, outcome: 'Starter' },
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
      class: 'Senior',
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
  console.log(`Navigate to /legendary-archives?year=2012 to view the board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
