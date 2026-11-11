import { QRCodeSVG } from 'qrcode.react'
import { useT } from '@/i18n'
import { Logo } from '@/theme/Logo'
import { chf, formatDate, formatNumber } from '@/lib/format'
import type { Customer, Invoice, InvoiceLine } from '@/store/types'
import { Badge } from '@/core/ui'

const IBAN = 'CH44 3199 9123 0008 8901 2'

function qrReference(invoiceNumber: string) {
  const digits = invoiceNumber.replace(/\D/g, '').padStart(26, '0').slice(-26)
  return `${digits.slice(0, 2)} ${digits.slice(2).replace(/(.{5})/g, '$1 ').trim()}`
}

export function useLineLabel() {
  const { td } = useT()
  return (l: InvoiceLine) => {
    if (l.label === 'office') return td('common.products.officeN', l.labelParams)
    const k = `common.products.${l.label}`
    const s = td(k, l.labelParams)
    return s === k ? l.label : s
  }
}

/** Swiss QR-bill payment slip — a static, correctly laid out sample. */
export function QRBill({ invoice, customer }: { invoice: Invoice; customer?: Customer }) {
  const { t } = useT()
  const ref = qrReference(invoice.number)
  const payload = [
    'SPC', '0200', '1', IBAN.replace(/\s/g, ''), 'S', 'Office & More', 'Rue du Château', '7', '2000', 'Neuchâtel', 'CH',
    '', '', '', '', '', '', '', invoice.amount.toFixed(2), 'CHF', 'S', customer?.company ?? '', customer?.address.street ?? '', '',
    customer?.address.zip ?? '', customer?.address.city ?? '', 'CH', 'QRR', ref.replace(/\s/g, ''), invoice.number, 'EPD',
  ].join('\n')
  const payer = customer ? [customer.company, `${customer.firstName} ${customer.lastName}`, customer.address.street, `${customer.address.zip} ${customer.address.city}`] : []

  const Label = ({ children }: { children: React.ReactNode }) => <div className="text-[7.5px] font-bold leading-tight sm:text-[9px]">{children}</div>
  const Val = ({ children }: { children: React.ReactNode }) => <div className="text-[8px] leading-snug sm:text-[10px]">{children}</div>

  return (
    <div className="relative border-t border-dashed border-ink/60 bg-paper">
      <span className="absolute -top-2.5 left-4 bg-paper px-1 text-[10px]">✂</span>
      <div className="grid grid-cols-[30%_70%] text-ink">
        {/* Receipt */}
        <div className="space-y-2 border-r border-dashed border-ink/60 p-3 sm:p-4">
          <div className="text-[10px] font-bold sm:text-[12px]">{t('common.qrbill.receipt')}</div>
          <div>
            <Label>{t('common.qrbill.account')}</Label>
            <Val>
              {IBAN}
              <br />
              Office & More
              <br />
              Rue du Château 7<br />
              2000 Neuchâtel
            </Val>
          </div>
          <div>
            <Label>{t('common.qrbill.reference')}</Label>
            <Val>{ref}</Val>
          </div>
          <div>
            <Label>{t('common.qrbill.payableBy')}</Label>
            <Val>
              {payer.map((l, i) => (
                <span key={i} className="block">
                  {l}
                </span>
              ))}
            </Val>
          </div>
          <div className="flex gap-4 pt-1">
            <div>
              <Label>{t('common.qrbill.currency')}</Label>
              <Val>CHF</Val>
            </div>
            <div>
              <Label>{t('common.amount')}</Label>
              <Val>{formatNumber(invoice.amount, { cents: true }).replace('’', ' ')}</Val>
            </div>
          </div>
          <div className="pt-1 text-right">
            <Label>{t('common.qrbill.acceptance')}</Label>
          </div>
        </div>
        {/* Payment part */}
        <div className="grid grid-cols-[38%_62%] gap-3 p-3 sm:p-4">
          <div>
            <div className="mb-2 text-[10px] font-bold sm:text-[12px]">{t('common.qrbill.paymentPart')}</div>
            <div className="relative aspect-square w-full max-w-[160px]">
              <QRCodeSVG value={payload} level="M" className="h-full w-full" />
              <div className="absolute left-1/2 top-1/2 flex h-[15%] w-[15%] -translate-x-1/2 -translate-y-1/2 items-center justify-center border-[1.5px] border-white bg-black">
                <svg viewBox="0 0 10 10" className="h-[60%] w-[60%]">
                  <rect x="4" y="1" width="2" height="8" fill="white" />
                  <rect x="1" y="4" width="8" height="2" fill="white" />
                </svg>
              </div>
            </div>
            <div className="mt-2 flex gap-4">
              <div>
                <Label>{t('common.qrbill.currency')}</Label>
                <Val>CHF</Val>
              </div>
              <div>
                <Label>{t('common.amount')}</Label>
                <Val>{formatNumber(invoice.amount, { cents: true }).replace('’', ' ')}</Val>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <Label>{t('common.qrbill.account')}</Label>
              <Val>
                {IBAN}
                <br />
                Office & More
                <br />
                Rue du Château 7<br />
                2000 Neuchâtel
              </Val>
            </div>
            <div>
              <Label>{t('common.qrbill.reference')}</Label>
              <Val>{ref}</Val>
            </div>
            <div>
              <Label>{t('common.qrbill.additional')}</Label>
              <Val>{invoice.number}</Val>
            </div>
            <div>
              <Label>{t('common.qrbill.payableBy')}</Label>
              <Val>
                {payer.map((l, i) => (
                  <span key={i} className="block">
                    {l}
                  </span>
                ))}
              </Val>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-warn-bg px-4 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-warn">{t('common.qrbill.sample')}</div>
    </div>
  )
}

