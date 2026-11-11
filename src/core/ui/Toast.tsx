import { create } from 'zustand'
import { CheckCircle2, Info } from 'lucide-react'
import { createPortal } from 'react-dom'

interface ToastItem {
  id: number
  text: string
  tone: 'ok' | 'info'
}

const useToasts = create<{ items: ToastItem[]; push: (text: string, tone?: 'ok' | 'info') => void }>((set) => ({
  items: [],
  push: (text, tone = 'ok') => {
    const id = Date.now() + Math.random()
    set((s) => ({ items: [...s.items, { id, text, tone }] }))
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), 3200)
  },
}))

export const toast = (text: string, tone: 'ok' | 'info' = 'ok') => useToasts.getState().push(text, tone)

export function Toaster() {
  const items = useToasts((s) => s.items)
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      {items.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper shadow-pop animate-slide-up">
          {t.tone === 'ok' ? <CheckCircle2 className="h-4 w-4 text-[#7BD49B]" /> : <Info className="h-4 w-4" />}
          {t.text}
        </div>
      ))}
    </div>,
    document.body,
  )
}
