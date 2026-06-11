import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, UserCheck, Trophy, Crosshair, Sword, Footprints, Car, Skull,
  MapPin, Calendar, Edit2, Shield, Star
} from 'lucide-react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { coachApi, teamApi, tournamentApi } from '../services/api'
import { teamEmoji } from '../utils/teamEmoji'
import { TYPE_COLOR, TYPE_BADGE, TYPE_LABEL } from '../utils/gameMeta'
import { winRate as computeWinRate } from '../utils/stats'

const TYPE_ICON  = { FPS: Crosshair, MOBA: Sword,     EFOOTBALL: Footprints,  RACING: Car,      BATTLE_ROYALE: Skull }

const STATUS_COLOR = { ACTIVE: 'green', UPCOMING: 'cyan', COMPLETED: 'gray', FINISHED: 'gray', PENDING: 'cyan' }

const placementLabel = (pos) => {
  if (pos === 1) return { text: '1st', color: '#FBBF24' }
  if (pos === 2) return { text: '2nd', color: '#94A3B8' }
  if (pos === 3) return { text: '3rd', color: '#CD7F32' }
  return { text: `#${pos}`, color: '#64748B' }
}

const COUNTRY_CODE = {
  'Portugal': 'PT', 'Spain': 'ES', 'Japan': 'JP', 'Russia': 'RU',
  'Ghana': 'GH', 'Denmark': 'DK', 'Sweden': 'SE', 'Italy': 'IT',
  'Egypt': 'EG', 'France': 'FR', 'Brazil': 'BR', 'Germany': 'DE',
  'South Korea': 'KR', 'Czech Republic': 'CZ', 'Senegal': 'SN',
  'Ireland': 'IE', 'Croatia': 'HR', 'Lebanon': 'LB', 'Colombia': 'CO',
  'Norway': 'NO', 'Pakistan': 'PK', 'USA': 'US', 'United Kingdom': 'GB',
  'Mexico': 'MX', 'Morocco': 'MA', 'Netherlands': 'NL', 'Argentina': 'AR',
  'India': 'IN', 'Nigeria': 'NG', 'Ukraine': 'UA', 'China': 'CN',
  'Bangladesh': 'BD',
}

function FlagIcon({ nationality, size = 20 }) {
  const code = COUNTRY_CODE[nationality]
  if (!code) return null
  return <span className={`fi fi-${code.toLowerCase()}`} style={{ width: size, height: size * 0.75, borderRadius: 3, flexShrink: 0, display: 'inline-block' }} />
}

