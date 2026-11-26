import { Bell } from 'lucide-react'
import { Link } from 'react-router'
import { Page, PageHeader } from '@/components/layout/page'
import { Notice } from '@/components/ui/notice'
import { useNotifications } from '@/features/game/queries'

export default function NotificationsPage() {
  const notifications = useNotifications()

  return (
    <Page>
      <PageHeader eyebrow="События" title="Лента мира" description="Последние подтверждённые события активной кампании." />

      {notifications.isLoading && <p className="text-sm text-muted-foreground">Загружаю события…</p>}
      {notifications.isError && <Notice tone="danger">Не удалось загрузить события.</Notice>}
      {!notifications.isLoading && (notifications.data?.length ?? 0) === 0 && (
        <Notice tone="integration" title="Пока тихо">
          Мир пока не прислал событий. Сделай ход — и здесь появится его результат.
        </Notice>
      )}

      <ul className="flex flex-col gap-2">
        {(notifications.data ?? []).map((item) => (
          <li key={item.id} className="hud-panel flex items-start gap-3 p-4">
            <Bell className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0">
              <span className="block text-sm font-medium">{item.title}</span>
              {item.body && <span className="block text-xs text-muted-foreground">{item.body}</span>}
              {item.campaignId && (
                <Link to={`/play/${item.campaignId}`} className="mt-1 block text-xs text-primary hover:underline">
                  Открыть кампанию
                </Link>
              )}
            </span>
          </li>
        ))}
      </ul>
    </Page>
  )
}
