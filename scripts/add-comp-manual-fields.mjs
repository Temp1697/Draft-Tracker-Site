#!/usr/bin/env node
// Add comp_slot and is_manual columns to player_comps table
// Run: node scripts/add-comp-manual-fields.mjs

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjaXdnZXFxdHJpdmVsZ2VmZXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1OTQ3NjYsImV4cCI6MjA1ODE3MDc2Nn0.zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const sql = `
-- Add comp_slot column (star, average, bust) for manual override targeting
ALTER TABLE player_comps ADD COLUMN IF NOT EXISTS comp_slot TEXT;

-- Add is_manual flag to distinguish manual overrides from auto-generated comps
ALTER TABLE player_comps ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT false;

-- Index for quick lookup of manual overrides
CREATE INDEX IF NOT EXISTS idx_comps_manual ON player_comps(player_id, comp_slot) WHERE is_manual = true;
`

async function run() {
  console.log('Adding comp_slot and is_manual columns to player_comps...')

  const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!resp.ok) {
    // Try direct SQL via the SQL endpoint
    console.log('RPC not available, printing SQL to run manually in Supabase SQL editor:')
    console.log('\n' + sql)
    console.log('\nPlease run the above SQL in your Supabase SQL editor.')
  } else {
    console.log('Done! Columns added successfully.')
  }
}

run().catch(console.error)
