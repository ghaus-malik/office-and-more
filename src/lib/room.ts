import type { Booking, BookingKind } from '@/store/types'
import { hm, minutesToHM } from './format'

export const OPEN = 8
export const CLOSE = 18
export const HALF = {
  half_am: { start: '08:00', end: '12:00' },
  half_pm: { start: '13:00', end: '17:00' },
} as const
export const DAY = { start: '08:00', end: '18:00' }

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return hm(aStart) < hm(bEnd) && hm(bStart) < hm(aEnd)
}

export function isFree(bookings: Booking[], date: string, start: string, end: string): boolean {
  return !bookings.some((b) => b.date === date && overlaps(start, end, b.start, b.end))
}

/** Free hours (as minutes since midnight) between OPEN and CLOSE. */
export function freeHourStarts(bookings: Booking[], date: string): string[] {
  const out: string[] = []
  for (let h = OPEN; h < CLOSE; h++) {
    const s = minutesToHM(h * 60)
    const e = minutesToHM((h + 1) * 60)
    if (isFree(bookings, date, s, e)) out.push(s)
  }
  return out
}

/** Longest consecutive free run starting at `start`, capped at `max` hours. */
export function maxDurationFrom(bookings: Booking[], date: string, start: string, max = 6): number {
  let n = 0
  let cur = hm(start)
  while (n < max && cur + 60 <= CLOSE * 60 && isFree(bookings, date, minutesToHM(cur), minutesToHM(cur + 60))) {
    n++
    cur += 60
  }
  return n
}

export function dayState(bookings: Booking[], date: string): 'free' | 'partial' | 'full' {
  const free = freeHourStarts(bookings, date).length
  if (free === 0) return 'full'
  if (free < CLOSE - OPEN) return 'partial'
  return 'free'
}

export function kindRange(kind: BookingKind, start?: string, hours = 1): { start: string; end: string } | null {
  if (kind === 'half_am' || kind === 'half_pm') return HALF[kind]
  if (kind === 'day') return DAY
  if (kind === 'hour' && start) return { start, end: minutesToHM(hm(start) + hours * 60) }
  return null
}
