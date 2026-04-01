#!/usr/bin/env node
/**
 * setup-positional-defaults.mjs
 *
 * Creates the `positional_defaults` table in Supabase and seeds it with
 * 50th-percentile values by position bucket (guard / wing / big).
 *
 * Strategy: same as setup-schema.mjs — try /pg/sql with service_role key,
 * otherwise print SQL for manual execution.
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const val = trimmed.slice(eqIndex + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
} catch { /* .env may not exist */ }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

const SQL = `
-- ============================================================
-- positional_defaults: 50th percentile values by bucket
-- ============================================================

CREATE TABLE IF NOT EXISTS positional_defaults (
  id SERIAL PRIMARY KEY,
  bucket TEXT NOT NULL CHECK (bucket IN ('guard', 'wing', 'big')),
  metric TEXT NOT NULL,
  default_value NUMERIC NOT NULL,
  UNIQUE (bucket, metric)
);

-- RLS: allow anonymous read access
ALTER TABLE positional_defaults ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'positional_defaults' AND policyname = 'Allow anonymous read access on positional_defaults'
  ) THEN
    CREATE POLICY "Allow anonymous read access on positional_defaults"
      ON positional_defaults FOR SELECT USING (true);
  END IF;
END $$;

-- Clear existing data for idempotent re-runs
TRUNCATE positional_defaults RESTART IDENTITY;

INSERT INTO positional_defaults (bucket, metric, default_value) VALUES

-- ============================================================
-- MEASURABLES (column names match measurables table)
-- ============================================================

-- wingspan (inches)
('guard', 'wingspan', 77.5),
('wing',  'wingspan', 81.5),
('big',   'wingspan', 84.5),

-- ws_minus_h (wingspan minus height in inches)
('guard', 'ws_minus_h', 2.5),
('wing',  'ws_minus_h', 3.0),
('big',   'ws_minus_h', 3.5),

-- standing_reach (inches)
('guard', 'standing_reach', 99.0),
('wing',  'standing_reach', 104.5),
('big',   'standing_reach', 109.0),

-- vertical (standing, inches)
('guard', 'vertical', 29.0),
('wing',  'vertical', 28.0),
('big',   'vertical', 27.5),

-- max_vertical (running, inches)
('guard', 'max_vertical', 35.0),
('wing',  'max_vertical', 34.0),
('big',   'max_vertical', 32.5),

-- lane_agility (seconds, lower=better)
('guard', 'lane_agility', 11.3),
('wing',  'lane_agility', 11.5),
('big',   'lane_agility', 11.9),

-- shuttle (seconds, lower=better)
('guard', 'shuttle', 3.00),
('wing',  'shuttle', 3.05),
('big',   'shuttle', 3.15),

-- three_quarter_sprint (seconds, lower=better)
('guard', 'three_quarter_sprint', 3.28),
('wing',  'three_quarter_sprint', 3.32),
('big',   'three_quarter_sprint', 3.38),

-- bench (reps at 185 lbs)
('guard', 'bench', 8),
('wing',  'bench', 9),
('big',   'bench', 11),

-- weight (lbs)
('guard', 'weight', 190),
('wing',  'weight', 215),
('big',   'weight', 245),

-- ============================================================
-- BOX SCORE STATS (column names match stats table)
-- ============================================================

('guard', 'ppg',   14.5),
('wing',  'ppg',   13.0),
('big',   'ppg',   12.0),

('guard', 'rpg',    3.5),
('wing',  'rpg',    5.5),
('big',   'rpg',    7.5),

('guard', 'apg',    3.5),
('wing',  'apg',    2.0),
('big',   'apg',    1.5),

('guard', 'spg',    1.2),
('wing',  'spg',    1.1),
('big',   'spg',    0.8),

('guard', 'bpg',    0.3),
('wing',  'bpg',    0.6),
('big',   'bpg',    1.2),

('guard', 'tov',    2.5),
('wing',  'tov',    2.0),
('big',   'tov',    2.0),

('guard', 'mpg',   30.0),
('wing',  'mpg',   28.0),
('big',   'mpg',   26.0),

('guard', 'games',  30),
('wing',  'games',  30),
('big',   'games',  30),

-- ============================================================
-- SHOOTING (column names match stats table)
-- ============================================================

('guard', 'fg_pct',         0.445),
('wing',  'fg_pct',         0.460),
('big',   'fg_pct',         0.540),

('guard', 'three_pt_pct',   0.335),
('wing',  'three_pt_pct',   0.330),
('big',   'three_pt_pct',   0.310),

('guard', 'ft_pct',         0.760),
('wing',  'ft_pct',         0.740),
('big',   'ft_pct',         0.680),

('guard', 'efg_pct',        0.510),
('wing',  'efg_pct',        0.515),
('big',   'efg_pct',        0.545),

('guard', 'ts_pct',         0.545),
('wing',  'ts_pct',         0.550),
('big',   'ts_pct',         0.570),

('guard', 'three_pta_rate', 0.340),
('wing',  'three_pta_rate', 0.300),
('big',   'three_pta_rate', 0.160),

('guard', 'ft_rate',        0.280),
('wing',  'ft_rate',        0.310),
('big',   'ft_rate',        0.420),

-- ============================================================
-- PER-40 STATS (column names match stats table)
-- ============================================================

('guard', 'pts_per40',      22.0),
('wing',  'pts_per40',      20.5),
('big',   'pts_per40',      19.0),

('guard', 'reb_per40',       5.0),
('wing',  'reb_per40',       7.5),
('big',   'reb_per40',      11.5),

('guard', 'ast_per40',       5.5),
('wing',  'ast_per40',       3.0),
('big',   'ast_per40',       2.0),

('guard', 'stl_per40',       1.8),
('wing',  'stl_per40',       1.6),
('big',   'stl_per40',       1.1),

('guard', 'blk_per40',       0.5),
('wing',  'blk_per40',       0.9),
('big',   'blk_per40',       2.0),

('guard', 'tov_per40',       3.5),
('wing',  'tov_per40',       3.0),
('big',   'tov_per40',       2.8),

('guard', 'three_pta_per40', 7.5),
('wing',  'three_pta_per40', 5.5),
('big',   'three_pta_per40', 2.5),

('guard', 'fta_per40',       4.5),
('wing',  'fta_per40',       5.0),
('big',   'fta_per40',       7.0),

('guard', 'dunks_per_game',  0.1),
('wing',  'dunks_per_game',  0.2),
('big',   'dunks_per_game',  0.6),

-- ============================================================
-- ADVANCED / ANALYTICS (column names match stats table)
-- ============================================================

('guard', 'ast_tov',   1.5),
('wing',  'ast_tov',   1.3),
('big',   'ast_tov',   1.1),

('guard', 'per',   18.0),
('wing',  'per',   17.5),
('big',   'per',   18.5),

('guard', 'ws',    3.5),
('wing',  'ws',    3.0),
('big',   'ws',    3.5),

('guard', 'bpm',   2.0),
('wing',  'bpm',   1.5),
('big',   'bpm',   2.0),

('guard', 'obpm',  2.5),
('wing',  'obpm',  1.5),
('big',   'obpm',  2.0),

('guard', 'dbpm',  0.0),
('wing',  'dbpm',  0.0),
('big',   'dbpm',  0.5),

('guard', 'ortg',  108.0),
('wing',  'ortg',  107.0),
('big',   'ortg',  110.0),

('guard', 'drtg',  103.0),
('wing',  'drtg',  103.0),
('big',   'drtg',  102.0),

('guard', 'porpagatu',   5.0),
('wing',  'porpagatu',   5.0),
('big',   'porpagatu',   5.5),

('guard', 'dporpagatu',  2.0),
('wing',  'dporpagatu',  2.0),
('big',   'dporpagatu',  2.5),

('guard', 'usg',     0.220),
('wing',  'usg',     0.200),
('big',   'usg',     0.200),

('guard', 'ast_pct',  25.0),
('wing',  'ast_pct',  18.0),
('big',   'ast_pct',  14.0),

('guard', 'tov_pct',  17.0),
('wing',  'tov_pct',  16.0),
('big',   'tov_pct',  15.0),

('guard', 'orb_pct',   3.0),
('wing',  'orb_pct',   6.5),
('big',   'orb_pct',  10.5),

('guard', 'drb_pct',  14.0),
('wing',  'drb_pct',  17.5),
('big',   'drb_pct',  22.0),

('guard', 'stl_pct',   2.5),
('wing',  'stl_pct',   2.2),
('big',   'stl_pct',   1.5),

('guard', 'blk_pct',   0.8),
('wing',  'blk_pct',   1.5),
('big',   'blk_pct',   3.5),

-- ============================================================
-- SHOT DISTRIBUTION (column names match stats table)
-- ============================================================

('guard', 'at_rim_share_pct',     0.270),
('wing',  'at_rim_share_pct',     0.290),
('big',   'at_rim_share_pct',     0.380),

('guard', 'inside_arc_share_pct', 0.200),
('wing',  'inside_arc_share_pct', 0.200),
('big',   'inside_arc_share_pct', 0.250),

('guard', 'three_pt_share_pct',   0.380),
('wing',  'three_pt_share_pct',   0.340),
('big',   'three_pt_share_pct',   0.150),

('guard', 'astd_at_rim_pct',      0.420),
('wing',  'astd_at_rim_pct',      0.450),
('big',   'astd_at_rim_pct',      0.550),

('guard', 'astd_three_pct',       0.780),
('wing',  'astd_three_pct',       0.800),
('big',   'astd_three_pct',       0.850),

('guard', 'astd_tot_pct',         0.550),
('wing',  'astd_tot_pct',         0.580),
('big',   'astd_tot_pct',         0.640),

('guard', 'dunks_att',   3),
('wing',  'dunks_att',   8),
('big',   'dunks_att',   25),

('guard', 'dunk_pct',    0.70),
('wing',  'dunk_pct',    0.75),
('big',   'dunk_pct',    0.80),

('guard', 'two_pt_close_pct',  0.580),
('wing',  'two_pt_close_pct',  0.590),
('big',   'two_pt_close_pct',  0.640),

('guard', 'two_pt_far_pct',  0.390),
('wing',  'two_pt_far_pct',  0.385),
('big',   'two_pt_far_pct',  0.400),

-- Rebound totals (for RSM metric)
('guard', 'orb_total',  20),
('wing',  'orb_total',  40),
('big',   'orb_total',  70),

('guard', 'drb_total',  80),
('wing',  'drb_total', 120),
('big',   'drb_total', 160),

-- PF (personal fouls per game, for DRI/SFR)
('guard', 'pf',  2.0),
('wing',  'pf',  2.2),
('big',   'pf',  2.5);
`.trim()

