import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Bell, Settings } from 'lucide-react'
import { GAME_FILTERS, useGameFilter } from '../context/GameFilterContext'
import { playerApi, teamApi, coachApi, tournamentApi } from '../services/api'

function SearchGroup({ label, items, getLabel, getSub, onSelect }) {
  return (
    <div className="mb-1">
      <p className="px-4 py-1.5 font-body text-xs text-text-dim uppercase tracking-wider">{label}</p>
      {items.slice(0, 4).map((item, i) => (
        <button key={i} onClick={() => onSelect(item)}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-bg-primary/60 transition-colors duration-100 cursor-pointer text-left">
          <div className="min-w-0 flex-1">
            <p className="font-body text-sm text-text-primary font-medium truncate">{getLabel(item)}</p>
            <p className="font-body text-xs text-text-dim truncate">{getSub(item)}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

function GlobalSearch() {
  const [query,  setQuery]  = useState('')
  const [open,   setOpen]   = useState(false)
  const [data,   setData]   = useState({ players: [], teams: [], coaches: [], tournaments: [] })
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)

  const loadAll = async () => {
    if (loaded) return
    const [pRes, tRes, cRes, trRes] = await Promise.allSettled([
      playerApi.getAll(), teamApi.getAll(), coachApi.getAll(), tournamentApi.getAll(),
    ])
    setData({
      players:     pRes.status  === 'fulfilled' ? pRes.value.data  || [] : [],
      teams:       tRes.status  === 'fulfilled' ? tRes.value.data  || [] : [],
      coaches:     cRes.status  === 'fulfilled' ? cRes.value.data  || [] : [],
      tournaments: trRes.status === 'fulfilled' ? trRes.value.data || [] : [],
    })
    setLoaded(true)
  }

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const q = query.toLowerCase().trim()
  const results = q.length >= 2 ? {
    players:     data.players.filter(p => p.nickname?.toLowerCase().includes(q) || p.fullName?.toLowerCase().includes(q)),
    teams:       data.teams.filter(t => t.name?.toLowerCase().includes(q)),
    coaches:     data.coaches.filter(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)),
    tournaments: data.tournaments.filter(t => t.name?.toLowerCase().includes(q) || t.game?.toLowerCase().includes(q)),
  } : null

  const hasResults = results && Object.values(results).some(arr => arr.length > 0)

  const go = (path) => { navigate(path); setOpen(false); setQuery('') }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-primary border border-bg-border w-72 transition-all duration-150 focus-within:border-accent-green/40 focus-within:bg-bg-card">
        <Search size={13} className="text-text-dim flex-shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { setOpen(true); loadAll() }}
          placeholder="Search players, teams, tournaments..."
          className="bg-transparent font-body text-sm text-text-primary placeholder:text-text-dim outline-none flex-1 min-w-0"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-text-dim hover:text-text-muted transition-colors cursor-pointer">
            <X size={12} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && q.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-full mt-2 left-0 w-80 rounded-xl border border-bg-border overflow-hidden z-50"
            style={{ background: 'rgba(9,15,29,0.98)', backdropFilter: 'blur(20px)' }}>
            {!hasResults ? (
              <p className="font-body text-sm text-text-dim text-center py-6">No results for "{query}"</p>
            ) : (
              <div className="py-2 max-h-80 overflow-y-auto">
                {results.players.length > 0 && (
                  <SearchGroup label="Players" items={results.players}
                    getLabel={p => p.nickname} getSub={p => p.fullName || p.playerType}
                    onSelect={() => go('/players')} />
                )}
                {results.teams.length > 0 && (
                  <SearchGroup label="Teams" items={results.teams}
                    getLabel={t => t.name} getSub={t => `${t.players?.length ?? 0} players`}
                    onSelect={t => go(`/teams/${t.id}`)} />
                )}
                {results.coaches.length > 0 && (
                  <SearchGroup label="Coaches" items={results.coaches}
                    getLabel={c => c.name} getSub={c => c.team?.name || 'No team'}
                    onSelect={() => go('/coaches')} />
                )}
                {results.tournaments.length > 0 && (
                  <SearchGroup label="Tournaments" items={results.tournaments}
                    getLabel={t => t.name} getSub={t => t.game || '—'}
                    onSelect={t => go(`/tournaments/${t.id}`)} />
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar({ collapsed }) {
  const { gameFilter, setGameFilter } = useGameFilter()

  return (
    <motion.header
      animate={{ marginLeft: collapsed ? 64 : 224 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 z-30 h-14 flex items-center gap-4 px-5"
      style={{
        left: 0,
        background: 'rgba(9,15,29,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(30,41,59,0.6)',
      }}>

      <GlobalSearch />

      {/* Game filter */}
      <div className="flex items-center gap-0.5 p-1 rounded-lg bg-bg-primary border border-bg-border">
        {GAME_FILTERS.map(f => (
          <button key={f.key} onClick={() => setGameFilter(f.key)}
            className="relative px-3 py-1 rounded-md font-body text-xs font-medium cursor-pointer transition-colors duration-150"
            style={{ color: gameFilter === f.key ? '#E2E8F0' : '#64748B' }}>
            {gameFilter === f.key && (
              <motion.div layoutId="nav-filter-active"
                className="absolute inset-0 rounded-md bg-bg-card border border-bg-border"
                style={{ zIndex: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
            )}
            <span className="relative" style={{ zIndex: 1 }}>{f.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-primary transition-all duration-150 cursor-pointer">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-green" />
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-primary transition-all duration-150 cursor-pointer">
          <Settings size={16} />
        </button>
      </div>
    </motion.header>
  )
}
