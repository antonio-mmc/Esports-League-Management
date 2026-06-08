import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, UserCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { coachApi, teamApi } from '../services/api'

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-body text-xs text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const emptyForm = { name: '', email: '', password: '', teamId: '' }

export default function Coaches() {
  const [coaches, setCoaches] = useState([])
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(emptyForm)
  const [saving, setSaving]   = useState(false)
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const [cRes, tRes] = await Promise.all([coachApi.getAll(), teamApi.getAll()])
      setCoaches(cRes.data || [])
      setTeams(tRes.data || [])
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit   = (c) => {
    setEditing(c)
    setForm({ name: c.name || '', email: c.email || '', password: '', teamId: c.team?.id || '' })
    setModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password,
        ...(form.teamId ? { team: { id: Number(form.teamId) } } : {}),
      }
      if (editing) await coachApi.update(editing.id, payload)
      else         await coachApi.create(payload)
      setModal(false)
      toast(editing ? 'Coach atualizado.' : 'Coach criado com sucesso.', 'success')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Erro ao guardar.', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminar coach?')) return
    try {
      await coachApi.delete(id)
      toast('Coach eliminado.', 'info')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Erro ao eliminar.', 'error') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const columns = [
    { key: 'name',  label: 'Nome', render: (v) => (
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-accent-green/10 flex items-center justify-center flex-shrink-0">
          <UserCheck size={13} className="text-accent-green" />
        </div>
        <span className="font-semibold">{v}</span>
      </div>
    )},
    { key: 'email', label: 'Email', render: v => <span className="text-text-muted">{v}</span> },
    { key: 'team',  label: 'Equipa', render: v => v?.name || <span className="text-text-dim">—</span> },
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
        title="Coaches"
        subtitle={`${coaches.length} coaches registados`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> Novo Coach
          </button>
        }
      />

      <DataTable columns={columns} data={coaches} loading={loading} emptyMessage="Nenhum coach encontrado." />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Coach' : 'Novo Coach'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome">
              <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Carlos Mendes" />
            </Field>
            <Field label="Email">
              <input type="email" className="input-field" value={form.email} onChange={e => set('email', e.target.value)} placeholder="coach@esports.pt" />
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
          </div>
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
