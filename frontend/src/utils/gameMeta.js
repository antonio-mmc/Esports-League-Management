// Canonical per-modality presentation maps + game-filter helper.
// Shared so pages don't each redefine the same constants/logic.

export const TYPE_COLOR = { FPS: '#06B6D4', MOBA: '#8B5CF6', EFOOTBALL: '#22C55E', RACING: '#F59E0B', BATTLE_ROYALE: '#EF4444', GENERIC: '#94A3B8' }
export const TYPE_LABEL = { FPS: 'FPS', MOBA: 'MOBA', EFOOTBALL: 'eFootball', RACING: 'Racing', BATTLE_ROYALE: 'Battle Royale', GENERIC: 'Generic' }
export const TYPE_BADGE = { FPS: 'cyan', MOBA: 'purple', EFOOTBALL: 'green', RACING: 'orange', BATTLE_ROYALE: 'red', GENERIC: 'gray' }
export const TYPE_EMOJI = { FPS: '🎯', MOBA: '⚔️', EFOOTBALL: '⚽', RACING: '🏎️', BATTLE_ROYALE: '💥', GENERIC: '🎮' }

// Whether a team/tournament/match game string belongs to the selected modality filter.
export function matchesGameFilter(game, filterKey) {
  if (filterKey === 'ALL') return true
  const g = (game || '').toUpperCase()
  if (filterKey === 'EFOOTBALL')     return g.includes('EFOOTBALL') || g.includes('FOOTBALL') || g.includes('FIFA')
  if (filterKey === 'BATTLE_ROYALE') return g.includes('BATTLE_ROYALE') || g.includes('BATTLE ROYALE') || g.includes('ROYALE')
  return g.includes(filterKey)
}
