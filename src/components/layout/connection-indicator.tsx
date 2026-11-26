import { isBackendConfigured } from '@/config/env'
import { getAccessToken } from '@/api/http'
import { useOnline } from '@/hooks/use-online'
import { useModeStore } from '@/stores/mode-store'
import { cn } from '@/lib/utils'

export function useConnectionState() {
  const online = useOnline()
  const mode = useModeStore((s) => s.mode)
  if (!online) return { tone: 'danger', label: 'Нет сети', detail: 'Устройство не в сети' } as const
  if (mode === 'demo') return { tone: 'warning', label: 'Демо', detail: 'Демо-режим: данные не с сервера' } as const
  if (!isBackendConfigured) return { tone: 'danger', label: 'Нет адреса', detail: 'Сервер не настроен' } as const
  if (!getAccessToken()) return { tone: 'muted', label: 'Гость', detail: 'Войди в аккаунт' } as const
  return { tone: 'success', label: 'Сервер', detail: 'Подключено к ARGO' } as const
}

const DOT = {
  danger: 'bg-danger',
  warning: 'bg-accent',
  muted: 'bg-muted-foreground',
  success: 'bg-success',
} as const

export function ConnectionIndicator({ className, withLabel = true }: { className?: string; withLabel?: boolean }) {
  const state = useConnectionState()
  return (
    <span
      className={cn('inline-flex items-center gap-2 rounded-full border bg-surface px-2.5 py-1 text-xs', className)}
      role="status"
      aria-label={state.detail}
      title={state.detail}
    >
      <span className="relative flex size-2" aria-hidden>
        {state.tone === 'success' && <span className={cn('absolute inset-0 animate-ping rounded-full opacity-60', DOT[state.tone])} />}
        <span className={cn('relative size-2 rounded-full', DOT[state.tone])} />
      </span>
      {withLabel && <span className="font-display font-semibold tracking-wide">{state.label}</span>}
    </span>
  )
}
