import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { Plus, UserCheck, Crosshair, Sword, Footprints, Car, Skull, Trash2, Edit2, Search, X, ChevronRight, ChevronDown } from 'lucide-react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useGameFilter } from '../context/GameFilterContext'
import { useT } from '../context/LanguageContext'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Combobox from '../components/Combobox'
import { useToast } from '../components/Toast'
import { coachApi, teamApi } from '../services/api'
import { teamEmoji } from '../utils/teamEmoji'

const TYPE_META = {
  FPS:          { label: 'FPS',          color: 'cyan',   icon: Crosshair,  hex: '#06B6D4' },
  MOBA:         { label: 'MOBA',         color: 'purple', icon: Sword,      hex: '#8B5CF6' },
  EFOOTBALL:    { label: 'eFootball',    color: 'green',  icon: Footprints, hex: '#22C55E' },
  RACING:       { label: 'Racing',       color: 'orange', icon: Car,        hex: '#F59E0B' },
  BATTLE_ROYALE:{ label: 'Battle Royale',color: 'red',    icon: Skull,      hex: '#EF4444' },
}

import { COUNTRY_CODE, flagEmoji } from '../utils/countries'

function FlagIcon({ nationality, size = 16 }) {
  const code = COUNTRY_CODE[nationality]
  if (!code) return null
  return <span className={`fi fi-${code.toLowerCase()}`} style={{ width: size, height: size * 0.75, borderRadius: 2, flexShrink: 0 }} />
}

