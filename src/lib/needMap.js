// Maps team needs to style archetypes and position buckets
// Used by the recommendation engine in Mock Draft
export const NEED_ARCHETYPE_MAP = {
  'Rim Protector': { buckets: ['Big'], archetypes: ['Rim Protector', 'Paint Anchor', 'Weakside Shot Blocker'] },
  '3-and-D Wing': { buckets: ['Wing'], archetypes: ['3 and D Wing', 'Perimeter Stopper', 'Switchable Defensive Wing'] },
  'Primary Playmaker': { buckets: ['Guard'], archetypes: ['Primary Playmaker', 'Scoring Lead Guard'] },
  'Stretch Big': { buckets: ['Big'], archetypes: ['Stretch Big', 'Pick and Pop Big'] },
  'Shot Creator': { buckets: ['Guard', 'Wing'], archetypes: ['Shot Creator Combo Guard', 'Shot Creating Wing', 'Offensive Engine'] },
  'Rim Runner': { buckets: ['Big'], archetypes: ['Rim Runner', 'Vertical Lob Threat'] },
  'Point Forward': { buckets: ['Wing'], archetypes: ['Point Forward', 'Connector Wing'] },
  'Secondary Playmaker': { buckets: ['Guard', 'Wing'], archetypes: ['Secondary Playmaker', 'Connector Wing'] },
  'Scoring Wing': { buckets: ['Wing'], archetypes: ['Three Level Scorer', 'Off Ball Scoring Wing', 'Slasher Wing'] },
  'Defensive Anchor': { buckets: ['Big'], archetypes: ['Rim Protector', 'Paint Anchor', 'Mobile Defensive Big'] },
}

// All available need labels for the team editor
export const NEED_OPTIONS = Object.keys(NEED_ARCHETYPE_MAP)

/**
 * Get recommended players for a team's pick
 * @param {Object} team - Team with need_1, need_2, need_3
 * @param {Array} availablePlayers - Players not yet drafted
 * @param {number} count - Number of recommendations (default 3)
 * @returns {Array} Recommended players with matchedNeed info
 */
export function getRecommendations(team, availablePlayers, count = 3) {
  const needs = [team.need_1, team.need_2, team.need_3].filter(Boolean)

  if (needs.length === 0) {
    // No needs set — return BPA
    return availablePlayers
      .slice(0, count)
      .map(p => ({ ...p, matchedNeed: 'BPA' }))
  }

  // Find players matching at least one need
  const matched = []
  for (const player of availablePlayers) {
    for (const need of needs) {
      const mapping = NEED_ARCHETYPE_MAP[need]
      if (!mapping) continue

      const bucketMatch = mapping.buckets.includes(player.primary_bucket)
      const archetypeMatch = mapping.archetypes.includes(player.style_archetype)

      if (bucketMatch && archetypeMatch) {
        matched.push({ ...player, matchedNeed: need })
        break // Don't add same player twice
      }
    }
  }

  // Sort by composite score (already sorted from board, but ensure)
  matched.sort((a, b) => (b.composite_score || 0) - (a.composite_score || 0))

  // Take top matches, fill remaining with BPA
  const recs = matched.slice(0, count)

  if (recs.length < count) {
    const recIds = new Set(recs.map(r => r.player_id))
    const bpa = availablePlayers
      .filter(p => !recIds.has(p.player_id))
      .slice(0, count - recs.length)
      .map(p => ({ ...p, matchedNeed: 'BPA' }))
    recs.push(...bpa)
  }

  return recs
}
