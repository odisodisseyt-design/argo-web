export type ApiErrorKind =
  | 'not_configured'
  | 'not_integrated'
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'validation'
  | 'rate_limited'
  | 'server'
  | 'invalid_response'

const USER_MESSAGES: Record<ApiErrorKind, string> = {
  not_configured: 'Адрес сервера ARGO не настроен. Укажите VITE_API_URL или включите демо-режим.',
  not_integrated: 'Эта функция ещё не подключена к серверу ARGO.',
  network: 'Нет связи с сервером. Проверьте подключение к интернету.',
  timeout: 'Сервер отвечает слишком долго. Попробуйте ещё раз.',
  unauthorized: 'Сессия истекла. Войдите снова.',
  forbidden: 'У вас нет доступа к этому действию.',
  not_found: 'Запрошенные данные не найдены.',
  conflict: 'Действие уже выполнено или состояние изменилось.',
  validation: 'Проверьте введённые данные.',
  rate_limited: 'Слишком много запросов. Подождите немного.',
  server: 'На сервере произошла ошибка. Попробуйте позже.',
  invalid_response: 'Сервер вернул неожиданные данные. Мы уже знаем, как это исправить.',
}

/**
 * Normalised client-side error. `userMessage` is always safe to render;
 * raw server payloads are never exposed to the UI.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number
  readonly userMessage: string
  readonly fieldErrors?: Record<string, string>
  readonly endpoint?: string

  constructor(
    kind: ApiErrorKind,
    opts: { status?: number; userMessage?: string; fieldErrors?: Record<string, string>; endpoint?: string } = {},
  ) {
    super(`ApiError(${kind})${opts.endpoint ? ` @ ${opts.endpoint}` : ''}`)
    this.name = 'ApiError'
    this.kind = kind
    this.status = opts.status
    this.userMessage = opts.userMessage ?? USER_MESSAGES[kind]
    this.fieldErrors = opts.fieldErrors
    this.endpoint = opts.endpoint
  }

  get isRetryable() {
    return this.kind === 'network' || this.kind === 'timeout' || this.kind === 'server' || this.kind === 'rate_limited'
  }
}

export function kindFromStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return 'validation'
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status === 429) return 'rate_limited'
  return 'server'
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) return error.userMessage
  return 'Что-то пошло не так. Попробуйте ещё раз.'
}
