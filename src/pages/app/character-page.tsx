import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import { Page, PageHeader } from '@/components/layout/page'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'
import { ItemIcon } from '@/components/game/item-icon'
import { toUserMessage } from '@/api/errors'
import { useGateway } from '@/features/auth/use-session'
import { useAllocateAttribute, useCampaigns, useCharacterSheet, gameKeys } from '@/features/game/queries'

export default function CharacterPage() {
  const gateway = useGateway()
  const queryClient = useQueryClient()
  const campaigns = useCampaigns('active')
  const campaignId = campaigns.data?.[0]?.id ?? ''
  const sheet = useCharacterSheet(campaignId)
  const allocate = useAllocateAttribute(campaignId)

  const action = useMutation({
    mutationFn: (input: { kind: 'use' | 'equip' | 'unequip'; id: string }) => {
      if (input.kind === 'use') return gateway.character.useItem(campaignId, input.id)
      if (input.kind === 'equip') return gateway.character.equip(campaignId, input.id)
      return gateway.character.unequip(campaignId, input.id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: gameKeys.all(gateway.mode) })
    },
  })

  if (campaigns.isLoading || sheet.isLoading) {
    return <Page><p className="text-sm text-muted-foreground">Загружаю персонажа…</p></Page>
  }
  if (!campaignId || !sheet.data) {
    return (
      <Page>
        <Notice tone="integration" title="Нет активной игры">
          Сначала <Link to="/campaigns" className="text-primary hover:underline">создай кампанию</Link>.
        </Notice>
      </Page>
    )
  }

  const character = sheet.data

  return (
    <Page>
      <PageHeader
        eyebrow="Персонаж"
        title={character.name}
        description={character.class_name ?? 'Путь ещё не выбран'}
      />

      <section className="hud-panel flex flex-col gap-3 p-5">
        <h2 className="hud-label">Характеристики</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(character.attributes).map(([key, value]) => (
            <div key={key} className="rounded-md border bg-surface-raised p-3 text-center">
              <div className="font-display text-lg font-semibold">{value}</div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{key}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Уровень {character.level} · опыт {character.xp}/{character.xp_to_next}
          {character.unspent_points > 0 ? ` · нераспределено ${character.unspent_points}` : ''}
        </p>
      </section>

      {character.unspent_points > 0 && (
        <section className="hud-panel flex flex-col gap-3 p-5" aria-label="Очки развития">
          <h2 className="hud-label">Распредели очки</h2>
          <p className="text-xs text-muted-foreground">Доступно {character.unspent_points} очков. Код сервера применит изменения.</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(character.attributes).map((key) => (
              <Button
                key={key}
                size="sm"
                variant="secondary"
                disabled={allocate.isPending}
                onClick={() => allocate.mutate({ campaign_id: campaignId, allocations: [{ id: key, delta: 1 }] })}
              >
                + {key}
              </Button>
            ))}
          </div>
          {allocate.isError && <Notice tone="danger">{toUserMessage(allocate.error)}</Notice>}
        </section>
      )}

      <section className="hud-panel flex flex-col gap-3 p-5">
        <h2 className="hud-label">Сумка</h2>
        {character.inventory.length === 0 ? (
          <p className="text-sm text-muted-foreground">Сумка пуста.</p>
        ) : (
          <ul className="flex flex-col divide-y">
            {character.inventory.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                <span className="flex min-w-0 items-center gap-3">
                  <ItemIcon item={item} />
                  <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
                </span>
                <span className="flex shrink-0 gap-2">
                  {item.usable && (
                    <Button size="sm" variant="secondary" onClick={() => action.mutate({ kind: 'use', id: item.id })}>
                      Использовать
                    </Button>
                  )}
                  {item.equippable && !item.equipped && (
                    <Button size="sm" variant="secondary" onClick={() => action.mutate({ kind: 'equip', id: item.id })}>
                      Надеть
                    </Button>
                  )}
                  {item.equipped && item.slot && (
                    <Button size="sm" variant="secondary" onClick={() => action.mutate({ kind: 'unequip', id: item.slot! })}>
                      Снять
                    </Button>
                  )}
                </span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {action.isError && <Notice tone="danger">{toUserMessage(action.error)}</Notice>}
      </section>
    </Page>
  )
}
