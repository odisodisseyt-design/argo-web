import { RotateCw, WifiOff, ServerCrash } from 'lucide-react'
import { ApiError, toUserMessage } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
  fullscreen?: boolean
}

export function ErrorState({ error, onRetry, fullscreen }: ErrorStateProps) {
  const offline = error instanceof ApiError && (error.kind === 'network' || error.kind === 'timeout')
  const Icon = offline ? WifiOff : ServerCrash
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-6 py-12 text-center',
        fullscreen && 'min-h-dvh',
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full border bg-surface">
        <Icon className="size-6 text-danger" aria-hidden />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <h2 className="text-lg font-bold">{offline ? 'Связь потеряна' : 'Не удалось загрузить'}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{toUserMessage(error)}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <RotateCw aria-hidden />
          Повторить
        </Button>
      )}
    </div>
  )
}
