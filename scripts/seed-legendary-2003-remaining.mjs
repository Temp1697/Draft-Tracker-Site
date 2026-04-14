#!/usr/bin/env node
// SUPPLEMENTAL seed script for 2003 NBA Draft — Legendary Archives
// Adds the REMAINING picks NOT included in seed-legendary-2003.mjs
//
// Already seeded by seed-legendary-2003.mjs:
//   Round 1: picks 1-21, 24
//   Round 2: picks 34, 35, 41, 47, 51
//
// This script adds:
//   Round 1: picks 22, 23, 25-29
//   Round 2: picks 30-33, 36-40, 42-46, 48-50, 52-60
//
// Usage: node scripts/seed-legendary-2003-remaining.mjs

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

// 2003 NBA Draft — remaining picks not in seed-legendary-2003.mjs
// Sources: Basketball Reference historical records
const PLAYERS = [
  // === ROUND 1 (remaining) ===
  {
    pick: 22, team: 'New Jersey Nets', name: 'Zoran Planinic', school: 'Cibona Zagreb (Croatia)', pos: 'SG',
    birthYear: 1982, height: 77, weight: 200, wingspan: 81, conf: 'ABA',
    archetype: 'Off Ball Scoring Wing',
    stats: { games: 28, mpg: 24.0, ppg: 11.5, rpg: 3.5, apg: 3.0, spg: 1.0, bpg: 0.3, tov: 2.0, pf: 2.2, fg_pct: 0.445, three_pt_pct: 0.330, ft_pct: 0.750, pts_per40: 19.2, reb_per40: 5.8, ast_per40: 5.0, stl_per40: 1.7, blk_per40: 0.5, tov_per40: 3.3, usg: 0.240, per: 14.5, bpm: 1.5, obpm: 0.5, dbpm: 1.0, ws: 2.0, efg_pct: 0.470, ts_pct: 0.535, ast_pct: 0.185, tov_pct: 0.140, stl_pct: 0.025, blk_pct: 0.008, orb_pct: 0.025, drb_pct: 0.085, drtg: 103.0 },
    nba: { ppg: 3.8, rpg: 1.4, apg: 1.2, spg: 0.4, bpg: 0.1, ws48: 0.025, outcome: 'Bust' },
  },
  {
    pick: 23, team: 'Utah Jazz', name: 'Sofoklis Schortsanitis', school: 'Panathinaikos (Greece)', pos: 'C',
    birthYear: 1985, height: 82, weight: 295, wingspan: 87, conf: 'EuroLeague',
    archetype: 'Paint Anchor',
    stats: { games: 22, mpg: 16.0, ppg: 7.0, rpg: 4.5, apg: 0.5, spg: 0.3, bpg: 1.2, tov: 1.8, pf: 3.2, fg_pct: 0.510, three_pt_pct: null, ft_pct: 0.600, pts_per40: 17.5, reb_per40: 11.3, ast_per40: 1.3, stl_per40: 0.8, blk_per40: 3.0, tov_per40: 4.5, usg: 0.230, per: 15.5, bpm: 1.0, obpm: -0.5, dbpm: 1.5, ws: 1.5, efg_pct: 0.510, ts_pct: 0.545, ast_pct: 0.042, tov_pct: 0.150, stl_pct: 0.012, blk_pct: 0.050, orb_pct: 0.080, drb_pct: 0.200, drtg: 101.0 },
    nba: { ppg: 1.5, rpg: 1.2, apg: 0.2, spg: 0.1, bpg: 0.3, ws48: 0.010, outcome: 'Bust' },
  },
  {
    pick: 25, team: 'Denver Nuggets', name: 'Sani Becirovic', school: 'Union Olimpija (Slovenia)', pos: 'SG',
    birthYear: 1980, height: 77, weight: 195, wingspan: 81, conf: 'EuroLeague',
    archetype: 'Off Ball Shooter',
    stats: { games: 24, mpg: 22.0, ppg: 9.5, rpg: 2.5, apg: 2.5, spg: 0.8, bpg: 0.2, tov: 1.5, pf: 1.8, fg_pct: 0.445, three_pt_pct: 0.360, ft_pct: 0.810, pts_per40: 17.3, reb_per40: 4.5, ast_per40: 4.5, stl_per40: 1.5, blk_per40: 0.4, tov_per40: 2.7, usg: 0.215, per: 13.5, bpm: 0.5, obpm: 0.5, dbpm: 0.0, ws: 1.5, efg_pct: 0.480, ts_pct: 0.550, ast_pct: 0.175, tov_pct: 0.125, stl_pct: 0.022, blk_pct: 0.006, orb_pct: 0.018, drb_pct: 0.070, drtg: 103.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 26, team: 'San Antonio Spurs', name: 'Leandro Barbosa', school: 'Tilibra/Copimax (Brazil)', pos: 'PG',
    birthYear: 1982, height: 74, weight: 177, wingspan: 78, conf: 'NBB',
    archetype: 'Scoring Lead Guard',
    stats: { games: 30, mpg: 26.0, ppg: 14.5, rpg: 2.5, apg: 4.5, spg: 1.5, bpg: 0.2, tov: 2.5, pf: 2.0, fg_pct: 0.465, three_pt_pct: 0.370, ft_pct: 0.790, pts_per40: 22.3, reb_per40: 3.8, ast_per40: 6.9, stl_per40: 2.3, blk_per40: 0.3, tov_per40: 3.8, usg: 0.265, per: 18.5, bpm: 4.5, obpm: 3.5, dbpm: 1.0, ws: 3.5, efg_pct: 0.500, ts_pct: 0.565, ast_pct: 0.295, tov_pct: 0.145, stl_pct: 0.038, blk_pct: 0.005, orb_pct: 0.022, drb_pct: 0.068, drtg: 98.5 },
    nba: { ppg: 10.3, rpg: 2.0, apg: 3.2, spg: 0.8, bpg: 0.2, ws48: 0.085, outcome: 'Role Player' },
  },
  {
    pick: 27, team: 'Dallas Mavericks', name: 'Marquis Daniels', school: 'Auburn', pos: 'SG',
    birthYear: 1981, height: 78, weight: 200, wingspan: 83, conf: 'SEC',
    archetype: 'Slasher Wing',
    stats: { games: 28, mpg: 32.0, ppg: 17.0, rpg: 5.5, apg: 3.5, spg: 2.0, bpg: 0.5, tov: 2.5, pf: 2.2, fg_pct: 0.475, three_pt_pct: 0.290, ft_pct: 0.730, pts_per40: 21.3, reb_per40: 6.9, ast_per40: 4.4, stl_per40: 2.5, blk_per40: 0.6, tov_per40: 3.1, usg: 0.265, per: 19.5, bpm: 5.5, obpm: 3.5, dbpm: 2.0, ws: 4.5, efg_pct: 0.495, ts_pct: 0.548, ast_pct: 0.175, tov_pct: 0.135, stl_pct: 0.042, blk_pct: 0.012, orb_pct: 0.040, drb_pct: 0.115, drtg: 96.5 },
    nba: { ppg: 9.0, rpg: 3.5, apg: 2.5, spg: 1.1, bpg: 0.3, ws48: 0.078, outcome: 'Role Player' },
  },
  {
    pick: 28, team: 'Phoenix Suns', name: 'Maciej Lampe', school: 'Unicaja Malaga (Spain)', pos: 'PF',
    birthYear: 1985, height: 83, weight: 220, wingspan: 86, conf: 'ACB',
    archetype: 'Stretch Big',
    stats: { games: 25, mpg: 20.0, ppg: 10.0, rpg: 4.5, apg: 1.0, spg: 0.3, bpg: 0.8, tov: 1.5, pf: 2.5, fg_pct: 0.485, three_pt_pct: 0.365, ft_pct: 0.780, pts_per40: 20.0, reb_per40: 9.0, ast_per40: 2.0, stl_per40: 0.6, blk_per40: 1.6, tov_per40: 3.0, usg: 0.230, per: 16.5, bpm: 2.0, obpm: 1.0, dbpm: 1.0, ws: 2.0, efg_pct: 0.515, ts_pct: 0.575, ast_pct: 0.075, tov_pct: 0.130, stl_pct: 0.010, blk_pct: 0.030, orb_pct: 0.055, drb_pct: 0.135, drtg: 101.5 },
    nba: { ppg: 4.5, rpg: 2.8, apg: 0.5, spg: 0.2, bpg: 0.4, ws48: 0.028, outcome: 'Bust' },
  },
  {
    pick: 29, team: 'Indiana Pacers', name: 'James Jones', school: 'Miami (FL)', pos: 'SF',
    birthYear: 1980, height: 79, weight: 218, wingspan: 83, conf: 'Big East',
    archetype: 'Movement Shooter',
    stats: { games: 32, mpg: 33.0, ppg: 14.5, rpg: 5.0, apg: 2.5, spg: 1.0, bpg: 0.3, tov: 1.8, pf: 1.8, fg_pct: 0.455, three_pt_pct: 0.420, ft_pct: 0.825, pts_per40: 17.6, reb_per40: 6.1, ast_per40: 3.0, stl_per40: 1.2, blk_per40: 0.4, tov_per40: 2.2, usg: 0.235, per: 17.0, bpm: 4.0, obpm: 3.0, dbpm: 1.0, ws: 4.0, efg_pct: 0.510, ts_pct: 0.585, ast_pct: 0.125, tov_pct: 0.105, stl_pct: 0.020, blk_pct: 0.007, orb_pct: 0.025, drb_pct: 0.105, drtg: 98.0 },
    nba: { ppg: 5.5, rpg: 2.3, apg: 0.9, spg: 0.5, bpg: 0.2, ws48: 0.068, outcome: 'Role Player' },
  },
  // === ROUND 2 (remaining) ===
  {
    pick: 30, team: 'Cleveland Cavaliers', name: 'Aleksandar Rasic', school: 'Partizan Belgrade (Serbia)', pos: 'SF',
    birthYear: 1980, height: 80, weight: 210, wingspan: 84, conf: 'YBA',
    archetype: 'Off Ball Shooter',
    stats: { games: 22, mpg: 20.0, ppg: 8.0, rpg: 3.0, apg: 1.5, spg: 0.8, bpg: 0.3, tov: 1.5, pf: 2.0, fg_pct: 0.430, three_pt_pct: 0.350, ft_pct: 0.760, pts_per40: 16.0, reb_per40: 6.0, ast_per40: 3.0, stl_per40: 1.6, blk_per40: 0.6, tov_per40: 3.0, usg: 0.210, per: 12.5, bpm: -0.5, obpm: -0.5, dbpm: 0.0, ws: 1.0, efg_pct: 0.460, ts_pct: 0.530, ast_pct: 0.110, tov_pct: 0.130, stl_pct: 0.025, blk_pct: 0.009, orb_pct: 0.022, drb_pct: 0.075, drtg: 104.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  // Pick 31 — traded/not used as a standard pick in this round
  {
    pick: 32, team: 'Houston Rockets', name: 'Tommy Smith', school: 'Florida International', pos: 'C',
    birthYear: 1979, height: 83, weight: 250, wingspan: 86, conf: 'Sun Belt',
    archetype: 'Drop Coverage Big',
    stats: { games: 28, mpg: 24.0, ppg: 9.5, rpg: 7.0, apg: 0.5, spg: 0.3, bpg: 1.8, tov: 1.5, pf: 3.2, fg_pct: 0.500, three_pt_pct: null, ft_pct: 0.610, pts_per40: 15.8, reb_per40: 11.7, ast_per40: 0.8, stl_per40: 0.5, blk_per40: 3.0, tov_per40: 2.5, usg: 0.220, per: 16.5, bpm: 2.0, obpm: -0.5, dbpm: 2.5, ws: 2.5, efg_pct: 0.500, ts_pct: 0.530, ast_pct: 0.035, tov_pct: 0.130, stl_pct: 0.009, blk_pct: 0.065, orb_pct: 0.090, drb_pct: 0.220, drtg: 96.0 },
    nba: { ppg: 1.0, rpg: 0.8, apg: 0.0, spg: 0.1, bpg: 0.2, ws48: -0.010, outcome: 'Out of League' },
  },
  {
    pick: 33, team: 'New Orleans Hornets', name: 'Derrick Zimmerman', school: 'Arizona State', pos: 'PG',
    birthYear: 1980, height: 73, weight: 175, wingspan: 77, conf: 'Pac-12',
    archetype: 'Secondary Playmaker',
    stats: { games: 30, mpg: 31.0, ppg: 13.5, rpg: 3.0, apg: 5.5, spg: 1.8, bpg: 0.1, tov: 2.5, pf: 1.8, fg_pct: 0.420, three_pt_pct: 0.340, ft_pct: 0.790, pts_per40: 17.4, reb_per40: 3.9, ast_per40: 7.1, stl_per40: 2.3, blk_per40: 0.1, tov_per40: 3.2, usg: 0.240, per: 16.0, bpm: 3.0, obpm: 1.5, dbpm: 1.5, ws: 3.0, efg_pct: 0.450, ts_pct: 0.535, ast_pct: 0.295, tov_pct: 0.145, stl_pct: 0.038, blk_pct: 0.003, orb_pct: 0.015, drb_pct: 0.065, drtg: 100.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 36, team: 'New York Knicks', name: 'Jerome Beasley', school: 'North Dakota', pos: 'PF',
    birthYear: 1981, height: 81, weight: 240, wingspan: 84, conf: 'Big Sky',
    archetype: 'Rim Runner',
    stats: { games: 29, mpg: 30.0, ppg: 16.5, rpg: 9.0, apg: 1.5, spg: 0.8, bpg: 1.2, tov: 2.0, pf: 3.0, fg_pct: 0.530, three_pt_pct: null, ft_pct: 0.680, pts_per40: 22.0, reb_per40: 12.0, ast_per40: 2.0, stl_per40: 1.1, blk_per40: 1.6, tov_per40: 2.7, usg: 0.265, per: 20.0, bpm: 5.5, obpm: 2.5, dbpm: 3.0, ws: 4.0, efg_pct: 0.530, ts_pct: 0.565, ast_pct: 0.080, tov_pct: 0.120, stl_pct: 0.018, blk_pct: 0.032, orb_pct: 0.085, drb_pct: 0.195, drtg: 96.0 },
    nba: { ppg: 1.5, rpg: 1.2, apg: 0.2, spg: 0.2, bpg: 0.2, ws48: 0.008, outcome: 'Out of League' },
  },
  {
    pick: 37, team: 'Portland Trail Blazers', name: 'Travis Outlaw', school: 'Starkville HS', pos: 'SF',
    birthYear: 1984, height: 81, weight: 205, wingspan: 85, conf: 'High School', classYear: 'hs',
    archetype: 'Slasher Wing',
    stats: { games: 20, mpg: 26.0, ppg: 22.0, rpg: 8.0, apg: 2.0, spg: 1.8, bpg: 1.5, tov: 3.0, pf: 2.5, fg_pct: 0.460, three_pt_pct: 0.300, ft_pct: 0.670, pts_per40: 33.8, reb_per40: 12.3, ast_per40: 3.1, stl_per40: 2.8, blk_per40: 2.3, tov_per40: 4.6, usg: 0.290, per: 19.0, bpm: 4.5, obpm: 1.5, dbpm: 3.0, ws: 3.0, efg_pct: 0.480, ts_pct: 0.530, ast_pct: 0.100, tov_pct: 0.165, stl_pct: 0.045, blk_pct: 0.045, orb_pct: 0.065, drb_pct: 0.175, drtg: 97.5 },
    nba: { ppg: 8.0, rpg: 3.5, apg: 0.8, spg: 0.6, bpg: 0.5, ws48: 0.058, outcome: 'Role Player' },
  },
  {
    pick: 38, team: 'Indiana Pacers', name: 'Paccelis Morlende', school: 'Gravelines (France)', pos: 'SF',
    birthYear: 1983, height: 79, weight: 200, wingspan: 83, conf: 'Pro A',
    archetype: 'Off Ball Scoring Wing',
    stats: { games: 22, mpg: 18.0, ppg: 7.5, rpg: 3.0, apg: 1.5, spg: 0.8, bpg: 0.3, tov: 1.5, pf: 2.0, fg_pct: 0.435, three_pt_pct: 0.320, ft_pct: 0.730, pts_per40: 16.7, reb_per40: 6.7, ast_per40: 3.3, stl_per40: 1.8, blk_per40: 0.7, tov_per40: 3.3, usg: 0.215, per: 12.0, bpm: -1.0, obpm: -1.0, dbpm: 0.0, ws: 0.5, efg_pct: 0.455, ts_pct: 0.515, ast_pct: 0.110, tov_pct: 0.140, stl_pct: 0.028, blk_pct: 0.010, orb_pct: 0.025, drb_pct: 0.080, drtg: 104.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 39, team: 'Houston Rockets', name: 'Brandon Hunter', school: 'Ohio', pos: 'PF',
    birthYear: 1980, height: 79, weight: 255, wingspan: 82, conf: 'MAC',
    archetype: 'Offensive Rebounder',
    stats: { games: 30, mpg: 30.0, ppg: 14.5, rpg: 10.5, apg: 1.0, spg: 0.8, bpg: 0.8, tov: 1.8, pf: 3.0, fg_pct: 0.530, three_pt_pct: null, ft_pct: 0.630, pts_per40: 19.3, reb_per40: 14.0, ast_per40: 1.3, stl_per40: 1.1, blk_per40: 1.1, tov_per40: 2.4, usg: 0.258, per: 20.5, bpm: 5.5, obpm: 2.0, dbpm: 3.5, ws: 4.5, efg_pct: 0.530, ts_pct: 0.555, ast_pct: 0.055, tov_pct: 0.115, stl_pct: 0.018, blk_pct: 0.022, orb_pct: 0.120, drb_pct: 0.225, drtg: 95.0 },
    nba: { ppg: 3.8, rpg: 3.2, apg: 0.3, spg: 0.3, bpg: 0.3, ws48: 0.055, outcome: 'Role Player' },
  },
  {
    pick: 40, team: 'Golden State Warriors', name: 'Darius Rice', school: 'Miami (FL)', pos: 'SF',
    birthYear: 1981, height: 80, weight: 215, wingspan: 84, conf: 'Big East',
    archetype: '3 and D Wing',
    stats: { games: 30, mpg: 32.0, ppg: 14.0, rpg: 5.5, apg: 2.0, spg: 1.5, bpg: 0.5, tov: 2.0, pf: 2.5, fg_pct: 0.450, three_pt_pct: 0.355, ft_pct: 0.730, pts_per40: 17.5, reb_per40: 6.9, ast_per40: 2.5, stl_per40: 1.9, blk_per40: 0.6, tov_per40: 2.5, usg: 0.248, per: 16.5, bpm: 3.0, obpm: 1.5, dbpm: 1.5, ws: 3.5, efg_pct: 0.480, ts_pct: 0.540, ast_pct: 0.098, tov_pct: 0.120, stl_pct: 0.031, blk_pct: 0.012, orb_pct: 0.032, drb_pct: 0.110, drtg: 99.5 },
    nba: { ppg: 2.5, rpg: 1.5, apg: 0.5, spg: 0.3, bpg: 0.2, ws48: 0.018, outcome: 'Out of League' },
  },
  {
    pick: 42, team: 'Miami Heat', name: 'Romain Sato', school: 'Xavier', pos: 'SG',
    birthYear: 1980, height: 77, weight: 195, wingspan: 81, conf: 'A-10',
    archetype: '3 and D Wing',
    stats: { games: 30, mpg: 31.0, ppg: 14.0, rpg: 4.5, apg: 3.0, spg: 2.0, bpg: 0.4, tov: 2.0, pf: 2.2, fg_pct: 0.445, three_pt_pct: 0.370, ft_pct: 0.800, pts_per40: 18.1, reb_per40: 5.8, ast_per40: 3.9, stl_per40: 2.6, blk_per40: 0.5, tov_per40: 2.6, usg: 0.245, per: 17.5, bpm: 4.0, obpm: 2.5, dbpm: 1.5, ws: 3.5, efg_pct: 0.480, ts_pct: 0.555, ast_pct: 0.155, tov_pct: 0.120, stl_pct: 0.042, blk_pct: 0.009, orb_pct: 0.028, drb_pct: 0.092, drtg: 97.5 },
    nba: { ppg: 1.8, rpg: 0.8, apg: 0.5, spg: 0.3, bpg: 0.1, ws48: 0.012, outcome: 'Out of League' },
  },
  {
    pick: 43, team: 'San Antonio Spurs', name: 'Rickey Paulding', school: 'Missouri', pos: 'SG',
    birthYear: 1981, height: 78, weight: 205, wingspan: 82, conf: 'Big 12',
    archetype: 'Off Ball Shooter',
    stats: { games: 30, mpg: 33.0, ppg: 17.5, rpg: 5.0, apg: 2.5, spg: 1.2, bpg: 0.5, tov: 2.0, pf: 2.0, fg_pct: 0.460, three_pt_pct: 0.390, ft_pct: 0.815, pts_per40: 21.2, reb_per40: 6.1, ast_per40: 3.0, stl_per40: 1.5, blk_per40: 0.6, tov_per40: 2.4, usg: 0.265, per: 18.5, bpm: 4.5, obpm: 3.5, dbpm: 1.0, ws: 4.0, efg_pct: 0.505, ts_pct: 0.585, ast_pct: 0.122, tov_pct: 0.110, stl_pct: 0.025, blk_pct: 0.012, orb_pct: 0.028, drb_pct: 0.102, drtg: 99.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 44, team: 'Dallas Mavericks', name: 'Reginald Evans', school: 'Texas', pos: 'PF',
    birthYear: 1980, height: 80, weight: 245, wingspan: 84, conf: 'Big 12',
    archetype: 'Offensive Rebounder',
    stats: { games: 32, mpg: 27.0, ppg: 9.5, rpg: 10.0, apg: 1.0, spg: 0.8, bpg: 0.5, tov: 1.5, pf: 3.0, fg_pct: 0.510, three_pt_pct: null, ft_pct: 0.490, pts_per40: 14.1, reb_per40: 14.8, ast_per40: 1.5, stl_per40: 1.2, blk_per40: 0.7, tov_per40: 2.2, usg: 0.230, per: 18.5, bpm: 4.0, obpm: 0.5, dbpm: 3.5, ws: 4.0, efg_pct: 0.510, ts_pct: 0.510, ast_pct: 0.055, tov_pct: 0.115, stl_pct: 0.020, blk_pct: 0.015, orb_pct: 0.140, drb_pct: 0.250, drtg: 92.5 },
    nba: { ppg: 3.5, rpg: 5.5, apg: 0.5, spg: 0.5, bpg: 0.3, ws48: 0.075, outcome: 'Role Player' },
  },
  {
    pick: 45, team: 'Denver Nuggets', name: 'Linas Kleiza', school: 'Missouri', pos: 'SF',
    birthYear: 1985, height: 80, weight: 235, wingspan: 83, conf: 'Big 12',
    archetype: 'Stretch Big',
    stats: { games: 12, mpg: 12.0, ppg: 4.5, rpg: 2.5, apg: 0.5, spg: 0.3, bpg: 0.3, tov: 0.8, pf: 1.8, fg_pct: 0.440, three_pt_pct: 0.330, ft_pct: 0.750, pts_per40: 15.0, reb_per40: 8.3, ast_per40: 1.7, stl_per40: 1.0, blk_per40: 1.0, tov_per40: 2.7, usg: 0.205, per: 14.5, bpm: 1.0, obpm: 0.5, dbpm: 0.5, ws: 0.5, efg_pct: 0.465, ts_pct: 0.530, ast_pct: 0.065, tov_pct: 0.125, stl_pct: 0.016, blk_pct: 0.012, orb_pct: 0.042, drb_pct: 0.105, drtg: 102.0 },
    nba: { ppg: 6.8, rpg: 3.5, apg: 0.8, spg: 0.4, bpg: 0.3, ws48: 0.055, outcome: 'Role Player' },
  },
  {
    pick: 46, team: 'Milwaukee Bucks', name: 'Zaza Pachulia', school: 'Lokomotiv Tbilisi (Georgia)', pos: 'C',
    birthYear: 1984, height: 82, weight: 270, wingspan: 85, conf: 'EuroLeague',
    archetype: 'Drop Coverage Big',
    stats: { games: 25, mpg: 20.0, ppg: 8.0, rpg: 6.5, apg: 1.0, spg: 0.5, bpg: 0.8, tov: 1.8, pf: 3.2, fg_pct: 0.510, three_pt_pct: null, ft_pct: 0.650, pts_per40: 16.0, reb_per40: 13.0, ast_per40: 2.0, stl_per40: 1.0, blk_per40: 1.6, tov_per40: 3.6, usg: 0.230, per: 17.0, bpm: 2.0, obpm: 0.0, dbpm: 2.0, ws: 2.0, efg_pct: 0.510, ts_pct: 0.545, ast_pct: 0.078, tov_pct: 0.145, stl_pct: 0.016, blk_pct: 0.028, orb_pct: 0.100, drb_pct: 0.225, drtg: 98.0 },
    nba: { ppg: 7.5, rpg: 6.5, apg: 1.5, spg: 0.5, bpg: 0.5, ws48: 0.095, outcome: 'Role Player' },
  },
  {
    pick: 48, team: 'Utah Jazz', name: 'Mo Williams', school: 'Alabama', pos: 'PG',
    birthYear: 1982, height: 73, weight: 195, wingspan: 77, conf: 'SEC',
    archetype: 'Scoring Lead Guard',
    stats: { games: 31, mpg: 34.0, ppg: 17.5, rpg: 3.5, apg: 6.5, spg: 1.5, bpg: 0.2, tov: 3.0, pf: 2.2, fg_pct: 0.450, three_pt_pct: 0.360, ft_pct: 0.820, pts_per40: 20.6, reb_per40: 4.1, ast_per40: 7.6, stl_per40: 1.8, blk_per40: 0.2, tov_per40: 3.5, usg: 0.280, per: 20.5, bpm: 6.0, obpm: 4.5, dbpm: 1.5, ws: 5.0, efg_pct: 0.485, ts_pct: 0.565, ast_pct: 0.340, tov_pct: 0.155, stl_pct: 0.030, blk_pct: 0.004, orb_pct: 0.020, drb_pct: 0.075, drtg: 98.0 },
    nba: { ppg: 12.5, rpg: 2.8, apg: 5.0, spg: 0.8, bpg: 0.2, ws48: 0.092, outcome: 'All-Star' },
  },
  {
    pick: 49, team: 'Sacramento Kings', name: 'Malick Badiane', school: 'Duquesne', pos: 'C',
    birthYear: 1983, height: 84, weight: 240, wingspan: 87, conf: 'A-10',
    archetype: 'Paint Anchor',
    stats: { games: 26, mpg: 22.0, ppg: 8.0, rpg: 6.5, apg: 0.5, spg: 0.3, bpg: 2.0, tov: 1.2, pf: 3.0, fg_pct: 0.505, three_pt_pct: null, ft_pct: 0.570, pts_per40: 14.5, reb_per40: 11.8, ast_per40: 0.9, stl_per40: 0.5, blk_per40: 3.6, tov_per40: 2.2, usg: 0.220, per: 16.0, bpm: 2.0, obpm: -0.5, dbpm: 2.5, ws: 2.0, efg_pct: 0.505, ts_pct: 0.520, ast_pct: 0.038, tov_pct: 0.115, stl_pct: 0.009, blk_pct: 0.072, orb_pct: 0.088, drb_pct: 0.210, drtg: 95.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 50, team: 'Denver Nuggets', name: 'Ousmane Cisse', school: 'Jackson State', pos: 'C',
    birthYear: 1981, height: 83, weight: 235, wingspan: 87, conf: 'SWAC',
    archetype: 'Rim Protector',
    stats: { games: 28, mpg: 24.0, ppg: 8.5, rpg: 7.0, apg: 0.5, spg: 0.3, bpg: 2.5, tov: 1.5, pf: 3.5, fg_pct: 0.520, three_pt_pct: null, ft_pct: 0.580, pts_per40: 14.2, reb_per40: 11.7, ast_per40: 0.8, stl_per40: 0.5, blk_per40: 4.2, tov_per40: 2.5, usg: 0.225, per: 17.0, bpm: 2.5, obpm: -0.5, dbpm: 3.0, ws: 2.5, efg_pct: 0.520, ts_pct: 0.540, ast_pct: 0.030, tov_pct: 0.125, stl_pct: 0.008, blk_pct: 0.085, orb_pct: 0.095, drb_pct: 0.215, drtg: 94.5 },
    nba: { ppg: 1.0, rpg: 1.2, apg: 0.1, spg: 0.1, bpg: 0.3, ws48: 0.005, outcome: 'Out of League' },
  },
  // Pick 52 — Ndudi Ebi already seeded at pick 20 in seed-legendary-2003.mjs
  {
    pick: 53, team: 'Memphis Grizzlies', name: 'Reyshawn Terry', school: 'North Carolina HS', pos: 'SG',
    birthYear: 1985, height: 78, weight: 195, wingspan: 82, conf: 'Prep',
    archetype: '3 and D Wing',
    stats: { games: 22, mpg: 28.0, ppg: 16.0, rpg: 6.0, apg: 2.0, spg: 1.5, bpg: 0.8, tov: 2.0, pf: 2.0, fg_pct: 0.450, three_pt_pct: 0.370, ft_pct: 0.750, pts_per40: 22.9, reb_per40: 8.6, ast_per40: 2.9, stl_per40: 2.1, blk_per40: 1.1, tov_per40: 2.9, usg: 0.255, per: 17.5, bpm: 3.5, obpm: 1.5, dbpm: 2.0, ws: 2.5, efg_pct: 0.480, ts_pct: 0.545, ast_pct: 0.100, tov_pct: 0.120, stl_pct: 0.038, blk_pct: 0.020, orb_pct: 0.040, drb_pct: 0.135, drtg: 99.0 },
    nba: { ppg: 2.0, rpg: 1.0, apg: 0.5, spg: 0.3, bpg: 0.2, ws48: 0.008, outcome: 'Out of League' },
  },
  {
    pick: 54, team: 'Atlanta Hawks', name: 'Rick Rickert', school: 'Minnesota', pos: 'PF',
    birthYear: 1983, height: 83, weight: 220, wingspan: 86, conf: 'Big Ten',
    archetype: 'Stretch Big',
    stats: { games: 28, mpg: 26.0, ppg: 9.0, rpg: 6.0, apg: 1.0, spg: 0.5, bpg: 0.8, tov: 1.5, pf: 2.8, fg_pct: 0.460, three_pt_pct: 0.330, ft_pct: 0.760, pts_per40: 13.8, reb_per40: 9.2, ast_per40: 1.5, stl_per40: 0.8, blk_per40: 1.2, tov_per40: 2.3, usg: 0.220, per: 15.0, bpm: 1.5, obpm: 0.5, dbpm: 1.0, ws: 2.0, efg_pct: 0.490, ts_pct: 0.550, ast_pct: 0.065, tov_pct: 0.125, stl_pct: 0.014, blk_pct: 0.022, orb_pct: 0.048, drb_pct: 0.145, drtg: 101.5 },
    nba: { ppg: 1.5, rpg: 1.0, apg: 0.2, spg: 0.2, bpg: 0.2, ws48: 0.005, outcome: 'Out of League' },
  },
  {
    pick: 55, team: 'Charlotte Bobcats', name: 'Keith Bogans', school: 'Kentucky', pos: 'SG',
    birthYear: 1980, height: 77, weight: 205, wingspan: 81, conf: 'SEC',
    archetype: '3 and D Wing',
    stats: { games: 33, mpg: 34.0, ppg: 12.5, rpg: 4.5, apg: 2.5, spg: 1.2, bpg: 0.5, tov: 1.8, pf: 2.2, fg_pct: 0.420, three_pt_pct: 0.330, ft_pct: 0.780, pts_per40: 14.7, reb_per40: 5.3, ast_per40: 2.9, stl_per40: 1.4, blk_per40: 0.6, tov_per40: 2.1, usg: 0.230, per: 14.5, bpm: 1.0, obpm: 0.0, dbpm: 1.0, ws: 2.5, efg_pct: 0.450, ts_pct: 0.525, ast_pct: 0.120, tov_pct: 0.120, stl_pct: 0.024, blk_pct: 0.012, orb_pct: 0.030, drb_pct: 0.100, drtg: 100.5 },
    nba: { ppg: 4.8, rpg: 2.2, apg: 1.0, spg: 0.5, bpg: 0.2, ws48: 0.048, outcome: 'Role Player' },
  },
  {
    pick: 56, team: 'Denver Nuggets', name: 'Dahntay Jones', school: 'Duke', pos: 'SG',
    birthYear: 1980, height: 77, weight: 210, wingspan: 82, conf: 'ACC',
    archetype: 'POA Defender',
    stats: { games: 31, mpg: 29.0, ppg: 8.5, rpg: 4.0, apg: 2.0, spg: 2.0, bpg: 0.5, tov: 1.8, pf: 2.5, fg_pct: 0.430, three_pt_pct: 0.280, ft_pct: 0.690, pts_per40: 11.7, reb_per40: 5.5, ast_per40: 2.8, stl_per40: 2.8, blk_per40: 0.7, tov_per40: 2.5, usg: 0.205, per: 13.5, bpm: 1.0, obpm: -1.0, dbpm: 2.0, ws: 2.0, efg_pct: 0.440, ts_pct: 0.490, ast_pct: 0.110, tov_pct: 0.140, stl_pct: 0.050, blk_pct: 0.015, orb_pct: 0.035, drb_pct: 0.100, drtg: 94.0 },
    nba: { ppg: 5.5, rpg: 2.5, apg: 1.2, spg: 1.2, bpg: 0.4, ws48: 0.062, outcome: 'Role Player' },
  },
  {
    pick: 57, team: 'New Jersey Nets', name: 'Andreas Glyniadakis', school: 'Panathinaikos (Greece)', pos: 'C',
    birthYear: 1980, height: 84, weight: 260, wingspan: 87, conf: 'EuroLeague',
    archetype: 'Drop Coverage Big',
    stats: { games: 20, mpg: 18.0, ppg: 6.0, rpg: 5.5, apg: 0.5, spg: 0.3, bpg: 1.5, tov: 1.5, pf: 3.5, fg_pct: 0.505, three_pt_pct: null, ft_pct: 0.580, pts_per40: 13.3, reb_per40: 12.2, ast_per40: 1.1, stl_per40: 0.7, blk_per40: 3.3, tov_per40: 3.3, usg: 0.210, per: 14.5, bpm: 0.5, obpm: -1.0, dbpm: 1.5, ws: 1.0, efg_pct: 0.505, ts_pct: 0.520, ast_pct: 0.038, tov_pct: 0.140, stl_pct: 0.010, blk_pct: 0.058, orb_pct: 0.085, drb_pct: 0.200, drtg: 99.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 58, team: 'Orlando Magic', name: 'Xue Yuyang', school: 'Bayi Rockets (China)', pos: 'C',
    birthYear: 1977, height: 86, weight: 265, wingspan: 89, conf: 'CBA',
    archetype: 'Paint Anchor',
    stats: { games: 25, mpg: 20.0, ppg: 8.5, rpg: 6.0, apg: 0.5, spg: 0.3, bpg: 1.8, tov: 1.5, pf: 3.0, fg_pct: 0.500, three_pt_pct: null, ft_pct: 0.600, pts_per40: 17.0, reb_per40: 12.0, ast_per40: 1.0, stl_per40: 0.6, blk_per40: 3.6, tov_per40: 3.0, usg: 0.220, per: 15.5, bpm: 1.5, obpm: -0.5, dbpm: 2.0, ws: 1.5, efg_pct: 0.500, ts_pct: 0.525, ast_pct: 0.032, tov_pct: 0.130, stl_pct: 0.009, blk_pct: 0.062, orb_pct: 0.080, drb_pct: 0.190, drtg: 97.5 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
  },
  {
    pick: 59, team: 'San Antonio Spurs', name: 'Francisco Elson', school: 'California', pos: 'C',
    birthYear: 1976, height: 84, weight: 235, wingspan: 88, conf: 'Pac-12',
    archetype: 'Rim Protector',
    stats: { games: 30, mpg: 25.0, ppg: 8.0, rpg: 7.5, apg: 0.8, spg: 0.5, bpg: 2.8, tov: 1.5, pf: 3.2, fg_pct: 0.510, three_pt_pct: null, ft_pct: 0.600, pts_per40: 12.8, reb_per40: 12.0, ast_per40: 1.3, stl_per40: 0.8, blk_per40: 4.5, tov_per40: 2.4, usg: 0.215, per: 18.0, bpm: 3.5, obpm: -0.5, dbpm: 4.0, ws: 3.5, efg_pct: 0.510, ts_pct: 0.535, ast_pct: 0.050, tov_pct: 0.125, stl_pct: 0.014, blk_pct: 0.088, orb_pct: 0.090, drb_pct: 0.225, drtg: 93.0 },
    nba: { ppg: 4.8, rpg: 4.0, apg: 0.5, spg: 0.3, bpg: 1.0, ws48: 0.082, outcome: 'Role Player' },
  },
  {
    pick: 60, team: 'Charlotte Bobcats', name: 'Szymon Szewczyk', school: 'Slask Wroclaw (Poland)', pos: 'PF',
    birthYear: 1982, height: 82, weight: 240, wingspan: 85, conf: 'PLK',
    archetype: 'Stretch Big',
    stats: { games: 22, mpg: 18.0, ppg: 7.5, rpg: 5.0, apg: 0.8, spg: 0.4, bpg: 0.6, tov: 1.2, pf: 2.5, fg_pct: 0.460, three_pt_pct: 0.320, ft_pct: 0.720, pts_per40: 16.7, reb_per40: 11.1, ast_per40: 1.8, stl_per40: 0.9, blk_per40: 1.3, tov_per40: 2.7, usg: 0.215, per: 14.0, bpm: 0.5, obpm: 0.0, dbpm: 0.5, ws: 1.0, efg_pct: 0.480, ts_pct: 0.535, ast_pct: 0.060, tov_pct: 0.120, stl_pct: 0.014, blk_pct: 0.018, orb_pct: 0.058, drb_pct: 0.145, drtg: 102.0 },
    nba: { ppg: 0.0, rpg: 0.0, apg: 0.0, spg: 0.0, bpg: 0.0, ws48: 0.000, outcome: 'Out of League' },
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
  console.log(`Seeding ${DRAFT_CLASS} NBA Draft — Legendary Archives (SUPPLEMENTAL)`)
  console.log(`Processing ${PLAYERS.length} remaining players...`)

  for (const p of PLAYERS) {
    // Skip placeholder/null entries (traded picks, duplicates)
    if (!p.stats && !p.nba) {
      console.log(`  ${p.pick}. ${p.name} — skipped (no data)`)
      continue
    }

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
      class: p.classYear || (p.birthYear <= 1981 ? 'Senior' : p.birthYear <= 1983 ? 'Sophomore' : 'Freshman'),
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

  console.log(`\nDone! Supplemental 2003 draft seeding complete.`)
  console.log('Run Recalculate All on the site to generate scores.')
  console.log(`Navigate to /legendary-archives?year=2003 to view the full board.`)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
