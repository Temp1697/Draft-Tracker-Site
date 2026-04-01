// ---------------------------------------------------------------------------
// In-app comparison engine — generates historical comps for all prospects
// ---------------------------------------------------------------------------

import { supabase } from './supabase'

const MODERN_MAX_DIST = 3.5
const LEGEND_MAX_DIST = 1.8
const MODERN_COMP_COUNT = 4
const LEGEND_COMP_COUNT = 1
const HEIGHT_TOLERANCE = 3.0
const WEIGHT_TOLERANCE = 30

const RANGES = {
  ssa: { min: 0, max: 10 },
  oai: { min: 0, max: 10 },
  composite: { min: 0, max: 10 },
  height: { min: 70, max: 88 },
  ws_h: { min: 0, max: 10 },
}

const WEIGHTS = { ssa: 3.0, oai: 2.5, composite: 2.0, height: 1.5, ws_h: 1.0 }

function normalize(val, min, max) {
  if (val == null) return null
  return Math.max(0, Math.min(1, (val - min) / (max - min)))
}

function calcDistance(pVec, hVec) {
  let sumSq = 0, totalW = 0
  for (const dim of Object.keys(WEIGHTS)) {
    const pv = pVec[dim], hv = hVec[dim]
    if (pv == null || hv == null) continue
    sumSq += WEIGHTS[dim] * (pv - hv) ** 2
    totalW += WEIGHTS[dim]
  }
  if (totalW === 0) return Infinity
  return Math.sqrt(sumSq / totalW) * 10
}

function bodyTypeMatch(pH, pW, hH, hW) {
  if (pH == null || hH == null) return true
  if (Math.abs(pH - hH) > HEIGHT_TOLERANCE) return false
  if (pW != null && hW != null && Math.abs(pW - hW) > WEIGHT_TOLERANCE) return false
  return true
}

export async function generateAllComps(onProgress) {
  onProgress?.('Loading data...')

  const [{ data: board }, { data: measurables }, { data: historical }] = await Promise.all([
    supabase.from('master_board').select('player_id, display_name, primary_bucket, ssa, oai, composite_score'),
    supabase.from('measurables').select('player_id, height, weight, ws_minus_h'),
    supabase.from('historical_players').select('id, name, tier, position, oai_estimate, ssa_estimate, scr_estimate, sci_estimate, height, weight, ws_minus_h'),
  ])

  if (!board?.length || !historical?.length) throw new Error('Missing data')

  const measMap = new Map((measurables || []).map(m => [m.player_id, m]))

  const historicalVecs = historical.map(h => ({
    ...h,
    vec: {
      ssa: normalize(h.ssa_estimate, RANGES.ssa.min, RANGES.ssa.max),
      oai: normalize(h.oai_estimate, RANGES.oai.min, RANGES.oai.max),
      composite: normalize(((h.scr_estimate || 0) + (h.sci_estimate || 0)) / 2, RANGES.composite.min, RANGES.composite.max),
      height: normalize(h.height, RANGES.height.min, RANGES.height.max),
      ws_h: normalize(h.ws_minus_h, RANGES.ws_h.min, RANGES.ws_h.max),
    }
  }))

  onProgress?.('Clearing old comps...')
  await supabase.from('player_comps').delete().neq('player_id', '__impossible__')

  const allComps = []
  let withComps = 0, withLegend = 0

  for (const prospect of board) {
    const meas = measMap.get(prospect.player_id)
    const bucket = prospect.primary_bucket
    if (!bucket) continue

    const oaiVal = prospect.oai && prospect.oai > 0 ? prospect.oai : null
    const pVec = {
      ssa: normalize(prospect.ssa, RANGES.ssa.min, RANGES.ssa.max),
      oai: normalize(oaiVal, RANGES.oai.min, RANGES.oai.max),
      composite: normalize(prospect.composite_score, RANGES.composite.min, RANGES.composite.max),
      height: normalize(meas?.height, RANGES.height.min, RANGES.height.max),
      ws_h: normalize(meas?.ws_minus_h, RANGES.ws_h.min, RANGES.ws_h.max),
    }

    const modern = [], legends = []

    for (const h of historicalVecs) {
      if (bucket !== h.position) continue
      if (!bodyTypeMatch(meas?.height, meas?.weight, h.height, h.weight)) continue
      const dist = calcDistance(pVec, h.vec)
      if (dist === Infinity) continue

      const entry = { player_id: prospect.player_id, historical_player_id: h.id, similarity_distance: Math.round(dist * 100) / 100, comp_tier: h.tier }
      if (h.tier === 'legend' && dist <= LEGEND_MAX_DIST) legends.push(entry)
      else if (h.tier !== 'legend' && dist <= MODERN_MAX_DIST) modern.push(entry)
    }

    modern.sort((a, b) => a.similarity_distance - b.similarity_distance)
    legends.sort((a, b) => a.similarity_distance - b.similarity_distance)

    const picks = [...modern.slice(0, MODERN_COMP_COUNT), ...legends.slice(0, LEGEND_COMP_COUNT)]
    if (picks.length > 0) withComps++
    if (legends.length > 0) withLegend++
    allComps.push(...picks)
  }

  onProgress?.(`Inserting ${allComps.length} comps...`)

  for (let i = 0; i < allComps.length; i += 50) {
    const { error } = await supabase.from('player_comps').insert(allComps.slice(i, i + 50))
    if (error) throw error
  }

  return { total: allComps.length, withComps, withLegend, prospects: board.length }
}
