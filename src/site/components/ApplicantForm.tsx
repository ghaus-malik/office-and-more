import { useT } from '@/i18n'
import { Input, Select } from '@/core/ui'
import type { Applicant } from '@/store/types'
import { persona } from '@/data/loadSeed'

export const emptyApplicant = (): Applicant => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  legalForm: 'sarl',
  uid: '',
  activity: '',
  address: { street: '', zip: '', city: '' },
})

export const demoApplicant = (): Applicant => ({
  firstName: persona.firstName,
  lastName: persona.lastName,
  email: persona.email,
  phone: persona.phone,
  company: persona.company,
  legalForm: persona.legalForm,
  uid: persona.uid,
  activity: persona.activity,
  address: { ...persona.address },
})

export function formatUid(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 9)
  let out = 'CHE-'
  if (!d) return v.toUpperCase().startsWith('C') ? 'CHE-' : ''
  out += d.slice(0, 3)
  if (d.length > 3) out += '.' + d.slice(3, 6)
  if (d.length > 6) out += '.' + d.slice(6, 9)
  return out
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())

export function personalValid(a: Applicant) {
  return a.firstName.trim() && a.lastName.trim() && isEmail(a.email) && a.phone.trim().length >= 6
}
export function companyValid(a: Applicant, needAddress = true) {
  return a.company.trim() && a.activity.trim() && (!needAddress || (a.address.street.trim() && a.address.zip.trim() && a.address.city.trim()))
}

export function PersonalFields({ value, onChange, hideEmail }: { value: Applicant; onChange: (a: Applicant) => void; hideEmail?: boolean }) {
  const { t } = useT()
  const set = (k: keyof Applicant, v: string) => onChange({ ...value, [k]: v })
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label={t('common.firstName')} autoComplete="given-name" value={value.firstName} onChange={(e) => set('firstName', e.target.value)} />
      <Input label={t('common.lastName')} autoComplete="family-name" value={value.lastName} onChange={(e) => set('lastName', e.target.value)} />
      {!hideEmail && <Input label={t('common.email_')} type="email" autoComplete="email" value={value.email} onChange={(e) => set('email', e.target.value)} />}
      <Input label={t('common.phone_')} type="tel" autoComplete="tel" placeholder="+41 79 000 00 00" value={value.phone} onChange={(e) => set('phone', e.target.value)} />
    </div>
  )
}

export function CompanyFields({ value, onChange, addressLabel }: { value: Applicant; onChange: (a: Applicant) => void; addressLabel?: string }) {
  const { t, td } = useT()
  const set = (k: keyof Applicant, v: string) => onChange({ ...value, [k]: v })
  const setAddr = (k: 'street' | 'zip' | 'city', v: string) => onChange({ ...value, address: { ...value.address, [k]: v } })
  const forms = ['sarl', 'sa', 'ri', 'snc', 'association', 'fondation']
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label={t('common.company')} wrapClass="sm:col-span-2" autoComplete="organization" value={value.company} onChange={(e) => set('company', e.target.value)} />
      <Select label={t('common.legalForm')} value={value.legalForm} onChange={(e) => set('legalForm', e.target.value)} options={forms.map((f) => ({ value: f, label: td(`common.legalForms.${f}`) }))} />
      <Input label={t('common.uid')} placeholder="CHE-123.456.789" hint={t('site.offices.apply.uidHint')} value={value.uid} onChange={(e) => set('uid', formatUid(e.target.value))} />
      <Input label={t('common.activity')} wrapClass="sm:col-span-2" value={value.activity} onChange={(e) => set('activity', e.target.value)} />
      {addressLabel && <p className="pt-2 text-[13px] font-semibold sm:col-span-2">{addressLabel}</p>}
      <Input label={t('common.street_')} wrapClass="sm:col-span-2" autoComplete="street-address" value={value.address.street} onChange={(e) => setAddr('street', e.target.value)} />
      <Input label={t('common.zip')} inputMode="numeric" autoComplete="postal-code" value={value.address.zip} onChange={(e) => setAddr('zip', e.target.value)} />
      <Input label={t('common.city_')} autoComplete="address-level2" value={value.address.city} onChange={(e) => setAddr('city', e.target.value)} />
    </div>
  )
}
