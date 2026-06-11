import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Calendar, Trophy, Crown, Swords, UserCheck, Users,
  Crosshair, Sword, Footprints, Car, Skull, History, Activity, ClipboardList,
} from 'lucide-react'
import Badge from '../components/Badge'
import { matchApi, teamApi } from '../services/api'
import { teamEmoji } from '../utils/teamEmoji'

// ── Modality meta ────────────────────────────────────────────────────────────
const TYPE_META = {
  FPS:           { label: 'FPS',          badge: 'cyan',   hex: '#06B6D4', icon: Crosshair  },
  MOBA:          { label: 'MOBA',         badge: 'purple', hex: '#8B5CF6', icon: Sword      },
  EFOOTBALL:     { label: 'eFootball',    badge: 'green',  hex: '#22C55E', icon: Footprints },
  RACING:        { label: 'Racing',       badge: 'orange', hex: '#F59E0B', icon: Car        },
  BATTLE_ROYALE: { label: 'Battle Royale',badge: 'red',    hex: '#EF4444', icon: Skull      },
}

const ACCENT_A = '#06B6D4'  // home / left
const ACCENT_B = '#8B5CF6'  // away / right

// Per-team aggregate stat config (season figures — no per-match data is stored)
const STAT_CONFIG = {
  FPS: [
    { label: 'Accuracy',     agg: 'avg', get: p => p.accuracy,  fmt: v => `${v.toFixed(1)}%` },
    { label: 'Headshots',    agg: 'sum', get: p => p.headshots, fmt: v => Math.round(v) },
    { label: 'KAST',         agg: 'avg', get: p => p.kast,      fmt: v => `${v.toFixed(1)}%` },
    { label: 'ADR',          agg: 'avg', get: p => p.adr,       fmt: v => v.toFixed(0) },
  ],
  MOBA: [
    { label: 'Kills',        agg: 'sum', get: p => p.kills },
    { label: 'Deaths',       agg: 'sum', get: p => p.deaths, lowerBetter: true },
    { label: 'Assists',      agg: 'sum', get: p => p.mobaAssists },
    { label: 'KDA',          agg: 'avg', get: p => (p.deaths === 0 ? p.kills + p.mobaAssists : (p.kills + p.mobaAssists) / p.deaths), fmt: v => v.toFixed(2) },
  ],
  EFOOTBALL: [
    { label: 'Goals',        agg: 'sum', get: p => p.goalsScored },
    { label: 'Assists',      agg: 'sum', get: p => p.efbAssists },
    { label: 'Saves',        agg: 'sum', get: p => p.goalsSaved },
    { label: 'Shots on Tgt', agg: 'sum', get: p => p.shotsOnTarget },
  ],
  RACING: [
    { label: 'Avg Position', agg: 'avg', get: p => p.avgPosition, fmt: v => v.toFixed(1), lowerBetter: true },
    { label: 'Podiums',      agg: 'sum', get: p => p.podiums },
    { label: 'Fastest Laps', agg: 'sum', get: p => p.fastestLaps },
    { label: 'DNF',          agg: 'sum', get: p => p.dnf, lowerBetter: true },
  ],
  BATTLE_ROYALE: [
    { label: 'Avg Placement',agg: 'avg', get: p => p.avgPlacement, fmt: v => v.toFixed(1), lowerBetter: true },
    { label: 'Kills',        agg: 'sum', get: p => p.kills },
    { label: 'Top 10 Rate',  agg: 'avg', get: p => p.top10Rate, fmt: v => `${v.toFixed(0)}%` },
    { label: 'DMG / Match',  agg: 'avg', get: p => p.damagePerMatch, fmt: v => v.toFixed(0) },
  ],
}

function fmtDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return d }
}

