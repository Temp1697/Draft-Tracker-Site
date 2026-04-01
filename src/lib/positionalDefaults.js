// ---------------------------------------------------------------------------
// Positional Defaults — fetch and cache 50th percentile values by bucket
// ---------------------------------------------------------------------------

// Cache: { guard: { metric: value }, wing: { ... }, big: { ... } }
let cache = null

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Fetch positional defaults from Supabase and cache in memory.
 * Uses raw fetch to avoid supabase-js schema cache issues with new tables.
 * Returns { guard: { metric: defaultValue }, wing: {...}, big: {...} }
 */
export async function getPositionalDefaults() {
  if (cache) return cache

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/positional_defaults?select=bucket,metric,default_value`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    )
    if (!res.ok) {
      console.warn('Failed to fetch positional_defaults:', res.status)
      return { guard: {}, wing: {}, big: {} }
    }

    const data = await res.json()
    const result = { guard: {}, wing: {}, big: {} }
    for (const row of data) {
      if (result[row.bucket]) {
        result[row.bucket][row.metric] = Number(row.default_value)
      }
    }

    cache = result
    return cache
  } catch (err) {
    console.warn('Failed to fetch positional_defaults:', err.message)
    return { guard: {}, wing: {}, big: {} }
  }
}

/** Clear the in-memory cache (useful after edits to the defaults table). */
export function clearDefaultsCache() {
  cache = null
}
