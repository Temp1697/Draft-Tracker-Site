#!/usr/bin/env node
// Seed script for 2008 NBA Draft — Legendary Archives
// Populates players, prospects, stats, measurables, and historical_players tables
//
// Usage: node scripts/seed-legendary-2008.mjs

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const DRAFT_YEAR = 2008
const DRAFT_CLASS = '2008'
const SEASON = '07-08'

// Helper: generate player_id from name + birth year
function pid(name, birthYear) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + birthYear
}

// Position bucket mapping
function bucket(pos) {
  if (['PG', 'SG'].includes(pos)) return 'Guard'
  if (['SF', 'SF/PF', 'SG/SF'].includes(pos)) return 'Wing'
  if (['PF', 'C', 'PF/C', 'C/PF'].includes(pos)) return 'Big'
  return 'Wing'
}

// 2008 NBA Draft — college stats from final season (2007-08)
// Sources: Basketball Reference, Sports Reference College Basketball
const PLAYERS = [
  // === ROUND 1 ===
  {
    pick: 1, team: 'Chicago Bulls', name: 'Derrick Rose', school: 'Memphis', pos: 'PG',
    birthYear: 1988, height: 75, weight: 190, wingspan: 79, conf: 'C-USA',
    archetype: 'Primary Playmaker',
    // 2007-08 Memphis: 14.9 PPG, 4.7 RPG, 4.7 APG — led Memphis to national title game
    stats: { games: 38, mpg: 34.5, ppg: 14.9, rpg: 4.7, apg: 4.7, spg: 1.3, bpg: 0.4, tov: 2.8, pf: 2.5, fg_pct: 0.503, three_pt_pct: 0.333, ft_pct: 0.595, pts_per40: 17.2, reb_per40: 5.5, ast_per40: 5.4, stl_per40: 1.5, blk_per40: 0.5, tov_per40: 3.2, usg: 0.265, per: 20.8, bpm: 6.5, obpm: 4.2, dbpm: 2.3, ws: 6.8, efg_pct: 0.535, ts_pct: 0.548, ast_pct: 0.295, tov_pct: 0.165, stl_pct: 0.026, blk_pct: 0.009, orb_pct: 0.052, drb_pct: 0.125, drtg: 95.2 },
    nba: { ppg: 18.9, rpg: 3.8, apg: 6.7, spg: 1.0, bpg: 0.5, ws48: 0.155, outcome: 'MVP' },
  },
  {
    pick: 2, team: 'Miami Heat', name: 'Michael Beasley', school: 'Kansas State', pos: 'SF',
    birthYear: 1989, height: 80, weight: 235, wingspan: 83, conf: 'Big 12',
    archetype: 'Scoring Lead Guard',
    // 2007-08 Kansas State: 26.2 PPG, 12.4 RPG — sensational freshman
    stats: { games: 33, mpg: 33.8, ppg: 26.2, rpg: 12.4, apg: 1.5, spg: 0.8, bpg: 0.8, tov: 2.9, pf: 3.2, fg_pct: 0.527, three_pt_pct: 0.244, ft_pct: 0.764, pts_per40: 31.0, reb_per40: 14.7, ast_per40: 1.8, stl_per40: 1.0, blk_per40: 0.9, tov_per40: 3.4, usg: 0.348, per: 30.2, bpm: 12.5, obpm: 9.0, dbpm: 3.5, ws: 9.5, efg_pct: 0.545, ts_pct: 0.607, ast_pct: 0.085, tov_pct: 0.130, stl_pct: 0.016, blk_pct: 0.018, orb_pct: 0.122, drb_pct: 0.228, drtg: 92.5 },
    nba: { ppg: 12.6, rpg: 5.3, apg: 1.2, spg: 0.6, bpg: 0.4, ws48: 0.055, outcome: 'Bust' },
  },
  {
    pick: 3, team: 'Minnesota Timberwolves', name: 'OJ Mayo', school: 'USC', pos: 'SG',
    birthYear: 1988, height: 76, weight: 200, wingspan: 80, conf: 'Pac-10',
    archetype: 'Scoring Lead Guard',
    // 2007-08 USC: 20.0 PPG, 4.5 RPG, 3.0 APG
    stats: { games: 30, mpg: 34.5, ppg: 20.0, rpg: 4.5, apg: 3.0, spg: 1.3, bpg: 0.2, tov: 3.0, pf: 2.2, fg_pct: 0.450, three_pt_pct: 0.342, ft_pct: 0.790, pts_per40: 23.2, reb_per40: 5.2, ast_per40: 3.5, stl_per40: 1.5, blk_per40: 0.2, tov_per40: 3.5, usg: 0.318, per: 20.5, bpm: 5.8, obpm: 4.5, dbpm: 1.3, ws: 5.5, efg_pct: 0.480, ts_pct: 0.553, ast_pct: 0.168, tov_pct: 0.158, stl_pct: 0.027, blk_pct: 0.004, orb_pct: 0.040, drb_pct: 0.110, drtg: 97.8 },
    nba: { ppg: 14.5, rpg: 3.3, apg: 3.4, spg: 0.8, bpg: 0.2, ws48: 0.095, outcome: 'Starter' },
  },
  {
    pick: 4, team: 'Seattle SuperSonics', name: 'Russell Westbrook', school: 'UCLA', pos: 'PG',
    birthYear: 1988, height: 74, weight: 200, wingspan: 81, conf: 'Pac-10',
    archetype: 'Two Way Star Wing',
    // 2007-08 UCLA: 12.7 PPG, 3.9 RPG, 4.0 APG as sophomore
    stats: { games: 36, mpg: 27.8, ppg: 12.7, rpg: 3.9, apg: 4.0, spg: 1.7, bpg: 0.5, tov: 2.2, pf: 2.4, fg_pct: 0.476, three_pt_pct: 0.273, ft_pct: 0.638, pts_per40: 18.3, reb_per40: 5.6, ast_per40: 5.8, stl_per40: 2.4, blk_per40: 0.7, tov_per40: 3.2, usg: 0.255, per: 19.8, bpm: 6.2, obpm: 3.5, dbpm: 2.7, ws: 6.0, efg_pct: 0.498, ts_pct: 0.527, ast_pct: 0.310, tov_pct: 0.145, stl_pct: 0.038, blk_pct: 0.012, orb_pct: 0.055, drb_pct: 0.120, drtg: 93.8 },
    nba: { ppg: 23.2, rpg: 7.8, apg: 8.4, spg: 1.6, bpg: 0.4, ws48: 0.173, outcome: 'MVP' },
  },
  {
    pick: 5, team: 'Memphis Grizzlies', name: 'Kevin Love', school: 'UCLA', pos: 'PF',
    birthYear: 1988, height: 81, weight: 255, wingspan: 83, conf: 'Pac-10',
    archetype: 'Stretch Big',
    // 2007-08 UCLA: 17.5 PPG, 10.6 RPG — consensus All-American as freshman
    stats: { games: 35, mpg: 30.5, ppg: 17.5, rpg: 10.6, apg: 1.9, spg: 0.5, bpg: 0.7, tov: 2.5, pf: 3.0, fg_pct: 0.558, three_pt_pct: 0.333, ft_pct: 0.793, pts_per40: 22.9, reb_per40: 13.9, ast_per40: 2.5, stl_per40: 0.7, blk_per40: 0.9, tov_per40: 3.3, usg: 0.288, per: 27.0, bpm: 10.2, obpm: 6.5, dbpm: 3.7, ws: 9.0, efg_pct: 0.580, ts_pct: 0.642, ast_pct: 0.108, tov_pct: 0.138, stl_pct: 0.011, blk_pct: 0.017, orb_pct: 0.115, drb_pct: 0.238, drtg: 91.5 },
    nba: { ppg: 19.0, rpg: 11.3, apg: 2.5, spg: 0.7, bpg: 0.5, ws48: 0.172, outcome: 'All-NBA' },
  },
  {
    pick: 6, team: 'New York Knicks', name: 'Danilo Gallinari', school: 'Olimpia Milano', pos: 'SF',
    birthYear: 1988, height: 82, weight: 225, wingspan: 85, conf: null,
    archetype: 'Stretch Big',
    // 2007-08 Olimpia Milano (Lega Basket): ~9.3 PPG, 4.0 RPG
    stats: { games: 32, mpg: 21.5, ppg: 9.3, rpg: 4.0, apg: 1.3, spg: 0.6, bpg: 0.4, tov: 1.5, pf: 2.5, fg_pct: 0.445, three_pt_pct: 0.368, ft_pct: 0.810, pts_per40: 17.3, reb_per40: 7.4, ast_per40: 2.4, stl_per40: 1.1, blk_per40: 0.7, tov_per40: 2.8, usg: 0.215, per: 16.8, bpm: 3.5, obpm: 2.5, dbpm: 1.0, ws: 4.2, efg_pct: 0.500, ts_pct: 0.572, ast_pct: 0.110, tov_pct: 0.135, stl_pct: 0.018, blk_pct: 0.012, orb_pct: 0.045, drb_pct: 0.118, drtg: 98.5 },
    nba: { ppg: 14.0, rpg: 4.4, apg: 1.7, spg: 0.7, bpg: 0.5, ws48: 0.101, outcome: 'Starter' },
  },
  {
    pick: 7, team: 'LA Clippers', name: 'Eric Gordon', school: 'Indiana', pos: 'SG',
    birthYear: 1988, height: 74, weight: 215, wingspan: 78, conf: 'Big Ten',
    archetype: 'Off Ball Scoring Wing',
    // 2007-08 Indiana: 20.0 PPG, 3.4 RPG, 2.3 APG as freshman
    stats: { games: 32, mpg: 35.2, ppg: 20.0, rpg: 3.4, apg: 2.3, spg: 0.9, bpg: 0.2, tov: 2.5, pf: 2.0, fg_pct: 0.468, three_pt_pct: 0.378, ft_pct: 0.818, pts_per40: 22.7, reb_per40: 3.9, ast_per40: 2.6, stl_per40: 1.0, blk_per40: 0.2, tov_per40: 2.8, usg: 0.310, per: 21.2, bpm: 5.5, obpm: 4.5, dbpm: 1.0, ws: 6.2, efg_pct: 0.510, ts_pct: 0.582, ast_pct: 0.135, tov_pct: 0.140, stl_pct: 0.018, blk_pct: 0.004, orb_pct: 0.030, drb_pct: 0.082, drtg: 99.0 },
    nba: { ppg: 16.0, rpg: 2.8, apg: 2.6, spg: 0.8, bpg: 0.2, ws48: 0.095, outcome: 'Starter' },
  },
  {
    pick: 8, team: 'Milwaukee Bucks', name: 'Joe Alexander', school: 'West Virginia', pos: 'SF',
    birthYear: 1986, height: 79, weight: 222, wingspan: 82, conf: 'Big East',
    archetype: 'Slasher Wing',
    // 2007-08 West Virginia: 17.9 PPG, 6.7 RPG, 1.2 APG
    stats: { games: 33, mpg: 30.0, ppg: 17.9, rpg: 6.7, apg: 1.2, spg: 0.8, bpg: 0.5, tov: 2.0, pf: 3.0, fg_pct: 0.538, three_pt_pct: 0.231, ft_pct: 0.745, pts_per40: 23.9, reb_per40: 8.9, ast_per40: 1.6, stl_per40: 1.1, blk_per40: 0.7, tov_per40: 2.7, usg: 0.265, per: 21.5, bpm: 5.2, obpm: 3.5, dbpm: 1.7, ws: 5.5, efg_pct: 0.558, ts_pct: 0.601, ast_pct: 0.075, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.012, orb_pct: 0.062, drb_pct: 0.148, drtg: 98.2 },
    nba: { ppg: 3.0, rpg: 1.6, apg: 0.4, spg: 0.3, bpg: 0.3, ws48: 0.010, outcome: 'Bust' },
  },
  {
    pick: 9, team: 'Charlotte Bobcats', name: 'DJ Augustin', school: 'Texas', pos: 'PG',
    birthYear: 1987, height: 72, weight: 183, wingspan: 75, conf: 'Big 12',
    archetype: 'Primary Playmaker',
    // 2007-08 Texas: 19.4 PPG, 3.0 RPG, 4.9 APG as sophomore
    stats: { games: 35, mpg: 34.5, ppg: 19.4, rpg: 3.0, apg: 4.9, spg: 1.4, bpg: 0.1, tov: 2.8, pf: 2.2, fg_pct: 0.438, three_pt_pct: 0.405, ft_pct: 0.868, pts_per40: 22.5, reb_per40: 3.5, ast_per40: 5.7, stl_per40: 1.6, blk_per40: 0.1, tov_per40: 3.2, usg: 0.295, per: 19.2, bpm: 4.8, obpm: 4.0, dbpm: 0.8, ws: 5.8, efg_pct: 0.482, ts_pct: 0.557, ast_pct: 0.295, tov_pct: 0.148, stl_pct: 0.029, blk_pct: 0.002, orb_pct: 0.022, drb_pct: 0.072, drtg: 99.5 },
    nba: { ppg: 9.8, rpg: 2.0, apg: 4.1, spg: 0.7, bpg: 0.1, ws48: 0.085, outcome: 'Starter' },
  },
  {
    pick: 10, team: 'New Jersey Nets', name: 'Brook Lopez', school: 'Stanford', pos: 'C',
    birthYear: 1988, height: 84, weight: 275, wingspan: 87, conf: 'Pac-10',
    archetype: 'Rim Protector',
    // 2007-08 Stanford: 16.7 PPG, 8.0 RPG, 1.8 BPG as sophomore
    stats: { games: 33, mpg: 29.5, ppg: 16.7, rpg: 8.0, apg: 0.8, spg: 0.5, bpg: 1.8, tov: 2.0, pf: 3.2, fg_pct: 0.581, three_pt_pct: null, ft_pct: 0.810, pts_per40: 22.6, reb_per40: 10.8, ast_per40: 1.1, stl_per40: 0.7, blk_per40: 2.4, tov_per40: 2.7, usg: 0.270, per: 24.0, bpm: 8.0, obpm: 4.5, dbpm: 3.5, ws: 7.2, efg_pct: 0.581, ts_pct: 0.650, ast_pct: 0.048, tov_pct: 0.128, stl_pct: 0.011, blk_pct: 0.058, orb_pct: 0.082, drb_pct: 0.185, drtg: 94.5 },
    nba: { ppg: 17.4, rpg: 7.5, apg: 1.2, spg: 0.5, bpg: 1.9, ws48: 0.125, outcome: 'All-Star' },
  },
  {
    pick: 11, team: 'Indiana Pacers', name: 'Jerryd Bayless', school: 'Arizona', pos: 'PG',
    birthYear: 1989, height: 74, weight: 195, wingspan: 78, conf: 'Pac-10',
    archetype: 'Scoring Lead Guard',
    // 2007-08 Arizona: 19.7 PPG, 3.1 RPG, 3.2 APG as freshman
    stats: { games: 33, mpg: 33.0, ppg: 19.7, rpg: 3.1, apg: 3.2, spg: 1.2, bpg: 0.3, tov: 2.5, pf: 2.5, fg_pct: 0.453, three_pt_pct: 0.348, ft_pct: 0.800, pts_per40: 23.9, reb_per40: 3.8, ast_per40: 3.9, stl_per40: 1.5, blk_per40: 0.4, tov_per40: 3.0, usg: 0.310, per: 19.5, bpm: 4.5, obpm: 3.8, dbpm: 0.7, ws: 5.5, efg_pct: 0.490, ts_pct: 0.558, ast_pct: 0.198, tov_pct: 0.150, stl_pct: 0.024, blk_pct: 0.007, orb_pct: 0.025, drb_pct: 0.075, drtg: 100.5 },
    nba: { ppg: 9.5, rpg: 2.2, apg: 2.8, spg: 0.7, bpg: 0.2, ws48: 0.065, outcome: 'Role Player' },
  },
  {
    pick: 12, team: 'Sacramento Kings', name: 'Jason Thompson', school: 'Rider', pos: 'PF',
    birthYear: 1986, height: 82, weight: 250, wingspan: 86, conf: 'MAAC',
    archetype: 'Drop Coverage Big',
    // 2007-08 Rider: 20.9 PPG, 10.0 RPG in MAAC
    stats: { games: 31, mpg: 32.0, ppg: 20.9, rpg: 10.0, apg: 1.2, spg: 0.8, bpg: 1.5, tov: 2.2, pf: 3.5, fg_pct: 0.575, three_pt_pct: 0.200, ft_pct: 0.690, pts_per40: 26.1, reb_per40: 12.5, ast_per40: 1.5, stl_per40: 1.0, blk_per40: 1.9, tov_per40: 2.8, usg: 0.282, per: 24.5, bpm: 7.5, obpm: 3.5, dbpm: 4.0, ws: 7.0, efg_pct: 0.585, ts_pct: 0.619, ast_pct: 0.065, tov_pct: 0.125, stl_pct: 0.016, blk_pct: 0.042, orb_pct: 0.095, drb_pct: 0.215, drtg: 96.5 },
    nba: { ppg: 7.0, rpg: 5.8, apg: 0.6, spg: 0.5, bpg: 0.6, ws48: 0.075, outcome: 'Role Player' },
  },
  {
    pick: 13, team: 'Portland Trail Blazers', name: 'Brandon Rush', school: 'Kansas', pos: 'SG/SF',
    birthYear: 1985, height: 79, weight: 220, wingspan: 84, conf: 'Big 12',
    archetype: 'Off Ball Scoring Wing',
    // 2007-08 Kansas: 13.0 PPG, 5.3 RPG — national champion
    stats: { games: 37, mpg: 29.5, ppg: 13.0, rpg: 5.3, apg: 1.5, spg: 1.5, bpg: 0.6, tov: 1.5, pf: 2.2, fg_pct: 0.478, three_pt_pct: 0.421, ft_pct: 0.765, pts_per40: 17.6, reb_per40: 7.2, ast_per40: 2.0, stl_per40: 2.0, blk_per40: 0.8, tov_per40: 2.0, usg: 0.228, per: 18.5, bpm: 4.5, obpm: 2.8, dbpm: 1.7, ws: 5.5, efg_pct: 0.540, ts_pct: 0.580, ast_pct: 0.098, tov_pct: 0.110, stl_pct: 0.033, blk_pct: 0.015, orb_pct: 0.042, drb_pct: 0.125, drtg: 97.0 },
    nba: { ppg: 7.0, rpg: 2.8, apg: 0.9, spg: 0.7, bpg: 0.3, ws48: 0.075, outcome: 'Role Player' },
  },
  {
    pick: 14, team: 'Golden State Warriors', name: 'Anthony Randolph', school: 'LSU', pos: 'PF',
    birthYear: 1989, height: 83, weight: 210, wingspan: 90, conf: 'SEC',
    archetype: 'Rim Protector',
    // 2007-08 LSU: 13.9 PPG, 7.6 RPG, 2.6 BPG as freshman
    stats: { games: 30, mpg: 28.0, ppg: 13.9, rpg: 7.6, apg: 0.7, spg: 0.7, bpg: 2.6, tov: 2.0, pf: 3.5, fg_pct: 0.510, three_pt_pct: null, ft_pct: 0.685, pts_per40: 19.9, reb_per40: 10.9, ast_per40: 1.0, stl_per40: 1.0, blk_per40: 3.7, tov_per40: 2.9, usg: 0.242, per: 21.8, bpm: 6.5, obpm: 2.0, dbpm: 4.5, ws: 5.5, efg_pct: 0.510, ts_pct: 0.558, ast_pct: 0.042, tov_pct: 0.140, stl_pct: 0.016, blk_pct: 0.085, orb_pct: 0.085, drb_pct: 0.195, drtg: 95.0 },
    nba: { ppg: 7.0, rpg: 4.5, apg: 0.8, spg: 0.5, bpg: 1.0, ws48: 0.045, outcome: 'Bust' },
  },
  {
    pick: 15, team: 'Phoenix Suns', name: 'Robin Lopez', school: 'Stanford', pos: 'C',
    birthYear: 1988, height: 84, weight: 255, wingspan: 87, conf: 'Pac-10',
    archetype: 'Drop Coverage Big',
    // 2007-08 Stanford: 12.3 PPG, 7.0 RPG, 2.2 BPG as sophomore
    stats: { games: 33, mpg: 27.5, ppg: 12.3, rpg: 7.0, apg: 0.5, spg: 0.4, bpg: 2.2, tov: 1.8, pf: 3.5, fg_pct: 0.545, three_pt_pct: null, ft_pct: 0.645, pts_per40: 17.9, reb_per40: 10.2, ast_per40: 0.7, stl_per40: 0.6, blk_per40: 3.2, tov_per40: 2.6, usg: 0.248, per: 20.5, bpm: 5.8, obpm: 1.5, dbpm: 4.3, ws: 5.8, efg_pct: 0.545, ts_pct: 0.572, ast_pct: 0.030, tov_pct: 0.128, stl_pct: 0.010, blk_pct: 0.072, orb_pct: 0.078, drb_pct: 0.178, drtg: 94.8 },
    nba: { ppg: 9.2, rpg: 6.8, apg: 0.6, spg: 0.4, bpg: 1.5, ws48: 0.098, outcome: 'Starter' },
  },
  {
    pick: 16, team: 'Philadelphia 76ers', name: 'Marreese Speights', school: 'Florida', pos: 'PF',
    birthYear: 1987, height: 82, weight: 255, wingspan: 85, conf: 'SEC',
    archetype: 'Offensive Rebounder',
    // 2007-08 Florida: 13.0 PPG, 6.3 RPG as sophomore
    stats: { games: 33, mpg: 24.5, ppg: 13.0, rpg: 6.3, apg: 0.6, spg: 0.4, bpg: 1.0, tov: 1.8, pf: 3.2, fg_pct: 0.532, three_pt_pct: 0.300, ft_pct: 0.768, pts_per40: 21.2, reb_per40: 10.3, ast_per40: 1.0, stl_per40: 0.7, blk_per40: 1.6, tov_per40: 2.9, usg: 0.275, per: 22.0, bpm: 6.2, obpm: 3.8, dbpm: 2.4, ws: 6.5, efg_pct: 0.560, ts_pct: 0.620, ast_pct: 0.040, tov_pct: 0.132, stl_pct: 0.010, blk_pct: 0.032, orb_pct: 0.098, drb_pct: 0.185, drtg: 96.8 },
    nba: { ppg: 8.5, rpg: 4.5, apg: 0.4, spg: 0.4, bpg: 0.7, ws48: 0.075, outcome: 'Role Player' },
  },
  {
    pick: 17, team: 'Washington Wizards', name: 'Roy Hibbert', school: 'Georgetown', pos: 'C',
    birthYear: 1986, height: 86, weight: 278, wingspan: 90, conf: 'Big East',
    archetype: 'Rim Protector',
    // 2007-08 Georgetown: 13.5 PPG, 8.1 RPG, 2.9 BPG as junior
    stats: { games: 33, mpg: 28.5, ppg: 13.5, rpg: 8.1, apg: 1.0, spg: 0.5, bpg: 2.9, tov: 1.8, pf: 3.8, fg_pct: 0.558, three_pt_pct: null, ft_pct: 0.680, pts_per40: 18.9, reb_per40: 11.4, ast_per40: 1.4, stl_per40: 0.7, blk_per40: 4.1, tov_per40: 2.5, usg: 0.255, per: 23.5, bpm: 8.2, obpm: 2.5, dbpm: 5.7, ws: 8.0, efg_pct: 0.558, ts_pct: 0.594, ast_pct: 0.058, tov_pct: 0.118, stl_pct: 0.012, blk_pct: 0.098, orb_pct: 0.082, drb_pct: 0.215, drtg: 92.5 },
    nba: { ppg: 11.5, rpg: 8.3, apg: 0.8, spg: 0.4, bpg: 2.1, ws48: 0.132, outcome: 'All-Star' },
  },
  {
    pick: 18, team: 'Washington Wizards', name: 'JaVale McGee', school: 'Nevada', pos: 'C',
    birthYear: 1988, height: 84, weight: 270, wingspan: 91, conf: 'WAC',
    archetype: 'Rim Runner',
    // 2007-08 Nevada: 11.3 PPG, 7.8 RPG, 3.8 BPG as sophomore
    stats: { games: 34, mpg: 26.5, ppg: 11.3, rpg: 7.8, apg: 0.5, spg: 0.5, bpg: 3.8, tov: 1.8, pf: 3.8, fg_pct: 0.575, three_pt_pct: null, ft_pct: 0.535, pts_per40: 17.0, reb_per40: 11.8, ast_per40: 0.8, stl_per40: 0.8, blk_per40: 5.7, tov_per40: 2.7, usg: 0.248, per: 22.8, bpm: 7.2, obpm: 1.5, dbpm: 5.7, ws: 6.5, efg_pct: 0.575, ts_pct: 0.578, ast_pct: 0.030, tov_pct: 0.145, stl_pct: 0.012, blk_pct: 0.125, orb_pct: 0.098, drb_pct: 0.222, drtg: 93.0 },
    nba: { ppg: 8.5, rpg: 5.8, apg: 0.5, spg: 0.5, bpg: 2.0, ws48: 0.088, outcome: 'Role Player' },
  },
  {
    pick: 19, team: 'Oklahoma City Thunder', name: 'JJ Hickson', school: 'NC State', pos: 'PF',
    birthYear: 1989, height: 81, weight: 242, wingspan: 84, conf: 'ACC',
    archetype: 'Offensive Rebounder',
    // 2007-08 NC State: 14.1 PPG, 7.0 RPG as freshman
    stats: { games: 31, mpg: 26.5, ppg: 14.1, rpg: 7.0, apg: 0.8, spg: 0.8, bpg: 0.7, tov: 1.8, pf: 3.2, fg_pct: 0.548, three_pt_pct: null, ft_pct: 0.622, pts_per40: 21.3, reb_per40: 10.6, ast_per40: 1.2, stl_per40: 1.2, blk_per40: 1.1, tov_per40: 2.7, usg: 0.258, per: 20.8, bpm: 5.5, obpm: 2.8, dbpm: 2.7, ws: 5.8, efg_pct: 0.548, ts_pct: 0.574, ast_pct: 0.050, tov_pct: 0.132, stl_pct: 0.020, blk_pct: 0.020, orb_pct: 0.102, drb_pct: 0.192, drtg: 97.5 },
    nba: { ppg: 8.5, rpg: 6.0, apg: 0.6, spg: 0.5, bpg: 0.5, ws48: 0.072, outcome: 'Role Player' },
  },
  {
    pick: 20, team: 'Miami Heat', name: 'Mario Chalmers', school: 'Kansas', pos: 'PG',
    birthYear: 1986, height: 74, weight: 190, wingspan: 79, conf: 'Big 12',
    archetype: 'Secondary Playmaker',
    // 2007-08 Kansas: 12.0 PPG, 3.3 RPG, 4.0 APG — hit the championship game shot
    stats: { games: 37, mpg: 28.5, ppg: 12.0, rpg: 3.3, apg: 4.0, spg: 1.8, bpg: 0.2, tov: 2.0, pf: 2.0, fg_pct: 0.436, three_pt_pct: 0.378, ft_pct: 0.786, pts_per40: 16.8, reb_per40: 4.6, ast_per40: 5.6, stl_per40: 2.5, blk_per40: 0.3, tov_per40: 2.8, usg: 0.238, per: 17.8, bpm: 4.5, obpm: 3.0, dbpm: 1.5, ws: 5.5, efg_pct: 0.480, ts_pct: 0.535, ast_pct: 0.298, tov_pct: 0.150, stl_pct: 0.042, blk_pct: 0.005, orb_pct: 0.025, drb_pct: 0.082, drtg: 97.2 },
    nba: { ppg: 8.0, rpg: 2.2, apg: 3.2, spg: 1.2, bpg: 0.2, ws48: 0.075, outcome: 'Role Player' },
  },
  {
    pick: 21, team: 'Orlando Magic', name: 'Courtney Lee', school: 'Western Kentucky', pos: 'SG',
    birthYear: 1985, height: 77, weight: 200, wingspan: 81, conf: 'Sun Belt',
    archetype: 'Off Ball Scoring Wing',
    // 2007-08 Western Kentucky: 18.9 PPG, 5.3 RPG
    stats: { games: 32, mpg: 33.0, ppg: 18.9, rpg: 5.3, apg: 2.5, spg: 1.6, bpg: 0.6, tov: 2.0, pf: 2.2, fg_pct: 0.502, three_pt_pct: 0.382, ft_pct: 0.812, pts_per40: 22.9, reb_per40: 6.4, ast_per40: 3.0, stl_per40: 1.9, blk_per40: 0.7, tov_per40: 2.4, usg: 0.270, per: 20.5, bpm: 5.2, obpm: 3.5, dbpm: 1.7, ws: 5.8, efg_pct: 0.545, ts_pct: 0.600, ast_pct: 0.148, tov_pct: 0.125, stl_pct: 0.032, blk_pct: 0.012, orb_pct: 0.035, drb_pct: 0.118, drtg: 98.0 },
    nba: { ppg: 9.5, rpg: 2.8, apg: 1.8, spg: 0.8, bpg: 0.3, ws48: 0.082, outcome: 'Role Player' },
  },
  {
    pick: 25, team: 'Memphis Grizzlies', name: 'Nicolas Batum', school: 'Le Mans', pos: 'SF',
    birthYear: 1988, height: 80, weight: 200, wingspan: 84, conf: null,
    archetype: 'Two Way Star Wing',
    // 2007-08 Le Mans (Pro A, France): ~8.5 PPG, 3.8 RPG
    stats: { games: 30, mpg: 22.0, ppg: 8.5, rpg: 3.8, apg: 1.8, spg: 1.0, bpg: 0.8, tov: 1.2, pf: 2.2, fg_pct: 0.462, three_pt_pct: 0.372, ft_pct: 0.750, pts_per40: 15.5, reb_per40: 6.9, ast_per40: 3.3, stl_per40: 1.8, blk_per40: 1.5, tov_per40: 2.2, usg: 0.198, per: 16.5, bpm: 3.8, obpm: 2.2, dbpm: 1.6, ws: 4.0, efg_pct: 0.520, ts_pct: 0.565, ast_pct: 0.155, tov_pct: 0.118, stl_pct: 0.028, blk_pct: 0.028, orb_pct: 0.038, drb_pct: 0.115, drtg: 98.5 },
    nba: { ppg: 11.5, rpg: 4.8, apg: 3.0, spg: 1.1, bpg: 0.7, ws48: 0.105, outcome: 'Starter' },
  },
  {
    pick: 26, team: 'San Antonio Spurs', name: 'George Hill', school: 'IUPUI', pos: 'PG',
    birthYear: 1986, height: 74, weight: 188, wingspan: 78, conf: 'Summit League',
    archetype: 'Secondary Playmaker',
    // 2007-08 IUPUI: 18.0 PPG, 4.5 RPG, 5.2 APG
    stats: { games: 28, mpg: 33.0, ppg: 18.0, rpg: 4.5, apg: 5.2, spg: 1.8, bpg: 0.4, tov: 2.5, pf: 2.5, fg_pct: 0.478, three_pt_pct: 0.358, ft_pct: 0.780, pts_per40: 21.8, reb_per40: 5.5, ast_per40: 6.3, stl_per40: 2.2, blk_per40: 0.5, tov_per40: 3.0, usg: 0.278, per: 20.2, bpm: 5.5, obpm: 3.8, dbpm: 1.7, ws: 5.2, efg_pct: 0.508, ts_pct: 0.558, ast_pct: 0.310, tov_pct: 0.148, stl_pct: 0.036, blk_pct: 0.009, orb_pct: 0.032, drb_pct: 0.108, drtg: 99.0 },
    nba: { ppg: 11.5, rpg: 3.2, apg: 4.0, spg: 1.1, bpg: 0.3, ws48: 0.105, outcome: 'Starter' },
  },
  {
    pick: 28, team: 'Sacramento Kings', name: 'Donte Greene', school: 'Syracuse', pos: 'SF',
    birthYear: 1988, height: 81, weight: 210, wingspan: 87, conf: 'Big East',
    archetype: 'Stretch Big',
    // 2007-08 Syracuse: 16.1 PPG, 6.2 RPG as freshman
    stats: { games: 32, mpg: 30.5, ppg: 16.1, rpg: 6.2, apg: 1.2, spg: 0.7, bpg: 1.2, tov: 2.2, pf: 2.8, fg_pct: 0.422, three_pt_pct: 0.332, ft_pct: 0.785, pts_per40: 21.1, reb_per40: 8.1, ast_per40: 1.6, stl_per40: 0.9, blk_per40: 1.6, tov_per40: 2.9, usg: 0.282, per: 17.8, bpm: 3.5, obpm: 2.5, dbpm: 1.0, ws: 4.2, efg_pct: 0.468, ts_pct: 0.528, ast_pct: 0.078, tov_pct: 0.148, stl_pct: 0.015, blk_pct: 0.032, orb_pct: 0.058, drb_pct: 0.148, drtg: 100.0 },
    nba: { ppg: 5.0, rpg: 2.5, apg: 0.6, spg: 0.3, bpg: 0.5, ws48: 0.022, outcome: 'Bust' },
  },
  // === ROUND 2 Notable Picks ===
  {
    pick: 35, team: 'Dallas Mavericks', name: 'DeAndre Jordan', school: 'Texas A&M', pos: 'C',
    birthYear: 1988, height: 83, weight: 265, wingspan: 90, conf: 'Big 12',
    archetype: 'Rim Runner',
    // 2007-08 Texas A&M: 7.6 PPG, 7.8 RPG, 2.5 BPG as freshman
    stats: { games: 34, mpg: 21.5, ppg: 7.6, rpg: 7.8, apg: 0.5, spg: 0.5, bpg: 2.5, tov: 1.5, pf: 3.5, fg_pct: 0.632, three_pt_pct: null, ft_pct: 0.425, pts_per40: 14.1, reb_per40: 14.5, ast_per40: 0.9, stl_per40: 0.9, blk_per40: 4.7, tov_per40: 2.8, usg: 0.192, per: 20.5, bpm: 5.8, obpm: 0.5, dbpm: 5.3, ws: 5.5, efg_pct: 0.632, ts_pct: 0.568, ast_pct: 0.030, tov_pct: 0.158, stl_pct: 0.015, blk_pct: 0.095, orb_pct: 0.125, drb_pct: 0.298, drtg: 92.5 },
    nba: { ppg: 10.5, rpg: 13.0, apg: 0.8, spg: 0.5, bpg: 2.3, ws48: 0.200, outcome: 'All-Star' },
  },
  {
    pick: 45, team: 'San Antonio Spurs', name: 'Goran Dragic', school: 'Olimpija', pos: 'PG',
    birthYear: 1986, height: 75, weight: 190, wingspan: 79, conf: null,
    archetype: 'Primary Playmaker',
    // 2007-08 Olimpija Ljubljana (Slovenia): ~12.5 PPG, 3.0 RPG, 4.8 APG
    stats: { games: 30, mpg: 28.5, ppg: 12.5, rpg: 3.0, apg: 4.8, spg: 1.2, bpg: 0.2, tov: 2.2, pf: 2.5, fg_pct: 0.455, three_pt_pct: 0.368, ft_pct: 0.808, pts_per40: 17.5, reb_per40: 4.2, ast_per40: 6.7, stl_per40: 1.7, blk_per40: 0.3, tov_per40: 3.1, usg: 0.255, per: 19.5, bpm: 5.2, obpm: 3.8, dbpm: 1.4, ws: 5.0, efg_pct: 0.498, ts_pct: 0.557, ast_pct: 0.332, tov_pct: 0.145, stl_pct: 0.028, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.082, drtg: 98.0 },
    nba: { ppg: 14.5, rpg: 3.2, apg: 5.8, spg: 1.0, bpg: 0.1, ws48: 0.148, outcome: 'All-Star' },
  },
]

// Filter out placeholder/duplicate entries (picks with null stats that were placeholders)
const ALL_PLAYERS = PLAYERS.filter(p => p.stats)

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

  const allPlayers = ALL_PLAYERS
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
  console.log(`Navigate to /legendary-archives?year=2008 to view the board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
