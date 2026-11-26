import { FlaskConical, WifiOff } from 'lucide-react'
import { useOnline } from '@/hooks/use-online'
import { useModeStore } from '@/stores/mode-store'

export function ModeBanner() {
  const mode = useModeStore((s) => s.mode)
  const online = useOnline()

  if (!online) {
    return (
      <div role="status" className="flex items-center justify-center gap-2 bg-danger px-4 py-1.5 text-xs font-medium text-danger-foreground">
        <WifiOff className="size-3.5" aria-hidden />
        Нет подключения. Приказы не будут отправлены, пока связь не восстановится.
      </div>
    )
  }
  if (mode === 'demo') {
    return (
      <div role="status" className="flex items-center justify-center gap-2 bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground">
        <FlaskConical className="size-3.5" aria-hidden />
        Демо-режим — данные локальные и не подтверждены сервером ARGO
      </div>
    )
  }
  return null
}
