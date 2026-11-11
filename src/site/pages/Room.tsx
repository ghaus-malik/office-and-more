import { useNavigate } from 'react-router-dom'
import { ArrowDown, Check, Users } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { chf } from '@/lib/format'
import { BookingWidget } from '../components/BookingWidget'
import { useBookingDraft } from '../bookingDraft'

export function Room() {
  const { t, tl } = useT()
  const prices = useStore((s) => s.prices)
  const loggedIn = useStore((s) => !!s.customerId)
  const draft = useBookingDraft()
  const nav = useNavigate()

  return (
    <>
      <img src="/img/conference.jpg" alt="" className="h-[46vh] min-h-[280px] w-full object-cover md:h-[64vh]" width={1258} height={840} />
      <section className="container-site grid gap-12 py-16 md:grid-cols-[1.3fr_1fr] md:py-20">
        <div>
          <p className="eyebrow">{t('site.room.eyebrow')}</p>
          <h1 className="display mt-4 text-[44px] md:text-[64px]">{t('site.room.title')}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/80">{t('site.room.text')}</p>
          <a href="#reserver" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-[15px] font-semibold text-paper hover:bg-ink-soft">
            {t('site.room.book')} <ArrowDown className="h-4 w-4" />
          </a>
        </div>
        <div className="md:pt-14">
          <p className="flex items-center gap-2 text-[15px] font-bold">
            <Users className="h-4 w-4" /> {t('site.room.capacity')}
          </p>
          <h2 className="mt-6 text-sm font-bold">{t('site.room.equipmentTitle')}</h2>
          <ul className="mt-3 divide-y divide-sand-200 border-y border-sand-200">
            {tl('site.room.equipment').map((e) => (
              <li key={e} className="flex items-center gap-3 py-2.5 text-[15px]">
                <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} /> {e}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-site">
        <div className="grid grid-cols-3 gap-4 border-t border-sand-200 pt-10">
          {[
            { p: prices.room_hour, l: t('site.room.perHour') },
            { p: prices.room_half, l: t('site.room.perHalf') },
            { p: prices.room_day, l: t('site.room.perDay') },
          ].map((x) => (
            <div key={x.l}>
              <div className="whitespace-nowrap text-[22px] font-extrabold tracking-tight sm:text-[44px]">{chf(x.p)}</div>
              <div className="mt-1 text-sm">{x.l}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">{t('site.room.note')}</p>
      </section>

      <section id="reserver" className="container-site scroll-mt-24 pt-20">
        <div className="rounded-3xl border border-sand-200 p-5 sm:p-8 md:p-10">
          <h2 className="display text-[32px] md:text-[44px]">{t('site.room.booking.title')}</h2>
          {loggedIn && <p className="mt-2 text-sm text-muted">{t('site.room.booking.prefilled')}</p>}
          <div className="mt-8">
            <BookingWidget
              initial={draft.selection}
              onContinue={(s) => {
                draft.set(s)
                nav('/salle-de-conference/reservation')
              }}
            />
          </div>
        </div>
      </section>
    </>
  )
}
