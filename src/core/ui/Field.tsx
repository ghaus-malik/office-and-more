import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

const control =
  'w-full rounded-xl border border-sand-300 bg-paper px-3.5 text-[15px] text-ink placeholder:text-muted/70 transition focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10 disabled:bg-sand-50 disabled:text-muted'

export function Field({ label, hint, error, children, className, htmlFor }: { label?: ReactNode; hint?: ReactNode; error?: string; children: ReactNode; className?: string; htmlFor?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink">
          {label}
        </label>
      )}
      {children}
      {error ? <p className="text-xs font-medium text-bad">{error}</p> : hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode; hint?: ReactNode; error?: string; wrapClass?: string; leading?: ReactNode }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, hint, error, wrapClass, className, leading, id, ...rest }, ref) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <Field label={label} hint={hint} error={error} className={wrapClass} htmlFor={fid}>
      <div className="relative">
        {leading && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">{leading}</span>}
        <input ref={ref} id={fid} className={cn(control, 'h-11', leading && 'pl-10', error && 'border-bad', className)} {...rest} />
      </div>
    </Field>
  )
})

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: ReactNode; hint?: ReactNode; wrapClass?: string; options: { value: string; label: string }[] }

export function Select({ label, hint, wrapClass, className, options, id, ...rest }: SelectProps) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <Field label={label} hint={hint} className={wrapClass} htmlFor={fid}>
      <div className="relative">
        <select id={fid} className={cn(control, 'h-11 appearance-none pr-10', className)} {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </div>
    </Field>
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: ReactNode; hint?: ReactNode; wrapClass?: string }

export function Textarea({ label, hint, wrapClass, className, id, ...rest }: TextareaProps) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <Field label={label} hint={hint} className={wrapClass} htmlFor={fid}>
      <textarea id={fid} className={cn(control, 'min-h-[110px] py-3 leading-relaxed', className)} {...rest} />
    </Field>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors', checked ? 'bg-ink' : 'bg-sand-300')}
    >
      <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
    </button>
  )
}

export function RadioCard({ checked, onClick, children, className, disabled }: { checked: boolean; onClick: () => void; children: ReactNode; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40',
        checked ? 'border-ink bg-ink text-paper' : 'border-sand-300 bg-paper hover:border-ink',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-ink" />
      <span>{label}</span>
    </label>
  )
}
