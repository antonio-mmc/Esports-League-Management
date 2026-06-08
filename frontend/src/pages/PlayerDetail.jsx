import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Users, Crosshair, Sword, Footprints, Car, Skull, Edit2,
  MapPin, Calendar, Trophy, Target, Zap, Hash, Star
} from 'lucide-react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { playerApi, teamApi } from '../services/api'

const TYPE_COLOR = { FPS: '#06B6D4', MOBA: '#8B5CF6', EFOOTBALL: '#22C55E', RACING: '#F59E0B', BATTLE_ROYALE: '#EF4444' }
const TYPE_BADGE = { FPS: 'cyan',    MOBA: 'purple',  EFOOTBALL: 'green',   RACING: 'orange', BATTLE_ROYALE: 'red'    }
const TYPE_LABEL = { FPS: 'FPS',     MOBA: 'MOBA',    EFOOTBALL: 'eFootball', RACING: 'Racing', BATTLE_ROYALE: 'Battle Royale' }
const TYPE_ICON  = { FPS: Crosshair, MOBA: Sword,     EFOOTBALL: Footprints,  RACING: Car,      BATTLE_ROYALE: Skull   }

const TYPE_META = {
  FPS:          { label: 'FPS',          color: 'cyan',   icon: Crosshair,  hex: '#06B6D4' },
  MOBA:         { label: 'MOBA',         color: 'purple', icon: Sword,      hex: '#8B5CF6' },
  EFOOTBALL:    { label: 'eFootball',    color: 'green',  icon: Footprints, hex: '#22C55E' },
  RACING:       { label: 'Racing',       color: 'orange', icon: Car,        hex: '#F59E0B' },
  BATTLE_ROYALE:{ label: 'Battle Royale',color: 'red',    icon: Skull,      hex: '#EF4444' },
}

const GAME_COLOR   = { FPS: 'cyan', MOBA: 'purple', eFootball: 'green', Racing: 'orange', 'Battle Royale': 'red' }
const STATUS_COLOR = { ACTIVE: 'green', UPCOMING: 'cyan', COMPLETED: 'gray' }

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
function FlagIcon({ nationality, size = 20 }) {
  const code = COUNTRY_CODE[nationality]
  if (!code) return null
  return <span className={`fi fi-${code.toLowerCase()}`} style={{ width: size, height: size * 0.75, borderRadius: 3, flexShrink: 0, display: 'inline-block' }} />
}

