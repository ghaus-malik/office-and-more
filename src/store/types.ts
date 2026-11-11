import type { Lang } from '@/i18n'

export type ISODate = string // 'YYYY-MM-DD'
export type ISODateTime = string // full ISO

export interface Address {
  street: string
  zip: string
  city: string
  country?: string
}

export interface SavedAddress extends Address {
  id: string
  label: string
  name: string
}

export type OfficeStatus = 'available' | 'reserved' | 'let'

export interface Office {
  id: string
  number: number
  size: number // m²
  capacity: number
  floor: number
  rent: number
  status: OfficeStatus
  tenantId?: string
  contractStart?: ISODate
  contractEnd?: ISODate
  images: string[]
  features: string[] // i18n keys under site.offices.features.*
  notes?: string
}

export type CustomerKind = 'office' | 'domiciliation' | 'room'
export type CustomerStatus = 'active' | 'pending' | 'inactive'

export interface Customer {
  id: string
  firstName: string
  lastName: string
  company: string
  legalForm: string
  uid?: string
  activity?: string
  email: string
  phone: string
  address: Address
  billingAddress?: Address
  forwardingAddresses: SavedAddress[]
  kind: CustomerKind
  status: CustomerStatus
  since: ISODate
  lastVisit?: ISODateTime
  paymentMethod: PaymentMethod
}

export type ProductId =
  | 'office'
  | 'domi_essentielle'
  | 'domi_confort'
  | 'domi_premium'
  | 'phone'
  | 'locker'
  | 'mail_forwarding'
  | 'admin_assistance'
  | 'scanning'

export type DomiPackage = 'domi_essentielle' | 'domi_confort' | 'domi_premium'

export type SubscriptionStatus = 'active' | 'late' | 'cancelled' | 'pending'
export type PaymentMethod = 'card' | 'twint' | 'invoice'

export interface Subscription {
  id: string
  customerId: string
  product: ProductId
  officeId?: string
  price: number
  startDate: ISODate
  nextRenewal: ISODate
  paymentMethod: PaymentMethod
  status: SubscriptionStatus
  cancelAt?: ISODate
}

export type BookingKind = 'hour' | 'half_am' | 'half_pm' | 'day' | 'block'
export type BookingPayment = 'paid' | 'pending' | 'blocked'

export interface Booking {
  id: string
  ref: string
  customerId?: string
  name: string
  email: string
  company?: string
  date: ISODate
  start: string // HH:MM
  end: string
  kind: BookingKind
  amount: number
  payment: BookingPayment
  method?: PaymentMethod
  note?: string
  createdAt: ISODateTime
}

export type MailType = 'letter' | 'registered' | 'parcel'
export type MailStatus = 'received' | 'scanned' | 'forwarded' | 'collect' | 'scan_requested' | 'forward_requested'

export interface MailItem {
  id: string
  customerId: string
  receivedAt: ISODateTime
  sender: string
  type: MailType
  status: MailStatus
  scan?: string // url or data URL
  unread: boolean
  pages?: number
  note?: string
}

