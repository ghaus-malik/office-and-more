import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, CalendarPlus, Plus } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Button, Card, EmptyState, Modal, Tabs, toast } from '@/core/ui'
import { PaymentPanel } from '@/core/flows'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { chf, formatDate, parseISODate, toISODate } from '@/lib/format'
import { today } from '@/lib/dates'
import { downloadIcs } from '@/lib/ics'
import { BookingPaymentBadge } from '@/shared/badges'
import { BookingWidget } from '@/site/components/BookingWidget'
import type { BookingSelection } from '@/site/bookingDraft'
import { useCustomer } from '../useCustomer'

export function Bookings() {
  const { t, td, tl } = useT()
  const c = useCustomer()
  const [params, setParams] = useSearchParams()
  const bookings = useStore((s) => s.bookings.filter((b) => b.customerId === c.id))
  const bookRoom = useStore((s) => s.bookRoom)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [open, setOpen] = useState(false)
  const [sel, setSel] = useState<{ s: BookingSelection; amount: number } | null>(null)

  useEffect(() => {
    if (params.get('new')) {
      setOpen(true)
      params.delete('new')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const todayIso = toISODate(today())
  const upcoming = bookings.filter((b) => b.date >= todayIso).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
  const past = bookings.filter((b) => b.date < todayIso).sort((a, b) => b.date.localeCompare(a.date))
  const list = tab === 'upcoming' ? upcoming : past
  const wd = tl('common.weekdayLong')

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t('espace.bookings.title')}
        subtitle={t('espace.bookings.subtitle')}
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
            {t('espace.bookings.new')}
          </Button>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'upcoming', label: t('espace.bookings.upcoming'), count: upcoming.length },
          { id: 'past', label: t('espace.bookings.past'), count: past.length },
        ]}
      />
      <div className="mt-5 space-y-3">
        {list.length === 0 && (
          <Card>
            <EmptyState icon={<CalendarDays className="h-5 w-5" />} title={tab === 'upcoming' ? t('espace.bookings.none') : t('espace.bookings.nonePast')} />
          </Card>
        )}
        {list.map((b) => {
          const d = parseISODate(b.date)
          return (
            <Card key={b.id} className="flex flex-wrap items-center gap-5 p-4 sm:p-5">
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-sand-100">
                <span className="text-[11px] font-bold uppercase text-muted">{tl('common.monthShort')[d.getMonth()]}</span>
                <span className="text-2xl font-extrabold leading-none">{d.getDate()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold capitalize">
                  {wd[(d.getDay() + 6) % 7]} {formatDate(b.date)}
                </div>
                <div className="mt-0.5 text-sm tabular-nums text-muted">
                  {b.start} – {b.end} · {td(`common.bookingKinds.${b.kind}`)} · {b.ref}
                </div>
              </div>
              <BookingPaymentBadge payment={b.payment} />
              <div className="w-24 text-right font-bold tabular-nums">{chf(b.amount)}</div>
              {tab === 'upcoming' && (
                <button
                  onClick={() => downloadIcs({ date: b.date, start: b.start, end: b.end, ref: b.ref, title: 'Office & More – Salle de conférence', location: 'Rue du Château 7, 2000 Neuchâtel' })}
                  className="rounded-full p-2 text-muted hover:bg-sand-100 hover:text-ink"
                  aria-label={t('site.room.confirm.addCalendar')}
                  title={t('site.room.confirm.addCalendar')}
                >
                  <CalendarPlus className="h-5 w-5" />
                </button>
              )}
            </Card>
          )
        })}
      </div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false)
          setSel(null)
        }}
        title={sel ? t('espace.bookings.step2') : t('espace.bookings.modalTitle')}
        size={sel ? 'md' : 'xl'}
        closeLabel={t('common.close')}
      >
        {!sel ? (
          <>
            <p className="mb-6 text-sm text-muted">{t('site.room.booking.prefilled')}</p>
            <BookingWidget continueLabel={t('common.next')} onContinue={(s, amount) => setSel({ s, amount })} />
          </>
        ) : (
          <div>
            <button onClick={() => setSel(null)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> {t('espace.bookings.back')}
            </button>
            <div className="mb-6 flex items-baseline justify-between rounded-2xl bg-sand-50 p-4">
              <div>
                <div className="font-bold">{formatDate(sel.s.date)}</div>
                <div className="text-sm tabular-nums text-muted">
                  {sel.s.start} – {sel.s.end} · {td(`common.bookingKinds.${sel.s.kind}`)}
                </div>
                <div className="mt-1 text-xs text-muted">
                  {c.firstName} {c.lastName} · {c.email}
                </div>
              </div>
              <div className="text-xl font-extrabold">{chf(sel.amount)}</div>
            </div>
            <PaymentPanel
              amount={sel.amount}
              defaultName={`${c.firstName} ${c.lastName}`}
              onPaid={(method) => {
                bookRoom({ ...sel.s, name: `${c.firstName} ${c.lastName}`, email: c.email, company: c.company, method, customerId: c.id })
                setOpen(false)
                setSel(null)
                setTab('upcoming')
                toast(t('espace.bookings.booked'))
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
