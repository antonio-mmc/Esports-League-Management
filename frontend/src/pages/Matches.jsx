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

const emptyForm    = { teamAId: '', teamBId: '', date: '', tournamentId: '' }
const emptyResult  = { scoreA: 0, scoreB: 0 }

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
      alert('Preenche todos os campos obrigatórios.')
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
      toast('Partida agendada com sucesso.', 'success')
      load()
    } catch (e) { toast(e?.response?.data?.message || 'Erro ao agendar partida.', 'error') }
    finally { setSaving(false) }
  }

  const handleResult = async () => {
    setSaving(true)
    try {
      await matchApi.recordResult(selectedMatch.id, Number(result.scoreA), Number(result.scoreB))
      setResultModal(false)
      toast('Resultado registado.', 'success')
      load()
    } catch (e) { toast(e?.response?.data?.message || 'Erro ao registar resultado.', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminar partida?')) return
    try {
      await matchApi.delete(id)
      toast('Partida eliminada.', 'info')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Erro ao eliminar.', 'error') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const getWinner = (m) => {
    if (!m.resultRecorded) return null
    if (m.teamAScore > m.teamBScore) return m.teamA?.name
    if (m.teamBScore > m.teamAScore) return m.teamB?.name
    return 'Empate'
  }

  const columns = [
    { key: 'teamA', label: 'Equipa A', render: v => (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
          <Swords size={11} className="text-accent-blue" />
        </div>
        <span className="font-semibold">{v?.name || '—'}</span>
      </div>
    )},
    { key: 'teamB',   label: 'Equipa B', render: v => <span>{v?.name || '—'}</span> },
    { key: 'date',    label: 'Data',     render: v => v || '—' },
    { key: 'teamAScore', label: 'Score', render: (v, r) =>
      r.resultRecorded
        ? <span className="font-display text-sm text-text-primary">{r.teamAScore} <span className="text-text-dim">:</span> {r.teamBScore}</span>
        : <span className="text-text-dim">—</span>
    },
    { key: 'resultRecorded', label: 'Resultado', render: (v, r) => {
      if (!v) return <Badge variant="gray">Pendente</Badge>
      const w = getWinner(r)
      return <Badge variant={w === 'Empate' ? 'cyan' : 'green'}>{w === 'Empate' ? 'Empate' : `${w} venceu`}</Badge>
    }},
    { key: 'tournament', label: 'Torneio', render: v => v?.name || <span className="text-text-dim">—</span> },
    { key: '_actions', label: '', render: (_, r) => (
      <div className="flex items-center gap-1">
        {!r.resultRecorded && (
          <button onClick={() => openResult(r)}
            title="Registar resultado"
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
        subtitle={`${matches.length} partidas registadas`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> Agendar Partida
          </button>
        }
      />

      <DataTable columns={columns} data={matches} loading={loading} emptyMessage="Nenhuma partida encontrada." />

      {/* Modal Agendar */}
      <Modal open={modal} onClose={() => setModal(false)} title="Agendar Partida" width="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Equipa A *">
              <select className="input-field" value={form.teamAId} onChange={e => set('teamAId', e.target.value)}>
                <option value="">Selecionar...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Equipa B *">
              <select className="input-field" value={form.teamBId} onChange={e => set('teamBId', e.target.value)}>
                <option value="">Selecionar...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Data *">
              <input type="date" className="input-field" value={form.date} onChange={e => set('date', e.target.value)} />
            </Field>
            <Field label="Torneio *">
              <select className="input-field" value={form.tournamentId} onChange={e => set('tournamentId', e.target.value)}>
                <option value="">Selecionar...</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModal(false)} className="btn-ghost">Cancelar</button>
            <button onClick={handleSchedule} disabled={saving} className="btn-primary">
              {saving ? 'A guardar...' : 'Agendar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Resultado */}
      <Modal open={resultModal} onClose={() => setResultModal(false)} title="Registar Resultado" width="max-w-sm">
        <div className="space-y-4">
          <div className="text-center py-2">
            <p className="font-body text-sm text-text-muted mb-1">
              {selectedMatch?.teamA?.name} <span className="text-text-dim mx-2">vs</span> {selectedMatch?.teamB?.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label={selectedMatch?.teamA?.name || 'Equipa A'}>
              <input type="number" className="input-field text-center text-lg font-display" min="0"
                value={result.scoreA} onChange={e => setResult(r => ({ ...r, scoreA: e.target.value }))} />
            </Field>
            <Field label={selectedMatch?.teamB?.name || 'Equipa B'}>
              <input type="number" className="input-field text-center text-lg font-display" min="0"
                value={result.scoreB} onChange={e => setResult(r => ({ ...r, scoreB: e.target.value }))} />
            </Field>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setResultModal(false)} className="btn-ghost">Cancelar</button>
            <button onClick={handleResult} disabled={saving} className="btn-primary">
              {saving ? 'A guardar...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
