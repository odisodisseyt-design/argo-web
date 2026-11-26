import { Page, PageHeader } from '@/components/layout/page'
import { ENDPOINTS } from '@/api/endpoints'
import { env, isBackendConfigured } from '@/config/env'
import { cn } from '@/lib/utils'

export default function IntegrationPage() {
  const known = ENDPOINTS.filter((e) => e.status === 'reference')
  const pending = ENDPOINTS.filter((e) => e.status === 'pending')

  return (
    <Page className="max-w-3xl">
      <PageHeader
        eyebrow="Интеграция"
        title="Карта соответствия с сервером"
        description="Какие данные нужны каждому экрану. «Известен» — маршрут указан в ТЗ, но его схема ещё не сверена с backend. «Нужен API» — маршрут необходимо согласовать."
      />
      <section className="hud-panel flex flex-col gap-2 p-5 text-sm">
        <h2 className="hud-label">Конфигурация</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
          <dt className="text-muted-foreground">VITE_API_URL</dt>
          <dd className="truncate font-mono text-xs leading-5">{env.apiUrl || 'не задан'}</dd>
          <dt className="text-muted-foreground">VITE_WS_URL</dt>
          <dd className="truncate font-mono text-xs leading-5">{env.wsUrl || 'не задан'}</dd>
          <dt className="text-muted-foreground">Статус</dt>
          <dd>{isBackendConfigured ? 'Адрес задан' : 'Сервер не настроен'}</dd>
        </dl>
      </section>
      <EndpointTable title={`Известные из ТЗ · ${known.length}`} items={known} />
      <EndpointTable title={`Требуют согласования · ${pending.length}`} items={pending} />
    </Page>
  )
}

function EndpointTable({ title, items }: { title: string; items: readonly (typeof ENDPOINTS)[number][] }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="hud-label">{title}</h2>
      <ul className="hud-panel flex flex-col divide-y overflow-hidden">
        {items.map((e) => (
          <li key={e.key} className="flex flex-col gap-1 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-primary">{e.key}</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase', e.transport === 'ws' ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground')}>
                {e.transport}
              </span>
            </div>
            <p className="text-sm">{e.purpose}</p>
            {'path' in e && e.path && <p className="font-mono text-xs text-muted-foreground">{'method' in e && e.method ? `${e.method} ` : ''}{e.path}</p>}
            <p className="text-xs text-muted-foreground">Экраны: {e.screens.join(', ')}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
