import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse' | 'link'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-[background,color,box-shadow,transform] duration-150 active:scale-[.98] disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap select-none'
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink-soft',
  secondary: 'bg-paper text-ink ring-1 ring-inset ring-sand-300 hover:ring-ink hover:bg-sand-50',
  ghost: 'text-ink hover:bg-sand-100',
  danger: 'bg-paper text-bad ring-1 ring-inset ring-bad/30 hover:bg-bad-bg',
  inverse: 'bg-paper text-ink hover:bg-sand-100',
  link: 'text-ink underline underline-offset-4 decoration-sand-300 hover:decoration-ink rounded-none px-0',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3.5 text-[13px]',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-[15px]',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  block?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, iconRight, block, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(base, variants[variant], variant !== 'link' && sizes[size], block && 'w-full', className)}
      {...rest}
    >
      {loading ? <Spinner className="h-4 w-4" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
})

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  block,
  className,
  children,
  ...rest
}: LinkProps & { variant?: Variant; size?: Size; icon?: ReactNode; iconRight?: ReactNode; block?: boolean }) {
  return (
    <Link className={cn(base, variants[variant], variant !== 'link' && sizes[size], block && 'w-full', className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  )
}

export function IconButton({
  label,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn('relative inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-sand-100', className)}
      {...rest}
    >
      {children}
    </button>
  )
}
