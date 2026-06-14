import { useEffect, useState, useMemo, useRef } from 'react'
import { Plus, Trash2, Swords, CheckCircle, Edit2, Search, X, Trophy, Shield, Users, UserCheck, ChevronRight } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../components/Toast'
import { useT } from '../context/LanguageContext'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Combobox from '../components/Combobox'
import { useGameFilter } from '../context/GameFilterContext'
import { matchApi, teamApi, tournamentApi, playerApi, coachApi } from '../services/api'
import { matchesGameFilter } from '../utils/gameMeta'

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-body text-xs text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const emptyForm   = { mode: '', teamAId: '', teamBId: '', date: '', tournamentId: '' }
const emptyResult = { scoreA: 0, scoreB: 0 }

const MODE_OPTIONS = [
  { value: 'FPS',           label: 'FPS' },
  { value: 'MOBA',          label: 'MOBA' },
  { value: 'EFOOTBALL',     label: 'eFootball' },
  { value: 'RACING',        label: 'Racing' },
  { value: 'BATTLE_ROYALE', label: 'Battle Royale' },
]

const matchGame = (m) => m.teamA?.game || m.teamB?.game || m.tournament?.game || ''

export default function Matches() {
  const { t } = useT()
  const { gameFilter } = useGameFilter()
  const navigate = useNavigate()
  const [matches, setMatches]         = useState([])
  const [teams, setTeams]             = useState([])
  const [tournaments, setTournaments] = useState([])
  const [players, setPlayers]         = useState([])
  const [coaches, setCoaches]         = useState([])
  const [loading, setLoad]            = useState(true)
  const [modal, setModal]             = useState(false)
  const [resultModal, setResultModal] = useState(false)
  const [selectedMatch, setSelected]  = useState(null)
  const [form, setForm]               = useState(emptyForm)
  const [result, setResult]           = useState(emptyResult)
  const [saving, setSaving]           = useState(false)
  // filters
  const [statusFilter, setStatusFilter]         = useState('ALL')
  const [tournamentFilter, setTournamentFilter] = useState('ALL')
  const [searchQuery, setSearchQuery]           = useState('')
  const [searchOpen, setSearchOpen]             = useState(false)
  const [sortKey, setSortKey]                   = useState('date')
  const [sortDir, setSortDir]                   = useState('desc')
  const searchRef = useRef(null)
  const toast = useToast()

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'date' || key === 'teamAScore' ? 'desc' : 'asc')
    }
  }

  useEffect(() => {
    const handler = (e) => { if (!searchRef.current?.contains(e.target)) setSearchOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const load = async () => {
    setLoad(true)
    try {
      const [mRes, tRes, trRes, pRes, cRes] = await Promise.all([
        matchApi.getAll(), teamApi.getAll(), tournamentApi.getAll(), playerApi.getAll(), coachApi.getAll(),
      ])
      setMatches(mRes.data || [])
      setTeams(tRes.data || [])
      setTournaments(trRes.data || [])
      setPlayers(pRes.data || [])
      setCoaches(cRes.data || [])
    } finally { setLoad(false) }
  }
  // Intentional one-time fetch on mount; the loading flag set inside load() is expected.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

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

  // Tournaments that actually have matches in the current modality
  const tournamentOptions = useMemo(() => {
    const present = new Map()
    matches
      .filter(m => matchesGameFilter(matchGame(m), gameFilter))
      .forEach(m => { if (m.tournament?.id) present.set(m.tournament.id, m.tournament.name) })
    return [
      { value: 'ALL', label: 'All Tournaments' },
      ...[...present.entries()].sort((a, b) => a[1].localeCompare(b[1])).map(([id, name]) => ({ value: String(id), label: name })),
    ]
  }, [matches, gameFilter])

  // Reset tournament filter if it no longer applies to the current modality (adjust during render).
  if (tournamentFilter !== 'ALL' && !tournamentOptions.some(o => o.value === tournamentFilter)) {
    setTournamentFilter('ALL')
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const list = matches
      .filter(m => matchesGameFilter(matchGame(m), gameFilter))
      .filter(m => {
        if (statusFilter === 'PLAYED')  return m.resultRecorded
        if (statusFilter === 'PENDING') return !m.resultRecorded
        return true
      })
      .filter(m => tournamentFilter === 'ALL' || String(m.tournament?.id) === tournamentFilter)
      .filter(m => {
        if (!q) return true
        if (m.teamA?.name?.toLowerCase().includes(q)) return true
        if (m.teamB?.name?.toLowerCase().includes(q)) return true
        if (m.tournament?.name?.toLowerCase().includes(q)) return true
        const roster = [
          ...(teamToPlayers[m.teamA?.id] || []),
          ...(teamToPlayers[m.teamB?.id] || []),
        ]
        if (roster.some(p => p.nickname?.toLowerCase().includes(q) || p.fullName?.toLowerCase().includes(q))) return true
        if ([teamToCoach[m.teamA?.id], teamToCoach[m.teamB?.id]].some(c => c?.name?.toLowerCase().includes(q))) return true
        return false
      })

    const getVal = (m) => {
      switch (sortKey) {
        case 'teamA':          return m.teamA?.name?.toLowerCase() || ''
        case 'teamB':          return m.teamB?.name?.toLowerCase() || ''
        case 'tournament':     return m.tournament?.name?.toLowerCase() || ''
        case 'teamAScore':     return m.resultRecorded ? (m.teamAScore + m.teamBScore) : -1
        case 'resultRecorded': return m.resultRecorded ? 1 : 0
        case 'date':
        default:               return new Date(m.date).getTime() || 0
      }
    }

    return [...list].sort((a, b) => {
      const va = getVal(a), vb = getVal(b)
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : (va < vb ? -1 : va > vb ? 1 : 0)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [matches, gameFilter, statusFilter, tournamentFilter, searchQuery, teamToPlayers, teamToCoach, sortKey, sortDir])

  const statusOptions = [
    { value: 'ALL',     label: t('common.allStatus') },
    { value: 'PLAYED',  label: t('mt.played') },
    { value: 'PENDING', label: t('mt.pending') },
  ]

  const hasFilters = searchQuery || statusFilter !== 'ALL' || tournamentFilter !== 'ALL'
  const clearFilters = () => { setSearchQuery(''); setStatusFilter('ALL'); setTournamentFilter('ALL') }

  // ── Live search dropdown ──────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length < 2) return null
    return {
      teams:       teams.filter(t => t.name?.toLowerCase().includes(q)).slice(0, 3),
      tournaments: tournaments.filter(t => t.name?.toLowerCase().includes(q) || t.specificGame?.toLowerCase().includes(q)).slice(0, 3),
      players:     players.filter(p => p.nickname?.toLowerCase().includes(q) || p.fullName?.toLowerCase().includes(q)).slice(0, 3),
      coaches:     coaches.filter(c => c.name?.toLowerCase().includes(q)).slice(0, 3),
    }
  }, [searchQuery, teams, tournaments, players, coaches])
  const hasSearchResults = searchResults && Object.values(searchResults).some(a => a.length > 0)

  const openCreate = () => {
    setForm({ ...emptyForm, mode: gameFilter !== 'ALL' ? gameFilter : '' })
    setModal(true)
  }

  // When the mode changes, clear the dependent selections
  const setMode = (mode) => setForm(f => ({ ...f, mode, teamAId: '', teamBId: '', tournamentId: '' }))
  // Picking a tournament resets the team choices (they're scoped to its participants)
  const setTournament = (tournamentId) => setForm(f => ({ ...f, tournamentId, teamAId: '', teamBId: '' }))

  // Tournaments narrowed to the chosen modality
  const eligibleTournaments = useMemo(
    () => form.mode ? tournaments.filter(t => matchesGameFilter(t.game, form.mode)) : [],
    [tournaments, form.mode])
  // Teams are limited to the selected tournament's participants — a match can only be
  // scheduled between teams that take part in it (mirrors the backend rule).
  const selectedTournament = useMemo(
    () => tournaments.find(t => String(t.id) === String(form.tournamentId)),
    [tournaments, form.tournamentId])
  const eligibleTeams = useMemo(
    () => selectedTournament?.participatingTeams || [],
    [selectedTournament])

  const openResult = (m) => {
    setSelected(m)
    setResult({ scoreA: m.teamAScore || 0, scoreB: m.teamBScore || 0 })
    setResultModal(true)
  }

  const handleSchedule = async () => {
    if (!form.teamAId || !form.teamBId || !form.date || !form.tournamentId) {
      toast(t('ui.required'), 'error')
      return
    }
    setSaving(true)
    try {
      await matchApi.schedule({
        teamAId:      Number(form.teamAId),
        teamBId:      Number(form.teamBId),
        tournamentId: Number(form.tournamentId),
        date:         form.date,
      })
      setModal(false)
      toast(t('mt.scheduled'), 'success')
      load()
    } catch (e) { toast(e?.response?.data?.error || e?.response?.data?.message || t('mt.scheduleFail'), 'error') }
    finally { setSaving(false) }
  }

  const handleResult = async () => {
    if (Number(result.scoreA) === Number(result.scoreB)) {
      toast(t('mt.draw'), 'error')
      return
    }
    setSaving(true)
    try {
      const wasRecorded = selectedMatch.resultRecorded
      await matchApi.recordResult(selectedMatch.id, Number(result.scoreA), Number(result.scoreB))
      setResultModal(false)
      toast(wasRecorded ? t('mt.resultUpdated') : t('mt.resultRecorded'), 'success')
      load()
    } catch (e) { toast(e?.response?.data?.error || e?.response?.data?.message || t('mt.resultFail'), 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm(t('mt.confirmDelete'))) return
    try {
      await matchApi.delete(id)
      toast(t('mt.deleted'), 'info')
      load()
    } catch(e) { toast(e?.response?.data?.error || e?.response?.data?.message || t('ui.deleteFailed'), 'error') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const getWinner = (m) => {
    if (!m.resultRecorded) return null
    return m.teamAScore > m.teamBScore ? m.teamA?.name : m.teamB?.name
  }

  const columns = [
    { key: 'teamA', label: t('col.teamA'), sortable: true, render: v => (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
          <Swords size={11} className="text-accent-blue" />
        </div>
        <span className="font-semibold">{v?.name || '—'}</span>
      </div>
    )},
    { key: 'teamB',   label: t('col.teamB'), sortable: true, render: v => <span>{v?.name || '—'}</span> },
    { key: 'date',    label: t('col.date'),   sortable: true, render: v => v || '—' },
    { key: 'teamAScore', label: t('col.score'), sortable: true, render: (v, r) =>
      r.resultRecorded
        ? <span className="font-display text-sm text-text-primary">{r.teamAScore} <span className="text-text-dim">:</span> {r.teamBScore}</span>
        : <span className="text-text-dim">—</span>
    },
    { key: 'resultRecorded', label: t('col.result'), sortable: true, render: (v, r) => {
      if (!v) return <Badge variant="gray">{t('mt.pending')}</Badge>
      return <Badge variant="green">{t('mt.won', { name: getWinner(r) })}</Badge>
    }},
    { key: 'tournament', label: t('col.tournament'), sortable: true, render: v => v?.name || <span className="text-text-dim">—</span> },
    { key: '_actions', label: '', render: (_, r) => (
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        <Link to={`/matches/${r.id}`}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-primary transition-all duration-150 cursor-pointer"
          title={t('ui.viewDetails')}>
          <ChevronRight size={13} />
        </Link>
        <button onClick={() => openResult(r)}
          title={r.resultRecorded ? t('mt.editAction') : t('mt.recordAction')}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-accent-green hover:bg-accent-green/10 transition-all duration-150 cursor-pointer">
          {r.resultRecorded ? <Edit2 size={13} /> : <CheckCircle size={13} />}
        </button>
        <button onClick={() => handleDelete(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 cursor-pointer">
          <Trash2 size={13} />
        </button>
      </div>
    )},
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.matches')}
        subtitle={t('page.matchesSub', { n: filtered.length })}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> {t('page.scheduleMatch')}
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Combobox value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder={t('common.allStatus')} style={{ width: 150 }} />
        {tournamentOptions.length > 1 && (
          <Combobox value={tournamentFilter} onChange={setTournamentFilter} options={tournamentOptions} placeholder={t('common.allTournaments')} style={{ width: 220 }} />
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
                      {searchResults.teams.length > 0 && (
                        <div>
                          <p className="px-3 pt-2 pb-1 font-body text-xs text-text-dim uppercase tracking-wider">{t('nav.teams')}</p>
                          {searchResults.teams.map(t => (
                            <button key={t.id} onMouseDown={() => { setSearchQuery(t.name); setSearchOpen(false) }}
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
                      {searchResults.players.length > 0 && (
                        <div>
                          <p className="px-3 pt-2 pb-1 font-body text-xs text-text-dim uppercase tracking-wider">{t('nav.players')}</p>
                          {searchResults.players.map(p => (
                            <button key={p.id} onMouseDown={() => { setSearchQuery(p.nickname); setSearchOpen(false) }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer text-left">
                              <Users size={12} className="text-text-dim flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-body text-sm text-text-primary font-medium truncate">{p.nickname}</p>
                                <p className="font-body text-xs text-text-dim truncate">{p.fullName} · {p.team?.name || t('dash.freeAgent')}</p>
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

      {!loading && filtered.length === 0 ? (
        <div className="text-center py-24 glass-card">
          <p className="font-body text-text-dim">{t('mt.none')}</p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost mt-4 inline-flex">{t('common.clearFilters')}</button>
          )}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} loading={loading}
          onRowClick={(m) => navigate(`/matches/${m.id}`)}
          sortKey={sortKey} sortDir={sortDir} onSort={handleSort}
          emptyMessage={t('mt.none')} />
      )}

      {/* Schedule modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={t('mt.schedule')} width="max-w-xl">
        <div className="space-y-4">
          <Field label={`${t('mt.modeModality')} *`}>
            <select className="input-field" value={form.mode} onChange={e => setMode(e.target.value)}>
              <option value="">{t('ui.select')}</option>
              {MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={`${t('col.tournament')} *`}>
              <select className="input-field" value={form.tournamentId} disabled={!form.mode} onChange={e => setTournament(e.target.value)}>
                <option value="">{form.mode ? (eligibleTournaments.length ? t('ui.select') : t('ui.noTeamsForMode')) : t('ui.selectModeFirst')}</option>
                {eligibleTournaments.map(tt => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
              </select>
            </Field>
            <Field label={`${t('col.date')} *`}>
              <input type="date" className="input-field" value={form.date} onChange={e => set('date', e.target.value)} />
            </Field>
            <Field label={`${t('col.teamA')} *`}>
              <select className="input-field" value={form.teamAId} disabled={!form.tournamentId} onChange={e => set('teamAId', e.target.value)}>
                <option value="">{form.tournamentId ? (eligibleTeams.length ? t('ui.select') : t('ui.noParticipants')) : t('ui.selectTournamentFirst')}</option>
                {eligibleTeams.filter(tt => String(tt.id) !== form.teamBId).map(tt => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
              </select>
            </Field>
            <Field label={`${t('col.teamB')} *`}>
              <select className="input-field" value={form.teamBId} disabled={!form.tournamentId} onChange={e => set('teamBId', e.target.value)}>
                <option value="">{form.tournamentId ? (eligibleTeams.length ? t('ui.select') : t('ui.noParticipants')) : t('ui.selectTournamentFirst')}</option>
                {eligibleTeams.filter(tt => String(tt.id) !== form.teamAId).map(tt => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModal(false)} className="btn-ghost">{t('common.cancel')}</button>
            <button onClick={handleSchedule} disabled={saving} className="btn-primary">
              {saving ? t('common.saving') : t('page.scheduleMatch')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Record result modal */}
      <Modal open={resultModal} onClose={() => setResultModal(false)} title={selectedMatch?.resultRecorded ? t('mt.editResult') : t('mt.recordResult')} width="max-w-sm">
        <div className="space-y-4">
          <div className="text-center py-2">
            <p className="font-body text-sm text-text-muted mb-1">
              {selectedMatch?.teamA?.name} <span className="text-text-dim mx-2">vs</span> {selectedMatch?.teamB?.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label={selectedMatch?.teamA?.name || t('col.teamA')}>
              <input type="number" className="input-field text-center text-lg font-display" min="0"
                value={result.scoreA} onChange={e => setResult(r => ({ ...r, scoreA: e.target.value }))} />
            </Field>
            <Field label={selectedMatch?.teamB?.name || t('col.teamB')}>
              <input type="number" className="input-field text-center text-lg font-display" min="0"
                value={result.scoreB} onChange={e => setResult(r => ({ ...r, scoreB: e.target.value }))} />
            </Field>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setResultModal(false)} className="btn-ghost">{t('common.cancel')}</button>
            <button onClick={handleResult} disabled={saving} className="btn-primary">
              {saving ? t('common.saving') : t('ui.confirm')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
