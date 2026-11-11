import { useT } from '@/i18n'
import { cn } from '@/lib/cn'

export function LangSwitch({ className, dark }: { className?: string; dark?: boolean }) {
  const { lang, setLang, t } = useT()
  return (
    <div role="group" aria-label={t('common.lang.label')} className={cn('inline-flex rounded-full p-0.5 text-xs font-bold', dark ? 'bg-white/10' : 'bg-sand-100', className)}>
      {(['fr', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            'rounded-full px-2.5 py-1 transition',
            lang === l ? (dark ? 'bg-white text-ink' : 'bg-ink text-paper') : dark ? 'text-white/70 hover:text-white' : 'text-muted hover:text-ink',
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
