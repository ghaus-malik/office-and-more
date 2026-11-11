import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronDown, FileText, Home, LayoutGrid, LogOut, Mail, Repeat, Sparkles, UserRound, Wallet, ArrowLeftRight, Bell } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Logo } from '@/theme/Logo'
import { SidebarLayout, type NavItem } from '@/core/layout/SidebarLayout'
import { NotificationBell } from '@/core/layout/NotificationBell'
import { LangSwitch } from '@/core/layout/LangSwitch'
import { relativeTime } from '@/lib/relative'
import { chf, formatDate } from '@/lib/format'
import { useCustomer } from './useCustomer'

export function EspaceLayout() {
  const { t, td, lang } = useT()
  const nav = useNavigate()
  const c = useCustomer()
  const notifications = useStore((s) => s.notifications.filter((n) => n.customerId === c.id))
  const unreadMail = useStore((s) => s.mail.filter((m) => m.customerId === c.id && m.unread).length)
  const openInvoices = useStore((s) => s.invoices.filter((i) => i.customerId === c.id && i.status !== 'paid').length)
  const markAll = useStore((s) => s.markNotificationsRead)
  const markOne = useStore((s) => s.markNotificationRead)

  const items: NavItem[] = [
    { to: '/espace', label: t('espace.nav.dashboard'), icon: <LayoutGrid />, end: true },
    { to: '/espace/courrier', label: t('espace.nav.mail'), icon: <Mail />, badge: unreadMail },
    { to: '/espace/abonnements', label: t('espace.nav.subscriptions'), icon: <Repeat /> },
    { to: '/espace/reservations', label: t('espace.nav.bookings'), icon: <CalendarDays /> },
    { to: '/espace/factures', label: t('espace.nav.invoices'), icon: <Wallet />, badge: openInvoices },
    { to: '/espace/services', label: t('espace.nav.services'), icon: <Sparkles /> },
    { to: '/espace/profil', label: t('espace.nav.profile'), icon: <UserRound /> },
  ]

  const fmtParams = (p: Record<string, string | number>) => {
    const out: Record<string, string | number> = { ...p }
    if (p.date) out.date = formatDate(String(p.date))
    if (p.pkg) out.pkg = td(`common.packages.${p.pkg}`)
    if (p.product) out.product = td(`common.products.${p.product}`)
    if (p.service) out.service = td(`common.services.${p.service}`)
    if (p.amount !== undefined) out.amount = chf(Number(p.amount))
    return out
  }

  const icon = (k: string) => (k === 'mail' ? <Mail className="h-4 w-4" /> : k === 'invoice' || k === 'reminder' ? <FileText className="h-4 w-4" /> : k === 'booking' ? <CalendarDays className="h-4 w-4" /> : <Bell className="h-4 w-4" />)

  return (
    <SidebarLayout
      menuLabel={t('espace.nav.menu')}
      brand={
        <Link to="/espace">
          <Logo className="h-5" />
        </Link>
      }
      nav={items}
      footer={
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-sand-100 hover:text-ink">
          <Home className="h-[18px] w-[18px]" /> {t('espace.nav.backToSite')}
        </Link>
      }
      topbar={
        <>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{c.company}</div>
            <div className="truncate text-xs text-muted">{t('common.addressLine')}</div>
          </div>
          <LangSwitch className="hidden sm:inline-flex" />
          <NotificationBell
            label={t('espace.notifications.bell')}
            title={t('espace.notifications.title')}
            emptyText={t('espace.notifications.empty')}
            markAllLabel={t('espace.notifications.markAll')}
            onMarkAll={() => markAll(c.id)}
            unread={notifications.filter((n) => !n.read).length}
            items={[...notifications]
              .sort((a, b) => b.at.localeCompare(a.at))
              .slice(0, 12)
              .map((n) => ({
                id: n.id,
                icon: icon(n.kind),
                text: td(`espace.notifications.${n.text}`, fmtParams(n.params)),
                time: relativeTime(n.at, lang),
                unread: !n.read,
                onClick: () => {
                  markOne(n.id)
                  nav(n.link)
                },
              }))}
          />
          <AccountMenu />
        </>
      }
    >
      <Outlet />
    </SidebarLayout>
  )
}

function AccountMenu() {
  const { t } = useT()
  const c = useCustomer()
  const logout = useStore((s) => s.logout)
  const login = useStore((s) => s.loginCustomer)
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  const initials = `${c.firstName[0]}${c.lastName[0]}`
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-sand-100" aria-label={t('espace.nav.account')}>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper">{initials}</span>
        <span className="hidden text-sm font-semibold md:inline">{c.firstName}</span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-sand-200 bg-paper p-1.5 shadow-pop animate-slide-up">
          <div className="px-3 py-2.5">
            <div className="text-sm font-bold">
              {c.firstName} {c.lastName}
            </div>
            <div className="truncate text-xs text-muted">{c.email}</div>
          </div>
          <div className="my-1 h-px bg-sand-200" />
          <Link to="/espace/profil" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-sand-100">
            <UserRound className="h-4 w-4" /> {t('espace.nav.profile')}
          </Link>
          {c.id !== 'c_rochat' && (
            <button
              onClick={() => {
                login('c_rochat')
                setOpen(false)
                nav('/espace')
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm hover:bg-sand-100"
            >
              <ArrowLeftRight className="h-4 w-4" /> {t('espace.nav.switchDemo')}
            </button>
          )}
          <button
            onClick={() => {
              logout()
              nav('/espace/connexion')
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-bad hover:bg-bad-bg"
          >
            <LogOut className="h-4 w-4" /> {t('espace.nav.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
