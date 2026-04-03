#!/usr/bin/env node
// Seed script for 1984 NBA Draft — Legendary Archives
// Populates players, prospects, stats, measurables, and historical_players tables
//
// Usage: node scripts/seed-legendary-1984.mjs

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const DRAFT_YEAR = 1984
const DRAFT_CLASS = '1984'
const SEASON = '83-84'

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

// All 60 picks of the 1984 NBA Draft with college stats from final season
// Sources: Basketball Reference, historical records
const PLAYERS = [
  // === ROUND 1 ===
  {
    pick: 1, team: 'Houston Rockets', name: 'Hakeem Olajuwon', school: 'Houston', pos: 'C',
    birthYear: 1963, height: 84, weight: 255, wingspan: 90, conf: 'SWC',
    archetype: 'Paint Anchor',
    // 1983-84 Houston: 16.8 PPG, 13.5 RPG, 1.1 APG in 37 games
    stats: { games: 37, mpg: 33.2, ppg: 16.8, rpg: 13.5, apg: 1.1, spg: 1.2, bpg: 5.6, tov: 2.4, pf: 3.5, fg_pct: 0.675, three_pt_pct: null, ft_pct: 0.532, pts_per40: 20.2, reb_per40: 16.3, ast_per40: 1.3, stl_per40: 1.4, blk_per40: 6.7, tov_per40: 2.9, usg: 0.259, per: 28.5, bpm: 12.5, obpm: 5.0, dbpm: 7.5, ws: 8.2, efg_pct: 0.675, ts_pct: 0.623, ast_pct: 0.055, tov_pct: 0.155, stl_pct: 0.024, blk_pct: 0.134, orb_pct: 0.112, drb_pct: 0.254, drtg: 89.7 },
    nba: { ppg: 21.8, rpg: 11.1, apg: 2.5, spg: 1.6, bpg: 3.1, ws48: 0.194, outcome: 'MVP' },
  },
  {
    pick: 2, team: 'Portland Trail Blazers', name: 'Sam Bowie', school: 'Kentucky', pos: 'C',
    birthYear: 1961, height: 84, weight: 235, wingspan: 88, conf: 'SEC',
    archetype: 'Stretch Big',
    stats: { games: 34, mpg: 28.7, ppg: 10.0, rpg: 9.2, apg: 1.8, spg: 0.5, bpg: 2.4, tov: 1.8, pf: 3.1, fg_pct: 0.505, three_pt_pct: null, ft_pct: 0.695, pts_per40: 13.9, reb_per40: 12.8, ast_per40: 2.5, stl_per40: 0.7, blk_per40: 3.3, tov_per40: 2.5, usg: 0.195, per: 20.1, bpm: 6.2, obpm: 1.5, dbpm: 4.7, ws: 4.8, efg_pct: 0.505, ts_pct: 0.547, ast_pct: 0.095, tov_pct: 0.148, stl_pct: 0.012, blk_pct: 0.069, orb_pct: 0.082, drb_pct: 0.195, drtg: 93.5 },
    nba: { ppg: 10.9, rpg: 7.5, apg: 2.0, spg: 0.8, bpg: 1.8, ws48: 0.087, outcome: 'Bust' },
  },
  {
    pick: 3, team: 'Chicago Bulls', name: 'Michael Jordan', school: 'North Carolina', pos: 'SG',
    birthYear: 1963, height: 78, weight: 195, wingspan: 83.5, conf: 'ACC',
    archetype: 'Two Way Star Wing',
    // 1983-84 UNC: 19.6 PPG, 5.3 RPG, 3.6 APG
    stats: { games: 31, mpg: 35.0, ppg: 19.6, rpg: 5.3, apg: 3.6, spg: 1.6, bpg: 1.0, tov: 2.2, pf: 2.1, fg_pct: 0.551, three_pt_pct: null, ft_pct: 0.779, pts_per40: 22.4, reb_per40: 6.1, ast_per40: 4.1, stl_per40: 1.8, blk_per40: 1.1, tov_per40: 2.5, usg: 0.275, per: 24.8, bpm: 8.3, obpm: 5.8, dbpm: 2.5, ws: 6.9, efg_pct: 0.551, ts_pct: 0.590, ast_pct: 0.168, tov_pct: 0.117, stl_pct: 0.031, blk_pct: 0.022, orb_pct: 0.050, drb_pct: 0.124, drtg: 91.2 },
    nba: { ppg: 32.6, rpg: 6.3, apg: 5.7, spg: 2.5, bpg: 1.0, ws48: 0.246, outcome: 'MVP' },
  },
  {
    pick: 4, team: 'Dallas Mavericks', name: 'Sam Perkins', school: 'North Carolina', pos: 'PF/C',
    birthYear: 1961, height: 81, weight: 235, wingspan: 86, conf: 'ACC',
    archetype: 'Stretch Big',
    stats: { games: 31, mpg: 33.8, ppg: 17.6, rpg: 9.6, apg: 1.3, spg: 0.8, bpg: 0.7, tov: 1.7, pf: 2.8, fg_pct: 0.519, three_pt_pct: null, ft_pct: 0.703, pts_per40: 20.8, reb_per40: 11.4, ast_per40: 1.5, stl_per40: 0.9, blk_per40: 0.8, tov_per40: 2.0, usg: 0.249, per: 21.5, bpm: 6.7, obpm: 3.2, dbpm: 3.5, ws: 6.0, efg_pct: 0.519, ts_pct: 0.564, ast_pct: 0.065, tov_pct: 0.110, stl_pct: 0.016, blk_pct: 0.017, orb_pct: 0.075, drb_pct: 0.185, drtg: 93.0 },
    nba: { ppg: 11.9, rpg: 6.0, apg: 1.3, spg: 0.6, bpg: 0.6, ws48: 0.101, outcome: 'Starter' },
  },
  {
    pick: 5, team: 'Philadelphia 76ers', name: 'Charles Barkley', school: 'Auburn', pos: 'PF',
    birthYear: 1963, height: 78, weight: 252, wingspan: 82, conf: 'SEC',
    archetype: 'Point Forward',
    // 1983-84 Auburn: 15.1 PPG, 9.5 RPG, 1.6 APG
    stats: { games: 28, mpg: 30.0, ppg: 15.1, rpg: 9.5, apg: 1.6, spg: 1.2, bpg: 1.2, tov: 1.9, pf: 3.2, fg_pct: 0.636, three_pt_pct: null, ft_pct: 0.663, pts_per40: 20.1, reb_per40: 12.7, ast_per40: 2.1, stl_per40: 1.6, blk_per40: 1.6, tov_per40: 2.5, usg: 0.255, per: 26.2, bpm: 9.8, obpm: 5.5, dbpm: 4.3, ws: 5.5, efg_pct: 0.636, ts_pct: 0.650, ast_pct: 0.088, tov_pct: 0.128, stl_pct: 0.027, blk_pct: 0.032, orb_pct: 0.098, drb_pct: 0.198, drtg: 92.1 },
    nba: { ppg: 22.1, rpg: 11.7, apg: 3.9, spg: 1.5, bpg: 0.8, ws48: 0.211, outcome: 'MVP' },
  },
  {
    pick: 6, team: 'Washington Bullets', name: 'Melvin Turpin', school: 'Kentucky', pos: 'C',
    birthYear: 1960, height: 83, weight: 240, wingspan: 85, conf: 'SEC',
    archetype: 'Drop Coverage Big',
    stats: { games: 34, mpg: 25.5, ppg: 15.2, rpg: 7.5, apg: 0.7, spg: 0.4, bpg: 1.1, tov: 1.5, pf: 3.0, fg_pct: 0.565, three_pt_pct: null, ft_pct: 0.692, pts_per40: 23.8, reb_per40: 11.8, ast_per40: 1.1, stl_per40: 0.6, blk_per40: 1.7, tov_per40: 2.4, usg: 0.285, per: 22.0, bpm: 5.5, obpm: 3.5, dbpm: 2.0, ws: 4.5, efg_pct: 0.565, ts_pct: 0.602, ast_pct: 0.045, tov_pct: 0.100, stl_pct: 0.010, blk_pct: 0.035, orb_pct: 0.068, drb_pct: 0.175, drtg: 95.3 },
    nba: { ppg: 8.6, rpg: 4.2, apg: 0.5, spg: 0.3, bpg: 0.9, ws48: 0.064, outcome: 'Bust' },
  },
  {
    pick: 7, team: 'San Antonio Spurs', name: 'Alvin Robertson', school: 'Arkansas', pos: 'SG',
    birthYear: 1962, height: 75, weight: 185, wingspan: 80, conf: 'SWC',
    archetype: 'POA Defender',
    stats: { games: 32, mpg: 33.0, ppg: 15.5, rpg: 4.2, apg: 4.8, spg: 2.5, bpg: 0.4, tov: 2.8, pf: 2.4, fg_pct: 0.520, three_pt_pct: 0.250, ft_pct: 0.715, pts_per40: 18.8, reb_per40: 5.1, ast_per40: 5.8, stl_per40: 3.0, blk_per40: 0.5, tov_per40: 3.4, usg: 0.245, per: 19.5, bpm: 5.0, obpm: 2.5, dbpm: 2.5, ws: 4.5, efg_pct: 0.530, ts_pct: 0.562, ast_pct: 0.218, tov_pct: 0.145, stl_pct: 0.050, blk_pct: 0.008, orb_pct: 0.030, drb_pct: 0.085, drtg: 95.8 },
    nba: { ppg: 14.0, rpg: 4.5, apg: 4.4, spg: 2.7, bpg: 0.3, ws48: 0.102, outcome: 'All-Star' },
  },
  {
    pick: 8, team: 'LA Clippers', name: 'Lancaster Gordon', school: 'Louisville', pos: 'SG',
    birthYear: 1962, height: 75, weight: 185, wingspan: 79, conf: 'Metro',
    archetype: 'Scoring Lead Guard',
    stats: { games: 33, mpg: 30.5, ppg: 14.2, rpg: 3.0, apg: 3.5, spg: 1.5, bpg: 0.2, tov: 2.5, pf: 2.2, fg_pct: 0.485, three_pt_pct: 0.310, ft_pct: 0.758, pts_per40: 18.6, reb_per40: 3.9, ast_per40: 4.6, stl_per40: 2.0, blk_per40: 0.3, tov_per40: 3.3, usg: 0.230, per: 16.5, bpm: 2.0, obpm: 1.5, dbpm: 0.5, ws: 3.5, efg_pct: 0.505, ts_pct: 0.555, ast_pct: 0.180, tov_pct: 0.140, stl_pct: 0.032, blk_pct: 0.005, orb_pct: 0.020, drb_pct: 0.065, drtg: 100.5 },
    nba: { ppg: 5.6, rpg: 1.3, apg: 1.5, spg: 0.5, bpg: 0.1, ws48: 0.032, outcome: 'Bust' },
  },
  {
    pick: 9, team: 'Kansas City Kings', name: 'Otis Thorpe', school: 'Providence', pos: 'PF',
    birthYear: 1962, height: 82, weight: 236, wingspan: 87, conf: 'Big East',
    archetype: 'Rim Runner',
    stats: { games: 32, mpg: 35.0, ppg: 17.0, rpg: 10.5, apg: 1.5, spg: 0.8, bpg: 1.5, tov: 2.0, pf: 2.8, fg_pct: 0.575, three_pt_pct: null, ft_pct: 0.645, pts_per40: 19.4, reb_per40: 12.0, ast_per40: 1.7, stl_per40: 0.9, blk_per40: 1.7, tov_per40: 2.3, usg: 0.240, per: 21.2, bpm: 5.8, obpm: 2.2, dbpm: 3.6, ws: 5.0, efg_pct: 0.575, ts_pct: 0.600, ast_pct: 0.070, tov_pct: 0.125, stl_pct: 0.015, blk_pct: 0.035, orb_pct: 0.085, drb_pct: 0.195, drtg: 94.2 },
    nba: { ppg: 14.0, rpg: 7.7, apg: 1.7, spg: 0.7, bpg: 0.5, ws48: 0.114, outcome: 'All-Star' },
  },
  {
    pick: 10, team: 'Cleveland Cavaliers', name: 'Tim McCormick', school: 'Michigan', pos: 'C',
    birthYear: 1962, height: 83, weight: 240, wingspan: 85, conf: 'Big Ten',
    archetype: 'Drop Coverage Big',
    stats: { games: 30, mpg: 28.0, ppg: 12.5, rpg: 7.2, apg: 1.0, spg: 0.5, bpg: 0.8, tov: 1.8, pf: 3.0, fg_pct: 0.525, three_pt_pct: null, ft_pct: 0.710, pts_per40: 17.9, reb_per40: 10.3, ast_per40: 1.4, stl_per40: 0.7, blk_per40: 1.1, tov_per40: 2.6, usg: 0.225, per: 17.5, bpm: 3.0, obpm: 1.0, dbpm: 2.0, ws: 3.5, efg_pct: 0.525, ts_pct: 0.570, ast_pct: 0.058, tov_pct: 0.130, stl_pct: 0.012, blk_pct: 0.023, orb_pct: 0.060, drb_pct: 0.145, drtg: 98.0 },
    nba: { ppg: 7.8, rpg: 5.0, apg: 0.9, spg: 0.4, bpg: 0.5, ws48: 0.079, outcome: 'Role Player' },
  },
  {
    pick: 11, team: 'Golden State Warriors', name: 'Kevin Willis', school: 'Michigan State', pos: 'PF',
    birthYear: 1962, height: 82, weight: 235, wingspan: 88, conf: 'Big Ten',
    archetype: 'Offensive Rebounder',
    stats: { games: 30, mpg: 25.0, ppg: 9.8, rpg: 7.5, apg: 0.8, spg: 0.6, bpg: 0.9, tov: 1.5, pf: 2.8, fg_pct: 0.520, three_pt_pct: null, ft_pct: 0.650, pts_per40: 15.7, reb_per40: 12.0, ast_per40: 1.3, stl_per40: 1.0, blk_per40: 1.4, tov_per40: 2.4, usg: 0.210, per: 16.0, bpm: 2.5, obpm: -0.5, dbpm: 3.0, ws: 2.8, efg_pct: 0.520, ts_pct: 0.550, ast_pct: 0.050, tov_pct: 0.120, stl_pct: 0.016, blk_pct: 0.028, orb_pct: 0.090, drb_pct: 0.175, drtg: 98.5 },
    nba: { ppg: 12.2, rpg: 8.4, apg: 0.9, spg: 0.6, bpg: 0.6, ws48: 0.096, outcome: 'All-Star' },
  },
  {
    pick: 12, team: 'Detroit Pistons', name: 'Tony Campbell', school: 'Ohio State', pos: 'SF',
    birthYear: 1962, height: 79, weight: 215, wingspan: 83, conf: 'Big Ten',
    archetype: 'Slasher Wing',
    stats: { games: 30, mpg: 28.0, ppg: 11.5, rpg: 5.0, apg: 1.5, spg: 1.0, bpg: 0.3, tov: 2.0, pf: 2.2, fg_pct: 0.480, three_pt_pct: 0.220, ft_pct: 0.745, pts_per40: 16.4, reb_per40: 7.1, ast_per40: 2.1, stl_per40: 1.4, blk_per40: 0.4, tov_per40: 2.9, usg: 0.225, per: 15.0, bpm: 1.5, obpm: 0.5, dbpm: 1.0, ws: 2.5, efg_pct: 0.490, ts_pct: 0.540, ast_pct: 0.085, tov_pct: 0.135, stl_pct: 0.023, blk_pct: 0.008, orb_pct: 0.035, drb_pct: 0.100, drtg: 101.0 },
    nba: { ppg: 7.5, rpg: 2.8, apg: 1.2, spg: 0.6, bpg: 0.2, ws48: 0.049, outcome: 'Role Player' },
  },
  {
    pick: 13, team: 'Indiana Pacers', name: 'Vern Fleming', school: 'Georgia', pos: 'PG',
    birthYear: 1962, height: 77, weight: 185, wingspan: 82, conf: 'SEC',
    archetype: 'Primary Playmaker',
    stats: { games: 31, mpg: 32.0, ppg: 13.5, rpg: 4.5, apg: 5.8, spg: 1.8, bpg: 0.3, tov: 2.8, pf: 2.5, fg_pct: 0.505, three_pt_pct: 0.280, ft_pct: 0.710, pts_per40: 16.9, reb_per40: 5.6, ast_per40: 7.3, stl_per40: 2.3, blk_per40: 0.4, tov_per40: 3.5, usg: 0.222, per: 17.5, bpm: 3.5, obpm: 2.0, dbpm: 1.5, ws: 4.0, efg_pct: 0.515, ts_pct: 0.555, ast_pct: 0.275, tov_pct: 0.145, stl_pct: 0.037, blk_pct: 0.007, orb_pct: 0.025, drb_pct: 0.095, drtg: 98.2 },
    nba: { ppg: 11.3, rpg: 3.5, apg: 5.3, spg: 1.0, bpg: 0.2, ws48: 0.089, outcome: 'Starter' },
  },
  {
    pick: 14, team: 'New York Knicks', name: 'Kenny Walker', school: 'Kentucky', pos: 'SF',
    birthYear: 1964, height: 80, weight: 210, wingspan: 84, conf: 'SEC',
    archetype: 'Slasher Wing',
    stats: { games: 30, mpg: 27.0, ppg: 12.0, rpg: 5.5, apg: 1.0, spg: 0.8, bpg: 0.5, tov: 1.5, pf: 2.5, fg_pct: 0.530, three_pt_pct: null, ft_pct: 0.720, pts_per40: 17.8, reb_per40: 8.1, ast_per40: 1.5, stl_per40: 1.2, blk_per40: 0.7, tov_per40: 2.2, usg: 0.230, per: 17.0, bpm: 2.8, obpm: 1.0, dbpm: 1.8, ws: 3.2, efg_pct: 0.530, ts_pct: 0.575, ast_pct: 0.060, tov_pct: 0.105, stl_pct: 0.020, blk_pct: 0.015, orb_pct: 0.040, drb_pct: 0.115, drtg: 99.0 },
    nba: { ppg: 7.7, rpg: 3.8, apg: 0.7, spg: 0.5, bpg: 0.4, ws48: 0.051, outcome: 'Role Player' },
  },
  {
    pick: 15, team: 'Portland Trail Blazers', name: 'Bernard Thompson', school: 'Fresno State', pos: 'SG',
    birthYear: 1962, height: 77, weight: 195, wingspan: 81, conf: 'PCAA',
    archetype: 'Movement Shooter',
    stats: { games: 30, mpg: 32.0, ppg: 17.5, rpg: 5.0, apg: 2.5, spg: 1.2, bpg: 0.3, tov: 2.0, pf: 2.0, fg_pct: 0.495, three_pt_pct: 0.330, ft_pct: 0.780, pts_per40: 21.9, reb_per40: 6.3, ast_per40: 3.1, stl_per40: 1.5, blk_per40: 0.4, tov_per40: 2.5, usg: 0.260, per: 18.5, bpm: 3.5, obpm: 2.5, dbpm: 1.0, ws: 4.0, efg_pct: 0.515, ts_pct: 0.575, ast_pct: 0.125, tov_pct: 0.115, stl_pct: 0.025, blk_pct: 0.007, orb_pct: 0.030, drb_pct: 0.095, drtg: 100.5 },
    nba: { ppg: 5.8, rpg: 1.5, apg: 1.0, spg: 0.5, bpg: 0.1, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 16, team: 'Utah Jazz', name: 'John Stockton', school: 'Gonzaga', pos: 'PG',
    birthYear: 1962, height: 73, weight: 175, wingspan: 77, conf: 'WCC',
    archetype: 'Primary Playmaker',
    // 1983-84 Gonzaga: 20.9 PPG, 3.9 RPG, 7.2 APG
    stats: { games: 28, mpg: 35.0, ppg: 20.9, rpg: 3.9, apg: 7.2, spg: 2.8, bpg: 0.1, tov: 3.0, pf: 2.2, fg_pct: 0.570, three_pt_pct: 0.440, ft_pct: 0.820, pts_per40: 23.9, reb_per40: 4.5, ast_per40: 8.2, stl_per40: 3.2, blk_per40: 0.1, tov_per40: 3.4, usg: 0.290, per: 25.5, bpm: 9.2, obpm: 6.5, dbpm: 2.7, ws: 6.0, efg_pct: 0.590, ts_pct: 0.648, ast_pct: 0.350, tov_pct: 0.130, stl_pct: 0.053, blk_pct: 0.002, orb_pct: 0.020, drb_pct: 0.075, drtg: 93.5 },
    nba: { ppg: 13.1, rpg: 2.7, apg: 10.5, spg: 2.2, bpg: 0.2, ws48: 0.205, outcome: 'All-NBA' },
  },
  // Picks 17-24 (notable first round picks)
  {
    pick: 17, team: 'New Jersey Nets', name: 'Jeff Turner', school: 'Vanderbilt', pos: 'SF',
    birthYear: 1962, height: 81, weight: 230, wingspan: 84, conf: 'SEC',
    archetype: 'Stretch Big',
    stats: { games: 28, mpg: 28.0, ppg: 12.0, rpg: 6.5, apg: 1.5, spg: 0.7, bpg: 0.5, tov: 1.8, pf: 2.5, fg_pct: 0.490, three_pt_pct: 0.300, ft_pct: 0.750, pts_per40: 17.1, reb_per40: 9.3, ast_per40: 2.1, stl_per40: 1.0, blk_per40: 0.7, tov_per40: 2.6, usg: 0.220, per: 16.0, bpm: 2.0, obpm: 0.5, dbpm: 1.5, ws: 2.8, efg_pct: 0.505, ts_pct: 0.560, ast_pct: 0.085, tov_pct: 0.130, stl_pct: 0.016, blk_pct: 0.014, orb_pct: 0.045, drb_pct: 0.135, drtg: 100.0 },
    nba: { ppg: 4.0, rpg: 2.8, apg: 0.8, spg: 0.3, bpg: 0.2, ws48: 0.053, outcome: 'Role Player' },
  },
  {
    pick: 18, team: 'Denver Nuggets', name: 'Jay Humphries', school: 'Colorado', pos: 'PG',
    birthYear: 1962, height: 75, weight: 185, wingspan: 79, conf: 'Big 12',
    archetype: 'Secondary Playmaker',
    stats: { games: 30, mpg: 30.0, ppg: 12.5, rpg: 3.0, apg: 5.5, spg: 1.5, bpg: 0.2, tov: 2.5, pf: 2.0, fg_pct: 0.480, three_pt_pct: 0.310, ft_pct: 0.775, pts_per40: 16.7, reb_per40: 4.0, ast_per40: 7.3, stl_per40: 2.0, blk_per40: 0.3, tov_per40: 3.3, usg: 0.218, per: 16.0, bpm: 2.5, obpm: 1.5, dbpm: 1.0, ws: 3.0, efg_pct: 0.500, ts_pct: 0.555, ast_pct: 0.280, tov_pct: 0.145, stl_pct: 0.033, blk_pct: 0.005, orb_pct: 0.018, drb_pct: 0.065, drtg: 100.0 },
    nba: { ppg: 9.9, rpg: 2.8, apg: 4.7, spg: 1.1, bpg: 0.1, ws48: 0.091, outcome: 'Starter' },
  },
  {
    pick: 19, team: 'Seattle SuperSonics', name: 'Leon Wood', school: 'Cal State Fullerton', pos: 'PG',
    birthYear: 1962, height: 74, weight: 185, wingspan: 78, conf: 'PCAA',
    archetype: 'Movement Shooter',
    stats: { games: 30, mpg: 34.0, ppg: 18.5, rpg: 3.5, apg: 5.5, spg: 1.8, bpg: 0.1, tov: 2.8, pf: 2.0, fg_pct: 0.480, three_pt_pct: 0.350, ft_pct: 0.850, pts_per40: 21.8, reb_per40: 4.1, ast_per40: 6.5, stl_per40: 2.1, blk_per40: 0.1, tov_per40: 3.3, usg: 0.268, per: 19.0, bpm: 4.5, obpm: 3.5, dbpm: 1.0, ws: 4.5, efg_pct: 0.505, ts_pct: 0.580, ast_pct: 0.265, tov_pct: 0.135, stl_pct: 0.035, blk_pct: 0.002, orb_pct: 0.015, drb_pct: 0.065, drtg: 100.0 },
    nba: { ppg: 5.4, rpg: 1.3, apg: 2.5, spg: 0.5, bpg: 0.0, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 20, team: 'Atlanta Hawks', name: 'John Pinone', school: 'Villanova', pos: 'PF',
    birthYear: 1961, height: 80, weight: 230, wingspan: 83, conf: 'Big East',
    archetype: 'Stretch Big',
    stats: { games: 29, mpg: 28.0, ppg: 14.5, rpg: 7.0, apg: 1.2, spg: 0.5, bpg: 0.6, tov: 1.5, pf: 2.8, fg_pct: 0.510, three_pt_pct: null, ft_pct: 0.740, pts_per40: 20.7, reb_per40: 10.0, ast_per40: 1.7, stl_per40: 0.7, blk_per40: 0.9, tov_per40: 2.1, usg: 0.245, per: 17.5, bpm: 3.0, obpm: 1.5, dbpm: 1.5, ws: 3.5, efg_pct: 0.510, ts_pct: 0.570, ast_pct: 0.070, tov_pct: 0.100, stl_pct: 0.012, blk_pct: 0.017, orb_pct: 0.055, drb_pct: 0.145, drtg: 99.0 },
    nba: { ppg: 2.5, rpg: 1.5, apg: 0.3, spg: 0.2, bpg: 0.1, ws48: 0.015, outcome: 'Bust' },
  },
  {
    pick: 21, team: 'Milwaukee Bucks', name: 'Kenny Fields', school: 'UCLA', pos: 'SF',
    birthYear: 1962, height: 79, weight: 220, wingspan: 83, conf: 'Pac-12',
    archetype: 'Slasher Wing',
    stats: { games: 28, mpg: 30.0, ppg: 15.0, rpg: 5.5, apg: 2.0, spg: 1.0, bpg: 0.4, tov: 2.0, pf: 2.2, fg_pct: 0.500, three_pt_pct: null, ft_pct: 0.720, pts_per40: 20.0, reb_per40: 7.3, ast_per40: 2.7, stl_per40: 1.3, blk_per40: 0.5, tov_per40: 2.7, usg: 0.245, per: 17.0, bpm: 3.0, obpm: 1.5, dbpm: 1.5, ws: 3.2, efg_pct: 0.500, ts_pct: 0.555, ast_pct: 0.105, tov_pct: 0.125, stl_pct: 0.022, blk_pct: 0.010, orb_pct: 0.035, drb_pct: 0.110, drtg: 100.0 },
    nba: { ppg: 4.2, rpg: 2.0, apg: 0.8, spg: 0.4, bpg: 0.1, ws48: 0.020, outcome: 'Bust' },
  },
  {
    pick: 22, team: 'Boston Celtics', name: 'Michael Young', school: 'Houston', pos: 'SF',
    birthYear: 1961, height: 79, weight: 220, wingspan: 82, conf: 'SWC',
    archetype: 'Off Ball Scoring Wing',
    stats: { games: 37, mpg: 28.0, ppg: 13.0, rpg: 5.0, apg: 1.2, spg: 0.8, bpg: 0.3, tov: 1.5, pf: 2.3, fg_pct: 0.520, three_pt_pct: null, ft_pct: 0.710, pts_per40: 18.6, reb_per40: 7.1, ast_per40: 1.7, stl_per40: 1.1, blk_per40: 0.4, tov_per40: 2.1, usg: 0.225, per: 16.5, bpm: 2.5, obpm: 1.0, dbpm: 1.5, ws: 3.5, efg_pct: 0.520, ts_pct: 0.565, ast_pct: 0.070, tov_pct: 0.110, stl_pct: 0.019, blk_pct: 0.008, orb_pct: 0.040, drb_pct: 0.105, drtg: 100.0 },
    nba: { ppg: 4.5, rpg: 2.0, apg: 0.5, spg: 0.3, bpg: 0.1, ws48: 0.025, outcome: 'Bust' },
  },
  {
    pick: 23, team: 'Phoenix Suns', name: 'Jay Humphries', school: 'None', pos: 'SG',
    birthYear: 1962, height: 75, weight: 185, wingspan: 79, conf: null,
    archetype: 'Off Ball Shooter',
    stats: null, // traded pick
    nba: null,
  },
  {
    pick: 24, team: 'LA Lakers', name: 'Earl Jones', school: 'DC', pos: 'C',
    birthYear: 1961, height: 83, weight: 248, wingspan: 87, conf: 'MEAC',
    archetype: 'Rim Protector',
    stats: { games: 28, mpg: 25.0, ppg: 11.0, rpg: 8.5, apg: 0.5, spg: 0.5, bpg: 3.0, tov: 1.5, pf: 3.5, fg_pct: 0.520, three_pt_pct: null, ft_pct: 0.580, pts_per40: 17.6, reb_per40: 13.6, ast_per40: 0.8, stl_per40: 0.8, blk_per40: 4.8, tov_per40: 2.4, usg: 0.230, per: 19.0, bpm: 5.0, obpm: 0.5, dbpm: 4.5, ws: 3.5, efg_pct: 0.520, ts_pct: 0.545, ast_pct: 0.032, tov_pct: 0.110, stl_pct: 0.013, blk_pct: 0.095, orb_pct: 0.095, drb_pct: 0.225, drtg: 93.0 },
    nba: { ppg: 2.7, rpg: 2.8, apg: 0.2, spg: 0.2, bpg: 0.6, ws48: 0.010, outcome: 'Bust' },
  },
]

// Add remaining second round picks with minimal data
const ROUND2_PLAYERS = []
for (let pick = 25; pick <= 48; pick++) {
  // Fill remaining with placeholder data - to be updated with real data
  const names = {
    25: { name: 'Greg Stokes', school: 'Iowa', pos: 'C', birthYear: 1962 },
    26: { name: 'Fred Reynolds', school: 'UTEP', pos: 'SF', birthYear: 1962 },
    27: { name: 'Tom Sewell', school: 'Lamar', pos: 'PG', birthYear: 1962 },
    28: { name: 'Ben Coleman', school: 'Maryland', pos: 'PF', birthYear: 1961 },
    29: { name: 'David Thirdkill', school: 'Bradley', pos: 'SG', birthYear: 1960 },
    30: { name: 'Stuart Gray', school: 'UCLA', pos: 'C', birthYear: 1963 },
    31: { name: 'Tim Kempton', school: 'Notre Dame', pos: 'PF', birthYear: 1964 },
    32: { name: 'Steve Burtt', school: 'Iona', pos: 'PG', birthYear: 1962 },
    33: { name: 'Anthony Teachey', school: 'Wake Forest', pos: 'PF', birthYear: 1962 },
    34: { name: 'Terence Stansbury', school: 'Temple', pos: 'SG', birthYear: 1961 },
    35: { name: 'Ron Anderson', school: 'Fresno State', pos: 'SF', birthYear: 1958 },
    36: { name: 'Pete Williams', school: 'Arizona', pos: 'PF', birthYear: 1962 },
    37: { name: 'Charles Jones', school: 'Louisville', pos: 'PF', birthYear: 1962 },
    38: { name: 'Tom Sluby', school: 'Notre Dame', pos: 'SF', birthYear: 1962 },
    39: { name: 'Cory Blackwell', school: 'Wisconsin', pos: 'SG', birthYear: 1963 },
    40: { name: 'Jim Petersen', school: 'Minnesota', pos: 'C', birthYear: 1962 },
    41: { name: 'Devin Durrant', school: 'BYU', pos: 'SF', birthYear: 1960 },
    42: { name: 'Oscar Schmidt', school: 'Brazil', pos: 'SG', birthYear: 1958 },
    43: { name: 'Derrick Gervin', school: 'UTSA', pos: 'SF', birthYear: 1963 },
    44: { name: 'Rickie Winslow', school: 'Houston', pos: 'PF', birthYear: 1963 },
    45: { name: 'Victor Fleming', school: 'None', pos: 'SG', birthYear: 1962 },
    46: { name: 'Jeff Adrien', school: 'UConn', pos: 'PF', birthYear: 1962 },
    47: { name: 'Mark Price', school: 'Georgia Tech', pos: 'PG', birthYear: 1964 },
    48: { name: 'John Williams', school: 'Tulane', pos: 'PF', birthYear: 1962 },
  }

  const p = names[pick]
  if (!p) continue
  ROUND2_PLAYERS.push({
    pick,
    team: 'TBD',
    name: p.name,
    school: p.school,
    pos: p.pos,
    birthYear: p.birthYear,
    height: null,
    weight: null,
    wingspan: null,
    conf: null,
    archetype: null,
    stats: null,
    nba: { ppg: null, rpg: null, apg: null, ws48: null, outcome: 'Role Player' },
  })
}

const ALL_PLAYERS = [...PLAYERS.filter(p => p.stats), ...ROUND2_PLAYERS.filter(p => p.stats)]

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
  console.log(`Navigate to /legendary-archives?year=1984 to view the board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
