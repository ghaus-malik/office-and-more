import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { ButtonLink, DescList } from '@/core/ui'
import { chf } from '@/lib/format'
import { cn } from '@/lib/cn'
import { NotFound } from '@/NotFound'
import { OfficeStatusBadge, useOfficeMeta } from '../components/officeUi'

export function OfficeDetail() {
  const { id } = useParams()
  const { t, td } = useT()
  const office = useStore((s) => s.offices.find((o) => o.id === id))
  const availableOffice = useStore((s) => s.offices.find((o) => o.status === 'available'))
  const [photo, setPhoto] = useState(0)
  const metaOf = useOfficeMeta()
  if (!office) return <NotFound />
  const meta = metaOf(office)
  const n = office.images.length
  const available = office.status === 'available'

  return (
    <div className="container-site pt-8 md:pt-12">
      <Link to="/bureaux" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {t('site.offices.detail.back')}
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden bg-sand-100">
            <img key={photo} src={office.images[photo]} alt={t('site.offices.detail.photo', { n: photo + 1, total: n })} className="aspect-[4/3] w-full animate-fade-in object-cover" />
            <button onClick={() => setPhoto((photo - 1 + n) % n)} aria-label={t('common.previous')} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-paper/90 p-2.5 shadow-pop hover:bg-paper">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => setPhoto((photo + 1) % n)} aria-label={t('common.next')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-paper/90 p-2.5 shadow-pop hover:bg-paper">
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold text-paper">
              {photo + 1} / {n}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {office.images.map((src, i) => (
              <button key={src + i} onClick={() => setPhoto(i)} className={cn('overflow-hidden ring-offset-2 transition', i === photo ? 'ring-2 ring-ink' : 'opacity-70 hover:opacity-100')}>
                <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <OfficeStatusBadge status={office.status} />
          <h1 className="display mt-4 text-[48px] md:text-[64px]">{t('common.products.officeN', { n: office.number })}</h1>
          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight">
              {t('common.from')} {chf(office.rent)}
            </span>
            <p className="mt-1 text-sm text-muted">{t('site.offices.detail.perMonth')}</p>
          </div>

          <h2 className="mt-8 text-sm font-bold">{t('site.offices.detail.specs')}</h2>
          <DescList
            className="mt-2 border-y border-sand-200"
            items={[
              { label: t('site.offices.detail.size'), value: meta.size },
              { label: t('site.offices.detail.capacity'), value: meta.capacity },
              { label: t('site.offices.detail.floor'), value: meta.floor },
              { label: t('site.offices.detail.availability'), value: available ? t('site.offices.detail.availableNow') : td(`common.officeStatus.${office.status}`) },
            ]}
          />

          <h2 className="mt-8 text-sm font-bold">{t('site.offices.detail.included')}</h2>
          <ul className="mt-3 space-y-2.5">
            {office.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-[15px]">
                <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
                {td(`site.offices.features.${f}`)}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {available ? (
              <ButtonLink to={`/bureaux/${office.id}/demande`} size="lg" block iconRight={<ArrowRight className="h-4 w-4" />}>
                {t('site.offices.detail.apply')}
              </ButtonLink>
            ) : (
              <div className="rounded-2xl bg-sand-50 p-5">
                <p className="text-sm text-muted">{t('site.offices.detail.notAvailable', { status: td(`common.officeStatus.${office.status}`).toLowerCase() })}</p>
                {availableOffice && (
                  <ButtonLink to={`/bureaux/${availableOffice.id}`} variant="secondary" className="mt-4" iconRight={<ArrowRight className="h-4 w-4" />}>
                    {t('site.offices.detail.seeAvailable')}
                  </ButtonLink>
                )}
              </div>
            )}
            <p className="mt-4 text-xs text-muted">{t('site.offices.detail.terms')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
