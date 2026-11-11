import { useEffect, useState } from 'react'
import { CreditCard, Lock, Smartphone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useT } from '@/i18n'
import { Button, Input, Modal, Spinner, SuccessTick } from '@/core/ui'
import { cn } from '@/lib/cn'
import { chf } from '@/lib/format'
import type { PaymentMethod } from '@/store/types'
import { persona } from '@/data/loadSeed'

function formatCard(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export function CardForm({ amount, onPaid, payLabel, defaultName }: { amount: number; onPaid: () => void; payLabel?: string; defaultName?: string }) {
  const { t } = useT()
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: defaultName ?? '' })
  const [busy, setBusy] = useState(false)
  const valid = card.number.replace(/\s/g, '').length >= 15 && card.expiry.length === 5 && card.cvc.length >= 3 && card.name.trim().length > 1

  const pay = () => {
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      onPaid()
    }, 1300)
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b1b1b] to-[#3a3632] p-5 text-white shadow-pop">
        <div className="flex items-center justify-between">
          <div className="h-7 w-10 rounded-md bg-gradient-to-br from-[#e9d9a8] to-[#b89b52]" />
          <CreditCard className="h-5 w-5 opacity-70" />
        </div>
        <div className="mt-6 font-mono text-lg tracking-[0.18em] tabular-nums">{card.number || '•••• •••• •••• ••••'}</div>
        <div className="mt-4 flex justify-between text-[11px] uppercase tracking-wider opacity-80">
          <span className="truncate">{card.name || t('common.payment.cardHolder')}</span>
          <span>{card.expiry || 'MM/AA'}</span>
        </div>
      </div>
      <Input label={t('common.payment.cardNumber')} inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={card.number} onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })} />
      <div className="grid grid-cols-2 gap-3">
        <Input label={t('common.payment.expiry')} inputMode="numeric" placeholder="MM/AA" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} />
        <Input label={t('common.payment.cvc')} inputMode="numeric" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
      </div>
      <Input label={t('common.payment.cardHolder')} value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
      <button type="button" onClick={() => setCard({ ...persona.card, name: defaultName || persona.card.name })} className="text-[13px] font-semibold underline decoration-sand-300 underline-offset-4 hover:decoration-ink">
        {t('common.payment.useDemoCard')}
      </button>
      <Button size="lg" block disabled={!valid} loading={busy} onClick={pay} icon={<Lock className="h-4 w-4" />}>
        {busy ? t('common.payment.processing') : payLabel ?? t('common.payment.pay', { amount: chf(amount) })}
      </Button>
      <p className="text-center text-xs text-muted">
        {t('common.payment.secure')} · {t('common.payment.demoNote')}
      </p>
    </div>
  )
}

export function TwintModal({ open, amount, onClose, onPaid }: { open: boolean; amount: number; onClose: () => void; onPaid: () => void }) {
  const { t } = useT()
  const [phase, setPhase] = useState<'waiting' | 'done'>('waiting')

  useEffect(() => {
    if (!open) return
    setPhase('waiting')
    const a = setTimeout(() => setPhase('done'), 2200)
    const b = setTimeout(() => onPaid(), 3300)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Modal open={open} onClose={onClose} size="sm" closeLabel={t('common.close')} hideClose={phase === 'done'}>
      <div className="flex flex-col items-center pt-2 text-center">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-md bg-ink px-2 py-1 text-[13px] font-black tracking-wide text-paper">TWINT</span>
          <span className="text-sm font-semibold">{t('common.payment.twintTitle')}</span>
        </div>
        <div className="text-3xl font-extrabold tracking-tight">{chf(amount, { cents: true })}</div>
        <div className="relative mt-5 rounded-2xl border border-sand-200 bg-paper p-4">
          <QRCodeSVG value={`https://pay.twint.ch/demo/officeandmore?amount=${amount}`} size={188} level="M" className={cn('transition', phase === 'done' && 'opacity-15 blur-[1px]')} />
          {phase === 'done' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <SuccessTick className="h-20 w-20" />
            </div>
          )}
        </div>
        <p className="mt-4 text-sm text-muted">{t('common.payment.twintScan')}</p>
        <div className={cn('mt-4 flex items-center gap-2 text-sm font-semibold', phase === 'done' ? 'text-ok' : 'text-ink')}>
          {phase === 'waiting' ? <Spinner className="h-4 w-4" /> : null}
          {phase === 'waiting' ? t('common.payment.twintWaiting') : t('common.payment.twintSuccess')}
        </div>
        <p className="mt-4 text-xs text-muted">{t('common.payment.demoNote')}</p>
      </div>
    </Modal>
  )
}

/** Method picker + card form or TWINT button. Calls onPaid(method) after the mocked payment. */
export function PaymentPanel({
  amount,
  onPaid,
  methods = ['card', 'twint'],
  defaultMethod = 'card',
  payLabel,
  defaultName,
}: {
  amount: number
  onPaid: (method: PaymentMethod) => void
  methods?: ('card' | 'twint')[]
  defaultMethod?: 'card' | 'twint'
  payLabel?: string
  defaultName?: string
}) {
  const { t } = useT()
  const [method, setMethod] = useState<'card' | 'twint'>(defaultMethod)
  const [twintOpen, setTwintOpen] = useState(false)

  return (
    <div>
      {methods.length > 1 && (
        <div className="mb-5 grid grid-cols-2 gap-3" role="radiogroup" aria-label={t('common.payment.method')}>
          {methods.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={method === m}
              onClick={() => setMethod(m)}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition',
                method === m ? 'border-ink ring-1 ring-ink' : 'border-sand-300 hover:border-ink',
              )}
            >
              {m === 'card' ? <CreditCard className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
              {m === 'card' ? t('common.payment.card') : t('common.payment.twint')}
              <span className={cn('ml-auto h-4 w-4 rounded-full border-2', method === m ? 'border-ink bg-ink shadow-[inset_0_0_0_2px_white]' : 'border-sand-300')} />
            </button>
          ))}
        </div>
      )}
      {method === 'card' ? (
        <CardForm amount={amount} onPaid={() => onPaid('card')} payLabel={payLabel} defaultName={defaultName} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-2xl bg-sand-50 p-5">
            <span className="rounded-md bg-ink px-2 py-1 text-[13px] font-black tracking-wide text-paper">TWINT</span>
            <p className="text-sm text-muted">{t('common.payment.twintScan')}</p>
          </div>
          <Button size="lg" block onClick={() => setTwintOpen(true)} icon={<Smartphone className="h-4 w-4" />}>
            {payLabel ?? t('common.payment.pay', { amount: chf(amount) })}
          </Button>
          <p className="text-center text-xs text-muted">{t('common.payment.demoNote')}</p>
          <TwintModal
            open={twintOpen}
            amount={amount}
            onClose={() => setTwintOpen(false)}
            onPaid={() => {
              setTwintOpen(false)
              onPaid('twint')
            }}
          />
        </div>
      )}
    </div>
  )
}
