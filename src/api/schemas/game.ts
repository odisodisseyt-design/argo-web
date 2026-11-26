import { z } from 'zod'

/* Client DTOs. They describe exactly what the ARGO backend returns after
 * whitelisting in server/dto.py: no engine internals, no prompts, no raw ids. */

const id = z.union([z.string(), z.number()]).transform(String)
const dict = z.object({}).passthrough()

export const locationViewSchema = z.object({
  id: z.string(),
  name: z.string(),
  district: z.string().nullish(),
  lat: z.number().nullish(),
  lon: z.number().nullish(),
  x: z.number(),
  y: z.number(),
  biome: z.string().nullish(),
  danger: z.string().nullish(),
  desc: z.string().nullish(),
}).passthrough()
export type LocationView = z.infer<typeof locationViewSchema>

export const mapNodeSchema = locationViewSchema.extend({
  visited: z.boolean().default(false),
  current: z.boolean().default(false),
  floor: z.number().default(0),
  connections: z.array(z.string()).default([]),
})
export type MapNode = z.infer<typeof mapNodeSchema>

export const nearbyItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  aliases: z.array(z.string()).default([]),
  distance_m: z.number().nullish(),
  direction: z.string().nullish(),
  kind: z.string().nullish(),
}).passthrough()
export type NearbyItem = z.infer<typeof nearbyItemSchema>

export const anchorSchema = z.object({
  location: locationViewSchema,
  nearby: z.array(nearbyItemSchema).default([]),
  time: dict.nullish(),
  weather: z.string().nullish(),
  visibility_m: z.number().nullish(),
  environment: dict.nullish(),
  player: dict.nullish(),
  party: z.array(dict).default([]),
}).passthrough()
export type Anchor = z.infer<typeof anchorSchema>

export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  type: z.string().nullish(),
  slot: z.string().nullish(),
  quantity: z.number().int().nonnegative().default(1),
  weight: z.number().nullish(),
  rarity: z.string().nullish(),
  equippable: z.string().nullish(),
  usable: z.boolean().default(false),
  equipped: z.boolean().default(false),
}).passthrough()
export type Item = z.infer<typeof itemSchema>

export const characterSchema = z.object({
  id: id,
  name: z.string(),
  level: z.number().int().default(1),
  xp: z.number().default(0),
  xp_to_next: z.number().default(0),
  class_name: z.string().nullish(),
  location: z.string().nullish(),
  alive: z.boolean().default(true),
  attributes: z.record(z.string(), z.number()).default({}),
  skills: z.array(z.object({ id: z.string(), name: z.string(), rank: z.number().nullish() }).passthrough()).default([]),
  conditions: z.array(z.unknown()).default([]),
  inventory: z.array(itemSchema).default([]),
  equipment: z.record(z.string(), z.string()).default({}),
  currency: z.record(z.string(), z.number()).default({}),
  unspent_points: z.number().int().default(0),
}).passthrough()
export type Character = z.infer<typeof characterSchema>

export const inventorySchema = z.object({
  items: z.array(itemSchema),
  capacity: z.object({
    used: z.number(), max: z.number(), unit: z.string().nullish(),
  }).nullish(),
})
export type Inventory = z.infer<typeof inventorySchema>

export const livingSchema = z.object({
  era_name: z.string().nullish(),
  weather: z.string().nullish(),
  temperature_c: z.number().nullish(),
  season: z.string().nullish(),
  time_of_day: z.string().nullish(),
  time: dict.nullish(),
  events: z.array(z.string()).default([]),
  rumors: z.array(z.string()).default([]),
  factions: z.array(z.object({ id: z.string(), name: z.string(), disposition: z.string().nullish(), goal: z.string().nullish() }).passthrough()).default([]),
  npcs: z.array(dict).default([]),
}).passthrough()
export type Living = z.infer<typeof livingSchema>

export const questSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  objectives: z.array(z.object({ text: z.string(), done: z.boolean() })).default([]),
  complete: z.boolean().default(false),
}).passthrough()

export const journalEntrySchema = z.object({
  id: id,
  text: z.string(),
  status: z.string().nullish(),
  step_no: z.number().nullish(),
})
export type JournalEntry = z.infer<typeof journalEntrySchema>

export const campaignStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  pack_id: z.string(),
  description: z.string().nullish(),
  intro: z.string().nullish(),
  step_no: z.number().int(),
  phase: z.string(),
  waiting_for: z.array(z.string()).default([]),
  my_turn: z.boolean(),
  anchor: anchorSchema,
  character: characterSchema,
  presentation: dict.nullish(),
  lore: z.string().nullish(),
  quests: z.array(questSchema).default([]),
  map_nodes: z.array(mapNodeSchema).default([]),
  npcs: z.array(dict).default([]),
  journal: z.array(journalEntrySchema).default([]),
  shop_items: z.array(itemSchema).default([]),
  era_name: z.string().nullish(),
  class_selection: dict.nullish(),
  living: livingSchema.nullish(),
  knowledge: z.array(z.string()).default([]),
  language: z.string().nullish(),
})
export type CampaignState = z.infer<typeof campaignStateSchema>
export type CampaignSummary = CampaignState

