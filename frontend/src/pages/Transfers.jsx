import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight, UserCheck, UserPlus, Search, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import Combobox from '../components/Combobox'
import Pagination from '../components/Pagination'
import { useToast } from '../components/Toast'
import { useT } from '../context/LanguageContext'
import { dashboardApi, transferApi, teamApi, playerApi, coachApi } from '../services/api'
import { TYPE_EMOJI, TYPE_LABEL, TYPE_BADGE } from '../utils/gameMeta'

const MODE_KEYS = ['FPS', 'MOBA', 'EFOOTBALL', 'RACING', 'BATTLE_ROYALE']

// Compact euro formatting for market values (e.g. €360K, €1.2M).
const fmtValue = (v) => {
  if (v == null) return ''
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`
  if (v >= 1000)      return `€${Math.round(v / 1000)}K`
  return `€${v}`
}

export default function Transfers() {
  const { t } = useT()
  const toast = useToast()
  const [freeAgents, setFreeAgents] = useState({ players: [], coaches: [] })
  const [transfers, setTransfers]   = useState([])
  const [teams, setTeams]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [hiring, setHiring]         = useState(null) // { kind, id, name, type }
  const [teamId, setTeamId]         = useState('')
  const [saving, setSaving]         = useState(false)
  // filters (apply to both the free-agents list and the transfer history)
  const [typeFilter, setTypeFilter] = useState('ALL') // ALL | PLAYER | COACH
  const [modeFilter, setModeFilter] = useState('ALL') // ALL | FPS | MOBA | ...
  const [search, setSearch]         = useState('')
  const [agentsPage, setAgentsPage]       = useState(1)
  const [transfersPage, setTransfersPage] = useState(1)
  const PAGE_SIZE = 8

  const load = async () => {
    setLoading(true)
    try {
      const [fa, tr, te] = await Promise.all([
        dashboardApi.getFreeAgents(), transferApi.getAll(), teamApi.getAll(),
      ])
      setFreeAgents(fa.data || { players: [], coaches: [] })
      setTransfers(tr.data || [])
      setTeams(te.data || [])
    } finally { setLoading(false) }
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  const agents = useMemo(() => {
    const players = (freeAgents.players || []).map(p => ({
      key: `p-${p.id}`, kind: 'PLAYER', id: p.id, name: p.nickname || p.fullName,
      type: p.playerType, nationality: p.nationality, value: p.value, to: `/players/${p.id}`,
    }))
    const coaches = (freeAgents.coaches || []).map(c => ({
      key: `c-${c.id}`, kind: 'COACH', id: c.id, name: c.name,
      type: c.specialization, nationality: c.nationality, value: c.value, to: `/coaches/${c.id}`,
    }))
    return [...players, ...coaches]
  }, [freeAgents])

  const typeOptions = [
    { value: 'ALL',    label: t('transfers.allTypes') },
    { value: 'PLAYER', label: t('dash.player') },
    { value: 'COACH',  label: t('dash.coach') },
  ]
  const modeOptions = [
    { value: 'ALL', label: t('transfers.allModes') },
    ...MODE_KEYS.map(k => ({ value: k, label: TYPE_LABEL[k] })),
  ]

  const q = search.trim().toLowerCase()
  const hasFilters = typeFilter !== 'ALL' || modeFilter !== 'ALL' || q
  const clearFilters = () => { setTypeFilter('ALL'); setModeFilter('ALL'); setSearch('') }

  const filteredAgents = useMemo(() => agents.filter(a =>
    (typeFilter === 'ALL' || a.kind === typeFilter) &&
    (modeFilter === 'ALL' || a.type === modeFilter) &&
    (!q || a.name?.toLowerCase().includes(q) || a.nationality?.toLowerCase().includes(q))
  ), [agents, typeFilter, modeFilter, q])

  const filteredTransfers = useMemo(() => transfers.filter(tr =>
    (typeFilter === 'ALL' || tr.personType === typeFilter) &&
    (modeFilter === 'ALL' || tr.personMeta === modeFilter) &&
    (!q || tr.personName?.toLowerCase().includes(q)
        || tr.fromTeam?.toLowerCase().includes(q)
        || tr.toTeam?.toLowerCase().includes(q))
  ), [transfers, typeFilter, modeFilter, q])

  // Reset both lists to page 1 whenever the filters change (adjust during render).
  const filterSig = `${typeFilter}|${modeFilter}|${q}`
  const [prevFilterSig, setPrevFilterSig] = useState(filterSig)
  if (filterSig !== prevFilterSig) {
    setPrevFilterSig(filterSig)
    setAgentsPage(1)
    setTransfersPage(1)
  }

  const agentsTotalPages    = Math.max(1, Math.ceil(filteredAgents.length / PAGE_SIZE))
  const transfersTotalPages = Math.max(1, Math.ceil(filteredTransfers.length / PAGE_SIZE))
  const agentsSafePage      = Math.min(agentsPage, agentsTotalPages)
  const transfersSafePage   = Math.min(transfersPage, transfersTotalPages)
  const pagedAgents    = filteredAgents.slice((agentsSafePage - 1) * PAGE_SIZE, agentsSafePage * PAGE_SIZE)
  const pagedTransfers = filteredTransfers.slice((transfersSafePage - 1) * PAGE_SIZE, transfersSafePage * PAGE_SIZE)

  // Teams eligible for the agent being hired: same modality, and for a coach only
  // teams that don't already have one. Falls back to all teams if none match.
  const teamOptions = useMemo(() => {
    if (!hiring) return []
    let pool = teams.filter(tm => tm.game === hiring.type)
    if (hiring.kind === 'COACH') pool = pool.filter(tm => !tm.coach)
    if (pool.length === 0) pool = hiring.kind === 'COACH' ? teams.filter(tm => !tm.coach) : teams
    return pool
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(tm => ({ value: String(tm.id), label: tm.name }))
  }, [hiring, teams])

  const openHire = (agent) => { setHiring(agent); setTeamId('') }

  const confirmHire = async () => {
    if (!teamId) { toast(t('transfers.pickFirst'), 'error'); return }
    setSaving(true)
    try {
      if (hiring.kind === 'COACH') await coachApi.assignTeam(hiring.id, Number(teamId))
      else                         await playerApi.assignTeam(hiring.id, Number(teamId))
      const teamName = teams.find(tm => String(tm.id) === String(teamId))?.name
      toast(t('transfers.signed', { name: hiring.name, team: teamName }), 'success')
      setHiring(null)
      load()
    } catch (e) {
      toast(e?.response?.data?.error || e?.response?.data?.message || t('transfers.signFail'), 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.transfers')}
        subtitle={t('page.transfersSub', { n: transfers.length })}
      />

      {/* Filters — apply to both lists */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Combobox value={typeFilter} onChange={setTypeFilter} options={typeOptions} placeholder={t('transfers.allTypes')} style={{ width: 150 }} />
        <Combobox value={modeFilter} onChange={setModeFilter} options={modeOptions} placeholder={t('transfers.allModes')} style={{ width: 160 }} />
        <div className="flex items-center gap-2 flex-1 min-w-40 px-3 py-2 rounded-lg bg-bg-primary border border-bg-border focus-within:border-accent-green/40 transition-colors duration-150">
          <Search size={13} className="text-text-dim flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('transfers.searchPlaceholder')}
            className="bg-transparent font-body text-sm text-text-primary placeholder:text-text-dim outline-none flex-1 min-w-0" />
          {search && (
            <button onMouseDown={e => { e.preventDefault(); setSearch('') }} className="text-text-dim hover:text-text-muted transition-colors cursor-pointer">
              <X size={12} />
            </button>
          )}
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="btn-ghost">{t('common.clearFilters')}</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Free agents — with a hire action */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-[11px] text-text-muted font-semibold uppercase tracking-[0.16em] flex items-center gap-2">
              <UserCheck size={14} className="text-text-dim" />{t('dash.freeAgents')}
            </h3>
            <span className="font-body text-xs text-text-dim">{filteredAgents.length}</span>
          </div>
          {filteredAgents.length === 0 && !loading ? (
            <p className="text-sm text-text-dim font-body text-center py-8">{t('dash.noFreeAgents')}</p>
          ) : (
            <div className="space-y-1">
              {pagedAgents.map(a => (
                <div key={a.key}
                  className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-bg-primary transition-colors duration-150 group">
                  <span className="w-7 h-7 rounded-md bg-bg-primary flex items-center justify-center flex-shrink-0 text-sm leading-none">
                    {a.kind === 'COACH' ? '🎓' : (TYPE_EMOJI[a.type] || '🎮')}
                  </span>
                  <Link to={a.to} className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-body text-sm text-text-primary font-semibold truncate group-hover:text-accent-green transition-colors">{a.name}</p>
                      {a.type && <Badge variant={TYPE_BADGE[a.type] || 'gray'}>{TYPE_LABEL[a.type] || a.type}</Badge>}
                    </div>
                    <p className="font-body text-xs text-text-dim truncate">
                      {a.kind === 'COACH' ? t('dash.coach') : t('dash.player')}{a.nationality ? ` · ${a.nationality}` : ''}
                    </p>
                  </Link>
                  <span className="font-mono text-xs font-semibold text-accent-green flex-shrink-0 tabular-nums">{fmtValue(a.value)}</span>
                  <button onClick={() => openHire(a)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-[10px] uppercase tracking-wider text-text-muted border border-bg-border hover:text-accent-green hover:border-accent-green/40 transition-all duration-150 cursor-pointer flex-shrink-0">
                    <UserPlus size={11} /> {t('transfers.hire')}
                  </button>
                </div>
              ))}
              <Pagination
                page={agentsSafePage}
                totalPages={agentsTotalPages}
                total={filteredAgents.length}
                pageSize={PAGE_SIZE}
                onPageChange={setAgentsPage}
                className="mt-2 pt-3 border-t border-bg-border"
              />
            </div>
          )}
        </div>

        {/* Full transfer history */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-[11px] text-text-muted font-semibold uppercase tracking-[0.16em] flex items-center gap-2">
              <ArrowLeftRight size={14} className="text-text-dim" />{t('dash.recentTransfers')}
            </h3>
            <span className="font-body text-xs text-text-dim">{filteredTransfers.length}</span>
          </div>
          {filteredTransfers.length === 0 && !loading ? (
            <p className="text-sm text-text-dim font-body text-center py-8">{t('dash.noTransfers')}</p>
          ) : (
            <div className="space-y-1">
              {pagedTransfers.map(tr => (
                <div key={tr.id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-bg-primary transition-colors duration-150">
                  <span className="w-7 h-7 rounded-md bg-bg-primary flex items-center justify-center flex-shrink-0 text-sm leading-none">
                    {tr.personType === 'COACH' ? '🎓' : (TYPE_EMOJI[tr.personMeta] || '🎮')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-sm text-text-primary font-semibold truncate">{tr.personName}</p>
                    <p className="font-body text-xs text-text-dim truncate">
                      {tr.fromTeam || t('dash.freeAgent')} <span className="text-accent-green">→</span> {tr.toTeam || t('dash.freeAgent')}
                    </p>
                  </div>
                  {tr.fee != null && <span className="font-mono text-xs text-text-muted flex-shrink-0 tabular-nums">{fmtValue(tr.fee)}</span>}
                  <span className="font-body text-xs text-text-dim flex-shrink-0 w-20 text-right">{tr.date}</span>
                </div>
              ))}
              <Pagination
                page={transfersSafePage}
                totalPages={transfersTotalPages}
                total={filteredTransfers.length}
                pageSize={PAGE_SIZE}
                onPageChange={setTransfersPage}
                className="mt-2 pt-3 border-t border-bg-border"
              />
            </div>
          )}
        </div>
      </div>

      {/* Hire modal */}
      <Modal open={!!hiring} onClose={() => setHiring(null)} title={`${t('transfers.hire')} — ${hiring?.name || ''}`} width="max-w-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-md bg-bg-primary flex items-center justify-center text-base leading-none">
              {hiring?.kind === 'COACH' ? '🎓' : (TYPE_EMOJI[hiring?.type] || '🎮')}
            </span>
            <div>
              <p className="font-body text-sm text-text-primary font-semibold">{hiring?.name}</p>
              {hiring?.type && <Badge variant={TYPE_BADGE[hiring.type] || 'gray'}>{TYPE_LABEL[hiring.type] || hiring.type}</Badge>}
            </div>
          </div>
          <div>
            <label className="block font-body text-xs text-text-muted mb-1.5 uppercase tracking-wider">{t('transfers.signTo')}</label>
            <Combobox value={teamId} onChange={setTeamId} options={teamOptions} placeholder={t('transfers.pickTeam')} />
            {teamOptions.length === 0 && (
              <p className="font-body text-xs text-text-dim mt-2">{t('transfers.noTeams')}</p>
            )}
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button onClick={() => setHiring(null)} className="btn-ghost">{t('common.cancel')}</button>
            <button onClick={confirmHire} disabled={saving || !teamId} className="btn-primary">
              {saving ? t('common.saving') : t('transfers.confirmHire')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
