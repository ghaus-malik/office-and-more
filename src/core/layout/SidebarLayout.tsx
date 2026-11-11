import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface NavItem {
  to: string
  label: string
  icon: ReactNode
  badge?: number
  end?: boolean
}

/** App shell with a left sidebar (collapses to a drawer below lg) and a top bar. */
export function SidebarLayout({
  brand,
  nav,
  footer,
  topbar,
  children,
  menuLabel,
  dark,
}: {
  brand: ReactNode
  nav: NavItem[]
  footer?: ReactNode
  topbar: ReactNode
  children: ReactNode
  menuLabel: string
  dark?: boolean
}) {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => setOpen(false), [loc.pathname])

  const sidebar = (
    <div className={cn('flex h-full flex-col', dark ? 'bg-ink text-paper' : 'bg-sand-50')}>
      <div className="flex h-16 shrink-0 items-center px-6">{brand}</div>
      <nav className="scroll-thin flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                dark
                  ? isActive
                    ? 'bg-white/12 text-white'
                    : 'text-white/65 hover:bg-white/5 hover:text-white'
                  : isActive
                    ? 'bg-paper text-ink shadow-card ring-1 ring-sand-200'
                    : 'text-muted hover:bg-sand-100 hover:text-ink',
              )
            }
          >
            <span className="shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]">{n.icon}</span>
            <span className="flex-1 truncate">{n.label}</span>
            {!!n.badge && <span className="rounded-full bg-bad px-1.5 py-px text-[10.5px] font-bold text-white">{n.badge}</span>}
          </NavLink>
        ))}
      </nav>
      {footer && <div className={cn('shrink-0 border-t p-3', dark ? 'border-white/10' : 'border-sand-200')}>{footer}</div>}
    </div>
  )

  return (
    <div className="min-h-screen bg-paper">
      <aside className={cn('fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r lg:block', dark ? 'border-ink' : 'border-sand-200')}>{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={() => setOpen(false)} />
          <div className="relative h-full w-[272px] animate-slide-up shadow-pop">{sidebar}</div>
          <button onClick={() => setOpen(false)} aria-label="close" className="absolute left-[284px] top-4 rounded-full bg-paper p-2 shadow-pop">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-sand-200 bg-paper/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} aria-label={menuLabel} className="-ml-1 rounded-full p-2 hover:bg-sand-100 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          {topbar}
        </header>
        <main className="px-4 pb-28 pt-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight sm:text-[30px]">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
