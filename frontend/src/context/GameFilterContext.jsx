import { createContext, useContext, useState } from 'react'

// eslint-disable-next-line react-refresh/only-export-components -- shared constant colocated with its provider
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

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with its provider
export function useGameFilter() {
  return useContext(GameFilterContext)
}
