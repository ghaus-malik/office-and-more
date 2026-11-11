import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { useT } from '@/i18n'
import { DOMI_PACKAGES, useStore } from '@/store'
import { domiSubscription } from '@/store/selectors'
import { Button, Card, Modal, toast } from '@/core/ui'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { chf, formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'
import { SubStatusBadge } from '@/shared/badges'
import type { DomiPackage, ProductId, Subscription } from '@/store/types'
import { useCustomer } from '../useCustomer'

const ADDONS: ProductId[] = ['phone', 'locker', 'mail_forwarding']

export function Subscriptions() {
  const { t, td } = useT()
  const c = useCustomer()
  const subs = useStore((s) => s.subscriptions.filter((x) => x.customerId === c.id))
  const offices = useStore((s) => s.offices)
  const prices = useStore((s) => s.prices)
  const domi = useStore((s) => domiSubscription(s, c.id))
  const changePlan = useStore((s) => s.changePlan)
  const addAddon = useStore((s) => s.addAddon)
  const cancel = useStore((s) => s.cancelSubscription)
  const [changeOpen, setChangeOpen] = useState(false)
  const [target, setTarget] = useState<DomiPackage | null>(null)
  const [cancelSub, setCancelSub] = useState<Subscription | null>(null)

  const name = (s: Subscription) => (s.product === 'office' ? td('common.products.officeN', { n: offices.find((o) => o.id === s.officeId)?.number ?? '' }) : td(`common.products.${s.product}`))
  const main = domi ?? subs.find((s) => s.product === 'office' && s.status !== 'cancelled')
  const others = subs.filter((s) => s !== main)
  const hasAddon = (p: ProductId) => subs.some((s) => s.product === p && s.status !== 'cancelled')

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t('espace.subs.title')} subtitle={t('espace.subs.subtitle')} />

      {main ? (
        <Card className="overflow-hidden">
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t('espace.subs.current')}</div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-extrabold tracking-tight">{name(main)}</h2>
                <SubStatusBadge status={main.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
                <span>{t('espace.subs.since', { date: formatDate(main.startDate) })}</span>
                <span>{main.cancelAt ? t('espace.subs.endsOn', { date: formatDate(main.cancelAt) }) : t('espace.subs.renewal', { date: formatDate(main.nextRenewal) })}</span>
                <span>
                  {t('espace.subs.method')}: {td(`common.methods.${main.paymentMethod}`)}
                </span>
              </div>
            </div>
            <div className="md:text-right">
              <div className="text-[34px] font-extrabold leading-none tracking-tight">{chf(main.price)}</div>
              <div className="mt-1 text-sm text-muted">{t('common.perMonth')}</div>
            </div>
          </div>
          {main.status !== 'cancelled' && (
            <div className="flex flex-wrap gap-2 border-t border-sand-200 bg-sand-50 px-6 py-4">
              {domi && (
                <Button
                  onClick={() => {
                    setTarget(null)
                    setChangeOpen(true)
                  }}
                >
                  {t('espace.subs.change')}
                </Button>
              )}
              <Button variant="ghost" className="text-bad hover:bg-bad-bg" onClick={() => setCancelSub(main)}>
                {t('espace.subs.cancel')}
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-8 text-center text-muted">{t('espace.subs.none')}</Card>
      )}

      {others.length > 0 && (
        <Card className="mt-6">
          <h2 className="px-5 pt-5 text-[15px] font-bold">{t('espace.subs.active')}</h2>
          <ul className="mt-3 divide-y divide-sand-200">
            {others.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <span className="flex-1 font-medium">{name(s)}</span>
                <SubStatusBadge status={s.status} />
                <span className="w-28 text-right font-semibold tabular-nums">
                  {chf(s.price)} <span className="text-xs font-normal text-muted">{t('common.perMonth')}</span>
                </span>
                {s.status !== 'cancelled' && (
                  <button onClick={() => setCancelSub(s)} className="text-sm font-semibold text-muted hover:text-bad">
                    {t('espace.subs.cancel')}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <h2 className="mt-10 text-lg font-extrabold">{t('espace.subs.addons')}</h2>
      <p className="text-sm text-muted">{t('espace.subs.addonsText')}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {ADDONS.map((p) => {
          const added = hasAddon(p)
          return (
            <Card key={p} className="flex flex-col p-5">
              <div className="font-bold">{td(`common.products.${p}`)}</div>
              <div className="mt-1 flex-1 text-sm text-muted">{td(`site.services.desc.${p}`)}</div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-extrabold tabular-nums">
                  {chf((prices as any)[p])} <span className="text-xs font-normal text-muted">{t('common.perMonth')}</span>
                </span>
                <Button
                  size="sm"
                  variant={added ? 'secondary' : 'primary'}
                  disabled={added}
                  icon={added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  onClick={() => {
                    addAddon(c.id, p)
                    toast(t('espace.subs.addonAdded', { name: td(`common.products.${p}`) }))
                  }}
                >
                  {added ? t('espace.subs.added') : t('espace.subs.add')}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Change plan */}
      <Modal
        open={changeOpen}
        onClose={() => setChangeOpen(false)}
        title={t('espace.subs.changeTitle')}
        size="lg"
        closeLabel={t('common.close')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setChangeOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={!target || target === domi?.product}
              onClick={() => {
                if (!target) return
                changePlan(c.id, target)
                setChangeOpen(false)
                toast(t('espace.subs.changed', { name: td(`common.packages.${target}`) }))
              }}
            >
              {target ? t('espace.subs.confirmChange', { name: td(`common.packages.${target}`) }) : t('common.confirm')}
            </Button>
          </>
        }
      >
        {domi && (
          <>
            <p className="text-sm text-muted">{t('espace.subs.changeText', { date: formatDate(domi.nextRenewal) })}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {DOMI_PACKAGES.map((p) => {
                const current = p === domi.product
                const diff = prices[p] - domi.price
                return (
                  <button
                    key={p}
                    disabled={current}
                    onClick={() => setTarget(p)}
                    className={cn(
                      'rounded-2xl border p-4 text-left transition disabled:cursor-default',
                      target === p ? 'border-ink bg-ink text-paper' : current ? 'border-sand-200 bg-sand-50' : 'border-sand-300 hover:border-ink',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{td(`common.packages.${p}`)}</span>
                      {current && <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] font-bold text-ink ring-1 ring-sand-300">{t('espace.subs.currentTag')}</span>}
                    </div>
                    <div className="mt-3 text-2xl font-extrabold">{chf(prices[p])}</div>
                    <div className={cn('mt-1 text-sm font-semibold', target === p ? 'text-white/80' : diff > 0 ? 'text-ink' : 'text-ok')}>
                      {current ? '—' : diff > 0 ? t('espace.subs.diffUp', { amount: chf(diff) }) : t('espace.subs.diffDown', { amount: chf(-diff) })}
                    </div>
                    <div className={cn('mt-2 text-xs', target === p ? 'text-white/70' : 'text-muted')}>{td(`site.domi.packages.${p}.desc`)}</div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </Modal>

      {/* Cancel */}
      <Modal
        open={!!cancelSub}
        onClose={() => setCancelSub(null)}
        title={t('espace.subs.cancelTitle')}
        size="sm"
        closeLabel={t('common.close')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelSub(null)}>
              {t('espace.subs.cancelKeep')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (cancelSub) cancel(cancelSub.id)
                setCancelSub(null)
                toast(t('espace.subs.cancelled'))
              }}
            >
              {t('espace.subs.cancelConfirm')}
            </Button>
          </>
        }
      >
        {cancelSub && <p className="text-[15px] text-muted">{t('espace.subs.cancelText', { product: name(cancelSub), date: formatDate(cancelSub.nextRenewal) })}</p>}
      </Modal>
    </div>
  )
}
