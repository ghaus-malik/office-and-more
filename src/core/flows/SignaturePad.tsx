import { useEffect, useRef, useState } from 'react'
import { Eraser, PenLine } from 'lucide-react'
import { useT } from '@/i18n'
import { cn } from '@/lib/cn'

/** Canvas signature pad. Emits a PNG data URL (or null when cleared). */
export function SignaturePad({ value, onChange, height = 180 }: { value: string | null; onChange: (dataUrl: string | null) => void; height?: number }) {
  const { t } = useT()
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [empty, setEmpty] = useState(!value)

  const ctx = () => canvas.current!.getContext('2d')!

  const setup = () => {
    const c = canvas.current
    if (!c) return
    const ratio = window.devicePixelRatio || 1
    const w = c.offsetWidth
    c.width = w * ratio
    c.height = height * ratio
    const g = ctx()
    g.scale(ratio, ratio)
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.strokeStyle = '#111'
    g.lineWidth = 2.2
    if (value) {
      const img = new Image()
      img.onload = () => g.drawImage(img, 0, 0, w, height)
      img.src = value
    }
  }

  useEffect(() => {
    setup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const start = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = pos(e)
  }
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return
    const p = pos(e)
    const g = ctx()
    g.beginPath()
    g.moveTo(last.current.x, last.current.y)
    g.lineTo(p.x, p.y)
    g.stroke()
    last.current = p
    if (empty) setEmpty(false)
  }
  const end = () => {
    if (!drawing.current) return
    drawing.current = false
    last.current = null
    onChange(canvas.current!.toDataURL('image/png'))
  }

  const clear = () => {
    const c = canvas.current!
    ctx().clearRect(0, 0, c.width, c.height)
    setEmpty(true)
    onChange(null)
  }

  /** Draws a plausible handwritten signature for a fast demo. */
  const demoSign = () => {
    clear()
    const c = canvas.current!
    const w = c.offsetWidth
    const g = ctx()
    const x0 = w * 0.18
    const y0 = height * 0.62
    const s = Math.min(1.2, w / 420)
    g.lineWidth = 2.4
    g.beginPath()
    g.moveTo(x0, y0)
    g.bezierCurveTo(x0 + 10 * s, y0 - 70 * s, x0 + 40 * s, y0 - 70 * s, x0 + 30 * s, y0 - 10 * s)
    g.bezierCurveTo(x0 + 22 * s, y0 + 30 * s, x0 + 5 * s, y0 + 5 * s, x0 + 45 * s, y0 - 25 * s)
    g.bezierCurveTo(x0 + 70 * s, y0 - 45 * s, x0 + 60 * s, y0 + 10 * s, x0 + 85 * s, y0 - 15 * s)
    g.bezierCurveTo(x0 + 105 * s, y0 - 35 * s, x0 + 100 * s, y0 + 5 * s, x0 + 125 * s, y0 - 20 * s)
    g.bezierCurveTo(x0 + 140 * s, y0 - 40 * s, x0 + 150 * s, y0 - 5 * s, x0 + 170 * s, y0 - 22 * s)
    g.bezierCurveTo(x0 + 190 * s, y0 - 70 * s, x0 + 200 * s, y0 - 10 * s, x0 + 215 * s, y0 - 18 * s)
    g.bezierCurveTo(x0 + 235 * s, y0 - 28 * s, x0 + 240 * s, y0 + 2 * s, x0 + 262 * s, y0 - 14 * s)
    g.stroke()
    g.beginPath()
    g.moveTo(x0 - 10 * s, y0 + 18 * s)
    g.bezierCurveTo(x0 + 80 * s, y0 + 8 * s, x0 + 180 * s, y0 + 12 * s, x0 + 290 * s, y0 + 2 * s)
    g.stroke()
    setEmpty(false)
    onChange(c.toDataURL('image/png'))
  }

  return (
    <div>
      <div className="relative rounded-2xl border border-dashed border-sand-300 bg-sand-50">
        <canvas
          ref={canvas}
          style={{ height, touchAction: 'none' }}
          className="block w-full cursor-crosshair rounded-2xl"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        <div className="pointer-events-none absolute inset-x-8 bottom-10 border-b border-sand-300" />
        {empty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted">
            <PenLine className="h-4 w-4" /> {t('common.signature.hint')}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <button type="button" onClick={demoSign} className="text-[13px] font-semibold text-ink underline decoration-sand-300 underline-offset-4 hover:decoration-ink">
          {t('common.signature.demo')}
        </button>
        <button type="button" onClick={clear} className={cn('inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink', empty && 'invisible')}>
          <Eraser className="h-3.5 w-3.5" /> {t('common.signature.clear')}
        </button>
      </div>
    </div>
  )
}
