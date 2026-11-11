import { useState } from 'react'
import { ChevronDown, Mail, Plus, UserRound, X, Zap } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Card, Toggle, toast } from '@/core/ui'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { EmailView } from '@/emails/EmailView'
import { addDays, today } from '@/lib/dates'
import { toISODate } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { AutomationId, EmailTemplate } from '@/store/types'

const SAMPLES: Record<AutomationId, { template: EmailTemplate; toName: string; to: string; data: Record<string, any>; recipient: 'client' | 'admin' }> = {
  booking_confirmation: { template: 'booking_confirmation', toName: 'Luc Matthey', to: 'luc@neuchevents.ch', recipient: 'client', data: { ref: 'OM-7KQ2', date: toISODate(today()), start: '08:00', end: '12:00', kind: 'half_am', amount: 140, method: 'twint' } },
  mail_notification: { template: 'mail_notification', toName: 'Léa Rochat', to: 'lea@rochat-design.ch', recipient: 'client', data: { sender: 'Administration fiscale cantonale', type: 'letter', scanned: true } },
  payment_reminder: { template: 'payment_reminder', toName: 'Yves Girard', to: 'yves.girard@jura-consulting.ch', recipient: 'client', data: { number: 'OM-2026-0136', amount: 149, dueDate: toISODate(addDays(today(), -12)), level: 1 } },
  renewal_notice: { template: 'renewal_notice', toName: 'Léa Rochat', to: 'lea@rochat-design.ch', recipient: 'client', data: { product: 'domi_confort', date: toISODate(addDays(today(), 7)), price: 199 } },
  contract_expiry: { template: 'contract_expiry', toName: 'Zulfi', to: 'zulfi@officeandmore.ch', recipient: 'admin', data: { company: 'Kessler Digital GmbH', office: 4, date: toISODate(addDays(today(), 52)) } },
  welcome: { template: 'welcome', toName: 'Nicolas Robert', to: 'nicolas.robert@robert-conseil.ch', recipient: 'client', data: { pkg: 'domi_confort', price: 199 } },
}

export function Automations() {
  const { t, td } = useT()
  const automations = useStore((s) => s.automations)
  const emails = useStore((s) => s.emails)
  const toggle = useStore((s) => s.toggleAutomation)
  const setIntervals = useStore((s) => s.setReminderIntervals)
  const [open, setOpen] = useState<AutomationId | null>(null)
  const on = automations.filter((a) => a.enabled).length

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t('admin.automations.title')}
        subtitle={t('admin.automations.subtitle')}
        actions={
          <span className="inline-flex items-center gap-2 rounded-full bg-ok-bg px-3.5 py-1.5 text-sm font-semibold text-ok">
            <Zap className="h-4 w-4" /> {t('admin.automations.active', { n: on, total: automations.length })}
          </span>
        }
      />
      <div className="space-y-3">
        {automations.map((a) => {
          const sample = SAMPLES[a.id]
          const sent = emails.filter((e) => e.template === sample.template).length
          const expanded = open === a.id
          return (
            <Card key={a.id} className={cn('overflow-hidden transition', !a.enabled && 'opacity-70')}>
              <div className="flex items-start gap-4 p-5">
                <span className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', a.enabled ? 'bg-ink text-paper' : 'bg-sand-100 text-muted')}>
                  <Zap className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{td(`admin.automations.rules.${a.id}.name`)}</h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-bold', a.enabled ? 'bg-ok-bg text-ok' : 'bg-sand-100 text-muted')}>{a.enabled ? t('admin.automations.on') : t('admin.automations.off')}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{td(`admin.automations.rules.${a.id}.desc`)}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                    <span>
                      <span className="font-semibold text-ink">{t('admin.automations.trigger')}:</span> {td(`admin.automations.triggers.${a.id}`)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <UserRound className="h-3 w-3" /> {td(`admin.automations.recipients.${sample.recipient}`)}
                    </span>
                    {sent > 0 && <span className="font-semibold text-ok">{t('admin.automations.stats', { n: sent })}</span>}
                    {a.daysBefore && <span>{t('admin.automations.daysBefore', { n: a.daysBefore })}</span>}
                  </div>
                  {a.id === 'payment_reminder' && a.intervals && (
                    <div className="mt-4">
                      <div className="mb-2 text-xs font-semibold">{t('admin.automations.intervals')}</div>
                      <div className="flex flex-wrap items-center gap-2">
                        {a.intervals.map((d, i) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-sand-100 py-1 pl-3 pr-1 text-sm font-semibold">
                            <select
                              value={d}
                              onChange={(e) => setIntervals(a.intervals!.map((x, j) => (j === i ? Number(e.target.value) : x)).sort((x, y) => x - y))}
                              className="bg-transparent text-sm font-semibold focus:outline-none"
                              aria-label={t('admin.automations.intervals')}
                            >
                              {[3, 5, 7, 10, 14, 20, 30, 45].map((n) => (
                                <option key={n} value={n}>
                                  {t('admin.automations.daysAfter', { n })}
                                </option>
                              ))}
                            </select>
                            <button onClick={() => setIntervals(a.intervals!.filter((_, j) => j !== i))} disabled={a.intervals!.length <= 1} className="rounded-full p-1 hover:bg-sand-200 disabled:opacity-30" aria-label={t('common.remove')}>
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        {a.intervals.length < 3 && (
                          <button onClick={() => setIntervals([...a.intervals!, Math.max(...a.intervals!) + 10])} className="inline-flex items-center gap-1 rounded-full border border-dashed border-sand-300 px-3 py-1 text-sm font-semibold text-muted hover:border-ink hover:text-ink">
                            <Plus className="h-3.5 w-3.5" /> {t('common.add')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <button onClick={() => setOpen(expanded ? null : a.id)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                    <Mail className="h-4 w-4" /> {expanded ? t('admin.automations.hidePreview') : t('admin.automations.preview')}
                    <ChevronDown className={cn('h-4 w-4 transition', expanded && 'rotate-180')} />
                  </button>
                </div>
                <Toggle
                  checked={a.enabled}
                  label={td(`admin.automations.rules.${a.id}.name`)}
                  onChange={() => {
                    toggle(a.id)
                    toast(t('admin.automations.toggled', { name: td(`admin.automations.rules.${a.id}.name`), state: !a.enabled ? t('admin.automations.on') : t('admin.automations.off') }), 'info')
                  }}
                />
              </div>
              {expanded && (
                <div className="animate-fade-in border-t border-sand-200">
                  <EmailView preview email={{ ...sample, sentAt: new Date().toISOString() }} />
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
