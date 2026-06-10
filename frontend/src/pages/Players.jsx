import { useEffect, useState, useMemo, useRef } from 'react'
import { Plus, Crosshair, Sword, Footprints, Car, Skull, Trash2, Edit2, Search, X, ChevronRight, ChevronDown } from 'lucide-react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useGameFilter } from '../context/GameFilterContext'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Combobox from '../components/Combobox'
import { useToast } from '../components/Toast'
import { playerApi, teamApi } from '../services/api'
import { teamEmoji } from '../utils/teamEmoji'

const TYPE_META = {
  FPS:          { label: 'FPS',          color: 'cyan',   icon: Crosshair,  hex: '#06B6D4' },
  MOBA:         { label: 'MOBA',         color: 'purple', icon: Sword,      hex: '#8B5CF6' },
  EFOOTBALL:    { label: 'eFootball',    color: 'green',  icon: Footprints, hex: '#22C55E' },
  RACING:       { label: 'Racing',       color: 'orange', icon: Car,        hex: '#F59E0B' },
  BATTLE_ROYALE:{ label: 'Battle Royale',color: 'red',    icon: Skull,      hex: '#EF4444' },
}

const COUNTRY_CODE = {
  'Portugal': 'PT', 'Spain': 'ES', 'Japan': 'JP', 'Russia': 'RU',
  'Ghana': 'GH', 'Denmark': 'DK', 'Sweden': 'SE', 'Italy': 'IT',
  'Egypt': 'EG', 'France': 'FR', 'Brazil': 'BR', 'Germany': 'DE',
  'South Korea': 'KR', 'Czech Republic': 'CZ', 'Senegal': 'SN',
  'Ireland': 'IE', 'Croatia': 'HR', 'Lebanon': 'LB', 'Colombia': 'CO',
  'Norway': 'NO', 'Pakistan': 'PK', 'USA': 'US',
  'Mexico': 'MX', 'Morocco': 'MA', 'Netherlands': 'NL', 'Argentina': 'AR',
  'India': 'IN', 'Nigeria': 'NG', 'Ukraine': 'UA', 'China': 'CN',
  'Bangladesh': 'BD',
}
const flagEmoji = code => code
  ? code.toUpperCase().split('').map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('')
  : ''

function FlagIcon({ nationality, size = 16 }) {
  const code = COUNTRY_CODE[nationality]
  if (!code) return null
  return <span className={`fi fi-${code.toLowerCase()}`} style={{ width: size, height: size * 0.75, borderRadius: 2, flexShrink: 0 }} />
}

function AgeFilter({ ageMin, ageMax, onChange }) {
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
    : 'All Ages'

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
        <div className="absolute top-full left-0 mt-1 z-50 rounded-xl border border-bg-border p-3"
          style={{ background: 'rgba(9,15,29,0.98)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', width: 192 }}>
          <p className="font-body text-xs text-text-dim uppercase tracking-wider mb-2.5">Age range</p>
          <div className="flex items-center gap-2">
            <input type="number" min="0" max="99" value={ageMin}
              onChange={e => onChange(e.target.value, ageMax)}
              placeholder="Min"
              className="input-field text-center px-2" style={{ width: 72 }} />
            <span className="font-body text-text-dim text-sm flex-shrink-0">–</span>
            <input type="number" min="0" max="99" value={ageMax}
              onChange={e => onChange(ageMin, e.target.value)}
              placeholder="Max"
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
  playerType: 'FPS', fullName: '', nickname: '',
  matchesPlayed: 0, wins: 0, losses: 0, teamId: '',
  birthDate: '', nationality: '', city: '', achievementsText: '',
  accuracy: 0, headshots: 0, kast: 0, adr: 0,
  mainCharacter: '', kills: 0, deaths: 0, mobaAssists: 0,
  mainPosition: '', goalsScored: 0, goalsSaved: 0, efbAssists: 0, shotsOnTarget: 0, ballRecoveries: 0,
  avgPosition: 0, podiums: 0, fastestLaps: 0, dnf: 0,
  avgPlacement: 0, top10Rate: 0, damagePerMatch: 0,
}

