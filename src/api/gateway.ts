import { z } from 'zod'
import type { LoginInput, RegisterInput, Viewer } from './schemas/auth'
import { authResultSchema, ViewerSchema } from './schemas/auth'
import {
  allocateInputSchema,
  campaignStateSchema,
  characterSchema,
  classSelectionSchema,
  inventorySchema,
  inviteSchema,
  logPageSchema,
  mapStateSchema,
  basemapSchema,
  npcSchema,
  notificationSchema,
  shopSchema,
  stepSchema,
  submitTurnResultSchema,
  turnStatusSchema,
  worldSchema,
  NO_CAPABILITIES,
  type AllocateInput,
  type AppNotification,
  type CampaignState,
  type Capabilities,
  type Character,
  type ClassSelection,
  type Inventory,
  type Invite,
  type Item,
  type LogPage,
  type MapState,
  type Npc,
  type Shop,
  type SubmitTurnInput,
  type SubmitTurnResult,
  type TurnStatus,
  type World,
} from './schemas/game'
import { notIntegrated } from './endpoints'
import { ApiError } from './errors'
import { createIdempotencyKey, request, setAccessToken } from './http'
import type { AppMode } from '@/stores/mode-store'

/**
 * Every screen talks only to this contract. The live implementation maps the
 * real ARGO HTTP API into the shapes the UI understands; engine internals and
 * raw error payloads never reach React components.
 */
export interface ArgoGateway {
  mode: AppMode
  auth: {
    getSession(): Promise<Viewer | null>
    login(input: LoginInput): Promise<Viewer>
    register(input: RegisterInput): Promise<{ requiresVerification: boolean; viewer: Viewer }>
    requestPasswordReset(input: { email: string }): Promise<void>
    verifyAccount(code: string): Promise<void>
    logout(): Promise<void>
  }
  meta: { getCapabilities(): Promise<Capabilities> }
  worlds: { list(): Promise<World[]> }
  campaigns: {
    create(name: string): Promise<{ campaign_id: string }>
    list(scope: string): Promise<CampaignState[]>
    listInvites(): Promise<Invite[]>
    acceptInvite(inviteId: string): Promise<void>
    classes(campaignId: string): Promise<ClassSelection>
    chooseClass(campaignId: string, classId: string): Promise<void>
    shop(campaignId: string): Promise<Shop>
    buy(campaignId: string, itemId: string): Promise<void>
    respondInvitation(invitationId: string, accept: boolean): Promise<void>
    join(campaignId: string): Promise<void>
    getScene(campaignId: string): Promise<CampaignState>
    getTurnStatus(campaignId: string): Promise<TurnStatus>
    submitTurn(input: SubmitTurnInput, requestId: string): Promise<SubmitTurnResult>
    getLog(campaignId: string, cursor: string | null): Promise<LogPage>
    getNpcs(campaignId: string): Promise<Npc[]>
    getMap(campaignId: string): Promise<MapState>
  }
  character: {
    getSheet(campaignId: string): Promise<Character>
    getInventory(campaignId: string): Promise<Inventory>
    allocate(campaignId: string, input: Omit<AllocateInput, 'campaign_id'>): Promise<Character>
    useItem(campaignId: string, itemId: string): Promise<Character>
    equip(campaignId: string, itemId: string): Promise<Character>
    unequip(campaignId: string, slot: string): Promise<Character>
  }
  notifications: {
    list(): Promise<AppNotification[]>
    markRead(ids: string[] | 'all'): Promise<void>
  }
}

const withId = (path: string, id: string) => path.replace('{id}', encodeURIComponent(id))

const viewerFromUser = (value: z.infer<typeof ViewerSchema>) => value

