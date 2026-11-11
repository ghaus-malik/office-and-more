import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function KpiTile({
  label,
  value,
  sub,
  icon,
  tone,
  highlight,
  onClick,
}: {
  label: ReactNode
  value: ReactNode
  sub?: ReactNode
  icon?: ReactNode
  tone?: 'ok' | 'warn' | 'bad'
  highlight?: boolean
  onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-paper p-5 text-left transition',
        highlight ? 'border-ok ring-4 ring-ok/15' : 'border-sand-200',
        onClick && 'hover:border-ink',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        {icon && <span className="text-muted">{icon}</span>}
      </div>
      <span className={cn('mt-3 text-[28px] font-extrabold leading-none tracking-tight tabular-nums transition-colors', highlight && 'text-ok')}>{value}</span>
      {sub && (
        <span className={cn('mt-2 text-xs font-medium', tone === 'ok' ? 'text-ok' : tone === 'warn' ? 'text-warn' : tone === 'bad' ? 'text-bad' : 'text-muted')}>
          {sub}
        </span>
      )}
    </Tag>
  )
}