/** Full A4-style invoice preview with the QR-bill slip at the bottom. */
export function InvoicePreview({ invoice, customer }: { invoice: Invoice; customer?: Customer }) {
  const { t } = useT()
  const lineLabel = useLineLabel()
  return (
    <div className="overflow-hidden rounded-xl border border-sand-200 bg-paper shadow-card">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <Logo className="h-5" />
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Office & More
              <br />
              Rue du Château 7, 2000 Neuchâtel
              <br />
              {t('common.email')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold tracking-tight">{t('common.invoice.title')}</div>
            <div className="mt-1 text-sm text-muted">{invoice.number}</div>
            <div className="mt-2">
              {invoice.status === 'paid' ? (
                <Badge tone="ok">{t('common.invoiceStatus.paid')}</Badge>
              ) : invoice.status === 'overdue' ? (
                <Badge tone="bad">{t('common.invoiceStatus.overdue')}</Badge>
              ) : (
                <Badge tone="warn">{t('common.invoiceStatus.pending')}</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
          <div>
            <div className="eyebrow mb-1.5">{t('common.invoice.client')}</div>
            {customer && (
              <p className="leading-relaxed">
                <span className="font-semibold">{customer.company}</span>
                <br />
                {customer.firstName} {customer.lastName}
                <br />
                {(customer.billingAddress ?? customer.address).street}
                <br />
                {(customer.billingAddress ?? customer.address).zip} {(customer.billingAddress ?? customer.address).city}
              </p>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-y-1.5 sm:text-right">
            <dt className="text-muted sm:text-left">{t('common.invoice.date')}</dt>
            <dd className="font-medium">{formatDate(invoice.date)}</dd>
            <dt className="text-muted sm:text-left">{t('common.invoice.due')}</dt>
            <dd className="font-medium">{formatDate(invoice.dueDate)}</dd>
            {invoice.reminder > 0 && (
              <>
                <dt className="text-muted sm:text-left">{t('common.invoice.reminderSent')}</dt>
                <dd className="font-semibold text-bad">{t('common.invoice.reminderLevel', { n: invoice.reminder })}</dd>
              </>
            )}
          </dl>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-ink text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="pb-2">{t('common.invoice.description')}</th>
              <th className="pb-2 text-right">{t('common.invoice.qty')}</th>
              <th className="hidden pb-2 text-right sm:table-cell">{t('common.invoice.unitPrice')}</th>
              <th className="pb-2 text-right">{t('common.amount')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {invoice.lines.map((l, i) => (
              <tr key={i}>
                <td className="py-3 pr-3">{lineLabel(l)}</td>
                <td className="py-3 text-right tabular-nums">{l.qty}</td>
                <td className="hidden py-3 text-right tabular-nums sm:table-cell">{chf(l.unit, { cents: true })}</td>
                <td className="py-3 text-right font-medium tabular-nums">{chf(l.qty * l.unit, { cents: true })}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-ink">
              <td colSpan={2} className="pt-3 font-bold sm:hidden">
                {t('common.total')}
              </td>
              <td colSpan={3} className="hidden pt-3 font-bold sm:table-cell">
                {t('common.total')}
              </td>
              <td className="pt-3 text-right text-lg font-extrabold tabular-nums">{chf(invoice.amount, { cents: true })}</td>
            </tr>
          </tfoot>
        </table>
        <p className="mt-6 text-xs text-muted">{t('common.invoice.vatNote')}</p>
        <p className="mt-1 text-xs text-muted">{t('common.invoice.bank')}</p>
      </div>
      <QRBill invoice={invoice} customer={customer} />
    </div>
  )
}
