import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Swords, CheckCircle } from 'lucide-react'
import { useToast } from '../components/Toast'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { matchApi, teamApi, tournamentApi } from '../services/api'

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-body text-xs text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const emptyForm   = { teamAId: '', teamBId: '', date: '', tournamentId: '' }
const emptyResult = { scoreA: 0, scoreB: 0 }

export default function Matches() {
  const [matches, setMatches]         = useState([])
  const [teams, setTeams]             = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoad]            = useState(true)
  const [modal, setModal]             = useState(false)
  const [resultModal, setResultModal] = useState(false)
  const [selectedMatch, setSelected]  = useState(null)
  const [form, setForm]               = useState(emptyForm)
  const [result, setResult]           = useState(emptyResult)
  const [saving, setSaving]           = useState(false)
  const toast = useToast()

  const load = async () => {
    setLoad(true)
    try {
      const [mRes, tRes, trRes] = await Promise.all([
        matchApi.getAll(), teamApi.getAll(), tournamentApi.getAll(),
      ])
      setMatches(mRes.data || [])
      setTeams(tRes.data || [])
      setTournaments(trRes.data || [])
    } finally { setLoad(false) }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(emptyForm); setModal(true) }

  const openResult = (m) => {
    setSelected(m)
    setResult({ scoreA: m.teamAScore || 0, scoreB: m.teamBScore || 0 })
    setResultModal(true)
  }

  const handleSchedule = async () => {
    if (!form.teamAId || !form.teamBId || !form.date || !form.tournamentId) {
      alert('Please fill in all required fields.')
      return
    }
    setSaving(true)
    try {
      await matchApi.schedule({
        teamAId:      Number(form.teamAId),
        teamBId:      Number(form.teamBId),
        tournamentId: Number(form.tournamentId),
        date:         form.date,
      })
      setModal(false)
      toast('Match scheduled successfully.', 'success')
      load()
    } catch (e) { toast(e?.response?.data?.message || 'Failed to schedule match.', 'error') }
    finally { setSaving(false) }
  }

  const handleResult = async () => {
    setSaving(true)
    try {
      await matchApi.recordResult(selectedMatch.id, Number(result.scoreA), Number(result.scoreB))
      setResultModal(false)
      toast('Result recorded.', 'success')
      load()
    } catch (e) { toast(e?.response?.data?.message || 'Failed to record result.', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete match?')) return
    try {
      await matchApi.delete(id)
      toast('Match deleted.', 'info')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Failed to delete.', 'error') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const getWinner = (m) => {
    if (!m.resultRecorded) return null
    if (m.teamAScore > m.teamBScore) return m.teamA?.name
    if (m.teamBScore > m.teamAScore) return m.teamB?.name
    return 'Draw'
  }

  const columns = [
    { key: 'teamA', label: 'Team A', render: v => (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
          <Swords size={11} className="text-accent-blue" />
        </div>
        <span className="font-semibold">{v?.name || '—'}</span>
      </div>
    )},
    { key: 'teamB',   label: 'Team B',     render: v => <span>{v?.name || '—'}</span> },
    { key: 'date',    label: 'Date',        render: v => v || '—' },
    { key: 'teamAScore', label: 'Score',   render: (v, r) =>
      r.resultRecorded
        ? <span className="font-display text-sm text-text-primary">{r.teamAScore} <span className="text-text-dim">:</span> {r.teamBScore}</span>
        : <span className="text-text-dim">—</span>
    },
    { key: 'resultRecorded', label: 'Result', render: (v, r) => {
      if (!v) return <Badge variant="gray">Pending</Badge>
      const w = getWinner(r)
      return <Badge variant={w === 'Draw' ? 'cyan' : 'green'}>{w === 'Draw' ? 'Draw' : `${w} won`}</Badge>
    }},
    { key: 'tournament', label: 'Tournament', render: v => v?.name || <span className="text-text-dim">—</span> },
    { key: '_actions', label: '', render: (_, r) => (
      <div className="flex items-center gap-1">
        {!r.resultRecorded && (
          <button onClick={() => openResult(r)}
            title="Record result"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-accent-green hover:bg-accent-green/10 transition-all duration-150 cursor-pointer">
            <CheckCircle size={13} />
          </button>
        )}
        <button onClick={() => handleDelete(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 cursor-pointer">
          <Trash2 size={13} />
        </button>
      </div>
    )},
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Matches"
        subtitle={`${matches.length} registered matches`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> Schedule Match
          </button>
        }
      />

      <DataTable columns={columns} data={matches} loading={loading} emptyMessage="No matches found." />

      {/* Schedule modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Schedule Match" width="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Team A *">
              <select className="input-field" value={form.teamAId} onChange={e => set('teamAId', e.target.value)}>
                <option value="">Select...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Team B *">
              <select className="input-field" value={form.teamBId} onChange={e => set('teamBId', e.target.value)}>
                <option value="">Select...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Date *">
              <input type="date" className="input-field" value={form.date} onChange={e => set('date', e.target.value)} />
            </Field>
            <Field label="Tournament *">
              <select className="input-field" value={form.tournamentId} onChange={e => set('tournamentId', e.target.value)}>
                <option value="">Select...</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button onClick={handleSchedule} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Schedule'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Record result modal */}
      <Modal open={resultModal} onClose={() => setResultModal(false)} title="Record Result" width="max-w-sm">
        <div className="space-y-4">
          <div className="text-center py-2">
            <p className="font-body text-sm text-text-muted mb-1">
              {selectedMatch?.teamA?.name} <span className="text-text-dim mx-2">vs</span> {selectedMatch?.teamB?.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label={selectedMatch?.teamA?.name || 'Team A'}>
              <input type="number" className="input-field text-center text-lg font-display" min="0"
                value={result.scoreA} onChange={e => setResult(r => ({ ...r, scoreA: e.target.value }))} />
            </Field>
            <Field label={selectedMatch?.teamB?.name || 'Team B'}>
              <input type="number" className="input-field text-center text-lg font-display" min="0"
                value={result.scoreB} onChange={e => setResult(r => ({ ...r, scoreB: e.target.value }))} />
            </Field>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setResultModal(false)} className="btn-ghost">Cancel</button>
            <button onClick={handleResult} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
