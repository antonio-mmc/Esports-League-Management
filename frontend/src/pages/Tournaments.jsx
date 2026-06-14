import { useEffect, useState, useMemo, useRef } from 'react'
import { Plus, Trash2, Edit2, Trophy, Shield, Crosshair, Sword, Footprints, Car, Skull, Search, X, Users, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useT } from '../context/LanguageContext'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Combobox from '../components/Combobox'
import Pagination from '../components/Pagination'
import { useToast } from '../components/Toast'
import { useGameFilter } from '../context/GameFilterContext'
import { tournamentApi, teamApi, playerApi, coachApi } from '../services/api'
import { matchesGameFilter, STATUS_COLOR } from '../utils/gameMeta'

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-body text-xs text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const emptyForm = { name: '', game: '', specificGame: '', format: 'LEAGUE', teamIds: [], startDate: '', endDate: '', prizeFirst: '', prizeSecond: '', prizeThird: '' }

const FORMAT_LIMITS = {
  LEAGUE:             { min: 4, max: 16 },
  SINGLE_ELIMINATION: { min: 4, max: 16 },
  DOUBLE_ELIMINATION: { min: 4, max: 8  },
  GROUP_STAGE:        { min: 4, max: 16 },
}

const FORMAT_LABEL = {
  LEAGUE: 'League', SINGLE_ELIMINATION: 'Single Elimination',
  DOUBLE_ELIMINATION: 'Double Elimination', GROUP_STAGE: 'Group Stage',
}

const GAME_STYLES = {
  FPS: { bg: 'linear-gradient(135deg, rgba(6,182,212,0.22) 0%, rgba(6,182,212,0.04) 100%)', accent: '#06B6D4', icon: Crosshair },
  MOBA: { bg: 'linear-gradient(135deg, rgba(139,92,246,0.22) 0%, rgba(139,92,246,0.04) 100%)', accent: '#8B5CF6', icon: Sword },
  EFOOTBALL: { bg: 'linear-gradient(135deg, rgba(34,197,94,0.22) 0%, rgba(34,197,94,0.04) 100%)', accent: '#22C55E', icon: Footprints },
  RACING: { bg: 'linear-gradient(135deg, rgba(245,158,11,0.22) 0%, rgba(245,158,11,0.04) 100%)', accent: '#F59E0B', icon: Car },
  BATTLE_ROYALE: { bg: 'linear-gradient(135deg, rgba(239,68,68,0.22) 0%, rgba(239,68,68,0.04) 100%)', accent: '#EF4444', icon: Skull },
  DEFAULT: { bg: 'linear-gradient(135deg, rgba(148,163,184,0.15) 0%, rgba(148,163,184,0.02) 100%)', accent: '#94A3B8', icon: Trophy },
}

