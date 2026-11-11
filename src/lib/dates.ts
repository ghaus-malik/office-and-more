import { parseISODate, toISODate } from './format'

export function today(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function addMonths(d: Date, n: number): Date {
  const x = new Date(d)
  const day = x.getDate()
  x.setDate(1)
  x.setMonth(x.getMonth() + n)
  const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate()
  x.setDate(Math.min(day, last))
  return x
}

/** Monday of the week containing d. */
export function startOfWeek(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const wd = (x.getDay() + 6) % 7
  x.setDate(x.getDate() - wd)
  return x
}

export function isWeekend(d: Date): boolean {
  const wd = d.getDay()
  return wd === 0 || wd === 6
}

export function sameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10)
}

export function isoDaysFromToday(n: number): string {
  return toISODate(addDays(today(), n))
}

/** ISO datetime n days from now at hh:mm */
export function isoAt(dayOffset: number, time = '09:00'): string {
  const d = addDays(today(), dayOffset)
  const [h, m] = time.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / 864e5)
}

/** Weeks of a month grid starting Monday; null for padding cells. */
export function monthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1)
  const lead = (first.getDay() + 6) % 7
  const days = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = Array(lead).fill(null)
  for (let i = 1; i <= days; i++) cells.push(new Date(year, month, i))
  while (cells.length % 7) cells.push(null)
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export { toISODate, parseISODate }
