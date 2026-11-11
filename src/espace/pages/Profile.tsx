import { useState } from 'react'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Button, Card, Input, Modal, Select, toast } from '@/core/ui'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { formatUid } from '@/site/components/ApplicantForm'
import { useCustomer } from '../useCustomer'

export function Profile() {
  const { t, td } = useT()
  const c = useCustomer()
  const update = useStore((s) => s.updateCustomer)
  const addAddr = useStore((s) => s.addForwardingAddress)
  const removeAddr = useStore((s) => s.removeForwardingAddress)
  const [form, setForm] = useState({
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
    company: c.company,
    legalForm: c.legalForm,
    uid: c.uid ?? '',
    activity: c.activity ?? '',
  })
  const [billing, setBilling] = useState(c.billingAddress ?? c.address)
  const [adding, setAdding] = useState(false)
  const [na, setNa] = useState({ label: '', name: `${c.firstName} ${c.lastName}`, street: '', zip: '', city: '' })

  const save = () => {
    update(c.id, { ...form, billingAddress: billing })
    toast(t('common.saved'))
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t('espace.profile.title')} subtitle={t('espace.profile.subtitle')} actions={<Button onClick={save}>{t('common.save')}</Button>} />

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-5 text-[15px] font-bold">{t('espace.profile.contact')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t('common.firstName')} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input label={t('common.lastName')} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            <Input label={t('common.email_')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label={t('common.phone_')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 text-[15px] font-bold">{t('espace.profile.company')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t('common.company')} wrapClass="sm:col-span-2" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <Select
              label={t('common.legalForm')}
              value={form.legalForm}
              onChange={(e) => setForm({ ...form, legalForm: e.target.value })}
              options={['sarl', 'sa', 'ri', 'snc', 'association', 'fondation'].map((f) => ({ value: f, label: td(`common.legalForms.${f}`) }))}
            />
            <Input label={t('common.uid')} value={form.uid} onChange={(e) => setForm({ ...form, uid: formatUid(e.target.value) })} />
            <Input label={t('common.activity')} wrapClass="sm:col-span-2" value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} />
          </div>
          <div className="mt-6 rounded-2xl bg-sand-50 p-4 text-sm">
            <div className="font-semibold">{t('espace.profile.domicile')}</div>
            <div className="mt-1">
              {c.address.street}, {c.address.zip} {c.address.city}
            </div>
            <div className="mt-1 text-xs text-muted">{t('espace.profile.domicileText')}</div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 text-[15px] font-bold">{t('espace.profile.billing')}</h2>
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1.4fr]">
            <Input label={t('common.street_')} value={billing.street} onChange={(e) => setBilling({ ...billing, street: e.target.value })} />
            <Input label={t('common.zip')} value={billing.zip} onChange={(e) => setBilling({ ...billing, zip: e.target.value })} />
            <Input label={t('common.city_')} value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-bold">{t('espace.profile.forwarding')}</h2>
            <Button size="sm" variant="secondary" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setAdding(true)}>
              {t('espace.profile.addAddress')}
            </Button>
          </div>
          {c.forwardingAddresses.length === 0 && <p className="text-sm text-muted">{t('espace.profile.noAddress')}</p>}
          <ul className="space-y-2">
            {c.forwardingAddresses.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-xl border border-sand-200 px-4 py-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                <div className="flex-1">
                  <div className="font-semibold">{a.label}</div>
                  <div className="text-muted">
                    {a.name}, {a.street}, {a.zip} {a.city}
                  </div>
                </div>
                <button onClick={() => removeAddr(c.id, a.id)} className="rounded-full p-1.5 text-muted hover:bg-bad-bg hover:text-bad" aria-label={t('common.remove')}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title={t('espace.profile.addAddress')}
        closeLabel={t('common.close')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdding(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={!na.label || !na.street || !na.zip || !na.city}
              onClick={() => {
                addAddr(c.id, na)
                setAdding(false)
                setNa({ label: '', name: `${c.firstName} ${c.lastName}`, street: '', zip: '', city: '' })
                toast(t('common.saved'))
              }}
            >
              {t('common.add')}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('espace.profile.label')} placeholder={t('espace.profile.labelPlaceholder')} value={na.label} onChange={(e) => setNa({ ...na, label: e.target.value })} />
          <Input label={t('espace.profile.recipient')} value={na.name} onChange={(e) => setNa({ ...na, name: e.target.value })} />
          <Input label={t('common.street_')} wrapClass="sm:col-span-2" value={na.street} onChange={(e) => setNa({ ...na, street: e.target.value })} />
          <Input label={t('common.zip')} value={na.zip} onChange={(e) => setNa({ ...na, zip: e.target.value })} />
          <Input label={t('common.city_')} value={na.city} onChange={(e) => setNa({ ...na, city: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}
