import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { customerMonthlyValue, customerOpenBalance, fullName, isLive, mrr } from '@/store/selectors'
import { Badge, Card, EmptyState, Segmented } from '@/core/ui'
import { DataTable } from '@/core/data'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { chf } from '@/lib/format'
import type { Customer } from '@/store/types'

export function Clients() {
  const { t, td } = useT()
  const nav = useNavigate()
  const state = useStore()
  const [kind, setKind] = useState<'all' | Customer['kind']>('all')
  const rows = state.customers.filter((c) => kind === 'all' || c.kind === kind)
  const services = (c: Customer) =>
    state.subscriptions
      .filter((s) => s.customerId === c.id && isLive(s))
      .map((s) => (s.product === 'office' ? td('common.products.officeN', { n: state.offices.find((o) => o.id === s.officeId)?.number ?? '' }) : td(`common.products.${s.product}`)))
  const tone = (s: Customer['status']) => (s === 'active' ? 'ok' : s === 'pending' ? 'warn' : 'neutral') as 'ok' | 'warn' | 'neutral'

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader title={t('admin.clients.title')} subtitle={t('admin.clients.subtitle', { n: state.customers.filter((c) => c.status !== 'inactive').length, mrr: chf(mrr(state)) })} />
      <Card className="overflow-hidden">
        <DataTable
          rows={rows}
          rowKey={(c) => c.id}
          onRowClick={(c) => nav(`/admin/clients/${c.id}`)}
          searchable
          searchText={(c) => `${fullName(c)} ${c.company} ${c.email}`}
          searchPlaceholder={t('admin.clients.search')}
          initialSort={{ id: 'monthly', dir: 'desc' }}
          toolbar={<Segmented value={kind} onChange={setKind} options={(['all', 'office', 'domiciliation', 'room'] as const).map((k) => ({ id: k, label: t(`admin.clients.filter.${k}`) }))} />}
          empty={<EmptyState icon={<Users className="h-5 w-5" />} title={t('admin.nav.noResults')} />}
          columns={[
            {
              id: 'name',
              header: t('admin.clients.name'),
              sortValue: (c) => c.lastName,
              cell: (c) => (
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand-100 text-xs font-bold">
                    {c.firstName[0]}
                    {c.lastName[0]}
                  </span>
                  <span>
                    <span className="block font-semibold">{fullName(c)}</span>
                    <span className="block text-xs text-muted md:hidden">{c.company}</span>
                  </span>
                </div>
              ),
            },
            { id: 'company', header: t('admin.clients.company'), sortValue: (c) => c.company, hideOnMobile: true, cell: (c) => c.company },
            {
              id: 'services',
              header: t('admin.clients.services'),
              hideOnMobile: true,
              cell: (c) => {
                const s = services(c)
                return s.length ? <span className="text-sm">{s.join(', ')}</span> : <span className="text-sm text-muted">{td(`admin.clients.kinds.${c.kind}`)}</span>
              },
            },
            { id: 'monthly', header: t('admin.clients.monthly'), align: 'right', sortValue: (c) => customerMonthlyValue(state, c.id), cell: (c) => <span className="font-semibold">{customerMonthlyValue(state, c.id) ? chf(customerMonthlyValue(state, c.id)) : '—'}</span> },
            {
              id: 'balance',
              header: t('admin.clients.balance'),
              align: 'right',
              sortValue: (c) => customerOpenBalance(state, c.id),
              cell: (c) => {
                const b = customerOpenBalance(state, c.id)
                const late = state.invoices.some((i) => i.customerId === c.id && i.status === 'overdue')
                return <span className={late ? 'font-semibold text-bad' : b ? 'font-semibold' : 'text-muted'}>{b ? chf(b) : '—'}</span>
              },
            },
            { id: 'status', header: t('admin.clients.status'), sortValue: (c) => c.status, cell: (c) => <Badge tone={tone(c.status)} dot>{td(`admin.clients.statuses.${c.status}`)}</Badge> },
          ]}
        />
      </Card>
    </div>
  )
}
