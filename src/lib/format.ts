/** Swiss formatting helpers: CHF 1’000, 18.11.2026, 14:00. */
const APOS = '’'

function group(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, APOS)
}

/** Formats a number with Swiss thousands separators. Whole numbers show no decimals unless `cents` is set. */
export function formatNumber(n: number, opts: { cents?: boolean; decimals?: number } = {}): string {
  const decimals = opts.decimals ?? (opts.cents || !Number.isInteger(n) ? 2 : 0)
  const neg = n < 0
  const [i, d] = Math.abs(n).toFixed(decimals).split('.')
  return (neg ? '-' : '') + group(i) + (d ? '.' + d : '')
}

/** CHF 1’000 · CHF 0.20 · CHF 1’120.00 (with cents) */
export function chf(n: number, opts: { cents?: boolean } = {}): string {
  return `CHF ${formatNumber(n, opts)}`
}

/** A price range: CHF 25–60 */
export function chfRange(min: number, max: number): string {
  return `CHF ${formatNumber(min)}–${formatNumber(max)}`
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 'YYYY-MM-DD' or Date → 18.11.2026 */
export function formatDate(d: string | Date): string {
  const date = typeof d === 'string' ? parseISODate(d) : d
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

/** ISO datetime → 18.11.2026, 14:05 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${formatDate(d)}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Parses 'YYYY-MM-DD' as a local date (never shifts a day west of Greenwich). */
export function parseISODate(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 'HH:MM' → minutes */
export function hm(s: string): number {
  const [h, m] = s.split(':').map(Number)
  return h * 60 + m
}

export function minutesToHM(min: number): string {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`
}

/** Bytes → 1.2 MB */
export function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}
