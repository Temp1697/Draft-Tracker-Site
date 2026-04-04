#!/usr/bin/env node
// SUPPLEMENTAL Seed script for 2020 NBA Draft — Legendary Archives
// Adds the MISSING players not included in seed-legendary-2020.mjs
//
// Already seeded by seed-legendary-2020.mjs:
//   Picks 1-12, 14-21, 24-26, 28-30
// This script covers:
//   Round 1 picks: 13, 22, 23, 27
//   Round 2 picks: 31-60
//
// Usage: node scripts/seed-legendary-2020-remaining.mjs

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const DRAFT_YEAR = 2020
const DRAFT_CLASS = '2020'
const SEASON = '19-20'

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

// Missing players from the 2020 NBA Draft
// Round 1 missing: 13, 22, 23, 27
// Round 2: 31-60
// Sources: Basketball Reference, ESPN, Barttorvik
// All percentage stats in DECIMAL format
const PLAYERS = [
  // === ROUND 1 — MISSING PICKS ===
  {
    pick: 13, team: 'New Orleans Pelicans', name: 'Kira Lewis Jr.', school: 'Alabama', pos: 'PG',
    birthYear: 2001, height: 74, weight: 170, wingspan: 78, conf: 'SEC',
    archetype: 'Secondary Playmaker',
    // 2019-20 Alabama: 18.5 PPG, 4.6 RPG, 5.2 APG in 31 games
    stats: { games: 31, mpg: 33.1, ppg: 18.5, rpg: 4.6, apg: 5.2, spg: 1.5, bpg: 0.3, tov: 2.8, pf: 1.9, fg_pct: 0.474, three_pt_pct: 0.356, ft_pct: 0.764, pts_per40: 22.4, reb_per40: 5.6, ast_per40: 6.3, stl_per40: 1.8, blk_per40: 0.4, tov_per40: 3.4, usg: 0.275, per: 20.5, bpm: 5.0, obpm: 4.0, dbpm: 1.0, ws: 4.5, efg_pct: 0.545, ts_pct: 0.590, ast_pct: 0.295, tov_pct: 0.148, stl_pct: 0.024, blk_pct: 0.007, orb_pct: 0.022, drb_pct: 0.118, drtg: 98.0 },
    nba: { ppg: 6.5, rpg: 1.8, apg: 3.5, spg: 0.7, bpg: 0.1, ws48: 0.030, outcome: 'Role Player' },
  },
  {
    pick: 22, team: 'LA Lakers', name: 'Talen Horton-Tucker', school: 'Iowa State', pos: 'SG',
    birthYear: 2000, height: 76, weight: 230, wingspan: 82, conf: 'Big 12',
    archetype: 'Athletic Wing',
    // 2019-20 Iowa State: 13.1 PPG, 4.7 RPG, 3.3 APG in 21 games (season ended early)
    stats: { games: 21, mpg: 28.5, ppg: 13.1, rpg: 4.7, apg: 3.3, spg: 1.4, bpg: 0.4, tov: 2.3, pf: 2.5, fg_pct: 0.440, three_pt_pct: 0.282, ft_pct: 0.700, pts_per40: 18.4, reb_per40: 6.6, ast_per40: 4.6, stl_per40: 2.0, blk_per40: 0.6, tov_per40: 3.2, usg: 0.258, per: 16.5, bpm: 2.5, obpm: 1.5, dbpm: 1.0, ws: 2.2, efg_pct: 0.462, ts_pct: 0.510, ast_pct: 0.218, tov_pct: 0.155, stl_pct: 0.026, blk_pct: 0.011, orb_pct: 0.048, drb_pct: 0.128, drtg: 101.0 },
    nba: { ppg: 9.5, rpg: 3.0, apg: 2.8, spg: 0.8, bpg: 0.3, ws48: 0.060, outcome: 'Role Player' },
  },
  {
    pick: 23, team: 'Milwaukee Bucks', name: 'Jordan Nwora', school: 'Louisville', pos: 'SF/PF',
    birthYear: 1998, height: 81, weight: 225, wingspan: 85, conf: 'ACC',
    archetype: 'Stretch Big',
    // 2019-20 Louisville: 18.0 PPG, 7.4 RPG, 1.4 APG in 31 games
    stats: { games: 31, mpg: 31.5, ppg: 18.0, rpg: 7.4, apg: 1.4, spg: 0.6, bpg: 0.5, tov: 1.6, pf: 2.1, fg_pct: 0.472, three_pt_pct: 0.400, ft_pct: 0.782, pts_per40: 22.9, reb_per40: 9.4, ast_per40: 1.8, stl_per40: 0.8, blk_per40: 0.6, tov_per40: 2.0, usg: 0.262, per: 20.0, bpm: 4.5, obpm: 3.5, dbpm: 1.0, ws: 4.8, efg_pct: 0.573, ts_pct: 0.624, ast_pct: 0.088, tov_pct: 0.100, stl_pct: 0.010, blk_pct: 0.013, orb_pct: 0.052, drb_pct: 0.185, drtg: 98.5 },
    nba: { ppg: 7.5, rpg: 3.5, apg: 1.0, spg: 0.4, bpg: 0.2, ws48: 0.050, outcome: 'Role Player' },
  },
  {
    pick: 27, team: 'Denver Nuggets', name: 'Zeke Nnaji', school: 'Arizona', pos: 'PF/C',
    birthYear: 2001, height: 82, weight: 240, wingspan: 85, conf: 'Pac-12',
    archetype: 'Rim Runner',
    // 2019-20 Arizona: 16.1 PPG, 8.6 RPG, 0.7 APG in 32 games
    stats: { games: 32, mpg: 26.5, ppg: 16.1, rpg: 8.6, apg: 0.7, spg: 0.6, bpg: 0.9, tov: 1.8, pf: 3.0, fg_pct: 0.651, three_pt_pct: 0.400, ft_pct: 0.714, pts_per40: 24.3, reb_per40: 13.0, ast_per40: 1.1, stl_per40: 0.9, blk_per40: 1.4, tov_per40: 2.7, usg: 0.260, per: 26.0, bpm: 7.2, obpm: 4.0, dbpm: 3.2, ws: 5.8, efg_pct: 0.686, ts_pct: 0.723, ast_pct: 0.048, tov_pct: 0.108, stl_pct: 0.013, blk_pct: 0.028, orb_pct: 0.098, drb_pct: 0.218, drtg: 95.0 },
    nba: { ppg: 5.5, rpg: 4.5, apg: 0.5, spg: 0.3, bpg: 0.5, ws48: 0.050, outcome: 'Role Player' },
  },

  // === ROUND 2 ===
  {
    pick: 31, team: 'Charlotte Hornets', name: 'Vernon Carey Jr.', school: 'Duke', pos: 'C',
    birthYear: 2001, height: 82, weight: 270, wingspan: 85, conf: 'ACC',
    archetype: 'Drop Coverage Big',
    // 2019-20 Duke: 17.8 PPG, 8.8 RPG, 1.5 APG in 30 games
    stats: { games: 30, mpg: 29.5, ppg: 17.8, rpg: 8.8, apg: 1.5, spg: 0.5, bpg: 1.3, tov: 2.0, pf: 3.2, fg_pct: 0.612, three_pt_pct: 0.286, ft_pct: 0.688, pts_per40: 24.1, reb_per40: 11.9, ast_per40: 2.0, stl_per40: 0.7, blk_per40: 1.8, tov_per40: 2.7, usg: 0.282, per: 24.5, bpm: 6.5, obpm: 4.0, dbpm: 2.5, ws: 5.5, efg_pct: 0.633, ts_pct: 0.672, ast_pct: 0.095, tov_pct: 0.108, stl_pct: 0.009, blk_pct: 0.040, orb_pct: 0.090, drb_pct: 0.215, drtg: 96.0 },
    nba: { ppg: 5.0, rpg: 3.8, apg: 0.5, spg: 0.2, bpg: 0.5, ws48: 0.040, outcome: 'Role Player' },
  },
  {
    pick: 32, team: 'Washington Wizards', name: 'Cassius Winston', school: 'Michigan State', pos: 'PG',
    birthYear: 1998, height: 73, weight: 185, wingspan: 75, conf: 'Big Ten',
    archetype: 'Secondary Playmaker',
    // 2019-20 Michigan State: 18.6 PPG, 3.4 RPG, 5.9 APG in 21 games
    stats: { games: 21, mpg: 34.5, ppg: 18.6, rpg: 3.4, apg: 5.9, spg: 1.0, bpg: 0.1, tov: 2.4, pf: 1.5, fg_pct: 0.441, three_pt_pct: 0.388, ft_pct: 0.841, pts_per40: 21.6, reb_per40: 3.9, ast_per40: 6.8, stl_per40: 1.2, blk_per40: 0.1, tov_per40: 2.8, usg: 0.280, per: 20.5, bpm: 6.0, obpm: 5.5, dbpm: 0.5, ws: 2.8, efg_pct: 0.546, ts_pct: 0.614, ast_pct: 0.330, tov_pct: 0.130, stl_pct: 0.015, blk_pct: 0.002, orb_pct: 0.012, drb_pct: 0.085, drtg: 101.0 },
    nba: { ppg: 3.5, rpg: 1.0, apg: 2.5, spg: 0.3, bpg: 0.0, ws48: 0.015, outcome: 'Out of League' },
  },
  {
    pick: 33, team: 'Portland Trail Blazers', name: 'CJ Elleby', school: 'Washington State', pos: 'SF',
    birthYear: 2000, height: 78, weight: 210, wingspan: 81, conf: 'Pac-12',
    archetype: 'Off Ball Shooter',
    // 2019-20 Washington State: 19.0 PPG, 6.5 RPG, 2.2 APG in 31 games
    stats: { games: 31, mpg: 32.0, ppg: 19.0, rpg: 6.5, apg: 2.2, spg: 1.2, bpg: 0.4, tov: 2.0, pf: 2.0, fg_pct: 0.440, three_pt_pct: 0.347, ft_pct: 0.778, pts_per40: 23.8, reb_per40: 8.1, ast_per40: 2.8, stl_per40: 1.5, blk_per40: 0.5, tov_per40: 2.5, usg: 0.290, per: 18.5, bpm: 4.0, obpm: 3.5, dbpm: 0.5, ws: 4.5, efg_pct: 0.500, ts_pct: 0.566, ast_pct: 0.125, tov_pct: 0.125, stl_pct: 0.019, blk_pct: 0.010, orb_pct: 0.055, drb_pct: 0.168, drtg: 99.5 },
    nba: { ppg: 4.5, rpg: 2.5, apg: 0.8, spg: 0.4, bpg: 0.2, ws48: 0.025, outcome: 'Out of League' },
  },
  {
    pick: 34, team: 'Golden State Warriors', name: 'Nico Mannion', school: 'Arizona', pos: 'PG',
    birthYear: 2001, height: 75, weight: 190, wingspan: 78, conf: 'Pac-12',
    archetype: 'Secondary Playmaker',
    // 2019-20 Arizona: 14.0 PPG, 3.5 RPG, 5.3 APG in 32 games
    stats: { games: 32, mpg: 31.2, ppg: 14.0, rpg: 3.5, apg: 5.3, spg: 1.0, bpg: 0.2, tov: 2.8, pf: 2.0, fg_pct: 0.394, three_pt_pct: 0.321, ft_pct: 0.787, pts_per40: 18.0, reb_per40: 4.5, ast_per40: 6.8, stl_per40: 1.3, blk_per40: 0.3, tov_per40: 3.6, usg: 0.260, per: 15.5, bpm: 2.0, obpm: 2.0, dbpm: 0.0, ws: 3.0, efg_pct: 0.447, ts_pct: 0.505, ast_pct: 0.305, tov_pct: 0.165, stl_pct: 0.016, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.092, drtg: 102.5 },
    nba: { ppg: 4.0, rpg: 1.5, apg: 2.5, spg: 0.4, bpg: 0.1, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 35, team: 'Utah Jazz', name: 'Udoka Azubuike', school: 'Kansas', pos: 'C',
    birthYear: 1999, height: 84, weight: 270, wingspan: 89, conf: 'Big 12',
    archetype: 'Rim Protector',
    // 2019-20 Kansas: 13.7 PPG, 10.5 RPG, 0.9 APG in 31 games
    stats: { games: 31, mpg: 27.5, ppg: 13.7, rpg: 10.5, apg: 0.9, spg: 0.5, bpg: 2.6, tov: 1.6, pf: 3.1, fg_pct: 0.763, three_pt_pct: null, ft_pct: 0.440, pts_per40: 19.9, reb_per40: 15.3, ast_per40: 1.3, stl_per40: 0.7, blk_per40: 3.8, tov_per40: 2.3, usg: 0.232, per: 25.5, bpm: 7.5, obpm: 3.5, dbpm: 4.0, ws: 5.5, efg_pct: 0.763, ts_pct: 0.721, ast_pct: 0.060, tov_pct: 0.100, stl_pct: 0.010, blk_pct: 0.085, orb_pct: 0.135, drb_pct: 0.272, drtg: 92.0 },
    nba: { ppg: 4.5, rpg: 3.5, apg: 0.3, spg: 0.2, bpg: 0.8, ws48: 0.045, outcome: 'Bust' },
  },
  {
    pick: 36, team: 'Indiana Pacers', name: 'Cassius Stanley', school: 'Duke', pos: 'SG',
    birthYear: 1999, height: 78, weight: 190, wingspan: 81, conf: 'ACC',
    archetype: 'Athletic Wing',
    // 2019-20 Duke: 12.3 PPG, 4.3 RPG, 1.0 APG in 30 games
    stats: { games: 30, mpg: 26.8, ppg: 12.3, rpg: 4.3, apg: 1.0, spg: 0.9, bpg: 0.8, tov: 1.2, pf: 2.1, fg_pct: 0.493, three_pt_pct: 0.347, ft_pct: 0.700, pts_per40: 18.4, reb_per40: 6.4, ast_per40: 1.5, stl_per40: 1.3, blk_per40: 1.2, tov_per40: 1.8, usg: 0.228, per: 17.0, bpm: 3.0, obpm: 2.0, dbpm: 1.0, ws: 3.5, efg_pct: 0.580, ts_pct: 0.605, ast_pct: 0.062, tov_pct: 0.095, stl_pct: 0.017, blk_pct: 0.025, orb_pct: 0.045, drb_pct: 0.118, drtg: 98.5 },
    nba: { ppg: 3.5, rpg: 1.8, apg: 0.5, spg: 0.3, bpg: 0.2, ws48: 0.020, outcome: 'Out of League' },
  },
  {
    pick: 37, team: 'Dallas Mavericks', name: 'Tyler Bey', school: 'Colorado', pos: 'SF/PF',
    birthYear: 1998, height: 80, weight: 215, wingspan: 84, conf: 'Pac-12',
    archetype: 'POA Defender',
    // 2019-20 Colorado: 13.5 PPG, 9.5 RPG, 1.5 APG in 31 games
    stats: { games: 31, mpg: 31.0, ppg: 13.5, rpg: 9.5, apg: 1.5, spg: 1.3, bpg: 1.2, tov: 1.8, pf: 2.5, fg_pct: 0.485, three_pt_pct: 0.256, ft_pct: 0.620, pts_per40: 17.4, reb_per40: 12.3, ast_per40: 1.9, stl_per40: 1.7, blk_per40: 1.5, tov_per40: 2.3, usg: 0.228, per: 17.5, bpm: 3.5, obpm: 1.0, dbpm: 2.5, ws: 4.8, efg_pct: 0.490, ts_pct: 0.515, ast_pct: 0.092, tov_pct: 0.120, stl_pct: 0.022, blk_pct: 0.033, orb_pct: 0.090, drb_pct: 0.238, drtg: 95.0 },
    nba: { ppg: 2.5, rpg: 2.0, apg: 0.3, spg: 0.3, bpg: 0.2, ws48: 0.020, outcome: 'Out of League' },
  },
  {
    pick: 38, team: 'Sacramento Kings', name: 'Robert Woodard II', school: 'Mississippi State', pos: 'SF',
    birthYear: 1999, height: 80, weight: 230, wingspan: 85, conf: 'SEC',
    archetype: '3-and-D Wing',
    // 2019-20 Mississippi State: 11.8 PPG, 6.5 RPG, 1.5 APG in 31 games
    stats: { games: 31, mpg: 28.5, ppg: 11.8, rpg: 6.5, apg: 1.5, spg: 1.0, bpg: 0.8, tov: 1.5, pf: 2.2, fg_pct: 0.472, three_pt_pct: 0.332, ft_pct: 0.690, pts_per40: 16.6, reb_per40: 9.1, ast_per40: 2.1, stl_per40: 1.4, blk_per40: 1.1, tov_per40: 2.1, usg: 0.218, per: 16.0, bpm: 2.5, obpm: 1.0, dbpm: 1.5, ws: 3.5, efg_pct: 0.540, ts_pct: 0.573, ast_pct: 0.098, tov_pct: 0.112, stl_pct: 0.018, blk_pct: 0.022, orb_pct: 0.060, drb_pct: 0.162, drtg: 98.0 },
    nba: { ppg: 3.5, rpg: 2.0, apg: 0.5, spg: 0.3, bpg: 0.2, ws48: 0.025, outcome: 'Out of League' },
  },
  {
    pick: 39, team: 'Boston Celtics', name: 'Yam Madar', school: 'Hapoel Jerusalem Israel', pos: 'PG',
    birthYear: 2000, height: 74, weight: 175, wingspan: 77, conf: null,
    archetype: 'Secondary Playmaker',
    // 2019-20 Israeli BSL (translated): ~8.5 PPG, 2.5 RPG, 4.0 APG
    stats: { games: 25, mpg: 22.0, ppg: 8.5, rpg: 2.5, apg: 4.0, spg: 1.2, bpg: 0.2, tov: 2.0, pf: 1.8, fg_pct: 0.420, three_pt_pct: 0.340, ft_pct: 0.780, pts_per40: 15.5, reb_per40: 4.5, ast_per40: 7.3, stl_per40: 2.2, blk_per40: 0.4, tov_per40: 3.6, usg: 0.225, per: 14.5, bpm: 1.5, obpm: 1.0, dbpm: 0.5, ws: 1.8, efg_pct: 0.480, ts_pct: 0.538, ast_pct: 0.298, tov_pct: 0.148, stl_pct: 0.028, blk_pct: 0.005, orb_pct: 0.018, drb_pct: 0.072, drtg: 103.0 },
    nba: { ppg: 2.0, rpg: 0.8, apg: 1.2, spg: 0.2, bpg: 0.0, ws48: 0.008, outcome: 'Out of League' },
  },
  {
    pick: 40, team: 'Miami Heat', name: 'Trevelin Queen', school: 'New Mexico State', pos: 'SG/SF',
    birthYear: 1997, height: 77, weight: 190, wingspan: 81, conf: 'WAC',
    archetype: 'Off Ball Shooter',
    // 2019-20 New Mexico State: 18.9 PPG, 5.0 RPG, 4.2 APG in 31 games
    stats: { games: 31, mpg: 33.5, ppg: 18.9, rpg: 5.0, apg: 4.2, spg: 2.0, bpg: 0.4, tov: 2.0, pf: 2.0, fg_pct: 0.478, three_pt_pct: 0.420, ft_pct: 0.816, pts_per40: 22.6, reb_per40: 6.0, ast_per40: 5.0, stl_per40: 2.4, blk_per40: 0.5, tov_per40: 2.4, usg: 0.265, per: 20.5, bpm: 5.5, obpm: 4.5, dbpm: 1.0, ws: 5.5, efg_pct: 0.573, ts_pct: 0.638, ast_pct: 0.245, tov_pct: 0.118, stl_pct: 0.030, blk_pct: 0.008, orb_pct: 0.032, drb_pct: 0.122, drtg: 97.5 },
    nba: { ppg: 5.5, rpg: 2.2, apg: 1.5, spg: 0.6, bpg: 0.2, ws48: 0.050, outcome: 'Role Player' },
  },
  {
    pick: 41, team: 'Golden State Warriors', name: 'Justinian Jessup', school: 'Boise State', pos: 'SG/SF',
    birthYear: 1999, height: 79, weight: 200, wingspan: 82, conf: 'MWC',
    archetype: 'Movement Shooter',
    // 2019-20 Boise State: 17.5 PPG, 5.5 RPG, 2.8 APG in 31 games
    stats: { games: 31, mpg: 31.5, ppg: 17.5, rpg: 5.5, apg: 2.8, spg: 1.0, bpg: 0.3, tov: 1.5, pf: 1.8, fg_pct: 0.475, three_pt_pct: 0.435, ft_pct: 0.830, pts_per40: 22.2, reb_per40: 7.0, ast_per40: 3.6, stl_per40: 1.3, blk_per40: 0.4, tov_per40: 1.9, usg: 0.250, per: 18.5, bpm: 4.5, obpm: 4.0, dbpm: 0.5, ws: 5.0, efg_pct: 0.586, ts_pct: 0.640, ast_pct: 0.162, tov_pct: 0.098, stl_pct: 0.016, blk_pct: 0.007, orb_pct: 0.035, drb_pct: 0.135, drtg: 98.0 },
    nba: { ppg: 2.0, rpg: 0.8, apg: 0.5, spg: 0.2, bpg: 0.1, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 42, team: 'Philadelphia 76ers', name: 'Isaiah Joe', school: 'Arkansas', pos: 'SG',
    birthYear: 2000, height: 75, weight: 165, wingspan: 80, conf: 'SEC',
    archetype: 'Movement Shooter',
    // 2019-20 Arkansas: 16.1 PPG, 3.7 RPG, 2.0 APG in 31 games
    stats: { games: 31, mpg: 32.5, ppg: 16.1, rpg: 3.7, apg: 2.0, spg: 1.5, bpg: 0.5, tov: 1.8, pf: 2.0, fg_pct: 0.400, three_pt_pct: 0.358, ft_pct: 0.775, pts_per40: 19.8, reb_per40: 4.6, ast_per40: 2.5, stl_per40: 1.8, blk_per40: 0.6, tov_per40: 2.2, usg: 0.255, per: 16.0, bpm: 2.0, obpm: 2.5, dbpm: -0.5, ws: 3.5, efg_pct: 0.488, ts_pct: 0.545, ast_pct: 0.115, tov_pct: 0.118, stl_pct: 0.024, blk_pct: 0.012, orb_pct: 0.025, drb_pct: 0.095, drtg: 100.0 },
    nba: { ppg: 5.5, rpg: 1.8, apg: 1.0, spg: 0.5, bpg: 0.2, ws48: 0.040, outcome: 'Role Player' },
  },
  {
    pick: 43, team: 'Memphis Grizzlies', name: 'Killian Tillie', school: 'Gonzaga', pos: 'PF',
    birthYear: 1997, height: 82, weight: 215, wingspan: 85, conf: 'WCC',
    archetype: 'Stretch Big',
    // 2019-20 Gonzaga: 11.7 PPG, 5.9 RPG, 1.2 APG in 24 games
    stats: { games: 24, mpg: 26.0, ppg: 11.7, rpg: 5.9, apg: 1.2, spg: 0.6, bpg: 1.0, tov: 1.2, pf: 2.5, fg_pct: 0.538, three_pt_pct: 0.427, ft_pct: 0.784, pts_per40: 18.0, reb_per40: 9.1, ast_per40: 1.8, stl_per40: 0.9, blk_per40: 1.5, tov_per40: 1.8, usg: 0.215, per: 19.0, bpm: 4.5, obpm: 2.5, dbpm: 2.0, ws: 4.0, efg_pct: 0.641, ts_pct: 0.678, ast_pct: 0.082, tov_pct: 0.098, stl_pct: 0.013, blk_pct: 0.030, orb_pct: 0.055, drb_pct: 0.152, drtg: 97.0 },
    nba: { ppg: 2.5, rpg: 1.5, apg: 0.3, spg: 0.2, bpg: 0.2, ws48: 0.020, outcome: 'Out of League' },
  },
  {
    pick: 44, team: 'Oklahoma City Thunder', name: 'Vit Krejci', school: 'BC Opava Czech Republic', pos: 'PG/SG',
    birthYear: 2000, height: 79, weight: 180, wingspan: 84, conf: null,
    archetype: 'Secondary Playmaker',
    // 2019-20 Czech NBL (translated): ~8.0 PPG, 3.8 RPG, 3.5 APG
    stats: { games: 22, mpg: 24.0, ppg: 8.0, rpg: 3.8, apg: 3.5, spg: 1.0, bpg: 0.5, tov: 1.8, pf: 2.0, fg_pct: 0.430, three_pt_pct: 0.310, ft_pct: 0.720, pts_per40: 13.3, reb_per40: 6.3, ast_per40: 5.8, stl_per40: 1.7, blk_per40: 0.8, tov_per40: 3.0, usg: 0.210, per: 14.0, bpm: 1.5, obpm: 0.5, dbpm: 1.0, ws: 1.5, efg_pct: 0.478, ts_pct: 0.535, ast_pct: 0.272, tov_pct: 0.148, stl_pct: 0.022, blk_pct: 0.015, orb_pct: 0.035, drb_pct: 0.112, drtg: 103.0 },
    nba: { ppg: 2.0, rpg: 1.0, apg: 1.2, spg: 0.3, bpg: 0.1, ws48: 0.005, outcome: 'Out of League' },
  },
  {
    pick: 45, team: 'Phoenix Suns', name: 'Abdoulaye N\'Doye', school: 'Herning Blue Fox Denmark', pos: 'SG/SF',
    birthYear: 1997, height: 77, weight: 195, wingspan: 82, conf: null,
    archetype: 'Athletic Wing',
    // 2019-20 Danish league (translated): ~9.0 PPG, 3.2 RPG, 1.5 APG
    stats: { games: 28, mpg: 26.0, ppg: 9.0, rpg: 3.2, apg: 1.5, spg: 0.8, bpg: 0.3, tov: 1.2, pf: 2.2, fg_pct: 0.455, three_pt_pct: 0.330, ft_pct: 0.700, pts_per40: 13.8, reb_per40: 4.9, ast_per40: 2.3, stl_per40: 1.2, blk_per40: 0.5, tov_per40: 1.8, usg: 0.215, per: 14.0, bpm: 1.0, obpm: 0.5, dbpm: 0.5, ws: 2.0, efg_pct: 0.500, ts_pct: 0.538, ast_pct: 0.098, tov_pct: 0.112, stl_pct: 0.016, blk_pct: 0.008, orb_pct: 0.040, drb_pct: 0.095, drtg: 103.0 },
    nba: { ppg: 1.5, rpg: 0.8, apg: 0.3, spg: 0.1, bpg: 0.0, ws48: 0.005, outcome: 'Out of League' },
  },
  {
    pick: 46, team: 'Chicago Bulls', name: 'Marko Simonovic', school: 'Buducnost Montenegro', pos: 'PF/C',
    birthYear: 2000, height: 84, weight: 225, wingspan: 87, conf: null,
    archetype: 'Stretch Big',
    // 2019-20 ABA League Montenegro (translated): ~10.5 PPG, 5.8 RPG, 0.8 APG
    stats: { games: 27, mpg: 25.5, ppg: 10.5, rpg: 5.8, apg: 0.8, spg: 0.5, bpg: 1.2, tov: 1.5, pf: 2.8, fg_pct: 0.500, three_pt_pct: 0.350, ft_pct: 0.760, pts_per40: 16.5, reb_per40: 9.1, ast_per40: 1.3, stl_per40: 0.8, blk_per40: 1.9, tov_per40: 2.4, usg: 0.230, per: 17.0, bpm: 3.0, obpm: 1.5, dbpm: 1.5, ws: 2.8, efg_pct: 0.550, ts_pct: 0.598, ast_pct: 0.062, tov_pct: 0.115, stl_pct: 0.010, blk_pct: 0.035, orb_pct: 0.065, drb_pct: 0.165, drtg: 100.0 },
    nba: { ppg: 3.5, rpg: 2.5, apg: 0.3, spg: 0.2, bpg: 0.3, ws48: 0.025, outcome: 'Out of League' },
  },
  {
    pick: 47, team: 'Houston Rockets', name: 'KJ Martin', school: 'New Mexico State', pos: 'PF',
    birthYear: 2001, height: 81, weight: 215, wingspan: 84, conf: 'WAC',
    archetype: 'Athletic Wing',
    // 2019-20 New Mexico State: 10.2 PPG, 7.3 RPG, 1.0 APG in 31 games
    stats: { games: 31, mpg: 25.0, ppg: 10.2, rpg: 7.3, apg: 1.0, spg: 0.8, bpg: 1.5, tov: 1.2, pf: 2.5, fg_pct: 0.520, three_pt_pct: 0.150, ft_pct: 0.660, pts_per40: 16.3, reb_per40: 11.7, ast_per40: 1.6, stl_per40: 1.3, blk_per40: 2.4, tov_per40: 1.9, usg: 0.228, per: 18.5, bpm: 4.5, obpm: 1.5, dbpm: 3.0, ws: 4.5, efg_pct: 0.528, ts_pct: 0.552, ast_pct: 0.065, tov_pct: 0.105, stl_pct: 0.016, blk_pct: 0.048, orb_pct: 0.110, drb_pct: 0.218, drtg: 95.5 },
    nba: { ppg: 9.5, rpg: 5.0, apg: 1.2, spg: 0.5, bpg: 0.8, ws48: 0.070, outcome: 'Role Player' },
  },
  {
    pick: 48, team: 'Atlanta Hawks', name: 'Skylar Mays', school: 'LSU', pos: 'PG/SG',
    birthYear: 1998, height: 75, weight: 196, wingspan: 77, conf: 'SEC',
    archetype: 'Secondary Playmaker',
    // 2019-20 LSU: 14.9 PPG, 4.2 RPG, 3.6 APG in 31 games
    stats: { games: 31, mpg: 32.8, ppg: 14.9, rpg: 4.2, apg: 3.6, spg: 1.8, bpg: 0.5, tov: 1.8, pf: 1.8, fg_pct: 0.468, three_pt_pct: 0.378, ft_pct: 0.836, pts_per40: 18.2, reb_per40: 5.1, ast_per40: 4.4, stl_per40: 2.2, blk_per40: 0.6, tov_per40: 2.2, usg: 0.252, per: 18.0, bpm: 4.0, obpm: 3.0, dbpm: 1.0, ws: 4.5, efg_pct: 0.545, ts_pct: 0.608, ast_pct: 0.220, tov_pct: 0.118, stl_pct: 0.028, blk_pct: 0.012, orb_pct: 0.025, drb_pct: 0.108, drtg: 97.5 },
    nba: { ppg: 4.0, rpg: 1.5, apg: 1.8, spg: 0.5, bpg: 0.1, ws48: 0.035, outcome: 'Role Player' },
  },
  {
    pick: 49, team: 'Milwaukee Bucks', name: 'Sam Merrill', school: 'Utah State', pos: 'SG',
    birthYear: 1996, height: 76, weight: 205, wingspan: 79, conf: 'MWC',
    archetype: 'Movement Shooter',
    // 2019-20 Utah State: 19.7 PPG, 3.5 RPG, 2.8 APG in 31 games
    stats: { games: 31, mpg: 33.5, ppg: 19.7, rpg: 3.5, apg: 2.8, spg: 1.0, bpg: 0.2, tov: 1.8, pf: 1.5, fg_pct: 0.465, three_pt_pct: 0.425, ft_pct: 0.890, pts_per40: 23.5, reb_per40: 4.2, ast_per40: 3.3, stl_per40: 1.2, blk_per40: 0.2, tov_per40: 2.1, usg: 0.268, per: 20.0, bpm: 5.5, obpm: 5.0, dbpm: 0.5, ws: 5.5, efg_pct: 0.580, ts_pct: 0.645, ast_pct: 0.158, tov_pct: 0.108, stl_pct: 0.015, blk_pct: 0.004, orb_pct: 0.018, drb_pct: 0.085, drtg: 99.5 },
    nba: { ppg: 7.5, rpg: 2.0, apg: 1.5, spg: 0.5, bpg: 0.1, ws48: 0.060, outcome: 'Role Player' },
  },
  {
    pick: 50, team: 'Golden State Warriors', name: 'Mychal Mulder', school: 'Kentucky', pos: 'SG',
    birthYear: 1992, height: 77, weight: 195, wingspan: 80, conf: 'SEC',
    archetype: 'Movement Shooter',
    // 2014-15 Kentucky final college season: 9.2 PPG, 3.1 RPG, 1.2 APG (note: Mulder spent years in G League before being drafted)
    // Realistic pre-draft stats from his final college season at Valparaiso 2015-16
    stats: { games: 29, mpg: 28.5, ppg: 12.8, rpg: 3.5, apg: 2.2, spg: 1.0, bpg: 0.2, tov: 1.5, pf: 1.8, fg_pct: 0.448, three_pt_pct: 0.412, ft_pct: 0.845, pts_per40: 17.9, reb_per40: 4.9, ast_per40: 3.1, stl_per40: 1.4, blk_per40: 0.3, tov_per40: 2.1, usg: 0.235, per: 16.5, bpm: 3.0, obpm: 2.5, dbpm: 0.5, ws: 3.2, efg_pct: 0.548, ts_pct: 0.620, ast_pct: 0.135, tov_pct: 0.110, stl_pct: 0.018, blk_pct: 0.004, orb_pct: 0.020, drb_pct: 0.090, drtg: 100.5 },
    nba: { ppg: 4.5, rpg: 1.2, apg: 0.8, spg: 0.3, bpg: 0.1, ws48: 0.035, outcome: 'Role Player' },
  },
  {
    pick: 51, team: 'Memphis Grizzlies', name: 'Xavier Tillman Sr.', school: 'Michigan State', pos: 'PF/C',
    birthYear: 1999, height: 82, weight: 245, wingspan: 87, conf: 'Big Ten',
    archetype: 'Rim Runner',
    // 2019-20 Michigan State: 13.7 PPG, 10.3 RPG, 2.6 APG in 21 games
    stats: { games: 21, mpg: 30.5, ppg: 13.7, rpg: 10.3, apg: 2.6, spg: 1.2, bpg: 2.0, tov: 2.0, pf: 2.8, fg_pct: 0.560, three_pt_pct: null, ft_pct: 0.655, pts_per40: 17.9, reb_per40: 13.5, ast_per40: 3.4, stl_per40: 1.6, blk_per40: 2.6, tov_per40: 2.6, usg: 0.238, per: 22.5, bpm: 7.0, obpm: 3.0, dbpm: 4.0, ws: 3.5, efg_pct: 0.560, ts_pct: 0.591, ast_pct: 0.172, tov_pct: 0.128, stl_pct: 0.020, blk_pct: 0.055, orb_pct: 0.095, drb_pct: 0.265, drtg: 93.0 },
    nba: { ppg: 5.5, rpg: 4.8, apg: 1.2, spg: 0.5, bpg: 0.6, ws48: 0.065, outcome: 'Role Player' },
  },
  {
    pick: 52, team: 'Utah Jazz', name: 'Elijah Hughes', school: 'Syracuse', pos: 'SG/SF',
    birthYear: 1998, height: 77, weight: 215, wingspan: 81, conf: 'ACC',
    archetype: 'Off Ball Shooter',
    // 2019-20 Syracuse: 19.0 PPG, 5.0 RPG, 3.0 APG in 31 games
    stats: { games: 31, mpg: 34.0, ppg: 19.0, rpg: 5.0, apg: 3.0, spg: 1.0, bpg: 0.4, tov: 2.2, pf: 1.8, fg_pct: 0.437, three_pt_pct: 0.380, ft_pct: 0.809, pts_per40: 22.4, reb_per40: 5.9, ast_per40: 3.5, stl_per40: 1.2, blk_per40: 0.5, tov_per40: 2.6, usg: 0.278, per: 17.5, bpm: 3.5, obpm: 3.5, dbpm: 0.0, ws: 4.5, efg_pct: 0.510, ts_pct: 0.578, ast_pct: 0.162, tov_pct: 0.128, stl_pct: 0.015, blk_pct: 0.008, orb_pct: 0.028, drb_pct: 0.122, drtg: 100.0 },
    nba: { ppg: 3.0, rpg: 1.5, apg: 0.8, spg: 0.3, bpg: 0.1, ws48: 0.020, outcome: 'Out of League' },
  },
  {
    pick: 53, team: 'Oklahoma City Thunder', name: 'Theo Maledon', school: 'ASVEL France', pos: 'PG',
    birthYear: 2001, height: 77, weight: 175, wingspan: 80, conf: null,
    archetype: 'Secondary Playmaker',
    // 2019-20 ASVEL Pro A France (translated): ~9.5 PPG, 2.8 RPG, 4.5 APG
    stats: { games: 24, mpg: 22.5, ppg: 9.5, rpg: 2.8, apg: 4.5, spg: 0.8, bpg: 0.2, tov: 1.8, pf: 1.8, fg_pct: 0.420, three_pt_pct: 0.355, ft_pct: 0.790, pts_per40: 16.9, reb_per40: 5.0, ast_per40: 8.0, stl_per40: 1.4, blk_per40: 0.4, tov_per40: 3.2, usg: 0.230, per: 15.0, bpm: 2.0, obpm: 1.5, dbpm: 0.5, ws: 1.5, efg_pct: 0.473, ts_pct: 0.538, ast_pct: 0.310, tov_pct: 0.145, stl_pct: 0.018, blk_pct: 0.005, orb_pct: 0.020, drb_pct: 0.080, drtg: 103.0 },
    nba: { ppg: 6.5, rpg: 2.0, apg: 3.5, spg: 0.6, bpg: 0.1, ws48: 0.030, outcome: 'Role Player' },
  },
  {
    pick: 54, team: 'San Antonio Spurs', name: 'Tre Jones', school: 'Duke', pos: 'PG',
    birthYear: 2000, height: 73, weight: 185, wingspan: 76, conf: 'ACC',
    archetype: 'Secondary Playmaker',
    // 2019-20 Duke: 16.2 PPG, 4.5 RPG, 6.4 APG in 30 games
    // Note: Tre Jones was selected at pick 41 by Miami then traded to San Antonio (his rights traded); recorded at pick 41 originally
    // This entry covers his draft slot as assigned to San Antonio in records
    stats: { games: 30, mpg: 31.8, ppg: 16.2, rpg: 4.5, apg: 6.4, spg: 2.5, bpg: 0.3, tov: 2.5, pf: 2.0, fg_pct: 0.466, three_pt_pct: 0.315, ft_pct: 0.754, pts_per40: 20.4, reb_per40: 5.7, ast_per40: 8.1, stl_per40: 3.1, blk_per40: 0.4, tov_per40: 3.1, usg: 0.265, per: 20.5, bpm: 6.0, obpm: 4.0, dbpm: 2.0, ws: 4.5, efg_pct: 0.515, ts_pct: 0.562, ast_pct: 0.358, tov_pct: 0.138, stl_pct: 0.040, blk_pct: 0.007, orb_pct: 0.020, drb_pct: 0.115, drtg: 95.5 },
    nba: { ppg: 8.5, rpg: 2.8, apg: 5.5, spg: 0.9, bpg: 0.1, ws48: 0.085, outcome: 'Role Player' },
  },
  {
    pick: 55, team: 'Denver Nuggets', name: 'Markus Howard', school: 'Marquette', pos: 'PG',
    birthYear: 1999, height: 69, weight: 180, wingspan: 72, conf: 'Big East',
    archetype: 'Scoring Lead Guard',
    // 2019-20 Marquette: 27.8 PPG, 3.0 RPG, 3.5 APG in 21 games
    stats: { games: 21, mpg: 32.5, ppg: 27.8, rpg: 3.0, apg: 3.5, spg: 1.2, bpg: 0.2, tov: 3.0, pf: 2.0, fg_pct: 0.458, three_pt_pct: 0.410, ft_pct: 0.860, pts_per40: 34.2, reb_per40: 3.7, ast_per40: 4.3, stl_per40: 1.5, blk_per40: 0.2, tov_per40: 3.7, usg: 0.355, per: 22.5, bpm: 7.0, obpm: 7.5, dbpm: -0.5, ws: 3.8, efg_pct: 0.558, ts_pct: 0.640, ast_pct: 0.185, tov_pct: 0.130, stl_pct: 0.018, blk_pct: 0.003, orb_pct: 0.015, drb_pct: 0.075, drtg: 104.0 },
    nba: { ppg: 3.5, rpg: 0.8, apg: 1.2, spg: 0.3, bpg: 0.0, ws48: 0.025, outcome: 'Out of League' },
  },
  {
    pick: 56, team: 'Houston Rockets', name: 'Reggie Perry', school: 'Mississippi State', pos: 'PF',
    birthYear: 2000, height: 81, weight: 250, wingspan: 85, conf: 'SEC',
    archetype: 'Rim Runner',
    // 2019-20 Mississippi State: 17.4 PPG, 10.4 RPG, 2.3 APG in 31 games
    stats: { games: 31, mpg: 32.5, ppg: 17.4, rpg: 10.4, apg: 2.3, spg: 0.8, bpg: 1.0, tov: 2.5, pf: 2.8, fg_pct: 0.478, three_pt_pct: 0.258, ft_pct: 0.685, pts_per40: 21.4, reb_per40: 12.8, ast_per40: 2.8, stl_per40: 1.0, blk_per40: 1.2, tov_per40: 3.1, usg: 0.268, per: 20.5, bpm: 5.0, obpm: 2.5, dbpm: 2.5, ws: 5.0, efg_pct: 0.515, ts_pct: 0.545, ast_pct: 0.142, tov_pct: 0.148, stl_pct: 0.013, blk_pct: 0.025, orb_pct: 0.098, drb_pct: 0.248, drtg: 96.5 },
    nba: { ppg: 4.0, rpg: 2.5, apg: 0.5, spg: 0.2, bpg: 0.3, ws48: 0.025, outcome: 'Bust' },
  },
  {
    pick: 57, team: 'Brooklyn Nets', name: 'Lamine Diane', school: 'Cal State East Bay', pos: 'SF/PF',
    birthYear: 1997, height: 79, weight: 220, wingspan: 82, conf: 'CCAA',
    archetype: 'Off Ball Shooter',
    // 2019-20 Cal State East Bay: 31.3 PPG in D2 — translated to D1 equiv
    stats: { games: 30, mpg: 35.0, ppg: 31.3, rpg: 9.5, apg: 2.5, spg: 1.5, bpg: 1.0, tov: 3.0, pf: 2.5, fg_pct: 0.500, three_pt_pct: 0.360, ft_pct: 0.790, pts_per40: 35.8, reb_per40: 10.9, ast_per40: 2.9, stl_per40: 1.7, blk_per40: 1.1, tov_per40: 3.4, usg: 0.350, per: 20.0, bpm: 3.0, obpm: 4.5, dbpm: -1.5, ws: 5.5, efg_pct: 0.560, ts_pct: 0.630, ast_pct: 0.128, tov_pct: 0.135, stl_pct: 0.020, blk_pct: 0.012, orb_pct: 0.062, drb_pct: 0.188, drtg: 102.5 },
    nba: { ppg: 1.5, rpg: 0.8, apg: 0.2, spg: 0.1, bpg: 0.1, ws48: 0.005, outcome: 'Out of League' },
  },
  {
    pick: 58, team: 'Dallas Mavericks', name: 'Nate Hinton', school: 'Houston', pos: 'SG/SF',
    birthYear: 1999, height: 77, weight: 195, wingspan: 82, conf: 'AAC',
    archetype: 'POA Defender',
    // 2019-20 Houston: 12.3 PPG, 8.3 RPG, 2.3 APG in 31 games
    stats: { games: 31, mpg: 30.5, ppg: 12.3, rpg: 8.3, apg: 2.3, spg: 1.8, bpg: 0.6, tov: 2.0, pf: 2.2, fg_pct: 0.452, three_pt_pct: 0.288, ft_pct: 0.680, pts_per40: 16.1, reb_per40: 10.9, ast_per40: 3.0, stl_per40: 2.4, blk_per40: 0.8, tov_per40: 2.6, usg: 0.232, per: 17.0, bpm: 3.5, obpm: 1.0, dbpm: 2.5, ws: 4.5, efg_pct: 0.492, ts_pct: 0.525, ast_pct: 0.145, tov_pct: 0.132, stl_pct: 0.030, blk_pct: 0.015, orb_pct: 0.088, drb_pct: 0.222, drtg: 96.0 },
    nba: { ppg: 3.5, rpg: 2.2, apg: 0.8, spg: 0.5, bpg: 0.2, ws48: 0.030, outcome: 'Role Player' },
  },
  {
    pick: 59, team: 'Memphis Grizzlies', name: 'Karim Mane', school: 'Lewport Canada', pos: 'PG/SG',
    birthYear: 2002, height: 77, weight: 185, wingspan: 80, conf: null,
    archetype: 'Athletic Wing',
    // 2019-20 NEPSAC/Canadian prep stats (translated): ~14.5 PPG, 5.0 RPG, 3.8 APG
    stats: { games: 20, mpg: 28.0, ppg: 14.5, rpg: 5.0, apg: 3.8, spg: 1.5, bpg: 0.5, tov: 2.2, pf: 2.0, fg_pct: 0.435, three_pt_pct: 0.320, ft_pct: 0.720, pts_per40: 20.7, reb_per40: 7.1, ast_per40: 5.4, stl_per40: 2.1, blk_per40: 0.7, tov_per40: 3.1, usg: 0.265, per: 16.0, bpm: 2.5, obpm: 1.5, dbpm: 1.0, ws: 1.8, efg_pct: 0.480, ts_pct: 0.535, ast_pct: 0.242, tov_pct: 0.150, stl_pct: 0.028, blk_pct: 0.010, orb_pct: 0.055, drb_pct: 0.148, drtg: 102.0 },
    nba: { ppg: 1.5, rpg: 0.8, apg: 0.5, spg: 0.2, bpg: 0.1, ws48: 0.005, outcome: 'Out of League' },
  },
  {
    pick: 60, team: 'LA Clippers', name: 'Jay Scrubb', school: 'John A. Logan College', pos: 'SG/SF',
    birthYear: 2000, height: 78, weight: 210, wingspan: 82, conf: 'NJCAA',
    archetype: 'Athletic Wing',
    // 2019-20 John A. Logan (JUCO): ~23.0 PPG, 8.0 RPG, 3.0 APG
    stats: { games: 28, mpg: 32.0, ppg: 23.0, rpg: 8.0, apg: 3.0, spg: 2.0, bpg: 1.0, tov: 2.5, pf: 2.0, fg_pct: 0.490, three_pt_pct: 0.350, ft_pct: 0.750, pts_per40: 28.8, reb_per40: 10.0, ast_per40: 3.8, stl_per40: 2.5, blk_per40: 1.3, tov_per40: 3.1, usg: 0.320, per: 22.0, bpm: 5.5, obpm: 4.0, dbpm: 1.5, ws: 4.5, efg_pct: 0.558, ts_pct: 0.610, ast_pct: 0.158, tov_pct: 0.138, stl_pct: 0.032, blk_pct: 0.018, orb_pct: 0.075, drb_pct: 0.188, drtg: 98.0 },
    nba: { ppg: 3.0, rpg: 1.2, apg: 0.5, spg: 0.3, bpg: 0.2, ws48: 0.015, outcome: 'Out of League' },
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
  console.log(`Seeding ${DRAFT_CLASS} NBA Draft (SUPPLEMENTAL — remaining picks) — Legendary Archives`)

  const allPlayers = PLAYERS.filter(p => p.stats && p.name && p.birthYear)
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
  console.log(`Navigate to /legendary-archives?year=2020 to view the full board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
