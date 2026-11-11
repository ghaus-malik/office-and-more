import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useT } from '@/i18n'
import { Button } from '@/core/ui'
import { chf, chfRange } from '@/lib/format'
import type { ServiceKey } from '@/store/types'
import { ServiceRequestModal } from '../components/ServiceRequestModal'

export const PRICED_SERVICES: { key: ServiceKey; price: string; unit: 'month' | 'hour' | 'page'; kind: 'order' | 'quote'; postal?: boolean }[] = [
  { key: 'mail_forwarding', price: chfRange(25, 60), unit: 'month', kind: 'order', postal: true },
  { key: 'phone', price: chfRange(80, 150), unit: 'month', kind: 'order' },
  { key: 'admin_assistance', price: chfRange(60, 75), unit: 'hour', kind: 'quote' },
  { key: 'scanning', price: `__from__${chf(0.2)}`, unit: 'page', kind: 'order' },
  { key: 'locker', price: chfRange(30, 100), unit: 'month', kind: 'order' },
]
export const QUOTE_SERVICES: ServiceKey[] = ['formation', 'advice', 'documents', 'other']

export function Services() {
  const { t, td } = useT()
  const [open, setOpen] = useState<{ key: ServiceKey; kind: 'order' | 'quote' } | null>(null)

  return (
    <>
      <section className="container-site pb-14 pt-10 md:pt-16">
        <p className="eyebrow">{t('site.services.eyebrow')}</p>
        <h1 className="display mt-4 max-w-4xl text-[44px] md:text-[80px]">{t('site.services.title')}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/80">{t('site.services.text')}</p>
      </section>

      <section className="container-site">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-muted">{t('site.services.priced')}</h2>
        <ul className="mt-4 border-b border-sand-200">
          {PRICED_SERVICES.map((s) => (
            <li key={s.key} className="grid gap-4 border-t border-sand-200 py-6 md:grid-cols-[1.3fr_1fr_auto] md:items-center">
              <div>
                <h3 className="text-xl font-extrabold tracking-tight">{td(`common.services.${s.key}`)}</h3>
                <p className="mt-1 max-w-md text-[15px] text-ink/75">{td(`site.services.desc.${s.key}`)}</p>
              </div>
              <div className="text-[17px] tabular-nums md:text-right">
                <span className="font-bold">{s.price.startsWith('__from__') ? `${t('site.services.from')} ${s.price.slice(8)}` : s.price}</span>{' '}
                <span className="text-muted">{td(`site.services.units.${s.unit}`)}</span>
                {s.postal && <div className="text-xs text-muted">{t('site.services.postal')}</div>}
              </div>
              <Button variant={s.kind === 'order' ? 'primary' : 'secondary'} className="justify-self-start md:justify-self-end" onClick={() => setOpen({ key: s.key, kind: s.kind })}>
                {s.kind === 'order' ? t('site.services.order') : t('site.services.quote')}
              </Button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">{t('site.services.note')}</p>
      </section>

      <section className="container-site pt-20">
        <h2 className="display text-[32px] md:text-[44px]">{t('site.services.onRequestTitle')}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {QUOTE_SERVICES.map((k) => (
            <button key={k} onClick={() => setOpen({ key: k, kind: 'quote' })} className="group flex flex-col rounded-2xl border border-sand-200 p-6 text-left transition hover:border-ink">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">{t('site.services.onRequest')}</span>
              <span className="mt-3 text-lg font-extrabold tracking-tight">{td(`common.services.${k}`)}</span>
              <span className="mt-1 flex-1 text-[15px] text-ink/75">{td(`site.services.desc.${k}`)}</span>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                {t('site.services.quote')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </button>
          ))}
        </div>
      </section>
      <ServiceRequestModal service={open?.key ?? null} kind={open?.kind ?? 'order'} onClose={() => setOpen(null)} />
    </>
  )
}
