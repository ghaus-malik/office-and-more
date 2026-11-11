import { useState } from 'react'
import { CheckCircle2, CreditCard, FileSignature, RefreshCw } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Button, Card, Tabs, toast } from '@/core/ui'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { formatDateTime } from '@/lib/format'
import type { Prices } from '@/store/types'

const ROWS: { key: keyof Prices; unit: 'month' | 'hour' | 'half' | 'day' | 'page' }[] = [
  { key: 'office', unit: 'month' },
  { key: 'room_hour', unit: 'hour' },
  { key: 'room_half', unit: 'half' },
  { key: 'room_day', unit: 'day' },
  { key: 'domi_essentielle', unit: 'month' },
  { key: 'domi_confort', unit: 'month' },
  { key: 'domi_premium', unit: 'month' },
  { key: 'phone', unit: 'month' },
  { key: 'locker', unit: 'month' },
  { key: 'mail_forwarding', unit: 'month' },
  { key: 'admin_assistance', unit: 'hour' },
  { key: 'scanning', unit: 'page' },
]

export function Settings() {
  const { t, td } = useT()
  const [tab, setTab] = useState<'prices' | 'integrations'>('prices')
  const prices = useStore((s) => s.prices)
  const setPrice = useStore((s) => s.setPrice)
  const lastSync = useStore((s) => s.lastBexioSync)
  const signed = useStore((s) => s.applications.filter((a) => a.signature).length)
  const [draft, setDraft] = useState<Record<string, string>>({})

  const label = (k: keyof Prices) => {
    const key = `common.products.${k}`
    return td(key)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t('admin.settings.title')} subtitle={t('admin.settings.subtitle')} />
      <Tabs
        className="mb-6"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'prices', label: t('admin.settings.tabs.prices') },
          { id: 'integrations', label: t('admin.settings.tabs.integrations') },
        ]}
      />
      {tab === 'prices' ? (
        <Card className="overflow-hidden">
          <p className="border-b border-sand-200 bg-sand-50 px-5 py-3 text-sm text-muted">{t('admin.settings.live')}</p>
          <ul className="divide-y divide-sand-200">
            {ROWS.map((r) => {
              const v = draft[r.key] ?? String(prices[r.key])
              const dirty = draft[r.key] !== undefined && Number(draft[r.key]) !== prices[r.key]
              const valid = v !== '' && !Number.isNaN(Number(v)) && Number(v) >= 0
              return (
                <li key={r.key} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                  <span className="min-w-[200px] flex-1 font-medium">{label(r.key)}</span>
                  <span className="w-32 text-sm text-muted">{td(`admin.settings.units.${r.unit}`)}</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">CHF</span>
                    <input
                      inputMode="decimal"
                      value={v}
                      aria-label={label(r.key)}
                      onChange={(e) => setDraft({ ...draft, [r.key]: e.target.value.replace(',', '.') })}
                      className="h-10 w-32 rounded-xl border border-sand-300 pl-12 pr-3 text-right text-sm font-semibold tabular-nums focus:border-ink focus:outline-none"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant={dirty ? 'primary' : 'ghost'}
                    disabled={!dirty || !valid}
                    onClick={() => {
                      setPrice(r.key, Number(v))
                      const { [r.key]: _, ...rest } = draft
                      void _
                      setDraft(rest)
                      toast(t('admin.settings.saved'))
                    }}
                  >
                    {t('admin.settings.save')}
                  </Button>
                </li>
              )
            })}
          </ul>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { k: 'bexio', icon: <RefreshCw className="h-5 w-5" />, extra: t('admin.settings.lastSync', { time: formatDateTime(lastSync) }) },
            { k: 'payments', icon: <CreditCard className="h-5 w-5" />, extra: 'Visa · Mastercard · TWINT' },
            { k: 'esign', icon: <FileSignature className="h-5 w-5" />, extra: `${signed} ✓` },
          ].map((x) => (
            <Card key={x.k} className="flex flex-col p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand-100">{x.icon}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-bg px-2.5 py-1 text-xs font-bold text-ok">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t('admin.settings.connected')}
                </span>
              </div>
              <h3 className="mt-4 font-bold">{td(`admin.settings.integrations.${x.k}.name`)}</h3>
              <p className="mt-1 flex-1 text-sm text-muted">{td(`admin.settings.integrations.${x.k}.desc`)}</p>
              <p className="mt-4 border-t border-sand-200 pt-3 text-xs text-muted">{x.extra}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
