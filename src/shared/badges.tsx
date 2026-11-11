import { useT } from '@/i18n'
import { Badge, type Tone } from '@/core/ui'
import type { BookingPayment, Invoice, MailStatus, SubscriptionStatus } from '@/store/types'

const mailTone: Record<MailStatus, Tone> = {
  received: 'info',
  scanned: 'ok',
  forwarded: 'neutral',
  collect: 'warn',
  scan_requested: 'warn',
  forward_requested: 'warn',
}
export function MailStatusBadge({ status }: { status: MailStatus }) {
  const { td } = useT()
  return <Badge tone={mailTone[status]}>{td(`common.mailStatus.${status}`)}</Badge>
}

export function InvoiceStatusBadge({ invoice, showReminder }: { invoice: Invoice; showReminder?: boolean }) {
  const { t, td } = useT()
  const tone: Tone = invoice.status === 'paid' ? 'ok' : invoice.status === 'overdue' ? 'bad' : 'warn'
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <Badge tone={tone} dot>
        {td(`common.invoiceStatus.${invoice.status}`)}
      </Badge>
      {showReminder && invoice.reminder > 0 && invoice.status !== 'paid' && <Badge tone="bad">{t('common.invoice.reminderSent')}</Badge>}
    </span>
  )
}

const subTone: Record<SubscriptionStatus, Tone> = { active: 'ok', late: 'bad', cancelled: 'neutral', pending: 'warn' }
export function SubStatusBadge({ status }: { status: SubscriptionStatus }) {
  const { td } = useT()
  return (
    <Badge tone={subTone[status]} dot>
      {td(`common.subscriptionStatus.${status}`)}
    </Badge>
  )
}

const bookTone: Record<BookingPayment, Tone> = { paid: 'ok', pending: 'warn', blocked: 'neutral' }
export function BookingPaymentBadge({ payment }: { payment: BookingPayment }) {
  const { td } = useT()
  return <Badge tone={bookTone[payment]}>{td(`common.bookingPayment.${payment}`)}</Badge>
}
