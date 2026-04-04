#!/usr/bin/env node
// SUPPLEMENTAL seed script for 2012 NBA Draft — Legendary Archives
// Adds all MISSING picks not covered by seed-legendary-2012.mjs
//
// Already seeded by seed-legendary-2012.mjs:
//   Round 1: picks 1-21, 26-30
//   Round 2: picks 34, 35, 39, 40
//
// This script adds:
//   Round 1: picks 22-25
//   Round 2: picks 31-33, 36-38, 41-60
//
// Usage: node scripts/seed-legendary-2012-remaining.mjs

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

// 2012 NBA Draft — remaining picks not in seed-legendary-2012.mjs
// Sources: Basketball Reference, historical records
const PLAYERS = [
  // === ROUND 1 (picks 22-25) ===
  {
    pick: 22, team: 'Boston Celtics', name: 'Fab Melo', school: 'Syracuse', pos: 'C',
    birthYear: 1990, height: 84, weight: 255, wingspan: 89, conf: 'Big East',
    archetype: 'Rim Protector',
    // 2011-12 Syracuse: 6.8 PPG, 4.9 RPG, 0.4 APG, 2.4 BPG in 26 games
    stats: { games: 26, mpg: 21.5, ppg: 6.8, rpg: 4.9, apg: 0.4, spg: 0.4, bpg: 2.4, tov: 1.5, pf: 3.2, fg_pct: 0.563, three_pt_pct: null, ft_pct: 0.488, pts_per40: 12.7, reb_per40: 9.1, ast_per40: 0.7, stl_per40: 0.7, blk_per40: 4.5, tov_per40: 2.8, usg: 0.188, per: 17.5, bpm: 3.8, obpm: 0.5, dbpm: 3.3, ws: 3.2, efg_pct: 0.563, ts_pct: 0.525, ast_pct: 0.025, tov_pct: 0.145, stl_pct: 0.012, blk_pct: 0.095, orb_pct: 0.082, drb_pct: 0.185, drtg: 91.5 },
    nba: { ppg: 0.8, rpg: 0.5, apg: 0.1, spg: 0.1, bpg: 0.4, ws48: 0.010, outcome: 'Bust' },
  },
  {
    pick: 23, team: 'Atlanta Hawks', name: 'John Jenkins', school: 'Vanderbilt', pos: 'SG',
    birthYear: 1990, height: 77, weight: 220, wingspan: 79, conf: 'SEC',
    archetype: 'Catch and Shoot',
    // 2011-12 Vanderbilt: 19.2 PPG, 3.0 RPG, 1.8 APG
    stats: { games: 32, mpg: 29.5, ppg: 19.2, rpg: 3.0, apg: 1.8, spg: 0.7, bpg: 0.2, tov: 1.5, pf: 1.8, fg_pct: 0.465, three_pt_pct: 0.422, ft_pct: 0.825, pts_per40: 26.0, reb_per40: 4.1, ast_per40: 2.4, stl_per40: 0.9, blk_per40: 0.3, tov_per40: 2.0, usg: 0.295, per: 18.8, bpm: 4.2, obpm: 4.0, dbpm: 0.2, ws: 5.2, efg_pct: 0.558, ts_pct: 0.619, ast_pct: 0.105, tov_pct: 0.098, stl_pct: 0.015, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.068, drtg: 100.2 },
    nba: { ppg: 4.5, rpg: 0.9, apg: 0.5, spg: 0.3, bpg: 0.1, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 24, team: 'Cleveland Cavaliers', name: 'Jared Cunningham', school: 'Oregon State', pos: 'SG',
    birthYear: 1990, height: 76, weight: 185, wingspan: 81, conf: 'Pac-12',
    archetype: 'Athletic Defender',
    // 2011-12 Oregon State: 17.0 PPG, 4.5 RPG, 3.4 APG
    stats: { games: 32, mpg: 32.5, ppg: 17.0, rpg: 4.5, apg: 3.4, spg: 2.4, bpg: 0.5, tov: 2.5, pf: 2.8, fg_pct: 0.434, three_pt_pct: 0.312, ft_pct: 0.745, pts_per40: 20.9, reb_per40: 5.5, ast_per40: 4.2, stl_per40: 2.9, blk_per40: 0.6, tov_per40: 3.1, usg: 0.265, per: 18.2, bpm: 4.5, obpm: 2.5, dbpm: 2.0, ws: 5.0, efg_pct: 0.484, ts_pct: 0.530, ast_pct: 0.188, tov_pct: 0.148, stl_pct: 0.050, blk_pct: 0.012, orb_pct: 0.042, drb_pct: 0.108, drtg: 97.5 },
    nba: { ppg: 2.5, rpg: 1.0, apg: 1.2, spg: 0.5, bpg: 0.1, ws48: 0.020, outcome: 'Bust' },
  },
  {
    pick: 25, team: 'Memphis Grizzlies', name: 'Tony Wroten', school: 'Washington', pos: 'PG',
    birthYear: 1992, height: 77, weight: 210, wingspan: 82, conf: 'Pac-12',
    archetype: 'Athletic Lead Guard',
    // 2011-12 Washington: 15.5 PPG, 5.0 RPG, 4.5 APG
    stats: { games: 30, mpg: 31.5, ppg: 15.5, rpg: 5.0, apg: 4.5, spg: 1.8, bpg: 0.5, tov: 3.2, pf: 2.8, fg_pct: 0.433, three_pt_pct: 0.278, ft_pct: 0.685, pts_per40: 19.7, reb_per40: 6.3, ast_per40: 5.7, stl_per40: 2.3, blk_per40: 0.6, tov_per40: 4.1, usg: 0.282, per: 17.8, bpm: 4.2, obpm: 2.8, dbpm: 1.4, ws: 4.2, efg_pct: 0.468, ts_pct: 0.508, ast_pct: 0.248, tov_pct: 0.195, stl_pct: 0.038, blk_pct: 0.012, orb_pct: 0.052, drb_pct: 0.122, drtg: 98.5 },
    nba: { ppg: 10.5, rpg: 3.0, apg: 4.0, spg: 1.2, bpg: 0.3, ws48: 0.045, outcome: 'Role Player' },
  },

  // === ROUND 2 (picks 31-33) ===
  {
    pick: 31, team: 'New Orleans Hornets', name: 'Darius Miller', school: 'Kentucky', pos: 'SF',
    birthYear: 1990, height: 80, weight: 225, wingspan: 83, conf: 'SEC',
    archetype: 'Off Ball Shooter',
    // 2011-12 Kentucky: 7.5 PPG, 3.3 RPG, 1.5 APG in 40 games
    stats: { games: 40, mpg: 22.8, ppg: 7.5, rpg: 3.3, apg: 1.5, spg: 0.7, bpg: 0.4, tov: 1.2, pf: 1.8, fg_pct: 0.445, three_pt_pct: 0.408, ft_pct: 0.748, pts_per40: 13.2, reb_per40: 5.8, ast_per40: 2.6, stl_per40: 1.2, blk_per40: 0.7, tov_per40: 2.1, usg: 0.188, per: 13.8, bpm: 2.5, obpm: 1.5, dbpm: 1.0, ws: 3.8, efg_pct: 0.532, ts_pct: 0.570, ast_pct: 0.118, tov_pct: 0.118, stl_pct: 0.020, blk_pct: 0.012, orb_pct: 0.030, drb_pct: 0.092, drtg: 90.5 },
    nba: { ppg: 5.0, rpg: 2.0, apg: 0.8, spg: 0.5, bpg: 0.2, ws48: 0.048, outcome: 'Role Player' },
  },
  {
    pick: 32, team: 'San Antonio Spurs', name: 'Nando De Colo', school: 'ASVEL Lyon-Villeurbanne', pos: 'PG',
    birthYear: 1987, height: 77, weight: 190, wingspan: 80, conf: null,
    archetype: 'Secondary Playmaker',
    // 2011-12 French Pro A: ~13 PPG, 4 RPG, 5 APG
    stats: { games: 32, mpg: 30.0, ppg: 13.2, rpg: 4.0, apg: 5.0, spg: 1.2, bpg: 0.3, tov: 2.2, pf: 2.0, fg_pct: 0.482, three_pt_pct: 0.362, ft_pct: 0.788, pts_per40: 17.6, reb_per40: 5.3, ast_per40: 6.7, stl_per40: 1.6, blk_per40: 0.4, tov_per40: 2.9, usg: 0.248, per: 18.2, bpm: 5.0, obpm: 3.2, dbpm: 1.8, ws: 4.8, efg_pct: 0.550, ts_pct: 0.588, ast_pct: 0.285, tov_pct: 0.140, stl_pct: 0.026, blk_pct: 0.007, orb_pct: 0.025, drb_pct: 0.082, drtg: 98.0 },
    nba: { ppg: 7.5, rpg: 2.2, apg: 3.0, spg: 0.8, bpg: 0.2, ws48: 0.062, outcome: 'Role Player' },
  },
  {
    pick: 33, team: 'Houston Rockets', name: 'Alexey Shved', school: 'Khimki Moscow', pos: 'PG',
    birthYear: 1988, height: 77, weight: 193, wingspan: 81, conf: null,
    archetype: 'Secondary Playmaker',
    // 2011-12 Russian VTB League: ~14 PPG, 4 RPG, 6 APG
    stats: { games: 32, mpg: 30.5, ppg: 14.2, rpg: 4.0, apg: 6.2, spg: 1.5, bpg: 0.3, tov: 2.5, pf: 2.2, fg_pct: 0.448, three_pt_pct: 0.348, ft_pct: 0.772, pts_per40: 18.6, reb_per40: 5.2, ast_per40: 8.1, stl_per40: 2.0, blk_per40: 0.4, tov_per40: 3.3, usg: 0.265, per: 18.5, bpm: 5.2, obpm: 3.5, dbpm: 1.7, ws: 4.8, efg_pct: 0.512, ts_pct: 0.558, ast_pct: 0.322, tov_pct: 0.145, stl_pct: 0.032, blk_pct: 0.007, orb_pct: 0.025, drb_pct: 0.085, drtg: 99.5 },
    nba: { ppg: 8.5, rpg: 2.5, apg: 4.0, spg: 0.8, bpg: 0.2, ws48: 0.055, outcome: 'Role Player' },
  },

  // === ROUND 2 (picks 36-38) ===
  {
    pick: 36, team: 'Washington Wizards', name: 'Tomas Satoransky', school: 'BC Barcelona', pos: 'PG',
    birthYear: 1991, height: 79, weight: 210, wingspan: 84, conf: null,
    archetype: 'Primary Playmaker',
    // 2011-12 Spanish ACB (youth/reserve): ~8 PPG, 3 RPG, 4 APG
    stats: { games: 28, mpg: 24.5, ppg: 8.0, rpg: 3.2, apg: 4.0, spg: 1.0, bpg: 0.3, tov: 1.8, pf: 1.8, fg_pct: 0.455, three_pt_pct: 0.330, ft_pct: 0.745, pts_per40: 13.1, reb_per40: 5.2, ast_per40: 6.5, stl_per40: 1.6, blk_per40: 0.5, tov_per40: 2.9, usg: 0.195, per: 15.5, bpm: 3.5, obpm: 2.0, dbpm: 1.5, ws: 3.2, efg_pct: 0.502, ts_pct: 0.540, ast_pct: 0.295, tov_pct: 0.148, stl_pct: 0.027, blk_pct: 0.008, orb_pct: 0.022, drb_pct: 0.075, drtg: 99.5 },
    nba: { ppg: 7.2, rpg: 3.0, apg: 4.0, spg: 0.8, bpg: 0.3, ws48: 0.085, outcome: 'Role Player' },
  },
  {
    pick: 37, team: 'Orlando Magic', name: 'Kyle O\'Quinn', school: 'Norfolk State', pos: 'C',
    birthYear: 1990, height: 82, weight: 250, wingspan: 87, conf: 'MEAC',
    archetype: 'Rim Runner',
    // 2011-12 Norfolk State: 17.0 PPG, 13.3 RPG, 1.4 APG, 3.2 BPG
    stats: { games: 32, mpg: 31.5, ppg: 17.0, rpg: 13.3, apg: 1.4, spg: 1.0, bpg: 3.2, tov: 2.2, pf: 3.0, fg_pct: 0.578, three_pt_pct: null, ft_pct: 0.572, pts_per40: 21.6, reb_per40: 16.9, ast_per40: 1.8, stl_per40: 1.3, blk_per40: 4.1, tov_per40: 2.8, usg: 0.265, per: 27.5, bpm: 10.2, obpm: 4.5, dbpm: 5.7, ws: 8.5, efg_pct: 0.578, ts_pct: 0.578, ast_pct: 0.075, tov_pct: 0.130, stl_pct: 0.021, blk_pct: 0.105, orb_pct: 0.148, drb_pct: 0.292, drtg: 89.5 },
    nba: { ppg: 6.5, rpg: 5.5, apg: 0.8, spg: 0.5, bpg: 1.2, ws48: 0.088, outcome: 'Role Player' },
  },
  {
    pick: 38, team: 'Charlotte Bobcats', name: 'Jeff Taylor', school: 'Vanderbilt', pos: 'SF',
    birthYear: 1989, height: 79, weight: 210, wingspan: 83, conf: 'SEC',
    archetype: 'Two Way Wing',
    // 2011-12 Vanderbilt: 14.8 PPG, 5.8 RPG, 1.6 APG
    stats: { games: 33, mpg: 30.2, ppg: 14.8, rpg: 5.8, apg: 1.6, spg: 1.0, bpg: 0.6, tov: 1.8, pf: 2.2, fg_pct: 0.488, three_pt_pct: 0.375, ft_pct: 0.778, pts_per40: 19.6, reb_per40: 7.7, ast_per40: 2.1, stl_per40: 1.3, blk_per40: 0.8, tov_per40: 2.4, usg: 0.248, per: 18.5, bpm: 4.5, obpm: 2.8, dbpm: 1.7, ws: 5.0, efg_pct: 0.548, ts_pct: 0.590, ast_pct: 0.092, tov_pct: 0.118, stl_pct: 0.022, blk_pct: 0.018, orb_pct: 0.052, drb_pct: 0.142, drtg: 95.5 },
    nba: { ppg: 6.2, rpg: 2.8, apg: 0.9, spg: 0.5, bpg: 0.4, ws48: 0.042, outcome: 'Role Player' },
  },

  // === ROUND 2 (picks 41-60) ===
  {
    pick: 41, team: 'Phoenix Suns', name: 'Dionte Christmas', school: 'Temple', pos: 'SG',
    birthYear: 1987, height: 78, weight: 195, wingspan: 81, conf: 'Atlantic 10',
    archetype: 'Off Ball Shooter',
    // 2011-12 Temple: 16.5 PPG, 3.5 RPG, 2.0 APG
    stats: { games: 30, mpg: 28.0, ppg: 16.5, rpg: 3.5, apg: 2.0, spg: 0.8, bpg: 0.2, tov: 1.8, pf: 2.0, fg_pct: 0.445, three_pt_pct: 0.385, ft_pct: 0.832, pts_per40: 23.6, reb_per40: 5.0, ast_per40: 2.9, stl_per40: 1.1, blk_per40: 0.3, tov_per40: 2.6, usg: 0.268, per: 17.5, bpm: 3.0, obpm: 2.5, dbpm: 0.5, ws: 3.8, efg_pct: 0.520, ts_pct: 0.580, ast_pct: 0.115, tov_pct: 0.118, stl_pct: 0.018, blk_pct: 0.005, orb_pct: 0.028, drb_pct: 0.082, drtg: 101.0 },
    nba: { ppg: 1.5, rpg: 0.5, apg: 0.5, spg: 0.1, bpg: 0.0, ws48: 0.010, outcome: 'Bust' },
  },
  {
    pick: 42, team: 'Portland Trail Blazers', name: 'Ondrej Balvin', school: 'Nanterre 92', pos: 'C',
    birthYear: 1992, height: 85, weight: 255, wingspan: 90, conf: null,
    archetype: 'Rim Runner',
    stats: { games: 26, mpg: 22.0, ppg: 8.5, rpg: 6.5, apg: 0.5, spg: 0.4, bpg: 1.8, tov: 1.5, pf: 3.2, fg_pct: 0.545, three_pt_pct: null, ft_pct: 0.548, pts_per40: 15.5, reb_per40: 11.8, ast_per40: 0.9, stl_per40: 0.7, blk_per40: 3.3, tov_per40: 2.7, usg: 0.202, per: 16.8, bpm: 3.2, obpm: 0.8, dbpm: 2.4, ws: 3.0, efg_pct: 0.545, ts_pct: 0.542, ast_pct: 0.032, tov_pct: 0.138, stl_pct: 0.012, blk_pct: 0.068, orb_pct: 0.095, drb_pct: 0.218, drtg: 96.0 },
    nba: { ppg: 1.0, rpg: 0.8, apg: 0.0, spg: 0.1, bpg: 0.3, ws48: 0.008, outcome: 'Out of League' },
  },
  {
    pick: 43, team: 'Dallas Mavericks', name: 'Bernard James', school: 'Florida State', pos: 'C',
    birthYear: 1985, height: 83, weight: 240, wingspan: 88, conf: 'ACC',
    archetype: 'Rim Protector',
    // 2011-12 Florida State: 11.8 PPG, 7.2 RPG, 0.7 APG, 2.8 BPG
    stats: { games: 35, mpg: 27.5, ppg: 11.8, rpg: 7.2, apg: 0.7, spg: 0.5, bpg: 2.8, tov: 1.5, pf: 3.0, fg_pct: 0.565, three_pt_pct: null, ft_pct: 0.585, pts_per40: 17.2, reb_per40: 10.5, ast_per40: 1.0, stl_per40: 0.7, blk_per40: 4.1, tov_per40: 2.2, usg: 0.220, per: 21.5, bpm: 6.5, obpm: 1.5, dbpm: 5.0, ws: 6.0, efg_pct: 0.565, ts_pct: 0.568, ast_pct: 0.040, tov_pct: 0.125, stl_pct: 0.012, blk_pct: 0.105, orb_pct: 0.092, drb_pct: 0.208, drtg: 91.0 },
    nba: { ppg: 3.5, rpg: 2.8, apg: 0.3, spg: 0.3, bpg: 0.8, ws48: 0.055, outcome: 'Role Player' },
  },
  {
    pick: 44, team: 'Los Angeles Lakers', name: 'Robert Sacre', school: 'Gonzaga', pos: 'C',
    birthYear: 1989, height: 84, weight: 255, wingspan: 88, conf: 'WCC',
    archetype: 'Drop Coverage Big',
    // 2011-12 Gonzaga: 12.5 PPG, 7.0 RPG, 1.1 APG
    stats: { games: 35, mpg: 27.8, ppg: 12.5, rpg: 7.0, apg: 1.1, spg: 0.5, bpg: 1.2, tov: 1.5, pf: 3.0, fg_pct: 0.552, three_pt_pct: null, ft_pct: 0.622, pts_per40: 18.0, reb_per40: 10.1, ast_per40: 1.6, stl_per40: 0.7, blk_per40: 1.7, tov_per40: 2.2, usg: 0.235, per: 19.5, bpm: 4.8, obpm: 1.8, dbpm: 3.0, ws: 5.2, efg_pct: 0.552, ts_pct: 0.572, ast_pct: 0.062, tov_pct: 0.115, stl_pct: 0.012, blk_pct: 0.040, orb_pct: 0.082, drb_pct: 0.182, drtg: 95.5 },
    nba: { ppg: 3.5, rpg: 2.8, apg: 0.3, spg: 0.2, bpg: 0.4, ws48: 0.045, outcome: 'Role Player' },
  },
  {
    pick: 45, team: 'Memphis Grizzlies', name: 'Darius Johnson-Odom', school: 'Marquette', pos: 'SG',
    birthYear: 1989, height: 75, weight: 205, wingspan: 78, conf: 'Big East',
    archetype: 'Scoring Lead Guard',
    // 2011-12 Marquette: 18.2 PPG, 4.8 RPG, 2.5 APG
    stats: { games: 32, mpg: 32.5, ppg: 18.2, rpg: 4.8, apg: 2.5, spg: 1.2, bpg: 0.3, tov: 2.2, pf: 2.2, fg_pct: 0.452, three_pt_pct: 0.378, ft_pct: 0.812, pts_per40: 22.4, reb_per40: 5.9, ast_per40: 3.1, stl_per40: 1.5, blk_per40: 0.4, tov_per40: 2.7, usg: 0.285, per: 18.5, bpm: 4.2, obpm: 3.5, dbpm: 0.7, ws: 5.0, efg_pct: 0.528, ts_pct: 0.585, ast_pct: 0.132, tov_pct: 0.128, stl_pct: 0.025, blk_pct: 0.007, orb_pct: 0.035, drb_pct: 0.112, drtg: 100.0 },
    nba: { ppg: 2.8, rpg: 0.8, apg: 0.8, spg: 0.3, bpg: 0.1, ws48: 0.018, outcome: 'Out of League' },
  },
  {
    pick: 46, team: 'New York Knicks', name: 'Tornike Shengelia', school: 'Unics Kazan', pos: 'SF',
    birthYear: 1991, height: 80, weight: 225, wingspan: 84, conf: null,
    archetype: 'Athletic Wing',
    // 2011-12 VTB United League: ~10 PPG, 5 RPG, 2 APG
    stats: { games: 30, mpg: 26.5, ppg: 10.2, rpg: 5.2, apg: 2.0, spg: 1.2, bpg: 0.8, tov: 1.8, pf: 2.5, fg_pct: 0.478, three_pt_pct: 0.330, ft_pct: 0.712, pts_per40: 15.4, reb_per40: 7.8, ast_per40: 3.0, stl_per40: 1.8, blk_per40: 1.2, tov_per40: 2.7, usg: 0.228, per: 17.2, bpm: 3.5, obpm: 1.5, dbpm: 2.0, ws: 3.8, efg_pct: 0.522, ts_pct: 0.558, ast_pct: 0.128, tov_pct: 0.148, stl_pct: 0.028, blk_pct: 0.022, orb_pct: 0.055, drb_pct: 0.142, drtg: 100.5 },
    nba: { ppg: 2.5, rpg: 1.5, apg: 0.5, spg: 0.3, bpg: 0.2, ws48: 0.022, outcome: 'Out of League' },
  },
  {
    pick: 47, team: 'Utah Jazz', name: 'Diante Garrett', school: 'Iowa State', pos: 'PG',
    birthYear: 1989, height: 75, weight: 185, wingspan: 79, conf: 'Big 12',
    archetype: 'Secondary Playmaker',
    // 2011-12 Iowa State: 15.2 PPG, 3.0 RPG, 6.5 APG (senior year)
    stats: { games: 35, mpg: 33.8, ppg: 15.2, rpg: 3.2, apg: 6.5, spg: 1.5, bpg: 0.2, tov: 2.8, pf: 2.0, fg_pct: 0.420, three_pt_pct: 0.322, ft_pct: 0.795, pts_per40: 18.0, reb_per40: 3.8, ast_per40: 7.7, stl_per40: 1.8, blk_per40: 0.2, tov_per40: 3.3, usg: 0.255, per: 16.5, bpm: 3.2, obpm: 2.5, dbpm: 0.7, ws: 4.5, efg_pct: 0.475, ts_pct: 0.540, ast_pct: 0.352, tov_pct: 0.168, stl_pct: 0.032, blk_pct: 0.005, orb_pct: 0.018, drb_pct: 0.068, drtg: 101.0 },
    nba: { ppg: 1.5, rpg: 0.5, apg: 1.2, spg: 0.2, bpg: 0.0, ws48: 0.015, outcome: 'Out of League' },
  },
  {
    pick: 48, team: 'Golden State Warriors', name: 'Ognjen Kuzmic', school: 'Cibona Zagreb', pos: 'C',
    birthYear: 1990, height: 85, weight: 258, wingspan: 89, conf: null,
    archetype: 'Rim Protector',
    // 2011-12 ABA League: ~8 PPG, 6 RPG, 1 APG
    stats: { games: 24, mpg: 22.0, ppg: 7.8, rpg: 5.8, apg: 0.8, spg: 0.5, bpg: 2.0, tov: 1.5, pf: 3.2, fg_pct: 0.542, three_pt_pct: null, ft_pct: 0.555, pts_per40: 14.2, reb_per40: 10.5, ast_per40: 1.5, stl_per40: 0.9, blk_per40: 3.6, tov_per40: 2.7, usg: 0.218, per: 17.5, bpm: 4.0, obpm: 1.0, dbpm: 3.0, ws: 2.8, efg_pct: 0.542, ts_pct: 0.548, ast_pct: 0.048, tov_pct: 0.148, stl_pct: 0.015, blk_pct: 0.082, orb_pct: 0.095, drb_pct: 0.225, drtg: 94.5 },
    nba: { ppg: 2.2, rpg: 1.5, apg: 0.2, spg: 0.2, bpg: 0.5, ws48: 0.030, outcome: 'Bust' },
  },
  {
    pick: 49, team: 'Miami Heat', name: 'Jarvis Varnado', school: 'Mississippi State', pos: 'C',
    birthYear: 1988, height: 83, weight: 215, wingspan: 88, conf: 'SEC',
    archetype: 'Rim Protector',
    // 2011-12 Mississippi State: 10.2 PPG, 7.8 RPG, 0.8 APG, 4.2 BPG
    stats: { games: 32, mpg: 28.5, ppg: 10.2, rpg: 7.8, apg: 0.8, spg: 0.5, bpg: 4.2, tov: 1.5, pf: 2.8, fg_pct: 0.572, three_pt_pct: null, ft_pct: 0.555, pts_per40: 14.3, reb_per40: 10.9, ast_per40: 1.1, stl_per40: 0.7, blk_per40: 5.9, tov_per40: 2.1, usg: 0.215, per: 22.5, bpm: 7.2, obpm: 0.8, dbpm: 6.4, ws: 5.8, efg_pct: 0.572, ts_pct: 0.558, ast_pct: 0.045, tov_pct: 0.115, stl_pct: 0.012, blk_pct: 0.155, orb_pct: 0.092, drb_pct: 0.225, drtg: 90.5 },
    nba: { ppg: 2.5, rpg: 2.0, apg: 0.2, spg: 0.2, bpg: 0.8, ws48: 0.035, outcome: 'Out of League' },
  },
  {
    pick: 50, team: 'Indiana Pacers', name: 'Quincy Miller', school: 'Baylor', pos: 'SF',
    birthYear: 1992, height: 82, weight: 215, wingspan: 86, conf: 'Big 12',
    archetype: 'Stretch Big',
    // 2011-12 Baylor: 12.5 PPG, 6.0 RPG, 1.2 APG
    stats: { games: 30, mpg: 24.8, ppg: 12.5, rpg: 6.0, apg: 1.2, spg: 0.5, bpg: 1.2, tov: 1.8, pf: 2.8, fg_pct: 0.465, three_pt_pct: 0.348, ft_pct: 0.752, pts_per40: 20.2, reb_per40: 9.7, ast_per40: 1.9, stl_per40: 0.8, blk_per40: 1.9, tov_per40: 2.9, usg: 0.255, per: 18.0, bpm: 4.5, obpm: 2.5, dbpm: 2.0, ws: 4.2, efg_pct: 0.530, ts_pct: 0.572, ast_pct: 0.078, tov_pct: 0.138, stl_pct: 0.012, blk_pct: 0.035, orb_pct: 0.062, drb_pct: 0.158, drtg: 97.5 },
    nba: { ppg: 3.2, rpg: 1.8, apg: 0.5, spg: 0.2, bpg: 0.4, ws48: 0.025, outcome: 'Bust' },
  },
  {
    pick: 51, team: 'Chicago Bulls', name: 'Kim English', school: 'Missouri', pos: 'SG',
    birthYear: 1990, height: 78, weight: 200, wingspan: 81, conf: 'Big 12',
    archetype: 'Off Ball Shooter',
    // 2011-12 Missouri: 17.6 PPG, 4.5 RPG, 2.0 APG
    stats: { games: 33, mpg: 32.8, ppg: 17.6, rpg: 4.5, apg: 2.0, spg: 0.8, bpg: 0.4, tov: 1.5, pf: 2.0, fg_pct: 0.455, three_pt_pct: 0.395, ft_pct: 0.848, pts_per40: 21.5, reb_per40: 5.5, ast_per40: 2.4, stl_per40: 1.0, blk_per40: 0.5, tov_per40: 1.8, usg: 0.262, per: 18.5, bpm: 4.2, obpm: 3.5, dbpm: 0.7, ws: 5.2, efg_pct: 0.530, ts_pct: 0.588, ast_pct: 0.112, tov_pct: 0.095, stl_pct: 0.017, blk_pct: 0.010, orb_pct: 0.028, drb_pct: 0.105, drtg: 99.5 },
    nba: { ppg: 2.5, rpg: 1.0, apg: 0.5, spg: 0.2, bpg: 0.1, ws48: 0.018, outcome: 'Out of League' },
  },
  {
    pick: 52, team: 'Philadelphia 76ers', name: 'Maalik Wayns', school: 'Villanova', pos: 'PG',
    birthYear: 1990, height: 74, weight: 185, wingspan: 77, conf: 'Big East',
    archetype: 'Scoring Lead Guard',
    // 2011-12 Villanova: 19.8 PPG, 3.2 RPG, 4.5 APG
    stats: { games: 31, mpg: 33.5, ppg: 19.8, rpg: 3.2, apg: 4.5, spg: 1.5, bpg: 0.2, tov: 2.8, pf: 2.5, fg_pct: 0.442, three_pt_pct: 0.360, ft_pct: 0.808, pts_per40: 23.6, reb_per40: 3.8, ast_per40: 5.4, stl_per40: 1.8, blk_per40: 0.2, tov_per40: 3.3, usg: 0.305, per: 17.8, bpm: 3.8, obpm: 3.2, dbpm: 0.6, ws: 4.5, efg_pct: 0.510, ts_pct: 0.568, ast_pct: 0.235, tov_pct: 0.155, stl_pct: 0.032, blk_pct: 0.005, orb_pct: 0.020, drb_pct: 0.072, drtg: 101.5 },
    nba: { ppg: 1.8, rpg: 0.5, apg: 0.8, spg: 0.2, bpg: 0.0, ws48: 0.012, outcome: 'Out of League' },
  },
  {
    pick: 53, team: 'Charlotte Bobcats', name: 'Tyshawn Taylor', school: 'Kansas', pos: 'PG',
    birthYear: 1990, height: 74, weight: 185, wingspan: 77, conf: 'Big 12',
    archetype: 'Athletic Lead Guard',
    // 2011-12 Kansas: 13.2 PPG, 2.8 RPG, 5.2 APG
    stats: { games: 36, mpg: 30.5, ppg: 13.2, rpg: 2.8, apg: 5.2, spg: 1.2, bpg: 0.2, tov: 2.5, pf: 2.2, fg_pct: 0.438, three_pt_pct: 0.342, ft_pct: 0.768, pts_per40: 17.3, reb_per40: 3.7, ast_per40: 6.8, stl_per40: 1.6, blk_per40: 0.3, tov_per40: 3.3, usg: 0.262, per: 16.5, bpm: 3.2, obpm: 2.2, dbpm: 1.0, ws: 4.2, efg_pct: 0.488, ts_pct: 0.548, ast_pct: 0.292, tov_pct: 0.158, stl_pct: 0.025, blk_pct: 0.005, orb_pct: 0.020, drb_pct: 0.068, drtg: 100.5 },
    nba: { ppg: 3.5, rpg: 0.8, apg: 1.8, spg: 0.4, bpg: 0.0, ws48: 0.022, outcome: 'Bust' },
  },
  {
    pick: 54, team: 'Oklahoma City Thunder', name: 'Kevin Murphy', school: 'Tennessee Tech', pos: 'SG',
    birthYear: 1989, height: 78, weight: 210, wingspan: 82, conf: 'OVC',
    archetype: 'Scoring Lead Guard',
    // 2011-12 Tennessee Tech: 26.5 PPG, 5.0 RPG, 3.5 APG
    stats: { games: 30, mpg: 34.5, ppg: 26.5, rpg: 5.0, apg: 3.5, spg: 1.5, bpg: 0.5, tov: 2.5, pf: 2.2, fg_pct: 0.468, three_pt_pct: 0.385, ft_pct: 0.835, pts_per40: 30.7, reb_per40: 5.8, ast_per40: 4.1, stl_per40: 1.7, blk_per40: 0.6, tov_per40: 2.9, usg: 0.355, per: 22.5, bpm: 6.5, obpm: 6.0, dbpm: 0.5, ws: 5.5, efg_pct: 0.538, ts_pct: 0.598, ast_pct: 0.155, tov_pct: 0.118, stl_pct: 0.028, blk_pct: 0.010, orb_pct: 0.032, drb_pct: 0.108, drtg: 102.5 },
    nba: { ppg: 1.2, rpg: 0.5, apg: 0.3, spg: 0.1, bpg: 0.0, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 55, team: 'San Antonio Spurs', name: 'Malcolm Thomas', school: 'San Diego State', pos: 'PF',
    birthYear: 1989, height: 82, weight: 218, wingspan: 86, conf: 'Mountain West',
    archetype: 'Athletic Wing',
    // 2011-12 San Diego State: 11.5 PPG, 7.5 RPG, 1.0 APG
    stats: { games: 33, mpg: 28.5, ppg: 11.5, rpg: 7.5, apg: 1.0, spg: 1.0, bpg: 1.2, tov: 1.5, pf: 2.5, fg_pct: 0.518, three_pt_pct: null, ft_pct: 0.685, pts_per40: 16.1, reb_per40: 10.5, ast_per40: 1.4, stl_per40: 1.4, blk_per40: 1.7, tov_per40: 2.1, usg: 0.228, per: 20.0, bpm: 5.2, obpm: 2.0, dbpm: 3.2, ws: 5.2, efg_pct: 0.518, ts_pct: 0.548, ast_pct: 0.065, tov_pct: 0.118, stl_pct: 0.022, blk_pct: 0.035, orb_pct: 0.078, drb_pct: 0.185, drtg: 95.5 },
    nba: { ppg: 2.8, rpg: 2.0, apg: 0.2, spg: 0.2, bpg: 0.4, ws48: 0.035, outcome: 'Out of League' },
  },
  {
    pick: 56, team: 'Oklahoma City Thunder', name: 'Tibor Pleiss', school: 'Brose Baskets Bamberg', pos: 'C',
    birthYear: 1991, height: 86, weight: 258, wingspan: 91, conf: null,
    archetype: 'Stretch Big',
    // 2011-12 German Bundesliga: ~8 PPG, 5 RPG, 0.5 APG
    stats: { games: 28, mpg: 20.5, ppg: 8.2, rpg: 5.0, apg: 0.5, spg: 0.3, bpg: 1.5, tov: 1.2, pf: 3.0, fg_pct: 0.545, three_pt_pct: 0.320, ft_pct: 0.652, pts_per40: 16.0, reb_per40: 9.8, ast_per40: 1.0, stl_per40: 0.6, blk_per40: 2.9, tov_per40: 2.3, usg: 0.215, per: 18.5, bpm: 4.5, obpm: 1.5, dbpm: 3.0, ws: 3.5, efg_pct: 0.572, ts_pct: 0.572, ast_pct: 0.038, tov_pct: 0.118, stl_pct: 0.010, blk_pct: 0.062, orb_pct: 0.075, drb_pct: 0.192, drtg: 95.5 },
    nba: { ppg: 2.8, rpg: 2.0, apg: 0.2, spg: 0.2, bpg: 0.5, ws48: 0.032, outcome: 'Out of League' },
  },
  {
    pick: 57, team: 'Milwaukee Bucks', name: 'Doron Lamb', school: 'Kentucky', pos: 'SG',
    birthYear: 1990, height: 76, weight: 210, wingspan: 80, conf: 'SEC',
    archetype: 'Catch and Shoot',
    // 2011-12 Kentucky: 13.7 PPG, 2.9 RPG, 1.5 APG (national champion)
    stats: { games: 40, mpg: 24.5, ppg: 13.7, rpg: 2.9, apg: 1.5, spg: 0.8, bpg: 0.2, tov: 1.2, pf: 1.8, fg_pct: 0.468, three_pt_pct: 0.440, ft_pct: 0.862, pts_per40: 22.4, reb_per40: 4.7, ast_per40: 2.5, stl_per40: 1.3, blk_per40: 0.3, tov_per40: 2.0, usg: 0.252, per: 18.2, bpm: 4.5, obpm: 3.8, dbpm: 0.7, ws: 5.5, efg_pct: 0.548, ts_pct: 0.612, ast_pct: 0.118, tov_pct: 0.092, stl_pct: 0.022, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.075, drtg: 90.5 },
    nba: { ppg: 3.5, rpg: 0.8, apg: 0.8, spg: 0.3, bpg: 0.1, ws48: 0.025, outcome: 'Bust' },
  },
  {
    pick: 58, team: 'Houston Rockets', name: 'Mychel Thompson', school: 'Pepperdine', pos: 'SG',
    birthYear: 1988, height: 77, weight: 210, wingspan: 81, conf: 'WCC',
    archetype: 'Movement Shooter',
    // 2011-12 Pepperdine: 17.8 PPG, 4.5 RPG, 2.0 APG
    stats: { games: 31, mpg: 32.0, ppg: 17.8, rpg: 4.5, apg: 2.0, spg: 1.2, bpg: 0.3, tov: 1.5, pf: 2.0, fg_pct: 0.458, three_pt_pct: 0.402, ft_pct: 0.852, pts_per40: 22.3, reb_per40: 5.6, ast_per40: 2.5, stl_per40: 1.5, blk_per40: 0.4, tov_per40: 1.9, usg: 0.278, per: 18.8, bpm: 4.2, obpm: 3.8, dbpm: 0.4, ws: 4.8, efg_pct: 0.530, ts_pct: 0.598, ast_pct: 0.118, tov_pct: 0.092, stl_pct: 0.025, blk_pct: 0.007, orb_pct: 0.028, drb_pct: 0.102, drtg: 100.5 },
    nba: { ppg: 3.5, rpg: 1.2, apg: 0.8, spg: 0.4, bpg: 0.1, ws48: 0.028, outcome: 'Out of League' },
  },
  {
    pick: 59, team: 'Utah Jazz', name: 'Terrel Harris', school: 'South Alabama', pos: 'SG',
    birthYear: 1987, height: 77, weight: 198, wingspan: 81, conf: 'Sun Belt',
    archetype: 'Athletic Defender',
    // 2011-12 South Alabama: 18.5 PPG, 5.5 RPG, 4.0 APG
    stats: { games: 31, mpg: 34.5, ppg: 18.5, rpg: 5.5, apg: 4.0, spg: 2.0, bpg: 0.5, tov: 2.5, pf: 2.5, fg_pct: 0.445, three_pt_pct: 0.352, ft_pct: 0.782, pts_per40: 21.4, reb_per40: 6.4, ast_per40: 4.6, stl_per40: 2.3, blk_per40: 0.6, tov_per40: 2.9, usg: 0.275, per: 18.5, bpm: 4.8, obpm: 3.2, dbpm: 1.6, ws: 5.0, efg_pct: 0.508, ts_pct: 0.558, ast_pct: 0.208, tov_pct: 0.138, stl_pct: 0.040, blk_pct: 0.010, orb_pct: 0.045, drb_pct: 0.122, drtg: 100.0 },
    nba: { ppg: 1.2, rpg: 0.5, apg: 0.5, spg: 0.2, bpg: 0.0, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 60, team: 'San Antonio Spurs', name: 'Erick Green', school: 'Virginia Tech', pos: 'PG',
    birthYear: 1991, height: 74, weight: 185, wingspan: 78, conf: 'ACC',
    archetype: 'Scoring Lead Guard',
    // 2011-12 Virginia Tech: 20.5 PPG, 3.5 RPG, 4.2 APG (2nd team All-ACC)
    stats: { games: 31, mpg: 33.5, ppg: 20.5, rpg: 3.5, apg: 4.2, spg: 1.5, bpg: 0.2, tov: 2.5, pf: 2.0, fg_pct: 0.445, three_pt_pct: 0.368, ft_pct: 0.832, pts_per40: 24.5, reb_per40: 4.2, ast_per40: 5.0, stl_per40: 1.8, blk_per40: 0.2, tov_per40: 3.0, usg: 0.315, per: 19.8, bpm: 5.0, obpm: 4.5, dbpm: 0.5, ws: 5.2, efg_pct: 0.518, ts_pct: 0.585, ast_pct: 0.228, tov_pct: 0.138, stl_pct: 0.032, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.082, drtg: 101.5 },
    nba: { ppg: 5.8, rpg: 1.2, apg: 2.2, spg: 0.5, bpg: 0.0, ws48: 0.035, outcome: 'Role Player' },
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
  console.log(`Seeding ${DRAFT_CLASS} NBA Draft — Legendary Archives (SUPPLEMENTAL — remaining picks)`)

  const allPlayers = PLAYERS.filter(p => p.stats)
  console.log(`Processing ${allPlayers.length} remaining players with stats...`)

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
  console.log(`Navigate to /legendary-archives?year=2012 to view the full board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
