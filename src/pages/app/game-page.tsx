import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Page, PageHeader } from '@/components/layout/page'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'
import { toUserMessage } from '@/api/errors'
import {
  createIdempotencyKey,
  useCampaignLog,
  useScene,
  useSubmitTurn,
  useTurnStatus,
} from '@/features/game/queries'
import { useCampaignSocket } from '@/features/game/use-campaign-socket'
import { useGateway } from '@/features/auth/use-session'

export default function GamePage() {
  const { campaignId = '' } = useParams()
  const gateway = useGateway()
  const scene = useScene(campaignId)
  const status = useTurnStatus(campaignId)
  const log = useCampaignLog(campaignId)
  const submit = useSubmitTurn(campaignId)
  const [command, setCommand] = useState('')
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

      {data.class_selection && typeof data.class_selection === 'object' && 'pending' in data.class_selection && data.class_selection.pending ? (
        <Notice tone="warning" title="Выбери путь">
          Сначала выбери класс в приложении — без этого мир не примет приказ.
        </Notice>
      ) : null}

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
