import { BadgeCheck, Bell, CalendarDays, CreditCard, FileText, Mail, RefreshCw, Repeat, Send, Sparkles, Tag, UserRound } from 'lucide-react'
import type { ActivityType } from '@/store/types'
import { cn } from '@/lib/cn'

const map: Record<ActivityType, { icon: React.ReactNode; cls: string }> = {
  booking: { icon: <CalendarDays className="h-4 w-4" />, cls: 'bg-sand-100' },
  payment: { icon: <CreditCard className="h-4 w-4" />, cls: 'bg-ok-bg text-ok' },
  mail: { icon: <Mail className="h-4 w-4" />, cls: 'bg-sand-100' },
  reminder: { icon: <Bell className="h-4 w-4" />, cls: 'bg-warn-bg text-warn' },
  bexio: { icon: <RefreshCw className="h-4 w-4" />, cls: 'bg-sand-100' },
  application: { icon: <FileText className="h-4 w-4" />, cls: 'bg-info-bg text-info' },
  approval: { icon: <BadgeCheck className="h-4 w-4" />, cls: 'bg-ok-bg text-ok' },
  forward: { icon: <Send className="h-4 w-4" />, cls: 'bg-sand-100' },
  service: { icon: <Sparkles className="h-4 w-4" />, cls: 'bg-sand-100' },
  subscription: { icon: <Repeat className="h-4 w-4" />, cls: 'bg-sand-100' },
  customer: { icon: <UserRound className="h-4 w-4" />, cls: 'bg-sand-100' },
  price: { icon: <Tag className="h-4 w-4" />, cls: 'bg-sand-100' },
}

export function ActivityIcon({ type, className }: { type: ActivityType; className?: string }) {
  const m = map[type]
  return <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', m.cls, className)}>{m.icon}</span>
}
