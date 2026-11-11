import { ArrowRight, Check, Minus } from 'lucide-react'
import type { ReactNode } from 'react'
import { useT } from '@/i18n'
import { DOMI_PACKAGES, useStore } from '@/store'
import { ButtonLink } from '@/core/ui'
import { chf } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { DomiPackage } from '@/store/types'

export function Domiciliation() {
  const { t, td } = useT()
  const prices = useStore((s) => s.prices)
  const quotas = useStore((s) => s.quotas)

  const features = (p: DomiPackage) => [0, 1, 2, 3].map((i) => td(`site.domi.packages.${p}.features.${i}`, { scans: quotas[p] }))

  const yes = <Check className="mx-auto h-4 w-4" strokeWidth={2.5} />
  const no = <Minus className="mx-auto h-4 w-4 text-sand-300" />
  const rows: { label: string; v: ReactNode[] }[] = [
    { label: t('site.domi.compare.address'), v: [yes, yes, yes] },
    { label: t('site.domi.compare.reception'), v: [yes, yes, yes] },
    { label: t('site.domi.compare.portal'), v: [yes, yes, yes] },
    { label: t('site.domi.compare.notification'), v: [no, yes, yes] },
    { label: t('site.domi.compare.scans'), v: [t('site.domi.compare.payPerUse'), String(quotas.domi_confort), String(quotas.domi_premium)] },
    { label: t('site.domi.compare.forwarding'), v: [t('site.domi.compare.onRequest'), t('site.domi.compare.onRequest'), t('site.domi.compare.onRequest')] },
    { label: t('site.domi.compare.assistance'), v: [no, no, t('site.domi.compare.limited')] },
    { label: t('site.domi.compare.priority'), v: [no, no, yes] },
  ]

  const how = ['choose', 'sign', 'pay', 'receive'] as const

  return (
    <>
      <section className="container-site pb-14 pt-10 md:pt-16">
        <p className="eyebrow">{t('site.domi.eyebrow')}</p>
        <h1 className="display mt-4 max-w-3xl text-[44px] md:text-[80px]">{t('site.domi.title')}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/80">{t('site.domi.text')}</p>
      </section>

      <section className="container-site">
        <div className="grid gap-5 lg:grid-cols-3">
          {DOMI_PACKAGES.map((p) => {
            const popular = p === 'domi_confort'
            return (
              <div key={p} className={cn('relative flex flex-col rounded-3xl p-7', popular ? 'bg-ink text-paper' : 'border border-sand-200 bg-paper')}>
                {popular && <span className="absolute right-6 top-6 rounded-full bg-paper px-3 py-1 text-xs font-bold text-ink">{t('site.domi.popular')}</span>}
                <h2 className="text-2xl font-extrabold tracking-tight">{td(`common.packages.${p}`)}</h2>
                <p className={cn('mt-2 text-[15px]', popular ? 'text-white/75' : 'text-ink/75')}>{td(`site.domi.packages.${p}.desc`)}</p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-[44px] font-extrabold leading-none tracking-tight">{chf(prices[p])}</span>
                  <span className={popular ? 'text-white/70' : 'text-muted'}>{t('site.domi.perMonth')}</span>
                </div>
                <ul className={cn('mt-6 flex-1 space-y-2.5 border-t pt-6 text-[15px]', popular ? 'border-white/15' : 'border-sand-200')}>
                  {features(p).map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} /> {f}
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  to={`/domiciliation/inscription?forfait=${p}`}
                  variant={popular ? 'inverse' : 'primary'}
                  size="lg"
                  block
                  className="mt-8"
                  iconRight={<ArrowRight className="h-4 w-4" />}
                >
                  {t('site.domi.choose', { name: td(`common.packages.${p}`) })}
                </ButtonLink>
              </div>
            )
          })}
        </div>
        <p className="mt-5 text-sm text-muted">{t('site.domi.note')}</p>
      </section>

      <section className="container-site pt-20">
        <h2 className="display text-[32px] md:text-[44px]">{t('site.domi.howTitle')}</h2>
        <ol className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-sand-200 bg-sand-200 sm:grid-cols-2 lg:grid-cols-4">
          {how.map((k, i) => (
            <li key={k} className="bg-paper p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-paper">{i + 1}</span>
              <h3 className="mt-5 text-lg font-extrabold">{t(`site.domi.how.${k}.title`)}</h3>
              <p className="mt-1 text-[15px] text-ink/75">{t(`site.domi.how.${k}.text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-site pt-20">
        <h2 className="display text-[32px] md:text-[44px]">{t('site.domi.compareTitle')}</h2>
        <div className="scroll-thin mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] text-[15px]">
            <thead>
              <tr className="border-b border-ink">
                <th className="py-4 text-left" />
                {DOMI_PACKAGES.map((p) => (
                  <th key={p} className="w-[18%] py-4 text-center">
                    <div className="font-extrabold">{td(`common.packages.${p}`)}</div>
                    <div className="text-sm font-medium text-muted">{chf(prices[p])}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="py-3.5 pr-4">{r.label}</td>
                  {r.v.map((v, i) => (
                    <td key={i} className={cn('py-3.5 text-center text-sm', i === 1 && 'bg-sand-50 font-semibold')}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
