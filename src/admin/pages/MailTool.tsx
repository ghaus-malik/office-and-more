import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BellRing, Check, MapPin, Search, Send, Sparkles, X } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { domiSubscription, fullName } from '@/store/selectors'
import { Button, Card, CardHeader, EmptyState, Input, Select, Tabs, toast } from '@/core/ui'
import { DataTable } from '@/core/data'
import { FileDrop, type DroppedFile } from '@/core/flows'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { cn } from '@/lib/cn'
import { formatDate, toISODate } from '@/lib/format'
import { today } from '@/lib/dates'
import { relativeTime } from '@/lib/relative'
import { MailStatusBadge } from '@/shared/badges'
import type { DomiPackage, MailStatus, MailType } from '@/store/types'
import type { LogMailInput } from '@/store'

type Tab = 'log' | 'history' | 'forwarding' | 'clients'

export function MailTool() {
  const { t } = useT()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'log'
  const pending = useStore((s) => s.forwards.filter((f) => f.status === 'pending').length)
  const setTab = (v: Tab) => setParams(v === 'log' ? {} : { tab: v }, { replace: true })

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader title={t('admin.mail.title')} subtitle={t('admin.mail.subtitle')} />
      <Tabs
        className="mb-6"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'log', label: t('admin.mail.tabs.log') },
          { id: 'history', label: t('admin.mail.tabs.history') },
          { id: 'forwarding', label: t('admin.mail.tabs.forwarding'), count: pending },
          { id: 'clients', label: t('admin.mail.tabs.clients') },
        ]}
      />
      {tab === 'log' && <LogMail />}
      {tab === 'history' && <MailLog />}
      {tab === 'forwarding' && <Forwarding />}
      {tab === 'clients' && <DomiClients />}
    </div>
  )
}

