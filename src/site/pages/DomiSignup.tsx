import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { useT } from '@/i18n'
import { DOMI_PACKAGES, useStore } from '@/store'
import { Button, Card, Checkbox, Input, SuccessTick } from '@/core/ui'
import { CardForm, FileDrop, SignaturePad, type DroppedFile } from '@/core/flows'
import { addMonths, today } from '@/lib/dates'
import { chf, formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { DomiPackage } from '@/store/types'
import { persona } from '@/data/loadSeed'
import { FlowShell, StepNav } from '../components/FlowShell'
import { CompanyFields, PersonalFields, companyValid, demoApplicant, emptyApplicant, isEmail, personalValid } from '../components/ApplicantForm'

export function DomiSignup() {
  const { t, tl, td } = useT()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const initialPkg = (DOMI_PACKAGES as string[]).includes(params.get('forfait') ?? '') ? (params.get('forfait') as DomiPackage) : 'domi_confort'
  const prices = useStore((s) => s.prices)
  const quotas = useStore((s) => s.quotas)
  const signUp = useStore((s) => s.signUpDomiciliation)

  const [pkg, setPkg] = useState<DomiPackage>(initialPkg)
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [magic, setMagic] = useState(false)
  const [a, setA] = useState(emptyApplicant)
  const [idDoc, setIdDoc] = useState<DroppedFile | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [done, setDone] = useState(false)

  const price = prices[pkg]
  const pkgName = td(`common.packages.${pkg}`)
  const renewal = useMemo(() => formatDate(addMonths(today(), 1)), [])
  const steps = tl('site.domi.signup.steps')

  const canNext = [isEmail(email) && (magic || password.length >= 8), personalValid({ ...a, email }) && companyValid(a), !!idDoc, !!signature && accepted][step] ?? true

  const fillAll = () => {
    setEmail((e) => e || persona.email)
    setA({ ...demoApplicant(), email: email || persona.email })
  }

  if (done) {
    return (
      <div className="container-site max-w-2xl py-16 md:py-24">
        <SuccessTick className="h-16 w-16" />
        <h1 className="display mt-6 text-[40px] md:text-[56px]">{t('site.domi.signup.successTitle')}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink/75">{t('site.domi.signup.successText', { name: pkgName })}</p>
        <ul className="mt-8 space-y-3 border-y border-sand-200 py-6">
          {tl('site.domi.signup.successSteps').map((s, i, arr) => {
            const last = i === arr.length - 1
            return (
              <li key={s} className="flex items-center gap-3 text-[15px]">
                <span className={cn('flex h-6 w-6 items-center justify-center rounded-full', last ? 'bg-warn-bg text-warn' : 'bg-ok text-white')}>
                  {last ? <span className="h-2 w-2 animate-pulse rounded-full bg-warn" /> : <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className={last ? 'text-muted' : 'font-medium'}>{s}</span>
              </li>
            )
          })}
        </ul>
        <Button size="lg" className="mt-8" onClick={() => nav('/espace')} iconRight={<ArrowRight className="h-4 w-4" />}>
          {t('site.domi.signup.successCta')}
        </Button>
      </div>
    )
  }

  const aside = (
    <Card className="p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t('site.domi.signup.yourPackage')}</div>
      <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-xl bg-sand-100 p-1">
        {DOMI_PACKAGES.map((p) => (
          <button
            key={p}
            disabled={step > 3}
            onClick={() => setPkg(p)}
            className={cn('rounded-lg px-2 py-2 text-xs font-bold transition', pkg === p ? 'bg-paper shadow-card' : 'text-muted hover:text-ink')}
          >
            {td(`common.packages.${p}`)}
          </button>
        ))}
      </div>
      <div className="mt-5 flex items-baseline justify-between">
        <span className="text-lg font-extrabold">{td(`common.products.${pkg}`)}</span>
      </div>
      <p className="mt-1 text-sm text-muted">{td(`site.domi.packages.${pkg}.desc`)}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            {td(`site.domi.packages.${pkg}.features.${i}`, { scans: quotas[pkg] })}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-baseline justify-between border-t border-sand-200 pt-4">
        <span className="font-semibold">{t('common.total')}</span>
        <span>
          <span className="text-2xl font-extrabold tabular-nums">{chf(price)}</span> <span className="text-sm text-muted">{t('common.perMonth')}</span>
        </span>
      </div>
    </Card>
  )

  const contract = (
    <div className="scroll-thin max-h-[380px] overflow-y-auto rounded-2xl border border-sand-200 bg-paper p-6 text-[14px] leading-relaxed">
      <h3 className="text-lg font-extrabold">{t('site.domi.signup.contract.heading')}</h3>
      <p className="mt-3">{t('site.domi.signup.contract.between', { company: a.company || '—', name: `${a.firstName} ${a.lastName}`.trim() || '—' })}</p>
      {(['1', '2', '3', '4', '5', '6'] as const).map((n) => (
        <div key={n} className="mt-4">
          <h4 className="font-bold">{t(`site.domi.signup.contract.s${n}t`)}</h4>
          <p className="mt-1 text-ink/80">{t(`site.domi.signup.contract.s${n}`, { pkg: pkgName, price: chf(price) })}</p>
        </div>
      ))}
      <p className="mt-6 text-ink/70">{t('site.domi.signup.contract.place', { date: formatDate(today()) })}</p>
      <div className="mt-4 grid grid-cols-2 gap-6">
        <div>
          <div className="flex h-16 items-end border-b border-sand-300 pb-1 font-[cursive] text-lg italic text-ink/70">Z. — Office & More</div>
          <div className="mt-1 text-xs text-muted">Office & More</div>
        </div>
        <div>
          <div className="flex h-16 items-end border-b border-sand-300">{signature && <img src={signature} alt="" className="h-16 w-auto object-contain" />}</div>
          <div className="mt-1 text-xs text-muted">{a.company || t('common.company')}</div>
        </div>
      </div>
    </div>
  )

  return (
    <FlowShell backTo="/domiciliation" backLabel={t('common.back')} title={t('site.domi.signup.title', { name: pkgName })} steps={steps} step={step} aside={aside}>
      {step === 0 && (
        <>
          <h2 className="text-xl font-bold">{t('site.domi.signup.accountTitle')}</h2>
          <p className="mb-6 mt-1 text-sm text-muted">{t('site.domi.signup.accountText')}</p>
          <div className="max-w-md space-y-4">
            <Input label={t('common.email_')} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {!magic ? (
              <>
                <Input label={t('site.domi.signup.password')} type="password" autoComplete="new-password" hint={t('site.domi.signup.passwordHint')} value={password} onChange={(e) => setPassword(e.target.value)} />
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  <span className="h-px flex-1 bg-sand-200" /> {t('site.domi.signup.or')} <span className="h-px flex-1 bg-sand-200" />
                </div>
                <Button variant="secondary" block icon={<Mail className="h-4 w-4" />} onClick={() => setMagic(true)}>
                  {t('site.domi.signup.magic')}
                </Button>
              </>
            ) : (
              <div className="rounded-2xl bg-sand-50 p-4 text-sm">
                <p className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" /> {t('site.domi.signup.magicChosen')}
                </p>
                <button onClick={() => setMagic(false)} className="mt-3 text-[13px] font-semibold underline underline-offset-4">
                  {t('site.domi.signup.usePassword')}
                </button>
              </div>
            )}
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{t('site.domi.signup.companyTitle')}</h2>
            <button onClick={fillAll} className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-paper shadow-pop hover:bg-ink-soft">
              <Sparkles className="h-4 w-4" /> {t('common.fillDemo')}
            </button>
          </div>
          <p className="mb-3 text-[13px] font-semibold">{t('site.domi.signup.contactPerson')}</p>
          <PersonalFields value={a} onChange={setA} hideEmail />
          <div className="mt-8">
            <CompanyFields value={a} onChange={setA} addressLabel={t('site.domi.signup.privateAddress')} />
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <h2 className="text-xl font-bold">{t('site.domi.signup.idTitle')}</h2>
          <p className="mb-6 mt-1 max-w-xl text-sm text-muted">{t('site.domi.signup.idText')}</p>
          <FileDrop value={idDoc} onChange={setIdDoc} accept="image/*,application/pdf" sample={{ name: 'carte-identite-robert.jpg', size: 384_000, preview: '/img/scans/id-card.svg' }} />
          <p className="mt-4 flex items-center gap-2 text-xs text-muted">
            <ShieldCheck className="h-4 w-4" /> {t('site.domi.signup.idPrivacy')}
          </p>
        </>
      )}
      {step === 3 && (
        <>
          <h2 className="text-xl font-bold">{t('site.domi.signup.contractTitle')}</h2>
          <p className="mb-5 mt-1 text-sm text-muted">{t('site.domi.signup.contractText')}</p>
          {contract}
          <h3 className="mb-3 mt-8 text-[15px] font-bold">{t('common.signature.title')}</h3>
          <SignaturePad value={signature} onChange={setSignature} />
          <div className="mt-5">
            <Checkbox checked={accepted} onChange={setAccepted} label={t('site.domi.signup.accept')} />
          </div>
        </>
      )}
      {step === 4 && (
        <div className="max-w-md">
          <h2 className="mb-5 text-xl font-bold">{t('site.domi.signup.paymentTitle')}</h2>
          <div className="mb-6 rounded-2xl bg-sand-50 p-5">
            <div className="text-lg font-extrabold">{t('site.domi.signup.monthly', { amount: chf(price) })}</div>
            <div className="mt-1 text-sm text-muted">{t('site.domi.signup.renewal', { date: renewal })}</div>
            <div className="mt-3 flex items-baseline justify-between border-t border-sand-200 pt-3 text-sm">
              <span>{t('site.domi.signup.firstMonth')}</span>
              <span className="font-bold tabular-nums">{chf(price, { cents: true })}</span>
            </div>
          </div>
          <CardForm
            amount={price}
            defaultName={`${a.firstName} ${a.lastName}`.trim()}
            payLabel={t('site.domi.signup.payBtn', { amount: chf(price) })}
            onPaid={() => {
              signUp({ email, applicant: { ...a, email }, pkg, idDocument: idDoc ?? undefined, signature: signature ?? undefined, method: 'card' })
              setDone(true)
              window.scrollTo(0, 0)
            }}
          />
          <p className="mt-3 text-center text-xs text-muted">{t('site.domi.signup.cancelAnytime')}</p>
        </div>
      )}
      {step < 4 && (
        <StepNav
          backLabel={t('common.back')}
          onBack={step > 0 ? () => setStep(step - 1) : undefined}
          extra={
            step === 0 ? (
              <button type="button" onClick={() => { setEmail(persona.email); setMagic(true) }} className="inline-flex h-10 items-center gap-2 rounded-full bg-sand-100 px-4 text-sm font-semibold hover:bg-sand-200">
                <Sparkles className="h-4 w-4" /> {t('common.fillDemo')}
              </button>
            ) : undefined
          }
          nextLabel={t('common.next')}
          nextDisabled={!canNext}
          onNext={() => {
            setStep(step + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      )}
      {step === 4 && (
        <div className="mt-6">
          <button onClick={() => setStep(3)} className="text-sm font-semibold text-muted hover:text-ink">
            ← {t('common.back')}
          </button>
        </div>
      )}
    </FlowShell>
  )
}
