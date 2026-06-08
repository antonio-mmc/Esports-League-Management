import { createContext, useContext, useState } from 'react'

export const GAME_FILTERS = [
  { key: 'ALL',          label: 'General'      },
  { key: 'FPS',          label: 'FPS'          },
  { key: 'MOBA',         label: 'MOBA'         },
  { key: 'EFOOTBALL',    label: 'eFootball'    },
  { key: 'RACING',       label: 'Racing'       },
  { key: 'BATTLE_ROYALE', label: 'Battle Royale' },
]

const GameFilterContext = createContext(null)

export function GameFilterProvider({ children }) {
  const [gameFilter, setGameFilter] = useState('ALL')
  return (
    <GameFilterContext.Provider value={{ gameFilter, setGameFilter }}>
      {children}
    </GameFilterContext.Provider>
  )
}

export function useGameFilter() {
  return useContext(GameFilterContext)
}
