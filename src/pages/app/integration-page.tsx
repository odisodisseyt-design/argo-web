import { Page, PageHeader } from '@/components/layout/page'
import { env } from '@/config/env'

const ROUTES = [
  ['Вход и регистрация', 'POST /api/auth/login, /api/auth/register, GET /api/me'],
  ['Кампании', 'GET /api/campaigns/mine, POST /api/campaign/new'],
  ['Приглашения', 'GET /api/invites, POST /api/invites/{id}/accept'],
  ['Ход', 'POST /api/turn, GET /api/campaign/{id}/step/status'],
  ['История и события', 'GET /api/campaign/{id}/steps, GET /api/campaign/{id}/events'],
  ['Персонаж', 'GET /api/campaign/{id}, POST /api/allocate, /api/inventory/*, /api/shop/*'],
  ['Классы', 'GET /api/classes/{id}, POST /api/class/choose'],
  ['Карта Москвы', 'GET /api/map/{pack_id}, map_nodes из сцены'],
  ['События в реальном времени', 'WS /ws/campaign/{id}'],
] as const

export default function IntegrationPage() {
  return (
    <Page className="max-w-3xl">
      <PageHeader
        eyebrow="Интеграция"
        title="Связь с сервером"
        description="Веб-клиент показывает только данные, которые подтвердил сервер ARGO."
      />
      <section className="hud-panel flex flex-col gap-3 p-5">
        <h2 className="hud-label">Адреса</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted-foreground">API</dt>
          <dd className="truncate font-mono text-xs">{env.apiUrl}</dd>
          <dt className="text-muted-foreground">WebSocket</dt>
          <dd className="truncate font-mono text-xs">{env.wsUrl}</dd>
        </dl>
      </section>
      <ul className="hud-panel flex flex-col divide-y">
        {ROUTES.map(([label, routes]) => (
          <li key={label} className="flex flex-col gap-1 p-4">
            <span className="text-sm font-medium">{label}</span>
            <span className="font-mono text-xs text-muted-foreground">{routes}</span>
          </li>
        ))}
      </ul>
    </Page>
  )
}
