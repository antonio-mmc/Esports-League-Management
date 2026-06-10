export default function PageHeader({ title, subtitle, badge, action }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="font-display text-2xl text-text-primary tracking-wide mb-1">{title}</h1>
        {(subtitle || badge) && (
          <div className="flex items-center gap-2">
            {subtitle && <p className="font-body text-sm text-text-muted">{subtitle}</p>}
            {badge && badge}
          </div>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
