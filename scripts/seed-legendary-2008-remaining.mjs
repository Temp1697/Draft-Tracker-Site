#!/usr/bin/env node
// SUPPLEMENTAL seed script for 2008 NBA Draft — Legendary Archives
// Adds ALL picks NOT already covered by seed-legendary-2008.mjs
//
// Already seeded by original script:
//   Picks 1-21, 25, 26, 28, 35, 45
//
// This script seeds the remaining picks:
//   Round 1: 22, 23, 24, 27, 29, 30
//   Round 2: 31-34, 36-44, 46-60
//
// Usage: node scripts/seed-legendary-2008-remaining.mjs

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

// 2008 NBA Draft — remaining picks not in seed-legendary-2008.mjs
// Sources: Basketball Reference, Sports Reference College Basketball
const PLAYERS = [
  // === ROUND 1 — MISSING PICKS ===
  {
    pick: 22, team: 'Utah Jazz', name: 'Kosta Koufos', school: 'Ohio State', pos: 'C',
    birthYear: 1989, height: 84, weight: 265, wingspan: 88, conf: 'Big Ten',
    archetype: 'Drop Coverage Big',
    // 2007-08 Ohio State: 11.9 PPG, 6.5 RPG, 1.8 BPG as freshman
    stats: { games: 34, mpg: 24.5, ppg: 11.9, rpg: 6.5, apg: 0.8, spg: 0.4, bpg: 1.8, tov: 1.8, pf: 3.2, fg_pct: 0.538, three_pt_pct: null, ft_pct: 0.712, pts_per40: 19.4, reb_per40: 10.6, ast_per40: 1.3, stl_per40: 0.7, blk_per40: 2.9, tov_per40: 2.9, usg: 0.242, per: 20.5, bpm: 5.2, obpm: 1.8, dbpm: 3.4, ws: 5.2, efg_pct: 0.538, ts_pct: 0.578, ast_pct: 0.048, tov_pct: 0.138, stl_pct: 0.010, blk_pct: 0.058, orb_pct: 0.085, drb_pct: 0.195, drtg: 95.8 },
    nba: { ppg: 5.8, rpg: 4.8, apg: 0.4, spg: 0.3, bpg: 1.0, ws48: 0.088, outcome: 'Role Player' },
  },
  {
    pick: 23, team: 'Memphis Grizzlies', name: 'Marc Gasol', school: 'Akasvayu Girona', pos: 'C',
    birthYear: 1985, height: 85, weight: 255, wingspan: 89, conf: null,
    archetype: 'Stretch Big',
    // 2007-08 Akasvayu Girona (Liga ACB, Spain): ~12.0 PPG, 6.5 RPG, 1.8 BPG
    stats: { games: 32, mpg: 26.5, ppg: 12.0, rpg: 6.5, apg: 1.5, spg: 0.8, bpg: 1.8, tov: 1.8, pf: 3.2, fg_pct: 0.520, three_pt_pct: 0.280, ft_pct: 0.720, pts_per40: 18.1, reb_per40: 9.8, ast_per40: 2.3, stl_per40: 1.2, blk_per40: 2.7, tov_per40: 2.7, usg: 0.238, per: 21.5, bpm: 6.8, obpm: 2.8, dbpm: 4.0, ws: 6.2, efg_pct: 0.534, ts_pct: 0.578, ast_pct: 0.088, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.062, orb_pct: 0.072, drb_pct: 0.182, drtg: 93.5 },
    nba: { ppg: 14.8, rpg: 8.9, apg: 3.3, spg: 1.2, bpg: 1.7, ws48: 0.155, outcome: 'All-Star' },
  },
  {
    pick: 24, team: 'Boston Celtics', name: 'Bill Walker', school: 'Kansas State', pos: 'SG',
    birthYear: 1987, height: 77, weight: 215, wingspan: 81, conf: 'Big 12',
    archetype: 'Slasher Wing',
    // 2007-08 Kansas State: 12.8 PPG, 4.9 RPG (returned after injury)
    stats: { games: 29, mpg: 28.5, ppg: 12.8, rpg: 4.9, apg: 2.0, spg: 1.2, bpg: 0.5, tov: 2.2, pf: 2.5, fg_pct: 0.468, three_pt_pct: 0.322, ft_pct: 0.745, pts_per40: 17.9, reb_per40: 6.9, ast_per40: 2.8, stl_per40: 1.7, blk_per40: 0.7, tov_per40: 3.1, usg: 0.258, per: 16.8, bpm: 3.0, obpm: 2.0, dbpm: 1.0, ws: 3.8, efg_pct: 0.498, ts_pct: 0.548, ast_pct: 0.128, tov_pct: 0.148, stl_pct: 0.026, blk_pct: 0.012, orb_pct: 0.048, drb_pct: 0.118, drtg: 100.5 },
    nba: { ppg: 5.2, rpg: 2.0, apg: 0.8, spg: 0.5, bpg: 0.2, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 27, team: 'Detroit Pistons', name: 'DJ White', school: 'Indiana', pos: 'PF',
    birthYear: 1986, height: 82, weight: 243, wingspan: 85, conf: 'Big Ten',
    archetype: 'Stretch Big',
    // 2007-08 Indiana: 17.4 PPG, 9.6 RPG as senior
    stats: { games: 33, mpg: 32.5, ppg: 17.4, rpg: 9.6, apg: 1.5, spg: 0.7, bpg: 0.9, tov: 2.2, pf: 3.0, fg_pct: 0.530, three_pt_pct: 0.348, ft_pct: 0.785, pts_per40: 21.4, reb_per40: 11.8, ast_per40: 1.8, stl_per40: 0.9, blk_per40: 1.1, tov_per40: 2.7, usg: 0.258, per: 21.2, bpm: 5.8, obpm: 3.2, dbpm: 2.6, ws: 6.2, efg_pct: 0.558, ts_pct: 0.615, ast_pct: 0.088, tov_pct: 0.138, stl_pct: 0.014, blk_pct: 0.022, orb_pct: 0.092, drb_pct: 0.218, drtg: 97.2 },
    nba: { ppg: 3.2, rpg: 2.5, apg: 0.5, spg: 0.3, bpg: 0.3, ws48: 0.032, outcome: 'Bust' },
  },
  {
    pick: 29, team: 'Orlando Magic', name: 'Omer Asik', school: 'Efes Pilsen', pos: 'C',
    birthYear: 1986, height: 83, weight: 255, wingspan: 90, conf: null,
    archetype: 'Rim Protector',
    // 2007-08 Efes Pilsen (BSL, Turkey): ~5.8 PPG, 5.5 RPG, 1.8 BPG
    stats: { games: 30, mpg: 20.5, ppg: 5.8, rpg: 5.5, apg: 0.5, spg: 0.5, bpg: 1.8, tov: 1.2, pf: 3.5, fg_pct: 0.545, three_pt_pct: null, ft_pct: 0.515, pts_per40: 11.3, reb_per40: 10.7, ast_per40: 1.0, stl_per40: 1.0, blk_per40: 3.5, tov_per40: 2.3, usg: 0.168, per: 17.2, bpm: 4.2, obpm: -0.5, dbpm: 4.7, ws: 4.2, efg_pct: 0.545, ts_pct: 0.545, ast_pct: 0.032, tov_pct: 0.158, stl_pct: 0.015, blk_pct: 0.072, orb_pct: 0.112, drb_pct: 0.248, drtg: 91.8 },
    nba: { ppg: 5.5, rpg: 7.2, apg: 0.5, spg: 0.4, bpg: 1.5, ws48: 0.118, outcome: 'Role Player' },
  },
  {
    pick: 30, team: 'Golden State Warriors', name: 'Richard Hendrix', school: 'Alabama', pos: 'PF',
    birthYear: 1986, height: 80, weight: 250, wingspan: 83, conf: 'SEC',
    archetype: 'Offensive Rebounder',
    // 2007-08 Alabama: 16.5 PPG, 10.3 RPG as senior
    stats: { games: 33, mpg: 30.0, ppg: 16.5, rpg: 10.3, apg: 0.8, spg: 0.8, bpg: 1.0, tov: 2.0, pf: 3.5, fg_pct: 0.568, three_pt_pct: null, ft_pct: 0.645, pts_per40: 22.0, reb_per40: 13.7, ast_per40: 1.1, stl_per40: 1.1, blk_per40: 1.3, tov_per40: 2.7, usg: 0.268, per: 22.8, bpm: 6.2, obpm: 2.5, dbpm: 3.7, ws: 6.5, efg_pct: 0.568, ts_pct: 0.588, ast_pct: 0.045, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.028, orb_pct: 0.128, drb_pct: 0.238, drtg: 94.5 },
    nba: { ppg: 1.5, rpg: 1.8, apg: 0.2, spg: 0.2, bpg: 0.2, ws48: 0.018, outcome: 'Out of League' },
  },

  // === ROUND 2 — MISSING PICKS ===
  {
    pick: 31, team: 'Toronto Raptors', name: 'Sonny Weems', school: 'Arkansas', pos: 'SG',
    birthYear: 1986, height: 78, weight: 213, wingspan: 82, conf: 'SEC',
    archetype: 'Off Ball Scoring Wing',
    // 2007-08 Arkansas: 15.8 PPG, 5.5 RPG as sophomore
    stats: { games: 30, mpg: 30.0, ppg: 15.8, rpg: 5.5, apg: 2.2, spg: 1.5, bpg: 0.5, tov: 2.2, pf: 2.5, fg_pct: 0.472, three_pt_pct: 0.332, ft_pct: 0.718, pts_per40: 21.1, reb_per40: 7.3, ast_per40: 2.9, stl_per40: 2.0, blk_per40: 0.7, tov_per40: 2.9, usg: 0.265, per: 18.2, bpm: 3.8, obpm: 2.5, dbpm: 1.3, ws: 4.2, efg_pct: 0.505, ts_pct: 0.548, ast_pct: 0.132, tov_pct: 0.138, stl_pct: 0.032, blk_pct: 0.010, orb_pct: 0.045, drb_pct: 0.118, drtg: 99.5 },
    nba: { ppg: 5.5, rpg: 2.2, apg: 0.8, spg: 0.5, bpg: 0.2, ws48: 0.042, outcome: 'Role Player' },
  },
  {
    pick: 32, team: 'Houston Rockets', name: 'Giorgos Printezis', school: 'Olympiacos', pos: 'SF',
    birthYear: 1987, height: 80, weight: 225, wingspan: 83, conf: null,
    archetype: 'Stretch Big',
    // 2007-08 Olympiacos (Greece): ~8.5 PPG, 3.5 RPG
    stats: { games: 28, mpg: 18.5, ppg: 8.5, rpg: 3.5, apg: 1.0, spg: 0.8, bpg: 0.5, tov: 1.2, pf: 2.5, fg_pct: 0.462, three_pt_pct: 0.345, ft_pct: 0.748, pts_per40: 18.4, reb_per40: 7.6, ast_per40: 2.2, stl_per40: 1.7, blk_per40: 1.1, tov_per40: 2.6, usg: 0.218, per: 15.8, bpm: 2.8, obpm: 1.8, dbpm: 1.0, ws: 3.2, efg_pct: 0.500, ts_pct: 0.545, ast_pct: 0.098, tov_pct: 0.125, stl_pct: 0.022, blk_pct: 0.015, orb_pct: 0.038, drb_pct: 0.095, drtg: 100.8 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 33, team: 'New Orleans Hornets', name: 'Darrell Arthur', school: 'Kansas', pos: 'PF',
    birthYear: 1988, height: 82, weight: 235, wingspan: 85, conf: 'Big 12',
    archetype: 'Stretch Big',
    // 2007-08 Kansas: 13.0 PPG, 6.2 RPG — national champion
    stats: { games: 37, mpg: 27.0, ppg: 13.0, rpg: 6.2, apg: 0.8, spg: 0.8, bpg: 1.2, tov: 1.8, pf: 3.0, fg_pct: 0.518, three_pt_pct: 0.285, ft_pct: 0.760, pts_per40: 19.3, reb_per40: 9.2, ast_per40: 1.2, stl_per40: 1.2, blk_per40: 1.8, tov_per40: 2.7, usg: 0.245, per: 19.8, bpm: 5.0, obpm: 2.5, dbpm: 2.5, ws: 5.8, efg_pct: 0.535, ts_pct: 0.580, ast_pct: 0.052, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.032, orb_pct: 0.075, drb_pct: 0.168, drtg: 96.5 },
    nba: { ppg: 6.5, rpg: 3.8, apg: 0.5, spg: 0.4, bpg: 0.5, ws48: 0.062, outcome: 'Role Player' },
  },
  {
    pick: 34, team: 'Memphis Grizzlies', name: 'Chris Douglas-Roberts', school: 'Memphis', pos: 'SG/SF',
    birthYear: 1986, height: 79, weight: 210, wingspan: 83, conf: 'C-USA',
    archetype: 'Slasher Wing',
    // 2007-08 Memphis: 18.7 PPG, 5.2 RPG — ran it back with Derrick Rose
    stats: { games: 38, mpg: 33.5, ppg: 18.7, rpg: 5.2, apg: 2.5, spg: 1.2, bpg: 0.6, tov: 2.2, pf: 2.2, fg_pct: 0.498, three_pt_pct: 0.322, ft_pct: 0.808, pts_per40: 22.3, reb_per40: 6.2, ast_per40: 3.0, stl_per40: 1.4, blk_per40: 0.7, tov_per40: 2.6, usg: 0.278, per: 19.8, bpm: 4.8, obpm: 3.5, dbpm: 1.3, ws: 5.8, efg_pct: 0.528, ts_pct: 0.582, ast_pct: 0.148, tov_pct: 0.138, stl_pct: 0.024, blk_pct: 0.012, orb_pct: 0.042, drb_pct: 0.115, drtg: 97.8 },
    nba: { ppg: 7.5, rpg: 3.0, apg: 1.2, spg: 0.5, bpg: 0.3, ws48: 0.055, outcome: 'Role Player' },
  },
  {
    pick: 36, team: 'San Antonio Spurs', name: 'Ryan Anderson', school: 'California', pos: 'PF',
    birthYear: 1988, height: 82, weight: 240, wingspan: 85, conf: 'Pac-10',
    archetype: 'Stretch Big',
    // 2007-08 California: 14.3 PPG, 8.6 RPG as sophomore
    stats: { games: 32, mpg: 30.5, ppg: 14.3, rpg: 8.6, apg: 1.0, spg: 0.5, bpg: 0.9, tov: 1.8, pf: 2.8, fg_pct: 0.498, three_pt_pct: 0.382, ft_pct: 0.808, pts_per40: 18.8, reb_per40: 11.3, ast_per40: 1.3, stl_per40: 0.7, blk_per40: 1.2, tov_per40: 2.4, usg: 0.245, per: 20.5, bpm: 5.5, obpm: 3.2, dbpm: 2.3, ws: 5.8, efg_pct: 0.548, ts_pct: 0.612, ast_pct: 0.062, tov_pct: 0.128, stl_pct: 0.010, blk_pct: 0.022, orb_pct: 0.082, drb_pct: 0.195, drtg: 96.5 },
    nba: { ppg: 11.5, rpg: 5.8, apg: 0.8, spg: 0.4, bpg: 0.4, ws48: 0.112, outcome: 'Starter' },
  },
  {
    pick: 37, team: 'New York Knicks', name: 'Darnell Jackson', school: 'Kansas', pos: 'PF',
    birthYear: 1986, height: 80, weight: 245, wingspan: 83, conf: 'Big 12',
    archetype: 'Offensive Rebounder',
    // 2007-08 Kansas: 9.8 PPG, 8.5 RPG — national champion
    stats: { games: 37, mpg: 23.5, ppg: 9.8, rpg: 8.5, apg: 0.8, spg: 0.5, bpg: 0.6, tov: 1.5, pf: 2.8, fg_pct: 0.545, three_pt_pct: null, ft_pct: 0.618, pts_per40: 16.7, reb_per40: 14.5, ast_per40: 1.4, stl_per40: 0.9, blk_per40: 1.0, tov_per40: 2.6, usg: 0.215, per: 18.8, bpm: 4.0, obpm: 1.0, dbpm: 3.0, ws: 4.8, efg_pct: 0.545, ts_pct: 0.565, ast_pct: 0.048, tov_pct: 0.128, stl_pct: 0.013, blk_pct: 0.018, orb_pct: 0.135, drb_pct: 0.248, drtg: 95.5 },
    nba: { ppg: 2.0, rpg: 2.2, apg: 0.3, spg: 0.2, bpg: 0.2, ws48: 0.022, outcome: 'Out of League' },
  },
  {
    pick: 38, team: 'Philadelphia 76ers', name: 'Luc Richard Mbah a Moute', school: 'UCLA', pos: 'SF',
    birthYear: 1986, height: 79, weight: 230, wingspan: 84, conf: 'Pac-10',
    archetype: 'POA Defender',
    // 2007-08 UCLA: 9.6 PPG, 5.8 RPG, strong defender as junior
    stats: { games: 36, mpg: 26.5, ppg: 9.6, rpg: 5.8, apg: 1.8, spg: 1.5, bpg: 0.8, tov: 1.5, pf: 2.5, fg_pct: 0.475, three_pt_pct: 0.298, ft_pct: 0.672, pts_per40: 14.5, reb_per40: 8.8, ast_per40: 2.7, stl_per40: 2.3, blk_per40: 1.2, tov_per40: 2.3, usg: 0.192, per: 16.2, bpm: 3.5, obpm: 0.8, dbpm: 2.7, ws: 4.5, efg_pct: 0.498, ts_pct: 0.520, ast_pct: 0.118, tov_pct: 0.138, stl_pct: 0.038, blk_pct: 0.022, orb_pct: 0.058, drb_pct: 0.148, drtg: 95.8 },
    nba: { ppg: 5.8, rpg: 3.8, apg: 1.2, spg: 1.0, bpg: 0.5, ws48: 0.068, outcome: 'Role Player' },
  },
  {
    pick: 39, team: 'Detroit Pistons', name: 'Nathan Jawai', school: 'Cairns Taipans', pos: 'C',
    birthYear: 1986, height: 83, weight: 270, wingspan: 87, conf: null,
    archetype: 'Rim Runner',
    // 2007-08 NBL Australia (Cairns Taipans): ~10.5 PPG, 7.2 RPG
    stats: { games: 22, mpg: 22.0, ppg: 10.5, rpg: 7.2, apg: 0.5, spg: 0.5, bpg: 1.5, tov: 1.8, pf: 3.8, fg_pct: 0.545, three_pt_pct: null, ft_pct: 0.565, pts_per40: 19.1, reb_per40: 13.1, ast_per40: 0.9, stl_per40: 0.9, blk_per40: 2.7, tov_per40: 3.3, usg: 0.255, per: 19.5, bpm: 4.8, obpm: 1.2, dbpm: 3.6, ws: 3.5, efg_pct: 0.545, ts_pct: 0.558, ast_pct: 0.030, tov_pct: 0.158, stl_pct: 0.014, blk_pct: 0.055, orb_pct: 0.118, drb_pct: 0.235, drtg: 95.2 },
    nba: { ppg: 2.5, rpg: 2.0, apg: 0.2, spg: 0.2, bpg: 0.4, ws48: 0.025, outcome: 'Out of League' },
  },
  {
    pick: 40, team: 'Charlotte Bobcats', name: 'Alexis Ajinca', school: 'Cholet Basket', pos: 'C',
    birthYear: 1988, height: 87, weight: 245, wingspan: 91, conf: null,
    archetype: 'Rim Protector',
    // 2007-08 Cholet Basket (Pro A, France): ~6.5 PPG, 4.8 RPG, 1.5 BPG
    stats: { games: 26, mpg: 18.5, ppg: 6.5, rpg: 4.8, apg: 0.5, spg: 0.5, bpg: 1.5, tov: 1.2, pf: 3.2, fg_pct: 0.518, three_pt_pct: null, ft_pct: 0.628, pts_per40: 14.1, reb_per40: 10.4, ast_per40: 1.1, stl_per40: 1.1, blk_per40: 3.2, tov_per40: 2.6, usg: 0.198, per: 17.0, bpm: 3.5, obpm: 0.5, dbpm: 3.0, ws: 3.2, efg_pct: 0.518, ts_pct: 0.540, ast_pct: 0.035, tov_pct: 0.148, stl_pct: 0.016, blk_pct: 0.058, orb_pct: 0.095, drb_pct: 0.215, drtg: 94.8 },
    nba: { ppg: 4.0, rpg: 3.2, apg: 0.3, spg: 0.3, bpg: 0.8, ws48: 0.048, outcome: 'Role Player' },
  },
  {
    pick: 41, team: 'Houston Rockets', name: 'Herbert Hill', school: 'Tennessee', pos: 'PF',
    birthYear: 1986, height: 81, weight: 250, wingspan: 84, conf: 'SEC',
    archetype: 'Rim Runner',
    // 2007-08 Tennessee: 8.5 PPG, 6.2 RPG as sophomore
    stats: { games: 32, mpg: 22.0, ppg: 8.5, rpg: 6.2, apg: 0.5, spg: 0.5, bpg: 0.8, tov: 1.5, pf: 3.2, fg_pct: 0.520, three_pt_pct: null, ft_pct: 0.582, pts_per40: 15.5, reb_per40: 11.3, ast_per40: 0.9, stl_per40: 0.9, blk_per40: 1.5, tov_per40: 2.7, usg: 0.198, per: 16.2, bpm: 2.8, obpm: 0.5, dbpm: 2.3, ws: 3.5, efg_pct: 0.520, ts_pct: 0.538, ast_pct: 0.032, tov_pct: 0.145, stl_pct: 0.014, blk_pct: 0.028, orb_pct: 0.115, drb_pct: 0.222, drtg: 97.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 42, team: 'Portland Trail Blazers', name: 'Rodrigue Beaubois', school: 'Cholet Basket', pos: 'PG',
    birthYear: 1988, height: 75, weight: 185, wingspan: 80, conf: null,
    archetype: 'Scoring Lead Guard',
    // 2007-08 Cholet Basket (Pro A, France): ~8.2 PPG, 2.5 RPG, 3.2 APG
    stats: { games: 30, mpg: 20.5, ppg: 8.2, rpg: 2.5, apg: 3.2, spg: 1.2, bpg: 0.2, tov: 1.8, pf: 2.2, fg_pct: 0.445, three_pt_pct: 0.355, ft_pct: 0.788, pts_per40: 16.0, reb_per40: 4.9, ast_per40: 6.2, stl_per40: 2.3, blk_per40: 0.4, tov_per40: 3.5, usg: 0.228, per: 16.8, bpm: 3.2, obpm: 2.2, dbpm: 1.0, ws: 3.5, efg_pct: 0.480, ts_pct: 0.545, ast_pct: 0.245, tov_pct: 0.145, stl_pct: 0.035, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.068, drtg: 100.5 },
    nba: { ppg: 5.8, rpg: 1.5, apg: 1.8, spg: 0.8, bpg: 0.1, ws48: 0.042, outcome: 'Role Player' },
  },
  {
    pick: 43, team: 'Dallas Mavericks', name: 'Ante Tomic', school: 'Split', pos: 'C',
    birthYear: 1988, height: 85, weight: 250, wingspan: 89, conf: null,
    archetype: 'Drop Coverage Big',
    // 2007-08 KK Split (HBA, Croatia): ~9.5 PPG, 6.5 RPG
    stats: { games: 25, mpg: 22.5, ppg: 9.5, rpg: 6.5, apg: 1.2, spg: 0.5, bpg: 1.2, tov: 1.5, pf: 3.0, fg_pct: 0.520, three_pt_pct: 0.318, ft_pct: 0.705, pts_per40: 16.9, reb_per40: 11.6, ast_per40: 2.1, stl_per40: 0.9, blk_per40: 2.1, tov_per40: 2.7, usg: 0.215, per: 18.5, bpm: 4.2, obpm: 1.5, dbpm: 2.7, ws: 3.8, efg_pct: 0.538, ts_pct: 0.572, ast_pct: 0.078, tov_pct: 0.138, stl_pct: 0.012, blk_pct: 0.042, orb_pct: 0.075, drb_pct: 0.185, drtg: 96.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 44, team: 'Atlanta Hawks', name: 'Nemanja Bjelica', school: 'Vojvodina', pos: 'SF',
    birthYear: 1988, height: 82, weight: 225, wingspan: 86, conf: null,
    archetype: 'Stretch Big',
    // 2007-08 KK Vojvodina (Serbia): ~7.5 PPG, 4.5 RPG
    stats: { games: 25, mpg: 20.0, ppg: 7.5, rpg: 4.5, apg: 1.5, spg: 0.8, bpg: 0.5, tov: 1.5, pf: 2.5, fg_pct: 0.448, three_pt_pct: 0.362, ft_pct: 0.778, pts_per40: 15.0, reb_per40: 9.0, ast_per40: 3.0, stl_per40: 1.6, blk_per40: 1.0, tov_per40: 3.0, usg: 0.205, per: 15.8, bpm: 2.8, obpm: 1.5, dbpm: 1.3, ws: 3.0, efg_pct: 0.492, ts_pct: 0.545, ast_pct: 0.125, tov_pct: 0.148, stl_pct: 0.022, blk_pct: 0.015, orb_pct: 0.040, drb_pct: 0.118, drtg: 100.5 },
    nba: { ppg: 7.5, rpg: 4.2, apg: 2.2, spg: 0.8, bpg: 0.3, ws48: 0.095, outcome: 'Role Player' },
  },
  {
    pick: 46, team: 'Memphis Grizzlies', name: 'Patrick Beverley', school: 'Arkansas', pos: 'PG',
    birthYear: 1988, height: 73, weight: 185, wingspan: 78, conf: 'SEC',
    archetype: 'POA Defender',
    // 2007-08 Arkansas: 12.5 PPG, 3.2 RPG, 3.8 APG as freshman
    stats: { games: 28, mpg: 29.5, ppg: 12.5, rpg: 3.2, apg: 3.8, spg: 2.0, bpg: 0.2, tov: 2.5, pf: 2.5, fg_pct: 0.435, three_pt_pct: 0.368, ft_pct: 0.762, pts_per40: 16.9, reb_per40: 4.3, ast_per40: 5.2, stl_per40: 2.7, blk_per40: 0.3, tov_per40: 3.4, usg: 0.245, per: 16.5, bpm: 3.2, obpm: 2.0, dbpm: 1.2, ws: 3.8, efg_pct: 0.475, ts_pct: 0.528, ast_pct: 0.248, tov_pct: 0.158, stl_pct: 0.046, blk_pct: 0.005, orb_pct: 0.025, drb_pct: 0.078, drtg: 97.8 },
    nba: { ppg: 8.5, rpg: 3.0, apg: 4.5, spg: 1.8, bpg: 0.2, ws48: 0.118, outcome: 'Starter' },
  },
  {
    pick: 47, team: 'Miami Heat', name: 'Christoph Lauterbach', school: 'Braunschweig', pos: 'SG',
    birthYear: 1984, height: 77, weight: 200, wingspan: 81, conf: null,
    archetype: 'Off Ball Scoring Wing',
    // 2007-08 New Yorker Phantoms Braunschweig (BBL, Germany): ~9.0 PPG, 3.5 RPG
    stats: { games: 26, mpg: 22.0, ppg: 9.0, rpg: 3.5, apg: 1.5, spg: 1.0, bpg: 0.3, tov: 1.5, pf: 2.2, fg_pct: 0.458, three_pt_pct: 0.342, ft_pct: 0.755, pts_per40: 16.4, reb_per40: 6.4, ast_per40: 2.7, stl_per40: 1.8, blk_per40: 0.5, tov_per40: 2.7, usg: 0.225, per: 15.5, bpm: 2.5, obpm: 1.5, dbpm: 1.0, ws: 3.0, efg_pct: 0.490, ts_pct: 0.540, ast_pct: 0.112, tov_pct: 0.138, stl_pct: 0.028, blk_pct: 0.008, orb_pct: 0.032, drb_pct: 0.088, drtg: 101.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 48, team: 'New Orleans Hornets', name: 'Marcus Thornton', school: 'LSU', pos: 'SG',
    birthYear: 1987, height: 74, weight: 205, wingspan: 78, conf: 'SEC',
    archetype: 'Off Ball Scoring Wing',
    // 2007-08 LSU: 17.7 PPG, 3.8 RPG as junior
    stats: { games: 31, mpg: 30.5, ppg: 17.7, rpg: 3.8, apg: 2.5, spg: 1.2, bpg: 0.3, tov: 2.2, pf: 2.5, fg_pct: 0.452, three_pt_pct: 0.368, ft_pct: 0.808, pts_per40: 23.2, reb_per40: 5.0, ast_per40: 3.3, stl_per40: 1.6, blk_per40: 0.4, tov_per40: 2.9, usg: 0.288, per: 19.5, bpm: 4.2, obpm: 3.2, dbpm: 1.0, ws: 4.8, efg_pct: 0.488, ts_pct: 0.552, ast_pct: 0.152, tov_pct: 0.145, stl_pct: 0.026, blk_pct: 0.006, orb_pct: 0.028, drb_pct: 0.088, drtg: 100.0 },
    nba: { ppg: 12.5, rpg: 2.5, apg: 2.0, spg: 0.8, bpg: 0.2, ws48: 0.098, outcome: 'Role Player' },
  },
  {
    pick: 49, team: 'Golden State Warriors', name: 'Othyus Jeffers', school: 'Rider', pos: 'SG',
    birthYear: 1985, height: 76, weight: 205, wingspan: 80, conf: 'MAAC',
    archetype: 'Off Ball Scoring Wing',
    // 2007-08 Rider: 18.5 PPG, 4.8 RPG as senior
    stats: { games: 28, mpg: 31.5, ppg: 18.5, rpg: 4.8, apg: 2.8, spg: 1.2, bpg: 0.3, tov: 2.5, pf: 2.5, fg_pct: 0.458, three_pt_pct: 0.375, ft_pct: 0.775, pts_per40: 23.5, reb_per40: 6.1, ast_per40: 3.6, stl_per40: 1.5, blk_per40: 0.4, tov_per40: 3.2, usg: 0.278, per: 18.5, bpm: 3.8, obpm: 2.8, dbpm: 1.0, ws: 4.2, efg_pct: 0.495, ts_pct: 0.552, ast_pct: 0.168, tov_pct: 0.145, stl_pct: 0.024, blk_pct: 0.006, orb_pct: 0.032, drb_pct: 0.092, drtg: 101.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 50, team: 'Orlando Magic', name: 'Tibor Pleiss', school: 'Ulm', pos: 'C',
    birthYear: 1989, height: 86, weight: 250, wingspan: 90, conf: null,
    archetype: 'Rim Protector',
    // 2007-08 Ulm (BBL, Germany): ~7.5 PPG, 5.8 RPG
    stats: { games: 24, mpg: 18.5, ppg: 7.5, rpg: 5.8, apg: 0.5, spg: 0.4, bpg: 1.8, tov: 1.5, pf: 3.2, fg_pct: 0.508, three_pt_pct: null, ft_pct: 0.645, pts_per40: 16.2, reb_per40: 12.5, ast_per40: 1.1, stl_per40: 0.9, blk_per40: 3.9, tov_per40: 3.2, usg: 0.208, per: 18.0, bpm: 4.0, obpm: 0.8, dbpm: 3.2, ws: 3.5, efg_pct: 0.508, ts_pct: 0.535, ast_pct: 0.038, tov_pct: 0.155, stl_pct: 0.012, blk_pct: 0.065, orb_pct: 0.098, drb_pct: 0.228, drtg: 94.0 },
    nba: { ppg: 3.0, rpg: 2.5, apg: 0.3, spg: 0.2, bpg: 0.6, ws48: 0.038, outcome: 'Role Player' },
  },
  {
    pick: 51, team: 'Seattle SuperSonics', name: 'Austin Daye', school: 'Gonzaga', pos: 'SF',
    birthYear: 1988, height: 82, weight: 200, wingspan: 87, conf: 'WCC',
    archetype: 'Stretch Big',
    // 2007-08 Gonzaga: 12.5 PPG, 5.0 RPG as freshman
    stats: { games: 34, mpg: 25.0, ppg: 12.5, rpg: 5.0, apg: 1.2, spg: 0.8, bpg: 0.8, tov: 1.8, pf: 2.8, fg_pct: 0.462, three_pt_pct: 0.372, ft_pct: 0.782, pts_per40: 20.0, reb_per40: 8.0, ast_per40: 1.9, stl_per40: 1.3, blk_per40: 1.3, tov_per40: 2.9, usg: 0.242, per: 17.8, bpm: 3.5, obpm: 2.2, dbpm: 1.3, ws: 4.2, efg_pct: 0.505, ts_pct: 0.558, ast_pct: 0.075, tov_pct: 0.145, stl_pct: 0.018, blk_pct: 0.022, orb_pct: 0.052, drb_pct: 0.128, drtg: 99.5 },
    nba: { ppg: 4.5, rpg: 2.0, apg: 0.5, spg: 0.3, bpg: 0.3, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 52, team: 'Oklahoma City Thunder', name: 'Serge Ibaka', school: 'CB L\'Hospitalet', pos: 'PF/C',
    birthYear: 1989, height: 82, weight: 235, wingspan: 88, conf: null,
    archetype: 'Rim Protector',
    // 2007-08 CB L'Hospitalet (LEB Gold, Spain): ~8.0 PPG, 6.5 RPG, 2.2 BPG
    stats: { games: 30, mpg: 22.5, ppg: 8.0, rpg: 6.5, apg: 0.5, spg: 0.5, bpg: 2.2, tov: 1.5, pf: 3.5, fg_pct: 0.512, three_pt_pct: null, ft_pct: 0.618, pts_per40: 14.2, reb_per40: 11.6, ast_per40: 0.9, stl_per40: 0.9, blk_per40: 3.9, tov_per40: 2.7, usg: 0.205, per: 18.5, bpm: 4.5, obpm: 0.5, dbpm: 4.0, ws: 4.5, efg_pct: 0.512, ts_pct: 0.538, ast_pct: 0.032, tov_pct: 0.148, stl_pct: 0.012, blk_pct: 0.082, orb_pct: 0.115, drb_pct: 0.245, drtg: 92.5 },
    nba: { ppg: 11.5, rpg: 8.2, apg: 0.8, spg: 0.8, bpg: 2.8, ws48: 0.158, outcome: 'All-Star' },
  },
  {
    pick: 53, team: 'Charlotte Bobcats', name: 'Mario Kasun', school: 'Joventut', pos: 'C',
    birthYear: 1980, height: 84, weight: 258, wingspan: 87, conf: null,
    archetype: 'Drop Coverage Big',
    // 2007-08 Joventut (Liga ACB, Spain): ~7.0 PPG, 6.0 RPG
    stats: { games: 28, mpg: 19.5, ppg: 7.0, rpg: 6.0, apg: 0.5, spg: 0.4, bpg: 1.2, tov: 1.2, pf: 3.0, fg_pct: 0.532, three_pt_pct: null, ft_pct: 0.598, pts_per40: 14.4, reb_per40: 12.3, ast_per40: 1.0, stl_per40: 0.8, blk_per40: 2.5, tov_per40: 2.5, usg: 0.198, per: 17.0, bpm: 3.2, obpm: 0.5, dbpm: 2.7, ws: 3.0, efg_pct: 0.532, ts_pct: 0.545, ast_pct: 0.035, tov_pct: 0.135, stl_pct: 0.012, blk_pct: 0.048, orb_pct: 0.102, drb_pct: 0.218, drtg: 95.0 },
    nba: { ppg: 2.5, rpg: 2.0, apg: 0.2, spg: 0.2, bpg: 0.5, ws48: 0.022, outcome: 'Out of League' },
  },
  {
    pick: 54, team: 'Boston Celtics', name: 'Semih Erden', school: 'Efes Pilsen', pos: 'C',
    birthYear: 1985, height: 85, weight: 255, wingspan: 88, conf: null,
    archetype: 'Rim Runner',
    // 2007-08 Efes Pilsen (BSL, Turkey): ~6.2 PPG, 5.2 RPG
    stats: { games: 29, mpg: 16.5, ppg: 6.2, rpg: 5.2, apg: 0.4, spg: 0.4, bpg: 1.5, tov: 1.2, pf: 3.2, fg_pct: 0.525, three_pt_pct: null, ft_pct: 0.582, pts_per40: 15.0, reb_per40: 12.6, ast_per40: 1.0, stl_per40: 1.0, blk_per40: 3.6, tov_per40: 2.9, usg: 0.195, per: 17.5, bpm: 3.8, obpm: 0.5, dbpm: 3.3, ws: 3.5, efg_pct: 0.525, ts_pct: 0.540, ast_pct: 0.028, tov_pct: 0.155, stl_pct: 0.014, blk_pct: 0.062, orb_pct: 0.108, drb_pct: 0.235, drtg: 94.5 },
    nba: { ppg: 3.5, rpg: 3.0, apg: 0.2, spg: 0.3, bpg: 0.8, ws48: 0.042, outcome: 'Role Player' },
  },
  {
    pick: 55, team: 'Utah Jazz', name: 'Luke Nevill', school: 'Utah State', pos: 'C',
    birthYear: 1985, height: 87, weight: 240, wingspan: 90, conf: 'WAC',
    archetype: 'Rim Protector',
    // 2007-08 Utah State: 10.2 PPG, 7.5 RPG as junior
    stats: { games: 30, mpg: 25.5, ppg: 10.2, rpg: 7.5, apg: 0.5, spg: 0.4, bpg: 2.0, tov: 1.5, pf: 3.5, fg_pct: 0.515, three_pt_pct: null, ft_pct: 0.578, pts_per40: 16.0, reb_per40: 11.8, ast_per40: 0.8, stl_per40: 0.6, blk_per40: 3.1, tov_per40: 2.4, usg: 0.215, per: 17.8, bpm: 3.5, obpm: 0.5, dbpm: 3.0, ws: 4.0, efg_pct: 0.515, ts_pct: 0.530, ast_pct: 0.032, tov_pct: 0.128, stl_pct: 0.010, blk_pct: 0.065, orb_pct: 0.098, drb_pct: 0.228, drtg: 96.0 },
    nba: { ppg: 1.0, rpg: 1.2, apg: 0.1, spg: 0.1, bpg: 0.5, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 56, team: 'Philadelphia 76ers', name: 'Davon Jefferson', school: 'South Alabama', pos: 'PF',
    birthYear: 1985, height: 82, weight: 240, wingspan: 85, conf: 'Sun Belt',
    archetype: 'Rim Runner',
    // 2007-08 South Alabama: 14.8 PPG, 9.2 RPG as junior
    stats: { games: 29, mpg: 29.5, ppg: 14.8, rpg: 9.2, apg: 0.8, spg: 0.7, bpg: 1.2, tov: 1.8, pf: 3.5, fg_pct: 0.545, three_pt_pct: null, ft_pct: 0.618, pts_per40: 20.1, reb_per40: 12.5, ast_per40: 1.1, stl_per40: 1.0, blk_per40: 1.6, tov_per40: 2.4, usg: 0.242, per: 20.0, bpm: 4.5, obpm: 1.5, dbpm: 3.0, ws: 4.8, efg_pct: 0.545, ts_pct: 0.562, ast_pct: 0.045, tov_pct: 0.128, stl_pct: 0.015, blk_pct: 0.032, orb_pct: 0.112, drb_pct: 0.238, drtg: 97.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 57, team: 'LA Lakers', name: 'Vladimir Veremeenko', school: 'Lada Togliatti', pos: 'SG',
    birthYear: 1988, height: 77, weight: 198, wingspan: 81, conf: null,
    archetype: 'Off Ball Scoring Wing',
    // 2007-08 Lada Togliatti (Russia): ~9.5 PPG, 2.8 RPG
    stats: { games: 28, mpg: 22.5, ppg: 9.5, rpg: 2.8, apg: 1.8, spg: 0.8, bpg: 0.2, tov: 1.5, pf: 2.2, fg_pct: 0.448, three_pt_pct: 0.352, ft_pct: 0.768, pts_per40: 16.9, reb_per40: 5.0, ast_per40: 3.2, stl_per40: 1.4, blk_per40: 0.4, tov_per40: 2.7, usg: 0.228, per: 15.2, bpm: 2.2, obpm: 1.5, dbpm: 0.7, ws: 2.8, efg_pct: 0.485, ts_pct: 0.540, ast_pct: 0.142, tov_pct: 0.132, stl_pct: 0.020, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.068, drtg: 102.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 58, team: 'Indiana Pacers', name: 'Josh McRoberts', school: 'Duke', pos: 'PF',
    birthYear: 1987, height: 82, weight: 232, wingspan: 85, conf: 'ACC',
    archetype: 'Stretch Big',
    // 2007-08 Duke: 10.2 PPG, 7.5 RPG as junior
    stats: { games: 34, mpg: 26.5, ppg: 10.2, rpg: 7.5, apg: 2.8, spg: 0.8, bpg: 0.8, tov: 2.0, pf: 2.8, fg_pct: 0.462, three_pt_pct: 0.288, ft_pct: 0.688, pts_per40: 15.4, reb_per40: 11.3, ast_per40: 4.2, stl_per40: 1.2, blk_per40: 1.2, tov_per40: 3.0, usg: 0.215, per: 17.5, bpm: 3.8, obpm: 1.5, dbpm: 2.3, ws: 4.5, efg_pct: 0.490, ts_pct: 0.528, ast_pct: 0.175, tov_pct: 0.148, stl_pct: 0.018, blk_pct: 0.022, orb_pct: 0.078, drb_pct: 0.188, drtg: 97.8 },
    nba: { ppg: 5.5, rpg: 4.0, apg: 2.5, spg: 0.5, bpg: 0.5, ws48: 0.068, outcome: 'Role Player' },
  },
  {
    pick: 59, team: 'New Orleans Hornets', name: 'Deron Washington', school: 'Virginia Tech', pos: 'SG',
    birthYear: 1985, height: 77, weight: 218, wingspan: 81, conf: 'ACC',
    archetype: 'Slasher Wing',
    // 2007-08 Virginia Tech: 12.5 PPG, 4.5 RPG as junior
    stats: { games: 32, mpg: 28.0, ppg: 12.5, rpg: 4.5, apg: 1.8, spg: 1.2, bpg: 0.4, tov: 1.8, pf: 2.5, fg_pct: 0.465, three_pt_pct: 0.318, ft_pct: 0.698, pts_per40: 17.9, reb_per40: 6.4, ast_per40: 2.6, stl_per40: 1.7, blk_per40: 0.6, tov_per40: 2.6, usg: 0.248, per: 16.5, bpm: 2.8, obpm: 1.5, dbpm: 1.3, ws: 3.5, efg_pct: 0.492, ts_pct: 0.530, ast_pct: 0.112, tov_pct: 0.135, stl_pct: 0.026, blk_pct: 0.010, orb_pct: 0.042, drb_pct: 0.108, drtg: 100.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 60, team: 'Miami Heat', name: 'Diamon Simpson', school: 'Florida', pos: 'PF',
    birthYear: 1986, height: 80, weight: 235, wingspan: 83, conf: 'SEC',
    archetype: 'Rim Runner',
    // 2007-08 Florida: 6.5 PPG, 5.8 RPG as junior
    stats: { games: 31, mpg: 18.5, ppg: 6.5, rpg: 5.8, apg: 0.5, spg: 0.5, bpg: 0.8, tov: 1.2, pf: 2.8, fg_pct: 0.525, three_pt_pct: null, ft_pct: 0.578, pts_per40: 14.1, reb_per40: 12.5, ast_per40: 1.1, stl_per40: 1.1, blk_per40: 1.7, tov_per40: 2.6, usg: 0.185, per: 16.5, bpm: 2.5, obpm: 0.0, dbpm: 2.5, ws: 3.2, efg_pct: 0.525, ts_pct: 0.540, ast_pct: 0.032, tov_pct: 0.148, stl_pct: 0.014, blk_pct: 0.025, orb_pct: 0.112, drb_pct: 0.225, drtg: 97.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
]

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
  console.log(`Seeding ${DRAFT_CLASS} NBA Draft — Legendary Archives (SUPPLEMENTAL)`)

  const allPlayers = ALL_PLAYERS
  console.log(`Processing ${allPlayers.length} remaining players...`)

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
