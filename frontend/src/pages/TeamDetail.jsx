import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, UserCheck, Users, Trophy,
  Crosshair, Sword, Swords, Footprints, Star, Car, Skull, Edit2,
  MapPin, Calendar, Building2, History, UserPlus, X, Search
} from 'lucide-react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { teamApi, tournamentApi, playerApi, coachApi, matchApi } from '../services/api'
import { teamEmoji } from '../utils/teamEmoji'

const TYPE_META = {
  FPS:           { label: 'FPS',          color: 'cyan',   badge: 'cyan',   hex: '#06B6D4', icon: Crosshair  },
  MOBA:          { label: 'MOBA',         color: 'purple', badge: 'purple', hex: '#8B5CF6', icon: Sword      },
  EFOOTBALL:     { label: 'eFootball',    color: 'green',  badge: 'green',  hex: '#22C55E', icon: Footprints },
  RACING:        { label: 'Racing',       color: 'orange', badge: 'orange', hex: '#F59E0B', icon: Car        },
  BATTLE_ROYALE: { label: 'Battle Royale',color: 'red',    badge: 'red',    hex: '#EF4444', icon: Skull      },
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

function FlagIcon({ nationality, size = 16 }) {
  const code = COUNTRY_CODE[nationality]
  if (!code) return null
  return <span className={`fi fi-${code.toLowerCase()}`} style={{ width: size, height: size * 0.75, borderRadius: 2, flexShrink: 0 }} />
}

function StatPill({ label, value, accent }) {
  return (
    <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-bg-primary border border-bg-border">
      <span className="font-display text-xl" style={{ color: accent }}>{value ?? '—'}</span>
      <span className="font-body text-xs text-text-dim uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  )
}

function PlayerSpecific({ player }) {
  const type = player.playerType
  if (type === 'FPS') return (
    <div className="flex gap-3 mt-1">
      <span className="font-body text-xs text-text-dim">Accuracy: <span className="text-text-muted">{player.accuracy?.toFixed(1)}%</span></span>
      <span className="font-body text-xs text-text-dim">Headshots: <span className="text-text-muted">{player.headshots}</span></span>
    </div>
  )
  if (type === 'MOBA') return (
    <div className="flex gap-3 mt-1">
      <span className="font-body text-xs text-text-dim">Champion: <span className="text-text-muted">{player.mainCharacter}</span></span>
      <span className="font-body text-xs text-text-dim">KDA: <span className="text-text-muted">{player.kills}/{player.deaths}/{player.mobaAssists}</span></span>
    </div>
  )
  if (type === 'EFOOTBALL') return (
    <div className="flex gap-3 mt-1">
      <span className="font-body text-xs text-text-dim">Position: <span className="text-text-muted">{player.mainPosition}</span></span>
      <span className="font-body text-xs text-text-dim">Goals: <span className="text-text-muted">{player.goalsScored}</span></span>
      <span className="font-body text-xs text-text-dim">Assists: <span className="text-text-muted">{player.efbAssists}</span></span>
    </div>
  )
  return null
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-body text-xs text-text-muted mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const placementLabel = (pos) => {
  if (pos === 1) return { text: '1st', color: '#FBBF24' }
  if (pos === 2) return { text: '2nd', color: '#94A3B8' }
  if (pos === 3) return { text: '3rd', color: '#CD7F32' }
  return { text: `#${pos}`, color: '#64748B' }
}

const fmtDate = (d) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return d }
}

export default function TeamDetail() {
  const { id } = useParams()
  const [team, setTeam]       = useState(null)
  const [loading, setLoad]    = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState({})
  const [saving, setSaving]   = useState(false)
  const [standings, setStandings] = useState({})
  const [teamMatches, setTeamMatches] = useState([])
  const matchContainerRef = useRef(null)
  const matchItemRefs     = useRef([])
  const [showTrophies, setShowTrophies] = useState(false)
  const [trophyAnchor, setTrophyAnchor] = useState(null)
  const [showCoachHistory, setShowCoachHistory] = useState(false)
  const [playerModal, setPlayerModal] = useState(false)
  const [coachModal, setCoachModal]   = useState(false)
  const [freeAgents, setFreeAgents]   = useState([])
  const [freeCoaches, setFreeCoaches] = useState([])
  const [playerSearch, setPlayerSearch] = useState('')
  const [coachSearch, setCoachSearch]   = useState('')
  const trophyBtnRef = useRef(null)
  const trophyPopRef = useRef(null)
  const toast = useToast()

  useEffect(() => {
    if (!showTrophies) return
    const h = (e) => {
      const outsideBtn = trophyBtnRef.current && !trophyBtnRef.current.contains(e.target)
      const outsidePop = trophyPopRef.current && !trophyPopRef.current.contains(e.target)
      if (outsideBtn && outsidePop) setShowTrophies(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [showTrophies])

  const toggleTrophies = () => {
    if (showTrophies) { setShowTrophies(false); return }
    const rect = trophyBtnRef.current?.getBoundingClientRect()
    if (rect) setTrophyAnchor(rect)
    setShowTrophies(true)
  }

  const loadTeam = () =>
    teamApi.getById(id)
      .then(r => setTeam(r.data))
      .catch(console.error)
      .finally(() => setLoad(false))

  useEffect(() => { loadTeam() }, [id])

  useEffect(() => {
    if (!team) return
    const relevant = (team.tournaments || []).filter(t => t.status === 'ACTIVE' || t.status === 'COMPLETED')
    relevant.forEach(async (t) => {
      try {
        const r = await tournamentApi.getStandings(t.id)
        setStandings(prev => ({ ...prev, [t.id]: r.data }))
      } catch (e) { console.error('standings fetch failed', t.id, e) }
    })
  }, [team])

  useEffect(() => {
    if (!team) return
    matchApi.getAll()
      .then(r => {
        const all = r.data || []
        const mine = all
          .filter(m => m.teamA?.id === team.id || m.teamB?.id === team.id)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
        setTeamMatches(mine)
      })
      .catch(console.error)
  }, [team])

  useEffect(() => {
    if (teamMatches.length === 0) return
    const now = Date.now()
    let best = 0, bestDiff = Infinity
    teamMatches.forEach((m, i) => {
      const diff = Math.abs(new Date(m.date) - now)
      if (diff < bestDiff) { bestDiff = diff; best = i }
    })
    const el = matchItemRefs.current[best]
    const container = matchContainerRef.current
    if (el && container) container.scrollTop = Math.max(0, el.offsetTop - container.offsetTop - 8)
  }, [teamMatches])

  const openEdit = () => {
    setForm({
      name: team.name || '',
      game: team.game || 'FPS',
      nationality: team.nationality || '',
      wins: team.wins ?? 0,
      losses: team.losses ?? 0,
      trophies: team.trophies ?? 0,
      city: team.city || '',
      foundedYear: team.foundedYear || '',
    })
    setModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await teamApi.update(team.id, {
        name: form.name,
        game: form.game,
        nationality: form.nationality || null,
        wins: Number(form.wins),
        losses: Number(form.losses),
        trophies: Number(form.trophies),
        city: form.city || null,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : null,
      })
      setModal(false)
      toast('Team updated.', 'success')
      loadTeam()
    } catch(e) { toast(e?.response?.data?.message || 'Failed to save.', 'error') }
    finally { setSaving(false) }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openAddPlayer = async () => {
    try {
      const all = (await playerApi.getAll()).data || []
      setFreeAgents(all.filter(p => !p.team && p.playerType === team.game))
    } catch { setFreeAgents([]) }
    setPlayerSearch('')
    setPlayerModal(true)
  }

  const addPlayer = async (playerId) => {
    try {
      await playerApi.assignTeam(playerId, team.id)
      toast('Player added to team.', 'success')
      setPlayerModal(false)
      loadTeam()
    } catch(e) { toast(e?.response?.data?.message || 'Failed to add player.', 'error') }
  }

  const removePlayer = async (playerId) => {
    try {
      await playerApi.removeTeam(playerId)
      toast('Player removed from team.', 'info')
      loadTeam()
    } catch(e) { toast(e?.response?.data?.message || 'Failed to remove player.', 'error') }
  }

  const openAssignCoach = async () => {
    try {
      const all = (await coachApi.getAll()).data || []
      setFreeCoaches(all.filter(c => !c.team && c.specialization === team.game))
    } catch { setFreeCoaches([]) }
    setCoachSearch('')
    setCoachModal(true)
  }

  const assignCoach = async (coachId) => {
    try {
      await coachApi.assignTeam(coachId, team.id)
      toast('Coach assigned.', 'success')
      setCoachModal(false)
      loadTeam()
    } catch(e) { toast(e?.response?.data?.message || 'Failed to assign coach.', 'error') }
  }

  const removeCoach = async (coachId) => {
    try {
      await coachApi.removeTeam(coachId)
      toast('Coach removed from team.', 'info')
      loadTeam()
    } catch(e) { toast(e?.response?.data?.message || 'Failed to remove coach.', 'error') }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="text-center py-32">
        <p className="font-body text-text-muted">Team not found.</p>
        <Link to="/teams" className="btn-ghost mt-4 inline-flex">Back</Link>
      </div>
    )
  }

  const players     = team.players || []
  const coach       = team.coach
  const tournaments = [...(team.tournaments || [])].sort((a, b) => {
    const da = a.startDate ? new Date(a.startDate) : new Date(0)
    const db = b.startDate ? new Date(b.startDate) : new Date(0)
    return db - da
  })
  const coachHistory = team.coachHistory || []

  // Derive W/L/total from actual match history once loaded (stored values are stale seeds)
  const playedMatches  = teamMatches.filter(m => m.resultRecorded)
  const computedWins   = playedMatches.filter(m => {
    const isA = m.teamA?.id === team.id
    return isA ? m.teamAScore > m.teamBScore : m.teamBScore > m.teamAScore
  }).length
  const computedLosses = playedMatches.filter(m => {
    const isA = m.teamA?.id === team.id
    return isA ? m.teamAScore < m.teamBScore : m.teamBScore < m.teamAScore
  }).length
  const hasMatchData   = teamMatches.length > 0
  const displayWins    = hasMatchData ? computedWins   : team.wins
  const displayLosses  = hasMatchData ? computedLosses : team.losses
  const total          = hasMatchData ? teamMatches.length : (team.wins + team.losses)
  const winRate        = (displayWins + displayLosses) > 0
    ? Math.round(displayWins / (displayWins + displayLosses) * 100) : 0

  const topPlayer = [...players].sort((a, b) => {
    const wr = p => (p.wins + p.losses) > 0 ? p.wins / (p.wins + p.losses) : 0
    return wr(b) - wr(a)
  })[0]

  const gameMeta = TYPE_META[team.game]
  const barColor = winRate >= 75 ? '#3B82F6'
    : winRate >= 65 ? '#22C55E'
    : winRate >= 55 ? '#84CC16'
    : winRate >= 45 ? '#EAB308'
    : winRate >= 35 ? '#F97316'
    : winRate >= 20 ? '#F87171'
    : '#DC2626'

  const wonTournaments = tournaments.filter(t =>
    t.status === 'COMPLETED' &&
    standings[t.id]?.length > 0 &&
    Number(standings[t.id][0].team?.id) === Number(team.id)
  )

  return (
    <div className="animate-fade-in">
      <Link to="/teams" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary font-body text-sm mb-6 transition-colors cursor-pointer group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Teams
      </Link>

      {/* Hero */}
      <div className="glass-card p-6 mb-6" style={{ borderColor: 'rgba(6,182,212,0.2)', boxShadow: '0 0 40px rgba(6,182,212,0.05)' }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-bg-primary flex items-center justify-center flex-shrink-0 text-3xl leading-none"
              style={{ boxShadow: '0 0 24px rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
              {teamEmoji(team.name)}
            </div>
            <div>
              <h1 className="font-display text-2xl text-text-primary tracking-wide">{team.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {team.nationality && <FlagIcon nationality={team.nationality} size={18} />}
                {gameMeta && <Badge variant={gameMeta.badge}>{gameMeta.label}</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatPill label="Matches"  value={total || 0}       accent="#06B6D4" />
            <StatPill label="Win Rate" value={`${winRate}%`}    accent={barColor} />
            <button ref={trophyBtnRef} onClick={toggleTrophies}
              className={`flex flex-col items-center px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                showTrophies
                  ? 'border-yellow-500/50 bg-yellow-500/10'
                  : 'bg-bg-primary border-bg-border hover:border-yellow-500/30 hover:bg-yellow-500/5'
              }`}>
              <span className="font-display text-xl text-yellow-400">{wonTournaments.length}</span>
              <span className="font-body text-xs text-text-dim uppercase tracking-wider mt-0.5 flex items-center gap-1">
                <Trophy size={9} /> Trophies
              </span>
            </button>
            <button onClick={openEdit}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-primary border border-bg-border text-text-muted hover:text-accent-cyan hover:border-accent-cyan/30 transition-all duration-150 cursor-pointer font-body text-xs font-semibold">
              <Edit2 size={13} /> Edit
            </button>
          </div>
        </div>

        {/* W/L bar */}
        <div className="mt-4 pt-4 border-t border-bg-border">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-display text-sm text-accent-green">{displayWins}<span className="font-body text-xs text-text-dim ml-1">W</span></span>
            <span className="font-display text-sm text-red-400">{displayLosses}<span className="font-body text-xs text-text-dim ml-1">L</span></span>
          </div>
          <div className="h-1.5 rounded-full bg-bg-primary overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${winRate}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Players list — 2/5 width */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Users size={15} className="text-accent-green" />
            <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">Players</h2>
            <span className="font-body text-xs text-text-dim ml-1">({players.length})</span>
            <button onClick={openAddPlayer}
              className="ml-auto w-6 h-6 rounded-lg flex items-center justify-center text-text-dim hover:text-accent-green hover:bg-accent-green/10 transition-all duration-150 cursor-pointer"
              title="Add player">
              <UserPlus size={13} />
            </button>
          </div>

          {players.length === 0 ? (
            <p className="text-sm text-text-dim font-body text-center py-10">No players in this team.</p>
          ) : (
            <div className="space-y-1">
              {players.map((p) => {
                const meta  = TYPE_META[p.playerType] || {}
                const Icon  = meta.icon || Users
                const color = meta.hex || '#94A3B8'
                const pTotal = p.wins + p.losses
                const pWr    = pTotal > 0 ? Math.round((p.wins / pTotal) * 100) : 0
                const isMVP  = topPlayer?.id === p.id

                return (
                  <div key={p.id} className="flex items-start gap-1">
                    <Link to={`/players/${p.id}`}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-primary transition-colors duration-150 group flex-1 min-w-0"
                      style={{ border: '1px solid transparent', ...(isMVP ? { borderColor: 'rgba(34,197,94,0.15)', background: 'rgba(34,197,94,0.03)' } : {}) }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${color}18` }}>
                        <Icon size={13} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-body font-semibold text-sm text-text-primary group-hover:text-accent-green transition-colors">{p.nickname}</span>
                          {isMVP && (
                            <span className="flex items-center gap-0.5 font-body text-xs text-accent-green font-semibold">
                              <Star size={9} fill="currentColor" /> MVP
                            </span>
                          )}
                          <Badge variant={meta.badge || 'gray'}>{meta.label || p.playerType}</Badge>
                        </div>
                        <p className="font-body text-xs text-text-dim mt-0.5 truncate">{p.fullName}</p>
                        <PlayerSpecific player={p} />
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="font-body text-xs text-text-dim">
                          <span className="text-accent-green font-semibold">{p.wins}W</span>
                          {' '}<span className="text-red-400">{p.losses}L</span>
                        </div>
                        <div className="font-body text-xs text-text-muted mt-0.5">{pWr}%</div>
                      </div>
                    </Link>
                    <button onClick={() => removePlayer(p.id)}
                      className="w-6 h-6 mt-2 rounded-lg flex items-center justify-center text-text-dim hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 cursor-pointer flex-shrink-0"
                      title="Remove from team">
                      <X size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right panel — 3/5 width */}
        <div className="lg:col-span-3 space-y-5">

          {/* Coach + Team Info row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Coach card */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserCheck size={15} className="text-accent-green" />
                  <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">Coach</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={openAssignCoach}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-text-dim hover:text-accent-green hover:bg-accent-green/10 transition-all duration-150 cursor-pointer"
                    title={coach ? 'Change coach' : 'Assign coach'}>
                    <UserPlus size={13} />
                  </button>
                  {coachHistory.length > 0 && (
                    <button
                      onClick={() => setShowCoachHistory(v => !v)}
                      className="font-body text-xs text-text-dim hover:text-accent-cyan transition-colors cursor-pointer">
                      {showCoachHistory ? 'Hide' : 'View all'}
                    </button>
                  )}
                </div>
              </div>

              {coach ? (
                <div className="flex items-center gap-2">
                  <Link to={`/coaches/${coach.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-primary transition-colors duration-150 group flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center flex-shrink-0"
                      style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
                      <UserCheck size={18} className="text-accent-green" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-body font-semibold text-sm text-text-primary group-hover:text-accent-green transition-colors">{coach.name}</p>
                      <p className="font-body text-xs text-text-muted truncate">{coach.email}</p>
                    </div>
                  </Link>
                  <button onClick={() => removeCoach(coach.id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-text-dim hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 cursor-pointer flex-shrink-0"
                    title="Remove coach">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button onClick={openAssignCoach}
                  className="w-full font-body text-sm text-text-dim text-center py-4 hover:text-accent-green transition-colors cursor-pointer rounded-xl hover:bg-accent-green/5">
                  No coach assigned. Click to assign.
                </button>
              )}

              {showCoachHistory && coachHistory.length > 0 && (
                <div className="mt-3 pt-3 border-t border-bg-border space-y-2">
                  <p className="font-body text-xs text-text-dim uppercase tracking-wider">Past Coaches</p>
                  {coachHistory.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 px-1">
                      <History size={11} className="text-text-dim flex-shrink-0" />
                      <span className="font-body text-xs text-text-muted">{entry}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Team Info card */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={15} className="text-accent-cyan" />
                <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">Team Info</h2>
              </div>
              <div className="space-y-3">
                {team.foundedYear ? (
                  <div className="flex items-center gap-3 px-1">
                    <Calendar size={13} className="text-text-dim flex-shrink-0" />
                    <span className="font-body text-xs text-text-dim flex-1">Founded</span>
                    <span className="font-display text-sm text-text-primary">{team.foundedYear}</span>
                  </div>
                ) : null}
                {team.city ? (
                  <div className="flex items-center gap-3 px-1">
                    <MapPin size={13} className="text-text-dim flex-shrink-0" />
                    <span className="font-body text-xs text-text-dim flex-1">City</span>
                    <span className="font-display text-sm text-text-primary">{team.city}</span>
                  </div>
                ) : null}
                {!team.foundedYear && !team.city && (
                  <p className="font-body text-xs text-text-dim text-center py-4">No info available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Tournaments */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={15} className="text-accent-purple" />
              <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">Tournaments</h2>
            </div>
            {tournaments.length === 0 ? (
              <p className="font-body text-sm text-text-dim text-center py-4">No tournaments.</p>
            ) : (
              <div className="space-y-2">
                {tournaments.map(t => {
                  const rows = standings[t.id]
                  const pos  = rows ? rows.findIndex(row => Number(row.team?.id) === Number(team.id)) : -1
                  const placement = pos >= 0 ? pos + 1 : null
                  const pl = placement ? placementLabel(placement) : null
                  const showPos = t.status === 'ACTIVE' || t.status === 'COMPLETED'

                  return (
                    <Link key={t.id} to={`/tournaments/${t.id}`}
                      className="flex items-center justify-between py-2.5 px-4 rounded-lg hover:bg-bg-primary transition-colors duration-150 group">
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="font-body text-sm text-text-primary font-medium truncate group-hover:text-accent-green transition-colors">{t.name}</p>
                        <p className="font-body text-xs text-text-dim">{t.game}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {showPos && pl && (
                          <span className="font-display text-sm font-bold" style={{ color: pl.color }}>{pl.text}</span>
                        )}
                        <Badge variant={t.status === 'ACTIVE' ? 'green' : t.status === 'UPCOMING' ? 'cyan' : 'gray'}>
                          {t.status}
                        </Badge>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match History */}
      {teamMatches.length > 0 && (
        <div className="glass-card p-5 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Swords size={15} className="text-accent-cyan" />
            <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">Match History</h2>
            <span className="font-body text-xs text-text-dim ml-1">({teamMatches.length})</span>
          </div>
          <div ref={matchContainerRef} className="space-y-1 max-h-80 overflow-y-auto pr-1">
            {teamMatches.map((m, i) => {
              const isA      = m.teamA?.id === team.id
              const myScore  = isA ? m.teamAScore : m.teamBScore
              const oppScore = isA ? m.teamBScore : m.teamAScore
              const opponent = isA ? m.teamB : m.teamA
              const won  = m.resultRecorded && myScore > oppScore
              const lost = m.resultRecorded && oppScore > myScore
              return (
                <div key={m.id} ref={el => { matchItemRefs.current[i] = el }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-primary transition-colors duration-150">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${!m.resultRecorded ? 'bg-text-dim' : won ? 'bg-accent-green' : lost ? 'bg-red-400' : 'bg-accent-cyan'}`} />
                  <Link to={`/teams/${opponent?.id}`}
                    className="font-body text-sm font-semibold text-text-primary hover:text-accent-green transition-colors truncate flex-1 min-w-0">
                    {opponent?.name}
                  </Link>
                  {m.resultRecorded
                    ? <span className={`font-display text-sm font-bold flex-shrink-0 ${won ? 'text-accent-green' : lost ? 'text-red-400' : 'text-accent-cyan'}`}>
                        {myScore}:{oppScore}
                      </span>
                    : <span className="font-body text-xs text-text-dim flex-shrink-0">vs</span>}
                  <Link to={`/tournaments/${m.tournament?.id}`}
                    className="font-body text-xs text-text-dim hover:text-text-muted transition-colors truncate hidden sm:block max-w-[160px]">
                    {m.tournament?.name}
                  </Link>
                  <span className="font-body text-xs text-text-dim flex-shrink-0">{fmtDate(m.date)}</span>
                  {m.resultRecorded
                    ? <Badge variant={won ? 'green' : lost ? 'red' : 'cyan'}>{won ? 'W' : lost ? 'L' : 'D'}</Badge>
                    : <Badge variant="gray">Pending</Badge>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Trophies popover */}
      {showTrophies && trophyAnchor && createPortal(
        <div ref={trophyPopRef}
          style={{ position: 'fixed', top: trophyAnchor.bottom + 8, right: window.innerWidth - trophyAnchor.right, width: 300, zIndex: 9999 }}
          className="glass-card p-4 shadow-xl">
          {wonTournaments.length > 0 ? (
            <div className="space-y-2.5">
              {wonTournaments.map(t => (
                <Link key={t.id} to={`/tournaments/${t.id}`} onClick={() => setShowTrophies(false)}
                  className="flex items-start gap-2.5 hover:opacity-80 transition-opacity">
                  <Trophy size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-text-primary">{t.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-3 gap-2">
              <Star size={20} className="text-text-dim" />
              <p className="font-body text-xs text-text-dim text-center">No tournament wins yet</p>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Add Player Modal */}
      <Modal open={playerModal} onClose={() => setPlayerModal(false)} title="Add Player" width="max-w-md">
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-primary border border-bg-border focus-within:border-accent-green/40 transition-colors">
            <Search size={13} className="text-text-dim flex-shrink-0" />
            <input value={playerSearch} onChange={e => setPlayerSearch(e.target.value)}
              placeholder="Search free agents..."
              className="bg-transparent font-body text-sm text-text-primary placeholder:text-text-dim outline-none flex-1" />
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {freeAgents.filter(p =>
              p.nickname.toLowerCase().includes(playerSearch.toLowerCase()) ||
              p.fullName.toLowerCase().includes(playerSearch.toLowerCase())
            ).length === 0 ? (
              <p className="font-body text-sm text-text-dim text-center py-8">
                {freeAgents.length === 0 ? 'No free agents available.' : 'No matches found.'}
              </p>
            ) : (
              freeAgents
                .filter(p =>
                  p.nickname.toLowerCase().includes(playerSearch.toLowerCase()) ||
                  p.fullName.toLowerCase().includes(playerSearch.toLowerCase())
                )
                .map(p => {
                  const meta = TYPE_META[p.playerType] || {}
                  const Icon = meta.icon || Users
                  const color = meta.hex || '#94A3B8'
                  return (
                    <button key={p.id} onClick={() => addPlayer(p.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-primary border border-transparent hover:border-bg-border transition-all duration-150 cursor-pointer text-left">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18` }}>
                        <Icon size={13} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-sm text-text-primary">{p.nickname}</p>
                        <p className="font-body text-xs text-text-dim truncate">{p.fullName}</p>
                      </div>
                      <Badge variant={meta.badge || 'gray'}>{meta.label || p.playerType}</Badge>
                    </button>
                  )
                })
            )}
          </div>
        </div>
      </Modal>

      {/* Assign Coach Modal */}
      <Modal open={coachModal} onClose={() => setCoachModal(false)} title="Assign Coach" width="max-w-md">
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-primary border border-bg-border focus-within:border-accent-green/40 transition-colors">
            <Search size={13} className="text-text-dim flex-shrink-0" />
            <input value={coachSearch} onChange={e => setCoachSearch(e.target.value)}
              placeholder="Search free agent coaches..."
              className="bg-transparent font-body text-sm text-text-primary placeholder:text-text-dim outline-none flex-1" />
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {freeCoaches.filter(c =>
              c.name.toLowerCase().includes(coachSearch.toLowerCase())
            ).length === 0 ? (
              <p className="font-body text-sm text-text-dim text-center py-8">
                {freeCoaches.length === 0 ? 'No free agent coaches available.' : 'No matches found.'}
              </p>
            ) : (
              freeCoaches
                .filter(c => c.name.toLowerCase().includes(coachSearch.toLowerCase()))
                .map(c => (
                  <button key={c.id} onClick={() => assignCoach(c.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-primary border border-transparent hover:border-bg-border transition-all duration-150 cursor-pointer text-left">
                    <div className="w-8 h-8 rounded-xl bg-accent-green/10 flex items-center justify-center flex-shrink-0"
                      style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
                      <UserCheck size={15} className="text-accent-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-sm text-text-primary">{c.name}</p>
                      <p className="font-body text-xs text-text-dim truncate">{c.email}</p>
                    </div>
                    {c.specialization && <Badge variant="gray">{c.specialization}</Badge>}
                  </button>
                ))
            )}
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Edit Team" width="max-w-xl">
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
              <input className="input-field" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Team Alpha" />
            </Field>
            <Field label="Nationality">
              <input className="input-field" value={form.nationality || ''} onChange={e => set('nationality', e.target.value)} placeholder="Portugal" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <input className="input-field" value={form.city || ''} onChange={e => set('city', e.target.value)} placeholder="Porto" />
            </Field>
            <Field label="Founded Year">
              <input type="number" className="input-field" value={form.foundedYear || ''} onChange={e => set('foundedYear', e.target.value)} placeholder="2022" min="1990" max="2030" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Wins">
              <input type="number" className="input-field" value={form.wins ?? 0} onChange={e => set('wins', e.target.value)} min="0" />
            </Field>
            <Field label="Losses">
              <input type="number" className="input-field" value={form.losses ?? 0} onChange={e => set('losses', e.target.value)} min="0" />
            </Field>
            <Field label="Trophies">
              <input type="number" className="input-field" value={form.trophies ?? 0} onChange={e => set('trophies', e.target.value)} min="0" />
            </Field>
          </div>

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
