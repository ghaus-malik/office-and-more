import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { isLive, mrr, mrrByProduct } from '@/store/selectors'
import { Card, CardHeader, Segmented } from '@/core/ui'
import { DataTable } from '@/core/data'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { chf, formatDate } from '@/lib/format'
import { SubStatusBadge } from '@/shared/badges'
import type { Subscription } from '@/store/types'

export function AdminSubscriptions() {
  const { t, td } = useT()
  const nav = useNavigate()
  const state = useStore()
  const [f, setF] = useState<'all' | 'active' | 'late' | 'cancelled'>('all')
  const total = mrr(state)
  const by = mrrByProduct(state)
  const rows = state.subscriptions.filter((s) => f === 'all' || s.status === f)
  const company = (id: string) => state.customers.find((c) => c.id === id)?.company ?? ''
  const name = (s: Subscription) => (s.product === 'office' ? td('common.products.officeN', { n: state.offices.find((o) => o.id === s.officeId)?.number ?? '' }) : td(`common.products.${s.product}`))
  const max = Math.max(...by.map((b) => b.total), 1)

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader title={t('admin.subs.title')} subtitle={t('admin.subs.subtitle', { n: state.subscriptions.filter(isLive).length, mrr: chf(total) })} />
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card className="overflow-hidden">
          <DataTable
            rows={rows}
            rowKey={(s) => s.id}
            onRowClick={(s) => nav(`/admin/clients/${s.customerId}`)}
            searchable
            searchText={(s) => `${company(s.customerId)} ${name(s)}`}
            searchPlaceholder={t('common.search')}
            initialSort={{ id: 'price', dir: 'desc' }}
            toolbar={<Segmented value={f} onChange={setF} options={(['all', 'active', 'late', 'cancelled'] as const).map((k) => ({ id: k, label: t(`admin.subs.filter.${k}`) }))} />}
            columns={[
              { id: 'product', header: t('admin.subs.product'), sortValue: (s) => name(s), cell: (s) => <span className="font-semibold">{name(s)}</span> },
              { id: 'client', header: t('admin.subs.client'), sortValue: (s) => company(s.customerId), cell: (s) => company(s.customerId) },
              { id: 'price', header: t('admin.subs.price'), align: 'right', sortValue: (s) => s.price, cell: (s) => <span className="font-semibold">{chf(s.price)}</span> },
              { id: 'start', header: t('admin.subs.start'), hideOnMobile: true, sortValue: (s) => s.startDate, cell: (s) => formatDate(s.startDate) },
              { id: 'renewal', header: t('admin.subs.renewal'), hideOnMobile: true, sortValue: (s) => s.nextRenewal, cell: (s) => formatDate(s.nextRenewal) },
              { id: 'method', header: t('admin.subs.method'), hideOnMobile: true, cell: (s) => td(`common.methods.${s.paymentMethod}`) },
              { id: 'status', header: t('admin.subs.status'), sortValue: (s) => s.status, cell: (s) => <SubStatusBadge status={s.status} /> },
            ]}
          />
        </Card>
        <Card className="self-start">
          <CardHeader title={t('admin.subs.byProduct')} />
          <ul className="mt-4 space-y-4 px-5">
            {by.map((b) => (
              <li key={b.product}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{td(`common.products.${b.product}`)}</span>
                  <span className="font-bold tabular-nums">{chf(b.total)}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-sand-100">
                    <div className="h-full rounded-full bg-ink" style={{ width: `${(b.total / max) * 100}%` }} />
                  </div>
                  <span className="w-24 text-right text-xs text-muted">{t('admin.subs.count', { n: b.count })}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-sand-200 px-5 py-4">
            <span className="font-bold">{t('admin.subs.total')}</span>
            <span className="text-2xl font-extrabold tabular-nums">{chf(total)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
