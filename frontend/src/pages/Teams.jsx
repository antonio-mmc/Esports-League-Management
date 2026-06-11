import { useEffect, useState, useMemo, useRef } from 'react'
import { Plus, Trash2, Edit2, ChevronRight, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import Combobox from '../components/Combobox'
import { useToast } from '../components/Toast'
import { teamApi } from '../services/api'
import { teamEmoji } from '../utils/teamEmoji'
import { winRate } from '../utils/stats'

const TYPE_META = {
  FPS:           { label: 'FPS',          color: 'cyan'   },
  MOBA:          { label: 'MOBA',         color: 'purple' },
  EFOOTBALL:     { label: 'eFootball',    color: 'green'  },
  RACING:        { label: 'Racing',       color: 'orange' },
  BATTLE_ROYALE: { label: 'Battle Royale',color: 'red'    },
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

function FlagIcon({ nationality, size = 15 }) {
  const code = COUNTRY_CODE[nationality]
  if (!code) return null
  return <span className={`fi fi-${code.toLowerCase()}`} style={{ width: size, height: size * 0.75, borderRadius: 2, flexShrink: 0 }} />
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-body text-xs text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const emptyForm = { name: '', game: 'FPS', nationality: '', wins: 0, losses: 0, trophies: 0, city: '', foundedYear: '' }

export default function Teams() {
  const [teams, setTeams]   = useState([])
  const [loading, setLoad]  = useState(true)
  const [modal, setModal]   = useState(false)
  const [editing, setEdit]  = useState(null)
  const [form, setForm]     = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [gameFilter, setGameFilter] = useState('ALL')
  const [natFilter,  setNatFilter]  = useState('')
  const [nameSearch,  setNameSearch]  = useState('')
  const [coachSearch, setCoachSearch] = useState('')
  const [sortKey,    setSortKey]    = useState(null)
  const [sortDir,    setSortDir]    = useState('asc')
  const toast = useToast()

  const NUMERIC_COLS = new Set(['wins', 'losses', '_wr', 'players'])
  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(NUMERIC_COLS.has(key) ? 'desc' : 'asc') }
  }

  const load = async () => {
    setLoad(true)
    try { setTeams((await teamApi.getAll()).data || []) }
    finally { setLoad(false) }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEdit(null); setForm(emptyForm); setModal(true) }
  const openEdit   = (t) => {
    setEdit(t)
    setForm({
      name: t.name || '',
      game: t.game || 'FPS',
      nationality: t.nationality || '',
      wins: t.wins ?? 0,
      losses: t.losses ?? 0,
      trophies: t.trophies ?? 0,
      city: t.city || '',
      foundedYear: t.foundedYear || '',
    })
    setModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        game: form.game,
        nationality: form.nationality || null,
        wins: Number(form.wins),
        losses: Number(form.losses),
        trophies: Number(form.trophies),
        city: form.city || null,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : null,
      }
      if (editing) await teamApi.update(editing.id, payload)
      else         await teamApi.create(payload)
      setModal(false)
      toast(editing ? 'Team updated.' : 'Team created successfully.', 'success')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Failed to save.', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete team?')) return
    try {
      await teamApi.delete(id)
      toast('Team deleted.', 'info')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Failed to delete.', 'error') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const gameOptions = [
    { value: 'ALL',          label: 'All Games'     },
    { value: 'FPS',          label: 'FPS'           },
    { value: 'MOBA',         label: 'MOBA'          },
    { value: 'EFOOTBALL',    label: 'eFootball'     },
    { value: 'RACING',       label: 'Racing'        },
    { value: 'BATTLE_ROYALE',label: 'Battle Royale' },
  ]

  const natOptions = useMemo(() => {
    const nations = [...new Set(teams.map(t => t.nationality).filter(Boolean))].sort()
    return [
      { value: '', label: 'All Nations' },
      ...nations.map(n => {
        const code = COUNTRY_CODE[n]
        const flag = code ? code.toUpperCase().split('').map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('') : ''
        return { value: n, label: `${flag} ${n}`.trim() }
      }),
    ]
  }, [teams])

  const filtered = useMemo(() => {
    let r = teams
    if (gameFilter !== 'ALL') r = r.filter(t => t.game === gameFilter)
    if (natFilter)            r = r.filter(t => t.nationality === natFilter)
    if (nameSearch.trim()) {
      const q = nameSearch.toLowerCase()
      r = r.filter(t => t.name?.toLowerCase().includes(q))
    }
    if (coachSearch.trim()) {
      const q = coachSearch.toLowerCase()
      r = r.filter(t => t.coach?.name?.toLowerCase().includes(q))
    }
    if (sortKey) {
      const sv = (t) => {
        if (sortKey === 'name')    return (t.name || '').toLowerCase()
        if (sortKey === 'game')    return (TYPE_META[t.game]?.label || t.game || '').toLowerCase()
        if (sortKey === '_wr') {
          const tot = (t.wins || 0) + (t.losses || 0)
          return tot > 0 ? t.wins / tot : 0
        }
        if (sortKey === 'coach')   return (t.coach?.name || '').toLowerCase()
        if (sortKey === 'players') return t.players?.length ?? 0
        return t[sortKey] ?? 0
      }
      r = [...r].sort((a, b) => {
        const av = sv(a), bv = sv(b)
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return r
  }, [teams, gameFilter, natFilter, nameSearch, coachSearch, sortKey, sortDir])

  const columns = [
    { key: 'name', label: 'Team', sortable: true, render: (v, r) => (
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-bg-primary flex items-center justify-center flex-shrink-0 text-base leading-none">
          {teamEmoji(v)}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{v}</span>
          {r.nationality && <FlagIcon nationality={r.nationality} size={14} />}
        </div>
      </div>
    )},
    { key: 'game', label: 'Mode', sortable: true, render: (v) => {
      const m = TYPE_META[v]
      return m ? <Badge variant={m.color}>{m.label}</Badge> : <span className="text-text-dim">—</span>
    }},
    { key: 'wins',   label: 'W', sortable: true, render: v => <span className="text-accent-green font-semibold">{v ?? 0}</span> },
    { key: 'losses', label: 'L', sortable: true, render: v => <span className="text-red-400 font-semibold">{v ?? 0}</span>      },
    { key: '_wr', label: 'WR', sortable: true, render: (_, r) => {
      const wr = winRate(r.wins, r.losses)
      const color = wr >= 75 ? '#3B82F6' : wr >= 65 ? '#22C55E' : wr >= 55 ? '#84CC16'
                  : wr >= 45 ? '#EAB308' : wr >= 35 ? '#F97316' : wr >= 20 ? '#F87171' : '#DC2626'
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-body text-xs font-semibold"
          style={{ color, background: `${color}20`, border: `1px solid ${color}40` }}>
          {wr}%
        </span>
      )
    }},
    { key: 'coach',   label: 'Coach',   sortable: true, render: v => v?.name || <span className="text-text-dim">—</span> },
    { key: 'players', label: 'Players', sortable: true, render: v => <span className="text-text-muted">{v?.length ?? 0}</span> },
    { key: '_actions', label: '', render: (_, r) => (
      <div className="flex items-center gap-1">
        <Link to={`/teams/${r.id}`}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-accent-green hover:bg-accent-green/10 transition-all duration-150 cursor-pointer"
          title="View details">
          <ChevronRight size={13} />
        </Link>
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
        title="Teams"
        subtitle={`${filtered.length} registered teams`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> New Team
          </button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <Combobox value={gameFilter} onChange={setGameFilter} options={gameOptions} placeholder="All Games"   style={{ width: 160 }} />
        <Combobox value={natFilter}  onChange={setNatFilter}  options={natOptions}  placeholder="All Nations" style={{ width: 160 }} />
        <div className="flex items-center gap-2 flex-1 min-w-40 px-3 py-2 rounded-lg bg-bg-primary border border-bg-border focus-within:border-accent-green/40 transition-colors duration-150">
          <Search size={13} className="text-text-dim flex-shrink-0" />
          <input value={coachSearch} onChange={e => setCoachSearch(e.target.value)}
            placeholder="Search coach..."
            className="bg-transparent font-body text-sm text-text-primary placeholder:text-text-dim outline-none flex-1 min-w-0" />
          {coachSearch && (
            <button onMouseDown={e => { e.preventDefault(); setCoachSearch('') }} className="text-text-dim hover:text-text-muted transition-colors cursor-pointer">
              <X size={12} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-40 px-3 py-2 rounded-lg bg-bg-primary border border-bg-border focus-within:border-accent-green/40 transition-colors duration-150">
          <Search size={13} className="text-text-dim flex-shrink-0" />
          <input value={nameSearch} onChange={e => setNameSearch(e.target.value)}
            placeholder="Search team..."
            className="bg-transparent font-body text-sm text-text-primary placeholder:text-text-dim outline-none flex-1 min-w-0" />
          {nameSearch && (
            <button onMouseDown={e => { e.preventDefault(); setNameSearch('') }} className="text-text-dim hover:text-text-muted transition-colors cursor-pointer">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No teams found." sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Team' : 'New Team'} width="max-w-xl">
        <div className="space-y-4">
          <div className="flex gap-2">
            {Object.entries(TYPE_META).map(([type, meta]) => (
              <button key={type} onClick={() => set('game', type)}
                className={`flex-1 py-1.5 rounded-lg border font-body text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  form.game === type
                    ? `border-accent-${meta.color} bg-accent-${meta.color}/10 text-accent-${meta.color}`
                    : 'border-bg-border text-text-muted hover:border-text-dim'
                }`}>
                {meta.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Team Name">
              <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Team Alpha" />
            </Field>
            <Field label="Nationality">
              <input className="input-field" value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="Portugal" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <input className="input-field" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Porto" />
            </Field>
            <Field label="Founded Year">
              <input type="number" className="input-field" value={form.foundedYear} onChange={e => set('foundedYear', e.target.value)} placeholder="2022" min="1990" max="2030" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Wins">
              <input type="number" className="input-field" value={form.wins} onChange={e => set('wins', e.target.value)} min="0" />
            </Field>
            <Field label="Losses">
              <input type="number" className="input-field" value={form.losses} onChange={e => set('losses', e.target.value)} min="0" />
            </Field>
            <Field label="Trophies">
              <input type="number" className="input-field" value={form.trophies} onChange={e => set('trophies', e.target.value)} min="0" />
            </Field>
          </div>

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
