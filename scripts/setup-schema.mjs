#!/usr/bin/env node
/**
 * setup-schema.mjs
 *
 * Applies DDL migrations to Supabase.
 *
 * Strategy:
 *  1. Try to run SQL via the Supabase REST SQL endpoint (requires service_role key).
 *  2. If SUPABASE_SERVICE_ROLE_KEY is not set, print the SQL so the user can
 *     paste it into the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env manually (no dotenv dependency needed)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* .env may not exist */ }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const SQL = `
-- ============================================================
-- 1. Add strength / weakness columns to prospects
-- ============================================================
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS strength_1 text;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS strength_2 text;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS strength_3 text;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS weakness_1 text;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS weakness_2 text;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS weakness_3 text;

-- ============================================================
-- 2. Create player_injuries table
-- ============================================================
CREATE TABLE IF NOT EXISTS player_injuries (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  player_id text NOT NULL,
  body_part text,
  severity text,
  injury_date text,
  games_missed integer,
  notes text,
  status text
);

-- Enable RLS (row-level security) but allow all access via anon key
-- Adjust policies to your needs.
ALTER TABLE player_injuries ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow anonymous read access on player_injuries"
  ON player_injuries FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow anonymous insert on player_injuries"
  ON player_injuries FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow anonymous update on player_injuries"
  ON player_injuries FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow anonymous delete on player_injuries"
  ON player_injuries FOR DELETE
  USING (true);
`.trim();

// ---------------------------------------------------------------------------
// Attempt to run via the Supabase SQL REST endpoint (v1/sql or pg-meta)
// ---------------------------------------------------------------------------
async function runViaServiceRole() {
  // The Supabase platform exposes a SQL endpoint at /rest/v1/rpc but that
  // requires a pre-existing function.  The *management* SQL endpoint lives
  // at the project's pg-meta proxy which is only reachable with the
  // service_role key.
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;

  // First, try creating a helper function via the pg REST SQL endpoint
  // Supabase exposes /pg/sql for service-role bearers on some plans.
  const sqlUrl = `${SUPABASE_URL}/pg/sql`;

  console.log('Attempting to run SQL via service role key...\n');

  try {
    const res = await fetch(sqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ query: SQL }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log('SQL executed successfully via /pg/sql endpoint.');
      console.log(JSON.stringify(data, null, 2));
      return true;
    }

    // Fallback: try the query endpoint used by supabase-js v2 management
    const queryUrl = `${SUPABASE_URL}/rest/v1/`;
    console.log(`/pg/sql returned ${res.status}, trying alternative...`);
  } catch (err) {
    console.log(`Network error: ${err.message}`);
  }

  return false;
}

// ---------------------------------------------------------------------------
// Verify columns exist by querying the table (works with anon key)
// ---------------------------------------------------------------------------
async function verifySchema() {
  const key = SERVICE_ROLE_KEY || ANON_KEY;
  if (!key || !SUPABASE_URL) return;

  console.log('\nVerifying schema...');

  // Check prospects columns
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/prospects?select=strength_1,weakness_1&limit=0`,
      {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
      }
    );
    if (res.ok) {
      console.log('  [OK] prospects table has strength_1, weakness_1 columns');
    } else {
      const text = await res.text();
      console.log(`  [MISSING] prospects strength/weakness columns: ${res.status} - ${text}`);
    }
  } catch (err) {
    console.log(`  [ERROR] prospects check failed: ${err.message}`);
  }

  // Check player_injuries table
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/player_injuries?select=id,player_id&limit=0`,
      {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
      }
    );
    if (res.ok) {
      console.log('  [OK] player_injuries table exists');
    } else {
      const text = await res.text();
      console.log(`  [MISSING] player_injuries table: ${res.status} - ${text}`);
    }
  } catch (err) {
    console.log(`  [ERROR] player_injuries check failed: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== Draft Tracker Schema Setup ===\n');

  if (!SUPABASE_URL) {
    console.error('ERROR: No SUPABASE_URL found. Set VITE_SUPABASE_URL or SUPABASE_URL in .env');
    process.exit(1);
  }

  let applied = false;

  if (SERVICE_ROLE_KEY) {
    applied = await runViaServiceRole();
  }

  if (!applied) {
    console.log('------------------------------------------------------------------');
    console.log('Could not auto-apply DDL (no SUPABASE_SERVICE_ROLE_KEY found).');
    console.log('');
    console.log('Please run the following SQL in your Supabase SQL Editor:');
    console.log('  Dashboard -> SQL Editor -> New query -> Paste & Run');
    console.log('------------------------------------------------------------------\n');
    console.log(SQL);
    console.log('\n------------------------------------------------------------------');
  }

  await verifySchema();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
