import type { z } from 'zod'
import { env } from '@/config/env'
import { ApiError, kindFromStatus } from './errors'

/**
 * Access token lives in sessionStorage: it survives a page reload but not a
 * new browser tab. The server only accepts it as a Bearer header.
 */
const TOKEN_KEY = 'argo-token'
let accessToken: string | null = sessionStorage.getItem(TOKEN_KEY)

export function setAccessToken(token: string | null) {
  accessToken = token
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

export function getAccessToken(): string | null {
  return accessToken
}

type UnauthorizedListener = () => void
const unauthorizedListeners = new Set<UnauthorizedListener>()

export function onUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

export interface RequestOptions<S extends z.ZodType> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  schema: S
  signal?: AbortSignal
  /** Sent as `Idempotency-Key` so a retried command cannot be applied twice. */
  idempotencyKey?: string
  timeoutMs?: number
}

export async function request<S extends z.ZodType>(path: string, opts: RequestOptions<S>): Promise<z.infer<S>> {
  if (!env.apiUrl) throw new ApiError('not_configured', { endpoint: path })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort('timeout'), opts.timeoutMs ?? 15_000)
  opts.signal?.addEventListener('abort', () => controller.abort(opts.signal?.reason), { once: true })

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey

  let res: Response
  try {
    res = await fetch(`${env.apiUrl}${path}`, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      credentials: 'include',
      signal: controller.signal,
    })
  } catch {
    if (controller.signal.reason === 'timeout') throw new ApiError('timeout', { endpoint: path })
    if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    throw new ApiError('network', { endpoint: path })
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    const kind = kindFromStatus(res.status)
    if (kind === 'unauthorized') unauthorizedListeners.forEach((l) => l())
    const body: unknown = await res.json().catch(() => null)
    const message =
      body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
        ? body.message
        : undefined
    throw new ApiError(kind, { status: res.status, endpoint: path, userMessage: message })
  }

  const json: unknown = res.status === 204 ? null : await res.json().catch(() => undefined)
  const parsed = opts.schema.safeParse(json)
  if (!parsed.success) {
    if (import.meta.env.DEV) console.error('ARGO: response failed validation', path, parsed.error.issues)
    throw new ApiError('invalid_response', { status: res.status, endpoint: path })
  }
  return parsed.data
}

export function createIdempotencyKey() {
  return crypto.randomUUID()
}
