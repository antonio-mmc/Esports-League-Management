import { useEffect, useState, useMemo } from 'react'
import { Users, Shield, Trophy, Swords, CheckCircle2, Calendar, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import StatCard from '../components/StatCard'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import { GAME_FILTERS, useGameFilter } from '../context/GameFilterContext'
import { dashboardApi, tournamentApi, matchApi, teamApi, coachApi } from '../services/api'

const TYPE_COLOR = { FPS: '#06B6D4', MOBA: '#8B5CF6', EFOOTBALL: '#22C55E', RACING: '#F59E0B', BATTLE_ROYALE: '#EF4444', GENERIC: '#94A3B8' }
const TYPE_LABEL = { FPS: 'FPS', MOBA: 'MOBA', EFOOTBALL: 'eFootball', RACING: 'Racing', BATTLE_ROYALE: 'Battle Royale', GENERIC: 'Generic' }
const TYPE_BADGE = { FPS: 'cyan', MOBA: 'purple', EFOOTBALL: 'green', RACING: 'orange', BATTLE_ROYALE: 'red', GENERIC: 'gray' }
const STATUS_COLOR = { ACTIVE: 'green', FINISHED: 'gray', PENDING: 'cyan', UPCOMING: 'cyan' }

function matchesGame(tournamentGame, filterKey) {
  if (filterKey === 'ALL') return true
  const g = (tournamentGame || '').toUpperCase()
  if (filterKey === 'EFOOTBALL') return g.includes('EFOOTBALL') || g.includes('FOOTBALL') || g.includes('FIFA')
  if (filterKey === 'BATTLE_ROYALE') return g.includes('BATTLE_ROYALE') || g.includes('BATTLE ROYALE') || g.includes('ROYALE')
  return g.includes(filterKey)
}

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
}

