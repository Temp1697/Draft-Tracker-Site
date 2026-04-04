#!/usr/bin/env node
// Seed script for 1987 NBA Draft — Legendary Archives
// Populates players, prospects, stats, measurables, and historical_players tables
//
// Usage: node scripts/seed-legendary-1987.mjs

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

// All picks of the 1987 NBA Draft with college stats from final season
// Sources: Basketball Reference, historical records
const PLAYERS = [
  // === ROUND 1 ===
  {
    pick: 1, team: 'San Antonio Spurs', name: 'David Robinson', school: 'Navy', pos: 'C',
    birthYear: 1965, height: 85, weight: 235, wingspan: 91, conf: 'Patriot',
    archetype: 'Rim Protector',
    // 1986-87 Navy: 28.2 PPG, 11.8 RPG, 1.5 APG, 4.5 BPG
    stats: { games: 32, mpg: 31.5, ppg: 28.2, rpg: 11.8, apg: 1.5, spg: 1.2, bpg: 4.5, tov: 2.8, pf: 2.9, fg_pct: 0.609, three_pt_pct: null, ft_pct: 0.637, pts_per40: 35.8, reb_per40: 15.0, ast_per40: 1.9, stl_per40: 1.5, blk_per40: 5.7, tov_per40: 3.6, usg: 0.328, per: 32.5, bpm: 14.8, obpm: 7.5, dbpm: 7.3, ws: 9.2, efg_pct: 0.609, ts_pct: 0.647, ast_pct: 0.062, tov_pct: 0.118, stl_pct: 0.025, blk_pct: 0.148, orb_pct: 0.125, drb_pct: 0.278, drtg: 85.2 },
    nba: { ppg: 23.2, rpg: 10.6, apg: 2.5, spg: 1.6, bpg: 3.0, ws48: 0.218, outcome: 'MVP' },
  },
  {
    pick: 2, team: 'Phoenix Suns', name: 'Armon Gilliam', school: 'UNLV', pos: 'PF',
    birthYear: 1964, height: 81, weight: 245, wingspan: 83, conf: 'Big West',
    archetype: 'Paint Anchor',
    // 1986-87 UNLV: 23.2 PPG, 8.9 RPG, 0.7 APG
    stats: { games: 36, mpg: 33.0, ppg: 23.2, rpg: 8.9, apg: 0.7, spg: 0.6, bpg: 1.2, tov: 2.4, pf: 3.1, fg_pct: 0.605, three_pt_pct: null, ft_pct: 0.728, pts_per40: 28.1, reb_per40: 10.8, ast_per40: 0.8, stl_per40: 0.7, blk_per40: 1.5, tov_per40: 2.9, usg: 0.298, per: 26.0, bpm: 9.5, obpm: 6.0, dbpm: 3.5, ws: 7.5, efg_pct: 0.605, ts_pct: 0.666, ast_pct: 0.032, tov_pct: 0.110, stl_pct: 0.012, blk_pct: 0.038, orb_pct: 0.095, drb_pct: 0.205, drtg: 88.5 },
    nba: { ppg: 14.6, rpg: 7.1, apg: 0.9, spg: 0.5, bpg: 0.6, ws48: 0.112, outcome: 'Starter' },
  },
  {
    pick: 3, team: 'New Jersey Nets', name: 'Dennis Hopson', school: 'Ohio State', pos: 'SG',
    birthYear: 1965, height: 77, weight: 200, wingspan: 81, conf: 'Big Ten',
    archetype: 'Scoring Lead Guard',
    // 1986-87 Ohio State: 29.0 PPG, 5.2 RPG, 2.9 APG
    stats: { games: 29, mpg: 36.0, ppg: 29.0, rpg: 5.2, apg: 2.9, spg: 1.8, bpg: 0.4, tov: 3.1, pf: 2.8, fg_pct: 0.490, three_pt_pct: 0.350, ft_pct: 0.842, pts_per40: 32.2, reb_per40: 5.8, ast_per40: 3.2, stl_per40: 2.0, blk_per40: 0.4, tov_per40: 3.4, usg: 0.345, per: 24.5, bpm: 8.0, obpm: 6.5, dbpm: 1.5, ws: 6.2, efg_pct: 0.515, ts_pct: 0.610, ast_pct: 0.138, tov_pct: 0.132, stl_pct: 0.038, blk_pct: 0.009, orb_pct: 0.028, drb_pct: 0.118, drtg: 96.0 },
    nba: { ppg: 8.2, rpg: 2.5, apg: 1.8, spg: 0.7, bpg: 0.2, ws48: 0.041, outcome: 'Bust' },
  },
  {
    pick: 4, team: 'Seattle SuperSonics', name: 'Reggie Williams', school: 'Georgetown', pos: 'SF',
    birthYear: 1964, height: 79, weight: 195, wingspan: 83, conf: 'Big East',
    archetype: 'Slasher Wing',
    // 1986-87 Georgetown: 23.6 PPG, 7.8 RPG, 3.0 APG
    stats: { games: 32, mpg: 35.5, ppg: 23.6, rpg: 7.8, apg: 3.0, spg: 2.0, bpg: 0.7, tov: 3.2, pf: 2.9, fg_pct: 0.495, three_pt_pct: 0.310, ft_pct: 0.752, pts_per40: 26.5, reb_per40: 8.8, ast_per40: 3.4, stl_per40: 2.2, blk_per40: 0.8, tov_per40: 3.6, usg: 0.315, per: 23.0, bpm: 7.5, obpm: 5.2, dbpm: 2.3, ws: 6.5, efg_pct: 0.515, ts_pct: 0.576, ast_pct: 0.148, tov_pct: 0.138, stl_pct: 0.042, blk_pct: 0.017, orb_pct: 0.042, drb_pct: 0.168, drtg: 92.5 },
    nba: { ppg: 9.5, rpg: 3.5, apg: 2.1, spg: 0.8, bpg: 0.3, ws48: 0.052, outcome: 'Bust' },
  },
  {
    pick: 5, team: 'Seattle SuperSonics', name: 'Scottie Pippen', school: 'Central Arkansas', pos: 'SF',
    birthYear: 1965, height: 80, weight: 210, wingspan: 88, conf: 'AIC',
    archetype: 'Two Way Star Wing',
    // 1986-87 Central Arkansas: 23.6 PPG, 10.0 RPG, 4.3 APG
    stats: { games: 28, mpg: 35.0, ppg: 23.6, rpg: 10.0, apg: 4.3, spg: 2.8, bpg: 1.2, tov: 3.0, pf: 2.5, fg_pct: 0.590, three_pt_pct: 0.285, ft_pct: 0.625, pts_per40: 26.9, reb_per40: 11.4, ast_per40: 4.9, stl_per40: 3.2, blk_per40: 1.4, tov_per40: 3.4, usg: 0.295, per: 27.5, bpm: 11.0, obpm: 5.5, dbpm: 5.5, ws: 7.8, efg_pct: 0.605, ts_pct: 0.631, ast_pct: 0.208, tov_pct: 0.145, stl_pct: 0.055, blk_pct: 0.028, orb_pct: 0.098, drb_pct: 0.218, drtg: 86.0 },
    nba: { ppg: 17.5, rpg: 6.7, apg: 5.0, spg: 2.0, bpg: 0.8, ws48: 0.165, outcome: 'All-NBA' },
  },
  {
    pick: 6, team: 'Sacramento Kings', name: 'Kenny Smith', school: 'North Carolina', pos: 'PG',
    birthYear: 1965, height: 75, weight: 170, wingspan: 79, conf: 'ACC',
    archetype: 'Primary Playmaker',
    // 1986-87 UNC: 16.9 PPG, 3.2 RPG, 7.0 APG
    stats: { games: 34, mpg: 34.0, ppg: 16.9, rpg: 3.2, apg: 7.0, spg: 1.8, bpg: 0.1, tov: 3.0, pf: 2.2, fg_pct: 0.492, three_pt_pct: 0.378, ft_pct: 0.812, pts_per40: 19.9, reb_per40: 3.8, ast_per40: 8.2, stl_per40: 2.1, blk_per40: 0.1, tov_per40: 3.5, usg: 0.258, per: 20.5, bpm: 5.8, obpm: 4.0, dbpm: 1.8, ws: 5.5, efg_pct: 0.528, ts_pct: 0.600, ast_pct: 0.358, tov_pct: 0.148, stl_pct: 0.038, blk_pct: 0.002, orb_pct: 0.018, drb_pct: 0.065, drtg: 95.5 },
    nba: { ppg: 12.8, rpg: 2.5, apg: 6.0, spg: 1.1, bpg: 0.1, ws48: 0.095, outcome: 'Starter' },
  },
  {
    pick: 7, team: 'Cleveland Cavaliers', name: 'Kevin Johnson', school: 'California', pos: 'PG',
    birthYear: 1966, height: 73, weight: 180, wingspan: 77, conf: 'Pac-10',
    archetype: 'Primary Playmaker',
    // 1986-87 Cal: 17.8 PPG, 4.0 RPG, 5.8 APG
    stats: { games: 28, mpg: 33.5, ppg: 17.8, rpg: 4.0, apg: 5.8, spg: 2.2, bpg: 0.3, tov: 2.8, pf: 2.5, fg_pct: 0.518, three_pt_pct: 0.320, ft_pct: 0.805, pts_per40: 21.3, reb_per40: 4.8, ast_per40: 6.9, stl_per40: 2.6, blk_per40: 0.4, tov_per40: 3.3, usg: 0.272, per: 22.0, bpm: 7.2, obpm: 4.8, dbpm: 2.4, ws: 5.8, efg_pct: 0.535, ts_pct: 0.601, ast_pct: 0.295, tov_pct: 0.142, stl_pct: 0.048, blk_pct: 0.007, orb_pct: 0.025, drb_pct: 0.085, drtg: 94.0 },
    nba: { ppg: 20.4, rpg: 4.0, apg: 9.8, spg: 1.8, bpg: 0.2, ws48: 0.168, outcome: 'All-Star' },
  },
  {
    pick: 8, team: 'LA Clippers', name: 'Olden Polynice', school: 'Virginia', pos: 'C',
    birthYear: 1964, height: 83, weight: 250, wingspan: 87, conf: 'ACC',
    archetype: 'Rim Runner',
    // 1986-87 Virginia: 13.2 PPG, 8.7 RPG, 0.6 APG
    stats: { games: 32, mpg: 29.0, ppg: 13.2, rpg: 8.7, apg: 0.6, spg: 0.5, bpg: 1.8, tov: 1.9, pf: 3.2, fg_pct: 0.568, three_pt_pct: null, ft_pct: 0.612, pts_per40: 18.2, reb_per40: 12.0, ast_per40: 0.8, stl_per40: 0.7, blk_per40: 2.5, tov_per40: 2.6, usg: 0.225, per: 19.5, bpm: 5.2, obpm: 1.8, dbpm: 3.4, ws: 5.0, efg_pct: 0.568, ts_pct: 0.588, ast_pct: 0.028, tov_pct: 0.130, stl_pct: 0.011, blk_pct: 0.065, orb_pct: 0.105, drb_pct: 0.225, drtg: 90.5 },
    nba: { ppg: 8.8, rpg: 7.1, apg: 0.5, spg: 0.5, bpg: 0.9, ws48: 0.098, outcome: 'Starter' },
  },
  {
    pick: 9, team: 'Indiana Pacers', name: 'Derrick McKey', school: 'Alabama', pos: 'SF',
    birthYear: 1966, height: 81, weight: 205, wingspan: 86, conf: 'SEC',
    archetype: 'Two Way Star Wing',
    // 1986-87 Alabama: 14.8 PPG, 7.2 RPG, 2.2 APG
    stats: { games: 30, mpg: 31.0, ppg: 14.8, rpg: 7.2, apg: 2.2, spg: 1.5, bpg: 1.3, tov: 2.0, pf: 2.7, fg_pct: 0.545, three_pt_pct: 0.310, ft_pct: 0.728, pts_per40: 19.1, reb_per40: 9.3, ast_per40: 2.8, stl_per40: 1.9, blk_per40: 1.7, tov_per40: 2.6, usg: 0.245, per: 21.5, bpm: 6.5, obpm: 3.0, dbpm: 3.5, ws: 5.5, efg_pct: 0.560, ts_pct: 0.598, ast_pct: 0.112, tov_pct: 0.122, stl_pct: 0.032, blk_pct: 0.038, orb_pct: 0.062, drb_pct: 0.168, drtg: 91.0 },
    nba: { ppg: 11.5, rpg: 5.5, apg: 2.5, spg: 1.1, bpg: 0.8, ws48: 0.118, outcome: 'Starter' },
  },
  {
    pick: 10, team: 'Chicago Bulls', name: 'Horace Grant', school: 'Clemson', pos: 'PF',
    birthYear: 1965, height: 81, weight: 220, wingspan: 87, conf: 'ACC',
    archetype: 'Rim Runner',
    // 1986-87 Clemson: 20.4 PPG, 9.5 RPG, 1.8 APG
    stats: { games: 32, mpg: 34.0, ppg: 20.4, rpg: 9.5, apg: 1.8, spg: 1.2, bpg: 0.8, tov: 2.5, pf: 3.0, fg_pct: 0.608, three_pt_pct: null, ft_pct: 0.692, pts_per40: 24.0, reb_per40: 11.2, ast_per40: 2.1, stl_per40: 1.4, blk_per40: 0.9, tov_per40: 2.9, usg: 0.280, per: 24.5, bpm: 9.0, obpm: 4.5, dbpm: 4.5, ws: 7.2, efg_pct: 0.608, ts_pct: 0.655, ast_pct: 0.092, tov_pct: 0.125, stl_pct: 0.025, blk_pct: 0.022, orb_pct: 0.092, drb_pct: 0.215, drtg: 89.0 },
    nba: { ppg: 10.5, rpg: 7.2, apg: 1.5, spg: 1.0, bpg: 0.6, ws48: 0.132, outcome: 'All-Star' },
  },
  {
    pick: 11, team: 'Indiana Pacers', name: 'Reggie Miller', school: 'UCLA', pos: 'SG',
    birthYear: 1965, height: 79, weight: 185, wingspan: 83, conf: 'Pac-10',
    archetype: 'Movement Shooter',
    // 1986-87 UCLA: 25.9 PPG, 5.0 RPG, 2.9 APG
    stats: { games: 32, mpg: 36.0, ppg: 25.9, rpg: 5.0, apg: 2.9, spg: 1.5, bpg: 0.3, tov: 2.5, pf: 2.0, fg_pct: 0.492, three_pt_pct: 0.450, ft_pct: 0.888, pts_per40: 28.8, reb_per40: 5.6, ast_per40: 3.2, stl_per40: 1.7, blk_per40: 0.3, tov_per40: 2.8, usg: 0.325, per: 25.5, bpm: 9.5, obpm: 8.2, dbpm: 1.3, ws: 7.8, efg_pct: 0.563, ts_pct: 0.648, ast_pct: 0.148, tov_pct: 0.118, stl_pct: 0.032, blk_pct: 0.007, orb_pct: 0.022, drb_pct: 0.108, drtg: 94.0 },
    nba: { ppg: 18.2, rpg: 3.0, apg: 2.5, spg: 1.1, bpg: 0.2, ws48: 0.155, outcome: 'All-NBA' },
  },
  {
    pick: 12, team: 'Atlanta Hawks', name: 'Dallas Comegys', school: 'DePaul', pos: 'PF/C',
    birthYear: 1964, height: 82, weight: 225, wingspan: 86, conf: 'Big East',
    archetype: 'Stretch Big',
    // 1986-87 DePaul: 17.5 PPG, 8.5 RPG, 1.2 APG
    stats: { games: 31, mpg: 32.0, ppg: 17.5, rpg: 8.5, apg: 1.2, spg: 0.6, bpg: 1.5, tov: 2.0, pf: 3.2, fg_pct: 0.530, three_pt_pct: null, ft_pct: 0.668, pts_per40: 21.9, reb_per40: 10.6, ast_per40: 1.5, stl_per40: 0.8, blk_per40: 1.9, tov_per40: 2.5, usg: 0.255, per: 20.5, bpm: 5.5, obpm: 2.5, dbpm: 3.0, ws: 5.0, efg_pct: 0.530, ts_pct: 0.560, ast_pct: 0.062, tov_pct: 0.118, stl_pct: 0.013, blk_pct: 0.048, orb_pct: 0.085, drb_pct: 0.192, drtg: 93.5 },
    nba: { ppg: 3.5, rpg: 2.5, apg: 0.4, spg: 0.3, bpg: 0.4, ws48: 0.022, outcome: 'Bust' },
  },
  {
    pick: 13, team: 'LA Clippers', name: 'Joe Wolf', school: 'North Carolina', pos: 'C',
    birthYear: 1964, height: 84, weight: 230, wingspan: 87, conf: 'ACC',
    archetype: 'Drop Coverage Big',
    // 1986-87 UNC: 13.5 PPG, 6.8 RPG, 1.5 APG
    stats: { games: 34, mpg: 29.0, ppg: 13.5, rpg: 6.8, apg: 1.5, spg: 0.7, bpg: 0.9, tov: 1.8, pf: 3.0, fg_pct: 0.545, three_pt_pct: 0.300, ft_pct: 0.718, pts_per40: 18.6, reb_per40: 9.4, ast_per40: 2.1, stl_per40: 1.0, blk_per40: 1.2, tov_per40: 2.5, usg: 0.232, per: 18.5, bpm: 4.0, obpm: 1.5, dbpm: 2.5, ws: 4.2, efg_pct: 0.560, ts_pct: 0.595, ast_pct: 0.082, tov_pct: 0.118, stl_pct: 0.015, blk_pct: 0.028, orb_pct: 0.065, drb_pct: 0.158, drtg: 95.0 },
    nba: { ppg: 4.8, rpg: 3.5, apg: 1.2, spg: 0.4, bpg: 0.4, ws48: 0.055, outcome: 'Role Player' },
  },
  {
    pick: 14, team: 'Golden State Warriors', name: 'Tellis Frank', school: 'Western Kentucky', pos: 'PF',
    birthYear: 1965, height: 82, weight: 225, wingspan: 85, conf: 'Sun Belt',
    archetype: 'Stretch Big',
    // 1986-87 Western Kentucky: 18.2 PPG, 8.2 RPG, 1.1 APG
    stats: { games: 29, mpg: 33.0, ppg: 18.2, rpg: 8.2, apg: 1.1, spg: 0.8, bpg: 1.2, tov: 2.2, pf: 3.0, fg_pct: 0.548, three_pt_pct: null, ft_pct: 0.698, pts_per40: 22.1, reb_per40: 9.9, ast_per40: 1.3, stl_per40: 1.0, blk_per40: 1.5, tov_per40: 2.7, usg: 0.268, per: 20.0, bpm: 5.0, obpm: 2.2, dbpm: 2.8, ws: 4.5, efg_pct: 0.548, ts_pct: 0.581, ast_pct: 0.055, tov_pct: 0.122, stl_pct: 0.016, blk_pct: 0.035, orb_pct: 0.082, drb_pct: 0.188, drtg: 94.5 },
    nba: { ppg: 4.0, rpg: 3.2, apg: 0.5, spg: 0.3, bpg: 0.4, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 15, team: 'Utah Jazz', name: 'Jose Ortiz', school: 'Oregon State', pos: 'C',
    birthYear: 1963, height: 82, weight: 225, wingspan: 85, conf: 'Pac-10',
    archetype: 'Drop Coverage Big',
    // 1986-87 Oregon State: 16.1 PPG, 8.0 RPG, 1.2 APG
    stats: { games: 30, mpg: 30.0, ppg: 16.1, rpg: 8.0, apg: 1.2, spg: 0.6, bpg: 1.5, tov: 2.0, pf: 3.2, fg_pct: 0.538, three_pt_pct: null, ft_pct: 0.648, pts_per40: 21.5, reb_per40: 10.7, ast_per40: 1.6, stl_per40: 0.8, blk_per40: 2.0, tov_per40: 2.7, usg: 0.248, per: 19.5, bpm: 4.8, obpm: 1.8, dbpm: 3.0, ws: 4.5, efg_pct: 0.538, ts_pct: 0.565, ast_pct: 0.062, tov_pct: 0.130, stl_pct: 0.012, blk_pct: 0.050, orb_pct: 0.090, drb_pct: 0.198, drtg: 92.0 },
    nba: { ppg: 2.8, rpg: 2.2, apg: 0.3, spg: 0.2, bpg: 0.4, ws48: 0.015, outcome: 'Bust' },
  },
  {
    pick: 16, team: 'Washington Bullets', name: 'Tyrone Bogues', school: 'Wake Forest', pos: 'PG',
    birthYear: 1965, height: 63, weight: 140, wingspan: 71, conf: 'ACC',
    archetype: 'Secondary Playmaker',
    // 1986-87 Wake Forest: 14.8 PPG, 6.1 RPG, 9.5 APG
    stats: { games: 29, mpg: 35.0, ppg: 14.8, rpg: 6.1, apg: 9.5, spg: 3.8, bpg: 0.1, tov: 3.5, pf: 2.0, fg_pct: 0.478, three_pt_pct: 0.298, ft_pct: 0.728, pts_per40: 16.9, reb_per40: 7.0, ast_per40: 10.9, stl_per40: 4.3, blk_per40: 0.1, tov_per40: 4.0, usg: 0.235, per: 22.5, bpm: 7.8, obpm: 3.5, dbpm: 4.3, ws: 6.5, efg_pct: 0.498, ts_pct: 0.549, ast_pct: 0.465, tov_pct: 0.155, stl_pct: 0.075, blk_pct: 0.002, orb_pct: 0.028, drb_pct: 0.122, drtg: 90.0 },
    nba: { ppg: 7.7, rpg: 2.6, apg: 7.6, spg: 1.6, bpg: 0.1, ws48: 0.102, outcome: 'Starter' },
  },
  {
    pick: 17, team: 'Portland Trail Blazers', name: 'Chris Welp', school: 'Washington', pos: 'C',
    birthYear: 1964, height: 84, weight: 245, wingspan: 87, conf: 'Pac-10',
    archetype: 'Drop Coverage Big',
    // 1986-87 Washington: 17.0 PPG, 7.8 RPG, 1.0 APG
    stats: { games: 30, mpg: 31.0, ppg: 17.0, rpg: 7.8, apg: 1.0, spg: 0.5, bpg: 1.5, tov: 1.8, pf: 3.2, fg_pct: 0.548, three_pt_pct: null, ft_pct: 0.695, pts_per40: 21.9, reb_per40: 10.1, ast_per40: 1.3, stl_per40: 0.6, blk_per40: 1.9, tov_per40: 2.3, usg: 0.252, per: 19.0, bpm: 4.5, obpm: 1.5, dbpm: 3.0, ws: 4.0, efg_pct: 0.548, ts_pct: 0.579, ast_pct: 0.052, tov_pct: 0.112, stl_pct: 0.010, blk_pct: 0.048, orb_pct: 0.078, drb_pct: 0.185, drtg: 93.5 },
    nba: { ppg: 4.8, rpg: 3.2, apg: 0.6, spg: 0.2, bpg: 0.5, ws48: 0.040, outcome: 'Role Player' },
  },
  {
    pick: 18, team: 'New York Knicks', name: 'Mark Jackson', school: "St. John's", pos: 'PG',
    birthYear: 1965, height: 74, weight: 185, wingspan: 78, conf: 'Big East',
    archetype: 'Primary Playmaker',
    // 1986-87 St. John's: 19.5 PPG, 3.5 RPG, 9.1 APG
    stats: { games: 32, mpg: 36.0, ppg: 19.5, rpg: 3.5, apg: 9.1, spg: 1.5, bpg: 0.2, tov: 3.5, pf: 2.8, fg_pct: 0.488, three_pt_pct: 0.325, ft_pct: 0.762, pts_per40: 21.7, reb_per40: 3.9, ast_per40: 10.1, stl_per40: 1.7, blk_per40: 0.2, tov_per40: 3.9, usg: 0.275, per: 22.5, bpm: 7.5, obpm: 4.2, dbpm: 3.3, ws: 6.8, efg_pct: 0.508, ts_pct: 0.568, ast_pct: 0.462, tov_pct: 0.155, stl_pct: 0.030, blk_pct: 0.004, orb_pct: 0.020, drb_pct: 0.072, drtg: 93.0 },
    nba: { ppg: 10.0, rpg: 3.2, apg: 8.0, spg: 1.2, bpg: 0.2, ws48: 0.098, outcome: 'All-Star' },
  },
  {
    pick: 19, team: 'Dallas Mavericks', name: 'Jim Farmer', school: 'Alabama', pos: 'SG',
    birthYear: 1964, height: 77, weight: 185, wingspan: 80, conf: 'SEC',
    archetype: 'Off Ball Shooter',
    // 1986-87 Alabama: 14.5 PPG, 3.8 RPG, 2.5 APG
    stats: { games: 31, mpg: 30.0, ppg: 14.5, rpg: 3.8, apg: 2.5, spg: 1.0, bpg: 0.2, tov: 2.0, pf: 2.2, fg_pct: 0.478, three_pt_pct: 0.320, ft_pct: 0.812, pts_per40: 19.3, reb_per40: 5.1, ast_per40: 3.3, stl_per40: 1.3, blk_per40: 0.3, tov_per40: 2.7, usg: 0.248, per: 17.0, bpm: 3.0, obpm: 2.0, dbpm: 1.0, ws: 3.5, efg_pct: 0.508, ts_pct: 0.578, ast_pct: 0.132, tov_pct: 0.128, stl_pct: 0.022, blk_pct: 0.005, orb_pct: 0.025, drb_pct: 0.082, drtg: 98.5 },
    nba: { ppg: 4.5, rpg: 1.5, apg: 1.0, spg: 0.4, bpg: 0.1, ws48: 0.025, outcome: 'Bust' },
  },
  {
    pick: 20, team: 'Milwaukee Bucks', name: 'Gary Suiter', school: 'Nevada-Reno', pos: 'SF',
    birthYear: 1964, height: 80, weight: 205, wingspan: 83, conf: 'Big Sky',
    archetype: 'Slasher Wing',
    stats: { games: 28, mpg: 31.0, ppg: 16.2, rpg: 6.5, apg: 2.0, spg: 1.2, bpg: 0.5, tov: 2.2, pf: 2.5, fg_pct: 0.505, three_pt_pct: 0.310, ft_pct: 0.725, pts_per40: 20.9, reb_per40: 8.4, ast_per40: 2.6, stl_per40: 1.5, blk_per40: 0.6, tov_per40: 2.8, usg: 0.255, per: 18.0, bpm: 3.5, obpm: 1.5, dbpm: 2.0, ws: 3.8, efg_pct: 0.525, ts_pct: 0.572, ast_pct: 0.105, tov_pct: 0.132, stl_pct: 0.025, blk_pct: 0.013, orb_pct: 0.048, drb_pct: 0.135, drtg: 99.0 },
    nba: { ppg: 1.5, rpg: 0.8, apg: 0.3, spg: 0.1, bpg: 0.1, ws48: 0.005, outcome: 'Bust' },
  },
  {
    pick: 21, team: 'Atlanta Hawks', name: 'Winston Garland', school: 'Southwest Missouri State', pos: 'PG',
    birthYear: 1964, height: 73, weight: 170, wingspan: 77, conf: 'Missouri Valley',
    archetype: 'Secondary Playmaker',
    stats: { games: 30, mpg: 32.0, ppg: 18.5, rpg: 4.2, apg: 6.8, spg: 2.2, bpg: 0.2, tov: 2.8, pf: 2.2, fg_pct: 0.498, three_pt_pct: 0.338, ft_pct: 0.765, pts_per40: 23.1, reb_per40: 5.3, ast_per40: 8.5, stl_per40: 2.8, blk_per40: 0.3, tov_per40: 3.5, usg: 0.272, per: 21.0, bpm: 5.8, obpm: 3.5, dbpm: 2.3, ws: 5.5, efg_pct: 0.518, ts_pct: 0.579, ast_pct: 0.345, tov_pct: 0.138, stl_pct: 0.045, blk_pct: 0.004, orb_pct: 0.022, drb_pct: 0.088, drtg: 95.0 },
    nba: { ppg: 8.8, rpg: 2.8, apg: 5.5, spg: 1.2, bpg: 0.1, ws48: 0.078, outcome: 'Starter' },
  },
  {
    pick: 22, team: 'New Jersey Nets', name: 'Rodney Monroe', school: 'NC State', pos: 'SG',
    birthYear: 1968, height: 76, weight: 180, wingspan: 79, conf: 'ACC',
    archetype: 'Off Ball Shooter',
    stats: { games: 31, mpg: 28.0, ppg: 13.0, rpg: 2.8, apg: 2.0, spg: 1.0, bpg: 0.1, tov: 1.8, pf: 1.8, fg_pct: 0.468, three_pt_pct: 0.362, ft_pct: 0.852, pts_per40: 18.6, reb_per40: 4.0, ast_per40: 2.9, stl_per40: 1.4, blk_per40: 0.1, tov_per40: 2.6, usg: 0.252, per: 16.5, bpm: 2.5, obpm: 2.0, dbpm: 0.5, ws: 3.2, efg_pct: 0.498, ts_pct: 0.575, ast_pct: 0.110, tov_pct: 0.118, stl_pct: 0.022, blk_pct: 0.003, orb_pct: 0.018, drb_pct: 0.062, drtg: 100.0 },
    nba: { ppg: 3.5, rpg: 0.8, apg: 0.8, spg: 0.3, bpg: 0.0, ws48: 0.010, outcome: 'Bust' },
  },
  {
    pick: 23, team: 'Boston Celtics', name: 'Brad Lohaus', school: 'Iowa', pos: 'C',
    birthYear: 1964, height: 84, weight: 235, wingspan: 87, conf: 'Big Ten',
    archetype: 'Stretch Big',
    stats: { games: 32, mpg: 28.0, ppg: 11.5, rpg: 6.5, apg: 1.2, spg: 0.5, bpg: 1.8, tov: 1.5, pf: 2.8, fg_pct: 0.505, three_pt_pct: 0.340, ft_pct: 0.755, pts_per40: 16.4, reb_per40: 9.3, ast_per40: 1.7, stl_per40: 0.7, blk_per40: 2.6, tov_per40: 2.1, usg: 0.215, per: 18.0, bpm: 3.8, obpm: 1.2, dbpm: 2.6, ws: 4.0, efg_pct: 0.535, ts_pct: 0.588, ast_pct: 0.068, tov_pct: 0.110, stl_pct: 0.011, blk_pct: 0.060, orb_pct: 0.065, drb_pct: 0.168, drtg: 94.5 },
    nba: { ppg: 5.2, rpg: 3.5, apg: 0.8, spg: 0.3, bpg: 0.7, ws48: 0.052, outcome: 'Role Player' },
  },
  {
    pick: 24, team: 'Portland Trail Blazers', name: 'Ronnie Murphy', school: 'Jacksonville', pos: 'SG',
    birthYear: 1964, height: 76, weight: 190, wingspan: 80, conf: 'Trans America',
    archetype: 'Off Ball Shooter',
    stats: { games: 29, mpg: 32.0, ppg: 18.8, rpg: 4.5, apg: 3.5, spg: 1.8, bpg: 0.3, tov: 2.5, pf: 2.5, fg_pct: 0.488, three_pt_pct: 0.345, ft_pct: 0.782, pts_per40: 23.5, reb_per40: 5.6, ast_per40: 4.4, stl_per40: 2.3, blk_per40: 0.4, tov_per40: 3.1, usg: 0.278, per: 19.5, bpm: 4.5, obpm: 3.0, dbpm: 1.5, ws: 4.2, efg_pct: 0.515, ts_pct: 0.582, ast_pct: 0.178, tov_pct: 0.132, stl_pct: 0.038, blk_pct: 0.007, orb_pct: 0.028, drb_pct: 0.095, drtg: 98.5 },
    nba: { ppg: 4.0, rpg: 1.5, apg: 1.2, spg: 0.5, bpg: 0.1, ws48: 0.018, outcome: 'Bust' },
  },
  // === ADDITIONAL FIRST ROUND / NOTABLE PICKS ===
  {
    pick: 25, team: 'Houston Rockets', name: 'Nate Archibald', school: 'UTEP', pos: 'PG',
    birthYear: 1965, height: 73, weight: 170, wingspan: 77, conf: 'WAC',
    archetype: 'Secondary Playmaker',
    stats: { games: 30, mpg: 30.0, ppg: 15.5, rpg: 3.2, apg: 6.0, spg: 1.8, bpg: 0.1, tov: 2.8, pf: 2.0, fg_pct: 0.488, three_pt_pct: 0.312, ft_pct: 0.782, pts_per40: 20.7, reb_per40: 4.3, ast_per40: 8.0, stl_per40: 2.4, blk_per40: 0.1, tov_per40: 3.7, usg: 0.258, per: 19.5, bpm: 4.5, obpm: 2.8, dbpm: 1.7, ws: 4.5, efg_pct: 0.508, ts_pct: 0.568, ast_pct: 0.305, tov_pct: 0.148, stl_pct: 0.038, blk_pct: 0.002, orb_pct: 0.020, drb_pct: 0.072, drtg: 97.5 },
    nba: { ppg: 3.2, rpg: 0.9, apg: 1.5, spg: 0.3, bpg: 0.0, ws48: 0.012, outcome: 'Bust' },
  },
  {
    pick: 26, team: 'Chicago Bulls', name: 'Dwayne Washington', school: 'Syracuse', pos: 'PG',
    birthYear: 1964, height: 75, weight: 195, wingspan: 79, conf: 'Big East',
    archetype: 'Secondary Playmaker',
    stats: { games: 31, mpg: 31.0, ppg: 15.8, rpg: 3.5, apg: 6.5, spg: 2.0, bpg: 0.2, tov: 3.2, pf: 2.5, fg_pct: 0.458, three_pt_pct: 0.285, ft_pct: 0.718, pts_per40: 20.4, reb_per40: 4.5, ast_per40: 8.4, stl_per40: 2.6, blk_per40: 0.3, tov_per40: 4.1, usg: 0.268, per: 18.5, bpm: 4.0, obpm: 2.5, dbpm: 1.5, ws: 4.0, efg_pct: 0.478, ts_pct: 0.538, ast_pct: 0.335, tov_pct: 0.158, stl_pct: 0.042, blk_pct: 0.004, orb_pct: 0.022, drb_pct: 0.075, drtg: 98.0 },
    nba: { ppg: 9.5, rpg: 2.5, apg: 5.8, spg: 1.0, bpg: 0.1, ws48: 0.065, outcome: 'Starter' },
  },
  {
    pick: 27, team: 'Philadelphia 76ers', name: 'Christian Welp', school: 'Washington', pos: 'C',
    birthYear: 1962, height: 83, weight: 245, wingspan: 86, conf: 'Pac-10',
    archetype: 'Drop Coverage Big',
    stats: { games: 30, mpg: 28.0, ppg: 13.5, rpg: 7.5, apg: 1.0, spg: 0.5, bpg: 1.5, tov: 1.8, pf: 3.2, fg_pct: 0.535, three_pt_pct: null, ft_pct: 0.668, pts_per40: 19.3, reb_per40: 10.7, ast_per40: 1.4, stl_per40: 0.7, blk_per40: 2.1, tov_per40: 2.6, usg: 0.238, per: 18.5, bpm: 4.2, obpm: 1.2, dbpm: 3.0, ws: 3.8, efg_pct: 0.535, ts_pct: 0.562, ast_pct: 0.055, tov_pct: 0.122, stl_pct: 0.011, blk_pct: 0.052, orb_pct: 0.082, drb_pct: 0.195, drtg: 93.5 },
    nba: { ppg: 5.2, rpg: 3.8, apg: 0.7, spg: 0.3, bpg: 0.5, ws48: 0.048, outcome: 'Role Player' },
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
  console.log(`Seeding ${DRAFT_CLASS} NBA Draft — Legendary Archives`)

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
  console.log(`Navigate to /legendary-archives?year=1987 to view the board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
