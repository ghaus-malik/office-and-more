import { useState } from 'react'
import { Ban, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useT } from '@/i18n'
import { roomPrice, useStore } from '@/store'
import { roomOccupancyThisWeek } from '@/store/selectors'
import { Button, Card, Checkbox, DescList, Input, Modal, Select, toast } from '@/core/ui'
import { WeekCalendar, type CalendarEvent } from '@/core/data'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { addDays, startOfWeek, today } from '@/lib/dates'
import { chf, formatDate, formatDateTime, minutesToHM, toISODate } from '@/lib/format'
import { BookingPaymentBadge } from '@/shared/badges'
import { DAY, HALF, isFree } from '@/lib/room'
import type { BookingKind } from '@/store/types'

export function RoomCalendar() {
  const { t, td, tl } = useT()
  const bookings = useStore((s) => s.bookings)
  const customers = useStore((s) => s.customers)
  const prices = useStore((s) => s.prices)
  const cancel = useStore((s) => s.cancelBooking)
  const createManual = useStore((s) => s.createManualBooking)
  const blockSlot = useStore((s) => s.blockSlot)
  const [offset, setOffset] = useState(0)
  const [openId, setOpenId] = useState<string | null>(null)
  const [manual, setManual] = useState<null | { date: string; start: string }>(null)
  const [block, setBlock] = useState<null | { date: string; start: string }>(null)

  const weekStart = addDays(startOfWeek(today()), offset * 7)
  const occ = roomOccupancyThisWeek({ bookings }, weekStart)
  const wd = tl('common.weekdayShort')
  const open = bookings.find((b) => b.id === openId)

  const events: CalendarEvent[] = bookings.map((b) => ({
    id: b.id,
    date: b.date,
    start: b.start,
    end: b.end,
    title: b.kind === 'block' ? b.note || t('admin.room.legendBlocked') : b.company || b.name,
    subtitle: b.kind === 'block' ? `${b.start}–${b.end}` : `${b.start}–${b.end} · ${chf(b.amount)}`,
    tone: b.kind === 'block' ? 'blocked' : Date.now() - new Date(b.createdAt).getTime() < 15 * 60_000 ? 'new' : b.payment === 'paid' ? 'ok' : 'warn',
  }))

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title={t('admin.room.title')}
        subtitle={t('admin.room.subtitle', { from: formatDate(weekStart), to: formatDate(addDays(weekStart, 4)), pct: occ })}
        actions={
          <>
            <Button variant="secondary" icon={<Ban className="h-4 w-4" />} onClick={() => setBlock({ date: toISODate(today()), start: '12:00' })}>
              {t('admin.room.block')}
            </Button>
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => setManual({ date: toISODate(today()), start: '09:00' })}>
              {t('admin.room.manual')}
            </Button>
          </>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand-200 px-5 py-3">
          <div className="flex items-center gap-1">
            <button onClick={() => setOffset(offset - 1)} className="rounded-full p-2 hover:bg-sand-100" aria-label={t('admin.room.prev')}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setOffset(0)} className="rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-sand-100">
              {t('admin.room.today')}
            </button>
            <button onClick={() => setOffset(offset + 1)} className="rounded-full p-2 hover:bg-sand-100" aria-label={t('admin.room.next')}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-ok-bg ring-1 ring-ok/40" /> {t('admin.room.legendPaid')}</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-warn-bg ring-1 ring-warn/40" /> {t('admin.room.legendPending')}</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-sand-100 ring-1 ring-sand-300" /> {t('admin.room.legendBlocked')}</span>
          </div>
        </div>
        <WeekCalendar
          weekStart={weekStart}
          events={events}
          todayIso={toISODate(today())}
          dayLabel={(d) => (
            <span>
              {wd[(d.getDay() + 6) % 7]} <span className="tabular-nums">{d.getDate()}.{d.getMonth() + 1}.</span>
            </span>
          )}
          onEventClick={setOpenId}
          onSlotClick={(date, start) => setManual({ date, start })}
        />
      </Card>

      <Modal
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open ? (open.kind === 'block' ? t('admin.room.legendBlocked') : open.company || open.name) : ''}
        size="sm"
        closeLabel={t('common.close')}
        footer={
          open && (
            <Button
              variant="danger"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => {
                cancel(open.id)
                setOpenId(null)
              }}
            >
              {open.kind === 'block' ? t('admin.room.unblock') : t('admin.room.delete')}
            </Button>
          )
        }
      >
        {open && (
          <>
            {open.kind !== 'block' && (
              <div className="mb-3">
                <BookingPaymentBadge payment={open.payment} />
              </div>
            )}
            <DescList
              items={[
                ...(open.kind !== 'block' ? [{ label: t('admin.room.customer'), value: `${open.name}${open.email ? ` · ${open.email}` : ''}` }] : [{ label: t('admin.room.reason'), value: open.note ?? '—' }]),
                { label: t('common.date'), value: formatDate(open.date) },
                { label: t('admin.room.time'), value: `${open.start} – ${open.end} · ${td(`common.bookingKinds.${open.kind}`)}` },
                ...(open.kind !== 'block'
                  ? [
                      { label: t('admin.room.amount'), value: chf(open.amount, { cents: true }) },
                      { label: t('admin.room.method'), value: td(`common.methods.${open.method ?? 'invoice'}`) },
                      { label: t('admin.room.ref'), value: open.ref },
                    ]
                  : []),
              ]}
            />
            <p className="mt-3 text-xs text-muted">{t('admin.room.created', { date: formatDateTime(open.createdAt) })}</p>
          </>
        )}
      </Modal>

      {manual && (
        <ManualBooking
          initial={manual}
          onClose={() => setManual(null)}
          onCreate={(input) => {
            createManual(input)
            setManual(null)
            toast(t('admin.room.created_'))
          }}
          customers={customers.filter((c) => c.status !== 'inactive')}
          prices={prices}
          bookings={bookings}
        />
      )}

      <BlockModal
        initial={block}
        onClose={() => setBlock(null)}
        onBlock={(date, start, end, note) => {
          blockSlot(date, start, end, note)
          setBlock(null)
          toast(t('admin.room.blocked'))
        }}
        bookings={bookings}
      />
    </div>
  )
}

