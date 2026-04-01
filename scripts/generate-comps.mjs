// ---------------------------------------------------------------------------
// Generate Historical Comparisons for All Prospects
//
// Only produces comps when there's a genuine match. Requirements:
//   1. SAME position bucket (Guard/Wing/Big) — hard filter
//   2. SIMILAR body type — height within 3 inches, weight within 30 lbs
//   3. Weighted distance across stats/athleticism must be below threshold
//   4. Modern comps: max 4, only if distance < 3.5 (35% similarity floor)
//   5. Legend comps: max 1, only if distance < 2.5 (75% similarity floor)
//      — legends are rare and should only appear for elite prospects
//
// Usage: node scripts/generate-comps.mjs
// ---------------------------------------------------------------------------

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://aciwgeqqtrivelgefeqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zTy1P-XOFTUrp98f2Se3Jw_pD7h_a2A'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Thresholds — distance is on a 0-10 scale
const MODERN_MAX_DIST = 3.5      // must be at least 65% similar
const LEGEND_MAX_DIST = 1.8      // must be at least 82% similar — legends are rare
const MODERN_COMP_COUNT = 4
const LEGEND_COMP_COUNT = 1

// Body type hard filters
const HEIGHT_TOLERANCE = 3.0     // inches
const WEIGHT_TOLERANCE = 30      // lbs

// Normalization ranges
const RANGES = {
  ssa:       { min: 0, max: 10 },
  oai:       { min: 0, max: 10 },
  composite: { min: 0, max: 10 },
  height:    { min: 70, max: 88 },
  ws_h:      { min: 0, max: 10 },
}

// Weights — what matters most for a real comp
const WEIGHTS = {
  ssa:       3.0,   // statistical production is key
  oai:       2.5,   // athleticism profile
  composite: 2.0,   // overall rating
  height:    1.5,   // body type
  ws_h:      1.0,   // length profile
}

function normalize(val, min, max) {
  if (val == null) return null
  return Math.max(0, Math.min(1, (val - min) / (max - min)))
}

function calcDistance(pVec, hVec) {
  let sumSqWeighted = 0
  let totalWeight = 0

  for (const dim of Object.keys(WEIGHTS)) {
    const pv = pVec[dim]
    const hv = hVec[dim]
    if (pv == null || hv == null) continue
    const diff = pv - hv
    sumSqWeighted += WEIGHTS[dim] * diff * diff
    totalWeight += WEIGHTS[dim]
  }

  if (totalWeight === 0) return Infinity
  return Math.sqrt(sumSqWeighted / totalWeight) * 10
}

// Body type check — both height and weight must be close
function bodyTypeMatch(prospectH, prospectW, histH, histW) {
  // If either side has no measurements, allow match (don't penalize missing data)
  if (prospectH == null || histH == null) return true
  if (Math.abs(prospectH - histH) > HEIGHT_TOLERANCE) return false
  // Weight check only if both available
  if (prospectW != null && histW != null) {
    if (Math.abs(prospectW - histW) > WEIGHT_TOLERANCE) return false
  }
  return true
}

