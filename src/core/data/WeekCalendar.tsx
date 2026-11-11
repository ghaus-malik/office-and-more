import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { addDays } from '@/lib/dates'
import { hm, toISODate } from '@/lib/format'

export interface CalendarEvent {
  id: string
  date: string
  start: string
  end: string
  title: ReactNode
  subtitle?: ReactNode
  tone: 'ok' | 'warn' | 'bad' | 'neutral' | 'blocked' | 'new'
}

const tones: Record<CalendarEvent['tone'], string> = {
  ok: 'bg-ok-bg border-ok/40 text-ink [&_.bar]:bg-ok',
  warn: 'bg-warn-bg border-warn/40 text-ink [&_.bar]:bg-warn',
  bad: 'bg-bad-bg border-bad/40 text-ink [&_.bar]:bg-bad',
  neutral: 'bg-sand-100 border-sand-300 text-ink [&_.bar]:bg-muted',
  blocked:
    'border-sand-300 text-muted [&_.bar]:bg-sand-300 bg-[repeating-linear-gradient(135deg,rgb(var(--sand-100))_0_6px,rgb(var(--sand-50))_6px_12px)]',
  new: 'bg-ok-bg border-ok text-ink ring-4 ring-ok/20 [&_.bar]:bg-ok',
}

export function WeekCalendar({
  weekStart,
  days = 5,
  from = 7,
  to = 19,
  events,
  dayLabel,
  onEventClick,
  onSlotClick,
  todayIso,
  hourHeight = 48,
}: {
  weekStart: Date
  days?: number
  from?: number
  to?: number
  events: CalendarEvent[]
  dayLabel: (d: Date) => ReactNode
  onEventClick?: (id: string) => void
  onSlotClick?: (date: string, time: string) => void
  todayIso?: string
  hourHeight?: number
}) {
  const dates = Array.from({ length: days }, (_, i) => addDays(weekStart, i))
  const hours = Array.from({ length: to - from }, (_, i) => from + i)
  const top = (t: string) => ((hm(t) - from * 60) / 60) * hourHeight

  return (
    <div className="scroll-thin overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="grid border-b border-sand-200" style={{ gridTemplateColumns: `56px repeat(${days}, 1fr)` }}>
          <div />
          {dates.map((d) => {
            const iso = toISODate(d)
            return (
              <div key={iso} className={cn('px-2 py-3 text-center text-sm', iso === todayIso ? 'font-bold' : 'text-muted')}>
                {dayLabel(d)}
              </div>
            )
          })}
        </div>
        <div className="relative grid" style={{ gridTemplateColumns: `56px repeat(${days}, 1fr)` }}>
          <div>
            {hours.map((h) => (
              <div key={h} className="relative pr-2 text-right text-[11px] tabular-nums text-muted" style={{ height: hourHeight }}>
                <span className="relative -top-2">{String(h).padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>
          {dates.map((d) => {
            const iso = toISODate(d)
            const evs = events.filter((e) => e.date === iso)
            return (
              <div key={iso} className={cn('relative border-l border-sand-200', iso === todayIso && 'bg-sand-50/70')}>
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    aria-label={`${iso} ${h}:00`}
                    onClick={onSlotClick ? () => onSlotClick(iso, `${String(h).padStart(2, '0')}:00`) : undefined}
                    className={cn('block w-full border-b border-sand-200/70', onSlotClick ? 'hover:bg-sand-100/60' : 'cursor-default')}
                    style={{ height: hourHeight }}
                  />
                ))}
                {evs.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => onEventClick?.(e.id)}
                    className={cn('absolute inset-x-1 overflow-hidden rounded-lg border px-2 py-1 text-left text-xs transition hover:shadow-pop', tones[e.tone])}
                    style={{ top: top(e.start) + 1, height: Math.max(22, top(e.end) - top(e.start) - 2) }}
                  >
                    <span className="bar absolute inset-y-0 left-0 w-1" />
                    <div className="pl-1.5">
                      <div className="truncate font-semibold">{e.title}</div>
                      {e.subtitle && <div className="truncate text-[11px] opacity-75">{e.subtitle}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
