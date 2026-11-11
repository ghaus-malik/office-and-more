import { Link } from 'react-router-dom'
import { ArrowUpRight, Layers, Maximize2, Users } from 'lucide-react'
import { useT } from '@/i18n'
import { Badge, type Tone } from '@/core/ui'
import type { Office, OfficeStatus } from '@/store/types'
import { chf } from '@/lib/format'
import { cn } from '@/lib/cn'

export const officeTone: Record<OfficeStatus, Tone> = { available: 'ok', reserved: 'warn', let: 'neutral' }

export function OfficeStatusBadge({ status }: { status: OfficeStatus }) {
  const { td } = useT()
  return (
    <Badge tone={officeTone[status]} dot>
      {td(`common.officeStatus.${status}`)}
    </Badge>
  )
}

export function useOfficeMeta() {
  const { t } = useT()
  return (o: Office) => ({
    size: t('site.offices.size', { n: o.size }),
    capacity: o.capacity === 1 ? t('site.offices.capacityOne') : t('site.offices.capacity', { n: o.capacity }),
    floor: o.floor === 1 ? t('site.offices.floor1') : t('site.offices.floor', { n: o.floor }),
  })
}

export function OfficeCard({ office }: { office: Office }) {
  const { t } = useT()
  const meta = useOfficeMeta()(office)
  const off = office.status !== 'available'
  return (
    <Link to={`/bureaux/${office.id}`} className={cn('group flex flex-col', off && 'opacity-[.62] grayscale-[.7] hover:opacity-90 hover:grayscale-0 transition')}>
      <div className="relative overflow-hidden">
        <img src={office.images[0]} alt="" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
        <div className="absolute left-3 top-3">
          <OfficeStatusBadge status={office.status} />
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight">{t('common.products.officeN', { n: office.number })}</h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5" />
              {meta.size}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {meta.capacity}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              {meta.floor}
            </span>
          </div>
        </div>
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sand-300 transition group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 border-t border-sand-200 pt-3 text-[15px]">
        <span className="font-bold">
          {t('common.from')} {chf(office.rent)}
        </span>{' '}
        <span className="text-muted">{t('common.perMonth')}</span>
      </div>
    </Link>
  )
}
