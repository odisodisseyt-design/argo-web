import { useRouteError } from 'react-router'
import { ErrorState } from '@/components/feedback/error-state'

export function RouteError() {
  const error = useRouteError()
  return <ErrorState error={error} onRetry={() => window.location.reload()} fullscreen />
}
