#!/usr/bin/env node
// Seed script for 2009 NBA Draft — Legendary Archives
// Populates players, prospects, stats, measurables, and historical_players tables
//
// Usage: node scripts/seed-legendary-2009.mjs

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

// 2009 NBA Draft — final college/pro season stats
// Sources: Basketball Reference, historical records
const PLAYERS = [
  // === ROUND 1 ===
  {
    pick: 1, team: 'Oklahoma City Thunder', name: 'Blake Griffin', school: 'Oklahoma', pos: 'PF',
    birthYear: 1989, height: 82, weight: 251, wingspan: 83.5, conf: 'Big 12',
    archetype: 'Athletic Power Forward',
    // 2008-09 Oklahoma: 22.7 PPG, 14.4 RPG, 2.2 APG in 35 games
    stats: { games: 35, mpg: 34.5, ppg: 22.7, rpg: 14.4, apg: 2.2, spg: 1.3, bpg: 2.1, tov: 2.8, pf: 3.2, fg_pct: 0.604, three_pt_pct: null, ft_pct: 0.654, pts_per40: 26.3, reb_per40: 16.7, ast_per40: 2.5, stl_per40: 1.5, blk_per40: 2.4, tov_per40: 3.2, usg: 0.302, per: 32.5, bpm: 14.2, obpm: 8.5, dbpm: 5.7, ws: 10.5, efg_pct: 0.604, ts_pct: 0.637, ast_pct: 0.115, tov_pct: 0.148, stl_pct: 0.025, blk_pct: 0.061, orb_pct: 0.148, drb_pct: 0.258, drtg: 86.5 },
    nba: { ppg: 21.7, rpg: 9.2, apg: 3.8, spg: 0.8, bpg: 0.5, ws48: 0.161, outcome: 'All-NBA' },
  },
  {
    pick: 2, team: 'Memphis Grizzlies', name: 'Hasheem Thabeet', school: 'UConn', pos: 'C',
    birthYear: 1987, height: 87, weight: 263, wingspan: 94, conf: 'Big East',
    archetype: 'Rim Protector',
    // 2008-09 UConn: 13.6 PPG, 10.8 RPG, 0.4 APG in 36 games
    stats: { games: 36, mpg: 28.5, ppg: 13.6, rpg: 10.8, apg: 0.4, spg: 0.8, bpg: 4.2, tov: 1.9, pf: 3.4, fg_pct: 0.612, three_pt_pct: null, ft_pct: 0.538, pts_per40: 19.1, reb_per40: 15.2, ast_per40: 0.6, stl_per40: 1.1, blk_per40: 5.9, tov_per40: 2.7, usg: 0.255, per: 24.8, bpm: 9.2, obpm: 2.8, dbpm: 6.4, ws: 7.5, efg_pct: 0.612, ts_pct: 0.602, ast_pct: 0.022, tov_pct: 0.140, stl_pct: 0.018, blk_pct: 0.168, orb_pct: 0.118, drb_pct: 0.295, drtg: 87.2 },
    nba: { ppg: 2.7, rpg: 3.0, apg: 0.1, spg: 0.2, bpg: 1.0, ws48: 0.030, outcome: 'Bust' },
  },
  {
    pick: 3, team: 'Oklahoma City Thunder', name: 'James Harden', school: 'Arizona State', pos: 'SG',
    birthYear: 1989, height: 77, weight: 220, wingspan: 83, conf: 'Pac-10',
    archetype: 'Scoring Lead Guard',
    // 2008-09 Arizona State: 20.1 PPG, 5.6 RPG, 4.3 APG in 36 games
    stats: { games: 36, mpg: 33.5, ppg: 20.1, rpg: 5.6, apg: 4.3, spg: 1.8, bpg: 0.6, tov: 2.9, pf: 2.5, fg_pct: 0.465, three_pt_pct: 0.368, ft_pct: 0.800, pts_per40: 24.0, reb_per40: 6.7, ast_per40: 5.1, stl_per40: 2.1, blk_per40: 0.7, tov_per40: 3.5, usg: 0.292, per: 23.2, bpm: 8.8, obpm: 6.5, dbpm: 2.3, ws: 8.0, efg_pct: 0.508, ts_pct: 0.591, ast_pct: 0.248, tov_pct: 0.152, stl_pct: 0.036, blk_pct: 0.015, orb_pct: 0.042, drb_pct: 0.122, drtg: 92.0 },
    nba: { ppg: 24.8, rpg: 5.5, apg: 6.9, spg: 1.5, bpg: 0.5, ws48: 0.196, outcome: 'MVP' },
  },
  {
    pick: 4, team: 'Sacramento Kings', name: 'Tyreke Evans', school: 'Memphis', pos: 'SG',
    birthYear: 1989, height: 77, weight: 215, wingspan: 81, conf: 'CUSA',
    archetype: 'Slasher Wing',
    // 2008-09 Memphis: 17.1 PPG, 4.6 RPG, 2.9 APG in 36 games
    stats: { games: 36, mpg: 30.8, ppg: 17.1, rpg: 4.6, apg: 2.9, spg: 1.4, bpg: 0.5, tov: 2.2, pf: 2.4, fg_pct: 0.457, three_pt_pct: 0.311, ft_pct: 0.772, pts_per40: 22.2, reb_per40: 6.0, ast_per40: 3.8, stl_per40: 1.8, blk_per40: 0.6, tov_per40: 2.9, usg: 0.275, per: 20.0, bpm: 6.2, obpm: 4.5, dbpm: 1.7, ws: 6.5, efg_pct: 0.490, ts_pct: 0.556, ast_pct: 0.168, tov_pct: 0.138, stl_pct: 0.030, blk_pct: 0.012, orb_pct: 0.048, drb_pct: 0.105, drtg: 94.5 },
    nba: { ppg: 16.2, rpg: 4.9, apg: 5.0, spg: 1.4, bpg: 0.4, ws48: 0.115, outcome: 'Starter' },
  },
  {
    pick: 5, team: 'Minnesota Timberwolves', name: 'Ricky Rubio', school: 'DKV Joventut Spain', pos: 'PG',
    birthYear: 1990, height: 76, weight: 180, wingspan: 81, conf: null,
    archetype: 'Primary Playmaker',
    // 2008-09 ACB Spain: 9.0 PPG, 3.4 RPG, 6.8 APG in 33 games
    stats: { games: 33, mpg: 25.5, ppg: 9.0, rpg: 3.4, apg: 6.8, spg: 2.1, bpg: 0.2, tov: 2.5, pf: 2.0, fg_pct: 0.385, three_pt_pct: 0.315, ft_pct: 0.720, pts_per40: 14.1, reb_per40: 5.3, ast_per40: 10.7, stl_per40: 3.3, blk_per40: 0.3, tov_per40: 3.9, usg: 0.198, per: 18.5, bpm: 5.5, obpm: 3.2, dbpm: 2.3, ws: 4.2, efg_pct: 0.432, ts_pct: 0.507, ast_pct: 0.395, tov_pct: 0.168, stl_pct: 0.048, blk_pct: 0.005, orb_pct: 0.025, drb_pct: 0.095, drtg: 93.8 },
    nba: { ppg: 11.1, rpg: 4.8, apg: 8.1, spg: 1.7, bpg: 0.2, ws48: 0.110, outcome: 'Starter' },
  },
  {
    pick: 6, team: 'Minnesota Timberwolves', name: 'Jonny Flynn', school: 'Syracuse', pos: 'PG',
    birthYear: 1989, height: 72, weight: 185, wingspan: 75, conf: 'Big East',
    archetype: 'Secondary Playmaker',
    // 2008-09 Syracuse: 17.4 PPG, 3.1 RPG, 6.7 APG in 34 games
    stats: { games: 34, mpg: 32.0, ppg: 17.4, rpg: 3.1, apg: 6.7, spg: 1.5, bpg: 0.2, tov: 3.0, pf: 2.2, fg_pct: 0.452, three_pt_pct: 0.345, ft_pct: 0.812, pts_per40: 21.8, reb_per40: 3.9, ast_per40: 8.4, stl_per40: 1.9, blk_per40: 0.3, tov_per40: 3.8, usg: 0.268, per: 20.8, bpm: 6.0, obpm: 4.5, dbpm: 1.5, ws: 6.2, efg_pct: 0.484, ts_pct: 0.559, ast_pct: 0.355, tov_pct: 0.158, stl_pct: 0.031, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.072, drtg: 95.5 },
    nba: { ppg: 9.2, rpg: 2.2, apg: 4.4, spg: 0.8, bpg: 0.1, ws48: 0.042, outcome: 'Bust' },
  },
  {
    pick: 7, team: 'Golden State Warriors', name: 'Stephen Curry', school: 'Davidson', pos: 'PG',
    birthYear: 1988, height: 75, weight: 185, wingspan: 78.5, conf: 'SoCon',
    archetype: 'Movement Shooter',
    // 2008-09 Davidson: 28.6 PPG, 5.6 RPG, 5.6 APG in 34 games
    stats: { games: 34, mpg: 34.2, ppg: 28.6, rpg: 5.6, apg: 5.6, spg: 2.5, bpg: 0.2, tov: 2.9, pf: 1.8, fg_pct: 0.469, three_pt_pct: 0.437, ft_pct: 0.883, pts_per40: 33.4, reb_per40: 6.5, ast_per40: 6.5, stl_per40: 2.9, blk_per40: 0.2, tov_per40: 3.4, usg: 0.322, per: 29.5, bpm: 12.8, obpm: 10.5, dbpm: 2.3, ws: 9.5, efg_pct: 0.556, ts_pct: 0.638, ast_pct: 0.288, tov_pct: 0.120, stl_pct: 0.050, blk_pct: 0.005, orb_pct: 0.032, drb_pct: 0.105, drtg: 91.5 },
    nba: { ppg: 24.3, rpg: 4.7, apg: 6.5, spg: 1.6, bpg: 0.2, ws48: 0.229, outcome: 'MVP' },
  },
  {
    pick: 8, team: 'New York Knicks', name: 'Jordan Hill', school: 'Arizona', pos: 'PF',
    birthYear: 1987, height: 81, weight: 235, wingspan: 87, conf: 'Pac-10',
    archetype: 'Rim Runner',
    // 2008-09 Arizona: 15.3 PPG, 10.0 RPG, 1.0 APG in 32 games
    stats: { games: 32, mpg: 30.5, ppg: 15.3, rpg: 10.0, apg: 1.0, spg: 0.8, bpg: 1.5, tov: 2.1, pf: 3.2, fg_pct: 0.556, three_pt_pct: null, ft_pct: 0.680, pts_per40: 20.1, reb_per40: 13.1, ast_per40: 1.3, stl_per40: 1.0, blk_per40: 2.0, tov_per40: 2.8, usg: 0.272, per: 22.5, bpm: 7.8, obpm: 3.2, dbpm: 4.6, ws: 6.5, efg_pct: 0.556, ts_pct: 0.601, ast_pct: 0.058, tov_pct: 0.145, stl_pct: 0.018, blk_pct: 0.055, orb_pct: 0.118, drb_pct: 0.228, drtg: 90.5 },
    nba: { ppg: 6.2, rpg: 5.6, apg: 0.5, spg: 0.5, bpg: 0.7, ws48: 0.072, outcome: 'Role Player' },
  },
  {
    pick: 9, team: 'Toronto Raptors', name: 'DeMar DeRozan', school: 'USC', pos: 'SG',
    birthYear: 1989, height: 78, weight: 220, wingspan: 81.5, conf: 'Pac-10',
    archetype: 'Two Way Star Wing',
    // 2008-09 USC: 13.9 PPG, 3.9 RPG, 1.5 APG in 32 games
    stats: { games: 32, mpg: 30.5, ppg: 13.9, rpg: 3.9, apg: 1.5, spg: 0.8, bpg: 0.5, tov: 1.9, pf: 2.1, fg_pct: 0.478, three_pt_pct: 0.198, ft_pct: 0.765, pts_per40: 18.2, reb_per40: 5.1, ast_per40: 2.0, stl_per40: 1.0, blk_per40: 0.7, tov_per40: 2.5, usg: 0.248, per: 17.8, bpm: 4.2, obpm: 3.0, dbpm: 1.2, ws: 5.0, efg_pct: 0.488, ts_pct: 0.548, ast_pct: 0.082, tov_pct: 0.128, stl_pct: 0.017, blk_pct: 0.012, orb_pct: 0.052, drb_pct: 0.098, drtg: 95.2 },
    nba: { ppg: 19.7, rpg: 4.1, apg: 3.3, spg: 1.1, bpg: 0.3, ws48: 0.122, outcome: 'All-NBA' },
  },
  {
    pick: 10, team: 'Milwaukee Bucks', name: 'Brandon Jennings', school: 'Lottomatica Roma Italy', pos: 'PG',
    birthYear: 1989, height: 74, weight: 170, wingspan: 78, conf: null,
    archetype: 'Scoring Lead Guard',
    // 2008-09 Italy Lega2: 8.0 PPG, 1.7 RPG, 4.5 APG in 15 games
    stats: { games: 15, mpg: 22.5, ppg: 8.0, rpg: 1.7, apg: 4.5, spg: 1.2, bpg: 0.1, tov: 2.2, pf: 1.8, fg_pct: 0.385, three_pt_pct: 0.318, ft_pct: 0.758, pts_per40: 14.2, reb_per40: 3.0, ast_per40: 8.0, stl_per40: 2.1, blk_per40: 0.2, tov_per40: 3.9, usg: 0.228, per: 15.5, bpm: 3.5, obpm: 2.5, dbpm: 1.0, ws: 1.8, efg_pct: 0.430, ts_pct: 0.500, ast_pct: 0.355, tov_pct: 0.155, stl_pct: 0.036, blk_pct: 0.003, orb_pct: 0.018, drb_pct: 0.058, drtg: 99.5 },
    nba: { ppg: 14.6, rpg: 3.1, apg: 5.9, spg: 1.2, bpg: 0.2, ws48: 0.086, outcome: 'Starter' },
  },
  {
    pick: 11, team: 'New Jersey Nets', name: 'Terrence Williams', school: 'Louisville', pos: 'SF',
    birthYear: 1987, height: 78, weight: 218, wingspan: 83, conf: 'Big East',
    archetype: 'Slasher Wing',
    // 2008-09 Louisville: 12.4 PPG, 6.9 RPG, 5.3 APG in 36 games
    stats: { games: 36, mpg: 33.5, ppg: 12.4, rpg: 6.9, apg: 5.3, spg: 2.4, bpg: 0.8, tov: 2.8, pf: 2.5, fg_pct: 0.445, three_pt_pct: 0.290, ft_pct: 0.680, pts_per40: 14.8, reb_per40: 8.2, ast_per40: 6.3, stl_per40: 2.9, blk_per40: 1.0, tov_per40: 3.3, usg: 0.235, per: 18.8, bpm: 5.5, obpm: 2.8, dbpm: 2.7, ws: 6.2, efg_pct: 0.475, ts_pct: 0.512, ast_pct: 0.288, tov_pct: 0.162, stl_pct: 0.048, blk_pct: 0.018, orb_pct: 0.062, drb_pct: 0.152, drtg: 91.5 },
    nba: { ppg: 5.5, rpg: 3.2, apg: 2.0, spg: 0.7, bpg: 0.3, ws48: 0.040, outcome: 'Bust' },
  },
  {
    pick: 12, team: 'Charlotte Bobcats', name: 'Gerald Henderson', school: 'Duke', pos: 'SG',
    birthYear: 1987, height: 77, weight: 215, wingspan: 82, conf: 'ACC',
    archetype: 'Two Way Star Wing',
    // 2008-09 Duke: 15.5 PPG, 4.5 RPG, 2.6 APG in 36 games
    stats: { games: 36, mpg: 30.2, ppg: 15.5, rpg: 4.5, apg: 2.6, spg: 1.5, bpg: 0.4, tov: 2.0, pf: 2.4, fg_pct: 0.480, three_pt_pct: 0.302, ft_pct: 0.756, pts_per40: 20.5, reb_per40: 6.0, ast_per40: 3.4, stl_per40: 2.0, blk_per40: 0.5, tov_per40: 2.6, usg: 0.255, per: 18.5, bpm: 4.8, obpm: 3.5, dbpm: 1.3, ws: 5.5, efg_pct: 0.502, ts_pct: 0.558, ast_pct: 0.145, tov_pct: 0.132, stl_pct: 0.032, blk_pct: 0.010, orb_pct: 0.048, drb_pct: 0.105, drtg: 94.8 },
    nba: { ppg: 10.6, rpg: 3.0, apg: 1.9, spg: 0.9, bpg: 0.3, ws48: 0.085, outcome: 'Starter' },
  },
  {
    pick: 13, team: 'Indiana Pacers', name: 'Tyler Hansbrough', school: 'North Carolina', pos: 'PF',
    birthYear: 1985, height: 81, weight: 234, wingspan: 83.5, conf: 'ACC',
    archetype: 'Drop Coverage Big',
    // 2008-09 UNC: 18.4 PPG, 7.8 RPG, 1.3 APG in 36 games
    stats: { games: 36, mpg: 30.2, ppg: 18.4, rpg: 7.8, apg: 1.3, spg: 0.5, bpg: 0.8, tov: 2.2, pf: 3.1, fg_pct: 0.516, three_pt_pct: null, ft_pct: 0.759, pts_per40: 24.4, reb_per40: 10.3, ast_per40: 1.7, stl_per40: 0.7, blk_per40: 1.1, tov_per40: 2.9, usg: 0.298, per: 22.8, bpm: 7.2, obpm: 4.8, dbpm: 2.4, ws: 7.0, efg_pct: 0.516, ts_pct: 0.583, ast_pct: 0.072, tov_pct: 0.125, stl_pct: 0.010, blk_pct: 0.022, orb_pct: 0.095, drb_pct: 0.178, drtg: 92.5 },
    nba: { ppg: 9.2, rpg: 5.4, apg: 0.8, spg: 0.5, bpg: 0.4, ws48: 0.084, outcome: 'Role Player' },
  },
  {
    pick: 14, team: 'Phoenix Suns', name: 'Earl Clark', school: 'Louisville', pos: 'SF',
    birthYear: 1988, height: 82, weight: 228, wingspan: 87, conf: 'Big East',
    archetype: 'Stretch Big',
    // 2008-09 Louisville: 10.0 PPG, 6.2 RPG, 1.5 APG in 36 games
    stats: { games: 36, mpg: 25.8, ppg: 10.0, rpg: 6.2, apg: 1.5, spg: 0.8, bpg: 1.2, tov: 1.5, pf: 2.8, fg_pct: 0.512, three_pt_pct: 0.265, ft_pct: 0.672, pts_per40: 15.5, reb_per40: 9.6, ast_per40: 2.3, stl_per40: 1.2, blk_per40: 1.9, tov_per40: 2.3, usg: 0.228, per: 17.8, bpm: 4.5, obpm: 1.5, dbpm: 3.0, ws: 4.5, efg_pct: 0.525, ts_pct: 0.548, ast_pct: 0.088, tov_pct: 0.132, stl_pct: 0.020, blk_pct: 0.042, orb_pct: 0.072, drb_pct: 0.145, drtg: 93.5 },
    nba: { ppg: 4.7, rpg: 3.8, apg: 0.7, spg: 0.4, bpg: 0.5, ws48: 0.062, outcome: 'Role Player' },
  },
  {
    pick: 15, team: 'Detroit Pistons', name: 'Austin Daye', school: 'Gonzaga', pos: 'SF/PF',
    birthYear: 1988, height: 84, weight: 200, wingspan: 88, conf: 'WCC',
    archetype: 'Stretch Big',
    // 2008-09 Gonzaga: 17.0 PPG, 7.2 RPG, 1.5 APG in 33 games
    stats: { games: 33, mpg: 30.0, ppg: 17.0, rpg: 7.2, apg: 1.5, spg: 0.8, bpg: 1.2, tov: 1.8, pf: 2.5, fg_pct: 0.465, three_pt_pct: 0.358, ft_pct: 0.778, pts_per40: 22.7, reb_per40: 9.6, ast_per40: 2.0, stl_per40: 1.1, blk_per40: 1.6, tov_per40: 2.4, usg: 0.272, per: 19.8, bpm: 5.5, obpm: 3.8, dbpm: 1.7, ws: 5.2, efg_pct: 0.497, ts_pct: 0.562, ast_pct: 0.088, tov_pct: 0.115, stl_pct: 0.018, blk_pct: 0.038, orb_pct: 0.065, drb_pct: 0.155, drtg: 95.5 },
    nba: { ppg: 5.1, rpg: 2.6, apg: 0.6, spg: 0.4, bpg: 0.4, ws48: 0.038, outcome: 'Bust' },
  },
  {
    pick: 16, team: 'Chicago Bulls', name: 'James Johnson', school: 'Wake Forest', pos: 'SF',
    birthYear: 1987, height: 80, weight: 240, wingspan: 87, conf: 'ACC',
    archetype: 'Athletic Power Forward',
    // 2008-09 Wake Forest: 16.8 PPG, 8.5 RPG, 2.0 APG in 31 games
    stats: { games: 31, mpg: 31.5, ppg: 16.8, rpg: 8.5, apg: 2.0, spg: 1.2, bpg: 2.2, tov: 2.5, pf: 3.0, fg_pct: 0.488, three_pt_pct: 0.295, ft_pct: 0.668, pts_per40: 21.3, reb_per40: 10.8, ast_per40: 2.5, stl_per40: 1.5, blk_per40: 2.8, tov_per40: 3.2, usg: 0.268, per: 20.5, bpm: 6.8, obpm: 3.2, dbpm: 3.6, ws: 5.8, efg_pct: 0.510, ts_pct: 0.552, ast_pct: 0.112, tov_pct: 0.148, stl_pct: 0.025, blk_pct: 0.072, orb_pct: 0.092, drb_pct: 0.195, drtg: 91.2 },
    nba: { ppg: 8.8, rpg: 4.2, apg: 1.9, spg: 0.8, bpg: 0.8, ws48: 0.088, outcome: 'Starter' },
  },
  {
    pick: 17, team: 'Philadelphia 76ers', name: 'Jrue Holiday', school: 'UCLA', pos: 'PG',
    birthYear: 1990, height: 76, weight: 205, wingspan: 82, conf: 'Pac-10',
    archetype: 'Primary Playmaker',
    // 2008-09 UCLA: 9.4 PPG, 3.6 RPG, 4.6 APG in 33 games
    stats: { games: 33, mpg: 27.2, ppg: 9.4, rpg: 3.6, apg: 4.6, spg: 1.5, bpg: 0.4, tov: 1.8, pf: 1.9, fg_pct: 0.448, three_pt_pct: 0.312, ft_pct: 0.742, pts_per40: 13.8, reb_per40: 5.3, ast_per40: 6.8, stl_per40: 2.2, blk_per40: 0.6, tov_per40: 2.6, usg: 0.218, per: 16.5, bpm: 4.2, obpm: 2.5, dbpm: 1.7, ws: 4.2, efg_pct: 0.475, ts_pct: 0.533, ast_pct: 0.325, tov_pct: 0.135, stl_pct: 0.035, blk_pct: 0.010, orb_pct: 0.028, drb_pct: 0.092, drtg: 94.5 },
    nba: { ppg: 17.4, rpg: 4.6, apg: 6.2, spg: 1.5, bpg: 0.4, ws48: 0.130, outcome: 'All-Star' },
  },
  {
    pick: 18, team: 'Minnesota Timberwolves', name: 'Ty Lawson', school: 'North Carolina', pos: 'PG',
    birthYear: 1987, height: 71, weight: 195, wingspan: 75, conf: 'ACC',
    archetype: 'Secondary Playmaker',
    // 2008-09 UNC: 11.8 PPG, 2.5 RPG, 6.6 APG in 38 games
    stats: { games: 38, mpg: 28.5, ppg: 11.8, rpg: 2.5, apg: 6.6, spg: 1.8, bpg: 0.1, tov: 2.2, pf: 1.5, fg_pct: 0.527, three_pt_pct: 0.418, ft_pct: 0.765, pts_per40: 16.6, reb_per40: 3.5, ast_per40: 9.3, stl_per40: 2.5, blk_per40: 0.1, tov_per40: 3.1, usg: 0.235, per: 20.8, bpm: 7.0, obpm: 5.0, dbpm: 2.0, ws: 7.5, efg_pct: 0.572, ts_pct: 0.634, ast_pct: 0.388, tov_pct: 0.142, stl_pct: 0.040, blk_pct: 0.002, orb_pct: 0.018, drb_pct: 0.065, drtg: 91.8 },
    nba: { ppg: 13.9, rpg: 3.0, apg: 6.7, spg: 1.2, bpg: 0.2, ws48: 0.118, outcome: 'Starter' },
  },
  {
    pick: 19, team: 'Atlanta Hawks', name: 'Jeff Teague', school: 'Wake Forest', pos: 'PG',
    birthYear: 1988, height: 74, weight: 182, wingspan: 79, conf: 'ACC',
    archetype: 'Scoring Lead Guard',
    // 2008-09 Wake Forest: 19.2 PPG, 3.6 RPG, 4.8 APG in 31 games
    stats: { games: 31, mpg: 33.5, ppg: 19.2, rpg: 3.6, apg: 4.8, spg: 2.0, bpg: 0.2, tov: 2.5, pf: 2.0, fg_pct: 0.468, three_pt_pct: 0.368, ft_pct: 0.835, pts_per40: 22.9, reb_per40: 4.3, ast_per40: 5.7, stl_per40: 2.4, blk_per40: 0.2, tov_per40: 3.0, usg: 0.278, per: 22.0, bpm: 7.5, obpm: 5.5, dbpm: 2.0, ws: 6.8, efg_pct: 0.508, ts_pct: 0.592, ast_pct: 0.265, tov_pct: 0.138, stl_pct: 0.042, blk_pct: 0.005, orb_pct: 0.025, drb_pct: 0.085, drtg: 92.5 },
    nba: { ppg: 14.5, rpg: 2.9, apg: 5.8, spg: 1.2, bpg: 0.2, ws48: 0.118, outcome: 'All-Star' },
  },
  {
    pick: 20, team: 'Oklahoma City Thunder', name: 'Eric Maynor', school: 'VCU', pos: 'PG',
    birthYear: 1987, height: 74, weight: 185, wingspan: 78, conf: 'CAA',
    archetype: 'Secondary Playmaker',
    // 2008-09 VCU: 19.5 PPG, 3.1 RPG, 6.5 APG in 33 games
    stats: { games: 33, mpg: 33.0, ppg: 19.5, rpg: 3.1, apg: 6.5, spg: 2.0, bpg: 0.1, tov: 2.8, pf: 1.8, fg_pct: 0.452, three_pt_pct: 0.362, ft_pct: 0.818, pts_per40: 23.6, reb_per40: 3.8, ast_per40: 7.9, stl_per40: 2.4, blk_per40: 0.1, tov_per40: 3.4, usg: 0.275, per: 21.5, bpm: 6.8, obpm: 5.2, dbpm: 1.6, ws: 6.5, efg_pct: 0.495, ts_pct: 0.575, ast_pct: 0.345, tov_pct: 0.145, stl_pct: 0.040, blk_pct: 0.002, orb_pct: 0.022, drb_pct: 0.075, drtg: 95.0 },
    nba: { ppg: 6.8, rpg: 1.8, apg: 3.5, spg: 0.6, bpg: 0.1, ws48: 0.072, outcome: 'Role Player' },
  },
  {
    pick: 21, team: 'New Orleans Hornets', name: 'Darren Collison', school: 'UCLA', pos: 'PG',
    birthYear: 1987, height: 72, weight: 175, wingspan: 76, conf: 'Pac-10',
    archetype: 'Secondary Playmaker',
    // 2008-09 UCLA: 14.5 PPG, 2.4 RPG, 5.4 APG in 35 games
    stats: { games: 35, mpg: 31.5, ppg: 14.5, rpg: 2.4, apg: 5.4, spg: 1.5, bpg: 0.1, tov: 2.2, pf: 1.8, fg_pct: 0.482, three_pt_pct: 0.415, ft_pct: 0.845, pts_per40: 18.4, reb_per40: 3.0, ast_per40: 6.9, stl_per40: 1.9, blk_per40: 0.1, tov_per40: 2.8, usg: 0.252, per: 19.8, bpm: 6.5, obpm: 5.0, dbpm: 1.5, ws: 6.5, efg_pct: 0.525, ts_pct: 0.605, ast_pct: 0.342, tov_pct: 0.138, stl_pct: 0.031, blk_pct: 0.002, orb_pct: 0.018, drb_pct: 0.065, drtg: 93.5 },
    nba: { ppg: 12.4, rpg: 2.4, apg: 5.5, spg: 1.1, bpg: 0.1, ws48: 0.110, outcome: 'Starter' },
  },
  {
    pick: 23, team: 'Sacramento Kings', name: 'Omri Casspi', school: 'Maccabi Tel Aviv Israel', pos: 'SF',
    birthYear: 1988, height: 81, weight: 225, wingspan: 85, conf: null,
    archetype: 'Off Ball Scoring Wing',
    // 2008-09 Israeli Premier League: 12.5 PPG, 5.2 RPG, 1.8 APG in 28 games
    stats: { games: 28, mpg: 26.5, ppg: 12.5, rpg: 5.2, apg: 1.8, spg: 0.8, bpg: 0.5, tov: 1.5, pf: 2.2, fg_pct: 0.492, three_pt_pct: 0.368, ft_pct: 0.758, pts_per40: 18.9, reb_per40: 7.8, ast_per40: 2.7, stl_per40: 1.2, blk_per40: 0.8, tov_per40: 2.3, usg: 0.248, per: 18.5, bpm: 5.0, obpm: 3.0, dbpm: 2.0, ws: 3.8, efg_pct: 0.528, ts_pct: 0.582, ast_pct: 0.108, tov_pct: 0.120, stl_pct: 0.020, blk_pct: 0.015, orb_pct: 0.055, drb_pct: 0.138, drtg: 95.0 },
    nba: { ppg: 8.1, rpg: 4.1, apg: 1.2, spg: 0.6, bpg: 0.3, ws48: 0.080, outcome: 'Role Player' },
  },
  {
    pick: 27, team: 'Denver Nuggets', name: 'DeMarre Carroll', school: 'Missouri', pos: 'SF',
    birthYear: 1986, height: 80, weight: 210, wingspan: 85, conf: 'Big 12',
    archetype: 'POA Defender',
    // 2008-09 Missouri: 15.3 PPG, 7.0 RPG, 2.2 APG in 33 games
    stats: { games: 33, mpg: 31.5, ppg: 15.3, rpg: 7.0, apg: 2.2, spg: 1.8, bpg: 0.5, tov: 1.8, pf: 2.2, fg_pct: 0.465, three_pt_pct: 0.335, ft_pct: 0.738, pts_per40: 19.4, reb_per40: 8.9, ast_per40: 2.8, stl_per40: 2.3, blk_per40: 0.6, tov_per40: 2.3, usg: 0.255, per: 18.8, bpm: 5.2, obpm: 2.8, dbpm: 2.4, ws: 5.5, efg_pct: 0.498, ts_pct: 0.558, ast_pct: 0.128, tov_pct: 0.118, stl_pct: 0.038, blk_pct: 0.012, orb_pct: 0.075, drb_pct: 0.168, drtg: 93.5 },
    nba: { ppg: 8.4, rpg: 4.1, apg: 1.2, spg: 1.0, bpg: 0.4, ws48: 0.098, outcome: 'Starter' },
  },
  // === ROUND 2 ===
  {
    pick: 37, team: 'San Antonio Spurs', name: 'DeJuan Blair', school: 'Pittsburgh', pos: 'PF',
    birthYear: 1989, height: 79, weight: 265, wingspan: 82, conf: 'Big East',
    archetype: 'Offensive Rebounder',
    // 2008-09 Pittsburgh: 15.7 PPG, 12.8 RPG, 0.7 APG in 35 games
    stats: { games: 35, mpg: 30.0, ppg: 15.7, rpg: 12.8, apg: 0.7, spg: 0.8, bpg: 1.0, tov: 2.0, pf: 3.2, fg_pct: 0.588, three_pt_pct: null, ft_pct: 0.548, pts_per40: 20.9, reb_per40: 17.1, ast_per40: 0.9, stl_per40: 1.1, blk_per40: 1.3, tov_per40: 2.7, usg: 0.272, per: 25.5, bpm: 9.8, obpm: 4.5, dbpm: 5.3, ws: 8.5, efg_pct: 0.588, ts_pct: 0.594, ast_pct: 0.038, tov_pct: 0.138, stl_pct: 0.018, blk_pct: 0.028, orb_pct: 0.182, drb_pct: 0.295, drtg: 89.5 },
    nba: { ppg: 8.6, rpg: 7.5, apg: 0.6, spg: 0.6, bpg: 0.5, ws48: 0.105, outcome: 'Role Player' },
  },
  {
    pick: 42, team: 'Los Angeles Clippers', name: 'Patrick Beverley', school: 'Arkansas', pos: 'PG',
    birthYear: 1988, height: 73, weight: 185, wingspan: 78, conf: 'SEC',
    archetype: 'POA Defender',
    // 2008-09 Arkansas: 13.2 PPG, 3.8 RPG, 3.3 APG in 31 games
    stats: { games: 31, mpg: 30.5, ppg: 13.2, rpg: 3.8, apg: 3.3, spg: 2.2, bpg: 0.2, tov: 2.0, pf: 2.5, fg_pct: 0.438, three_pt_pct: 0.355, ft_pct: 0.728, pts_per40: 17.3, reb_per40: 5.0, ast_per40: 4.3, stl_per40: 2.9, blk_per40: 0.3, tov_per40: 2.6, usg: 0.248, per: 17.2, bpm: 4.5, obpm: 2.5, dbpm: 2.0, ws: 4.5, efg_pct: 0.475, ts_pct: 0.528, ast_pct: 0.210, tov_pct: 0.142, stl_pct: 0.047, blk_pct: 0.005, orb_pct: 0.035, drb_pct: 0.092, drtg: 94.0 },
    nba: { ppg: 8.9, rpg: 3.5, apg: 3.8, spg: 1.6, bpg: 0.2, ws48: 0.105, outcome: 'Starter' },
  },
  {
    pick: 46, team: 'Cleveland Cavaliers', name: 'Danny Green', school: 'North Carolina', pos: 'SG',
    birthYear: 1987, height: 78, weight: 215, wingspan: 85, conf: 'ACC',
    archetype: 'Movement Shooter',
    // 2008-09 UNC: 9.2 PPG, 4.7 RPG, 2.2 APG in 36 games
    stats: { games: 36, mpg: 26.5, ppg: 9.2, rpg: 4.7, apg: 2.2, spg: 1.5, bpg: 0.8, tov: 1.5, pf: 2.0, fg_pct: 0.458, three_pt_pct: 0.382, ft_pct: 0.735, pts_per40: 13.9, reb_per40: 7.1, ast_per40: 3.3, stl_per40: 2.3, blk_per40: 1.2, tov_per40: 2.3, usg: 0.212, per: 16.2, bpm: 4.0, obpm: 2.2, dbpm: 1.8, ws: 4.8, efg_pct: 0.510, ts_pct: 0.565, ast_pct: 0.148, tov_pct: 0.132, stl_pct: 0.038, blk_pct: 0.025, orb_pct: 0.048, drb_pct: 0.115, drtg: 91.5 },
    nba: { ppg: 8.8, rpg: 3.1, apg: 1.4, spg: 1.2, bpg: 0.5, ws48: 0.118, outcome: 'Starter' },
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
  console.log(`Navigate to /legendary-archives?year=2009 to view the board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
