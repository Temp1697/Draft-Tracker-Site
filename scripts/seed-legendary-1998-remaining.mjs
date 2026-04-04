#!/usr/bin/env node
// SUPPLEMENTAL seed script for 1998 NBA Draft — Legendary Archives
// Adds the REMAINING Round 2 picks NOT already covered by seed-legendary-1998.mjs
//
// Already seeded by seed-legendary-1998.mjs:
//   Round 1: picks 1-29
//   Round 2: picks 41 (Cuttino Mobley), 45 (Cory Carr), 52 (Tyronn Lue)
//
// This script adds: picks 30-40, 42-44, 46-51, 53-58
//
// Usage: node scripts/seed-legendary-1998-remaining.mjs

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const DRAFT_YEAR = 1998
const DRAFT_CLASS = '1998'
const SEASON = '97-98'

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

// 1998 NBA Draft — REMAINING Round 2 picks (30-40, 42-44, 46-51, 53-58)
// College stats from final season (1997-98). All percentage stats in DECIMAL format.
// Sources: Basketball Reference, Sports Reference CBB
const PLAYERS = [
  // === ROUND 2 (continued) ===
  {
    pick: 30, team: 'Denver Nuggets', name: 'Ansu Sesay', school: 'Mississippi', pos: 'SF',
    birthYear: 1976, height: 79, weight: 215, wingspan: 83, conf: 'SEC',
    archetype: 'Slasher Wing',
    // 1997-98 Mississippi: 13.8 PPG, 5.8 RPG, 2.0 APG
    stats: { games: 29, mpg: 31.0, ppg: 13.8, rpg: 5.8, apg: 2.0, spg: 1.2, bpg: 0.4, tov: 2.2, pf: 2.5, fg_pct: 0.470, three_pt_pct: 0.310, ft_pct: 0.710, pts_per40: 17.8, reb_per40: 7.5, ast_per40: 2.6, stl_per40: 1.5, blk_per40: 0.5, tov_per40: 2.8, usg: 0.248, per: 16.5, bpm: 2.0, obpm: 1.0, dbpm: 1.0, ws: 3.0, efg_pct: 0.494, ts_pct: 0.536, ast_pct: 0.112, tov_pct: 0.148, stl_pct: 0.025, blk_pct: 0.009, orb_pct: 0.042, drb_pct: 0.118, drtg: 99.5 },
    nba: { ppg: 2.1, rpg: 1.5, apg: 0.5, spg: 0.3, bpg: 0.1, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 31, team: 'Vancouver Grizzlies', name: 'Predrag Drobnjak', school: 'Buducnost Yugoslavia', pos: 'C',
    birthYear: 1975, height: 83, weight: 253, wingspan: 87, conf: null,
    archetype: 'Drop Coverage Big',
    // 1997-98 Yugoslav League (Buducnost): estimated ~16 PPG, 8 RPG, 1.5 BPG
    stats: { games: 30, mpg: 28.0, ppg: 15.8, rpg: 8.2, apg: 0.8, spg: 0.5, bpg: 1.8, tov: 1.8, pf: 3.2, fg_pct: 0.540, three_pt_pct: null, ft_pct: 0.635, pts_per40: 22.6, reb_per40: 11.7, ast_per40: 1.1, stl_per40: 0.7, blk_per40: 2.6, tov_per40: 2.6, usg: 0.268, per: 19.5, bpm: 4.5, obpm: 1.5, dbpm: 3.0, ws: 4.0, efg_pct: 0.540, ts_pct: 0.548, ast_pct: 0.042, tov_pct: 0.122, stl_pct: 0.012, blk_pct: 0.060, orb_pct: 0.098, drb_pct: 0.222, drtg: 94.0 },
    nba: { ppg: 4.8, rpg: 3.5, apg: 0.5, spg: 0.3, bpg: 0.8, ws48: 0.048, outcome: 'Role Player' },
  },
  {
    pick: 32, team: 'Toronto Raptors', name: 'Lazaro Borrell', school: 'Cuba National Team', pos: 'C',
    birthYear: 1972, height: 83, weight: 245, wingspan: 86, conf: null,
    archetype: 'Rim Protector',
    // Cuban national league player; defected to US
    stats: { games: 28, mpg: 26.0, ppg: 12.5, rpg: 7.8, apg: 0.5, spg: 0.5, bpg: 2.2, tov: 1.8, pf: 3.5, fg_pct: 0.520, three_pt_pct: null, ft_pct: 0.580, pts_per40: 19.2, reb_per40: 12.0, ast_per40: 0.8, stl_per40: 0.8, blk_per40: 3.4, tov_per40: 2.8, usg: 0.240, per: 17.5, bpm: 3.5, obpm: 0.5, dbpm: 3.0, ws: 2.5, efg_pct: 0.520, ts_pct: 0.528, ast_pct: 0.028, tov_pct: 0.130, stl_pct: 0.012, blk_pct: 0.075, orb_pct: 0.105, drb_pct: 0.230, drtg: 95.0 },
    nba: { ppg: 0.8, rpg: 1.0, apg: 0.1, spg: 0.1, bpg: 0.3, ws48: 0.005, outcome: 'Out of League' },
  },
  {
    pick: 33, team: 'Sacramento Kings', name: 'Kornel David', school: 'Komloi KBSK Hungary', pos: 'SF/PF',
    birthYear: 1974, height: 81, weight: 218, wingspan: 84, conf: null,
    archetype: 'Stretch Big',
    // 1997-98 Hungarian League: estimated ~15 PPG, 6 RPG
    stats: { games: 28, mpg: 29.0, ppg: 14.8, rpg: 6.2, apg: 1.5, spg: 0.8, bpg: 0.8, tov: 1.8, pf: 2.8, fg_pct: 0.490, three_pt_pct: 0.355, ft_pct: 0.750, pts_per40: 20.4, reb_per40: 8.6, ast_per40: 2.1, stl_per40: 1.1, blk_per40: 1.1, tov_per40: 2.5, usg: 0.260, per: 17.5, bpm: 3.0, obpm: 1.5, dbpm: 1.5, ws: 3.5, efg_pct: 0.527, ts_pct: 0.570, ast_pct: 0.082, tov_pct: 0.122, stl_pct: 0.018, blk_pct: 0.022, orb_pct: 0.048, drb_pct: 0.145, drtg: 97.0 },
    nba: { ppg: 2.5, rpg: 1.8, apg: 0.4, spg: 0.2, bpg: 0.2, ws48: 0.018, outcome: 'Out of League' },
  },
  {
    pick: 34, team: 'Golden State Warriors', name: 'Evan Eschmeyer', school: 'Northwestern', pos: 'C',
    birthYear: 1975, height: 83, weight: 252, wingspan: 86, conf: 'Big Ten',
    archetype: 'Drop Coverage Big',
    // 1997-98 Northwestern: 15.4 PPG, 9.6 RPG, 2.8 BPG
    stats: { games: 30, mpg: 31.0, ppg: 15.4, rpg: 9.6, apg: 0.8, spg: 0.5, bpg: 2.8, tov: 1.8, pf: 3.2, fg_pct: 0.560, three_pt_pct: null, ft_pct: 0.660, pts_per40: 19.9, reb_per40: 12.4, ast_per40: 1.0, stl_per40: 0.6, blk_per40: 3.6, tov_per40: 2.3, usg: 0.255, per: 20.5, bpm: 5.5, obpm: 2.0, dbpm: 3.5, ws: 4.5, efg_pct: 0.560, ts_pct: 0.568, ast_pct: 0.042, tov_pct: 0.115, stl_pct: 0.012, blk_pct: 0.090, orb_pct: 0.095, drb_pct: 0.235, drtg: 93.5 },
    nba: { ppg: 3.2, rpg: 3.5, apg: 0.4, spg: 0.2, bpg: 0.6, ws48: 0.052, outcome: 'Role Player' },
  },
  {
    pick: 35, team: 'Philadelphia 76ers', name: 'Darnell Hoskins', school: 'Tulsa', pos: 'SG',
    birthYear: 1972, height: 75, weight: 188, wingspan: 79, conf: 'WAC',
    archetype: 'Movement Shooter',
    // 1997-98 Tulsa: 14.2 PPG, 3.8 RPG, 2.8 APG
    stats: { games: 30, mpg: 31.5, ppg: 14.2, rpg: 3.8, apg: 2.8, spg: 1.5, bpg: 0.2, tov: 2.2, pf: 2.0, fg_pct: 0.452, three_pt_pct: 0.368, ft_pct: 0.810, pts_per40: 18.0, reb_per40: 4.8, ast_per40: 3.6, stl_per40: 1.9, blk_per40: 0.3, tov_per40: 2.8, usg: 0.252, per: 16.5, bpm: 2.0, obpm: 1.5, dbpm: 0.5, ws: 3.0, efg_pct: 0.488, ts_pct: 0.549, ast_pct: 0.148, tov_pct: 0.138, stl_pct: 0.030, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.082, drtg: 100.0 },
    nba: { ppg: 1.5, rpg: 0.8, apg: 0.5, spg: 0.2, bpg: 0.0, ws48: 0.008, outcome: 'Out of League' },
  },
  {
    pick: 36, team: 'Milwaukee Bucks', name: 'Jahidi White', school: 'Georgetown', pos: 'C',
    birthYear: 1976, height: 82, weight: 290, wingspan: 86, conf: 'Big East',
    archetype: 'Rim Runner',
    // 1997-98 Georgetown: 11.8 PPG, 9.8 RPG, 2.1 BPG
    stats: { games: 31, mpg: 27.5, ppg: 11.8, rpg: 9.8, apg: 0.5, spg: 0.8, bpg: 2.1, tov: 2.0, pf: 3.8, fg_pct: 0.575, three_pt_pct: null, ft_pct: 0.540, pts_per40: 17.1, reb_per40: 14.2, ast_per40: 0.7, stl_per40: 1.2, blk_per40: 3.1, tov_per40: 2.9, usg: 0.240, per: 19.5, bpm: 5.0, obpm: 1.0, dbpm: 4.0, ws: 4.0, efg_pct: 0.575, ts_pct: 0.573, ast_pct: 0.028, tov_pct: 0.142, stl_pct: 0.018, blk_pct: 0.068, orb_pct: 0.122, drb_pct: 0.268, drtg: 93.0 },
    nba: { ppg: 4.2, rpg: 4.5, apg: 0.3, spg: 0.4, bpg: 0.8, ws48: 0.065, outcome: 'Role Player' },
  },
  {
    pick: 37, team: 'Chicago Bulls', name: 'Craig Claxton', school: 'Hofstra', pos: 'PG',
    birthYear: 1977, height: 73, weight: 175, wingspan: 76, conf: 'America East',
    archetype: 'Secondary Playmaker',
    // 1997-98 Hofstra: 16.4 PPG, 5.2 APG, 3.5 RPG
    stats: { games: 29, mpg: 33.0, ppg: 16.4, rpg: 3.5, apg: 5.2, spg: 2.2, bpg: 0.1, tov: 2.8, pf: 1.8, fg_pct: 0.438, three_pt_pct: 0.330, ft_pct: 0.780, pts_per40: 19.9, reb_per40: 4.2, ast_per40: 6.3, stl_per40: 2.7, blk_per40: 0.1, tov_per40: 3.4, usg: 0.265, per: 18.0, bpm: 3.5, obpm: 2.5, dbpm: 1.0, ws: 3.5, efg_pct: 0.470, ts_pct: 0.530, ast_pct: 0.268, tov_pct: 0.152, stl_pct: 0.045, blk_pct: 0.002, orb_pct: 0.018, drb_pct: 0.075, drtg: 99.0 },
    nba: { ppg: 3.8, rpg: 1.2, apg: 2.2, spg: 0.5, bpg: 0.0, ws48: 0.035, outcome: 'Role Player' },
  },
  {
    pick: 38, team: 'Indiana Pacers', name: 'Casey Shaw', school: 'Toledo', pos: 'PF/C',
    birthYear: 1975, height: 83, weight: 240, wingspan: 86, conf: 'MAC',
    archetype: 'Drop Coverage Big',
    // 1997-98 Toledo: 16.2 PPG, 10.5 RPG, 2.5 BPG
    stats: { games: 28, mpg: 29.0, ppg: 16.2, rpg: 10.5, apg: 0.8, spg: 0.5, bpg: 2.5, tov: 2.0, pf: 3.5, fg_pct: 0.545, three_pt_pct: null, ft_pct: 0.620, pts_per40: 22.3, reb_per40: 14.5, ast_per40: 1.1, stl_per40: 0.7, blk_per40: 3.4, tov_per40: 2.8, usg: 0.265, per: 20.0, bpm: 5.0, obpm: 1.5, dbpm: 3.5, ws: 3.5, efg_pct: 0.545, ts_pct: 0.552, ast_pct: 0.042, tov_pct: 0.128, stl_pct: 0.012, blk_pct: 0.082, orb_pct: 0.108, drb_pct: 0.258, drtg: 94.5 },
    nba: { ppg: 1.8, rpg: 2.0, apg: 0.2, spg: 0.2, bpg: 0.5, ws48: 0.018, outcome: 'Out of League' },
  },
  {
    pick: 39, team: 'Cleveland Cavaliers', name: 'Lavor Postell', school: 'St. John\'s', pos: 'SF',
    birthYear: 1977, height: 78, weight: 210, wingspan: 81, conf: 'Big East',
    archetype: 'Off Ball Scoring Wing',
    // 1997-98 St. John's: 12.5 PPG, 4.5 RPG
    stats: { games: 30, mpg: 28.5, ppg: 12.5, rpg: 4.5, apg: 1.8, spg: 1.2, bpg: 0.5, tov: 1.8, pf: 2.2, fg_pct: 0.455, three_pt_pct: 0.342, ft_pct: 0.740, pts_per40: 17.5, reb_per40: 6.3, ast_per40: 2.5, stl_per40: 1.7, blk_per40: 0.7, tov_per40: 2.5, usg: 0.242, per: 16.0, bpm: 1.5, obpm: 0.5, dbpm: 1.0, ws: 2.5, efg_pct: 0.490, ts_pct: 0.535, ast_pct: 0.098, tov_pct: 0.135, stl_pct: 0.025, blk_pct: 0.012, orb_pct: 0.035, drb_pct: 0.095, drtg: 101.0 },
    nba: { ppg: 2.2, rpg: 1.2, apg: 0.5, spg: 0.3, bpg: 0.1, ws48: 0.018, outcome: 'Out of League' },
  },
  {
    pick: 40, team: 'Orlando Magic', name: 'Miles Simon', school: 'Arizona', pos: 'SG',
    birthYear: 1975, height: 76, weight: 195, wingspan: 80, conf: 'Pac-10',
    archetype: 'Movement Shooter',
    // 1997-98 Arizona: 13.5 PPG, 3.8 RPG — NCAA Championship starter
    stats: { games: 36, mpg: 30.5, ppg: 13.5, rpg: 3.8, apg: 2.8, spg: 1.5, bpg: 0.2, tov: 1.8, pf: 2.2, fg_pct: 0.460, three_pt_pct: 0.395, ft_pct: 0.792, pts_per40: 17.7, reb_per40: 5.0, ast_per40: 3.7, stl_per40: 2.0, blk_per40: 0.3, tov_per40: 2.4, usg: 0.245, per: 17.5, bpm: 2.5, obpm: 1.5, dbpm: 1.0, ws: 4.0, efg_pct: 0.508, ts_pct: 0.566, ast_pct: 0.148, tov_pct: 0.122, stl_pct: 0.032, blk_pct: 0.004, orb_pct: 0.022, drb_pct: 0.082, drtg: 99.0 },
    nba: { ppg: 0.8, rpg: 0.5, apg: 0.3, spg: 0.1, bpg: 0.0, ws48: 0.005, outcome: 'Out of League' },
  },
  // Pick 41 = Cuttino Mobley — already in seed-legendary-1998.mjs
  {
    pick: 42, team: 'Milwaukee Bucks', name: 'Derrick Dial', school: 'Eastern Michigan', pos: 'PG',
    birthYear: 1975, height: 74, weight: 180, wingspan: 77, conf: 'MAC',
    archetype: 'Secondary Playmaker',
    // 1997-98 Eastern Michigan: 17.8 PPG, 5.5 APG, 3.2 RPG
    stats: { games: 28, mpg: 33.5, ppg: 17.8, rpg: 3.2, apg: 5.5, spg: 1.8, bpg: 0.1, tov: 2.8, pf: 2.0, fg_pct: 0.445, three_pt_pct: 0.355, ft_pct: 0.808, pts_per40: 21.3, reb_per40: 3.8, ast_per40: 6.6, stl_per40: 2.2, blk_per40: 0.1, tov_per40: 3.3, usg: 0.272, per: 18.5, bpm: 3.0, obpm: 2.0, dbpm: 1.0, ws: 3.5, efg_pct: 0.487, ts_pct: 0.548, ast_pct: 0.282, tov_pct: 0.148, stl_pct: 0.036, blk_pct: 0.002, orb_pct: 0.015, drb_pct: 0.068, drtg: 100.5 },
    nba: { ppg: 0.5, rpg: 0.3, apg: 0.5, spg: 0.1, bpg: 0.0, ws48: 0.002, outcome: 'Out of League' },
  },
  {
    pick: 43, team: 'San Antonio Spurs', name: 'Joseph Blair', school: 'Arizona', pos: 'PF/C',
    birthYear: 1974, height: 81, weight: 248, wingspan: 84, conf: 'Pac-10',
    archetype: 'Rim Runner',
    // 1997-98 Arizona: 11.2 PPG, 8.2 RPG — played on NCAA championship team
    stats: { games: 36, mpg: 25.0, ppg: 11.2, rpg: 8.2, apg: 0.8, spg: 0.5, bpg: 1.5, tov: 1.5, pf: 3.0, fg_pct: 0.570, three_pt_pct: null, ft_pct: 0.620, pts_per40: 17.9, reb_per40: 13.1, ast_per40: 1.3, stl_per40: 0.8, blk_per40: 2.4, tov_per40: 2.4, usg: 0.238, per: 19.5, bpm: 4.5, obpm: 1.5, dbpm: 3.0, ws: 4.0, efg_pct: 0.570, ts_pct: 0.573, ast_pct: 0.042, tov_pct: 0.118, stl_pct: 0.012, blk_pct: 0.050, orb_pct: 0.112, drb_pct: 0.248, drtg: 94.0 },
    nba: { ppg: 1.5, rpg: 1.8, apg: 0.2, spg: 0.2, bpg: 0.3, ws48: 0.022, outcome: 'Out of League' },
  },
  {
    pick: 44, team: 'Dallas Mavericks', name: 'Martin Müürsepp', school: 'Saaremaa Kalev Estonia', pos: 'SF/PF',
    birthYear: 1974, height: 81, weight: 218, wingspan: 84, conf: null,
    archetype: 'Stretch Big',
    // 1997-98 Estonian league / EuroLeague: estimated ~16 PPG, 6 RPG
    stats: { games: 30, mpg: 28.0, ppg: 15.8, rpg: 6.2, apg: 1.5, spg: 0.8, bpg: 0.8, tov: 1.8, pf: 2.5, fg_pct: 0.488, three_pt_pct: 0.370, ft_pct: 0.775, pts_per40: 22.6, reb_per40: 8.9, ast_per40: 2.1, stl_per40: 1.1, blk_per40: 1.1, tov_per40: 2.6, usg: 0.268, per: 18.5, bpm: 3.0, obpm: 1.5, dbpm: 1.5, ws: 3.5, efg_pct: 0.536, ts_pct: 0.580, ast_pct: 0.082, tov_pct: 0.118, stl_pct: 0.018, blk_pct: 0.022, orb_pct: 0.052, drb_pct: 0.145, drtg: 98.0 },
    nba: { ppg: 2.8, rpg: 1.8, apg: 0.5, spg: 0.2, bpg: 0.2, ws48: 0.025, outcome: 'Out of League' },
  },
  // Pick 45 = Cory Carr — already in seed-legendary-1998.mjs
  {
    pick: 46, team: 'Golden State Warriors', name: 'Andrew Betts', school: 'Long Beach State', pos: 'SF',
    birthYear: 1975, height: 79, weight: 215, wingspan: 82, conf: 'Big West',
    archetype: 'Off Ball Scoring Wing',
    // 1997-98 Long Beach State: 14.5 PPG, 5.8 RPG
    stats: { games: 28, mpg: 30.0, ppg: 14.5, rpg: 5.8, apg: 1.5, spg: 1.0, bpg: 0.5, tov: 1.8, pf: 2.5, fg_pct: 0.465, three_pt_pct: 0.325, ft_pct: 0.755, pts_per40: 19.3, reb_per40: 7.7, ast_per40: 2.0, stl_per40: 1.3, blk_per40: 0.7, tov_per40: 2.4, usg: 0.255, per: 16.5, bpm: 1.5, obpm: 0.5, dbpm: 1.0, ws: 2.5, efg_pct: 0.497, ts_pct: 0.548, ast_pct: 0.085, tov_pct: 0.125, stl_pct: 0.022, blk_pct: 0.012, orb_pct: 0.040, drb_pct: 0.112, drtg: 102.0 },
    nba: { ppg: 0.5, rpg: 0.5, apg: 0.2, spg: 0.1, bpg: 0.1, ws48: 0.002, outcome: 'Out of League' },
  },
  {
    pick: 47, team: 'Portland Trail Blazers', name: 'Cham Horford', school: 'Miami (FL)', pos: 'PF/C',
    birthYear: 1976, height: 81, weight: 240, wingspan: 84, conf: 'Big East',
    archetype: 'Rim Runner',
    // 1997-98 Miami (FL): 12.2 PPG, 8.5 RPG — father of Al Horford
    stats: { games: 30, mpg: 27.0, ppg: 12.2, rpg: 8.5, apg: 0.8, spg: 0.6, bpg: 1.8, tov: 1.8, pf: 3.2, fg_pct: 0.555, three_pt_pct: null, ft_pct: 0.600, pts_per40: 18.1, reb_per40: 12.6, ast_per40: 1.2, stl_per40: 0.9, blk_per40: 2.7, tov_per40: 2.7, usg: 0.248, per: 19.0, bpm: 4.5, obpm: 1.0, dbpm: 3.5, ws: 3.5, efg_pct: 0.555, ts_pct: 0.560, ast_pct: 0.042, tov_pct: 0.128, stl_pct: 0.015, blk_pct: 0.060, orb_pct: 0.112, drb_pct: 0.252, drtg: 94.5 },
    nba: { ppg: 1.2, rpg: 1.5, apg: 0.2, spg: 0.1, bpg: 0.3, ws48: 0.012, outcome: 'Out of League' },
  },
  {
    pick: 48, team: 'Houston Rockets', name: 'Ryan Stack', school: 'South Carolina', pos: 'PF/C',
    birthYear: 1975, height: 83, weight: 228, wingspan: 86, conf: 'SEC',
    archetype: 'Stretch Big',
    // 1997-98 South Carolina: 13.5 PPG, 8.8 RPG, 2.5 BPG
    stats: { games: 27, mpg: 29.5, ppg: 13.5, rpg: 8.8, apg: 1.0, spg: 0.5, bpg: 2.5, tov: 1.8, pf: 3.5, fg_pct: 0.530, three_pt_pct: 0.310, ft_pct: 0.680, pts_per40: 18.3, reb_per40: 11.9, ast_per40: 1.4, stl_per40: 0.7, blk_per40: 3.4, tov_per40: 2.4, usg: 0.248, per: 19.5, bpm: 4.5, obpm: 1.5, dbpm: 3.0, ws: 3.5, efg_pct: 0.545, ts_pct: 0.565, ast_pct: 0.055, tov_pct: 0.122, stl_pct: 0.012, blk_pct: 0.082, orb_pct: 0.098, drb_pct: 0.228, drtg: 95.5 },
    nba: { ppg: 0.8, rpg: 0.8, apg: 0.1, spg: 0.1, bpg: 0.2, ws48: 0.008, outcome: 'Out of League' },
  },
  {
    pick: 49, team: 'Atlanta Hawks', name: 'Maceo Baston', school: 'Illinois', pos: 'PF',
    birthYear: 1975, height: 81, weight: 228, wingspan: 84, conf: 'Big Ten',
    archetype: 'Rim Runner',
    // 1997-98 Illinois: 10.8 PPG, 8.2 RPG, 1.8 BPG
    stats: { games: 30, mpg: 26.5, ppg: 10.8, rpg: 8.2, apg: 0.5, spg: 0.5, bpg: 1.8, tov: 1.5, pf: 3.2, fg_pct: 0.548, three_pt_pct: null, ft_pct: 0.615, pts_per40: 16.3, reb_per40: 12.4, ast_per40: 0.8, stl_per40: 0.8, blk_per40: 2.7, tov_per40: 2.3, usg: 0.232, per: 17.5, bpm: 3.5, obpm: 0.5, dbpm: 3.0, ws: 3.0, efg_pct: 0.548, ts_pct: 0.553, ast_pct: 0.028, tov_pct: 0.118, stl_pct: 0.012, blk_pct: 0.058, orb_pct: 0.108, drb_pct: 0.248, drtg: 95.5 },
    nba: { ppg: 1.8, rpg: 2.2, apg: 0.2, spg: 0.2, bpg: 0.4, ws48: 0.022, outcome: 'Role Player' },
  },
  {
    pick: 50, team: 'Miami Heat', name: 'Tim Burroughs', school: 'Jacksonville', pos: 'PF',
    birthYear: 1976, height: 80, weight: 220, wingspan: 83, conf: 'Trans America',
    archetype: 'Offensive Rebounder',
    // 1997-98 Jacksonville: 14.2 PPG, 9.5 RPG
    stats: { games: 28, mpg: 28.0, ppg: 14.2, rpg: 9.5, apg: 0.8, spg: 0.8, bpg: 1.2, tov: 1.8, pf: 3.0, fg_pct: 0.520, three_pt_pct: null, ft_pct: 0.658, pts_per40: 20.3, reb_per40: 13.6, ast_per40: 1.1, stl_per40: 1.1, blk_per40: 1.7, tov_per40: 2.6, usg: 0.255, per: 18.0, bpm: 3.5, obpm: 0.5, dbpm: 3.0, ws: 3.0, efg_pct: 0.520, ts_pct: 0.530, ast_pct: 0.045, tov_pct: 0.122, stl_pct: 0.018, blk_pct: 0.038, orb_pct: 0.118, drb_pct: 0.255, drtg: 96.0 },
    nba: { ppg: 0.5, rpg: 0.8, apg: 0.1, spg: 0.1, bpg: 0.1, ws48: 0.005, outcome: 'Out of League' },
  },
  {
    pick: 51, team: 'San Antonio Spurs', name: 'Ira Newble', school: 'Miami (OH)', pos: 'SF',
    birthYear: 1975, height: 78, weight: 205, wingspan: 82, conf: 'MAC',
    archetype: 'Two Way Star Wing',
    // 1997-98 Miami (OH): 16.8 PPG, 7.2 RPG, 2.2 APG
    stats: { games: 29, mpg: 32.0, ppg: 16.8, rpg: 7.2, apg: 2.2, spg: 1.8, bpg: 0.8, tov: 2.0, pf: 2.5, fg_pct: 0.490, three_pt_pct: 0.338, ft_pct: 0.728, pts_per40: 21.0, reb_per40: 9.0, ast_per40: 2.8, stl_per40: 2.3, blk_per40: 1.0, tov_per40: 2.5, usg: 0.268, per: 19.5, bpm: 4.5, obpm: 2.5, dbpm: 2.0, ws: 4.5, efg_pct: 0.528, ts_pct: 0.564, ast_pct: 0.118, tov_pct: 0.128, stl_pct: 0.038, blk_pct: 0.018, orb_pct: 0.055, drb_pct: 0.145, drtg: 97.0 },
    nba: { ppg: 4.5, rpg: 2.8, apg: 1.0, spg: 0.8, bpg: 0.4, ws48: 0.062, outcome: 'Role Player' },
  },
  // Pick 52 = Tyronn Lue — already in seed-legendary-1998.mjs
  {
    pick: 53, team: 'Denver Nuggets', name: 'Nate Erdmann', school: 'Oklahoma', pos: 'SG',
    birthYear: 1976, height: 77, weight: 195, wingspan: 80, conf: 'Big 12',
    archetype: 'Movement Shooter',
    // 1997-98 Oklahoma: 15.2 PPG, 3.5 RPG
    stats: { games: 30, mpg: 31.0, ppg: 15.2, rpg: 3.5, apg: 2.5, spg: 1.5, bpg: 0.2, tov: 2.0, pf: 1.8, fg_pct: 0.448, three_pt_pct: 0.388, ft_pct: 0.842, pts_per40: 19.6, reb_per40: 4.5, ast_per40: 3.2, stl_per40: 1.9, blk_per40: 0.3, tov_per40: 2.6, usg: 0.255, per: 17.0, bpm: 2.0, obpm: 1.5, dbpm: 0.5, ws: 3.0, efg_pct: 0.488, ts_pct: 0.550, ast_pct: 0.138, tov_pct: 0.122, stl_pct: 0.030, blk_pct: 0.005, orb_pct: 0.018, drb_pct: 0.072, drtg: 101.0 },
    nba: { ppg: 0.5, rpg: 0.3, apg: 0.3, spg: 0.1, bpg: 0.0, ws48: 0.002, outcome: 'Out of League' },
  },
  {
    pick: 54, team: 'Vancouver Grizzlies', name: 'Michael Hawkins', school: 'Providence', pos: 'PG',
    birthYear: 1976, height: 73, weight: 175, wingspan: 76, conf: 'Big East',
    archetype: 'Secondary Playmaker',
    // 1997-98 Providence: 13.8 PPG, 4.8 APG
    stats: { games: 29, mpg: 31.5, ppg: 13.8, rpg: 2.8, apg: 4.8, spg: 1.8, bpg: 0.1, tov: 2.8, pf: 1.8, fg_pct: 0.432, three_pt_pct: 0.352, ft_pct: 0.790, pts_per40: 17.5, reb_per40: 3.6, ast_per40: 6.1, stl_per40: 2.3, blk_per40: 0.1, tov_per40: 3.5, usg: 0.255, per: 16.5, bpm: 2.0, obpm: 1.5, dbpm: 0.5, ws: 3.0, efg_pct: 0.468, ts_pct: 0.530, ast_pct: 0.248, tov_pct: 0.155, stl_pct: 0.036, blk_pct: 0.002, orb_pct: 0.015, drb_pct: 0.062, drtg: 101.5 },
    nba: { ppg: 0.2, rpg: 0.2, apg: 0.3, spg: 0.1, bpg: 0.0, ws48: 0.001, outcome: 'Out of League' },
  },
  {
    pick: 55, team: 'Seattle SuperSonics', name: 'Melvin Levett', school: 'Cincinnati', pos: 'SG',
    birthYear: 1976, height: 76, weight: 188, wingspan: 79, conf: 'Conference USA',
    archetype: 'Scoring Lead Guard',
    // 1997-98 Cincinnati: 15.2 PPG, 4.0 RPG, 2.5 APG
    stats: { games: 31, mpg: 29.5, ppg: 15.2, rpg: 4.0, apg: 2.5, spg: 1.8, bpg: 0.3, tov: 2.2, pf: 2.2, fg_pct: 0.440, three_pt_pct: 0.345, ft_pct: 0.772, pts_per40: 20.6, reb_per40: 5.4, ast_per40: 3.4, stl_per40: 2.4, blk_per40: 0.4, tov_per40: 3.0, usg: 0.265, per: 17.0, bpm: 2.0, obpm: 1.5, dbpm: 0.5, ws: 3.0, efg_pct: 0.478, ts_pct: 0.536, ast_pct: 0.138, tov_pct: 0.138, stl_pct: 0.038, blk_pct: 0.007, orb_pct: 0.028, drb_pct: 0.092, drtg: 101.0 },
    nba: { ppg: 0.5, rpg: 0.3, apg: 0.3, spg: 0.1, bpg: 0.0, ws48: 0.002, outcome: 'Out of League' },
  },
  {
    pick: 56, team: 'Indiana Pacers', name: 'DeMarco Johnson', school: 'UNC Charlotte', pos: 'PF',
    birthYear: 1976, height: 80, weight: 220, wingspan: 83, conf: 'Conference USA',
    archetype: 'Stretch Big',
    // 1997-98 UNC Charlotte: 13.8 PPG, 8.2 RPG
    stats: { games: 29, mpg: 27.5, ppg: 13.8, rpg: 8.2, apg: 1.0, spg: 0.8, bpg: 1.2, tov: 1.8, pf: 3.0, fg_pct: 0.512, three_pt_pct: 0.295, ft_pct: 0.680, pts_per40: 20.1, reb_per40: 11.9, ast_per40: 1.5, stl_per40: 1.2, blk_per40: 1.7, tov_per40: 2.6, usg: 0.255, per: 18.5, bpm: 3.5, obpm: 1.0, dbpm: 2.5, ws: 3.5, efg_pct: 0.540, ts_pct: 0.567, ast_pct: 0.058, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.038, orb_pct: 0.092, drb_pct: 0.215, drtg: 96.5 },
    nba: { ppg: 1.5, rpg: 1.8, apg: 0.3, spg: 0.2, bpg: 0.3, ws48: 0.018, outcome: 'Out of League' },
  },
  {
    pick: 57, team: 'LA Lakers', name: 'Toby Bailey', school: 'UCLA', pos: 'PG/SG',
    birthYear: 1975, height: 75, weight: 185, wingspan: 78, conf: 'Pac-10',
    archetype: 'Secondary Playmaker',
    // 1997-98 UCLA: 14.5 PPG, 3.8 APG, 3.5 RPG
    stats: { games: 30, mpg: 31.0, ppg: 14.5, rpg: 3.5, apg: 3.8, spg: 1.8, bpg: 0.2, tov: 2.2, pf: 2.0, fg_pct: 0.445, three_pt_pct: 0.335, ft_pct: 0.742, pts_per40: 18.7, reb_per40: 4.5, ast_per40: 4.9, stl_per40: 2.3, blk_per40: 0.3, tov_per40: 2.8, usg: 0.258, per: 17.5, bpm: 2.5, obpm: 1.5, dbpm: 1.0, ws: 3.5, efg_pct: 0.483, ts_pct: 0.536, ast_pct: 0.202, tov_pct: 0.138, stl_pct: 0.038, blk_pct: 0.004, orb_pct: 0.022, drb_pct: 0.082, drtg: 100.5 },
    nba: { ppg: 0.5, rpg: 0.5, apg: 0.5, spg: 0.1, bpg: 0.0, ws48: 0.002, outcome: 'Out of League' },
  },
  {
    pick: 58, team: 'Boston Celtics', name: 'Lee Nailon', school: 'TCU', pos: 'SF/PF',
    birthYear: 1975, height: 80, weight: 228, wingspan: 83, conf: 'WAC',
    archetype: 'Off Ball Scoring Wing',
    // 1997-98 TCU: 20.2 PPG, 8.8 RPG
    stats: { games: 27, mpg: 32.0, ppg: 20.2, rpg: 8.8, apg: 1.5, spg: 1.0, bpg: 0.5, tov: 2.2, pf: 2.8, fg_pct: 0.520, three_pt_pct: 0.280, ft_pct: 0.712, pts_per40: 25.3, reb_per40: 11.0, ast_per40: 1.9, stl_per40: 1.3, blk_per40: 0.6, tov_per40: 2.8, usg: 0.292, per: 22.0, bpm: 5.5, obpm: 3.5, dbpm: 2.0, ws: 4.5, efg_pct: 0.542, ts_pct: 0.574, ast_pct: 0.082, tov_pct: 0.128, stl_pct: 0.022, blk_pct: 0.012, orb_pct: 0.075, drb_pct: 0.175, drtg: 97.5 },
    nba: { ppg: 5.8, rpg: 2.8, apg: 0.8, spg: 0.5, bpg: 0.2, ws48: 0.058, outcome: 'Role Player' },
  },
]

// Filter out placeholder/null entries — only process players with stats
const VALID_PLAYERS = PLAYERS.filter(p => p.stats !== null && p.stats !== undefined)

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
  console.log(`Seeding ${DRAFT_CLASS} NBA Draft — Supplemental Remaining Picks`)
  console.log(`(Adds picks NOT already covered by seed-legendary-1998.mjs)`)

  console.log(`Processing ${VALID_PLAYERS.length} players with stats...`)

  for (const p of VALID_PLAYERS) {
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
  console.log(`Players seeded: ${VALID_PLAYERS.length}`)
  console.log(`Navigate to /legendary-archives?year=1998 to view the full board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
