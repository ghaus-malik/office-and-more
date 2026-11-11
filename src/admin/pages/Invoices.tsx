import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bell, CheckCircle2, CreditCard, RefreshCw, Smartphone, FileText } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Badge, Button, Card, Drawer, EmptyState, Segmented, Tabs, toast } from '@/core/ui'
import { DataTable } from '@/core/data'
import { InvoicePreview } from '@/core/flows'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { chf, formatDate, formatDateTime, formatTime } from '@/lib/format'
import { cn } from '@/lib/cn'
import { InvoiceStatusBadge } from '@/shared/badges'
import type { Invoice } from '@/store/types'

export function AdminInvoices() {
  const { t, td } = useT()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'payments' ? 'payments' : 'invoices'
  const invoices = useStore((s) => s.invoices)
  const payments = useStore((s) => s.payments)
  const customers = useStore((s) => s.customers)
  const lastSync = useStore((s) => s.lastBexioSync)
  const sync = useStore((s) => s.syncBexio)
  const sendReminder = useStore((s) => s.sendReminder)
  const [filter, setFilter] = useState<'all' | 'open' | 'overdue' | 'paid'>('all')
  const [syncing, setSyncing] = useState(false)
  const selected = invoices.find((i) => i.id === params.get('item'))
  const company = (id?: string) => customers.find((c) => c.id === id)?.company ?? ''

  const setParam = (k: string, v: string | null) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    setParams(p, { replace: true })
  }

  const month = new Date().toISOString().slice(0, 7)
  const totals = {
    paid: payments.filter((p) => p.at.slice(0, 7) === month).reduce((s, p) => s + p.amount, 0),
    open: invoices.filter((i) => i.status === 'pending').reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0),
  }
  const rows = invoices.filter((i) => filter === 'all' || (filter === 'open' ? i.status !== 'paid' : i.status === filter))

  const doSync = () => {
    setSyncing(true)
    setTimeout(() => {
      sync()
      setSyncing(false)
      toast(t('admin.invoices.synced'))
    }, 1100)
  }

  const remind = (i: Invoice) => {
    sendReminder(i.id)
    toast(t('admin.invoices.reminderSent', { level: Math.min(2, i.reminder + 1), company: company(i.customerId) }))
  }

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        title={t('admin.invoices.title')}
        subtitle={t('admin.invoices.subtitle')}
        actions={
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:inline">{t('admin.invoices.lastSync', { time: formatDateTime(lastSync) })}</span>
            <Button variant="secondary" onClick={doSync} disabled={syncing} icon={<RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} />}>
              {syncing ? t('admin.invoices.syncing') : t('admin.invoices.sync')}
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {(['paid', 'open', 'overdue'] as const).map((k) => (
          <Card key={k} className="p-5">
            <div className="text-[13px] font-medium text-muted">{t(`admin.invoices.totals.${k}`)}</div>
            <div className={cn('mt-2 text-2xl font-extrabold tabular-nums', k === 'overdue' && totals.overdue > 0 && 'text-bad', k === 'paid' && 'text-ok')}>{chf(totals[k], { cents: true })}</div>
          </Card>
        ))}
      </div>

      <Tabs
        className="mb-4"
        value={tab}
        onChange={(v) => setParam('tab', v === 'payments' ? 'payments' : null)}
        tabs={[
          { id: 'invoices', label: t('admin.invoices.tabs.invoices'), count: invoices.length },
          { id: 'payments', label: t('admin.invoices.tabs.payments'), count: payments.length },
        ]}
      />

      {tab === 'invoices' ? (
        <Card className="overflow-hidden">
          <DataTable
            rows={rows}
            rowKey={(i) => i.id}
            onRowClick={(i) => setParam('item', i.id)}
            searchable
            searchText={(i) => `${i.number} ${company(i.customerId)}`}
            searchPlaceholder={t('common.search')}
            initialSort={{ id: 'date', dir: 'desc' }}
            toolbar={<Segmented value={filter} onChange={setFilter} options={(['all', 'open', 'overdue', 'paid'] as const).map((f) => ({ id: f, label: t(`admin.invoices.filter.${f}`) }))} />}
            empty={<EmptyState icon={<FileText className="h-5 w-5" />} title={t('admin.invoices.none')} />}
            columns={[
              { id: 'number', header: t('admin.invoices.number'), sortValue: (i) => i.number, cell: (i) => <span className="font-semibold">{i.number}</span> },
              { id: 'client', header: t('admin.invoices.client'), sortValue: (i) => company(i.customerId), cell: (i) => company(i.customerId) },
              { id: 'date', header: t('admin.invoices.date'), sortValue: (i) => i.date, hideOnMobile: true, cell: (i) => <span className="tabular-nums">{formatDate(i.date)}</span> },
              { id: 'due', header: t('admin.invoices.due'), sortValue: (i) => i.dueDate, hideOnMobile: true, cell: (i) => <span className={cn('tabular-nums', i.status === 'overdue' && 'font-semibold text-bad')}>{formatDate(i.dueDate)}</span> },
              { id: 'amount', header: t('admin.invoices.amount'), align: 'right', sortValue: (i) => i.amount, cell: (i) => <span className="font-semibold">{chf(i.amount, { cents: true })}</span> },
              { id: 'status', header: t('admin.invoices.status'), sortValue: (i) => i.status, cell: (i) => <InvoiceStatusBadge invoice={i} /> },
              {
                id: 'reminder',
                header: t('admin.invoices.reminder'),
                cell: (i) =>
                  i.reminder > 0 && i.status !== 'paid' ? (
                    <Badge tone="bad">{t('common.invoice.reminderLevel', { n: i.reminder })}</Badge>
                  ) : (
                    <span className="text-muted">{t('admin.invoices.noReminder')}</span>
                  ),
              },
              {
                id: 'bexio',
                header: t('admin.invoices.bexio'),
                hideOnMobile: true,
                cell: (i) => (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted" title={formatDateTime(i.bexioSyncedAt)}>
                    <CheckCircle2 className={cn('h-4 w-4 text-ok', syncing && 'animate-pulse')} />
                    <span className="tabular-nums">{formatDate(new Date(i.bexioSyncedAt)) === formatDate(new Date()) ? formatTime(i.bexioSyncedAt) : formatDate(new Date(i.bexioSyncedAt))}</span>
                  </span>
                ),
              },
              {
                id: 'act',
                header: '',
                align: 'right',
                cell: (i) =>
                  i.status === 'overdue' && i.reminder < 2 ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Bell className="h-3.5 w-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation()
                        remind(i)
                      }}
                    >
                      {t('admin.invoices.sendReminder')}
                    </Button>
                  ) : null,
              },
            ]}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <DataTable
            rows={payments}
            rowKey={(p) => p.id}
            initialSort={{ id: 'date', dir: 'desc' }}
            searchable
            searchText={(p) => `${p.payer} ${p.labelParams?.number ?? ''} ${p.labelParams?.ref ?? ''}`}
            searchPlaceholder={t('common.search')}
            columns={[
              { id: 'date', header: t('admin.invoices.date'), sortValue: (p) => p.at, cell: (p) => <span className="tabular-nums">{formatDateTime(p.at)}</span> },
              { id: 'payer', header: t('admin.invoices.payer'), sortValue: (p) => p.payer, cell: (p) => <span className="font-semibold">{p.payer}</span> },
              { id: 'label', header: t('admin.invoices.label'), hideOnMobile: true, cell: (p) => td(`admin.invoices.labels.${p.label}`, p.labelParams) },
              {
                id: 'method',
                header: t('admin.invoices.method'),
                cell: (p) => (
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    {p.method === 'twint' ? <Smartphone className="h-4 w-4" /> : p.method === 'card' ? <CreditCard className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    {td(`common.methods.${p.method}`)}
                  </span>
                ),
              },
              { id: 'amount', header: t('admin.invoices.amount'), align: 'right', sortValue: (p) => p.amount, cell: (p) => <span className="font-semibold text-ok">+{chf(p.amount, { cents: true })}</span> },
            ]}
          />
        </Card>
      )}

      <Drawer
        open={!!selected}
        onClose={() => setParam('item', null)}
        title={selected?.number}
        width="max-w-3xl"
        closeLabel={t('common.close')}
        footer={
          selected &&
          selected.status === 'overdue' &&
          selected.reminder < 2 && (
            <Button icon={<Bell className="h-4 w-4" />} onClick={() => remind(selected)}>
              {t('admin.invoices.sendReminder')}
            </Button>
          )
        }
      >
        {selected && (
          <div className="bg-sand-50 p-4 sm:p-6">
            <InvoicePreview invoice={selected} customer={customers.find((c) => c.id === selected.customerId)} />
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <CheckCircle2 className="h-3.5 w-3.5 text-ok" /> {t('admin.invoices.synced')} · {formatDateTime(selected.bexioSyncedAt)}
            </p>
          </div>
        )}
      </Drawer>
    </div>
  )
}
