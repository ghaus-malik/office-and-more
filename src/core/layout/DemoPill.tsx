import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { EyeOff, Inbox, LayoutDashboard, Globe, RotateCcw, UserRound, Sparkles } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { cn } from '@/lib/cn'
import { Button, Modal, toast } from '@/core/ui'
import { InboxDrawer } from './InboxDrawer'
import { useEmailSubject } from '@/emails/EmailView'
import { useUi } from '@/shared/ui'

/** Floating demo controls: view switcher, demo inbox, reset. Shift+D toggles visibility. */
export function DemoPill() {
  const { t } = useT()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const hidden = useStore((s) => s.pillHidden)
  const setHidden = useStore((s) => s.setPillHidden)
  const emails = useStore((s) => s.emails)
  const reset = useStore((s) => s.reset)
  const inbox = useUi((s) => s.inboxOpen)
  const setInbox = useUi((s) => s.setInbox)
  const [confirm, setConfirm] = useState(false)
  const [pulse, setPulse] = useState(false)
  const unread = emails.filter((e) => !e.read).length
  const subject = useEmailSubject()
  const seen = useRef(emails.length ? emails[0].id : '')

  useEffect(() => {
    const top = emails[0]
    if (top && top.id !== seen.current && !top.read) {
      seen.current = top.id
      setPulse(true)
      toast(t('demo.newEmail', { subject: subject(top) }), 'info')
      const x = setTimeout(() => setPulse(false), 2400)
      return () => clearTimeout(x)
    }
    seen.current = top?.id ?? ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emails])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'D' || e.key === 'd') && !(e.target as HTMLElement)?.closest('input,textarea,select')) setHidden(!useStore.getState().pillHidden)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [setHidden])

  const area = pathname.startsWith('/admin') ? 'admin' : pathname.startsWith('/espace') ? 'espace' : 'site'
  const views = [
    { id: 'site', label: t('demo.site'), icon: <Globe className="h-4 w-4" />, to: '/' },
    { id: 'espace', label: t('demo.espace'), icon: <UserRound className="h-4 w-4" />, to: '/espace' },
    { id: 'admin', label: t('demo.admin'), icon: <LayoutDashboard className="h-4 w-4" />, to: '/admin' },
  ] as const

  return (
    <>
      {hidden ? (
        <button
          onClick={() => setHidden(false)}
          className="no-print fixed bottom-4 right-4 z-[65] flex h-10 items-center gap-1.5 rounded-full bg-ink/85 px-3.5 text-xs font-bold text-paper shadow-pop backdrop-blur transition hover:bg-ink"
          aria-label={t('demo.show')}
        >
          <Sparkles className="h-3.5 w-3.5" /> {t('demo.show')}
          {unread > 0 && <span className="ml-0.5 rounded-full bg-bad px-1.5 text-[10px]">{unread}</span>}
        </button>
      ) : (
        <div className="no-print pb-safe fixed inset-x-0 bottom-3 z-[65] flex justify-center px-3">
          <div className="flex items-center gap-1 rounded-full bg-ink p-1 text-paper shadow-pop ring-1 ring-white/10">
            {views.map((v) => (
              <button
                key={v.id}
                onClick={() => nav(v.to)}
                className={cn(
                  'flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition',
                  area === v.id ? 'bg-paper text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white',
                )}
              >
                {v.icon}
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-white/20" />
            <button
              onClick={() => setInbox(true)}
              aria-label={t('demo.inbox')}
              title={t('demo.inbox')}
              className={cn('relative flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-white/85 transition hover:bg-white/10', pulse && 'bg-white/15')}
            >
              <Inbox className="h-4 w-4" />
              <span className="hidden md:inline">{t('demo.inbox')}</span>
              {unread > 0 && (
                <span className={cn('flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bad px-1 text-[10.5px] font-bold text-white', pulse && 'animate-pop')}>{unread}</span>
              )}
            </button>
            <button onClick={() => setConfirm(true)} aria-label={t('demo.reset')} title={t('demo.reset')} className="flex h-9 w-9 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white">
              <RotateCcw className="h-4 w-4" />
            </button>
            <button onClick={() => setHidden(true)} aria-label={t('demo.hide')} title={`${t('demo.hide')} (Shift+D)`} className="flex h-9 w-9 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white">
              <EyeOff className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <InboxDrawer open={inbox} onClose={() => setInbox(false)} />

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        size="sm"
        title={t('demo.resetTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => {
                reset()
                setConfirm(false)
                nav('/')
                window.scrollTo(0, 0)
                toast(t('demo.resetDone'))
              }}
              icon={<RotateCcw className="h-4 w-4" />}
            >
              {t('demo.resetConfirm')}
            </Button>
          </>
        }
      >
        <p className="text-[15px] text-muted">{t('demo.resetText')}</p>
      </Modal>
    </>
  )
}
