import { translate, type Lang } from '@/i18n'
import { formatDate } from './format'

export function relativeTime(iso: string, lang: Lang): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return translate(lang, 'common.time_.justNow')
  if (diff < 3600) return translate(lang, 'common.time_.minutesAgo', { n: Math.floor(diff / 60) })
  if (diff < 86400) return translate(lang, 'common.time_.hoursAgo', { n: Math.floor(diff / 3600) })
  if (diff < 86400 * 7) return translate(lang, 'common.time_.daysAgo', { n: Math.floor(diff / 86400) })
  return formatDate(new Date(iso))
}