const gridItem = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 26 } },
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
      variants={gridItem}
      className="glass-card overflow-hidden group relative flex flex-col
                 transition-[border-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                 hover:-translate-y-0.5"
      onMouseEnter={e => (e.currentTarget.style.borderColor = `${style.accent}55`)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '')}>

      {/* Broadcast accent rule */}
      <span className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: style.accent }} />

      {/* Hover edit/delete */}
      <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button onClick={onEdit}
          className="w-6 h-6 rounded-sm flex items-center justify-center text-text-muted hover:text-accent-cyan bg-bg-base/90 border border-bg-border transition-colors cursor-pointer">
          <Edit2 size={11} />
        </button>
        <button onClick={onDelete}
          className="w-6 h-6 rounded-sm flex items-center justify-center text-text-muted hover:text-red-400 bg-bg-base/90 border border-bg-border transition-colors cursor-pointer">
          <Trash2 size={11} />
        </button>
      </div>

      <Link to={`/tournaments/${tournament.id}`} className="flex flex-col flex-1 p-4 pt-5 hover:bg-bg-primary/40 transition-colors duration-150">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0"
            style={{ background: `${style.accent}14`, border: `1px solid ${style.accent}33` }}>
            <Icon size={17} style={{ color: style.accent }} />
          </div>
          <div className="flex flex-col items-end gap-1 group-hover:opacity-0 transition-opacity duration-150">
            <Badge variant={STATUS_COLOR[tournament.status] || 'gray'}>{tournament.status}</Badge>
            {isElim && <Badge variant="amber">{formatLabel(tournament.format)}</Badge>}
          </div>
        </div>

        <p className="eyebrow mb-1.5" style={{ color: `${style.accent}` }}>
          {tournament.specificGame || tournament.game || '—'}{!isElim && ' · League'}
        </p>
        <h3 className="font-display font-bold text-[15px] leading-tight text-text-primary mb-4 line-clamp-2 min-h-[2.4em]">{tournament.name}</h3>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-bg-border">
          <div className="flex gap-3 font-mono text-[11px] text-text-muted tabular">
            <span><span className="text-text-primary">{teams}</span> teams</span>
            <span><span className="text-text-primary">{matches}</span> matches</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-dim group-hover:text-text-primary transition-colors duration-150">
            Details →
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Tournaments() {
  const { t } = useT()
  const { gameFilter } = useGameFilter()
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
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 8
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
  // Intentional one-time fetch on mount; the loading flag set inside load() is expected.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  // Reset game-detail filter when modality changes (adjust during render).
  const [prevGameFilter, setPrevGameFilter] = useState(gameFilter)
  if (gameFilter !== prevGameFilter) {
    setPrevGameFilter(gameFilter)
    setGameDetailFilter('ALL')
  }

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
    { value: 'ALL', label: t('tour.allStatuses') },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'COMPLETED', label: 'Completed' },
  ]

  const formatOptions = [
    { value: 'ALL', label: t('tour.allFormats') },
    { value: 'LEAGUE', label: 'League' },
    { value: 'SINGLE_ELIMINATION', label: 'Knockout' },
    { value: 'DOUBLE_ELIMINATION', label: 'Double Elimination' },
  ]

  const gameDetailOptions = useMemo(() => [
    { value: 'ALL', label: t('common.allGames') },
    ...availableGames.map(g => ({ value: g, label: g })),
  ], [availableGames])

  const hasFilters = searchQuery || statusFilter !== 'ALL' || formatFilter !== 'ALL' || gameDetailFilter !== 'ALL'

  // Reset to the first page whenever the result set changes (adjust during render,
  // mirroring the game-detail reset above — keeps the page index in range without an effect).
  const filterSig = `${gameFilter}|${searchQuery}|${statusFilter}|${formatFilter}|${gameDetailFilter}`
  const [prevFilterSig, setPrevFilterSig] = useState(filterSig)
  if (filterSig !== prevFilterSig) {
    setPrevFilterSig(filterSig)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const openCreate = () => { setEdit(null); setForm(emptyForm); setTeamSearch(''); setModal(true) }
  const openEdit = (t) => {
    setEdit(t)
    setTeamSearch('')
    setForm({
      name: t.name || '', game: t.game || '', specificGame: t.specificGame || '',
      format: t.format || 'LEAGUE',
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
        format: form.format,
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
      toast(editing ? t('tour.updated') : t('tour.created'), 'success')
      load()
    } catch (e) { toast(e?.response?.data?.error || e?.response?.data?.message || t('tour.saveFail'), 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm(t('tour.confirmDelete'))) return
    try {
      await tournamentApi.delete(id)
      toast(t('tour.deleted'), 'info')
      load()
    } catch (e) { toast(e?.response?.data?.error || e?.response?.data?.message || t('tour.deleteFail'), 'error') }
  }

  const toggleTeam = (id) => {
    setForm(f => ({
      ...f,
      teamIds: f.teamIds.includes(id) ? f.teamIds.filter(x => x !== id) : [...f.teamIds, id],
    }))
  }

  // ── Date helpers ────────────────────────────────────────────────────────────
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  // Status is no longer chosen by hand — it's derived from the dates, mirroring the
  // backend (UPCOMING before the start, COMPLETED after the end, ACTIVE in between).
  const derivedStatus = useMemo(() => {
    if (form.startDate && todayStr < form.startDate) return 'UPCOMING'
    if (form.endDate   && todayStr > form.endDate)   return 'COMPLETED'
    return 'ACTIVE'
  }, [form.startDate, form.endDate, todayStr])

  // ── Form validation ──────────────────────────────────────────────────────────
  // Plain computation (cheap, runs per render) — no useMemo so the React Compiler
  // has nothing to "preserve" and the form always validates against current state.
  const validationError = (() => {
    if (!form.name.trim()) return t('tour.nameRequired')
    const duplicate = tournaments.some(tt =>
      tt.name.trim().toLowerCase() === form.name.trim().toLowerCase() && tt.id !== editing?.id
    )
    if (duplicate) return t('tour.duplicate', { name: form.name.trim() })

    const limits = FORMAT_LIMITS[form.format] || FORMAT_LIMITS.LEAGUE
    if (form.teamIds.length > 0 && form.teamIds.length < limits.min)
      return t('tour.minTeams', { format: FORMAT_LABEL[form.format] || form.format, min: limits.min, n: form.teamIds.length })
    if (form.teamIds.length > limits.max)
      return t('tour.maxTeams', { max: limits.max, n: form.teamIds.length })

    if (form.startDate && form.endDate && form.endDate < form.startDate)
      return t('tour.dateOrder')
    return null
  })()

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
        title={t('nav.tournaments')}
        subtitle={t('page.tournamentsSub', { n: filtered.length })}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> {t('page.newTournament')}
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Combobox value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder={t('tour.allStatuses')} style={{ width: 150 }} />
        <Combobox value={formatFilter} onChange={setFormatFilter} options={formatOptions} placeholder={t('tour.allFormats')} style={{ width: 160 }} />
        {availableGames.length > 1 && (
          <Combobox value={gameDetailFilter} onChange={setGameDetailFilter} options={gameDetailOptions} placeholder={t('common.allGames')} style={{ width: 160 }} />
        )}
        <div ref={searchRef} className="relative flex-1 min-w-48">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-primary border border-bg-border focus-within:border-accent-green/40 transition-colors duration-150">
            <Search size={13} className="text-text-dim flex-shrink-0" />
            <input value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder={t('mt.searchPlaceholder')}
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
                className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded overflow-hidden"
                style={{
                  background: 'rgb(var(--bg-elevated))',
                  border: '1px solid rgb(var(--bg-border))',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
                }}>
                <div className="py-1 max-h-72 overflow-y-auto">
                  {!hasSearchResults ? (
                    <p className="font-body text-xs text-text-dim text-center py-5">{t('mt.noResultsFor', { q: searchQuery })}</p>
                  ) : (
                    <>
                      {searchResults.tournaments.length > 0 && (
                        <div>
                          <p className="px-3 pt-2 pb-1 font-body text-xs text-text-dim uppercase tracking-wider">{t('nav.tournaments')}</p>
                          {searchResults.tournaments.map(t => (
                            <button key={t.id} onMouseDown={() => { setSearchQuery(t.name); setSearchOpen(false) }}
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
                          <p className="px-3 pt-2 pb-1 font-body text-xs text-text-dim uppercase tracking-wider">{t('nav.teams')}</p>
                          {searchResults.teams.map(tm => (
                            <button key={tm.id} onMouseDown={() => { setSearchQuery(tm.name); setSearchOpen(false) }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer text-left">
                              <Shield size={12} className="text-text-dim flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-body text-sm text-text-primary font-medium truncate">{tm.name}</p>
                                <p className="font-body text-xs text-text-dim truncate">{tm.game} · {tm.players?.length ?? 0} {t('common.players')}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.players.length > 0 && (
                        <div>
                          <p className="px-3 pt-2 pb-1 font-body text-xs text-text-dim uppercase tracking-wider">{t('nav.players')}</p>
                          {searchResults.players.map(p => (
                            <button key={p.id} onMouseDown={() => { setSearchQuery(p.nickname); setSearchOpen(false) }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer text-left">
                              <Users size={12} className="text-text-dim flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-body text-sm text-text-primary font-medium truncate">{p.nickname}</p>
                                <p className="font-body text-xs text-text-dim truncate">{p.name || p.fullName} · {p.team?.name || t('dash.freeAgent')}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.coaches.length > 0 && (
                        <div>
                          <p className="px-3 pt-2 pb-1 font-body text-xs text-text-dim uppercase tracking-wider">{t('nav.coaches')}</p>
                          {searchResults.coaches.map(c => (
                            <button key={c.id} onMouseDown={() => { setSearchQuery(c.name); setSearchOpen(false) }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer text-left">
                              <UserCheck size={12} className="text-text-dim flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-body text-sm text-text-primary font-medium truncate">{c.name}</p>
                                <p className="font-body text-xs text-text-dim truncate">{c.team?.name || t('dash.freeAgent')}</p>
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
          <p className="font-body text-text-dim">{t('tour.none')}</p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost mt-4 inline-flex">{t('common.clearFilters')}</button>
          )}
        </div>
      ) : (
        <>
          <motion.div
            key={safePage}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            initial="hidden" animate="show">
            {paged.map(t => (
              <TournamentCard key={t.id} tournament={t}
                onEdit={() => openEdit(t)}
                onDelete={() => handleDelete(t.id)} />
            ))}
          </motion.div>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            className="mt-6 pt-4 border-t border-bg-border"
          />
        </>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t('tour.edit') : t('tour.new')} width="max-w-xl">
        <div className="space-y-4">
          {/* Name + Game */}
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('col.name')}>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Summer Championship" />
            </Field>
            <Field label={t('col.mode')}>
              <select className="input-field" value={form.game} onChange={e => setForm(f => ({ ...f, game: e.target.value, teamIds: [] }))}>
                <option value="">{t('ui.select')}</option>
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
            <Field label={t('col.game')}>
              <input className="input-field" value={form.specificGame} onChange={e => setForm(f => ({ ...f, specificGame: e.target.value }))} placeholder="Valorant, LoL, FIFA..." />
            </Field>
            <Field label={t('col.format')}>
              <select className="input-field" value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>
                <option value="LEAGUE">League / Championship</option>
                <option value="SINGLE_ELIMINATION">Single Elimination (Knockout)</option>
                <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                <option value="GROUP_STAGE">Group Stage</option>
              </select>
            </Field>
          </div>

          {/* Dates — the status is derived from them automatically */}
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('tour.startDate')}>
              <input type="date" className="input-field"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </Field>
            <Field label={t('tour.endDate')}>
              <input type="date" className="input-field"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </Field>
          </div>

          {/* Derived status — read-only, follows the dates */}
          <Field label={t('tour.statusAuto')}>
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_COLOR[derivedStatus] || 'gray'}>{derivedStatus}</Badge>
              <span className="font-body text-xs text-text-dim">{t('tour.statusHint')}</span>
            </div>
          </Field>

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
                  <span>{t('tour.participants')}</span>
                  <span className={`font-body text-xs normal-case tracking-normal ${labelColor}`}>
                    {count}/{limits.max} · min {limits.min}
                  </span>
                </span>
              }>
                <div className="flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-lg bg-bg-base border border-bg-border focus-within:border-accent-green/30 transition-colors">
                  <Search size={12} className="text-text-dim flex-shrink-0" />
                  <input value={teamSearch} onChange={e => setTeamSearch(e.target.value)}
                    placeholder={form.game ? t('teams.searchTeam') : t('ui.selectModeFirst')}
                    disabled={!form.game}
                    className="bg-transparent font-body text-xs text-text-primary placeholder:text-text-dim outline-none flex-1" />
                  {teamSearch && <button onMouseDown={e => { e.preventDefault(); setTeamSearch('') }} className="text-text-dim hover:text-text-muted cursor-pointer"><X size={10} /></button>}
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {visibleModalTeams.length === 0 ? (
                    <p className="col-span-2 text-center font-body text-xs text-text-dim py-3">
                      {!form.game ? t('ui.selectModeFirst') : t('teams.none')}
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
            <button onClick={() => setModal(false)} className="btn-ghost">{t('common.cancel')}</button>
            <button onClick={handleSave} disabled={saving || !!validationError} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? t('common.saving') : editing ? t('common.save') : t('common.create')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
