import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Trophy, Shield } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { useToast } from '../components/Toast'
import { tournamentApi, teamApi } from '../services/api'

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-body text-xs text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const emptyForm = { name: '', game: '', status: 'ACTIVE', teamIds: [] }

const STATUS_COLOR = { ACTIVE: 'green', FINISHED: 'gray', PENDING: 'cyan' }

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([])
  const [teams, setTeams]             = useState([])
  const [loading, setLoad]            = useState(true)
  const [modal, setModal]             = useState(false)
  const [editing, setEdit]            = useState(null)
  const [form, setForm]               = useState(emptyForm)
  const [saving, setSaving]           = useState(false)
  const toast = useToast()

  const load = async () => {
    setLoad(true)
    try {
      const [tRes, teRes] = await Promise.all([tournamentApi.getAll(), teamApi.getAll()])
      setTournaments(tRes.data || [])
      setTeams(teRes.data || [])
    } finally { setLoad(false) }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEdit(null); setForm(emptyForm); setModal(true) }
  const openEdit   = (t) => {
    setEdit(t)
    setForm({
      name: t.name || '', game: t.game || '', status: t.status || 'ACTIVE',
      teamIds: (t.participatingTeams || []).map(te => te.id),
    })
    setModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        name: form.name, game: form.game, status: form.status,
        participatingTeams: form.teamIds.map(id => ({ id: Number(id) })),
      }
      if (editing) await tournamentApi.update(editing.id, payload)
      else         await tournamentApi.create(payload)
      setModal(false)
      toast(editing ? 'Torneio atualizado.' : 'Torneio criado com sucesso.', 'success')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Erro ao guardar.', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminar torneio?')) return
    try {
      await tournamentApi.delete(id)
      toast('Torneio eliminado.', 'info')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Erro ao eliminar.', 'error') }
  }

  const toggleTeam = (id) => {
    setForm(f => ({
      ...f,
      teamIds: f.teamIds.includes(id) ? f.teamIds.filter(x => x !== id) : [...f.teamIds, id],
    }))
  }

  const columns = [
    { key: 'name', label: 'Torneio', render: (v) => (
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-accent-purple/10 flex items-center justify-center flex-shrink-0">
          <Trophy size={13} className="text-accent-purple" />
        </div>
        <span className="font-semibold">{v}</span>
      </div>
    )},
    { key: 'game',   label: 'Jogo' },
    { key: 'status', label: 'Estado', render: v => (
      <Badge variant={STATUS_COLOR[v] || 'gray'}>{v}</Badge>
    )},
    { key: 'participatingTeams', label: 'Equipas', render: v => <span className="text-text-muted">{v?.length ?? 0}</span> },
    { key: 'matches',            label: 'Partidas', render: v => <span className="text-text-muted">{v?.length ?? 0}</span> },
    { key: '_actions', label: '', render: (_, r) => (
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
        title="Tournaments"
        subtitle={`${tournaments.length} torneios registados`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> Novo Torneio
          </button>
        }
      />

      <DataTable columns={columns} data={tournaments} loading={loading} emptyMessage="Nenhum torneio encontrado." />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Torneio' : 'Novo Torneio'} width="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome">
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Summer Championship" />
            </Field>
            <Field label="Jogo">
              <input className="input-field" value={form.game} onChange={e => setForm(f => ({ ...f, game: e.target.value }))} placeholder="FPS, MOBA..." />
            </Field>
          </div>
          <Field label="Estado">
            <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="FINISHED">FINISHED</option>
            </select>
          </Field>
          <Field label="Equipas Participantes">
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {teams.map(t => (
                <button key={t.id} onClick={() => toggleTeam(t.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all duration-150 cursor-pointer ${
                    form.teamIds.includes(t.id)
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
