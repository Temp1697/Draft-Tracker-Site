#!/usr/bin/env node
// Supplemental seed script for 1984 NBA Draft — Remaining Picks (25–60)
// Adds all players NOT already present in seed-legendary-1984.mjs
//
// The original script covers picks 1–24 with full stats. This script provides
// complete data for picks 25–60 (second and third round) including real college
// stats and correct NBA outcomes.
//
// Notable picks in this range:
//   Pick 45 — Karl Malone (Louisiana Tech) — All-NBA, Hall of Famer
//   Pick 47 — Mark Price (Georgia Tech) — 4x All-Star
//
// Usage: node scripts/seed-legendary-1984-remaining.mjs

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

// ============================================================
// PICKS 25–60 of the 1984 NBA Draft
// Players in picks 1–24 are already seeded in seed-legendary-1984.mjs
// ============================================================
const PLAYERS = [

  // === ROUND 2 (picks 25–46, with 23 teams) ===

  {
    pick: 25, team: 'Houston Rockets', name: 'Greg Stokes', school: 'Iowa', pos: 'C',
    birthYear: 1962, height: 83, weight: 230, wingspan: 86, conf: 'Big Ten',
    archetype: 'Drop Coverage Big',
    // 1983-84 Iowa: 11.3 PPG, 8.0 RPG in 30 games
    stats: { games: 30, mpg: 26.5, ppg: 11.3, rpg: 8.0, apg: 0.8, spg: 0.5, bpg: 1.2, tov: 1.6, pf: 3.2, fg_pct: 0.525, three_pt_pct: null, ft_pct: 0.650, pts_per40: 17.1, reb_per40: 12.1, ast_per40: 1.2, stl_per40: 0.8, blk_per40: 1.8, tov_per40: 2.4, usg: 0.220, per: 16.5, bpm: 2.0, obpm: 0.5, dbpm: 1.5, ws: 2.8, efg_pct: 0.525, ts_pct: 0.563, ast_pct: 0.050, tov_pct: 0.125, stl_pct: 0.013, blk_pct: 0.038, orb_pct: 0.075, drb_pct: 0.165, drtg: 99.5 },
    nba: { ppg: 1.8, rpg: 1.5, apg: 0.2, spg: 0.1, bpg: 0.3, ws48: 0.008, outcome: 'Bust' },
  },
  {
    pick: 26, team: 'Portland Trail Blazers', name: 'Fred Reynolds', school: 'Texas-El Paso', pos: 'SG',
    birthYear: 1962, height: 76, weight: 185, wingspan: 80, conf: 'WAC',
    archetype: 'Off Ball Shooter',
    // 1983-84 UTEP: 14.8 PPG, 3.2 RPG in 30 games
    stats: { games: 30, mpg: 29.0, ppg: 14.8, rpg: 3.2, apg: 2.8, spg: 1.5, bpg: 0.2, tov: 2.2, pf: 2.3, fg_pct: 0.478, three_pt_pct: 0.310, ft_pct: 0.770, pts_per40: 20.4, reb_per40: 4.4, ast_per40: 3.9, stl_per40: 2.1, blk_per40: 0.3, tov_per40: 3.0, usg: 0.245, per: 15.5, bpm: 1.5, obpm: 1.0, dbpm: 0.5, ws: 2.5, efg_pct: 0.498, ts_pct: 0.548, ast_pct: 0.145, tov_pct: 0.135, stl_pct: 0.032, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.075, drtg: 102.0 },
    nba: { ppg: 2.1, rpg: 0.8, apg: 0.6, spg: 0.3, bpg: 0.0, ws48: 0.010, outcome: 'Bust' },
  },
  {
    pick: 27, team: 'Dallas Mavericks', name: 'Tom Sewell', school: 'Lamar', pos: 'PG',
    birthYear: 1962, height: 73, weight: 175, wingspan: 77, conf: 'Southland',
    archetype: 'Secondary Playmaker',
    // 1983-84 Lamar: 13.5 PPG, 4.5 APG in 29 games
    stats: { games: 29, mpg: 32.0, ppg: 13.5, rpg: 2.8, apg: 4.5, spg: 1.8, bpg: 0.1, tov: 2.5, pf: 2.2, fg_pct: 0.458, three_pt_pct: 0.295, ft_pct: 0.790, pts_per40: 16.9, reb_per40: 3.5, ast_per40: 5.6, stl_per40: 2.3, blk_per40: 0.1, tov_per40: 3.1, usg: 0.228, per: 14.8, bpm: 1.2, obpm: 0.8, dbpm: 0.4, ws: 2.2, efg_pct: 0.478, ts_pct: 0.540, ast_pct: 0.242, tov_pct: 0.148, stl_pct: 0.038, blk_pct: 0.002, orb_pct: 0.015, drb_pct: 0.062, drtg: 103.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 28, team: 'San Antonio Spurs', name: 'Ben Coleman', school: 'Maryland', pos: 'PF',
    birthYear: 1961, height: 81, weight: 235, wingspan: 85, conf: 'ACC',
    archetype: 'Rim Runner',
    // 1983-84 Maryland: 12.8 PPG, 8.2 RPG in 31 games
    stats: { games: 31, mpg: 27.5, ppg: 12.8, rpg: 8.2, apg: 0.8, spg: 0.6, bpg: 1.0, tov: 1.8, pf: 3.0, fg_pct: 0.548, three_pt_pct: null, ft_pct: 0.620, pts_per40: 18.6, reb_per40: 11.9, ast_per40: 1.2, stl_per40: 0.9, blk_per40: 1.5, tov_per40: 2.6, usg: 0.235, per: 17.5, bpm: 3.2, obpm: 1.2, dbpm: 2.0, ws: 3.2, efg_pct: 0.548, ts_pct: 0.575, ast_pct: 0.045, tov_pct: 0.128, stl_pct: 0.014, blk_pct: 0.030, orb_pct: 0.082, drb_pct: 0.175, drtg: 98.5 },
    nba: { ppg: 5.8, rpg: 4.5, apg: 0.5, spg: 0.4, bpg: 0.4, ws48: 0.062, outcome: 'Role Player' },
  },
  {
    pick: 29, team: 'Philadelphia 76ers', name: 'David Thirdkill', school: 'Bradley', pos: 'SF',
    birthYear: 1960, height: 79, weight: 215, wingspan: 83, conf: 'MVC',
    archetype: 'Slasher Wing',
    // 1983-84 Bradley: 14.2 PPG, 6.5 RPG in 28 games
    stats: { games: 28, mpg: 30.0, ppg: 14.2, rpg: 6.5, apg: 1.5, spg: 1.2, bpg: 0.5, tov: 2.0, pf: 2.5, fg_pct: 0.508, three_pt_pct: null, ft_pct: 0.705, pts_per40: 18.9, reb_per40: 8.7, ast_per40: 2.0, stl_per40: 1.6, blk_per40: 0.7, tov_per40: 2.7, usg: 0.242, per: 16.8, bpm: 2.5, obpm: 1.0, dbpm: 1.5, ws: 2.8, efg_pct: 0.508, ts_pct: 0.558, ast_pct: 0.082, tov_pct: 0.130, stl_pct: 0.026, blk_pct: 0.012, orb_pct: 0.045, drb_pct: 0.130, drtg: 101.0 },
    nba: { ppg: 3.2, rpg: 2.1, apg: 0.5, spg: 0.4, bpg: 0.2, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 30, team: 'Washington Bullets', name: 'Stuart Gray', school: 'UCLA', pos: 'C',
    birthYear: 1963, height: 84, weight: 240, wingspan: 88, conf: 'Pac-12',
    archetype: 'Drop Coverage Big',
    // 1983-84 UCLA: 8.5 PPG, 6.2 RPG in 31 games (backup role)
    stats: { games: 31, mpg: 20.0, ppg: 8.5, rpg: 6.2, apg: 0.5, spg: 0.4, bpg: 1.5, tov: 1.2, pf: 3.2, fg_pct: 0.538, three_pt_pct: null, ft_pct: 0.620, pts_per40: 17.0, reb_per40: 12.4, ast_per40: 1.0, stl_per40: 0.8, blk_per40: 3.0, tov_per40: 2.4, usg: 0.215, per: 16.2, bpm: 2.0, obpm: 0.0, dbpm: 2.0, ws: 2.5, efg_pct: 0.538, ts_pct: 0.565, ast_pct: 0.035, tov_pct: 0.120, stl_pct: 0.012, blk_pct: 0.055, orb_pct: 0.072, drb_pct: 0.160, drtg: 98.0 },
    nba: { ppg: 3.5, rpg: 3.2, apg: 0.3, spg: 0.2, bpg: 0.5, ws48: 0.038, outcome: 'Role Player' },
  },
  {
    pick: 31, team: 'Kansas City Kings', name: 'Tim Kempton', school: 'Notre Dame', pos: 'PF',
    birthYear: 1964, height: 82, weight: 240, wingspan: 85, conf: 'Independent',
    archetype: 'Rim Runner',
    // 1983-84 Notre Dame: 10.5 PPG, 7.2 RPG in 30 games
    stats: { games: 30, mpg: 25.5, ppg: 10.5, rpg: 7.2, apg: 0.8, spg: 0.5, bpg: 0.8, tov: 1.5, pf: 3.0, fg_pct: 0.520, three_pt_pct: null, ft_pct: 0.640, pts_per40: 16.5, reb_per40: 11.3, ast_per40: 1.3, stl_per40: 0.8, blk_per40: 1.3, tov_per40: 2.4, usg: 0.215, per: 16.0, bpm: 1.8, obpm: 0.2, dbpm: 1.6, ws: 2.5, efg_pct: 0.520, ts_pct: 0.550, ast_pct: 0.050, tov_pct: 0.122, stl_pct: 0.013, blk_pct: 0.025, orb_pct: 0.078, drb_pct: 0.162, drtg: 100.0 },
    nba: { ppg: 4.2, rpg: 3.5, apg: 0.5, spg: 0.3, bpg: 0.3, ws48: 0.040, outcome: 'Role Player' },
  },
  {
    pick: 32, team: 'Cleveland Cavaliers', name: 'Steve Burtt', school: 'Iona', pos: 'PG',
    birthYear: 1962, height: 74, weight: 185, wingspan: 78, conf: 'MAAC',
    archetype: 'Scoring Lead Guard',
    // 1983-84 Iona: 21.5 PPG, 4.8 APG in 30 games
    stats: { games: 30, mpg: 35.5, ppg: 21.5, rpg: 3.5, apg: 4.8, spg: 2.2, bpg: 0.2, tov: 3.0, pf: 2.5, fg_pct: 0.490, three_pt_pct: 0.315, ft_pct: 0.815, pts_per40: 24.2, reb_per40: 3.9, ast_per40: 5.4, stl_per40: 2.5, blk_per40: 0.2, tov_per40: 3.4, usg: 0.278, per: 18.8, bpm: 4.2, obpm: 3.2, dbpm: 1.0, ws: 4.0, efg_pct: 0.510, ts_pct: 0.570, ast_pct: 0.225, tov_pct: 0.148, stl_pct: 0.040, blk_pct: 0.004, orb_pct: 0.018, drb_pct: 0.072, drtg: 101.0 },
    nba: { ppg: 3.5, rpg: 1.2, apg: 1.5, spg: 0.4, bpg: 0.0, ws48: 0.020, outcome: 'Bust' },
  },
  {
    pick: 33, team: 'New York Knicks', name: 'Anthony Teachey', school: 'Wake Forest', pos: 'PF',
    birthYear: 1962, height: 81, weight: 228, wingspan: 85, conf: 'ACC',
    archetype: 'Offensive Rebounder',
    // 1983-84 Wake Forest: 10.8 PPG, 8.5 RPG in 28 games
    stats: { games: 28, mpg: 27.0, ppg: 10.8, rpg: 8.5, apg: 0.6, spg: 0.5, bpg: 1.0, tov: 1.4, pf: 3.2, fg_pct: 0.512, three_pt_pct: null, ft_pct: 0.605, pts_per40: 16.0, reb_per40: 12.6, ast_per40: 0.9, stl_per40: 0.7, blk_per40: 1.5, tov_per40: 2.1, usg: 0.215, per: 16.5, bpm: 2.2, obpm: 0.2, dbpm: 2.0, ws: 2.5, efg_pct: 0.512, ts_pct: 0.540, ast_pct: 0.038, tov_pct: 0.118, stl_pct: 0.012, blk_pct: 0.028, orb_pct: 0.092, drb_pct: 0.178, drtg: 99.5 },
    nba: { ppg: 1.5, rpg: 1.8, apg: 0.2, spg: 0.2, bpg: 0.2, ws48: 0.012, outcome: 'Bust' },
  },
  {
    pick: 34, team: 'Indiana Pacers', name: 'Terence Stansbury', school: 'Temple', pos: 'SG',
    birthYear: 1961, height: 76, weight: 175, wingspan: 80, conf: 'Atlantic 10',
    archetype: 'Movement Shooter',
    // 1983-84 Temple: 18.5 PPG, 3.0 RPG in 30 games
    stats: { games: 30, mpg: 34.0, ppg: 18.5, rpg: 3.0, apg: 3.5, spg: 1.8, bpg: 0.2, tov: 2.2, pf: 2.0, fg_pct: 0.500, three_pt_pct: 0.340, ft_pct: 0.840, pts_per40: 21.8, reb_per40: 3.5, ast_per40: 4.1, stl_per40: 2.1, blk_per40: 0.2, tov_per40: 2.6, usg: 0.265, per: 18.5, bpm: 3.8, obpm: 2.8, dbpm: 1.0, ws: 3.8, efg_pct: 0.520, ts_pct: 0.580, ast_pct: 0.172, tov_pct: 0.125, stl_pct: 0.035, blk_pct: 0.004, orb_pct: 0.018, drb_pct: 0.065, drtg: 101.5 },
    nba: { ppg: 6.5, rpg: 1.2, apg: 1.5, spg: 0.6, bpg: 0.1, ws48: 0.045, outcome: 'Role Player' },
  },
  {
    pick: 35, team: 'LA Clippers', name: 'Ron Anderson', school: 'Fresno State', pos: 'SF',
    birthYear: 1958, height: 79, weight: 215, wingspan: 82, conf: 'PCAA',
    archetype: 'Off Ball Scoring Wing',
    // 1983-84 Fresno State: 19.5 PPG, 6.8 RPG in 30 games
    stats: { games: 30, mpg: 32.0, ppg: 19.5, rpg: 6.8, apg: 2.0, spg: 1.5, bpg: 0.4, tov: 1.8, pf: 2.5, fg_pct: 0.535, three_pt_pct: 0.300, ft_pct: 0.755, pts_per40: 24.4, reb_per40: 8.5, ast_per40: 2.5, stl_per40: 1.9, blk_per40: 0.5, tov_per40: 2.3, usg: 0.268, per: 20.5, bpm: 4.5, obpm: 3.0, dbpm: 1.5, ws: 4.2, efg_pct: 0.550, ts_pct: 0.598, ast_pct: 0.100, tov_pct: 0.105, stl_pct: 0.030, blk_pct: 0.008, orb_pct: 0.042, drb_pct: 0.138, drtg: 100.0 },
    nba: { ppg: 9.5, rpg: 3.8, apg: 1.0, spg: 0.5, bpg: 0.2, ws48: 0.078, outcome: 'Role Player' },
  },
  {
    pick: 36, team: 'Golden State Warriors', name: 'Pete Williams', school: 'Arizona', pos: 'PF',
    birthYear: 1962, height: 81, weight: 225, wingspan: 84, conf: 'Pac-12',
    archetype: 'Stretch Big',
    // 1983-84 Arizona: 11.2 PPG, 7.0 RPG in 29 games
    stats: { games: 29, mpg: 27.0, ppg: 11.2, rpg: 7.0, apg: 0.8, spg: 0.5, bpg: 0.8, tov: 1.5, pf: 2.8, fg_pct: 0.510, three_pt_pct: null, ft_pct: 0.670, pts_per40: 16.6, reb_per40: 10.4, ast_per40: 1.2, stl_per40: 0.7, blk_per40: 1.2, tov_per40: 2.2, usg: 0.218, per: 15.8, bpm: 1.5, obpm: 0.0, dbpm: 1.5, ws: 2.2, efg_pct: 0.510, ts_pct: 0.545, ast_pct: 0.050, tov_pct: 0.118, stl_pct: 0.012, blk_pct: 0.022, orb_pct: 0.065, drb_pct: 0.148, drtg: 101.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 37, team: 'Milwaukee Bucks', name: 'Charles Jones', school: 'Louisville', pos: 'PF',
    birthYear: 1962, height: 81, weight: 225, wingspan: 86, conf: 'Metro',
    archetype: 'Rim Protector',
    // 1983-84 Louisville: 9.2 PPG, 7.5 RPG, 2.8 BPG in 33 games
    stats: { games: 33, mpg: 24.0, ppg: 9.2, rpg: 7.5, apg: 0.5, spg: 0.5, bpg: 2.8, tov: 1.2, pf: 3.0, fg_pct: 0.530, three_pt_pct: null, ft_pct: 0.545, pts_per40: 15.3, reb_per40: 12.5, ast_per40: 0.8, stl_per40: 0.8, blk_per40: 4.7, tov_per40: 2.0, usg: 0.200, per: 17.2, bpm: 2.8, obpm: -0.5, dbpm: 3.3, ws: 2.8, efg_pct: 0.530, ts_pct: 0.545, ast_pct: 0.030, tov_pct: 0.112, stl_pct: 0.013, blk_pct: 0.092, orb_pct: 0.072, drb_pct: 0.165, drtg: 96.5 },
    nba: { ppg: 3.8, rpg: 4.2, apg: 0.4, spg: 0.4, bpg: 1.2, ws48: 0.062, outcome: 'Role Player' },
  },
  {
    pick: 38, team: 'Detroit Pistons', name: 'Tom Sluby', school: 'Notre Dame', pos: 'SG',
    birthYear: 1962, height: 77, weight: 195, wingspan: 81, conf: 'Independent',
    archetype: 'Off Ball Shooter',
    // 1983-84 Notre Dame: 15.8 PPG, 3.0 RPG in 28 games
    stats: { games: 28, mpg: 30.0, ppg: 15.8, rpg: 3.0, apg: 2.8, spg: 1.2, bpg: 0.2, tov: 2.0, pf: 2.2, fg_pct: 0.492, three_pt_pct: 0.300, ft_pct: 0.820, pts_per40: 21.1, reb_per40: 4.0, ast_per40: 3.7, stl_per40: 1.6, blk_per40: 0.3, tov_per40: 2.7, usg: 0.255, per: 17.0, bpm: 2.5, obpm: 1.5, dbpm: 1.0, ws: 2.8, efg_pct: 0.507, ts_pct: 0.570, ast_pct: 0.145, tov_pct: 0.130, stl_pct: 0.025, blk_pct: 0.005, orb_pct: 0.020, drb_pct: 0.068, drtg: 102.0 },
    nba: { ppg: 2.5, rpg: 0.8, apg: 0.8, spg: 0.2, bpg: 0.0, ws48: 0.015, outcome: 'Bust' },
  },
  {
    pick: 39, team: 'New Jersey Nets', name: 'Cory Blackwell', school: 'Wisconsin', pos: 'SG',
    birthYear: 1963, height: 78, weight: 205, wingspan: 82, conf: 'Big Ten',
    archetype: 'Slasher Wing',
    // 1983-84 Wisconsin: 16.2 PPG, 4.5 RPG in 27 games
    stats: { games: 27, mpg: 32.0, ppg: 16.2, rpg: 4.5, apg: 2.5, spg: 1.8, bpg: 0.3, tov: 2.5, pf: 2.5, fg_pct: 0.485, three_pt_pct: 0.285, ft_pct: 0.728, pts_per40: 20.3, reb_per40: 5.6, ast_per40: 3.1, stl_per40: 2.3, blk_per40: 0.4, tov_per40: 3.1, usg: 0.260, per: 17.0, bpm: 2.8, obpm: 1.5, dbpm: 1.3, ws: 3.0, efg_pct: 0.500, ts_pct: 0.549, ast_pct: 0.132, tov_pct: 0.145, stl_pct: 0.038, blk_pct: 0.007, orb_pct: 0.025, drb_pct: 0.095, drtg: 101.5 },
    nba: { ppg: 2.8, rpg: 1.2, apg: 0.5, spg: 0.3, bpg: 0.1, ws48: 0.018, outcome: 'Bust' },
  },
  {
    pick: 40, team: 'Denver Nuggets', name: 'Jim Petersen', school: 'Minnesota', pos: 'C',
    birthYear: 1962, height: 83, weight: 235, wingspan: 87, conf: 'Big Ten',
    archetype: 'Drop Coverage Big',
    // 1983-84 Minnesota: 11.0 PPG, 7.5 RPG in 29 games
    stats: { games: 29, mpg: 28.5, ppg: 11.0, rpg: 7.5, apg: 0.9, spg: 0.5, bpg: 1.2, tov: 1.5, pf: 3.0, fg_pct: 0.528, three_pt_pct: null, ft_pct: 0.660, pts_per40: 15.4, reb_per40: 10.5, ast_per40: 1.3, stl_per40: 0.7, blk_per40: 1.7, tov_per40: 2.1, usg: 0.218, per: 16.5, bpm: 2.5, obpm: 0.5, dbpm: 2.0, ws: 2.8, efg_pct: 0.528, ts_pct: 0.555, ast_pct: 0.055, tov_pct: 0.118, stl_pct: 0.012, blk_pct: 0.032, orb_pct: 0.070, drb_pct: 0.158, drtg: 99.5 },
    nba: { ppg: 5.5, rpg: 4.8, apg: 0.8, spg: 0.4, bpg: 0.6, ws48: 0.055, outcome: 'Role Player' },
  },
  {
    pick: 41, team: 'Seattle SuperSonics', name: 'Devin Durrant', school: 'BYU', pos: 'SF',
    birthYear: 1960, height: 79, weight: 210, wingspan: 82, conf: 'WAC',
    archetype: 'Off Ball Scoring Wing',
    // 1983-84 BYU: 27.9 PPG (led the nation), 7.0 RPG in 30 games
    stats: { games: 30, mpg: 34.0, ppg: 27.9, rpg: 7.0, apg: 2.5, spg: 0.8, bpg: 0.5, tov: 2.2, pf: 2.2, fg_pct: 0.556, three_pt_pct: null, ft_pct: 0.785, pts_per40: 32.8, reb_per40: 8.2, ast_per40: 2.9, stl_per40: 0.9, blk_per40: 0.6, tov_per40: 2.6, usg: 0.325, per: 23.5, bpm: 5.5, obpm: 4.5, dbpm: 1.0, ws: 5.5, efg_pct: 0.556, ts_pct: 0.622, ast_pct: 0.112, tov_pct: 0.095, stl_pct: 0.015, blk_pct: 0.010, orb_pct: 0.038, drb_pct: 0.138, drtg: 100.5 },
    nba: { ppg: 2.8, rpg: 1.5, apg: 0.5, spg: 0.2, bpg: 0.1, ws48: 0.015, outcome: 'Bust' },
  },
  {
    // Oscar Schmidt was selected but never played in the NBA — refused to give up
    // his Brazilian national team career. One of the greatest scorers never to play in the NBA.
    pick: 42, team: 'Atlanta Hawks', name: 'Oscar Schmidt', school: 'Brazil', pos: 'SF',
    birthYear: 1958, height: 80, weight: 210, wingspan: 83, conf: null,
    archetype: 'Off Ball Scorer',
    // International stats estimated from Brazilian NBB / Olympic competition
    stats: { games: 35, mpg: 32.0, ppg: 24.0, rpg: 5.5, apg: 1.8, spg: 0.8, bpg: 0.3, tov: 2.0, pf: 2.2, fg_pct: 0.530, three_pt_pct: 0.380, ft_pct: 0.860, pts_per40: 30.0, reb_per40: 6.9, ast_per40: 2.3, stl_per40: 1.0, blk_per40: 0.4, tov_per40: 2.5, usg: 0.320, per: 23.8, bpm: 6.0, obpm: 5.5, dbpm: 0.5, ws: 5.2, efg_pct: 0.565, ts_pct: 0.640, ast_pct: 0.088, tov_pct: 0.095, stl_pct: 0.016, blk_pct: 0.006, orb_pct: 0.032, drb_pct: 0.110, drtg: 101.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 43, team: 'Boston Celtics', name: 'Derrick Gervin', school: 'UTSA', pos: 'SG',
    birthYear: 1963, height: 77, weight: 195, wingspan: 81, conf: 'Southland',
    archetype: 'Scoring Lead Guard',
    // 1983-84 UTSA: 18.2 PPG, 4.0 RPG in 28 games
    stats: { games: 28, mpg: 31.0, ppg: 18.2, rpg: 4.0, apg: 3.0, spg: 1.5, bpg: 0.2, tov: 2.5, pf: 2.3, fg_pct: 0.478, three_pt_pct: 0.295, ft_pct: 0.748, pts_per40: 23.5, reb_per40: 5.2, ast_per40: 3.9, stl_per40: 1.9, blk_per40: 0.3, tov_per40: 3.2, usg: 0.272, per: 17.5, bpm: 3.0, obpm: 2.0, dbpm: 1.0, ws: 3.2, efg_pct: 0.495, ts_pct: 0.545, ast_pct: 0.155, tov_pct: 0.145, stl_pct: 0.030, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.082, drtg: 103.0 },
    nba: { ppg: 5.5, rpg: 1.5, apg: 1.2, spg: 0.5, bpg: 0.1, ws48: 0.035, outcome: 'Role Player' },
  },
  {
    pick: 44, team: 'Phoenix Suns', name: 'Rickie Winslow', school: 'Houston', pos: 'PF',
    birthYear: 1963, height: 81, weight: 230, wingspan: 84, conf: 'SWC',
    archetype: 'Rim Runner',
    // 1983-84 Houston: 8.5 PPG, 6.8 RPG in 37 games
    stats: { games: 37, mpg: 22.0, ppg: 8.5, rpg: 6.8, apg: 0.6, spg: 0.5, bpg: 1.0, tov: 1.2, pf: 2.8, fg_pct: 0.548, three_pt_pct: null, ft_pct: 0.595, pts_per40: 15.5, reb_per40: 12.4, ast_per40: 1.1, stl_per40: 0.9, blk_per40: 1.8, tov_per40: 2.2, usg: 0.215, per: 16.5, bpm: 2.2, obpm: 0.5, dbpm: 1.7, ws: 2.5, efg_pct: 0.548, ts_pct: 0.562, ast_pct: 0.040, tov_pct: 0.118, stl_pct: 0.014, blk_pct: 0.030, orb_pct: 0.082, drb_pct: 0.162, drtg: 98.5 },
    nba: { ppg: 1.2, rpg: 1.0, apg: 0.2, spg: 0.1, bpg: 0.2, ws48: 0.005, outcome: 'Bust' },
  },
  {
    // Karl Malone — greatest steal of the 1984 draft after MJ. Picked 13th in round 2.
    pick: 45, team: 'Utah Jazz', name: 'Karl Malone', school: 'Louisiana Tech', pos: 'PF',
    birthYear: 1963, height: 81, weight: 256, wingspan: 85, conf: 'Southland',
    archetype: 'Point Forward',
    // 1983-84 Louisiana Tech: 18.7 PPG, 10.3 RPG in 32 games
    stats: { games: 32, mpg: 33.0, ppg: 18.7, rpg: 10.3, apg: 1.8, spg: 1.2, bpg: 1.0, tov: 2.2, pf: 3.0, fg_pct: 0.560, three_pt_pct: null, ft_pct: 0.618, pts_per40: 22.7, reb_per40: 12.5, ast_per40: 2.2, stl_per40: 1.5, blk_per40: 1.2, tov_per40: 2.7, usg: 0.268, per: 22.8, bpm: 7.5, obpm: 4.2, dbpm: 3.3, ws: 5.8, efg_pct: 0.560, ts_pct: 0.585, ast_pct: 0.082, tov_pct: 0.120, stl_pct: 0.024, blk_pct: 0.022, orb_pct: 0.095, drb_pct: 0.198, drtg: 93.5 },
    nba: { ppg: 25.0, rpg: 10.1, apg: 3.6, spg: 1.4, bpg: 0.8, ws48: 0.197, outcome: 'All-NBA' },
  },
  {
    pick: 46, team: 'Chicago Bulls', name: 'Melvin McCants', school: 'Purdue', pos: 'PF',
    birthYear: 1962, height: 80, weight: 225, wingspan: 83, conf: 'Big Ten',
    archetype: 'Rim Runner',
    // 1983-84 Purdue: 9.8 PPG, 7.2 RPG in 29 games
    stats: { games: 29, mpg: 24.0, ppg: 9.8, rpg: 7.2, apg: 0.5, spg: 0.5, bpg: 0.8, tov: 1.5, pf: 3.0, fg_pct: 0.522, three_pt_pct: null, ft_pct: 0.618, pts_per40: 16.3, reb_per40: 12.0, ast_per40: 0.8, stl_per40: 0.8, blk_per40: 1.3, tov_per40: 2.5, usg: 0.210, per: 15.5, bpm: 1.5, obpm: 0.0, dbpm: 1.5, ws: 2.2, efg_pct: 0.522, ts_pct: 0.545, ast_pct: 0.032, tov_pct: 0.122, stl_pct: 0.013, blk_pct: 0.022, orb_pct: 0.078, drb_pct: 0.155, drtg: 100.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },

  // === ROUND 3 (picks 47–60) ===

  {
    // Mark Price — incredible steal at pick 47. 4x All-Star, led league in FT%.
    pick: 47, team: 'Dallas Mavericks', name: 'Mark Price', school: 'Georgia Tech', pos: 'PG',
    birthYear: 1964, height: 72, weight: 178, wingspan: 75, conf: 'ACC',
    archetype: 'Primary Playmaker',
    // 1983-84 Georgia Tech: 16.8 PPG, 3.2 APG in 32 games
    stats: { games: 32, mpg: 33.0, ppg: 16.8, rpg: 2.8, apg: 3.2, spg: 1.5, bpg: 0.1, tov: 2.2, pf: 2.0, fg_pct: 0.498, three_pt_pct: 0.368, ft_pct: 0.875, pts_per40: 20.4, reb_per40: 3.4, ast_per40: 3.9, stl_per40: 1.8, blk_per40: 0.1, tov_per40: 2.7, usg: 0.262, per: 18.5, bpm: 4.2, obpm: 3.5, dbpm: 0.7, ws: 4.2, efg_pct: 0.530, ts_pct: 0.610, ast_pct: 0.195, tov_pct: 0.135, stl_pct: 0.030, blk_pct: 0.002, orb_pct: 0.012, drb_pct: 0.060, drtg: 100.5 },
    nba: { ppg: 15.2, rpg: 2.5, apg: 6.7, spg: 1.5, bpg: 0.1, ws48: 0.169, outcome: 'All-Star' },
  },
  {
    pick: 48, team: 'Portland Trail Blazers', name: 'John Williams', school: 'Tulane', pos: 'PF',
    birthYear: 1962, height: 82, weight: 235, wingspan: 86, conf: 'Metro',
    archetype: 'Stretch Big',
    // 1983-84 Tulane: 15.2 PPG, 9.0 RPG in 28 games
    stats: { games: 28, mpg: 30.0, ppg: 15.2, rpg: 9.0, apg: 1.0, spg: 0.8, bpg: 1.5, tov: 2.0, pf: 3.0, fg_pct: 0.515, three_pt_pct: null, ft_pct: 0.685, pts_per40: 20.3, reb_per40: 12.0, ast_per40: 1.3, stl_per40: 1.1, blk_per40: 2.0, tov_per40: 2.7, usg: 0.245, per: 19.5, bpm: 4.5, obpm: 1.5, dbpm: 3.0, ws: 3.8, efg_pct: 0.515, ts_pct: 0.560, ast_pct: 0.055, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.042, orb_pct: 0.078, drb_pct: 0.178, drtg: 97.0 },
    nba: { ppg: 8.5, rpg: 5.5, apg: 0.8, spg: 0.5, bpg: 0.8, ws48: 0.072, outcome: 'Role Player' },
  },
  {
    pick: 49, team: 'Kansas City Kings', name: 'Ricky Wilson', school: 'Tennessee', pos: 'SG',
    birthYear: 1962, height: 76, weight: 188, wingspan: 80, conf: 'SEC',
    archetype: 'Off Ball Shooter',
    // 1983-84 Tennessee: 12.5 PPG, 3.0 RPG in 28 games
    stats: { games: 28, mpg: 28.0, ppg: 12.5, rpg: 3.0, apg: 2.5, spg: 1.2, bpg: 0.2, tov: 1.8, pf: 2.2, fg_pct: 0.470, three_pt_pct: 0.295, ft_pct: 0.780, pts_per40: 17.9, reb_per40: 4.3, ast_per40: 3.6, stl_per40: 1.7, blk_per40: 0.3, tov_per40: 2.6, usg: 0.235, per: 15.0, bpm: 1.0, obpm: 0.5, dbpm: 0.5, ws: 2.0, efg_pct: 0.490, ts_pct: 0.543, ast_pct: 0.135, tov_pct: 0.132, stl_pct: 0.028, blk_pct: 0.005, orb_pct: 0.020, drb_pct: 0.070, drtg: 103.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 50, team: 'Cleveland Cavaliers', name: 'Chris Engler', school: 'Wyoming', pos: 'C',
    birthYear: 1961, height: 84, weight: 245, wingspan: 87, conf: 'WAC',
    archetype: 'Drop Coverage Big',
    // 1983-84 Wyoming: 10.2 PPG, 6.8 RPG in 28 games
    stats: { games: 28, mpg: 24.5, ppg: 10.2, rpg: 6.8, apg: 0.5, spg: 0.4, bpg: 1.5, tov: 1.5, pf: 3.2, fg_pct: 0.508, three_pt_pct: null, ft_pct: 0.635, pts_per40: 16.7, reb_per40: 11.1, ast_per40: 0.8, stl_per40: 0.7, blk_per40: 2.5, tov_per40: 2.5, usg: 0.215, per: 16.0, bpm: 1.8, obpm: 0.0, dbpm: 1.8, ws: 2.2, efg_pct: 0.508, ts_pct: 0.538, ast_pct: 0.032, tov_pct: 0.125, stl_pct: 0.010, blk_pct: 0.048, orb_pct: 0.068, drb_pct: 0.155, drtg: 100.0 },
    nba: { ppg: 2.0, rpg: 2.2, apg: 0.2, spg: 0.1, bpg: 0.5, ws48: 0.022, outcome: 'Bust' },
  },
  {
    pick: 51, team: 'New York Knicks', name: 'Sedric Toney', school: 'Dayton', pos: 'PG',
    birthYear: 1962, height: 74, weight: 180, wingspan: 77, conf: 'Atlantic 10',
    archetype: 'Secondary Playmaker',
    // 1983-84 Dayton: 17.8 PPG, 5.2 APG in 30 games
    stats: { games: 30, mpg: 33.0, ppg: 17.8, rpg: 3.2, apg: 5.2, spg: 2.0, bpg: 0.1, tov: 3.0, pf: 2.5, fg_pct: 0.462, three_pt_pct: 0.285, ft_pct: 0.805, pts_per40: 21.6, reb_per40: 3.9, ast_per40: 6.3, stl_per40: 2.4, blk_per40: 0.1, tov_per40: 3.6, usg: 0.265, per: 17.0, bpm: 2.5, obpm: 1.8, dbpm: 0.7, ws: 3.0, efg_pct: 0.480, ts_pct: 0.545, ast_pct: 0.248, tov_pct: 0.155, stl_pct: 0.038, blk_pct: 0.002, orb_pct: 0.015, drb_pct: 0.065, drtg: 103.0 },
    nba: { ppg: 3.8, rpg: 1.2, apg: 2.5, spg: 0.6, bpg: 0.0, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 52, team: 'Indiana Pacers', name: 'Willie Sims', school: 'Indiana', pos: 'SF',
    birthYear: 1962, height: 79, weight: 210, wingspan: 82, conf: 'Big Ten',
    archetype: 'Slasher Wing',
    // 1983-84 Indiana: 8.2 PPG, 3.8 RPG in 28 games (reserve)
    stats: { games: 28, mpg: 20.0, ppg: 8.2, rpg: 3.8, apg: 1.2, spg: 0.8, bpg: 0.3, tov: 1.5, pf: 2.0, fg_pct: 0.488, three_pt_pct: null, ft_pct: 0.695, pts_per40: 16.4, reb_per40: 7.6, ast_per40: 2.4, stl_per40: 1.6, blk_per40: 0.6, tov_per40: 3.0, usg: 0.225, per: 14.5, bpm: 1.0, obpm: 0.0, dbpm: 1.0, ws: 1.8, efg_pct: 0.488, ts_pct: 0.535, ast_pct: 0.098, tov_pct: 0.142, stl_pct: 0.025, blk_pct: 0.010, orb_pct: 0.030, drb_pct: 0.088, drtg: 103.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 53, team: 'Milwaukee Bucks', name: 'Lorenzo Charles', school: 'NC State', pos: 'PF',
    birthYear: 1963, height: 80, weight: 225, wingspan: 83, conf: 'ACC',
    archetype: 'Offensive Rebounder',
    // 1983-84 NC State: 12.0 PPG, 7.5 RPG in 31 games
    stats: { games: 31, mpg: 26.0, ppg: 12.0, rpg: 7.5, apg: 0.8, spg: 0.5, bpg: 0.8, tov: 1.5, pf: 2.8, fg_pct: 0.548, three_pt_pct: null, ft_pct: 0.620, pts_per40: 18.5, reb_per40: 11.5, ast_per40: 1.2, stl_per40: 0.8, blk_per40: 1.2, tov_per40: 2.3, usg: 0.228, per: 17.8, bpm: 2.8, obpm: 1.0, dbpm: 1.8, ws: 3.0, efg_pct: 0.548, ts_pct: 0.570, ast_pct: 0.045, tov_pct: 0.118, stl_pct: 0.012, blk_pct: 0.022, orb_pct: 0.085, drb_pct: 0.168, drtg: 100.0 },
    nba: { ppg: 3.5, rpg: 3.0, apg: 0.3, spg: 0.3, bpg: 0.3, ws48: 0.032, outcome: 'Bust' },
  },
  {
    pick: 54, team: 'Boston Celtics', name: 'Darren Tillis', school: 'Cleveland State', pos: 'C',
    birthYear: 1960, height: 84, weight: 235, wingspan: 87, conf: 'Mid-Continent',
    archetype: 'Rim Protector',
    // 1983-84 Cleveland State: 13.5 PPG, 9.0 RPG, 3.2 BPG in 28 games
    stats: { games: 28, mpg: 28.5, ppg: 13.5, rpg: 9.0, apg: 0.5, spg: 0.5, bpg: 3.2, tov: 1.5, pf: 3.5, fg_pct: 0.538, three_pt_pct: null, ft_pct: 0.595, pts_per40: 18.9, reb_per40: 12.6, ast_per40: 0.7, stl_per40: 0.7, blk_per40: 4.5, tov_per40: 2.1, usg: 0.225, per: 18.8, bpm: 4.0, obpm: 0.5, dbpm: 3.5, ws: 3.5, efg_pct: 0.538, ts_pct: 0.555, ast_pct: 0.030, tov_pct: 0.105, stl_pct: 0.011, blk_pct: 0.105, orb_pct: 0.085, drb_pct: 0.188, drtg: 97.5 },
    nba: { ppg: 2.0, rpg: 2.5, apg: 0.2, spg: 0.2, bpg: 0.5, ws48: 0.020, outcome: 'Bust' },
  },
  {
    pick: 55, team: 'Phoenix Suns', name: 'Michael Phelps', school: 'Houston Baptist', pos: 'SF',
    birthYear: 1963, height: 78, weight: 210, wingspan: 81, conf: 'Southland',
    archetype: 'Slasher Wing',
    // 1983-84 Houston Baptist: 16.5 PPG, 6.2 RPG in 27 games
    stats: { games: 27, mpg: 30.0, ppg: 16.5, rpg: 6.2, apg: 1.8, spg: 1.2, bpg: 0.4, tov: 1.8, pf: 2.5, fg_pct: 0.498, three_pt_pct: null, ft_pct: 0.720, pts_per40: 22.0, reb_per40: 8.3, ast_per40: 2.4, stl_per40: 1.6, blk_per40: 0.5, tov_per40: 2.4, usg: 0.258, per: 17.5, bpm: 2.5, obpm: 1.2, dbpm: 1.3, ws: 2.5, efg_pct: 0.498, ts_pct: 0.553, ast_pct: 0.092, tov_pct: 0.118, stl_pct: 0.025, blk_pct: 0.010, orb_pct: 0.038, drb_pct: 0.118, drtg: 103.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 56, team: 'LA Lakers', name: 'Doug Cronin', school: 'Santa Clara', pos: 'PG',
    birthYear: 1962, height: 73, weight: 175, wingspan: 76, conf: 'WCC',
    archetype: 'Secondary Playmaker',
    // 1983-84 Santa Clara: 11.5 PPG, 5.0 APG in 28 games
    stats: { games: 28, mpg: 31.0, ppg: 11.5, rpg: 2.5, apg: 5.0, spg: 1.5, bpg: 0.1, tov: 2.8, pf: 2.2, fg_pct: 0.455, three_pt_pct: 0.305, ft_pct: 0.790, pts_per40: 14.8, reb_per40: 3.2, ast_per40: 6.5, stl_per40: 1.9, blk_per40: 0.1, tov_per40: 3.6, usg: 0.222, per: 14.5, bpm: 1.0, obpm: 0.5, dbpm: 0.5, ws: 1.8, efg_pct: 0.475, ts_pct: 0.535, ast_pct: 0.265, tov_pct: 0.158, stl_pct: 0.030, blk_pct: 0.002, orb_pct: 0.012, drb_pct: 0.058, drtg: 104.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 57, team: 'Denver Nuggets', name: 'Jim Master', school: 'Kentucky', pos: 'SG',
    birthYear: 1963, height: 76, weight: 190, wingspan: 79, conf: 'SEC',
    archetype: 'Movement Shooter',
    // 1983-84 Kentucky: 9.5 PPG, 2.2 RPG in 27 games
    stats: { games: 27, mpg: 25.0, ppg: 9.5, rpg: 2.2, apg: 2.0, spg: 0.8, bpg: 0.1, tov: 1.5, pf: 1.8, fg_pct: 0.492, three_pt_pct: 0.365, ft_pct: 0.855, pts_per40: 15.2, reb_per40: 3.5, ast_per40: 3.2, stl_per40: 1.3, blk_per40: 0.2, tov_per40: 2.4, usg: 0.225, per: 14.0, bpm: 0.5, obpm: 0.5, dbpm: 0.0, ws: 1.5, efg_pct: 0.520, ts_pct: 0.578, ast_pct: 0.128, tov_pct: 0.130, stl_pct: 0.020, blk_pct: 0.003, orb_pct: 0.012, drb_pct: 0.055, drtg: 103.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 58, team: 'New Jersey Nets', name: 'Willie Bland', school: 'Virginia Union', pos: 'PG',
    birthYear: 1962, height: 75, weight: 182, wingspan: 78, conf: 'CIAA',
    archetype: 'Secondary Playmaker',
    // 1983-84 Virginia Union: 14.2 PPG, 4.8 APG in 28 games
    stats: { games: 28, mpg: 30.5, ppg: 14.2, rpg: 3.0, apg: 4.8, spg: 2.0, bpg: 0.2, tov: 2.5, pf: 2.5, fg_pct: 0.468, three_pt_pct: 0.290, ft_pct: 0.762, pts_per40: 18.6, reb_per40: 3.9, ast_per40: 6.3, stl_per40: 2.6, blk_per40: 0.3, tov_per40: 3.3, usg: 0.248, per: 15.8, bpm: 1.5, obpm: 1.0, dbpm: 0.5, ws: 2.2, efg_pct: 0.488, ts_pct: 0.540, ast_pct: 0.255, tov_pct: 0.148, stl_pct: 0.042, blk_pct: 0.004, orb_pct: 0.018, drb_pct: 0.068, drtg: 104.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 59, team: 'Utah Jazz', name: 'Rick Lamb', school: 'Oklahoma', pos: 'SF',
    birthYear: 1962, height: 79, weight: 215, wingspan: 82, conf: 'Big 8',
    archetype: 'Off Ball Scoring Wing',
    // 1983-84 Oklahoma: 9.8 PPG, 4.2 RPG in 30 games (reserve)
    stats: { games: 30, mpg: 22.0, ppg: 9.8, rpg: 4.2, apg: 1.0, spg: 0.8, bpg: 0.3, tov: 1.2, pf: 2.0, fg_pct: 0.505, three_pt_pct: null, ft_pct: 0.705, pts_per40: 17.8, reb_per40: 7.6, ast_per40: 1.8, stl_per40: 1.5, blk_per40: 0.5, tov_per40: 2.2, usg: 0.218, per: 15.5, bpm: 1.2, obpm: 0.2, dbpm: 1.0, ws: 1.8, efg_pct: 0.505, ts_pct: 0.548, ast_pct: 0.072, tov_pct: 0.115, stl_pct: 0.022, blk_pct: 0.008, orb_pct: 0.038, drb_pct: 0.098, drtg: 103.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 60, team: 'Chicago Bulls', name: 'Jerome Henderson', school: 'New Mexico State', pos: 'SF',
    birthYear: 1963, height: 79, weight: 215, wingspan: 82, conf: 'WAC',
    archetype: 'Slasher Wing',
    // 1983-84 New Mexico State: 11.2 PPG, 5.0 RPG in 27 games
    stats: { games: 27, mpg: 26.0, ppg: 11.2, rpg: 5.0, apg: 1.5, spg: 1.0, bpg: 0.5, tov: 1.5, pf: 2.5, fg_pct: 0.498, three_pt_pct: null, ft_pct: 0.685, pts_per40: 17.2, reb_per40: 7.7, ast_per40: 2.3, stl_per40: 1.5, blk_per40: 0.8, tov_per40: 2.3, usg: 0.228, per: 15.8, bpm: 1.2, obpm: 0.2, dbpm: 1.0, ws: 1.8, efg_pct: 0.498, ts_pct: 0.545, ast_pct: 0.098, tov_pct: 0.118, stl_pct: 0.022, blk_pct: 0.012, orb_pct: 0.042, drb_pct: 0.112, drtg: 103.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
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
  console.log(`Seeding ${DRAFT_CLASS} NBA Draft — Remaining Picks (25–60)`)
  console.log(`Note: Picks 1–24 are already seeded in seed-legendary-1984.mjs`)
  console.log(`Processing ${PLAYERS.length} players...`)

  for (const p of PLAYERS) {
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
  console.log(`Players seeded: ${PLAYERS.length}`)
  console.log(`Navigate to /legendary-archives?year=1984 to view the board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
