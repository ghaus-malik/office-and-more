import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface Column<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  align?: 'left' | 'right' | 'center'
  className?: string
  hideOnMobile?: boolean
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  searchable,
  searchText,
  searchPlaceholder,
  initialSort,
  empty,
  toolbar,
  dense,
  activeKey,
}: {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  searchable?: boolean
  searchText?: (row: T) => string
  searchPlaceholder?: string
  initialSort?: { id: string; dir: 'asc' | 'desc' }
  empty?: ReactNode
  toolbar?: ReactNode
  dense?: boolean
  activeKey?: string
}) {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState(initialSort)

  const view = useMemo(() => {
    let out = rows
    if (q && searchText) {
      const needle = q.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
      out = out.filter((r) => searchText(r).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(needle))
    }
    if (sort) {
      const col = columns.find((c) => c.id === sort.id)
      if (col?.sortValue) {
        const sv = col.sortValue
        out = [...out].sort((a, b) => {
          const x = sv(a)
          const y = sv(b)
          const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'fr')
          return sort.dir === 'asc' ? r : -r
        })
      }
    }
    return out
  }, [rows, q, sort, columns, searchText])

  const toggle = (id: string) =>
    setSort((s) => (s?.id === id ? { id, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { id, dir: 'asc' }))

  return (
    <div>
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          {searchable && (
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-full border border-sand-300 bg-paper pl-9 pr-4 text-sm focus:border-ink focus:outline-none"
              />
            </div>
          )}
          {toolbar && <div className="ml-auto flex flex-wrap items-center gap-2">{toolbar}</div>}
        </div>
      )}
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-sand-200 bg-sand-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
              {columns.map((c) => (
                <th
                  key={c.id}
                  className={cn(
                    'whitespace-nowrap px-5 py-2.5 font-semibold',
                    c.align === 'right' && 'text-right',
                    c.align === 'center' && 'text-center',
                    c.hideOnMobile && 'hidden md:table-cell',
                    c.className,
                  )}
                >
                  {c.sortValue ? (
                    <button onClick={() => toggle(c.id)} className={cn('inline-flex items-center gap-1 hover:text-ink', c.align === 'right' && 'flex-row-reverse')}>
                      {c.header}
                      {sort?.id === c.id ? (
                        sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {view.map((r) => (
              <tr
                key={rowKey(r)}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={cn(onRowClick && 'cursor-pointer hover:bg-sand-50', activeKey === rowKey(r) && 'bg-sand-50')}
              >
                {columns.map((c) => (
                  <td
                    key={c.id}
                    className={cn(
                      'px-5',
                      dense ? 'py-2.5' : 'py-3.5',
                      c.align === 'right' && 'text-right tabular-nums',
                      c.align === 'center' && 'text-center',
                      c.hideOnMobile && 'hidden md:table-cell',
                      c.className,
                    )}
                  >
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {view.length === 0 && <div className="border-b border-sand-200">{empty}</div>}
      </div>
    </div>
  )
}
