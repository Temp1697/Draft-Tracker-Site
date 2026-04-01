// ---------------------------------------------------------------------------
// Fill Defaults — replaces NULL values in stats/measurables with positional
// 50th-percentile defaults. Tracks which fields were estimated.
//
// These filled values are used only for scoring and display — they are NEVER
// written back to the database.
// ---------------------------------------------------------------------------

import { getPositionalDefaults } from './positionalDefaults.js'

// Metrics that live in the measurables table
const MEASURABLE_KEYS = new Set([
  'wingspan', 'ws_minus_h', 'standing_reach', 'vertical', 'max_vertical',
  'lane_agility', 'shuttle', 'three_quarter_sprint', 'bench', 'weight',
])

/**
 * Fill NULL fields in a stats row and/or measurables row with positional defaults.
 *
 * @param {object|null} stats       - row from stats table (or null)
 * @param {object|null} measurables - row from measurables table (or null)
 * @param {string}      bucket      - 'Guard', 'Wing', or 'Big'
 * @returns {{ stats: object, measurables: object, estimatedFields: string[] }}
 */
export async function fillDefaults(stats, measurables, bucket) {
  const bucketKey = (bucket || '').toLowerCase()
  const defaults = await getPositionalDefaults()
  const bucketDefaults = defaults[bucketKey] || {}

  const filledStats = stats ? { ...stats } : {}
  const filledMeas = measurables ? { ...measurables } : {}
  const estimatedFields = []

  for (const [metric, value] of Object.entries(bucketDefaults)) {
    if (MEASURABLE_KEYS.has(metric)) {
      if (filledMeas[metric] == null) {
        filledMeas[metric] = value
        estimatedFields.push(metric)
      }
    } else {
      if (filledStats[metric] == null) {
        filledStats[metric] = value
        estimatedFields.push(metric)
      }
    }
  }

  return { stats: filledStats, measurables: filledMeas, estimatedFields }
}

/**
 * Synchronous version — requires pre-fetched defaults map.
 * Use this in batch operations where you've already loaded defaults.
 */
export function fillDefaultsSync(stats, measurables, bucket, defaultsMap) {
  const bucketKey = (bucket || '').toLowerCase()
  const bucketDefaults = defaultsMap[bucketKey] || {}

  const filledStats = stats ? { ...stats } : {}
  const filledMeas = measurables ? { ...measurables } : {}
  const estimatedFields = []

  for (const [metric, value] of Object.entries(bucketDefaults)) {
    if (MEASURABLE_KEYS.has(metric)) {
      if (filledMeas[metric] == null) {
        filledMeas[metric] = value
        estimatedFields.push(metric)
      }
    } else {
      if (filledStats[metric] == null) {
        filledStats[metric] = value
        estimatedFields.push(metric)
      }
    }
  }

  return { stats: filledStats, measurables: filledMeas, estimatedFields }
}
