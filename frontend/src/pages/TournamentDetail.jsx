import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Trophy, Shield, Swords, GitBranch, Users, Calendar } from 'lucide-react'
import Badge from '../components/Badge'
import { tournamentApi } from '../services/api'
import { winRate } from '../utils/stats'
import { STATUS_COLOR } from '../utils/gameMeta'
import { useT } from '../context/LanguageContext'

const FORMAT_LABEL = {
  SINGLE_ELIMINATION: 'Single Elimination',
  DOUBLE_ELIMINATION: 'Double Elimination',
  GROUP_STAGE:        'Group Stage',
  LEAGUE:             'League',
}

function fmtDate(d) {
  if (!d) return null
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return d }
}

// ── Bracket match card ─────────────────────────────────────────────────────────

function BracketCard({ match, accent = '#8B5CF6' }) {
  if (!match) {
    return (
      <div className="rounded-xl border border-bg-border/40 overflow-hidden min-w-[180px]"
        style={{ background: 'rgb(var(--bg-primary))' }}>
        <div className="px-3 py-2.5 border-b border-bg-border/30">
          <span className="font-body text-xs text-text-dim italic">TBD</span>
        </div>
        <div className="px-3 py-2.5">
          <span className="font-body text-xs text-text-dim italic">TBD</span>
        </div>
      </div>
    )
  }

  const played  = match.resultRecorded
  const winnerA = played && match.teamAScore > match.teamBScore
  const winnerB = played && match.teamBScore > match.teamAScore

  return (
    <div className="rounded-xl border overflow-hidden min-w-[200px]"
      style={{ background: 'rgb(var(--bg-elevated))', borderColor: played ? `${accent}30` : 'rgb(var(--bg-border))' }}>
      {/* Team A */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${winnerA ? '' : 'border-bg-border/30'}`}
        style={{ borderColor: winnerA ? `${accent}20` : undefined, background: winnerA ? `${accent}12` : undefined }}>
        <span className={`font-body text-xs font-semibold truncate flex-1 ${winnerA ? 'text-text-primary' : 'text-text-muted'}`}>
          {winnerA && <span className="mr-1" style={{ color: accent }}>▶</span>}
          {match.teamA?.name ?? 'TBD'}
        </span>
        {played && (
          <span className={`font-display text-sm font-bold ml-2 flex-shrink-0 ${winnerA ? 'text-text-primary' : 'text-text-dim'}`}>
            {match.teamAScore}
          </span>
        )}
      </div>
      {/* Team B */}
      <div className={`flex items-center justify-between px-3 py-2`}
        style={{ background: winnerB ? `${accent}12` : undefined }}>
        <span className={`font-body text-xs font-semibold truncate flex-1 ${winnerB ? 'text-text-primary' : 'text-text-muted'}`}>
          {winnerB && <span className="mr-1" style={{ color: accent }}>▶</span>}
          {match.teamB?.name ?? 'TBD'}
        </span>
        {played && (
          <span className={`font-display text-sm font-bold ml-2 flex-shrink-0 ${winnerB ? 'text-text-primary' : 'text-text-dim'}`}>
            {match.teamBScore}
          </span>
        )}
      </div>
      {/* Date footer */}
      <div className="px-3 py-1.5 border-t border-bg-border/20 flex items-center justify-between"
        style={{ background: 'rgb(var(--bg-primary))' }}>
        <span className="font-body text-[10px] text-text-dim">{fmtDate(match.date)}</span>
        {!played && <Badge variant="gray">Pending</Badge>}
      </div>
    </div>
  )
}

// ── Round column ───────────────────────────────────────────────────────────────

function RoundColumn({ label, matches, accent }) {
  return (
    <div className="flex flex-col items-center gap-3 flex-shrink-0">
      <p className="font-body text-[10px] uppercase tracking-widest font-semibold mb-1"
        style={{ color: accent }}>{label}</p>
      {matches.map((m, i) => (
        <BracketCard key={m?.id ?? i} match={m} accent={accent} />
      ))}
    </div>
  )
}

// ── Round separator arrow ──────────────────────────────────────────────────────

function RoundArrow({ accent }) {
  return (
    <div className="flex items-center justify-center flex-shrink-0 px-1 self-center mt-6">
      <svg width="24" height="16" viewBox="0 0 24 16">
        <path d="M0 8 H18 M14 3 L20 8 L14 13" stroke={accent} strokeWidth="1.5" fill="none"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    </div>
  )
}

// Names a knockout round from how many matches it holds (16 teams → "Round of 16").
function roundLabel(matchesInRound) {
  switch (matchesInRound) {
    case 1:  return 'Grand Final'
    case 2:  return 'Semi-Final'
    case 4:  return 'Quarter-Final'
    default: return `Round of ${matchesInRound * 2}`
  }
}

// ── Single / Double Elimination bracket ───────────────────────────────────────

function EliminationBracket({ matches, format, accent = '#8B5CF6' }) {
  const sorted = useMemo(() =>
    [...matches].sort((a, b) => new Date(a.date) - new Date(b.date)), [matches])
  const n = sorted.length

  const rounds = useMemo(() => {
    if (format === 'DOUBLE_ELIMINATION') {
      if (n <= 1) return [{ label: 'Grand Final', matches: sorted }]
      if (n === 3) return [
        { label: 'Winners Final',  matches: [sorted[0]] },
        { label: 'Losers Final',   matches: [sorted[1]] },
        { label: 'Grand Final',    matches: [sorted[2]] },
      ]
      const third = Math.max(1, Math.floor(n / 3))
      return [
        { label: 'Winners Bracket', matches: sorted.slice(0, third) },
        { label: 'Losers Bracket',  matches: sorted.slice(third, n - 1) },
        { label: 'Grand Final',     matches: [sorted[n - 1]] },
      ]
    }
    // SINGLE_ELIMINATION
    if (n <= 0) return []
    if (n === 1) return [{ label: 'Grand Final', matches: sorted }]

    // Proper power-of-two knockout (n = 2^k - 1): split into halving rounds so a
    // 16-team bracket reads Round of 16 → Quarter-Final → Semi-Final → Grand Final.
    if (n >= 7 && Number.isInteger(Math.log2(n + 1))) {
      const out = []
      let idx = 0
      for (let size = (n + 1) / 2; size >= 1; size = Math.floor(size / 2)) {
        out.push({ label: roundLabel(size), matches: sorted.slice(idx, idx + size) })
        idx += size
      }
      return out
    }

    if (n === 2) return [
      { label: 'Semi-Final',  matches: [sorted[0]] },
      { label: 'Grand Final', matches: [sorted[1]] },
    ]
    if (n === 3) return [
      { label: 'Quarter-Final', matches: [sorted[0]] },
      { label: 'Semi-Final',   matches: [sorted[1]] },
      { label: 'Grand Final',  matches: [sorted[2]] },
    ]
    const qfCount = n - 3
    return [
      { label: 'Quarter-Final', matches: sorted.slice(0, qfCount) },
      { label: 'Semi-Final',   matches: sorted.slice(qfCount, n - 1) },
      { label: 'Grand Final',  matches: [sorted[n - 1]] },
    ]
  }, [sorted, format, n])

  if (rounds.length === 0) {
    return <p className="font-body text-sm text-text-dim text-center py-8">No matches yet.</p>
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-start gap-0 min-w-fit">
        {rounds.map((round, i) => (
          <div key={i} className="flex items-start">
            <RoundColumn label={round.label} matches={round.matches} accent={accent} />
            {i < rounds.length - 1 && <RoundArrow accent={accent} />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Group Stage view ───────────────────────────────────────────────────────────

function GroupStageView({ matches, teams, accent = '#8B5CF6' }) {
  const sorted = useMemo(() =>
    [...matches].sort((a, b) => new Date(a.date) - new Date(b.date)), [matches])

  const n = teams.length
  const groupMatchCount = Math.floor(n * (n - 1) / 2)
  const groupMatches    = sorted.slice(0, groupMatchCount)
  const knockoutMatches = sorted.slice(groupMatchCount)

  // Standings from group matches only
  const standings = useMemo(() => {
    const stats = {}
    teams.forEach(t => { stats[t.id] = { team: t, played: 0, wins: 0, losses: 0, pts: 0 } })
    groupMatches.filter(m => m.resultRecorded).forEach(m => {
      const a = stats[m.teamA?.id], b = stats[m.teamB?.id]
      if (!a || !b) return
      a.played++; b.played++
      if (m.teamAScore > m.teamBScore) { a.wins++; a.pts += 3; b.losses++ }
      else if (m.teamBScore > m.teamAScore) { b.wins++; b.pts += 3; a.losses++ }
      // equal → draw: counted as played only
    })
    return Object.values(stats).sort((a, b) => b.pts - a.pts || b.wins - a.wins)
  }, [teams, groupMatches])

  return (
    <div className="space-y-6">
      {/* Group table + knockout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Group A standings */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={14} style={{ color: accent }} />
            <h3 className="font-display text-xs uppercase tracking-wide text-text-primary">Group A</h3>
          </div>
          <div className="space-y-1">
            {standings.map((s, i) => (
              <Link key={s.team.id} to={`/teams/${s.team.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-primary border border-transparent hover:border-bg-border transition-all duration-150 group">
                <span className={`font-display text-sm w-4 flex-shrink-0 ${i === 0 ? 'text-accent-green' : i === 1 ? 'text-text-muted' : 'text-text-dim'}`}>{i + 1}</span>
                <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}18`, border: `1px solid ${accent}28` }}>
                  <Shield size={13} style={{ color: accent }} />
                </div>
                <span className="font-body text-sm font-semibold text-text-primary flex-1 group-hover:text-accent-green transition-colors truncate">{s.team.name}</span>
                <div className="flex items-center gap-3 flex-shrink-0 font-body text-xs">
                  <span className="text-text-dim w-5 text-center">{s.played}</span>
                  <span className="text-accent-green font-semibold w-4 text-center">{s.wins}</span>
                  <span className="text-red-400 w-4 text-center">{s.losses}</span>
                  <span className="font-semibold text-text-primary w-6 text-right" style={{ color: accent }}>{s.pts}</span>
                </div>
              </Link>
            ))}
            <div className="flex items-center gap-3 px-3 pt-1 font-body text-[10px] text-text-dim uppercase tracking-wider">
              <span className="w-4 flex-shrink-0" />
              <span className="w-7 flex-shrink-0" />
              <span className="flex-1" />
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="w-5 text-center">MP</span>
                <span className="w-4 text-center">W</span>
                <span className="w-4 text-center">L</span>
                <span className="w-6 text-right">PTS</span>
              </div>
            </div>
          </div>

          {/* Group matches list */}
          <div className="mt-4 pt-4 border-t border-bg-border/40 space-y-1.5">
            <p className="font-body text-[10px] uppercase tracking-wider text-text-dim mb-2">Group matches</p>
            {groupMatches.map(m => (
              <div key={m.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-bg-primary/60 transition-colors">
                <span className="font-body text-xs text-text-muted truncate flex-1">{m.teamA?.name}</span>
                {m.resultRecorded
                  ? <span className="font-display text-sm font-bold text-text-primary px-2 flex-shrink-0">{m.teamAScore}:{m.teamBScore}</span>
                  : <span className="font-body text-xs text-text-dim px-2 flex-shrink-0">vs</span>}
                <span className="font-body text-xs text-text-muted truncate flex-1 text-right">{m.teamB?.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Knockout */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch size={14} style={{ color: accent }} />
            <h3 className="font-display text-xs uppercase tracking-wide text-text-primary">Knockout</h3>
          </div>
          {knockoutMatches.length === 0 ? (
            <p className="font-body text-sm text-text-dim text-center py-8">No knockout matches yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {knockoutMatches.map((m, i) => (
                <div key={m.id}>
                  <p className="font-body text-[10px] uppercase tracking-wider mb-1.5"
                    style={{ color: accent }}>
                    {knockoutMatches.length === 1 ? 'Grand Final' : i === knockoutMatches.length - 1 ? 'Grand Final' : `Round ${i + 1}`}
                  </p>
                  <BracketCard match={m} accent={accent} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── League standings panel ─────────────────────────────────────────────────────

function LeagueStandings({ teams, matches, accent = '#06B6D4' }) {
  const standings = useMemo(() => {
    const played = matches.filter(m => m.resultRecorded)
    return [...teams].map(t => {
      let w = 0, l = 0, diff = 0
      played.forEach(m => {
        const isA = m.teamA?.id === t.id, isB = m.teamB?.id === t.id
        if (!isA && !isB) return
        const myScore  = isA ? m.teamAScore : m.teamBScore
        const oppScore = isA ? m.teamBScore : m.teamAScore
        diff += myScore - oppScore
        if (myScore > oppScore) w++; else if (oppScore > myScore) l++
      })
      return { team: t, played: w + l, wins: w, losses: l, pts: w * 3, diff }
    }).sort((a, b) => b.pts - a.pts || b.wins - a.wins || b.diff - a.diff)
  }, [teams, matches])

  const fmtDiff = (d) => (d > 0 ? `+${d}` : `${d}`)

  return (
    <div className="space-y-1.5">
      {standings.map((s, i) => {
        const wr = winRate(s.wins, s.losses)
        return (
          <Link key={s.team.id} to={`/teams/${s.team.id}`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-primary border border-transparent hover:border-bg-border transition-all duration-150 group cursor-pointer">
            <span className={`font-display text-sm w-5 flex-shrink-0 ${i === 0 ? 'text-accent-green' : i === 1 ? 'text-text-muted' : i === 2 ? 'text-accent-cyan' : 'text-text-dim'}`}>
              {i + 1}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${accent}18`, border: `1px solid ${accent}28` }}>
              <Shield size={14} style={{ color: accent }} />
            </div>
            <span className="font-body font-semibold text-sm text-text-primary flex-1 group-hover:text-accent-green transition-colors truncate">{s.team.name}</span>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex gap-3 font-body text-xs">
                <span className="text-accent-green font-semibold">{s.wins}W</span>
                <span className="text-red-400">{s.losses}L</span>
              </div>
              <span className="font-body text-xs text-text-dim w-9 text-right tabular" title="Score difference">{fmtDiff(s.diff)}</span>
              <Badge variant="green">{s.pts} pts</Badge>
              <span className="font-body text-xs text-text-dim w-10 text-right">{wr}%</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

// ── Match list panel ───────────────────────────────────────────────────────────

function MatchListPanel({ matches }) {
  const containerRef = useRef(null)
  const itemRefs     = useRef([])

  const sorted = useMemo(() =>
    [...matches].sort((a, b) => new Date(a.date) - new Date(b.date)), [matches])

  const closestIdx = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity -- intentionally relative to the current time
    const now = Date.now()
    let best = 0, bestDiff = Infinity
    sorted.forEach((m, i) => {
      const diff = Math.abs(new Date(m.date) - now)
      if (diff < bestDiff) { bestDiff = diff; best = i }
    })
    return best
  }, [sorted])

  useEffect(() => {
    const el = itemRefs.current[closestIdx]
    const container = containerRef.current
    if (el && container) {
      container.scrollTop = Math.max(0, el.offsetTop - container.offsetTop - 8)
    }
  }, [closestIdx])

  const getWinner = m => {
    if (!m.resultRecorded) return null
    if (m.teamAScore > m.teamBScore) return m.teamA?.name
    if (m.teamBScore > m.teamAScore) return m.teamB?.name
    return 'Draw'
  }

  return (
    <div ref={containerRef} className="space-y-2 max-h-80 overflow-y-auto pr-1">
      {sorted.map((m, i) => {
        const winner = getWinner(m)
        const isClosest = i === closestIdx
        return (
          <div key={m.id} ref={el => { itemRefs.current[i] = el }}
            className={`px-3 py-2.5 rounded-lg hover:bg-bg-primary transition-colors duration-150 ${isClosest ? 'ring-1 ring-inset ring-bg-border/50' : ''}`}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`font-body text-xs font-semibold truncate flex-1 ${m.resultRecorded && m.teamAScore > m.teamBScore ? 'text-accent-green' : 'text-text-primary'}`}>
                {m.teamA?.name}
              </span>
              {m.resultRecorded
                ? <span className="font-display text-sm font-bold text-text-primary flex-shrink-0 px-1">{m.teamAScore} <span className="text-text-dim text-xs font-body">:</span> {m.teamBScore}</span>
                : <span className="font-body text-xs text-text-dim flex-shrink-0 px-2">vs</span>}
              <span className={`font-body text-xs font-semibold truncate flex-1 text-right ${m.resultRecorded && m.teamBScore > m.teamAScore ? 'text-accent-green' : 'text-text-primary'}`}>
                {m.teamB?.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-body text-xs text-text-dim">{fmtDate(m.date)}</span>
              {m.resultRecorded
                ? <Badge variant={winner === 'Draw' ? 'cyan' : 'green'}>{winner === 'Draw' ? 'Draw' : `${winner} won`}</Badge>
                : <Badge variant="gray">Pending</Badge>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Stat pill ──────────────────────────────────────────────────────────────────

function StatPill({ label, value, accent }) {
  return (
    <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-bg-primary border border-bg-border">
      <span className="font-display text-xl" style={{ color: accent }}>{value ?? '—'}</span>
      <span className="font-body text-xs text-text-dim uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TournamentDetail() {
  const { t } = useT()
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
        <p className="font-body text-text-muted">{t('dt.tournamentNotFound')}</p>
        <Link to="/tournaments" className="btn-ghost mt-4 inline-flex">Back</Link>
      </div>
    )
  }

  const teams          = tournament.participatingTeams || []
  const matches        = tournament.matches || []
  const completedCount = matches.filter(m => m.resultRecorded).length
  const format         = tournament.format || 'LEAGUE'
  const isLeague       = format === 'LEAGUE'
  const isElim         = format === 'SINGLE_ELIMINATION' || format === 'DOUBLE_ELIMINATION'
  const isGroup        = format === 'GROUP_STAGE'

  const accent = isElim ? '#8B5CF6' : isGroup ? '#F59E0B' : '#06B6D4'

  return (
    <div className="animate-fade-in">
      <Link to="/tournaments" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary font-body text-sm mb-6 transition-colors cursor-pointer group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        {t('common.back', { target: t('nav.tournaments') })}
      </Link>

      {/* Hero */}
      <div className="glass-card p-6 mb-6" style={{ borderColor: `${accent}30`, boxShadow: `0 0 40px ${accent}08` }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${accent}18`, boxShadow: `0 0 24px ${accent}20`, border: `1px solid ${accent}30` }}>
              {isElim ? <GitBranch size={26} style={{ color: accent }} /> : <Trophy size={26} style={{ color: accent }} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl text-text-primary tracking-wide">{tournament.name}</h1>
                <Badge variant={STATUS_COLOR[tournament.status] || 'gray'}>{tournament.status}</Badge>
                {!isLeague && <Badge variant="amber">{FORMAT_LABEL[format] || format}</Badge>}
              </div>
              <p className="font-body text-sm text-text-muted mt-0.5">
                {tournament.specificGame || tournament.game}
                {' · '}{teams.length} {t('common.teams')} · {matches.length} {t('common.matches')}
              </p>
              {(tournament.startDate || tournament.endDate) && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Calendar size={11} className="text-text-dim" />
                  <span className="font-body text-xs text-text-dim">
                    {fmtDate(tournament.startDate)}
                    {tournament.endDate && ` → ${fmtDate(tournament.endDate)}`}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <StatPill label={t('nav.teams')}    value={teams.length}   accent={accent} />
            <StatPill label={t('players.matches')}  value={matches.length} accent="#06B6D4" />
            <StatPill label={t('tour.finished')} value={completedCount} accent="#22C55E" />
          </div>
        </div>
      </div>

      {/* Champion — set when the tournament is completed */}
      {tournament.status === 'COMPLETED' && tournament.championTeamName && (
        <Link to={tournament.championTeamId ? `/teams/${tournament.championTeamId}` : '#'}
          className="glass-card p-5 mb-6 flex items-center gap-4 group cursor-pointer transition-all duration-150 hover:border-yellow-500/40"
          style={{ background: 'linear-gradient(90deg, rgba(234,179,8,0.10), transparent)', borderColor: 'rgba(234,179,8,0.30)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.35)' }}>
            <Trophy size={22} className="text-yellow-400" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-yellow-500/80">Champion</p>
            <p className="font-display text-xl text-text-primary group-hover:text-yellow-400 transition-colors">{tournament.championTeamName}</p>
          </div>
        </Link>
      )}

      {/* Prizes */}
      {(tournament.prizeFirst || tournament.prizeSecond || tournament.prizeThird) && (
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={14} style={{ color: accent }} />
            <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">{t('tour.prizePool')}</h2>
          </div>
          <div className="flex gap-3">
            {tournament.prizeFirst && (
              <div className="flex-1 rounded-xl px-4 py-3 text-center"
                style={{ background: `${accent}0f`, border: `1px solid ${accent}25` }}>
                <p className="font-body text-xs text-text-dim mb-1 uppercase tracking-wider">1st Place</p>
                <p className="font-display text-base font-semibold text-text-primary">{tournament.prizeFirst}</p>
              </div>
            )}
            {tournament.prizeSecond && (
              <div className="flex-1 rounded-xl px-4 py-3 text-center"
                style={{ background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.22)' }}>
                <p className="font-body text-xs text-text-dim mb-1 uppercase tracking-wider">2nd Place</p>
                <p className="font-display text-base font-semibold text-text-muted">{tournament.prizeSecond}</p>
              </div>
            )}
            {tournament.prizeThird && (
              <div className="flex-1 rounded-xl px-4 py-3 text-center"
                style={{ background: 'rgba(180,83,9,0.08)', border: '1px solid rgba(180,83,9,0.22)' }}>
                <p className="font-body text-xs text-text-dim mb-1 uppercase tracking-wider">3rd Place</p>
                <p className="font-display text-base font-semibold" style={{ color: '#d97706' }}>{tournament.prizeThird}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Format-specific content */}
      {isLeague && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-5">
            <div className="flex items-center gap-2 mb-5">
              <Shield size={15} style={{ color: accent }} />
              <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">{t('tour.standings')}</h2>
              <span className="font-body text-xs text-text-dim ml-1">({teams.length})</span>
            </div>
            {teams.length === 0
              ? <p className="text-sm text-text-dim font-body text-center py-10">No teams registered.</p>
              : <LeagueStandings teams={teams} matches={matches} accent={accent} />}
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Swords size={15} className="text-accent-blue" />
              <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">Matches</h2>
              <span className="font-body text-xs text-text-dim ml-1">({matches.length})</span>
            </div>
            {matches.length === 0
              ? <p className="font-body text-sm text-text-dim text-center py-4">No matches scheduled.</p>
              : <MatchListPanel matches={matches} />}
          </div>
        </div>
      )}

      {isElim && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <GitBranch size={15} style={{ color: accent }} />
              <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">{t('tour.bracket')}</h2>
              <Badge variant="amber">{FORMAT_LABEL[format]}</Badge>
            </div>
            <EliminationBracket matches={matches} format={format} accent={accent} />
          </div>

          {/* Participants */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={15} style={{ color: accent }} />
              <h2 className="font-display text-sm text-text-primary uppercase tracking-wide">{t('tour.participants')}</h2>
              <span className="font-body text-xs text-text-dim ml-1">({teams.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {teams.map(t => (
                <Link key={t.id} to={`/teams/${t.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-bg-border hover:border-bg-border/60 bg-bg-primary hover:bg-bg-primary/60 transition-all duration-150">
                  <Shield size={12} style={{ color: accent }} />
                  <span className="font-body text-xs font-semibold text-text-muted">{t.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {isGroup && (
        <GroupStageView matches={matches} teams={teams} accent={accent} />
      )}
    </div>
  )
}
