import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/errors'
import { getGateway } from '@/api/gateway'
import { useModeStore } from '@/stores/mode-store'

export const sessionKey = (mode: string) => ['session', mode] as const

export function useGateway() {
  const mode = useModeStore((s) => s.mode)
  return getGateway(mode)
}

export function useSession() {
  const gateway = useGateway()
  return useQuery({
    queryKey: sessionKey(gateway.mode),
    queryFn: async () => {
      try {
        return await gateway.auth.getSession()
      } catch (e) {
        // No confirmed session endpoint or no session → treated as signed out.
        if (e instanceof ApiError && (e.kind === 'not_integrated' || e.kind === 'unauthorized' || e.kind === 'not_configured')) {
          return null
        }
        throw e
      }
    },
    staleTime: 5 * 60_000,
    retry: (count, e) => e instanceof ApiError && e.isRetryable && count < 2,
  })
}

export function useLogin() {
  const gateway = useGateway()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: gateway.auth.login,
    onSuccess: (viewer) => qc.setQueryData(sessionKey(gateway.mode), viewer),
  })
}

export function useLogout() {
  const gateway = useGateway()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      try {
        await gateway.auth.logout()
      } catch (e) {
        if (!(e instanceof ApiError && e.kind === 'not_integrated')) throw e
      }
    },
    onSettled: () => {
      qc.setQueryData(sessionKey(gateway.mode), null)
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== 'session' })
    },
  })
}
