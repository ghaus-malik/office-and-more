import { useEffect, useState } from 'react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { customerById, fullName } from '@/store/selectors'
import { Button, Input, Modal, SuccessTick, Textarea } from '@/core/ui'
import type { ServiceKey } from '@/store/types'
import { persona } from '@/data/loadSeed'
import { isEmail } from './ApplicantForm'

export function ServiceRequestModal({ service, kind, onClose }: { service: ServiceKey | null; kind: 'order' | 'quote'; onClose: () => void }) {
  const { t, td } = useT()
  const customer = useStore((s) => customerById(s, s.customerId))
  const requestService = useStore((s) => s.requestService)
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (service) {
      setSent(false)
      setForm({ name: customer ? fullName(customer) : '', email: customer?.email ?? '', company: customer?.company ?? '', message: '' })
    }
  }, [service, customer])

  if (!service) return null
  const name = td(`common.services.${service}`)
  const valid = form.name.trim().length > 1 && isEmail(form.email)

  return (
    <Modal
      open={!!service}
      onClose={onClose}
      closeLabel={t('common.close')}
      title={sent ? undefined : kind === 'order' ? t('site.services.form.orderTitle', { service: name }) : t('site.services.form.quoteTitle', { service: name })}
    >
      {sent ? (
        <div className="flex flex-col items-center py-6 text-center">
          <SuccessTick className="h-14 w-14" />
          <h3 className="mt-5 text-2xl font-extrabold">{t('site.services.form.successTitle')}</h3>
          <p className="mt-2 max-w-sm text-muted">{t('site.services.form.successText', { email: form.email })}</p>
          <Button className="mt-6" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {!customer && (
            <button
              type="button"
              onClick={() => setForm({ ...form, name: `${persona.firstName} ${persona.lastName}`, email: persona.email, company: persona.company })}
              className="rounded-full bg-sand-100 px-3.5 py-1.5 text-[13px] font-semibold hover:bg-sand-200"
            >
              {t('common.fillDemo')}
            </button>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t('common.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label={t('common.email_')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Input label={`${t('common.company')} (${t('common.optional')})`} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Textarea label={t('site.services.form.details')} placeholder={t('site.services.form.detailsPlaceholder')} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <Button
            size="lg"
            block
            disabled={!valid}
            onClick={() => {
              requestService({ service, kind, name: form.name.trim(), email: form.email.trim(), company: form.company.trim() || undefined, message: form.message.trim(), customerId: customer?.id })
              setSent(true)
            }}
          >
            {kind === 'order' ? t('site.services.form.submitOrder') : t('site.services.form.submitQuote')}
          </Button>
        </div>
      )}
    </Modal>
  )
}
