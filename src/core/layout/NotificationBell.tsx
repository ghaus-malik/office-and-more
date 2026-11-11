import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface BellItem {
  id: string
  icon?: ReactNode
  text: ReactNode
  time: ReactNode
  unread: boolean
  onClick?: () => void
}

export function NotificationBell({
  items,
  unread,
  title,
  emptyText,
  markAllLabel,
  onMarkAll,
  label,
}: {
  items: BellItem[]
  unread: number
  title: string
  emptyText: string
  markAllLabel?: string
  onMarkAll?: () => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [ring, setRing] = useState(false)
  const prev = useRef(unread)

  useEffect(() => {
    if (unread > prev.current) {
      setRing(true)
      const t = setTimeout(() => setRing(false), 1200)
      prev.current = unread
      return () => clearTimeout(t)
    }
    prev.current = unread
  }, [unread])

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className={cn('relative inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-sand-100', open && 'bg-sand-100')}
      >
        <Bell className={cn('h-5 w-5', ring && 'animate-[wiggle_.6s_ease-in-out_2]')} style={ring ? { animation: 'wiggle .5s ease-in-out 2' } : undefined} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bad px-1 text-[10.5px] font-bold text-white ring-2 ring-paper">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-sand-200 bg-paper shadow-pop animate-slide-up">
          <div className="flex items-center justify-between border-b border-sand-200 px-4 py-3">
            <span className="text-sm font-bold">{title}</span>
            {onMarkAll && unread > 0 && (
              <button onClick={onMarkAll} className="text-xs font-semibold text-muted hover:text-ink">
                {markAllLabel}
              </button>
            )}
          </div>
          <div className="scroll-thin max-h-[380px] overflow-y-auto">
            {items.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted">{emptyText}</p>}
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => {
                  it.onClick?.()
                  setOpen(false)
                }}
                className={cn('flex w-full items-start gap-3 border-b border-sand-200/70 px-4 py-3 text-left text-sm last:border-0 hover:bg-sand-50', it.unread && 'bg-sand-50/70')}
              >
                {it.icon && <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand-100">{it.icon}</span>}
                <span className="min-w-0 flex-1">
                  <span className={cn('block leading-snug', it.unread && 'font-semibold')}>{it.text}</span>
                  <span className="mt-0.5 block text-xs text-muted">{it.time}</span>
                </span>
                {it.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-bad" />}
              </button>
            ))}
          </div>
        </div>
      )}
      <style>{`@keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(14deg)}75%{transform:rotate(-14deg)}}`}</style>
    </div>
  )
}