async function run() {
  console.log('Loading data...')

  const [{ data: board }, { data: measurables }, { data: historical }] = await Promise.all([
    supabase.from('master_board').select('player_id, display_name, primary_bucket, ssa, oai, composite_score'),
    supabase.from('measurables').select('player_id, height, weight, ws_minus_h'),
    supabase.from('historical_players').select('id, name, tier, position, oai_estimate, ssa_estimate, scr_estimate, sci_estimate, height, weight, ws_minus_h'),
  ])

  if (!board?.length) { console.error('No prospects found'); return }
  if (!historical?.length) { console.error('No historical players found'); return }

  const measMap = new Map((measurables || []).map(m => [m.player_id, m]))
  console.log(`${board.length} prospects, ${historical.length} historical players`)

  // Pre-compute historical vectors
  const historicalVecs = historical.map(h => ({
    ...h,
    vec: {
      ssa:       normalize(h.ssa_estimate, RANGES.ssa.min, RANGES.ssa.max),
      oai:       normalize(h.oai_estimate, RANGES.oai.min, RANGES.oai.max),
      composite: normalize(((h.scr_estimate || 0) + (h.sci_estimate || 0)) / 2, RANGES.composite.min, RANGES.composite.max),
      height:    normalize(h.height, RANGES.height.min, RANGES.height.max),
      ws_h:      normalize(h.ws_minus_h, RANGES.ws_h.min, RANGES.ws_h.max),
    }
  }))

  // Clear existing comps
  const { error: delErr } = await supabase.from('player_comps').delete().neq('player_id', '__impossible__')
  if (delErr) { console.error('Delete error:', delErr); return }
  console.log('Cleared existing comps.')

  const allComps = []
  let prospectsWithComps = 0
  let prospectsWithLegend = 0
  let skipped = 0

  for (const prospect of board) {
    const meas = measMap.get(prospect.player_id)
    const bucket = prospect.primary_bucket

    if (!bucket) { skipped++; continue }

    // Treat OAI of 0 as missing (pre-combine prospects)
    const oaiVal = prospect.oai && prospect.oai > 0 ? prospect.oai : null
    const pVec = {
      ssa:       normalize(prospect.ssa, RANGES.ssa.min, RANGES.ssa.max),
      oai:       normalize(oaiVal, RANGES.oai.min, RANGES.oai.max),
      composite: normalize(prospect.composite_score, RANGES.composite.min, RANGES.composite.max),
      height:    normalize(meas?.height, RANGES.height.min, RANGES.height.max),
      ws_h:      normalize(meas?.ws_minus_h, RANGES.ws_h.min, RANGES.ws_h.max),
    }

    const modernCandidates = []
    const legendCandidates = []

    for (const h of historicalVecs) {
      // Hard filter 1: position must match
      if (bucket !== h.position) continue

      // Hard filter 2: body type must be similar
      if (!bodyTypeMatch(meas?.height, meas?.weight, h.height, h.weight)) continue

      const dist = calcDistance(pVec, h.vec)
      if (dist === Infinity) continue

      const entry = {
        player_id: prospect.player_id,
        historical_player_id: h.id,
        similarity_distance: Math.round(dist * 100) / 100,
        comp_tier: h.tier,
      }

      if (h.tier === 'legend') {
        if (dist <= LEGEND_MAX_DIST) legendCandidates.push(entry)
      } else {
        if (dist <= MODERN_MAX_DIST) modernCandidates.push(entry)
      }
    }

    // Sort and take top
    modernCandidates.sort((a, b) => a.similarity_distance - b.similarity_distance)
    legendCandidates.sort((a, b) => a.similarity_distance - b.similarity_distance)

    const modernPicks = modernCandidates.slice(0, MODERN_COMP_COUNT)
    const legendPicks = legendCandidates.slice(0, LEGEND_COMP_COUNT)

    if (modernPicks.length > 0 || legendPicks.length > 0) prospectsWithComps++
    if (legendPicks.length > 0) prospectsWithLegend++

    allComps.push(...modernPicks, ...legendPicks)
  }

  console.log(`\nResults:`)
  console.log(`  ${prospectsWithComps}/${board.length - skipped} prospects got comps`)
  console.log(`  ${prospectsWithLegend} prospects got a legend comp`)
  console.log(`  ${allComps.length} total comparison rows`)

  if (allComps.length === 0) {
    console.log('\nNo comps generated — check thresholds or data.')
    return
  }

  // Insert in batches
  for (let i = 0; i < allComps.length; i += 50) {
    const batch = allComps.slice(i, i + 50)
    const { error } = await supabase.from('player_comps').insert(batch)
    if (error) {
      console.error(`Batch ${Math.floor(i / 50) + 1} error:`, error)
      console.error('First row:', batch[0])
    } else {
      console.log(`  Batch ${Math.floor(i / 50) + 1}: ${batch.length} comps inserted`)
    }
  }

  console.log('\nDone!')
}

run()
