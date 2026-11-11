import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

function useLockScroll(open: boolean) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])
}

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeLabel = 'Fermer',
  hideClose,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeLabel?: string
  hideClose?: boolean
}) {
  useLockScroll(open)
  useEscape(open, onClose)
  if (!open) return null
  const w = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size]
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div role="dialog" aria-modal className={cn('relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-paper shadow-pop animate-slide-up sm:rounded-3xl', w)}>
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
            <div className="text-lg font-bold tracking-tight">{title}</div>
            {!hideClose && (
              <button onClick={onClose} aria-label={closeLabel} className="-mr-2 -mt-1 rounded-full p-2 text-muted hover:bg-sand-100 hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="scroll-thin overflow-y-auto px-6 pb-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-sand-200 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  width = 'max-w-xl',
  closeLabel = 'Fermer',
  zIndex = 'z-[70]',
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  width?: string
  closeLabel?: string
  zIndex?: string
}) {
  useLockScroll(open)
  useEscape(open, onClose)
  if (!open) return null
  return createPortal(
    <div className={cn('fixed inset-0 flex justify-end', zIndex)}>
      <div className="absolute inset-0 animate-fade-in bg-ink/30" onClick={onClose} />
      <aside role="dialog" aria-modal className={cn('relative flex h-full w-full flex-col bg-paper shadow-pop animate-slide-left', width)}>
        <div className="flex items-center justify-between gap-4 border-b border-sand-200 px-6 py-4">
          <div className="min-w-0 text-lg font-bold tracking-tight">{title}</div>
          <button onClick={onClose} aria-label={closeLabel} className="-mr-2 rounded-full p-2 text-muted hover:bg-sand-100 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-sand-200 px-6 py-4 pb-safe">{footer}</div>}
      </aside>
    </div>,
    document.body,
  )
}
