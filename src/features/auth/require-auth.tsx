import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { onUnauthorized } from '@/api/http'
import { FullscreenLoader } from '@/components/feedback/fullscreen-loader'
import { ErrorState } from '@/components/feedback/error-state'
import { useModeStore } from '@/stores/mode-store'
import { sessionKey, useSession } from './use-session'

export function RequireAuth() {
  const session = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const mode = useModeStore((s) => s.mode)

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      qc.setQueryData(sessionKey(mode), null)
      navigate(`/auth/login?expired=1&next=${encodeURIComponent(location.pathname)}`, { replace: true })
    })
    return () => {
      unsubscribe()
    }
  }, [qc, mode, navigate, location.pathname])

  if (session.isPending) return <FullscreenLoader label="Проверяем сессию" />
  if (session.isError) return <ErrorState error={session.error} onRetry={() => session.refetch()} fullscreen />
  if (!session.data) {
    return <Navigate to={`/auth/login?next=${encodeURIComponent(location.pathname)}`} replace />
  }
  return <Outlet />
}
