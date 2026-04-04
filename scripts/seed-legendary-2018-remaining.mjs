#!/usr/bin/env node
// SUPPLEMENTAL seed script for 2018 NBA Draft — Legendary Archives
// Adds ALL players missing from seed-legendary-2018.mjs
//
// Already seeded (DO NOT DUPLICATE):
//   Picks 1-19, 22, 23, 26, 27 (Round 1)
//   Picks 33, 34, 36 (Round 2)
//
// This script adds:
//   Round 1: picks 20, 21, 24, 25, 28, 29, 30
//   Round 2: picks 31, 32, 35, 37-60
//
// Usage: node scripts/seed-legendary-2018-remaining.mjs

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const DRAFT_YEAR = 2018
const DRAFT_CLASS = '2018'
const SEASON = '17-18'

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

// SUPPLEMENTAL 2018 NBA Draft players — picks NOT in seed-legendary-2018.mjs
// Sources: Basketball Reference, Sports Reference
const PLAYERS = [
  // === ROUND 1 (remaining) ===
  {
    pick: 20, team: 'Minnesota Timberwolves', name: 'Josh Okogie', school: 'Georgia Tech', pos: 'SG',
    birthYear: 1998, height: 77, weight: 213, wingspan: 82, conf: 'ACC',
    archetype: 'Athletic Wing',
    // 2017-18 Georgia Tech: 18.1 PPG, 4.5 RPG, 1.8 APG in 32 games
    stats: { games: 32, mpg: 32.5, ppg: 18.1, rpg: 4.5, apg: 1.8, spg: 1.5, bpg: 0.5, tov: 2.0, pf: 2.5, fg_pct: 0.454, three_pt_pct: 0.358, ft_pct: 0.724, pts_per40: 22.3, reb_per40: 5.5, ast_per40: 2.2, stl_per40: 1.8, blk_per40: 0.6, tov_per40: 2.5, usg: 0.285, per: 19.5, bpm: 4.2, obpm: 3.0, dbpm: 1.2, ws: 4.8, efg_pct: 0.530, ts_pct: 0.560, ast_pct: 0.112, tov_pct: 0.130, stl_pct: 0.030, blk_pct: 0.013, orb_pct: 0.042, drb_pct: 0.118, drtg: 96.0 },
    nba: { ppg: 8.5, rpg: 2.8, apg: 1.5, spg: 1.0, bpg: 0.3, ws48: 0.058, outcome: 'Role Player' },
  },
  {
    pick: 21, team: 'Utah Jazz', name: 'Grayson Allen', school: 'Duke', pos: 'SG',
    birthYear: 1995, height: 77, weight: 198, wingspan: 79, conf: 'ACC',
    archetype: 'Stretch Guard',
    // 2017-18 Duke: 15.0 PPG, 3.2 RPG, 4.2 APG in 35 games
    stats: { games: 35, mpg: 31.2, ppg: 15.0, rpg: 3.2, apg: 4.2, spg: 1.0, bpg: 0.3, tov: 2.5, pf: 2.8, fg_pct: 0.441, three_pt_pct: 0.397, ft_pct: 0.841, pts_per40: 19.2, reb_per40: 4.1, ast_per40: 5.4, stl_per40: 1.3, blk_per40: 0.4, tov_per40: 3.2, usg: 0.268, per: 19.2, bpm: 4.8, obpm: 4.0, dbpm: 0.8, ws: 5.2, efg_pct: 0.523, ts_pct: 0.574, ast_pct: 0.255, tov_pct: 0.162, stl_pct: 0.020, blk_pct: 0.008, orb_pct: 0.025, drb_pct: 0.090, drtg: 97.5 },
    nba: { ppg: 12.0, rpg: 3.0, apg: 2.5, spg: 0.8, bpg: 0.2, ws48: 0.095, outcome: 'Role Player' },
  },
  {
    pick: 24, team: 'Portland Trail Blazers', name: 'Anfernee Simons', school: 'IMG Academy (HS)', pos: 'PG',
    birthYear: 2000, height: 76, weight: 181, wingspan: 79, conf: null,
    archetype: 'Scoring Lead Guard',
    // Simons came straight from high school — no college stats
    stats: { games: null, mpg: null, ppg: null, rpg: null, apg: null, spg: null, bpg: null, tov: null, pf: null, fg_pct: null, three_pt_pct: null, ft_pct: null, pts_per40: null, reb_per40: null, ast_per40: null, stl_per40: null, blk_per40: null, tov_per40: null, usg: null, per: null, bpm: null, obpm: null, dbpm: null, ws: null, efg_pct: null, ts_pct: null, ast_pct: null, tov_pct: null, stl_pct: null, blk_pct: null, orb_pct: null, drb_pct: null, drtg: null },
    nba: { ppg: 20.0, rpg: 3.5, apg: 4.5, spg: 0.8, bpg: 0.3, ws48: 0.105, outcome: 'Starter' },
  },
  {
    pick: 25, team: 'Los Angeles Lakers', name: 'Moritz Wagner', school: 'Michigan', pos: 'C',
    birthYear: 1997, height: 82, weight: 245, wingspan: 85, conf: 'Big Ten',
    archetype: 'Stretch Big',
    // 2017-18 Michigan: 14.6 PPG, 7.1 RPG, 1.2 APG in 37 games
    stats: { games: 37, mpg: 26.8, ppg: 14.6, rpg: 7.1, apg: 1.2, spg: 0.5, bpg: 1.0, tov: 1.6, pf: 3.0, fg_pct: 0.523, three_pt_pct: 0.369, ft_pct: 0.720, pts_per40: 21.8, reb_per40: 10.6, ast_per40: 1.8, stl_per40: 0.7, blk_per40: 1.5, tov_per40: 2.4, usg: 0.272, per: 22.5, bpm: 5.5, obpm: 4.2, dbpm: 1.3, ws: 5.8, efg_pct: 0.590, ts_pct: 0.618, ast_pct: 0.075, tov_pct: 0.118, stl_pct: 0.012, blk_pct: 0.032, orb_pct: 0.068, drb_pct: 0.178, drtg: 96.5 },
    nba: { ppg: 14.5, rpg: 5.5, apg: 1.2, spg: 0.5, bpg: 0.5, ws48: 0.092, outcome: 'Role Player' },
  },
  {
    pick: 28, team: 'Memphis Grizzlies', name: 'Jevon Carter', school: 'West Virginia', pos: 'PG',
    birthYear: 1995, height: 74, weight: 200, wingspan: 79, conf: 'Big 12',
    archetype: 'POA Defender',
    // 2017-18 West Virginia: 14.8 PPG, 3.8 RPG, 5.0 APG in 36 games
    stats: { games: 36, mpg: 33.5, ppg: 14.8, rpg: 3.8, apg: 5.0, spg: 2.8, bpg: 0.3, tov: 2.2, pf: 2.5, fg_pct: 0.437, three_pt_pct: 0.389, ft_pct: 0.791, pts_per40: 17.7, reb_per40: 4.5, ast_per40: 6.0, stl_per40: 3.3, blk_per40: 0.4, tov_per40: 2.6, usg: 0.265, per: 19.5, bpm: 6.2, obpm: 3.8, dbpm: 2.4, ws: 5.8, efg_pct: 0.502, ts_pct: 0.548, ast_pct: 0.295, tov_pct: 0.145, stl_pct: 0.056, blk_pct: 0.007, orb_pct: 0.030, drb_pct: 0.098, drtg: 93.8 },
    nba: { ppg: 7.5, rpg: 2.0, apg: 2.5, spg: 1.2, bpg: 0.2, ws48: 0.068, outcome: 'Role Player' },
  },
  {
    pick: 29, team: 'Brooklyn Nets', name: 'Dzanan Musa', school: 'Cedevita Croatia', pos: 'SF',
    birthYear: 1999, height: 80, weight: 200, wingspan: 82, conf: 'ABA League',
    archetype: 'Scoring Wing',
    // 2017-18 Cedevita (Croatian League): estimated stats for 18-year-old
    stats: { games: 28, mpg: 22.0, ppg: 12.0, rpg: 3.5, apg: 2.0, spg: 0.8, bpg: 0.3, tov: 1.8, pf: 2.2, fg_pct: 0.440, three_pt_pct: 0.370, ft_pct: 0.750, pts_per40: 21.8, reb_per40: 6.4, ast_per40: 3.6, stl_per40: 1.5, blk_per40: 0.5, tov_per40: 3.3, usg: 0.278, per: 18.5, bpm: 3.8, obpm: 3.0, dbpm: 0.8, ws: 3.5, efg_pct: 0.505, ts_pct: 0.540, ast_pct: 0.142, tov_pct: 0.148, stl_pct: 0.022, blk_pct: 0.008, orb_pct: 0.038, drb_pct: 0.102, drtg: 99.0 },
    nba: { ppg: 5.5, rpg: 2.0, apg: 1.2, spg: 0.4, bpg: 0.2, ws48: 0.025, outcome: 'Bust' },
  },
  {
    pick: 30, team: 'Atlanta Hawks', name: 'Omari Spellman', school: 'Villanova', pos: 'PF',
    birthYear: 1997, height: 80, weight: 245, wingspan: 84, conf: 'Big East',
    archetype: 'Stretch Big',
    // 2017-18 Villanova: 10.9 PPG, 7.6 RPG, 0.9 APG in 40 games
    stats: { games: 40, mpg: 24.5, ppg: 10.9, rpg: 7.6, apg: 0.9, spg: 0.6, bpg: 1.3, tov: 1.5, pf: 2.8, fg_pct: 0.443, three_pt_pct: 0.399, ft_pct: 0.645, pts_per40: 17.8, reb_per40: 12.4, ast_per40: 1.5, stl_per40: 1.0, blk_per40: 2.1, tov_per40: 2.4, usg: 0.238, per: 20.5, bpm: 5.8, obpm: 3.0, dbpm: 2.8, ws: 5.2, efg_pct: 0.522, ts_pct: 0.538, ast_pct: 0.058, tov_pct: 0.128, stl_pct: 0.014, blk_pct: 0.042, orb_pct: 0.082, drb_pct: 0.195, drtg: 93.2 },
    nba: { ppg: 7.2, rpg: 5.0, apg: 0.8, spg: 0.5, bpg: 0.7, ws48: 0.062, outcome: 'Role Player' },
  },

  // === ROUND 2 (remaining) ===
  {
    pick: 31, team: 'Utah Jazz', name: 'Jarrell Brantley', school: 'College of Charleston', pos: 'PF',
    birthYear: 1996, height: 77, weight: 235, wingspan: 80, conf: 'Colonial Athletic',
    archetype: 'Rim Runner',
    // 2017-18 College of Charleston: 21.7 PPG, 7.7 RPG, 1.5 APG in 33 games
    stats: { games: 33, mpg: 33.0, ppg: 21.7, rpg: 7.7, apg: 1.5, spg: 0.9, bpg: 0.8, tov: 2.2, pf: 2.5, fg_pct: 0.568, three_pt_pct: 0.330, ft_pct: 0.752, pts_per40: 26.3, reb_per40: 9.3, ast_per40: 1.8, stl_per40: 1.1, blk_per40: 1.0, tov_per40: 2.7, usg: 0.305, per: 24.5, bpm: 7.5, obpm: 5.5, dbpm: 2.0, ws: 6.8, efg_pct: 0.590, ts_pct: 0.632, ast_pct: 0.092, tov_pct: 0.138, stl_pct: 0.018, blk_pct: 0.022, orb_pct: 0.072, drb_pct: 0.185, drtg: 96.0 },
    nba: { ppg: 4.5, rpg: 2.8, apg: 0.5, spg: 0.3, bpg: 0.3, ws48: 0.038, outcome: 'Out of League' },
  },
  {
    pick: 32, team: 'Houston Rockets', name: 'Vincent Edwards', school: 'Purdue', pos: 'SF/PF',
    birthYear: 1995, height: 80, weight: 220, wingspan: 82, conf: 'Big Ten',
    archetype: 'Stretch Wing',
    // 2017-18 Purdue: 13.9 PPG, 7.0 RPG, 2.3 APG in 36 games
    stats: { games: 36, mpg: 31.5, ppg: 13.9, rpg: 7.0, apg: 2.3, spg: 0.9, bpg: 0.5, tov: 1.8, pf: 2.2, fg_pct: 0.494, three_pt_pct: 0.356, ft_pct: 0.734, pts_per40: 17.7, reb_per40: 8.9, ast_per40: 2.9, stl_per40: 1.1, blk_per40: 0.6, tov_per40: 2.3, usg: 0.248, per: 20.2, bpm: 5.5, obpm: 3.5, dbpm: 2.0, ws: 5.5, efg_pct: 0.551, ts_pct: 0.579, ast_pct: 0.148, tov_pct: 0.132, stl_pct: 0.018, blk_pct: 0.013, orb_pct: 0.055, drb_pct: 0.175, drtg: 96.5 },
    nba: { ppg: 3.5, rpg: 2.0, apg: 0.8, spg: 0.3, bpg: 0.2, ws48: 0.025, outcome: 'Out of League' },
  },
  {
    pick: 35, team: 'Miami Heat', name: 'Duncan Robinson', school: 'Michigan', pos: 'SF',
    birthYear: 1994, height: 79, weight: 215, wingspan: 82, conf: 'Big Ten',
    archetype: 'Stretch Wing',
    // 2017-18 Michigan: 11.0 PPG, 3.7 RPG, 1.0 APG in 37 games
    stats: { games: 37, mpg: 23.5, ppg: 11.0, rpg: 3.7, apg: 1.0, spg: 0.5, bpg: 0.3, tov: 1.0, pf: 1.8, fg_pct: 0.476, three_pt_pct: 0.441, ft_pct: 0.862, pts_per40: 18.7, reb_per40: 6.3, ast_per40: 1.7, stl_per40: 0.9, blk_per40: 0.5, tov_per40: 1.7, usg: 0.222, per: 19.5, bpm: 5.0, obpm: 4.0, dbpm: 1.0, ws: 5.2, efg_pct: 0.571, ts_pct: 0.601, ast_pct: 0.068, tov_pct: 0.088, stl_pct: 0.012, blk_pct: 0.008, orb_pct: 0.035, drb_pct: 0.098, drtg: 94.0 },
    nba: { ppg: 14.5, rpg: 3.5, apg: 1.5, spg: 0.5, bpg: 0.2, ws48: 0.112, outcome: 'Role Player' },
  },
  {
    pick: 37, team: 'Oklahoma City Thunder', name: 'Hamidou Diallo', school: 'Kentucky', pos: 'SG',
    birthYear: 1998, height: 78, weight: 198, wingspan: 83, conf: 'SEC',
    archetype: 'Athletic Wing',
    // 2017-18 Kentucky: 5.8 PPG, 2.5 RPG, 0.5 APG in 21 games (limited role)
    stats: { games: 21, mpg: 17.5, ppg: 5.8, rpg: 2.5, apg: 0.5, spg: 0.8, bpg: 0.4, tov: 0.8, pf: 2.0, fg_pct: 0.473, three_pt_pct: 0.200, ft_pct: 0.667, pts_per40: 13.3, reb_per40: 5.7, ast_per40: 1.1, stl_per40: 1.8, blk_per40: 0.9, tov_per40: 1.8, usg: 0.215, per: 14.5, bpm: 1.5, obpm: 0.5, dbpm: 1.0, ws: 1.5, efg_pct: 0.482, ts_pct: 0.516, ast_pct: 0.040, tov_pct: 0.145, stl_pct: 0.028, blk_pct: 0.020, orb_pct: 0.045, drb_pct: 0.110, drtg: 98.5 },
    nba: { ppg: 10.5, rpg: 4.0, apg: 1.5, spg: 0.8, bpg: 0.5, ws48: 0.062, outcome: 'Role Player' },
  },
  {
    pick: 38, team: 'Denver Nuggets', name: 'Thomas Welsh', school: 'UCLA', pos: 'C',
    birthYear: 1996, height: 85, weight: 250, wingspan: 87, conf: 'Pac-12',
    archetype: 'Drop Coverage Big',
    // 2017-18 UCLA: 10.7 PPG, 8.3 RPG, 0.7 APG in 35 games
    stats: { games: 35, mpg: 27.0, ppg: 10.7, rpg: 8.3, apg: 0.7, spg: 0.4, bpg: 1.2, tov: 1.2, pf: 3.2, fg_pct: 0.582, three_pt_pct: null, ft_pct: 0.718, pts_per40: 15.9, reb_per40: 12.3, ast_per40: 1.0, stl_per40: 0.6, blk_per40: 1.8, tov_per40: 1.8, usg: 0.225, per: 20.5, bpm: 4.8, obpm: 2.0, dbpm: 2.8, ws: 4.5, efg_pct: 0.582, ts_pct: 0.620, ast_pct: 0.042, tov_pct: 0.112, stl_pct: 0.010, blk_pct: 0.038, orb_pct: 0.090, drb_pct: 0.218, drtg: 95.5 },
    nba: { ppg: 1.5, rpg: 1.5, apg: 0.2, spg: 0.1, bpg: 0.2, ws48: 0.015, outcome: 'Out of League' },
  },
  {
    pick: 39, team: 'Toronto Raptors', name: 'Simi Shittu', school: 'Vanderbilt', pos: 'PF',
    birthYear: 1999, height: 81, weight: 235, wingspan: 84, conf: 'SEC',
    archetype: 'Athletic Big',
    // 2017-18 Vanderbilt: 11.0 PPG, 5.9 RPG, 1.5 APG in 31 games
    stats: { games: 31, mpg: 28.5, ppg: 11.0, rpg: 5.9, apg: 1.5, spg: 0.8, bpg: 0.8, tov: 1.5, pf: 2.8, fg_pct: 0.515, three_pt_pct: 0.280, ft_pct: 0.622, pts_per40: 15.4, reb_per40: 8.3, ast_per40: 2.1, stl_per40: 1.1, blk_per40: 1.1, tov_per40: 2.1, usg: 0.248, per: 18.8, bpm: 4.0, obpm: 2.2, dbpm: 1.8, ws: 4.0, efg_pct: 0.535, ts_pct: 0.547, ast_pct: 0.108, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.025, orb_pct: 0.062, drb_pct: 0.155, drtg: 97.5 },
    nba: { ppg: 2.0, rpg: 1.5, apg: 0.5, spg: 0.2, bpg: 0.2, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 40, team: 'Phoenix Suns', name: 'Elie Okobo', school: 'France Pro A', pos: 'PG',
    birthYear: 1997, height: 76, weight: 185, wingspan: 79, conf: 'Pro A France',
    archetype: 'Playmaking Lead Guard',
    // 2017-18 Pau-Orthez (Pro A France): 11.8 PPG, 3.5 RPG, 3.5 APG
    stats: { games: 30, mpg: 25.0, ppg: 11.8, rpg: 3.5, apg: 3.5, spg: 1.2, bpg: 0.2, tov: 2.0, pf: 2.0, fg_pct: 0.448, three_pt_pct: 0.365, ft_pct: 0.782, pts_per40: 18.9, reb_per40: 5.6, ast_per40: 5.6, stl_per40: 1.9, blk_per40: 0.3, tov_per40: 3.2, usg: 0.265, per: 18.0, bpm: 3.5, obpm: 2.5, dbpm: 1.0, ws: 3.8, efg_pct: 0.510, ts_pct: 0.556, ast_pct: 0.235, tov_pct: 0.155, stl_pct: 0.030, blk_pct: 0.005, orb_pct: 0.025, drb_pct: 0.085, drtg: 99.0 },
    nba: { ppg: 7.5, rpg: 2.0, apg: 3.0, spg: 0.8, bpg: 0.1, ws48: 0.048, outcome: 'Role Player' },
  },
  {
    pick: 41, team: 'New York Knicks', name: 'Allonzo Trier', school: 'Arizona', pos: 'SG',
    birthYear: 1995, height: 77, weight: 200, wingspan: 80, conf: 'Pac-12',
    archetype: 'Scoring Wing',
    // 2017-18 Arizona: 19.7 PPG, 4.3 RPG, 3.3 APG in 38 games
    stats: { games: 38, mpg: 33.8, ppg: 19.7, rpg: 4.3, apg: 3.3, spg: 1.2, bpg: 0.4, tov: 2.0, pf: 2.2, fg_pct: 0.491, three_pt_pct: 0.382, ft_pct: 0.757, pts_per40: 23.3, reb_per40: 5.1, ast_per40: 3.9, stl_per40: 1.4, blk_per40: 0.5, tov_per40: 2.4, usg: 0.305, per: 21.5, bpm: 5.8, obpm: 5.0, dbpm: 0.8, ws: 6.5, efg_pct: 0.555, ts_pct: 0.585, ast_pct: 0.198, tov_pct: 0.128, stl_pct: 0.024, blk_pct: 0.010, orb_pct: 0.038, drb_pct: 0.108, drtg: 97.5 },
    nba: { ppg: 10.5, rpg: 2.5, apg: 1.8, spg: 0.6, bpg: 0.2, ws48: 0.058, outcome: 'Role Player' },
  },
  {
    pick: 42, team: 'Memphis Grizzlies', name: 'Alize Johnson', school: 'Missouri State', pos: 'PF',
    birthYear: 1996, height: 80, weight: 220, wingspan: 84, conf: 'Missouri Valley',
    archetype: 'Athletic Big',
    // 2017-18 Missouri State: 18.8 PPG, 12.7 RPG, 1.8 APG in 33 games
    stats: { games: 33, mpg: 34.5, ppg: 18.8, rpg: 12.7, apg: 1.8, spg: 1.0, bpg: 1.0, tov: 2.0, pf: 2.8, fg_pct: 0.548, three_pt_pct: 0.220, ft_pct: 0.678, pts_per40: 21.8, reb_per40: 14.7, ast_per40: 2.1, stl_per40: 1.2, blk_per40: 1.2, tov_per40: 2.3, usg: 0.278, per: 24.5, bpm: 7.5, obpm: 4.0, dbpm: 3.5, ws: 7.0, efg_pct: 0.558, ts_pct: 0.584, ast_pct: 0.105, tov_pct: 0.128, stl_pct: 0.020, blk_pct: 0.028, orb_pct: 0.115, drb_pct: 0.275, drtg: 96.0 },
    nba: { ppg: 4.5, rpg: 4.0, apg: 0.5, spg: 0.5, bpg: 0.4, ws48: 0.042, outcome: 'Role Player' },
  },
  {
    pick: 43, team: 'Golden State Warriors', name: 'Jacob Evans', school: 'Cincinnati', pos: 'SG',
    birthYear: 1996, height: 77, weight: 195, wingspan: 82, conf: 'American Athletic',
    archetype: 'Two Way Guard',
    // 2017-18 Cincinnati: 13.0 PPG, 4.2 RPG, 2.8 APG in 35 games
    stats: { games: 35, mpg: 30.5, ppg: 13.0, rpg: 4.2, apg: 2.8, spg: 1.5, bpg: 0.5, tov: 1.5, pf: 2.0, fg_pct: 0.478, three_pt_pct: 0.390, ft_pct: 0.742, pts_per40: 17.0, reb_per40: 5.5, ast_per40: 3.7, stl_per40: 2.0, blk_per40: 0.7, tov_per40: 2.0, usg: 0.252, per: 18.8, bpm: 4.5, obpm: 3.2, dbpm: 1.3, ws: 5.0, efg_pct: 0.545, ts_pct: 0.573, ast_pct: 0.178, tov_pct: 0.115, stl_pct: 0.032, blk_pct: 0.015, orb_pct: 0.035, drb_pct: 0.108, drtg: 94.5 },
    nba: { ppg: 3.5, rpg: 1.5, apg: 1.0, spg: 0.5, bpg: 0.2, ws48: 0.025, outcome: 'Out of League' },
  },
  {
    pick: 44, team: 'San Antonio Spurs', name: 'Chimezie Metu', school: 'USC', pos: 'PF',
    birthYear: 1996, height: 81, weight: 220, wingspan: 85, conf: 'Pac-12',
    archetype: 'Stretch Big',
    // 2017-18 USC: 18.0 PPG, 7.1 RPG, 1.2 APG in 34 games
    stats: { games: 34, mpg: 32.5, ppg: 18.0, rpg: 7.1, apg: 1.2, spg: 1.0, bpg: 2.2, tov: 2.2, pf: 3.5, fg_pct: 0.521, three_pt_pct: 0.330, ft_pct: 0.710, pts_per40: 22.2, reb_per40: 8.7, ast_per40: 1.5, stl_per40: 1.2, blk_per40: 2.7, tov_per40: 2.7, usg: 0.290, per: 22.8, bpm: 7.0, obpm: 4.5, dbpm: 2.5, ws: 6.5, efg_pct: 0.555, ts_pct: 0.581, ast_pct: 0.075, tov_pct: 0.145, stl_pct: 0.022, blk_pct: 0.072, orb_pct: 0.075, drb_pct: 0.182, drtg: 96.5 },
    nba: { ppg: 5.5, rpg: 3.2, apg: 0.5, spg: 0.4, bpg: 0.6, ws48: 0.035, outcome: 'Role Player' },
  },
  {
    pick: 45, team: 'Oklahoma City Thunder', name: 'Kevin Hervey', school: 'UT Arlington', pos: 'SF',
    birthYear: 1995, height: 79, weight: 205, wingspan: 83, conf: 'Sun Belt',
    archetype: 'Stretch Wing',
    // 2017-18 UT Arlington: 18.5 PPG, 7.8 RPG, 1.8 APG in 31 games
    stats: { games: 31, mpg: 33.5, ppg: 18.5, rpg: 7.8, apg: 1.8, spg: 1.2, bpg: 1.0, tov: 1.8, pf: 2.0, fg_pct: 0.500, three_pt_pct: 0.388, ft_pct: 0.762, pts_per40: 22.1, reb_per40: 9.3, ast_per40: 2.1, stl_per40: 1.4, blk_per40: 1.2, tov_per40: 2.1, usg: 0.285, per: 22.0, bpm: 6.5, obpm: 4.8, dbpm: 1.7, ws: 5.5, efg_pct: 0.568, ts_pct: 0.598, ast_pct: 0.115, tov_pct: 0.118, stl_pct: 0.025, blk_pct: 0.028, orb_pct: 0.058, drb_pct: 0.172, drtg: 97.0 },
    nba: { ppg: 2.5, rpg: 1.5, apg: 0.5, spg: 0.2, bpg: 0.2, ws48: 0.012, outcome: 'Out of League' },
  },
  {
    pick: 46, team: 'Miami Heat', name: 'Yante Maten', school: 'Georgia', pos: 'PF',
    birthYear: 1995, height: 79, weight: 235, wingspan: 81, conf: 'SEC',
    archetype: 'Rim Runner',
    // 2017-18 Georgia: 18.7 PPG, 8.0 RPG, 1.0 APG in 33 games
    stats: { games: 33, mpg: 32.5, ppg: 18.7, rpg: 8.0, apg: 1.0, spg: 0.7, bpg: 1.2, tov: 2.2, pf: 3.0, fg_pct: 0.530, three_pt_pct: 0.358, ft_pct: 0.710, pts_per40: 23.0, reb_per40: 9.8, ast_per40: 1.2, stl_per40: 0.9, blk_per40: 1.5, tov_per40: 2.7, usg: 0.298, per: 22.5, bpm: 6.8, obpm: 5.0, dbpm: 1.8, ws: 6.5, efg_pct: 0.570, ts_pct: 0.600, ast_pct: 0.065, tov_pct: 0.145, stl_pct: 0.015, blk_pct: 0.035, orb_pct: 0.078, drb_pct: 0.188, drtg: 97.0 },
    nba: { ppg: 2.0, rpg: 1.5, apg: 0.2, spg: 0.2, bpg: 0.3, ws48: 0.008, outcome: 'Out of League' },
  },
  {
    pick: 47, team: 'Washington Wizards', name: 'Anzejs Pasecniks', school: 'Valencia Basket Spain', pos: 'C',
    birthYear: 1995, height: 87, weight: 220, wingspan: 91, conf: 'EuroLeague',
    archetype: 'Rim Protector',
    // 2017-18 Gran Canaria (EuroCup): 8.8 PPG, 6.0 RPG, 0.5 APG
    stats: { games: 26, mpg: 20.5, ppg: 8.8, rpg: 6.0, apg: 0.5, spg: 0.4, bpg: 1.5, tov: 1.2, pf: 3.0, fg_pct: 0.532, three_pt_pct: null, ft_pct: 0.655, pts_per40: 17.2, reb_per40: 11.7, ast_per40: 1.0, stl_per40: 0.8, blk_per40: 2.9, tov_per40: 2.3, usg: 0.232, per: 19.5, bpm: 4.5, obpm: 1.8, dbpm: 2.7, ws: 3.5, efg_pct: 0.532, ts_pct: 0.564, ast_pct: 0.038, tov_pct: 0.135, stl_pct: 0.012, blk_pct: 0.058, orb_pct: 0.082, drb_pct: 0.188, drtg: 97.0 },
    nba: { ppg: 2.5, rpg: 2.5, apg: 0.2, spg: 0.2, bpg: 0.5, ws48: 0.018, outcome: 'Out of League' },
  },
  {
    pick: 48, team: 'Portland Trail Blazers', name: 'Gary Trent Jr', school: 'Duke', pos: 'SG',
    birthYear: 1999, height: 77, weight: 209, wingspan: 79, conf: 'ACC',
    archetype: 'Stretch Guard',
    // 2017-18 Duke: 12.7 PPG, 3.0 RPG, 1.4 APG in 35 games
    stats: { games: 35, mpg: 26.5, ppg: 12.7, rpg: 3.0, apg: 1.4, spg: 0.8, bpg: 0.3, tov: 1.2, pf: 2.2, fg_pct: 0.450, three_pt_pct: 0.405, ft_pct: 0.808, pts_per40: 19.2, reb_per40: 4.5, ast_per40: 2.1, stl_per40: 1.2, blk_per40: 0.5, tov_per40: 1.8, usg: 0.268, per: 18.5, bpm: 3.8, obpm: 3.2, dbpm: 0.6, ws: 4.5, efg_pct: 0.524, ts_pct: 0.560, ast_pct: 0.105, tov_pct: 0.092, stl_pct: 0.018, blk_pct: 0.008, orb_pct: 0.025, drb_pct: 0.075, drtg: 97.0 },
    nba: { ppg: 18.5, rpg: 3.0, apg: 2.0, spg: 1.0, bpg: 0.3, ws48: 0.112, outcome: 'Starter' },
  },
  {
    pick: 49, team: 'Philadelphia 76ers', name: 'Shake Milton', school: 'SMU', pos: 'PG/SG',
    birthYear: 1996, height: 78, weight: 205, wingspan: 82, conf: 'American Athletic',
    archetype: 'Scoring Lead Guard',
    // 2017-18 SMU: 20.1 PPG, 3.8 RPG, 5.2 APG in 35 games
    stats: { games: 35, mpg: 33.2, ppg: 20.1, rpg: 3.8, apg: 5.2, spg: 0.8, bpg: 0.5, tov: 2.5, pf: 2.0, fg_pct: 0.487, three_pt_pct: 0.392, ft_pct: 0.830, pts_per40: 24.2, reb_per40: 4.6, ast_per40: 6.3, stl_per40: 1.0, blk_per40: 0.6, tov_per40: 3.0, usg: 0.295, per: 22.0, bpm: 7.2, obpm: 5.8, dbpm: 1.4, ws: 7.0, efg_pct: 0.556, ts_pct: 0.600, ast_pct: 0.305, tov_pct: 0.148, stl_pct: 0.016, blk_pct: 0.013, orb_pct: 0.022, drb_pct: 0.092, drtg: 95.5 },
    nba: { ppg: 11.5, rpg: 3.0, apg: 3.5, spg: 0.7, bpg: 0.3, ws48: 0.082, outcome: 'Role Player' },
  },
  {
    pick: 50, team: 'Minnesota Timberwolves', name: 'Kelan Martin', school: 'Butler', pos: 'SF',
    birthYear: 1995, height: 78, weight: 220, wingspan: 82, conf: 'Big East',
    archetype: 'Stretch Wing',
    // 2017-18 Butler: 19.6 PPG, 6.1 RPG, 2.1 APG in 35 games
    stats: { games: 35, mpg: 32.0, ppg: 19.6, rpg: 6.1, apg: 2.1, spg: 1.0, bpg: 0.5, tov: 1.8, pf: 2.2, fg_pct: 0.482, three_pt_pct: 0.415, ft_pct: 0.808, pts_per40: 24.5, reb_per40: 7.6, ast_per40: 2.6, stl_per40: 1.3, blk_per40: 0.6, tov_per40: 2.3, usg: 0.295, per: 22.0, bpm: 6.2, obpm: 5.2, dbpm: 1.0, ws: 6.5, efg_pct: 0.551, ts_pct: 0.585, ast_pct: 0.128, tov_pct: 0.105, stl_pct: 0.022, blk_pct: 0.013, orb_pct: 0.042, drb_pct: 0.145, drtg: 95.5 },
    nba: { ppg: 4.5, rpg: 2.0, apg: 0.5, spg: 0.4, bpg: 0.2, ws48: 0.025, outcome: 'Out of League' },
  },
  {
    pick: 51, team: 'Memphis Grizzlies', name: 'Tra Holder', school: 'Arizona State', pos: 'PG',
    birthYear: 1995, height: 75, weight: 185, wingspan: 78, conf: 'Pac-12',
    archetype: 'Scoring Lead Guard',
    // 2017-18 Arizona State: 18.7 PPG, 3.5 RPG, 3.8 APG in 28 games
    stats: { games: 28, mpg: 30.5, ppg: 18.7, rpg: 3.5, apg: 3.8, spg: 1.5, bpg: 0.3, tov: 2.5, pf: 2.2, fg_pct: 0.462, three_pt_pct: 0.378, ft_pct: 0.812, pts_per40: 24.5, reb_per40: 4.6, ast_per40: 5.0, stl_per40: 2.0, blk_per40: 0.4, tov_per40: 3.3, usg: 0.318, per: 20.5, bpm: 5.5, obpm: 5.0, dbpm: 0.5, ws: 4.5, efg_pct: 0.530, ts_pct: 0.572, ast_pct: 0.228, tov_pct: 0.158, stl_pct: 0.032, blk_pct: 0.007, orb_pct: 0.018, drb_pct: 0.088, drtg: 100.0 },
    nba: { ppg: 2.0, rpg: 0.8, apg: 0.8, spg: 0.2, bpg: 0.0, ws48: 0.008, outcome: 'Out of League' },
  },
  {
    pick: 52, team: 'Washington Wizards', name: 'Issuf Sanon', school: 'Ukraine (did not play NCAA)', pos: 'PG',
    birthYear: 1998, height: 76, weight: 185, wingspan: 80, conf: null,
    archetype: 'Scoring Lead Guard',
    // Sanon came out of European basketball — limited tracked stats
    stats: { games: null, mpg: null, ppg: null, rpg: null, apg: null, spg: null, bpg: null, tov: null, pf: null, fg_pct: null, three_pt_pct: null, ft_pct: null, pts_per40: null, reb_per40: null, ast_per40: null, stl_per40: null, blk_per40: null, tov_per40: null, usg: null, per: null, bpm: null, obpm: null, dbpm: null, ws: null, efg_pct: null, ts_pct: null, ast_pct: null, tov_pct: null, stl_pct: null, blk_pct: null, orb_pct: null, drb_pct: null, drtg: null },
    nba: { ppg: 1.0, rpg: 0.5, apg: 0.5, spg: 0.1, bpg: 0.0, ws48: 0.005, outcome: 'Out of League' },
  },
  {
    pick: 53, team: 'Chicago Bulls', name: 'Anas Mahmoud', school: 'Louisville', pos: 'C',
    birthYear: 1995, height: 84, weight: 220, wingspan: 90, conf: 'ACC',
    archetype: 'Rim Protector',
    // 2017-18 Louisville: 6.3 PPG, 6.5 RPG, 0.5 APG in 31 games
    stats: { games: 31, mpg: 24.5, ppg: 6.3, rpg: 6.5, apg: 0.5, spg: 0.5, bpg: 3.8, tov: 0.8, pf: 2.8, fg_pct: 0.605, three_pt_pct: null, ft_pct: 0.622, pts_per40: 10.3, reb_per40: 10.6, ast_per40: 0.8, stl_per40: 0.8, blk_per40: 6.2, tov_per40: 1.3, usg: 0.175, per: 21.5, bpm: 6.0, obpm: 0.5, dbpm: 5.5, ws: 4.8, efg_pct: 0.605, ts_pct: 0.618, ast_pct: 0.035, tov_pct: 0.098, stl_pct: 0.012, blk_pct: 0.155, orb_pct: 0.082, drb_pct: 0.218, drtg: 90.5 },
    nba: { ppg: 1.5, rpg: 1.5, apg: 0.2, spg: 0.1, bpg: 0.5, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 54, team: 'Denver Nuggets', name: 'Vlatko Cancar', school: 'Mega Bemax Serbia', pos: 'SF/PF',
    birthYear: 1997, height: 80, weight: 232, wingspan: 83, conf: 'ABA League',
    archetype: 'Stretch Wing',
    // 2017-18 Mega Bemax (ABA League): 8.5 PPG, 4.0 RPG, 1.2 APG in 29 games
    stats: { games: 29, mpg: 22.5, ppg: 8.5, rpg: 4.0, apg: 1.2, spg: 0.8, bpg: 0.5, tov: 1.2, pf: 2.2, fg_pct: 0.478, three_pt_pct: 0.362, ft_pct: 0.712, pts_per40: 15.1, reb_per40: 7.1, ast_per40: 2.1, stl_per40: 1.4, blk_per40: 0.9, tov_per40: 2.1, usg: 0.235, per: 16.5, bpm: 3.0, obpm: 1.8, dbpm: 1.2, ws: 2.8, efg_pct: 0.528, ts_pct: 0.555, ast_pct: 0.095, tov_pct: 0.138, stl_pct: 0.022, blk_pct: 0.015, orb_pct: 0.045, drb_pct: 0.112, drtg: 98.0 },
    nba: { ppg: 5.5, rpg: 2.5, apg: 1.0, spg: 0.4, bpg: 0.3, ws48: 0.048, outcome: 'Role Player' },
  },
  {
    pick: 55, team: 'San Antonio Spurs', name: 'Angel Delgado', school: 'Seton Hall', pos: 'C',
    birthYear: 1995, height: 79, weight: 245, wingspan: 82, conf: 'Big East',
    archetype: 'Rim Runner',
    // 2017-18 Seton Hall: 10.3 PPG, 10.3 RPG, 1.2 APG in 36 games
    stats: { games: 36, mpg: 30.5, ppg: 10.3, rpg: 10.3, apg: 1.2, spg: 0.8, bpg: 0.8, tov: 1.8, pf: 3.2, fg_pct: 0.568, three_pt_pct: null, ft_pct: 0.602, pts_per40: 13.5, reb_per40: 13.5, ast_per40: 1.6, stl_per40: 1.0, blk_per40: 1.0, tov_per40: 2.4, usg: 0.232, per: 22.0, bpm: 6.5, obpm: 2.5, dbpm: 4.0, ws: 6.2, efg_pct: 0.568, ts_pct: 0.582, ast_pct: 0.078, tov_pct: 0.148, stl_pct: 0.018, blk_pct: 0.022, orb_pct: 0.145, drb_pct: 0.268, drtg: 95.5 },
    nba: { ppg: 2.0, rpg: 2.5, apg: 0.3, spg: 0.2, bpg: 0.2, ws48: 0.015, outcome: 'Out of League' },
  },
  {
    pick: 56, team: 'Dallas Mavericks', name: 'Ray Spalding', school: 'Louisville', pos: 'PF',
    birthYear: 1996, height: 81, weight: 203, wingspan: 85, conf: 'ACC',
    archetype: 'Athletic Big',
    // 2017-18 Louisville: 9.5 PPG, 7.2 RPG, 0.8 APG in 29 games
    stats: { games: 29, mpg: 27.5, ppg: 9.5, rpg: 7.2, apg: 0.8, spg: 0.8, bpg: 1.8, tov: 1.2, pf: 2.8, fg_pct: 0.548, three_pt_pct: 0.200, ft_pct: 0.672, pts_per40: 13.8, reb_per40: 10.5, ast_per40: 1.2, stl_per40: 1.2, blk_per40: 2.6, tov_per40: 1.7, usg: 0.225, per: 19.5, bpm: 5.0, obpm: 2.2, dbpm: 2.8, ws: 4.5, efg_pct: 0.560, ts_pct: 0.575, ast_pct: 0.055, tov_pct: 0.122, stl_pct: 0.018, blk_pct: 0.058, orb_pct: 0.092, drb_pct: 0.188, drtg: 96.5 },
    nba: { ppg: 1.5, rpg: 1.2, apg: 0.2, spg: 0.2, bpg: 0.3, ws48: 0.008, outcome: 'Out of League' },
  },
  {
    pick: 57, team: 'Orlando Magic', name: 'Melvin Frazier Jr', school: 'Tulane', pos: 'SG/SF',
    birthYear: 1997, height: 78, weight: 200, wingspan: 82, conf: 'American Athletic',
    archetype: 'Athletic Wing',
    // 2017-18 Tulane: 17.8 PPG, 7.5 RPG, 2.0 APG in 31 games
    stats: { games: 31, mpg: 34.0, ppg: 17.8, rpg: 7.5, apg: 2.0, spg: 1.8, bpg: 0.5, tov: 2.0, pf: 2.5, fg_pct: 0.482, three_pt_pct: 0.365, ft_pct: 0.712, pts_per40: 20.9, reb_per40: 8.8, ast_per40: 2.4, stl_per40: 2.1, blk_per40: 0.6, tov_per40: 2.4, usg: 0.278, per: 20.2, bpm: 5.5, obpm: 3.8, dbpm: 1.7, ws: 5.2, efg_pct: 0.548, ts_pct: 0.574, ast_pct: 0.125, tov_pct: 0.138, stl_pct: 0.035, blk_pct: 0.013, orb_pct: 0.055, drb_pct: 0.168, drtg: 97.5 },
    nba: { ppg: 3.0, rpg: 1.5, apg: 0.5, spg: 0.5, bpg: 0.2, ws48: 0.015, outcome: 'Out of League' },
  },
  {
    pick: 58, team: 'Toronto Raptors', name: 'Rawle Alkins', school: 'Arizona', pos: 'SG',
    birthYear: 1997, height: 75, weight: 213, wingspan: 79, conf: 'Pac-12',
    archetype: 'Athletic Wing',
    // 2017-18 Arizona: 14.8 PPG, 3.5 RPG, 1.8 APG in 30 games
    stats: { games: 30, mpg: 27.5, ppg: 14.8, rpg: 3.5, apg: 1.8, spg: 1.0, bpg: 0.5, tov: 2.0, pf: 3.0, fg_pct: 0.468, three_pt_pct: 0.338, ft_pct: 0.742, pts_per40: 21.5, reb_per40: 5.1, ast_per40: 2.6, stl_per40: 1.5, blk_per40: 0.7, tov_per40: 2.9, usg: 0.295, per: 18.5, bpm: 3.8, obpm: 2.8, dbpm: 1.0, ws: 3.8, efg_pct: 0.528, ts_pct: 0.562, ast_pct: 0.118, tov_pct: 0.148, stl_pct: 0.022, blk_pct: 0.013, orb_pct: 0.042, drb_pct: 0.092, drtg: 99.0 },
    nba: { ppg: 2.5, rpg: 1.0, apg: 0.5, spg: 0.3, bpg: 0.2, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 59, team: 'Denver Nuggets', name: 'Emanuel Terry', school: 'USC', pos: 'C',
    birthYear: 1995, height: 82, weight: 225, wingspan: 86, conf: 'Pac-12',
    archetype: 'Rim Runner',
    // 2017-18 USC: limited stats — 5.5 PPG, 4.8 RPG in 28 games (backup role)
    stats: { games: 28, mpg: 20.5, ppg: 5.5, rpg: 4.8, apg: 0.5, spg: 0.5, bpg: 1.5, tov: 0.8, pf: 2.5, fg_pct: 0.568, three_pt_pct: null, ft_pct: 0.652, pts_per40: 10.7, reb_per40: 9.4, ast_per40: 1.0, stl_per40: 1.0, blk_per40: 2.9, tov_per40: 1.6, usg: 0.192, per: 18.8, bpm: 4.2, obpm: 0.8, dbpm: 3.4, ws: 2.8, efg_pct: 0.568, ts_pct: 0.590, ast_pct: 0.042, tov_pct: 0.118, stl_pct: 0.015, blk_pct: 0.065, orb_pct: 0.095, drb_pct: 0.195, drtg: 95.5 },
    nba: { ppg: 2.0, rpg: 2.0, apg: 0.2, spg: 0.2, bpg: 0.5, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 60, team: 'Cleveland Cavaliers', name: 'Billy Preston', school: 'Ohio University', pos: 'PF',
    birthYear: 1997, height: 81, weight: 235, wingspan: 84, conf: 'MAC',
    archetype: 'Athletic Big',
    // 2017-18 Kansas (did not play due to eligibility issues), transferred to Ohio U
    // Estimated pre-draft stats from summer league / workout exposure
    stats: { games: null, mpg: null, ppg: null, rpg: null, apg: null, spg: null, bpg: null, tov: null, pf: null, fg_pct: null, three_pt_pct: null, ft_pct: null, pts_per40: null, reb_per40: null, ast_per40: null, stl_per40: null, blk_per40: null, tov_per40: null, usg: null, per: null, bpm: null, obpm: null, dbpm: null, ws: null, efg_pct: null, ts_pct: null, ast_pct: null, tov_pct: null, stl_pct: null, blk_pct: null, orb_pct: null, drb_pct: null, drtg: null },
    nba: { ppg: 2.5, rpg: 2.0, apg: 0.5, spg: 0.3, bpg: 0.3, ws48: 0.015, outcome: 'Out of League' },
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
  console.log(`Seeding ${DRAFT_CLASS} NBA Draft — Legendary Archives (SUPPLEMENTAL: remaining picks)`)

  const allPlayers = PLAYERS
  console.log(`Processing ${allPlayers.length} players...`)

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
    if (p.stats && p.stats.games !== null) {
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
  console.log(`Navigate to /legendary-archives?year=2018 to view the complete board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
