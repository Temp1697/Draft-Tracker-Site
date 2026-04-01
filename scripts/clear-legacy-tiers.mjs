// ---------------------------------------------------------------------------
// One-time cleanup: strip legacy "Tier N — " prefix from scouting_notes
// and old "Tier N — Label" format from master_board.tier
// Uses Supabase REST API directly via fetch.
// ---------------------------------------------------------------------------

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
}

// Regex to match legacy tier prefixes like "Tier 1 — ", "Tier 2 — ", "Tier 3 - "
const TIER_PREFIX_RE = /^Tier\s+\d+\s*[—–-]\s*/i

// Regex to match old "Tier N — Label" format in master_board.tier
const TIER_FULL_RE = /^Tier\s+\d+\s*[—–-]\s*/i

async function fetchTable(table, select = '*', filter = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${filter}`
  const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Fetch ${table} failed: ${res.status} ${text}`)
  }
  return res.json()
}

async function patchRow(table, matchCol, matchVal, data) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${matchCol}=eq.${encodeURIComponent(matchVal)}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Patch ${table} (${matchCol}=${matchVal}) failed: ${res.status} ${text}`)
  }
}

async function main() {
  console.log('=== Legacy Tier Cleanup ===\n')

  // -----------------------------------------------------------------------
  // Step 1: Check players table for scouting_notes with "Tier" prefix
  // -----------------------------------------------------------------------
  console.log('Step 1: Checking players table for scouting_notes with legacy tier text...')

  let players
  try {
    players = await fetchTable('players', 'player_id,scouting_notes,display_name')
  } catch (e) {
    // scouting_notes column may not exist — try without it
    console.log('  Could not fetch scouting_notes — column may not exist. Trying without...')
    try {
      players = await fetchTable('players', 'player_id,display_name')
    } catch (e2) {
      console.error('  Failed to fetch players:', e2.message)
      players = []
    }
  }

  let notesCleanedCount = 0
  for (const p of players) {
    if (p.scouting_notes && TIER_PREFIX_RE.test(p.scouting_notes)) {
      const cleaned = p.scouting_notes.replace(TIER_PREFIX_RE, '').trim()
      console.log(`  Cleaning notes for ${p.display_name}: "${p.scouting_notes.slice(0, 60)}..." → "${cleaned.slice(0, 60)}..."`)
      await patchRow('players', 'player_id', p.player_id, { scouting_notes: cleaned || null })
      notesCleanedCount++
    }
  }
  console.log(`  ${notesCleanedCount} player scouting_notes cleaned.\n`)

  // -----------------------------------------------------------------------
  // Step 2: Check master_board.tier for old "Tier N — Label" format
  // -----------------------------------------------------------------------
  console.log('Step 2: Checking master_board.tier for legacy "Tier N — Label" format...')

  let masterRows
  try {
    masterRows = await fetchTable('master_board', 'player_id,tier,display_name')
  } catch (e) {
    console.error('  Failed to fetch master_board:', e.message)
    masterRows = []
  }

  let tierCleanedCount = 0
  for (const row of masterRows) {
    if (row.tier && TIER_FULL_RE.test(row.tier)) {
      const cleaned = row.tier.replace(TIER_FULL_RE, '').trim()
      console.log(`  Cleaning tier for ${row.display_name}: "${row.tier}" → "${cleaned}"`)
      await patchRow('master_board', 'player_id', row.player_id, { tier: cleaned || null })
      tierCleanedCount++
    }
  }
  console.log(`  ${tierCleanedCount} master_board tier values cleaned.\n`)

  // -----------------------------------------------------------------------
  // Step 3: Also check players table for a 'tier' column with legacy format
  // -----------------------------------------------------------------------
  console.log('Step 3: Checking players table for tier column with legacy format...')

  let playerTierRows
  try {
    playerTierRows = await fetchTable('players', 'player_id,tier,display_name')
  } catch (e) {
    console.log('  players.tier column may not exist, skipping.')
    playerTierRows = []
  }

  let playerTierCleaned = 0
  for (const row of playerTierRows) {
    if (row.tier && TIER_FULL_RE.test(row.tier)) {
      const cleaned = row.tier.replace(TIER_FULL_RE, '').trim()
      console.log(`  Cleaning tier for ${row.display_name}: "${row.tier}" → "${cleaned}"`)
      await patchRow('players', 'player_id', row.player_id, { tier: cleaned || null })
      playerTierCleaned++
    }
  }
  console.log(`  ${playerTierCleaned} players.tier values cleaned.\n`)

  console.log('=== Done ===')
  console.log(`Total cleaned: ${notesCleanedCount + tierCleanedCount + playerTierCleaned} fields across all tables.`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
