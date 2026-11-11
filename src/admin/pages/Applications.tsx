import { useState } from 'react'
import { BadgeCheck, Building2, CheckCircle2, Clock, FileSignature, FileText, Mailbox, TrendingUp, X } from 'lucide-react'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { mrr } from '@/store/selectors'
import { Badge, Button, DescList, Drawer, Select, toast } from '@/core/ui'
import { Kanban } from '@/core/data'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { chf, formatDate, formatDateTime } from '@/lib/format'
import { relativeTime } from '@/lib/relative'
import { useUi } from '@/shared/ui'
import type { Application, ApplicationStage } from '@/store/types'

const COLS: Exclude<ApplicationStage, 'refused'>[] = ['new', 'review', 'contract', 'signed', 'active']

export function Applications() {
  const { t, td, lang } = useT()
  const apps = useStore((s) => s.applications)
  const offices = useStore((s) => s.offices)
  const prices = useStore((s) => s.prices)
  const total = useStore(mrr)
  const move = useStore((s) => s.moveApplication)
  const approve = useStore((s) => s.approveApplication)
  const refuse = useStore((s) => s.refuseApplication)
  const bumpMrr = useUi((s) => s.bumpMrr)
  const [openId, setOpenId] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [mrrFlash, setMrrFlash] = useState<number | null>(null)
  const open = apps.find((a) => a.id === openId)

  const product = (a: Application) => (a.kind === 'office' ? t('admin.applications.office', { n: offices.find((o) => o.id === a.officeId)?.number ?? '' }) : td(`common.products.${a.pkg}`))
  const price = (a: Application) => (a.kind === 'office' ? (offices.find((o) => o.id === a.officeId)?.rent ?? prices.office) : prices[a.pkg ?? 'domi_confort'])

  const doApprove = (a: Application) => {
    const before = mrr(useStore.getState())
    approve(a.id)
    const diff = mrr(useStore.getState()) - before
    if (diff > 0) {
      bumpMrr(diff)
      setMrrFlash(diff)
      setTimeout(() => setMrrFlash(null), 5000)
    }
    setFlash(a.id)
    setTimeout(() => setFlash(null), 3000)
    setOpenId(null)
    toast(t('admin.applications.approved', { company: a.applicant.company }))
  }

  const visible = apps.filter((a) => a.stage !== 'refused')
  const refusedCount = apps.length - visible.length

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title={t('admin.applications.title')}
        subtitle={t('admin.applications.subtitle')}
        actions={
          <div className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 transition-all duration-500 ${mrrFlash ? 'border-ok bg-ok-bg ring-4 ring-ok/15' : 'border-sand-200'}`}>
            <TrendingUp className={`h-4 w-4 ${mrrFlash ? 'text-ok' : 'text-muted'}`} />
            <div>
              <div className="text-xs text-muted">{t('admin.overview.mrr')}</div>
              <div className={`text-lg font-extrabold tabular-nums ${mrrFlash ? 'text-ok' : ''}`}>
                {chf(total)} {mrrFlash ? <span className="ml-1 text-sm">+{chf(mrrFlash)}</span> : null}
              </div>
            </div>
          </div>
        }
      />
      <p className="mb-4 text-sm text-muted">
        {t('admin.applications.dragHint')}
        {refusedCount > 0 && ` · ${t('admin.applications.refusedCount', { n: refusedCount })}`}
      </p>
      <Kanban
        columns={COLS.map((c) => ({
          id: c,
          title: td(`admin.applications.columns.${c}`),
          accent: c === 'new' ? 'bg-info' : c === 'active' ? 'bg-ok' : c === 'signed' ? 'bg-ink' : 'bg-warn',
        }))}
        items={visible}
        columnOf={(a) => a.stage as Exclude<ApplicationStage, 'refused'>}
        highlightId={flash ?? undefined}
        onMove={(id, to) => {
          const a = apps.find((x) => x.id === id)
          if (!a || a.stage === to) return
          if (to === 'active') doApprove(a)
          else move(id, to)
        }}
        onOpen={(a) => setOpenId(a.id)}
        renderCard={(a) => (
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{a.applicant.company}</div>
                <div className="truncate text-xs text-muted">
                  {a.applicant.firstName} {a.applicant.lastName}
                </div>
              </div>
              {a.stage === 'new' && Date.now() - new Date(a.createdAt).getTime() < 3 * 864e5 && <Badge tone="info">{t('admin.applications.newBadge')}</Badge>}
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
              {a.kind === 'office' ? <Building2 className="h-3.5 w-3.5" /> : <Mailbox className="h-3.5 w-3.5" />}
              {product(a)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {relativeTime(a.createdAt, lang)}
              </span>
              <span className="font-semibold text-ink">{t('admin.applications.monthly', { price: chf(price(a)) })}</span>
            </div>
            <div className="mt-2.5 flex gap-1.5">
              {a.idDocument && <span title={t('admin.applications.idDoc')} className="rounded-md bg-sand-100 p-1"><FileText className="h-3 w-3" /></span>}
              {a.signature && <span title={t('admin.applications.contract')} className="rounded-md bg-sand-100 p-1"><FileSignature className="h-3 w-3" /></span>}
              {a.paid && <span title={t('admin.applications.paid')} className="rounded-md bg-ok-bg p-1 text-ok"><CheckCircle2 className="h-3 w-3" /></span>}
            </div>
          </div>
        )}
      />

      <Drawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.applicant.company}
        closeLabel={t('common.close')}
        footer={
          open &&
          open.stage !== 'active' && (
            <>
              <Button
                variant="danger"
                icon={<X className="h-4 w-4" />}
                onClick={() => {
                  refuse(open.id)
                  setOpenId(null)
                  toast(t('admin.applications.refused'), 'info')
                }}
              >
                {t('admin.applications.refuse')}
              </Button>
              <Button size="lg" icon={<BadgeCheck className="h-4 w-4" />} onClick={() => doApprove(open)}>
                {t('admin.applications.approve')}
              </Button>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={open.stage === 'active' ? 'ok' : open.stage === 'new' ? 'info' : 'warn'} dot>
                {td(`admin.applications.columns.${open.stage}`)}
              </Badge>
              <span className="text-sm text-muted">{t('admin.applications.received', { date: formatDateTime(open.createdAt) })}</span>
              {open.stage !== 'active' && (
                <div className="ml-auto w-48">
                  <Select
                    aria-label={t('admin.applications.moveTo')}
                    value={open.stage}
                    onChange={(e) => {
                      const to = e.target.value as ApplicationStage
                      if (to === 'active') doApprove(open)
                      else move(open.id, to)
                    }}
                    options={COLS.map((c) => ({ value: c, label: `${t('admin.applications.moveTo')} : ${td(`admin.applications.columns.${c}`)}` }))}
                  />
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-sand-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t('admin.applications.product')}</div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-extrabold">{product(open)}</span>
                <span className="text-lg font-bold">{t('admin.applications.monthly', { price: chf(price(open)) })}</span>
              </div>
              {open.kind === 'office' && open.startDate && (
                <div className="mt-2 text-sm text-muted">
                  {t('admin.applications.start')}: {formatDate(open.startDate)} · {t('admin.applications.duration')}: {open.duration} {t('common.months')}
                </div>
              )}
              <div className={`mt-3 flex items-center gap-2 text-sm font-semibold ${open.paid ? 'text-ok' : 'text-muted'}`}>
                <CheckCircle2 className="h-4 w-4" /> {open.paid ? t('admin.applications.paid') : t('admin.applications.notPaid')}
              </div>
            </div>

            <section>
              <h3 className="mb-2 text-sm font-bold">{t('admin.applications.applicant')}</h3>
              <DescList
                className="border-y border-sand-200"
                items={[
                  { label: t('common.name'), value: `${open.applicant.firstName} ${open.applicant.lastName}` },
                  { label: t('common.email_'), value: open.applicant.email },
                  { label: t('common.phone_'), value: open.applicant.phone },
                  { label: t('common.company'), value: `${open.applicant.company} · ${td(`common.legalForms.${open.applicant.legalForm}`)}` },
                  { label: t('common.uid'), value: open.applicant.uid || '—' },
                  { label: t('common.activity'), value: open.applicant.activity },
                  { label: t('common.street_'), value: `${open.applicant.address.street}, ${open.applicant.address.zip} ${open.applicant.address.city}` },
                ]}
              />
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <section>
                <h3 className="mb-2 text-sm font-bold">{t('admin.applications.idDoc')}</h3>
                {open.idDocument ? (
                  <div className="overflow-hidden rounded-xl border border-sand-200">
                    {open.idDocument.preview ? <img src={open.idDocument.preview} alt="" className="aspect-[3/2] w-full bg-sand-50 object-contain" /> : <div className="flex aspect-[3/2] items-center justify-center bg-sand-50"><FileText className="h-8 w-8 text-muted" /></div>}
                    <div className="truncate border-t border-sand-200 px-3 py-2 text-xs text-muted">{open.idDocument.name}</div>
                  </div>
                ) : (
                  <p className="text-sm text-muted">—</p>
                )}
              </section>
              <section>
                <h3 className="mb-2 text-sm font-bold">{t('admin.applications.contract')}</h3>
                <div className="overflow-hidden rounded-xl border border-sand-200">
                  <div className="flex aspect-[3/2] items-center justify-center bg-sand-50 p-4">{open.signature ? <img src={open.signature} alt="" className="max-h-full w-auto object-contain" /> : <FileSignature className="h-8 w-8 text-muted" />}</div>
                  <div className="border-t border-sand-200 px-3 py-2 text-xs text-muted">{open.signedAt ? t('admin.applications.signedOn', { date: formatDateTime(open.signedAt) }) : t('admin.applications.notSigned')}</div>
                </div>
              </section>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
