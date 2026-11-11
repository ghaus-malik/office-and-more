export function cn(...parts: unknown[]): string {
  return parts.filter((p) => typeof p === 'string' && p.length > 0).join(' ')
}
