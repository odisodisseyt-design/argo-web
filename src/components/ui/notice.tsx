import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, PlugZap } from 'lucide-react'
import { cn } from '@/lib/utils'

const TONES = {
  info: { icon: Info, cls: 'border-primary/30 bg-primary/8 text-foreground [&>svg]:text-primary' },
  success: { icon: CheckCircle2, cls: 'border-success/30 bg-success/8 [&>svg]:text-success' },
  warning: { icon: AlertTriangle, cls: 'border-accent/40 bg-accent/10 [&>svg]:text-accent' },
  danger: { icon: AlertTriangle, cls: 'border-danger/40 bg-danger/10 [&>svg]:text-danger' },
  integration: { icon: PlugZap, cls: 'border-dashed border-border bg-muted/40 [&>svg]:text-muted-foreground' },
} as const

interface NoticeProps {
  tone?: keyof typeof TONES
  title?: string
  children?: ReactNode
  action?: ReactNode
  className?: string
}

export function Notice({ tone = 'info', title, children, action, className }: NoticeProps) {
  const { icon: Icon, cls } = TONES[tone]
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-md border p-3 text-sm', cls, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && <p className="font-medium leading-snug">{title}</p>}
        {children && <div className="leading-relaxed text-muted-foreground">{children}</div>}
        {action && <div className="mt-1">{action}</div>}
      </div>
    </div>
  )
}
