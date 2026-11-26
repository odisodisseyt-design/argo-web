import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'
import { isBackendConfigured } from '@/config/env'
import { useModeStore } from '@/stores/mode-store'

/** Explains why live auth is unavailable and offers an explicit switch to demo mode. */
export function BackendStatusNotice() {
  const mode = useModeStore((s) => s.mode)
  const setMode = useModeStore((s) => s.setMode)
  const qc = useQueryClient()

  const switchTo = (next: 'live' | 'demo') => {
    setMode(next)
    qc.clear()
  }

  if (mode === 'demo') {
    return (
      <Notice
        tone="warning"
        title="Вы в демо-режиме"
        action={
          <Button variant="link" size="sm" onClick={() => switchTo('live')}>
            Вернуться к серверу ARGO
          </Button>
        }
      >
        Вход локальный: данные не отправляются на сервер и не подтверждаются им.
      </Notice>
    )
  }

  return (
    <Notice
      tone="integration"
      title={isBackendConfigured ? 'Авторизация ещё не подключена' : 'Сервер ARGO не настроен'}
      action={
        <Button variant="link" size="sm" onClick={() => switchTo('demo')}>
          Открыть демо-режим
        </Button>
      }
    >
      {isBackendConfigured
        ? 'Маршруты входа на сервере ещё не согласованы. Это интеграционная задача.'
        : 'Укажите VITE_API_URL, чтобы входить через настоящий сервер.'}
    </Notice>
  )
}
