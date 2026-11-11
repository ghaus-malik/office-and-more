import { useRef, useState } from 'react'
import { CheckCircle2, FileText, UploadCloud } from 'lucide-react'
import { useT } from '@/i18n'
import { cn } from '@/lib/cn'
import { fileToDataUrl } from '@/lib/image'
import { formatBytes } from '@/lib/format'

export interface DroppedFile {
  name: string
  size: number
  preview?: string
}

/** Drag-and-drop zone. Accepts any file; images get a preview stored as a small data URL. */
export function FileDrop({
  value,
  onChange,
  sample,
  compact,
  accept,
}: {
  value: DroppedFile | null
  onChange: (f: DroppedFile | null) => void
  sample?: DroppedFile
  compact?: boolean
  accept?: string
}) {
  const { t } = useT()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState(false)

  const take = async (file?: File) => {
    if (!file) return
    setBusy(true)
    const preview = (await fileToDataUrl(file)) ?? undefined
    setBusy(false)
    onChange({ name: file.name, size: file.size, preview })
  }

  if (value) {
    const isImg = !!value.preview
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-ok/40 bg-ok-bg/50 p-3">
        <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-sand-200 bg-paper">
          {isImg ? <img src={value.preview} alt="" className="h-full w-full object-cover" /> : <FileText className="h-7 w-7 text-muted" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm font-bold text-ok">
            <CheckCircle2 className="h-4 w-4" /> {t('common.upload.received')}
          </div>
          <div className="mt-0.5 truncate text-sm font-medium">{value.name}</div>
          <div className="text-xs text-muted">{formatBytes(value.size)}</div>
        </div>
        <button type="button" onClick={() => onChange(null)} className="shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold text-muted hover:bg-paper hover:text-ink">
          {t('common.upload.replace')}
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          take(e.dataTransfer.files?.[0])
        }}
        onClick={() => input.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && input.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition',
          compact ? 'px-4 py-6' : 'px-6 py-10',
          over ? 'border-ink bg-sand-100' : 'border-sand-300 bg-sand-50 hover:border-ink',
        )}
      >
        <div className={cn('mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-paper shadow-card', busy && 'animate-pulse')}>
          <UploadCloud className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold">{t('common.upload.drop')}</p>
        <p className="mt-1 text-sm text-muted">
          {t('common.upload.or')} <span className="font-semibold text-ink underline underline-offset-4">{t('common.upload.browse')}</span>
        </p>
        <p className="mt-2 text-xs text-muted">{t('common.upload.accepted')}</p>
        <input ref={input} type="file" accept={accept} className="hidden" onChange={(e) => take(e.target.files?.[0])} />
      </div>
      {sample && (
        <button type="button" onClick={() => onChange(sample)} className="mt-2 text-[13px] font-semibold text-ink underline decoration-sand-300 underline-offset-4 hover:decoration-ink">
          {t('common.upload.sample')}
        </button>
      )}
    </div>
  )
}
