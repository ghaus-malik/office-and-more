import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { buildSeed } from '@/data/loadSeed'
import type {
  Activity,
  ActivityType,
  Applicant,
  Application,
  ApplicationStage,
  AutomationId,
  Booking,
  BookingKind,
  Customer,
  DataState,
  DomiPackage,
  Email,
  EmailTemplate,
  Invoice,
  InvoiceLine,
  MailItem,
  MailType,
  Notification,
  PaymentMethod,
  Prices,
  ProductId,
  SavedAddress,
  ServiceKey,
  ServiceRequest,
  SessionState,
  Subscription,
} from './types'
import type { Lang } from '@/i18n'
import { bookingRef, uid } from '@/lib/id'
import { addMonths, today } from '@/lib/dates'
import { hm, toISODate } from '@/lib/format'

const now = () => new Date().toISOString()

/** localStorage that never throws (private mode, quota exceeded). */
const safeStorage = {
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* quota exceeded: keep working in memory */
    }
  },
  removeItem: (k: string) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}

export interface BookRoomInput {
  date: string
  kind: Exclude<BookingKind, 'block'>
  start: string
  end: string
  name: string
  email: string
  company?: string
  method: PaymentMethod
  customerId?: string
}

export interface DomiSignupInput {
  email: string
  applicant: Applicant
  pkg: DomiPackage
  idDocument?: { name: string; size: number; preview?: string }
  signature?: string
  method: PaymentMethod
}

export interface OfficeApplicationInput {
  applicant: Applicant
  officeId: string
  startDate: string
  duration: number
  signature?: string
}

export interface LogMailInput {
  customerId: string
  sender: string
  type: MailType
  receivedAt: string
  scan?: string
  action: 'notify' | 'scan_notify' | 'collect' | 'forward'
}

export interface ServiceRequestInput {
  service: ServiceKey
  kind: 'order' | 'quote'
  name: string
  email: string
  company?: string
  message: string
  customerId?: string
}

interface Actions {
  setLang: (lang: Lang) => void
  setPillHidden: (hidden: boolean) => void
  reset: () => void

  loginCustomer: (customerId: string) => void
  logout: () => void
  sendLoginLink: (email: string) => boolean

  bookRoom: (input: BookRoomInput) => Booking
  createManualBooking: (input: Omit<BookRoomInput, 'method'> & { paid: boolean }) => Booking
  blockSlot: (date: string, start: string, end: string, note: string) => void
  cancelBooking: (bookingId: string) => void

  signUpDomiciliation: (input: DomiSignupInput) => string
  applyForOffice: (input: OfficeApplicationInput) => string
  moveApplication: (appId: string, stage: ApplicationStage) => void
  approveApplication: (appId: string) => void
  refuseApplication: (appId: string) => void

  logMail: (input: LogMailInput) => MailItem
  markMailRead: (mailId: string) => void
  requestScan: (mailId: string) => void
  completeScan: (mailId: string) => void
  requestForwarding: (mailId: string, address: SavedAddress) => void
  markForCollection: (mailId: string) => void
  markForwardSent: (forwardId: string) => void

  sendReminder: (invoiceId: string) => void
  payInvoice: (invoiceId: string, method: PaymentMethod) => void
  syncBexio: () => void

  toggleAutomation: (id: AutomationId) => void
  setReminderIntervals: (intervals: number[]) => void
  setPrice: (key: keyof Prices, value: number) => void

  changePlan: (customerId: string, pkg: DomiPackage) => void
  addAddon: (customerId: string, product: ProductId) => void
  cancelSubscription: (subscriptionId: string) => void

  requestService: (input: ServiceRequestInput) => ServiceRequest
  replyQuote: (requestId: string, amount: number) => void
  setServiceStatus: (requestId: string, status: ServiceRequest['status']) => void

  updateCustomer: (customerId: string, patch: Partial<Customer>) => void
  addForwardingAddress: (customerId: string, address: Omit<SavedAddress, 'id'>) => void
  removeForwardingAddress: (customerId: string, addressId: string) => void

  markNotificationsRead: (customerId: string) => void
  markNotificationRead: (id: string) => void
  markEmailRead: (id: string) => void
  markAllEmailsRead: () => void
  markAdminRead: () => void
  submitContact: (input: { name: string; email: string; subject: string; message: string }) => void
}

