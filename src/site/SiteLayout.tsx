import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowUpRight, Menu, UserRound, X } from 'lucide-react'
import { useT } from '@/i18n'
import { Logo } from '@/theme/Logo'
import { LangSwitch } from '@/core/layout/LangSwitch'
import { ButtonLink, Modal } from '@/core/ui'
import { cn } from '@/lib/cn'

export function SiteLayout() {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [loc.pathname])

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8)
    h()
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const links = [
    { to: '/bureaux', label: t('site.nav.offices') },
    { to: '/salle-de-conference', label: t('site.nav.room') },
    { to: '/domiciliation', label: t('site.nav.domiciliation') },
    { to: '/services', label: t('site.nav.services') },
    { to: '/contact', label: t('site.nav.contact') },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className={cn('sticky top-0 z-40 bg-paper/95 backdrop-blur transition-shadow', scrolled && 'shadow-[0_1px_0_rgb(var(--sand-200))]')}>
        <div className="container-site flex h-16 items-center gap-6 md:h-[72px]">
          <Link to="/" aria-label="Office & More" className="shrink-0">
            <Logo className="h-[22px] md:h-6" />
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn('rounded-full px-3.5 py-2 text-[14px] font-medium transition', isActive ? 'bg-sand-100 text-ink' : 'text-ink/75 hover:text-ink')
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <LangSwitch className="hidden sm:inline-flex" />
            <ButtonLink to="/espace" size="sm" className="hidden sm:inline-flex" icon={<UserRound className="h-4 w-4" />}>
              {t('site.nav.myspace')}
            </ButtonLink>
            <button onClick={() => setOpen(true)} aria-label={t('site.nav.menu')} className="-mr-2 rounded-full p-2.5 hover:bg-sand-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-paper animate-fade-in lg:hidden">
          <div className="container-site flex h-16 items-center justify-between">
            <Logo className="h-[22px]" />
            <button onClick={() => setOpen(false)} aria-label={t('common.close')} className="-mr-2 rounded-full p-2.5 hover:bg-sand-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="container-site flex flex-1 flex-col pt-6">
            {[{ to: '/', label: t('site.nav.home') }, ...links].map((l) => (
              <Link key={l.to} to={l.to} className="flex items-center justify-between border-b border-sand-200 py-4 text-2xl font-extrabold tracking-tight">
                {l.label}
                <ArrowUpRight className="h-5 w-5 text-muted" />
              </Link>
            ))}
            <div className="mt-8 flex items-center justify-between">
              <LangSwitch />
              <ButtonLink to="/espace" icon={<UserRound className="h-4 w-4" />}>
                {t('site.nav.myspace')}
              </ButtonLink>
            </div>
          </nav>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

function SiteFooter() {
  const { t } = useT()
  const [legal, setLegal] = useState<string | null>(null)
  return (
    <footer className="mt-24 bg-ink pb-28 text-paper">
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo invert className="h-6" />
          <p className="mt-4 max-w-xs text-sm text-white/60">{t('common.tagline')}</p>
          <LangSwitch dark className="mt-6" />
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">{t('site.footer.offer')}</div>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link className="hover:text-white" to="/bureaux">{t('site.nav.offices')}</Link></li>
            <li><Link className="hover:text-white" to="/salle-de-conference">{t('site.nav.room')}</Link></li>
            <li><Link className="hover:text-white" to="/domiciliation">{t('site.nav.domiciliation')}</Link></li>
            <li><Link className="hover:text-white" to="/services">{t('site.nav.services')}</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">{t('site.footer.contact')}</div>
          <address className="space-y-1 text-sm not-italic text-white/80">
            <div>{t('common.street')}</div>
            <div>{t('common.city')}</div>
            <div className="pt-2">{t('common.phone')}</div>
            <div>{t('common.email')}</div>
            <div className="pt-2 text-white/50">{t('site.footer.hours')}</div>
          </address>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Office & More</div>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link className="hover:text-white" to="/contact">{t('site.nav.contact')}</Link></li>
            <li><Link className="hover:text-white" to="/espace">{t('site.nav.myspace')}</Link></li>
            <li><button className="hover:text-white" onClick={() => setLegal(t('site.footer.legal'))}>{t('site.footer.legal')}</button></li>
            <li><button className="hover:text-white" onClick={() => setLegal(t('site.footer.privacy'))}>{t('site.footer.privacy')}</button></li>
            <li><button className="hover:text-white" onClick={() => setLegal(t('site.footer.terms'))}>{t('site.footer.terms')}</button></li>
          </ul>
        </div>
      </div>
      <div className="container-site border-t border-white/10 pt-6 text-xs leading-relaxed text-white/45">
        <p className="max-w-3xl">{t('site.footer.intent')}</p>
        <p className="mt-3">{t('site.footer.rights')}</p>
      </div>
      <Modal open={!!legal} onClose={() => setLegal(null)} title={legal} size="sm" closeLabel={t('common.close')}>
        <p className="text-[15px] leading-relaxed text-muted">{t('site.footer.legalText')}</p>
      </Modal>
    </footer>
  )
}
