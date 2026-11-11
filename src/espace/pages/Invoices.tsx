import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, Download, FileText, RefreshCw } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Button, Card, Drawer, EmptyState, Modal, toast } from '@/core/ui'
import { InvoicePreview, PaymentPanel } from '@/core/flows'
import { DataTable } from '@/core/data'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { chf, formatDate, formatDateTime } from '@/lib/format'
import { InvoiceStatusBadge } from '@/shared/badges'
import { useCustomer } from '../useCustomer'

export function Invoices() {
  const { t } = useT()
  const c = useCustomer()
  const [params, setParams] = useSearchParams()
  const invoices = useStore((s) => s.invoices.filter((i) => i.customerId === c.id))
  const payInvoice = useStore((s) => s.payInvoice)
  const [paying, setPaying] = useState(false)
  const selected = invoices.find((i) => i.id === params.get('item'))
  const openTotal = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)

  const open = (id: string | null) => {
    const p = new URLSearchParams(params)
    if (id) p.set('item', id)
    else p.delete('item')
    setParams(p, { replace: true })
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t('espace.invoices.title')}
        subtitle={t('espace.invoices.subtitle')}
        actions={
          openTotal > 0 && (
            <div className="rounded-2xl border border-sand-200 px-4 py-2.5 text-right">
              <div className="text-xs text-muted">{t('espace.invoices.open')}</div>
              <div className="text-lg font-extrabold tabular-nums">{chf(openTotal, { cents: true })}</div>
            </div>
          )
        }
      />
      <Card className="overflow-hidden">
        <DataTable
          rows={[...invoices].sort((a, b) => b.date.localeCompare(a.date))}
          rowKey={(i) => i.id}
          onRowClick={(i) => open(i.id)}
          empty={<EmptyState icon={<FileText className="h-5 w-5" />} title={t('espace.invoices.empty')} />}
          columns={[
            { id: 'number', header: t('espace.invoices.number'), cell: (i) => <span className="font-semibold">{i.number}</span> },
            { id: 'date', header: t('espace.invoices.date'), cell: (i) => formatDate(i.date), hideOnMobile: true },
            { id: 'amount', header: t('espace.invoices.amount'), align: 'right', cell: (i) => <span className="font-semibold">{chf(i.amount, { cents: true })}</span> },
            { id: 'status', header: t('espace.invoices.status'), cell: (i) => <InvoiceStatusBadge invoice={i} showReminder /> },
          ]}
        />
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => open(null)}
        width="max-w-3xl"
        closeLabel={t('common.close')}
        title={selected?.number}
        footer={
          selected && (
            <>
              <a href="/docs/facture-exemple.pdf" download className="inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold ring-1 ring-inset ring-sand-300 hover:bg-sand-50 hover:ring-ink">
                <Download className="h-4 w-4" /> {t('common.invoice.downloadPdf')}
              </a>
              {selected.status !== 'paid' && <Button onClick={() => setPaying(true)}>{t('common.invoice.payNow')}</Button>}
            </>
          )
        }
      >
        {selected && (
          <div className="bg-sand-50 p-4 sm:p-6">
            {selected.status === 'paid' && selected.paidAt && (
              <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-ok">
                <CheckCircle2 className="h-4 w-4" /> {t('common.invoice.paidOn', { date: formatDate(new Date(selected.paidAt)) })}
              </p>
            )}
            <InvoicePreview invoice={selected} customer={c} />
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <RefreshCw className="h-3.5 w-3.5" /> {t('espace.invoices.syncedBexio')} · {formatDateTime(selected.bexioSyncedAt)}
            </p>
          </div>
        )}
      </Drawer>

      <Modal open={paying && !!selected} onClose={() => setPaying(false)} title={selected ? t('espace.invoices.payTitle', { number: selected.number }) : ''} closeLabel={t('common.close')}>
        {selected && (
          <PaymentPanel
            amount={selected.amount}
            defaultName={`${c.firstName} ${c.lastName}`}
            onPaid={(method) => {
              payInvoice(selected.id, method)
              setPaying(false)
              toast(t('espace.invoices.paid'))
            }}
          />
        )}
      </Modal>
    </div>
  )
}
