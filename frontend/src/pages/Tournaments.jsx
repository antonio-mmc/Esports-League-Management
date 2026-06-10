import { useEffect, useState, useMemo } from 'react'
import { Plus, Trash2, Edit2, Trophy, Shield, Crosshair, Sword, Footprints, Car, Skull, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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

const emptyForm = { name: '', game: '', specificGame: '', format: 'LEAGUE', status: 'ACTIVE', teamIds: [] }

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
  const [tournaments, setTournaments] = useState([])
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [coaches, setCoaches] = useState([])
  const [loading, setLoad] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEdit] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [formatFilter, setFormatFilter] = useState('ALL')
  const [gameDetailFilter, setGameDetailFilter] = useState('ALL')
  const toast = useToast()

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

  const openCreate = () => { setEdit(null); setForm(emptyForm); setModal(true) }
  const openEdit = (t) => {
    setEdit(t)
    setForm({
      name: t.name || '', game: t.game || '', specificGame: t.specificGame || '',
      format: t.format || 'LEAGUE', status: t.status || 'ACTIVE',
      teamIds: (t.participatingTeams || []).map(te => te.id),
    })
    setModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        name: form.name, game: form.game, specificGame: form.specificGame,
        format: form.format, status: form.status,
        participatingTeams: form.teamIds.map(id => ({ id: Number(id) })),
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
        <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg bg-bg-primary border border-bg-border focus-within:border-accent-green/40 transition-colors duration-150">
          <Search size={13} className="text-text-dim flex-shrink-0" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tournament, team, player or coach..."
            className="bg-transparent font-body text-sm text-text-primary placeholder:text-text-dim outline-none flex-1 min-w-0" />
          {searchQuery && (
            <button onMouseDown={e => { e.preventDefault(); setSearchQuery('') }} className="text-text-dim hover:text-text-muted transition-colors cursor-pointer">
              <X size={12} />
            </button>
          )}
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name">
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Summer Championship" />
            </Field>
            <Field label="Game / Modality">
              <input className="input-field" value={form.game} onChange={e => setForm(f => ({ ...f, game: e.target.value }))} placeholder="FPS, MOBA..." />
            </Field>
          </div>
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
          <Field label="Status">
            <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </Field>
          <Field label="Participating Teams">
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {teams.map(t => (
                <button key={t.id} onClick={() => toggleTeam(t.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all duration-150 cursor-pointer ${form.teamIds.includes(t.id)
                      ? 'border-accent-green/40 bg-accent-green/10 text-text-primary'
                      : 'border-bg-border text-text-muted hover:border-text-dim'
                    }`}>
                  <Shield size={12} className={form.teamIds.includes(t.id) ? 'text-accent-green' : 'text-text-dim'} />
                  <span className="font-body text-xs truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </Field>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editing ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
