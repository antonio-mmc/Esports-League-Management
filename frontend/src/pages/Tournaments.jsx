import { useEffect, useState, useMemo, useRef } from 'react'
import { Plus, Trash2, Edit2, Trophy, Shield, Crosshair, Sword, Footprints, Car, Skull, Search, X, Users, UserCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Combobox from '../components/Combobox'
import { useToast } from '../components/Toast'
import { useGameFilter } from '../context/GameFilterContext'
import { tournamentApi, teamApi, playerApi, coachApi } from '../services/api'

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-body text-xs text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const emptyForm = { name: '', game: '', specificGame: '', format: 'LEAGUE', status: 'ACTIVE', teamIds: [], startDate: '', endDate: '', prizeFirst: '', prizeSecond: '', prizeThird: '' }

const FORMAT_LIMITS = {
  LEAGUE:             { min: 4, max: 16 },
  SINGLE_ELIMINATION: { min: 4, max: 16 },
  DOUBLE_ELIMINATION: { min: 4, max: 8  },
  GROUP_STAGE:        { min: 4, max: 16 },
}

const STATUS_COLOR = { ACTIVE: 'green', FINISHED: 'gray', COMPLETED: 'gray', PENDING: 'cyan', UPCOMING: 'cyan' }

const GAME_STYLES = {
  FPS: { bg: 'linear-gradient(135deg, rgba(6,182,212,0.22) 0%, rgba(6,182,212,0.04) 100%)', accent: '#06B6D4', icon: Crosshair },
  MOBA: { bg: 'linear-gradient(135deg, rgba(139,92,246,0.22) 0%, rgba(139,92,246,0.04) 100%)', accent: '#8B5CF6', icon: Sword },
  EFOOTBALL: { bg: 'linear-gradient(135deg, rgba(34,197,94,0.22) 0%, rgba(34,197,94,0.04) 100%)', accent: '#22C55E', icon: Footprints },
  RACING: { bg: 'linear-gradient(135deg, rgba(245,158,11,0.22) 0%, rgba(245,158,11,0.04) 100%)', accent: '#F59E0B', icon: Car },
  BATTLE_ROYALE: { bg: 'linear-gradient(135deg, rgba(239,68,68,0.22) 0%, rgba(239,68,68,0.04) 100%)', accent: '#EF4444', icon: Skull },
  DEFAULT: { bg: 'linear-gradient(135deg, rgba(148,163,184,0.15) 0%, rgba(148,163,184,0.02) 100%)', accent: '#94A3B8', icon: Trophy },
}

function getStyle(game) {
  if (!game) return GAME_STYLES.DEFAULT
  const g = game.toUpperCase()
  if (g.includes('FPS')) return GAME_STYLES.FPS
  if (g.includes('MOBA')) return GAME_STYLES.MOBA
  if (g.includes('EFOOTBALL') || g.includes('FOOTBALL') || g.includes('FIFA')) return GAME_STYLES.EFOOTBALL
  if (g.includes('RACING')) return GAME_STYLES.RACING
  if (g.includes('BATTLE_ROYALE') || g.includes('BATTLE ROYALE') || g.includes('ROYALE')) return GAME_STYLES.BATTLE_ROYALE
  return GAME_STYLES.DEFAULT
}

function matchesGameFilter(game, filterKey) {
  if (filterKey === 'ALL') return true
  const g = (game || '').toUpperCase()
  if (filterKey === 'EFOOTBALL') return g.includes('EFOOTBALL') || g.includes('FOOTBALL') || g.includes('FIFA')
  if (filterKey === 'BATTLE_ROYALE') return g.includes('BATTLE_ROYALE') || g.includes('BATTLE ROYALE') || g.includes('ROYALE')
  return g.includes(filterKey)
}

function formatLabel(format) {
  switch (format) {
    case 'SINGLE_ELIMINATION': return 'Knockout'
    case 'DOUBLE_ELIMINATION': return 'Double Elim'
    case 'GROUP_STAGE': return 'Groups'
    case 'LEAGUE':
    default: return 'League'
  }
}

function TournamentCard({ tournament, onEdit, onDelete }) {
  const style = getStyle(tournament.game)
  const Icon = style.icon
  const teams = tournament.participatingTeams?.length ?? 0
  const matches = tournament.matches?.length ?? 0
  const isElim = tournament.format && tournament.format !== 'LEAGUE'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="glass-card overflow-hidden group flex flex-col">

      <div className="relative h-28 flex items-center justify-center overflow-hidden"
        style={{ background: style.bg, borderBottom: `1px solid ${style.accent}20` }}>
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: `radial-gradient(circle, ${style.accent} 1px, transparent 1px)`, backgroundSize: '18px 18px' }} />
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
          style={{ background: `${style.accent}1a`, border: `1px solid ${style.accent}30`, boxShadow: `0 0 28px ${style.accent}22` }}>
          <Icon size={28} style={{ color: style.accent }} />
        </div>
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
          <Badge variant={STATUS_COLOR[tournament.status] || 'gray'}>{tournament.status}</Badge>
          {isElim && <Badge variant="amber">{formatLabel(tournament.format)}</Badge>}
        </div>
        <div className="absolute top-2.5 left-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button onClick={onEdit}
            className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-accent-cyan bg-bg-base/90 border border-bg-border transition-colors cursor-pointer">
            <Edit2 size={11} />
          </button>
          <button onClick={onDelete}
            className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-red-400 bg-bg-base/90 border border-bg-border transition-colors cursor-pointer">
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      <Link to={`/tournaments/${tournament.id}`} className="flex flex-col flex-1 p-4 hover:bg-bg-primary/30 transition-colors duration-150">
        <h3 className="font-display text-sm text-text-primary font-semibold truncate mb-0.5">{tournament.name}</h3>
        <p className="font-body text-xs text-text-dim mb-3">
          {tournament.specificGame || tournament.game || '—'}
          {!isElim && <span className="text-text-dim/60"> · League</span>}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-3 font-body text-xs text-text-muted">
            <span>{teams} teams</span>
            <span>{matches} matches</span>
          </div>
          <span className="font-body text-xs font-semibold transition-colors duration-150" style={{ color: style.accent }}>
            Details →
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Tournaments() {
  const { gameFilter } = useGameFilter()
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [coaches, setCoaches] = useState([])
  const [loading, setLoad] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEdit] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [teamSearch, setTeamSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [formatFilter, setFormatFilter] = useState('ALL')
  const [gameDetailFilter, setGameDetailFilter] = useState('ALL')
  const toast = useToast()

  useEffect(() => {
    const handler = (e) => { if (!searchRef.current?.contains(e.target)) setSearchOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const load = async () => {
    setLoad(true)
    try {
      const [tRes, teRes, pRes, cRes] = await Promise.all([
        tournamentApi.getAll(), teamApi.getAll(), playerApi.getAll(), coachApi.getAll(),
      ])
      setTournaments(tRes.data || [])
      setTeams(teRes.data || [])
      setPlayers(pRes.data || [])
      setCoaches(cRes.data || [])
    } finally { setLoad(false) }
  }
  useEffect(() => { load() }, [])

  // Reset game-detail filter when modality changes
  useEffect(() => { setGameDetailFilter('ALL') }, [gameFilter])

  const teamToPlayers = useMemo(() => {
    const map = {}
    players.forEach(p => {
      if (p.team?.id) {
        if (!map[p.team.id]) map[p.team.id] = []
        map[p.team.id].push(p)
      }
    })
    return map
  }, [players])

  const teamToCoach = useMemo(() => {
    const map = {}
    coaches.forEach(c => { if (c.team?.id) map[c.team.id] = c })
    return map
  }, [coaches])

  // Available specific games for the current modality
  const availableGames = useMemo(() => {
    const games = new Set(
      tournaments
        .filter(t => matchesGameFilter(t.game, gameFilter))
        .map(t => t.specificGame)
        .filter(Boolean)
    )
    return [...games].sort()
  }, [tournaments, gameFilter])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return tournaments
      .filter(t => matchesGameFilter(t.game, gameFilter))
      .filter(t => {
        if (statusFilter === 'ALL') return true
        if (statusFilter === 'UPCOMING') return t.status === 'UPCOMING' || t.status === 'PENDING'
        if (statusFilter === 'COMPLETED') return t.status === 'COMPLETED' || t.status === 'FINISHED'
        return t.status === statusFilter
      })
      .filter(t => formatFilter === 'ALL' || t.format === formatFilter)
      .filter(t => gameDetailFilter === 'ALL' || t.specificGame === gameDetailFilter)
      .filter(t => {
        if (!q) return true
        if (t.name?.toLowerCase().includes(q)) return true
        if (t.specificGame?.toLowerCase().includes(q)) return true
        const teams = t.participatingTeams || []
        if (teams.some(team => team.name?.toLowerCase().includes(q))) return true
        if (teams.some(team =>
          (teamToPlayers[team.id] || []).some(p =>
            p.name?.toLowerCase().includes(q) || p.nickname?.toLowerCase().includes(q)
          )
        )) return true
        if (teams.some(team => teamToCoach[team.id]?.name?.toLowerCase().includes(q))) return true
        return false
      })
  }, [tournaments, gameFilter, statusFilter, formatFilter, gameDetailFilter, searchQuery, teamToPlayers, teamToCoach])

  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'COMPLETED', label: 'Completed' },
  ]

  const formatOptions = [
    { value: 'ALL', label: 'All Formats' },
    { value: 'LEAGUE', label: 'League' },
    { value: 'SINGLE_ELIMINATION', label: 'Knockout' },
    { value: 'DOUBLE_ELIMINATION', label: 'Double Elimination' },
  ]

  const gameDetailOptions = useMemo(() => [
    { value: 'ALL', label: 'All Games' },
    ...availableGames.map(g => ({ value: g, label: g })),
  ], [availableGames])

  const hasFilters = searchQuery || statusFilter !== 'ALL' || formatFilter !== 'ALL' || gameDetailFilter !== 'ALL'

  const openCreate = () => { setEdit(null); setForm(emptyForm); setTeamSearch(''); setModal(true) }
  const openEdit = (t) => {
    setEdit(t)
    setTeamSearch('')
    setForm({
      name: t.name || '', game: t.game || '', specificGame: t.specificGame || '',
      format: t.format || 'LEAGUE', status: t.status || 'ACTIVE',
      startDate: t.startDate || '', endDate: t.endDate || '',
      teamIds: (t.participatingTeams || []).map(te => te.id),
      prizeFirst: t.prizeFirst || '', prizeSecond: t.prizeSecond || '', prizeThird: t.prizeThird || '',
    })
    setModal(true)
  }

  const handleSave = async () => {
    if (validationError) return
    setSaving(true)
    try {
      const payload = {
        name: form.name, game: form.game, specificGame: form.specificGame,
        format: form.format, status: form.status,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        participatingTeams: form.teamIds.map(id => ({ id: Number(id) })),
        prizeFirst:  form.prizeFirst  || null,
        prizeSecond: form.prizeSecond || null,
        prizeThird:  form.prizeThird  || null,
      }
      if (editing) await tournamentApi.update(editing.id, payload)
      else await tournamentApi.create(payload)
      setModal(false)
      toast(editing ? 'Tournament updated.' : 'Tournament created successfully.', 'success')
      load()
    } catch (e) { toast(e?.response?.data?.message || 'Failed to save.', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete tournament?')) return
    try {
      await tournamentApi.delete(id)
      toast('Tournament deleted.', 'info')
      load()
    } catch (e) { toast(e?.response?.data?.message || 'Failed to delete.', 'error') }
  }

  const toggleTeam = (id) => {
    setForm(f => ({
      ...f,
      teamIds: f.teamIds.includes(id) ? f.teamIds.filter(x => x !== id) : [...f.teamIds, id],
    }))
  }

  // ── Date helpers ────────────────────────────────────────────────────────────
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const yesterdayStr = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0] }, [])
  const tomorrowStr  = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] }, [])

  const dateLimits = useMemo(() => {
    if (form.status === 'COMPLETED') return {
      startMin: undefined, startMax: form.endDate || yesterdayStr,
      endMin:   form.startDate || undefined, endMax: yesterdayStr,
    }
    if (form.status === 'UPCOMING') return {
      startMin: tomorrowStr, startMax: undefined,
      endMin:   form.startDate > tomorrowStr ? form.startDate : tomorrowStr, endMax: undefined,
    }
    // ACTIVE: started ≤ today, ends ≥ today
    return {
      startMin: undefined, startMax: todayStr,
      endMin:   todayStr,  endMax: undefined,
    }
  }, [form.status, form.startDate, form.endDate, todayStr, yesterdayStr, tomorrowStr])

  // When status changes, clear dates that would now be invalid
  const handleStatusChange = (newStatus) => {
    setForm(f => {
      let { startDate, endDate } = f
      if (newStatus === 'COMPLETED') {
        if (startDate >= todayStr) startDate = ''
        if (endDate  >= todayStr) endDate   = ''
      } else if (newStatus === 'UPCOMING') {
        if (startDate && startDate <= todayStr) startDate = ''
        if (endDate   && endDate   <= todayStr) endDate   = ''
      } else { // ACTIVE
        if (startDate && startDate > todayStr) startDate = ''
        if (endDate   && endDate   < todayStr) endDate   = ''
      }
      return { ...f, status: newStatus, startDate, endDate }
    })
  }

  // ── Form validation ──────────────────────────────────────────────────────────
  const validationError = useMemo(() => {
    if (!form.name.trim()) return 'Tournament name is required.'
    const duplicate = tournaments.some(t =>
      t.name.trim().toLowerCase() === form.name.trim().toLowerCase() && t.id !== editing?.id
    )
    if (duplicate) return `A tournament named "${form.name.trim()}" already exists.`

    const limits = FORMAT_LIMITS[form.format] || FORMAT_LIMITS.LEAGUE
    if (form.teamIds.length > 0 && form.teamIds.length < limits.min)
      return `${form.format === 'GROUP_STAGE' ? 'Group Stage' : form.format.replace('_', ' ').toLowerCase()} requires at least ${limits.min} teams (${form.teamIds.length} selected).`
    if (form.teamIds.length > limits.max)
      return `This format supports at most ${limits.max} teams (${form.teamIds.length} selected).`

    if (form.status === 'COMPLETED') {
      if (!form.endDate) return 'End date is required for completed tournaments.'
      if (form.endDate >= todayStr) return 'End date must be before today for completed tournaments.'
    }
    if (form.status === 'UPCOMING') {
      if (!form.startDate) return 'Start date is required for upcoming tournaments.'
      if (form.startDate <= todayStr) return 'Start date must be in the future for upcoming tournaments.'
    }
    if (form.status === 'ACTIVE') {
      if (!form.startDate || !form.endDate) return 'Both start and end dates are required for active tournaments.'
      if (form.startDate > todayStr) return 'An active tournament must have already started.'
      if (form.endDate < todayStr)   return 'An active tournament must not have ended yet.'
    }
    return null
  }, [form, tournaments, editing, todayStr])

  const eligibleTeams = useMemo(() => {
    if (!form.game) return teams
    const f = form.game.toUpperCase().replace(/[_\s]/g, '')
    return teams.filter(t => {
      const g = (t.game || '').toUpperCase().replace(/[_\s]/g, '')
      return g === f || g.includes(f) || f.includes(g)
    })
  }, [teams, form.game])

  const visibleModalTeams = useMemo(() => {
    if (!teamSearch.trim()) return eligibleTeams
    const q = teamSearch.toLowerCase()
    return eligibleTeams.filter(t => t.name.toLowerCase().includes(q))
  }, [eligibleTeams, teamSearch])

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length < 2) return null
    return {
      tournaments: tournaments.filter(t => t.name?.toLowerCase().includes(q) || t.specificGame?.toLowerCase().includes(q)).slice(0, 4),
      teams:       teams.filter(t => t.name?.toLowerCase().includes(q)).slice(0, 3),
      players:     players.filter(p => p.nickname?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q)).slice(0, 3),
      coaches:     coaches.filter(c => c.name?.toLowerCase().includes(q)).slice(0, 3),
    }
  }, [searchQuery, tournaments, teams, players, coaches])

  const hasSearchResults = searchResults && Object.values(searchResults).some(a => a.length > 0)

  const clearFilters = () => {
    setSearchQuery(''); setStatusFilter('ALL'); setFormatFilter('ALL'); setGameDetailFilter('ALL')
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tournaments"
        subtitle={`${filtered.length}${gameFilter !== 'ALL' ? ` ${gameFilter}` : ''} tournaments`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> New Tournament
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Combobox value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="All Statuses" style={{ width: 150 }} />
        <Combobox value={formatFilter} onChange={setFormatFilter} options={formatOptions} placeholder="All Formats" style={{ width: 160 }} />
        {availableGames.length > 1 && (
          <Combobox value={gameDetailFilter} onChange={setGameDetailFilter} options={gameDetailOptions} placeholder="All Games" style={{ width: 160 }} />
        )}
        <div ref={searchRef} className="relative flex-1 min-w-48">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-primary border border-bg-border focus-within:border-accent-green/40 transition-colors duration-150">
            <Search size={13} className="text-text-dim flex-shrink-0" />
            <input value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search tournament, team, player or coach..."
              className="bg-transparent font-body text-sm text-text-primary placeholder:text-text-dim outline-none flex-1 min-w-0" />
            {searchQuery && (
              <button onMouseDown={e => { e.preventDefault(); setSearchQuery(''); setSearchOpen(false) }} className="text-text-dim hover:text-text-muted transition-colors cursor-pointer">
                <X size={12} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {searchOpen && searchQuery.trim().length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(9,15,29,0.98)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(30,41,59,0.8)',
                  boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
                }}>
                <div className="py-1 max-h-72 overflow-y-auto">
                  {!hasSearchResults ? (
                    <p className="font-body text-xs text-text-dim text-center py-5">No results for "{searchQuery}"</p>
                  ) : (
                    <>
                      {searchResults.tournaments.length > 0 && (
                        <div>
                          <p className="px-3 pt-2 pb-1 font-body text-xs text-text-dim uppercase tracking-wider">Tournaments</p>
                          {searchResults.tournaments.map(t => (
                            <button key={t.id} onMouseDown={() => { navigate(`/tournaments/${t.id}`); setSearchOpen(false); setSearchQuery('') }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer text-left">
                              <Trophy size={12} className="text-text-dim flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-body text-sm text-text-primary font-medium truncate">{t.name}</p>
                                <p className="font-body text-xs text-text-dim truncate">{t.specificGame || t.game}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.teams.length > 0 && (
                        <div>
                          <p className="px-3 pt-2 pb-1 font-body text-xs text-text-dim uppercase tracking-wider">Teams</p>
                          {searchResults.teams.map(t => (
                            <button key={t.id} onMouseDown={() => { navigate(`/teams/${t.id}`); setSearchOpen(false); setSearchQuery('') }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer text-left">
                              <Shield size={12} className="text-text-dim flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-body text-sm text-text-primary font-medium truncate">{t.name}</p>
                                <p className="font-body text-xs text-text-dim truncate">{t.game} · {t.players?.length ?? 0} players</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.players.length > 0 && (
                        <div>
                          <p className="px-3 pt-2 pb-1 font-body text-xs text-text-dim uppercase tracking-wider">Players</p>
                          {searchResults.players.map(p => (
                            <button key={p.id} onMouseDown={() => { navigate(`/players/${p.id}`); setSearchOpen(false); setSearchQuery('') }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer text-left">
                              <Users size={12} className="text-text-dim flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-body text-sm text-text-primary font-medium truncate">{p.nickname}</p>
                                <p className="font-body text-xs text-text-dim truncate">{p.name || p.fullName} · {p.team?.name || 'Free agent'}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.coaches.length > 0 && (
                        <div>
                          <p className="px-3 pt-2 pb-1 font-body text-xs text-text-dim uppercase tracking-wider">Coaches</p>
                          {searchResults.coaches.map(c => (
                            <button key={c.id} onMouseDown={() => { navigate(`/coaches/${c.id}`); setSearchOpen(false); setSearchQuery('') }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer text-left">
                              <UserCheck size={12} className="text-text-dim flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-body text-sm text-text-primary font-medium truncate">{c.name}</p>
                                <p className="font-body text-xs text-text-dim truncate">{c.team?.name || 'Free agent'}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-body text-text-dim">No tournaments found.</p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost mt-4 inline-flex">Clear filters</button>
          )}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
          animate="animate">
          {filtered.map(t => (
            <TournamentCard key={t.id} tournament={t}
              onEdit={() => openEdit(t)}
              onDelete={() => handleDelete(t.id)} />
          ))}
        </motion.div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Tournament' : 'New Tournament'} width="max-w-xl">
        <div className="space-y-4">
          {/* Name + Game */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name">
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Summer Championship" />
            </Field>
            <Field label="Game / Modality">
              <select className="input-field" value={form.game} onChange={e => setForm(f => ({ ...f, game: e.target.value, teamIds: [] }))}>
                <option value="">Select modality</option>
                <option value="FPS">FPS</option>
                <option value="MOBA">MOBA</option>
                <option value="EFOOTBALL">eFootball</option>
                <option value="RACING">Racing</option>
                <option value="BATTLE_ROYALE">Battle Royale</option>
              </select>
            </Field>
          </div>

          {/* Specific game + Format */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Specific Game">
              <input className="input-field" value={form.specificGame} onChange={e => setForm(f => ({ ...f, specificGame: e.target.value }))} placeholder="Valorant, LoL, FIFA..." />
            </Field>
            <Field label="Format">
              <select className="input-field" value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>
                <option value="LEAGUE">League / Championship</option>
                <option value="SINGLE_ELIMINATION">Single Elimination (Knockout)</option>
                <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                <option value="GROUP_STAGE">Group Stage</option>
              </select>
            </Field>
          </div>

          {/* Status (before dates) */}
          <Field label="Status">
            <select className="input-field" value={form.status} onChange={e => handleStatusChange(e.target.value)}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </Field>

          {/* Dates — constrained by status */}
          <div className="grid grid-cols-2 gap-4">
            <Field label={
              form.status === 'UPCOMING' ? 'Start Date (future)' :
              form.status === 'ACTIVE'   ? 'Start Date (≤ today)' : 'Start Date'
            }>
              <input type="date" className="input-field"
                value={form.startDate}
                min={dateLimits.startMin}
                max={dateLimits.startMax}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </Field>
            <Field label={
              form.status === 'COMPLETED' ? 'End Date (before today)' :
              form.status === 'ACTIVE'    ? 'End Date (≥ today)' : 'End Date'
            }>
              <input type="date" className="input-field"
                value={form.endDate}
                min={dateLimits.endMin}
                max={dateLimits.endMax}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </Field>
          </div>

          {/* Prizes */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="1st Prize">
              <input className="input-field" value={form.prizeFirst}
                onChange={e => setForm(f => ({ ...f, prizeFirst: e.target.value }))}
                placeholder="€10,000" />
            </Field>
            <Field label="2nd Prize">
              <input className="input-field" value={form.prizeSecond}
                onChange={e => setForm(f => ({ ...f, prizeSecond: e.target.value }))}
                placeholder="€5,000" />
            </Field>
            <Field label="3rd Prize">
              <input className="input-field" value={form.prizeThird}
                onChange={e => setForm(f => ({ ...f, prizeThird: e.target.value }))}
                placeholder="€2,000" />
            </Field>
          </div>

          {/* Teams */}
          {(() => {
            const limits = FORMAT_LIMITS[form.format] || FORMAT_LIMITS.LEAGUE
            const count  = form.teamIds.length
            const atMax  = count >= limits.max
            const ok     = count >= limits.min
            const labelColor = count > 0 && !ok ? 'text-red-400' : atMax ? 'text-accent-green' : 'text-text-muted'
            return (
              <Field label={
                <span className="flex items-center gap-2">
                  <span>Participating Teams</span>
                  <span className={`font-body text-xs normal-case tracking-normal ${labelColor}`}>
                    {count}/{limits.max} · min {limits.min}
                  </span>
                </span>
              }>
                <div className="flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-lg bg-bg-base border border-bg-border focus-within:border-accent-green/30 transition-colors">
                  <Search size={12} className="text-text-dim flex-shrink-0" />
                  <input value={teamSearch} onChange={e => setTeamSearch(e.target.value)}
                    placeholder={form.game ? 'Search teams...' : 'Select a modality first'}
                    disabled={!form.game}
                    className="bg-transparent font-body text-xs text-text-primary placeholder:text-text-dim outline-none flex-1" />
                  {teamSearch && <button onMouseDown={e => { e.preventDefault(); setTeamSearch('') }} className="text-text-dim hover:text-text-muted cursor-pointer"><X size={10} /></button>}
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {visibleModalTeams.length === 0 ? (
                    <p className="col-span-2 text-center font-body text-xs text-text-dim py-3">
                      {!form.game ? 'Select a modality to see eligible teams.' : 'No teams found.'}
                    </p>
                  ) : visibleModalTeams.map(t => {
                    const selected = form.teamIds.includes(t.id)
                    const disabled = !selected && atMax
                    return (
                      <button key={t.id} onClick={() => !disabled && toggleTeam(t.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all duration-150 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${selected
                          ? 'border-accent-green/40 bg-accent-green/10 text-text-primary'
                          : 'border-bg-border text-text-muted hover:border-text-dim'
                        }`}>
                        <Shield size={12} className={selected ? 'text-accent-green' : 'text-text-dim'} />
                        <span className="font-body text-xs truncate">{t.name}</span>
                      </button>
                    )
                  })}
                </div>
              </Field>
            )
          })()}

          {/* Validation error */}
          {validationError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <span className="font-body text-xs text-red-400">{validationError}</span>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <button onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button onClick={handleSave} disabled={saving || !!validationError} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Saving...' : editing ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
