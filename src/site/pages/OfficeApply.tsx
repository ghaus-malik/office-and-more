import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { ButtonLink, Card, DescList, Input, Select } from '@/core/ui'
import { SignaturePad } from '@/core/flows'
import { addMonths, today } from '@/lib/dates'
import { chf, formatDate, toISODate } from '@/lib/format'
import { FlowShell, StepNav } from '../components/FlowShell'
import { CompanyFields, PersonalFields, companyValid, demoApplicant, emptyApplicant, personalValid } from '../components/ApplicantForm'

export function OfficeApply() {
  const { id } = useParams()
  const { t, tl, td } = useT()
  const office = useStore((s) => s.offices.find((o) => o.id === id))
  const applyForOffice = useStore((s) => s.applyForOffice)
  const [step, setStep] = useState(0)
  const [a, setA] = useState(emptyApplicant)
  const firstOfNext = addMonths(new Date(today().getFullYear(), today().getMonth(), 1), 1)
  const [start, setStart] = useState(toISODate(firstOfNext))
  const [duration, setDuration] = useState(12)
  const [signature, setSignature] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  if (!office) return <Navigate to="/bureaux" replace />
  if (office.status !== 'available' && !done) return <Navigate to={`/bureaux/${office.id}`} replace />

  const steps = tl('site.offices.apply.steps')
  const fill = () => setA(demoApplicant())
  const fillBtn = (
    <button type="button" onClick={fill} className="inline-flex h-10 items-center gap-2 rounded-full bg-sand-100 px-4 text-sm font-semibold hover:bg-sand-200">
      <Sparkles className="h-4 w-4" /> {t('common.fillDemo')}
    </button>
  )

  const canNext = [personalValid(a), companyValid(a), !!start && duration > 0, !!signature][step]

  if (done) {
    return (
      <div className="container-site flex flex-col items-center py-20 text-center md:py-28">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ok text-white animate-pop">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="display mt-6 max-w-2xl text-[36px] md:text-[52px]">{t('site.offices.apply.successTitle')}</h1>
        <p className="mt-4 max-w-lg text-lg text-ink/75">{t('site.offices.apply.successText', { email: a.email })}</p>
        <ButtonLink to="/" size="lg" className="mt-8">
          {t('site.offices.apply.backHome')}
        </ButtonLink>
      </div>
    )
  }

  const aside = (
    <Card className="overflow-hidden">
      <img src={office.images[0]} alt="" className="aspect-[16/10] w-full object-cover" />
      <div className="p-5">
        <div className="text-lg font-extrabold">{t('common.products.officeN', { n: office.number })}</div>
        <DescList
          className="mt-3"
          items={[
            { label: t('site.offices.detail.size'), value: t('site.offices.size', { n: office.size }) },
            { label: t('site.offices.apply.monthly'), value: chf(office.rent) },
            { label: t('site.offices.apply.startDate'), value: formatDate(start) },
            { label: t('site.offices.apply.duration'), value: t('site.offices.apply.durationN', { n: duration }) },
          ]}
        />
      </div>
    </Card>
  )

  return (
    <FlowShell
      backTo={`/bureaux/${office.id}`}
      backLabel={t('common.back')}
      title={t('site.offices.apply.title')}
      subtitle={t('site.offices.apply.subtitle', { n: office.number, size: office.size, price: chf(office.rent) })}
      steps={steps}
      step={step}
      aside={aside}
    >
      {step === 0 && (
        <>
          <h2 className="mb-5 text-xl font-bold">{t('site.offices.apply.personalTitle')}</h2>
          <PersonalFields value={a} onChange={setA} />
        </>
      )}
      {step === 1 && (
        <>
          <h2 className="mb-5 text-xl font-bold">{t('site.offices.apply.companyTitle')}</h2>
          <CompanyFields value={a} onChange={setA} />
        </>
      )}
      {step === 2 && (
        <>
          <h2 className="mb-5 text-xl font-bold">{t('site.offices.apply.startTitle')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input type="date" label={t('site.offices.apply.startDate')} value={start} min={toISODate(today())} onChange={(e) => setStart(e.target.value)} />
            <Select
              label={t('site.offices.apply.duration')}
              value={String(duration)}
              onChange={(e) => setDuration(Number(e.target.value))}
              options={[6, 12, 24, 36].map((n) => ({ value: String(n), label: t('site.offices.apply.durationN', { n }) }))}
            />
          </div>
          <p className="mt-4 text-sm text-muted">{t('site.offices.detail.terms')}</p>
        </>
      )}
      {step === 3 && (
        <>
          <h2 className="mb-5 text-xl font-bold">{t('site.offices.apply.reviewTitle')}</h2>
          <Card className="p-5">
            <DescList
              items={[
                { label: t('common.name'), value: `${a.firstName} ${a.lastName}` },
                { label: t('common.email_'), value: a.email },
                { label: t('common.phone_'), value: a.phone },
                { label: t('common.company'), value: `${a.company} (${td(`common.legalForms.${a.legalForm}`)})` },
                { label: t('common.uid'), value: a.uid || '—' },
                { label: t('common.activity'), value: a.activity },
                { label: t('site.offices.apply.office'), value: t('common.products.officeN', { n: office.number }) },
                { label: t('site.offices.apply.startDate'), value: formatDate(start) },
                { label: t('site.offices.apply.duration'), value: t('site.offices.apply.durationN', { n: duration }) },
              ]}
            />
          </Card>
          <h3 className="mb-2 mt-8 text-[15px] font-bold">{t('site.offices.apply.signTitle')}</h3>
          <p className="mb-4 text-sm text-muted">{t('site.offices.apply.signText')}</p>
          <SignaturePad value={signature} onChange={setSignature} />
        </>
      )}
      <StepNav
        backLabel={t('common.back')}
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        extra={step < 2 ? fillBtn : undefined}
        nextLabel={step === 3 ? t('site.offices.apply.submit') : t('common.next')}
        nextDisabled={!canNext}
        onNext={() => {
          if (step < 3) return setStep(step + 1)
          applyForOffice({ applicant: a, officeId: office.id, startDate: start, duration, signature: signature ?? undefined })
          setDone(true)
          window.scrollTo(0, 0)
        }}
      />
    </FlowShell>
  )
}
