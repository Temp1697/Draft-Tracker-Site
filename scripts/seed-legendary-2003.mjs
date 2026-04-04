#!/usr/bin/env node
// Seed script for 2003 NBA Draft — Legendary Archives
// Usage: node scripts/seed-legendary-2003.mjs

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const DRAFT_YEAR = 2003
const DRAFT_CLASS = '2003'
const SEASON = '02-03'

function pid(name, birthYear) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + birthYear
}

function bucket(pos) {
  if (['PG', 'SG'].includes(pos)) return 'Guard'
  if (['SF', 'SF/PF'].includes(pos)) return 'Wing'
  if (['PF', 'C', 'PF/C', 'C/PF'].includes(pos)) return 'Big'
  return 'Wing'
}

// 2003 NBA Draft — considered one of the greatest draft classes ever
const PLAYERS = [
  {
    pick: 1, team: 'Cleveland Cavaliers', name: 'LeBron James', school: 'St. Vincent-St. Mary HS', pos: 'SF',
    birthYear: 1984, height: 80, weight: 240, wingspan: 84, conf: 'Prep',
    archetype: 'Point Forward',
    // HS Senior Season: 31.6 PPG, 9.6 RPG, 4.6 APG
    stats: { games: 25, mpg: 32.0, ppg: 31.6, rpg: 9.6, apg: 4.6, spg: 2.8, bpg: 1.0, tov: 3.5, pf: 2.0, fg_pct: 0.560, three_pt_pct: 0.380, ft_pct: 0.730, pts_per40: 39.5, reb_per40: 12.0, ast_per40: 5.8, stl_per40: 3.5, blk_per40: 1.3, tov_per40: 4.4, usg: 0.350, per: 35.0, bpm: 15.0, obpm: 10.0, dbpm: 5.0, ws: 10.0, efg_pct: 0.585, ts_pct: 0.620, ast_pct: 0.230, tov_pct: 0.120, stl_pct: 0.058, blk_pct: 0.025, orb_pct: 0.055, drb_pct: 0.200, drtg: 92.0 },
    nba: { ppg: 27.2, rpg: 7.0, apg: 6.9, spg: 1.6, bpg: 0.7, ws48: 0.228, outcome: 'MVP' },
  },
  {
    pick: 2, team: 'Detroit Pistons', name: 'Darko Milicic', school: 'Hemofarm (Serbia)', pos: 'C',
    birthYear: 1985, height: 84, weight: 245, wingspan: 90, conf: 'EuroLeague',
    archetype: 'Stretch Big',
    stats: { games: 30, mpg: 18.0, ppg: 7.5, rpg: 4.8, apg: 0.8, spg: 0.3, bpg: 1.5, tov: 1.5, pf: 2.8, fg_pct: 0.490, three_pt_pct: null, ft_pct: 0.650, pts_per40: 16.7, reb_per40: 10.7, ast_per40: 1.8, stl_per40: 0.7, blk_per40: 3.3, tov_per40: 3.3, usg: 0.220, per: 18.0, bpm: 2.0, obpm: -1.0, dbpm: 3.0, ws: 2.0, efg_pct: 0.490, ts_pct: 0.530, ast_pct: 0.065, tov_pct: 0.145, stl_pct: 0.011, blk_pct: 0.065, orb_pct: 0.070, drb_pct: 0.170, drtg: 100.0 },
    nba: { ppg: 6.0, rpg: 4.2, apg: 0.7, spg: 0.3, bpg: 0.9, ws48: 0.042, outcome: 'Bust' },
  },
  {
    pick: 3, team: 'Denver Nuggets', name: 'Carmelo Anthony', school: 'Syracuse', pos: 'SF',
    birthYear: 1984, height: 80, weight: 230, wingspan: 83, conf: 'Big East',
    archetype: 'Three Level Scorer',
    // 2002-03 Syracuse (Freshman, led team to NCAA title): 22.2 PPG, 10.0 RPG, 2.2 APG
    stats: { games: 35, mpg: 36.4, ppg: 22.2, rpg: 10.0, apg: 2.2, spg: 1.2, bpg: 0.4, tov: 2.6, pf: 2.7, fg_pct: 0.453, three_pt_pct: 0.337, ft_pct: 0.830, pts_per40: 24.4, reb_per40: 11.0, ast_per40: 2.4, stl_per40: 1.3, blk_per40: 0.4, tov_per40: 2.9, usg: 0.310, per: 24.5, bpm: 8.5, obpm: 6.5, dbpm: 2.0, ws: 7.0, efg_pct: 0.483, ts_pct: 0.565, ast_pct: 0.098, tov_pct: 0.115, stl_pct: 0.022, blk_pct: 0.009, orb_pct: 0.070, drb_pct: 0.190, drtg: 95.5 },
    nba: { ppg: 22.7, rpg: 6.1, apg: 3.0, spg: 1.0, bpg: 0.5, ws48: 0.130, outcome: 'All-NBA' },
  },
  {
    pick: 4, team: 'Toronto Raptors', name: 'Chris Bosh', school: 'Georgia Tech', pos: 'PF',
    birthYear: 1984, height: 83, weight: 210, wingspan: 87, conf: 'ACC',
    archetype: 'Pick and Pop Big',
    // 2002-03 Georgia Tech (Freshman): 15.6 PPG, 9.0 RPG, 2.2 APG
    stats: { games: 31, mpg: 30.0, ppg: 15.6, rpg: 9.0, apg: 2.2, spg: 0.8, bpg: 2.2, tov: 2.0, pf: 2.5, fg_pct: 0.509, three_pt_pct: 0.261, ft_pct: 0.745, pts_per40: 20.8, reb_per40: 12.0, ast_per40: 2.9, stl_per40: 1.1, blk_per40: 2.9, tov_per40: 2.7, usg: 0.265, per: 23.5, bpm: 7.5, obpm: 3.5, dbpm: 4.0, ws: 5.5, efg_pct: 0.518, ts_pct: 0.568, ast_pct: 0.125, tov_pct: 0.130, stl_pct: 0.018, blk_pct: 0.058, orb_pct: 0.070, drb_pct: 0.195, drtg: 93.5 },
    nba: { ppg: 19.2, rpg: 8.5, apg: 2.0, spg: 0.8, bpg: 1.0, ws48: 0.161, outcome: 'All-NBA' },
  },
  {
    pick: 5, team: 'Miami Heat', name: 'Dwyane Wade', school: 'Marquette', pos: 'SG',
    birthYear: 1982, height: 76, weight: 220, wingspan: 81, conf: 'Conference USA',
    archetype: 'Rim Pressure Guard',
    // 2002-03 Marquette (Junior, Final Four): 21.5 PPG, 6.3 RPG, 4.7 APG
    stats: { games: 33, mpg: 35.8, ppg: 21.5, rpg: 6.3, apg: 4.7, spg: 2.2, bpg: 0.8, tov: 2.5, pf: 2.3, fg_pct: 0.479, three_pt_pct: 0.319, ft_pct: 0.758, pts_per40: 24.0, reb_per40: 7.0, ast_per40: 5.3, stl_per40: 2.5, blk_per40: 0.9, tov_per40: 2.8, usg: 0.295, per: 26.0, bpm: 10.0, obpm: 6.0, dbpm: 4.0, ws: 7.5, efg_pct: 0.502, ts_pct: 0.565, ast_pct: 0.215, tov_pct: 0.115, stl_pct: 0.041, blk_pct: 0.018, orb_pct: 0.040, drb_pct: 0.130, drtg: 91.0 },
    nba: { ppg: 24.1, rpg: 5.0, apg: 6.5, spg: 1.5, bpg: 1.0, ws48: 0.185, outcome: 'MVP' },
  },
  {
    pick: 6, team: 'LA Clippers', name: 'Chris Kaman', school: 'Central Michigan', pos: 'C',
    birthYear: 1982, height: 84, weight: 265, wingspan: 88, conf: 'MAC',
    archetype: 'Drop Coverage Big',
    stats: { games: 30, mpg: 28.0, ppg: 15.5, rpg: 8.5, apg: 1.0, spg: 0.5, bpg: 2.8, tov: 1.5, pf: 2.5, fg_pct: 0.520, three_pt_pct: null, ft_pct: 0.710, pts_per40: 22.1, reb_per40: 12.1, ast_per40: 1.4, stl_per40: 0.7, blk_per40: 4.0, tov_per40: 2.1, usg: 0.270, per: 22.5, bpm: 6.0, obpm: 2.5, dbpm: 3.5, ws: 5.0, efg_pct: 0.520, ts_pct: 0.570, ast_pct: 0.058, tov_pct: 0.100, stl_pct: 0.012, blk_pct: 0.078, orb_pct: 0.075, drb_pct: 0.195, drtg: 94.5 },
    nba: { ppg: 11.5, rpg: 7.2, apg: 1.2, spg: 0.4, bpg: 1.4, ws48: 0.098, outcome: 'All-Star' },
  },
  {
    pick: 7, team: 'Chicago Bulls', name: 'Kirk Hinrich', school: 'Kansas', pos: 'PG',
    birthYear: 1981, height: 75, weight: 190, wingspan: 80, conf: 'Big 12',
    archetype: 'POA Defender',
    stats: { games: 38, mpg: 34.5, ppg: 14.0, rpg: 4.0, apg: 4.5, spg: 1.4, bpg: 0.3, tov: 2.0, pf: 1.8, fg_pct: 0.420, three_pt_pct: 0.395, ft_pct: 0.830, pts_per40: 16.2, reb_per40: 4.6, ast_per40: 5.2, stl_per40: 1.6, blk_per40: 0.3, tov_per40: 2.3, usg: 0.225, per: 18.0, bpm: 5.5, obpm: 3.0, dbpm: 2.5, ws: 5.5, efg_pct: 0.465, ts_pct: 0.565, ast_pct: 0.228, tov_pct: 0.120, stl_pct: 0.027, blk_pct: 0.006, orb_pct: 0.020, drb_pct: 0.085, drtg: 93.0 },
    nba: { ppg: 10.9, rpg: 3.4, apg: 4.7, spg: 1.0, bpg: 0.2, ws48: 0.084, outcome: 'Starter' },
  },
  {
    pick: 8, team: 'Milwaukee Bucks', name: 'TJ Ford', school: 'Texas', pos: 'PG',
    birthYear: 1983, height: 72, weight: 165, wingspan: 76, conf: 'Big 12',
    archetype: 'Primary Playmaker',
    // 2002-03 Texas (Sophomore, Naismith Award): 15.0 PPG, 4.4 RPG, 7.7 APG
    stats: { games: 32, mpg: 33.5, ppg: 15.0, rpg: 4.4, apg: 7.7, spg: 1.8, bpg: 0.1, tov: 2.8, pf: 1.5, fg_pct: 0.445, three_pt_pct: 0.324, ft_pct: 0.765, pts_per40: 17.9, reb_per40: 5.3, ast_per40: 9.2, stl_per40: 2.2, blk_per40: 0.1, tov_per40: 3.3, usg: 0.258, per: 22.0, bpm: 8.5, obpm: 5.0, dbpm: 3.5, ws: 6.0, efg_pct: 0.468, ts_pct: 0.538, ast_pct: 0.380, tov_pct: 0.148, stl_pct: 0.036, blk_pct: 0.002, orb_pct: 0.025, drb_pct: 0.090, drtg: 92.5 },
    nba: { ppg: 11.0, rpg: 2.5, apg: 5.5, spg: 0.9, bpg: 0.1, ws48: 0.092, outcome: 'Starter' },
  },
  {
    pick: 9, team: 'New York Knicks', name: 'Mike Sweetney', school: 'Georgetown', pos: 'PF',
    birthYear: 1982, height: 80, weight: 260, wingspan: 83, conf: 'Big East',
    archetype: 'Offensive Rebounder',
    stats: { games: 30, mpg: 32.0, ppg: 18.0, rpg: 9.5, apg: 1.5, spg: 0.5, bpg: 0.5, tov: 2.0, pf: 3.0, fg_pct: 0.540, three_pt_pct: null, ft_pct: 0.680, pts_per40: 22.5, reb_per40: 11.9, ast_per40: 1.9, stl_per40: 0.6, blk_per40: 0.6, tov_per40: 2.5, usg: 0.285, per: 22.0, bpm: 6.0, obpm: 3.5, dbpm: 2.5, ws: 5.5, efg_pct: 0.540, ts_pct: 0.575, ast_pct: 0.078, tov_pct: 0.115, stl_pct: 0.010, blk_pct: 0.013, orb_pct: 0.085, drb_pct: 0.185, drtg: 97.0 },
    nba: { ppg: 7.5, rpg: 4.5, apg: 0.5, spg: 0.3, bpg: 0.2, ws48: 0.065, outcome: 'Bust' },
  },
  {
    pick: 10, team: 'Washington Wizards', name: 'Jarvis Hayes', school: 'Georgia', pos: 'SF',
    birthYear: 1981, height: 79, weight: 220, wingspan: 84, conf: 'SEC',
    archetype: '3 and D Wing',
    stats: { games: 35, mpg: 33.0, ppg: 16.5, rpg: 5.5, apg: 1.5, spg: 1.0, bpg: 0.5, tov: 1.5, pf: 2.0, fg_pct: 0.455, three_pt_pct: 0.375, ft_pct: 0.790, pts_per40: 20.0, reb_per40: 6.7, ast_per40: 1.8, stl_per40: 1.2, blk_per40: 0.6, tov_per40: 1.8, usg: 0.252, per: 17.5, bpm: 4.0, obpm: 2.5, dbpm: 1.5, ws: 4.5, efg_pct: 0.490, ts_pct: 0.565, ast_pct: 0.072, tov_pct: 0.095, stl_pct: 0.020, blk_pct: 0.012, orb_pct: 0.035, drb_pct: 0.110, drtg: 99.0 },
    nba: { ppg: 7.5, rpg: 2.8, apg: 1.0, spg: 0.5, bpg: 0.2, ws48: 0.048, outcome: 'Role Player' },
  },
  {
    pick: 11, team: 'Golden State Warriors', name: 'Mickael Pietrus', school: 'Pau-Orthez (France)', pos: 'SG',
    birthYear: 1982, height: 78, weight: 215, wingspan: 83, conf: 'EuroLeague',
    archetype: '3 and D Wing',
    stats: { games: 25, mpg: 20.0, ppg: 8.5, rpg: 3.0, apg: 1.0, spg: 0.8, bpg: 0.3, tov: 1.2, pf: 2.0, fg_pct: 0.450, three_pt_pct: 0.350, ft_pct: 0.700, pts_per40: 17.0, reb_per40: 6.0, ast_per40: 2.0, stl_per40: 1.6, blk_per40: 0.6, tov_per40: 2.4, usg: 0.225, per: 15.5, bpm: 1.5, obpm: 0.5, dbpm: 1.0, ws: 2.0, efg_pct: 0.480, ts_pct: 0.530, ast_pct: 0.080, tov_pct: 0.120, stl_pct: 0.026, blk_pct: 0.010, orb_pct: 0.030, drb_pct: 0.085, drtg: 102.0 },
    nba: { ppg: 7.3, rpg: 2.8, apg: 0.9, spg: 0.7, bpg: 0.3, ws48: 0.065, outcome: 'Role Player' },
  },
  {
    pick: 12, team: 'Seattle SuperSonics', name: 'Nick Collison', school: 'Kansas', pos: 'PF',
    birthYear: 1980, height: 82, weight: 255, wingspan: 85, conf: 'Big 12',
    archetype: 'High Post Facilitator',
    stats: { games: 38, mpg: 34.0, ppg: 18.5, rpg: 8.5, apg: 2.5, spg: 0.8, bpg: 1.0, tov: 1.8, pf: 2.5, fg_pct: 0.555, three_pt_pct: 0.300, ft_pct: 0.780, pts_per40: 21.8, reb_per40: 10.0, ast_per40: 2.9, stl_per40: 0.9, blk_per40: 1.2, tov_per40: 2.1, usg: 0.268, per: 24.0, bpm: 8.5, obpm: 5.0, dbpm: 3.5, ws: 7.5, efg_pct: 0.562, ts_pct: 0.610, ast_pct: 0.130, tov_pct: 0.100, stl_pct: 0.016, blk_pct: 0.024, orb_pct: 0.065, drb_pct: 0.165, drtg: 93.0 },
    nba: { ppg: 5.9, rpg: 5.2, apg: 1.3, spg: 0.5, bpg: 0.4, ws48: 0.114, outcome: 'Role Player' },
  },
  {
    pick: 13, team: 'Memphis Grizzlies', name: 'Marcus Banks', school: 'UNLV', pos: 'PG',
    birthYear: 1981, height: 74, weight: 200, wingspan: 80, conf: 'Mountain West',
    archetype: 'Energy Guard',
    stats: { games: 29, mpg: 33.0, ppg: 16.5, rpg: 4.0, apg: 4.5, spg: 2.0, bpg: 0.2, tov: 3.0, pf: 2.2, fg_pct: 0.420, three_pt_pct: 0.290, ft_pct: 0.720, pts_per40: 20.0, reb_per40: 4.8, ast_per40: 5.5, stl_per40: 2.4, blk_per40: 0.2, tov_per40: 3.6, usg: 0.265, per: 17.0, bpm: 3.0, obpm: 1.0, dbpm: 2.0, ws: 3.5, efg_pct: 0.445, ts_pct: 0.510, ast_pct: 0.218, tov_pct: 0.155, stl_pct: 0.040, blk_pct: 0.005, orb_pct: 0.020, drb_pct: 0.075, drtg: 100.0 },
    nba: { ppg: 5.8, rpg: 1.6, apg: 2.0, spg: 0.6, bpg: 0.1, ws48: 0.035, outcome: 'Bust' },
  },
  {
    pick: 14, team: 'Seattle SuperSonics', name: 'Luke Ridnour', school: 'Oregon', pos: 'PG',
    birthYear: 1981, height: 74, weight: 175, wingspan: 78, conf: 'Pac-12',
    archetype: 'Secondary Playmaker',
    stats: { games: 33, mpg: 36.0, ppg: 19.5, rpg: 3.5, apg: 5.5, spg: 1.5, bpg: 0.1, tov: 2.5, pf: 1.5, fg_pct: 0.450, three_pt_pct: 0.420, ft_pct: 0.875, pts_per40: 21.7, reb_per40: 3.9, ast_per40: 6.1, stl_per40: 1.7, blk_per40: 0.1, tov_per40: 2.8, usg: 0.270, per: 21.0, bpm: 7.0, obpm: 5.5, dbpm: 1.5, ws: 6.0, efg_pct: 0.495, ts_pct: 0.600, ast_pct: 0.265, tov_pct: 0.120, stl_pct: 0.028, blk_pct: 0.002, orb_pct: 0.015, drb_pct: 0.065, drtg: 97.0 },
    nba: { ppg: 9.3, rpg: 2.4, apg: 4.0, spg: 0.9, bpg: 0.1, ws48: 0.080, outcome: 'Starter' },
  },
  {
    pick: 15, team: 'Orlando Magic', name: 'Reece Gaines', school: 'Louisville', pos: 'SG',
    birthYear: 1981, height: 78, weight: 205, wingspan: 82, conf: 'Conference USA',
    archetype: 'Off Ball Shooter',
    stats: { games: 32, mpg: 34.0, ppg: 15.5, rpg: 5.0, apg: 4.0, spg: 1.5, bpg: 0.3, tov: 2.5, pf: 2.0, fg_pct: 0.430, three_pt_pct: 0.365, ft_pct: 0.805, pts_per40: 18.2, reb_per40: 5.9, ast_per40: 4.7, stl_per40: 1.8, blk_per40: 0.4, tov_per40: 2.9, usg: 0.240, per: 17.5, bpm: 4.0, obpm: 2.0, dbpm: 2.0, ws: 4.5, efg_pct: 0.465, ts_pct: 0.545, ast_pct: 0.185, tov_pct: 0.130, stl_pct: 0.029, blk_pct: 0.007, orb_pct: 0.025, drb_pct: 0.095, drtg: 98.5 },
    nba: { ppg: 3.2, rpg: 1.0, apg: 1.0, spg: 0.3, bpg: 0.1, ws48: 0.010, outcome: 'Bust' },
  },
  {
    pick: 16, team: 'Boston Celtics', name: 'Troy Bell', school: 'Boston College', pos: 'PG',
    birthYear: 1980, height: 73, weight: 190, wingspan: 77, conf: 'Big East',
    archetype: 'Scoring Lead Guard',
    stats: { games: 33, mpg: 35.0, ppg: 21.5, rpg: 4.0, apg: 3.5, spg: 1.5, bpg: 0.2, tov: 2.8, pf: 2.0, fg_pct: 0.420, three_pt_pct: 0.360, ft_pct: 0.860, pts_per40: 24.6, reb_per40: 4.6, ast_per40: 4.0, stl_per40: 1.7, blk_per40: 0.2, tov_per40: 3.2, usg: 0.300, per: 20.0, bpm: 5.5, obpm: 4.5, dbpm: 1.0, ws: 5.0, efg_pct: 0.460, ts_pct: 0.570, ast_pct: 0.165, tov_pct: 0.125, stl_pct: 0.028, blk_pct: 0.004, orb_pct: 0.015, drb_pct: 0.075, drtg: 100.0 },
    nba: { ppg: 2.0, rpg: 0.5, apg: 0.5, spg: 0.2, bpg: 0.0, ws48: -0.05, outcome: 'Bust' },
  },
  {
    pick: 17, team: 'Phoenix Suns', name: 'Zarko Cabarkapa', school: 'Buducnost (Montenegro)', pos: 'SF',
    birthYear: 1981, height: 82, weight: 220, wingspan: 85, conf: 'Adriatic',
    archetype: 'Stretch Big',
    stats: { games: 25, mpg: 22.0, ppg: 10.0, rpg: 4.0, apg: 1.0, spg: 0.5, bpg: 0.5, tov: 1.5, pf: 2.5, fg_pct: 0.450, three_pt_pct: 0.350, ft_pct: 0.780, pts_per40: 18.2, reb_per40: 7.3, ast_per40: 1.8, stl_per40: 0.9, blk_per40: 0.9, tov_per40: 2.7, usg: 0.230, per: 15.0, bpm: 1.5, obpm: 0.5, dbpm: 1.0, ws: 2.0, efg_pct: 0.480, ts_pct: 0.545, ast_pct: 0.070, tov_pct: 0.125, stl_pct: 0.015, blk_pct: 0.018, orb_pct: 0.035, drb_pct: 0.095, drtg: 102.5 },
    nba: { ppg: 3.5, rpg: 2.0, apg: 0.5, spg: 0.3, bpg: 0.2, ws48: 0.010, outcome: 'Bust' },
  },
  {
    pick: 18, team: 'New Orleans Hornets', name: 'David West', school: 'Xavier', pos: 'PF',
    birthYear: 1980, height: 81, weight: 240, wingspan: 84, conf: 'A-10',
    archetype: 'High Post Facilitator',
    stats: { games: 33, mpg: 35.0, ppg: 20.5, rpg: 11.8, apg: 2.5, spg: 1.0, bpg: 1.5, tov: 2.2, pf: 2.8, fg_pct: 0.520, three_pt_pct: 0.310, ft_pct: 0.750, pts_per40: 23.4, reb_per40: 13.5, ast_per40: 2.9, stl_per40: 1.1, blk_per40: 1.7, tov_per40: 2.5, usg: 0.280, per: 26.0, bpm: 10.5, obpm: 6.0, dbpm: 4.5, ws: 8.0, efg_pct: 0.530, ts_pct: 0.575, ast_pct: 0.118, tov_pct: 0.105, stl_pct: 0.019, blk_pct: 0.035, orb_pct: 0.080, drb_pct: 0.215, drtg: 91.5 },
    nba: { ppg: 15.0, rpg: 7.0, apg: 2.0, spg: 0.8, bpg: 0.5, ws48: 0.148, outcome: 'All-Star' },
  },
  {
    pick: 19, team: 'Utah Jazz', name: 'Aleksandar Pavlovic', school: 'Buducnost (Montenegro)', pos: 'SG',
    birthYear: 1983, height: 79, weight: 210, wingspan: 83, conf: 'Adriatic',
    archetype: 'Off Ball Scoring Wing',
    stats: { games: 22, mpg: 18.0, ppg: 7.0, rpg: 2.5, apg: 1.0, spg: 0.5, bpg: 0.2, tov: 1.2, pf: 1.8, fg_pct: 0.430, three_pt_pct: 0.320, ft_pct: 0.740, pts_per40: 15.6, reb_per40: 5.6, ast_per40: 2.2, stl_per40: 1.1, blk_per40: 0.4, tov_per40: 2.7, usg: 0.210, per: 12.0, bpm: -1.0, obpm: -1.5, dbpm: 0.5, ws: 1.0, efg_pct: 0.455, ts_pct: 0.520, ast_pct: 0.090, tov_pct: 0.130, stl_pct: 0.018, blk_pct: 0.008, orb_pct: 0.025, drb_pct: 0.065, drtg: 105.0 },
    nba: { ppg: 5.5, rpg: 2.0, apg: 0.8, spg: 0.4, bpg: 0.1, ws48: 0.045, outcome: 'Role Player' },
  },
  {
    pick: 20, team: 'Minnesota Timberwolves', name: 'Ndudi Ebi', school: 'Westbury Christian HS', pos: 'SF',
    birthYear: 1984, height: 81, weight: 210, wingspan: 86, conf: 'Prep',
    archetype: 'Slasher Wing',
    stats: { games: 20, mpg: 28.0, ppg: 18.0, rpg: 8.0, apg: 1.5, spg: 1.5, bpg: 1.5, tov: 3.0, pf: 2.5, fg_pct: 0.480, three_pt_pct: 0.280, ft_pct: 0.650, pts_per40: 25.7, reb_per40: 11.4, ast_per40: 2.1, stl_per40: 2.1, blk_per40: 2.1, tov_per40: 4.3, usg: 0.280, per: 18.0, bpm: 3.0, obpm: 1.0, dbpm: 2.0, ws: 3.0, efg_pct: 0.495, ts_pct: 0.525, ast_pct: 0.080, tov_pct: 0.170, stl_pct: 0.035, blk_pct: 0.042, orb_pct: 0.055, drb_pct: 0.155, drtg: 100.0 },
    nba: { ppg: 0.5, rpg: 0.5, apg: 0.1, spg: 0.1, bpg: 0.1, ws48: -0.20, outcome: 'Bust' },
  },
  // Picks 21-29 (rest of first round + notable 2nd round)
  {
    pick: 21, team: 'Atlanta Hawks', name: 'Boris Diaw', school: 'Pau-Orthez (France)', pos: 'SF',
    birthYear: 1982, height: 80, weight: 250, wingspan: 84, conf: 'EuroLeague',
    archetype: 'Point Forward',
    stats: { games: 28, mpg: 22.0, ppg: 9.0, rpg: 4.5, apg: 3.0, spg: 0.8, bpg: 0.5, tov: 1.8, pf: 2.0, fg_pct: 0.480, three_pt_pct: 0.330, ft_pct: 0.720, pts_per40: 16.4, reb_per40: 8.2, ast_per40: 5.5, stl_per40: 1.5, blk_per40: 0.9, tov_per40: 3.3, usg: 0.215, per: 16.0, bpm: 2.5, obpm: 1.0, dbpm: 1.5, ws: 2.5, efg_pct: 0.500, ts_pct: 0.545, ast_pct: 0.195, tov_pct: 0.140, stl_pct: 0.024, blk_pct: 0.018, orb_pct: 0.030, drb_pct: 0.105, drtg: 100.5 },
    nba: { ppg: 8.6, rpg: 4.4, apg: 3.5, spg: 0.8, bpg: 0.4, ws48: 0.115, outcome: 'Starter' },
  },
  {
    pick: 24, team: 'Boston Celtics', name: 'Kendrick Perkins', school: 'Clifton J. Ozen HS', pos: 'C',
    birthYear: 1984, height: 82, weight: 280, wingspan: 86, conf: 'Prep',
    archetype: 'Paint Anchor',
    stats: { games: 20, mpg: 26.0, ppg: 14.0, rpg: 10.0, apg: 1.0, spg: 0.5, bpg: 3.0, tov: 2.0, pf: 3.5, fg_pct: 0.560, three_pt_pct: null, ft_pct: 0.580, pts_per40: 21.5, reb_per40: 15.4, ast_per40: 1.5, stl_per40: 0.8, blk_per40: 4.6, tov_per40: 3.1, usg: 0.240, per: 20.0, bpm: 4.0, obpm: -0.5, dbpm: 4.5, ws: 3.0, efg_pct: 0.560, ts_pct: 0.570, ast_pct: 0.055, tov_pct: 0.135, stl_pct: 0.013, blk_pct: 0.090, orb_pct: 0.095, drb_pct: 0.235, drtg: 93.0 },
    nba: { ppg: 5.4, rpg: 5.8, apg: 0.5, spg: 0.4, bpg: 0.9, ws48: 0.104, outcome: 'Starter' },
  },
  // Second round notable picks
  {
    pick: 34, team: 'Memphis Grizzlies', name: 'Kyle Korver', school: 'Creighton', pos: 'SG',
    birthYear: 1981, height: 79, weight: 212, wingspan: 82, conf: 'Missouri Valley',
    archetype: 'Movement Shooter',
    stats: { games: 33, mpg: 34.0, ppg: 17.8, rpg: 5.5, apg: 2.5, spg: 1.0, bpg: 0.3, tov: 1.5, pf: 1.5, fg_pct: 0.470, three_pt_pct: 0.450, ft_pct: 0.890, pts_per40: 20.9, reb_per40: 6.5, ast_per40: 2.9, stl_per40: 1.2, blk_per40: 0.4, tov_per40: 1.8, usg: 0.248, per: 20.5, bpm: 6.5, obpm: 5.5, dbpm: 1.0, ws: 6.5, efg_pct: 0.545, ts_pct: 0.650, ast_pct: 0.122, tov_pct: 0.085, stl_pct: 0.019, blk_pct: 0.007, orb_pct: 0.025, drb_pct: 0.110, drtg: 97.5 },
    nba: { ppg: 9.7, rpg: 3.1, apg: 2.0, spg: 0.6, bpg: 0.2, ws48: 0.130, outcome: 'All-Star' },
  },
  {
    pick: 35, team: 'Detroit Pistons', name: 'Carlos Delfino', school: 'Ghiacciaroli (Italy)', pos: 'SG',
    birthYear: 1982, height: 78, weight: 230, wingspan: 82, conf: 'EuroLeague',
    archetype: '3 and D Wing',
    stats: { games: 25, mpg: 20.0, ppg: 8.0, rpg: 3.0, apg: 1.5, spg: 0.8, bpg: 0.2, tov: 1.2, pf: 2.0, fg_pct: 0.440, three_pt_pct: 0.370, ft_pct: 0.780, pts_per40: 16.0, reb_per40: 6.0, ast_per40: 3.0, stl_per40: 1.6, blk_per40: 0.4, tov_per40: 2.4, usg: 0.210, per: 14.0, bpm: 1.0, obpm: 0.5, dbpm: 0.5, ws: 1.5, efg_pct: 0.475, ts_pct: 0.545, ast_pct: 0.120, tov_pct: 0.120, stl_pct: 0.026, blk_pct: 0.008, orb_pct: 0.020, drb_pct: 0.075, drtg: 103.0 },
    nba: { ppg: 7.8, rpg: 3.0, apg: 1.5, spg: 0.7, bpg: 0.3, ws48: 0.068, outcome: 'Role Player' },
  },
  {
    pick: 41, team: 'Milwaukee Bucks', name: 'Steve Blake', school: 'Maryland', pos: 'PG',
    birthYear: 1980, height: 75, weight: 172, wingspan: 79, conf: 'ACC',
    archetype: 'Secondary Playmaker',
    stats: { games: 33, mpg: 34.0, ppg: 12.0, rpg: 3.5, apg: 6.5, spg: 1.5, bpg: 0.1, tov: 2.0, pf: 1.5, fg_pct: 0.415, three_pt_pct: 0.380, ft_pct: 0.810, pts_per40: 14.1, reb_per40: 4.1, ast_per40: 7.6, stl_per40: 1.8, blk_per40: 0.1, tov_per40: 2.4, usg: 0.200, per: 16.5, bpm: 4.5, obpm: 2.5, dbpm: 2.0, ws: 4.5, efg_pct: 0.455, ts_pct: 0.545, ast_pct: 0.335, tov_pct: 0.125, stl_pct: 0.029, blk_pct: 0.002, orb_pct: 0.015, drb_pct: 0.065, drtg: 96.0 },
    nba: { ppg: 6.5, rpg: 2.0, apg: 3.5, spg: 0.7, bpg: 0.1, ws48: 0.072, outcome: 'Role Player' },
  },
  {
    pick: 47, team: 'Dallas Mavericks', name: 'Josh Howard', school: 'Wake Forest', pos: 'SF',
    birthYear: 1980, height: 79, weight: 210, wingspan: 84, conf: 'ACC',
    archetype: 'Two Way Star Wing',
    stats: { games: 30, mpg: 34.0, ppg: 19.5, rpg: 7.5, apg: 2.5, spg: 1.5, bpg: 0.8, tov: 2.0, pf: 2.0, fg_pct: 0.475, three_pt_pct: 0.365, ft_pct: 0.760, pts_per40: 22.9, reb_per40: 8.8, ast_per40: 2.9, stl_per40: 1.8, blk_per40: 0.9, tov_per40: 2.4, usg: 0.272, per: 22.0, bpm: 8.0, obpm: 5.0, dbpm: 3.0, ws: 6.5, efg_pct: 0.505, ts_pct: 0.570, ast_pct: 0.118, tov_pct: 0.105, stl_pct: 0.029, blk_pct: 0.019, orb_pct: 0.045, drb_pct: 0.140, drtg: 94.5 },
    nba: { ppg: 12.7, rpg: 5.5, apg: 1.8, spg: 1.2, bpg: 0.4, ws48: 0.118, outcome: 'All-Star' },
  },
  {
    pick: 51, team: 'Sacramento Kings', name: 'Matt Bonner', school: 'Florida', pos: 'PF',
    birthYear: 1980, height: 82, weight: 235, wingspan: 84, conf: 'SEC',
    archetype: 'Stretch Big',
    stats: { games: 35, mpg: 32.0, ppg: 14.5, rpg: 6.5, apg: 1.5, spg: 0.5, bpg: 0.3, tov: 1.2, pf: 2.0, fg_pct: 0.480, three_pt_pct: 0.405, ft_pct: 0.840, pts_per40: 18.1, reb_per40: 8.1, ast_per40: 1.9, stl_per40: 0.6, blk_per40: 0.4, tov_per40: 1.5, usg: 0.225, per: 17.0, bpm: 4.0, obpm: 3.0, dbpm: 1.0, ws: 4.5, efg_pct: 0.535, ts_pct: 0.610, ast_pct: 0.078, tov_pct: 0.075, stl_pct: 0.010, blk_pct: 0.007, orb_pct: 0.025, drb_pct: 0.115, drtg: 99.5 },
    nba: { ppg: 5.5, rpg: 3.0, apg: 0.7, spg: 0.3, bpg: 0.1, ws48: 0.082, outcome: 'Role Player' },
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
}

async function seed() {
  console.log(`Seeding ${DRAFT_CLASS} NBA Draft — Legendary Archives`)
  console.log(`Processing ${PLAYERS.length} players...`)

  for (const p of PLAYERS) {
    const playerId = pid(p.name, p.birthYear)
    console.log(`  ${p.pick}. ${p.name} (${playerId})`)

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

    await upsert('prospects', {
      player_id: playerId,
      team: p.school,
      league_conf: p.conf,
      height: p.height,
      weight: p.weight,
      wingspan: p.wingspan,
      class: p.birthYear <= 1981 ? 'Senior' : p.birthYear <= 1983 ? 'Sophomore' : 'Freshman',
    })

    if (p.stats) {
      await upsert('stats', {
        player_id: playerId,
        season: SEASON,
        ...p.stats,
      })
    }

    await upsert('measurables', {
      player_id: playerId,
      height: p.height,
      weight: p.weight,
      wingspan: p.wingspan,
      ws_minus_h: p.wingspan && p.height ? p.wingspan - p.height : null,
    })

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

  console.log(`\nDone! ${PLAYERS.length} players seeded for ${DRAFT_CLASS} draft.`)
  console.log('Run Recalculate All on the site to generate scores.')
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
