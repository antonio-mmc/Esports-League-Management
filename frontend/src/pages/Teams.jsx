import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Shield, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { useToast } from '../components/Toast'
import { teamApi } from '../services/api'

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-body text-xs text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const emptyForm = { name: '' }

export default function Teams() {
  const [teams, setTeams]   = useState([])
  const [loading, setLoad]  = useState(true)
  const [modal, setModal]   = useState(false)
  const [editing, setEdit]  = useState(null)
  const [form, setForm]     = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const load = async () => {
    setLoad(true)
    try { setTeams((await teamApi.getAll()).data || []) }
    finally { setLoad(false) }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEdit(null); setForm(emptyForm); setModal(true) }
  const openEdit   = (t) => { setEdit(t); setForm({ name: t.name || '' }); setModal(true) }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) await teamApi.update(editing.id, form)
      else         await teamApi.create(form)
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

  const columns = [
    { key: 'name', label: 'Team', render: (v) => (
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
          <Shield size={13} className="text-accent-cyan" />
        </div>
        <span className="font-semibold">{v}</span>
      </div>
    )},
    { key: 'wins',   label: 'W',   render: v => <span className="text-accent-green font-semibold">{v ?? 0}</span> },
    { key: 'draws',  label: 'D',   render: v => <span className="text-accent-cyan font-semibold">{v ?? 0}</span>  },
    { key: 'losses', label: 'L',   render: v => <span className="text-red-400 font-semibold">{v ?? 0}</span>      },
    { key: 'points', label: 'Pts', render: v => <Badge variant="green">{v ?? 0} pts</Badge> },
    { key: 'coach',   label: 'Coach',   render: v => v?.name  || <span className="text-text-dim">—</span> },
    { key: 'players', label: 'Players', render: v => <span className="text-text-muted">{v?.length ?? 0}</span> },
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
        subtitle={`${teams.length} registered teams`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> New Team
          </button>
        }
      />

      <DataTable columns={columns} data={teams} loading={loading} emptyMessage="No teams found." />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Team' : 'New Team'}>
        <div className="space-y-4">
          <Field label="Team Name">
            <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Team Alpha" />
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
