import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Mail, Package, Repeat, Sparkles, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { isLive } from '@/store/selectors'
import { Card } from '@/core/ui'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { chf, formatDate } from '@/lib/format'
import { toISODate } from '@/lib/format'
import { today } from '@/lib/dates'
import { MailStatusBadge, SubStatusBadge } from '@/shared/badges'
import { useCustomer } from '../useCustomer'

function Tile({ icon, title, to, children }: { icon: ReactNode; title: string; to: string; children: ReactNode }) {
  return (
    <Link to={to} className="group flex flex-col rounded-2xl border border-sand-200 bg-paper p-5 transition hover:border-ink">
      <div className="flex items-center justify-between text-sm font-medium text-muted">
        <span className="flex items-center gap-2">
          {icon} {title}
        </span>
        <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="mt-4 flex-1">{children}</div>
    </Link>
  )
}

export function Dashboard() {
  const { t, td } = useT()
  const c = useCustomer()
  const subs = useStore((s) => s.subscriptions.filter((x) => x.customerId === c.id && x.status !== 'cancelled'))
  const mail = useStore((s) => s.mail.filter((m) => m.customerId === c.id))
  const bookings = useStore((s) => s.bookings.filter((b) => b.customerId === c.id))
  const invoices = useStore((s) => s.invoices.filter((i) => i.customerId === c.id && i.status !== 'paid'))
  const main = subs.find((s) => s.product !== 'phone' && s.product !== 'locker') ?? subs[0]
  const unread = mail.filter((m) => m.unread)
  const todayIso = toISODate(today())
  const next = bookings.filter((b) => b.date >= todayIso).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0]
  const due = [...invoices].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
  const monthly = subs.filter(isLive).reduce((s, x) => s + x.price, 0)

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={t('espace.dashboard.hello', { name: c.firstName })} subtitle={t('espace.dashboard.subtitle', { company: c.company })} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Tile icon={<Repeat className="h-4 w-4" />} title={t('espace.dashboard.subscription')} to="/espace/abonnements">
          {main ? (
            <>
              <div className="text-lg font-extrabold leading-tight">{main.product === 'office' ? td('common.products.officeN', { n: main.officeId?.slice(1) ?? '' }) : td(`common.products.${main.product}`)}</div>
              <div className="mt-2">
                <SubStatusBadge status={main.status} />
              </div>
              <div className="mt-3 text-sm text-muted">
                {main.status === 'pending' ? t('espace.dashboard.pendingText') : t('espace.dashboard.renewal', { date: formatDate(main.nextRenewal) })}
              </div>
              {monthly > 0 && <div className="mt-1 text-sm font-semibold">{chf(monthly)} {t('common.perMonth')}</div>}
            </>
          ) : (
            <div className="text-sm text-muted">{t('espace.dashboard.noSubscription')}</div>
          )}
        </Tile>
        <Tile icon={<Mail className="h-4 w-4" />} title={t('espace.dashboard.newMail')} to="/espace/courrier">
          <div className="text-[34px] font-extrabold leading-none tracking-tight">{unread.length}</div>
          <div className="mt-2 text-sm text-muted">
            {unread.length === 0 ? t('espace.dashboard.noNewMail') : t(unread.length === 1 ? 'espace.dashboard.newMailCount' : 'espace.dashboard.newMailCountPlural', { n: unread.length })}
          </div>
        </Tile>
        <Tile icon={<CalendarDays className="h-4 w-4" />} title={t('espace.dashboard.nextBooking')} to="/espace/reservations">
          {next ? (
            <>
              <div className="text-lg font-extrabold">{formatDate(next.date)}</div>
              <div className="mt-1 text-sm tabular-nums text-muted">
                {next.start} – {next.end}
              </div>
              <div className="mt-1 text-sm">{td(`common.bookingKinds.${next.kind}`)}</div>
            </>
          ) : (
            <div className="text-sm text-muted">{t('espace.dashboard.noBooking')}</div>
          )}
        </Tile>
        <Tile icon={<Wallet className="h-4 w-4" />} title={t('espace.dashboard.invoiceDue')} to={due ? `/espace/factures?item=${due.id}` : '/espace/factures'}>
          {due ? (
            <>
              <div className="text-lg font-extrabold tabular-nums">{chf(due.amount, { cents: true })}</div>
              <div className={due.status === 'overdue' ? 'mt-1 text-sm font-semibold text-bad' : 'mt-1 text-sm text-muted'}>{t('espace.dashboard.dueOn', { date: formatDate(due.dueDate) })}</div>
              <div className="mt-1 text-xs text-muted">{due.number}</div>
            </>
          ) : (
            <div className="text-sm font-semibold text-ok">{t('espace.dashboard.noInvoice')}</div>
          )}
        </Tile>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-[15px] font-bold">{t('espace.dashboard.recentMail')}</h2>
            <Link to="/espace/courrier" className="text-sm font-semibold text-muted hover:text-ink">
              {t('common.seeAll')}
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-sand-200">
            {mail.slice(0, 4).map((m) => (
              <li key={m.id}>
                <Link to={`/espace/courrier?item=${m.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-sand-50">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand-100">{m.type === 'parcel' ? <Package className="h-4 w-4" /> : <Mail className="h-4 w-4" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className={m.unread ? 'block truncate text-sm font-bold' : 'block truncate text-sm font-medium'}>{m.sender}</span>
                    <span className="block text-xs text-muted">
                      {formatDate(new Date(m.receivedAt))} · {td(`common.mailTypes.${m.type}`)}
                    </span>
                  </span>
                  {m.unread && <span className="h-2 w-2 rounded-full bg-bad" />}
                  <MailStatusBadge status={m.status} />
                </Link>
              </li>
            ))}
            {mail.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted">{t('espace.mail.empty')}</li>}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="text-[15px] font-bold">{t('espace.dashboard.quick')}</h2>
          <div className="mt-4 space-y-2">
            {[
              { to: '/espace/reservations?new=1', icon: <CalendarDays className="h-4 w-4" />, label: t('espace.dashboard.bookRoom') },
              { to: '/espace/services', icon: <Sparkles className="h-4 w-4" />, label: t('espace.dashboard.orderService') },
              { to: '/espace/courrier', icon: <Mail className="h-4 w-4" />, label: t('espace.dashboard.seeMail') },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="group flex items-center gap-3 rounded-xl border border-sand-200 px-4 py-3 text-sm font-semibold transition hover:border-ink">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-100">{a.icon}</span>
                <span className="flex-1">{a.label}</span>
                <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
