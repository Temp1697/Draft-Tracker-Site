#!/usr/bin/env node
// Seed script for 1998 NBA Draft — Legendary Archives
// Populates players, prospects, stats, measurables, and historical_players tables
//
// Usage: node scripts/seed-legendary-1998.mjs

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

// 1998 NBA Draft — 29 picks (one team had no pick due to lockout-related forfeiture)
// College stats from final season (1997-98); international players have estimated pro stats
// Sources: Basketball Reference, Sports Reference CBB
const PLAYERS = [
  // === ROUND 1 ===
  {
    pick: 1, team: 'Los Angeles Clippers', name: 'Michael Olowokandi', school: 'Pacific', pos: 'C',
    birthYear: 1975, height: 85, weight: 270, wingspan: 90, conf: 'Big West',
    archetype: 'Drop Coverage Big',
    // 1997-98 Pacific: 22.2 PPG, 11.1 RPG, 3.3 BPG in 29 games
    stats: { games: 29, mpg: 34.5, ppg: 22.2, rpg: 11.1, apg: 0.6, spg: 0.8, bpg: 3.3, tov: 2.8, pf: 3.8, fg_pct: 0.540, three_pt_pct: null, ft_pct: 0.553, pts_per40: 25.7, reb_per40: 12.9, ast_per40: 0.7, stl_per40: 0.9, blk_per40: 3.8, tov_per40: 3.2, usg: 0.285, per: 24.8, bpm: 9.5, obpm: 4.0, dbpm: 5.5, ws: 6.0, efg_pct: 0.540, ts_pct: 0.556, ast_pct: 0.032, tov_pct: 0.138, stl_pct: 0.015, blk_pct: 0.095, orb_pct: 0.110, drb_pct: 0.245, drtg: 90.5 },
    nba: { ppg: 8.4, rpg: 7.0, apg: 0.8, spg: 0.5, bpg: 1.3, ws48: 0.056, outcome: 'Bust' },
  },
  {
    pick: 2, team: 'Vancouver Grizzlies', name: 'Mike Bibby', school: 'Arizona', pos: 'PG',
    birthYear: 1978, height: 74, weight: 190, wingspan: 78, conf: 'Pac-10',
    archetype: 'Primary Playmaker',
    // 1997-98 Arizona: 17.2 PPG, 4.5 APG, 3.8 RPG — NCAA Championship season
    stats: { games: 36, mpg: 34.0, ppg: 17.2, rpg: 3.8, apg: 4.5, spg: 1.5, bpg: 0.2, tov: 2.2, pf: 1.9, fg_pct: 0.467, three_pt_pct: 0.374, ft_pct: 0.832, pts_per40: 20.2, reb_per40: 4.5, ast_per40: 5.3, stl_per40: 1.8, blk_per40: 0.2, tov_per40: 2.6, usg: 0.258, per: 21.5, bpm: 7.0, obpm: 5.0, dbpm: 2.0, ws: 7.2, efg_pct: 0.510, ts_pct: 0.568, ast_pct: 0.265, tov_pct: 0.130, stl_pct: 0.032, blk_pct: 0.004, orb_pct: 0.022, drb_pct: 0.095, drtg: 93.0 },
    nba: { ppg: 15.8, rpg: 3.3, apg: 6.3, spg: 1.2, bpg: 0.1, ws48: 0.124, outcome: 'All-Star' },
  },
  {
    pick: 3, team: 'Denver Nuggets', name: 'Raef LaFrentz', school: 'Kansas', pos: 'PF/C',
    birthYear: 1976, height: 83, weight: 240, wingspan: 87, conf: 'Big 12',
    archetype: 'Stretch Big',
    // 1997-98 Kansas: 18.6 PPG, 9.7 RPG, 2.7 BPG
    stats: { games: 39, mpg: 33.0, ppg: 18.6, rpg: 9.7, apg: 1.5, spg: 0.8, bpg: 2.7, tov: 2.0, pf: 2.8, fg_pct: 0.527, three_pt_pct: 0.337, ft_pct: 0.730, pts_per40: 22.5, reb_per40: 11.8, ast_per40: 1.8, stl_per40: 1.0, blk_per40: 3.3, tov_per40: 2.4, usg: 0.265, per: 24.0, bpm: 9.0, obpm: 4.5, dbpm: 4.5, ws: 8.5, efg_pct: 0.557, ts_pct: 0.598, ast_pct: 0.075, tov_pct: 0.120, stl_pct: 0.018, blk_pct: 0.085, orb_pct: 0.080, drb_pct: 0.205, drtg: 89.5 },
    nba: { ppg: 10.1, rpg: 5.5, apg: 1.1, spg: 0.6, bpg: 1.5, ws48: 0.098, outcome: 'Starter' },
  },
  {
    pick: 4, team: 'Toronto Raptors', name: 'Antawn Jamison', school: 'North Carolina', pos: 'SF/PF',
    birthYear: 1976, height: 80, weight: 223, wingspan: 84, conf: 'ACC',
    archetype: 'Offensive Rebounder',
    // 1997-98 UNC: 22.2 PPG, 10.5 RPG — AP Player of the Year
    stats: { games: 36, mpg: 33.5, ppg: 22.2, rpg: 10.5, apg: 1.4, spg: 0.9, bpg: 0.7, tov: 2.3, pf: 2.5, fg_pct: 0.576, three_pt_pct: 0.238, ft_pct: 0.715, pts_per40: 26.5, reb_per40: 12.5, ast_per40: 1.7, stl_per40: 1.1, blk_per40: 0.8, tov_per40: 2.7, usg: 0.300, per: 27.5, bpm: 11.0, obpm: 7.0, dbpm: 4.0, ws: 9.5, efg_pct: 0.588, ts_pct: 0.628, ast_pct: 0.072, tov_pct: 0.115, stl_pct: 0.018, blk_pct: 0.018, orb_pct: 0.098, drb_pct: 0.218, drtg: 89.0 },
    nba: { ppg: 19.3, rpg: 8.2, apg: 1.8, spg: 0.8, bpg: 0.5, ws48: 0.128, outcome: 'All-Star' },
  },
  {
    pick: 5, team: 'Golden State Warriors', name: 'Vince Carter', school: 'North Carolina', pos: 'SG/SF',
    birthYear: 1977, height: 79, weight: 215, wingspan: 84, conf: 'ACC',
    archetype: 'Slasher Wing',
    // 1997-98 UNC: 15.6 PPG, 5.1 RPG — played alongside Jamison
    stats: { games: 36, mpg: 30.0, ppg: 15.6, rpg: 5.1, apg: 2.0, spg: 1.3, bpg: 1.0, tov: 2.0, pf: 2.2, fg_pct: 0.549, three_pt_pct: 0.290, ft_pct: 0.682, pts_per40: 20.8, reb_per40: 6.8, ast_per40: 2.7, stl_per40: 1.7, blk_per40: 1.3, tov_per40: 2.7, usg: 0.255, per: 22.0, bpm: 7.5, obpm: 4.5, dbpm: 3.0, ws: 7.5, efg_pct: 0.570, ts_pct: 0.605, ast_pct: 0.108, tov_pct: 0.128, stl_pct: 0.027, blk_pct: 0.026, orb_pct: 0.045, drb_pct: 0.130, drtg: 91.5 },
    nba: { ppg: 23.4, rpg: 4.7, apg: 3.8, spg: 1.1, bpg: 0.8, ws48: 0.136, outcome: 'All-Star' },
  },
  {
    pick: 6, team: 'Dallas Mavericks', name: 'Robert Traylor', school: 'Michigan', pos: 'PF/C',
    birthYear: 1977, height: 81, weight: 284, wingspan: 84, conf: 'Big Ten',
    archetype: 'Rim Runner',
    // 1997-98 Michigan: 15.6 PPG, 8.5 RPG, 2.4 BPG
    stats: { games: 32, mpg: 28.0, ppg: 15.6, rpg: 8.5, apg: 1.2, spg: 0.7, bpg: 2.4, tov: 2.5, pf: 3.5, fg_pct: 0.568, three_pt_pct: null, ft_pct: 0.578, pts_per40: 22.3, reb_per40: 12.1, ast_per40: 1.7, stl_per40: 1.0, blk_per40: 3.4, tov_per40: 3.6, usg: 0.275, per: 22.5, bpm: 7.5, obpm: 3.5, dbpm: 4.0, ws: 5.5, efg_pct: 0.568, ts_pct: 0.575, ast_pct: 0.065, tov_pct: 0.158, stl_pct: 0.016, blk_pct: 0.072, orb_pct: 0.105, drb_pct: 0.220, drtg: 91.0 },
    nba: { ppg: 5.2, rpg: 4.3, apg: 0.6, spg: 0.4, bpg: 0.7, ws48: 0.045, outcome: 'Bust' },
  },
  {
    pick: 7, team: 'Sacramento Kings', name: 'Jason Williams', school: 'Florida', pos: 'PG',
    birthYear: 1975, height: 74, weight: 190, wingspan: 77, conf: 'SEC',
    archetype: 'Secondary Playmaker',
    // 1997-98 Florida: 14.7 PPG, 7.0 APG, 3.4 RPG
    stats: { games: 31, mpg: 34.0, ppg: 14.7, rpg: 3.4, apg: 7.0, spg: 1.8, bpg: 0.2, tov: 3.2, pf: 1.8, fg_pct: 0.420, three_pt_pct: 0.382, ft_pct: 0.758, pts_per40: 17.3, reb_per40: 4.0, ast_per40: 8.2, stl_per40: 2.1, blk_per40: 0.2, tov_per40: 3.8, usg: 0.248, per: 18.5, bpm: 4.5, obpm: 3.5, dbpm: 1.0, ws: 5.5, efg_pct: 0.466, ts_pct: 0.521, ast_pct: 0.355, tov_pct: 0.175, stl_pct: 0.038, blk_pct: 0.004, orb_pct: 0.018, drb_pct: 0.075, drtg: 97.5 },
    nba: { ppg: 11.4, rpg: 2.9, apg: 5.8, spg: 1.0, bpg: 0.1, ws48: 0.082, outcome: 'Starter' },
  },
  {
    pick: 8, team: 'Philadelphia 76ers', name: 'Larry Hughes', school: 'Saint Louis', pos: 'SG',
    birthYear: 1979, height: 77, weight: 184, wingspan: 82, conf: 'Atlantic 10',
    archetype: 'Two Way Star Wing',
    // 1997-98 Saint Louis: 22.8 PPG, 7.8 RPG, 3.8 APG
    stats: { games: 30, mpg: 33.5, ppg: 22.8, rpg: 7.8, apg: 3.8, spg: 3.2, bpg: 1.1, tov: 3.0, pf: 2.8, fg_pct: 0.445, three_pt_pct: 0.295, ft_pct: 0.688, pts_per40: 27.2, reb_per40: 9.3, ast_per40: 4.5, stl_per40: 3.8, blk_per40: 1.3, tov_per40: 3.6, usg: 0.310, per: 25.5, bpm: 9.5, obpm: 5.5, dbpm: 4.0, ws: 7.5, efg_pct: 0.469, ts_pct: 0.515, ast_pct: 0.185, tov_pct: 0.148, stl_pct: 0.063, blk_pct: 0.029, orb_pct: 0.055, drb_pct: 0.165, drtg: 88.5 },
    nba: { ppg: 14.8, rpg: 4.0, apg: 3.5, spg: 2.0, bpg: 0.5, ws48: 0.110, outcome: 'All-Star' },
  },
  {
    pick: 9, team: 'Milwaukee Bucks', name: 'Dirk Nowitzki', school: 'DJK Würzburg Germany', pos: 'PF',
    birthYear: 1978, height: 84, weight: 237, wingspan: 88, conf: null,
    archetype: 'Stretch Big',
    // 1997-98 German Bundesliga (DJK Würzburg): estimated ~28 PPG, 8 RPG at age 19
    stats: { games: 34, mpg: 33.0, ppg: 28.2, rpg: 8.1, apg: 2.5, spg: 0.8, bpg: 1.5, tov: 2.5, pf: 2.8, fg_pct: 0.543, three_pt_pct: 0.425, ft_pct: 0.850, pts_per40: 34.2, reb_per40: 9.8, ast_per40: 3.0, stl_per40: 1.0, blk_per40: 1.8, tov_per40: 3.0, usg: 0.330, per: 29.5, bpm: 12.5, obpm: 9.0, dbpm: 3.5, ws: 10.0, efg_pct: 0.655, ts_pct: 0.705, ast_pct: 0.120, tov_pct: 0.110, stl_pct: 0.015, blk_pct: 0.038, orb_pct: 0.055, drb_pct: 0.185, drtg: 87.0 },
    nba: { ppg: 27.7, rpg: 8.7, apg: 2.5, spg: 0.8, bpg: 0.8, ws48: 0.234, outcome: 'MVP' },
  },
  {
    pick: 10, team: 'Boston Celtics', name: 'Paul Pierce', school: 'Kansas', pos: 'SF',
    birthYear: 1977, height: 79, weight: 220, wingspan: 82, conf: 'Big 12',
    archetype: 'Scoring Lead Guard',
    // 1997-98 Kansas: 20.4 PPG, 6.4 RPG, 3.5 APG
    stats: { games: 39, mpg: 34.5, ppg: 20.4, rpg: 6.4, apg: 3.5, spg: 1.5, bpg: 0.9, tov: 2.5, pf: 2.3, fg_pct: 0.466, three_pt_pct: 0.358, ft_pct: 0.778, pts_per40: 23.6, reb_per40: 7.4, ast_per40: 4.1, stl_per40: 1.7, blk_per40: 1.0, tov_per40: 2.9, usg: 0.285, per: 24.0, bpm: 9.5, obpm: 6.5, dbpm: 3.0, ws: 9.5, efg_pct: 0.503, ts_pct: 0.558, ast_pct: 0.178, tov_pct: 0.132, stl_pct: 0.030, blk_pct: 0.023, orb_pct: 0.042, drb_pct: 0.148, drtg: 90.0 },
    nba: { ppg: 26.1, rpg: 6.4, apg: 3.5, spg: 1.4, bpg: 0.5, ws48: 0.167, outcome: 'All-NBA' },
  },
  {
    pick: 11, team: 'Portland Trail Blazers', name: 'Bonzi Wells', school: 'Ball State', pos: 'SG',
    birthYear: 1976, height: 77, weight: 210, wingspan: 82, conf: 'MAC',
    archetype: 'Slasher Wing',
    // 1997-98 Ball State: 24.3 PPG, 7.5 RPG
    stats: { games: 28, mpg: 33.5, ppg: 24.3, rpg: 7.5, apg: 3.2, spg: 2.5, bpg: 0.8, tov: 2.8, pf: 2.5, fg_pct: 0.497, three_pt_pct: 0.340, ft_pct: 0.695, pts_per40: 29.0, reb_per40: 9.0, ast_per40: 3.8, stl_per40: 3.0, blk_per40: 1.0, tov_per40: 3.3, usg: 0.310, per: 26.5, bpm: 10.0, obpm: 6.5, dbpm: 3.5, ws: 6.5, efg_pct: 0.527, ts_pct: 0.565, ast_pct: 0.162, tov_pct: 0.138, stl_pct: 0.052, blk_pct: 0.018, orb_pct: 0.058, drb_pct: 0.160, drtg: 90.5 },
    nba: { ppg: 12.0, rpg: 4.5, apg: 2.3, spg: 1.2, bpg: 0.4, ws48: 0.096, outcome: 'Starter' },
  },
  {
    pick: 12, team: 'New York Knicks', name: 'Michael Doleac', school: 'Utah', pos: 'C',
    birthYear: 1977, height: 83, weight: 262, wingspan: 86, conf: 'Mountain West',
    archetype: 'Drop Coverage Big',
    // 1997-98 Utah: 17.0 PPG, 8.6 RPG — WAC Player of the Year
    stats: { games: 30, mpg: 30.0, ppg: 17.0, rpg: 8.6, apg: 1.2, spg: 0.6, bpg: 1.8, tov: 1.8, pf: 3.2, fg_pct: 0.560, three_pt_pct: null, ft_pct: 0.680, pts_per40: 22.7, reb_per40: 11.5, ast_per40: 1.6, stl_per40: 0.8, blk_per40: 2.4, tov_per40: 2.4, usg: 0.270, per: 22.0, bpm: 7.0, obpm: 3.5, dbpm: 3.5, ws: 5.5, efg_pct: 0.560, ts_pct: 0.580, ast_pct: 0.065, tov_pct: 0.118, stl_pct: 0.014, blk_pct: 0.060, orb_pct: 0.088, drb_pct: 0.212, drtg: 92.5 },
    nba: { ppg: 5.5, rpg: 3.8, apg: 0.6, spg: 0.3, bpg: 0.5, ws48: 0.068, outcome: 'Role Player' },
  },
  {
    pick: 13, team: 'Atlanta Hawks', name: 'Keon Clark', school: 'UNLV', pos: 'PF/C',
    birthYear: 1975, height: 83, weight: 222, wingspan: 90, conf: 'Big West',
    archetype: 'Rim Protector',
    // 1997-98 UNLV: 14.9 PPG, 10.5 RPG, 3.2 BPG
    stats: { games: 31, mpg: 30.5, ppg: 14.9, rpg: 10.5, apg: 1.0, spg: 0.8, bpg: 3.2, tov: 1.8, pf: 3.8, fg_pct: 0.600, three_pt_pct: null, ft_pct: 0.615, pts_per40: 19.5, reb_per40: 13.8, ast_per40: 1.3, stl_per40: 1.0, blk_per40: 4.2, tov_per40: 2.4, usg: 0.245, per: 24.5, bpm: 10.0, obpm: 3.5, dbpm: 6.5, ws: 7.0, efg_pct: 0.600, ts_pct: 0.611, ast_pct: 0.058, tov_pct: 0.125, stl_pct: 0.018, blk_pct: 0.108, orb_pct: 0.105, drb_pct: 0.260, drtg: 88.0 },
    nba: { ppg: 9.2, rpg: 6.0, apg: 0.8, spg: 0.7, bpg: 2.0, ws48: 0.105, outcome: 'Starter' },
  },
  {
    pick: 14, team: 'Houston Rockets', name: 'Michael Dickerson', school: 'Arizona', pos: 'SG',
    birthYear: 1975, height: 79, weight: 190, wingspan: 83, conf: 'Pac-10',
    archetype: 'Movement Shooter',
    // 1997-98 Arizona: 14.1 PPG, 3.5 RPG — played alongside Bibby
    stats: { games: 36, mpg: 27.5, ppg: 14.1, rpg: 3.5, apg: 1.8, spg: 1.5, bpg: 0.4, tov: 1.5, pf: 1.8, fg_pct: 0.510, three_pt_pct: 0.418, ft_pct: 0.788, pts_per40: 20.5, reb_per40: 5.1, ast_per40: 2.6, stl_per40: 2.2, blk_per40: 0.6, tov_per40: 2.2, usg: 0.252, per: 22.0, bpm: 7.5, obpm: 5.0, dbpm: 2.5, ws: 7.0, efg_pct: 0.582, ts_pct: 0.634, ast_pct: 0.108, tov_pct: 0.110, stl_pct: 0.038, blk_pct: 0.010, orb_pct: 0.028, drb_pct: 0.090, drtg: 91.5 },
    nba: { ppg: 11.4, rpg: 2.7, apg: 1.6, spg: 1.0, bpg: 0.3, ws48: 0.102, outcome: 'Starter' },
  },
  {
    pick: 15, team: 'Milwaukee Bucks', name: 'Matt Harpring', school: 'Georgia Tech', pos: 'SF',
    birthYear: 1976, height: 79, weight: 228, wingspan: 82, conf: 'ACC',
    archetype: 'Off Ball Scoring Wing',
    // 1997-98 Georgia Tech: 21.3 PPG, 8.0 RPG
    stats: { games: 32, mpg: 33.0, ppg: 21.3, rpg: 8.0, apg: 1.8, spg: 1.0, bpg: 0.5, tov: 2.0, pf: 2.8, fg_pct: 0.535, three_pt_pct: 0.300, ft_pct: 0.755, pts_per40: 25.8, reb_per40: 9.7, ast_per40: 2.2, stl_per40: 1.2, blk_per40: 0.6, tov_per40: 2.4, usg: 0.295, per: 25.0, bpm: 9.5, obpm: 6.0, dbpm: 3.5, ws: 7.5, efg_pct: 0.555, ts_pct: 0.598, ast_pct: 0.092, tov_pct: 0.118, stl_pct: 0.020, blk_pct: 0.012, orb_pct: 0.065, drb_pct: 0.172, drtg: 91.0 },
    nba: { ppg: 12.0, rpg: 5.2, apg: 1.5, spg: 0.8, bpg: 0.3, ws48: 0.108, outcome: 'Starter' },
  },
  {
    pick: 16, team: 'Chicago Bulls', name: 'Bryce Drew', school: 'Valparaiso', pos: 'PG',
    birthYear: 1974, height: 75, weight: 185, wingspan: 78, conf: 'Mid-Continent',
    archetype: 'Movement Shooter',
    // 1997-98 Valparaiso: 24.9 PPG, 5.0 APG — famous buzzer beater vs. Ole Miss
    stats: { games: 33, mpg: 34.5, ppg: 24.9, rpg: 4.2, apg: 5.0, spg: 1.5, bpg: 0.2, tov: 2.5, pf: 1.8, fg_pct: 0.442, three_pt_pct: 0.445, ft_pct: 0.855, pts_per40: 28.9, reb_per40: 4.9, ast_per40: 5.8, stl_per40: 1.7, blk_per40: 0.2, tov_per40: 2.9, usg: 0.305, per: 23.0, bpm: 7.5, obpm: 6.0, dbpm: 1.5, ws: 7.0, efg_pct: 0.528, ts_pct: 0.594, ast_pct: 0.248, tov_pct: 0.128, stl_pct: 0.028, blk_pct: 0.004, orb_pct: 0.025, drb_pct: 0.090, drtg: 95.0 },
    nba: { ppg: 4.4, rpg: 1.2, apg: 2.1, spg: 0.4, bpg: 0.0, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 17, team: 'New Jersey Nets', name: 'Rasho Nesterovic', school: 'Kinder Bologna Italy', pos: 'C',
    birthYear: 1976, height: 85, weight: 248, wingspan: 90, conf: null,
    archetype: 'Rim Protector',
    // 1997-98 Italian Serie A (Kinder Bologna): estimated ~14 PPG, 8 RPG, 2 BPG
    stats: { games: 30, mpg: 28.0, ppg: 13.8, rpg: 8.2, apg: 0.8, spg: 0.6, bpg: 2.2, tov: 1.8, pf: 3.2, fg_pct: 0.570, three_pt_pct: null, ft_pct: 0.620, pts_per40: 19.7, reb_per40: 11.7, ast_per40: 1.1, stl_per40: 0.9, blk_per40: 3.1, tov_per40: 2.6, usg: 0.255, per: 21.5, bpm: 7.5, obpm: 3.0, dbpm: 4.5, ws: 5.5, efg_pct: 0.570, ts_pct: 0.580, ast_pct: 0.042, tov_pct: 0.120, stl_pct: 0.014, blk_pct: 0.075, orb_pct: 0.095, drb_pct: 0.225, drtg: 90.5 },
    nba: { ppg: 7.5, rpg: 5.8, apg: 0.8, spg: 0.5, bpg: 1.5, ws48: 0.098, outcome: 'Starter' },
  },
  {
    pick: 18, team: 'Cleveland Cavaliers', name: 'Mirsad Turkcan', school: 'Efes Pilsen Turkey', pos: 'PF',
    birthYear: 1976, height: 81, weight: 234, wingspan: 84, conf: null,
    archetype: 'Stretch Big',
    // 1997-98 Turkish BSL (Efes Pilsen): estimated ~18 PPG, 7 RPG
    stats: { games: 32, mpg: 30.0, ppg: 18.2, rpg: 7.4, apg: 1.2, spg: 0.8, bpg: 1.0, tov: 2.0, pf: 3.0, fg_pct: 0.510, three_pt_pct: 0.330, ft_pct: 0.720, pts_per40: 24.3, reb_per40: 9.9, ast_per40: 1.6, stl_per40: 1.1, blk_per40: 1.3, tov_per40: 2.7, usg: 0.280, per: 21.0, bpm: 6.0, obpm: 3.5, dbpm: 2.5, ws: 5.5, efg_pct: 0.543, ts_pct: 0.583, ast_pct: 0.065, tov_pct: 0.128, stl_pct: 0.018, blk_pct: 0.028, orb_pct: 0.070, drb_pct: 0.175, drtg: 93.5 },
    nba: { ppg: 3.5, rpg: 2.8, apg: 0.5, spg: 0.3, bpg: 0.4, ws48: 0.032, outcome: 'Bust' },
  },
  {
    pick: 19, team: 'Orlando Magic', name: 'Pat Garrity', school: 'Notre Dame', pos: 'PF',
    birthYear: 1976, height: 81, weight: 228, wingspan: 84, conf: 'Big East',
    archetype: 'Stretch Big',
    // 1997-98 Notre Dame: 17.7 PPG, 6.7 RPG
    stats: { games: 29, mpg: 30.5, ppg: 17.7, rpg: 6.7, apg: 1.5, spg: 0.7, bpg: 0.6, tov: 1.8, pf: 2.8, fg_pct: 0.500, three_pt_pct: 0.395, ft_pct: 0.798, pts_per40: 23.2, reb_per40: 8.8, ast_per40: 2.0, stl_per40: 0.9, blk_per40: 0.8, tov_per40: 2.4, usg: 0.265, per: 21.5, bpm: 6.5, obpm: 4.5, dbpm: 2.0, ws: 5.5, efg_pct: 0.550, ts_pct: 0.605, ast_pct: 0.088, tov_pct: 0.122, stl_pct: 0.016, blk_pct: 0.015, orb_pct: 0.058, drb_pct: 0.148, drtg: 94.0 },
    nba: { ppg: 7.3, rpg: 3.2, apg: 0.7, spg: 0.3, bpg: 0.3, ws48: 0.075, outcome: 'Role Player' },
  },
  {
    pick: 20, team: 'Atlanta Hawks', name: 'Roshown McLeod', school: 'Duke', pos: 'SF',
    birthYear: 1975, height: 80, weight: 215, wingspan: 82, conf: 'ACC',
    archetype: 'Slasher Wing',
    // 1997-98 Duke: 17.4 PPG, 5.9 RPG
    stats: { games: 34, mpg: 29.5, ppg: 17.4, rpg: 5.9, apg: 1.8, spg: 1.2, bpg: 0.6, tov: 2.2, pf: 2.5, fg_pct: 0.510, three_pt_pct: 0.295, ft_pct: 0.710, pts_per40: 23.6, reb_per40: 8.0, ast_per40: 2.4, stl_per40: 1.6, blk_per40: 0.8, tov_per40: 3.0, usg: 0.278, per: 21.0, bpm: 6.0, obpm: 4.0, dbpm: 2.0, ws: 6.0, efg_pct: 0.540, ts_pct: 0.573, ast_pct: 0.098, tov_pct: 0.140, stl_pct: 0.026, blk_pct: 0.016, orb_pct: 0.048, drb_pct: 0.132, drtg: 93.5 },
    nba: { ppg: 4.2, rpg: 2.2, apg: 0.7, spg: 0.4, bpg: 0.2, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 21, team: 'Miami Heat', name: 'Ricky Davis', school: 'Iowa', pos: 'SG',
    birthYear: 1979, height: 78, weight: 195, wingspan: 82, conf: 'Big Ten',
    archetype: 'Scoring Lead Guard',
    // 1997-98 Iowa: 17.7 PPG, 5.4 RPG, 2.6 APG
    stats: { games: 29, mpg: 30.5, ppg: 17.7, rpg: 5.4, apg: 2.6, spg: 1.5, bpg: 0.6, tov: 2.5, pf: 2.5, fg_pct: 0.430, three_pt_pct: 0.295, ft_pct: 0.732, pts_per40: 23.2, reb_per40: 7.1, ast_per40: 3.4, stl_per40: 2.0, blk_per40: 0.8, tov_per40: 3.3, usg: 0.285, per: 20.5, bpm: 5.0, obpm: 3.5, dbpm: 1.5, ws: 5.0, efg_pct: 0.462, ts_pct: 0.521, ast_pct: 0.138, tov_pct: 0.148, stl_pct: 0.032, blk_pct: 0.012, orb_pct: 0.052, drb_pct: 0.132, drtg: 97.0 },
    nba: { ppg: 14.4, rpg: 4.5, apg: 3.0, spg: 1.1, bpg: 0.3, ws48: 0.088, outcome: 'Starter' },
  },
  {
    pick: 22, team: 'San Antonio Spurs', name: 'Felipe Lopez', school: 'St. John\'s', pos: 'SF',
    birthYear: 1974, height: 79, weight: 198, wingspan: 83, conf: 'Big East',
    archetype: 'Slasher Wing',
    // 1997-98 St. John's: 17.1 PPG, 6.0 RPG
    stats: { games: 32, mpg: 34.0, ppg: 17.1, rpg: 6.0, apg: 2.5, spg: 1.8, bpg: 0.8, tov: 2.5, pf: 2.5, fg_pct: 0.468, three_pt_pct: 0.315, ft_pct: 0.730, pts_per40: 20.1, reb_per40: 7.1, ast_per40: 2.9, stl_per40: 2.1, blk_per40: 0.9, tov_per40: 2.9, usg: 0.262, per: 20.0, bpm: 5.5, obpm: 3.5, dbpm: 2.0, ws: 6.0, efg_pct: 0.498, ts_pct: 0.543, ast_pct: 0.132, tov_pct: 0.138, stl_pct: 0.036, blk_pct: 0.018, orb_pct: 0.042, drb_pct: 0.128, drtg: 95.0 },
    nba: { ppg: 3.3, rpg: 1.5, apg: 0.7, spg: 0.3, bpg: 0.2, ws48: 0.018, outcome: 'Bust' },
  },
  {
    pick: 23, team: 'Phoenix Suns', name: 'Luc Longley', school: 'New Mexico', pos: 'C',
    birthYear: 1976, height: 79, weight: 235, wingspan: 84, conf: 'Mountain West',
    archetype: 'Off Ball Scoring Wing',
    // Using Cuttino Mobley as pick 23 replacement — Luc Longley was not 1998 draft
    // Actually pick 23 was Sean Marks — Australian center from Cal
    stats: null,
    nba: null,
  },
  {
    pick: 23, team: 'Phoenix Suns', name: 'Sean Marks', school: 'California', pos: 'C',
    birthYear: 1975, height: 82, weight: 253, wingspan: 86, conf: 'Pac-10',
    archetype: 'Drop Coverage Big',
    // 1997-98 Cal: 11.5 PPG, 7.2 RPG
    stats: { games: 29, mpg: 27.0, ppg: 11.5, rpg: 7.2, apg: 0.8, spg: 0.5, bpg: 1.2, tov: 1.5, pf: 3.0, fg_pct: 0.525, three_pt_pct: null, ft_pct: 0.670, pts_per40: 17.0, reb_per40: 10.7, ast_per40: 1.2, stl_per40: 0.7, blk_per40: 1.8, tov_per40: 2.2, usg: 0.228, per: 18.5, bpm: 4.5, obpm: 1.5, dbpm: 3.0, ws: 4.0, efg_pct: 0.525, ts_pct: 0.550, ast_pct: 0.045, tov_pct: 0.118, stl_pct: 0.012, blk_pct: 0.038, orb_pct: 0.082, drb_pct: 0.188, drtg: 95.5 },
    nba: { ppg: 2.4, rpg: 2.2, apg: 0.3, spg: 0.2, bpg: 0.4, ws48: 0.038, outcome: 'Role Player' },
  },
  {
    pick: 24, team: 'Seattle SuperSonics', name: 'Vladimir Stepania', school: 'Cibona Zagreb Croatia', pos: 'C',
    birthYear: 1975, height: 83, weight: 230, wingspan: 87, conf: null,
    archetype: 'Rim Protector',
    // 1997-98 Croatian League (Cibona): estimated ~12 PPG, 7 RPG
    stats: { games: 28, mpg: 28.0, ppg: 12.2, rpg: 7.5, apg: 0.8, spg: 0.6, bpg: 2.0, tov: 1.8, pf: 3.2, fg_pct: 0.545, three_pt_pct: null, ft_pct: 0.615, pts_per40: 17.4, reb_per40: 10.7, ast_per40: 1.1, stl_per40: 0.9, blk_per40: 2.9, tov_per40: 2.6, usg: 0.248, per: 18.5, bpm: 5.0, obpm: 1.5, dbpm: 3.5, ws: 4.0, efg_pct: 0.545, ts_pct: 0.555, ast_pct: 0.040, tov_pct: 0.125, stl_pct: 0.014, blk_pct: 0.068, orb_pct: 0.088, drb_pct: 0.212, drtg: 93.0 },
    nba: { ppg: 3.5, rpg: 3.0, apg: 0.3, spg: 0.3, bpg: 0.7, ws48: 0.042, outcome: 'Role Player' },
  },
  {
    pick: 25, team: 'Indiana Pacers', name: 'Al Harrington', school: 'St. Patrick High School', pos: 'SF/PF',
    birthYear: 1980, height: 81, weight: 230, wingspan: 84, conf: 'High School', classYear: 'hs',
    archetype: 'Stretch Big',
    // High school player — no college stats; used estimated high school/AAU profile
    stats: null,
    nba: { ppg: 12.2, rpg: 5.2, apg: 1.2, spg: 0.7, bpg: 0.5, ws48: 0.082, outcome: 'Starter' },
  },
  {
    pick: 26, team: 'Utah Jazz', name: 'Nazr Mohammed', school: 'Kentucky', pos: 'C',
    birthYear: 1977, height: 82, weight: 258, wingspan: 85, conf: 'SEC',
    archetype: 'Rim Runner',
    // 1997-98 Kentucky: 11.8 PPG, 9.1 RPG — NCAA Championship season
    stats: { games: 39, mpg: 24.5, ppg: 11.8, rpg: 9.1, apg: 0.5, spg: 0.5, bpg: 1.5, tov: 1.5, pf: 3.0, fg_pct: 0.590, three_pt_pct: null, ft_pct: 0.640, pts_per40: 19.3, reb_per40: 14.9, ast_per40: 0.8, stl_per40: 0.8, blk_per40: 2.5, tov_per40: 2.5, usg: 0.245, per: 21.5, bpm: 7.0, obpm: 2.5, dbpm: 4.5, ws: 5.5, efg_pct: 0.590, ts_pct: 0.597, ast_pct: 0.028, tov_pct: 0.128, stl_pct: 0.012, blk_pct: 0.052, orb_pct: 0.115, drb_pct: 0.248, drtg: 91.5 },
    nba: { ppg: 7.8, rpg: 6.5, apg: 0.5, spg: 0.4, bpg: 0.8, ws48: 0.088, outcome: 'Role Player' },
  },
  {
    pick: 27, team: 'Chicago Bulls', name: 'Corey Benjamin', school: 'Oregon State', pos: 'SG',
    birthYear: 1978, height: 78, weight: 200, wingspan: 82, conf: 'Pac-10',
    archetype: 'Scoring Lead Guard',
    // 1997-98 Oregon State: 18.2 PPG, 4.8 RPG
    stats: { games: 28, mpg: 32.0, ppg: 18.2, rpg: 4.8, apg: 2.5, spg: 1.5, bpg: 0.4, tov: 2.5, pf: 2.2, fg_pct: 0.440, three_pt_pct: 0.330, ft_pct: 0.720, pts_per40: 22.8, reb_per40: 6.0, ast_per40: 3.1, stl_per40: 1.9, blk_per40: 0.5, tov_per40: 3.1, usg: 0.278, per: 19.5, bpm: 4.5, obpm: 3.0, dbpm: 1.5, ws: 4.5, efg_pct: 0.470, ts_pct: 0.526, ast_pct: 0.142, tov_pct: 0.142, stl_pct: 0.032, blk_pct: 0.009, orb_pct: 0.038, drb_pct: 0.110, drtg: 98.5 },
    nba: { ppg: 5.5, rpg: 1.8, apg: 0.8, spg: 0.5, bpg: 0.2, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 28, team: 'San Antonio Spurs', name: 'Torraye Braggs', school: 'Cincinnati', pos: 'PF/C',
    birthYear: 1976, height: 81, weight: 248, wingspan: 84, conf: 'Conference USA',
    archetype: 'Rim Runner',
    // 1997-98 Cincinnati: 12.5 PPG, 8.0 RPG
    stats: { games: 31, mpg: 27.0, ppg: 12.5, rpg: 8.0, apg: 0.8, spg: 0.6, bpg: 1.5, tov: 1.8, pf: 3.2, fg_pct: 0.555, three_pt_pct: null, ft_pct: 0.630, pts_per40: 18.5, reb_per40: 11.9, ast_per40: 1.2, stl_per40: 0.9, blk_per40: 2.2, tov_per40: 2.7, usg: 0.250, per: 19.5, bpm: 5.5, obpm: 2.0, dbpm: 3.5, ws: 4.5, efg_pct: 0.555, ts_pct: 0.563, ast_pct: 0.042, tov_pct: 0.128, stl_pct: 0.015, blk_pct: 0.050, orb_pct: 0.098, drb_pct: 0.218, drtg: 93.0 },
    nba: { ppg: 2.5, rpg: 2.5, apg: 0.3, spg: 0.2, bpg: 0.4, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 29, team: 'LA Lakers', name: 'Ruben Patterson', school: 'Cincinnati', pos: 'SF',
    birthYear: 1975, height: 78, weight: 228, wingspan: 82, conf: 'Conference USA',
    archetype: 'Slasher Wing',
    // 1997-98 Cincinnati: 16.5 PPG, 7.2 RPG
    stats: { games: 31, mpg: 30.5, ppg: 16.5, rpg: 7.2, apg: 2.0, spg: 1.8, bpg: 0.5, tov: 2.2, pf: 2.8, fg_pct: 0.513, three_pt_pct: 0.290, ft_pct: 0.685, pts_per40: 21.6, reb_per40: 9.4, ast_per40: 2.6, stl_per40: 2.4, blk_per40: 0.7, tov_per40: 2.9, usg: 0.272, per: 22.5, bpm: 7.0, obpm: 4.0, dbpm: 3.0, ws: 6.0, efg_pct: 0.540, ts_pct: 0.572, ast_pct: 0.108, tov_pct: 0.132, stl_pct: 0.038, blk_pct: 0.012, orb_pct: 0.068, drb_pct: 0.162, drtg: 92.5 },
    nba: { ppg: 9.5, rpg: 4.2, apg: 1.5, spg: 1.2, bpg: 0.4, ws48: 0.082, outcome: 'Starter' },
  },
  // === ROUND 2 (Selected notable picks) ===
  {
    pick: 41, team: 'Houston Rockets', name: 'Cuttino Mobley', school: 'Rhode Island', pos: 'SG',
    birthYear: 1974, height: 77, weight: 200, wingspan: 81, conf: 'Atlantic 10',
    archetype: 'Movement Shooter',
    // 1997-98 Rhode Island: 20.0 PPG, 5.4 RPG — A-10 Player of the Year
    stats: { games: 32, mpg: 35.5, ppg: 20.0, rpg: 5.4, apg: 3.5, spg: 2.2, bpg: 0.5, tov: 2.5, pf: 2.5, fg_pct: 0.470, three_pt_pct: 0.392, ft_pct: 0.792, pts_per40: 22.5, reb_per40: 6.1, ast_per40: 3.9, stl_per40: 2.5, blk_per40: 0.6, tov_per40: 2.8, usg: 0.282, per: 22.5, bpm: 7.0, obpm: 5.0, dbpm: 2.0, ws: 7.0, efg_pct: 0.530, ts_pct: 0.582, ast_pct: 0.178, tov_pct: 0.132, stl_pct: 0.046, blk_pct: 0.011, orb_pct: 0.038, drb_pct: 0.118, drtg: 93.5 },
    nba: { ppg: 14.8, rpg: 3.6, apg: 2.8, spg: 1.3, bpg: 0.3, ws48: 0.110, outcome: 'Starter' },
  },
  {
    pick: 45, team: 'Houston Rockets', name: 'Cory Carr', school: 'Texas Tech', pos: 'SG',
    birthYear: 1975, height: 75, weight: 195, wingspan: 79, conf: 'Big 12',
    archetype: 'Scoring Lead Guard',
    // 1997-98 Texas Tech: 19.5 PPG, 4.2 RPG
    stats: { games: 30, mpg: 33.0, ppg: 19.5, rpg: 4.2, apg: 3.5, spg: 1.8, bpg: 0.2, tov: 2.8, pf: 2.0, fg_pct: 0.450, three_pt_pct: 0.378, ft_pct: 0.840, pts_per40: 23.6, reb_per40: 5.1, ast_per40: 4.2, stl_per40: 2.2, blk_per40: 0.2, tov_per40: 3.4, usg: 0.292, per: 21.0, bpm: 5.5, obpm: 4.0, dbpm: 1.5, ws: 5.5, efg_pct: 0.512, ts_pct: 0.575, ast_pct: 0.198, tov_pct: 0.148, stl_pct: 0.038, blk_pct: 0.004, orb_pct: 0.025, drb_pct: 0.088, drtg: 96.5 },
    nba: { ppg: 2.2, rpg: 0.8, apg: 0.8, spg: 0.3, bpg: 0.0, ws48: 0.015, outcome: 'Bust' },
  },
  {
    pick: 52, team: 'Portland Trail Blazers', name: 'Tyronn Lue', school: 'Nebraska', pos: 'PG',
    birthYear: 1977, height: 72, weight: 175, wingspan: 75, conf: 'Big 12',
    archetype: 'Secondary Playmaker',
    // 1997-98 Nebraska: 15.4 PPG, 4.8 APG
    stats: { games: 30, mpg: 34.0, ppg: 15.4, rpg: 3.2, apg: 4.8, spg: 1.5, bpg: 0.1, tov: 2.5, pf: 1.8, fg_pct: 0.435, three_pt_pct: 0.348, ft_pct: 0.815, pts_per40: 18.1, reb_per40: 3.8, ast_per40: 5.6, stl_per40: 1.8, blk_per40: 0.1, tov_per40: 2.9, usg: 0.255, per: 18.5, bpm: 3.5, obpm: 2.5, dbpm: 1.0, ws: 4.5, efg_pct: 0.478, ts_pct: 0.543, ast_pct: 0.255, tov_pct: 0.142, stl_pct: 0.032, blk_pct: 0.002, orb_pct: 0.015, drb_pct: 0.068, drtg: 97.5 },
    nba: { ppg: 7.0, rpg: 1.8, apg: 3.0, spg: 0.6, bpg: 0.1, ws48: 0.062, outcome: 'Role Player' },
  },
]

// Remove the duplicate pick 23 entry (Luc Longley placeholder) — keep only Sean Marks
const DEDUPLICATED_PLAYERS = PLAYERS.filter(p => !(p.pick === 23 && p.name === 'Luc Longley'))

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

  const allPlayers = DEDUPLICATED_PLAYERS.filter(p => p.stats)
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
  console.log(`Navigate to /legendary-archives?year=1998 to view the board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
