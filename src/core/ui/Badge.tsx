import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type Tone = 'ok' | 'warn' | 'bad' | 'neutral' | 'info' | 'dark'

const tones: Record<Tone, string> = {
  ok: 'bg-ok-bg text-ok',
  warn: 'bg-warn-bg text-warn',
  bad: 'bg-bad-bg text-bad',
  info: 'bg-info-bg text-info',
  neutral: 'bg-sand-100 text-muted',
  dark: 'bg-ink text-paper',
}

export function Badge({ tone = 'neutral', children, dot, className }: { tone?: Tone; children: ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export function CountBadge({ n, className }: { n: number; className?: string }) {
  if (!n) return null
  return (
    <span className={cn('inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bad px-1 text-[10.5px] font-bold text-white', className)}>
      {n > 99 ? '99+' : n}
    </span>
  )
}
