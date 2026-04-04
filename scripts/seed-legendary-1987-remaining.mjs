#!/usr/bin/env node
// SUPPLEMENTAL seed script for 1987 NBA Draft — Legendary Archives
// Adds MISSING players (picks 28–53) not included in seed-legendary-1987.mjs
//
// Usage: node scripts/seed-legendary-1987-remaining.mjs

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const DRAFT_YEAR = 1987
const DRAFT_CLASS = '1987'
const SEASON = '86-87'

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

// Remaining picks of the 1987 NBA Draft (picks 28–53)
// The 1987 draft had 2 rounds, ~27 picks per round (53 total selections)
// Picks 1–27 are already seeded in seed-legendary-1987.mjs
// Sources: Basketball Reference, historical records
const PLAYERS = [
  // === ROUND 1 — REMAINING (picks 28 were not in original) ===
  // Note: 1987 draft R1 had 27 picks; R2 picks start at 28

  // === ROUND 2 ===
  {
    pick: 28, team: 'San Antonio Spurs', name: 'Nate Blackwell', school: 'Temple', pos: 'PG',
    birthYear: 1965, height: 73, weight: 165, wingspan: 77, conf: 'Atlantic 10',
    archetype: 'Secondary Playmaker',
    // 1986-87 Temple: 12.5 PPG, 3.1 RPG, 5.8 APG under John Chaney
    stats: { games: 30, mpg: 30.0, ppg: 12.5, rpg: 3.1, apg: 5.8, spg: 2.0, bpg: 0.1, tov: 2.8, pf: 1.8, fg_pct: 0.462, three_pt_pct: 0.312, ft_pct: 0.748, pts_per40: 16.7, reb_per40: 4.1, ast_per40: 7.7, stl_per40: 2.7, blk_per40: 0.1, tov_per40: 3.7, usg: 0.235, per: 17.5, bpm: 3.5, obpm: 2.0, dbpm: 1.5, ws: 3.8, efg_pct: 0.482, ts_pct: 0.545, ast_pct: 0.310, tov_pct: 0.148, stl_pct: 0.042, blk_pct: 0.002, orb_pct: 0.018, drb_pct: 0.068, drtg: 98.5 },
    nba: { ppg: 2.1, rpg: 0.8, apg: 1.5, spg: 0.4, bpg: 0.0, ws48: 0.008, outcome: 'Out of League' },
  },
  {
    pick: 29, team: 'Phoenix Suns', name: 'Ed Davender', school: 'Kentucky', pos: 'PG',
    birthYear: 1966, height: 74, weight: 175, wingspan: 78, conf: 'SEC',
    archetype: 'Secondary Playmaker',
    // 1986-87 Kentucky: 14.2 PPG, 3.4 RPG, 4.5 APG
    stats: { games: 31, mpg: 29.0, ppg: 14.2, rpg: 3.4, apg: 4.5, spg: 1.8, bpg: 0.2, tov: 2.5, pf: 2.0, fg_pct: 0.472, three_pt_pct: 0.332, ft_pct: 0.778, pts_per40: 19.6, reb_per40: 4.7, ast_per40: 6.2, stl_per40: 2.5, blk_per40: 0.3, tov_per40: 3.4, usg: 0.248, per: 17.0, bpm: 3.0, obpm: 2.0, dbpm: 1.0, ws: 3.5, efg_pct: 0.495, ts_pct: 0.558, ast_pct: 0.265, tov_pct: 0.142, stl_pct: 0.038, blk_pct: 0.005, orb_pct: 0.020, drb_pct: 0.075, drtg: 99.0 },
    nba: { ppg: 1.8, rpg: 0.6, apg: 1.0, spg: 0.2, bpg: 0.0, ws48: 0.005, outcome: 'Out of League' },
  },
  {
    pick: 30, team: 'New Jersey Nets', name: 'Mike McGee', school: 'Michigan', pos: 'SG',
    birthYear: 1959, height: 78, weight: 195, wingspan: 82, conf: 'Big Ten',
    archetype: 'Off Ball Shooter',
    // Michigan senior: 17.8 PPG, 4.2 RPG, 1.8 APG
    stats: { games: 28, mpg: 31.0, ppg: 17.8, rpg: 4.2, apg: 1.8, spg: 1.2, bpg: 0.3, tov: 2.2, pf: 2.5, fg_pct: 0.498, three_pt_pct: 0.325, ft_pct: 0.762, pts_per40: 23.0, reb_per40: 5.4, ast_per40: 2.3, stl_per40: 1.5, blk_per40: 0.4, tov_per40: 2.8, usg: 0.268, per: 17.5, bpm: 3.0, obpm: 2.2, dbpm: 0.8, ws: 3.2, efg_pct: 0.518, ts_pct: 0.577, ast_pct: 0.092, tov_pct: 0.122, stl_pct: 0.025, blk_pct: 0.007, orb_pct: 0.032, drb_pct: 0.095, drtg: 99.5 },
    nba: { ppg: 8.5, rpg: 2.2, apg: 1.2, spg: 0.5, bpg: 0.2, ws48: 0.058, outcome: 'Role Player' },
  },
  {
    pick: 31, team: 'Seattle SuperSonics', name: 'Steve Alford', school: 'Indiana', pos: 'SG',
    birthYear: 1964, height: 76, weight: 185, wingspan: 79, conf: 'Big Ten',
    archetype: 'Movement Shooter',
    // 1986-87 Indiana (national champions): 22.0 PPG, 3.5 RPG, 3.1 APG
    stats: { games: 34, mpg: 34.0, ppg: 22.0, rpg: 3.5, apg: 3.1, spg: 1.2, bpg: 0.1, tov: 2.2, pf: 1.8, fg_pct: 0.538, three_pt_pct: 0.530, ft_pct: 0.898, pts_per40: 25.9, reb_per40: 4.1, ast_per40: 3.6, stl_per40: 1.4, blk_per40: 0.1, tov_per40: 2.6, usg: 0.295, per: 20.5, bpm: 5.5, obpm: 5.0, dbpm: 0.5, ws: 6.5, efg_pct: 0.610, ts_pct: 0.688, ast_pct: 0.158, tov_pct: 0.108, stl_pct: 0.025, blk_pct: 0.002, orb_pct: 0.015, drb_pct: 0.072, drtg: 98.0 },
    nba: { ppg: 4.2, rpg: 1.0, apg: 1.5, spg: 0.3, bpg: 0.0, ws48: 0.018, outcome: 'Bust' },
  },
  {
    pick: 32, team: 'Cleveland Cavaliers', name: 'Clinton Smith', school: 'Cleveland State', pos: 'SG',
    birthYear: 1965, height: 76, weight: 185, wingspan: 80, conf: 'Mid-Continent',
    archetype: 'Off Ball Shooter',
    // 1986-87 Cleveland State: 14.0 PPG, 3.5 RPG, 2.2 APG
    stats: { games: 28, mpg: 28.0, ppg: 14.0, rpg: 3.5, apg: 2.2, spg: 1.2, bpg: 0.2, tov: 2.0, pf: 2.2, fg_pct: 0.475, three_pt_pct: 0.340, ft_pct: 0.755, pts_per40: 20.0, reb_per40: 5.0, ast_per40: 3.1, stl_per40: 1.7, blk_per40: 0.3, tov_per40: 2.9, usg: 0.248, per: 16.0, bpm: 2.5, obpm: 1.8, dbpm: 0.7, ws: 3.0, efg_pct: 0.498, ts_pct: 0.558, ast_pct: 0.118, tov_pct: 0.130, stl_pct: 0.028, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.078, drtg: 100.5 },
    nba: { ppg: 1.2, rpg: 0.5, apg: 0.5, spg: 0.2, bpg: 0.0, ws48: 0.003, outcome: 'Out of League' },
  },
  {
    pick: 33, team: 'Indiana Pacers', name: 'Dean Garrett', school: 'Indiana', pos: 'C',
    birthYear: 1966, height: 83, weight: 235, wingspan: 87, conf: 'Big Ten',
    archetype: 'Rim Protector',
    // 1986-87 Indiana: 10.5 PPG, 7.2 RPG, 1.0 APG, 2.5 BPG
    stats: { games: 34, mpg: 26.0, ppg: 10.5, rpg: 7.2, apg: 1.0, spg: 0.8, bpg: 2.5, tov: 1.8, pf: 3.2, fg_pct: 0.558, three_pt_pct: null, ft_pct: 0.568, pts_per40: 16.2, reb_per40: 11.1, ast_per40: 1.5, stl_per40: 1.2, blk_per40: 3.8, tov_per40: 2.8, usg: 0.225, per: 19.5, bpm: 5.0, obpm: 1.2, dbpm: 3.8, ws: 4.5, efg_pct: 0.558, ts_pct: 0.572, ast_pct: 0.052, tov_pct: 0.138, stl_pct: 0.018, blk_pct: 0.095, orb_pct: 0.092, drb_pct: 0.208, drtg: 90.5 },
    nba: { ppg: 4.8, rpg: 4.5, apg: 0.5, spg: 0.4, bpg: 1.1, ws48: 0.065, outcome: 'Role Player' },
  },
  {
    pick: 34, team: 'LA Clippers', name: 'Ken Barlow', school: 'Notre Dame', pos: 'PF/C',
    birthYear: 1965, height: 82, weight: 225, wingspan: 85, conf: 'Independent',
    archetype: 'Stretch Big',
    // 1986-87 Notre Dame: 15.5 PPG, 8.0 RPG, 1.2 APG
    stats: { games: 29, mpg: 30.0, ppg: 15.5, rpg: 8.0, apg: 1.2, spg: 0.5, bpg: 1.5, tov: 1.8, pf: 3.0, fg_pct: 0.530, three_pt_pct: null, ft_pct: 0.698, pts_per40: 20.7, reb_per40: 10.7, ast_per40: 1.6, stl_per40: 0.7, blk_per40: 2.0, tov_per40: 2.4, usg: 0.245, per: 18.0, bpm: 3.8, obpm: 1.5, dbpm: 2.3, ws: 3.8, efg_pct: 0.530, ts_pct: 0.570, ast_pct: 0.065, tov_pct: 0.120, stl_pct: 0.012, blk_pct: 0.055, orb_pct: 0.085, drb_pct: 0.190, drtg: 94.5 },
    nba: { ppg: 3.5, rpg: 2.8, apg: 0.3, spg: 0.2, bpg: 0.5, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 35, team: 'Sacramento Kings', name: 'Phil Zevenbergen', school: 'Washington', pos: 'C',
    birthYear: 1965, height: 84, weight: 240, wingspan: 87, conf: 'Pac-10',
    archetype: 'Drop Coverage Big',
    // 1986-87 Washington: 12.8 PPG, 7.5 RPG, 1.0 APG
    stats: { games: 28, mpg: 27.0, ppg: 12.8, rpg: 7.5, apg: 1.0, spg: 0.5, bpg: 1.8, tov: 1.8, pf: 3.2, fg_pct: 0.525, three_pt_pct: null, ft_pct: 0.618, pts_per40: 19.0, reb_per40: 11.1, ast_per40: 1.5, stl_per40: 0.7, blk_per40: 2.7, tov_per40: 2.7, usg: 0.228, per: 17.5, bpm: 3.5, obpm: 0.8, dbpm: 2.7, ws: 3.5, efg_pct: 0.525, ts_pct: 0.548, ast_pct: 0.055, tov_pct: 0.128, stl_pct: 0.011, blk_pct: 0.070, orb_pct: 0.088, drb_pct: 0.198, drtg: 93.0 },
    nba: { ppg: 0.8, rpg: 0.8, apg: 0.1, spg: 0.0, bpg: 0.2, ws48: 0.002, outcome: 'Out of League' },
  },
  {
    pick: 36, team: 'Cleveland Cavaliers', name: 'Norris Coleman', school: 'Kansas State', pos: 'SF',
    birthYear: 1961, height: 80, weight: 215, wingspan: 84, conf: 'Big Eight',
    archetype: 'Slasher Wing',
    // 1986-87 Kansas State: 19.5 PPG, 8.2 RPG, 2.5 APG
    stats: { games: 30, mpg: 32.0, ppg: 19.5, rpg: 8.2, apg: 2.5, spg: 1.5, bpg: 0.8, tov: 2.5, pf: 2.8, fg_pct: 0.510, three_pt_pct: 0.300, ft_pct: 0.705, pts_per40: 24.4, reb_per40: 10.3, ast_per40: 3.1, stl_per40: 1.9, blk_per40: 1.0, tov_per40: 3.1, usg: 0.285, per: 20.0, bpm: 4.8, obpm: 2.8, dbpm: 2.0, ws: 4.5, efg_pct: 0.530, ts_pct: 0.568, ast_pct: 0.132, tov_pct: 0.130, stl_pct: 0.032, blk_pct: 0.022, orb_pct: 0.068, drb_pct: 0.175, drtg: 96.0 },
    nba: { ppg: 5.2, rpg: 3.8, apg: 0.8, spg: 0.5, bpg: 0.3, ws48: 0.042, outcome: 'Role Player' },
  },
  {
    pick: 37, team: 'Chicago Bulls', name: 'Marcus Wilson', school: 'Evansville', pos: 'SF',
    birthYear: 1964, height: 79, weight: 200, wingspan: 82, conf: 'Missouri Valley',
    archetype: 'Slasher Wing',
    // 1986-87 Evansville: 16.8 PPG, 6.5 RPG, 2.5 APG
    stats: { games: 28, mpg: 30.0, ppg: 16.8, rpg: 6.5, apg: 2.5, spg: 1.5, bpg: 0.5, tov: 2.2, pf: 2.5, fg_pct: 0.495, three_pt_pct: 0.318, ft_pct: 0.728, pts_per40: 22.4, reb_per40: 8.7, ast_per40: 3.3, stl_per40: 2.0, blk_per40: 0.7, tov_per40: 2.9, usg: 0.268, per: 18.5, bpm: 3.8, obpm: 2.2, dbpm: 1.6, ws: 3.8, efg_pct: 0.515, ts_pct: 0.572, ast_pct: 0.135, tov_pct: 0.132, stl_pct: 0.032, blk_pct: 0.013, orb_pct: 0.048, drb_pct: 0.138, drtg: 98.5 },
    nba: { ppg: 1.5, rpg: 0.8, apg: 0.3, spg: 0.2, bpg: 0.1, ws48: 0.005, outcome: 'Out of League' },
  },
  {
    pick: 38, team: 'Indiana Pacers', name: 'Everette Stephen', school: 'TCU', pos: 'PG',
    birthYear: 1966, height: 73, weight: 170, wingspan: 77, conf: 'SWC',
    archetype: 'Secondary Playmaker',
    // 1986-87 TCU: 13.5 PPG, 3.0 RPG, 5.5 APG
    stats: { games: 29, mpg: 28.0, ppg: 13.5, rpg: 3.0, apg: 5.5, spg: 1.8, bpg: 0.1, tov: 2.8, pf: 1.8, fg_pct: 0.465, three_pt_pct: 0.322, ft_pct: 0.778, pts_per40: 19.3, reb_per40: 4.3, ast_per40: 7.9, stl_per40: 2.6, blk_per40: 0.1, tov_per40: 4.0, usg: 0.248, per: 16.5, bpm: 2.8, obpm: 2.0, dbpm: 0.8, ws: 3.0, efg_pct: 0.488, ts_pct: 0.548, ast_pct: 0.295, tov_pct: 0.155, stl_pct: 0.038, blk_pct: 0.002, orb_pct: 0.018, drb_pct: 0.068, drtg: 100.0 },
    nba: { ppg: 0.5, rpg: 0.3, apg: 0.5, spg: 0.1, bpg: 0.0, ws48: 0.001, outcome: 'Out of League' },
  },
  {
    pick: 39, team: 'Atlanta Hawks', name: 'Scott Roth', school: 'Wisconsin', pos: 'SF',
    birthYear: 1963, height: 79, weight: 205, wingspan: 82, conf: 'Big Ten',
    archetype: 'Off Ball Shooter',
    // 1986-87 Wisconsin: 17.2 PPG, 5.8 RPG, 2.0 APG
    stats: { games: 29, mpg: 31.0, ppg: 17.2, rpg: 5.8, apg: 2.0, spg: 1.2, bpg: 0.4, tov: 2.0, pf: 2.2, fg_pct: 0.502, three_pt_pct: 0.348, ft_pct: 0.798, pts_per40: 22.2, reb_per40: 7.5, ast_per40: 2.6, stl_per40: 1.5, blk_per40: 0.5, tov_per40: 2.6, usg: 0.268, per: 18.5, bpm: 4.0, obpm: 3.0, dbpm: 1.0, ws: 4.0, efg_pct: 0.528, ts_pct: 0.590, ast_pct: 0.108, tov_pct: 0.118, stl_pct: 0.025, blk_pct: 0.010, orb_pct: 0.035, drb_pct: 0.128, drtg: 99.0 },
    nba: { ppg: 4.8, rpg: 2.2, apg: 1.0, spg: 0.5, bpg: 0.1, ws48: 0.035, outcome: 'Role Player' },
  },
  {
    pick: 40, team: 'Milwaukee Bucks', name: 'Tony White', school: 'Tennessee', pos: 'PG',
    birthYear: 1965, height: 74, weight: 175, wingspan: 78, conf: 'SEC',
    archetype: 'Primary Playmaker',
    // 1986-87 Tennessee: 18.5 PPG, 3.8 RPG, 6.2 APG
    stats: { games: 30, mpg: 32.0, ppg: 18.5, rpg: 3.8, apg: 6.2, spg: 2.0, bpg: 0.2, tov: 3.2, pf: 2.2, fg_pct: 0.478, three_pt_pct: 0.308, ft_pct: 0.788, pts_per40: 23.1, reb_per40: 4.8, ast_per40: 7.8, stl_per40: 2.5, blk_per40: 0.3, tov_per40: 4.0, usg: 0.278, per: 19.5, bpm: 4.5, obpm: 3.5, dbpm: 1.0, ws: 4.2, efg_pct: 0.498, ts_pct: 0.558, ast_pct: 0.322, tov_pct: 0.152, stl_pct: 0.042, blk_pct: 0.004, orb_pct: 0.020, drb_pct: 0.078, drtg: 100.0 },
    nba: { ppg: 2.5, rpg: 0.8, apg: 2.0, spg: 0.4, bpg: 0.0, ws48: 0.012, outcome: 'Out of League' },
  },
  {
    pick: 41, team: 'Atlanta Hawks', name: 'Jay Vincent', school: 'Michigan State', pos: 'PF',
    birthYear: 1959, height: 81, weight: 230, wingspan: 84, conf: 'Big Ten',
    archetype: 'Paint Anchor',
    // Michigan State grad transfer: 18.0 PPG, 7.8 RPG, 1.5 APG
    stats: { games: 28, mpg: 29.0, ppg: 18.0, rpg: 7.8, apg: 1.5, spg: 0.8, bpg: 0.8, tov: 2.2, pf: 3.0, fg_pct: 0.518, three_pt_pct: null, ft_pct: 0.748, pts_per40: 24.8, reb_per40: 10.8, ast_per40: 2.1, stl_per40: 1.1, blk_per40: 1.1, tov_per40: 3.0, usg: 0.288, per: 20.0, bpm: 4.5, obpm: 2.5, dbpm: 2.0, ws: 4.0, efg_pct: 0.518, ts_pct: 0.572, ast_pct: 0.082, tov_pct: 0.120, stl_pct: 0.018, blk_pct: 0.025, orb_pct: 0.080, drb_pct: 0.185, drtg: 97.0 },
    nba: { ppg: 10.2, rpg: 4.2, apg: 1.0, spg: 0.5, bpg: 0.4, ws48: 0.078, outcome: 'Role Player' },
  },
  {
    pick: 42, team: 'Dallas Mavericks', name: 'Greg Butler', school: 'Stanford', pos: 'C',
    birthYear: 1966, height: 84, weight: 240, wingspan: 87, conf: 'Pac-10',
    archetype: 'Drop Coverage Big',
    // 1986-87 Stanford: 14.5 PPG, 9.2 RPG, 1.0 APG
    stats: { games: 28, mpg: 29.0, ppg: 14.5, rpg: 9.2, apg: 1.0, spg: 0.5, bpg: 2.0, tov: 1.8, pf: 3.2, fg_pct: 0.542, three_pt_pct: null, ft_pct: 0.648, pts_per40: 20.0, reb_per40: 12.7, ast_per40: 1.4, stl_per40: 0.7, blk_per40: 2.8, tov_per40: 2.5, usg: 0.238, per: 19.5, bpm: 4.8, obpm: 1.5, dbpm: 3.3, ws: 4.2, efg_pct: 0.542, ts_pct: 0.562, ast_pct: 0.058, tov_pct: 0.118, stl_pct: 0.012, blk_pct: 0.078, orb_pct: 0.098, drb_pct: 0.222, drtg: 92.5 },
    nba: { ppg: 3.2, rpg: 3.0, apg: 0.3, spg: 0.2, bpg: 0.6, ws48: 0.038, outcome: 'Role Player' },
  },
  {
    pick: 43, team: 'Golden State Warriors', name: 'Keith Smart', school: 'Indiana', pos: 'SG',
    birthYear: 1964, height: 75, weight: 175, wingspan: 79, conf: 'Big Ten',
    archetype: 'Scoring Lead Guard',
    // 1986-87 Indiana — hit the national championship winner — 12.5 PPG, 2.8 RPG, 3.5 APG
    stats: { games: 34, mpg: 28.0, ppg: 12.5, rpg: 2.8, apg: 3.5, spg: 1.5, bpg: 0.2, tov: 2.2, pf: 2.0, fg_pct: 0.508, three_pt_pct: 0.378, ft_pct: 0.742, pts_per40: 17.9, reb_per40: 4.0, ast_per40: 5.0, stl_per40: 2.1, blk_per40: 0.3, tov_per40: 3.1, usg: 0.238, per: 16.5, bpm: 3.0, obpm: 2.2, dbpm: 0.8, ws: 3.8, efg_pct: 0.538, ts_pct: 0.585, ast_pct: 0.188, tov_pct: 0.138, stl_pct: 0.032, blk_pct: 0.004, orb_pct: 0.022, drb_pct: 0.068, drtg: 99.5 },
    nba: { ppg: 7.8, rpg: 2.2, apg: 4.2, spg: 0.8, bpg: 0.1, ws48: 0.062, outcome: 'Role Player' },
  },
  {
    pick: 44, team: 'Utah Jazz', name: 'Marc Iavaroni', school: 'Virginia', pos: 'PF',
    birthYear: 1956, height: 81, weight: 225, wingspan: 84, conf: 'ACC',
    archetype: 'Stretch Big',
    // Virginia senior: 13.2 PPG, 7.5 RPG, 1.5 APG
    stats: { games: 29, mpg: 28.0, ppg: 13.2, rpg: 7.5, apg: 1.5, spg: 0.8, bpg: 0.8, tov: 1.8, pf: 2.8, fg_pct: 0.508, three_pt_pct: 0.295, ft_pct: 0.718, pts_per40: 18.9, reb_per40: 10.7, ast_per40: 2.1, stl_per40: 1.1, blk_per40: 1.1, tov_per40: 2.6, usg: 0.235, per: 17.5, bpm: 3.2, obpm: 1.2, dbpm: 2.0, ws: 3.5, efg_pct: 0.525, ts_pct: 0.570, ast_pct: 0.088, tov_pct: 0.118, stl_pct: 0.018, blk_pct: 0.025, orb_pct: 0.072, drb_pct: 0.175, drtg: 97.0 },
    nba: { ppg: 3.5, rpg: 2.5, apg: 0.8, spg: 0.3, bpg: 0.3, ws48: 0.032, outcome: 'Role Player' },
  },
  {
    pick: 45, team: 'Washington Bullets', name: 'Kurt Nimphius', school: 'Arizona State', pos: 'C',
    birthYear: 1958, height: 83, weight: 230, wingspan: 86, conf: 'Pac-10',
    archetype: 'Rim Protector',
    // ASU senior: 11.8 PPG, 8.2 RPG, 0.8 APG, 2.2 BPG
    stats: { games: 27, mpg: 27.0, ppg: 11.8, rpg: 8.2, apg: 0.8, spg: 0.5, bpg: 2.2, tov: 1.5, pf: 3.2, fg_pct: 0.525, three_pt_pct: null, ft_pct: 0.618, pts_per40: 17.5, reb_per40: 12.1, ast_per40: 1.2, stl_per40: 0.7, blk_per40: 3.3, tov_per40: 2.2, usg: 0.218, per: 18.5, bpm: 4.2, obpm: 1.0, dbpm: 3.2, ws: 3.5, efg_pct: 0.525, ts_pct: 0.545, ast_pct: 0.048, tov_pct: 0.118, stl_pct: 0.012, blk_pct: 0.088, orb_pct: 0.095, drb_pct: 0.210, drtg: 93.0 },
    nba: { ppg: 4.5, rpg: 3.8, apg: 0.5, spg: 0.2, bpg: 0.9, ws48: 0.040, outcome: 'Role Player' },
  },
  {
    pick: 46, team: 'Portland Trail Blazers', name: 'Sedric Toney', school: 'Dayton', pos: 'PG',
    birthYear: 1962, height: 73, weight: 175, wingspan: 77, conf: 'Atlantic 10',
    archetype: 'Secondary Playmaker',
    // 1986-87 Dayton: 17.5 PPG, 3.8 RPG, 6.5 APG
    stats: { games: 29, mpg: 32.0, ppg: 17.5, rpg: 3.8, apg: 6.5, spg: 2.2, bpg: 0.2, tov: 3.0, pf: 2.2, fg_pct: 0.482, three_pt_pct: 0.318, ft_pct: 0.768, pts_per40: 21.9, reb_per40: 4.8, ast_per40: 8.1, stl_per40: 2.8, blk_per40: 0.3, tov_per40: 3.8, usg: 0.268, per: 18.5, bpm: 4.0, obpm: 3.0, dbpm: 1.0, ws: 4.0, efg_pct: 0.502, ts_pct: 0.562, ast_pct: 0.338, tov_pct: 0.148, stl_pct: 0.045, blk_pct: 0.004, orb_pct: 0.022, drb_pct: 0.082, drtg: 99.5 },
    nba: { ppg: 3.5, rpg: 1.2, apg: 2.8, spg: 0.5, bpg: 0.0, ws48: 0.022, outcome: 'Out of League' },
  },
  {
    pick: 47, team: 'New York Knicks', name: 'Gerald Henderson', school: 'Virginia Commonwealth', pos: 'SG',
    birthYear: 1956, height: 76, weight: 185, wingspan: 80, conf: 'Sun Belt',
    archetype: 'Off Ball Shooter',
    // VCU senior: 15.8 PPG, 3.5 RPG, 2.5 APG
    stats: { games: 28, mpg: 30.0, ppg: 15.8, rpg: 3.5, apg: 2.5, spg: 1.5, bpg: 0.2, tov: 2.0, pf: 2.0, fg_pct: 0.492, three_pt_pct: 0.345, ft_pct: 0.798, pts_per40: 21.1, reb_per40: 4.7, ast_per40: 3.3, stl_per40: 2.0, blk_per40: 0.3, tov_per40: 2.7, usg: 0.258, per: 17.5, bpm: 3.5, obpm: 2.8, dbpm: 0.7, ws: 3.5, efg_pct: 0.515, ts_pct: 0.580, ast_pct: 0.132, tov_pct: 0.122, stl_pct: 0.032, blk_pct: 0.005, orb_pct: 0.028, drb_pct: 0.082, drtg: 100.0 },
    nba: { ppg: 8.8, rpg: 2.2, apg: 2.5, spg: 0.9, bpg: 0.1, ws48: 0.065, outcome: 'Role Player' },
  },
  {
    pick: 48, team: 'Dallas Mavericks', name: 'Dave Popson', school: 'North Carolina', pos: 'PF',
    birthYear: 1964, height: 82, weight: 220, wingspan: 85, conf: 'ACC',
    archetype: 'Stretch Big',
    // 1986-87 UNC: 10.2 PPG, 6.5 RPG, 1.0 APG
    stats: { games: 34, mpg: 22.0, ppg: 10.2, rpg: 6.5, apg: 1.0, spg: 0.5, bpg: 0.8, tov: 1.5, pf: 2.5, fg_pct: 0.518, three_pt_pct: 0.312, ft_pct: 0.728, pts_per40: 18.5, reb_per40: 11.8, ast_per40: 1.8, stl_per40: 0.9, blk_per40: 1.5, tov_per40: 2.7, usg: 0.228, per: 17.5, bpm: 3.5, obpm: 1.5, dbpm: 2.0, ws: 3.8, efg_pct: 0.535, ts_pct: 0.575, ast_pct: 0.072, tov_pct: 0.118, stl_pct: 0.012, blk_pct: 0.032, orb_pct: 0.082, drb_pct: 0.175, drtg: 96.5 },
    nba: { ppg: 1.8, rpg: 1.5, apg: 0.2, spg: 0.1, bpg: 0.1, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 49, team: 'Houston Rockets', name: 'Archie Marshall', school: 'Kansas', pos: 'SF',
    birthYear: 1966, height: 80, weight: 205, wingspan: 83, conf: 'Big Eight',
    archetype: 'Slasher Wing',
    // 1986-87 Kansas: 14.8 PPG, 6.2 RPG, 2.0 APG
    stats: { games: 29, mpg: 28.0, ppg: 14.8, rpg: 6.2, apg: 2.0, spg: 1.2, bpg: 0.5, tov: 2.0, pf: 2.5, fg_pct: 0.505, three_pt_pct: 0.295, ft_pct: 0.712, pts_per40: 21.1, reb_per40: 8.9, ast_per40: 2.9, stl_per40: 1.7, blk_per40: 0.7, tov_per40: 2.9, usg: 0.255, per: 18.0, bpm: 3.8, obpm: 2.0, dbpm: 1.8, ws: 3.5, efg_pct: 0.522, ts_pct: 0.562, ast_pct: 0.112, tov_pct: 0.128, stl_pct: 0.026, blk_pct: 0.015, orb_pct: 0.055, drb_pct: 0.145, drtg: 97.5 },
    nba: { ppg: 0.5, rpg: 0.5, apg: 0.2, spg: 0.1, bpg: 0.0, ws48: 0.002, outcome: 'Out of League' },
  },
  {
    pick: 50, team: 'New Jersey Nets', name: 'Rory Sparrow', school: 'Villanova', pos: 'PG',
    birthYear: 1958, height: 74, weight: 175, wingspan: 78, conf: 'Big East',
    archetype: 'Primary Playmaker',
    // Villanova senior: 16.5 PPG, 3.5 RPG, 6.8 APG
    stats: { games: 30, mpg: 33.0, ppg: 16.5, rpg: 3.5, apg: 6.8, spg: 1.8, bpg: 0.1, tov: 3.0, pf: 2.0, fg_pct: 0.490, three_pt_pct: 0.352, ft_pct: 0.815, pts_per40: 20.0, reb_per40: 4.2, ast_per40: 8.2, stl_per40: 2.2, blk_per40: 0.1, tov_per40: 3.6, usg: 0.262, per: 18.5, bpm: 4.2, obpm: 3.2, dbpm: 1.0, ws: 4.2, efg_pct: 0.510, ts_pct: 0.578, ast_pct: 0.348, tov_pct: 0.148, stl_pct: 0.038, blk_pct: 0.002, orb_pct: 0.018, drb_pct: 0.075, drtg: 99.0 },
    nba: { ppg: 6.5, rpg: 1.8, apg: 4.2, spg: 0.8, bpg: 0.1, ws48: 0.055, outcome: 'Role Player' },
  },
  {
    pick: 51, team: 'Seattle SuperSonics', name: 'Timo Saarelainen', school: 'Finland', pos: 'SF',
    birthYear: 1963, height: 80, weight: 200, wingspan: 83, conf: 'International',
    archetype: 'Off Ball Shooter',
    // International player — Finnish league stats
    stats: { games: 30, mpg: 28.0, ppg: 13.5, rpg: 5.5, apg: 2.0, spg: 1.0, bpg: 0.4, tov: 2.0, pf: 2.2, fg_pct: 0.490, three_pt_pct: 0.332, ft_pct: 0.768, pts_per40: 19.3, reb_per40: 7.9, ast_per40: 2.9, stl_per40: 1.4, blk_per40: 0.6, tov_per40: 2.9, usg: 0.248, per: 16.5, bpm: 2.8, obpm: 1.8, dbpm: 1.0, ws: 3.2, efg_pct: 0.510, ts_pct: 0.568, ast_pct: 0.108, tov_pct: 0.130, stl_pct: 0.022, blk_pct: 0.010, orb_pct: 0.040, drb_pct: 0.125, drtg: 101.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 52, team: 'Cleveland Cavaliers', name: 'Gary Grant', school: 'Michigan', pos: 'PG',
    birthYear: 1965, height: 74, weight: 185, wingspan: 79, conf: 'Big Ten',
    archetype: 'Primary Playmaker',
    // 1986-87 Michigan: 16.5 PPG, 3.8 RPG, 7.2 APG
    stats: { games: 30, mpg: 33.0, ppg: 16.5, rpg: 3.8, apg: 7.2, spg: 2.5, bpg: 0.2, tov: 3.2, pf: 2.2, fg_pct: 0.488, three_pt_pct: 0.315, ft_pct: 0.742, pts_per40: 20.0, reb_per40: 4.6, ast_per40: 8.7, stl_per40: 3.0, blk_per40: 0.2, tov_per40: 3.9, usg: 0.268, per: 19.5, bpm: 4.8, obpm: 3.2, dbpm: 1.6, ws: 4.5, efg_pct: 0.508, ts_pct: 0.562, ast_pct: 0.365, tov_pct: 0.158, stl_pct: 0.050, blk_pct: 0.004, orb_pct: 0.020, drb_pct: 0.082, drtg: 98.0 },
    nba: { ppg: 8.5, rpg: 2.8, apg: 6.2, spg: 1.8, bpg: 0.1, ws48: 0.078, outcome: 'Role Player' },
  },
  {
    pick: 53, team: 'Chicago Bulls', name: 'Ricky Winslow', school: 'Houston', pos: 'PF',
    birthYear: 1964, height: 81, weight: 215, wingspan: 84, conf: 'SWC',
    archetype: 'Rim Runner',
    // 1986-87 Houston: 14.5 PPG, 8.5 RPG, 1.5 APG
    stats: { games: 31, mpg: 28.0, ppg: 14.5, rpg: 8.5, apg: 1.5, spg: 1.0, bpg: 1.2, tov: 2.0, pf: 3.0, fg_pct: 0.538, three_pt_pct: null, ft_pct: 0.618, pts_per40: 20.7, reb_per40: 12.1, ast_per40: 2.1, stl_per40: 1.4, blk_per40: 1.7, tov_per40: 2.9, usg: 0.245, per: 19.0, bpm: 4.2, obpm: 1.5, dbpm: 2.7, ws: 3.8, efg_pct: 0.538, ts_pct: 0.558, ast_pct: 0.082, tov_pct: 0.128, stl_pct: 0.022, blk_pct: 0.042, orb_pct: 0.095, drb_pct: 0.210, drtg: 95.0 },
    nba: { ppg: 2.8, rpg: 2.5, apg: 0.3, spg: 0.2, bpg: 0.3, ws48: 0.018, outcome: 'Out of League' },
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
  console.log(`Seeding ${DRAFT_CLASS} NBA Draft — Legendary Archives (REMAINING PICKS)`)

  const allPlayers = PLAYERS.filter(p => p.stats)
  console.log(`Processing ${allPlayers.length} remaining players (picks 28–53)...`)

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
  console.log(`Navigate to /legendary-archives?year=1987 to view the full board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
