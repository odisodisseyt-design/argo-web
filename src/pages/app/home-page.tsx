import { Archive, Play, Search, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { Page, PageHeader } from '@/components/layout/page'
import { useSession } from '@/features/auth/use-session'
import { useCampaigns } from '@/features/game/queries'

const QUICK_ACTIONS = [
  { to: '/campaigns', label: 'Продолжить', icon: Play },
  { to: '/campaigns', label: 'Кампании', icon: Search },
  { to: '/profile', label: 'Профиль', icon: Archive },
] as const

export default function HomePage() {
  const { data: viewer } = useSession()
  const campaigns = useCampaigns('active')
  const recent = (campaigns.data ?? []).slice(0, 3)

  return (
    <Page>
      <PageHeader
        eyebrow="Командный центр"
        title={viewer ? `С возвращением, ${viewer.username}` : 'Добро пожаловать'}
        description="Твой город, твои истории и живой мир Арго."
      />

      <nav aria-label="Быстрые действия" className="grid grid-cols-3 gap-2 sm:gap-3">
        {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="hud-panel flex flex-col items-center gap-2 p-3 text-center text-xs font-medium transition-colors hover:border-primary/50 sm:flex-row sm:p-4 sm:text-left sm:text-sm"
          >
            <span className="flex size-9 items-center justify-center rounded-md bg-primary/12 text-primary">
              <Icon className="size-[18px]" aria-hidden />
            </span>
            {label}
          </Link>
        ))}
      </nav>

      <section className="flex flex-col gap-3">
        <h2 className="hud-label">Последние кампании</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Игр пока нет. <Link to="/campaigns" className="text-primary hover:underline">Создай первую</Link>.
          </p>
        ) : (
          <ul className="grid gap-3">
            {recent.map((campaign) => (
              <li key={campaign.id}>
                <Link to={`/play/${campaign.id}`} className="hud-panel flex items-center justify-between gap-4 p-4 hover:border-primary/50">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{campaign.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {campaign.anchor.location.name} · {campaign.era_name ?? 'Арго'}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-primary">
                    {campaign.my_turn ? 'твой ход' : `ход ${campaign.step_no}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="hud-panel flex items-start gap-3 p-5">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">
          Мир живёт по шагам: погода, слухи и люди меняются даже тогда, когда ты ждёшь.
          Приказ пиши свободным текстом — сервер решает, что действительно произошло.
        </p>
      </section>
    </Page>
  )
}
