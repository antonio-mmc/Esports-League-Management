import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Trophy, Shield, Swords, GitBranch } from 'lucide-react'
import Badge from '../components/Badge'
import { tournamentApi } from '../services/api'

const STATUS_COLOR = { ACTIVE: 'green', FINISHED: 'gray', COMPLETED: 'gray', PENDING: 'cyan', UPCOMING: 'cyan' }

function StatPill({ label, value, accent }) {
  return (
    <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-bg-primary border border-bg-border">
      <span className="font-display text-xl" style={{ color: accent }}>{value ?? '—'}</span>
      <span className="font-body text-xs text-text-dim uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  )
}

function formatLabel(format) {
  switch (format) {
    case 'SINGLE_ELIMINATION': return 'Knockout'
    case 'DOUBLE_ELIMINATION': return 'Double Elimination'
    case 'GROUP_STAGE':        return 'Group Stage'
    case 'LEAGUE':
    default:                   return 'League'
  }
}

function getRoundLabel(format, index, total) {
  if (!format || format === 'LEAGUE') return null
  if (format === 'SINGLE_ELIMINATION') {
    if (index === total - 1) return 'Grand Final'
    if (total === 2) return 'Semi-Final'
    return `Round ${index + 1}`
  }
  if (format === 'DOUBLE_ELIMINATION') {
    const labels = ['Winners Final', 'Losers Final', 'Grand Final']
    return labels[index] ?? `Round ${index + 1}`
  }
  return null
}

export default function TournamentDetail() {
  const { id } = useParams()
  const [tournament, setTournament] = useState(null)
  const [loading,    setLoad]       = useState(true)

  useEffect(() => {
    tournamentApi.getById(id)
      .then(r => setTournament(r.data))
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

  if (!tournament) {
    return (
      <div className="text-center py-32">
        <p className="font-body text-text-muted">Tournament not found.</p>
        <Link to="/tournaments" className="btn-ghost mt-4 inline-flex">Back</Link>
      </div>
    )
  }

  const teams          = tournament.participatingTeams || []
  const matches        = tournament.matches || []
  const completedCount = matches.filter(m => m.resultRecorded).length
  const isElim         = tournament.format && tournament.format !== 'LEAGUE'

  const getWinner = (m) => {
    if (!m.resultRecorded) return null
    if (m.teamAScore > m.teamBScore) return m.teamA?.name
    if (m.teamBScore > m.teamAScore) return m.teamB?.name
    return 'Draw'
  }

  const sortedTeams   = [...teams].sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
  const sortedMatches = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date))

  return (
    <div className="animate-fade-in">
      <Link to="/tournaments" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary font-body text-sm mb-6 transition-colors cursor-pointer group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Tournaments
      </Link>

      {/* Hero */}
      <div className="glass-card p-6 mb-6" style={{ borderColor: 'rgba(139,92,246,0.2)', boxShadow: '0 0 40px rgba(139,92,246,0.05)' }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-accent-purple/10 flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: '0 0 24px rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
              {isElim ? <GitBranch size={26} className="text-accent-purple" /> : <Trophy size={26} className="text-accent-purple" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl text-text-primary tracking-wide">{tournament.name}</h1>
                <Badge variant={STATUS_COLOR[tournament.status] || 'gray'}>{tournament.status}</Badge>
                {isElim && <Badge variant="amber">{formatLabel(tournament.format)}</Badge>}
              </div>
              <p className="font-body text-sm text-text-muted mt-0.5">
                {tournament.specificGame || tournament.game}
                {' · '}{teams.length} teams · {matches.length} matches
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <StatPill label="Teams"    value={teams.length}   accent="#8B5CF6" />
            <StatPill label="Matches"  value={matches.length} accent="#06B6D4" />
            <StatPill label="Finished" value={completedCount} accent="#22C55E" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams — standings for league, participants list for elimination */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={15} className="text-accent-cyan" />
            <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">
              {isElim ? 'Participants' : 'Standings'}
            </h2>
            <span className="font-body text-xs text-text-dim ml-1">({teams.length})</span>
          </div>

          {teams.length === 0 ? (
            <p className="text-sm text-text-dim font-body text-center py-10">No teams registered.</p>
          ) : isElim ? (
            /* Elimination: plain participants list */
            <div className="space-y-2">
              {teams.map((t) => (
                <Link key={t.id} to={`/teams/${t.id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-primary border border-transparent hover:border-bg-border transition-all duration-150 group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center flex-shrink-0"
                    style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
                    <Shield size={14} className="text-accent-purple" />
                  </div>
                  <span className="font-body font-semibold text-sm text-text-primary flex-1 group-hover:text-white transition-colors">{t.name}</span>
                  <span className="font-body text-xs text-text-dim">{t.game}</span>
                </Link>
              ))}
            </div>
          ) : (
            /* League: standings with points */
            <div className="space-y-2">
              {sortedTeams.map((t, i) => {
                const total   = (t.wins || 0) + (t.losses || 0)
                const winRate = total > 0 ? Math.round((t.wins / total) * 100) : 0
                return (
                  <Link key={t.id} to={`/teams/${t.id}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-primary border border-transparent hover:border-bg-border transition-all duration-150 group cursor-pointer">
                    <span className={`font-display text-sm w-5 flex-shrink-0 ${i === 0 ? 'text-accent-green' : i === 1 ? 'text-text-muted' : i === 2 ? 'text-accent-cyan' : 'text-text-dim'}`}>
                      {i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center flex-shrink-0"
                      style={{ border: '1px solid rgba(6,182,212,0.2)' }}>
                      <Shield size={14} className="text-accent-cyan" />
                    </div>
                    <span className="font-body font-semibold text-sm text-text-primary flex-1 group-hover:text-white transition-colors">{t.name}</span>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="flex gap-3 font-body text-xs">
                        <span className="text-accent-green font-semibold">{t.wins ?? 0}W</span>
                        <span className="text-red-400">{t.losses ?? 0}L</span>
                      </div>
                      <Badge variant="green">{t.points ?? 0} pts</Badge>
                      <span className="font-body text-xs text-text-dim w-10 text-right">{winRate}%</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Matches */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Swords size={15} className="text-accent-blue" />
            <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">Matches</h2>
            <span className="font-body text-xs text-text-dim ml-1">({matches.length})</span>
          </div>

          {matches.length === 0 ? (
            <p className="font-body text-sm text-text-dim text-center py-4">No matches scheduled.</p>
          ) : (
            <div className="space-y-2">
              {sortedMatches.map((m, idx) => {
                const winner     = getWinner(m)
                const roundLabel = getRoundLabel(tournament.format, idx, sortedMatches.length)
                return (
                  <div key={m.id} className="px-3 py-2.5 rounded-lg hover:bg-bg-primary transition-colors duration-150">
                    {roundLabel && (
                      <p className="font-body text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
                        {roundLabel}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-body text-xs font-semibold text-text-primary truncate flex-1">{m.teamA?.name}</span>
                      {m.resultRecorded ? (
                        <span className="font-display text-sm font-bold text-text-primary flex-shrink-0 px-1">
                          {m.teamAScore} <span className="text-text-dim text-xs font-body">:</span> {m.teamBScore}
                        </span>
                      ) : (
                        <span className="font-body text-xs text-text-dim flex-shrink-0 px-2">vs</span>
                      )}
                      <span className="font-body text-xs font-semibold text-text-primary truncate flex-1 text-right">{m.teamB?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-body text-xs text-text-dim">{m.date}</span>
                      {m.resultRecorded
                        ? <Badge variant={winner === 'Draw' ? 'cyan' : 'green'}>{winner === 'Draw' ? 'Draw' : `${winner} won`}</Badge>
                        : <Badge variant="gray">Pending</Badge>
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