export type StoreState = DataState & SessionState & Actions

export const STORAGE_KEY = 'om-demo-v1'
const VERSION = 3

const initialSession = (): SessionState => ({ lang: 'fr', customerId: null, pillHidden: false })

export const DOMI_PACKAGES: DomiPackage[] = ['domi_essentielle', 'domi_confort', 'domi_premium']

export function roomPrice(prices: Prices, kind: BookingKind, start: string, end: string): number {
  if (kind === 'day') return prices.room_day
  if (kind === 'half_am' || kind === 'half_pm') return prices.room_half
  if (kind === 'block') return 0
  return Math.round(((hm(end) - hm(start)) / 60) * prices.room_hour * 100) / 100
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => {
      // ---- internal helpers -------------------------------------------------
      const activity = (type: ActivityType, text: string, params: Activity['params'], customerId?: string): Activity => ({
        id: uid('ac'),
        type,
        text,
        params,
        customerId,
        at: now(),
      })

      const email = (template: EmailTemplate, to: string, toName: string, data: Record<string, any>): Email => ({
        id: uid('em'),
        template,
        to,
        toName,
        data,
        sentAt: now(),
        read: false,
      })

      const notification = (
        customerId: string,
        kind: Notification['kind'],
        text: string,
        params: Notification['params'],
        link: string,
      ): Notification => ({ id: uid('n'), customerId, kind, text, params, link, at: now(), read: false })

      const automationOn = (id: AutomationId) => get().automations.find((a) => a.id === id)?.enabled ?? true

      const nextInvoiceNumber = (invoices: Invoice[]) => {
        const max = invoices.reduce((m, i) => Math.max(m, Number(i.number.split('-').pop()) || 0), 0)
        return `OM-${new Date().getFullYear()}-${String(max + 1).padStart(4, '0')}`
      }

      const makeInvoice = (
        state: DataState,
        customerId: string,
        lines: InvoiceLine[],
        paid: { method: PaymentMethod } | null,
        dueInDays = 30,
      ): Invoice => {
        const d = today()
        const due = new Date(d)
        due.setDate(due.getDate() + (paid ? 0 : dueInDays))
        return {
          id: uid('inv'),
          number: nextInvoiceNumber(state.invoices),
          customerId,
          date: toISODate(d),
          dueDate: toISODate(due),
          lines,
          amount: lines.reduce((s, l) => s + l.qty * l.unit, 0),
          status: paid ? 'paid' : 'pending',
          reminder: 0,
          paidAt: paid ? now() : undefined,
          method: paid?.method,
          bexioSyncedAt: now(),
        }
      }

      const customerName = (c?: Customer) => (c ? `${c.firstName} ${c.lastName}` : '')

      return {
        ...buildSeed(),
        ...initialSession(),

        // ---- session ---------------------------------------------------------
        setLang: (lang) => {
          set({ lang })
          if (typeof document !== 'undefined') document.documentElement.lang = lang
        },
        setPillHidden: (pillHidden) => set({ pillHidden }),
        reset: () => set((s) => ({ ...buildSeed(), customerId: null, lang: s.lang, pillHidden: false })),

        loginCustomer: (customerId) =>
          set((s) => ({
            customerId,
            customers: s.customers.map((c) => (c.id === customerId ? { ...c, lastVisit: c.lastVisit ?? now() } : c)),
          })),
        logout: () => set({ customerId: null }),
        sendLoginLink: (address) => {
          const c = get().customers.find((x) => x.email.toLowerCase() === address.trim().toLowerCase())
          set((s) => ({
            emails: [
              email('login_link', address.trim(), c ? customerName(c) : address.trim(), { customerId: c?.id ?? null }),
              ...s.emails,
            ],
          }))
          return !!c
        },

        // ---- room bookings ---------------------------------------------------
        bookRoom: (input) => {
          const s = get()
          const amount = roomPrice(s.prices, input.kind, input.start, input.end)
          const booking: Booking = {
            id: uid('bk'),
            ref: bookingRef(),
            customerId: input.customerId,
            name: input.name,
            email: input.email,
            company: input.company,
            date: input.date,
            start: input.start,
            end: input.end,
            kind: input.kind,
            amount,
            payment: 'paid',
            method: input.method,
            createdAt: now(),
          }
          const hours = (hm(input.end) - hm(input.start)) / 60
          const line: InvoiceLine =
            input.kind === 'day'
              ? { label: 'room_day', qty: 1, unit: s.prices.room_day }
              : input.kind === 'hour'
                ? { label: 'room_hour', qty: hours, unit: s.prices.room_hour }
                : { label: 'room_half', qty: 1, unit: s.prices.room_half }
          const payer = input.company || input.name
          set((st) => {
            const invoice = input.customerId ? makeInvoice(st, input.customerId, [line], { method: input.method }) : null
            return {
              bookings: [...st.bookings, booking],
              invoices: invoice ? [invoice, ...st.invoices] : st.invoices,
              payments: [
                {
                  id: uid('p'),
                  customerId: input.customerId,
                  payer,
                  invoiceId: invoice?.id,
                  bookingId: booking.id,
                  amount,
                  method: input.method,
                  at: now(),
                  label: 'booking',
                  labelParams: { ref: booking.ref },
                },
                ...st.payments,
              ],
              emails: automationOn('booking_confirmation')
                ? [email('booking_confirmation', input.email, input.name, { bookingId: booking.id, ...booking }), ...st.emails]
                : st.emails,
              activity: [
                activity('payment', 'paymentReceived', { name: payer, amount, method: input.method }, input.customerId),
                activity('booking', 'bookingNew', { name: input.name, date: input.date }, input.customerId),
                ...st.activity,
              ],
              notifications: input.customerId
                ? [
                    notification(input.customerId, 'booking', 'bookingConfirmed', { date: input.date, start: input.start }, '/espace/reservations'),
                    ...st.notifications,
                  ]
                : st.notifications,
            }
          })
          return booking
        },

        createManualBooking: (input) => {
          const s = get()
          const amount = roomPrice(s.prices, input.kind, input.start, input.end)
          const booking: Booking = {
            id: uid('bk'),
            ref: bookingRef(),
            customerId: input.customerId,
            name: input.name,
            email: input.email,
            company: input.company,
            date: input.date,
            start: input.start,
            end: input.end,
            kind: input.kind,
            amount,
            payment: input.paid ? 'paid' : 'pending',
            method: input.paid ? 'card' : 'invoice',
            createdAt: now(),
          }
          set((st) => ({
            bookings: [...st.bookings, booking],
            activity: [activity('booking', 'bookingManual', { name: input.name, date: input.date }, input.customerId), ...st.activity],
          }))
          return booking
        },

        blockSlot: (date, start, end, note) =>
          set((st) => ({
            bookings: [
              ...st.bookings,
              {
                id: uid('bk'),
                ref: 'OM-BLOCK',
                name: note || 'Maintenance',
                email: '',
                date,
                start,
                end,
                kind: 'block',
                amount: 0,
                payment: 'blocked',
                note,
                createdAt: now(),
              },
            ],
            activity: [activity('booking', 'slotBlocked', { date, start, end }), ...st.activity],
          })),

        cancelBooking: (bookingId) => set((st) => ({ bookings: st.bookings.filter((b) => b.id !== bookingId) })),

        // ---- applications ----------------------------------------------------
        signUpDomiciliation: (input) => {
          const s = get()
          const customerId = uid('c')
          const price = s.prices[input.pkg]
          const a = input.applicant
          const customer: Customer = {
            id: customerId,
            firstName: a.firstName,
            lastName: a.lastName,
            company: a.company,
            legalForm: a.legalForm,
            uid: a.uid,
            activity: a.activity,
            email: input.email || a.email,
            phone: a.phone,
            address: { street: 'Rue du Château 7', zip: '2000', city: 'Neuchâtel' },
            billingAddress: a.address,
            forwardingAddresses: [{ id: uid('fa'), label: 'Domicile', name: `${a.firstName} ${a.lastName}`, ...a.address }],
            kind: 'domiciliation',
            status: 'pending',
            since: toISODate(today()),
            lastVisit: now(),
            paymentMethod: input.method,
          }
          const start = today()
          const subscription: Subscription = {
            id: uid('s'),
            customerId,
            product: input.pkg,
            price,
            startDate: toISODate(start),
            nextRenewal: toISODate(addMonths(start, 1)),
            paymentMethod: input.method,
            status: 'pending',
          }
          const application: Application = {
            id: uid('a'),
            kind: 'domiciliation',
            customerId,
            applicant: { ...a, email: customer.email },
            pkg: input.pkg,
            stage: 'new',
            createdAt: now(),
            idDocument: input.idDocument,
            signature: input.signature,
            signedAt: input.signature ? now() : undefined,
            paid: true,
          }
          set((st) => {
            const invoice = makeInvoice(st, customerId, [{ label: input.pkg, qty: 1, unit: price }], { method: input.method })
            return {
              customers: [...st.customers, customer],
              subscriptions: [...st.subscriptions, subscription],
              applications: [application, ...st.applications],
              invoices: [invoice, ...st.invoices],
              payments: [
                {
                  id: uid('p'),
                  customerId,
                  payer: a.company,
                  invoiceId: invoice.id,
                  amount: price,
                  method: input.method,
                  at: now(),
                  label: 'invoice',
                  labelParams: { number: invoice.number },
                },
                ...st.payments,
              ],
              scansUsed: { ...st.scansUsed, [customerId]: 0 },
              emails: automationOn('welcome')
                ? [email('welcome', customer.email, customerName(customer), { customerId, pkg: input.pkg, price }), ...st.emails]
                : st.emails,
              activity: [
                activity('payment', 'paymentReceived', { name: a.company, amount: price, method: input.method }, customerId),
                activity('application', 'applicationNew', { company: a.company, product: input.pkg }, customerId),
                ...st.activity,
              ],
              notifications: [
                notification(customerId, 'subscription', 'welcome', { pkg: input.pkg }, '/espace/abonnements'),
                ...st.notifications,
              ],
              customerId,
            }
          })
          return customerId
        },

        applyForOffice: (input) => {
          const app: Application = {
            id: uid('a'),
            kind: 'office',
            applicant: input.applicant,
            officeId: input.officeId,
            startDate: input.startDate,
            duration: input.duration,
            stage: 'new',
            createdAt: now(),
            signature: input.signature,
            signedAt: input.signature ? now() : undefined,
          }
          const office = get().offices.find((o) => o.id === input.officeId)
          set((st) => ({
            applications: [app, ...st.applications],
            emails: [
              email('office_application', input.applicant.email, `${input.applicant.firstName} ${input.applicant.lastName}`, {
                office: office?.number,
                startDate: input.startDate,
                duration: input.duration,
              }),
              ...st.emails,
            ],
            activity: [
              activity('application', 'applicationNew', { company: input.applicant.company, product: 'office', n: office?.number ?? '' }),
              ...st.activity,
            ],
          }))
          return app.id
        },

        moveApplication: (appId, stage) => {
          if (stage === 'active') return get().approveApplication(appId)
          set((st) => ({ applications: st.applications.map((a) => (a.id === appId ? { ...a, stage } : a)) }))
        },

        approveApplication: (appId) => {
          const s = get()
          const app = s.applications.find((a) => a.id === appId)
          if (!app || app.stage === 'active') return
          const a = app.applicant
          let customerId = app.customerId
          const newCustomers = [...s.customers]
          if (!customerId) {
            customerId = uid('c')
            newCustomers.push({
              id: customerId,
              firstName: a.firstName,
              lastName: a.lastName,
              company: a.company,
              legalForm: a.legalForm,
              uid: a.uid,
              activity: a.activity,
              email: a.email,
              phone: a.phone,
              address: app.kind === 'domiciliation' || app.officeId ? { street: 'Rue du Château 7', zip: '2000', city: 'Neuchâtel' } : a.address,
              billingAddress: a.address,
              forwardingAddresses: [{ id: uid('fa'), label: 'Domicile', name: `${a.firstName} ${a.lastName}`, ...a.address }],
              kind: app.kind === 'office' ? 'office' : 'domiciliation',
              status: 'active',
              since: toISODate(today()),
              paymentMethod: 'card',
            })
          }
          const cid = customerId
          const customers = newCustomers.map((c) => (c.id === cid ? { ...c, status: 'active' as const } : c))
          let subscriptions = [...s.subscriptions]
          let offices = s.offices
          let product: ProductId
          let price: number
          const start = app.startDate ? new Date(app.startDate) : today()
          if (app.kind === 'domiciliation') {
            product = app.pkg ?? 'domi_confort'
            price = s.prices[product as DomiPackage]
            const existing = subscriptions.find((x) => x.customerId === cid && x.product === product)
            if (existing) subscriptions = subscriptions.map((x) => (x.id === existing.id ? { ...x, status: 'active' } : x))
            else
              subscriptions.push({
                id: uid('s'),
                customerId: cid,
                product,
                price,
                startDate: toISODate(today()),
                nextRenewal: toISODate(addMonths(today(), 1)),
                paymentMethod: 'card',
                status: 'active',
              })
          } else {
            product = 'office'
            const office = s.offices.find((o) => o.id === app.officeId)
            price = office?.rent ?? s.prices.office
            subscriptions.push({
              id: uid('s'),
              customerId: cid,
              product: 'office',
              officeId: app.officeId,
              price,
              startDate: toISODate(start),
              nextRenewal: toISODate(addMonths(start, 1)),
              paymentMethod: 'invoice',
              status: 'active',
            })
            offices = s.offices.map((o) =>
              o.id === app.officeId
                ? {
                    ...o,
                    status: 'let',
                    tenantId: cid,
                    contractStart: toISODate(start),
                    contractEnd: toISODate(addMonths(start, app.duration ?? 12)),
                  }
                : o,
            )
          }
          const cust = customers.find((c) => c.id === cid)!
          set((st) => ({
            customers,
            subscriptions,
            offices,
            applications: st.applications.map((x) => (x.id === appId ? { ...x, stage: 'active', customerId: cid } : x)),
            emails: [email('subscription_active', cust.email, customerName(cust), { product, price, customerId: cid }), ...st.emails],
            activity: [activity('approval', 'applicationApproved', { company: a.company, product, price }, cid), ...st.activity],
            notifications: [notification(cid, 'subscription', 'subscriptionActive', { product }, '/espace/abonnements'), ...st.notifications],
          }))
        },

        refuseApplication: (appId) =>
          set((st) => {
            const app = st.applications.find((a) => a.id === appId)
            return {
              applications: st.applications.map((a) => (a.id === appId ? { ...a, stage: 'refused' } : a)),
              activity: app ? [activity('application', 'applicationRefused', { company: app.applicant.company }), ...st.activity] : st.activity,
            }
          }),

        // ---- mail --------------------------------------------------------------
        logMail: (input) => {
          const s = get()
          const status: MailItem['status'] =
            input.action === 'scan_notify' ? 'scanned' : input.action === 'collect' ? 'collect' : input.action === 'forward' ? 'forward_requested' : 'received'
          const item: MailItem = {
            id: uid('m'),
            customerId: input.customerId,
            receivedAt: input.receivedAt,
            sender: input.sender,
            type: input.type,
            status,
            scan: input.scan,
            unread: true,
            pages: 1,
          }
          const cust = s.customers.find((c) => c.id === input.customerId)
          const fwdAddress = cust?.forwardingAddresses[0]
          set((st) => ({
            mail: [item, ...st.mail],
            forwards:
              input.action === 'forward' && fwdAddress
                ? [
                    { id: uid('f'), mailId: item.id, customerId: input.customerId, address: fwdAddress, requestedAt: now(), status: 'pending' as const },
                    ...st.forwards,
                  ]
                : st.forwards,
            scansUsed: input.action === 'scan_notify' ? { ...st.scansUsed, [input.customerId]: (st.scansUsed[input.customerId] ?? 0) + 1 } : st.scansUsed,
            emails:
              cust && automationOn('mail_notification')
                ? [email('mail_notification', cust.email, customerName(cust), { mailId: item.id, sender: input.sender, type: input.type, scanned: !!input.scan, customerId: cust.id }), ...st.emails]
                : st.emails,
            notifications: [
              notification(input.customerId, 'mail', 'mailArrived', { sender: input.sender }, `/espace/courrier?item=${item.id}`),
              ...st.notifications,
            ],
            activity: [activity('mail', 'mailLogged', { company: cust?.company ?? '', sender: input.sender }, input.customerId), ...st.activity],
          }))
          return item
        },

        markMailRead: (mailId) =>
          set((st) => ({
            mail: st.mail.map((m) => (m.id === mailId ? { ...m, unread: false } : m)),
            notifications: st.notifications.map((n) => (n.link.endsWith(`item=${mailId}`) ? { ...n, read: true } : n)),
          })),

        requestScan: (mailId) =>
          set((st) => {
            const m = st.mail.find((x) => x.id === mailId)
            const c = st.customers.find((x) => x.id === m?.customerId)
            return {
              mail: st.mail.map((x) => (x.id === mailId ? { ...x, status: 'scan_requested' } : x)),
              activity: [activity('mail', 'scanRequested', { company: c?.company ?? '', sender: m?.sender ?? '' }, c?.id), ...st.activity],
            }
          }),

        completeScan: (mailId) =>
          set((st) => {
            const m = st.mail.find((x) => x.id === mailId)
            if (!m) return {}
            return {
              mail: st.mail.map((x) => (x.id === mailId ? { ...x, status: 'scanned', unread: true } : x)),
              scansUsed: { ...st.scansUsed, [m.customerId]: (st.scansUsed[m.customerId] ?? 0) + 1 },
              notifications: [notification(m.customerId, 'mail', 'scanReady', { sender: m.sender }, `/espace/courrier?item=${m.id}`), ...st.notifications],
            }
          }),

        requestForwarding: (mailId, address) =>
          set((st) => {
            const m = st.mail.find((x) => x.id === mailId)
            if (!m) return {}
            const c = st.customers.find((x) => x.id === m.customerId)
            return {
              mail: st.mail.map((x) => (x.id === mailId ? { ...x, status: 'forward_requested', unread: false } : x)),
              forwards: [{ id: uid('f'), mailId, customerId: m.customerId, address, requestedAt: now(), status: 'pending' }, ...st.forwards],
              activity: [activity('forward', 'forwardRequested', { company: c?.company ?? '', city: address.city }, m.customerId), ...st.activity],
            }
          }),

        markForCollection: (mailId) =>
          set((st) => {
            const m = st.mail.find((x) => x.id === mailId)
            const c = st.customers.find((x) => x.id === m?.customerId)
            return {
              mail: st.mail.map((x) => (x.id === mailId ? { ...x, status: 'collect', unread: false } : x)),
              activity: [activity('mail', 'collectRequested', { company: c?.company ?? '', sender: m?.sender ?? '' }, c?.id), ...st.activity],
            }
          }),

        markForwardSent: (forwardId) =>
          set((st) => {
            const f = st.forwards.find((x) => x.id === forwardId)
            if (!f) return {}
            const c = st.customers.find((x) => x.id === f.customerId)
            const m = st.mail.find((x) => x.id === f.mailId)
            return {
              forwards: st.forwards.map((x) => (x.id === forwardId ? { ...x, status: 'sent', sentAt: now() } : x)),
              mail: st.mail.map((x) => (x.id === f.mailId ? { ...x, status: 'forwarded' } : x)),
              emails: c ? [email('forward_sent', c.email, customerName(c), { sender: m?.sender ?? '', address: f.address }), ...st.emails] : st.emails,
              notifications: [notification(f.customerId, 'mail', 'forwardSent', { sender: m?.sender ?? '', city: f.address.city }, `/espace/courrier?item=${f.mailId}`), ...st.notifications],
              activity: [activity('forward', 'forwardSent', { company: c?.company ?? '', city: f.address.city }, f.customerId), ...st.activity],
            }
          }),

        // ---- invoices --------------------------------------------------------
        sendReminder: (invoiceId) =>
          set((st) => {
            const inv = st.invoices.find((i) => i.id === invoiceId)
            if (!inv) return {}
            const level = Math.min(2, inv.reminder + 1) as 1 | 2
            const c = st.customers.find((x) => x.id === inv.customerId)
            return {
              invoices: st.invoices.map((i) => (i.id === invoiceId ? { ...i, reminder: level, reminderSentAt: now() } : i)),
              emails: c ? [email('payment_reminder', c.email, customerName(c), { invoiceId, number: inv.number, amount: inv.amount, dueDate: inv.dueDate, level, customerId: c.id }), ...st.emails] : st.emails,
              notifications: [notification(inv.customerId, 'reminder', 'reminder', { number: inv.number }, `/espace/factures?item=${inv.id}`), ...st.notifications],
              activity: [activity('reminder', 'reminderSent', { company: c?.company ?? '', number: inv.number, level }, inv.customerId), ...st.activity],
            }
          }),

        payInvoice: (invoiceId, method) =>
          set((st) => {
            const inv = st.invoices.find((i) => i.id === invoiceId)
            if (!inv) return {}
            const c = st.customers.find((x) => x.id === inv.customerId)
            const invoices = st.invoices.map((i) => (i.id === invoiceId ? { ...i, status: 'paid' as const, paidAt: now(), method, bexioSyncedAt: now() } : i))
            const stillOverdue = invoices.some((i) => i.customerId === inv.customerId && i.status === 'overdue')
            return {
              invoices,
              subscriptions: stillOverdue
                ? st.subscriptions
                : st.subscriptions.map((x) => (x.customerId === inv.customerId && x.status === 'late' ? { ...x, status: 'active' } : x)),
              payments: [
                { id: uid('p'), customerId: inv.customerId, payer: c?.company ?? '', invoiceId, amount: inv.amount, method, at: now(), label: 'invoice', labelParams: { number: inv.number } },
                ...st.payments,
              ],
              activity: [
                activity('bexio', 'invoiceSynced', { number: inv.number }, inv.customerId),
                activity('payment', 'paymentReceived', { name: c?.company ?? '', amount: inv.amount, method }, inv.customerId),
                ...st.activity,
              ],
            }
          }),

        syncBexio: () =>
          set((st) => {
            const t = now()
            return {
              lastBexioSync: t,
              invoices: st.invoices.map((i) => ({ ...i, bexioSyncedAt: t })),
              activity: [activity('bexio', 'bexioSync', { n: st.invoices.length }), ...st.activity],
            }
          }),

        // ---- settings ------------------------------------------------------
        toggleAutomation: (id) => set((st) => ({ automations: st.automations.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)) })),
        setReminderIntervals: (intervals) =>
          set((st) => ({ automations: st.automations.map((a) => (a.id === 'payment_reminder' ? { ...a, intervals } : a)) })),
        setPrice: (key, value) =>
          set((st) => ({
            prices: { ...st.prices, [key]: value },
            activity: [activity('price', 'priceChanged', { product: key, price: value }), ...st.activity],
          })),

        // ---- subscriptions -------------------------------------------------
        changePlan: (customerId, pkg) =>
          set((st) => {
            const sub = st.subscriptions.find((x) => x.customerId === customerId && DOMI_PACKAGES.includes(x.product as DomiPackage) && x.status !== 'cancelled')
            if (!sub) return {}
            const c = st.customers.find((x) => x.id === customerId)
            const price = st.prices[pkg]
            return {
              subscriptions: st.subscriptions.map((x) => (x.id === sub.id ? { ...x, product: pkg, price } : x)),
              emails: c ? [email('plan_change', c.email, customerName(c), { from: sub.product, to: pkg, price, nextRenewal: sub.nextRenewal }), ...st.emails] : st.emails,
              activity: [activity('subscription', 'planChanged', { company: c?.company ?? '', from: sub.product, to: pkg }, customerId), ...st.activity],
            }
          }),

        addAddon: (customerId, product) =>
          set((st) => {
            const c = st.customers.find((x) => x.id === customerId)
            const price = (st.prices as any)[product] ?? 0
            return {
              subscriptions: [
                ...st.subscriptions,
                {
                  id: uid('s'),
                  customerId,
                  product,
                  price,
                  startDate: toISODate(today()),
                  nextRenewal: toISODate(addMonths(today(), 1)),
                  paymentMethod: c?.paymentMethod ?? 'card',
                  status: 'active',
                },
              ],
              activity: [activity('subscription', 'addonAdded', { company: c?.company ?? '', product }, customerId), ...st.activity],
            }
          }),

        cancelSubscription: (subscriptionId) =>
          set((st) => {
            const sub = st.subscriptions.find((x) => x.id === subscriptionId)
            if (!sub) return {}
            const c = st.customers.find((x) => x.id === sub.customerId)
            return {
              subscriptions: st.subscriptions.map((x) => (x.id === subscriptionId ? { ...x, status: 'cancelled', cancelAt: x.nextRenewal } : x)),
              activity: [activity('subscription', 'subscriptionCancelled', { company: c?.company ?? '', product: sub.product }, sub.customerId), ...st.activity],
            }
          }),

        // ---- service requests ----------------------------------------------
        requestService: (input) => {
          const req: ServiceRequest = { id: uid('r'), ...input, status: 'new', createdAt: now() }
          set((st) => ({
            serviceRequests: [req, ...st.serviceRequests],
            emails: [email('service_request', input.email, input.name, { service: input.service, kind: input.kind }), ...st.emails],
            activity: [activity('service', 'serviceRequest', { name: input.name, service: input.service }, input.customerId), ...st.activity],
          }))
          return req
        },
        replyQuote: (requestId, amount) =>
          set((st) => {
            const r = st.serviceRequests.find((x) => x.id === requestId)
            if (!r) return {}
            return {
              serviceRequests: st.serviceRequests.map((x) => (x.id === requestId ? { ...x, status: 'quoted', quote: amount } : x)),
              emails: [email('quote_reply', r.email, r.name, { service: r.service, amount }), ...st.emails],
              notifications: r.customerId
                ? [notification(r.customerId, 'service', 'quoteReceived', { service: r.service, amount }, '/espace/services'), ...st.notifications]
                : st.notifications,
              activity: [activity('service', 'quoteSent', { name: r.name, service: r.service, amount }, r.customerId), ...st.activity],
            }
          }),
        setServiceStatus: (requestId, status) =>
          set((st) => ({ serviceRequests: st.serviceRequests.map((x) => (x.id === requestId ? { ...x, status } : x)) })),

        // ---- profile -------------------------------------------------------
        updateCustomer: (customerId, patch) =>
          set((st) => ({ customers: st.customers.map((c) => (c.id === customerId ? { ...c, ...patch } : c)) })),
        addForwardingAddress: (customerId, address) =>
          set((st) => ({
            customers: st.customers.map((c) =>
              c.id === customerId ? { ...c, forwardingAddresses: [...c.forwardingAddresses, { ...address, id: uid('fa') }] } : c,
            ),
          })),
        removeForwardingAddress: (customerId, addressId) =>
          set((st) => ({
            customers: st.customers.map((c) =>
              c.id === customerId ? { ...c, forwardingAddresses: c.forwardingAddresses.filter((a) => a.id !== addressId) } : c,
            ),
          })),

        // ---- read flags ----------------------------------------------------
        markNotificationsRead: (customerId) =>
          set((st) => ({ notifications: st.notifications.map((n) => (n.customerId === customerId ? { ...n, read: true } : n)) })),
        markNotificationRead: (id) => set((st) => ({ notifications: st.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
        markEmailRead: (id) => set((st) => ({ emails: st.emails.map((e) => (e.id === id ? { ...e, read: true } : e)) })),
        markAllEmailsRead: () => set((st) => ({ emails: st.emails.map((e) => ({ ...e, read: true })) })),
        markAdminRead: () => set({ adminReadAt: now() }),
        submitContact: (input) =>
          set((st) => ({
            emails: [email('contact_received', input.email, input.name, { subject: input.subject, message: input.message }), ...st.emails],
            activity: [activity('customer', 'contactReceived', { name: input.name, subject: input.subject }), ...st.activity],
          })),
      }
    },
    {
      name: STORAGE_KEY,
      version: VERSION,
      storage: createJSONStorage(() => safeStorage),
      migrate: () => ({ ...buildSeed(), ...initialSession() }) as any,
      partialize: (s) => {
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(s)) if (typeof v !== 'function') out[k] = v
        return out as any
      },
    },
  ),
)

/** Keep a second tab in sync: when another tab writes, re-read storage. */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) useStore.persist.rehydrate()
  })
}
