import { useParams } from 'react-router-dom'
import { CalendarPlus, UserRound } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Button, ButtonLink, DescList, SuccessTick } from '@/core/ui'
import { chf, formatDate } from '@/lib/format'
import { downloadIcs } from '@/lib/ics'
import { NotFound } from '@/NotFound'

export function RoomConfirmation() {
  const { id } = useParams()
  const { t, td } = useT()
  const booking = useStore((s) => s.bookings.find((b) => b.id === id))
  const loggedIn = useStore((s) => !!s.customerId)
  if (!booking) return <NotFound />

  return (
    <div className="container-site max-w-2xl py-16 md:py-24">
      <SuccessTick className="h-16 w-16" />
      <h1 className="display mt-6 text-[40px] md:text-[56px]">{t('site.room.confirm.title')}</h1>
      <p className="mt-3 text-lg text-ink/75">{t('site.room.confirm.text', { email: booking.email })}</p>

      <div className="mt-10 rounded-2xl border border-sand-200 p-6">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted">{t('site.room.confirm.ref')}</span>
          <span className="font-mono text-xl font-bold tracking-wider">{booking.ref}</span>
        </div>
        <DescList
          className="mt-4 border-t border-sand-200"
          items={[
            { label: t('common.date'), value: formatDate(booking.date) },
            { label: t('common.time'), value: `${booking.start} – ${booking.end}` },
            { label: t('site.room.confirm.formula'), value: td(`common.bookingKinds.${booking.kind}`) },
            { label: t('site.room.confirm.amount'), value: chf(booking.amount, { cents: true }) },
            { label: t('site.room.confirm.method'), value: td(`common.methods.${booking.method ?? 'card'}`) },
          ]}
        />
        <Button
          variant="secondary"
          className="mt-6"
          icon={<CalendarPlus className="h-4 w-4" />}
          onClick={() => downloadIcs({ date: booking.date, start: booking.start, end: booking.end, ref: booking.ref, title: 'Office & More – Salle de conférence', location: 'Rue du Château 7, 2000 Neuchâtel' })}
        >
          {t('site.room.confirm.addCalendar')}
        </Button>
      </div>

      {loggedIn ? (
        <ButtonLink to="/espace/reservations" className="mt-8" icon={<UserRound className="h-4 w-4" />}>
          {t('site.room.confirm.mySpace')}
        </ButtonLink>
      ) : (
        <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-sand-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-bold">{t('site.room.confirm.accountTitle')}</div>
            <p className="mt-1 text-sm text-muted">{t('site.room.confirm.accountText')}</p>
          </div>
          <ButtonLink to="/espace/connexion" className="shrink-0">
            {t('site.room.confirm.accountCta')}
          </ButtonLink>
        </div>
      )}
      <ButtonLink to="/salle-de-conference" variant="link" className="mt-8">
        {t('site.room.confirm.back')}
      </ButtonLink>
    </div>
  )
}
