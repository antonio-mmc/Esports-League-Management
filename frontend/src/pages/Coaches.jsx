import { useEffect, useState, useMemo } from 'react'
import { Plus, Trash2, Edit2, UserCheck } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
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

const emptyForm = { name: '', email: '', teamId: '' }

export default function Coaches() {
  const [coaches, setCoaches] = useState([])
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(emptyForm)
  const [saving, setSaving]   = useState(false)
  const [searchParams]        = useSearchParams()
  const searchHighlight       = searchParams.get('q') || ''
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
    setForm({ name: c.name || '', email: c.email || '', teamId: c.team?.id || '' })
    setModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        name: form.name, email: form.email,
        ...(form.teamId ? { team: { id: Number(form.teamId) } } : {}),
      }
      if (editing) await coachApi.update(editing.id, payload)
      else         await coachApi.create(payload)
      setModal(false)
      toast(editing ? 'Coach updated.' : 'Coach created successfully.', 'success')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Failed to save.', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete coach?')) return
    try {
      await coachApi.delete(id)
      toast('Coach deleted.', 'info')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Failed to delete.', 'error') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const displayCoaches = useMemo(() => {
    if (!searchHighlight) return coaches
    const q = searchHighlight.toLowerCase()
    const isMatch = c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    return [...coaches.filter(isMatch), ...coaches.filter(c => !isMatch(c))]
  }, [coaches, searchHighlight])

  const highlightFn = searchHighlight
    ? (row) => {
        const q = searchHighlight.toLowerCase()
        return row.name?.toLowerCase().includes(q) || row.email?.toLowerCase().includes(q)
      }
    : null

  const columns = [
    { key: 'name', label: 'Name', render: (v) => (
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-accent-green/10 flex items-center justify-center flex-shrink-0">
          <UserCheck size={13} className="text-accent-green" />
        </div>
        <span className="font-semibold">{v}</span>
      </div>
    )},
    { key: 'email', label: 'Email', render: v => <span className="text-text-muted">{v}</span> },
    { key: 'team',  label: 'Team',  render: v => v?.name || <span className="text-text-dim">—</span> },
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
        subtitle={`${coaches.length} registered coaches`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> New Coach
          </button>
        }
      />

      <DataTable columns={columns} data={displayCoaches} loading={loading} emptyMessage="No coaches found." highlightFn={highlightFn} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Coach' : 'New Coach'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name">
              <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Alex Johnson" />
            </Field>
            <Field label="Email">
              <input type="email" className="input-field" value={form.email} onChange={e => set('email', e.target.value)} placeholder="coach@esports.com" />
            </Field>
            <Field label="Team">
              <select className="input-field" value={form.teamId} onChange={e => set('teamId', e.target.value)}>
                <option value="">No team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
          </div>
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
