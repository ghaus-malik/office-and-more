import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Building2, CalendarDays, ChevronDown, ExternalLink, FileText, Inbox, KanbanSquare, LayoutDashboard, Mail, Repeat, Search, Settings, Sparkles, Users, Wallet, Zap, LogOut } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Logo } from '@/theme/Logo'
import { SidebarLayout, type NavItem } from '@/core/layout/SidebarLayout'
import { NotificationBell } from '@/core/layout/NotificationBell'
import { LangSwitch } from '@/core/layout/LangSwitch'
import { relativeTime } from '@/lib/relative'
import { chf } from '@/lib/format'
import { useActivityText } from './useActivityText'
import { ActivityIcon } from './components/ActivityIcon'

export function AdminLayout() {
  const { t, lang } = useT()
  const nav = useNavigate()
  const activity = useStore((s) => s.activity)
  const adminReadAt = useStore((s) => s.adminReadAt)
  const markRead = useStore((s) => s.markAdminRead)
  const newApps = useStore((s) => s.applications.filter((a) => a.stage === 'new').length)
  const pendingFwd = useStore((s) => s.forwards.filter((f) => f.status === 'pending').length)
  const newServices = useStore((s) => s.serviceRequests.filter((r) => r.status === 'new').length)
  const overdue = useStore((s) => s.invoices.filter((i) => i.status === 'overdue').length)
  const text = useActivityText()

  const items: NavItem[] = [
    { to: '/admin', label: t('admin.nav.overview'), icon: <LayoutDashboard />, end: true },
    { to: '/admin/bureaux', label: t('admin.nav.offices'), icon: <Building2 /> },
    { to: '/admin/demandes', label: t('admin.nav.applications'), icon: <KanbanSquare />, badge: newApps },
    { to: '/admin/salle', label: t('admin.nav.room'), icon: <CalendarDays /> },
    { to: '/admin/clients', label: t('admin.nav.clients'), icon: <Users /> },
    { to: '/admin/courrier', label: t('admin.nav.mail'), icon: <Mail />, badge: pendingFwd },
    { to: '/admin/abonnements', label: t('admin.nav.subscriptions'), icon: <Repeat /> },
    { to: '/admin/factures', label: t('admin.nav.invoices'), icon: <Wallet />, badge: overdue },
    { to: '/admin/services', label: t('admin.nav.services'), icon: <Sparkles />, badge: newServices },
    { to: '/admin/automatisations', label: t('admin.nav.automations'), icon: <Zap /> },
    { to: '/admin/parametres', label: t('admin.nav.settings'), icon: <Settings /> },
  ]

  const linkFor = (type: string) =>
    ({ booking: '/admin/salle', payment: '/admin/factures?tab=payments', mail: '/admin/courrier?tab=history', reminder: '/admin/factures', bexio: '/admin/factures', application: '/admin/demandes', approval: '/admin/demandes', forward: '/admin/courrier?tab=forwarding', service: '/admin/services', subscription: '/admin/abonnements', customer: '/admin/clients', price: '/admin/parametres' })[type] ?? '/admin'

  return (
    <div className="min-w-0">
      <SidebarLayout
        dark
        menuLabel={t('admin.nav.menu')}
        brand={
          <Link to="/admin" className="flex items-center gap-2">
            <Logo invert className="h-5" />
          </Link>
        }
        nav={items}
        footer={
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white">
            <ExternalLink className="h-[18px] w-[18px]" /> {t('admin.nav.viewSite')}
          </Link>
        }
        topbar={
          <>
            <GlobalSearch />
            <div className="ml-auto flex items-center gap-1.5">
              <LangSwitch className="hidden sm:inline-flex" />
              <NotificationBell
                label={t('admin.nav.notifications')}
                title={t('admin.nav.notifications')}
                emptyText={t('espace.notifications.empty')}
                markAllLabel={t('espace.notifications.markAll')}
                onMarkAll={markRead}
                unread={activity.filter((a) => a.at > adminReadAt).length}
                items={activity.slice(0, 15).map((a) => ({
                  id: a.id,
                  icon: <ActivityIcon type={a.type} className="h-8 w-8" />,
                  text: text(a),
                  time: relativeTime(a.at, lang),
                  unread: a.at > adminReadAt,
                  onClick: () => nav(linkFor(a.type)),
                }))}
              />
              <ProfileMenu />
            </div>
          </>
        }
      >
        <Outlet />
      </SidebarLayout>
    </div>
  )
}

function ProfileMenu() {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-sand-100">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper">Z</span>
        <span className="hidden text-sm font-semibold md:inline">Zulfi</span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-sand-200 bg-paper p-1.5 shadow-pop animate-slide-up">
          <div className="px-3 py-2.5">
            <div className="text-sm font-bold">Zulfi</div>
            <div className="text-xs text-muted">{t('admin.nav.role')}</div>
          </div>
          <div className="my-1 h-px bg-sand-200" />
          <Link to="/admin/parametres" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-sand-100">
            <Settings className="h-4 w-4" /> {t('admin.nav.settings')}
          </Link>
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-sand-100">
            <LogOut className="h-4 w-4" /> {t('admin.nav.signOut')}
          </Link>
        </div>
      )}
    </div>
  )
}

function GlobalSearch() {
  const { t } = useT()
  const nav = useNavigate()
  const customers = useStore((s) => s.customers)
  const invoices = useStore((s) => s.invoices)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const results = useMemo(() => {
    const n = q.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    if (n.length < 2) return []
    const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    const cs = customers
      .filter((c) => norm(`${c.firstName} ${c.lastName} ${c.company} ${c.email}`).includes(n))
      .slice(0, 6)
      .map((c) => ({ id: c.id, icon: <Users className="h-4 w-4" />, title: c.company, sub: `${c.firstName} ${c.lastName}`, to: `/admin/clients/${c.id}` }))
    const is = invoices
      .filter((i) => norm(i.number).includes(n))
      .slice(0, 4)
      .map((i) => ({ id: i.id, icon: <FileText className="h-4 w-4" />, title: i.number, sub: `${customers.find((c) => c.id === i.customerId)?.company ?? ''} · ${chf(i.amount)}`, to: `/admin/factures?item=${i.id}` }))
    return [...cs, ...is]
  }, [q, customers, invoices])

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={t('admin.nav.search')}
        className="h-10 w-full rounded-full bg-sand-100 pl-10 pr-4 text-sm placeholder:text-muted focus:bg-paper focus:outline-none focus:ring-2 focus:ring-ink/15"
      />
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-sand-200 bg-paper p-1.5 shadow-pop">
          {results.length === 0 && (
            <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted">
              <Inbox className="h-4 w-4" /> {t('admin.nav.noResults')}
            </div>
          )}
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                nav(r.to)
                setOpen(false)
                setQ('')
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-sand-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-100">{r.icon}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{r.title}</span>
                <span className="block truncate text-xs text-muted">{r.sub}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
