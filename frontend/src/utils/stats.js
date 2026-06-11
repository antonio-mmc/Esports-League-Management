// Win rate as an integer percentage (0 when no games have been played).
export function winRate(wins = 0, losses = 0) {
  const total = (wins || 0) + (losses || 0)
  return total > 0 ? Math.round((wins / total) * 100) : 0
}
