import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ExternalLink, FileText, StickyNote } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Badge, Button, DescList, Drawer, Textarea, toast } from '@/core/ui'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { chf, formatDate, formatDateTime } from '@/lib/format'
import { daysBetween, today } from '@/lib/dates'
import { toISODate } from '@/lib/format'
import { cn } from '@/lib/cn'
import { OfficeStatusBadge } from '@/site/components/officeUi'
import { InvoiceStatusBadge } from '@/shared/badges'

export function AdminOffices() {
  const { t, td } = useT()
  const nav = useNavigate()
  const offices = useStore((s) => s.offices)
  const customers = useStore((s) => s.customers)
  const invoices = useStore((s) => s.invoices)
  const applications = useStore((s) => s.applications)
  const [openId, setOpenId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const open = offices.find((o) => o.id === openId)
  const let_ = offices.filter((o) => o.status === 'let')
  const todayIso = toISODate(today())

  const tenantOf = (id?: string) => customers.find((c) => c.id === id)
  const ending = (end?: string) => !!end && daysBetween(todayIso, end) < 90

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader title={t('admin.offices.title')} subtitle={t('admin.offices.subtitle', { let: let_.length, mrr: chf(let_.reduce((s, o) => s + o.rent, 0)) })} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...offices]
          .sort((a, b) => a.number - b.number)
          .map((o) => {
            const tenant = tenantOf(o.tenantId)
            const bar = o.status === 'let' ? 'bg-ink' : o.status === 'reserved' ? 'bg-warn' : 'bg-ok'
            return (
              <button key={o.id} onClick={() => setOpenId(o.id)} className="group overflow-hidden rounded-2xl border border-sand-200 bg-paper text-left transition hover:border-ink">
                <div className={cn('h-1.5', bar)} />
                <div className="flex gap-4 p-5">
                  <img src={o.images[0]} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-lg font-extrabold">{t('admin.offices.detail', { n: o.number })}</span>
                      <OfficeStatusBadge status={o.status} />
                    </div>
                    <div className="mt-0.5 text-xs text-muted">{t('admin.offices.specs', { size: o.size, cap: o.capacity, floor: o.floor })}</div>
                    <div className="mt-2 truncate text-sm font-semibold">{tenant ? tenant.company : <span className="text-ok">{t('admin.offices.vacant')}</span>}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 border-t border-sand-200 text-sm">
                  <div className="px-5 py-3">
                    <div className="text-xs text-muted">{t('admin.offices.rent')}</div>
                    <div className="font-bold tabular-nums">{chf(o.rent)}</div>
                  </div>
                  <div className="border-l border-sand-200 px-5 py-3">
                    <div className="text-xs text-muted">{t('admin.offices.contractEnd')}</div>
                    <div className={cn('flex items-center gap-1 font-bold tabular-nums', ending(o.contractEnd) && 'text-warn')}>
                      {o.contractEnd ? formatDate(o.contractEnd) : '—'}
                      {ending(o.contractEnd) && <AlertTriangle className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
      </div>

      <Drawer open={!!open} onClose={() => setOpenId(null)} title={open ? t('admin.offices.detail', { n: open.number }) : ''} closeLabel={t('common.close')}>
        {open && (
          <div className="space-y-6 p-6">
            <img src={open.images[0]} alt="" className="aspect-[16/9] w-full rounded-xl object-cover" />
            <div className="flex items-center gap-3">
              <OfficeStatusBadge status={open.status} />
              {ending(open.contractEnd) && <Badge tone="warn">{t('admin.offices.endingSoon')}</Badge>}
            </div>
            {(() => {
              const tenant = tenantOf(open.tenantId)
              if (open.status === 'available' || !tenant) {
                const pending = applications.filter((a) => a.officeId === open.id && a.stage !== 'active' && a.stage !== 'refused')
                return (
                  <>
                    <p className="rounded-xl bg-ok-bg px-4 py-3 text-sm text-ok">{t('admin.offices.noTenant')}</p>
                    <section>
                      <h3 className="mb-2 text-sm font-bold">{t('admin.offices.pending')}</h3>
                      {pending.length === 0 && <p className="text-sm text-muted">{t('admin.offices.noPending')}</p>}
                      {pending.map((a) => (
                        <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-sand-200 px-4 py-3">
                          <div>
                            <div className="font-semibold">{a.applicant.company}</div>
                            <div className="text-xs text-muted">{td(`admin.applications.columns.${a.stage}`)} · {formatDate(new Date(a.createdAt))}</div>
                          </div>
                          <Button size="sm" variant="secondary" onClick={() => nav('/admin/demandes')}>
                            {t('admin.offices.openApplication')}
                          </Button>
                        </div>
                      ))}
                    </section>
                  </>
                )
              }
              const pays = invoices.filter((i) => i.customerId === tenant.id).sort((a, b) => b.date.localeCompare(a.date))
              return (
                <>
                  <section>
                    <h3 className="mb-2 text-sm font-bold">{open.status === 'reserved' ? t('admin.offices.reservedFor', { company: tenant.company }) : t('admin.offices.tenant')}</h3>
                    <DescList
                      className="border-y border-sand-200"
                      items={[
                        { label: t('common.company'), value: tenant.company },
                        { label: t('common.name'), value: `${tenant.firstName} ${tenant.lastName}` },
                        { label: t('common.email_'), value: tenant.email },
                        { label: t('common.phone_'), value: tenant.phone },
                        { label: t('admin.offices.rent'), value: chf(open.rent) },
                        ...(open.contractStart ? [{ label: t('admin.offices.contractEnd'), value: `${formatDate(open.contractStart)} → ${open.contractEnd ? formatDate(open.contractEnd) : '—'}` }] : []),
                      ]}
                    />
                    <Button variant="link" className="mt-3" onClick={() => nav(`/admin/clients/${tenant.id}`)}>
                      {t('admin.clients.title')} →
                    </Button>
                  </section>
                  {open.status === 'let' && (
                    <section>
                      <h3 className="mb-2 text-sm font-bold">{t('admin.offices.contract')}</h3>
                      <a href="/docs/contrat-exemple.pdf" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-sand-200 px-4 py-3 text-sm font-semibold hover:border-ink">
                        <FileText className="h-5 w-5" /> {t('admin.offices.openContract')} <ExternalLink className="ml-auto h-4 w-4 text-muted" />
                      </a>
                    </section>
                  )}
                  <section>
                    <h3 className="mb-2 text-sm font-bold">{t('admin.offices.payments')}</h3>
                    {pays.length === 0 ? (
                      <p className="text-sm text-muted">{t('admin.offices.noPayments')}</p>
                    ) : (
                      <ul className="divide-y divide-sand-200 rounded-xl border border-sand-200">
                        {pays.map((i) => (
                          <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                            <span>
                              {i.number} · {formatDate(i.date)}
                            </span>
                            <span className="flex items-center gap-3">
                              <span className="font-semibold tabular-nums">{chf(i.amount)}</span>
                              <InvoiceStatusBadge invoice={i} />
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </>
              )
            })()}
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <StickyNote className="h-4 w-4" /> {t('admin.offices.notes')}
              </h3>
              {open.notes && <p className="mb-3 whitespace-pre-line rounded-xl bg-warn-bg/60 px-4 py-3 text-sm">{open.notes}</p>}
              <Textarea placeholder={t('admin.offices.addNote')} value={notes[open.id] ?? ''} onChange={(e) => setNotes({ ...notes, [open.id]: e.target.value })} />
              <Button size="sm" className="mt-2" disabled={!notes[open.id]?.trim()} onClick={() => { useStore.setState((s) => ({ offices: s.offices.map((o) => (o.id === open.id ? { ...o, notes: [o.notes, `${notes[open.id].trim()} (${formatDateTime(new Date().toISOString())})`].filter(Boolean).join('\n') } : o)) })); setNotes({ ...notes, [open.id]: '' }); toast(t('common.saved')) }}>
                {t('common.save')}
              </Button>
            </section>
          </div>
        )}
      </Drawer>
    </div>
  )
}
