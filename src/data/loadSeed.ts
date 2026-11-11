import type { DataState, Invoice, Payment } from '@/store/types'
import { addDays, addMonths, startOfWeek, today } from '@/lib/dates'
import { toISODate } from '@/lib/format'

import offices from './seed/offices.json'
import customers from './seed/customers.json'
import subscriptions from './seed/subscriptions.json'
import bookings from './seed/bookings.json'
import mail from './seed/mail.json'
import forwards from './seed/forwards.json'
import invoices from './seed/invoices.json'
import applications from './seed/applications.json'
import serviceRequests from './seed/serviceRequests.json'
import revenue from './seed/revenue.json'
import settings from './seed/settings.json'
import activity from './seed/activity.json'
import notifications from './seed/notifications.json'
import persona from './seed/persona.json'

export { persona }

/**
 * Seed files store dates relative to "today" so the demo always looks current:
 *   @d-3          → date 3 days ago            @d0T09:30 → today at 09:30 (ISO datetime)
 *   @w1 … @w5     → Monday … Friday of the current week (@w8 = next Monday)
 *   @M-1          → first day of last month    @M0d30    → first of this month + 30 days
 */
const TOKEN = /^@(d|w|M)(-?\d+)(?:d(-?\d+))?(?:T(\d{2}):(\d{2}))?$/

export function resolveToken(value: string, base: Date = today()): string {
  const m = TOKEN.exec(value)
  if (!m) return value
  const [, kind, nStr, dStr, hh, mm] = m
  const n = Number(nStr)
  let d: Date
  if (kind === 'd') d = addDays(base, n)
  else if (kind === 'w') d = addDays(startOfWeek(base), n - 1)
  else {
    d = addMonths(new Date(base.getFullYear(), base.getMonth(), 1), n)
    if (dStr) d = addDays(d, Number(dStr))
  }
  if (hh !== undefined) {
    const x = new Date(d)
    x.setHours(Number(hh), Number(mm), 0, 0)
    return x.toISOString()
  }
  return toISODate(d)
}

function resolveDeep<T>(v: T, base: Date): T {
  if (typeof v === 'string') return (v.startsWith('@') ? resolveToken(v, base) : v) as T
  if (Array.isArray(v)) return v.map((x) => resolveDeep(x, base)) as T
  if (v && typeof v === 'object') {
    const out: any = {}
    for (const [k, x] of Object.entries(v)) out[k] = resolveDeep(x, base)
    return out
  }
  return v
}

export function buildSeed(base: Date = today()): DataState {
  const r = <T,>(x: T) => resolveDeep(structuredClone(x), base)
  const s = r(settings)

  const inv: Invoice[] = r(invoices).map((i: any) => ({
    reminder: 0,
    ...i,
    amount: i.lines.reduce((sum: number, l: any) => sum + l.qty * l.unit, 0),
    bexioSyncedAt: s.lastBexioSync,
  }))

  const custs = r(customers) as any[]
  const nameOf = (id: string) => {
    const c = custs.find((x) => x.id === id)
    return c ? c.company : ''
  }

  const payments: Payment[] = inv
    .filter((i) => i.status === 'paid' && i.paidAt)
    .map((i) => ({
      id: `p_${i.id}`,
      customerId: i.customerId,
      payer: nameOf(i.customerId),
      invoiceId: i.id,
      amount: i.amount,
      method: i.method ?? 'card',
      at: i.paidAt!,
      label: 'invoice',
      labelParams: { number: i.number },
    }))
    .sort((a, b) => b.at.localeCompare(a.at))

  return {
    offices: r(offices) as any,
    customers: custs as any,
    subscriptions: r(subscriptions) as any,
    bookings: r(bookings) as any,
    mail: (r(mail) as any[]).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)),
    forwards: r(forwards) as any,
    invoices: inv,
    payments,
    applications: r(applications) as any,
    serviceRequests: (r(serviceRequests) as any[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    emails: [],
    activity: (r(activity) as any[]).sort((a, b) => b.at.localeCompare(a.at)),
    automations: s.automations as any,
    notifications: r(notifications) as any,
    prices: s.prices,
    quotas: s.quotas,
    scansUsed: s.scansUsed,
    revenueHistory: r(revenue),
    lastBexioSync: s.lastBexioSync,
    adminReadAt: resolveToken('@d0T09:00', base),
  }
}
