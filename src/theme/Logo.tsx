import { cn } from '@/lib/cn'

/** The "office&more" wordmark extracted from the brochure cover (transparent PNG). */
export function Logo({ className, invert }: { className?: string; invert?: boolean }) {
  return (
    <img
      src="/img/logo.png"
      alt="office&more"
      width={1200}
      height={188}
      className={cn('h-6 w-auto select-none', invert && 'invert', className)}
      draggable={false}
    />
  )
}
