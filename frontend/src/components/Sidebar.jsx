import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCheck, Shield, Trophy, Swords, ChevronRight
} from 'lucide-react'

const nav = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/players',     icon: Users,           label: 'Players'   },
  { to: '/coaches',     icon: UserCheck,       label: 'Coaches'   },
  { to: '/teams',       icon: Shield,          label: 'Teams'     },
  { to: '/tournaments', icon: Trophy,          label: 'Tournaments'},
  { to: '/matches',     icon: Swords,          label: 'Matches'   },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed inset-y-0 left-0 w-56 flex flex-col z-40"
      style={{ background: 'rgba(9,15,29,0.95)', borderRight: '1px solid rgba(30,41,59,0.8)', backdropFilter: 'blur(16px)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-bg-border">
        <div className="w-8 h-8 rounded-lg bg-accent-green flex items-center justify-center shadow-glow flex-shrink-0">
          <Swords size={16} className="text-bg-base" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-display text-text-primary text-sm leading-tight">ESports</p>
          <p className="font-body text-text-dim text-xs leading-tight">League Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink key={to} to={to}
              className={[
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer',
                active
                  ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-primary border border-transparent',
              ].join(' ')}>
              <Icon size={16} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0" />
              <span className="font-body font-medium text-sm flex-1">{label}</span>
              {active && <ChevronRight size={12} className="opacity-60" />}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-bg-border">
        <div className="flex items-center gap-2">
          <span className="glow-dot flex-shrink-0" />
          <span className="font-body text-xs text-text-dim">API Online</span>
        </div>
      </div>
    </aside>
  )
}
