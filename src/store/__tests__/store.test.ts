import { beforeEach, describe, expect, it } from 'vitest'
import { useStore } from '@/store'
import { mrr, officesLet, officesAvailable, unpaidInvoices, roomOccupancyThisWeek } from '@/store/selectors'
import { persona } from '@/data/loadSeed'
import { resolveToken } from '@/data/loadSeed'

const s = () => useStore.getState()

describe('seed data matches the brief', () => {
  beforeEach(() => s().reset())

  it('starts at CHF 5’364 MRR with 4 of 6 offices let', () => {
    expect(mrr(s())).toBe(5364)
    expect(officesLet(s())).toBe(4)
    expect(officesAvailable(s())).toBe(1)
  })

  it('has ~20 invoices: 3 pending and 2 overdue with Rappel 1', () => {
    expect(s().invoices.length).toBeGreaterThanOrEqual(20)
    expect(s().invoices.filter((i) => i.status === 'pending').length).toBe(3)
    const overdue = s().invoices.filter((i) => i.status === 'overdue')
    expect(overdue.length).toBe(2)
    expect(overdue.every((i) => i.reminder === 1)).toBe(true)
    expect(unpaidInvoices(s()).count).toBe(5)
  })

  it('gives Léa 5 mail items and 5 pipeline cards incl. Morel at Contrat envoyé', () => {
    expect(s().mail.filter((m) => m.customerId === 'c_rochat').length).toBe(5)
    expect(s().applications.length).toBe(5)
    expect(s().applications.find((a) => a.id === 'a_morel')?.stage).toBe('contract')
  })

  it('resolves relative date tokens', () => {
    const base = new Date(2026, 10, 18) // Wed 18.11.2026
    expect(resolveToken('@d0', base)).toBe('2026-11-18')
    expect(resolveToken('@w1', base)).toBe('2026-11-16')
    expect(resolveToken('@M-1', base)).toBe('2026-10-01')
    expect(resolveToken('@M0d30', base)).toBe('2026-12-01')
    expect(roomOccupancyThisWeek(s())).toBeGreaterThan(0)
  })
})

describe('connected moments', () => {
  beforeEach(() => s().reset())

  it('1. room booking reaches calendar, payments, activity and inbox', () => {
    const before = { b: s().bookings.length, p: s().payments.length, e: s().emails.length }
    const bk = s().bookRoom({ date: '2030-01-07', kind: 'half_am', start: '08:00', end: '12:00', name: 'Nicolas Robert', email: persona.email, method: 'twint' })
    expect(bk.amount).toBe(140)
    expect(s().bookings.length).toBe(before.b + 1)
    expect(s().payments[0].amount).toBe(140)
    expect(s().payments[0].method).toBe('twint')
    expect(s().emails[0].template).toBe('booking_confirmation')
    expect(s().activity[0].type).toBe('payment')
  })

  it('2+3. domiciliation sign-up then approval moves MRR 5’364 → 5’563', () => {
    const cid = s().signUpDomiciliation({ email: persona.email, applicant: persona as any, pkg: 'domi_confort', method: 'card', signature: 'data:x' })
    expect(s().customerId).toBe(cid)
    const app = s().applications.find((a) => a.customerId === cid)!
    expect(app.stage).toBe('new')
    expect(s().emails[0].template).toBe('welcome')
    expect(mrr(s())).toBe(5364)
    s().approveApplication(app.id)
    expect(s().applications.find((a) => a.id === app.id)?.stage).toBe('active')
    expect(s().subscriptions.find((x) => x.customerId === cid)?.status).toBe('active')
    expect(mrr(s())).toBe(5563)
  })

  it('4. logged letter reaches Léa, and her forward request reaches the queue', () => {
    const m = s().logMail({ customerId: 'c_rochat', sender: 'Registre du commerce', type: 'letter', receivedAt: new Date().toISOString(), scan: 'data:img', action: 'scan_notify' })
    expect(s().notifications.find((n) => n.customerId === 'c_rochat' && !n.read && n.link.includes(m.id))).toBeTruthy()
    expect(s().emails[0].template).toBe('mail_notification')
    const addr = s().customers.find((c) => c.id === 'c_rochat')!.forwardingAddresses[0]
    s().requestForwarding(m.id, addr)
    const fwd = s().forwards.find((f) => f.mailId === m.id)!
    expect(fwd.status).toBe('pending')
    s().markForwardSent(fwd.id)
    expect(s().mail.find((x) => x.id === m.id)?.status).toBe('forwarded')
  })

  it('price change and reminder (nice to have)', () => {
    s().setPrice('room_half', 150)
    expect(s().bookRoom({ date: '2030-01-08', kind: 'half_pm', start: '13:00', end: '17:00', name: 'X', email: 'x@y.ch', method: 'card' }).amount).toBe(150)
    s().sendReminder('i11')
    expect(s().invoices.find((i) => i.id === 'i11')?.reminder).toBe(2)
    expect(s().emails[0].template).toBe('payment_reminder')
  })

  it('reset restores the seed', () => {
    s().approveApplication('a_lacustre')
    expect(mrr(s())).toBe(5364 + 249)
    s().reset()
    expect(mrr(s())).toBe(5364)
  })
})
