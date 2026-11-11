import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { monthGrid, today } from '@/lib/dates'
import { toISODate } from '@/lib/format'

export function MonthCalendar({
  value,
  onChange,
  isDisabled,
  dayState,
  monthNames,
  weekdayNames,
  prevLabel,
  nextLabel,
  minMonthOffset = 0,
}: {
  value: string | null
  onChange: (iso: string) => void
  isDisabled?: (d: Date) => boolean
  /** 'full' greys a day completely, 'partial' shows a dot. */
  dayState?: (iso: string) => 'free' | 'partial' | 'full'
  monthNames: string[]
  weekdayNames: string[]
  prevLabel: string
  nextLabel: string
  minMonthOffset?: number
}) {
  const t0 = today()
  const [cursor, setCursor] = useState(() => {
    const base = value ? new Date(value) : t0
    return { y: base.getFullYear(), m: base.getMonth() }
  })
  const minIndex = t0.getFullYear() * 12 + t0.getMonth() + minMonthOffset
  const curIndex = cursor.y * 12 + cursor.m
  const shift = (n: number) => {
    const idx = curIndex + n
    setCursor({ y: Math.floor(idx / 12), m: idx % 12 })
  }
  const weeks = monthGrid(cursor.y, cursor.m)
  const todayIso = toISODate(t0)

  return (
    <div className="select-none">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => shift(-1)} disabled={curIndex <= minIndex} aria-label={prevLabel} className="rounded-full p-2 hover:bg-sand-100 disabled:opacity-30">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-[15px] font-bold capitalize">
          {monthNames[cursor.m]} {cursor.y}
        </div>
        <button onClick={() => shift(1)} disabled={curIndex >= minIndex + 6} aria-label={nextLabel} className="rounded-full p-2 hover:bg-sand-100 disabled:opacity-30">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
        {weekdayNames.map((w) => (
          <div key={w} className="py-1.5">
            {w}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {weeks.flat().map((d, i) => {
          if (!d) return <div key={i} />
          const iso = toISODate(d)
          const disabled = isDisabled?.(d) ?? false
          const state = dayState?.(iso) ?? 'free'
          const off = disabled || state === 'full'
          const selected = value === iso
          return (
            <button
              key={i}
              disabled={off}
              onClick={() => onChange(iso)}
              className={cn(
                'relative flex aspect-square items-center justify-center rounded-xl text-sm font-semibold tabular-nums transition',
                selected ? 'bg-ink text-paper' : off ? 'cursor-not-allowed text-sand-300 line-through decoration-sand-300' : 'hover:bg-sand-100',
                iso === todayIso && !selected && 'ring-1 ring-inset ring-ink/30',
              )}
            >
              {d.getDate()}
              {state === 'partial' && !off && <span className={cn('absolute bottom-1.5 h-1 w-1 rounded-full', selected ? 'bg-paper' : 'bg-warn')} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
