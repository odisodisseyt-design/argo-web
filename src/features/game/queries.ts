import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/errors'
import { createIdempotencyKey } from '@/api/gateway'
import {
  NO_CAPABILITIES,
  type AllocateInput,
  type CampaignScope,
  type SubmitTurnInput,
} from '@/api/schemas/game'
import { useGateway } from '@/features/auth/use-session'

export const gameKeys = {
  all: (mode: string) => ['game', mode] as const,
  capabilities: (mode: string) => ['game', mode, 'capabilities'] as const,
  worlds: (mode: string) => ['game', mode, 'worlds'] as const,
  campaigns: (mode: string, scope?: CampaignScope) => (scope ? (['game', mode, 'campaigns', scope] as const) : (['game', mode, 'campaigns'] as const)),
  scene: (mode: string, id: string) => ['game', mode, 'campaign', id, 'scene'] as const,
  turn: (mode: string, id: string) => ['game', mode, 'campaign', id, 'turn'] as const,
  log: (mode: string, id: string) => ['game', mode, 'campaign', id, 'log'] as const,
  npcs: (mode: string, id: string) => ['game', mode, 'campaign', id, 'npcs'] as const,
  map: (mode: string, id: string) => ['game', mode, 'campaign', id, 'map'] as const,
  sheet: (mode: string, id: string) => ['game', mode, 'campaign', id, 'sheet'] as const,
  inventory: (mode: string, id: string) => ['game', mode, 'campaign', id, 'inventory'] as const,
  invites: (mode: string) => ['game', mode, 'invites'] as const,
  classes: (mode: string, id: string) => ['game', mode, 'campaign', id, 'classes'] as const,
  shop: (mode: string, id: string) => ['game', mode, 'campaign', id, 'shop'] as const,
  notifications: (mode: string) => ['game', mode, 'notifications'] as const,
}

/** Retry only transient failures. A missing integration or auth error is final. */
export const retryTransient = (count: number, error: unknown) => error instanceof ApiError && error.isRetryable && count < 2

const STALE = 30_000

export function useCapabilities() {
  const g = useGateway()
  return useQuery({
    queryKey: gameKeys.capabilities(g.mode),
    queryFn: async () => {
      try {
        return await g.meta.getCapabilities()
      } catch (e) {
        if (e instanceof ApiError && (e.kind === 'not_integrated' || e.kind === 'not_configured')) return NO_CAPABILITIES
        throw e
      }
    },
    staleTime: 5 * 60_000,
    retry: retryTransient,
  })
}

export function useWorlds() {
  const g = useGateway()
  return useQuery({ queryKey: gameKeys.worlds(g.mode), queryFn: () => g.worlds.list(), staleTime: 5 * 60_000, retry: retryTransient })
}

export function useCampaigns(scope: CampaignScope, enabled = true) {
  const g = useGateway()
  return useQuery({
    queryKey: gameKeys.campaigns(g.mode, scope),
    queryFn: () => g.campaigns.list(scope),
    staleTime: STALE,
    retry: retryTransient,
    enabled,
  })
}

export function useScene(campaignId: string) {
  const g = useGateway()
  return useQuery({
    queryKey: gameKeys.scene(g.mode, campaignId),
    queryFn: () => g.campaigns.getScene(campaignId),
    staleTime: STALE,
    retry: retryTransient,
  })
}

/**
 * Turn status is polled as a fallback; WebSocket events trigger an immediate refetch.
 * Demo has no socket, so it polls faster.
 */
export function useTurnStatus(campaignId: string) {
  const g = useGateway()
  return useQuery({
    queryKey: gameKeys.turn(g.mode, campaignId),
    queryFn: () => g.campaigns.getTurnStatus(campaignId),
    refetchInterval: g.mode === 'demo' ? 2000 : 20_000,
    staleTime: 0,
    retry: retryTransient,
  })
}

export function useCampaignLog(campaignId: string) {
  const g = useGateway()
  return useInfiniteQuery({
    queryKey: gameKeys.log(g.mode, campaignId),
    queryFn: ({ pageParam }) => g.campaigns.getLog(campaignId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    staleTime: STALE,
    retry: retryTransient,
  })
}

export function useNpcs(campaignId: string) {
  const g = useGateway()
  return useQuery({ queryKey: gameKeys.npcs(g.mode, campaignId), queryFn: () => g.campaigns.getNpcs(campaignId), staleTime: STALE, retry: retryTransient })
}

export function useMapState(campaignId: string) {
  const g = useGateway()
  return useQuery({ queryKey: gameKeys.map(g.mode, campaignId), queryFn: () => g.campaigns.getMap(campaignId), staleTime: STALE, retry: retryTransient })
}

export function useCharacterSheet(campaignId: string) {
  const g = useGateway()
  return useQuery({ queryKey: gameKeys.sheet(g.mode, campaignId), queryFn: () => g.character.getSheet(campaignId), staleTime: STALE, retry: retryTransient })
}

export function useInventory(campaignId: string) {
  const g = useGateway()
  return useQuery({ queryKey: gameKeys.inventory(g.mode, campaignId), queryFn: () => g.character.getInventory(campaignId), staleTime: STALE, retry: retryTransient })
}

export function useInvites() {
  const g = useGateway()
  return useQuery({
    queryKey: gameKeys.invites(g.mode),
    queryFn: () => g.campaigns.listInvites(),
    staleTime: STALE,
    retry: retryTransient,
  })
}

export function useClassSelection(campaignId: string) {
  const g = useGateway()
  return useQuery({
    queryKey: gameKeys.classes(g.mode, campaignId),
    queryFn: () => g.campaigns.classes(campaignId),
    retry: retryTransient,
  })
}

export function useShop(campaignId: string) {
  const g = useGateway()
  return useQuery({
    queryKey: gameKeys.shop(g.mode, campaignId),
    queryFn: () => g.campaigns.shop(campaignId),
    staleTime: STALE,
    retry: retryTransient,
  })
}

export function useNotifications() {
  const g = useGateway()
  return useQuery({ queryKey: gameKeys.notifications(g.mode), queryFn: () => g.notifications.list(), staleTime: STALE, retry: retryTransient })
}

/* ---------- Commands. State is only updated from the server's answer. ---------- */

export function useSubmitTurn(campaignId: string) {
  const g = useGateway()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ input, requestId }: { input: SubmitTurnInput; requestId: string }) => g.campaigns.submitTurn(input, requestId),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: gameKeys.turn(g.mode, campaignId) })
      void qc.invalidateQueries({ queryKey: gameKeys.campaigns(g.mode) })
    },
  })
}

export function useRespondInvitation() {
  const g = useGateway()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ invitationId, accept }: { invitationId: string; accept: boolean }) => g.campaigns.respondInvitation(invitationId, accept),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: gameKeys.campaigns(g.mode) })
      void qc.invalidateQueries({ queryKey: gameKeys.notifications(g.mode) })
    },
  })
}

export function useJoinCampaign() {
  const g = useGateway()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (campaignId: string) => g.campaigns.join(campaignId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: gameKeys.campaigns(g.mode) }),
  })
}

export function useAllocateAttribute(campaignId: string) {
  const g = useGateway()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AllocateInput) => g.character.allocate(campaignId, input),
    onSuccess: (sheet) => qc.setQueryData(gameKeys.sheet(g.mode, campaignId), sheet),
  })
}

export function useMarkRead() {
  const g = useGateway()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[] | 'all') => g.notifications.markRead(ids),
    onSuccess: () => void qc.invalidateQueries({ queryKey: gameKeys.notifications(g.mode) }),
  })
}

export { createIdempotencyKey }
