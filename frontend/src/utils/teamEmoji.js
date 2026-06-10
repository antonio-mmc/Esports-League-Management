export const TEAM_EMOJI = {
  'Team Nexus':    '⚡',
  'Storm Raiders': '⛈️',
  'Phantom Squad': '👻',
  'Iron Wolves':   '🐺',
  'Echo Strike':   '🔊',
  'Apex Horizon':  '🌅',
  'Velocity Grid': '🏁',
  'Nitro Kings':   '👑',
  'Drop Zone':     '🪂',
  'Zone Control':  '🎯',
}

export function teamEmoji(name) {
  return TEAM_EMOJI[name] || '🛡️'
}
