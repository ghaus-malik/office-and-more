import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, CalendarDays, CheckCircle2, FileWarning, Inbox, Mail, RefreshCw, TrendingUp, Zap } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useT } from '@/i18n'
import { useStore } from '@/store'
import { mrr, newRequests, officesLet, roomOccupancyThisWeek, unpaidInvoices } from '@/store/selectors'
import { Card, CardHeader } from '@/core/ui'
import { KpiTile } from '@/core/data'
import { PageHeader } from '@/core/layout/SidebarLayout'
import { chf, formatDate, formatDateTime, formatNumber, parseISODate, toISODate } from '@/lib/format'
import { relativeTime } from '@/lib/relative'
import { today } from '@/lib/dates'
import { useUi } from '@/shared/ui'
import { BookingPaymentBadge } from '@/shared/badges'
import { useActivityText } from '../useActivityText'
import { ActivityIcon } from '../components/ActivityIcon'

/** Validated categorical palette (scripts/validate_palette.js, light): slate, mustard, brick, sage — drawn from the brochure photography. */
export const SERIES = [
  { key: 'offices', color: '#1F65A8' },
  { key: 'domiciliation', color: '#C08A2E' },
  { key: 'room', color: '#9E4636' },
  { key: 'services', color: '#5E9448' },
] as const

