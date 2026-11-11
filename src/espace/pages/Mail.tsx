import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, Mail, MapPin, Package, ScanLine, Send, Store, ZoomIn } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { domiSubscription } from '@/store/selectors'
import { Button, Card, Drawer, EmptyState, Modal, Segmented, toast } from '@/core/ui'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { formatDate, formatTime } from '@/lib/format'
import { cn } from '@/lib/cn'
import { MailStatusBadge } from '@/shared/badges'
import type { DomiPackage, MailItem } from '@/store/types'
import { useCustomer } from '../useCustomer'

type Filter = 'all' | 'unread' | 'scanned' | 'toHandle'

export function MailPage() {
  const { t, td } = useT()
  const c = useCustomer()
  const [params, setParams] = useSearchParams()
  const mail = useStore((s) => s.mail.filter((m) => m.customerId === c.id))
  const quotas = useStore((s) => s.quotas)
  const used = useStore((s) => s.scansUsed[c.id] ?? 0)
  const sub = useStore((s) => domiSubscription(s, c.id))
  const markRead = useStore((s) => s.markMailRead)
  const [filter, setFilter] = useState<Filter>('all')
  const selectedId = params.get('item')
  const selected = mail.find((m) => m.id === selectedId)

  useEffect(() => {
    if (selected?.unread) markRead(selected.id)
  }, [selected, markRead])

  const quota = sub ? quotas[sub.product as DomiPackage] : 0
  const pct = quota ? Math.min(100, (used / quota) * 100) : 0

  const list = useMemo(() => {
    const sorted = [...mail].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
    if (filter === 'unread') return sorted.filter((m) => m.unread)
    if (filter === 'scanned') return sorted.filter((m) => m.status === 'scanned')
    if (filter === 'toHandle') return sorted.filter((m) => m.status === 'received' || m.status === 'collect')
    return sorted
  }, [mail, filter])

  const open = (id: string | null) => {
    const p = new URLSearchParams(params)
    if (id) p.set('item', id)
    else p.delete('item')
    setParams(p, { replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t('espace.mail.title')}
        subtitle={t('espace.mail.subtitle', { company: c.company })}
        actions={
          sub && (
            <div className="w-64 rounded-2xl border border-sand-200 px-4 py-3">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted">{t('espace.mail.quota')}</span>
                <span className="font-bold tabular-nums">{quota ? t('espace.mail.quotaValue', { used, quota }) : t('espace.mail.quotaNone')}</span>
              </div>
              {quota > 0 && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-200">
                  <div className={cn('h-full rounded-full transition-[width] duration-700', pct > 85 ? 'bg-warn' : 'bg-ink')} style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          )
        }
      />

      <Segmented
        className="mb-4"
        value={filter}
        onChange={setFilter}
        options={(['all', 'unread', 'scanned', 'toHandle'] as const).map((f) => ({ id: f, label: t(`espace.mail.filters.${f}`) }))}
      />

      <Card className="overflow-hidden">
        {list.length === 0 ? (
          <EmptyState icon={<Mail className="h-5 w-5" />} title={t('espace.mail.empty')} />
        ) : (
          <>
            <div className="hidden grid-cols-[130px_1fr_130px_190px] gap-4 border-b border-sand-200 bg-sand-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted md:grid">
              <span>{t('espace.mail.received')}</span>
              <span>{t('espace.mail.sender')}</span>
              <span>{t('espace.mail.type')}</span>
              <span>{t('espace.mail.status')}</span>
            </div>
            <ul className="divide-y divide-sand-200">
              {list.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => open(m.id)}
                    className={cn('grid w-full grid-cols-[40px_1fr] items-center gap-3 px-5 py-4 text-left transition hover:bg-sand-50 md:grid-cols-[130px_1fr_130px_190px] md:gap-4', m.unread && 'bg-info-bg/40', selectedId === m.id && 'bg-sand-50')}
                  >
                    <span className="hidden text-sm tabular-nums text-muted md:block">{formatDate(new Date(m.receivedAt))}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand-100 md:hidden">{m.type === 'parcel' ? <Package className="h-4 w-4" /> : <Mail className="h-4 w-4" />}</span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        {m.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-bad" />}
                        <span className={cn('truncate text-[15px]', m.unread ? 'font-bold' : 'font-medium')}>{m.sender}</span>
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted md:hidden">
                        {formatDate(new Date(m.receivedAt))} · {td(`common.mailTypes.${m.type}`)} <MailStatusBadge status={m.status} />
                      </span>
                    </span>
                    <span className="hidden text-sm md:block">{td(`common.mailTypes.${m.type}`)}</span>
                    <span className="hidden md:block">
                      <MailStatusBadge status={m.status} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <MailDetail item={selected} onClose={() => open(null)} />
    </div>
  )
}

function MailDetail({ item, onClose }: { item?: MailItem; onClose: () => void }) {
  const { t, td } = useT()
  const c = useCustomer()
  const requestScan = useStore((s) => s.requestScan)
  const requestForwarding = useStore((s) => s.requestForwarding)
  const markForCollection = useStore((s) => s.markForCollection)
  const [zoom, setZoom] = useState(false)
  const [fwd, setFwd] = useState(false)
  const [addrId, setAddrId] = useState<string | null>(null)

  useEffect(() => {
    setFwd(false)
    setAddrId(c.forwardingAddresses[0]?.id ?? null)
  }, [item?.id, c.forwardingAddresses])

  if (!item) return null
  const showScan = !!item.scan
  const canAct = item.status !== 'forwarded' && item.status !== 'forward_requested'

  return (
    <Drawer open={!!item} onClose={onClose} title={t('espace.mail.detail')} width="max-w-2xl" closeLabel={t('common.close')}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">{item.sender}</h2>
            <p className="mt-1 text-sm text-muted">
              {td(`common.mailTypes.${item.type}`)} · {formatDate(new Date(item.receivedAt))}, {formatTime(item.receivedAt)}
              {item.pages ? ` · ${t('espace.mail.pages', { n: item.pages })}` : ''}
            </p>
          </div>
          <MailStatusBadge status={item.status} />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-sand-200 bg-sand-100">
          {showScan ? (
            <div className="group relative">
              <img src={item.scan} alt={item.sender} className="mx-auto max-h-[460px] w-auto object-contain" />
              <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => setZoom(true)} className="rounded-full bg-paper p-2 shadow-pop" aria-label={t('espace.mail.zoomIn')}>
                  <ZoomIn className="h-4 w-4" />
                </button>
                <a href={item.scan} download={`scan-${item.id}`} className="rounded-full bg-paper p-2 shadow-pop" aria-label={t('espace.mail.download')}>
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper">{item.type === 'parcel' ? <Package className="h-5 w-5" /> : <Mail className="h-5 w-5" />}</div>
              <p className="mt-3 max-w-xs text-sm text-muted">{item.status === 'scan_requested' ? t('espace.mail.pendingScan') : t('espace.mail.noScan')}</p>
            </div>
          )}
        </div>

        {item.status === 'forwarded' && <p className="mt-5 rounded-xl bg-sand-50 px-4 py-3 text-sm">{t('espace.mail.alreadyForwarded')}</p>}
        {item.status === 'forward_requested' && <p className="mt-5 rounded-xl bg-warn-bg px-4 py-3 text-sm text-warn">{t('espace.mail.pendingForward')}</p>}
        {item.status === 'collect' && (
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-warn-bg px-4 py-3 text-sm text-warn">
            <Store className="mt-0.5 h-4 w-4 shrink-0" /> {t('espace.mail.readyCollect')}
          </p>
        )}

        {canAct && !fwd && (
          <>
            <h3 className="mb-3 mt-7 text-sm font-bold">{t('espace.mail.actions')}</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              <ActionBtn
                icon={<ScanLine className="h-5 w-5" />}
                label={t('espace.mail.requestScan')}
                disabled={item.status === 'scanned' || item.status === 'scan_requested' || item.type === 'parcel'}
                onClick={() => {
                  requestScan(item.id)
                  toast(t('espace.mail.scanRequested'))
                }}
              />
              <ActionBtn icon={<Send className="h-5 w-5" />} label={t('espace.mail.requestForward')} primary onClick={() => setFwd(true)} />
              <ActionBtn
                icon={<Store className="h-5 w-5" />}
                label={t('espace.mail.collect')}
                disabled={item.status === 'collect'}
                onClick={() => {
                  markForCollection(item.id)
                  toast(t('espace.mail.collectMarked'))
                }}
              />
            </div>
          </>
        )}

        {canAct && fwd && (
          <div className="mt-7 animate-slide-up">
            <h3 className="mb-3 text-sm font-bold">{t('espace.mail.chooseAddress')}</h3>
            {c.forwardingAddresses.length === 0 ? (
              <p className="text-sm text-muted">{t('espace.mail.noAddress')}</p>
            ) : (
              <div className="space-y-2" role="radiogroup">
                {c.forwardingAddresses.map((a) => (
                  <button
                    key={a.id}
                    role="radio"
                    aria-checked={addrId === a.id}
                    onClick={() => setAddrId(a.id)}
                    className={cn('flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition', addrId === a.id ? 'border-ink ring-1 ring-ink' : 'border-sand-300 hover:border-ink')}
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="flex-1">
                      <span className="block font-semibold">{a.label}</span>
                      <span className="block text-muted">
                        {a.name}, {a.street}, {a.zip} {a.city}
                      </span>
                    </span>
                    <span className={cn('mt-0.5 h-4 w-4 rounded-full border-2', addrId === a.id ? 'border-ink bg-ink shadow-[inset_0_0_0_2px_white]' : 'border-sand-300')} />
                  </button>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-muted">{t('espace.mail.postage')}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setFwd(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                disabled={!addrId}
                icon={<Send className="h-4 w-4" />}
                onClick={() => {
                  const a = c.forwardingAddresses.find((x) => x.id === addrId)
                  if (!a) return
                  requestForwarding(item.id, a)
                  setFwd(false)
                  toast(t('espace.mail.forwardRequested'))
                }}
              >
                {t('espace.mail.confirmForward')}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal open={zoom} onClose={() => setZoom(false)} size="xl" closeLabel={t('common.close')}>
        <img src={item.scan} alt={item.sender} className="mx-auto w-full max-w-3xl" />
      </Modal>
    </Drawer>
  )
}

function ActionBtn({ icon, label, onClick, disabled, primary }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-start gap-3 rounded-2xl border p-4 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35',
        primary ? 'border-ink bg-ink text-paper hover:bg-ink-soft' : 'border-sand-300 hover:border-ink',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
