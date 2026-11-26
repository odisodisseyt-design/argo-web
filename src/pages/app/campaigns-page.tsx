import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { Search, Swords } from 'lucide-react'
import { Page, PageHeader } from '@/components/layout/page'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'
import { toUserMessage } from '@/api/errors'
import { useCampaigns } from '@/features/game/queries'
import { useGateway } from '@/features/auth/use-session'

export default function CampaignsPage() {
  const gateway = useGateway()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const campaigns = useCampaigns('active')
  const create = useMutation({
    mutationFn: (name: string) => gateway.campaigns.create(name),
    onSuccess: (result) => {
      void campaigns.refetch()
      navigate(`/play/${result.campaign_id}`)
    },
  })
  const [name, setName] = useState('')

  const items = (campaigns.data ?? []).filter((item) =>
    !query || item.name.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <Page>
      <PageHeader eyebrow="Кампании" title="Ваши истории" description="Совместные приказы в живом мире Арго." />

      <section className="hud-panel flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="hud-label">Новая игра</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Название кампании"
            className="mt-1 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-primary"
          />
        </label>
        <Button onClick={() => name.trim() && create.mutate(name.trim())} loading={create.isPending} disabled={!name.trim()}>
          Создать
        </Button>
      </section>
      {create.isError && <Notice tone="danger">{toUserMessage(create.error)}</Notice>}

      <label className="relative">
        <span className="sr-only">Поиск кампаний</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Название кампании"
          className="h-11 w-full rounded-md border bg-surface pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-primary"
        />
      </label>

      {campaigns.isLoading && <p className="text-sm text-muted-foreground">Загружаю кампании…</p>}
      {campaigns.isError && <Notice tone="danger">Не удалось загрузить список кампаний.</Notice>}
      {!campaigns.isLoading && items.length === 0 && (
        <Notice tone="integration" title="Пока нет игр">
          Создай кампанию выше — мир «Арго» создаст стартовую сцену сразу.
        </Notice>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((campaign) => (
          <li key={campaign.id}>
            <Link
              to={`/play/${campaign.id}`}
              className="hud-panel flex h-full flex-col gap-2 p-5 transition-colors hover:border-primary/50"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-display font-semibold">{campaign.name}</span>
                <Swords className="size-4 shrink-0 text-primary" aria-hidden />
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{campaign.description}</p>
              <p className="mt-auto text-xs text-muted-foreground">
                {campaign.anchor.location.name} · ход {campaign.step_no} · {campaign.my_turn ? 'твой ход' : 'ожидание'}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  )
}
