export default function StatCard({ label, value, icon: Icon, color = 'green', trend }) {
  const colors = {
    green:  { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)',  text: '#22C55E',  glow: 'rgba(34,197,94,0.15)'  },
    cyan:   { bg: 'rgba(6,182,212,0.1)',  border: 'rgba(6,182,212,0.2)',  text: '#06B6D4',  glow: 'rgba(6,182,212,0.15)'  },
    blue:   { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', text: '#3B82F6',  glow: 'rgba(59,130,246,0.15)' },
    purple: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', text: '#8B5CF6',  glow: 'rgba(139,92,246,0.15)' },
  }
  const c = colors[color] || colors.green

  return (
    <div className="glass-card p-5 transition-all duration-200 hover:translate-y-[-2px] cursor-default"
      style={{ boxShadow: `0 4px 32px rgba(0,0,0,0.4), 0 0 0 1px ${c.border}` }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg, boxShadow: `0 0 16px ${c.glow}` }}>
          <Icon size={18} style={{ color: c.text }} strokeWidth={2} />
        </div>
        {trend !== undefined && (
          <span className="font-body text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: c.bg, color: c.text }}>
            {trend > 0 ? '+' : ''}{trend}
          </span>
        )}
      </div>
      <p className="font-display text-3xl text-text-primary mb-1" style={{ textShadow: `0 0 20px ${c.glow}` }}>
        {value ?? '—'}
      </p>
      <p className="font-body text-xs text-text-muted uppercase tracking-widest">{label}</p>
    </div>
  )
}
