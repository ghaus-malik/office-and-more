import type { Customer, DataState, DomiPackage, Invoice, Subscription } from './types'
import { DOMI_PACKAGES } from './index'
import { addDays, startOfWeek, today } from '@/lib/dates'
import { hm, toISODate } from '@/lib/format'

export const isLive = (s: Subscription) => s.status === 'active' || s.status === 'late'

/** Monthly recurring revenue: every active or late subscription. Never stored, always computed. */
export function mrr(state: Pick<DataState, 'subscriptions'>): number {
  return state.subscriptions.filter(isLive).reduce((sum, s) => sum + s.price, 0)
}

export type MrrGroup = 'offices' | 'domiciliation' | 'services'

export function productGroup(product: Subscription['product']): MrrGroup {
  if (product === 'office') return 'offices'
  if (DOMI_PACKAGES.includes(product as DomiPackage)) return 'domiciliation'
  return 'services'
}

export function mrrByProduct(state: Pick<DataState, 'subscriptions'>): { product: Subscription['product']; count: number; total: number }[] {
  const map = new Map<Subscription['product'], { count: number; total: number }>()
  for (const s of state.subscriptions.filter(isLive)) {
    const cur = map.get(s.product) ?? { count: 0, total: 0 }
    map.set(s.product, { count: cur.count + 1, total: cur.total + s.price })
  }
  return [...map.entries()].map(([product, v]) => ({ product, ...v })).sort((a, b) => b.total - a.total)
}

export function officesLet(state: Pick<DataState, 'offices'>): number {
  return state.offices.filter((o) => o.status === 'let').length
}

export function officesAvailable(state: Pick<DataState, 'offices'>): number {
  return state.offices.filter((o) => o.status === 'available').length
}

export const ROOM_OPEN = '08:00'
export const ROOM_CLOSE = '18:00'

/** Share of bookable hours (Mon–Fri, 08:00–18:00) booked this week. */
export function roomOccupancyThisWeek(state: Pick<DataState, 'bookings'>, base: Date = today()): number {
  const mon = startOfWeek(base)
  const days = Array.from({ length: 5 }, (_, i) => toISODate(addDays(mon, i)))
  const open = hm(ROOM_OPEN)
  const close = hm(ROOM_CLOSE)
  const booked = state.bookings
    .filter((b) => b.kind !== 'block' && days.includes(b.date))
    .reduce((sum, b) => sum + Math.max(0, Math.min(close, hm(b.end)) - Math.max(open, hm(b.start))), 0)
  const capacity = (close - open) * 5
  return Math.round((booked / capacity) * 100)
}

export function unpaidInvoices(state: Pick<DataState, 'invoices'>): { count: number; total: number; overdue: number } {
  const open = state.invoices.filter((i) => i.status !== 'paid')
  return {
    count: open.length,
    total: open.reduce((s, i) => s + i.amount, 0),
    overdue: open.filter((i) => i.status === 'overdue').length,
  }
}

export function newRequests(state: Pick<DataState, 'applications' | 'serviceRequests' | 'forwards'>): number {
  return (
    state.applications.filter((a) => a.stage === 'new').length +
    state.serviceRequests.filter((r) => r.status === 'new').length +
    state.forwards.filter((f) => f.status === 'pending').length
  )
}

export function customerById(state: Pick<DataState, 'customers'>, id?: string | null): Customer | undefined {
  return id ? state.customers.find((c) => c.id === id) : undefined
}

export function fullName(c?: { firstName: string; lastName: string }): string {
  return c ? `${c.firstName} ${c.lastName}` : ''
}

export function domiSubscription(state: Pick<DataState, 'subscriptions'>, customerId: string): Subscription | undefined {
  return state.subscriptions.find(
    (s) => s.customerId === customerId && DOMI_PACKAGES.includes(s.product as DomiPackage) && s.status !== 'cancelled',
  )
}

export function customerMonthlyValue(state: Pick<DataState, 'subscriptions'>, customerId: string): number {
  return state.subscriptions.filter((s) => s.customerId === customerId && isLive(s)).reduce((sum, s) => sum + s.price, 0)
}

export function customerOpenBalance(state: Pick<DataState, 'invoices'>, customerId: string): number {
  return state.invoices.filter((i) => i.customerId === customerId && i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
}

export function invoiceStatusLabel(i: Invoice): 'paid' | 'pending' | 'overdue' {
  return i.status
}
