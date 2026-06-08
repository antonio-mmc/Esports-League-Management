import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import {
  LayoutDashboard, Users, UserCheck, Shield, Trophy, Swords, ChevronRight, Search, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_FILTERS, useGameFilter } from '../context/GameFilterContext'
import { playerApi, teamApi, coachApi, tournamentApi } from '../services/api'

const nav = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/players',     icon: Users,           label: 'Players'     },
  { to: '/coaches',     icon: UserCheck,       label: 'Coaches'     },
  { to: '/teams',       icon: Shield,          label: 'Teams'       },
  { to: '/tournaments', icon: Trophy,          label: 'Tournaments' },
  { to: '/matches',     icon: Swords,          label: 'Matches'     },
]

const labelVariants = {
  visible: { opacity: 1, transition: { duration: 0.2, delay: 0.12 } },
  hidden:  { opacity: 0, transition: { duration: 0.08 } },
}

function SearchSection({ label, items, getLabel, getSub, onSelect }) {
  return (
    <div>
      <p className="px-3 pt-2 pb-1 font-body text-xs text-text-dim uppercase tracking-wider">{label}</p>
      {items.slice(0, 5).map((item, i) => (
        <button key={i} onClick={() => onSelect(item)}
          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors duration-100 cursor-pointer text-left">
          <div className="min-w-0 flex-1">
            <p className="font-body text-sm text-text-primary font-medium truncate">{getLabel(item)}</p>
            <p className="font-body text-xs text-text-dim truncate">{getSub(item)}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

function SidebarSearch() {
  const [query,   setQuery]   = useState('')
  const [open,    setOpen]    = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const [allData, setAllData] = useState({ players: [], teams: [], coaches: [], tournaments: [] })
  const [loaded,  setLoaded]  = useState(false)
  const inputRef    = useRef(null)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  const loadAll = async () => {
    if (loaded) return
    const [pRes, tRes, cRes, trRes] = await Promise.allSettled([
      playerApi.getAll(), teamApi.getAll(), coachApi.getAll(), tournamentApi.getAll(),
    ])
    setAllData({
      players:     pRes.status  === 'fulfilled' ? pRes.value.data  || [] : [],
      teams:       tRes.status  === 'fulfilled' ? tRes.value.data  || [] : [],
      coaches:     cRes.status  === 'fulfilled' ? cRes.value.data  || [] : [],
      tournaments: trRes.status === 'fulfilled' ? trRes.value.data || [] : [],
    })
    setLoaded(true)
  }

  const handleFocus = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropPos({ top: rect.top - 4, left: rect.right + 10 })
    }
    setOpen(true)
    loadAll()
  }

  useEffect(() => {
    const handler = (e) => {
      const dropdown = document.getElementById('sb-search-drop')
      if (!containerRef.current?.contains(e.target) && !dropdown?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const q = query.toLowerCase().trim()
  const results = q.length >= 2 ? {
    players:     allData.players.filter(p => p.nickname?.toLowerCase().includes(q) || p.fullName?.toLowerCase().includes(q)),
    teams:       allData.teams.filter(t => t.name?.toLowerCase().includes(q)),
    coaches:     allData.coaches.filter(c => c.name?.toLowerCase().includes(q)),
    tournaments: allData.tournaments.filter(t => t.name?.toLowerCase().includes(q) || t.game?.toLowerCase().includes(q)),
  } : null

  const hasResults = results && Object.values(results).some(a => a.length > 0)
  const go = (path) => { navigate(path); setOpen(false); setQuery('') }

  return (
    <div ref={containerRef}>
      <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-bg-primary border border-bg-border transition-all duration-150 focus-within:border-accent-green/40">
        <Search size={12} className="text-text-dim flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder="Search..."
          className="bg-transparent font-body text-xs text-text-primary placeholder:text-text-dim outline-none flex-1 min-w-0"
        />
        {query && (
          <button onMouseDown={e => { e.preventDefault(); setQuery('') }} className="text-text-dim hover:text-text-muted cursor-pointer transition-colors">
            <X size={11} />
          </button>
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {open && q.length >= 2 && (
            <motion.div
              id="sb-search-drop"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                position: 'fixed',
                top:      dropPos.top,
                left:     dropPos.left,
                width:    284,
                zIndex:   9999,
                background: 'rgba(9,15,29,0.98)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(30,41,59,0.8)',
                borderRadius: 12,
                boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
              }}>
              <div className="py-1 max-h-72 overflow-y-auto">
                {!hasResults ? (
                  <p className="font-body text-xs text-text-dim text-center py-5">No results for "{query}"</p>
                ) : (
                  <>
                    {results.players.length > 0 && (
                      <SearchSection label="Players" items={results.players}
                        getLabel={p => p.nickname} getSub={p => p.fullName || p.playerType}
                        onSelect={p => go(`/players?q=${encodeURIComponent(p.nickname || '')}`)} />
                    )}
                    {results.teams.length > 0 && (
                      <SearchSection label="Teams" items={results.teams}
                        getLabel={t => t.name} getSub={t => `${t.players?.length ?? 0} players`}
                        onSelect={t => go(`/teams/${t.id}`)} />
                    )}
                    {results.coaches.length > 0 && (
                      <SearchSection label="Coaches" items={results.coaches}
                        getLabel={c => c.name} getSub={c => c.team?.name || 'No team'}
                        onSelect={c => go(`/coaches?q=${encodeURIComponent(c.name || '')}`)} />
                    )}
                    {results.tournaments.length > 0 && (
                      <SearchSection label="Tournaments" items={results.tournaments}
                        getLabel={t => t.name} getSub={t => t.game || '—'}
                        onSelect={t => go(`/tournaments/${t.id}`)} />
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const { gameFilter, setGameFilter } = useGameFilter()

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 224 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 left-0 flex flex-col z-40 overflow-hidden"
      style={{
        background: 'rgba(9,15,29,0.97)',
        borderRight: '1px solid rgba(30,41,59,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-bg-border flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent-green flex items-center justify-center shadow-glow flex-shrink-0">
          <Swords size={16} className="text-bg-base" strokeWidth={2.5} />
        </div>
        <motion.div variants={labelVariants} animate={collapsed ? 'hidden' : 'visible'} className="overflow-hidden min-w-0">
          <p className="font-display text-text-primary text-sm leading-tight whitespace-nowrap">ESports</p>
          <p className="font-body text-text-dim text-xs leading-tight whitespace-nowrap">League Manager</p>
        </motion.div>
      </div>

      {/* Scrollable body: nav + search/filter sit together, collapse stays pinned at bottom */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0">
        <nav className="px-2 py-4 space-y-0.5">
          {nav.map(({ to, icon: Icon, label }) => {
            const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <NavLink key={to} to={to} title={collapsed ? label : undefined}
                className={[
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 cursor-pointer',
                  active
                    ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-primary border border-transparent',
                ].join(' ')}>
                <Icon size={16} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0" />
                <motion.span variants={labelVariants} animate={collapsed ? 'hidden' : 'visible'}
                  className="font-body font-medium text-sm flex-1 whitespace-nowrap">
                  {label}
                </motion.span>
                {active && (
                  <motion.div animate={{ opacity: collapsed ? 0 : 0.6 }} transition={{ duration: 0.15 }}>
                    <ChevronRight size={12} />
                  </motion.div>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Search + Game filter — hidden when collapsed */}
        <motion.div
          initial={false}
          animate={{ height: collapsed ? 0 : 'auto', opacity: collapsed ? 0 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ overflow: 'hidden', flexShrink: 0 }}>
          <div className="border-t border-bg-border px-3 pt-3 pb-3 space-y-3">
            <SidebarSearch />
            <div>
              <p className="font-body text-xs text-text-dim uppercase tracking-wider mb-2 px-0.5">Mode</p>
              <div className="grid grid-cols-2 gap-1">
                {GAME_FILTERS.map(f => (
                  <button key={f.key} onClick={() => setGameFilter(f.key)}
                    className={[
                      'py-1.5 px-2 rounded-lg font-body text-xs font-medium transition-all duration-150 cursor-pointer text-center',
                      gameFilter === f.key
                        ? 'bg-accent-green/15 text-accent-green border border-accent-green/25'
                        : 'text-text-muted hover:text-text-primary hover:bg-bg-primary border border-transparent',
                    ].join(' ')}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Collapse toggle */}
      <div className="flex-shrink-0 border-t border-bg-border">
        <button onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center gap-3 px-4 py-4 text-text-dim hover:text-text-primary hover:bg-bg-primary/50 transition-colors duration-150">
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="flex-shrink-0">
            <ChevronRight size={15} />
          </motion.div>
          <motion.span variants={labelVariants} animate={collapsed ? 'hidden' : 'visible'}
            className="font-body text-xs font-medium whitespace-nowrap">
            Collapse
          </motion.span>
        </button>
      </div>
    </motion.aside>
  )
}