export const campaignScopeSchema = z.enum(['active', 'available', 'invitations', 'archive'])
export type CampaignScope = z.infer<typeof campaignScopeSchema>

export const worldSchema = z.object({
  id: z.string(),
  manifest: z.object({ name: z.string(), description: z.string().nullish(), version: z.string().nullish() }).passthrough(),
  ui_manifest: dict.nullish(),
}).passthrough()
export type World = z.infer<typeof worldSchema>

export const turnStatusSchema = z.object({
  campaignId: z.string(),
  step: z.number().int(),
  phase: z.string(),
  deadline: z.string().nullish(),
  participants: z.array(z.object({
    name: z.string(), submitted: z.boolean(), isYou: z.boolean(),
  })).default([]),
  resolved_at: z.string().nullish(),
  results_ready: z.boolean().default(false),
  my_turn: z.boolean(),
})
export type TurnStatus = z.infer<typeof turnStatusSchema>
export type TurnPhase = TurnStatus['phase']

export const submitTurnInputSchema = z.object({
  campaign_id: z.string(),
  command: z.string().trim().min(1).max(1000),
  clarification_id: z.string().nullish(),
})
export type SubmitTurnInput = z.infer<typeof submitTurnInputSchema>

/** Normalised result: the raw server answer stays inside the gateway. */
export const submitTurnResultSchema = z.object({
  status: z.enum(['accepted', 'needs_clarification']),
  clarification: z.string().nullish(),
  clarification_id: z.string().nullish(),
  step_no: z.number().int(),
  waiting_for: z.array(z.string()).default([]),
})
export type SubmitTurnResult = z.infer<typeof submitTurnResultSchema>

export const stepSchema = z.object({
  step_no: z.number().int(),
  prose: z.string(),
  outcome_text: z.string().nullish(),
  created_at: z.string().nullish(),
})
export const logPageSchema = z.object({
  entries: z.array(z.object({
    id: z.string(),
    kind: z.literal('narration'),
    turnNumber: z.number().int(),
    createdAt: z.string(),
    text: z.string(),
  })),
  nextCursor: z.string().nullable(),
})
export type LogPage = z.infer<typeof logPageSchema>

export const npcSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  location: z.string().nullish(),
  activity: z.string().nullish(),
  emotion: z.string().nullish(),
  known: z.array(z.string()).default([]),
  alive: z.boolean().default(true),
}).passthrough()
export type Npc = z.infer<typeof npcSchema>

export const basemapSchema = z.object({
  id: z.string().nullish(),
  width: z.number().default(1000),
  height: z.number().default(1000),
  attribution: z.string().nullish(),
  roads: z.object({}).passthrough().default({}),
  water: z.string().nullish(),
  rail: z.string().nullish(),
  labels: z.array(z.object({ text: z.string(), x: z.number(), y: z.number(), kind: z.string().nullish() }).passthrough()).default([]),
}).passthrough()
export type Basemap = z.infer<typeof basemapSchema>

export const mapStateSchema = z.object({
  basemap: basemapSchema,
  nodes: z.array(mapNodeSchema),
})
export type MapState = z.infer<typeof mapStateSchema>

export const notificationSchema = z.object({
  id: z.string(),
  kind: z.enum(['campaign_event', 'turn_result', 'system']).catch('system'),
  title: z.string(),
  body: z.string().nullish(),
  createdAt: z.string(),
  read: z.boolean(),
  campaignId: z.string().nullish(),
})
export type AppNotification = z.infer<typeof notificationSchema>

export const capabilitiesSchema = z.object({
  createCampaign: z.boolean().default(true),
  allocateAttributes: z.boolean().default(false),
  pushNotifications: z.boolean().default(false),
})
export type Capabilities = z.infer<typeof capabilitiesSchema>
export const NO_CAPABILITIES: Capabilities = {
  createCampaign: true,
  allocateAttributes: false,
  pushNotifications: false,
}

export const allocateInputSchema = z.object({
  campaign_id: z.string(),
  allocations: z.array(z.object({ id: z.string(), delta: z.number().int().positive() })),
})
export type AllocateInput = z.infer<typeof allocateInputSchema>

export const socketEventSchema = z.object({
  event: z.string(),
  payload: z.object({}).passthrough().default({}),
  event_id: z.number().nullish(),
})
export type SocketEvent = z.infer<typeof socketEventSchema>