function ManualBooking({ initial, onClose, onCreate, customers, prices, bookings }: { initial: { date: string; start: string }; onClose: () => void; onCreate: (i: any) => void; customers: any[]; prices: any; bookings: any[] }) {
  const { t, td } = useT()
  const [date, setDate] = useState(initial.date)
  const [kind, setKind] = useState<Exclude<BookingKind, 'block'>>('hour')
  const [start, setStart] = useState(initial.start)
  const [hours, setHours] = useState(1)
  const [cid, setCid] = useState(customers[0]?.id ?? '')
  const [paid, setPaid] = useState(false)
  const range = kind === 'hour' ? { start, end: minutesToHM(Number(start.slice(0, 2)) * 60 + hours * 60) } : kind === 'day' ? DAY : HALF[kind]
  const free = isFree(bookings, date, range.start, range.end)
  const c = customers.find((x) => x.id === cid)
  const amount = roomPrice(prices, kind, range.start, range.end)

  return (
    <Modal
      open
      onClose={onClose}
      title={t('admin.room.manualTitle')}
      closeLabel={t('common.close')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button disabled={!free || !c} onClick={() => onCreate({ date, kind, ...range, name: `${c.firstName} ${c.lastName}`, email: c.email, company: c.company, customerId: c.id, paid })}>
            {t('common.confirm')} · {chf(amount)}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select wrapClass="sm:col-span-2" label={t('admin.room.clientSelect')} value={cid} onChange={(e) => setCid(e.target.value)} options={customers.map((x) => ({ value: x.id, label: `${x.company} — ${x.firstName} ${x.lastName}` }))} />
        <Input type="date" label={t('common.date')} value={date} onChange={(e) => setDate(e.target.value)} />
        <Select label={t('admin.room.kind')} value={kind} onChange={(e) => setKind(e.target.value as any)} options={(['hour', 'half_am', 'half_pm', 'day'] as const).map((k) => ({ value: k, label: td(`common.bookingKinds.${k}`) }))} />
        {kind === 'hour' && (
          <>
            <Select label={t('admin.room.start')} value={start} onChange={(e) => setStart(e.target.value)} options={Array.from({ length: 10 }, (_, i) => minutesToHM((8 + i) * 60)).map((h) => ({ value: h, label: h }))} />
            <Select label={t('site.room.booking.duration')} value={String(hours)} onChange={(e) => setHours(Number(e.target.value))} options={[1, 2, 3, 4].map((n) => ({ value: String(n), label: `${n} h` }))} />
          </>
        )}
      </div>
      <div className="mt-4">
        <Checkbox checked={paid} onChange={setPaid} label={t('admin.room.paid')} />
      </div>
      {!free && <p className="mt-4 rounded-xl bg-bad-bg px-4 py-3 text-sm font-medium text-bad">{t('admin.room.conflict')}</p>}
    </Modal>
  )
}

function BlockModal({ initial, onClose, onBlock, bookings }: { initial: { date: string; start: string } | null; onClose: () => void; onBlock: (d: string, s: string, e: string, n: string) => void; bookings: any[] }) {
  const { t } = useT()
  const [date, setDate] = useState(initial?.date ?? toISODate(today()))
  const [start, setStart] = useState('12:00')
  const [end, setEnd] = useState('13:00')
  const [note, setNote] = useState('')
  const free = isFree(bookings, date, start, end) && start < end
  const hours = Array.from({ length: 13 }, (_, i) => minutesToHM((7 + i) * 60))
  return (
    <Modal
      open={!!initial}
      onClose={onClose}
      title={t('admin.room.blockTitle')}
      size="sm"
      closeLabel={t('common.close')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button disabled={!free} onClick={() => onBlock(date, start, end, note || 'Maintenance')}>
            {t('admin.room.block')}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Input type="date" label={t('common.date')} value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Select label={t('admin.room.start')} value={start} onChange={(e) => setStart(e.target.value)} options={hours.map((h) => ({ value: h, label: h }))} />
          <Select label={t('admin.room.end')} value={end} onChange={(e) => setEnd(e.target.value)} options={hours.map((h) => ({ value: h, label: h }))} />
        </div>
        <Input label={t('admin.room.reason')} placeholder={t('admin.room.reasonPlaceholder')} value={note} onChange={(e) => setNote(e.target.value)} />
        {!free && <p className="rounded-xl bg-bad-bg px-4 py-3 text-sm font-medium text-bad">{t('admin.room.conflict')}</p>}
      </div>
    </Modal>
  )
}
