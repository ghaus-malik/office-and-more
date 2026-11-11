import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Inbox, Mail, MailCheck } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Logo } from '@/theme/Logo'
import { Button, Input } from '@/core/ui'
import { LangSwitch } from '@/core/layout/LangSwitch'
import { useUi } from '@/shared/ui'
import { isEmail } from '@/site/components/ApplicantForm'

export function Login() {
  const { t } = useT()
  const nav = useNavigate()
  const sendLink = useStore((s) => s.sendLoginLink)
  const login = useStore((s) => s.loginCustomer)
  const setInbox = useUi((s) => s.setInbox)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Logo className="h-[22px]" />
          </Link>
          <LangSwitch />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-16">
          {sent ? (
            <div className="animate-slide-up">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ok-bg text-ok">
                <MailCheck className="h-6 w-6" />
              </div>
              <h1 className="mt-6 text-3xl font-extrabold tracking-tight">{t('espace.login.sentTitle')}</h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('espace.login.sentText', { email })}</p>
              <Button size="lg" block className="mt-8" icon={<Inbox className="h-4 w-4" />} onClick={() => setInbox(true)}>
                {t('espace.login.openInbox')}
              </Button>
              <button onClick={() => setSent(false)} className="mt-4 w-full text-center text-sm font-semibold text-muted hover:text-ink">
                {t('espace.login.other')}
              </button>
            </div>
          ) : (
            <>
              <h1 className="display text-[44px]">{t('espace.login.title')}</h1>
              <p className="mt-3 text-[15px] text-muted">{t('espace.login.text')}</p>
              <form
                className="mt-8 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!isEmail(email)) return
                  setBusy(true)
                  setTimeout(() => {
                    sendLink(email)
                    setBusy(false)
                    setSent(true)
                  }, 700)
                }}
              >
                <Input label={t('espace.login.email')} type="email" autoComplete="email" leading={<Mail className="h-4 w-4" />} placeholder="nom@entreprise.ch" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button type="submit" size="lg" block disabled={!isEmail(email)} loading={busy}>
                  {t('espace.login.send')}
                </Button>
              </form>
              <button
                onClick={() => {
                  login('c_rochat')
                  nav('/espace')
                }}
                className="group mt-8 flex w-full items-center gap-3 rounded-2xl border border-dashed border-sand-300 p-3 text-left transition hover:border-ink"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-100 text-sm font-bold">LR</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{t('espace.login.demo')}</span>
                  <span className="block truncate text-xs text-muted">{t('espace.login.demoSub')}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
              </button>
              <p className="mt-10 text-sm text-muted">
                {t('espace.login.noAccount')}{' '}
                <Link to="/domiciliation" className="font-semibold text-ink underline underline-offset-4">
                  {t('espace.login.discover')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
      <div className="relative hidden lg:block">
        <img src="/img/entrance.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-12 text-paper">
          <p className="display max-w-md text-[40px]">{t('site.home.heroTitle')}</p>
          <p className="mt-3 text-sm text-white/80">{t('common.addressLine')}</p>
        </div>
      </div>
    </div>
  )
}