export function Overview() {
  const { t, td, tl, lang } = useT()
  const state = useStore()
  const nav = useNavigate()
  const text = useActivityText()
  const bump = useUi((s) => s.mrrBump)
  const [highlight, setHighlight] = useState(false)

  const total = mrr(state)
  const let_ = officesLet(state)
  const occ = roomOccupancyThisWeek(state)
  const unpaid = unpaidInvoices(state)
  const reqs = newRequests(state)
  const activeSubs = state.subscriptions.filter((s) => s.status === 'active' || s.status === 'late').length

  useEffect(() => {
    if (bump && Date.now() - bump.at < 90_000) {
      setHighlight(true)
      const x = setTimeout(() => setHighlight(false), 6000)
      return () => clearTimeout(x)
    }
  }, [bump])

  const todayIso = toISODate(today())
  const todayBookings = state.bookings.filter((b) => b.date === todayIso).sort((a, b) => a.start.localeCompare(b.start))
  const mailWaiting = state.mail.filter((m) => m.status === 'received' || m.status === 'scan_requested').length + state.forwards.filter((f) => f.status === 'pending').length
  const months = tl('common.monthShort')
  // The current month's recurring part follows live MRR so the chart and the tile agree.
  const recurring = state.subscriptions.filter((s) => s.status === 'active' || s.status === 'late')
  const group = (p: string) => (p === 'office' ? 'offices' : p.startsWith('domi_') ? 'domiciliation' : 'services')
  const live = { offices: 0, domiciliation: 0, services: 0 } as Record<string, number>
  recurring.forEach((s) => (live[group(s.product)] += s.price))
  const chartData = state.revenueHistory.map((r, i, arr) => {
    const d = parseISODate(r.month)
    const isLast = i === arr.length - 1
    const row = isLast ? { ...r, ...live } : r
    return { label: months[d.getMonth()], ...row, total: row.offices + row.domiciliation + row.room + row.services }
  })
  const unread = state.activity.filter((a) => a.at > state.adminReadAt).length
  const autoOn = state.automations.filter((a) => a.enabled).length

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader title={t('admin.overview.title')} subtitle={t('admin.overview.subtitle', { date: formatDate(today()) })} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 [&>*:last-child]:col-span-2 lg:[&>*:last-child]:col-span-1">
        <KpiTile onClick={() => nav('/admin/bureaux')}
            label={t('admin.overview.officesLet')}
            icon={<Building2 className="h-4 w-4" />}
            value={t('admin.overview.officesLetValue', { n: let_, total: state.offices.length })}
            sub={t('admin.overview.officesSub', { n: state.offices.filter((o) => o.status === 'available').length, r: state.offices.filter((o) => o.status === 'reserved').length })}
          />
        <KpiTile onClick={() => nav('/admin/abonnements')}
            label={t('admin.overview.mrr')}
            icon={<TrendingUp className="h-4 w-4" />}
            value={chf(total)}
            highlight={highlight}
            tone={highlight ? 'ok' : undefined}
            sub={highlight && bump ? t('admin.overview.upBy', { amount: chf(bump.amount) }) : t('admin.overview.mrrSub', { n: activeSubs })}
          />
        <KpiTile onClick={() => nav('/admin/salle')} label={t('admin.overview.occupancy')} icon={<CalendarDays className="h-4 w-4" />} value={`${occ} %`} sub={t('admin.overview.occupancySub')} />
        <KpiTile onClick={() => nav('/admin/factures')}
            label={t('admin.overview.unpaid')}
            icon={<FileWarning className="h-4 w-4" />}
            value={
              <span>
                {unpaid.count} <span className="text-lg font-bold text-muted">· {chf(unpaid.total)}</span>
              </span>
            }
            tone={unpaid.overdue ? 'bad' : undefined}
            sub={t('admin.overview.unpaidSub', { n: unpaid.overdue })}
          />
        <KpiTile onClick={() => nav('/admin/demandes')} label={t('admin.overview.requests')} icon={<Inbox className="h-4 w-4" />} value={reqs} sub={t('admin.overview.requestsSub')} tone={reqs ? 'warn' : undefined} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardHeader
            title={t('admin.overview.revenue')}
            subtitle={t('admin.overview.revenueSub')}
            action={
              <div className="flex flex-wrap justify-end gap-x-4 gap-y-1">
                {SERIES.map((s) => (
                  <span key={s.key} className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                    {td(`admin.overview.series.${s.key}`)}
                  </span>
                ))}
              </div>
            }
          />
          <div className="h-[300px] px-2 pb-4 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 22, right: 16, left: 4, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke="rgb(231 227 220)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#6B6660', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} width={52} tick={{ fill: '#6B6660', fontSize: 12 }} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip
                  cursor={{ fill: 'rgba(17,17,17,0.04)' }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="rounded-xl border border-sand-200 bg-paper px-3.5 py-2.5 text-xs shadow-pop">
                        <div className="mb-1.5 text-sm font-bold capitalize">{label}</div>
                        {[...payload].reverse().map((p) => (
                          <div key={String(p.dataKey)} className="flex items-center justify-between gap-6 py-0.5">
                            <span className="flex items-center gap-1.5 text-muted">
                              <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
                              {td(`admin.overview.series.${String(p.dataKey)}`)}
                            </span>
                            <span className="font-semibold tabular-nums">{chf(Number(p.value))}</span>
                          </div>
                        ))}
                        <div className="mt-1.5 flex justify-between border-t border-sand-200 pt-1.5 font-bold">
                          <span>{t('common.total')}</span>
                          <span className="tabular-nums">{chf(Number(payload[0].payload.total))}</span>
                        </div>
                      </div>
                    ) : null
                  }
                />
                {SERIES.map((s, i) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    stackId="rev"
                    fill={s.color}
                    stroke="#fff"
                    strokeWidth={2}
                    radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    isAnimationActive={false}
                    label={
                      i === SERIES.length - 1
                        ? ({ x, y, width, index }: any) => (
                            <text x={Number(x) + Number(width) / 2} y={Number(y) - 7} textAnchor="middle" fontSize={11} fontWeight={600} fill="#111">
                              {formatNumber(chartData[index].total)}
                            </text>
                          )
                        : undefined
                    }
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader title={t('admin.overview.activity')} subtitle={<span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok" />{t('admin.overview.activitySub')}{unread > 0 ? ` · ${unread}` : ''}</span>} />
          <ul className="scroll-thin mt-3 max-h-[320px] flex-1 divide-y divide-sand-200 overflow-y-auto">
            {state.activity.slice(0, 14).map((a) => (
              <li key={a.id} className={`flex items-start gap-3 px-5 py-3 ${a.at > state.adminReadAt ? 'animate-slide-up' : ''}`}>
                <ActivityIcon type={a.type} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{text(a)}</p>
                  <p className="mt-0.5 text-xs text-muted">{relativeTime(a.at, lang)}</p>
                </div>
                {a.at > state.adminReadAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-info" />}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="xl:col-span-2">
          <CardHeader
            title={t('admin.overview.today')}
            subtitle={t('admin.overview.todayBookings')}
            action={
              <Link to="/admin/salle" className="text-sm font-semibold text-muted hover:text-ink">
                {t('admin.overview.seeAll')}
              </Link>
            }
          />
          <ul className="mt-3 divide-y divide-sand-200">
            {todayBookings.length === 0 && <li className="px-5 py-6 text-sm text-muted">{t('admin.overview.noBookings')}</li>}
            {todayBookings.map((b) => (
              <li key={b.id} className="flex items-center gap-4 px-5 py-3">
                <span className="w-24 shrink-0 text-sm font-bold tabular-nums">
                  {b.start}–{b.end}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{b.company || b.name}</span>
                <BookingPaymentBadge payment={b.payment} />
              </li>
            ))}
          </ul>
          <Link to="/admin/courrier" className="mx-5 mb-5 mt-2 flex items-center gap-3 rounded-xl bg-sand-50 px-4 py-3 text-sm transition hover:bg-sand-100">
            <Mail className="h-4 w-4" />
            <span className="flex-1 font-semibold">
              {t('admin.overview.mailWaiting')} {mailWaiting > 0 && <span className="ml-1 rounded-full bg-warn-bg px-2 py-0.5 text-xs text-warn">{mailWaiting}</span>}
            </span>
            {mailWaiting === 0 ? <span className="text-xs text-muted">{t('admin.overview.noMail')}</span> : <span className="flex items-center gap-1 text-xs font-semibold">{t('admin.overview.process')} <ArrowRight className="h-3.5 w-3.5" /></span>}
          </Link>
        </Card>
        <Link to="/admin/automatisations" className="group">
          <Card className="h-full p-5 transition group-hover:border-ink">
            <div className="flex items-center justify-between text-sm text-muted">
              <span className="flex items-center gap-2 font-medium">
                <Zap className="h-4 w-4" /> {t('admin.overview.automations')}
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
            </div>
            <div className="mt-3 text-[28px] font-extrabold leading-none">
              {autoOn}/{state.automations.length}
            </div>
            <p className="mt-2 text-xs text-muted">{t('admin.overview.automationsSub', { n: autoOn })}</p>
            <ul className="mt-4 space-y-1.5">
              {state.automations.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center gap-2 text-xs">
                  <span className={`h-1.5 w-1.5 rounded-full ${a.enabled ? 'bg-ok' : 'bg-sand-300'}`} />
                  {td(`admin.automations.rules.${a.id}.name`)}
                </li>
              ))}
            </ul>
          </Card>
        </Link>
        <Link to="/admin/factures" className="group">
          <Card className="h-full p-5 transition group-hover:border-ink">
            <div className="flex items-center justify-between text-sm text-muted">
              <span className="flex items-center gap-2 font-medium">
                <RefreshCw className="h-4 w-4" /> {t('admin.overview.bexio')}
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-[22px] font-extrabold">
              <CheckCircle2 className="h-6 w-6 text-ok" /> {state.invoices.length}
            </div>
            <p className="mt-2 text-xs text-muted">{t('admin.overview.bexioSub', { time: relativeTime(state.lastBexioSync, lang) })}</p>
            <p className="mt-1 text-xs text-muted">{formatDateTime(state.lastBexioSync)}</p>
          </Card>
        </Link>
      </div>
    </div>
  )
}