function StatPill({ label, value, accent }) {
  return (
    <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-bg-primary border border-bg-border">
      <span className="font-display text-xl" style={{ color: accent }}>{value ?? '—'}</span>
      <span className="font-body text-xs text-text-dim uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  )
}

function ProfileRow({ icon: Icon, label, children }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-bg-border last:border-0">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon size={11} className="text-text-dim" />}
        <span className="font-body text-xs text-text-dim uppercase tracking-wider">{label}</span>
      </div>
      <div className="pl-0.5">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-body text-xs text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const formatDate = (dateStr) => {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatMonthYear = (dateStr) => {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
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

export default function CoachDetail() {
  const { id } = useParams()
  const [coach,      setCoach]      = useState(null)
  const [teams,      setTeams]      = useState([])
  const [teamDetail, setTeamDetail] = useState(null)
  const [loading,    setLoad]       = useState(true)
  const [modal,      setModal]      = useState(false)
  const [form,       setForm]       = useState(emptyForm)
  const [saving,           setSaving]           = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [achAnchor,        setAchAnchor]        = useState(null)
  const [standings,        setStandings]        = useState({})
  const achBtnRef = useRef(null)
  const achPopRef = useRef(null)
  const toast = useToast()

  useEffect(() => {
    if (!showAchievements) return
    const handler = (e) => {
      const outsideBtn = achBtnRef.current && !achBtnRef.current.contains(e.target)
      const outsidePop = achPopRef.current && !achPopRef.current.contains(e.target)
      if (outsideBtn && outsidePop) setShowAchievements(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showAchievements])

  const toggleAchievements = () => {
    if (showAchievements) {
      setShowAchievements(false)
    } else {
      const rect = achBtnRef.current?.getBoundingClientRect()
      if (rect) setAchAnchor(rect)
      setShowAchievements(true)
    }
  }

  const load = async () => {
    setLoad(true)
    try {
      const [cRes, tRes] = await Promise.all([coachApi.getById(id), teamApi.getAll()])
      const c = cRes.data
      setCoach(c)
      setTeams(tRes.data || [])
      if (c?.team?.id) {
        const tdRes = await teamApi.getById(c.team.id)
        setTeamDetail(tdRes.data)
      } else {
        setTeamDetail(null)
      }
    } catch(e) { console.error(e) }
    finally { setLoad(false) }
  }
  useEffect(() => { load() }, [id])

  useEffect(() => {
    if (!teamDetail) return
    const relevant = (teamDetail.tournaments || []).filter(t => t.status === 'ACTIVE' || t.status === 'COMPLETED')
    relevant.forEach(async (t) => {
      try {
        const r = await tournamentApi.getStandings(t.id)
        setStandings(prev => ({ ...prev, [t.id]: r.data }))
      } catch (e) { console.error('standings fetch failed', t.id, e) }
    })
  }, [teamDetail])

  const openEdit = () => {
    if (!coach) return
    setForm({
      name: coach.name || '', email: coach.email || '',
      teamId: coach.team?.id || '',
      nationality: coach.nationality || '', city: coach.city || '',
      birthDate: coach.birthDate || '', specialization: coach.specialization || '',
      achievementsText: (coach.achievements || []).join('\n'),
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
      await coachApi.update(coach.id, payload)
      setModal(false)
      toast('Coach updated.', 'success')
      load()
    } catch(e) { toast(e?.response?.data?.message || 'Failed to save.', 'error') }
    finally { setSaving(false) }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!coach) {
    return (
      <div className="text-center py-32">
        <p className="font-body text-text-muted">Coach not found.</p>
        <Link to="/coaches" className="btn-ghost mt-4 inline-flex">Back</Link>
      </div>
    )
  }

  const getDominantType = (teamData) => {
    if (coach.specialization) return coach.specialization
    if (!teamData) return null
    const counts = {}
    ;(teamData.players || []).forEach(p => {
      if (p.playerType) counts[p.playerType] = (counts[p.playerType] || 0) + 1
    })
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null
  }

  const mode   = getDominantType(teamDetail)
  const color  = TYPE_COLOR[mode] || '#22C55E'
  const Icon   = TYPE_ICON[mode]  || UserCheck
  const team   = teamDetail || coach.team

  const wins   = team?.wins   || 0
  const losses = team?.losses || 0
  const points = team?.points || 0
  const total  = wins + losses
  const winRate = computeWinRate(wins, losses)
  const barColor = winRate >= 75 ? '#3B82F6'
    : winRate >= 65 ? '#22C55E'
    : winRate >= 55 ? '#84CC16'
    : winRate >= 45 ? '#EAB308'
    : winRate >= 35 ? '#F97316'
    : winRate >= 20 ? '#F87171'
    : '#DC2626'

  const hasProfile = coach.nationality || coach.city || coach.birthDate

  const tournaments = teamDetail?.tournaments || []

  return (
    <div className="animate-fade-in">
      <Link to="/coaches" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary font-body text-sm mb-6 transition-colors cursor-pointer group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Coaches
      </Link>

      {/* Hero card */}
      <div className="glass-card p-6 mb-4" style={{ borderColor: `${color}33`, boxShadow: `0 0 40px ${color}0d` }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}1a`, border: `1px solid ${color}4d`, boxShadow: `0 0 28px ${color}33` }}>
              <Icon size={30} style={{ color }} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <h1 className="font-display text-2xl text-text-primary tracking-wide">{coach.name}</h1>
                {mode && <Badge variant={TYPE_BADGE[mode] || 'gray'}>{TYPE_LABEL[mode] || mode}</Badge>}
              </div>
              <p className="font-body text-xs text-text-dim">{coach.email}</p>
              {coach.team && (
                <Link to={`/teams/${coach.team.id}`} className="font-body text-xs text-accent-green hover:underline mt-0.5 inline-flex items-center gap-1">
                  <span>{teamEmoji(coach.team.name)}</span>{coach.team.name}
                </Link>
              )}
            </div>
          </div>

          {/* Team record pills + achievements + edit */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-3 flex-wrap">
              {team && (
                <>
                  <StatPill label="Matches"  value={total}           accent={color} />
                  <StatPill label="Win Rate" value={`${winRate}%`}   accent={barColor} />
                </>
              )}
              <button ref={achBtnRef} onClick={toggleAchievements}
                className={`flex flex-col items-center px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                  showAchievements
                    ? 'border-yellow-500/50 bg-yellow-500/10'
                    : 'bg-bg-primary border-bg-border hover:border-yellow-500/30 hover:bg-yellow-500/5'
                }`}>
                <span className="font-display text-xl text-yellow-400">{coach.achievements?.length || 0}</span>
                <span className="font-body text-xs text-text-dim uppercase tracking-wider mt-0.5 flex items-center gap-1">
                  <Trophy size={9} /> Trophies
                </span>
              </button>
            </div>
            <button onClick={openEdit}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 transition-all duration-150 cursor-pointer border border-bg-border">
              <Edit2 size={15} />
            </button>
          </div>
        </div>

        {/* W/D/L bar */}
        {team && (
          <div className="mt-4 pt-4 border-t border-bg-border">
            <div className="flex items-center gap-4 mb-2">
              <span className="font-display text-sm text-accent-green">{wins}<span className="font-body text-xs text-text-dim ml-1">W</span></span>
              <span className="font-display text-sm text-red-400">{losses}<span className="font-body text-xs text-text-dim ml-1">L</span></span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-primary overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${winRate}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)` }} />
            </div>
          </div>
        )}
      </div>

      {/* Two-column: Coach Profile | Tournament History */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* Coach Profile */}
        <div className="glass-card p-5" style={{ borderColor: `${color}22` }}>
          <h2 className="font-display text-xs text-text-muted uppercase tracking-widest mb-2">Coach Profile</h2>
          {hasProfile ? (
            <div>
              {coach.nationality && (
                <ProfileRow icon={null} label="Nationality">
                  <div className="flex items-center gap-2">
                    <FlagIcon nationality={coach.nationality} size={22} />
                    <span className="font-body text-sm text-text-primary">{coach.nationality}</span>
                  </div>
                </ProfileRow>
              )}
              {coach.city && (
                <ProfileRow icon={MapPin} label="City">
                  <span className="font-body text-sm text-text-primary">{coach.city}</span>
                </ProfileRow>
              )}
              {coach.birthDate && (
                <ProfileRow icon={Calendar} label="Date of Birth">
                  <div>
                    <span className="font-body text-sm text-text-primary">{formatDate(coach.birthDate)}</span>
                    {getAge(coach.birthDate) != null && (
                      <span className="font-body text-xs text-text-muted ml-2 px-1.5 py-0.5 rounded bg-bg-primary border border-bg-border">
                        {getAge(coach.birthDate)} yrs
                      </span>
                    )}
                  </div>
                </ProfileRow>
              )}
              {coach.team && (
                <ProfileRow icon={Shield} label="Team">
                  <Link to={`/teams/${coach.team.id}`} className="font-body text-sm text-accent-green hover:underline inline-flex items-center gap-1.5">
                    <span>{teamEmoji(coach.team.name)}</span>{coach.team.name}
                  </Link>
                </ProfileRow>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <UserCheck size={28} className="text-text-dim" />
              <p className="font-body text-xs text-text-dim text-center">No profile details yet.<br />Click edit to add them.</p>
            </div>
          )}
        </div>

        {/* Tournament History */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={13} className="text-text-muted" />
            <h2 className="font-display text-xs text-text-muted uppercase tracking-widest">Tournament History</h2>
          </div>
          {tournaments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Trophy size={28} className="text-text-dim" />
              <p className="font-body text-xs text-text-dim text-center">No tournaments yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...tournaments]
                .sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0))
                .slice(0, 4)
                .map(t => {
                  const rows = standings[t.id]
                  const teamId = teamDetail?.id
                  const pos = rows ? rows.findIndex(row => Number(row.team?.id) === Number(teamId)) : -1
                  const placement = pos >= 0 ? pos + 1 : null
                  const pl = placement ? placementLabel(placement) : null
                  const showPos = t.status === 'ACTIVE' || t.status === 'COMPLETED'
                  return (
                    <Link key={t.id} to={`/tournaments/${t.id}`}
                      className="flex items-center justify-between px-4 py-3 rounded-lg bg-bg-primary border border-bg-border hover:border-text-dim transition-colors duration-150 group">
                      <div>
                        <span className="font-body text-sm text-text-primary group-hover:text-accent-green transition-colors">{t.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {t.startDate && (
                            <span className="font-body text-xs text-text-dim">{formatMonthYear(t.startDate)}</span>
                          )}
                          {coach.team && (
                            <>
                              {t.startDate && <span className="text-text-dim text-xs">·</span>}
                              <span className="font-body text-xs text-accent-green inline-flex items-center gap-1">
                                <span>{teamEmoji(coach.team.name)}</span>{coach.team.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {showPos && pl && (
                          <span className="font-display text-sm font-bold" style={{ color: pl.color }}>{pl.text}</span>
                        )}
                        <Badge variant={STATUS_COLOR[t.status] || 'gray'}>{t.status}</Badge>
                      </div>
                    </Link>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* Achievements popover */}
      {showAchievements && achAnchor && createPortal(
        <div ref={achPopRef}
          style={{ position: 'fixed', top: achAnchor.bottom + 8, right: window.innerWidth - achAnchor.right, width: 288, zIndex: 9999 }}
          className="glass-card p-4 shadow-xl">
          {coach.achievements?.length > 0 ? (
            <div className="space-y-2.5">
              {[...coach.achievements]
                .sort((a, b) => {
                  const yr = s => parseInt(s.match(/\d{4}/)?.[0] || '0')
                  return yr(b) - yr(a)
                })
                .map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Trophy size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-text-primary">{a}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-3 gap-2">
              <Star size={20} className="text-text-dim" />
              <p className="font-body text-xs text-text-dim text-center">No achievements yet<br />Click edit to add</p>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Edit modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Edit Coach" width="max-w-xl">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} />
            </Field>
            <Field label="Email">
              <input type="email" className="input-field" value={form.email} onChange={e => set('email', e.target.value)} />
            </Field>
          </div>
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="Team">
              <select className="input-field" value={form.teamId} onChange={e => set('teamId', e.target.value)}>
                <option value="">No team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{teamEmoji(t.name)} {t.name}</option>)}
              </select>
            </Field>
            <Field label="Mode">
              <select className="input-field" value={form.specialization} onChange={e => set('specialization', e.target.value)}>
                <option value="">None</option>
                <option value="FPS">FPS</option>
                <option value="MOBA">MOBA</option>
                <option value="EFOOTBALL">eFootball</option>
                <option value="RACING">Racing</option>
                <option value="BATTLE_ROYALE">Battle Royale</option>
              </select>
            </Field>
          </div>
          <Field label="Achievements (one per line)">
            <textarea className="input-field resize-none" rows={3}
              placeholder={"FPS Coach of the Year 2025\nLed Team Nexus to 2nd place — Valorant Cup"}
              value={form.achievementsText}
              onChange={e => set('achievementsText', e.target.value)} />
          </Field>

          <div className="flex gap-3 justify-end pt-1">
            <button onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
