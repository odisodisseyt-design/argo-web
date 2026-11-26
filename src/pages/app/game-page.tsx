import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Page, PageHeader } from '@/components/layout/page'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'
import { toUserMessage } from '@/api/errors'
import {
  createIdempotencyKey,
  useCampaignLog,
  useClassSelection,
  useScene,
  useShop,
  useSubmitTurn,
  useTurnStatus,
} from '@/features/game/queries'
import { useCampaignSocket } from '@/features/game/use-campaign-socket'
import { useGateway } from '@/features/auth/use-session'

export default function GamePage() {
  const { campaignId = '' } = useParams()
  const gateway = useGateway()
  const queryClient = useQueryClient()
  const scene = useScene(campaignId)
  const status = useTurnStatus(campaignId)
  const log = useCampaignLog(campaignId)
  const classes = useClassSelection(campaignId)
  const shop = useShop(campaignId)
  const submit = useSubmitTurn(campaignId)
  const chooseClass = useMutation({
    mutationFn: (classId: string) => gateway.campaigns.chooseClass(campaignId, classId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['game', gateway.mode] }),
  })
  const buy = useMutation({
    mutationFn: (itemId: string) => gateway.campaigns.buy(campaignId, itemId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['game', gateway.mode] }),
  })
  const [command, setCommand] = useState(() => {
    const prepared = sessionStorage.getItem('argo-next-command') ?? ''
    if (prepared) sessionStorage.removeItem('argo-next-command')
    return prepared
  })
  const [clarificationId, setClarificationId] = useState<string | null>(null)

  useCampaignSocket(campaignId || undefined, gateway.mode)

  if (scene.isLoading) return <Page><p className="text-sm text-muted-foreground">Загружаю мир…</p></Page>
  if (scene.isError || !scene.data) {
    return <Page><Notice tone="danger">Не удалось открыть кампанию. Вернись к списку игр.</Notice></Page>
  }

  const data = scene.data
  const living = data.living
  const turn = status.data
  const entries = log.data?.pages.flatMap((page) => page.entries) ?? []

  const onSubmit = () => {
    const text = command.trim()
    if (!text || submit.isPending) return
    submit.mutate(
      {
        input: { campaign_id: campaignId, command: text, clarification_id: clarificationId },
        requestId: createIdempotencyKey(),
      },
      {
        onSuccess: (result) => {
          if (result.status === 'needs_clarification') {
            setClarificationId(result.clarification_id ?? null)
          } else {
            setCommand('')
            setClarificationId(null)
            void log.refetch()
          }
        },
      },
    )
  }

  const onNearby = (name: string) => setCommand((current) => `${current} ${name}`.trim())

  return (
    <Page className="max-w-4xl">
      <PageHeader
        eyebrow={`${data.pack_id} · ход ${data.step_no}`}
        title={data.name}
        description={data.description ?? undefined}
      />

      <section className="hud-panel flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{data.anchor.location.name}</span>
          <span aria-hidden>·</span>
          <span>{data.anchor.location.district ?? 'Москва'}</span>
          {data.anchor.location.danger && (
            <>
              <span aria-hidden>·</span>
              <span>{data.anchor.location.danger}</span>
            </>
          )}
          {living?.time_of_day && (
            <>
              <span aria-hidden>·</span>
              <span>{living.time_of_day}</span>
            </>
          )}
          {living?.weather && (
            <>
              <span aria-hidden>·</span>
              <span>{living.weather}</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {data.anchor.nearby.slice(0, 8).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNearby(item.name)}
              className="rounded-full border bg-surface-raised px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
            >
              {item.name}
            </button>
          ))}
        </div>
        {living?.events?.length ? (
          <p className="text-xs text-muted-foreground">{living.events[living.events.length - 1]}</p>
        ) : null}
      </section>

      {(living?.rumors?.length || living?.factions?.length || data.knowledge.length > 0) && (
        <section className="hud-panel flex flex-col gap-3 p-5" aria-label="Мир">
          <h2 className="hud-label">Мир вокруг</h2>
          {data.knowledge.length > 0 && (
            <p className="text-xs text-muted-foreground">Знания: {data.knowledge.join(', ')}</p>
          )}
          {living?.rumors?.length ? (
            <p className="text-sm">Слух: {living.rumors[living.rumors.length - 1]}</p>
          ) : null}
          {living?.factions?.length ? (
            <ul className="flex flex-wrap gap-2">
              {living.factions.map((faction) => (
                <li key={faction.id} className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                  {faction.name}{faction.disposition ? ` · ${faction.disposition}` : ''}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      )}

      {classes.data?.pending && classes.data.offers.length > 0 && (
        <section className="hud-panel flex flex-col gap-3 p-5" aria-label="Выбор класса">
          <h2 className="hud-label">Выбери путь</h2>
          <p className="text-sm text-muted-foreground">Без класса мир не примет приказ. Выбор определит навыки и стартовое снаряжение.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {classes.data.offers.map((offer) => (
              <button
                key={offer.id}
                type="button"
                onClick={() => chooseClass.mutate(offer.id)}
                disabled={chooseClass.isPending}
                className="rounded-md border bg-surface-raised p-4 text-left transition-colors hover:border-primary"
              >
                <span className="block font-display font-semibold">{offer.name}</span>
                <span className="block text-xs text-primary">{offer.category_name ?? offer.role}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{offer.description}</span>
              </button>
            ))}
          </div>
          {chooseClass.isError && <Notice tone="danger">{toUserMessage(chooseClass.error)}</Notice>}
        </section>
      )}

      {data.quests.filter((quest) => !quest.complete).length > 0 && (
        <section className="hud-panel flex flex-col gap-3 p-5" aria-label="Задания">
          <h2 className="hud-label">Задания</h2>
          <ul className="flex flex-col gap-3">
            {data.quests.filter((quest) => !quest.complete).slice(0, 3).map((quest) => (
              <li key={quest.id}>
                <p className="text-sm font-medium">{quest.name}</p>
                <p className="text-xs text-muted-foreground">{quest.description}</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {quest.objectives.map((objective) => (
                    <li key={objective.text} className="text-xs text-muted-foreground">
                      {objective.done ? '✓' : '○'} {objective.text}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      {shop.data && shop.data.items.length > 0 && (
        <section className="hud-panel flex flex-col gap-3 p-5" aria-label="Магазин">
          <h2 className="hud-label">Магазин</h2>
          <ul className="flex flex-col divide-y">
            {shop.data.items.slice(0, 5).map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm">{item.name}</span>
                  <span className="block text-xs text-muted-foreground">{item.price} {item.currency} · осталось {item.stock}</span>
                </span>
                <Button size="sm" variant="secondary" disabled={item.stock < 1 || buy.isPending} onClick={() => buy.mutate(item.id)}>
                  Купить
                </Button>
              </li>
            ))}
          </ul>
          {buy.isError && <Notice tone="danger">{toUserMessage(buy.error)}</Notice>}
        </section>
      )}

      <section className="hud-panel flex flex-col gap-3 p-5" aria-label="Ход">
        <div className="flex items-center justify-between gap-3">
          <h2 className="hud-label">Что происходит</h2>
          <span className="text-xs text-muted-foreground">
            {turn?.my_turn ? 'Твой ход' : data.my_turn ? 'Твой ход' : 'Ожидание'}
          </span>
        </div>
        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">История пока пуста. Сделай первый шаг.</p>
          ) : entries.map((entry) => (
            <article key={entry.id} className="rounded-md border bg-surface-raised p-3">
              <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Ход {entry.turnNumber}</p>
              <p className="text-sm leading-relaxed">{entry.text}</p>
            </article>
          ))}
        </div>
        {log.hasNextPage && (
          <button
            type="button"
            onClick={() => void log.fetchNextPage()}
            className="self-start text-xs text-primary hover:underline"
          >
            Показать раньше
          </button>
        )}
      </section>

      {turn?.participants?.length ? (
        <section className="flex flex-wrap gap-2" aria-label="Участники">
          {turn.participants.map((person) => (
            <span
              key={`${person.name}-${person.isYou}`}
              className={`rounded-full border px-3 py-1 text-xs ${person.submitted ? 'border-success/40 text-success' : 'text-muted-foreground'}`}
            >
              {person.name}{person.isYou ? ' (ты)' : ''} — {person.submitted ? 'сдал' : 'ждут'}
            </span>
          ))}
        </section>
      ) : null}

      <section className="hud-panel flex flex-col gap-3 p-5" aria-label="Приказ">
        <h2 className="hud-label">Твой приказ</h2>
        {submit.data?.status === 'needs_clarification' && submit.data.clarification && (
          <Notice tone="warning" title="Уточни">
            {submit.data.clarification}
          </Notice>
        )}
        <textarea
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Напиши свободным текстом, что делаешь…"
          className="w-full resize-none rounded-md border bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        {submit.isError && <Notice tone="danger">{toUserMessage(submit.error)}</Notice>}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{command.length}/1000</span>
          <Button onClick={onSubmit} loading={submit.isPending} disabled={!command.trim()}>
            Отправить приказ
          </Button>
        </div>
      </section>

      <nav className="flex flex-wrap gap-3 text-sm text-primary">
        <Link to="/campaigns" className="hover:underline">К кампаниям</Link>
        <Link to="/map" className="hover:underline">Карта</Link>
        <Link to="/character" className="hover:underline">Персонаж</Link>
      </nav>
    </Page>
  )
}