function buildPayload(form) {
  const achievements = form.achievementsText
    ? form.achievementsText.split('\n').map(s => s.trim()).filter(Boolean)
    : []
  const base = {
    playerType: form.playerType, fullName: form.fullName,
    nickname: form.nickname,
    matchesPlayed: Number(form.matchesPlayed),
    wins: Number(form.wins), losses: Number(form.losses),
    birthDate: form.birthDate || null,
    nationality: form.nationality || null,
    city: form.city || null,
    achievements,
    ...(form.teamId ? { team: { id: Number(form.teamId) } } : {}),
  }
  if (form.playerType === 'FPS')          return { ...base, accuracy: Number(form.accuracy), headshots: Number(form.headshots), kast: Number(form.kast), adr: Number(form.adr) }
  if (form.playerType === 'MOBA')         return { ...base, mainCharacter: form.mainCharacter, kills: Number(form.kills), deaths: Number(form.deaths), mobaAssists: Number(form.mobaAssists) }
  if (form.playerType === 'EFOOTBALL')    return { ...base, mainPosition: form.mainPosition, goalsScored: Number(form.goalsScored), goalsSaved: Number(form.goalsSaved), efbAssists: Number(form.efbAssists), shotsOnTarget: Number(form.shotsOnTarget), ballRecoveries: Number(form.ballRecoveries) }
  if (form.playerType === 'RACING')       return { ...base, avgPosition: Number(form.avgPosition), podiums: Number(form.podiums), fastestLaps: Number(form.fastestLaps), dnf: Number(form.dnf) }
  if (form.playerType === 'BATTLE_ROYALE')return { ...base, avgPlacement: Number(form.avgPlacement), kills: Number(form.kills), top10Rate: Number(form.top10Rate), damagePerMatch: Number(form.damagePerMatch) }
  return base
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-body text-xs text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

export default function Players() {
  const [players, setPlayers] = useState([])
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(emptyForm)
  const [saving, setSaving]   = useState(false)
  const navigate = useNavigate()
  const { gameFilter } = useGameFilter()
  const [filter,            setFilter]           = useState('ALL')
  const [teamFilter,        setTeamFilter]        = useState('')
  const [nationalityFilter, setNationalityFilter] = useState('')
  const [ageMin,            setAgeMin]            = useState('')
  const [ageMax,            setAgeMax]            = useState('')
  const [nameSearch,        setNameSearch]        = useState('')
  const [sortKey,           setSortKey]           = useState(null)
  const [sortDir,           setSortDir]           = useState('asc')
  const [searchParams]                            = useSearchParams()
  const toast = useToast()

  const NUMERIC_COLS = new Set(['age', 'matchesPlayed', 'wins', 'losses'])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(NUMERIC_COLS.has(key) ? 'desc' : 'asc')
    }
  }

  useEffect(() => { setFilter(gameFilter) }, [gameFilter])

  const searchHighlight = searchParams.get('q') || ''

  const load = async () => {
    setLoading(true)
    try {
      const [pRes, tRes] = await Promise.all([playerApi.getAll(), teamApi.getAll()])
      setPlayers(pRes.data || [])
      setTeams(tRes.data || [])
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit   = (p) => {
    setEditing(p)
    setForm({
      playerType: p.playerType || 'FPS', fullName: p.fullName || '', nickname: p.nickname || '',
      matchesPlayed: p.matchesPlayed || 0, wins: p.wins || 0, losses: p.losses || 0,
      teamId: p.team?.id || '',
      birthDate: p.birthDate || '', nationality: p.nationality || '', city: p.city || '',
      achievementsText: (p.achievements || []).join('\n'),
      accuracy: p.accuracy || 0, headshots: p.headshots || 0, kast: p.kast || 0, adr: p.adr || 0,
      mainCharacter: p.mainCharacter || '', kills: p.kills || 0, deaths: p.deaths || 0, mobaAssists: p.mobaAssists || 0,
      mainPosition: p.mainPosition || '', goalsScored: p.goalsScored || 0, goalsSaved: p.goalsSaved || 0, efbAssists: p.efbAssists || 0, shotsOnTarget: p.shotsOnTarget || 0, ballRecoveries: p.ballRecoveries || 0,
      avgPosition: p.avgPosition || 0, podiums: p.podiums || 0, fastestLaps: p.fastestLaps || 0, dnf: p.dnf || 0,
      avgPlacement: p.avgPlacement || 0, top10Rate: p.top10Rate || 0, damagePerMatch: p.damagePerMatch || 0,
    })
    setModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = buildPayload(form)
      if (editing) await playerApi.update(editing.id, payload)
      else         await playerApi.create(payload)
      setModal(false)
      toast(editing ? 'Player updated.' : 'Player created successfully.', 'success')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Failed to save.', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete player?')) return
    try {
      await playerApi.delete(id)
      toast('Player deleted.', 'info')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Failed to delete.', 'error') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const modeOptions = [
    { value: 'ALL',          label: 'All Games'    },
    { value: 'FPS',          label: 'FPS'          },
    { value: 'MOBA',         label: 'MOBA'         },
    { value: 'EFOOTBALL',    label: 'eFootball'    },
    { value: 'RACING',       label: 'Racing'       },
    { value: 'BATTLE_ROYALE',label: 'Battle Royale'},
  ]

  const teamOptions = useMemo(() => [
    { value: '',     label: 'All Teams'   },
    { value: 'FREE', label: 'Free Agents' },
    ...teams.map(t => ({ value: String(t.id), label: `${teamEmoji(t.name)} ${t.name}` })),
  ], [teams])

  const nationalityOptions = useMemo(() => {
    const nations = [...new Set(players.map(p => p.nationality).filter(Boolean))].sort()
    return [
      { value: '', label: 'All Nations' },
      ...nations.map(n => ({ value: n, label: `${flagEmoji(COUNTRY_CODE[n])} ${n}`.trim() })),
    ]
  }, [players])

  const filtered = useMemo(() => {
    let result = players
    if (filter !== 'ALL')       result = result.filter(p => (p.playerType || '').toUpperCase() === filter)
    if (teamFilter === 'FREE')  result = result.filter(p => !p.team)
    else if (teamFilter)        result = result.filter(p => String(p.team?.id) === teamFilter)
    if (nationalityFilter)      result = result.filter(p => p.nationality === nationalityFilter)
    if (ageMin || ageMax) {
      result = result.filter(p => {
        const age = p.age ?? getAge(p.birthDate)
        if (age === null) return false
        if (ageMin && age < parseInt(ageMin)) return false
        if (ageMax && age > parseInt(ageMax)) return false
        return true
      })
    }
    if (nameSearch.trim()) {
      const q = nameSearch.toLowerCase()
      result = result.filter(p => p.nickname?.toLowerCase().includes(q) || p.fullName?.toLowerCase().includes(q))
    }
    if (sortKey) {
      const sortValue = (p) => {
        if (sortKey === 'age')        return p.age ?? getAge(p.birthDate) ?? -1
        if (sortKey === 'team')       return p.team?.name?.toLowerCase() || ''
        if (sortKey === 'playerType') return TYPE_META[p.playerType]?.label?.toLowerCase() || ''
        if (sortKey === 'nationality')return (p.nationality || '').toLowerCase()
        if (sortKey === 'nickname')   return (p.nickname || '').toLowerCase()
        if (sortKey === 'fullName')   return (p.fullName || '').toLowerCase()
        return p[sortKey] ?? ''
      }
      result = [...result].sort((a, b) => {
        const av = sortValue(a), bv = sortValue(b)
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
    }

    if (searchHighlight) {
      const q = searchHighlight.toLowerCase()
      const isMatch = p => p.nickname?.toLowerCase().includes(q) || p.fullName?.toLowerCase().includes(q)
      return [...result.filter(isMatch), ...result.filter(p => !isMatch(p))]
    }
    return result
  }, [players, filter, teamFilter, nationalityFilter, ageMin, ageMax, nameSearch, searchHighlight, sortKey, sortDir])

  const highlightFn = searchHighlight
    ? (row) => {
        const q = searchHighlight.toLowerCase()
        return row.nickname?.toLowerCase().includes(q) || row.fullName?.toLowerCase().includes(q)
      }
    : null

  const columns = [
    { key: 'nickname', label: 'Nickname', sortable: true, render: (v, r) => {
      const meta = TYPE_META[r.playerType]
      const Icon = meta?.icon
      const hex  = meta?.hex || '#94A3B8'
      return (
        <Link to={`/players/${r.id}`} className="flex items-center gap-2.5 hover:text-accent-green transition-colors duration-150">
          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: `${hex}1e` }}>
            {Icon && <Icon size={13} style={{ color: hex }} />}
          </div>
          <span className="font-semibold">{v}</span>
        </Link>
      )
    }},
    { key: 'fullName',    label: 'Full Name', sortable: true },
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
      const age = r.age ?? getAge(r.birthDate)
      return age != null ? <span className="font-body text-sm text-text-primary">{age}</span> : <span className="text-text-dim">—</span>
    }},
    { key: 'playerType',  label: 'Mode', sortable: true, render: (v) => {
      const m = TYPE_META[v] || {}
      return <Badge variant={m.color || 'gray'}>{m.label || v}</Badge>
    }},
    { key: 'matchesPlayed', label: 'Matches', sortable: true },
    { key: 'wins',          label: 'W',       sortable: true },
    { key: 'losses',        label: 'L',       sortable: true },
    { key: 'team',          label: 'Team',    sortable: true, render: (v) => v?.name
      ? <span className="flex items-center gap-1.5"><span>{teamEmoji(v.name)}</span>{v.name}</span>
      : <span className="text-sm font-semibold px-2 py-0.5 rounded-full font-body bg-bg-border/40 text-text-muted border border-bg-border">Free</span>
    },
    { key: '_actions', label: '', render: (_, r) => (
      <div className="flex items-center gap-1">
        <button onClick={() => navigate(`/players/${r.id}`)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-primary transition-all duration-150 cursor-pointer">
          <ChevronRight size={13} />
        </button>
        <button onClick={() => openEdit(r)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 transition-all duration-150 cursor-pointer">
          <Edit2 size={13} />
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
        title="Players"
        subtitle={`${players.length} registered players`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> New Player
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Combobox value={filter}            onChange={setFilter}            options={modeOptions}         placeholder="All Games"   style={{ width: 160 }} />
        <Combobox value={teamFilter}        onChange={setTeamFilter}        options={teamOptions}         placeholder="All Teams"   style={{ width: 160 }} />
        <Combobox value={nationalityFilter} onChange={setNationalityFilter} options={nationalityOptions}  placeholder="All Nations" style={{ width: 160 }} />
        <AgeFilter ageMin={ageMin} ageMax={ageMax} onChange={(min, max) => { setAgeMin(min); setAgeMax(max) }} />
        <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg bg-bg-primary border border-bg-border focus-within:border-accent-green/40 transition-colors duration-150">
          <Search size={13} className="text-text-dim flex-shrink-0" />
          <input value={nameSearch} onChange={e => setNameSearch(e.target.value)}
            placeholder="Search player..."
            className="bg-transparent font-body text-sm text-text-primary placeholder:text-text-dim outline-none flex-1 min-w-0" />
          {nameSearch && (
            <button onMouseDown={e => { e.preventDefault(); setNameSearch('') }} className="text-text-dim hover:text-text-muted transition-colors cursor-pointer">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No players found." highlightFn={highlightFn} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Player' : 'New Player'} width="max-w-2xl">
        <div className="space-y-3">
          {/* Player type */}
          <div className="flex gap-2">
            {Object.entries(TYPE_META).map(([type, meta]) => (
              <button key={type} onClick={() => set('playerType', type)}
                className={`flex-1 py-1.5 rounded-lg border font-body text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  form.playerType === type
                    ? `border-accent-${meta.color} bg-accent-${meta.color}/10 text-accent-${meta.color}`
                    : 'border-bg-border text-text-muted hover:border-text-dim'
                }`}>
                {meta.label}
              </button>
            ))}
          </div>

          {/* Identity + team */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Full Name">
              <input className="input-field" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="John Smith" />
            </Field>
            <Field label="Nickname">
              <input className="input-field" value={form.nickname} onChange={e => set('nickname', e.target.value)} placeholder="xX_Sniper_Xx" />
            </Field>
            <Field label="Team">
              <select className="input-field" value={form.teamId} onChange={e => set('teamId', e.target.value)}>
                <option value="">No team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
          </div>

          {/* Profile */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Nationality">
              <input className="input-field" value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="Portugal" />
            </Field>
            <Field label="City">
              <input className="input-field" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Lisbon" />
            </Field>
            <Field label="Date of Birth">
              <input type="date" className="input-field" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} />
            </Field>
          </div>

          {/* Record */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Matches">
              <input type="number" className="input-field" value={form.matchesPlayed} onChange={e => set('matchesPlayed', e.target.value)} min="0" />
            </Field>
            <Field label="Wins">
              <input type="number" className="input-field" value={form.wins} onChange={e => set('wins', e.target.value)} min="0" />
            </Field>
            <Field label="Losses">
              <input type="number" className="input-field" value={form.losses} onChange={e => set('losses', e.target.value)} min="0" />
            </Field>
          </div>

          {/* Achievements */}
          <Field label="Achievements (one per line)">
            <textarea className="input-field resize-none" rows={2}
              placeholder={"1st Place - Valorant Spring Cup 2026\nMVP - Season 3"}
              value={form.achievementsText}
              onChange={e => set('achievementsText', e.target.value)} />
          </Field>

          {/* Type-specific stats */}
          {form.playerType === 'FPS' && (
            <div className="grid grid-cols-4 gap-3 pt-2 border-t border-bg-border">
              <Field label="Accuracy (%)">
                <input type="number" step="0.1" className="input-field" value={form.accuracy} onChange={e => set('accuracy', e.target.value)} min="0" max="100" />
              </Field>
              <Field label="KAST%">
                <input type="number" step="0.1" className="input-field" value={form.kast} onChange={e => set('kast', e.target.value)} min="0" max="100" placeholder="74.2" />
              </Field>
              <Field label="ADR">
                <input type="number" step="0.1" className="input-field" value={form.adr} onChange={e => set('adr', e.target.value)} min="0" placeholder="152.3" />
              </Field>
              <Field label="Headshots">
                <input type="number" className="input-field" value={form.headshots} onChange={e => set('headshots', e.target.value)} min="0" />
              </Field>
            </div>
          )}
          {form.playerType === 'MOBA' && (
            <div className="grid grid-cols-4 gap-3 pt-2 border-t border-bg-border">
              <Field label="Champion">
                <input className="input-field" value={form.mainCharacter} onChange={e => set('mainCharacter', e.target.value)} placeholder="Ahri" />
              </Field>
              <Field label="Kills">
                <input type="number" className="input-field" value={form.kills} onChange={e => set('kills', e.target.value)} min="0" />
              </Field>
              <Field label="Deaths">
                <input type="number" className="input-field" value={form.deaths} onChange={e => set('deaths', e.target.value)} min="0" />
              </Field>
              <Field label="Assists">
                <input type="number" className="input-field" value={form.mobaAssists} onChange={e => set('mobaAssists', e.target.value)} min="0" />
              </Field>
            </div>
          )}
          {form.playerType === 'EFOOTBALL' && (
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-bg-border">
              <Field label="Position">
                <input className="input-field" value={form.mainPosition} onChange={e => set('mainPosition', e.target.value)} placeholder="ST, CM, GK..." />
              </Field>
              <Field label="Goals Scored">
                <input type="number" className="input-field" value={form.goalsScored} onChange={e => set('goalsScored', e.target.value)} min="0" />
              </Field>
              <Field label="Goals Saved (GK)">
                <input type="number" className="input-field" value={form.goalsSaved} onChange={e => set('goalsSaved', e.target.value)} min="0" />
              </Field>
              <Field label="Assists">
                <input type="number" className="input-field" value={form.efbAssists} onChange={e => set('efbAssists', e.target.value)} min="0" />
              </Field>
              <Field label="Shots on Target">
                <input type="number" className="input-field" value={form.shotsOnTarget} onChange={e => set('shotsOnTarget', e.target.value)} min="0" />
              </Field>
              <Field label="Ball Recoveries">
                <input type="number" className="input-field" value={form.ballRecoveries} onChange={e => set('ballRecoveries', e.target.value)} min="0" />
              </Field>
            </div>
          )}

          {form.playerType === 'RACING' && (
            <div className="grid grid-cols-4 gap-3 pt-2 border-t border-bg-border">
              <Field label="Avg Position">
                <input type="number" step="0.1" className="input-field" value={form.avgPosition} onChange={e => set('avgPosition', e.target.value)} min="1" placeholder="2.3" />
              </Field>
              <Field label="Podiums">
                <input type="number" className="input-field" value={form.podiums} onChange={e => set('podiums', e.target.value)} min="0" />
              </Field>
              <Field label="Fastest Laps">
                <input type="number" className="input-field" value={form.fastestLaps} onChange={e => set('fastestLaps', e.target.value)} min="0" />
              </Field>
              <Field label="DNFs">
                <input type="number" className="input-field" value={form.dnf} onChange={e => set('dnf', e.target.value)} min="0" />
              </Field>
            </div>
          )}
          {form.playerType === 'BATTLE_ROYALE' && (
            <div className="grid grid-cols-4 gap-3 pt-2 border-t border-bg-border">
              <Field label="Avg Placement">
                <input type="number" step="0.1" className="input-field" value={form.avgPlacement} onChange={e => set('avgPlacement', e.target.value)} min="1" placeholder="3.2" />
              </Field>
              <Field label="Total Kills">
                <input type="number" className="input-field" value={form.kills} onChange={e => set('kills', e.target.value)} min="0" />
              </Field>
              <Field label="Top-10 Rate (%)">
                <input type="number" step="0.1" className="input-field" value={form.top10Rate} onChange={e => set('top10Rate', e.target.value)} min="0" max="100" placeholder="78.4" />
              </Field>
              <Field label="Damage / Match">
                <input type="number" step="0.1" className="input-field" value={form.damagePerMatch} onChange={e => set('damagePerMatch', e.target.value)} min="0" placeholder="892" />
              </Field>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-1">
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
