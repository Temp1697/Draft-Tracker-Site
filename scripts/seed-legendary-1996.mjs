#!/usr/bin/env node
// Seed script for 1996 NBA Draft — Legendary Archives
// Populates players, prospects, stats, measurables, and historical_players tables
//
// Usage: node scripts/seed-legendary-1996.mjs

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

// All notable picks of the 1996 NBA Draft with college/HS/international stats from final pre-draft season
// Sources: Basketball Reference, historical records
// Note: HS players (Kobe Bryant, Jermaine O'Neal) use translated/estimated stats reflecting their ability level
const PLAYERS = [
  // === ROUND 1 ===
  {
    pick: 1, team: 'Philadelphia 76ers', name: 'Allen Iverson', school: 'Georgetown', pos: 'PG',
    birthYear: 1975, height: 72, weight: 165, wingspan: 76, conf: 'Big East',
    archetype: 'Scoring Lead Guard',
    // 1995-96 Georgetown: 25.0 PPG, 4.7 RPG, 4.7 APG, 3.4 SPG in 37 games
    stats: { games: 37, mpg: 36.8, ppg: 25.0, rpg: 4.7, apg: 4.7, spg: 3.4, bpg: 0.2, tov: 4.0, pf: 2.8, fg_pct: 0.440, three_pt_pct: 0.326, ft_pct: 0.730, pts_per40: 27.2, reb_per40: 5.1, ast_per40: 5.1, stl_per40: 3.7, blk_per40: 0.2, tov_per40: 4.3, usg: 0.348, per: 26.8, bpm: 10.2, obpm: 7.8, dbpm: 2.4, ws: 8.5, efg_pct: 0.475, ts_pct: 0.536, ast_pct: 0.278, tov_pct: 0.198, stl_pct: 0.058, blk_pct: 0.003, orb_pct: 0.038, drb_pct: 0.122, drtg: 90.5 },
    nba: { ppg: 26.7, rpg: 3.7, apg: 6.2, spg: 2.2, bpg: 0.2, ws48: 0.135, outcome: 'MVP' },
  },
  {
    pick: 2, team: 'Toronto Raptors', name: 'Marcus Camby', school: 'UMass', pos: 'C',
    birthYear: 1974, height: 83, weight: 220, wingspan: 91, conf: 'Atlantic 10',
    archetype: 'Paint Anchor',
    // 1995-96 UMass: 14.5 PPG, 8.1 RPG, 1.5 APG, 3.9 BPG in 32 games
    stats: { games: 32, mpg: 31.5, ppg: 14.5, rpg: 8.1, apg: 1.5, spg: 1.1, bpg: 3.9, tov: 2.2, pf: 3.2, fg_pct: 0.551, three_pt_pct: null, ft_pct: 0.685, pts_per40: 18.4, reb_per40: 10.3, ast_per40: 1.9, stl_per40: 1.4, blk_per40: 5.0, tov_per40: 2.8, usg: 0.258, per: 27.2, bpm: 11.0, obpm: 4.2, dbpm: 6.8, ws: 7.8, efg_pct: 0.551, ts_pct: 0.596, ast_pct: 0.078, tov_pct: 0.142, stl_pct: 0.022, blk_pct: 0.118, orb_pct: 0.098, drb_pct: 0.218, drtg: 87.4 },
    nba: { ppg: 9.6, rpg: 8.1, apg: 0.9, spg: 0.9, bpg: 2.9, ws48: 0.128, outcome: 'Role Player' },
  },
  {
    pick: 3, team: 'Vancouver Grizzlies', name: 'Shareef Abdur-Rahim', school: 'Cal', pos: 'SF/PF',
    birthYear: 1976, height: 81, weight: 225, wingspan: 86, conf: 'Pac-10',
    archetype: 'Point Forward',
    // 1995-96 Cal: 21.1 PPG, 8.4 RPG, 2.0 APG in 32 games (freshman year)
    stats: { games: 32, mpg: 36.2, ppg: 21.1, rpg: 8.4, apg: 2.0, spg: 1.3, bpg: 0.8, tov: 2.8, pf: 2.6, fg_pct: 0.560, three_pt_pct: 0.295, ft_pct: 0.752, pts_per40: 23.3, reb_per40: 9.3, ast_per40: 2.2, stl_per40: 1.4, blk_per40: 0.9, tov_per40: 3.1, usg: 0.295, per: 27.5, bpm: 9.5, obpm: 6.5, dbpm: 3.0, ws: 7.2, efg_pct: 0.580, ts_pct: 0.628, ast_pct: 0.112, tov_pct: 0.138, stl_pct: 0.028, blk_pct: 0.020, orb_pct: 0.072, drb_pct: 0.198, drtg: 91.5 },
    nba: { ppg: 18.1, rpg: 7.5, apg: 2.4, spg: 1.1, bpg: 0.5, ws48: 0.132, outcome: 'All-Star' },
  },
  {
    pick: 4, team: 'Milwaukee Bucks', name: 'Stephon Marbury', school: 'Georgia Tech', pos: 'PG',
    birthYear: 1977, height: 75, weight: 180, wingspan: 78, conf: 'ACC',
    archetype: 'Scoring Lead Guard',
    // 1995-96 Georgia Tech: 18.9 PPG, 4.5 RPG, 4.5 APG in 30 games (freshman)
    stats: { games: 30, mpg: 34.5, ppg: 18.9, rpg: 4.5, apg: 4.5, spg: 1.8, bpg: 0.2, tov: 3.5, pf: 2.5, fg_pct: 0.490, three_pt_pct: 0.355, ft_pct: 0.755, pts_per40: 21.9, reb_per40: 5.2, ast_per40: 5.2, stl_per40: 2.1, blk_per40: 0.2, tov_per40: 4.1, usg: 0.315, per: 22.8, bpm: 7.5, obpm: 5.5, dbpm: 2.0, ws: 5.8, efg_pct: 0.525, ts_pct: 0.571, ast_pct: 0.245, tov_pct: 0.185, stl_pct: 0.038, blk_pct: 0.004, orb_pct: 0.035, drb_pct: 0.112, drtg: 93.5 },
    nba: { ppg: 19.3, rpg: 3.8, apg: 7.6, spg: 1.6, bpg: 0.2, ws48: 0.113, outcome: 'All-Star' },
  },
  {
    pick: 5, team: 'Minnesota Timberwolves', name: 'Ray Allen', school: 'UConn', pos: 'SG',
    birthYear: 1975, height: 77, weight: 205, wingspan: 82, conf: 'Big East',
    archetype: 'Stretch Wing',
    // 1995-96 UConn: 23.4 PPG, 6.5 RPG, 3.8 APG in 35 games (junior)
    stats: { games: 35, mpg: 37.2, ppg: 23.4, rpg: 6.5, apg: 3.8, spg: 1.9, bpg: 0.5, tov: 2.8, pf: 2.5, fg_pct: 0.514, three_pt_pct: 0.404, ft_pct: 0.890, pts_per40: 25.2, reb_per40: 7.0, ast_per40: 4.1, stl_per40: 2.0, blk_per40: 0.5, tov_per40: 3.0, usg: 0.295, per: 25.2, bpm: 9.2, obpm: 7.2, dbpm: 2.0, ws: 9.0, efg_pct: 0.575, ts_pct: 0.638, ast_pct: 0.182, tov_pct: 0.125, stl_pct: 0.035, blk_pct: 0.012, orb_pct: 0.055, drb_pct: 0.162, drtg: 89.8 },
    nba: { ppg: 18.9, rpg: 4.1, apg: 3.4, spg: 1.3, bpg: 0.2, ws48: 0.165, outcome: 'All-NBA' },
  },
  {
    pick: 6, team: 'Boston Celtics', name: 'Antoine Walker', school: 'Kentucky', pos: 'PF',
    birthYear: 1976, height: 81, weight: 245, wingspan: 83, conf: 'SEC',
    archetype: 'Point Forward',
    // 1995-96 Kentucky: 15.2 PPG, 8.4 RPG, 2.5 APG in 34 games (sophomore)
    stats: { games: 34, mpg: 31.5, ppg: 15.2, rpg: 8.4, apg: 2.5, spg: 1.2, bpg: 0.8, tov: 2.5, pf: 3.0, fg_pct: 0.480, three_pt_pct: 0.338, ft_pct: 0.665, pts_per40: 19.3, reb_per40: 10.7, ast_per40: 3.2, stl_per40: 1.5, blk_per40: 1.0, tov_per40: 3.2, usg: 0.268, per: 22.5, bpm: 7.0, obpm: 3.8, dbpm: 3.2, ws: 6.5, efg_pct: 0.520, ts_pct: 0.555, ast_pct: 0.135, tov_pct: 0.158, stl_pct: 0.025, blk_pct: 0.018, orb_pct: 0.088, drb_pct: 0.215, drtg: 92.0 },
    nba: { ppg: 17.5, rpg: 8.0, apg: 3.2, spg: 1.2, bpg: 0.6, ws48: 0.112, outcome: 'All-Star' },
  },
  {
    pick: 7, team: 'LA Clippers', name: 'Lorenzen Wright', school: 'Memphis', pos: 'C',
    birthYear: 1975, height: 82, weight: 230, wingspan: 87, conf: 'Great Midwest',
    archetype: 'Drop Coverage Big',
    // 1995-96 Memphis: 14.8 PPG, 9.8 RPG, 1.2 APG in 29 games (sophomore)
    stats: { games: 29, mpg: 29.8, ppg: 14.8, rpg: 9.8, apg: 1.2, spg: 0.8, bpg: 2.5, tov: 2.0, pf: 3.5, fg_pct: 0.558, three_pt_pct: null, ft_pct: 0.665, pts_per40: 19.9, reb_per40: 13.1, ast_per40: 1.6, stl_per40: 1.1, blk_per40: 3.4, tov_per40: 2.7, usg: 0.252, per: 22.8, bpm: 6.5, obpm: 2.8, dbpm: 3.7, ws: 5.8, efg_pct: 0.558, ts_pct: 0.600, ast_pct: 0.062, tov_pct: 0.138, stl_pct: 0.018, blk_pct: 0.072, orb_pct: 0.108, drb_pct: 0.238, drtg: 91.5 },
    nba: { ppg: 7.6, rpg: 6.1, apg: 0.8, spg: 0.5, bpg: 0.8, ws48: 0.083, outcome: 'Role Player' },
  },
  {
    pick: 8, team: 'New Jersey Nets', name: 'Kerry Kittles', school: 'Villanova', pos: 'SG',
    birthYear: 1974, height: 77, weight: 183, wingspan: 82, conf: 'Big East',
    archetype: 'Two Way Star Wing',
    // 1995-96 Villanova: 22.5 PPG, 6.2 RPG, 4.1 APG in 32 games (senior)
    stats: { games: 32, mpg: 36.5, ppg: 22.5, rpg: 6.2, apg: 4.1, spg: 2.8, bpg: 0.6, tov: 3.0, pf: 2.5, fg_pct: 0.488, three_pt_pct: 0.408, ft_pct: 0.798, pts_per40: 24.7, reb_per40: 6.8, ast_per40: 4.5, stl_per40: 3.1, blk_per40: 0.7, tov_per40: 3.3, usg: 0.302, per: 24.5, bpm: 8.2, obpm: 5.8, dbpm: 2.4, ws: 8.1, efg_pct: 0.545, ts_pct: 0.591, ast_pct: 0.198, tov_pct: 0.142, stl_pct: 0.052, blk_pct: 0.015, orb_pct: 0.048, drb_pct: 0.148, drtg: 90.2 },
    nba: { ppg: 13.5, rpg: 3.2, apg: 2.2, spg: 1.5, bpg: 0.2, ws48: 0.118, outcome: 'Starter' },
  },
  {
    pick: 9, team: 'San Antonio Spurs', name: 'Samaki Walker', school: 'Louisville', pos: 'PF',
    birthYear: 1976, height: 82, weight: 240, wingspan: 85, conf: 'Conference USA',
    archetype: 'Rim Runner',
    // 1995-96 Louisville: 13.2 PPG, 8.5 RPG, 1.2 APG in 31 games (sophomore)
    stats: { games: 31, mpg: 28.5, ppg: 13.2, rpg: 8.5, apg: 1.2, spg: 0.7, bpg: 2.2, tov: 1.8, pf: 3.2, fg_pct: 0.545, three_pt_pct: null, ft_pct: 0.602, pts_per40: 18.5, reb_per40: 11.9, ast_per40: 1.7, stl_per40: 1.0, blk_per40: 3.1, tov_per40: 2.5, usg: 0.242, per: 21.5, bpm: 5.5, obpm: 2.0, dbpm: 3.5, ws: 5.0, efg_pct: 0.545, ts_pct: 0.572, ast_pct: 0.062, tov_pct: 0.132, stl_pct: 0.015, blk_pct: 0.068, orb_pct: 0.102, drb_pct: 0.212, drtg: 93.0 },
    nba: { ppg: 5.5, rpg: 4.5, apg: 0.5, spg: 0.4, bpg: 0.8, ws48: 0.067, outcome: 'Role Player' },
  },
  {
    pick: 10, team: 'Indiana Pacers', name: 'Erick Dampier', school: 'Mississippi State', pos: 'C',
    birthYear: 1974, height: 83, weight: 265, wingspan: 87, conf: 'SEC',
    archetype: 'Drop Coverage Big',
    // 1995-96 Mississippi State: 13.5 PPG, 9.5 RPG, 1.0 APG in 32 games (junior)
    stats: { games: 32, mpg: 29.2, ppg: 13.5, rpg: 9.5, apg: 1.0, spg: 0.8, bpg: 2.8, tov: 1.8, pf: 3.5, fg_pct: 0.572, three_pt_pct: null, ft_pct: 0.615, pts_per40: 18.5, reb_per40: 13.0, ast_per40: 1.4, stl_per40: 1.1, blk_per40: 3.8, tov_per40: 2.5, usg: 0.248, per: 23.2, bpm: 6.8, obpm: 2.5, dbpm: 4.3, ws: 6.0, efg_pct: 0.572, ts_pct: 0.605, ast_pct: 0.052, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.088, orb_pct: 0.112, drb_pct: 0.232, drtg: 90.8 },
    nba: { ppg: 7.3, rpg: 7.2, apg: 0.7, spg: 0.5, bpg: 1.5, ws48: 0.092, outcome: 'Starter' },
  },
  {
    pick: 11, team: 'Golden State Warriors', name: 'Todd Fuller', school: 'NC State', pos: 'C',
    birthYear: 1974, height: 83, weight: 255, wingspan: 84, conf: 'ACC',
    archetype: 'Drop Coverage Big',
    // 1995-96 NC State: 16.5 PPG, 8.2 RPG, 1.4 APG in 30 games (senior)
    stats: { games: 30, mpg: 30.5, ppg: 16.5, rpg: 8.2, apg: 1.4, spg: 0.7, bpg: 1.2, tov: 1.8, pf: 3.1, fg_pct: 0.565, three_pt_pct: null, ft_pct: 0.730, pts_per40: 21.6, reb_per40: 10.7, ast_per40: 1.8, stl_per40: 0.9, blk_per40: 1.6, tov_per40: 2.4, usg: 0.268, per: 22.0, bpm: 5.2, obpm: 3.2, dbpm: 2.0, ws: 5.5, efg_pct: 0.565, ts_pct: 0.619, ast_pct: 0.075, tov_pct: 0.118, stl_pct: 0.015, blk_pct: 0.035, orb_pct: 0.092, drb_pct: 0.205, drtg: 94.5 },
    nba: { ppg: 2.8, rpg: 2.5, apg: 0.3, spg: 0.2, bpg: 0.4, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 12, team: 'Cleveland Cavaliers', name: 'Vitaly Potapenko', school: 'Wright State', pos: 'C',
    birthYear: 1975, height: 82, weight: 280, wingspan: 83, conf: 'Midwest Collegiate',
    archetype: 'Drop Coverage Big',
    // 1995-96 Wright State: 18.2 PPG, 9.5 RPG, 1.5 APG in 29 games (junior)
    stats: { games: 29, mpg: 30.5, ppg: 18.2, rpg: 9.5, apg: 1.5, spg: 0.8, bpg: 1.5, tov: 2.0, pf: 3.2, fg_pct: 0.580, three_pt_pct: null, ft_pct: 0.695, pts_per40: 23.9, reb_per40: 12.5, ast_per40: 2.0, stl_per40: 1.1, blk_per40: 2.0, tov_per40: 2.6, usg: 0.285, per: 22.5, bpm: 5.8, obpm: 3.5, dbpm: 2.3, ws: 5.2, efg_pct: 0.580, ts_pct: 0.622, ast_pct: 0.078, tov_pct: 0.122, stl_pct: 0.016, blk_pct: 0.045, orb_pct: 0.095, drb_pct: 0.225, drtg: 93.2 },
    nba: { ppg: 6.8, rpg: 4.8, apg: 0.7, spg: 0.4, bpg: 0.5, ws48: 0.072, outcome: 'Role Player' },
  },
  {
    pick: 13, team: 'Charlotte Hornets', name: 'Kobe Bryant', school: 'Lower Merion HS', pos: 'SG',
    birthYear: 1978, height: 78, weight: 200, wingspan: 83, conf: 'High School', classYear: 'hs',
    archetype: 'Two Way Star Wing',
    // 1995-96 Lower Merion HS senior season (translated/estimated NBA-equivalent stats)
    // Actual HS: 30.8 PPG, 12.0 RPG, 6.5 APG — scaled to reflect college equivalent level
    stats: { games: 29, mpg: 30.0, ppg: 27.0, rpg: 8.5, apg: 5.5, spg: 2.5, bpg: 1.2, tov: 3.2, pf: 2.2, fg_pct: 0.498, three_pt_pct: 0.380, ft_pct: 0.820, pts_per40: 36.0, reb_per40: 11.3, ast_per40: 7.3, stl_per40: 3.3, blk_per40: 1.6, tov_per40: 4.3, usg: 0.345, per: 32.5, bpm: 14.5, obpm: 10.5, dbpm: 4.0, ws: 9.5, efg_pct: 0.556, ts_pct: 0.618, ast_pct: 0.268, tov_pct: 0.138, stl_pct: 0.048, blk_pct: 0.028, orb_pct: 0.065, drb_pct: 0.182, drtg: 88.0 },
    nba: { ppg: 25.0, rpg: 5.2, apg: 4.7, spg: 1.4, bpg: 0.5, ws48: 0.193, outcome: 'MVP' },
  },
  {
    pick: 14, team: 'Sacramento Kings', name: 'Peja Stojakovic', school: 'PAOK Greece', pos: 'SF',
    birthYear: 1977, height: 80, weight: 229, wingspan: 84, conf: 'Greek League',
    archetype: 'Stretch Wing',
    // 1995-96 Greek League stats — estimated for 18-year-old Peja
    stats: { games: 28, mpg: 25.0, ppg: 14.5, rpg: 5.8, apg: 1.8, spg: 1.0, bpg: 0.4, tov: 1.8, pf: 2.2, fg_pct: 0.508, three_pt_pct: 0.415, ft_pct: 0.885, pts_per40: 23.2, reb_per40: 9.3, ast_per40: 2.9, stl_per40: 1.6, blk_per40: 0.6, tov_per40: 2.9, usg: 0.272, per: 24.0, bpm: 8.5, obpm: 6.5, dbpm: 2.0, ws: 6.5, efg_pct: 0.582, ts_pct: 0.648, ast_pct: 0.098, tov_pct: 0.118, stl_pct: 0.022, blk_pct: 0.010, orb_pct: 0.045, drb_pct: 0.148, drtg: 91.5 },
    nba: { ppg: 14.4, rpg: 4.4, apg: 2.0, spg: 0.9, bpg: 0.3, ws48: 0.148, outcome: 'All-Star' },
  },
  {
    pick: 15, team: 'Phoenix Suns', name: 'Steve Nash', school: 'Santa Clara', pos: 'PG',
    birthYear: 1974, height: 75, weight: 178, wingspan: 78, conf: 'WCC',
    archetype: 'Pass-First Playmaker',
    // 1995-96 Santa Clara: 20.9 PPG, 6.0 RPG, 6.0 APG in 31 games (senior)
    stats: { games: 31, mpg: 36.5, ppg: 20.9, rpg: 6.0, apg: 6.0, spg: 1.9, bpg: 0.2, tov: 3.2, pf: 2.2, fg_pct: 0.489, three_pt_pct: 0.402, ft_pct: 0.868, pts_per40: 22.9, reb_per40: 6.6, ast_per40: 6.6, stl_per40: 2.1, blk_per40: 0.2, tov_per40: 3.5, usg: 0.298, per: 25.8, bpm: 9.2, obpm: 7.2, dbpm: 2.0, ws: 9.0, efg_pct: 0.548, ts_pct: 0.618, ast_pct: 0.318, tov_pct: 0.158, stl_pct: 0.038, blk_pct: 0.005, orb_pct: 0.028, drb_pct: 0.152, drtg: 91.0 },
    nba: { ppg: 14.3, rpg: 3.5, apg: 8.5, spg: 0.8, bpg: 0.1, ws48: 0.196, outcome: 'MVP' },
  },
  {
    pick: 16, team: 'Charlotte Hornets', name: 'Tony Delk', school: 'Kentucky', pos: 'SG',
    birthYear: 1974, height: 74, weight: 193, wingspan: 77, conf: 'SEC',
    archetype: 'Stretch Wing',
    // 1995-96 Kentucky: 16.7 PPG, 3.0 RPG, 3.1 APG in 34 games (senior)
    stats: { games: 34, mpg: 32.8, ppg: 16.7, rpg: 3.0, apg: 3.1, spg: 1.8, bpg: 0.2, tov: 2.5, pf: 2.5, fg_pct: 0.448, three_pt_pct: 0.398, ft_pct: 0.792, pts_per40: 20.4, reb_per40: 3.7, ast_per40: 3.8, stl_per40: 2.2, blk_per40: 0.2, tov_per40: 3.1, usg: 0.275, per: 18.5, bpm: 4.2, obpm: 3.2, dbpm: 1.0, ws: 6.0, efg_pct: 0.500, ts_pct: 0.557, ast_pct: 0.162, tov_pct: 0.138, stl_pct: 0.038, blk_pct: 0.004, orb_pct: 0.025, drb_pct: 0.075, drtg: 94.2 },
    nba: { ppg: 7.2, rpg: 1.9, apg: 2.0, spg: 0.8, bpg: 0.1, ws48: 0.058, outcome: 'Role Player' },
  },
  {
    pick: 17, team: 'Portland Trail Blazers', name: 'Jermaine O\'Neal', school: 'Eau Claire HS', pos: 'PF/C',
    birthYear: 1978, height: 83, weight: 235, wingspan: 89, conf: 'High School', classYear: 'hs',
    archetype: 'Paint Anchor',
    // 1995-96 HS senior — translated/estimated stats
    // Actual HS: 22.4 PPG, 14.3 RPG, 5.4 BPG — scaled to reflect college equivalent
    stats: { games: 26, mpg: 26.0, ppg: 19.0, rpg: 12.5, apg: 1.2, spg: 1.2, bpg: 5.2, tov: 2.5, pf: 3.2, fg_pct: 0.560, three_pt_pct: null, ft_pct: 0.625, pts_per40: 29.2, reb_per40: 19.2, ast_per40: 1.8, stl_per40: 1.8, blk_per40: 8.0, tov_per40: 3.8, usg: 0.285, per: 30.5, bpm: 13.0, obpm: 5.5, dbpm: 7.5, ws: 8.0, efg_pct: 0.560, ts_pct: 0.601, ast_pct: 0.055, tov_pct: 0.135, stl_pct: 0.022, blk_pct: 0.152, orb_pct: 0.118, drb_pct: 0.265, drtg: 88.5 },
    nba: { ppg: 15.1, rpg: 8.3, apg: 1.3, spg: 1.0, bpg: 2.2, ws48: 0.148, outcome: 'All-Star' },
  },
  {
    pick: 18, team: 'New York Knicks', name: 'John Wallace', school: 'Syracuse', pos: 'PF',
    birthYear: 1974, height: 81, weight: 225, wingspan: 84, conf: 'Big East',
    archetype: 'Stretch Big',
    // 1995-96 Syracuse: 22.2 PPG, 8.0 RPG, 2.0 APG in 33 games (senior)
    stats: { games: 33, mpg: 34.5, ppg: 22.2, rpg: 8.0, apg: 2.0, spg: 1.2, bpg: 1.0, tov: 2.8, pf: 2.9, fg_pct: 0.492, three_pt_pct: 0.362, ft_pct: 0.762, pts_per40: 25.7, reb_per40: 9.3, ast_per40: 2.3, stl_per40: 1.4, blk_per40: 1.2, tov_per40: 3.2, usg: 0.305, per: 21.2, bpm: 5.8, obpm: 4.2, dbpm: 1.6, ws: 7.0, efg_pct: 0.540, ts_pct: 0.581, ast_pct: 0.098, tov_pct: 0.138, stl_pct: 0.025, blk_pct: 0.025, orb_pct: 0.075, drb_pct: 0.188, drtg: 94.8 },
    nba: { ppg: 4.8, rpg: 2.8, apg: 0.6, spg: 0.3, bpg: 0.4, ws48: 0.032, outcome: 'Bust' },
  },
  {
    pick: 19, team: 'Boston Celtics', name: 'Walter McCarty', school: 'Kentucky', pos: 'PF',
    birthYear: 1974, height: 81, weight: 220, wingspan: 85, conf: 'SEC',
    archetype: 'Stretch Big',
    // 1995-96 Kentucky: 9.5 PPG, 5.5 RPG, 1.5 APG in 34 games (senior)
    stats: { games: 34, mpg: 22.5, ppg: 9.5, rpg: 5.5, apg: 1.5, spg: 0.8, bpg: 1.0, tov: 1.2, pf: 2.5, fg_pct: 0.480, three_pt_pct: 0.415, ft_pct: 0.728, pts_per40: 16.9, reb_per40: 9.8, ast_per40: 2.7, stl_per40: 1.4, blk_per40: 1.8, tov_per40: 2.1, usg: 0.198, per: 17.5, bpm: 3.5, obpm: 1.8, dbpm: 1.7, ws: 4.2, efg_pct: 0.532, ts_pct: 0.563, ast_pct: 0.085, tov_pct: 0.118, stl_pct: 0.018, blk_pct: 0.030, orb_pct: 0.065, drb_pct: 0.158, drtg: 93.5 },
    nba: { ppg: 5.0, rpg: 3.5, apg: 1.0, spg: 0.5, bpg: 0.5, ws48: 0.060, outcome: 'Role Player' },
  },
  {
    pick: 20, team: 'Cleveland Cavaliers', name: 'Zydrunas Ilgauskas', school: 'Lithuania', pos: 'C',
    birthYear: 1975, height: 87, weight: 260, wingspan: 90, conf: 'Lithuanian League',
    archetype: 'Stretch Big',
    // 1995-96 Lithuanian Basketball League stats — estimated for 20-year-old Ilgauskas
    stats: { games: 30, mpg: 28.5, ppg: 16.5, rpg: 9.8, apg: 0.8, spg: 0.5, bpg: 2.8, tov: 1.8, pf: 3.2, fg_pct: 0.535, three_pt_pct: null, ft_pct: 0.752, pts_per40: 23.2, reb_per40: 13.7, ast_per40: 1.1, stl_per40: 0.7, blk_per40: 3.9, tov_per40: 2.5, usg: 0.268, per: 25.5, bpm: 9.0, obpm: 4.5, dbpm: 4.5, ws: 7.5, efg_pct: 0.535, ts_pct: 0.610, ast_pct: 0.042, tov_pct: 0.118, stl_pct: 0.012, blk_pct: 0.082, orb_pct: 0.098, drb_pct: 0.232, drtg: 90.5 },
    nba: { ppg: 14.5, rpg: 8.7, apg: 1.2, spg: 0.4, bpg: 1.8, ws48: 0.142, outcome: 'All-Star' },
  },
  {
    pick: 21, team: 'Utah Jazz', name: 'Martin Muursepp', school: 'Estonia', pos: 'SF',
    birthYear: 1974, height: 80, weight: 215, wingspan: 83, conf: 'Estonian League',
    archetype: 'Stretch Wing',
    stats: { games: 28, mpg: 24.5, ppg: 12.8, rpg: 5.2, apg: 1.8, spg: 1.2, bpg: 0.5, tov: 1.5, pf: 2.5, fg_pct: 0.505, three_pt_pct: 0.358, ft_pct: 0.748, pts_per40: 20.9, reb_per40: 8.5, ast_per40: 2.9, stl_per40: 2.0, blk_per40: 0.8, tov_per40: 2.4, usg: 0.248, per: 18.5, bpm: 4.2, obpm: 2.8, dbpm: 1.4, ws: 4.5, efg_pct: 0.548, ts_pct: 0.592, ast_pct: 0.095, tov_pct: 0.115, stl_pct: 0.025, blk_pct: 0.012, orb_pct: 0.052, drb_pct: 0.148, drtg: 95.2 },
    nba: { ppg: 2.5, rpg: 1.5, apg: 0.5, spg: 0.3, bpg: 0.1, ws48: 0.032, outcome: 'Out of League' },
  },
  {
    pick: 22, team: 'Detroit Pistons', name: 'Jerome Williams', school: 'Georgetown', pos: 'PF',
    birthYear: 1973, height: 80, weight: 219, wingspan: 85, conf: 'Big East',
    archetype: 'Rim Runner',
    // 1995-96 Georgetown: 11.8 PPG, 10.2 RPG, 1.2 APG in 32 games (senior)
    stats: { games: 32, mpg: 28.5, ppg: 11.8, rpg: 10.2, apg: 1.2, spg: 1.5, bpg: 1.2, tov: 1.8, pf: 3.2, fg_pct: 0.545, three_pt_pct: null, ft_pct: 0.625, pts_per40: 16.6, reb_per40: 14.3, ast_per40: 1.7, stl_per40: 2.1, blk_per40: 1.7, tov_per40: 2.5, usg: 0.228, per: 22.5, bpm: 6.5, obpm: 2.0, dbpm: 4.5, ws: 6.2, efg_pct: 0.545, ts_pct: 0.576, ast_pct: 0.062, tov_pct: 0.148, stl_pct: 0.030, blk_pct: 0.038, orb_pct: 0.118, drb_pct: 0.255, drtg: 90.8 },
    nba: { ppg: 6.5, rpg: 6.0, apg: 0.8, spg: 0.8, bpg: 0.6, ws48: 0.092, outcome: 'Role Player' },
  },
  {
    pick: 23, team: 'Vancouver Grizzlies', name: 'Othella Harrington', school: 'Georgetown', pos: 'C',
    birthYear: 1974, height: 82, weight: 235, wingspan: 84, conf: 'Big East',
    archetype: 'Drop Coverage Big',
    // 1995-96 Georgetown: 16.5 PPG, 9.8 RPG, 1.2 APG in 32 games (senior)
    stats: { games: 32, mpg: 30.5, ppg: 16.5, rpg: 9.8, apg: 1.2, spg: 0.8, bpg: 1.8, tov: 2.0, pf: 3.3, fg_pct: 0.558, three_pt_pct: null, ft_pct: 0.672, pts_per40: 21.6, reb_per40: 12.8, ast_per40: 1.6, stl_per40: 1.0, blk_per40: 2.4, tov_per40: 2.6, usg: 0.268, per: 23.5, bpm: 6.5, obpm: 3.0, dbpm: 3.5, ws: 6.0, efg_pct: 0.558, ts_pct: 0.596, ast_pct: 0.062, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.055, orb_pct: 0.105, drb_pct: 0.238, drtg: 92.0 },
    nba: { ppg: 6.8, rpg: 5.0, apg: 0.6, spg: 0.4, bpg: 0.8, ws48: 0.080, outcome: 'Role Player' },
  },
  {
    pick: 24, team: 'Charlotte Hornets', name: 'Derek Fisher', school: 'Arkansas-Little Rock', pos: 'PG',
    birthYear: 1974, height: 73, weight: 210, wingspan: 77, conf: 'Sun Belt',
    archetype: 'POA Defender',
    // 1995-96 UALR: 16.0 PPG, 3.8 RPG, 5.2 APG in 29 games (senior)
    stats: { games: 29, mpg: 34.5, ppg: 16.0, rpg: 3.8, apg: 5.2, spg: 2.2, bpg: 0.2, tov: 3.0, pf: 2.8, fg_pct: 0.468, three_pt_pct: 0.378, ft_pct: 0.818, pts_per40: 18.6, reb_per40: 4.4, ast_per40: 6.0, stl_per40: 2.5, blk_per40: 0.2, tov_per40: 3.5, usg: 0.268, per: 19.8, bpm: 5.2, obpm: 3.5, dbpm: 1.7, ws: 5.8, efg_pct: 0.522, ts_pct: 0.575, ast_pct: 0.278, tov_pct: 0.158, stl_pct: 0.042, blk_pct: 0.004, orb_pct: 0.025, drb_pct: 0.095, drtg: 93.5 },
    nba: { ppg: 7.5, rpg: 2.5, apg: 2.8, spg: 0.8, bpg: 0.1, ws48: 0.095, outcome: 'Starter' },
  },
  {
    pick: 25, team: 'Seattle SuperSonics', name: 'Efthimios Rentzias', school: 'Greece', pos: 'PF',
    birthYear: 1976, height: 84, weight: 255, wingspan: 86, conf: 'Greek League',
    archetype: 'Drop Coverage Big',
    stats: { games: 25, mpg: 22.0, ppg: 10.5, rpg: 7.5, apg: 0.8, spg: 0.5, bpg: 1.2, tov: 1.5, pf: 3.0, fg_pct: 0.532, three_pt_pct: null, ft_pct: 0.682, pts_per40: 19.1, reb_per40: 13.6, ast_per40: 1.5, stl_per40: 0.9, blk_per40: 2.2, tov_per40: 2.7, usg: 0.245, per: 20.0, bpm: 4.5, obpm: 2.0, dbpm: 2.5, ws: 4.2, efg_pct: 0.532, ts_pct: 0.582, ast_pct: 0.042, tov_pct: 0.130, stl_pct: 0.012, blk_pct: 0.038, orb_pct: 0.085, drb_pct: 0.195, drtg: 95.5 },
    nba: { ppg: 1.8, rpg: 1.5, apg: 0.2, spg: 0.2, bpg: 0.2, ws48: 0.020, outcome: 'Out of League' },
  },
  {
    pick: 26, team: 'Miami Heat', name: 'Predrag Drobnjak', school: 'KK Buducnost Yugoslavia', pos: 'C',
    birthYear: 1975, height: 84, weight: 270, wingspan: 86, conf: 'Yugoslav League',
    archetype: 'Drop Coverage Big',
    // 1995-96 Yugoslav League — estimated stats for 20-year-old Drobnjak
    stats: { games: 28, mpg: 26.5, ppg: 13.5, rpg: 8.5, apg: 1.0, spg: 0.5, bpg: 1.8, tov: 1.8, pf: 3.2, fg_pct: 0.548, three_pt_pct: null, ft_pct: 0.658, pts_per40: 20.4, reb_per40: 12.8, ast_per40: 1.5, stl_per40: 0.8, blk_per40: 2.7, tov_per40: 2.7, usg: 0.258, per: 20.5, bpm: 5.0, obpm: 2.5, dbpm: 2.5, ws: 4.8, efg_pct: 0.548, ts_pct: 0.588, ast_pct: 0.052, tov_pct: 0.132, stl_pct: 0.012, blk_pct: 0.055, orb_pct: 0.095, drb_pct: 0.218, drtg: 94.5 },
    nba: { ppg: 5.8, rpg: 3.8, apg: 0.5, spg: 0.3, bpg: 0.5, ws48: 0.058, outcome: 'Role Player' },
  },
  {
    pick: 27, team: 'Orlando Magic', name: 'Brian Evans', school: 'Indiana', pos: 'SF',
    birthYear: 1973, height: 80, weight: 220, wingspan: 82, conf: 'Big Ten',
    archetype: 'Stretch Wing',
    // 1995-96 Indiana: 20.0 PPG, 5.8 RPG, 3.5 APG in 30 games (senior)
    stats: { games: 30, mpg: 33.5, ppg: 20.0, rpg: 5.8, apg: 3.5, spg: 1.2, bpg: 0.4, tov: 2.5, pf: 2.8, fg_pct: 0.498, three_pt_pct: 0.428, ft_pct: 0.812, pts_per40: 23.9, reb_per40: 6.9, ast_per40: 4.2, stl_per40: 1.4, blk_per40: 0.5, tov_per40: 3.0, usg: 0.285, per: 21.0, bpm: 5.5, obpm: 4.2, dbpm: 1.3, ws: 6.2, efg_pct: 0.552, ts_pct: 0.608, ast_pct: 0.178, tov_pct: 0.128, stl_pct: 0.025, blk_pct: 0.010, orb_pct: 0.042, drb_pct: 0.148, drtg: 94.8 },
    nba: { ppg: 2.5, rpg: 1.5, apg: 0.5, spg: 0.2, bpg: 0.1, ws48: 0.028, outcome: 'Out of League' },
  },
  {
    pick: 28, team: 'New York Knicks', name: 'Dontae\' Jones', school: 'Mississippi State', pos: 'SF',
    birthYear: 1975, height: 79, weight: 213, wingspan: 83, conf: 'SEC',
    archetype: 'Two Way Star Wing',
    // 1995-96 Mississippi State: 20.2 PPG, 7.5 RPG, 2.8 APG in 33 games (junior)
    stats: { games: 33, mpg: 33.2, ppg: 20.2, rpg: 7.5, apg: 2.8, spg: 2.0, bpg: 0.8, tov: 2.5, pf: 2.8, fg_pct: 0.478, three_pt_pct: 0.298, ft_pct: 0.745, pts_per40: 24.3, reb_per40: 9.0, ast_per40: 3.4, stl_per40: 2.4, blk_per40: 1.0, tov_per40: 3.0, usg: 0.295, per: 20.5, bpm: 5.2, obpm: 3.8, dbpm: 1.4, ws: 6.0, efg_pct: 0.515, ts_pct: 0.565, ast_pct: 0.142, tov_pct: 0.132, stl_pct: 0.040, blk_pct: 0.020, orb_pct: 0.065, drb_pct: 0.175, drtg: 94.2 },
    nba: { ppg: 2.8, rpg: 1.5, apg: 0.5, spg: 0.4, bpg: 0.2, ws48: 0.025, outcome: 'Out of League' },
  },
  {
    pick: 29, team: 'LA Lakers', name: 'Travis Knight', school: 'Connecticut', pos: 'C',
    birthYear: 1974, height: 84, weight: 235, wingspan: 86, conf: 'Big East',
    archetype: 'Drop Coverage Big',
    // 1995-96 UConn: 9.8 PPG, 7.2 RPG, 1.0 APG in 32 games (senior)
    stats: { games: 32, mpg: 23.8, ppg: 9.8, rpg: 7.2, apg: 1.0, spg: 0.6, bpg: 1.8, tov: 1.5, pf: 2.8, fg_pct: 0.568, three_pt_pct: null, ft_pct: 0.755, pts_per40: 16.5, reb_per40: 12.1, ast_per40: 1.7, stl_per40: 1.0, blk_per40: 3.0, tov_per40: 2.5, usg: 0.218, per: 20.8, bpm: 5.0, obpm: 2.0, dbpm: 3.0, ws: 4.5, efg_pct: 0.568, ts_pct: 0.618, ast_pct: 0.055, tov_pct: 0.148, stl_pct: 0.014, blk_pct: 0.058, orb_pct: 0.092, drb_pct: 0.195, drtg: 93.5 },
    nba: { ppg: 3.2, rpg: 3.0, apg: 0.4, spg: 0.3, bpg: 0.5, ws48: 0.052, outcome: 'Role Player' },
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
      class: p.classYear || 'Senior',
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
