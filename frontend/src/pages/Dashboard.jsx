import { useEffect, useState } from 'react'
import { Users, UserCheck, Shield, Trophy, Swords, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import { dashboardApi } from '../services/api'

const TYPE_COLOR = { FPS: '#06B6D4', MOBA: '#8B5CF6', EFOOTBALL: '#22C55E', GENERIC: '#94A3B8' }
const TYPE_LABEL = { FPS: 'FPS', MOBA: 'MOBA', EFOOTBALL: 'eFootball', GENERIC: 'Generic' }
const TYPE_BADGE = { FPS: 'cyan', MOBA: 'purple', EFOOTBALL: 'green', GENERIC: 'gray' }

export default function Dashboard() {
  const [stats,       setStats]       = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [topPlayers,  setTopPlayers]  = useState([])
  const [breakdown,   setBreakdown]   = useState({})
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const load = async () => {
      const [sRes, lRes, pRes, bRes] = await Promise.allSettled([
        dashboardApi.getStats(),
        dashboardApi.getLeaderboard(),
        dashboardApi.getTopPlayers(),
        dashboardApi.getGameBreakdown(),
      ])
      if (sRes.status === 'fulfilled') setStats(sRes.value.data)
      if (lRes.status === 'fulfilled') setLeaderboard(lRes.value.data || [])
      if (pRes.status === 'fulfilled') setTopPlayers(pRes.value.data || [])
      if (bRes.status === 'fulfilled') setBreakdown(bRes.value.data || {})
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Players',     value: stats?.players,          icon: Users,      color: 'green',  to: '/players'      },
    { label: 'Teams',       value: stats?.teams,            icon: Shield,     color: 'cyan',   to: '/teams'        },
    { label: 'Tournaments', value: stats?.tournaments,      icon: Trophy,     color: 'purple', to: '/tournaments'  },
    { label: 'Partidas',    value: stats?.completedMatches, icon: Swords,     color: 'blue',   to: '/matches'      },
  ]

  const totalPlayers = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" subtitle="Visão geral da liga" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) =>
          s.to ? (
            <Link key={s.label} to={s.to} className="block">
              <StatCard {...s} />
            </Link>
          ) : (
            <StatCard key={s.label} {...s} />
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Game Breakdown */}
        <div className="glass-card p-5">
          <h3 className="font-display text-sm text-text-primary tracking-wide mb-4 uppercase">Jogadores por Modalidade</h3>
          {Object.keys(breakdown).filter(k => breakdown[k] > 0).length === 0 && !loading ? (
            <p className="text-sm text-text-dim font-body text-center py-8">Sem dados.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(breakdown).filter(([, v]) => v > 0).map(([type, count]) => {
                const pct = Math.round((count / totalPlayers) * 100)
                const color = TYPE_COLOR[type] || '#94A3B8'
                return (
                  <div key={type}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-body text-xs font-medium text-text-muted uppercase tracking-wider">
                        {TYPE_LABEL[type] || type}
                      </span>
                      <span className="font-body text-xs text-text-primary font-semibold">{count}</span>
                    </div>
                    <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Players */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm text-text-primary tracking-wide uppercase">Top Players</h3>
            <Link to="/players" className="font-body text-xs text-accent-green hover:underline cursor-pointer">Ver todos</Link>
          </div>
          {topPlayers.length === 0 && !loading ? (
            <p className="text-sm text-text-dim font-body text-center py-8">Mínimo 3 partidas para aparecer.</p>
          ) : (
            <div className="space-y-2">
              {topPlayers.slice(0, 6).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-bg-primary transition-colors duration-150">
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

        {/* Quick stats */}
        <div className="glass-card p-5">
          <h3 className="font-display text-sm text-text-primary tracking-wide mb-4 uppercase">Resumo</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Coaches',   value: stats?.coaches,          color: 'text-accent-green',  to: '/coaches'     },
              { label: 'Total Partidas',  value: stats?.matches,          color: 'text-accent-blue',   to: '/matches'     },
              { label: 'Partidas Concluídas', value: stats?.completedMatches, color: 'text-accent-cyan', to: '/matches'   },
              { label: 'Partidas Pendentes',  value: (stats?.matches || 0) - (stats?.completedMatches || 0), color: 'text-text-muted', to: '/matches' },
            ].map(({ label, value, color, to }) => (
              <Link key={label} to={to}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-bg-primary transition-colors duration-150 cursor-pointer group">
                <span className="font-body text-sm text-text-muted group-hover:text-text-primary transition-colors">{label}</span>
                <span className={`font-display text-base ${color}`}>{value ?? '—'}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-sm text-text-primary tracking-wide uppercase">Leaderboard de Equipas</h3>
          <Link to="/teams" className="font-body text-xs text-accent-green hover:underline cursor-pointer">Ver equipas</Link>
        </div>
        {leaderboard.length === 0 && !loading ? (
          <p className="text-sm text-text-dim font-body text-center py-8">Sem dados de leaderboard.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(30,41,59,0.6)' }}>
                  {['#', 'Equipa', 'V', 'E', 'D', 'Pts', 'Win Rate'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-body text-xs font-semibold text-text-dim uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((t, i) => (
                  <tr key={t.id}
                    className="transition-colors duration-150 hover:bg-bg-primary/50"
                    style={{ borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(30,41,59,0.3)' : undefined }}>
                    <td className="px-4 py-3">
                      <span className={`font-display text-sm ${i === 0 ? 'text-accent-green' : i === 1 ? 'text-text-muted' : i === 2 ? 'text-accent-cyan' : 'text-text-dim'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                          <Shield size={11} className="text-accent-cyan" />
                        </div>
                        <span className="font-body text-sm font-semibold text-text-primary">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-accent-green font-semibold">{t.wins}</td>
                    <td className="px-4 py-3 font-body text-sm text-accent-cyan">{t.draws}</td>
                    <td className="px-4 py-3 font-body text-sm text-red-400">{t.losses}</td>
                    <td className="px-4 py-3">
                      <Badge variant="green">{t.points}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-16 bg-bg-primary rounded-full overflow-hidden">
                          <div className="h-full bg-accent-green rounded-full" style={{ width: `${t.winRate}%` }} />
                        </div>
                        <span className="font-body text-xs text-text-muted">{t.winRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