function aggregate(players, cfg) {
  const vals = players.map(cfg.get).filter(v => v !== null && v !== undefined && !Number.isNaN(v))
  if (vals.length === 0) return null
  if (cfg.agg === 'sum') return vals.reduce((a, b) => a + b, 0)
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

// Player's headline stat for the line-up row
function playerHeadline(p) {
  switch (p.playerType) {
    case 'FPS':           return p.accuracy != null ? `${p.accuracy.toFixed(0)}% ACC` : null
    case 'MOBA':          return `${p.kills}/${p.deaths}/${p.mobaAssists}`
    case 'EFOOTBALL':     return `${p.goalsScored} G · ${p.efbAssists} A`
    case 'RACING':        return p.avgPosition != null ? `P${p.avgPosition.toFixed(1)}` : null
    case 'BATTLE_ROYALE': return `${p.kills} kills`
    default:              return null
  }
}

function playerRole(p) {
  if (p.playerType === 'MOBA') return p.mainCharacter
  if (p.playerType === 'EFOOTBALL') return p.mainPosition
  return null
}

// ── Small pieces ─────────────────────────────────────────────────────────────

function FormDots({ form }) {
  if (!form.length) return <span className="font-body text-xs text-text-dim">No history</span>
  return (
    <div className="flex items-center gap-1">
      {form.map((r, i) => (
        <span key={i}
          title={r === 'W' ? 'Win' : r === 'L' ? 'Loss' : 'Draw'}
          className="w-5 h-5 rounded-md flex items-center justify-center font-display text-[10px] font-bold"
          style={{
            background: r === 'W' ? 'rgba(34,197,94,0.15)' : r === 'L' ? 'rgba(248,113,113,0.15)' : 'rgba(6,182,212,0.15)',
            color:      r === 'W' ? '#22C55E' : r === 'L' ? '#F87171' : '#06B6D4',
          }}>
          {r}
        </span>
      ))}
    </div>
  )
}

function CompareRow({ label, a, b, fmt, lowerBetter }) {
  const fa = a == null ? '—' : (fmt ? fmt(a) : a)
  const fb = b == null ? '—' : (fmt ? fmt(b) : b)
  const both = (a ?? 0) + (b ?? 0)
  const pctA = both > 0 ? ((a ?? 0) / both) * 100 : 50
  const aBetter = a != null && b != null && (lowerBetter ? a < b : a > b)
  const bBetter = a != null && b != null && (lowerBetter ? b < a : b > a)

  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`font-display text-sm tabular-nums ${aBetter ? 'text-text-primary' : 'text-text-muted'}`} style={aBetter ? { color: ACCENT_A } : undefined}>{fa}</span>
        <span className="font-body text-[10px] text-text-dim uppercase tracking-wider">{label}</span>
        <span className={`font-display text-sm tabular-nums ${bBetter ? 'text-text-primary' : 'text-text-muted'}`} style={bBetter ? { color: ACCENT_B } : undefined}>{fb}</span>
      </div>
      <div className="flex items-center gap-0.5 h-1.5">
        <div className="flex-1 flex justify-end">
          <div className="h-full rounded-l-full transition-all duration-700"
            style={{ width: `${pctA}%`, background: aBetter ? ACCENT_A : 'rgba(148,163,184,0.3)' }} />
        </div>
        <div className="flex-1">
          <div className="h-full rounded-r-full transition-all duration-700"
            style={{ width: `${100 - pctA}%`, background: bBetter ? ACCENT_B : 'rgba(148,163,184,0.3)' }} />
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, children, color = '#06B6D4', count }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={15} style={{ color }} />
      <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">{children}</h2>
      {count != null && <span className="font-body text-xs text-text-dim ml-1">({count})</span>}
    </div>
  )
}

// ── Line-up card ─────────────────────────────────────────────────────────────