export interface ForwardRequest {
  id: string
  mailId: string
  customerId: string
  address: SavedAddress
  requestedAt: ISODateTime
  status: 'pending' | 'sent'
  sentAt?: ISODateTime
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue'

export interface InvoiceLine {
  label: string // i18n key or plain text
  labelParams?: Record<string, string | number>
  qty: number
  unit: number
}

export interface Invoice {
  id: string
  number: string
  customerId: string
  date: ISODate
  dueDate: ISODate
  lines: InvoiceLine[]
  amount: number
  status: InvoiceStatus
  reminder: 0 | 1 | 2
  reminderSentAt?: ISODateTime
  paidAt?: ISODateTime
  method?: PaymentMethod
  bexioSyncedAt: ISODateTime
}

export interface Payment {
  id: string
  customerId?: string
  payer: string
  invoiceId?: string
  bookingId?: string
  amount: number
  method: PaymentMethod
  at: ISODateTime
  label: string // i18n key
  labelParams?: Record<string, string | number>
}

export type ApplicationStage = 'new' | 'review' | 'contract' | 'signed' | 'active' | 'refused'

export interface Applicant {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  legalForm: string
  uid: string
  activity: string
  address: Address
}

export interface Application {
  id: string
  kind: 'office' | 'domiciliation'
  customerId?: string
  applicant: Applicant
  officeId?: string
  pkg?: DomiPackage
  startDate?: ISODate
  duration?: number // months
  stage: ApplicationStage
  createdAt: ISODateTime
  idDocument?: { name: string; size: number; preview?: string }
  signature?: string // data URL
  signedAt?: ISODateTime
  paid?: boolean
}

export type ServiceKey =
  | 'mail_forwarding'
  | 'phone'
  | 'admin_assistance'
  | 'scanning'
  | 'locker'
  | 'formation'
  | 'advice'
  | 'documents'
  | 'other'

export interface ServiceRequest {
  id: string
  customerId?: string
  name: string
  email: string
  company?: string
  service: ServiceKey
  kind: 'order' | 'quote'
  message: string
  status: 'new' | 'quoted' | 'accepted' | 'done'
  quote?: number
  createdAt: ISODateTime
}

export type EmailTemplate =
  | 'booking_confirmation'
  | 'welcome'
  | 'mail_notification'
  | 'login_link'
  | 'office_application'
  | 'payment_reminder'
  | 'subscription_active'
  | 'service_request'
  | 'quote_reply'
  | 'forward_sent'
  | 'contact_received'
  | 'renewal_notice'
  | 'contract_expiry'
  | 'plan_change'

export interface Email {
  id: string
  to: string
  toName: string
  template: EmailTemplate
  data: Record<string, any>
  sentAt: ISODateTime
  read: boolean
}

export type ActivityType =
  | 'booking'
  | 'payment'
  | 'mail'
  | 'reminder'
  | 'bexio'
  | 'application'
  | 'approval'
  | 'forward'
  | 'service'
  | 'subscription'
  | 'customer'
  | 'price'

export interface Activity {
  id: string
  type: ActivityType
  text: string // i18n key under admin.activity.*
  params: Record<string, string | number>
  customerId?: string
  at: ISODateTime
}

export interface Automation {
  id: AutomationId
  enabled: boolean
  intervals?: number[] // reminders: days after due date
  daysBefore?: number
}

export type AutomationId = 'booking_confirmation' | 'mail_notification' | 'payment_reminder' | 'renewal_notice' | 'contract_expiry' | 'welcome'

export interface Prices {
  office: number
  room_hour: number
  room_half: number
  room_day: number
  domi_essentielle: number
  domi_confort: number
  domi_premium: number
  phone: number
  locker: number
  mail_forwarding: number
  admin_assistance: number
  scanning: number
}

export interface Quotas {
  domi_essentielle: number
  domi_confort: number
  domi_premium: number
}

export interface Notification {
  id: string
  customerId: string
  kind: 'mail' | 'invoice' | 'subscription' | 'booking' | 'service' | 'reminder'
  text: string // i18n key under espace.notifications.*
  params: Record<string, string | number>
  link: string
  at: ISODateTime
  read: boolean
}

export interface AdminNote {
  id: string
  text: string
  at: ISODateTime
}

export interface DataState {
  offices: Office[]
  customers: Customer[]
  subscriptions: Subscription[]
  bookings: Booking[]
  mail: MailItem[]
  forwards: ForwardRequest[]
  invoices: Invoice[]
  payments: Payment[]
  applications: Application[]
  serviceRequests: ServiceRequest[]
  emails: Email[]
  activity: Activity[]
  automations: Automation[]
  notifications: Notification[]
  prices: Prices
  quotas: Quotas
  scansUsed: Record<string, number> // customerId → scans this month
  revenueHistory: { month: string; offices: number; domiciliation: number; room: number; services: number }[]
  lastBexioSync: ISODateTime
  adminReadAt: ISODateTime
}

export interface SessionState {
  lang: Lang
  customerId: string | null // logged-in customer in /espace
  pillHidden: boolean
}
