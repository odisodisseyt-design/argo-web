import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { env } from '@/config/env'
import { getAccessToken } from '@/api/http'
import { gameKeys } from './queries'

/**
 * Live campaign events. The token is passed as a WebSocket subprotocol, never
 * in the URL, so proxies do not log it. Any event only invalidates queries:
 * the server remains the single source of truth.
 */
export function useCampaignSocket(campaignId: string | undefined, mode: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!campaignId || !env.apiUrl || mode !== 'live') return
    const token = getAccessToken()
    if (!token) return

    const base = env.wsUrl ?? env.apiUrl.replace(/^http/, 'ws')
    const url = `${base}/ws/campaign/${encodeURIComponent(campaignId)}`
    let socket: WebSocket
    try {
      socket = new WebSocket(url, [token])
    } catch {
      return
    }
    socket.onmessage = () => {
      void queryClient.invalidateQueries({ queryKey: gameKeys.scene(mode, campaignId) })
      void queryClient.invalidateQueries({ queryKey: gameKeys.turn(mode, campaignId) })
      void queryClient.invalidateQueries({ queryKey: gameKeys.log(mode, campaignId) })
    }
    return () => socket.close()
  }, [campaignId, mode, queryClient])
}
