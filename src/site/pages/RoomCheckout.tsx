import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { CalendarDays, Clock } from 'lucide-react'
import { useT } from '@/i18n'
import { roomPrice, useStore } from '@/store'
import { customerById, fullName } from '@/store/selectors'
import { Card, Input } from '@/core/ui'
import { PaymentPanel } from '@/core/flows'
import { chf, formatDate, parseISODate } from '@/lib/format'
import { persona } from '@/data/loadSeed'
import { FlowShell } from '../components/FlowShell'
import { isEmail } from '../components/ApplicantForm'
import { useBookingDraft } from '../bookingDraft'

export function RoomCheckout() {
  const { t, td, tl } = useT()
  const nav = useNavigate()
  const selection = useBookingDraft((s) => s.selection)
  const clearDraft = useBookingDraft((s) => s.set)
  const prices = useStore((s) => s.prices)
  const bookRoom = useStore((s) => s.bookRoom)
  const customer = useStore((s) => customerById(s, s.customerId))
  const [form, setForm] = useState({ name: customer ? fullName(customer) : '', email: customer?.email ?? '', company: customer?.company ?? '' })

  if (!selection) return <Navigate to="/salle-de-conference" replace />
  const amount = roomPrice(prices, selection.kind, selection.start, selection.end)
  const valid = form.name.trim().length > 1 && isEmail(form.email)
  const d = parseISODate(selection.date)
  const weekday = tl('common.weekdayLong')[(d.getDay() + 6) % 7]

  const aside = (
    <Card className="overflow-hidden">
      <img src="/img/conference.jpg" alt="" className="aspect-[16/9] w-full object-cover" />
      <div className="p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t('site.room.checkout.summary')}</div>
        <div className="mt-1 text-lg font-extrabold">{t('site.nav.room')}</div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2.5 capitalize">
            <CalendarDays className="h-4 w-4 text-muted" /> {weekday} {formatDate(selection.date)}
          </div>
          <div className="flex items-center gap-2.5 tabular-nums">
            <Clock className="h-4 w-4 text-muted" /> {selection.start} – {selection.end} · {td(`common.bookingKinds.${selection.kind}`)}
          </div>
        </div>
        <div className="mt-5 flex items-baseline justify-between border-t border-sand-200 pt-4">
          <span className="font-semibold">{t('common.total')}</span>
          <span className="text-2xl font-extrabold tabular-nums">{chf(amount)}</span>
        </div>
        <Link to="/salle-de-conference#reserver" className="mt-3 inline-block text-[13px] font-semibold text-muted underline underline-offset-4 hover:text-ink">
          {t('site.room.checkout.edit')}
        </Link>
      </div>
    </Card>
  )

  return (
    <FlowShell backTo="/salle-de-conference" backLabel={t('site.room.checkout.backToRoom')} title={t('site.room.checkout.title')} aside={aside}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('site.room.checkout.details')}</h2>
        {!customer && (
          <button
            type="button"
            onClick={() => setForm({ name: `${persona.firstName} ${persona.lastName}`, email: persona.email, company: persona.company })}
            className="rounded-full bg-sand-100 px-3.5 py-1.5 text-[13px] font-semibold hover:bg-sand-200"
          >
            {t('common.fillDemo')}
          </button>
        )}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Input label={t('common.name')} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label={t('common.email_')} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label={`${t('common.company')} (${t('common.optional')})`} wrapClass="sm:col-span-2" autoComplete="organization" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      </div>

      <h2 className="mb-5 mt-10 text-xl font-bold">{t('site.room.checkout.payTitle')}</h2>
      {valid ? (
        <PaymentPanel
          amount={amount}
          defaultMethod="twint"
          defaultName={form.name}
          onPaid={(method) => {
            const b = bookRoom({ ...selection, name: form.name.trim(), email: form.email.trim(), company: form.company.trim() || undefined, method, customerId: customer?.id })
            clearDraft(null)
            nav(`/salle-de-conference/confirmation/${b.id}`)
          }}
        />
      ) : (
        <p className="rounded-2xl bg-sand-50 px-5 py-6 text-sm text-muted">{t('site.room.checkout.missing')}</p>
      )}
    </FlowShell>
  )
}
