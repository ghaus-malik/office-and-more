import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Mail, Phone } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { customerMonthlyValue, customerOpenBalance, fullName } from '@/store/selectors'
import { Button, Card, DescList, EmptyState, Tabs } from '@/core/ui'
import { DataTable } from '@/core/data'
import { chf, formatDate, formatDateTime } from '@/lib/format'
import { relativeTime } from '@/lib/relative'
import { BookingPaymentBadge, InvoiceStatusBadge, MailStatusBadge, SubStatusBadge } from '@/shared/badges'
import { useActivityText } from '../useActivityText'
import { ActivityIcon } from '../components/ActivityIcon'

type Tab = 'overview' | 'subscriptions' | 'bookings' | 'mail' | 'invoices' | 'activity'

export function ClientProfile() {
  const { id } = useParams()
  const { t, td, lang } = useT()
  const nav = useNavigate()
  const state = useStore()
  const login = useStore((s) => s.loginCustomer)
  const text = useActivityText()
  const [tab, setTab] = useState<Tab>('overview')
  const c = state.customers.find((x) => x.id === id)
  if (!c) return <EmptyState title={t('admin.nav.noResults')} action={<Link to="/admin/clients" className="font-semibold underline">{t('admin.clients.back')}</Link>} />

  const subs = state.subscriptions.filter((s) => s.customerId === c.id)
  const bookings = state.bookings.filter((b) => b.customerId === c.id)
  const mail = state.mail.filter((m) => m.customerId === c.id)
  const invoices = state.invoices.filter((i) => i.customerId === c.id)
  const activity = state.activity.filter((a) => a.customerId === c.id)
  const productName = (p: string, officeId?: string) => (p === 'office' ? td('common.products.officeN', { n: state.offices.find((o) => o.id === officeId)?.number ?? '' }) : td(`common.products.${p}`))

  return (
    <div className="mx-auto max-w-[1100px]">
      <Link to="/admin/clients" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {t('admin.clients.back')}
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-lg font-bold text-paper">
            {c.firstName[0]}
            {c.lastName[0]}
          </span>
          <div>
            <h1 className="text-[28px] font-extrabold leading-tight tracking-tight">{c.company}</h1>
            <p className="text-sm text-muted">
              {fullName(c)} · {td(`admin.clients.kinds.${c.kind}`)} · {t('admin.clients.since', { date: formatDate(c.since) })}
            </p>
          </div>
        </div>
        {c.kind !== 'room' && (
          <Button
            variant="secondary"
            icon={<ExternalLink className="h-4 w-4" />}
            onClick={() => {
              login(c.id)
              nav('/espace')
            }}
          >
            {t('admin.clients.loginAs')}
          </Button>
        )}
      </div>

      <Tabs
        className="mb-6 mt-6"
        value={tab}
        onChange={setTab}
        tabs={(['overview', 'subscriptions', 'bookings', 'mail', 'invoices', 'activity'] as const).map((k) => ({
          id: k,
          label: t(`admin.clients.tabs.${k}`),
          count: k === 'subscriptions' ? subs.length : k === 'bookings' ? bookings.length : k === 'mail' ? mail.length : k === 'invoices' ? invoices.length : k === 'activity' ? activity.length : undefined,
        }))}
      />

      {tab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <Card className="p-5">
            <h3 className="mb-2 text-sm font-bold">{t('admin.clients.contact')}</h3>
            <DescList
              items={[
                { label: t('common.email_'), value: <a className="inline-flex items-center gap-1.5 hover:underline" href={`mailto:${c.email}`}><Mail className="h-3.5 w-3.5" />{c.email}</a> },
                { label: t('common.phone_'), value: <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{c.phone}</span> },
                { label: t('common.legalForm'), value: td(`common.legalForms.${c.legalForm}`) },
                { label: t('common.uid'), value: c.uid ?? '—' },
                { label: t('common.activity'), value: c.activity ?? '—' },
                { label: t('common.street_'), value: `${c.address.street}, ${c.address.zip} ${c.address.city}` },
              ]}
            />
          </Card>
          <div className="grid grid-cols-2 gap-4 self-start">
            <Card className="p-5">
              <div className="text-xs text-muted">{t('admin.clients.monthly')}</div>
              <div className="mt-2 text-2xl font-extrabold">{chf(customerMonthlyValue(state, c.id))}</div>
            </Card>
            <Card className="p-5">
              <div className="text-xs text-muted">{t('admin.clients.balance')}</div>
              <div className={`mt-2 text-2xl font-extrabold ${customerOpenBalance(state, c.id) ? 'text-bad' : ''}`}>{chf(customerOpenBalance(state, c.id))}</div>
            </Card>
            <Card className="col-span-2 p-5">
              <div className="mb-2 text-xs text-muted">{t('admin.clients.tabs.activity')}</div>
              <ul className="space-y-2">
                {activity.slice(0, 4).map((a) => (
                  <li key={a.id} className="text-sm">
                    {text(a)} <span className="text-xs text-muted">· {relativeTime(a.at, lang)}</span>
                  </li>
                ))}
                {activity.length === 0 && <li className="text-sm text-muted">{t('admin.clients.none')}</li>}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {tab === 'subscriptions' && (
        <Card className="overflow-hidden">
          <DataTable
            rows={subs}
            rowKey={(s) => s.id}
            empty={<EmptyState title={t('admin.clients.none')} />}
            columns={[
              { id: 'p', header: t('admin.subs.product'), cell: (s) => <span className="font-semibold">{productName(s.product, s.officeId)}</span> },
              { id: 'price', header: t('admin.subs.price'), align: 'right', cell: (s) => chf(s.price) },
              { id: 'start', header: t('admin.subs.start'), cell: (s) => formatDate(s.startDate) },
              { id: 'renew', header: t('admin.subs.renewal'), cell: (s) => formatDate(s.nextRenewal) },
              { id: 'status', header: t('admin.subs.status'), cell: (s) => <SubStatusBadge status={s.status} /> },
            ]}
          />
        </Card>
      )}
      {tab === 'bookings' && (
        <Card className="overflow-hidden">
          <DataTable
            rows={bookings}
            rowKey={(b) => b.id}
            initialSort={{ id: 'date', dir: 'desc' }}
            empty={<EmptyState title={t('admin.clients.none')} />}
            columns={[
              { id: 'date', header: t('common.date'), sortValue: (b) => b.date, cell: (b) => formatDate(b.date) },
              { id: 'time', header: t('common.time'), cell: (b) => `${b.start}–${b.end}` },
              { id: 'kind', header: t('admin.room.kind'), cell: (b) => td(`common.bookingKinds.${b.kind}`) },
              { id: 'amount', header: t('common.amount'), align: 'right', cell: (b) => chf(b.amount) },
              { id: 'pay', header: t('common.status'), cell: (b) => <BookingPaymentBadge payment={b.payment} /> },
            ]}
          />
        </Card>
      )}
      {tab === 'mail' && (
        <Card className="overflow-hidden">
          <DataTable
            rows={mail}
            rowKey={(m) => m.id}
            empty={<EmptyState title={t('admin.clients.none')} />}
            columns={[
              { id: 'date', header: t('common.date'), cell: (m) => formatDate(new Date(m.receivedAt)) },
              { id: 'sender', header: t('admin.mail.sender'), cell: (m) => m.sender },
              { id: 'type', header: t('admin.mail.type'), cell: (m) => td(`common.mailTypes.${m.type}`) },
              { id: 'status', header: t('common.status'), cell: (m) => <MailStatusBadge status={m.status} /> },
            ]}
          />
        </Card>
      )}
      {tab === 'invoices' && (
        <Card className="overflow-hidden">
          <DataTable
            rows={invoices}
            rowKey={(i) => i.id}
            onRowClick={(i) => nav(`/admin/factures?item=${i.id}`)}
            initialSort={{ id: 'date', dir: 'desc' }}
            empty={<EmptyState title={t('admin.clients.none')} />}
            columns={[
              { id: 'n', header: t('admin.invoices.number'), cell: (i) => <span className="font-semibold">{i.number}</span> },
              { id: 'date', header: t('admin.invoices.date'), sortValue: (i) => i.date, cell: (i) => formatDate(i.date) },
              { id: 'amount', header: t('admin.invoices.amount'), align: 'right', cell: (i) => chf(i.amount, { cents: true }) },
              { id: 'status', header: t('admin.invoices.status'), cell: (i) => <InvoiceStatusBadge invoice={i} showReminder /> },
            ]}
          />
        </Card>
      )}
      {tab === 'activity' && (
        <Card>
          {activity.length === 0 ? (
            <EmptyState title={t('admin.clients.none')} />
          ) : (
            <ul className="divide-y divide-sand-200">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                  <ActivityIcon type={a.type} />
                  <div className="flex-1">
                    <p className="text-sm">{text(a)}</p>
                    <p className="text-xs text-muted">{formatDateTime(a.at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  )
}
