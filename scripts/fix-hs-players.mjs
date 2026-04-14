#!/usr/bin/env node
// Fix high school players: set class='hs' and league_conf='High School'

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'

// Known high school draftees in our database
const HS_PLAYERS = [
  // 1996 Draft
  { player_id: 'kobebryant_1978', name: 'Kobe Bryant' },
  { player_id: 'jermaineoneal_1978', name: "Jermaine O'Neal" },
  // 1998 Draft
  { player_id: 'alharrington_1980', name: 'Al Harrington' },
  // 2003 Draft
  { player_id: 'lebronjames_1984', name: 'LeBron James' },
  { player_id: 'ndudiebi_1984', name: 'Ndudi Ebi' },
  { player_id: 'kendrickperkins_1984', name: 'Kendrick Perkins' },
  { player_id: 'travisoutlaw_1984', name: 'Travis Outlaw' },
]

async function updatePlayer(p) {
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/prospects?player_id=eq.${p.player_id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ class: 'hs', league_conf: 'High School' }),
    }
  )
  if (!resp.ok) {
    const text = await resp.text()
    console.error(`❌ ${p.name}: ${resp.status} — ${text}`)
  } else {
    console.log(`✅ ${p.name} → class='hs', league_conf='High School'`)
  }
}

async function fix() {
  for (const p of HS_PLAYERS) {
    await updatePlayer(p)
  }
  console.log('\nDone! HS players updated.')
}

fix()
