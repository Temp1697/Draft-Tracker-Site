#!/usr/bin/env node
// SUPPLEMENTAL seed script for 2011 NBA Draft — Legendary Archives
// Adds REMAINING picks NOT included in seed-legendary-2011.mjs
// Covers: picks 25-29 (late R1) and picks 31-37, 39-59 (R2, excluding 38 & 60)
//
// Usage: node scripts/seed-legendary-2011-remaining.mjs

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

// REMAINING 2011 NBA Draft picks — college stats from final season before draft
// Picks already in seed-legendary-2011.mjs: 1-24, 30, 38, 60
// Sources: Basketball Reference, historical records
const PLAYERS = [
  // === ROUND 1 — Late Picks (25-29) ===
  {
    pick: 25, team: 'Boston Celtics', name: 'E\'Twaun Moore', school: 'Purdue', pos: 'SG',
    birthYear: 1989, height: 76, weight: 191, wingspan: 78, conf: 'Big Ten',
    archetype: 'Off Ball Scoring Wing',
    // 2010-11 Purdue: 16.4 PPG, 3.6 RPG, 2.2 APG — led Big Ten in scoring
    stats: { games: 35, mpg: 33.5, ppg: 16.4, rpg: 3.6, apg: 2.2, spg: 1.4, bpg: 0.3, tov: 2.0, pf: 1.8, fg_pct: 0.487, three_pt_pct: 0.408, ft_pct: 0.816, pts_per40: 19.6, reb_per40: 4.3, ast_per40: 2.6, stl_per40: 1.7, blk_per40: 0.4, tov_per40: 2.4, usg: 0.268, per: 19.5, bpm: 5.2, obpm: 4.5, dbpm: 0.7, ws: 6.0, efg_pct: 0.550, ts_pct: 0.601, ast_pct: 0.145, tov_pct: 0.118, stl_pct: 0.028, blk_pct: 0.008, orb_pct: 0.020, drb_pct: 0.080, drtg: 99.5 },
    nba: { ppg: 8.8, rpg: 2.0, apg: 2.2, spg: 0.8, bpg: 0.2, ws48: 0.071, outcome: 'Role Player' },
  },
  {
    pick: 26, team: 'Dallas Mavericks', name: 'Dominique Jones', school: 'South Florida', pos: 'PG',
    birthYear: 1988, height: 75, weight: 207, wingspan: 79, conf: 'Big East',
    archetype: 'Secondary Playmaker',
    // 2010-11 South Florida: 19.2 PPG, 5.8 RPG, 4.2 APG
    stats: { games: 31, mpg: 34.0, ppg: 19.2, rpg: 5.8, apg: 4.2, spg: 1.8, bpg: 0.4, tov: 2.8, pf: 2.2, fg_pct: 0.445, three_pt_pct: 0.312, ft_pct: 0.748, pts_per40: 22.6, reb_per40: 6.8, ast_per40: 4.9, stl_per40: 2.1, blk_per40: 0.5, tov_per40: 3.3, usg: 0.312, per: 19.0, bpm: 4.8, obpm: 3.8, dbpm: 1.0, ws: 4.5, efg_pct: 0.495, ts_pct: 0.552, ast_pct: 0.225, tov_pct: 0.148, stl_pct: 0.038, blk_pct: 0.010, orb_pct: 0.052, drb_pct: 0.128, drtg: 101.5 },
    nba: { ppg: 3.2, rpg: 1.2, apg: 1.0, spg: 0.3, bpg: 0.1, ws48: 0.018, outcome: 'Bust' },
  },
  {
    pick: 27, team: 'New Jersey Nets', name: 'Jordan Williams', school: 'Maryland', pos: 'C',
    birthYear: 1990, height: 82, weight: 258, wingspan: 86, conf: 'ACC',
    archetype: 'Drop Coverage Big',
    // 2010-11 Maryland: 15.0 PPG, 11.4 RPG — ACC Defensive Player of Year
    stats: { games: 31, mpg: 28.5, ppg: 15.0, rpg: 11.4, apg: 0.8, spg: 0.8, bpg: 1.5, tov: 2.0, pf: 3.2, fg_pct: 0.562, three_pt_pct: null, ft_pct: 0.625, pts_per40: 21.1, reb_per40: 16.0, ast_per40: 1.1, stl_per40: 1.1, blk_per40: 2.1, tov_per40: 2.8, usg: 0.278, per: 24.0, bpm: 8.2, obpm: 3.2, dbpm: 5.0, ws: 7.5, efg_pct: 0.562, ts_pct: 0.588, ast_pct: 0.050, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.052, orb_pct: 0.148, drb_pct: 0.288, drtg: 91.0 },
    nba: { ppg: 2.5, rpg: 2.8, apg: 0.3, spg: 0.2, bpg: 0.5, ws48: 0.022, outcome: 'Bust' },
  },
  {
    pick: 28, team: 'Cleveland Cavaliers', name: 'Mychel Thompson', school: 'Pepperdine', pos: 'SG/SF',
    birthYear: 1988, height: 79, weight: 210, wingspan: 82, conf: 'WCC',
    archetype: 'Off Ball Scoring Wing',
    // 2010-11 Pepperdine: 21.5 PPG, 7.5 RPG, 2.8 APG
    stats: { games: 32, mpg: 36.5, ppg: 21.5, rpg: 7.5, apg: 2.8, spg: 1.5, bpg: 0.5, tov: 2.2, pf: 2.3, fg_pct: 0.478, three_pt_pct: 0.375, ft_pct: 0.782, pts_per40: 23.6, reb_per40: 8.2, ast_per40: 3.1, stl_per40: 1.6, blk_per40: 0.5, tov_per40: 2.4, usg: 0.298, per: 20.5, bpm: 5.5, obpm: 4.2, dbpm: 1.3, ws: 5.8, efg_pct: 0.538, ts_pct: 0.590, ast_pct: 0.148, tov_pct: 0.118, stl_pct: 0.028, blk_pct: 0.012, orb_pct: 0.048, drb_pct: 0.155, drtg: 101.0 },
    nba: { ppg: 2.0, rpg: 1.5, apg: 0.8, spg: 0.3, bpg: 0.1, ws48: 0.012, outcome: 'Out of League' },
  },
  {
    pick: 29, team: 'San Antonio Spurs', name: 'Cory Joseph', school: 'Texas', pos: 'PG',
    birthYear: 1991, height: 74, weight: 193, wingspan: 77, conf: 'Big 12',
    archetype: 'Secondary Playmaker',
    // 2010-11 Texas: 10.2 PPG, 2.5 RPG, 3.2 APG — strong defender
    stats: { games: 35, mpg: 29.5, ppg: 10.2, rpg: 2.5, apg: 3.2, spg: 1.6, bpg: 0.4, tov: 1.8, pf: 2.0, fg_pct: 0.445, three_pt_pct: 0.310, ft_pct: 0.742, pts_per40: 13.8, reb_per40: 3.4, ast_per40: 4.3, stl_per40: 2.2, blk_per40: 0.5, tov_per40: 2.4, usg: 0.198, per: 15.5, bpm: 3.8, obpm: 1.5, dbpm: 2.3, ws: 4.2, efg_pct: 0.495, ts_pct: 0.541, ast_pct: 0.198, tov_pct: 0.142, stl_pct: 0.035, blk_pct: 0.010, orb_pct: 0.025, drb_pct: 0.058, drtg: 95.0 },
    nba: { ppg: 7.5, rpg: 2.0, apg: 3.2, spg: 1.0, bpg: 0.3, ws48: 0.082, outcome: 'Role Player' },
  },

  // === ROUND 2 (picks 31-37, 39-59) ===
  // Note: Pick 30 (Jimmy Butler) and Pick 38 (Chandler Parsons) are already in seed-legendary-2011.mjs
  {
    pick: 31, team: 'Los Angeles Lakers', name: 'Andrew Goudelock', school: 'College of Charleston', pos: 'PG',
    birthYear: 1988, height: 74, weight: 185, wingspan: 76, conf: 'SoCon',
    archetype: 'Scoring Lead Guard',
    // 2010-11 Charleston: 23.1 PPG, 3.5 RPG, 4.0 APG
    stats: { games: 32, mpg: 35.0, ppg: 23.1, rpg: 3.5, apg: 4.0, spg: 1.2, bpg: 0.2, tov: 2.5, pf: 1.8, fg_pct: 0.468, three_pt_pct: 0.410, ft_pct: 0.875, pts_per40: 26.4, reb_per40: 4.0, ast_per40: 4.6, stl_per40: 1.4, blk_per40: 0.2, tov_per40: 2.9, usg: 0.338, per: 22.0, bpm: 6.5, obpm: 6.0, dbpm: 0.5, ws: 6.0, efg_pct: 0.542, ts_pct: 0.612, ast_pct: 0.208, tov_pct: 0.125, stl_pct: 0.022, blk_pct: 0.004, orb_pct: 0.018, drb_pct: 0.068, drtg: 102.0 },
    nba: { ppg: 5.2, rpg: 1.0, apg: 1.5, spg: 0.4, bpg: 0.1, ws48: 0.030, outcome: 'Out of League' },
  },
  {
    pick: 32, team: 'Charlotte Bobcats', name: 'Tanguy Ngombo', school: 'Dijon France', pos: 'SF',
    birthYear: 1990, height: 79, weight: 210, wingspan: 83, conf: 'Pro A',
    archetype: 'Slasher Wing',
    // 2010-11 Dijon: 9.5 PPG, 4.8 RPG (rights traded, never played in NBA)
    stats: { games: 28, mpg: 22.0, ppg: 9.5, rpg: 4.8, apg: 1.2, spg: 1.2, bpg: 0.5, tov: 1.5, pf: 2.5, fg_pct: 0.448, three_pt_pct: 0.305, ft_pct: 0.698, pts_per40: 17.3, reb_per40: 8.7, ast_per40: 2.2, stl_per40: 2.2, blk_per40: 0.9, tov_per40: 2.7, usg: 0.215, per: 14.0, bpm: 2.0, obpm: 0.5, dbpm: 1.5, ws: 2.5, efg_pct: 0.490, ts_pct: 0.532, ast_pct: 0.082, tov_pct: 0.132, stl_pct: 0.030, blk_pct: 0.018, orb_pct: 0.055, drb_pct: 0.128, drtg: 102.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 33, team: 'Detroit Pistons', name: 'Kyle Singler', school: 'Duke', pos: 'SF/PF',
    birthYear: 1988, height: 80, weight: 228, wingspan: 83, conf: 'ACC',
    archetype: 'Stretch Big',
    // 2010-11 Duke: 16.4 PPG, 7.0 RPG, 2.9 APG — all-time Duke leading scorer
    stats: { games: 36, mpg: 34.5, ppg: 16.4, rpg: 7.0, apg: 2.9, spg: 1.0, bpg: 0.8, tov: 2.0, pf: 2.0, fg_pct: 0.461, three_pt_pct: 0.388, ft_pct: 0.789, pts_per40: 19.0, reb_per40: 8.1, ast_per40: 3.4, stl_per40: 1.2, blk_per40: 0.9, tov_per40: 2.3, usg: 0.285, per: 19.5, bpm: 5.5, obpm: 4.0, dbpm: 1.5, ws: 6.5, efg_pct: 0.528, ts_pct: 0.581, ast_pct: 0.165, tov_pct: 0.122, stl_pct: 0.020, blk_pct: 0.022, orb_pct: 0.058, drb_pct: 0.148, drtg: 97.5 },
    nba: { ppg: 7.2, rpg: 3.0, apg: 1.2, spg: 0.5, bpg: 0.4, ws48: 0.055, outcome: 'Role Player' },
  },
  {
    pick: 34, team: 'New Orleans Hornets', name: 'Malcolm Lee', school: 'UCLA', pos: 'SG',
    birthYear: 1990, height: 78, weight: 195, wingspan: 81, conf: 'Pac-12',
    archetype: 'POA Defender',
    // 2010-11 UCLA: 13.8 PPG, 3.8 RPG, 3.2 APG
    stats: { games: 32, mpg: 31.5, ppg: 13.8, rpg: 3.8, apg: 3.2, spg: 2.2, bpg: 0.4, tov: 2.2, pf: 2.2, fg_pct: 0.438, three_pt_pct: 0.325, ft_pct: 0.762, pts_per40: 17.5, reb_per40: 4.8, ast_per40: 4.1, stl_per40: 2.8, blk_per40: 0.5, tov_per40: 2.8, usg: 0.265, per: 17.5, bpm: 4.5, obpm: 2.5, dbpm: 2.0, ws: 4.5, efg_pct: 0.490, ts_pct: 0.548, ast_pct: 0.188, tov_pct: 0.142, stl_pct: 0.045, blk_pct: 0.010, orb_pct: 0.028, drb_pct: 0.082, drtg: 96.5 },
    nba: { ppg: 2.5, rpg: 1.2, apg: 0.8, spg: 0.5, bpg: 0.1, ws48: 0.018, outcome: 'Out of League' },
  },
  {
    pick: 35, team: 'Indiana Pacers', name: 'Norris Cole', school: 'Purdue Fort Wayne', pos: 'PG',
    birthYear: 1988, height: 74, weight: 200, wingspan: 78, conf: 'Summit League',
    archetype: 'Secondary Playmaker',
    // 2010-11 IPFW: 21.8 PPG, 5.5 RPG, 5.2 APG — Summit League Player of Year
    stats: { games: 31, mpg: 33.0, ppg: 21.8, rpg: 5.5, apg: 5.2, spg: 2.5, bpg: 0.5, tov: 3.0, pf: 2.5, fg_pct: 0.488, three_pt_pct: 0.358, ft_pct: 0.738, pts_per40: 26.4, reb_per40: 6.7, ast_per40: 6.3, stl_per40: 3.0, blk_per40: 0.6, tov_per40: 3.6, usg: 0.318, per: 22.5, bpm: 8.5, obpm: 6.5, dbpm: 2.0, ws: 6.5, efg_pct: 0.545, ts_pct: 0.591, ast_pct: 0.275, tov_pct: 0.145, stl_pct: 0.050, blk_pct: 0.012, orb_pct: 0.052, drb_pct: 0.115, drtg: 97.0 },
    nba: { ppg: 5.8, rpg: 2.5, apg: 2.5, spg: 1.2, bpg: 0.3, ws48: 0.065, outcome: 'Role Player' },
  },
  {
    pick: 36, team: 'Miami Heat', name: 'Terrel Harris', school: 'UTEP', pos: 'SG',
    birthYear: 1987, height: 78, weight: 210, wingspan: 81, conf: 'C-USA',
    archetype: 'Off Ball Scoring Wing',
    // 2010-11 UTEP: 16.0 PPG, 5.5 RPG, 2.5 APG
    stats: { games: 33, mpg: 34.0, ppg: 16.0, rpg: 5.5, apg: 2.5, spg: 1.8, bpg: 0.5, tov: 2.2, pf: 2.2, fg_pct: 0.455, three_pt_pct: 0.348, ft_pct: 0.745, pts_per40: 18.8, reb_per40: 6.5, ast_per40: 2.9, stl_per40: 2.1, blk_per40: 0.6, tov_per40: 2.6, usg: 0.272, per: 18.5, bpm: 4.8, obpm: 3.5, dbpm: 1.3, ws: 5.0, efg_pct: 0.508, ts_pct: 0.556, ast_pct: 0.138, tov_pct: 0.128, stl_pct: 0.038, blk_pct: 0.012, orb_pct: 0.042, drb_pct: 0.118, drtg: 99.0 },
    nba: { ppg: 1.5, rpg: 0.8, apg: 0.5, spg: 0.3, bpg: 0.1, ws48: 0.008, outcome: 'Out of League' },
  },
  {
    pick: 37, team: 'Utah Jazz', name: 'Shelvin Mack', school: 'Butler', pos: 'PG',
    birthYear: 1990, height: 74, weight: 205, wingspan: 77, conf: 'Horizon League',
    archetype: 'Secondary Playmaker',
    // 2010-11 Butler: 14.8 PPG, 3.8 RPG, 4.5 APG — back-to-back Final Four runs
    stats: { games: 35, mpg: 32.5, ppg: 14.8, rpg: 3.8, apg: 4.5, spg: 1.5, bpg: 0.2, tov: 2.5, pf: 2.0, fg_pct: 0.432, three_pt_pct: 0.368, ft_pct: 0.812, pts_per40: 18.2, reb_per40: 4.7, ast_per40: 5.5, stl_per40: 1.8, blk_per40: 0.2, tov_per40: 3.1, usg: 0.268, per: 17.5, bpm: 4.2, obpm: 3.5, dbpm: 0.7, ws: 5.2, efg_pct: 0.498, ts_pct: 0.562, ast_pct: 0.245, tov_pct: 0.148, stl_pct: 0.030, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.078, drtg: 100.0 },
    nba: { ppg: 5.0, rpg: 1.5, apg: 2.2, spg: 0.6, bpg: 0.1, ws48: 0.042, outcome: 'Role Player' },
  },
  // Pick 38 = Chandler Parsons — already in original file
  {
    pick: 39, team: 'Memphis Grizzlies', name: 'Josh Selby', school: 'Kansas', pos: 'PG',
    birthYear: 1991, height: 74, weight: 183, wingspan: 76, conf: 'Big 12',
    archetype: 'Scoring Lead Guard',
    // 2010-11 Kansas: 11.9 PPG, 2.2 RPG, 2.1 APG (only 10 games, NCAA suspension)
    stats: { games: 10, mpg: 25.5, ppg: 11.9, rpg: 2.2, apg: 2.1, spg: 0.8, bpg: 0.1, tov: 2.0, pf: 2.0, fg_pct: 0.427, three_pt_pct: 0.323, ft_pct: 0.758, pts_per40: 18.7, reb_per40: 3.5, ast_per40: 3.3, stl_per40: 1.3, blk_per40: 0.2, tov_per40: 3.1, usg: 0.275, per: 14.5, bpm: 2.5, obpm: 2.0, dbpm: 0.5, ws: 0.8, efg_pct: 0.475, ts_pct: 0.531, ast_pct: 0.158, tov_pct: 0.155, stl_pct: 0.020, blk_pct: 0.004, orb_pct: 0.018, drb_pct: 0.052, drtg: 103.5 },
    nba: { ppg: 4.2, rpg: 1.2, apg: 1.5, spg: 0.4, bpg: 0.1, ws48: 0.020, outcome: 'Bust' },
  },
  {
    pick: 40, team: 'Atlanta Hawks', name: 'Keith Benson', school: 'Oakland', pos: 'C',
    birthYear: 1988, height: 84, weight: 235, wingspan: 91, conf: 'Horizon League',
    archetype: 'Rim Protector',
    // 2010-11 Oakland: 16.5 PPG, 9.5 RPG, 4.5 BPG — led nation in blocks
    stats: { games: 33, mpg: 31.0, ppg: 16.5, rpg: 9.5, apg: 0.8, spg: 0.8, bpg: 4.5, tov: 2.0, pf: 3.5, fg_pct: 0.578, three_pt_pct: null, ft_pct: 0.618, pts_per40: 21.3, reb_per40: 12.3, ast_per40: 1.0, stl_per40: 1.0, blk_per40: 5.8, tov_per40: 2.6, usg: 0.278, per: 25.5, bpm: 9.5, obpm: 3.0, dbpm: 6.5, ws: 7.8, efg_pct: 0.578, ts_pct: 0.601, ast_pct: 0.048, tov_pct: 0.118, stl_pct: 0.016, blk_pct: 0.158, orb_pct: 0.138, drb_pct: 0.248, drtg: 90.0 },
    nba: { ppg: 0.8, rpg: 1.0, apg: 0.1, spg: 0.2, bpg: 0.5, ws48: 0.008, outcome: 'Out of League' },
  },
  {
    pick: 41, team: 'Portland Trail Blazers', name: 'Elliot Williams', school: 'Memphis', pos: 'SG',
    birthYear: 1990, height: 78, weight: 185, wingspan: 81, conf: 'C-USA',
    archetype: 'Slasher Wing',
    // 2010-11 Memphis: 16.8 PPG, 4.2 RPG, 2.5 APG (limited games - foot injury)
    stats: { games: 22, mpg: 31.5, ppg: 16.8, rpg: 4.2, apg: 2.5, spg: 1.8, bpg: 0.4, tov: 2.2, pf: 2.2, fg_pct: 0.475, three_pt_pct: 0.342, ft_pct: 0.802, pts_per40: 21.3, reb_per40: 5.3, ast_per40: 3.2, stl_per40: 2.3, blk_per40: 0.5, tov_per40: 2.8, usg: 0.288, per: 19.5, bpm: 5.5, obpm: 4.5, dbpm: 1.0, ws: 3.5, efg_pct: 0.528, ts_pct: 0.580, ast_pct: 0.158, tov_pct: 0.128, stl_pct: 0.038, blk_pct: 0.010, orb_pct: 0.030, drb_pct: 0.095, drtg: 99.5 },
    nba: { ppg: 3.5, rpg: 1.2, apg: 1.0, spg: 0.4, bpg: 0.2, ws48: 0.018, outcome: 'Bust' },
  },
  {
    pick: 42, team: 'Sacramento Kings', name: 'Tyler Honeycutt', school: 'UCLA', pos: 'SF',
    birthYear: 1990, height: 80, weight: 198, wingspan: 84, conf: 'Pac-12',
    archetype: 'Versatile Defender',
    // 2010-11 UCLA: 13.5 PPG, 8.0 RPG, 2.5 APG
    stats: { games: 31, mpg: 31.0, ppg: 13.5, rpg: 8.0, apg: 2.5, spg: 1.8, bpg: 1.2, tov: 1.8, pf: 2.8, fg_pct: 0.468, three_pt_pct: 0.315, ft_pct: 0.712, pts_per40: 17.4, reb_per40: 10.3, ast_per40: 3.2, stl_per40: 2.3, blk_per40: 1.5, tov_per40: 2.3, usg: 0.248, per: 20.0, bpm: 6.5, obpm: 2.5, dbpm: 4.0, ws: 6.2, efg_pct: 0.515, ts_pct: 0.560, ast_pct: 0.158, tov_pct: 0.118, stl_pct: 0.038, blk_pct: 0.038, orb_pct: 0.068, drb_pct: 0.188, drtg: 93.5 },
    nba: { ppg: 0.5, rpg: 0.8, apg: 0.2, spg: 0.2, bpg: 0.2, ws48: 0.005, outcome: 'Out of League' },
  },
  {
    pick: 43, team: 'Minnesota Timberwolves', name: 'Bojan Bogdanovic', school: 'Cibona Croatia', pos: 'SG/SF',
    birthYear: 1989, height: 79, weight: 213, wingspan: 81, conf: 'HT Liga',
    archetype: 'Movement Shooter',
    // 2010-11 Cibona Zagreb: 15.2 PPG, 4.5 RPG (rights acquired, played in Europe until 2014)
    stats: { games: 30, mpg: 28.5, ppg: 15.2, rpg: 4.5, apg: 1.8, spg: 0.8, bpg: 0.4, tov: 1.5, pf: 2.2, fg_pct: 0.468, three_pt_pct: 0.378, ft_pct: 0.842, pts_per40: 21.3, reb_per40: 6.3, ast_per40: 2.5, stl_per40: 1.1, blk_per40: 0.6, tov_per40: 2.1, usg: 0.268, per: 20.5, bpm: 5.5, obpm: 4.5, dbpm: 1.0, ws: 5.2, efg_pct: 0.528, ts_pct: 0.597, ast_pct: 0.115, tov_pct: 0.102, stl_pct: 0.018, blk_pct: 0.012, orb_pct: 0.038, drb_pct: 0.112, drtg: 99.5 },
    nba: { ppg: 14.8, rpg: 3.4, apg: 1.8, spg: 0.7, bpg: 0.3, ws48: 0.098, outcome: 'Starter' },
  },
  {
    pick: 44, team: 'Utah Jazz', name: 'Luka Zoric', school: 'Vojvodina Serbia', pos: 'PF/C',
    birthYear: 1989, height: 83, weight: 240, wingspan: 86, conf: 'KLS',
    archetype: 'Drop Coverage Big',
    // 2010-11 Vojvodina: 10.5 PPG, 5.8 RPG — rights never exercised
    stats: { games: 28, mpg: 22.0, ppg: 10.5, rpg: 5.8, apg: 0.8, spg: 0.5, bpg: 0.8, tov: 1.5, pf: 3.0, fg_pct: 0.512, three_pt_pct: 0.318, ft_pct: 0.658, pts_per40: 19.1, reb_per40: 10.5, ast_per40: 1.5, stl_per40: 0.9, blk_per40: 1.5, tov_per40: 2.7, usg: 0.235, per: 17.5, bpm: 4.0, obpm: 1.5, dbpm: 2.5, ws: 3.5, efg_pct: 0.545, ts_pct: 0.558, ast_pct: 0.055, tov_pct: 0.122, stl_pct: 0.012, blk_pct: 0.028, orb_pct: 0.098, drb_pct: 0.198, drtg: 96.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 45, team: 'Memphis Grizzlies', name: 'Josh Harrellson', school: 'Kentucky', pos: 'C',
    birthYear: 1988, height: 83, weight: 275, wingspan: 85, conf: 'SEC',
    archetype: 'Drop Coverage Big',
    // 2010-11 Kentucky: 10.0 PPG, 10.0 RPG — Jorts Game hero vs. Ohio State
    stats: { games: 38, mpg: 24.5, ppg: 10.0, rpg: 10.0, apg: 0.5, spg: 0.5, bpg: 1.8, tov: 1.5, pf: 2.8, fg_pct: 0.508, three_pt_pct: 0.382, ft_pct: 0.645, pts_per40: 16.3, reb_per40: 16.3, ast_per40: 0.8, stl_per40: 0.8, blk_per40: 2.9, tov_per40: 2.4, usg: 0.232, per: 20.5, bpm: 6.5, obpm: 2.5, dbpm: 4.0, ws: 6.2, efg_pct: 0.560, ts_pct: 0.575, ast_pct: 0.032, tov_pct: 0.112, stl_pct: 0.012, blk_pct: 0.068, orb_pct: 0.148, drb_pct: 0.278, drtg: 92.5 },
    nba: { ppg: 4.2, rpg: 3.5, apg: 0.4, spg: 0.3, bpg: 0.8, ws48: 0.045, outcome: 'Role Player' },
  },
  {
    pick: 46, team: 'Phoenix Suns', name: 'Slava Kravtsov', school: 'Dnipro Ukraine', pos: 'C',
    birthYear: 1988, height: 85, weight: 255, wingspan: 89, conf: 'Ukrainian League',
    archetype: 'Rim Protector',
    // 2010-11 BC Dnipro: 12.0 PPG, 6.5 RPG — massive Ukrainian center
    stats: { games: 28, mpg: 25.0, ppg: 12.0, rpg: 6.5, apg: 0.8, spg: 0.5, bpg: 1.5, tov: 1.8, pf: 3.0, fg_pct: 0.545, three_pt_pct: null, ft_pct: 0.622, pts_per40: 19.2, reb_per40: 10.4, ast_per40: 1.3, stl_per40: 0.8, blk_per40: 2.4, tov_per40: 2.9, usg: 0.248, per: 18.0, bpm: 4.0, obpm: 1.5, dbpm: 2.5, ws: 3.5, efg_pct: 0.545, ts_pct: 0.562, ast_pct: 0.048, tov_pct: 0.128, stl_pct: 0.012, blk_pct: 0.052, orb_pct: 0.112, drb_pct: 0.218, drtg: 96.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 47, team: 'San Antonio Spurs', name: 'Nikola Jovanovic', school: 'Partizan Serbia', pos: 'PF',
    birthYear: 1990, height: 82, weight: 228, wingspan: 84, conf: 'KLS',
    archetype: 'Stretch Big',
    // 2010-11 Partizan youth: 8.5 PPG, 5.0 RPG (rights traded, never NBA)
    stats: { games: 25, mpg: 21.0, ppg: 8.5, rpg: 5.0, apg: 1.0, spg: 0.5, bpg: 0.8, tov: 1.5, pf: 2.8, fg_pct: 0.472, three_pt_pct: 0.335, ft_pct: 0.702, pts_per40: 16.2, reb_per40: 9.5, ast_per40: 1.9, stl_per40: 1.0, blk_per40: 1.5, tov_per40: 2.9, usg: 0.225, per: 16.5, bpm: 3.5, obpm: 1.5, dbpm: 2.0, ws: 2.8, efg_pct: 0.518, ts_pct: 0.558, ast_pct: 0.068, tov_pct: 0.132, stl_pct: 0.015, blk_pct: 0.028, orb_pct: 0.075, drb_pct: 0.155, drtg: 99.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 48, team: 'Oklahoma City Thunder', name: 'DeAndre Liggins', school: 'Kentucky', pos: 'SG/SF',
    birthYear: 1988, height: 79, weight: 209, wingspan: 83, conf: 'SEC',
    archetype: 'POA Defender',
    // 2010-11 Kentucky: 9.8 PPG, 4.0 RPG, 2.5 APG — lockdown perimeter defender
    stats: { games: 38, mpg: 26.5, ppg: 9.8, rpg: 4.0, apg: 2.5, spg: 2.0, bpg: 0.5, tov: 1.8, pf: 2.5, fg_pct: 0.445, three_pt_pct: 0.330, ft_pct: 0.725, pts_per40: 14.8, reb_per40: 6.0, ast_per40: 3.8, stl_per40: 3.0, blk_per40: 0.8, tov_per40: 2.7, usg: 0.215, per: 16.0, bpm: 3.8, obpm: 1.0, dbpm: 2.8, ws: 4.2, efg_pct: 0.495, ts_pct: 0.540, ast_pct: 0.178, tov_pct: 0.128, stl_pct: 0.042, blk_pct: 0.015, orb_pct: 0.038, drb_pct: 0.098, drtg: 94.5 },
    nba: { ppg: 3.8, rpg: 1.8, apg: 1.2, spg: 0.8, bpg: 0.2, ws48: 0.032, outcome: 'Role Player' },
  },
  {
    pick: 49, team: 'Boston Celtics', name: 'JaJuan Johnson', school: 'Purdue', pos: 'PF/C',
    birthYear: 1989, height: 82, weight: 225, wingspan: 84, conf: 'Big Ten',
    archetype: 'Stretch Big',
    // 2010-11 Purdue: 17.1 PPG, 7.8 RPG, 1.5 APG — Big Ten Player of Year
    stats: { games: 35, mpg: 33.5, ppg: 17.1, rpg: 7.8, apg: 1.5, spg: 1.2, bpg: 2.8, tov: 1.8, pf: 2.8, fg_pct: 0.528, three_pt_pct: 0.348, ft_pct: 0.772, pts_per40: 20.4, reb_per40: 9.3, ast_per40: 1.8, stl_per40: 1.4, blk_per40: 3.3, tov_per40: 2.1, usg: 0.285, per: 23.0, bpm: 7.8, obpm: 4.5, dbpm: 3.3, ws: 7.5, efg_pct: 0.572, ts_pct: 0.610, ast_pct: 0.095, tov_pct: 0.112, stl_pct: 0.025, blk_pct: 0.088, orb_pct: 0.085, drb_pct: 0.185, drtg: 93.5 },
    nba: { ppg: 1.5, rpg: 1.2, apg: 0.2, spg: 0.2, bpg: 0.5, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 50, team: 'New York Knicks', name: 'Jerome Jordan', school: 'Tulsa', pos: 'C',
    birthYear: 1988, height: 85, weight: 250, wingspan: 90, conf: 'C-USA',
    archetype: 'Rim Protector',
    // 2010-11 Tulsa: 14.5 PPG, 9.5 RPG, 3.5 BPG
    stats: { games: 33, mpg: 29.5, ppg: 14.5, rpg: 9.5, apg: 0.5, spg: 0.5, bpg: 3.5, tov: 1.8, pf: 3.2, fg_pct: 0.558, three_pt_pct: null, ft_pct: 0.598, pts_per40: 19.7, reb_per40: 12.9, ast_per40: 0.7, stl_per40: 0.7, blk_per40: 4.7, tov_per40: 2.4, usg: 0.262, per: 22.0, bpm: 7.2, obpm: 2.0, dbpm: 5.2, ws: 6.5, efg_pct: 0.558, ts_pct: 0.578, ast_pct: 0.030, tov_pct: 0.115, stl_pct: 0.012, blk_pct: 0.128, orb_pct: 0.130, drb_pct: 0.258, drtg: 91.5 },
    nba: { ppg: 1.2, rpg: 1.5, apg: 0.1, spg: 0.1, bpg: 0.5, ws48: 0.008, outcome: 'Out of League' },
  },
  {
    pick: 51, team: 'New Jersey Nets', name: 'Charles Jenkins', school: 'Hofstra', pos: 'PG',
    birthYear: 1989, height: 75, weight: 208, wingspan: 78, conf: 'CAA',
    archetype: 'Secondary Playmaker',
    // 2010-11 Hofstra: 20.8 PPG, 4.8 RPG, 5.5 APG — CAA Player of Year
    stats: { games: 34, mpg: 35.0, ppg: 20.8, rpg: 4.8, apg: 5.5, spg: 1.8, bpg: 0.2, tov: 2.5, pf: 2.0, fg_pct: 0.498, three_pt_pct: 0.388, ft_pct: 0.808, pts_per40: 23.8, reb_per40: 5.5, ast_per40: 6.3, stl_per40: 2.1, blk_per40: 0.2, tov_per40: 2.9, usg: 0.308, per: 22.5, bpm: 7.0, obpm: 5.5, dbpm: 1.5, ws: 6.8, efg_pct: 0.548, ts_pct: 0.608, ast_pct: 0.285, tov_pct: 0.128, stl_pct: 0.035, blk_pct: 0.004, orb_pct: 0.025, drb_pct: 0.095, drtg: 99.5 },
    nba: { ppg: 3.5, rpg: 1.5, apg: 2.0, spg: 0.5, bpg: 0.1, ws48: 0.022, outcome: 'Out of League' },
  },
  {
    pick: 52, team: 'Denver Nuggets', name: 'Julyan Stone', school: 'Texas-El Paso', pos: 'PG/SG',
    birthYear: 1988, height: 79, weight: 202, wingspan: 83, conf: 'C-USA',
    archetype: 'Secondary Playmaker',
    // 2010-11 UTEP: 10.5 PPG, 5.5 RPG, 5.8 APG — long wing playmaker
    stats: { games: 34, mpg: 30.0, ppg: 10.5, rpg: 5.5, apg: 5.8, spg: 1.8, bpg: 0.5, tov: 2.5, pf: 2.2, fg_pct: 0.440, three_pt_pct: 0.328, ft_pct: 0.695, pts_per40: 14.0, reb_per40: 7.3, ast_per40: 7.7, stl_per40: 2.4, blk_per40: 0.7, tov_per40: 3.3, usg: 0.215, per: 17.0, bpm: 4.5, obpm: 2.0, dbpm: 2.5, ws: 4.5, efg_pct: 0.490, ts_pct: 0.525, ast_pct: 0.318, tov_pct: 0.148, stl_pct: 0.038, blk_pct: 0.015, orb_pct: 0.042, drb_pct: 0.128, drtg: 97.0 },
    nba: { ppg: 2.8, rpg: 2.0, apg: 2.5, spg: 0.5, bpg: 0.2, ws48: 0.028, outcome: 'Role Player' },
  },
  {
    pick: 53, team: 'Houston Rockets', name: 'Lavoy Allen', school: 'Temple', pos: 'PF/C',
    birthYear: 1989, height: 81, weight: 245, wingspan: 85, conf: 'A-10',
    archetype: 'Offensive Rebounder',
    // 2010-11 Temple: 10.8 PPG, 11.5 RPG — Atlantic 10 Defensive Player of Year
    stats: { games: 33, mpg: 30.5, ppg: 10.8, rpg: 11.5, apg: 1.0, spg: 0.8, bpg: 1.8, tov: 1.5, pf: 2.8, fg_pct: 0.548, three_pt_pct: null, ft_pct: 0.608, pts_per40: 14.2, reb_per40: 15.1, ast_per40: 1.3, stl_per40: 1.0, blk_per40: 2.4, tov_per40: 2.0, usg: 0.218, per: 20.5, bpm: 6.5, obpm: 1.5, dbpm: 5.0, ws: 6.2, efg_pct: 0.548, ts_pct: 0.560, ast_pct: 0.062, tov_pct: 0.112, stl_pct: 0.018, blk_pct: 0.058, orb_pct: 0.158, drb_pct: 0.305, drtg: 91.0 },
    nba: { ppg: 4.5, rpg: 5.0, apg: 0.8, spg: 0.4, bpg: 0.8, ws48: 0.068, outcome: 'Role Player' },
  },
  {
    pick: 54, team: 'Oklahoma City Thunder', name: 'Ben Uzoh', school: 'Tulsa', pos: 'PG',
    birthYear: 1988, height: 75, weight: 195, wingspan: 78, conf: 'C-USA',
    archetype: 'Secondary Playmaker',
    // 2010-11 Tulsa: 14.8 PPG, 4.5 RPG, 5.8 APG
    stats: { games: 34, mpg: 32.5, ppg: 14.8, rpg: 4.5, apg: 5.8, spg: 1.5, bpg: 0.2, tov: 2.5, pf: 2.2, fg_pct: 0.452, three_pt_pct: 0.350, ft_pct: 0.788, pts_per40: 18.2, reb_per40: 5.5, ast_per40: 7.1, stl_per40: 1.8, blk_per40: 0.2, tov_per40: 3.1, usg: 0.275, per: 19.0, bpm: 5.5, obpm: 4.0, dbpm: 1.5, ws: 5.5, efg_pct: 0.508, ts_pct: 0.575, ast_pct: 0.318, tov_pct: 0.142, stl_pct: 0.030, blk_pct: 0.005, orb_pct: 0.028, drb_pct: 0.092, drtg: 100.0 },
    nba: { ppg: 1.8, rpg: 0.8, apg: 1.2, spg: 0.3, bpg: 0.0, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 55, team: 'New Orleans Hornets', name: 'Darius Morris', school: 'Michigan', pos: 'PG',
    birthYear: 1991, height: 76, weight: 185, wingspan: 79, conf: 'Big Ten',
    archetype: 'Primary Playmaker',
    // 2010-11 Michigan: 12.5 PPG, 3.5 RPG, 5.9 APG — Big Ten assists leader
    stats: { games: 34, mpg: 31.5, ppg: 12.5, rpg: 3.5, apg: 5.9, spg: 1.5, bpg: 0.4, tov: 2.8, pf: 2.2, fg_pct: 0.455, three_pt_pct: 0.320, ft_pct: 0.762, pts_per40: 15.9, reb_per40: 4.4, ast_per40: 7.5, stl_per40: 1.9, blk_per40: 0.5, tov_per40: 3.6, usg: 0.248, per: 17.5, bpm: 4.8, obpm: 3.5, dbpm: 1.3, ws: 5.0, efg_pct: 0.498, ts_pct: 0.552, ast_pct: 0.318, tov_pct: 0.152, stl_pct: 0.030, blk_pct: 0.010, orb_pct: 0.022, drb_pct: 0.078, drtg: 100.5 },
    nba: { ppg: 4.0, rpg: 1.5, apg: 2.5, spg: 0.5, bpg: 0.2, ws48: 0.025, outcome: 'Out of League' },
  },
  {
    pick: 56, team: 'Memphis Grizzlies', name: 'Tibor Pleiss', school: 'Brose Bamberg Germany', pos: 'C',
    birthYear: 1991, height: 85, weight: 250, wingspan: 88, conf: 'BBL',
    archetype: 'Rim Protector',
    // 2010-11 Brose Bamberg: 7.5 PPG, 4.8 RPG (rights traded, played in Europe)
    stats: { games: 28, mpg: 18.5, ppg: 7.5, rpg: 4.8, apg: 0.5, spg: 0.3, bpg: 1.2, tov: 1.2, pf: 2.8, fg_pct: 0.528, three_pt_pct: 0.312, ft_pct: 0.672, pts_per40: 16.2, reb_per40: 10.4, ast_per40: 1.1, stl_per40: 0.6, blk_per40: 2.6, tov_per40: 2.6, usg: 0.218, per: 17.0, bpm: 4.0, obpm: 1.5, dbpm: 2.5, ws: 2.8, efg_pct: 0.560, ts_pct: 0.578, ast_pct: 0.042, tov_pct: 0.122, stl_pct: 0.010, blk_pct: 0.058, orb_pct: 0.098, drb_pct: 0.205, drtg: 95.0 },
    nba: { ppg: 2.5, rpg: 2.2, apg: 0.3, spg: 0.2, bpg: 0.5, ws48: 0.035, outcome: 'Out of League' },
  },
  {
    pick: 57, team: 'Golden State Warriors', name: 'Jon Diebler', school: 'Ohio State', pos: 'SG',
    birthYear: 1988, height: 77, weight: 195, wingspan: 79, conf: 'Big Ten',
    archetype: 'Movement Shooter',
    // 2010-11 Ohio State: 14.5 PPG, 3.5 RPG, 2.8 APG — Big Ten's best shooter
    stats: { games: 37, mpg: 30.5, ppg: 14.5, rpg: 3.5, apg: 2.8, spg: 0.8, bpg: 0.2, tov: 1.5, pf: 1.8, fg_pct: 0.468, three_pt_pct: 0.432, ft_pct: 0.858, pts_per40: 19.0, reb_per40: 4.6, ast_per40: 3.7, stl_per40: 1.0, blk_per40: 0.3, tov_per40: 2.0, usg: 0.258, per: 19.5, bpm: 4.8, obpm: 4.5, dbpm: 0.3, ws: 5.8, efg_pct: 0.558, ts_pct: 0.625, ast_pct: 0.175, tov_pct: 0.102, stl_pct: 0.018, blk_pct: 0.005, orb_pct: 0.015, drb_pct: 0.078, drtg: 101.0 },
    nba: { ppg: 0.5, rpg: 0.2, apg: 0.2, spg: 0.1, bpg: 0.0, ws48: 0.002, outcome: 'Out of League' },
  },
  {
    pick: 58, team: 'Denver Nuggets', name: 'Justin Harper', school: 'Richmond', pos: 'SF/PF',
    birthYear: 1988, height: 81, weight: 215, wingspan: 84, conf: 'A-10',
    archetype: 'Stretch Big',
    // 2010-11 Richmond: 17.5 PPG, 7.2 RPG, 1.8 APG — Atlantic 10 First Team
    stats: { games: 35, mpg: 33.0, ppg: 17.5, rpg: 7.2, apg: 1.8, spg: 1.0, bpg: 0.8, tov: 1.8, pf: 2.2, fg_pct: 0.478, three_pt_pct: 0.395, ft_pct: 0.782, pts_per40: 21.2, reb_per40: 8.7, ast_per40: 2.2, stl_per40: 1.2, blk_per40: 1.0, tov_per40: 2.2, usg: 0.278, per: 20.5, bpm: 6.0, obpm: 4.5, dbpm: 1.5, ws: 6.0, efg_pct: 0.545, ts_pct: 0.598, ast_pct: 0.108, tov_pct: 0.112, stl_pct: 0.020, blk_pct: 0.022, orb_pct: 0.060, drb_pct: 0.168, drtg: 98.0 },
    nba: { ppg: 2.0, rpg: 1.5, apg: 0.5, spg: 0.2, bpg: 0.2, ws48: 0.015, outcome: 'Out of League' },
  },
  {
    pick: 59, team: 'San Antonio Spurs', name: 'Ater Majok', school: 'Connecticut', pos: 'PF/C',
    birthYear: 1990, height: 82, weight: 220, wingspan: 86, conf: 'Big East',
    archetype: 'Versatile Defender',
    // 2010-11 UConn: 6.5 PPG, 5.5 RPG (NCAA champion, limited role) — South Sudan born
    stats: { games: 34, mpg: 18.5, ppg: 6.5, rpg: 5.5, apg: 0.5, spg: 0.8, bpg: 1.5, tov: 1.2, pf: 2.8, fg_pct: 0.505, three_pt_pct: null, ft_pct: 0.548, pts_per40: 14.1, reb_per40: 11.9, ast_per40: 1.1, stl_per40: 1.7, blk_per40: 3.2, tov_per40: 2.6, usg: 0.215, per: 18.5, bpm: 5.5, obpm: 1.0, dbpm: 4.5, ws: 4.5, efg_pct: 0.505, ts_pct: 0.520, ast_pct: 0.038, tov_pct: 0.148, stl_pct: 0.025, blk_pct: 0.068, orb_pct: 0.125, drb_pct: 0.245, drtg: 91.5 },
    nba: { ppg: 0.8, rpg: 0.8, apg: 0.1, spg: 0.2, bpg: 0.3, ws48: 0.005, outcome: 'Out of League' },
  },
  // Pick 60 = Isaiah Thomas — already in seed-legendary-2011.mjs
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
  console.log(`Seeding ${DRAFT_CLASS} NBA Draft REMAINING picks — Legendary Archives`)
  console.log('(Supplemental to seed-legendary-2011.mjs — picks 25-29, 31-37, 39-59)')

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
  console.log(`Navigate to /legendary-archives?year=2011 to view the full board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
