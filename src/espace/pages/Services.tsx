import { useState } from 'react'
import { Inbox } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Badge, Button, Card, EmptyState, toast } from '@/core/ui'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { chf, formatDate } from '@/lib/format'
import type { ServiceKey } from '@/store/types'
import { PRICED_SERVICES, QUOTE_SERVICES } from '@/site/pages/Services'
import { ServiceRequestModal } from '@/site/components/ServiceRequestModal'
import { useCustomer } from '../useCustomer'

export function EspaceServices() {
  const { t, td } = useT()
  const c = useCustomer()
  const requests = useStore((s) => s.serviceRequests.filter((r) => r.customerId === c.id))
  const setStatus = useStore((s) => s.setServiceStatus)
  const [open, setOpen] = useState<{ key: ServiceKey; kind: 'order' | 'quote' } | null>(null)

  const tone = (s: string) => (s === 'new' ? 'info' : s === 'quoted' ? 'warn' : 'ok') as 'info' | 'warn' | 'ok'

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t('espace.services.title')} subtitle={t('espace.services.subtitle')} />
      <div className="grid gap-3 sm:grid-cols-2">
        {PRICED_SERVICES.map((s) => (
          <Card key={s.key} className="flex flex-col p-5">
            <div className="font-bold">{td(`common.services.${s.key}`)}</div>
            <p className="mt-1 flex-1 text-sm text-muted">{td(`site.services.desc.${s.key}`)}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold tabular-nums">
                {s.price.startsWith('__from__') ? `${t('site.services.from')} ${s.price.slice(8)}` : s.price} <span className="font-normal text-muted">{td(`site.services.units.${s.unit}`)}</span>
              </span>
              <Button size="sm" variant={s.kind === 'order' ? 'primary' : 'secondary'} onClick={() => setOpen({ key: s.key, kind: s.kind })}>
                {s.kind === 'order' ? t('site.services.order') : t('site.services.quote')}
              </Button>
            </div>
          </Card>
        ))}
        {QUOTE_SERVICES.map((k) => (
          <Card key={k} className="flex flex-col p-5">
            <div className="font-bold">{td(`common.services.${k}`)}</div>
            <p className="mt-1 flex-1 text-sm text-muted">{td(`site.services.desc.${k}`)}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted">{t('site.services.onRequest')}</span>
              <Button size="sm" variant="secondary" onClick={() => setOpen({ key: k, kind: 'quote' })}>
                {t('site.services.quote')}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-lg font-extrabold">{t('espace.services.requests')}</h2>
      <Card className="overflow-hidden">
        {requests.length === 0 ? (
          <EmptyState icon={<Inbox className="h-5 w-5" />} title={t('espace.services.noRequests')} />
        ) : (
          <ul className="divide-y divide-sand-200">
            {requests.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{td(`common.services.${r.service}`)}</div>
                  <div className="text-xs text-muted">
                    {formatDate(new Date(r.createdAt))} · {r.kind === 'order' ? t('site.services.order') : t('site.services.quote')}
                    {r.quote ? ` · ${t('espace.services.quote', { amount: chf(r.quote) })}` : ''}
                  </div>
                </div>
                <Badge tone={tone(r.status)}>{r.status === 'new' ? t('espace.services.sent') : td(`common.requestStatus.${r.status}`)}</Badge>
                {r.status === 'quoted' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setStatus(r.id, 'accepted')
                      toast(t('espace.services.accepted'))
                    }}
                  >
                    {t('espace.services.accept')}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <ServiceRequestModal service={open?.key ?? null} kind={open?.kind ?? 'order'} onClose={() => setOpen(null)} />
    </div>
  )
}
