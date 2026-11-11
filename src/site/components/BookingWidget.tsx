import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Minus, Plus } from 'lucide-react'
import { useT } from '@/i18n'
import { roomPrice, useStore } from '@/store'
import { MonthCalendar } from '@/core/data'
import { Button } from '@/core/ui'
import { cn } from '@/lib/cn'
import { isWeekend, today } from '@/lib/dates'
import { chf, formatDate, hm, minutesToHM, parseISODate } from '@/lib/format'
import { CLOSE, DAY, HALF, OPEN, dayState, isFree, maxDurationFrom } from '@/lib/room'
import type { BookingSelection } from '../bookingDraft'

type Formula = 'hour' | 'half' | 'day'

/** Month calendar + formula picker with live total. Calls onContinue with the chosen slot. */
export function BookingWidget({ onContinue, initial, continueLabel, compact }: { onContinue: (s: BookingSelection, amount: number) => void; initial?: BookingSelection | null; continueLabel?: string; compact?: boolean }) {
  const { t, tl } = useT()
  const bookings = useStore((s) => s.bookings)
  const prices = useStore((s) => s.prices)

  const [date, setDate] = useState<string | null>(initial?.date ?? null)
  const [formula, setFormula] = useState<Formula>(initial ? (initial.kind === 'hour' ? 'hour' : initial.kind === 'day' ? 'day' : 'half') : 'hour')
  const [hourStart, setHourStart] = useState<string | null>(initial?.kind === 'hour' ? initial.start : null)
  const [hours, setHours] = useState(initial?.kind === 'hour' ? (hm(initial.end) - hm(initial.start)) / 60 : 1)
  const [half, setHalf] = useState<'half_am' | 'half_pm' | null>(initial?.kind === 'half_am' || initial?.kind === 'half_pm' ? initial.kind : null)

  // Reset the slot when the date or formula changes and the old slot no longer fits.
  useEffect(() => {
    if (!date) return
    if (hourStart && !isFree(bookings, date, hourStart, minutesToHM(hm(hourStart) + 60))) setHourStart(null)
    if (half && !isFree(bookings, date, HALF[half].start, HALF[half].end)) setHalf(null)
  }, [date, bookings, hourStart, half])

  const maxHours = date && hourStart ? maxDurationFrom(bookings, date, hourStart) : 1
  useEffect(() => {
    if (hours > maxHours) setHours(Math.max(1, maxHours))
  }, [maxHours, hours])

  const selection: BookingSelection | null = useMemo(() => {
    if (!date) return null
    if (formula === 'day') return isFree(bookings, date, DAY.start, DAY.end) ? { date, kind: 'day', ...DAY } : null
    if (formula === 'half') return half ? { date, kind: half, ...HALF[half] } : null
    if (hourStart) return { date, kind: 'hour', start: hourStart, end: minutesToHM(hm(hourStart) + hours * 60) }
    return null
  }, [date, formula, half, hourStart, hours, bookings])

  const amount = selection ? roomPrice(prices, selection.kind, selection.start, selection.end) : 0
  const t0 = today()
  const dayFree = date ? isFree(bookings, date, DAY.start, DAY.end) : false

  const formulas: { id: Formula; label: string; price: number; unit: string }[] = [
    { id: 'hour', label: t('site.room.booking.hour'), price: prices.room_hour, unit: t('site.room.perHour') },
    { id: 'half', label: t('site.room.booking.half'), price: prices.room_half, unit: t('site.room.perHalf') },
    { id: 'day', label: t('site.room.booking.day'), price: prices.room_day, unit: t('site.room.perDay') },
  ]

  const weekdayLong = tl('common.weekdayLong')
  const dateLabel = (iso: string) => {
    const d = parseISODate(iso)
    return `${weekdayLong[(d.getDay() + 6) % 7]} ${formatDate(iso)}`
  }

  return (
    <div className={cn('grid gap-8 [&>*]:min-w-0', !compact && 'lg:grid-cols-[1fr_1fr] lg:gap-12')}>
      <div>
        <h3 className="mb-4 text-[15px] font-bold">{t('site.room.booking.stepDate')}</h3>
        <MonthCalendar
          value={date}
          onChange={setDate}
          monthNames={tl('common.monthNames')}
          weekdayNames={tl('common.weekdayShort')}
          prevLabel={t('common.prevMonth')}
          nextLabel={t('common.nextMonth')}
          isDisabled={(d) => d < t0 || isWeekend(d)}
          dayState={(iso) => dayState(bookings, iso)}
        />
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-sand-300" /> {t('site.room.booking.legendFree')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-warn" /> {t('site.room.booking.legendPartial')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-sand-300 line-through">12</span> {t('site.room.booking.legendFull')}
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <h3 className="mb-4 text-[15px] font-bold">{t('site.room.booking.stepFormula')}</h3>
        <div className="grid grid-cols-3 gap-2" role="radiogroup">
          {formulas.map((f) => (
            <button
              key={f.id}
              role="radio"
              aria-checked={formula === f.id}
              onClick={() => setFormula(f.id)}
              className={cn(
                'flex flex-col items-start rounded-xl border px-3 py-3 text-left transition',
                formula === f.id ? 'border-ink bg-ink text-paper' : 'border-sand-300 hover:border-ink',
              )}
            >
              <span className="text-[13px] font-bold sm:text-sm">{f.label}</span>
              <span className={cn('mt-0.5 text-xs', formula === f.id ? 'text-white/70' : 'text-muted')}>
                {chf(f.price)} <span className="hidden sm:inline">{f.unit}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 min-h-[150px] rounded-2xl bg-sand-50 p-4">
          {!date ? (
            <p className="py-10 text-center text-sm text-muted">{t('site.room.booking.selectDate')}</p>
          ) : (
            <>
              <p className="mb-3 text-sm font-semibold capitalize">{dateLabel(date)}</p>
              {formula === 'hour' && (
                <>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: CLOSE - OPEN }, (_, i) => minutesToHM((OPEN + i) * 60)).map((s) => {
                      const free = isFree(bookings, date, s, minutesToHM(hm(s) + 60))
                      const inSel = hourStart && hm(s) >= hm(hourStart) && hm(s) < hm(hourStart) + hours * 60
                      return (
                        <button
                          key={s}
                          disabled={!free}
                          onClick={() => setHourStart(s)}
                          title={free ? s : t('site.room.booking.taken')}
                          className={cn(
                            'h-10 rounded-lg text-[13px] font-semibold tabular-nums transition',
                            !free ? 'cursor-not-allowed bg-sand-200/60 text-muted/60 line-through' : inSel ? 'bg-ink text-paper' : 'bg-paper ring-1 ring-inset ring-sand-300 hover:ring-ink',
                          )}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                  {hourStart && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-muted">{t('site.room.booking.duration')}</span>
                      <div className="flex items-center gap-1 rounded-full bg-paper p-1 ring-1 ring-sand-300">
                        <button aria-label="-" disabled={hours <= 1} onClick={() => setHours(hours - 1)} className="rounded-full p-1.5 hover:bg-sand-100 disabled:opacity-30">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center text-sm font-bold tabular-nums">{t('site.room.booking.hoursN', { n: hours })}</span>
                        <button aria-label="+" disabled={hours >= maxHours} onClick={() => setHours(hours + 1)} className="rounded-full p-1.5 hover:bg-sand-100 disabled:opacity-30">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
              {formula === 'half' && (
                <div className="grid grid-cols-2 gap-2">
                  {(['half_am', 'half_pm'] as const).map((k) => {
                    const free = isFree(bookings, date, HALF[k].start, HALF[k].end)
                    return (
                      <button
                        key={k}
                        disabled={!free}
                        onClick={() => setHalf(k)}
                        className={cn(
                          'rounded-xl px-4 py-4 text-left transition',
                          !free ? 'cursor-not-allowed bg-sand-200/60 text-muted/70' : half === k ? 'bg-ink text-paper' : 'bg-paper ring-1 ring-inset ring-sand-300 hover:ring-ink',
                        )}
                      >
                        <div className={cn('text-sm font-bold', !free && 'line-through')}>{k === 'half_am' ? t('site.room.booking.morning') : t('site.room.booking.afternoon')}</div>
                        <div className="mt-0.5 text-xs tabular-nums opacity-75">
                          {free ? `${HALF[k].start} – ${HALF[k].end}` : t('site.room.booking.taken')}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
              {formula === 'day' && (
                <div className={cn('rounded-xl px-4 py-4', dayFree ? 'bg-ink text-paper' : 'bg-sand-200/60 text-muted')}>
                  <div className="text-sm font-bold">{t('site.room.booking.day')}</div>
                  <div className="mt-0.5 text-xs tabular-nums opacity-75">{dayFree ? `${DAY.start} – ${DAY.end}` : t('site.room.booking.noSlot')}</div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-sand-200 pt-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t('common.total')}</div>
            <div key={amount} className="mt-1 whitespace-nowrap text-[32px] font-extrabold leading-none tracking-tight tabular-nums animate-fade-in">{selection ? chf(amount) : '—'}</div>
            {selection && (
              <div className="mt-1.5 text-xs text-muted tabular-nums">
                {formatDate(selection.date)} · {selection.start} – {selection.end}
              </div>
            )}
          </div>
          <Button size="lg" className="w-full sm:w-auto" disabled={!selection} onClick={() => selection && onContinue(selection, amount)} iconRight={<ArrowRight className="h-4 w-4" />}>
            {continueLabel ?? t('site.room.booking.continue')}
          </Button>
        </div>
      </div>
    </div>
  )
}
