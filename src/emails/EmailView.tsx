import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '@/i18n'
import { Logo } from '@/theme/Logo'
import { useStore } from '@/store'
import type { Email } from '@/store/types'
import { chf, formatDate, formatDateTime } from '@/lib/format'
import { downloadIcs } from '@/lib/ics'

/** Subject line for any email, in the current language. */
export function useEmailSubject() {
  const { td } = useT()
  return (e: Pick<Email, 'template' | 'data'>) => {
    const d = e.data
    switch (e.template) {
      case 'booking_confirmation':
        return td('emails.booking_confirmation.subject', { ref: d.ref })
      case 'mail_notification':
        return td('emails.mail_notification.subject', { sender: d.sender })
      case 'office_application':
        return td('emails.office_application.subject', { office: d.office })
      case 'payment_reminder':
        return td('emails.payment_reminder.subject', { level: d.level, number: d.number })
      case 'subscription_active':
        return td('emails.subscription_active.subject', { product: td(`common.products.${d.product}`) })
      case 'service_request':
        return td('emails.service_request.subject')
      case 'quote_reply':
        return td('emails.quote_reply.subject', { service: td(`common.services.${d.service}`) })
      case 'renewal_notice':
        return td('emails.renewal_notice.subject', { date: formatDate(d.date) })
      case 'contract_expiry':
        return td('emails.contract_expiry.subject', { office: d.office })
      default:
        return td(`emails.${e.template}.subject`)
    }
  }
}

