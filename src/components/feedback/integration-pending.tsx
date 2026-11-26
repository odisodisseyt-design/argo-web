import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { getEndpoint, type EndpointKey } from '@/api/endpoints'
import { useModeStore } from '@/stores/mode-store'
import { cn } from '@/lib/utils'

interface IntegrationPendingProps {
  icon: LucideIcon
  title: string
  description: string
  endpoints: EndpointKey[]
  className?: string
}

/**
 * Honest empty state for screens whose server contract is not wired yet.
 * Shows which backend data the screen is waiting for instead of fake content.
 */
export function IntegrationPending({ icon: Icon, title, description, endpoints, className }: IntegrationPendingProps) {
  const mode = useModeStore((s) => s.mode)
  return (
    <section className={cn('hud-panel relative overflow-hidden p-5 sm:p-6', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--primary)_1px,transparent_1px),linear-gradient(90deg,var(--primary)_1px,transparent_1px)] [background-size:24px_24px]"
      />
      <div className="relative flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md border bg-surface-raised">
            <Icon className="size-5 text-primary" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{description}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="hud-label">{mode === 'demo' ? 'Демо-данные появятся на этапе 2' : 'Ожидаемые данные сервера'}</p>
          <ul className="flex flex-col divide-y rounded-md border bg-surface-raised/60">
            {endpoints.map((key) => {
              const ep = getEndpoint(key)
              return (
                <li key={key} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                  <span className="min-w-0 flex-1 text-pretty">{ep.purpose}</span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 font-display text-[11px] font-semibold uppercase tracking-wider',
                      ep.status === 'reference' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {ep.status === 'reference' ? 'Известен' : 'Нужен API'}
                  </span>
                </li>
              )
            })}
          </ul>
          <Link to="/profile/integration" className="self-start text-sm font-medium text-primary hover:underline">
            Карта интеграции с сервером
          </Link>
        </div>
      </div>
    </section>
  )
}