// ---------------------------------------------------------------------------
async function runViaServiceRole() {
  const sqlUrl = `${SUPABASE_URL}/pg/sql`
  console.log('Attempting to run SQL via service role key...\n')

  try {
    const res = await fetch(sqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ query: SQL }),
    })

    if (res.ok) {
      const data = await res.json()
      console.log('SQL executed successfully via /pg/sql endpoint.')
      return true
    }

    console.log(`/pg/sql returned ${res.status}`)
  } catch (err) {
    console.log(`Network error: ${err.message}`)
  }

  return false
}

async function verify() {
  const key = SERVICE_ROLE_KEY || ANON_KEY
  if (!key || !SUPABASE_URL) return

  console.log('\nVerifying...')
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/positional_defaults?select=bucket,metric,default_value&limit=5`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    )
    if (res.ok) {
      const data = await res.json()
      console.log(`  [OK] positional_defaults table exists with ${data.length}+ rows`)
      if (data.length > 0) console.log(`  Sample: ${JSON.stringify(data[0])}`)
    } else {
      console.log(`  [MISSING] positional_defaults: ${res.status}`)
    }
  } catch (err) {
    console.log(`  [ERROR] ${err.message}`)
  }
}

async function main() {
  console.log('=== Setup Positional Defaults ===\n')

  if (!SUPABASE_URL) {
    console.error('ERROR: No SUPABASE_URL found.')
    process.exit(1)
  }

  let applied = false
  if (SERVICE_ROLE_KEY) {
    applied = await runViaServiceRole()
  }

  if (!applied) {
    console.log('------------------------------------------------------------------')
    console.log('Could not auto-apply DDL (no SUPABASE_SERVICE_ROLE_KEY).')
    console.log('Please run the following SQL in your Supabase SQL Editor:')
    console.log('  Dashboard -> SQL Editor -> New query -> Paste & Run')
    console.log('------------------------------------------------------------------\n')
    console.log(SQL)
    console.log('\n------------------------------------------------------------------')
  }

  await verify()
}

main().catch(err => { console.error(err); process.exit(1) })
