let counter = 0
export function uid(prefix = 'id'): string {
  counter = (counter + 1) % 1e6
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/** Human booking reference: OM-R-4K7Q */
export function bookingRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return `OM-${s}`
}
