export default function PageHeader({ title, subtitle, badge, action }) {
  return (
    <div className="mb-8">
      <div className="flex items-end justify-between gap-4 pb-5 border-b border-bg-border">
        <div className="min-w-0">
          {(subtitle || badge) && (
            <div className="flex items-center gap-2.5 mb-2">
              {subtitle && <span className="eyebrow">{subtitle}</span>}
              {badge && badge}
            </div>
          )}
          <h1 className="display-xl text-3xl md:text-[2.6rem] text-text-primary">{title}</h1>
        </div>
        {action && <div className="flex-shrink-0 pb-1">{action}</div>}
      </div>
    </div>
  )
}
