import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: { id: T; label: ReactNode; count?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cn('no-scrollbar flex gap-1 overflow-x-auto border-b border-sand-200', className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            '-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition',
            value === t.id ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink',
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="rounded-full bg-sand-100 px-1.5 text-[11px] text-muted">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Segmented<T extends string>({ options, value, onChange, className }: { options: { id: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn('inline-flex rounded-full bg-sand-100 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn('rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition', value === o.id ? 'bg-paper text-ink shadow-card' : 'text-muted hover:text-ink')}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
