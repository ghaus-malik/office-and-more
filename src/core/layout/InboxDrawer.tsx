import { useState } from 'react'
import { ArrowLeft, Inbox, Mail } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Drawer, EmptyState } from '@/core/ui'
import { EmailView, useEmailSubject } from '@/emails/EmailView'
import { relativeTime } from '@/lib/relative'
import { cn } from '@/lib/cn'

export function InboxDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useT()
  const emails = useStore((s) => s.emails)
  const markRead = useStore((s) => s.markEmailRead)
  const markAll = useStore((s) => s.markAllEmailsRead)
  const [selected, setSelected] = useState<string | null>(null)
  const subject = useEmailSubject()
  const current = emails.find((e) => e.id === selected)

  const close = () => {
    setSelected(null)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={close}
      zIndex="z-[75]"
      width="max-w-2xl"
      closeLabel={t('common.close')}
      title={
        current ? (
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> {t('demo.backToList')}
          </button>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5" /> {t('demo.inboxTitle')}
            </div>
            <p className="mt-0.5 text-[13px] font-normal text-muted">{t('demo.inboxSub')}</p>
          </div>
        )
      }
    >
      {current ? (
        <EmailView email={current} onAction={close} />
      ) : emails.length === 0 ? (
        <EmptyState icon={<Mail className="h-5 w-5" />} title={t('demo.inboxTitle')} text={t('demo.inboxEmpty')} />
      ) : (
        <div>
          {emails.some((e) => !e.read) && (
            <div className="flex justify-end px-6 pt-3">
              <button onClick={markAll} className="text-xs font-semibold text-muted hover:text-ink">
                {t('demo.markAllRead')}
              </button>
            </div>
          )}
          <ul className="divide-y divide-sand-200">
            {emails.map((e) => (
              <li key={e.id}>
                <button
                  onClick={() => {
                    setSelected(e.id)
                    markRead(e.id)
                  }}
                  className={cn('flex w-full items-start gap-3 px-6 py-4 text-left transition hover:bg-sand-50', !e.read && 'bg-sand-50/60')}
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: e.read ? 'transparent' : 'rgb(var(--bad))' }} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={cn('truncate text-sm', !e.read ? 'font-bold' : 'font-medium')}>{subject(e)}</span>
                      <span className="shrink-0 text-xs text-muted">{relativeTime(e.sentAt, lang)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-muted">
                      {t('emails.to')}: {e.toName} &lt;{e.to}&gt;
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Drawer>
  )
}
