import { useT } from '@/i18n'
import { useStore } from '@/store'
import { officesAvailable } from '@/store/selectors'
import { OfficeCard } from '../components/officeUi'

export function Offices() {
  const { t } = useT()
  const offices = useStore((s) => s.offices)
  const available = useStore(officesAvailable)
  return (
    <>
      <section className="container-site pb-12 pt-10 md:pt-16">
        <p className="eyebrow">{t('site.offices.eyebrow')}</p>
        <h1 className="display mt-4 text-[48px] md:text-[80px]">{t('site.offices.title')}</h1>
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-lg leading-relaxed text-ink/80">{t('site.offices.text')}</p>
          <p className="inline-flex items-center gap-2 self-start rounded-full bg-ok-bg px-3.5 py-1.5 text-sm font-semibold text-ok md:self-auto">
            <span className="h-2 w-2 rounded-full bg-ok" />
            {t(available === 1 ? 'site.offices.availability' : 'site.offices.availabilityPlural', { n: available })}
          </p>
        </div>
      </section>
      <section className="container-site">
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {[...offices]
            .sort((a, b) => a.number - b.number)
            .map((o) => (
              <OfficeCard key={o.id} office={o} />
            ))}
        </div>
        <div className="mt-14 border-t border-sand-200 pt-6 text-sm text-muted">
          <p>{t('site.offices.demand')}</p>
          <p className="mt-1">{t('site.offices.note')}</p>
        </div>
      </section>
    </>
  )
}