const formatDate = (dateStr) => {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatMonthYear = (dateStr) => {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function StatPill({ label, value, accent }) {
  return (
    <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-bg-primary border border-bg-border">
      <span className="font-display text-xl" style={{ color: accent }}>{value ?? '—'}</span>
      <span className="font-body text-xs text-text-dim uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  )
}

function StatRow({ icon: Icon, label, value, accent, large }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-bg-border last:border-0">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={13} className="text-text-muted flex-shrink-0" />}
        <span className="font-body text-sm text-text-muted">{label}</span>
      </div>
      <span className={`font-display ${large ? 'text-lg' : 'text-base'}`} style={{ color: accent || '#94A3B8' }}>
        {value ?? '—'}
      </span>
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

const emptyForm = {
  playerType: 'FPS', fullName: '', nickname: '',
  matchesPlayed: 0, wins: 0, losses: 0, teamId: '',
  birthDate: '', nationality: '', city: '',
  achievementsText: '',
  accuracy: 0, headshots: 0, kast: 0, adr: 0,
  mainCharacter: '', kills: 0, deaths: 0, mobaAssists: 0,
  mainPosition: '', goalsScored: 0, goalsSaved: 0, efbAssists: 0, shotsOnTarget: 0, ballRecoveries: 0,
  avgPosition: 0, podiums: 0, fastestLaps: 0, dnf: 0,
  avgPlacement: 0, top10Rate: 0, damagePerMatch: 0,
}

function buildPayload(form) {
  const achievements = form.achievementsText
    ? form.achievementsText.split('\n').map(s => s.trim()).filter(Boolean)
    : []
  const base = {
    playerType: form.playerType, fullName: form.fullName, nickname: form.nickname,
    matchesPlayed: Number(form.matchesPlayed),
    wins: Number(form.wins), losses: Number(form.losses),
    birthDate: form.birthDate || null,
    nationality: form.nationality || null,
    city: form.city || null,
    achievements,
    ...(form.teamId ? { team: { id: Number(form.teamId) } } : {}),
  }
  if (form.playerType === 'FPS')          return { ...base, accuracy: Number(form.accuracy), headshots: Number(form.headshots), kast: Number(form.kast), adr: Number(form.adr) }
  if (form.playerType === 'MOBA')         return { ...base, mainCharacter: form.mainCharacter, kills: Number(form.kills), deaths: Number(form.deaths), mobaAssists: Number(form.mobaAssists) }
  if (form.playerType === 'EFOOTBALL')    return { ...base, mainPosition: form.mainPosition, goalsScored: Number(form.goalsScored), goalsSaved: Number(form.goalsSaved), efbAssists: Number(form.efbAssists), shotsOnTarget: Number(form.shotsOnTarget), ballRecoveries: Number(form.ballRecoveries) }
  if (form.playerType === 'RACING')       return { ...base, avgPosition: Number(form.avgPosition), podiums: Number(form.podiums), fastestLaps: Number(form.fastestLaps), dnf: Number(form.dnf) }
  if (form.playerType === 'BATTLE_ROYALE')return { ...base, avgPlacement: Number(form.avgPlacement), kills: Number(form.kills), top10Rate: Number(form.top10Rate), damagePerMatch: Number(form.damagePerMatch) }
  return base
}

export default function PlayerDetail() {
  const { id } = useParams()
  const [player,     setPlayer]     = useState(null)
  const [teams,      setTeams]      = useState([])
  const [teamDetail, setTeamDetail] = useState(null)
  const [loading,    setLoad]       = useState(true)
  const [modal,      setModal]      = useState(false)
  const [form,       setForm]       = useState(emptyForm)
  const [saving,           setSaving]           = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [achAnchor,        setAchAnchor]        = useState(null)
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
      const [pRes, tRes] = await Promise.all([playerApi.getById(id), teamApi.getAll()])
      const p = pRes.data
      setPlayer(p)
      setTeams(tRes.data || [])
      if (p?.team?.id) {
        const tdRes = await teamApi.getById(p.team.id)
        setTeamDetail(tdRes.data)
      } else {
        setTeamDetail(null)
      }
    } catch(e) { console.error(e) }
    finally { setLoad(false) }
  }
  useEffect(() => { load() }, [id])

  const openEdit = () => {
    if (!player) return
    setForm({
      playerType: player.playerType || 'FPS', fullName: player.fullName || '', nickname: player.nickname || '',
      matchesPlayed: player.matchesPlayed || 0, wins: player.wins || 0, losses: player.losses || 0,
      teamId: player.team?.id || '',
      birthDate: player.birthDate || '', nationality: player.nationality || '', city: player.city || '',
      achievementsText: (player.achievements || []).join('\n'),
      accuracy: player.accuracy || 0, headshots: player.headshots || 0, kast: player.kast || 0, adr: player.adr || 0,
      mainCharacter: player.mainCharacter || '', kills: player.kills || 0, deaths: player.deaths || 0, mobaAssists: player.mobaAssists || 0,
      mainPosition: player.mainPosition || '', goalsScored: player.goalsScored || 0, goalsSaved: player.goalsSaved || 0, efbAssists: player.efbAssists || 0, shotsOnTarget: player.shotsOnTarget || 0, ballRecoveries: player.ballRecoveries || 0,
      avgPosition: player.avgPosition || 0, podiums: player.podiums || 0, fastestLaps: player.fastestLaps || 0, dnf: player.dnf || 0,
      avgPlacement: player.avgPlacement || 0, top10Rate: player.top10Rate || 0, damagePerMatch: player.damagePerMatch || 0,
    })
    setModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await playerApi.update(player.id, buildPayload(form))
      setModal(false)
      toast('Player updated.', 'success')
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

  if (!player) {
    return (
      <div className="text-center py-32">
        <p className="font-body text-text-muted">Player not found.</p>
        <Link to="/players" className="btn-ghost mt-4 inline-flex">Back</Link>
      </div>
    )
  }

  const color   = TYPE_COLOR[player.playerType] || '#94A3B8'
  const Icon    = TYPE_ICON[player.playerType]  || Users
  const total   = (player.wins || 0) + (player.losses || 0)
  const winRate = total > 0 ? Math.round((player.wins / total) * 100) : 0
  const winRateColor = winRate >= 75 ? '#3B82F6'
    : winRate >= 65 ? '#22C55E'
    : winRate >= 55 ? '#84CC16'
    : winRate >= 45 ? '#EAB308'
    : winRate >= 35 ? '#F97316'
    : winRate >= 20 ? '#F87171'
    : '#DC2626'
  const hasProfile = player.nationality || player.city || player.birthDate

  return (
    <div className="animate-fade-in">
      <Link to="/players" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary font-body text-sm mb-6 transition-colors cursor-pointer group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Players
      </Link>

      {/* ── Hero card ───────────────────────────────────────────────────── */}
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
                <h1 className="font-display text-2xl text-text-primary tracking-wide">{player.nickname}</h1>
                <Badge variant={TYPE_BADGE[player.playerType] || 'gray'}>{TYPE_LABEL[player.playerType] || player.playerType}</Badge>
              </div>
              <p className="font-body text-sm text-text-muted">{player.fullName}</p>
              {player.team && (
                <Link to={`/teams/${player.team.id}`} className="font-body text-xs text-accent-green hover:underline mt-0.5 block">
                  {player.team.name}
                </Link>
              )}
            </div>
          </div>

          {/* Stats + edit */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-3 flex-wrap">
              <StatPill label="Matches"  value={player.matchesPlayed} accent={color}   />
              <StatPill label="Win Rate" value={`${winRate}%`}        accent={winRateColor} />

              {/* Achievements pill */}
              <button ref={achBtnRef} onClick={toggleAchievements}
                className={`flex flex-col items-center px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                  showAchievements
                    ? 'border-yellow-500/50 bg-yellow-500/10'
                    : 'bg-bg-primary border-bg-border hover:border-yellow-500/30 hover:bg-yellow-500/5'
                }`}>
                <span className="font-display text-xl text-yellow-400">{player.achievements?.length || 0}</span>
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

        {/* W/L bar */}
        <div className="mt-4 pt-4 border-t border-bg-border">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-display text-sm text-accent-green">{player.wins}<span className="font-body text-xs text-text-dim ml-1">W</span></span>
            <span className="font-display text-sm text-red-400">{player.losses}<span className="font-body text-xs text-text-dim ml-1">L</span></span>
          </div>
          <div className="h-1.5 rounded-full bg-bg-primary overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${winRate}%`, background: `linear-gradient(90deg, ${winRateColor}, ${winRateColor}cc)` }} />
          </div>
        </div>
      </div>

      {/* ── Two-column: Game Stats | Player Profile ─────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-4">

        {/* Game stats — 2/3 */}
        <div className="col-span-2">
          {player.playerType === 'FPS' && (
            <div className="glass-card p-5 h-full">
              <h2 className="font-display text-xs text-text-muted uppercase tracking-widest mb-4">FPS Performance</h2>
              <StatRow icon={Target} label="Accuracy"        value={`${(player.accuracy || 0).toFixed(1)}%`} large />
              <StatRow icon={Zap}    label="KAST%"          value={player.kast != null ? `${player.kast.toFixed(1)}%` : '—'} large />
              <StatRow icon={Hash}   label="ADR"            value={player.adr  != null ? player.adr.toFixed(1) : '—'} />
              <StatRow icon={Zap}    label="Total Headshots" value={player.headshots} />
              <StatRow icon={Hash}   label="HS / Match"     value={player.matchesPlayed > 0 ? (player.headshots / player.matchesPlayed).toFixed(1) : '—'} />
            </div>
          )}
          {player.playerType === 'MOBA' && (
            <div className="glass-card p-5 h-full">
              <h2 className="font-display text-xs text-text-muted uppercase tracking-widest mb-4">MOBA Performance</h2>
              <StatRow icon={Sword}  label="Main Champion" value={player.mainCharacter || '—'} large />
              <StatRow icon={Zap}    label="Kills"    value={player.kills} />
              <StatRow icon={Skull}  label="Deaths"   value={player.deaths} />
              <StatRow icon={Target} label="Assists"  value={player.mobaAssists} />
              {(player.kills != null && player.deaths) && (
                <StatRow icon={Hash} label="KDA Ratio"
                  value={((player.kills + player.mobaAssists) / Math.max(player.deaths, 1)).toFixed(2)} />
              )}
            </div>
          )}
          {player.playerType === 'EFOOTBALL' && (() => {
            const isGK = ['gk', 'goalkeeper'].includes((player.mainPosition || '').toLowerCase().trim())
            return (
              <div className="glass-card p-5 h-full">
                <h2 className="font-display text-xs text-text-muted uppercase tracking-widest mb-4">eFootball Performance</h2>
                <StatRow icon={Footprints} label="Main Position" value={player.mainPosition || '—'} large />
                {isGK ? (
                  <>
                    <StatRow icon={Target} label="Goals Saved"      value={player.goalsSaved} />
                    <StatRow icon={Hash}   label="Ball Recoveries"  value={player.ballRecoveries} />
                    <StatRow icon={Zap}    label="Assists"           value={player.efbAssists} />
                  </>
                ) : (
                  <>
                    <StatRow icon={Target} label="Goals Scored"     value={player.goalsScored} />
                    <StatRow icon={Hash}   label="Shots on Target"  value={player.shotsOnTarget} />
                    <StatRow icon={Zap}    label="Ball Recoveries"  value={player.ballRecoveries} />
                    <StatRow icon={Star}   label="Assists"          value={player.efbAssists} />
                  </>
                )}
              </div>
            )
          })()}
          {player.playerType === 'RACING' && (
            <div className="glass-card p-5 h-full">
              <h2 className="font-display text-xs text-text-muted uppercase tracking-widest mb-4">Racing Performance</h2>
              <StatRow icon={Target} label="Avg. Position"   value={player.avgPosition != null ? player.avgPosition.toFixed(1) : '—'} large />
              <StatRow icon={Trophy} label="Podiums"         value={player.podiums} />
              <StatRow icon={Zap}    label="Fastest Laps"    value={player.fastestLaps} />
              <StatRow icon={Hash}   label="DNFs"            value={player.dnf} />
              {player.matchesPlayed > 0 && (
                <StatRow icon={Star} label="Podium Rate"
                  value={`${Math.round((player.podiums / (player.matchesPlayed * 3)) * 100)}%`} />
              )}
            </div>
          )}
          {player.playerType === 'BATTLE_ROYALE' && (
            <div className="glass-card p-5 h-full">
              <h2 className="font-display text-xs text-text-muted uppercase tracking-widest mb-4">Battle Royale Performance</h2>
              <StatRow icon={Target} label="Avg. Placement"    value={player.avgPlacement != null ? player.avgPlacement.toFixed(1) : '—'} large />
              <StatRow icon={Zap}    label="Top-10 Rate"       value={player.top10Rate != null ? `${player.top10Rate.toFixed(1)}%` : '—'} />
              <StatRow icon={Hash}   label="Total Kills"       value={player.kills} />
              <StatRow icon={Star}   label="Damage / Match"    value={player.damagePerMatch != null ? player.damagePerMatch.toFixed(0) : '—'} />
              {player.matchesPlayed > 0 && (
                <StatRow icon={Crosshair} label="Kills / Match"
                  value={((player.kills || 0) / player.matchesPlayed).toFixed(1)} />
              )}
            </div>
          )}
          {!['FPS','MOBA','EFOOTBALL','RACING','BATTLE_ROYALE'].includes(player.playerType) && (
            <div className="glass-card p-5 h-full flex items-center justify-center">
              <span className="font-body text-sm text-text-dim">No type-specific stats available.</span>
            </div>
          )}
        </div>

        {/* Player profile card — 1/3 */}
        <div className="col-span-1">
          <div className="glass-card p-5 h-full" style={{ borderColor: `${color}22` }}>
            <h2 className="font-display text-xs text-text-muted uppercase tracking-widest mb-2">Player Profile</h2>

            {hasProfile ? (
              <div>
                {player.nationality && (
                  <ProfileRow icon={null} label="Nationality">
                    <div className="flex items-center gap-2">
                      <FlagIcon nationality={player.nationality} size={22} />
                      <span className="font-body text-sm text-text-primary">{player.nationality}</span>
                    </div>
                  </ProfileRow>
                )}
                {player.city && (
                  <ProfileRow icon={MapPin} label="City">
                    <span className="font-body text-sm text-text-primary">{player.city}</span>
                  </ProfileRow>
                )}
                {player.birthDate && (
                  <ProfileRow icon={Calendar} label="Date of Birth">
                    <div>
                      <span className="font-body text-sm text-text-primary">{formatDate(player.birthDate)}</span>
                      {player.age != null && (
                        <span className="font-body text-xs text-text-muted ml-2 px-1.5 py-0.5 rounded bg-bg-primary border border-bg-border">
                          {player.age} yrs
                        </span>
                      )}
                    </div>
                  </ProfileRow>
                )}
                {player.team && (
                  <ProfileRow icon={Users} label="Team">
                    <Link to={`/teams/${player.team.id}`}
                      className="font-body text-sm text-accent-green hover:underline">
                      {player.team.name}
                    </Link>
                  </ProfileRow>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Users size={28} className="text-text-dim" />
                <p className="font-body text-xs text-text-dim text-center">No profile details yet.<br />Click edit to add them.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tournament History ───────────────────────────────────────────── */}
      {teamDetail?.tournaments?.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={13} className="text-text-muted" />
            <h2 className="font-display text-xs text-text-muted uppercase tracking-widest">Tournament History</h2>
          </div>
          <div className="space-y-2">
            {teamDetail.tournaments.map(t => (
              <div key={t.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-bg-primary border border-bg-border hover:border-text-dim transition-colors duration-150">
                <div>
                  <span className="font-body text-sm text-text-primary">{t.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {t.startDate && (
                      <span className="font-body text-xs text-text-dim">{formatMonthYear(t.startDate)}</span>
                    )}
                    {player.team && (
                      <>
                        {t.startDate && <span className="text-text-dim text-xs">·</span>}
                        <span className="font-body text-xs text-accent-green">{player.team.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={GAME_COLOR[t.game] || 'gray'}>{t.game}</Badge>
                  <Badge variant={STATUS_COLOR[t.status] || 'gray'}>{t.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Achievements popover (portal) ───────────────────────────────── */}
      {showAchievements && achAnchor && createPortal(
        <div ref={achPopRef}
          style={{ position: 'fixed', top: achAnchor.bottom + 8, right: window.innerWidth - achAnchor.right, width: 288, zIndex: 9999 }}
          className="glass-card p-4 shadow-xl">
          {player.achievements?.length > 0 ? (
            <div className="space-y-2.5">
              {player.achievements.map((a, i) => (
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

      {/* ── Edit modal ──────────────────────────────────────────────────── */}
      <Modal open={modal} onClose={() => setModal(false)} title="Edit Player" width="max-w-2xl">
        <div className="space-y-3">
          {/* Player type */}
          <div className="flex gap-2">
            {Object.entries(TYPE_META).map(([type, meta]) => (
              <button key={type} onClick={() => set('playerType', type)}
                className={`flex-1 py-1.5 rounded-lg border font-body text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  form.playerType === type
                    ? `border-accent-${meta.color} bg-accent-${meta.color}/10 text-accent-${meta.color}`
                    : 'border-bg-border text-text-muted hover:border-text-dim'
                }`}>
                {meta.label}
              </button>
            ))}
          </div>

          {/* Identity + team */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Full Name">
              <input className="input-field" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
            </Field>
            <Field label="Nickname">
              <input className="input-field" value={form.nickname} onChange={e => set('nickname', e.target.value)} />
            </Field>
            <Field label="Team">
              <select className="input-field" value={form.teamId} onChange={e => set('teamId', e.target.value)}>
                <option value="">No team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
          </div>

          {/* Profile */}
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

          {/* Record */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Matches">
              <input type="number" className="input-field" value={form.matchesPlayed} onChange={e => set('matchesPlayed', e.target.value)} min="0" />
            </Field>
            <Field label="Wins">
              <input type="number" className="input-field" value={form.wins} onChange={e => set('wins', e.target.value)} min="0" />
            </Field>
            <Field label="Losses">
              <input type="number" className="input-field" value={form.losses} onChange={e => set('losses', e.target.value)} min="0" />
            </Field>
          </div>

          {/* Achievements */}
          <Field label="Achievements (one per line)">
            <textarea className="input-field resize-none" rows={2}
              placeholder={"1st Place - Valorant Spring Cup 2026\nMVP - Season 3"}
              value={form.achievementsText}
              onChange={e => set('achievementsText', e.target.value)} />
          </Field>

          {/* Type-specific stats */}
          {form.playerType === 'FPS' && (
            <div className="grid grid-cols-4 gap-3 pt-2 border-t border-bg-border">
              <Field label="Accuracy (%)">
                <input type="number" step="0.1" className="input-field" value={form.accuracy} onChange={e => set('accuracy', e.target.value)} min="0" max="100" />
              </Field>
              <Field label="KAST%">
                <input type="number" step="0.1" className="input-field" value={form.kast} onChange={e => set('kast', e.target.value)} min="0" max="100" placeholder="74.2" />
              </Field>
              <Field label="ADR">
                <input type="number" step="0.1" className="input-field" value={form.adr} onChange={e => set('adr', e.target.value)} min="0" placeholder="152.3" />
              </Field>
              <Field label="Headshots">
                <input type="number" className="input-field" value={form.headshots} onChange={e => set('headshots', e.target.value)} min="0" />
              </Field>
            </div>
          )}
          {form.playerType === 'MOBA' && (
            <div className="grid grid-cols-4 gap-3 pt-2 border-t border-bg-border">
              <Field label="Champion">
                <input className="input-field" value={form.mainCharacter} onChange={e => set('mainCharacter', e.target.value)} />
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
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-bg-border">
              <Field label="Position">
                <input className="input-field" value={form.mainPosition} onChange={e => set('mainPosition', e.target.value)} placeholder="ST, CM, GK..." />
              </Field>
              <Field label="Goals Scored">
                <input type="number" className="input-field" value={form.goalsScored} onChange={e => set('goalsScored', e.target.value)} min="0" />
              </Field>
              <Field label="Goals Saved (GK)">
                <input type="number" className="input-field" value={form.goalsSaved} onChange={e => set('goalsSaved', e.target.value)} min="0" />
              </Field>
              <Field label="Assists">
                <input type="number" className="input-field" value={form.efbAssists} onChange={e => set('efbAssists', e.target.value)} min="0" />
              </Field>
              <Field label="Shots on Target">
                <input type="number" className="input-field" value={form.shotsOnTarget} onChange={e => set('shotsOnTarget', e.target.value)} min="0" />
              </Field>
              <Field label="Ball Recoveries">
                <input type="number" className="input-field" value={form.ballRecoveries} onChange={e => set('ballRecoveries', e.target.value)} min="0" />
              </Field>
            </div>
          )}

          {form.playerType === 'RACING' && (
            <div className="grid grid-cols-4 gap-3 pt-2 border-t border-bg-border">
              <Field label="Avg Position">
                <input type="number" step="0.1" className="input-field" value={form.avgPosition} onChange={e => set('avgPosition', e.target.value)} min="1" />
              </Field>
              <Field label="Podiums">
                <input type="number" className="input-field" value={form.podiums} onChange={e => set('podiums', e.target.value)} min="0" />
              </Field>
              <Field label="Fastest Laps">
                <input type="number" className="input-field" value={form.fastestLaps} onChange={e => set('fastestLaps', e.target.value)} min="0" />
              </Field>
              <Field label="DNFs">
                <input type="number" className="input-field" value={form.dnf} onChange={e => set('dnf', e.target.value)} min="0" />
              </Field>
            </div>
          )}
          {form.playerType === 'BATTLE_ROYALE' && (
            <div className="grid grid-cols-4 gap-3 pt-2 border-t border-bg-border">
              <Field label="Avg Placement">
                <input type="number" step="0.1" className="input-field" value={form.avgPlacement} onChange={e => set('avgPlacement', e.target.value)} min="1" />
              </Field>
              <Field label="Total Kills">
                <input type="number" className="input-field" value={form.kills} onChange={e => set('kills', e.target.value)} min="0" />
              </Field>
              <Field label="Top-10 Rate (%)">
                <input type="number" step="0.1" className="input-field" value={form.top10Rate} onChange={e => set('top10Rate', e.target.value)} min="0" max="100" />
              </Field>
              <Field label="Damage / Match">
                <input type="number" step="0.1" className="input-field" value={form.damagePerMatch} onChange={e => set('damagePerMatch', e.target.value)} min="0" />
              </Field>
            </div>
          )}

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
