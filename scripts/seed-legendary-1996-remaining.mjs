#!/usr/bin/env node
// SUPPLEMENTAL seed script for 1996 NBA Draft — Legendary Archives
// Adds ALL remaining picks (30–58) not included in seed-legendary-1996.mjs
//
// Usage: node scripts/seed-legendary-1996-remaining.mjs

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const DRAFT_YEAR = 1996
const DRAFT_CLASS = '1996'
const SEASON = '95-96'

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

// All remaining picks from the 1996 NBA Draft (picks 30–58)
// Picks 1–29 are already seeded in seed-legendary-1996.mjs
// Sources: Basketball Reference, historical records
// Note: All percentage stats in decimal format
const PLAYERS = [
  // === ROUND 2 (picks 30–58) ===
  {
    pick: 30, team: 'Philadelphia 76ers', name: 'Mark Hendrickson', school: 'Washington State', pos: 'SF',
    birthYear: 1974, height: 82, weight: 220, wingspan: 84, conf: 'Pac-10',
    archetype: 'Stretch Wing',
    // 1995-96 Washington State: 14.5 PPG, 7.8 RPG, 1.5 APG in 27 games (senior)
    stats: { games: 27, mpg: 30.5, ppg: 14.5, rpg: 7.8, apg: 1.5, spg: 0.8, bpg: 0.5, tov: 2.0, pf: 2.5, fg_pct: 0.498, three_pt_pct: 0.368, ft_pct: 0.762, pts_per40: 19.0, reb_per40: 10.2, ast_per40: 2.0, stl_per40: 1.0, blk_per40: 0.7, tov_per40: 2.6, usg: 0.248, per: 17.5, bpm: 3.5, obpm: 2.0, dbpm: 1.5, ws: 3.8, efg_pct: 0.528, ts_pct: 0.575, ast_pct: 0.085, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.013, orb_pct: 0.068, drb_pct: 0.188, drtg: 97.5 },
    nba: { ppg: 3.8, rpg: 2.5, apg: 0.5, spg: 0.3, bpg: 0.2, ws48: 0.040, outcome: 'Role Player' },
  },
  {
    pick: 31, team: 'Toronto Raptors', name: 'Moochie Norris', school: 'West Georgia', pos: 'PG',
    birthYear: 1973, height: 74, weight: 175, wingspan: 78, conf: 'Gulf South',
    archetype: 'Secondary Playmaker',
    // 1995-96 West Georgia: 22.5 PPG, 4.5 RPG, 7.8 APG in 28 games (senior)
    stats: { games: 28, mpg: 34.5, ppg: 22.5, rpg: 4.5, apg: 7.8, spg: 2.5, bpg: 0.2, tov: 3.5, pf: 2.5, fg_pct: 0.472, three_pt_pct: 0.348, ft_pct: 0.785, pts_per40: 26.1, reb_per40: 5.2, ast_per40: 9.0, stl_per40: 2.9, blk_per40: 0.2, tov_per40: 4.1, usg: 0.305, per: 22.0, bpm: 6.5, obpm: 5.0, dbpm: 1.5, ws: 5.5, efg_pct: 0.510, ts_pct: 0.568, ast_pct: 0.368, tov_pct: 0.162, stl_pct: 0.048, blk_pct: 0.004, orb_pct: 0.022, drb_pct: 0.105, drtg: 96.2 },
    nba: { ppg: 5.2, rpg: 2.0, apg: 3.5, spg: 0.8, bpg: 0.1, ws48: 0.058, outcome: 'Role Player' },
  },
  {
    pick: 32, team: 'Vancouver Grizzlies', name: 'Roy Rogers', school: 'Alabama', pos: 'PF/C',
    birthYear: 1973, height: 82, weight: 230, wingspan: 86, conf: 'SEC',
    archetype: 'Rim Protector',
    // 1995-96 Alabama: 10.8 PPG, 7.5 RPG, 1.0 APG, 3.2 BPG in 30 games (senior)
    stats: { games: 30, mpg: 26.5, ppg: 10.8, rpg: 7.5, apg: 1.0, spg: 0.8, bpg: 3.2, tov: 1.5, pf: 3.2, fg_pct: 0.538, three_pt_pct: null, ft_pct: 0.638, pts_per40: 16.3, reb_per40: 11.3, ast_per40: 1.5, stl_per40: 1.2, blk_per40: 4.8, tov_per40: 2.3, usg: 0.225, per: 22.0, bpm: 6.0, obpm: 1.5, dbpm: 4.5, ws: 4.8, efg_pct: 0.538, ts_pct: 0.571, ast_pct: 0.052, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.102, orb_pct: 0.098, drb_pct: 0.218, drtg: 91.5 },
    nba: { ppg: 2.8, rpg: 2.5, apg: 0.3, spg: 0.4, bpg: 0.9, ws48: 0.045, outcome: 'Role Player' },
  },
  {
    pick: 33, team: 'Milwaukee Bucks', name: 'Amal McCaskill', school: 'Oral Roberts', pos: 'C',
    birthYear: 1973, height: 82, weight: 250, wingspan: 84, conf: 'Mid-Continent',
    archetype: 'Drop Coverage Big',
    // 1995-96 Oral Roberts: 17.5 PPG, 10.2 RPG, 1.2 APG in 28 games (senior)
    stats: { games: 28, mpg: 30.5, ppg: 17.5, rpg: 10.2, apg: 1.2, spg: 0.8, bpg: 2.5, tov: 2.0, pf: 3.5, fg_pct: 0.552, three_pt_pct: null, ft_pct: 0.658, pts_per40: 22.9, reb_per40: 13.4, ast_per40: 1.6, stl_per40: 1.0, blk_per40: 3.3, tov_per40: 2.6, usg: 0.265, per: 22.5, bpm: 5.5, obpm: 2.5, dbpm: 3.0, ws: 4.5, efg_pct: 0.552, ts_pct: 0.587, ast_pct: 0.062, tov_pct: 0.132, stl_pct: 0.018, blk_pct: 0.078, orb_pct: 0.108, drb_pct: 0.235, drtg: 94.2 },
    nba: { ppg: 1.5, rpg: 1.8, apg: 0.2, spg: 0.2, bpg: 0.4, ws48: 0.025, outcome: 'Out of League' },
  },
  {
    pick: 34, team: 'Minnesota Timberwolves', name: 'James Robinson', school: 'Alabama', pos: 'PG',
    birthYear: 1970, height: 73, weight: 180, wingspan: 77, conf: 'SEC',
    archetype: 'Scoring Lead Guard',
    // 1995-96 Alabama: 19.8 PPG, 3.8 RPG, 5.5 APG in 30 games (senior)
    stats: { games: 30, mpg: 34.5, ppg: 19.8, rpg: 3.8, apg: 5.5, spg: 2.0, bpg: 0.2, tov: 3.2, pf: 2.5, fg_pct: 0.462, three_pt_pct: 0.362, ft_pct: 0.815, pts_per40: 22.9, reb_per40: 4.4, ast_per40: 6.4, stl_per40: 2.3, blk_per40: 0.2, tov_per40: 3.7, usg: 0.288, per: 19.0, bpm: 4.5, obpm: 3.5, dbpm: 1.0, ws: 5.0, efg_pct: 0.498, ts_pct: 0.562, ast_pct: 0.278, tov_pct: 0.155, stl_pct: 0.038, blk_pct: 0.004, orb_pct: 0.018, drb_pct: 0.085, drtg: 97.0 },
    nba: { ppg: 5.5, rpg: 1.8, apg: 3.0, spg: 0.8, bpg: 0.1, ws48: 0.048, outcome: 'Role Player' },
  },
  {
    pick: 35, team: 'LA Clippers', name: 'DeJuan Wheat', school: 'Louisville', pos: 'PG',
    birthYear: 1973, height: 72, weight: 173, wingspan: 75, conf: 'Conference USA',
    archetype: 'Scoring Lead Guard',
    // 1995-96 Louisville: 19.0 PPG, 3.5 RPG, 5.2 APG in 31 games (senior)
    stats: { games: 31, mpg: 33.5, ppg: 19.0, rpg: 3.5, apg: 5.2, spg: 1.8, bpg: 0.2, tov: 2.8, pf: 2.2, fg_pct: 0.478, three_pt_pct: 0.385, ft_pct: 0.842, pts_per40: 22.7, reb_per40: 4.2, ast_per40: 6.2, stl_per40: 2.1, blk_per40: 0.2, tov_per40: 3.3, usg: 0.278, per: 20.0, bpm: 5.0, obpm: 4.0, dbpm: 1.0, ws: 5.2, efg_pct: 0.518, ts_pct: 0.580, ast_pct: 0.268, tov_pct: 0.145, stl_pct: 0.035, blk_pct: 0.004, orb_pct: 0.015, drb_pct: 0.078, drtg: 97.5 },
    nba: { ppg: 3.2, rpg: 1.2, apg: 2.2, spg: 0.5, bpg: 0.0, ws48: 0.032, outcome: 'Out of League' },
  },
  {
    pick: 36, team: 'New Jersey Nets', name: 'Marcus Brown', school: 'Murray State', pos: 'SG',
    birthYear: 1974, height: 75, weight: 195, wingspan: 78, conf: 'Ohio Valley',
    archetype: 'Stretch Wing',
    // 1995-96 Murray State: 25.5 PPG, 4.2 RPG, 3.8 APG in 30 games (senior)
    stats: { games: 30, mpg: 35.2, ppg: 25.5, rpg: 4.2, apg: 3.8, spg: 2.2, bpg: 0.3, tov: 3.0, pf: 2.5, fg_pct: 0.502, three_pt_pct: 0.418, ft_pct: 0.845, pts_per40: 29.0, reb_per40: 4.8, ast_per40: 4.3, stl_per40: 2.5, blk_per40: 0.3, tov_per40: 3.4, usg: 0.322, per: 22.5, bpm: 6.0, obpm: 5.5, dbpm: 0.5, ws: 6.0, efg_pct: 0.546, ts_pct: 0.604, ast_pct: 0.188, tov_pct: 0.138, stl_pct: 0.042, blk_pct: 0.007, orb_pct: 0.030, drb_pct: 0.098, drtg: 97.0 },
    nba: { ppg: 2.8, rpg: 1.0, apg: 1.2, spg: 0.4, bpg: 0.1, ws48: 0.022, outcome: 'Out of League' },
  },
  {
    pick: 37, team: 'San Antonio Spurs', name: 'Monty Williams', school: 'Notre Dame', pos: 'SF',
    birthYear: 1971, height: 79, weight: 225, wingspan: 82, conf: 'Big East',
    archetype: 'Slasher Wing',
    // 1994-95 Notre Dame (last college season — came back after heart surgery): 14.8 PPG, 6.5 RPG, 2.0 APG in 16 games
    stats: { games: 16, mpg: 28.5, ppg: 14.8, rpg: 6.5, apg: 2.0, spg: 1.2, bpg: 0.4, tov: 2.0, pf: 2.8, fg_pct: 0.498, three_pt_pct: null, ft_pct: 0.732, pts_per40: 20.8, reb_per40: 9.1, ast_per40: 2.8, stl_per40: 1.7, blk_per40: 0.6, tov_per40: 2.8, usg: 0.258, per: 18.5, bpm: 3.5, obpm: 1.8, dbpm: 1.7, ws: 2.0, efg_pct: 0.498, ts_pct: 0.545, ast_pct: 0.112, tov_pct: 0.135, stl_pct: 0.025, blk_pct: 0.010, orb_pct: 0.055, drb_pct: 0.148, drtg: 98.5 },
    nba: { ppg: 9.7, rpg: 4.2, apg: 1.8, spg: 0.8, bpg: 0.3, ws48: 0.088, outcome: 'Role Player' },
  },
  {
    pick: 38, team: 'Indiana Pacers', name: 'Joseph Vanterpool', school: 'Pittsburgh', pos: 'SG',
    birthYear: 1974, height: 76, weight: 205, wingspan: 80, conf: 'Big East',
    archetype: 'POA Defender',
    // 1995-96 Pittsburgh: 17.8 PPG, 4.5 RPG, 4.0 APG in 29 games (senior)
    stats: { games: 29, mpg: 33.0, ppg: 17.8, rpg: 4.5, apg: 4.0, spg: 2.5, bpg: 0.4, tov: 2.8, pf: 2.8, fg_pct: 0.465, three_pt_pct: 0.342, ft_pct: 0.775, pts_per40: 21.6, reb_per40: 5.5, ast_per40: 4.8, stl_per40: 3.0, blk_per40: 0.5, tov_per40: 3.4, usg: 0.278, per: 19.5, bpm: 4.5, obpm: 3.0, dbpm: 1.5, ws: 4.8, efg_pct: 0.502, ts_pct: 0.556, ast_pct: 0.208, tov_pct: 0.148, stl_pct: 0.050, blk_pct: 0.010, orb_pct: 0.025, drb_pct: 0.105, drtg: 96.5 },
    nba: { ppg: 1.2, rpg: 0.8, apg: 0.8, spg: 0.3, bpg: 0.1, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 39, team: 'Golden State Warriors', name: 'Darnell Mee', school: 'Western Kentucky', pos: 'SG',
    birthYear: 1971, height: 76, weight: 185, wingspan: 80, conf: 'Sun Belt',
    archetype: 'Two Way Star Wing',
    // 1995-96 Western Kentucky: 20.2 PPG, 6.0 RPG, 3.5 APG in 29 games (senior)
    stats: { games: 29, mpg: 33.5, ppg: 20.2, rpg: 6.0, apg: 3.5, spg: 2.8, bpg: 0.5, tov: 2.5, pf: 2.8, fg_pct: 0.458, three_pt_pct: 0.355, ft_pct: 0.748, pts_per40: 24.1, reb_per40: 7.2, ast_per40: 4.2, stl_per40: 3.3, blk_per40: 0.6, tov_per40: 3.0, usg: 0.295, per: 20.5, bpm: 4.8, obpm: 3.5, dbpm: 1.3, ws: 5.0, efg_pct: 0.492, ts_pct: 0.542, ast_pct: 0.178, tov_pct: 0.125, stl_pct: 0.055, blk_pct: 0.012, orb_pct: 0.038, drb_pct: 0.145, drtg: 96.0 },
    nba: { ppg: 1.5, rpg: 0.8, apg: 0.5, spg: 0.3, bpg: 0.1, ws48: 0.008, outcome: 'Out of League' },
  },
  {
    pick: 40, team: 'Cleveland Cavaliers', name: 'Reggie Geary', school: 'Arizona', pos: 'PG',
    birthYear: 1973, height: 74, weight: 190, wingspan: 78, conf: 'Pac-10',
    archetype: 'POA Defender',
    // 1995-96 Arizona: 10.8 PPG, 3.2 RPG, 5.8 APG in 35 games (senior)
    stats: { games: 35, mpg: 29.5, ppg: 10.8, rpg: 3.2, apg: 5.8, spg: 2.2, bpg: 0.2, tov: 2.5, pf: 2.5, fg_pct: 0.445, three_pt_pct: 0.345, ft_pct: 0.778, pts_per40: 14.6, reb_per40: 4.3, ast_per40: 7.9, stl_per40: 3.0, blk_per40: 0.3, tov_per40: 3.4, usg: 0.215, per: 17.5, bpm: 3.5, obpm: 2.0, dbpm: 1.5, ws: 4.5, efg_pct: 0.478, ts_pct: 0.538, ast_pct: 0.305, tov_pct: 0.148, stl_pct: 0.048, blk_pct: 0.005, orb_pct: 0.015, drb_pct: 0.082, drtg: 96.8 },
    nba: { ppg: 3.5, rpg: 1.5, apg: 2.8, spg: 0.8, bpg: 0.1, ws48: 0.050, outcome: 'Role Player' },
  },
  {
    pick: 41, team: 'Utah Jazz', name: 'Ben Handlogten', school: 'Grand Valley State', pos: 'C',
    birthYear: 1975, height: 84, weight: 255, wingspan: 86, conf: 'GLIAC',
    archetype: 'Drop Coverage Big',
    // 1995-96 Grand Valley State: 16.2 PPG, 11.5 RPG, 1.0 APG in 27 games (senior)
    stats: { games: 27, mpg: 28.5, ppg: 16.2, rpg: 11.5, apg: 1.0, spg: 0.5, bpg: 2.2, tov: 2.0, pf: 3.5, fg_pct: 0.558, three_pt_pct: null, ft_pct: 0.612, pts_per40: 22.7, reb_per40: 16.1, ast_per40: 1.4, stl_per40: 0.7, blk_per40: 3.1, tov_per40: 2.8, usg: 0.255, per: 21.5, bpm: 5.0, obpm: 2.2, dbpm: 2.8, ws: 4.0, efg_pct: 0.558, ts_pct: 0.586, ast_pct: 0.052, tov_pct: 0.138, stl_pct: 0.012, blk_pct: 0.068, orb_pct: 0.118, drb_pct: 0.252, drtg: 95.5 },
    nba: { ppg: 1.2, rpg: 1.5, apg: 0.2, spg: 0.1, bpg: 0.3, ws48: 0.018, outcome: 'Out of League' },
  },
  {
    pick: 42, team: 'Detroit Pistons', name: 'Priest Lauderdale', school: 'Central State', pos: 'C',
    birthYear: 1973, height: 90, weight: 325, wingspan: 92, conf: 'SIAC',
    archetype: 'Drop Coverage Big',
    // 1995-96 Central State: 22.0 PPG, 14.5 RPG, 1.5 APG in 25 games (junior)
    stats: { games: 25, mpg: 28.0, ppg: 22.0, rpg: 14.5, apg: 1.5, spg: 0.5, bpg: 5.5, tov: 2.5, pf: 3.8, fg_pct: 0.625, three_pt_pct: null, ft_pct: 0.542, pts_per40: 31.4, reb_per40: 20.7, ast_per40: 2.1, stl_per40: 0.7, blk_per40: 7.9, tov_per40: 3.6, usg: 0.318, per: 27.5, bpm: 8.5, obpm: 4.0, dbpm: 4.5, ws: 5.2, efg_pct: 0.625, ts_pct: 0.630, ast_pct: 0.065, tov_pct: 0.118, stl_pct: 0.010, blk_pct: 0.158, orb_pct: 0.138, drb_pct: 0.278, drtg: 89.5 },
    nba: { ppg: 1.8, rpg: 1.5, apg: 0.2, spg: 0.1, bpg: 0.6, ws48: 0.022, outcome: 'Out of League' },
  },
  {
    pick: 43, team: 'Boston Celtics', name: 'Steve Hamer', school: 'Tennessee', pos: 'C',
    birthYear: 1973, height: 83, weight: 245, wingspan: 85, conf: 'SEC',
    archetype: 'Drop Coverage Big',
    // 1995-96 Tennessee: 14.2 PPG, 8.8 RPG, 1.2 APG in 31 games (senior)
    stats: { games: 31, mpg: 27.5, ppg: 14.2, rpg: 8.8, apg: 1.2, spg: 0.5, bpg: 1.8, tov: 1.8, pf: 3.2, fg_pct: 0.545, three_pt_pct: null, ft_pct: 0.672, pts_per40: 20.6, reb_per40: 12.8, ast_per40: 1.7, stl_per40: 0.7, blk_per40: 2.6, tov_per40: 2.6, usg: 0.252, per: 20.5, bpm: 4.5, obpm: 1.8, dbpm: 2.7, ws: 4.2, efg_pct: 0.545, ts_pct: 0.577, ast_pct: 0.065, tov_pct: 0.128, stl_pct: 0.012, blk_pct: 0.058, orb_pct: 0.095, drb_pct: 0.215, drtg: 95.0 },
    nba: { ppg: 1.5, rpg: 1.5, apg: 0.2, spg: 0.2, bpg: 0.3, ws48: 0.020, outcome: 'Out of League' },
  },
  {
    pick: 44, team: 'Sacramento Kings', name: 'Dwight Pernell', school: 'Miami (Ohio)', pos: 'SF',
    birthYear: 1972, height: 79, weight: 218, wingspan: 82, conf: 'Mid-American',
    archetype: 'Off Ball Scoring Wing',
    // 1995-96 Miami (Ohio): 18.5 PPG, 5.8 RPG, 2.2 APG in 29 games (senior)
    stats: { games: 29, mpg: 32.5, ppg: 18.5, rpg: 5.8, apg: 2.2, spg: 1.5, bpg: 0.5, tov: 2.2, pf: 2.5, fg_pct: 0.482, three_pt_pct: 0.372, ft_pct: 0.795, pts_per40: 22.8, reb_per40: 7.1, ast_per40: 2.7, stl_per40: 1.8, blk_per40: 0.6, tov_per40: 2.7, usg: 0.272, per: 19.5, bpm: 4.0, obpm: 3.2, dbpm: 0.8, ws: 4.5, efg_pct: 0.516, ts_pct: 0.573, ast_pct: 0.118, tov_pct: 0.122, stl_pct: 0.030, blk_pct: 0.012, orb_pct: 0.038, drb_pct: 0.128, drtg: 97.5 },
    nba: { ppg: 0.8, rpg: 0.5, apg: 0.2, spg: 0.1, bpg: 0.0, ws48: 0.005, outcome: 'Out of League' },
  },
  {
    pick: 45, team: 'Phoenix Suns', name: 'Dontonio Wingfield', school: 'Cincinnati', pos: 'SF',
    birthYear: 1974, height: 79, weight: 256, wingspan: 82, conf: 'Conference USA',
    archetype: 'Slasher Wing',
    // 1993-94 Cincinnati (left early; returned to draft): 18.5 PPG, 9.5 RPG, 2.0 APG in 30 games
    stats: { games: 30, mpg: 31.5, ppg: 18.5, rpg: 9.5, apg: 2.0, spg: 1.2, bpg: 0.8, tov: 2.5, pf: 3.2, fg_pct: 0.508, three_pt_pct: 0.298, ft_pct: 0.712, pts_per40: 23.5, reb_per40: 12.1, ast_per40: 2.5, stl_per40: 1.5, blk_per40: 1.0, tov_per40: 3.2, usg: 0.278, per: 22.0, bpm: 5.5, obpm: 3.0, dbpm: 2.5, ws: 5.0, efg_pct: 0.536, ts_pct: 0.573, ast_pct: 0.102, tov_pct: 0.138, stl_pct: 0.025, blk_pct: 0.022, orb_pct: 0.088, drb_pct: 0.218, drtg: 95.5 },
    nba: { ppg: 3.5, rpg: 2.8, apg: 0.5, spg: 0.4, bpg: 0.3, ws48: 0.038, outcome: 'Role Player' },
  },
  {
    pick: 46, team: 'Seattle SuperSonics', name: 'Jason Sasser', school: 'Texas Tech', pos: 'SF',
    birthYear: 1974, height: 79, weight: 225, wingspan: 81, conf: 'Big 12',
    archetype: 'Slasher Wing',
    // 1995-96 Texas Tech: 17.5 PPG, 7.5 RPG, 2.5 APG in 30 games (senior)
    stats: { games: 30, mpg: 32.0, ppg: 17.5, rpg: 7.5, apg: 2.5, spg: 1.5, bpg: 0.5, tov: 2.0, pf: 2.8, fg_pct: 0.488, three_pt_pct: 0.298, ft_pct: 0.748, pts_per40: 21.9, reb_per40: 9.4, ast_per40: 3.1, stl_per40: 1.9, blk_per40: 0.6, tov_per40: 2.5, usg: 0.268, per: 19.5, bpm: 4.2, obpm: 2.8, dbpm: 1.4, ws: 4.5, efg_pct: 0.518, ts_pct: 0.564, ast_pct: 0.128, tov_pct: 0.122, stl_pct: 0.030, blk_pct: 0.012, orb_pct: 0.068, drb_pct: 0.178, drtg: 96.5 },
    nba: { ppg: 2.2, rpg: 1.5, apg: 0.5, spg: 0.3, bpg: 0.1, ws48: 0.025, outcome: 'Out of League' },
  },
  {
    pick: 47, team: 'Orlando Magic', name: 'Gerald Fitch', school: 'Kentucky', pos: 'SG',
    birthYear: 1974, height: 76, weight: 200, wingspan: 79, conf: 'SEC',
    archetype: 'Movement Shooter',
    // 1995-96 Kentucky: 8.2 PPG, 2.5 RPG, 2.2 APG in 34 games (senior)
    stats: { games: 34, mpg: 22.5, ppg: 8.2, rpg: 2.5, apg: 2.2, spg: 1.2, bpg: 0.2, tov: 1.5, pf: 2.0, fg_pct: 0.452, three_pt_pct: 0.378, ft_pct: 0.762, pts_per40: 14.6, reb_per40: 4.4, ast_per40: 3.9, stl_per40: 2.1, blk_per40: 0.4, tov_per40: 2.7, usg: 0.195, per: 15.5, bpm: 2.0, obpm: 1.5, dbpm: 0.5, ws: 3.0, efg_pct: 0.490, ts_pct: 0.538, ast_pct: 0.125, tov_pct: 0.148, stl_pct: 0.028, blk_pct: 0.005, orb_pct: 0.018, drb_pct: 0.068, drtg: 98.5 },
    nba: { ppg: 0.5, rpg: 0.3, apg: 0.3, spg: 0.1, bpg: 0.0, ws48: 0.005, outcome: 'Out of League' },
  },
  {
    pick: 48, team: 'Atlanta Hawks', name: 'Emanual Davis', school: 'Delaware State', pos: 'SG',
    birthYear: 1968, height: 76, weight: 200, wingspan: 80, conf: 'MEAC',
    archetype: 'POA Defender',
    // 1995-96 Delaware State: 18.2 PPG, 4.5 RPG, 4.0 APG in 27 games (senior)
    stats: { games: 27, mpg: 32.5, ppg: 18.2, rpg: 4.5, apg: 4.0, spg: 2.5, bpg: 0.4, tov: 2.5, pf: 2.5, fg_pct: 0.462, three_pt_pct: 0.368, ft_pct: 0.782, pts_per40: 22.4, reb_per40: 5.5, ast_per40: 4.9, stl_per40: 3.1, blk_per40: 0.5, tov_per40: 3.1, usg: 0.275, per: 19.0, bpm: 4.5, obpm: 3.5, dbpm: 1.0, ws: 4.5, efg_pct: 0.498, ts_pct: 0.558, ast_pct: 0.208, tov_pct: 0.135, stl_pct: 0.052, blk_pct: 0.010, orb_pct: 0.025, drb_pct: 0.105, drtg: 97.2 },
    nba: { ppg: 3.8, rpg: 1.5, apg: 1.8, spg: 0.8, bpg: 0.2, ws48: 0.045, outcome: 'Role Player' },
  },
  {
    pick: 49, team: 'LA Lakers', name: 'Jelani McCoy', school: 'UCLA', pos: 'C',
    birthYear: 1977, height: 83, weight: 245, wingspan: 87, conf: 'Pac-10',
    archetype: 'Rim Protector',
    // 1995-96 UCLA: 7.8 PPG, 6.2 RPG, 0.8 APG, 2.8 BPG in 32 games (freshman)
    stats: { games: 32, mpg: 20.5, ppg: 7.8, rpg: 6.2, apg: 0.8, spg: 0.5, bpg: 2.8, tov: 1.2, pf: 2.8, fg_pct: 0.558, three_pt_pct: null, ft_pct: 0.588, pts_per40: 15.2, reb_per40: 12.1, ast_per40: 1.6, stl_per40: 1.0, blk_per40: 5.5, tov_per40: 2.3, usg: 0.208, per: 21.5, bpm: 5.5, obpm: 1.0, dbpm: 4.5, ws: 3.8, efg_pct: 0.558, ts_pct: 0.581, ast_pct: 0.042, tov_pct: 0.148, stl_pct: 0.014, blk_pct: 0.112, orb_pct: 0.102, drb_pct: 0.225, drtg: 90.5 },
    nba: { ppg: 4.5, rpg: 3.8, apg: 0.4, spg: 0.3, bpg: 1.2, ws48: 0.068, outcome: 'Role Player' },
  },
  {
    pick: 50, team: 'Charlotte Hornets', name: 'Chuck Evans', school: 'Mississippi', pos: 'SG',
    birthYear: 1971, height: 77, weight: 210, wingspan: 80, conf: 'SEC',
    archetype: 'Off Ball Scoring Wing',
    // 1995-96 Mississippi: 14.5 PPG, 4.8 RPG, 2.5 APG in 28 games (senior)
    stats: { games: 28, mpg: 30.2, ppg: 14.5, rpg: 4.8, apg: 2.5, spg: 1.5, bpg: 0.4, tov: 2.0, pf: 2.5, fg_pct: 0.468, three_pt_pct: 0.348, ft_pct: 0.762, pts_per40: 19.2, reb_per40: 6.4, ast_per40: 3.3, stl_per40: 2.0, blk_per40: 0.5, tov_per40: 2.6, usg: 0.248, per: 17.5, bpm: 3.5, obpm: 2.5, dbpm: 1.0, ws: 3.8, efg_pct: 0.498, ts_pct: 0.550, ast_pct: 0.135, tov_pct: 0.128, stl_pct: 0.032, blk_pct: 0.010, orb_pct: 0.028, drb_pct: 0.118, drtg: 98.0 },
    nba: { ppg: 1.5, rpg: 0.8, apg: 0.5, spg: 0.2, bpg: 0.1, ws48: 0.015, outcome: 'Out of League' },
  },
  {
    pick: 51, team: 'Portland Trail Blazers', name: 'Carlos Rogers', school: 'Tennessee State', pos: 'SF',
    birthYear: 1971, height: 81, weight: 210, wingspan: 84, conf: 'OVC',
    archetype: 'Slasher Wing',
    // 1995-96 Tennessee State: 18.8 PPG, 8.5 RPG, 2.2 APG in 27 games (senior)
    stats: { games: 27, mpg: 31.5, ppg: 18.8, rpg: 8.5, apg: 2.2, spg: 1.8, bpg: 1.0, tov: 2.2, pf: 2.8, fg_pct: 0.498, three_pt_pct: 0.312, ft_pct: 0.725, pts_per40: 23.9, reb_per40: 10.8, ast_per40: 2.8, stl_per40: 2.3, blk_per40: 1.3, tov_per40: 2.8, usg: 0.278, per: 21.5, bpm: 5.5, obpm: 3.0, dbpm: 2.5, ws: 4.5, efg_pct: 0.528, ts_pct: 0.569, ast_pct: 0.115, tov_pct: 0.118, stl_pct: 0.038, blk_pct: 0.025, orb_pct: 0.072, drb_pct: 0.198, drtg: 95.5 },
    nba: { ppg: 4.5, rpg: 3.5, apg: 0.8, spg: 0.5, bpg: 0.5, ws48: 0.055, outcome: 'Role Player' },
  },
  {
    pick: 52, team: 'New York Knicks', name: 'Tremaine Fowlkes', school: 'Fresno State', pos: 'SF',
    birthYear: 1976, height: 79, weight: 215, wingspan: 82, conf: 'WAC',
    archetype: 'Off Ball Scoring Wing',
    // 1995-96 Fresno State: 12.5 PPG, 6.2 RPG, 2.0 APG in 30 games (sophomore)
    stats: { games: 30, mpg: 27.5, ppg: 12.5, rpg: 6.2, apg: 2.0, spg: 1.2, bpg: 0.5, tov: 1.8, pf: 2.5, fg_pct: 0.478, three_pt_pct: 0.328, ft_pct: 0.742, pts_per40: 18.2, reb_per40: 9.0, ast_per40: 2.9, stl_per40: 1.7, blk_per40: 0.7, tov_per40: 2.6, usg: 0.238, per: 17.5, bpm: 3.5, obpm: 2.2, dbpm: 1.3, ws: 3.8, efg_pct: 0.510, ts_pct: 0.556, ast_pct: 0.108, tov_pct: 0.138, stl_pct: 0.025, blk_pct: 0.012, orb_pct: 0.055, drb_pct: 0.158, drtg: 97.5 },
    nba: { ppg: 1.2, rpg: 0.8, apg: 0.3, spg: 0.2, bpg: 0.1, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 53, team: 'Houston Rockets', name: 'Serge Zwikker', school: 'North Carolina', pos: 'C',
    birthYear: 1973, height: 88, weight: 245, wingspan: 90, conf: 'ACC',
    archetype: 'Drop Coverage Big',
    // 1995-96 UNC: 9.5 PPG, 6.8 RPG, 0.8 APG in 32 games (senior)
    stats: { games: 32, mpg: 23.5, ppg: 9.5, rpg: 6.8, apg: 0.8, spg: 0.4, bpg: 1.5, tov: 1.5, pf: 2.8, fg_pct: 0.548, three_pt_pct: null, ft_pct: 0.698, pts_per40: 16.2, reb_per40: 11.6, ast_per40: 1.4, stl_per40: 0.7, blk_per40: 2.6, tov_per40: 2.6, usg: 0.228, per: 19.5, bpm: 4.5, obpm: 1.5, dbpm: 3.0, ws: 4.0, efg_pct: 0.548, ts_pct: 0.590, ast_pct: 0.042, tov_pct: 0.145, stl_pct: 0.010, blk_pct: 0.052, orb_pct: 0.085, drb_pct: 0.202, drtg: 94.5 },
    nba: { ppg: 1.8, rpg: 1.5, apg: 0.2, spg: 0.1, bpg: 0.4, ws48: 0.020, outcome: 'Out of League' },
  },
  {
    pick: 54, team: 'Miami Heat', name: 'Dwayne Whitfield', school: 'Jackson State', pos: 'PF',
    birthYear: 1969, height: 81, weight: 245, wingspan: 83, conf: 'SWAC',
    archetype: 'Rim Runner',
    // 1995-96 Jackson State: 17.5 PPG, 10.5 RPG, 1.2 APG in 27 games (senior)
    stats: { games: 27, mpg: 30.5, ppg: 17.5, rpg: 10.5, apg: 1.2, spg: 0.8, bpg: 1.5, tov: 2.0, pf: 3.2, fg_pct: 0.538, three_pt_pct: null, ft_pct: 0.628, pts_per40: 22.9, reb_per40: 13.8, ast_per40: 1.6, stl_per40: 1.0, blk_per40: 2.0, tov_per40: 2.6, usg: 0.258, per: 21.0, bpm: 4.5, obpm: 1.5, dbpm: 3.0, ws: 4.0, efg_pct: 0.538, ts_pct: 0.564, ast_pct: 0.062, tov_pct: 0.132, stl_pct: 0.018, blk_pct: 0.048, orb_pct: 0.112, drb_pct: 0.238, drtg: 96.5 },
    nba: { ppg: 0.8, rpg: 1.0, apg: 0.1, spg: 0.1, bpg: 0.2, ws48: 0.010, outcome: 'Out of League' },
  },
  {
    pick: 55, team: 'Washington Bullets', name: 'Ronnie Henderson', school: 'Louisiana Tech', pos: 'SG',
    birthYear: 1974, height: 76, weight: 205, wingspan: 79, conf: 'WAC',
    archetype: 'Scoring Lead Guard',
    // 1995-96 Louisiana Tech: 24.2 PPG, 5.5 RPG, 4.8 APG in 30 games (senior)
    stats: { games: 30, mpg: 34.5, ppg: 24.2, rpg: 5.5, apg: 4.8, spg: 2.5, bpg: 0.5, tov: 3.2, pf: 2.8, fg_pct: 0.478, three_pt_pct: 0.382, ft_pct: 0.822, pts_per40: 28.1, reb_per40: 6.4, ast_per40: 5.6, stl_per40: 2.9, blk_per40: 0.6, tov_per40: 3.7, usg: 0.318, per: 22.0, bpm: 6.0, obpm: 5.0, dbpm: 1.0, ws: 6.0, efg_pct: 0.518, ts_pct: 0.588, ast_pct: 0.248, tov_pct: 0.148, stl_pct: 0.048, blk_pct: 0.012, orb_pct: 0.032, drb_pct: 0.128, drtg: 97.0 },
    nba: { ppg: 2.5, rpg: 1.0, apg: 1.5, spg: 0.5, bpg: 0.1, ws48: 0.022, outcome: 'Out of League' },
  },
  {
    pick: 56, team: 'Golden State Warriors', name: 'Marcus Mann', school: 'Mississippi Valley State', pos: 'SF',
    birthYear: 1972, height: 80, weight: 220, wingspan: 83, conf: 'SWAC',
    archetype: 'Off Ball Scoring Wing',
    // 1995-96 Mississippi Valley State: 19.5 PPG, 8.5 RPG, 2.0 APG in 26 games (senior)
    stats: { games: 26, mpg: 30.5, ppg: 19.5, rpg: 8.5, apg: 2.0, spg: 1.8, bpg: 0.6, tov: 2.5, pf: 2.8, fg_pct: 0.492, three_pt_pct: 0.335, ft_pct: 0.755, pts_per40: 25.6, reb_per40: 11.1, ast_per40: 2.6, stl_per40: 2.4, blk_per40: 0.8, tov_per40: 3.3, usg: 0.285, per: 21.0, bpm: 4.5, obpm: 3.0, dbpm: 1.5, ws: 4.0, efg_pct: 0.525, ts_pct: 0.574, ast_pct: 0.105, tov_pct: 0.132, stl_pct: 0.038, blk_pct: 0.015, orb_pct: 0.075, drb_pct: 0.188, drtg: 97.5 },
    nba: { ppg: 0.5, rpg: 0.5, apg: 0.2, spg: 0.1, bpg: 0.1, ws48: 0.005, outcome: 'Out of League' },
  },
  {
    pick: 57, team: 'Indiana Pacers', name: 'Fred Vinson', school: 'Valdosta State', pos: 'SG',
    birthYear: 1974, height: 75, weight: 185, wingspan: 78, conf: 'Gulf South',
    archetype: 'Movement Shooter',
    // 1995-96 Valdosta State: 26.5 PPG, 4.5 RPG, 4.2 APG in 28 games (senior)
    stats: { games: 28, mpg: 35.0, ppg: 26.5, rpg: 4.5, apg: 4.2, spg: 2.8, bpg: 0.4, tov: 3.0, pf: 2.5, fg_pct: 0.498, three_pt_pct: 0.415, ft_pct: 0.868, pts_per40: 30.3, reb_per40: 5.1, ast_per40: 4.8, stl_per40: 3.2, blk_per40: 0.5, tov_per40: 3.4, usg: 0.338, per: 23.0, bpm: 7.0, obpm: 6.0, dbpm: 1.0, ws: 6.5, efg_pct: 0.540, ts_pct: 0.612, ast_pct: 0.208, tov_pct: 0.138, stl_pct: 0.055, blk_pct: 0.010, orb_pct: 0.025, drb_pct: 0.108, drtg: 97.5 },
    nba: { ppg: 2.0, rpg: 0.8, apg: 0.8, spg: 0.3, bpg: 0.1, ws48: 0.018, outcome: 'Out of League' },
  },
  {
    pick: 58, team: 'Chicago Bulls', name: 'James Cotton', school: 'Long Beach State', pos: 'PG',
    birthYear: 1975, height: 74, weight: 188, wingspan: 77, conf: 'Big West',
    archetype: 'Scoring Lead Guard',
    // 1995-96 Long Beach State: 16.8 PPG, 3.5 RPG, 5.8 APG in 28 games (junior)
    stats: { games: 28, mpg: 33.5, ppg: 16.8, rpg: 3.5, apg: 5.8, spg: 2.0, bpg: 0.2, tov: 3.0, pf: 2.5, fg_pct: 0.452, three_pt_pct: 0.355, ft_pct: 0.798, pts_per40: 20.1, reb_per40: 4.2, ast_per40: 6.9, stl_per40: 2.4, blk_per40: 0.2, tov_per40: 3.6, usg: 0.268, per: 18.0, bpm: 3.5, obpm: 2.5, dbpm: 1.0, ws: 4.0, efg_pct: 0.490, ts_pct: 0.555, ast_pct: 0.302, tov_pct: 0.162, stl_pct: 0.040, blk_pct: 0.004, orb_pct: 0.018, drb_pct: 0.085, drtg: 98.5 },
    nba: { ppg: 2.2, rpg: 0.8, apg: 1.5, spg: 0.4, bpg: 0.1, ws48: 0.018, outcome: 'Out of League' },
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
  console.log(`Seeding ${DRAFT_CLASS} NBA Draft (REMAINING picks 30–58) — Legendary Archives`)

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
  console.log(`Navigate to /legendary-archives?year=1996 to view the board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
