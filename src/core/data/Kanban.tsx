import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface KanbanColumn<C extends string> {
  id: C
  title: ReactNode
  accent?: string
}

export function Kanban<C extends string, T extends { id: string }>({
  columns,
  items,
  columnOf,
  renderCard,
  onMove,
  onOpen,
  highlightId,
}: {
  columns: KanbanColumn<C>[]
  items: T[]
  columnOf: (item: T) => C
  renderCard: (item: T) => ReactNode
  onMove?: (id: string, to: C) => void
  onOpen?: (item: T) => void
  highlightId?: string
}) {
  const [over, setOver] = useState<C | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)

  return (
    <div className="scroll-thin -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
      {columns.map((col) => {
        const list = items.filter((i) => columnOf(i) === col.id)
        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              if (!onMove) return
              e.preventDefault()
              setOver(col.id)
            }}
            onDragLeave={() => setOver((o) => (o === col.id ? null : o))}
            onDrop={(e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData('text/plain')
              setOver(null)
              setDragging(null)
              if (id && onMove) onMove(id, col.id)
            }}
            className={cn('flex min-w-[212px] flex-1 flex-col rounded-2xl bg-sand-100/70 p-2 transition', over === col.id && 'bg-sand-200 ring-2 ring-ink/20')}
          >
            <div className="flex items-center justify-between px-2 pb-2 pt-1.5">
              <div className="flex items-center gap-2 text-[13px] font-bold">
                {col.accent && <span className={cn('h-2 w-2 rounded-full', col.accent)} />}
                {col.title}
              </div>
              <span className="rounded-full bg-paper px-2 text-xs font-semibold tabular-nums text-muted">{list.length}</span>
            </div>
            <div className="flex min-h-[120px] flex-col gap-2">
              {list.map((item) => (
                <div
                  key={item.id}
                  draggable={!!onMove}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', item.id)
                    setDragging(item.id)
                  }}
                  onDragEnd={() => setDragging(null)}
                  onClick={() => onOpen?.(item)}
                  className={cn(
                    'cursor-pointer rounded-xl border border-sand-200 bg-paper p-3 shadow-card transition hover:border-ink',
                    dragging === item.id && 'opacity-40',
                    highlightId === item.id && 'border-ok ring-4 ring-ok/20',
                  )}
                >
                  {renderCard(item)}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
