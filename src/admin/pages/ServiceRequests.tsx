import { useState } from 'react'
import { Inbox, Send } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { Badge, Button, Card, EmptyState, Input, Modal, Segmented, toast } from '@/core/ui'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { chf } from '@/lib/format'
import { relativeTime } from '@/lib/relative'
import type { ServiceRequest } from '@/store/types'

export function ServiceRequests() {
  const { t, td, lang } = useT()
  const requests = useStore((s) => s.serviceRequests)
  const reply = useStore((s) => s.replyQuote)
  const setStatus = useStore((s) => s.setServiceStatus)
  const [f, setF] = useState<'open' | 'all'>('open')
  const [quoteFor, setQuoteFor] = useState<ServiceRequest | null>(null)
  const [amount, setAmount] = useState('')
  const rows = requests.filter((r) => f === 'all' || r.status === 'new' || r.status === 'quoted' || r.status === 'accepted')
  const tone = (s: ServiceRequest['status']) => (s === 'new' ? 'info' : s === 'quoted' ? 'warn' : s === 'accepted' ? 'dark' : 'ok') as 'info' | 'warn' | 'ok' | 'dark'
  const suggest = (r: ServiceRequest) => (r.service === 'admin_assistance' ? 240 : r.service === 'phone' ? 120 : r.service === 'formation' ? 850 : 150)

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t('admin.services.title')} subtitle={t('admin.services.subtitle')} actions={<Segmented value={f} onChange={setF} options={[{ id: 'open', label: t('admin.services.filter.open') }, { id: 'all', label: t('admin.services.filter.all') }]} />} />
      <div className="space-y-3">
        {rows.length === 0 && (
          <Card>
            <EmptyState icon={<Inbox className="h-5 w-5" />} title={t('admin.services.empty')} />
          </Card>
        )}
        {rows.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{td(`common.services.${r.service}`)}</h3>
                  <Badge tone={r.kind === 'order' ? 'dark' : 'neutral'}>{r.kind === 'order' ? t('admin.services.order') : t('admin.services.quote')}</Badge>
                  <Badge tone={tone(r.status)}>{td(`common.requestStatus.${r.status}`)}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {t('admin.services.from')} <span className="font-semibold text-ink">{r.name}</span>
                  {r.company ? ` · ${r.company}` : ''} · {r.email} · {t('admin.services.received', { time: relativeTime(r.createdAt, lang) })}
                </p>
              </div>
              {r.quote && <span className="text-lg font-extrabold">{chf(r.quote)}</span>}
            </div>
            {r.message && <p className="mt-3 rounded-xl bg-sand-50 px-4 py-3 text-sm leading-relaxed">« {r.message} »</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {r.status === 'new' && (
                <Button
                  size="sm"
                  icon={<Send className="h-3.5 w-3.5" />}
                  onClick={() => {
                    setAmount(String(suggest(r)))
                    setQuoteFor(r)
                  }}
                >
                  {t('admin.services.reply')}
                </Button>
              )}
              {r.status === 'new' && r.kind === 'order' && (
                <Button size="sm" variant="secondary" onClick={() => { setStatus(r.id, 'accepted'); toast(t('admin.services.started')) }}>
                  {t('admin.services.accept')}
                </Button>
              )}
              {(r.status === 'accepted' || r.status === 'quoted') && (
                <Button size="sm" variant="secondary" onClick={() => setStatus(r.id, 'done')}>
                  {t('admin.services.done')}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
      <Modal
        open={!!quoteFor}
        onClose={() => setQuoteFor(null)}
        title={quoteFor ? t('admin.services.replyTitle', { service: td(`common.services.${quoteFor.service}`) }) : ''}
        size="sm"
        closeLabel={t('common.close')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setQuoteFor(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={!Number(amount)}
              icon={<Send className="h-4 w-4" />}
              onClick={() => {
                if (!quoteFor) return
                reply(quoteFor.id, Number(amount))
                toast(t('admin.services.sent', { name: quoteFor.name }))
                setQuoteFor(null)
              }}
            >
              {t('admin.services.send')}
            </Button>
          </>
        }
      >
        <Input label={t('admin.services.amount')} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Modal>
    </div>
  )
}
