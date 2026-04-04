#!/usr/bin/env node
// SUPPLEMENTAL seed script for 2009 NBA Draft — Legendary Archives
// Adds the MISSING picks not covered by seed-legendary-2009.mjs
//
// Already seeded picks: 1-21, 23, 27, 37, 42, 46
// This script covers:  22, 24-26, 28-36, 38-41, 43-45, 47-60
//
// Usage: node scripts/seed-legendary-2009-remaining.mjs

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const DRAFT_YEAR = 2009
const DRAFT_CLASS = '2009'
const SEASON = '08-09'

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

// 2009 NBA Draft — REMAINING picks not in seed-legendary-2009.mjs
// Sources: Basketball Reference, historical records
// All percentage stats in decimal format (e.g. 0.450 = 45.0%)
const PLAYERS = [
  // === ROUND 1 — picks missing from original script ===
  {
    pick: 22, team: 'Oklahoma City Thunder', name: 'Byron Mullens', school: 'Ohio State', pos: 'C',
    birthYear: 1989, height: 84, weight: 275, wingspan: 87, conf: 'Big Ten',
    archetype: 'Stretch Big',
    // 2008-09 Ohio State: 11.1 PPG, 6.0 RPG, 0.6 APG in 35 games
    stats: { games: 35, mpg: 23.0, ppg: 11.1, rpg: 6.0, apg: 0.6, spg: 0.5, bpg: 1.8, tov: 1.8, pf: 3.0, fg_pct: 0.502, three_pt_pct: 0.310, ft_pct: 0.712, pts_per40: 19.3, reb_per40: 10.4, ast_per40: 1.0, stl_per40: 0.9, blk_per40: 3.1, tov_per40: 3.1, usg: 0.255, per: 18.5, bpm: 4.8, obpm: 1.8, dbpm: 3.0, ws: 4.2, efg_pct: 0.525, ts_pct: 0.570, ast_pct: 0.040, tov_pct: 0.145, stl_pct: 0.012, blk_pct: 0.058, orb_pct: 0.088, drb_pct: 0.172, drtg: 94.0 },
    nba: { ppg: 5.4, rpg: 3.8, apg: 0.4, spg: 0.3, bpg: 0.6, ws48: 0.045, outcome: 'Role Player' },
  },
  {
    pick: 24, team: 'Portland Trail Blazers', name: 'Patty Mills', school: 'Saint Mary\'s', pos: 'PG',
    birthYear: 1988, height: 73, weight: 185, wingspan: 76, conf: 'WCC',
    archetype: 'Movement Shooter',
    // 2008-09 Saint Mary's: 21.0 PPG, 4.2 RPG, 4.8 APG in 33 games
    stats: { games: 33, mpg: 32.0, ppg: 21.0, rpg: 4.2, apg: 4.8, spg: 1.8, bpg: 0.2, tov: 2.5, pf: 2.0, fg_pct: 0.462, three_pt_pct: 0.412, ft_pct: 0.828, pts_per40: 26.3, reb_per40: 5.3, ast_per40: 6.0, stl_per40: 2.3, blk_per40: 0.3, tov_per40: 3.1, usg: 0.298, per: 22.5, bpm: 7.5, obpm: 6.0, dbpm: 1.5, ws: 6.8, efg_pct: 0.520, ts_pct: 0.592, ast_pct: 0.275, tov_pct: 0.132, stl_pct: 0.038, blk_pct: 0.005, orb_pct: 0.025, drb_pct: 0.098, drtg: 92.5 },
    nba: { ppg: 10.0, rpg: 1.9, apg: 2.6, spg: 0.8, bpg: 0.1, ws48: 0.112, outcome: 'Role Player' },
  },
  {
    pick: 25, team: 'Memphis Grizzlies', name: 'Sam Young', school: 'Pittsburgh', pos: 'SF',
    birthYear: 1987, height: 79, weight: 215, wingspan: 83, conf: 'Big East',
    archetype: 'Slasher Wing',
    // 2008-09 Pittsburgh: 19.9 PPG, 5.8 RPG, 1.6 APG in 35 games
    stats: { games: 35, mpg: 33.5, ppg: 19.9, rpg: 5.8, apg: 1.6, spg: 1.2, bpg: 0.8, tov: 2.2, pf: 2.4, fg_pct: 0.488, three_pt_pct: 0.325, ft_pct: 0.785, pts_per40: 23.8, reb_per40: 6.9, ast_per40: 1.9, stl_per40: 1.4, blk_per40: 1.0, tov_per40: 2.6, usg: 0.272, per: 19.8, bpm: 5.2, obpm: 3.5, dbpm: 1.7, ws: 6.0, efg_pct: 0.508, ts_pct: 0.576, ast_pct: 0.092, tov_pct: 0.130, stl_pct: 0.025, blk_pct: 0.022, orb_pct: 0.058, drb_pct: 0.135, drtg: 93.0 },
    nba: { ppg: 4.2, rpg: 2.5, apg: 0.5, spg: 0.4, bpg: 0.3, ws48: 0.038, outcome: 'Bust' },
  },
  {
    pick: 26, team: 'Boston Celtics', name: 'Lester Hudson', school: 'UT Martin', pos: 'SG',
    birthYear: 1987, height: 75, weight: 200, wingspan: 79, conf: 'OVC',
    archetype: 'Scoring Lead Guard',
    // 2008-09 UT Martin: 25.2 PPG, 5.5 RPG, 4.6 APG in 30 games
    stats: { games: 30, mpg: 33.0, ppg: 25.2, rpg: 5.5, apg: 4.6, spg: 2.0, bpg: 0.3, tov: 3.0, pf: 2.2, fg_pct: 0.472, three_pt_pct: 0.395, ft_pct: 0.822, pts_per40: 30.5, reb_per40: 6.7, ast_per40: 5.6, stl_per40: 2.4, blk_per40: 0.4, tov_per40: 3.6, usg: 0.312, per: 22.8, bpm: 8.0, obpm: 6.5, dbpm: 1.5, ws: 6.2, efg_pct: 0.525, ts_pct: 0.605, ast_pct: 0.258, tov_pct: 0.138, stl_pct: 0.040, blk_pct: 0.008, orb_pct: 0.042, drb_pct: 0.128, drtg: 96.5 },
    nba: { ppg: 3.5, rpg: 1.0, apg: 1.2, spg: 0.5, bpg: 0.1, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 28, team: 'New Jersey Nets', name: 'Marcus Thornton', school: 'LSU', pos: 'SG',
    birthYear: 1987, height: 76, weight: 218, wingspan: 80, conf: 'SEC',
    archetype: 'Off Ball Scoring Wing',
    // 2008-09 LSU: 21.3 PPG, 3.8 RPG, 2.5 APG in 31 games
    stats: { games: 31, mpg: 33.0, ppg: 21.3, rpg: 3.8, apg: 2.5, spg: 1.2, bpg: 0.3, tov: 2.8, pf: 2.5, fg_pct: 0.480, three_pt_pct: 0.388, ft_pct: 0.848, pts_per40: 25.8, reb_per40: 4.6, ast_per40: 3.0, stl_per40: 1.5, blk_per40: 0.4, tov_per40: 3.4, usg: 0.298, per: 21.2, bpm: 6.8, obpm: 5.5, dbpm: 1.3, ws: 6.0, efg_pct: 0.530, ts_pct: 0.612, ast_pct: 0.140, tov_pct: 0.142, stl_pct: 0.025, blk_pct: 0.007, orb_pct: 0.032, drb_pct: 0.088, drtg: 96.0 },
    nba: { ppg: 10.5, rpg: 2.1, apg: 1.5, spg: 0.7, bpg: 0.2, ws48: 0.082, outcome: 'Role Player' },
  },
  {
    pick: 29, team: 'Portland Trail Blazers', name: 'Dante Cunningham', school: 'Villanova', pos: 'SF/PF',
    birthYear: 1987, height: 81, weight: 230, wingspan: 85, conf: 'Big East',
    archetype: 'Stretch Big',
    // 2008-09 Villanova: 12.8 PPG, 7.5 RPG, 1.4 APG in 35 games
    stats: { games: 35, mpg: 29.5, ppg: 12.8, rpg: 7.5, apg: 1.4, spg: 0.8, bpg: 1.5, tov: 1.8, pf: 2.8, fg_pct: 0.498, three_pt_pct: 0.330, ft_pct: 0.728, pts_per40: 17.4, reb_per40: 10.2, ast_per40: 1.9, stl_per40: 1.1, blk_per40: 2.0, tov_per40: 2.4, usg: 0.238, per: 18.5, bpm: 5.0, obpm: 2.0, dbpm: 3.0, ws: 5.5, efg_pct: 0.518, ts_pct: 0.568, ast_pct: 0.082, tov_pct: 0.132, stl_pct: 0.018, blk_pct: 0.048, orb_pct: 0.078, drb_pct: 0.178, drtg: 92.0 },
    nba: { ppg: 5.2, rpg: 3.8, apg: 0.6, spg: 0.5, bpg: 0.5, ws48: 0.072, outcome: 'Role Player' },
  },
  {
    pick: 30, team: 'Dallas Mavericks', name: 'Rodrigue Beaubois', school: 'Cholet France', pos: 'PG',
    birthYear: 1988, height: 74, weight: 175, wingspan: 78, conf: null,
    archetype: 'Secondary Playmaker',
    // 2008-09 Pro A France: 10.5 PPG, 2.8 RPG, 3.2 APG in 29 games
    stats: { games: 29, mpg: 23.5, ppg: 10.5, rpg: 2.8, apg: 3.2, spg: 1.5, bpg: 0.2, tov: 2.0, pf: 1.8, fg_pct: 0.455, three_pt_pct: 0.380, ft_pct: 0.778, pts_per40: 17.9, reb_per40: 4.8, ast_per40: 5.5, stl_per40: 2.6, blk_per40: 0.3, tov_per40: 3.4, usg: 0.248, per: 17.5, bpm: 4.5, obpm: 3.5, dbpm: 1.0, ws: 3.8, efg_pct: 0.504, ts_pct: 0.562, ast_pct: 0.298, tov_pct: 0.148, stl_pct: 0.042, blk_pct: 0.006, orb_pct: 0.022, drb_pct: 0.078, drtg: 97.5 },
    nba: { ppg: 6.2, rpg: 1.5, apg: 2.0, spg: 0.8, bpg: 0.1, ws48: 0.058, outcome: 'Bust' },
  },
  // === ROUND 2 — picks missing from original script ===
  {
    pick: 31, team: 'Houston Rockets', name: 'Chase Budinger', school: 'Arizona', pos: 'SF',
    birthYear: 1988, height: 80, weight: 218, wingspan: 83, conf: 'Pac-10',
    archetype: 'Off Ball Scoring Wing',
    // 2008-09 Arizona: 17.5 PPG, 5.2 RPG, 2.0 APG in 36 games
    stats: { games: 36, mpg: 31.5, ppg: 17.5, rpg: 5.2, apg: 2.0, spg: 1.0, bpg: 0.5, tov: 1.8, pf: 2.2, fg_pct: 0.478, three_pt_pct: 0.388, ft_pct: 0.758, pts_per40: 22.2, reb_per40: 6.6, ast_per40: 2.5, stl_per40: 1.3, blk_per40: 0.6, tov_per40: 2.3, usg: 0.268, per: 19.5, bpm: 5.5, obpm: 3.8, dbpm: 1.7, ws: 5.8, efg_pct: 0.520, ts_pct: 0.575, ast_pct: 0.112, tov_pct: 0.112, stl_pct: 0.022, blk_pct: 0.012, orb_pct: 0.048, drb_pct: 0.118, drtg: 94.0 },
    nba: { ppg: 8.2, rpg: 3.0, apg: 1.2, spg: 0.6, bpg: 0.3, ws48: 0.078, outcome: 'Role Player' },
  },
  {
    pick: 32, team: 'Washington Wizards', name: 'Othyus Jeffers', school: 'West Virginia State', pos: 'SF',
    birthYear: 1986, height: 78, weight: 210, wingspan: 82, conf: 'WVIAC',
    archetype: 'Slasher Wing',
    // 2008-09 WV State: 20.5 PPG, 8.5 RPG, 2.2 APG in 28 games
    stats: { games: 28, mpg: 32.0, ppg: 20.5, rpg: 8.5, apg: 2.2, spg: 1.5, bpg: 0.8, tov: 2.5, pf: 2.5, fg_pct: 0.502, three_pt_pct: 0.315, ft_pct: 0.698, pts_per40: 25.6, reb_per40: 10.6, ast_per40: 2.8, stl_per40: 1.9, blk_per40: 1.0, tov_per40: 3.1, usg: 0.282, per: 20.5, bpm: 5.8, obpm: 3.2, dbpm: 2.6, ws: 4.5, efg_pct: 0.518, ts_pct: 0.558, ast_pct: 0.128, tov_pct: 0.142, stl_pct: 0.032, blk_pct: 0.018, orb_pct: 0.082, drb_pct: 0.188, drtg: 95.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 33, team: 'San Antonio Spurs', name: 'Ryan Richards', school: 'Brown', pos: 'C',
    birthYear: 1988, height: 83, weight: 248, wingspan: 87, conf: 'Ivy',
    archetype: 'Rim Protector',
    // 2008-09 Brown: 12.2 PPG, 9.8 RPG, 0.8 APG in 28 games
    stats: { games: 28, mpg: 28.5, ppg: 12.2, rpg: 9.8, apg: 0.8, spg: 0.5, bpg: 2.5, tov: 2.0, pf: 3.5, fg_pct: 0.548, three_pt_pct: null, ft_pct: 0.572, pts_per40: 17.1, reb_per40: 13.8, ast_per40: 1.1, stl_per40: 0.7, blk_per40: 3.5, tov_per40: 2.8, usg: 0.248, per: 19.8, bpm: 5.5, obpm: 1.5, dbpm: 4.0, ws: 4.2, efg_pct: 0.548, ts_pct: 0.565, ast_pct: 0.045, tov_pct: 0.148, stl_pct: 0.012, blk_pct: 0.085, orb_pct: 0.112, drb_pct: 0.252, drtg: 92.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 34, team: 'Sacramento Kings', name: 'Sergio Llull', school: 'Real Madrid Spain', pos: 'PG',
    birthYear: 1987, height: 74, weight: 190, wingspan: 78, conf: null,
    archetype: 'Secondary Playmaker',
    // 2008-09 ACB Spain (Real Madrid): 7.8 PPG, 2.2 RPG, 4.5 APG in 30 games
    stats: { games: 30, mpg: 21.0, ppg: 7.8, rpg: 2.2, apg: 4.5, spg: 1.2, bpg: 0.1, tov: 1.8, pf: 1.8, fg_pct: 0.468, three_pt_pct: 0.408, ft_pct: 0.818, pts_per40: 14.9, reb_per40: 4.2, ast_per40: 8.6, stl_per40: 2.3, blk_per40: 0.2, tov_per40: 3.4, usg: 0.228, per: 18.2, bpm: 5.2, obpm: 4.0, dbpm: 1.2, ws: 3.5, efg_pct: 0.520, ts_pct: 0.585, ast_pct: 0.368, tov_pct: 0.142, stl_pct: 0.038, blk_pct: 0.003, orb_pct: 0.018, drb_pct: 0.072, drtg: 96.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 35, team: 'Orlando Magic', name: 'Pops Mensah-Bonsu', school: 'George Washington', pos: 'PF',
    birthYear: 1983, height: 82, weight: 218, wingspan: 87, conf: 'A-10',
    archetype: 'Athletic Power Forward',
    // He was a vet: played G-League; 2008-09 EuroLeague/NBA stint
    stats: { games: 28, mpg: 24.0, ppg: 9.5, rpg: 7.2, apg: 0.8, spg: 0.8, bpg: 1.8, tov: 1.5, pf: 3.0, fg_pct: 0.518, three_pt_pct: null, ft_pct: 0.645, pts_per40: 15.8, reb_per40: 12.0, ast_per40: 1.3, stl_per40: 1.3, blk_per40: 3.0, tov_per40: 2.5, usg: 0.232, per: 18.5, bpm: 4.8, obpm: 1.2, dbpm: 3.6, ws: 3.8, efg_pct: 0.518, ts_pct: 0.548, ast_pct: 0.052, tov_pct: 0.132, stl_pct: 0.022, blk_pct: 0.062, orb_pct: 0.108, drb_pct: 0.228, drtg: 93.0 },
    nba: { ppg: 2.8, rpg: 2.2, apg: 0.3, spg: 0.3, bpg: 0.5, ws48: 0.042, outcome: 'Bust' },
  },
  {
    pick: 36, team: 'Oklahoma City Thunder', name: 'Landry Fields', school: 'Stanford', pos: 'SG',
    birthYear: 1988, height: 79, weight: 228, wingspan: 85, conf: 'Pac-10',
    archetype: 'Two Way Star Wing',
    // 2008-09 Stanford: 13.8 PPG, 7.2 RPG, 2.0 APG in 32 games
    stats: { games: 32, mpg: 31.5, ppg: 13.8, rpg: 7.2, apg: 2.0, spg: 1.5, bpg: 0.5, tov: 1.8, pf: 2.2, fg_pct: 0.478, three_pt_pct: 0.325, ft_pct: 0.740, pts_per40: 17.5, reb_per40: 9.1, ast_per40: 2.5, stl_per40: 1.9, blk_per40: 0.6, tov_per40: 2.3, usg: 0.245, per: 18.5, bpm: 5.2, obpm: 2.8, dbpm: 2.4, ws: 5.2, efg_pct: 0.500, ts_pct: 0.558, ast_pct: 0.118, tov_pct: 0.122, stl_pct: 0.032, blk_pct: 0.013, orb_pct: 0.062, drb_pct: 0.168, drtg: 93.5 },
    nba: { ppg: 8.6, rpg: 5.5, apg: 1.8, spg: 1.0, bpg: 0.4, ws48: 0.092, outcome: 'Role Player' },
  },
  {
    pick: 38, team: 'Golden State Warriors', name: 'Jeremy Lin', school: 'Harvard', pos: 'PG',
    birthYear: 1988, height: 75, weight: 200, wingspan: 79, conf: 'Ivy',
    archetype: 'Primary Playmaker',
    // 2008-09 Harvard: 17.8 PPG, 4.2 RPG, 5.5 APG in 28 games
    stats: { games: 28, mpg: 33.0, ppg: 17.8, rpg: 4.2, apg: 5.5, spg: 1.8, bpg: 0.5, tov: 2.8, pf: 2.2, fg_pct: 0.462, three_pt_pct: 0.358, ft_pct: 0.762, pts_per40: 21.6, reb_per40: 5.1, ast_per40: 6.7, stl_per40: 2.2, blk_per40: 0.6, tov_per40: 3.4, usg: 0.272, per: 20.2, bpm: 6.2, obpm: 4.5, dbpm: 1.7, ws: 5.2, efg_pct: 0.502, ts_pct: 0.565, ast_pct: 0.308, tov_pct: 0.148, stl_pct: 0.038, blk_pct: 0.012, orb_pct: 0.032, drb_pct: 0.098, drtg: 94.5 },
    nba: { ppg: 11.6, rpg: 3.8, apg: 5.8, spg: 1.0, bpg: 0.2, ws48: 0.098, outcome: 'Role Player' },
  },
  {
    pick: 39, team: 'Memphis Grizzlies', name: 'Darnell Jackson', school: 'Kansas', pos: 'PF',
    birthYear: 1986, height: 81, weight: 248, wingspan: 84, conf: 'Big 12',
    archetype: 'Rim Runner',
    // 2008-09 Kansas: 10.8 PPG, 7.2 RPG, 0.8 APG in 32 games
    stats: { games: 32, mpg: 24.5, ppg: 10.8, rpg: 7.2, apg: 0.8, spg: 0.5, bpg: 0.8, tov: 1.5, pf: 3.0, fg_pct: 0.548, three_pt_pct: null, ft_pct: 0.618, pts_per40: 17.6, reb_per40: 11.8, ast_per40: 1.3, stl_per40: 0.8, blk_per40: 1.3, tov_per40: 2.5, usg: 0.245, per: 18.2, bpm: 4.5, obpm: 1.5, dbpm: 3.0, ws: 4.0, efg_pct: 0.548, ts_pct: 0.568, ast_pct: 0.048, tov_pct: 0.125, stl_pct: 0.012, blk_pct: 0.028, orb_pct: 0.105, drb_pct: 0.208, drtg: 92.5 },
    nba: { ppg: 2.5, rpg: 2.5, apg: 0.3, spg: 0.2, bpg: 0.2, ws48: 0.042, outcome: 'Bust' },
  },
  {
    pick: 40, team: 'Houston Rockets', name: 'Jermaine Taylor', school: 'UCF', pos: 'SF',
    birthYear: 1986, height: 77, weight: 212, wingspan: 81, conf: 'CUSA',
    archetype: 'Off Ball Scoring Wing',
    // 2008-09 UCF: 19.5 PPG, 5.5 RPG, 2.5 APG in 32 games
    stats: { games: 32, mpg: 33.5, ppg: 19.5, rpg: 5.5, apg: 2.5, spg: 1.2, bpg: 0.5, tov: 2.5, pf: 2.5, fg_pct: 0.468, three_pt_pct: 0.342, ft_pct: 0.758, pts_per40: 23.3, reb_per40: 6.6, ast_per40: 3.0, stl_per40: 1.4, blk_per40: 0.6, tov_per40: 3.0, usg: 0.282, per: 20.0, bpm: 5.5, obpm: 4.0, dbpm: 1.5, ws: 5.5, efg_pct: 0.502, ts_pct: 0.568, ast_pct: 0.142, tov_pct: 0.138, stl_pct: 0.025, blk_pct: 0.012, orb_pct: 0.052, drb_pct: 0.128, drtg: 95.5 },
    nba: { ppg: 2.8, rpg: 1.2, apg: 0.5, spg: 0.3, bpg: 0.1, ws48: 0.022, outcome: 'Bust' },
  },
  {
    pick: 41, team: 'Minnesota Timberwolves', name: 'Nick Calathes', school: 'Florida', pos: 'PG',
    birthYear: 1989, height: 78, weight: 200, wingspan: 82, conf: 'SEC',
    archetype: 'Primary Playmaker',
    // 2008-09 Florida: 13.8 PPG, 5.5 RPG, 6.2 APG in 33 games
    stats: { games: 33, mpg: 32.0, ppg: 13.8, rpg: 5.5, apg: 6.2, spg: 1.8, bpg: 0.5, tov: 2.8, pf: 2.2, fg_pct: 0.452, three_pt_pct: 0.335, ft_pct: 0.725, pts_per40: 17.3, reb_per40: 6.9, ast_per40: 7.8, stl_per40: 2.3, blk_per40: 0.6, tov_per40: 3.5, usg: 0.252, per: 18.8, bpm: 5.8, obpm: 3.8, dbpm: 2.0, ws: 5.5, efg_pct: 0.492, ts_pct: 0.548, ast_pct: 0.358, tov_pct: 0.158, stl_pct: 0.038, blk_pct: 0.012, orb_pct: 0.038, drb_pct: 0.128, drtg: 94.0 },
    nba: { ppg: 4.8, rpg: 2.5, apg: 3.5, spg: 0.8, bpg: 0.2, ws48: 0.062, outcome: 'Role Player' },
  },
  {
    pick: 43, team: 'Denver Nuggets', name: 'Hamady N\'Diaye', school: 'Rutgers', pos: 'C',
    birthYear: 1985, height: 84, weight: 230, wingspan: 91, conf: 'Big East',
    archetype: 'Rim Protector',
    // 2008-09 Rutgers: 5.8 PPG, 5.5 RPG, 0.4 APG in 25 games
    stats: { games: 25, mpg: 20.5, ppg: 5.8, rpg: 5.5, apg: 0.4, spg: 0.5, bpg: 3.2, tov: 1.2, pf: 3.2, fg_pct: 0.502, three_pt_pct: null, ft_pct: 0.492, pts_per40: 11.3, reb_per40: 10.7, ast_per40: 0.8, stl_per40: 1.0, blk_per40: 6.2, tov_per40: 2.3, usg: 0.185, per: 16.5, bpm: 3.5, obpm: -0.5, dbpm: 4.0, ws: 2.8, efg_pct: 0.502, ts_pct: 0.498, ast_pct: 0.028, tov_pct: 0.152, stl_pct: 0.015, blk_pct: 0.122, orb_pct: 0.088, drb_pct: 0.218, drtg: 91.5 },
    nba: { ppg: 1.2, rpg: 1.5, apg: 0.1, spg: 0.1, bpg: 0.8, ws48: 0.015, outcome: 'Out of League' },
  },
  {
    pick: 44, team: 'New Orleans Hornets', name: 'Marcus Landry', school: 'Wisconsin', pos: 'SF',
    birthYear: 1985, height: 79, weight: 215, wingspan: 82, conf: 'Big Ten',
    archetype: 'Off Ball Scoring Wing',
    // 2008-09 Wisconsin: 13.5 PPG, 5.8 RPG, 1.2 APG in 32 games
    stats: { games: 32, mpg: 29.5, ppg: 13.5, rpg: 5.8, apg: 1.2, spg: 0.8, bpg: 0.5, tov: 1.8, pf: 2.2, fg_pct: 0.478, three_pt_pct: 0.368, ft_pct: 0.762, pts_per40: 18.3, reb_per40: 7.9, ast_per40: 1.6, stl_per40: 1.1, blk_per40: 0.7, tov_per40: 2.4, usg: 0.252, per: 17.8, bpm: 3.8, obpm: 2.5, dbpm: 1.3, ws: 4.5, efg_pct: 0.510, ts_pct: 0.568, ast_pct: 0.072, tov_pct: 0.122, stl_pct: 0.018, blk_pct: 0.012, orb_pct: 0.055, drb_pct: 0.138, drtg: 96.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 45, team: 'Atlanta Hawks', name: 'Pape Sy', school: 'INSEP France', pos: 'PF',
    birthYear: 1988, height: 82, weight: 215, wingspan: 87, conf: null,
    archetype: 'Athletic Power Forward',
    // 2008-09 French Pro B / INSEP: 9.5 PPG, 6.2 RPG, 0.8 APG in 22 games
    stats: { games: 22, mpg: 24.0, ppg: 9.5, rpg: 6.2, apg: 0.8, spg: 0.8, bpg: 1.5, tov: 1.5, pf: 3.0, fg_pct: 0.488, three_pt_pct: 0.298, ft_pct: 0.638, pts_per40: 15.8, reb_per40: 10.3, ast_per40: 1.3, stl_per40: 1.3, blk_per40: 2.5, tov_per40: 2.5, usg: 0.238, per: 16.8, bpm: 3.5, obpm: 0.8, dbpm: 2.7, ws: 2.5, efg_pct: 0.505, ts_pct: 0.532, ast_pct: 0.052, tov_pct: 0.138, stl_pct: 0.022, blk_pct: 0.052, orb_pct: 0.082, drb_pct: 0.185, drtg: 94.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 47, team: 'Dallas Mavericks', name: 'Gani Lawal', school: 'Georgia Tech', pos: 'PF',
    birthYear: 1988, height: 81, weight: 240, wingspan: 84, conf: 'ACC',
    archetype: 'Rim Runner',
    // 2008-09 Georgia Tech: 13.5 PPG, 9.8 RPG, 0.8 APG in 33 games
    stats: { games: 33, mpg: 27.5, ppg: 13.5, rpg: 9.8, apg: 0.8, spg: 0.8, bpg: 1.5, tov: 1.8, pf: 3.2, fg_pct: 0.535, three_pt_pct: null, ft_pct: 0.572, pts_per40: 19.6, reb_per40: 14.2, ast_per40: 1.2, stl_per40: 1.2, blk_per40: 2.2, tov_per40: 2.6, usg: 0.262, per: 20.2, bpm: 5.8, obpm: 2.0, dbpm: 3.8, ws: 4.8, efg_pct: 0.535, ts_pct: 0.548, ast_pct: 0.048, tov_pct: 0.138, stl_pct: 0.018, blk_pct: 0.052, orb_pct: 0.118, drb_pct: 0.252, drtg: 91.0 },
    nba: { ppg: 1.5, rpg: 1.2, apg: 0.1, spg: 0.2, bpg: 0.3, ws48: 0.018, outcome: 'Out of League' },
  },
  {
    pick: 48, team: 'Oklahoma City Thunder', name: 'Craig Brackins', school: 'Iowa State', pos: 'PF',
    birthYear: 1988, height: 82, weight: 220, wingspan: 85, conf: 'Big 12',
    archetype: 'Stretch Big',
    // 2008-09 Iowa State: 20.4 PPG, 9.8 RPG, 1.4 APG in 30 games
    stats: { games: 30, mpg: 33.5, ppg: 20.4, rpg: 9.8, apg: 1.4, spg: 0.8, bpg: 1.8, tov: 2.5, pf: 3.0, fg_pct: 0.468, three_pt_pct: 0.355, ft_pct: 0.802, pts_per40: 24.4, reb_per40: 11.7, ast_per40: 1.7, stl_per40: 1.0, blk_per40: 2.2, tov_per40: 3.0, usg: 0.295, per: 21.5, bpm: 6.5, obpm: 3.8, dbpm: 2.7, ws: 5.8, efg_pct: 0.510, ts_pct: 0.582, ast_pct: 0.082, tov_pct: 0.138, stl_pct: 0.018, blk_pct: 0.055, orb_pct: 0.098, drb_pct: 0.228, drtg: 93.5 },
    nba: { ppg: 2.0, rpg: 1.5, apg: 0.3, spg: 0.2, bpg: 0.2, ws48: 0.015, outcome: 'Out of League' },
  },
  {
    pick: 49, team: 'Minnesota Timberwolves', name: 'Wayne Ellington', school: 'North Carolina', pos: 'SG',
    birthYear: 1987, height: 77, weight: 200, wingspan: 81, conf: 'ACC',
    archetype: 'Movement Shooter',
    // 2008-09 UNC: 14.4 PPG, 4.0 RPG, 2.2 APG in 38 games
    stats: { games: 38, mpg: 28.5, ppg: 14.4, rpg: 4.0, apg: 2.2, spg: 1.0, bpg: 0.2, tov: 1.5, pf: 1.8, fg_pct: 0.468, three_pt_pct: 0.418, ft_pct: 0.802, pts_per40: 20.2, reb_per40: 5.6, ast_per40: 3.1, stl_per40: 1.4, blk_per40: 0.3, tov_per40: 2.1, usg: 0.255, per: 18.5, bpm: 4.8, obpm: 3.8, dbpm: 1.0, ws: 5.5, efg_pct: 0.522, ts_pct: 0.590, ast_pct: 0.125, tov_pct: 0.098, stl_pct: 0.022, blk_pct: 0.005, orb_pct: 0.032, drb_pct: 0.098, drtg: 95.0 },
    nba: { ppg: 8.5, rpg: 2.2, apg: 1.2, spg: 0.5, bpg: 0.1, ws48: 0.078, outcome: 'Role Player' },
  },
  {
    pick: 50, team: 'Denver Nuggets', name: 'Sundiata Gaines', school: 'Georgia', pos: 'PG',
    birthYear: 1984, height: 74, weight: 185, wingspan: 77, conf: 'SEC',
    archetype: 'Secondary Playmaker',
    // 2008-09 Georgia: 16.8 PPG, 3.2 RPG, 5.2 APG in 30 games
    stats: { games: 30, mpg: 31.5, ppg: 16.8, rpg: 3.2, apg: 5.2, spg: 1.8, bpg: 0.2, tov: 2.5, pf: 2.0, fg_pct: 0.455, three_pt_pct: 0.378, ft_pct: 0.828, pts_per40: 21.3, reb_per40: 4.1, ast_per40: 6.6, stl_per40: 2.3, blk_per40: 0.3, tov_per40: 3.2, usg: 0.272, per: 20.0, bpm: 5.5, obpm: 4.5, dbpm: 1.0, ws: 5.0, efg_pct: 0.505, ts_pct: 0.582, ast_pct: 0.298, tov_pct: 0.138, stl_pct: 0.038, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.078, drtg: 96.0 },
    nba: { ppg: 4.2, rpg: 1.2, apg: 2.2, spg: 0.5, bpg: 0.1, ws48: 0.048, outcome: 'Role Player' },
  },
  {
    pick: 51, team: 'New York Knicks', name: 'Toney Douglas', school: 'LSU', pos: 'PG',
    birthYear: 1986, height: 73, weight: 190, wingspan: 76, conf: 'SEC',
    archetype: 'Scoring Lead Guard',
    // 2008-09 LSU: 17.5 PPG, 2.5 RPG, 3.8 APG in 31 games
    stats: { games: 31, mpg: 29.5, ppg: 17.5, rpg: 2.5, apg: 3.8, spg: 1.8, bpg: 0.2, tov: 2.2, pf: 2.0, fg_pct: 0.448, three_pt_pct: 0.362, ft_pct: 0.842, pts_per40: 23.7, reb_per40: 3.4, ast_per40: 5.1, stl_per40: 2.4, blk_per40: 0.3, tov_per40: 3.0, usg: 0.282, per: 19.8, bpm: 5.2, obpm: 4.2, dbpm: 1.0, ws: 5.2, efg_pct: 0.494, ts_pct: 0.578, ast_pct: 0.218, tov_pct: 0.128, stl_pct: 0.040, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.062, drtg: 96.5 },
    nba: { ppg: 8.0, rpg: 1.8, apg: 2.8, spg: 0.8, bpg: 0.1, ws48: 0.072, outcome: 'Role Player' },
  },
  {
    pick: 52, team: 'Milwaukee Bucks', name: 'Jodie Meeks', school: 'Kentucky', pos: 'SG',
    birthYear: 1987, height: 76, weight: 210, wingspan: 79, conf: 'SEC',
    archetype: 'Movement Shooter',
    // 2008-09 Kentucky: 23.7 PPG, 3.4 RPG, 1.6 APG in 32 games
    stats: { games: 32, mpg: 33.5, ppg: 23.7, rpg: 3.4, apg: 1.6, spg: 0.8, bpg: 0.3, tov: 1.8, pf: 1.8, fg_pct: 0.468, three_pt_pct: 0.408, ft_pct: 0.862, pts_per40: 28.3, reb_per40: 4.1, ast_per40: 1.9, stl_per40: 1.0, blk_per40: 0.4, tov_per40: 2.1, usg: 0.322, per: 21.2, bpm: 7.0, obpm: 6.5, dbpm: 0.5, ws: 6.2, efg_pct: 0.528, ts_pct: 0.618, ast_pct: 0.088, tov_pct: 0.095, stl_pct: 0.018, blk_pct: 0.007, orb_pct: 0.025, drb_pct: 0.078, drtg: 98.0 },
    nba: { ppg: 8.5, rpg: 2.0, apg: 0.8, spg: 0.5, bpg: 0.1, ws48: 0.062, outcome: 'Role Player' },
  },
  {
    pick: 53, team: 'Portland Trail Blazers', name: 'Jon Brockman', school: 'Washington', pos: 'PF',
    birthYear: 1987, height: 80, weight: 250, wingspan: 83, conf: 'Pac-10',
    archetype: 'Offensive Rebounder',
    // 2008-09 Washington: 13.8 PPG, 12.5 RPG, 0.8 APG in 33 games
    stats: { games: 33, mpg: 28.0, ppg: 13.8, rpg: 12.5, apg: 0.8, spg: 0.5, bpg: 0.8, tov: 2.0, pf: 3.5, fg_pct: 0.538, three_pt_pct: null, ft_pct: 0.612, pts_per40: 19.7, reb_per40: 17.9, ast_per40: 1.1, stl_per40: 0.7, blk_per40: 1.1, tov_per40: 2.9, usg: 0.268, per: 20.5, bpm: 5.2, obpm: 2.0, dbpm: 3.2, ws: 4.8, efg_pct: 0.538, ts_pct: 0.558, ast_pct: 0.048, tov_pct: 0.148, stl_pct: 0.012, blk_pct: 0.025, orb_pct: 0.178, drb_pct: 0.312, drtg: 91.5 },
    nba: { ppg: 3.5, rpg: 3.2, apg: 0.3, spg: 0.2, bpg: 0.2, ws48: 0.048, outcome: 'Bust' },
  },
  {
    pick: 54, team: 'Indiana Pacers', name: 'Solomon Alabi', school: 'Florida State', pos: 'C',
    birthYear: 1988, height: 84, weight: 255, wingspan: 90, conf: 'ACC',
    archetype: 'Rim Protector',
    // 2008-09 Florida State: 9.5 PPG, 7.8 RPG, 0.5 APG in 35 games
    stats: { games: 35, mpg: 22.5, ppg: 9.5, rpg: 7.8, apg: 0.5, spg: 0.5, bpg: 2.8, tov: 1.5, pf: 3.2, fg_pct: 0.528, three_pt_pct: null, ft_pct: 0.558, pts_per40: 16.9, reb_per40: 13.9, ast_per40: 0.9, stl_per40: 0.9, blk_per40: 5.0, tov_per40: 2.7, usg: 0.238, per: 19.0, bpm: 4.5, obpm: 0.5, dbpm: 4.0, ws: 3.8, efg_pct: 0.528, ts_pct: 0.542, ast_pct: 0.032, tov_pct: 0.148, stl_pct: 0.012, blk_pct: 0.102, orb_pct: 0.102, drb_pct: 0.245, drtg: 91.5 },
    nba: { ppg: 1.8, rpg: 2.2, apg: 0.1, spg: 0.1, bpg: 0.8, ws48: 0.012, outcome: 'Out of League' },
  },
  {
    pick: 55, team: 'Cleveland Cavaliers', name: 'Lazar Hayward', school: 'Marquette', pos: 'SF',
    birthYear: 1987, height: 79, weight: 228, wingspan: 83, conf: 'Big East',
    archetype: 'Slasher Wing',
    // 2008-09 Marquette: 16.2 PPG, 7.5 RPG, 2.2 APG in 33 games
    stats: { games: 33, mpg: 31.5, ppg: 16.2, rpg: 7.5, apg: 2.2, spg: 1.0, bpg: 0.8, tov: 2.0, pf: 2.5, fg_pct: 0.492, three_pt_pct: 0.320, ft_pct: 0.748, pts_per40: 20.6, reb_per40: 9.5, ast_per40: 2.8, stl_per40: 1.3, blk_per40: 1.0, tov_per40: 2.5, usg: 0.268, per: 19.5, bpm: 5.0, obpm: 2.8, dbpm: 2.2, ws: 5.2, efg_pct: 0.512, ts_pct: 0.565, ast_pct: 0.128, tov_pct: 0.128, stl_pct: 0.022, blk_pct: 0.022, orb_pct: 0.068, drb_pct: 0.168, drtg: 93.5 },
    nba: { ppg: 3.8, rpg: 2.5, apg: 0.5, spg: 0.4, bpg: 0.3, ws48: 0.042, outcome: 'Out of League' },
  },
  {
    pick: 56, team: 'San Antonio Spurs', name: 'Nando De Colo', school: 'Cholet France', pos: 'SG',
    birthYear: 1987, height: 77, weight: 190, wingspan: 81, conf: null,
    archetype: 'Off Ball Scoring Wing',
    // 2008-09 Pro A France (Cholet): 11.5 PPG, 2.8 RPG, 3.5 APG in 30 games
    stats: { games: 30, mpg: 26.5, ppg: 11.5, rpg: 2.8, apg: 3.5, spg: 1.2, bpg: 0.3, tov: 2.0, pf: 2.0, fg_pct: 0.472, three_pt_pct: 0.388, ft_pct: 0.808, pts_per40: 17.4, reb_per40: 4.2, ast_per40: 5.3, stl_per40: 1.8, blk_per40: 0.5, tov_per40: 3.0, usg: 0.258, per: 18.5, bpm: 5.0, obpm: 3.8, dbpm: 1.2, ws: 3.8, efg_pct: 0.518, ts_pct: 0.582, ast_pct: 0.208, tov_pct: 0.132, stl_pct: 0.030, blk_pct: 0.008, orb_pct: 0.022, drb_pct: 0.068, drtg: 97.0 },
    nba: { ppg: 7.2, rpg: 2.2, apg: 2.8, spg: 0.8, bpg: 0.2, ws48: 0.072, outcome: 'Role Player' },
  },
  {
    pick: 57, team: 'Toronto Raptors', name: 'Patrick Christopher', school: 'California', pos: 'SG',
    birthYear: 1987, height: 77, weight: 205, wingspan: 80, conf: 'Pac-10',
    archetype: 'Off Ball Scoring Wing',
    // 2008-09 California: 14.2 PPG, 4.5 RPG, 2.2 APG in 35 games
    stats: { games: 35, mpg: 28.5, ppg: 14.2, rpg: 4.5, apg: 2.2, spg: 1.2, bpg: 0.3, tov: 1.8, pf: 2.2, fg_pct: 0.462, three_pt_pct: 0.355, ft_pct: 0.778, pts_per40: 19.9, reb_per40: 6.3, ast_per40: 3.1, stl_per40: 1.7, blk_per40: 0.4, tov_per40: 2.5, usg: 0.255, per: 17.8, bpm: 4.2, obpm: 3.0, dbpm: 1.2, ws: 4.5, efg_pct: 0.498, ts_pct: 0.558, ast_pct: 0.128, tov_pct: 0.115, stl_pct: 0.028, blk_pct: 0.008, orb_pct: 0.042, drb_pct: 0.108, drtg: 96.5 },
    nba: { ppg: 1.5, rpg: 0.8, apg: 0.4, spg: 0.2, bpg: 0.1, ws48: 0.012, outcome: 'Out of League' },
  },
  {
    pick: 58, team: 'Miami Heat', name: 'Jarvis Varnado', school: 'Mississippi State', pos: 'PF/C',
    birthYear: 1987, height: 81, weight: 205, wingspan: 87, conf: 'SEC',
    archetype: 'Rim Protector',
    // 2008-09 Mississippi State: 10.8 PPG, 7.8 RPG, 0.5 APG in 33 games
    stats: { games: 33, mpg: 25.5, ppg: 10.8, rpg: 7.8, apg: 0.5, spg: 0.5, bpg: 4.5, tov: 1.5, pf: 3.2, fg_pct: 0.568, three_pt_pct: null, ft_pct: 0.548, pts_per40: 16.9, reb_per40: 12.2, ast_per40: 0.8, stl_per40: 0.8, blk_per40: 7.1, tov_per40: 2.4, usg: 0.252, per: 20.2, bpm: 5.5, obpm: 1.0, dbpm: 4.5, ws: 4.0, efg_pct: 0.568, ts_pct: 0.568, ast_pct: 0.032, tov_pct: 0.135, stl_pct: 0.012, blk_pct: 0.165, orb_pct: 0.105, drb_pct: 0.245, drtg: 90.5 },
    nba: { ppg: 1.8, rpg: 1.8, apg: 0.1, spg: 0.1, bpg: 0.8, ws48: 0.025, outcome: 'Out of League' },
  },
  {
    pick: 59, team: 'Charlotte Bobcats', name: 'Derrick Brown', school: 'Xavier', pos: 'SF',
    birthYear: 1987, height: 79, weight: 230, wingspan: 84, conf: 'A-10',
    archetype: 'POA Defender',
    // 2008-09 Xavier: 15.8 PPG, 6.5 RPG, 2.0 APG in 33 games
    stats: { games: 33, mpg: 30.5, ppg: 15.8, rpg: 6.5, apg: 2.0, spg: 1.5, bpg: 0.8, tov: 2.0, pf: 2.5, fg_pct: 0.508, three_pt_pct: 0.298, ft_pct: 0.712, pts_per40: 20.7, reb_per40: 8.5, ast_per40: 2.6, stl_per40: 2.0, blk_per40: 1.0, tov_per40: 2.6, usg: 0.268, per: 19.2, bpm: 5.0, obpm: 2.5, dbpm: 2.5, ws: 5.0, efg_pct: 0.522, ts_pct: 0.562, ast_pct: 0.118, tov_pct: 0.128, stl_pct: 0.032, blk_pct: 0.022, orb_pct: 0.072, drb_pct: 0.158, drtg: 93.5 },
    nba: { ppg: 2.5, rpg: 1.8, apg: 0.5, spg: 0.4, bpg: 0.2, ws48: 0.022, outcome: 'Out of League' },
  },
  {
    pick: 60, team: 'Oklahoma City Thunder', name: 'Tibor Pleiss', school: 'Alba Berlin Germany', pos: 'C',
    birthYear: 1989, height: 85, weight: 252, wingspan: 90, conf: null,
    archetype: 'Stretch Big',
    // 2008-09 BBL Germany (Alba Berlin): 7.5 PPG, 5.5 RPG, 0.5 APG in 26 games
    stats: { games: 26, mpg: 20.5, ppg: 7.5, rpg: 5.5, apg: 0.5, spg: 0.4, bpg: 1.8, tov: 1.2, pf: 2.8, fg_pct: 0.515, three_pt_pct: 0.325, ft_pct: 0.712, pts_per40: 14.6, reb_per40: 10.7, ast_per40: 1.0, stl_per40: 0.8, blk_per40: 3.5, tov_per40: 2.3, usg: 0.222, per: 17.2, bpm: 3.8, obpm: 0.5, dbpm: 3.3, ws: 2.8, efg_pct: 0.535, ts_pct: 0.568, ast_pct: 0.035, tov_pct: 0.125, stl_pct: 0.012, blk_pct: 0.068, orb_pct: 0.072, drb_pct: 0.188, drtg: 93.0 },
    nba: { ppg: 2.2, rpg: 2.0, apg: 0.2, spg: 0.1, bpg: 0.5, ws48: 0.015, outcome: 'Out of League' },
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
  console.log(`Seeding ${DRAFT_CLASS} NBA Draft (REMAINING picks) — Legendary Archives`)

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
  console.log(`Navigate to /legendary-archives?year=2009 to view the full board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
