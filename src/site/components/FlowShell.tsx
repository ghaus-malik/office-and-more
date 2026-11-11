import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Stepper } from '@/core/ui'

/** Layout for multi-step flows: title, progress bar, content and an optional summary aside. */
export function FlowShell({
  backTo,
  backLabel,
  title,
  subtitle,
  steps,
  step,
  aside,
  children,
}: {
  backTo: string
  backLabel: string
  title: ReactNode
  subtitle?: ReactNode
  steps?: string[]
  step?: number
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="container-site pt-8 md:pt-12">
      <Link to={backTo} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>
      <h1 className="display mt-5 text-[36px] md:text-[52px]">{title}</h1>
      {subtitle && <p className="mt-2 text-[15px] text-muted">{subtitle}</p>}
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          {steps && step !== undefined && <Stepper steps={steps} current={step} className="mb-8" />}
          <div key={step} className="animate-slide-up">
            {children}
          </div>
        </div>
        {aside && <aside className="lg:sticky lg:top-28 lg:self-start">{aside}</aside>}
      </div>
    </div>
  )
}

export function StepNav({ onBack, onNext, nextLabel, nextDisabled, backLabel, extra, loading }: { onBack?: () => void; onNext?: () => void; nextLabel: string; nextDisabled?: boolean; backLabel: string; extra?: ReactNode; loading?: boolean }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-sand-200 pt-6">
      <div className="flex items-center gap-3">
        {onBack && (
          <button type="button" onClick={onBack} className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-muted hover:bg-sand-100 hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </button>
        )}
        {extra}
      </div>
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || loading}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-[15px] font-semibold text-paper transition hover:bg-ink-soft disabled:opacity-35"
        >
          {nextLabel}
        </button>
      )}
    </div>
  )
}