const liveGateway: ArgoGateway = {
  mode: 'live',
  auth: {
    async getSession() {
      try {
        return viewerFromUser(await request('/api/me', { schema: ViewerSchema }))
      } catch (error) {
        if (error instanceof ApiError && error.kind === 'unauthorized') return null
        throw error
      }
    },
    async login(input) {
      const result = await request('/api/auth/login', {
        method: 'POST', body: input, schema: authResultSchema,
      })
      setAccessToken(result.token)
      return viewerFromUser(result.user)
    },
    async register(input) {
      const result = await request('/api/auth/register', {
        method: 'POST',
        body: { username: input.username, password: input.password },
        schema: authResultSchema,
      })
      setAccessToken(result.token)
      return { requiresVerification: false, viewer: viewerFromUser(result.user) }
    },
    async requestPasswordReset(_input: { email: string }) {
      return notIntegrated('auth.passwordReset')
    },
    async verifyAccount(_code: string) {
      return notIntegrated('auth.verify')
    },
    async logout() {
      try {
        await request('/api/auth/logout', { method: 'POST', schema: z.object({ ok: z.boolean() }) })
      } finally {
        setAccessToken(null)
      }
    },
  },
  meta: {
    async getCapabilities() {
      return NO_CAPABILITIES
    },
  },
  worlds: {
    async list() {
      const data = await request('/api/packs', {
        schema: z.object({ packs: z.array(worldSchema) }),
      })
      return data.packs
    },
  },
  campaigns: {
    async create(name) {
      return request('/api/campaign/new', {
        method: 'POST',
        body: { pack_id: 'refuge', name },
        schema: z.object({ campaign_id: z.string() }),
      })
    },
    async list(scope) {
      if (scope !== 'active') return []
      const data = await request('/api/campaigns/mine', {
        schema: z.object({ campaigns: z.array(campaignStateSchema) }),
      })
      return data.campaigns
    },
    async listInvites() {
      const data = await request('/api/invites', {
        schema: z.object({ invites: z.array(inviteSchema) }),
      })
      return data.invites
    },
    async acceptInvite(inviteId) {
      await request(`/api/invites/${encodeURIComponent(inviteId)}/accept`, {
        method: 'POST', schema: z.object({ ok: z.boolean() }).passthrough(),
      })
    },
    async classes(campaignId) {
      return request(withId('/api/classes/{id}', campaignId), { schema: classSelectionSchema })
    },
    async chooseClass(campaignId, classId) {
      await request('/api/class/choose', {
        method: 'POST',
        body: { campaign_id: campaignId, class_id: classId },
        schema: z.object({ ok: z.boolean(), character: characterSchema }).passthrough(),
      })
    },
    async shop(campaignId) {
      return request(withId('/api/shop/{id}', campaignId), { schema: shopSchema })
    },
    async buy(campaignId, itemId) {
      await request('/api/shop/buy', {
        method: 'POST',
        body: { campaign_id: campaignId, item_id: itemId },
        schema: z.object({ ok: z.boolean() }).passthrough(),
      })
    },
    async respondInvitation(invitationId) {
      await request(`/api/invites/${encodeURIComponent(invitationId)}/accept`, {
        method: 'POST', schema: z.object({ ok: z.boolean() }).passthrough(),
      })
    },
    async join() {
      // Campaigns are joined by invitation only; there is no public join route.
      return notIntegrated('campaigns.join')
    },
    async getScene(campaignId) {
      return request(withId('/api/campaign/{id}', campaignId), { schema: campaignStateSchema })
    },
    async getTurnStatus(campaignId) {
      return request(withId('/api/campaign/{id}/step/status', campaignId), {
        schema: turnStatusSchema,
      })
    },
    async submitTurn(input, requestId) {
      const raw = await request('/api/turn', {
        method: 'POST',
        body: {
          campaign_id: input.campaign_id,
          command: input.command,
          ...(input.clarification_id ? { clarification_id: input.clarification_id } : {}),
        },
        schema: z.object({
          order_saved: z.boolean(),
          clarifying_question: z.string().nullish(),
          clarification_id: z.string().nullish(),
          step_no: z.number().int(),
          waiting_for: z.array(z.string()).default([]),
        }).passthrough(),
        idempotencyKey: requestId,
      })
      const result: SubmitTurnResult = {
        status: raw.order_saved ? 'accepted' : 'needs_clarification',
        clarification: raw.clarifying_question ?? null,
        clarification_id: raw.clarification_id ?? null,
        step_no: raw.step_no,
        waiting_for: raw.waiting_for,
      }
      return submitTurnResultSchema.parse(result)
    },
    async getLog(campaignId, cursor) {
      const suffix = cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''
      const data = await request(`${withId('/api/campaign/{id}/steps', campaignId)}?limit=20${suffix}`, {
        schema: z.object({ steps: z.array(stepSchema) }),
      })
      const entries = data.steps.map((step) => ({
        id: String(step.step_no),
        kind: 'narration' as const,
        turnNumber: step.step_no,
        createdAt: step.created_at ?? '',
        text: step.prose || step.outcome_text || '',
      }))
      const last = data.steps.at(-1)
      return logPageSchema.parse({
        entries,
        nextCursor: last && last.step_no > 1 ? String(last.step_no - 1) : null,
      })
    },
    async getNpcs(campaignId) {
      const scene = await liveGateway.campaigns.getScene(campaignId)
      return z.array(npcSchema).parse(scene.npcs)
    },
    async getMap(campaignId) {
      const scene = await liveGateway.campaigns.getScene(campaignId)
      const basemap = await request(withId('/api/map/{id}', scene.pack_id), {
        schema: basemapSchema,
      })
      return mapStateSchema.parse({ basemap, nodes: scene.map_nodes })
    },
  },
  character: {
    async getSheet(campaignId) {
      const scene = await liveGateway.campaigns.getScene(campaignId)
      return characterSchema.parse(scene.character)
    },
    async getInventory(campaignId) {
      const scene = await liveGateway.campaigns.getScene(campaignId)
      const items: Item[] = scene.character.inventory
      const used = items.reduce((sum: number, item: Item) => sum + (item.weight ?? 0), 0)
      const maximum = Number((scene.character as { derived?: { carry_kg?: number } }).derived?.carry_kg ?? 30)
      return inventorySchema.parse({
        items,
        capacity: { used, max: maximum, unit: 'кг' },
      })
    },
    async allocate(campaignId, input) {
      const payload = allocateInputSchema.parse({ campaign_id: campaignId, ...input })
      const data = await request('/api/allocate', {
        method: 'POST', body: payload,
        schema: z.object({ character: characterSchema }),
      })
      return data.character
    },
    async useItem(campaignId, itemId) {
      const data = await request('/api/inventory/use', {
        method: 'POST', body: { campaign_id: campaignId, item_id: itemId },
        schema: z.object({ character: characterSchema }),
      })
      return data.character
    },
    async equip(campaignId, itemId) {
      const data = await request('/api/inventory/equip', {
        method: 'POST', body: { campaign_id: campaignId, item_id: itemId },
        schema: z.object({ character: characterSchema }),
      })
      return data.character
    },
    async unequip(campaignId, slot) {
      const data = await request('/api/inventory/unequip', {
        method: 'POST', body: { campaign_id: campaignId, slot },
        schema: z.object({ character: characterSchema }),
      })
      return data.character
    },
  },
  notifications: {
    async list() {
      const campaigns = await liveGateway.campaigns.list('active')
      if (!campaigns.length) return []
      const data = await request(`${withId('/api/campaign/{id}/events', campaigns[0]!.id)}?limit=50`, {
        schema: z.object({ events: z.array(z.object({
          seq: z.number(), event: z.string(),
          payload: z.object({}).passthrough(),
        })) }),
      })
      const EVENT_TITLES: Record<string, string> = {
        turn_final: 'Результат хода',
        step_resolved: 'Шаг завершён',
        orders_open: 'Новый приказ',
        awaiting_orders: 'Ожидаем игроков',
        order_submitted: 'Приказ принят',
        order_timeout: 'Время приказа истекло',
        character_updated: 'Персонаж изменён',
        class_chosen: 'Выбран класс',
        user_joined: 'Игрок присоединился',
        member_left: 'Игрок вышел',
      }
      return data.events.map((item) => {
        const payload = item.payload as { prose?: unknown; step_no?: unknown }
        const prose = typeof payload.prose === 'string' ? payload.prose : ''
        const step = typeof payload.step_no === 'number' ? ` · ход ${payload.step_no}` : ''
        return notificationSchema.parse({
          id: String(item.seq),
          kind: item.event === 'turn_final' ? 'turn_result' : 'campaign_event',
          title: (EVENT_TITLES[item.event] ?? item.event.replace(/_/g, ' ')) + step,
          body: prose,
          createdAt: '',
          read: true,
          campaignId: campaigns[0]!.id,
        })
      })
    },
    async markRead() {
      // Event history is read-only on the server; read state is local.
      return
    },
  },
}

export function getGateway(_mode: AppMode): ArgoGateway {
  return liveGateway
}

export { createIdempotencyKey }
