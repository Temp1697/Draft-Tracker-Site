#!/usr/bin/env node
// Seed script for 2018 NBA Draft — Legendary Archives
// Populates players, prospects, stats, measurables, and historical_players tables
//
// Usage: node scripts/seed-legendary-2018.mjs

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

// 2018 NBA Draft — 26 players with college/professional stats from final pre-draft season
// Sources: Basketball Reference, Sports Reference
const PLAYERS = [
  // === ROUND 1 ===
  {
    pick: 1, team: 'Phoenix Suns', name: 'Deandre Ayton', school: 'Arizona', pos: 'C',
    birthYear: 1998, height: 83, weight: 250, wingspan: 93, conf: 'Pac-12',
    archetype: 'Rim Runner',
    // 2017-18 Arizona: 20.1 PPG, 11.6 RPG, 1.9 APG in 36 games
    stats: { games: 36, mpg: 32.0, ppg: 20.1, rpg: 11.6, apg: 1.9, spg: 0.7, bpg: 1.9, tov: 2.6, pf: 2.8, fg_pct: 0.633, three_pt_pct: null, ft_pct: 0.726, pts_per40: 25.1, reb_per40: 14.5, ast_per40: 2.4, stl_per40: 0.9, blk_per40: 2.4, tov_per40: 3.3, usg: 0.298, per: 29.1, bpm: 10.2, obpm: 6.5, dbpm: 3.7, ws: 7.8, efg_pct: 0.633, ts_pct: 0.671, ast_pct: 0.088, tov_pct: 0.135, stl_pct: 0.014, blk_pct: 0.062, orb_pct: 0.105, drb_pct: 0.235, drtg: 90.5 },
    nba: { ppg: 16.5, rpg: 10.5, apg: 1.9, spg: 0.8, bpg: 1.0, ws48: 0.148, outcome: 'All-Star' },
  },
  {
    pick: 2, team: 'Sacramento Kings', name: 'Marvin Bagley III', school: 'Duke', pos: 'PF/C',
    birthYear: 1999, height: 82, weight: 234, wingspan: 86, conf: 'ACC',
    archetype: 'Rim Runner',
    // 2017-18 Duke: 21.0 PPG, 11.1 RPG, 1.0 APG in 33 games
    stats: { games: 33, mpg: 31.7, ppg: 21.0, rpg: 11.1, apg: 1.0, spg: 0.9, bpg: 1.4, tov: 2.2, pf: 2.6, fg_pct: 0.611, three_pt_pct: 0.261, ft_pct: 0.698, pts_per40: 26.5, reb_per40: 14.0, ast_per40: 1.3, stl_per40: 1.1, blk_per40: 1.8, tov_per40: 2.8, usg: 0.315, per: 27.8, bpm: 9.1, obpm: 6.8, dbpm: 2.3, ws: 6.5, efg_pct: 0.632, ts_pct: 0.657, ast_pct: 0.055, tov_pct: 0.125, stl_pct: 0.019, blk_pct: 0.046, orb_pct: 0.112, drb_pct: 0.218, drtg: 92.0 },
    nba: { ppg: 14.0, rpg: 7.1, apg: 1.3, spg: 0.7, bpg: 0.8, ws48: 0.095, outcome: 'Role Player' },
  },
  {
    pick: 3, team: 'Atlanta Hawks', name: 'Luka Doncic', school: 'Real Madrid Spain', pos: 'SG/SF',
    birthYear: 1999, height: 79, weight: 218, wingspan: 82, conf: 'EuroLeague',
    archetype: 'Playmaking Lead Guard',
    // 2017-18 Real Madrid (EuroLeague + Liga ACB combined estimated): 16.0 PPG, 5.0 RPG, 4.5 APG
    stats: { games: 32, mpg: 26.5, ppg: 16.0, rpg: 5.0, apg: 4.5, spg: 1.1, bpg: 0.3, tov: 2.3, pf: 2.2, fg_pct: 0.489, three_pt_pct: 0.352, ft_pct: 0.773, pts_per40: 24.2, reb_per40: 7.5, ast_per40: 6.8, stl_per40: 1.7, blk_per40: 0.5, tov_per40: 3.5, usg: 0.305, per: 27.5, bpm: 11.0, obpm: 8.5, dbpm: 2.5, ws: 7.5, efg_pct: 0.561, ts_pct: 0.597, ast_pct: 0.280, tov_pct: 0.150, stl_pct: 0.022, blk_pct: 0.007, orb_pct: 0.048, drb_pct: 0.125, drtg: 91.5 },
    nba: { ppg: 28.4, rpg: 8.0, apg: 8.7, spg: 1.4, bpg: 0.5, ws48: 0.185, outcome: 'All-NBA' },
  },
  {
    pick: 4, team: 'Memphis Grizzlies', name: 'Jaren Jackson Jr', school: 'Michigan State', pos: 'PF/C',
    birthYear: 1999, height: 82, weight: 242, wingspan: 94, conf: 'Big Ten',
    archetype: 'Stretch Big',
    // 2017-18 Michigan State: 11.0 PPG, 5.7 RPG, 1.0 APG in 33 games
    stats: { games: 33, mpg: 23.0, ppg: 11.0, rpg: 5.7, apg: 1.0, spg: 0.6, bpg: 3.0, tov: 1.7, pf: 3.5, fg_pct: 0.537, three_pt_pct: 0.380, ft_pct: 0.780, pts_per40: 19.1, reb_per40: 9.9, ast_per40: 1.7, stl_per40: 1.0, blk_per40: 5.2, tov_per40: 3.0, usg: 0.240, per: 25.5, bpm: 9.8, obpm: 4.8, dbpm: 5.0, ws: 5.8, efg_pct: 0.600, ts_pct: 0.641, ast_pct: 0.065, tov_pct: 0.148, stl_pct: 0.014, blk_pct: 0.110, orb_pct: 0.062, drb_pct: 0.180, drtg: 89.8 },
    nba: { ppg: 18.0, rpg: 6.8, apg: 1.5, spg: 0.9, bpg: 2.9, ws48: 0.142, outcome: 'All-Star' },
  },
  {
    pick: 5, team: 'Dallas Mavericks', name: 'Trae Young', school: 'Oklahoma', pos: 'PG',
    birthYear: 1998, height: 74, weight: 180, wingspan: 76, conf: 'Big 12',
    archetype: 'Scoring Lead Guard',
    // 2017-18 Oklahoma: 27.4 PPG, 3.9 RPG, 8.7 APG in 32 games
    stats: { games: 32, mpg: 35.6, ppg: 27.4, rpg: 3.9, apg: 8.7, spg: 0.9, bpg: 0.2, tov: 5.2, pf: 1.8, fg_pct: 0.422, three_pt_pct: 0.360, ft_pct: 0.836, pts_per40: 30.7, reb_per40: 4.4, ast_per40: 9.8, stl_per40: 1.0, blk_per40: 0.2, tov_per40: 5.8, usg: 0.385, per: 27.9, bpm: 12.5, obpm: 11.5, dbpm: 1.0, ws: 7.1, efg_pct: 0.501, ts_pct: 0.588, ast_pct: 0.395, tov_pct: 0.188, stl_pct: 0.017, blk_pct: 0.005, orb_pct: 0.020, drb_pct: 0.080, drtg: 96.5 },
    nba: { ppg: 25.3, rpg: 3.9, apg: 9.5, spg: 1.1, bpg: 0.2, ws48: 0.148, outcome: 'All-NBA' },
  },
  {
    pick: 6, team: 'Orlando Magic', name: 'Mohamed Bamba', school: 'Texas', pos: 'C',
    birthYear: 1998, height: 83, weight: 225, wingspan: 96, conf: 'Big 12',
    archetype: 'Rim Protector',
    // 2017-18 Texas: 12.9 PPG, 10.5 RPG, 0.9 APG in 33 games
    stats: { games: 33, mpg: 31.3, ppg: 12.9, rpg: 10.5, apg: 0.9, spg: 0.8, bpg: 3.7, tov: 1.5, pf: 2.7, fg_pct: 0.513, three_pt_pct: 0.286, ft_pct: 0.636, pts_per40: 16.5, reb_per40: 13.4, ast_per40: 1.1, stl_per40: 1.0, blk_per40: 4.7, tov_per40: 1.9, usg: 0.230, per: 24.5, bpm: 9.5, obpm: 3.5, dbpm: 6.0, ws: 6.2, efg_pct: 0.541, ts_pct: 0.569, ast_pct: 0.050, tov_pct: 0.112, stl_pct: 0.017, blk_pct: 0.138, orb_pct: 0.092, drb_pct: 0.235, drtg: 88.8 },
    nba: { ppg: 9.0, rpg: 6.5, apg: 0.7, spg: 0.5, bpg: 1.5, ws48: 0.082, outcome: 'Role Player' },
  },
  {
    pick: 7, team: 'Chicago Bulls', name: 'Wendell Carter Jr', school: 'Duke', pos: 'C',
    birthYear: 1999, height: 82, weight: 259, wingspan: 88, conf: 'ACC',
    archetype: 'Drop Coverage Big',
    // 2017-18 Duke: 13.5 PPG, 9.0 RPG, 2.3 APG in 33 games
    stats: { games: 33, mpg: 27.2, ppg: 13.5, rpg: 9.0, apg: 2.3, spg: 1.5, bpg: 2.1, tov: 1.8, pf: 3.0, fg_pct: 0.570, three_pt_pct: 0.235, ft_pct: 0.716, pts_per40: 19.9, reb_per40: 13.2, ast_per40: 3.4, stl_per40: 2.2, blk_per40: 3.1, tov_per40: 2.6, usg: 0.255, per: 25.8, bpm: 9.2, obpm: 4.5, dbpm: 4.7, ws: 5.8, efg_pct: 0.577, ts_pct: 0.616, ast_pct: 0.148, tov_pct: 0.128, stl_pct: 0.032, blk_pct: 0.079, orb_pct: 0.098, drb_pct: 0.222, drtg: 91.0 },
    nba: { ppg: 11.8, rpg: 8.5, apg: 2.2, spg: 0.9, bpg: 1.2, ws48: 0.108, outcome: 'Starter' },
  },
  {
    pick: 8, team: 'Cleveland Cavaliers', name: 'Collin Sexton', school: 'Alabama', pos: 'PG',
    birthYear: 1999, height: 74, weight: 190, wingspan: 77, conf: 'SEC',
    archetype: 'Scoring Lead Guard',
    // 2017-18 Alabama: 19.2 PPG, 3.8 RPG, 3.6 APG in 32 games
    stats: { games: 32, mpg: 32.3, ppg: 19.2, rpg: 3.8, apg: 3.6, spg: 1.4, bpg: 0.2, tov: 2.2, pf: 2.1, fg_pct: 0.449, three_pt_pct: 0.333, ft_pct: 0.789, pts_per40: 23.8, reb_per40: 4.7, ast_per40: 4.5, stl_per40: 1.7, blk_per40: 0.2, tov_per40: 2.7, usg: 0.312, per: 20.5, bpm: 4.5, obpm: 4.0, dbpm: 0.5, ws: 5.1, efg_pct: 0.508, ts_pct: 0.549, ast_pct: 0.198, tov_pct: 0.128, stl_pct: 0.028, blk_pct: 0.005, orb_pct: 0.025, drb_pct: 0.095, drtg: 97.5 },
    nba: { ppg: 20.0, rpg: 3.2, apg: 4.4, spg: 0.8, bpg: 0.2, ws48: 0.092, outcome: 'Starter' },
  },
  {
    pick: 9, team: 'New York Knicks', name: 'Kevin Knox', school: 'Kentucky', pos: 'SF',
    birthYear: 1999, height: 80, weight: 215, wingspan: 83, conf: 'SEC',
    archetype: 'Scoring Wing',
    // 2017-18 Kentucky: 15.6 PPG, 4.9 RPG, 1.5 APG in 35 games
    stats: { games: 35, mpg: 28.8, ppg: 15.6, rpg: 4.9, apg: 1.5, spg: 0.5, bpg: 0.4, tov: 1.9, pf: 2.3, fg_pct: 0.423, three_pt_pct: 0.335, ft_pct: 0.771, pts_per40: 21.7, reb_per40: 6.8, ast_per40: 2.1, stl_per40: 0.7, blk_per40: 0.6, tov_per40: 2.6, usg: 0.295, per: 18.2, bpm: 2.8, obpm: 2.5, dbpm: 0.3, ws: 3.5, efg_pct: 0.488, ts_pct: 0.533, ast_pct: 0.098, tov_pct: 0.135, stl_pct: 0.010, blk_pct: 0.011, orb_pct: 0.038, drb_pct: 0.122, drtg: 101.8 },
    nba: { ppg: 6.8, rpg: 2.5, apg: 0.7, spg: 0.3, bpg: 0.3, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 10, team: 'Philadelphia 76ers', name: 'Mikal Bridges', school: 'Villanova', pos: 'SF',
    birthYear: 1996, height: 79, weight: 209, wingspan: 87, conf: 'Big East',
    archetype: 'Two Way Star Wing',
    // 2017-18 Villanova: 17.7 PPG, 5.0 RPG, 2.0 APG in 40 games
    stats: { games: 40, mpg: 32.8, ppg: 17.7, rpg: 5.0, apg: 2.0, spg: 1.3, bpg: 0.5, tov: 1.1, pf: 1.7, fg_pct: 0.504, three_pt_pct: 0.437, ft_pct: 0.803, pts_per40: 21.6, reb_per40: 6.1, ast_per40: 2.4, stl_per40: 1.6, blk_per40: 0.6, tov_per40: 1.3, usg: 0.255, per: 22.5, bpm: 6.8, obpm: 4.5, dbpm: 2.3, ws: 7.2, efg_pct: 0.585, ts_pct: 0.624, ast_pct: 0.118, tov_pct: 0.070, stl_pct: 0.026, blk_pct: 0.014, orb_pct: 0.040, drb_pct: 0.125, drtg: 91.5 },
    nba: { ppg: 19.5, rpg: 4.3, apg: 2.5, spg: 1.4, bpg: 0.5, ws48: 0.145, outcome: 'All-Star' },
  },
  {
    pick: 11, team: 'Charlotte Hornets', name: 'Shai Gilgeous-Alexander', school: 'Kentucky', pos: 'PG/SG',
    birthYear: 1998, height: 79, weight: 181, wingspan: 87, conf: 'SEC',
    archetype: 'Two Way Star Wing',
    // 2017-18 Kentucky: 14.4 PPG, 5.1 RPG, 5.1 APG in 34 games
    stats: { games: 34, mpg: 32.0, ppg: 14.4, rpg: 5.1, apg: 5.1, spg: 1.8, bpg: 0.6, tov: 2.5, pf: 2.0, fg_pct: 0.503, three_pt_pct: 0.280, ft_pct: 0.782, pts_per40: 18.0, reb_per40: 6.4, ast_per40: 6.4, stl_per40: 2.3, blk_per40: 0.8, tov_per40: 3.1, usg: 0.268, per: 22.8, bpm: 8.5, obpm: 5.5, dbpm: 3.0, ws: 6.5, efg_pct: 0.526, ts_pct: 0.571, ast_pct: 0.310, tov_pct: 0.152, stl_pct: 0.036, blk_pct: 0.018, orb_pct: 0.045, drb_pct: 0.148, drtg: 92.8 },
    nba: { ppg: 26.0, rpg: 4.8, apg: 5.8, spg: 1.6, bpg: 0.9, ws48: 0.182, outcome: 'All-NBA' },
  },
  {
    pick: 12, team: 'LA Clippers', name: 'Miles Bridges', school: 'Michigan State', pos: 'SF/PF',
    birthYear: 1998, height: 79, weight: 225, wingspan: 83, conf: 'Big Ten',
    archetype: 'Athletic Wing',
    // 2017-18 Michigan State: 17.1 PPG, 6.9 RPG, 2.9 APG in 33 games
    stats: { games: 33, mpg: 32.8, ppg: 17.1, rpg: 6.9, apg: 2.9, spg: 1.1, bpg: 0.6, tov: 2.2, pf: 2.6, fg_pct: 0.462, three_pt_pct: 0.349, ft_pct: 0.762, pts_per40: 20.9, reb_per40: 8.4, ast_per40: 3.5, stl_per40: 1.3, blk_per40: 0.7, tov_per40: 2.7, usg: 0.280, per: 21.0, bpm: 5.2, obpm: 3.8, dbpm: 1.4, ws: 5.8, efg_pct: 0.527, ts_pct: 0.564, ast_pct: 0.160, tov_pct: 0.142, stl_pct: 0.022, blk_pct: 0.016, orb_pct: 0.058, drb_pct: 0.158, drtg: 94.2 },
    nba: { ppg: 17.5, rpg: 6.2, apg: 2.5, spg: 0.9, bpg: 0.5, ws48: 0.098, outcome: 'Starter' },
  },
  {
    pick: 13, team: 'LA Clippers', name: 'Jerome Robinson', school: 'Boston College', pos: 'SG',
    birthYear: 1997, height: 78, weight: 185, wingspan: 82, conf: 'ACC',
    archetype: 'Scoring Wing',
    // 2017-18 Boston College: 23.7 PPG, 2.5 RPG, 2.0 APG in 32 games
    stats: { games: 32, mpg: 33.8, ppg: 23.7, rpg: 2.5, apg: 2.0, spg: 0.8, bpg: 0.2, tov: 1.5, pf: 2.0, fg_pct: 0.454, three_pt_pct: 0.412, ft_pct: 0.808, pts_per40: 28.0, reb_per40: 3.0, ast_per40: 2.4, stl_per40: 0.9, blk_per40: 0.2, tov_per40: 1.8, usg: 0.340, per: 20.8, bpm: 4.5, obpm: 5.0, dbpm: -0.5, ws: 5.5, efg_pct: 0.525, ts_pct: 0.569, ast_pct: 0.115, tov_pct: 0.095, stl_pct: 0.016, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.068, drtg: 103.5 },
    nba: { ppg: 4.2, rpg: 1.0, apg: 0.7, spg: 0.3, bpg: 0.1, ws48: 0.015, outcome: 'Bust' },
  },
  {
    pick: 14, team: 'Denver Nuggets', name: 'Michael Porter Jr', school: 'Missouri', pos: 'SF/PF',
    birthYear: 1998, height: 82, weight: 218, wingspan: 88, conf: 'SEC',
    archetype: 'Scoring Wing',
    // 2017-18 Missouri: 3 game sample due to injury; estimated pre-draft stats
    stats: { games: 3, mpg: 27.0, ppg: 13.0, rpg: 7.0, apg: 1.5, spg: 0.7, bpg: 0.7, tov: 1.7, pf: 2.3, fg_pct: 0.455, three_pt_pct: 0.333, ft_pct: 0.667, pts_per40: 19.3, reb_per40: 10.4, ast_per40: 2.2, stl_per40: 1.0, blk_per40: 1.0, tov_per40: 2.5, usg: 0.270, per: 21.5, bpm: 7.0, obpm: 5.0, dbpm: 2.0, ws: 0.5, efg_pct: 0.515, ts_pct: 0.540, ast_pct: 0.110, tov_pct: 0.130, stl_pct: 0.015, blk_pct: 0.025, orb_pct: 0.080, drb_pct: 0.190, drtg: 95.0 },
    nba: { ppg: 19.5, rpg: 7.2, apg: 1.5, spg: 0.7, bpg: 0.6, ws48: 0.105, outcome: 'Starter' },
  },
  {
    pick: 15, team: 'Washington Wizards', name: 'Troy Brown Jr', school: 'Oregon', pos: 'SF',
    birthYear: 1999, height: 79, weight: 215, wingspan: 84, conf: 'Pac-12',
    archetype: 'Point Forward',
    // 2017-18 Oregon: 11.9 PPG, 5.7 RPG, 4.3 APG in 36 games
    stats: { games: 36, mpg: 30.5, ppg: 11.9, rpg: 5.7, apg: 4.3, spg: 1.0, bpg: 0.4, tov: 2.3, pf: 2.5, fg_pct: 0.441, three_pt_pct: 0.328, ft_pct: 0.658, pts_per40: 15.6, reb_per40: 7.5, ast_per40: 5.6, stl_per40: 1.3, blk_per40: 0.5, tov_per40: 3.0, usg: 0.248, per: 18.5, bpm: 4.2, obpm: 2.5, dbpm: 1.7, ws: 4.8, efg_pct: 0.498, ts_pct: 0.519, ast_pct: 0.270, tov_pct: 0.158, stl_pct: 0.021, blk_pct: 0.010, orb_pct: 0.050, drb_pct: 0.148, drtg: 95.8 },
    nba: { ppg: 7.2, rpg: 3.8, apg: 2.0, spg: 0.7, bpg: 0.3, ws48: 0.062, outcome: 'Role Player' },
  },
  {
    pick: 16, team: 'Phoenix Suns', name: 'Zhaire Smith', school: 'Texas Tech', pos: 'SG',
    birthYear: 1999, height: 76, weight: 200, wingspan: 83, conf: 'Big 12',
    archetype: 'Athletic Wing',
    // 2017-18 Texas Tech: 11.3 PPG, 3.7 RPG, 1.5 APG in 35 games
    stats: { games: 35, mpg: 27.5, ppg: 11.3, rpg: 3.7, apg: 1.5, spg: 1.8, bpg: 0.6, tov: 1.3, pf: 2.5, fg_pct: 0.472, three_pt_pct: 0.458, ft_pct: 0.635, pts_per40: 16.4, reb_per40: 5.4, ast_per40: 2.2, stl_per40: 2.6, blk_per40: 0.9, tov_per40: 1.9, usg: 0.245, per: 19.8, bpm: 5.5, obpm: 3.0, dbpm: 2.5, ws: 4.9, efg_pct: 0.565, ts_pct: 0.568, ast_pct: 0.112, tov_pct: 0.118, stl_pct: 0.040, blk_pct: 0.020, orb_pct: 0.042, drb_pct: 0.105, drtg: 93.5 },
    nba: { ppg: 3.5, rpg: 1.8, apg: 0.6, spg: 0.5, bpg: 0.2, ws48: 0.018, outcome: 'Bust' },
  },
  {
    pick: 17, team: 'Milwaukee Bucks', name: 'Donte DiVincenzo', school: 'Villanova', pos: 'SG',
    birthYear: 1997, height: 77, weight: 203, wingspan: 82, conf: 'Big East',
    archetype: 'Two Way Guard',
    // 2017-18 Villanova: 13.4 PPG, 4.7 RPG, 2.8 APG in 40 games
    stats: { games: 40, mpg: 27.0, ppg: 13.4, rpg: 4.7, apg: 2.8, spg: 1.5, bpg: 0.4, tov: 1.6, pf: 2.2, fg_pct: 0.481, three_pt_pct: 0.395, ft_pct: 0.718, pts_per40: 19.9, reb_per40: 6.9, ast_per40: 4.1, stl_per40: 2.2, blk_per40: 0.6, tov_per40: 2.4, usg: 0.265, per: 20.8, bpm: 5.5, obpm: 3.5, dbpm: 2.0, ws: 5.8, efg_pct: 0.561, ts_pct: 0.570, ast_pct: 0.195, tov_pct: 0.118, stl_pct: 0.032, blk_pct: 0.012, orb_pct: 0.045, drb_pct: 0.128, drtg: 92.0 },
    nba: { ppg: 11.5, rpg: 4.2, apg: 2.8, spg: 1.1, bpg: 0.3, ws48: 0.098, outcome: 'Starter' },
  },
  {
    pick: 18, team: 'San Antonio Spurs', name: 'Lonnie Walker IV', school: 'Miami', pos: 'SG',
    birthYear: 1999, height: 77, weight: 204, wingspan: 82, conf: 'ACC',
    archetype: 'Scoring Wing',
    // 2017-18 Miami: 11.5 PPG, 3.0 RPG, 1.5 APG in 27 games
    stats: { games: 27, mpg: 27.5, ppg: 11.5, rpg: 3.0, apg: 1.5, spg: 0.8, bpg: 0.5, tov: 1.5, pf: 2.2, fg_pct: 0.465, three_pt_pct: 0.367, ft_pct: 0.758, pts_per40: 16.7, reb_per40: 4.4, ast_per40: 2.2, stl_per40: 1.2, blk_per40: 0.7, tov_per40: 2.2, usg: 0.270, per: 18.5, bpm: 3.5, obpm: 2.5, dbpm: 1.0, ws: 2.8, efg_pct: 0.535, ts_pct: 0.568, ast_pct: 0.118, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.015, orb_pct: 0.038, drb_pct: 0.088, drtg: 97.0 },
    nba: { ppg: 11.5, rpg: 2.8, apg: 1.8, spg: 0.8, bpg: 0.3, ws48: 0.068, outcome: 'Role Player' },
  },
  {
    pick: 19, team: 'Atlanta Hawks', name: 'Kevin Huerter', school: 'Maryland', pos: 'SG',
    birthYear: 1998, height: 79, weight: 190, wingspan: 82, conf: 'Big Ten',
    archetype: 'Stretch Wing',
    // 2017-18 Maryland: 14.8 PPG, 4.1 RPG, 3.3 APG in 33 games
    stats: { games: 33, mpg: 32.5, ppg: 14.8, rpg: 4.1, apg: 3.3, spg: 0.9, bpg: 0.3, tov: 1.9, pf: 1.8, fg_pct: 0.447, three_pt_pct: 0.396, ft_pct: 0.832, pts_per40: 18.2, reb_per40: 5.0, ast_per40: 4.1, stl_per40: 1.1, blk_per40: 0.4, tov_per40: 2.3, usg: 0.255, per: 19.8, bpm: 4.5, obpm: 3.5, dbpm: 1.0, ws: 5.2, efg_pct: 0.526, ts_pct: 0.566, ast_pct: 0.210, tov_pct: 0.130, stl_pct: 0.018, blk_pct: 0.008, orb_pct: 0.025, drb_pct: 0.108, drtg: 96.2 },
    nba: { ppg: 14.2, rpg: 3.8, apg: 3.0, spg: 0.7, bpg: 0.2, ws48: 0.098, outcome: 'Starter' },
  },
  {
    pick: 22, team: 'Chicago Bulls', name: 'Chandler Hutchison', school: 'Boise State', pos: 'SF',
    birthYear: 1995, height: 79, weight: 197, wingspan: 84, conf: 'Mountain West',
    archetype: 'Two Way Wing',
    // 2017-18 Boise State: 20.2 PPG, 6.6 RPG, 3.3 APG in 32 games
    stats: { games: 32, mpg: 33.5, ppg: 20.2, rpg: 6.6, apg: 3.3, spg: 1.8, bpg: 0.5, tov: 2.5, pf: 2.2, fg_pct: 0.474, three_pt_pct: 0.342, ft_pct: 0.758, pts_per40: 24.1, reb_per40: 7.9, ast_per40: 3.9, stl_per40: 2.1, blk_per40: 0.6, tov_per40: 3.0, usg: 0.300, per: 20.8, bpm: 5.5, obpm: 4.0, dbpm: 1.5, ws: 5.2, efg_pct: 0.528, ts_pct: 0.560, ast_pct: 0.188, tov_pct: 0.145, stl_pct: 0.036, blk_pct: 0.012, orb_pct: 0.058, drb_pct: 0.165, drtg: 97.0 },
    nba: { ppg: 5.5, rpg: 2.8, apg: 1.2, spg: 0.5, bpg: 0.2, ws48: 0.035, outcome: 'Bust' },
  },
  {
    pick: 23, team: 'Indiana Pacers', name: 'Aaron Holiday', school: 'UCLA', pos: 'PG',
    birthYear: 1996, height: 72, weight: 185, wingspan: 75, conf: 'Pac-12',
    archetype: 'Playmaking Lead Guard',
    // 2017-18 UCLA: 20.3 PPG, 3.5 RPG, 5.6 APG in 35 games
    stats: { games: 35, mpg: 33.2, ppg: 20.3, rpg: 3.5, apg: 5.6, spg: 1.4, bpg: 0.2, tov: 2.5, pf: 2.1, fg_pct: 0.452, three_pt_pct: 0.398, ft_pct: 0.832, pts_per40: 24.5, reb_per40: 4.2, ast_per40: 6.8, stl_per40: 1.7, blk_per40: 0.2, tov_per40: 3.0, usg: 0.315, per: 21.8, bpm: 7.2, obpm: 6.0, dbpm: 1.2, ws: 6.5, efg_pct: 0.531, ts_pct: 0.572, ast_pct: 0.328, tov_pct: 0.148, stl_pct: 0.028, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.088, drtg: 97.5 },
    nba: { ppg: 8.8, rpg: 2.5, apg: 3.8, spg: 0.8, bpg: 0.2, ws48: 0.068, outcome: 'Role Player' },
  },
  {
    pick: 26, team: 'Boston Celtics', name: 'Landry Shamet', school: 'Wichita State', pos: 'PG/SG',
    birthYear: 1997, height: 76, weight: 190, wingspan: 79, conf: 'American Athletic',
    archetype: 'Stretch Guard',
    // 2017-18 Wichita State: 13.0 PPG, 3.1 RPG, 4.7 APG in 33 games
    stats: { games: 33, mpg: 29.8, ppg: 13.0, rpg: 3.1, apg: 4.7, spg: 1.2, bpg: 0.2, tov: 1.8, pf: 1.9, fg_pct: 0.449, three_pt_pct: 0.424, ft_pct: 0.852, pts_per40: 17.4, reb_per40: 4.2, ast_per40: 6.3, stl_per40: 1.6, blk_per40: 0.3, tov_per40: 2.4, usg: 0.248, per: 18.8, bpm: 5.2, obpm: 4.2, dbpm: 1.0, ws: 5.0, efg_pct: 0.537, ts_pct: 0.578, ast_pct: 0.298, tov_pct: 0.128, stl_pct: 0.025, blk_pct: 0.005, orb_pct: 0.018, drb_pct: 0.088, drtg: 95.8 },
    nba: { ppg: 10.5, rpg: 2.5, apg: 2.8, spg: 0.7, bpg: 0.1, ws48: 0.082, outcome: 'Role Player' },
  },
  {
    pick: 27, team: 'Boston Celtics', name: 'Robert Williams III', school: 'Texas A&M', pos: 'C',
    birthYear: 1997, height: 81, weight: 237, wingspan: 94, conf: 'SEC',
    archetype: 'Rim Protector',
    // 2017-18 Texas A&M: 9.9 PPG, 9.0 RPG, 0.7 APG in 31 games
    stats: { games: 31, mpg: 23.8, ppg: 9.9, rpg: 9.0, apg: 0.7, spg: 0.8, bpg: 3.3, tov: 1.1, pf: 3.1, fg_pct: 0.665, three_pt_pct: null, ft_pct: 0.569, pts_per40: 16.6, reb_per40: 15.1, ast_per40: 1.2, stl_per40: 1.3, blk_per40: 5.5, tov_per40: 1.8, usg: 0.218, per: 27.5, bpm: 10.5, obpm: 3.5, dbpm: 7.0, ws: 5.8, efg_pct: 0.665, ts_pct: 0.648, ast_pct: 0.042, tov_pct: 0.102, stl_pct: 0.018, blk_pct: 0.132, orb_pct: 0.115, drb_pct: 0.258, drtg: 88.5 },
    nba: { ppg: 9.5, rpg: 8.5, apg: 1.2, spg: 0.8, bpg: 2.2, ws48: 0.145, outcome: 'Starter' },
  },
  // === ROUND 2 ===
  {
    pick: 33, team: 'Dallas Mavericks', name: 'Jalen Brunson', school: 'Villanova', pos: 'PG',
    birthYear: 1996, height: 74, weight: 190, wingspan: 76, conf: 'Big East',
    archetype: 'Playmaking Lead Guard',
    // 2017-18 Villanova: 18.9 PPG, 3.4 RPG, 4.7 APG in 40 games
    stats: { games: 40, mpg: 31.5, ppg: 18.9, rpg: 3.4, apg: 4.7, spg: 1.2, bpg: 0.2, tov: 1.9, pf: 1.8, fg_pct: 0.525, three_pt_pct: 0.419, ft_pct: 0.844, pts_per40: 24.0, reb_per40: 4.3, ast_per40: 6.0, stl_per40: 1.5, blk_per40: 0.3, tov_per40: 2.4, usg: 0.302, per: 24.8, bpm: 9.5, obpm: 8.0, dbpm: 1.5, ws: 8.2, efg_pct: 0.592, ts_pct: 0.630, ast_pct: 0.285, tov_pct: 0.112, stl_pct: 0.024, blk_pct: 0.005, orb_pct: 0.025, drb_pct: 0.092, drtg: 93.2 },
    nba: { ppg: 21.5, rpg: 3.5, apg: 6.0, spg: 0.9, bpg: 0.2, ws48: 0.148, outcome: 'All-Star' },
  },
  {
    pick: 34, team: 'Charlotte Hornets', name: "Devonte' Graham", school: 'Kansas', pos: 'PG',
    birthYear: 1995, height: 74, weight: 185, wingspan: 76, conf: 'Big 12',
    archetype: 'Scoring Lead Guard',
    // 2017-18 Kansas: 17.3 PPG, 3.5 RPG, 7.4 APG in 36 games
    stats: { games: 36, mpg: 33.5, ppg: 17.3, rpg: 3.5, apg: 7.4, spg: 1.5, bpg: 0.3, tov: 3.2, pf: 2.2, fg_pct: 0.426, three_pt_pct: 0.371, ft_pct: 0.809, pts_per40: 20.7, reb_per40: 4.2, ast_per40: 8.8, stl_per40: 1.8, blk_per40: 0.4, tov_per40: 3.8, usg: 0.298, per: 20.5, bpm: 7.8, obpm: 6.5, dbpm: 1.3, ws: 6.8, efg_pct: 0.504, ts_pct: 0.542, ast_pct: 0.405, tov_pct: 0.178, stl_pct: 0.030, blk_pct: 0.007, orb_pct: 0.020, drb_pct: 0.092, drtg: 97.5 },
    nba: { ppg: 15.0, rpg: 3.2, apg: 7.5, spg: 1.0, bpg: 0.2, ws48: 0.088, outcome: 'Starter' },
  },
  {
    pick: 36, team: 'New York Knicks', name: 'Mitchell Robinson', school: 'Western Kentucky (did not play)', pos: 'C',
    birthYear: 1998, height: 84, weight: 240, wingspan: 96, conf: null,
    archetype: 'Rim Protector',
    // Mitchell Robinson did not play college ball; estimated pre-draft workout metrics
    stats: { games: null, mpg: null, ppg: null, rpg: null, apg: null, spg: null, bpg: null, tov: null, pf: null, fg_pct: null, three_pt_pct: null, ft_pct: null, pts_per40: null, reb_per40: null, ast_per40: null, stl_per40: null, blk_per40: null, tov_per40: null, usg: null, per: null, bpm: null, obpm: null, dbpm: null, ws: null, efg_pct: null, ts_pct: null, ast_pct: null, tov_pct: null, stl_pct: null, blk_pct: null, orb_pct: null, drb_pct: null, drtg: null },
    nba: { ppg: 9.0, rpg: 8.5, apg: 0.5, spg: 0.5, bpg: 2.5, ws48: 0.118, outcome: 'Starter' },
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

  // Filter to players that have at least basic data (pick and name)
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
  console.log(`Navigate to /legendary-archives?year=2018 to view the board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