function Detail({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <table className="my-6 w-full rounded-xl bg-[#F5F3EF] text-[14px]">
      <tbody>
        {rows.map(([k, v], i) => (
          <tr key={i} className={i ? 'border-t border-[#E7E3DC]' : ''}>
            <td className="px-4 py-2.5 text-[#6B6660]">{k}</td>
            <td className="px-4 py-2.5 text-right font-semibold">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** A transactional email rendered as it would arrive in the customer's mailbox. */
export function EmailView({ email, preview, onAction }: { email: Pick<Email, 'template' | 'data' | 'toName' | 'to' | 'sentAt'>; preview?: boolean; onAction?: () => void }) {
  const { t, td } = useT()
  const subject = useEmailSubject()(email)
  const navigate = useNavigate()
  const loginCustomer = useStore((s) => s.loginCustomer)
  const d = email.data
  const first = email.toName.split(' ')[0]

  const go = (customerId: string | null | undefined, path: string) => {
    if (preview) return
    if (customerId) loginCustomer(customerId)
    onAction?.()
    navigate(path)
  }

  let heading: ReactNode = null
  let body: ReactNode = null
  let cta: { label: string; onClick: () => void } | null = null

  switch (email.template) {
    case 'booking_confirmation':
      heading = t('emails.booking_confirmation.heading')
      body = (
        <>
          <p>{t('emails.booking_confirmation.body')}</p>
          <Detail
            rows={[
              [t('emails.booking_confirmation.ref'), d.ref],
              [t('common.date'), formatDate(d.date)],
              [t('common.time'), `${d.start} – ${d.end}`],
              [t('emails.booking_confirmation.formula'), td(`common.bookingKinds.${d.kind}`)],
              [t('emails.booking_confirmation.paid'), chf(d.amount, { cents: true })],
              [t('emails.booking_confirmation.method'), td(`common.methods.${d.method}`)],
            ]}
          />
          <p className="text-[#6B6660]">{t('emails.booking_confirmation.access')}</p>
        </>
      )
      cta = {
        label: t('emails.booking_confirmation.cta'),
        onClick: () => !preview && downloadIcs({ date: d.date, start: d.start, end: d.end, ref: d.ref, title: 'Office & More – Salle de conférence', location: 'Rue du Château 7, 2000 Neuchâtel' }),
      }
      break
    case 'welcome':
      heading = t('emails.welcome.heading', { name: first })
      body = (
        <>
          <p>{t('emails.welcome.body')}</p>
          <Detail
            rows={[
              [t('emails.welcome.package'), td(`common.products.${d.pkg}`)],
              [t('emails.welcome.price'), `${chf(d.price)} ${t('common.perMonth')}`],
              [t('emails.welcome.address'), 'Rue du Château 7, 2000 Neuchâtel'],
            ]}
          />
          <p>{t('emails.welcome.next')}</p>
        </>
      )
      cta = { label: t('emails.welcome.cta'), onClick: () => go(d.customerId, '/espace') }
      break
    case 'mail_notification':
      heading = t('emails.mail_notification.heading')
      body = (
        <>
          <p>{t('emails.mail_notification.body', { sender: d.sender, date: formatDate(new Date(email.sentAt)) })}</p>
          <Detail
            rows={[
              [t('emails.mail_notification.sender'), d.sender],
              [t('emails.mail_notification.type'), td(`common.mailTypes.${d.type}`)],
            ]}
          />
          <p>{d.scanned ? t('emails.mail_notification.scanned') : t('emails.mail_notification.notScanned')}</p>
        </>
      )
      cta = { label: t('emails.mail_notification.cta'), onClick: () => go(d.customerId, `/espace/courrier?item=${d.mailId}`) }
      break
    case 'login_link':
      heading = t('emails.login_link.heading')
      body = <p>{d.customerId || preview ? t('emails.login_link.body') : t('emails.login_link.unknown')}</p>
      if (d.customerId || preview) cta = { label: t('emails.login_link.cta'), onClick: () => go(d.customerId, '/espace') }
      break
    case 'office_application':
      heading = t('emails.office_application.heading')
      body = (
        <>
          <p>{t('emails.office_application.body', { office: d.office })}</p>
          <Detail
            rows={[
              [t('emails.office_application.start'), formatDate(d.startDate)],
              [t('emails.office_application.duration'), `${d.duration} ${t('common.months')}`],
            ]}
          />
        </>
      )
      break
    case 'payment_reminder':
      heading = t('emails.payment_reminder.heading')
      body = (
        <>
          <p>{t('emails.payment_reminder.body', { number: d.number, amount: chf(d.amount, { cents: true }), due: formatDate(d.dueDate) })}</p>
          <p className="mt-4 text-[#6B6660]">{t('emails.payment_reminder.ignore')}</p>
        </>
      )
      cta = { label: t('emails.payment_reminder.cta'), onClick: () => go(d.customerId, `/espace/factures?item=${d.invoiceId}`) }
      break
    case 'subscription_active':
      heading = t('emails.subscription_active.heading')
      body = <p>{d.product === 'office' ? t('emails.subscription_active.bodyOffice') : t('emails.subscription_active.body', { product: td(`common.products.${d.product}`) })}</p>
      cta = { label: t('emails.subscription_active.cta'), onClick: () => go(d.customerId, '/espace') }
      break
    case 'service_request':
      heading = t('emails.service_request.heading')
      body = <p>{d.kind === 'order' ? t('emails.service_request.bodyOrder', { service: td(`common.services.${d.service}`) }) : t('emails.service_request.bodyQuote', { service: td(`common.services.${d.service}`) })}</p>
      break
    case 'quote_reply':
      heading = t('emails.quote_reply.heading')
      body = <p>{t('emails.quote_reply.body', { service: td(`common.services.${d.service}`), amount: chf(d.amount) })}</p>
      break
    case 'forward_sent':
      heading = t('emails.forward_sent.heading')
      body = (
        <>
          <p>{t('emails.forward_sent.body', { sender: d.sender })}</p>
          <p className="mt-4 rounded-xl bg-[#F5F3EF] px-4 py-3 font-medium">
            {d.address?.name}
            <br />
            {d.address?.street}
            <br />
            {d.address?.zip} {d.address?.city}
          </p>
        </>
      )
      break
    case 'contact_received':
      heading = t('emails.contact_received.heading')
      body = <p>{t('emails.contact_received.body', { subject: d.subject })}</p>
      break
    case 'plan_change':
      heading = t('emails.plan_change.heading')
      body = <p>{t('emails.plan_change.body', { from: td(`common.packages.${d.from}`), to: td(`common.packages.${d.to}`), price: chf(d.price), date: formatDate(d.nextRenewal) })}</p>
      break
    case 'renewal_notice':
      heading = t('emails.renewal_notice.heading')
      body = <p>{t('emails.renewal_notice.body', { product: td(`common.products.${d.product}`), date: formatDate(d.date), price: chf(d.price) })}</p>
      break
    case 'contract_expiry':
      heading = t('emails.contract_expiry.heading')
      body = <p>{t('emails.contract_expiry.body', { company: d.company, office: d.office, date: formatDate(d.date) })}</p>
      break
  }

  return (
    <div className="bg-[#F5F3EF] p-3 sm:p-6">
      <div className="mb-3 space-y-0.5 px-1 text-xs text-[#6B6660]">
        <div className="text-[15px] font-bold text-ink">{subject}</div>
        <div>{t('emails.from')}</div>
        <div>
          {t('emails.to')}: {email.toName} &lt;{email.to}&gt; · {formatDateTime(email.sentAt)}
        </div>
      </div>
      <div className="mx-auto max-w-[560px] overflow-hidden rounded-2xl bg-white text-[15px] leading-relaxed text-[#111] shadow-card">
        <div className="px-7 pb-2 pt-7">
          <Logo className="h-[18px]" />
        </div>
        <div className="px-7 pb-7 pt-5">
          <h2 className="mb-4 text-[26px] font-extrabold leading-tight tracking-tight">{heading}</h2>
          <p className="mb-3">{t('emails.greeting', { name: email.toName })}</p>
          <div>{body}</div>
          {cta && (
            <button onClick={cta.onClick} className="mt-6 inline-flex h-12 items-center rounded-full bg-[#111] px-7 text-[15px] font-semibold text-white transition hover:bg-[#2d2b28]">
              {cta.label}
            </button>
          )}
          <p className="mt-7">
            {t('emails.signoff')}
            <br />
            <span className="font-semibold">{t('emails.team')}</span>
          </p>
        </div>
        <div className="border-t border-[#E7E3DC] bg-[#FAF9F7] px-7 py-4 text-[11.5px] leading-relaxed text-[#6B6660]">
          {t('emails.footer')}
          <br />
          {t('emails.auto')}
        </div>
      </div>
    </div>
  )
}
