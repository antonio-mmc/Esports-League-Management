import { useEffect, useState } from 'react'
import { Plus, Crosshair, Sword, Footprints, Trash2, Edit2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { useToast } from '../components/Toast'
import { playerApi, teamApi } from '../services/api'

const TYPE_META = {
  FPS:       { label: 'FPS',      color: 'cyan',   icon: Crosshair },
  MOBA:      { label: 'MOBA',     color: 'purple', icon: Sword     },
  EFOOTBALL: { label: 'eFootball',color: 'green',  icon: Footprints},
}

const emptyForm = {
  playerType: 'FPS', fullName: '', nickname: '', password: '',
  matchesPlayed: 0, wins: 0, losses: 0, teamId: '',
  // FPS
  accuracy: 0, headshots: 0,
  // MOBA
  mainCharacter: '', kills: 0, deaths: 0, mobaAssists: 0,
  // EFOOTBALL
  mainPosition: '', goalsScored: 0, goalsSaved: 0, efbAssists: 0,
}

function buildPayload(form) {
  const base = {
    playerType: form.playerType, fullName: form.fullName,
    nickname: form.nickname, password: form.password,
    matchesPlayed: Number(form.matchesPlayed),
    wins: Number(form.wins), losses: Number(form.losses),
    ...(form.teamId ? { team: { id: Number(form.teamId) } } : {}),
  }
  if (form.playerType === 'FPS')       return { ...base, accuracy: Number(form.accuracy), headshots: Number(form.headshots) }
  if (form.playerType === 'MOBA')      return { ...base, mainCharacter: form.mainCharacter, kills: Number(form.kills), deaths: Number(form.deaths), mobaAssists: Number(form.mobaAssists) }
  if (form.playerType === 'EFOOTBALL') return { ...base, mainPosition: form.mainPosition, goalsScored: Number(form.goalsScored), goalsSaved: Number(form.goalsSaved), efbAssists: Number(form.efbAssists) }
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
  const [filter, setFilter]   = useState('ALL')
  const toast = useToast()

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
      password: '', matchesPlayed: p.matchesPlayed || 0, wins: p.wins || 0, losses: p.losses || 0,
      teamId: p.team?.id || '',
      accuracy: p.accuracy || 0, headshots: p.headshots || 0,
      mainCharacter: p.mainCharacter || '', kills: p.kills || 0, deaths: p.deaths || 0, mobaAssists: p.mobaAssists || 0,
      mainPosition: p.mainPosition || '', goalsScored: p.goalsScored || 0, goalsSaved: p.goalsSaved || 0, efbAssists: p.efbAssists || 0,
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
      toast(editing ? 'Jogador atualizado.' : 'Jogador criado com sucesso.', 'success')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Erro ao guardar.', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminar jogador?')) return
    try {
      await playerApi.delete(id)
      toast('Jogador eliminado.', 'info')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Erro ao eliminar.', 'error') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const filtered = filter === 'ALL' ? players : players.filter(p => (p.playerType || '').toUpperCase() === filter)

  const columns = [
    { key: 'nickname',    label: 'Nickname', render: (v, r) => (
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: `rgba(${TYPE_META[r.playerType]?.color === 'cyan' ? '6,182,212' : r.playerType === 'MOBA' ? '139,92,246' : '34,197,94'},0.12)` }}>
          {(() => { const I = TYPE_META[r.playerType]?.icon; return I ? <I size={13} style={{ color: r.playerType === 'FPS' ? '#06B6D4' : r.playerType === 'MOBA' ? '#8B5CF6' : '#22C55E' }} /> : null })()}
        </div>
        <span className="font-semibold">{v}</span>
      </div>
    )},
    { key: 'fullName',     label: 'Nome Completo' },
    { key: 'playerType',   label: 'Tipo', render: (v) => {
      const m = TYPE_META[v] || {}
      return <Badge variant={m.color || 'gray'}>{m.label || v}</Badge>
    }},
    { key: 'matchesPlayed', label: 'Partidas' },
    { key: 'wins',          label: 'V' },
    { key: 'losses',        label: 'D' },
    { key: 'team',          label: 'Equipa', render: (v) => v?.name || <span className="text-text-dim">—</span> },
    { key: '_actions',      label: '', render: (_, r) => (
      <div className="flex items-center gap-1">
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
        subtitle={`${players.length} jogadores registados`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> Novo Jogador
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 p-1 glass-card w-fit">
        {[['ALL','Todos'], ['FPS','FPS'], ['MOBA','MOBA'], ['EFOOTBALL','eFootball']].map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-lg font-body text-xs font-medium transition-all duration-150 cursor-pointer ${
              filter === val ? 'bg-accent-green text-bg-base' : 'text-text-muted hover:text-text-primary'
            }`}>
            {lbl}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="Nenhum jogador encontrado." />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Jogador' : 'Novo Jogador'} width="max-w-2xl">
        <div className="space-y-4">
          {/* Type selector */}
          <Field label="Tipo de Jogador">
            <div className="flex gap-2">
              {Object.entries(TYPE_META).map(([type, meta]) => (
                <button key={type} onClick={() => set('playerType', type)}
                  className={`flex-1 py-2 rounded-lg border font-body text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    form.playerType === type
                      ? `border-accent-${meta.color} bg-accent-${meta.color}/10 text-accent-${meta.color}`
                      : 'border-bg-border text-text-muted hover:border-text-dim'
                  }`}>
                  {meta.label}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome Completo">
              <input className="input-field" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="João Silva" />
            </Field>
            <Field label="Nickname">
              <input className="input-field" value={form.nickname} onChange={e => set('nickname', e.target.value)} placeholder="xX_Sniper_Xx" />
            </Field>
            <Field label="Password">
              <input type="password" className="input-field" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" />
            </Field>
            <Field label="Equipa">
              <select className="input-field" value={form.teamId} onChange={e => set('teamId', e.target.value)}>
                <option value="">Sem equipa</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Partidas">
              <input type="number" className="input-field" value={form.matchesPlayed} onChange={e => set('matchesPlayed', e.target.value)} min="0" />
            </Field>
            <Field label="Vitórias">
              <input type="number" className="input-field" value={form.wins} onChange={e => set('wins', e.target.value)} min="0" />
            </Field>
            <Field label="Derrotas">
              <input type="number" className="input-field" value={form.losses} onChange={e => set('losses', e.target.value)} min="0" />
            </Field>
          </div>

          {/* Type-specific fields */}
          {form.playerType === 'FPS' && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-bg-border">
              <Field label="Precisão (%)">
                <input type="number" step="0.1" className="input-field" value={form.accuracy} onChange={e => set('accuracy', e.target.value)} min="0" max="100" />
              </Field>
              <Field label="Headshots">
                <input type="number" className="input-field" value={form.headshots} onChange={e => set('headshots', e.target.value)} min="0" />
              </Field>
            </div>
          )}
          {form.playerType === 'MOBA' && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-bg-border">
              <Field label="Personagem Principal">
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
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-bg-border">
              <Field label="Posição Principal">
                <input className="input-field" value={form.mainPosition} onChange={e => set('mainPosition', e.target.value)} placeholder="Avançado" />
              </Field>
              <Field label="Golos Marcados">
                <input type="number" className="input-field" value={form.goalsScored} onChange={e => set('goalsScored', e.target.value)} min="0" />
              </Field>
              <Field label="Golos Salvos">
                <input type="number" className="input-field" value={form.goalsSaved} onChange={e => set('goalsSaved', e.target.value)} min="0" />
              </Field>
              <Field label="Assists">
                <input type="number" className="input-field" value={form.efbAssists} onChange={e => set('efbAssists', e.target.value)} min="0" />
              </Field>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModal(false)} className="btn-ghost">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'A guardar...' : editing ? 'Guardar' : 'Criar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
