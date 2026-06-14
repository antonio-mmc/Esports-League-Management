export default function StatCard({ label, value, icon: Icon, color = 'green', trend }) {
  const accents = {
    green:  '#22C55E',
    cyan:   '#38BDF8',
    blue:   '#60A5FA',
    purple: '#A78BFA',
  }
  const accent = accents[color] || accents.green

  return (
    <div className="group glass-card relative overflow-hidden px-5 py-4 cursor-default
                    transition-[border-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                    hover:-translate-y-0.5"
      style={{ '--accent': accent }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = `${accent}66`)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '')}>

      {/* Broadcast accent tick — slides up on hover */}
      <span className="absolute left-0 top-0 h-full w-[2px] origin-bottom scale-y-0
                       transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                       group-hover:scale-y-100"
        style={{ background: accent }} />

      <div className="flex items-center justify-between mb-3">
        <p className="eyebrow">{label}</p>
        {Icon && <Icon size={14} className="text-text-dim group-hover:text-text-muted transition-colors duration-200" strokeWidth={2} />}
      </div>

      <div className="flex items-end gap-2">
        <p className="font-mono text-[2.1rem] leading-none font-semibold text-text-primary tabular">
          {value ?? '—'}
        </p>
        {trend !== undefined && (
          <span className="font-mono text-[11px] font-medium mb-1" style={{ color: accent }}>
            {trend > 0 ? '+' : ''}{trend}
          </span>
        )}
      </div>
    </div>
  )
}
