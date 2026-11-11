import { useState } from 'react'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Button, Input, Select, SuccessTick, Textarea } from '@/core/ui'
import { persona } from '@/data/loadSeed'
import { isEmail } from '../components/ApplicantForm'

export function Contact() {
  const { t, td } = useT()
  const submit = useStore((s) => s.submitContact)
  const subjects = ['visit', 'office', 'room', 'domi', 'services', 'other']
  const empty = { name: '', email: '', subject: 'visit', message: '' }
  const [form, setForm] = useState(empty)
  const [sent, setSent] = useState<string | null>(null)
  const valid = form.name.trim().length > 1 && isEmail(form.email) && form.message.trim().length > 2

  return (
    <>
      <section className="container-site pb-12 pt-10 md:pt-16">
        <p className="eyebrow">{t('site.contact.eyebrow')}</p>
        <h1 className="display mt-4 max-w-3xl text-[44px] md:text-[80px]">{t('site.contact.title')}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/80">{t('site.contact.text')}</p>
      </section>
      <section className="container-site grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-sand-200 p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-start py-6">
              <SuccessTick className="h-14 w-14" />
              <h2 className="mt-5 text-2xl font-extrabold">{t('site.contact.sentTitle')}</h2>
              <p className="mt-2 text-muted">{t('site.contact.sentText', { email: sent })}</p>
              <Button
                variant="secondary"
                className="mt-6"
                onClick={() => {
                  setForm(empty)
                  setSent(null)
                }}
              >
                {t('site.contact.another')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForm({ name: `${persona.firstName} ${persona.lastName}`, email: persona.email, subject: 'visit', message: t('site.contact.subjects.visit') + ' — ' + persona.company })}
                  className="rounded-full bg-sand-100 px-3.5 py-1.5 text-[13px] font-semibold hover:bg-sand-200"
                >
                  {t('common.fillDemo')}
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label={t('common.name')} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input label={t('common.email_')} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <Select label={t('site.contact.subject')} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} options={subjects.map((s) => ({ value: s, label: td(`site.contact.subjects.${s}`) }))} />
              <Textarea label={t('common.message')} placeholder={t('site.contact.messagePlaceholder')} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <Button
                size="lg"
                disabled={!valid}
                onClick={() => {
                  submit({ name: form.name.trim(), email: form.email.trim(), subject: td(`site.contact.subjects.${form.subject}`), message: form.message.trim() })
                  setSent(form.email.trim())
                }}
              >
                {t('site.contact.send')}
              </Button>
            </div>
          )}
        </div>
        <div>
          <img src="/img/map.svg" alt={t('site.contact.mapAlt')} className="aspect-[4/3] w-full rounded-3xl border border-sand-200 object-cover" />
          <p className="mt-3 text-sm text-muted">{t('site.contact.location')}</p>
          <dl className="mt-8 space-y-5 text-[15px]">
            <div className="flex gap-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <dt className="font-bold">{t('site.contact.address')}</dt>
                <dd>
                  {t('common.street')}, {t('common.city')}
                </dd>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <dt className="font-bold">{t('site.contact.hours')}</dt>
                <dd>{t('site.contact.hoursValue')}</dd>
              </div>
            </div>
            <div className="flex gap-4">
              <Phone className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <dt className="font-bold">{t('site.contact.reach')}</dt>
                <dd>{t('common.phone')}</dd>
              </div>
            </div>
            <div className="flex gap-4">
              <Mail className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <dt className="font-bold">{t('common.email_')}</dt>
                <dd>{t('common.email')}</dd>
              </div>
            </div>
          </dl>
        </div>
      </section>
    </>
  )
}
