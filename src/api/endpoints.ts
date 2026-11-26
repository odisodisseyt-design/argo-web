import { ApiError } from './errors'

/**
 * Screen ↔ server data map.
 *
 * - `reference`: route is known from the project brief; request/response schemas
 *   still have to be verified against the real ARGO backend.
 * - `pending`: required by the client but not yet confirmed to exist on the backend.
 *   No path is guessed — the client refuses to call it (integration task).
 */
export type EndpointStatus = 'reference' | 'pending'

export interface EndpointSpec {
  key: string
  status: EndpointStatus
  transport: 'http' | 'ws'
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path?: string
  purpose: string
  screens: string[]
}

export const ENDPOINTS = [
  {
    key: 'turn.submit',
    status: 'reference',
    transport: 'http',
    method: 'POST',
    path: '/api/turn',
    purpose: 'Отправка приказа игрока на текущий ход',
    screens: ['Игровой экран'],
  },
  {
    key: 'campaign.stepStatus',
    status: 'reference',
    transport: 'http',
    method: 'GET',
    path: '/api/campaign/{id}/step/status',
    purpose: 'Текущая фаза хода и статусы приказов участников',
    screens: ['Игровой экран', 'Кампании'],
  },
  {
    key: 'campaign.socket',
    status: 'reference',
    transport: 'ws',
    path: '/api/campaign/{id}/ws',
    purpose: 'События кампании в реальном времени',
    screens: ['Игровой экран', 'Уведомления'],
  },
  { key: 'auth.login', status: 'pending', transport: 'http', purpose: 'Вход по email и паролю', screens: ['Вход'] },
  { key: 'auth.register', status: 'pending', transport: 'http', purpose: 'Регистрация аккаунта', screens: ['Регистрация'] },
  { key: 'auth.passwordReset', status: 'pending', transport: 'http', purpose: 'Запрос и подтверждение сброса пароля', screens: ['Восстановление пароля'] },
  { key: 'auth.verify', status: 'pending', transport: 'http', purpose: 'Подтверждение аккаунта по токену из письма', screens: ['Подтверждение аккаунта'] },
  { key: 'auth.session', status: 'pending', transport: 'http', purpose: 'Текущий пользователь и обновление сессии (HttpOnly cookie)', screens: ['Все защищённые экраны'] },
  { key: 'auth.logout', status: 'pending', transport: 'http', purpose: 'Завершение сессии на сервере', screens: ['Выход', 'Профиль'] },
  { key: 'worlds.list', status: 'pending', transport: 'http', purpose: 'Доступные игровые миры и их визуальный стиль', screens: ['Главная'] },
  { key: 'campaigns.list', status: 'pending', transport: 'http', purpose: 'Активные, доступные и архивные кампании', screens: ['Главная', 'Кампании'] },
  { key: 'campaigns.invitations', status: 'pending', transport: 'http', purpose: 'Приглашения в кампании', screens: ['Кампании', 'Уведомления'] },
  { key: 'campaign.scene', status: 'pending', transport: 'http', purpose: 'Локация, окружение, участники и NPC рядом', screens: ['Игровой экран'] },
  { key: 'campaign.log', status: 'pending', transport: 'http', purpose: 'Постраничная история кампании и журнал событий', screens: ['Игровой экран', 'История'] },
  { key: 'character.sheet', status: 'pending', transport: 'http', purpose: 'Характеристики, навыки, способности, история развития', screens: ['Персонаж'] },
  { key: 'character.inventory', status: 'pending', transport: 'http', purpose: 'Инвентарь, экипировка, вместимость', screens: ['Персонаж', 'Инвентарь'] },
  { key: 'map.state', status: 'pending', transport: 'http', purpose: 'Игровые маркеры, исследованные зоны, маршруты', screens: ['Карта'] },
  { key: 'npc.known', status: 'pending', transport: 'http', purpose: 'Известные персонажу NPC и разрешённые сведения', screens: ['NPC'] },
  { key: 'notifications.list', status: 'pending', transport: 'http', purpose: 'Уведомления и отметка прочитанного', screens: ['Уведомления'] },
  { key: 'campaigns.respondInvitation', status: 'pending', transport: 'http', purpose: 'Принять или отклонить приглашение', screens: ['Кампании', 'Уведомления'] },
  { key: 'campaigns.join', status: 'pending', transport: 'http', purpose: 'Вступление в доступную кампанию', screens: ['Кампании'] },
  { key: 'character.allocate', status: 'pending', transport: 'http', purpose: 'Команда распределения характеристик (если разрешено сервером)', screens: ['Персонаж'] },
  { key: 'notifications.markRead', status: 'pending', transport: 'http', purpose: 'Отметка уведомлений прочитанными', screens: ['Уведомления'] },
  { key: 'meta.capabilities', status: 'pending', transport: 'http', purpose: 'Возможности, которые сервер разрешает этому игроку', screens: ['Главная', 'Персонаж', 'Профиль'] },
  { key: 'push.subscribe', status: 'pending', transport: 'http', purpose: 'Регистрация Web Push подписки', screens: ['Профиль'] },
] as const satisfies readonly EndpointSpec[]

export type EndpointKey = (typeof ENDPOINTS)[number]['key']

export function getEndpoint(key: EndpointKey): EndpointSpec {
  return ENDPOINTS.find((e) => e.key === key)!
}

/** Thrown instead of calling an endpoint whose contract is not confirmed yet. */
export function notIntegrated(key: EndpointKey): never {
  throw new ApiError('not_integrated', { endpoint: key })
}