export default function Dashboard() {
  const { gameFilter } = useGameFilter()
  const [stats,       setStats]       = useState(null)
  const [topPlayers,  setTopPlayers]  = useState([])
  const [breakdown,   setBreakdown]   = useState({})
  const [tournaments, setTournaments] = useState([])
  const [matches,     setMatches]     = useState([])
  const [teams,       setTeams]       = useState([])
  const [coaches,     setCoaches]     = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const load = async () => {
      const [sRes, pRes, bRes, tRes, mRes, teRes, cRes] = await Promise.allSettled([
        dashboardApi.getStats(),
        dashboardApi.getTopPlayers(),
        dashboardApi.getGameBreakdown(),
        tournamentApi.getAll(),
        matchApi.getAll(),
        teamApi.getAll(),
        coachApi.getAll(),
      ])
      if (sRes.status  === 'fulfilled') setStats(sRes.value.data)
      if (pRes.status  === 'fulfilled') setTopPlayers(pRes.value.data || [])
      if (bRes.status  === 'fulfilled') setBreakdown(bRes.value.data || {})
      if (tRes.status  === 'fulfilled') setTournaments(tRes.value.data || [])
      if (mRes.status  === 'fulfilled') setMatches(mRes.value.data || [])
      if (teRes.status === 'fulfilled') setTeams(teRes.value.data || [])
      if (cRes.status  === 'fulfilled') setCoaches(cRes.value.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filteredTopPlayers = useMemo(() =>
    gameFilter === 'ALL' ? topPlayers : topPlayers.filter(p => p.playerType === gameFilter),
  [topPlayers, gameFilter])

  const filteredTournaments = useMemo(() =>
    tournaments
      .filter(t => matchesGame(t.game, gameFilter))
      .sort((a, b) => {
        const order = { ACTIVE: 0, UPCOMING: 1, PENDING: 1, FINISHED: 2 }
        return (order[a.status] ?? 3) - (order[b.status] ?? 3)
      }),
  [tournaments, gameFilter])

  const filteredMatches = useMemo(() =>
    matches.filter(m => matchesGame(m.tournament?.game, gameFilter)),
  [matches, gameFilter])

  const recentResults = useMemo(() =>
    filteredMatches
      .filter(m => m.resultRecorded)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5),
  [filteredMatches])

  const nextMatches = useMemo(() =>
    filteredMatches
      .filter(m => !m.resultRecorded)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5),
  [filteredMatches])

  const filteredStats = useMemo(() => {
    if (gameFilter === 'ALL') return {
      players:          stats?.players,
      teams:            stats?.teams,
      tournaments:      stats?.tournaments,
      completedMatches: stats?.completedMatches,
    }
    return {
      players:          breakdown[gameFilter] || 0,
      teams:            teams.filter(t => (t.players || []).some(p => p.playerType === gameFilter)).length,
      tournaments:      filteredTournaments.length,
      completedMatches: filteredMatches.filter(m => m.resultRecorded).length,
    }
  }, [stats, breakdown, teams, filteredTournaments, filteredMatches, gameFilter])

  const totalPlayers = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1

  // coaches per game type — derived from teams' dominant player type
  const coachesByType = useMemo(() => {
    const map = { FPS: 0, MOBA: 0, EFOOTBALL: 0, RACING: 0, BATTLE_ROYALE: 0 }
    teams.forEach(team => {
      if (!team.coach) return
      const counts = {}
      ;(team.players || []).forEach(p => {
        if (p.playerType && map[p.playerType] !== undefined)
          counts[p.playerType] = (counts[p.playerType] || 0) + 1
      })
      const dominant = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0]
      if (dominant) map[dominant]++
    })
    return map
  }, [teams])

  const topTeams = useMemo(() =>
    [...teams].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5),
  [teams])

  const teamsByType = useMemo(() => {
    const map = { FPS: 0, MOBA: 0, EFOOTBALL: 0, RACING: 0, BATTLE_ROYALE: 0 }
    teams.forEach(team => {
      const counts = {}
      ;(team.players || []).forEach(p => {
        if (p.playerType && map[p.playerType] !== undefined)
          counts[p.playerType] = (counts[p.playerType] || 0) + 1
      })
      const dominant = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0]
      if (dominant) map[dominant]++
    })
    return map
  }, [teams])

  const topCoaches = useMemo(() =>
    [...coaches]
      .sort((a, b) => (b.team?.points || 0) - (a.team?.points || 0))
      .slice(0, 5),
  [coaches])

  const getWinner = (m) => {
    if (!m.resultRecorded) return null
    if (m.teamAScore > m.teamBScore) return m.teamA?.name
    if (m.teamBScore > m.teamAScore) return m.teamB?.name
    return 'Draw'
  }

  const statCards = [
    { label: 'Players',     value: filteredStats.players,          icon: Users,  color: 'green',  to: '/players'     },
    { label: 'Teams',       value: filteredStats.teams,            icon: Shield, color: 'cyan',   to: '/teams'       },
    { label: 'Tournaments', value: filteredStats.tournaments,      icon: Trophy, color: 'purple', to: '/tournaments' },
    { label: 'Matches',     value: filteredStats.completedMatches, icon: Swords, color: 'blue',   to: '/matches'     },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" subtitle="League overview" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Link key={s.label} to={s.to} className="block">
            <StatCard {...s} />
          </Link>
        ))}
      </div>

      {/* Content area — transitions on filter change */}
      <AnimatePresence mode="wait">
        <motion.div key={gameFilter} {...fadeUp}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}>

          {gameFilter === 'ALL' ? (
            <>
              {/* Row 2: Top Players | Top Teams | Top Coaches */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Top Players */}
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-sm text-text-primary tracking-wide uppercase">Top Players</h3>
                    <Link to="/players" className="font-body text-xs text-accent-green hover:underline cursor-pointer">View all</Link>
                  </div>
                  {topPlayers.length === 0 && !loading ? (
                    <p className="text-sm text-text-dim font-body text-center py-8">Minimum 3 matches to appear.</p>
                  ) : (
                    <div className="space-y-1">
                      {topPlayers.slice(0, 5).map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3 py-1 px-3 rounded-lg hover:bg-bg-primary transition-colors duration-150">
                          <span className="font-display text-xs w-4 text-text-dim">{i + 1}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-body text-sm text-text-primary font-semibold truncate">{p.nickname}</p>
                            <p className="font-body text-xs text-text-dim truncate">{p.teamName || '—'}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={TYPE_BADGE[p.playerType] || 'gray'}>{TYPE_LABEL[p.playerType] || p.playerType}</Badge>
                            <span className="font-body text-xs font-semibold text-accent-green">{p.winRate}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Teams */}
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-sm text-text-primary tracking-wide uppercase">Top Teams</h3>
                    <Link to="/teams" className="font-body text-xs text-accent-green hover:underline cursor-pointer">View all</Link>
                  </div>
                  {topTeams.length === 0 && !loading ? (
                    <p className="text-sm text-text-dim font-body text-center py-8">No teams yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {topTeams.map((t, i) => {
                        const total = (t.wins || 0) + (t.draws || 0) + (t.losses || 0)
                        const wr    = total > 0 ? Math.round((t.wins / total) * 100) : 0
                        const typeCounts = {}
                        ;(t.players || []).forEach(p => {
                          if (p.playerType) typeCounts[p.playerType] = (typeCounts[p.playerType] || 0) + 1
                        })
                        const modeLabel = Object.entries(typeCounts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([ty]) => TYPE_LABEL[ty] || ty)
                          .join(' · ') || '—'
                        return (
                          <Link key={t.id} to={`/teams/${t.id}`}
                            className="flex items-center gap-3 py-1 px-3 rounded-lg hover:bg-bg-primary transition-colors duration-150">
                            <span className={`font-display text-xs w-4 flex-shrink-0 ${i === 0 ? 'text-accent-green' : i === 1 ? 'text-text-muted' : i === 2 ? 'text-accent-cyan' : 'text-text-dim'}`}>
                              {i + 1}
                            </span>
                            <div className="w-6 h-6 rounded bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                              <Shield size={11} className="text-accent-cyan" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-body text-sm text-text-primary font-semibold truncate">{t.name}</p>
                              <p className="font-body text-xs text-text-dim truncate">{modeLabel}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="green">{t.points ?? 0}</Badge>
                              <span className="font-body text-xs text-text-dim w-8 text-right">{wr}%</span>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Top Coaches */}
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-sm text-text-primary tracking-wide uppercase">Top Coaches</h3>
                    <Link to="/coaches" className="font-body text-xs text-accent-green hover:underline cursor-pointer">View all</Link>
                  </div>
                  {topCoaches.length === 0 && !loading ? (
                    <p className="text-sm text-text-dim font-body text-center py-8">No coaches yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {topCoaches.map((c, i) => {
                        const total = (c.team?.wins || 0) + (c.team?.draws || 0) + (c.team?.losses || 0)
                        const wr    = total > 0 ? Math.round((c.team.wins / total) * 100) : null
                        return (
                          <div key={c.id} className="flex items-center gap-3 py-1 px-3 rounded-lg hover:bg-bg-primary transition-colors duration-150">
                            <span className={`font-display text-xs w-4 flex-shrink-0 ${i === 0 ? 'text-accent-green' : i === 1 ? 'text-text-muted' : i === 2 ? 'text-accent-cyan' : 'text-text-dim'}`}>
                              {i + 1}
                            </span>
                            <div className="w-6 h-6 rounded bg-accent-green/10 flex items-center justify-center flex-shrink-0">
                              <UserCheck size={11} className="text-accent-green" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-body text-sm text-text-primary font-semibold truncate">{c.name}</p>
                              <p className="font-body text-xs text-text-dim truncate">{c.team?.name || '—'}</p>
                            </div>
                            {wr !== null && (
                              <span className="font-body text-xs font-semibold text-accent-green flex-shrink-0">{wr}%</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Stats by Mode + Tournaments side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats by Mode */}
                <div className="glass-card p-5">
                  <h3 className="font-display text-sm text-text-primary tracking-wide mb-5 uppercase">Stats by Mode</h3>
                  <div className="space-y-5">
                    {['FPS', 'MOBA', 'EFOOTBALL', 'RACING', 'BATTLE_ROYALE'].map(type => {
                      const count      = breakdown[type] || 0
                      const pct        = totalPlayers > 1 ? Math.round((count / totalPlayers) * 100) : 0
                      const color      = TYPE_COLOR[type] || '#94A3B8'
                      const coachCount = coachesByType[type] || 0
                      const teamCount  = teamsByType[type] || 0
                      return (
                        <div key={type}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-body text-xs font-medium text-text-muted uppercase tracking-wider">{TYPE_LABEL[type]}</span>
                            <div className="flex items-center gap-3 font-body text-xs">
                              <span className="flex items-center gap-1 text-text-dim" title="Players">
                                <Users size={10} />{count}
                              </span>
                              <span className="flex items-center gap-1 text-text-dim" title="Teams">
                                <Shield size={10} />{teamCount}
                              </span>
                              <span className="flex items-center gap-1 text-text-dim" title="Coaches">
                                <UserCheck size={10} />{coachCount}
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: color, boxShadow: count > 0 ? `0 0 8px ${color}` : 'none' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Tournaments */}
                <div className="glass-card p-5 lg:col-span-2">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Trophy size={15} className="text-accent-purple" />
                      <h3 className="font-display text-sm text-text-primary tracking-wide uppercase">Tournaments</h3>
                      <span className="font-body text-xs text-text-dim">({tournaments.length})</span>
                    </div>
                    <Link to="/tournaments" className="font-body text-xs text-accent-green hover:underline cursor-pointer">View all</Link>
                  </div>
                  {filteredTournaments.length === 0 && !loading ? (
                    <p className="text-sm text-text-dim font-body text-center py-8">No tournaments yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredTournaments.map(t => (
                        <Link key={t.id} to={`/tournaments/${t.id}`}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-bg-border hover:border-accent-purple/30 hover:bg-bg-primary transition-all duration-150 group cursor-pointer">
                          <div className="w-9 h-9 rounded-lg bg-accent-purple/10 flex items-center justify-center flex-shrink-0"
                            style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
                            <Trophy size={16} className="text-accent-purple" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-body text-sm font-semibold text-text-primary truncate group-hover:text-white transition-colors">{t.name}</p>
                            <p className="font-body text-xs text-text-dim truncate">{t.game} · {t.participatingTeams?.length ?? 0} teams</p>
                          </div>
                          <Badge variant={STATUS_COLOR[t.status] || 'gray'}>{t.status}</Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Recent Results */}
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={15} className="text-accent-green" />
                    <h3 className="font-display text-sm text-text-primary tracking-wide uppercase">Recent Results</h3>
                  </div>
                  {recentResults.length === 0 && !loading ? (
                    <p className="text-sm text-text-dim font-body text-center py-8">No results yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {recentResults.map(m => {
                        const winner = getWinner(m)
                        return (
                          <div key={m.id} className="px-3 py-2.5 rounded-lg hover:bg-bg-primary transition-colors duration-150">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-body text-xs font-semibold text-text-primary truncate flex-1">{m.teamA?.name}</span>
                              <span className="font-display text-sm font-bold text-text-primary flex-shrink-0 px-2">
                                {m.teamAScore} <span className="text-text-dim text-xs font-body">:</span> {m.teamBScore}
                              </span>
                              <span className="font-body text-xs font-semibold text-text-primary truncate flex-1 text-right">{m.teamB?.name}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="font-body text-xs text-text-dim">{m.date}</span>
                              <Badge variant={winner === 'Draw' ? 'cyan' : 'green'}>
                                {winner === 'Draw' ? 'Draw' : `${winner} won`}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Next Matches */}
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={15} className="text-accent-blue" />
                    <h3 className="font-display text-sm text-text-primary tracking-wide uppercase">Next Matches</h3>
                  </div>
                  {nextMatches.length === 0 && !loading ? (
                    <p className="text-sm text-text-dim font-body text-center py-8">No upcoming matches.</p>
                  ) : (
                    <div className="space-y-1">
                      {nextMatches.map(m => (
                        <div key={m.id} className="px-3 py-2.5 rounded-lg hover:bg-bg-primary transition-colors duration-150">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-body text-xs font-semibold text-text-primary truncate flex-1">{m.teamA?.name}</span>
                            <span className="font-body text-xs text-text-dim flex-shrink-0 px-2">vs</span>
                            <span className="font-body text-xs font-semibold text-text-primary truncate flex-1 text-right">{m.teamB?.name}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-body text-xs text-text-dim">{m.date}</span>
                            {m.tournament && (
                              <span className="font-body text-xs text-text-dim truncate max-w-28">{m.tournament.name}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Players (filtered) */}
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-sm text-text-primary tracking-wide uppercase">Top Players</h3>
                    <Link to="/players" className="font-body text-xs text-accent-green hover:underline cursor-pointer">View all</Link>
                  </div>
                  {filteredTopPlayers.length === 0 && !loading ? (
                    <p className="text-sm text-text-dim font-body text-center py-8">Minimum 3 matches to appear.</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredTopPlayers.slice(0, 6).map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-bg-primary transition-colors duration-150">
                          <span className="font-display text-xs w-4 text-text-dim">{i + 1}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-body text-sm text-text-primary font-semibold truncate">{p.nickname}</p>
                            <p className="font-body text-xs text-text-dim truncate">{p.teamName || '—'}</p>
                          </div>
                          <span className="font-body text-xs font-semibold text-accent-green flex-shrink-0">{p.winRate}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tournaments filtered by game mode — same card format as General */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Trophy size={15} className="text-accent-purple" />
                    <h3 className="font-display text-sm text-text-primary tracking-wide uppercase">Tournaments</h3>
                    <span className="font-body text-xs text-text-dim">({filteredTournaments.length})</span>
                  </div>
                  <Link to="/tournaments" className="font-body text-xs text-accent-green hover:underline cursor-pointer">View all</Link>
                </div>
                {filteredTournaments.length === 0 && !loading ? (
                  <p className="text-sm text-text-dim font-body text-center py-8">No tournaments for this mode yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredTournaments.map(t => (
                      <Link key={t.id} to={`/tournaments/${t.id}`}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-bg-border hover:border-accent-purple/30 hover:bg-bg-primary transition-all duration-150 group cursor-pointer">
                        <div className="w-9 h-9 rounded-lg bg-accent-purple/10 flex items-center justify-center flex-shrink-0"
                          style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
                          <Trophy size={16} className="text-accent-purple" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-sm font-semibold text-text-primary truncate group-hover:text-white transition-colors">{t.name}</p>
                          <p className="font-body text-xs text-text-dim truncate">{t.game} · {t.participatingTeams?.length ?? 0} teams</p>
                        </div>
                        <Badge variant={STATUS_COLOR[t.status] || 'gray'}>{t.status}</Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
