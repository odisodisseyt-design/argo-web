import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 lg:px-8 lg:py-10', className)}>{children}</div>
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        {eyebrow && <p className="hud-label text-primary">{eyebrow}</p>}
        <h1 className="text-2xl font-bold lg:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  )
}