function Lineup({ team, accent, align = 'left' }) {
  const meta = TYPE_META[team?.game] || {}
  const Icon = meta.icon || Users
  const players = team?.players || []
  const coach = team?.coach
  const right = align === 'right'

  return (
    <div className="glass-card p-5 flex flex-col" style={{ borderColor: `${accent}22` }}>
      <div className={`flex items-center gap-3 mb-4 ${right ? 'flex-row-reverse text-right' : ''}`}>
        <div className="w-11 h-11 rounded-xl bg-bg-primary flex items-center justify-center flex-shrink-0 text-2xl leading-none"
          style={{ border: `1px solid ${accent}30`, boxShadow: `0 0 20px ${accent}18` }}>
          {teamEmoji(team?.name)}
        </div>
        <div className={right ? 'items-end' : ''}>
          <Link to={`/teams/${team?.id}`} className="font-display text-base text-text-primary hover:text-white transition-colors">{team?.name}</Link>
          <div className={`flex items-center gap-1.5 mt-0.5 ${right ? 'justify-end' : ''}`}>
            {meta.label && <Badge variant={meta.badge}>{meta.label}</Badge>}
          </div>
        </div>
      </div>

      {/* Coach */}
      {coach && (
        <Link to={`/coaches/${coach.id}`}
          className={`flex items-center gap-2.5 px-3 py-2 mb-3 rounded-lg bg-bg-primary/60 hover:bg-bg-primary border border-bg-border/60 transition-colors duration-150 ${right ? 'flex-row-reverse text-right' : ''}`}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accent}18` }}>
            <UserCheck size={13} style={{ color: accent }} />
          </div>
          <div className={`min-w-0 flex-1 ${right ? 'text-right' : ''}`}>
            <p className="font-body text-xs font-semibold text-text-primary truncate">{coach.name}</p>
            <p className="font-body text-[10px] text-text-dim uppercase tracking-wider">Head Coach</p>
          </div>
        </Link>
      )}

      {/* Players */}
      {players.length === 0 ? (
        <p className="font-body text-sm text-text-dim text-center py-8">No roster registered.</p>
      ) : (
        <div className="space-y-1">
          {players.map((p, i) => {
            const role = playerRole(p)
            const headline = playerHeadline(p)
            return (
              <motion.div key={p.id}
                initial={{ opacity: 0, x: right ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26, delay: i * 0.04 }}>
                <Link to={`/players/${p.id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-primary transition-colors duration-150 group ${right ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accent}18` }}>
                    <Icon size={12} style={{ color: accent }} />
                  </div>
                  <div className={`min-w-0 flex-1 ${right ? 'text-right' : ''}`}>
                    <p className="font-body text-sm font-semibold text-text-primary truncate group-hover:text-white transition-colors">{p.nickname}</p>
                    <p className="font-body text-[11px] text-text-dim truncate">{role || p.fullName}</p>
                  </div>
                  {headline && (
                    <span className="font-display text-xs tabular-nums flex-shrink-0" style={{ color: accent }}>{headline}</span>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Team-side panel in the hero ──────────────────────────────────────────────

function HeroSide({ team, accent, record, isWinner, played }) {
  return (
    <div className={`flex-1 flex flex-col items-center text-center gap-2 ${isWinner ? '' : played ? 'opacity-70' : ''}`}>
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-bg-primary flex items-center justify-center text-4xl leading-none"
          style={{ border: `1px solid ${accent}40`, boxShadow: isWinner ? '0 0 36px rgba(34,197,94,0.35)' : `0 0 28px ${accent}22` }}>
          {teamEmoji(team?.name)}
        </div>
        {isWinner && (
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent-green flex items-center justify-center shadow-glow">
            <Crown size={14} className="text-bg-base" />
          </div>
        )}
      </div>
      <Link to={`/teams/${team?.id}`} className="font-display text-lg text-text-primary hover:text-white transition-colors leading-tight">{team?.name}</Link>
      <div className="flex items-center gap-2 font-body text-xs">
        <span className="text-accent-green font-semibold">{record.w}W</span>
        <span className="text-text-dim">·</span>
        <span className="text-red-400">{record.l}L</span>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function MatchDetail() {
  const { id } = useParams()
  const [match, setMatch]       = useState(null)
  const [teamA, setTeamA]       = useState(null)
  const [teamB, setTeamB]       = useState(null)
  const [allMatches, setAll]    = useState([])
  const [loading, setLoad]      = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true
    setLoad(true); setNotFound(false)
    matchApi.getById(id)
      .then(async (r) => {
        const m = r.data
        if (!active) return
        setMatch(m)
        const [aRes, bRes, allRes] = await Promise.allSettled([
          m.teamA?.id ? teamApi.getById(m.teamA.id) : Promise.resolve({ data: null }),
          m.teamB?.id ? teamApi.getById(m.teamB.id) : Promise.resolve({ data: null }),
          matchApi.getAll(),
        ])
        if (!active) return
        setTeamA(aRes.status === 'fulfilled' ? aRes.value.data : m.teamA)
        setTeamB(bRes.status === 'fulfilled' ? bRes.value.data : m.teamB)
        setAll(allRes.status === 'fulfilled' ? (allRes.value.data || []) : [])
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoad(false))
    return () => { active = false }
  }, [id])

  // Real W/L per team from played-match history
  const recordFor = (teamId) => {
    let w = 0, l = 0
    allMatches.filter(m => m.resultRecorded).forEach(m => {
      const isA = m.teamA?.id === teamId, isB = m.teamB?.id === teamId
      if (!isA && !isB) return
      const my = isA ? m.teamAScore : m.teamBScore
      const opp = isA ? m.teamBScore : m.teamAScore
      if (my > opp) w++; else if (opp > my) l++
    })
    return { w, l }
  }

  // Recent form (last 5 played) for a team
  const formFor = (teamId) =>
    allMatches.filter(m => m.resultRecorded && (m.teamA?.id === teamId || m.teamB?.id === teamId))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(m => {
        const isA = m.teamA?.id === teamId
        const my = isA ? m.teamAScore : m.teamBScore
        const opp = isA ? m.teamBScore : m.teamAScore
        return my > opp ? 'W' : opp > my ? 'L' : 'D'
      })

  // Head-to-head meetings between the two teams
  const h2h = useMemo(() => {
    if (!match) return { meetings: [], aWins: 0, bWins: 0 }
    const aId = match.teamA?.id, bId = match.teamB?.id
    const meetings = allMatches
      .filter(m => {
        const ids = [m.teamA?.id, m.teamB?.id]
        return ids.includes(aId) && ids.includes(bId)
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    let aWins = 0, bWins = 0
    meetings.filter(m => m.resultRecorded).forEach(m => {
      const aScore = m.teamA?.id === aId ? m.teamAScore : m.teamBScore
      const bScore = m.teamA?.id === aId ? m.teamBScore : m.teamAScore
      if (aScore > bScore) aWins++; else if (bScore > aScore) bWins++
    })
    return { meetings, aWins, bWins }
  }, [allMatches, match])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !match) {
    return (
      <div className="text-center py-32">
        <p className="font-body text-text-muted">Match not found.</p>
        <Link to="/matches" className="btn-ghost mt-4 inline-flex">Back to Matches</Link>
      </div>
    )
  }

  const played   = match.resultRecorded
  const game     = teamA?.game || teamB?.game || match.tournament?.game
  const gameMeta = TYPE_META[game] || {}
  const aWon     = played && match.teamAScore > match.teamBScore
  const bWon     = played && match.teamBScore > match.teamAScore
  const draw     = played && match.teamAScore === match.teamBScore
  const recA     = recordFor(match.teamA?.id)
  const recB     = recordFor(match.teamB?.id)

  const statCfg = STAT_CONFIG[game] || []
  const playersA = teamA?.players || []
  const playersB = teamB?.players || []
  const showStats = played && statCfg.length > 0 && (playersA.length > 0 || playersB.length > 0)

  return (
    <div className="animate-fade-in">
      <Link to="/matches" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary font-body text-sm mb-6 transition-colors cursor-pointer group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Matches
      </Link>

      {/* ── Hero / scoreboard ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass-card p-6 mb-6 relative overflow-hidden"
        style={{ borderColor: played ? 'rgba(34,197,94,0.18)' : `${gameMeta.hex || '#64748B'}22` }}>
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: `radial-gradient(circle at 25% 30%, ${ACCENT_A} 0, transparent 45%), radial-gradient(circle at 75% 30%, ${ACCENT_B} 0, transparent 45%)` }} />

        {/* Top meta row */}
        <div className="relative flex items-center justify-center gap-2 mb-5 flex-wrap">
          {match.tournament && (
            <Link to={`/tournaments/${match.tournament.id}`}
              className="inline-flex items-center gap-1.5 font-body text-xs text-text-muted hover:text-text-primary transition-colors">
              <Trophy size={12} style={{ color: gameMeta.hex }} />
              {match.tournament.name}
            </Link>
          )}
          <span className="text-text-dim">·</span>
          <span className="inline-flex items-center gap-1.5 font-body text-xs text-text-dim">
            <Calendar size={11} /> {fmtDate(match.date)}
          </span>
          {gameMeta.label && <Badge variant={gameMeta.badge}>{gameMeta.label}</Badge>}
          <Badge variant={played ? (draw ? 'cyan' : 'green') : 'gray'}>{played ? (draw ? 'Draw' : 'Played') : 'Upcoming'}</Badge>
        </div>

        {/* Teams + score */}
        <div className="relative flex items-center justify-between gap-3">
          <HeroSide team={match.teamA} accent={ACCENT_A} record={recA} isWinner={aWon} played={played} align="left" />

          <div className="flex flex-col items-center flex-shrink-0 px-2">
            {played ? (
              <>
                <div className="flex items-center gap-3 font-display leading-none">
                  <span className="text-5xl tabular-nums" style={{ color: aWon ? '#22C55E' : draw ? '#06B6D4' : '#64748B' }}>{match.teamAScore}</span>
                  <span className="text-2xl text-text-dim">:</span>
                  <span className="text-5xl tabular-nums" style={{ color: bWon ? '#22C55E' : draw ? '#06B6D4' : '#64748B' }}>{match.teamBScore}</span>
                </div>
                <span className="font-body text-[10px] text-text-dim uppercase tracking-widest mt-2">Full Time</span>
                {!draw && (
                  <span className="font-body text-xs font-semibold mt-1" style={{ color: '#22C55E' }}>
                    {aWon ? match.teamA?.name : match.teamB?.name} won
                  </span>
                )}
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-bg-primary flex items-center justify-center" style={{ border: '1px solid rgba(100,116,139,0.3)' }}>
                  <Swords size={20} className="text-text-muted" />
                </div>
                <span className="font-body text-[10px] text-text-dim uppercase tracking-widest mt-2">Versus</span>
              </>
            )}
          </div>

          <HeroSide team={match.teamB} accent={ACCENT_B} record={recB} isWinner={bWon} played={played} align="right" />
        </div>
      </motion.div>

      {/* ── Head-to-head + form ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="glass-card p-5">
          <SectionTitle icon={History} color="#F59E0B">Head-to-Head</SectionTitle>
          {h2h.meetings.filter(m => m.resultRecorded).length === 0 ? (
            <p className="font-body text-sm text-text-dim text-center py-6">First-ever meeting.</p>
          ) : (
            <div className="flex items-center justify-around text-center">
              <div>
                <p className="font-display text-3xl" style={{ color: ACCENT_A }}>{h2h.aWins}</p>
                <p className="font-body text-[10px] text-text-dim uppercase tracking-wider mt-1 max-w-[80px] truncate mx-auto">{match.teamA?.name}</p>
              </div>
              <div className="text-text-dim font-display text-sm">vs</div>
              <div>
                <p className="font-display text-3xl" style={{ color: ACCENT_B }}>{h2h.bWins}</p>
                <p className="font-body text-[10px] text-text-dim uppercase tracking-wider mt-1 max-w-[80px] truncate mx-auto">{match.teamB?.name}</p>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <SectionTitle icon={Activity} color={ACCENT_A}>Recent Form</SectionTitle>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-body text-xs text-text-muted truncate flex-1">{match.teamA?.name}</span>
              <FormDots form={formFor(match.teamA?.id)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-body text-xs text-text-muted truncate flex-1">{match.teamB?.name}</span>
              <FormDots form={formFor(match.teamB?.id)} />
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <SectionTitle icon={Trophy} color="#22C55E">Season Record</SectionTitle>
          <div className="space-y-3">
            {[{ t: match.teamA, r: recA, a: ACCENT_A }, { t: match.teamB, r: recB, a: ACCENT_B }].map(({ t, r, a }) => {
              const total = r.w + r.l
              const wr = total > 0 ? Math.round(r.w / total * 100) : 0
              return (
                <div key={t?.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body text-xs text-text-muted truncate flex-1">{t?.name}</span>
                    <span className="font-body text-xs text-text-dim ml-2">{wr}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-primary overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${wr}%`, background: a }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Line-ups ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={15} className="text-accent-cyan" />
          <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">Line-ups</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Lineup team={teamA} accent={ACCENT_A} align="left" />
          <Lineup team={teamB} accent={ACCENT_B} align="right" />
        </div>
      </div>

      {/* ── Stat comparison (played only) ─────────────────────────────────── */}
      {showStats && (
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <SectionTitle icon={Swords} color="#06B6D4">Team Comparison</SectionTitle>
            <span className="font-body text-[10px] text-text-dim uppercase tracking-wider">Season aggregates</span>
          </div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="font-body text-xs font-semibold truncate" style={{ color: ACCENT_A }}>{match.teamA?.name}</span>
            <span className="font-body text-xs font-semibold truncate text-right" style={{ color: ACCENT_B }}>{match.teamB?.name}</span>
          </div>
          <div className="divide-y divide-bg-border/40">
            {statCfg.map(cfg => (
              <CompareRow key={cfg.label} label={cfg.label}
                a={aggregate(playersA, cfg)} b={aggregate(playersB, cfg)}
                fmt={cfg.fmt} lowerBetter={cfg.lowerBetter} />
            ))}
          </div>
        </div>
      )}

      {/* ── Previous meetings list ────────────────────────────────────────── */}
      {h2h.meetings.length > 1 && (
        <div className="glass-card p-5">
          <SectionTitle icon={History} color="#F59E0B" count={h2h.meetings.length}>Previous Meetings</SectionTitle>
          <div className="space-y-1">
            {h2h.meetings.map(m => {
              const isThis = String(m.id) === String(match.id)
              const aId = match.teamA?.id
              const aScore = m.teamA?.id === aId ? m.teamAScore : m.teamBScore
              const bScore = m.teamA?.id === aId ? m.teamBScore : m.teamAScore
              const aWinHere = m.resultRecorded && aScore > bScore
              const bWinHere = m.resultRecorded && bScore > aScore
              const row = (
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${isThis ? 'bg-accent-cyan/5 ring-1 ring-inset ring-accent-cyan/20' : 'hover:bg-bg-primary'}`}>
                  <span className={`font-body text-sm font-semibold truncate flex-1 text-right ${aWinHere ? 'text-accent-green' : 'text-text-muted'}`}>{match.teamA?.name}</span>
                  {m.resultRecorded
                    ? <span className="font-display text-sm font-bold text-text-primary flex-shrink-0 px-2 tabular-nums">{aScore} : {bScore}</span>
                    : <span className="font-body text-xs text-text-dim flex-shrink-0 px-2">vs</span>}
                  <span className={`font-body text-sm font-semibold truncate flex-1 ${bWinHere ? 'text-accent-green' : 'text-text-muted'}`}>{match.teamB?.name}</span>
                  <span className="font-body text-xs text-text-dim flex-shrink-0 w-24 text-right hidden sm:block">{fmtDate(m.date)}</span>
                </div>
              )
              return isThis
                ? <div key={m.id}>{row}</div>
                : <Link key={m.id} to={`/matches/${m.id}`} className="block">{row}</Link>
            })}
          </div>
        </div>
      )}
    </div>
  )
}
