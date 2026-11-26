import { z } from 'zod'

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === '' ? undefined : v.replace(/\/+$/, '')))
  .pipe(z.url().optional())

const EnvSchema = z.object({
  VITE_API_URL: optionalUrl.default(''),
  VITE_WS_URL: optionalUrl.default(''),
})

const parsed = EnvSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL ?? '',
  VITE_WS_URL: import.meta.env.VITE_WS_URL ?? '',
})

if (!parsed.success) {
  console.error('ARGO: invalid VITE_API_URL / VITE_WS_URL configuration')
}

const API_FALLBACK = 'https://v3310666.hosted-by-vdsina.ru'
const WS_FALLBACK = 'wss://v3310666.hosted-by-vdsina.ru'

export const env = {
  apiUrl: parsed.success ? parsed.data.VITE_API_URL || API_FALLBACK : API_FALLBACK,
  wsUrl: parsed.success ? parsed.data.VITE_WS_URL || WS_FALLBACK : WS_FALLBACK,
} as const

export const isBackendConfigured = Boolean(env.apiUrl)
