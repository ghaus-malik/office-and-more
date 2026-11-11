import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, MapPin } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { officesAvailable } from '@/store/selectors'
import { ButtonLink } from '@/core/ui'
import { chf, chfRange } from '@/lib/format'

export function Home() {
  const { t, tl } = useT()
  const prices = useStore((s) => s.prices)
  const available = useStore(officesAvailable)
  const domiFrom = Math.min(prices.domi_essentielle, prices.domi_confort, prices.domi_premium)

  const glance = [
    { label: t('site.home.rows.office'), price: `${t('common.from')} ${chf(prices.office)} ${t('common.perMonth')}`, to: '/bureaux' },
    { label: t('site.home.rows.domiciliation'), price: `${t('common.from')} ${chf(domiFrom)} ${t('common.perMonth')}`, to: '/domiciliation' },
    { label: t('site.home.rows.room'), price: `${t('common.from')} ${chf(prices.room_hour)} ${t('common.perHour')}`, to: '/salle-de-conference' },
    { label: t('site.home.rows.mail'), price: <>{chfRange(25, 60)} {t('common.perMonth')}<sup>1</sup></>, to: '/services' },
    { label: t('site.home.rows.phone'), price: `${chfRange(80, 150)} ${t('common.perMonth')}`, to: '/services' },
    { label: t('site.home.rows.admin'), price: `${chfRange(60, 75)} ${t('common.perHour')}`, to: '/services' },
    { label: t('site.home.rows.scanning'), price: `${t('common.from')} ${chf(0.2)} ${t('common.perPage')}`, to: '/services' },
    { label: t('site.home.rows.archive'), price: `${chfRange(30, 100)} ${t('common.perMonth')}`, to: '/services' },
  ]

  const offers = [
    { key: 'offices', img: '/img/office-3.jpg', to: '/bureaux' },
    { key: 'room', img: '/img/conference.jpg', to: '/salle-de-conference' },
    { key: 'domi', img: '/img/entrance.jpg', to: '/domiciliation' },
  ] as const

  return (
    <>
      {/* Hero */}
      <section className="container-site pb-10 pt-10 md:pb-14 md:pt-16">
        <p className="eyebrow">{t('site.home.eyebrow')}</p>
        <h1 className="display mt-4 max-w-4xl text-[52px] sm:text-[72px] md:text-[104px]">{t('site.home.heroTitle')}</h1>
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-[15px] text-ink/80">
            <MapPin className="h-4 w-4" /> {t('common.addressLine')}
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/bureaux" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
              {t('site.home.heroCtaOffices')}
            </ButtonLink>
            <ButtonLink to="/salle-de-conference" size="lg" variant="secondary">
              {t('site.home.heroCtaRoom')}
            </ButtonLink>
          </div>
        </div>
      </section>
      <div className="relative">
        <img src="/img/office.jpg" alt="" className="h-[58vh] min-h-[320px] w-full object-cover md:h-[78vh]" width={1258} height={840} />
      </div>

      {/* Intro + 6 offices */}
      <section className="container-site grid gap-12 py-20 md:grid-cols-2 md:py-28">
        <div>
          <h2 className="display text-[40px] md:text-[56px]">{t('site.home.introTitle')}</h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/80">{t('site.home.introText')}</p>
        </div>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end md:justify-end">
          <Link to="/bureaux" className="group flex aspect-square w-full max-w-[260px] flex-col justify-between bg-ink p-6 text-paper transition hover:bg-ink-soft">
            <span className="text-[120px] font-extrabold leading-[0.8] tracking-tightest">6</span>
            <span className="text-sm">{t('site.home.sixLabel')}</span>
          </Link>
          <div className="max-w-[240px]">
            <p className="text-xl leading-snug">{t('site.home.sixText')}</p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-ok-bg px-3 py-1.5 text-sm font-semibold text-ok">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
              </span>
              {available === 0
                ? t('site.home.noneAvailable')
                : t(available === 1 ? 'site.home.availableNow' : 'site.home.availableNowPlural', { n: available })}
            </p>
            <Link to="/bureaux" className="mt-4 flex items-center gap-1.5 text-sm font-semibold underline decoration-sand-300 underline-offset-4 hover:decoration-ink">
              {t('site.home.seeOffices')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Three offers */}
      <section className="container-site">
        <div className="grid gap-px overflow-hidden border-y border-sand-200 md:grid-cols-3 md:gap-8 md:border-0">
          {offers.map((o) => (
            <Link key={o.key} to={o.to} className="group flex flex-col border-b border-sand-200 py-6 last:border-0 md:border-0 md:py-0">
              <div className="overflow-hidden">
                <img src={o.img} alt="" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[22px] font-extrabold tracking-tight">{t(`site.home.offers.${o.key}.title`)}</h3>
                  <p className="mt-1.5 text-[15px] text-ink/75">{t(`site.home.offers.${o.key}.text`)}</p>
                </div>
                <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sand-300 transition group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Office price highlight */}
      <section className="container-site grid items-end gap-10 py-20 md:grid-cols-[1fr_1fr] md:py-28">
        <div>
          <h2 className="display text-[40px] md:text-[56px]">{t('site.home.officeTitle')}</h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/80">{t('site.home.officeText')}</p>
        </div>
        <div className="md:text-right">
          <div className="display text-[48px] md:text-[64px]">{t('site.home.priceFrom', { price: chf(prices.office) })}</div>
          <p className="mt-1 text-[15px]">{t('site.home.perMonthIndicative')}</p>
          <p className="mt-3 text-sm text-muted md:ml-auto md:max-w-sm">{t('site.home.officeNote')}</p>
        </div>
      </section>

      {/* L'offre en un regard */}
      <section className="bg-sand-50 py-20 md:py-28">
        <div className="container-site">
          <h2 className="display text-[40px] md:text-[56px]">{t('site.home.glanceTitle')}</h2>
          <p className="mt-5 text-lg text-ink/80">{t('site.home.glanceText')}</p>
          <ul className="mt-12 border-b border-sand-200">
            {glance.map((row) => (
              <li key={row.label}>
                <Link to={row.to} className="group flex items-center justify-between gap-4 border-t border-sand-200 py-5 transition hover:bg-paper md:px-3">
                  <span className="text-[15px] font-bold md:text-[17px]">{row.label}</span>
                  <span className="flex items-center gap-3 text-right text-[14px] tabular-nums md:text-[16px]">
                    {row.price}
                    <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted">{t('site.home.glanceFootnote')}</p>
          <p className="mt-2 max-w-3xl text-xs text-muted">{t('site.home.glanceNote')}</p>
        </div>
      </section>

      {/* Faire une pause */}
      <section className="grid md:grid-cols-[1.4fr_1fr]">
        <img src="/img/cafeteria.jpg" alt="" className="h-[420px] w-full object-cover md:h-[640px]" loading="lazy" />
        <div className="flex flex-col justify-between bg-ink p-8 text-paper md:p-14">
          <h2 className="display text-[56px] md:text-[80px]">{t('site.home.pauseTitle')}</h2>
          <p className="mt-10 max-w-[220px] text-lg leading-snug text-white/85">{t('site.home.pauseText')}</p>
        </div>
      </section>

      {/* Services */}
      <section className="container-site py-20 md:py-28">
        <h2 className="display max-w-3xl text-[40px] md:text-[56px]">{t('site.home.servicesTitle')}</h2>
        <div className="mt-8 space-y-1.5 text-lg">
          {tl('site.home.servicesLines').map((l) => (
              <p key={l}>{l}</p>
            ))}
        </div>
        <p className="mt-4 text-sm text-muted">{t('site.home.servicesNote')}</p>
        <ButtonLink to="/services" variant="secondary" className="mt-8" iconRight={<ArrowRight className="h-4 w-4" />}>
          {t('site.nav.services')}
        </ButtonLink>
      </section>

      {/* Closing CTA */}
      <section className="container-site">
        <div className="grid items-center gap-10 border-t border-sand-200 pt-20 md:grid-cols-[1fr_1.1fr] md:pt-28">
          <img src="/img/entrance.jpg" alt="" className="aspect-[4/5] w-full max-w-md object-cover" loading="lazy" />
          <div>
            <h2 className="display text-[44px] md:text-[64px]">{t('site.home.ctaTitle')}</h2>
            <p className="mt-6 text-lg font-bold">{t('common.street')}</p>
            <p className="text-lg">{t('common.city')}</p>
            <ButtonLink to="/contact" size="lg" className="mt-8" iconRight={<ArrowRight className="h-4 w-4" />}>
              {t('site.home.ctaButton')}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