function AgeFilter({ ageMin, ageMax, onChange }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const hasFilter = ageMin || ageMax
  const displayLabel = hasFilter
    ? (ageMin && ageMax ? `${ageMin} – ${ageMax}` : ageMin ? `${ageMin}+` : `≤ ${ageMax}`)
    : t('players.allAges')

  const clear = () => { onChange('', ''); setOpen(false) }

  return (
    <div ref={ref} className="relative" style={{ width: 160 }}>
      <div
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-primary border border-bg-border cursor-pointer hover:border-accent-green/20 transition-colors duration-150">
        <span className="font-body text-sm text-text-primary flex-1 select-none">{displayLabel}</span>
        {hasFilter
          ? <button onMouseDown={e => { e.preventDefault(); e.stopPropagation(); clear() }} className="text-text-dim hover:text-text-muted cursor-pointer"><X size={11} /></button>
          : <ChevronDown size={12} className={`text-text-dim flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        }
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 rounded border border-bg-border p-3"
          style={{ background: 'rgb(var(--bg-elevated))', boxShadow: '0 12px 40px rgba(0,0,0,0.35)', width: 192 }}>
          <p className="eyebrow mb-2.5">{t('players.ageRange')}</p>
          <div className="flex items-center gap-2">
            <input type="number" min="0" max="99" value={ageMin}
              onChange={e => onChange(e.target.value, ageMax)}
              placeholder={t('players.min')}
              className="input-field text-center px-2" style={{ width: 72 }} />
            <span className="font-body text-text-dim text-sm flex-shrink-0">–</span>
            <input type="number" min="0" max="99" value={ageMax}
              onChange={e => onChange(ageMin, e.target.value)}
              placeholder={t('players.max')}
              className="input-field text-center px-2" style={{ width: 72 }} />
          </div>
        </div>
      )}
    </div>
  )
}

const getAge = (birthDate) => {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const emptyForm = {
  name: '', email: '', teamId: '',
  nationality: '', city: '', birthDate: '',
  specialization: '', achievementsText: '',
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-body text-xs text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

export default function Coaches() {
  const { t } = useT()
  const [coaches, setCoaches] = useState([])
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(emptyForm)
  const [saving, setSaving]   = useState(false)
  const navigate = useNavigate()
  const { gameFilter } = useGameFilter()
  const [filter,            setFilter]           = useState(gameFilter)
  const [teamFilter,        setTeamFilter]        = useState('')
  const [nationalityFilter, setNationalityFilter] = useState('')
  const [ageMin,            setAgeMin]            = useState('')
  const [ageMax,            setAgeMax]            = useState('')
  const [nameSearch,        setNameSearch]        = useState('')
  const [sortKey,           setSortKey]           = useState(null)
  const [sortDir,           setSortDir]           = useState('asc')
  const [searchParams]                            = useSearchParams()
  const toast = useToast()

  const NUMERIC_COLS = new Set(['age'])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(NUMERIC_COLS.has(key) ? 'desc' : 'asc')
    }
  }

  // Follow the global modality filter when it changes (adjust during render).
  const [prevGameFilter, setPrevGameFilter] = useState(gameFilter)
  if (gameFilter !== prevGameFilter) {
    setPrevGameFilter(gameFilter)
    setFilter(gameFilter)
  }

  const searchHighlight = searchParams.get('q') || ''

  const load = async () => {
    setLoading(true)
    try {
      const [cRes, tRes] = await Promise.all([coachApi.getAll(), teamApi.getAll()])
      setCoaches(cRes.data || [])
      setTeams(tRes.data || [])
    } finally { setLoading(false) }
  }
  // Intentional one-time fetch on mount; the loading flag set inside load() is expected.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit   = (c) => {
    setEditing(c)
    setForm({
      name: c.name || '', email: c.email || '', teamId: c.team?.id || '',
      nationality: c.nationality || '', city: c.city || '',
      birthDate: c.birthDate || '', specialization: c.specialization || '',
      achievementsText: (c.achievements || []).join('\n'),
    })
    setModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const achievements = form.achievementsText
        ? form.achievementsText.split('\n').map(s => s.trim()).filter(Boolean)
        : []
      const payload = {
        name: form.name, email: form.email,
        nationality: form.nationality || null,
        city: form.city || null,
        birthDate: form.birthDate || null,
        specialization: form.specialization || null,
        achievements,
        ...(form.teamId ? { team: { id: Number(form.teamId) } } : { team: null }),
      }
      if (editing) await coachApi.update(editing.id, payload)
      else         await coachApi.create(payload)
      setModal(false)
      toast(editing ? t('coaches.updated') : t('coaches.created'), 'success')
      load()
    } catch(e) { toast(e?.response?.data?.error || e?.response?.data?.message || t('coaches.saveFail'), 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm(t('coaches.confirmDelete'))) return
    try {
      await coachApi.delete(id)
      toast(t('coaches.deleted'), 'info')
      load()
    } catch(e) { toast(e?.response?.data?.error || e?.response?.data?.message || t('coaches.deleteFail'), 'error') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const getDominantType = useCallback((coach) => {
    if (coach.specialization) return coach.specialization
    // fallback: derive from team players if available
    const team = teams.find(t => t.id === coach.team?.id)
    if (!team) return null
    const counts = {}
    ;(team.players || []).forEach(p => {
      if (p.playerType) counts[p.playerType] = (counts[p.playerType] || 0) + 1
    })
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null
  }, [teams])

  const modeOptions = [
    { value: 'ALL',          label: t('common.allGames') },
    { value: 'FPS',          label: 'FPS'          },
    { value: 'MOBA',         label: 'MOBA'         },
    { value: 'EFOOTBALL',    label: 'eFootball'    },
    { value: 'RACING',       label: 'Racing'       },
    { value: 'BATTLE_ROYALE',label: 'Battle Royale'},
  ]

  const teamOptions = useMemo(() => [
    { value: '',     label: t('common.allTeams') },
    { value: 'FREE', label: t('players.freeAgents') },
    ...teams.map(tm => ({ value: String(tm.id), label: `${teamEmoji(tm.name)} ${tm.name}` })),
  ], [teams, t])

  const nationalityOptions = useMemo(() => {
    const nations = [...new Set(coaches.map(c => c.nationality).filter(Boolean))].sort()
    return [
      { value: '', label: t('common.allNations') },
      ...nations.map(n => ({ value: n, label: `${flagEmoji(n)} ${n}`.trim() })),
    ]
  }, [coaches])

  const filtered = useMemo(() => {
    let result = coaches
    if (filter !== 'ALL') result = result.filter(c => getDominantType(c) === filter)
    if (teamFilter === 'FREE') result = result.filter(c => !c.team)
    else if (teamFilter)       result = result.filter(c => String(c.team?.id) === teamFilter)
    if (nationalityFilter)result = result.filter(c => c.nationality === nationalityFilter)
    if (ageMin || ageMax) {
      result = result.filter(c => {
        const age = getAge(c.birthDate)
        if (age === null) return false
        if (ageMin && age < parseInt(ageMin)) return false
        if (ageMax && age > parseInt(ageMax)) return false
        return true
      })
    }
    if (nameSearch.trim()) {
      const q = nameSearch.toLowerCase()
      result = result.filter(c => c.name?.toLowerCase().includes(q))
    }
    if (sortKey) {
      const sortValue = (c) => {
        if (sortKey === 'age')        return getAge(c.birthDate) ?? -1
        if (sortKey === 'team')       return c.team?.name?.toLowerCase() || ''
        if (sortKey === 'mode')       return getDominantType(c) || ''
        if (sortKey === 'nationality')return (c.nationality || '').toLowerCase()
        if (sortKey === 'name')       return (c.name || '').toLowerCase()
        return c[sortKey] ?? ''
      }
      result = [...result].sort((a, b) => {
        const av = sortValue(a), bv = sortValue(b)
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    if (searchHighlight) {
      const q = searchHighlight.toLowerCase()
      const isMatch = c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
      return [...result.filter(isMatch), ...result.filter(c => !isMatch(c))]
    }
    return result
  }, [coaches, filter, teamFilter, nationalityFilter, ageMin, ageMax, nameSearch, searchHighlight, sortKey, sortDir, getDominantType])

  const highlightFn = searchHighlight
    ? (row) => {
        const q = searchHighlight.toLowerCase()
        return row.name?.toLowerCase().includes(q) || row.email?.toLowerCase().includes(q)
      }
    : null

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (v, r) => {
      const mode = getDominantType(r)
      const meta = TYPE_META[mode]
      const hex  = meta?.hex || '#22C55E'
      return (
        <Link to={`/coaches/${r.id}`} className="flex items-center gap-2.5 hover:text-accent-green transition-colors duration-150">
          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: `${hex}1e` }}>
            <UserCheck size={13} style={{ color: hex }} />
          </div>
          <span className="font-semibold">{v}</span>
        </Link>
      )
    }},
    { key: 'nationality', label: 'Nation', sortable: true, render: (v) => {
      if (!v) return <span className="text-text-dim">—</span>
      const code = COUNTRY_CODE[v] || v.slice(0, 3).toUpperCase()
      return (
        <span className="flex items-center gap-1.5">
          <FlagIcon nationality={v} size={16} />
          <span className="font-body text-xs text-text-muted font-medium tracking-wide">{code}</span>
        </span>
      )
    }},
    { key: 'age', label: 'Age', sortable: true, render: (_, r) => {
      const age = getAge(r.birthDate)
      return age != null ? <span className="font-body text-sm text-text-primary">{age}</span> : <span className="text-text-dim">—</span>
    }},
    { key: 'mode', label: 'Mode', sortable: true, render: (_, r) => {
      const mode = getDominantType(r)
      const m = TYPE_META[mode] || {}
      return mode ? <Badge variant={m.color || 'gray'}>{m.label || mode}</Badge> : <span className="text-text-dim">—</span>
    }},
    { key: 'team', label: t('col.team'), sortable: true, render: (v) => v?.name
      ? <span className="flex items-center gap-1.5"><span>{teamEmoji(v.name)}</span>{v.name}</span>
      : <span className="text-sm font-semibold px-2 py-0.5 rounded-full font-body bg-bg-border/40 text-text-muted border border-bg-border">{t('players.free')}</span>
    },
    { key: '_actions', label: '', render: (_, r) => (
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        <button onClick={() => navigate(`/coaches/${r.id}`)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-primary transition-all duration-150 cursor-pointer">
          <ChevronRight size={13} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 transition-all duration-150 cursor-pointer">
          <Edit2 size={13} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 cursor-pointer">
          <Trash2 size={13} />
        </button>
      </div>
    )},
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.coaches')}
        subtitle={t('page.coachesSub', { n: coaches.length })}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> {t('page.newCoach')}
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Combobox value={filter}            onChange={setFilter}            options={modeOptions}        placeholder={t('common.allGames')}   style={{ width: 160 }} />
        <Combobox value={teamFilter}        onChange={setTeamFilter}        options={teamOptions}        placeholder={t('common.allTeams')}   style={{ width: 160 }} />
        <Combobox value={nationalityFilter} onChange={setNationalityFilter} options={nationalityOptions} placeholder={t('common.allNations')} style={{ width: 160 }} />
        <AgeFilter ageMin={ageMin} ageMax={ageMax} onChange={(min, max) => { setAgeMin(min); setAgeMax(max) }} />
        <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg bg-bg-primary border border-bg-border focus-within:border-accent-green/40 transition-colors duration-150">
          <Search size={13} className="text-text-dim flex-shrink-0" />
          <input value={nameSearch} onChange={e => setNameSearch(e.target.value)}
            placeholder={t('teams.searchCoach')}
            className="bg-transparent font-body text-sm text-text-primary placeholder:text-text-dim outline-none flex-1 min-w-0" />
          {nameSearch && (
            <button onMouseDown={e => { e.preventDefault(); setNameSearch('') }} className="text-text-dim hover:text-text-muted transition-colors cursor-pointer">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage={t('coaches.none')} highlightFn={highlightFn} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} onRowClick={(r) => navigate(`/coaches/${r.id}`)} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t('coaches.edit') : t('coaches.new')} width="max-w-xl">
        <div className="space-y-3">
          {/* Identity */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('col.name')}>
              <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Alex Johnson" />
            </Field>
            <Field label={t('col.email')}>
              <input type="email" className="input-field" value={form.email} onChange={e => set('email', e.target.value)} placeholder="coach@esports.com" />
            </Field>
          </div>

          {/* Profile */}
          <div className="grid grid-cols-3 gap-3">
            <Field label={t('col.nation')}>
              <input className="input-field" value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="Portugal" />
            </Field>
            <Field label={t('col.city')}>
              <input className="input-field" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Lisbon" />
            </Field>
            <Field label={t('players.dob')}>
              <input type="date" className="input-field" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} />
            </Field>
          </div>

          {/* Team + Mode */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('col.team')}>
              <select className="input-field" value={form.teamId} onChange={e => set('teamId', e.target.value)}>
                <option value="">{t('players.noTeamShort')}</option>
                {teams.map(tm => <option key={tm.id} value={tm.id}>{teamEmoji(tm.name)} {tm.name}</option>)}
              </select>
            </Field>
            <Field label={t('col.mode')}>
              <select className="input-field" value={form.specialization} onChange={e => set('specialization', e.target.value)}>
                <option value="">{t('ui.none')}</option>
                <option value="FPS">FPS</option>
                <option value="MOBA">MOBA</option>
                <option value="EFOOTBALL">eFootball</option>
                <option value="RACING">Racing</option>
                <option value="BATTLE_ROYALE">Battle Royale</option>
              </select>
            </Field>
          </div>

          <Field label={t('players.achievements')}>
            <textarea className="input-field resize-none" rows={3}
              placeholder={"FPS Coach of the Year 2025\nLed Team to 2nd place — Valorant Cup"}
              value={form.achievementsText}
              onChange={e => set('achievementsText', e.target.value)} />
          </Field>

          <div className="flex gap-3 justify-end pt-1">
            <button onClick={() => setModal(false)} className="btn-ghost">{t('common.cancel')}</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? t('common.saving') : editing ? t('common.save') : t('common.create')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
