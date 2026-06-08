import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Shield, UserCheck, Users, Trophy,
  Crosshair, Sword, Footprints, Swords, Star, Car, Skull
} from 'lucide-react'
import Badge from '../components/Badge'
import { teamApi } from '../services/api'

const TYPE_COLOR  = { FPS: '#06B6D4', MOBA: '#8B5CF6', EFOOTBALL: '#22C55E', RACING: '#F59E0B', BATTLE_ROYALE: '#EF4444', GENERIC: '#94A3B8' }
const TYPE_BADGE  = { FPS: 'cyan',    MOBA: 'purple',  EFOOTBALL: 'green',   RACING: 'orange', BATTLE_ROYALE: 'red', GENERIC: 'gray' }
const TYPE_LABEL  = { FPS: 'FPS',     MOBA: 'MOBA',    EFOOTBALL: 'eFootball', RACING: 'Racing', BATTLE_ROYALE: 'Battle Royale', GENERIC: 'Generic' }
const TYPE_ICON   = { FPS: Crosshair, MOBA: Sword,     EFOOTBALL: Footprints, RACING: Car, BATTLE_ROYALE: Skull }

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
      <span className="font-body text-xs text-text-dim">Character: <span className="text-text-muted">{player.mainCharacter}</span></span>
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

export default function TeamDetail() {
  const { id } = useParams()
  const [team, setTeam]    = useState(null)
  const [loading, setLoad] = useState(true)

  useEffect(() => {
    teamApi.getById(id)
      .then(r => setTeam(r.data))
      .catch(console.error)
      .finally(() => setLoad(false))
  }, [id])

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
  const tournaments = team.tournaments || []
  const total       = team.wins + team.draws + team.losses
  const winRate     = total > 0 ? Math.round((team.wins / total) * 100) : 0

  const byType = players.reduce((acc, p) => {
    const t = p.playerType || 'GENERIC'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})

  const topPlayer = [...players].sort((a, b) => {
    const wr = p => (p.wins + p.losses) > 0 ? p.wins / (p.wins + p.losses) : 0
    return wr(b) - wr(a)
  })[0]

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link to="/teams" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary font-body text-sm mb-6 transition-colors cursor-pointer group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Teams
      </Link>

      {/* Hero */}
      <div className="glass-card p-6 mb-6" style={{ borderColor: 'rgba(6,182,212,0.2)', boxShadow: '0 0 40px rgba(6,182,212,0.05)' }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-accent-cyan/10 flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: '0 0 24px rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.3)' }}>
              <Shield size={26} className="text-accent-cyan" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-text-primary tracking-wide">{team.name}</h1>
              <p className="font-body text-sm text-text-muted mt-0.5">
                {players.length} players · {Object.keys(byType).map(t => TYPE_LABEL[t] || t).join(', ')}
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <StatPill label="Wins"    value={team.wins}   accent="#22C55E" />
            <StatPill label="Draws"   value={team.draws}  accent="#06B6D4" />
            <StatPill label="Losses"  value={team.losses} accent="#F87171" />
            <StatPill label="Points"  value={team.points} accent="#8B5CF6" />
            <StatPill label="Win Rate" value={`${winRate}%`} accent="#22C55E" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players list */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Users size={15} className="text-accent-green" />
            <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">Players</h2>
            <span className="font-body text-xs text-text-dim ml-1">({players.length})</span>
          </div>

          {players.length === 0 ? (
            <p className="text-sm text-text-dim font-body text-center py-10">No players in this team.</p>
          ) : (
            <div className="space-y-2">
              {players.map((p) => {
                const Icon  = TYPE_ICON[p.playerType] || Users
                const color = TYPE_COLOR[p.playerType] || '#94A3B8'
                const pTotal = p.wins + p.losses
                const pWr    = pTotal > 0 ? Math.round((p.wins / pTotal) * 100) : 0
                const isMVP  = topPlayer?.id === p.id

                return (
                  <div key={p.id}
                    className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-bg-primary transition-colors duration-150"
                    style={{ border: '1px solid transparent', ...(isMVP ? { borderColor: 'rgba(34,197,94,0.15)', background: 'rgba(34,197,94,0.03)' } : {}) }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${color}18` }}>
                      <Icon size={15} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-body font-semibold text-sm text-text-primary">{p.nickname}</span>
                        {isMVP && (
                          <span className="flex items-center gap-1 font-body text-xs text-accent-green font-semibold">
                            <Star size={10} fill="currentColor" /> MVP
                          </span>
                        )}
                        <Badge variant={TYPE_BADGE[p.playerType] || 'gray'}>{TYPE_LABEL[p.playerType] || p.playerType}</Badge>
                      </div>
                      <p className="font-body text-xs text-text-dim mt-0.5">{p.fullName}</p>
                      <PlayerSpecific player={p} />
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="font-body text-xs text-text-dim">
                        <span className="text-accent-green font-semibold">{p.wins}W</span>
                        {' '}<span className="text-red-400">{p.losses}L</span>
                      </div>
                      <div className="font-body text-xs text-text-muted mt-0.5">{pWr}% WR</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Coach */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck size={15} className="text-accent-green" />
              <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">Coach</h2>
            </div>
            {coach ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center flex-shrink-0"
                  style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
                  <UserCheck size={18} className="text-accent-green" />
                </div>
                <div>
                  <p className="font-body font-semibold text-sm text-text-primary">{coach.name}</p>
                  <p className="font-body text-xs text-text-muted">{coach.email}</p>
                </div>
              </div>
            ) : (
              <p className="font-body text-sm text-text-dim text-center py-4">No coach assigned.</p>
            )}
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
                {tournaments.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-bg-primary transition-colors duration-150">
                    <div>
                      <p className="font-body text-sm text-text-primary font-medium">{t.name}</p>
                      <p className="font-body text-xs text-text-dim">{t.game}</p>
                    </div>
                    <Badge variant={t.status === 'ACTIVE' ? 'green' : t.status === 'UPCOMING' ? 'cyan' : 'gray'}>
                      {t.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Composition */}
          {Object.keys(byType).length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Swords size={15} className="text-accent-blue" />
                <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">Composition</h2>
              </div>
              <div className="space-y-3">
                {Object.entries(byType).map(([type, count]) => {
                  const pct   = Math.round((count / players.length) * 100)
                  const color = TYPE_COLOR[type] || '#94A3B8'
                  return (
                    <div key={type}>
                      <div className="flex justify-between mb-1.5">
                        <span className="font-body text-xs text-text-muted uppercase tracking-wider">{TYPE_LABEL[type] || type}</span>
                        <span className="font-body text-xs text-text-primary font-semibold">{count}</span>
                      </div>
                      <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