function LogMail() {
  const { t, td, lang } = useT()
  const customers = useStore((s) => s.customers.filter((c) => c.status !== 'inactive' && c.kind !== 'room'))
  const mail = useStore((s) => s.mail)
  const logMail = useStore((s) => s.logMail)
  const allCustomers = useStore((s) => s.customers)
  const [cid, setCid] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [focus, setFocus] = useState(false)
  const [sender, setSender] = useState('')
  const [type, setType] = useState<MailType>('letter')
  const [date, setDate] = useState(toISODate(today()))
  const [scan, setScan] = useState<DroppedFile | null>(null)
  const [action, setAction] = useState<LogMailInput['action']>('scan_notify')
  const [justLogged, setJustLogged] = useState<string | null>(null)

  const client = customers.find((c) => c.id === cid)
  const matches = useMemo(() => {
    const n = q.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    return customers.filter((c) => `${c.company} ${c.firstName} ${c.lastName}`.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(n)).slice(0, 7)
  }, [q, customers])

  const reset = () => {
    setCid(null)
    setQ('')
    setSender('')
    setType('letter')
    setScan(null)
    setAction('scan_notify')
    setDate(toISODate(today()))
  }

  const fillDemo = () => {
    setCid('c_rochat')
    setSender('Registre du commerce du canton de Neuchâtel')
    setType('letter')
    setScan({ name: 'scan-registre-commerce.jpg', size: 286_000, preview: '/img/scans/letter-registry.svg' })
    setAction('scan_notify')
  }

  const submit = () => {
    if (!client) return
    const now = new Date()
    const d = new Date(date + 'T00:00:00')
    d.setHours(now.getHours(), now.getMinutes())
    logMail({ customerId: client.id, sender: sender.trim(), type, receivedAt: d.toISOString(), scan: scan?.preview, action })
    toast(t('admin.mail.logged', { name: fullName(client) }))
    setJustLogged(fullName(client))
    setTimeout(() => setJustLogged(null), 4000)
    reset()
  }

  const actions: LogMailInput['action'][] = ['notify', 'scan_notify', 'collect', 'forward']

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
      <Card className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold">{t('admin.mail.formTitle')}</h2>
          <button onClick={fillDemo} className="inline-flex h-9 items-center gap-2 rounded-full bg-sand-100 px-3.5 text-[13px] font-semibold hover:bg-sand-200">
            <Sparkles className="h-4 w-4" /> {t('common.fillDemo')}
          </button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold">{t('admin.mail.client')}</label>
            {client ? (
              <div className="flex items-center gap-3 rounded-xl border border-ink px-3.5 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper">
                  {client.firstName[0]}
                  {client.lastName[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{client.company}</div>
                  <div className="truncate text-xs text-muted">{fullName(client)}</div>
                </div>
                <button onClick={() => setCid(null)} className="rounded-full p-1.5 text-muted hover:bg-sand-100" aria-label={t('common.remove')}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onFocus={() => setFocus(true)}
                  onBlur={() => setTimeout(() => setFocus(false), 150)}
                  placeholder={t('admin.mail.clientPlaceholder')}
                  className="h-11 w-full rounded-xl border border-sand-300 pl-10 pr-4 text-[15px] focus:border-ink focus:outline-none"
                />
                {focus && (
                  <div className="absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-xl border border-sand-200 bg-paper p-1 shadow-pop">
                    {matches.map((c) => (
                      <button key={c.id} onMouseDown={() => setCid(c.id)} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-sand-100">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{c.company}</span>
                          <span className="block truncate text-xs text-muted">{fullName(c)}</span>
                        </span>
                        <span className="shrink-0 text-xs text-muted">{td(`admin.clients.kinds.${c.kind}`)}</span>
                      </button>
                    ))}
                    {matches.length === 0 && <div className="px-3 py-3 text-sm text-muted">{t('admin.nav.noResults')}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr_1fr]">
            <Input label={t('admin.mail.sender')} placeholder={t('admin.mail.senderPlaceholder')} value={sender} onChange={(e) => setSender(e.target.value)} />
            <Select label={t('admin.mail.type')} value={type} onChange={(e) => setType(e.target.value as MailType)} options={(['letter', 'registered', 'parcel'] as const).map((k) => ({ value: k, label: td(`common.mailTypes.${k}`) }))} />
            <Input type="date" label={t('admin.mail.received')} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold">{t('admin.mail.scan')}</label>
            <FileDrop compact value={scan} onChange={setScan} accept="image/*" sample={{ name: 'scan-registre-commerce.jpg', size: 286_000, preview: '/img/scans/letter-registry.svg' }} />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold">{t('admin.mail.action')}</label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {actions.map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={cn('rounded-xl border px-3 py-3 text-left text-[13px] font-semibold transition', action === a ? 'border-ink bg-ink text-paper' : 'border-sand-300 hover:border-ink')}
                >
                  {td(`admin.mail.actions.${a}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-sand-200 pt-5">
            <p className="max-w-xs text-xs text-muted">{t('admin.mail.automation')}</p>
            <Button size="lg" disabled={!client || sender.trim().length < 2} onClick={submit} icon={<BellRing className="h-4 w-4" />}>
              {t('admin.mail.notify')}
            </Button>
          </div>
          {justLogged && (
            <p className="flex items-center gap-2 rounded-xl bg-ok-bg px-4 py-3 text-sm font-semibold text-ok animate-slide-up">
              <Check className="h-4 w-4" /> {t('admin.mail.logged', { name: justLogged })}
            </p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title={t('admin.mail.recent')} />
        <ul className="mt-3 divide-y divide-sand-200">
          {mail.slice(0, 8).map((m) => {
            const c = allCustomers.find((x) => x.id === m.customerId)
            return (
              <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                {m.scan ? <img src={m.scan} alt="" className="h-11 w-9 shrink-0 rounded border border-sand-200 object-cover" /> : <span className="h-11 w-9 shrink-0 rounded bg-sand-100" />}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{c?.company}</div>
                  <div className="truncate text-xs text-muted">
                    {m.sender} · {relativeTime(m.receivedAt, lang)}
                  </div>
                </div>
                <MailStatusBadge status={m.status} />
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}

function MailLog() {
  const { t, td } = useT()
  const mail = useStore((s) => s.mail)
  const customers = useStore((s) => s.customers)
  const completeScan = useStore((s) => s.completeScan)
  const [client, setClient] = useState('')
  const [status, setStatus] = useState('')
  const rows = mail.filter((m) => (!client || m.customerId === client) && (!status || m.status === status))
  const name = (id: string) => customers.find((c) => c.id === id)?.company ?? ''
  const withMail = customers.filter((c) => mail.some((m) => m.customerId === c.id))

  return (
    <Card className="overflow-hidden">
      <DataTable
        rows={rows}
        rowKey={(m) => m.id}
        searchable
        searchText={(m) => `${m.sender} ${name(m.customerId)}`}
        searchPlaceholder={t('common.search')}
        initialSort={{ id: 'date', dir: 'desc' }}
        toolbar={
          <>
            <Select wrapClass="w-52" value={client} onChange={(e) => setClient(e.target.value)} options={[{ value: '', label: t('admin.mail.filterClient') }, ...withMail.map((c) => ({ value: c.id, label: c.company }))]} />
            <Select
              wrapClass="w-52"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[{ value: '', label: t('admin.mail.filterStatus') }, ...(['received', 'scanned', 'forwarded', 'collect', 'scan_requested', 'forward_requested'] as MailStatus[]).map((s) => ({ value: s, label: td(`common.mailStatus.${s}`) }))]}
            />
          </>
        }
        empty={<EmptyState title={t('admin.nav.noResults')} />}
        columns={[
          { id: 'date', header: t('admin.mail.date'), sortValue: (m) => m.receivedAt, cell: (m) => <span className="tabular-nums">{formatDate(new Date(m.receivedAt))}</span> },
          { id: 'client', header: t('admin.mail.client'), sortValue: (m) => name(m.customerId), cell: (m) => <span className="font-semibold">{name(m.customerId)}</span> },
          { id: 'sender', header: t('admin.mail.sender'), cell: (m) => m.sender },
          { id: 'type', header: t('admin.mail.type'), hideOnMobile: true, cell: (m) => td(`common.mailTypes.${m.type}`) },
          { id: 'status', header: t('admin.mail.status'), cell: (m) => <MailStatusBadge status={m.status} /> },
          {
            id: 'act',
            header: '',
            align: 'right',
            cell: (m) =>
              m.status === 'scan_requested' ? (
                <Button
                  size="sm"
                  onClick={() => {
                    completeScan(m.id)
                    toast(t('admin.mail.scanDone'))
                  }}
                >
                  {t('admin.mail.completeScan')}
                </Button>
              ) : null,
          },
        ]}
      />
    </Card>
  )
}

function Forwarding() {
  const { t } = useT()
  const forwards = useStore((s) => s.forwards)
  const customers = useStore((s) => s.customers)
  const mail = useStore((s) => s.mail)
  const markSent = useStore((s) => s.markForwardSent)
  const pending = forwards.filter((f) => f.status === 'pending')
  const done = forwards.filter((f) => f.status === 'sent')

  const Row = ({ f }: { f: (typeof forwards)[number] }) => {
    const c = customers.find((x) => x.id === f.customerId)
    const m = mail.find((x) => x.id === f.mailId)
    return (
      <li className={cn('flex flex-wrap items-center gap-4 px-5 py-4', f.status === 'pending' && Date.now() - new Date(f.requestedAt).getTime() < 10 * 60_000 && 'bg-info-bg/50 animate-slide-up')}>
        {m?.scan ? <img src={m.scan} alt="" className="h-12 w-10 shrink-0 rounded border border-sand-200 object-cover" /> : <span className="h-12 w-10 rounded bg-sand-100" />}
        <div className="min-w-[180px] flex-1">
          <div className="font-bold">{c?.company}</div>
          <div className="text-sm text-muted">{m?.sender}</div>
        </div>
        <div className="flex min-w-[220px] flex-1 items-start gap-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <span>
            {f.address.name}
            <br />
            <span className="text-muted">
              {f.address.street}, {f.address.zip} {f.address.city}
            </span>
          </span>
        </div>
        <div className="text-xs text-muted">{f.status === 'pending' ? t('admin.mail.requested', { date: formatDate(new Date(f.requestedAt)) }) : t('admin.mail.sent', { date: formatDate(new Date(f.sentAt!)) })}</div>
        {f.status === 'pending' ? (
          <Button
            icon={<Send className="h-4 w-4" />}
            onClick={() => {
              markSent(f.id)
              toast(t('admin.mail.markedSent'))
            }}
          >
            {t('admin.mail.markSent')}
          </Button>
        ) : (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-ok">
            <Check className="h-4 w-4" /> {t('common.mailStatus.forwarded')}
          </span>
        )}
      </li>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={`${t('admin.mail.pending')} (${pending.length})`} />
        {pending.length === 0 ? <EmptyState icon={<Send className="h-5 w-5" />} title={t('admin.mail.queueEmpty')} /> : <ul className="mt-3 divide-y divide-sand-200">{pending.map((f) => <Row key={f.id} f={f} />)}</ul>}
      </Card>
      {done.length > 0 && (
        <Card>
          <CardHeader title={t('admin.mail.done')} />
          <ul className="mt-3 divide-y divide-sand-200">{done.map((f) => <Row key={f.id} f={f} />)}</ul>
        </Card>
      )}
    </div>
  )
}

function DomiClients() {
  const { t, td } = useT()
  const state = useStore()
  const rows = state.customers
    .map((c) => ({ c, sub: domiSubscription(state, c.id) }))
    .filter((x) => x.sub && x.sub.status !== 'cancelled')
  return (
    <Card className="overflow-hidden">
      <DataTable
        rows={rows}
        rowKey={(x) => x.c.id}
        columns={[
          { id: 'client', header: t('admin.mail.client'), sortValue: (x) => x.c.company, cell: (x) => <div><div className="font-semibold">{x.c.company}</div><div className="text-xs text-muted">{fullName(x.c)}</div></div> },
          { id: 'pkg', header: t('admin.mail.package'), cell: (x) => td(`common.packages.${x.sub!.product}`) },
          {
            id: 'scans',
            header: t('admin.mail.scans'),
            sortValue: (x) => state.scansUsed[x.c.id] ?? 0,
            cell: (x) => {
              const quota = state.quotas[x.sub!.product as DomiPackage]
              const used = state.scansUsed[x.c.id] ?? 0
              return quota ? (
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-sand-200">
                    <div className={cn('h-full rounded-full', used / quota > 0.85 ? 'bg-warn' : 'bg-ink')} style={{ width: `${Math.min(100, (used / quota) * 100)}%` }} />
                  </div>
                  <span className="text-sm tabular-nums">
                    {used} / {quota}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted">{t('espace.mail.quotaNone')}</span>
              )
            },
          },
          { id: 'mail', header: t('admin.mail.tabs.history'), align: 'right', cell: (x) => state.mail.filter((m) => m.customerId === x.c.id).length },
        ]}
      />
    </Card>
  )
}
