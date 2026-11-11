import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Progress bar with step labels, used by all multi-step flows. */
export function Stepper({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  const pct = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 100
  return (
    <div className={cn('w-full', className)}>
      <div className="mb-3 flex items-baseline justify-between text-sm">
        <span className="font-semibold">{steps[current]}</span>
        <span className="text-muted tabular-nums">
          {current + 1} / {steps.length}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-sand-200">
        <div className="h-full rounded-full bg-ink transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <ol className="mt-4 hidden gap-2 md:flex">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2 text-xs">
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                i < current ? 'bg-ink text-paper' : i === current ? 'ring-2 ring-ink' : 'bg-sand-100 text-muted',
              )}
            >
              {i < current ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn('truncate', i <= current ? 'text-ink font-medium' : 'text-muted')}>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
