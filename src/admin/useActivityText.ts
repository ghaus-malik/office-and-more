import { useT } from '@/i18n'
import { chf, formatDate } from '@/lib/format'
import type { Activity } from '@/store/types'

/** Renders an activity entry in the current language, formatting its params. */
export function useActivityText() {
  const { td } = useT()
  return (a: Pick<Activity, 'text' | 'params'>) => {
    const p: Record<string, string | number> = { ...a.params }
    if (p.amount !== undefined) p.amount = chf(Number(p.amount))
    if (p.price !== undefined) p.price = chf(Number(p.price))
    if (p.date) p.date = formatDate(String(p.date))
    if (p.method) p.method = td(`common.methods.${p.method}`)
    if (p.service) p.service = td(`common.services.${p.service}`)
    if (p.from) p.from = td(`common.packages.${p.from}`)
    if (p.to) p.to = td(`common.packages.${p.to}`)
    if (p.product) {
      if (p.product === 'office' && p.n) p.product = td('common.products.officeN', { n: p.n })
      else {
        const k = `common.products.${p.product}`
        const v = td(k)
        p.product = v === k ? String(a.params.product) : v
      }
    }
    return td(`admin.activity.${a.text}`, p)
  }
}
