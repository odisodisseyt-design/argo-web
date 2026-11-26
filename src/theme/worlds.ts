export const DEFAULT_WORLD_THEME = 'system-apocalypse'

export const WORLD_THEMES = {
  'system-apocalypse': {
    name: 'System Apocalypse',
    tagline: 'Современный мир после пришествия Системы',
  },
  'ancient-myth': {
    name: 'Древний миф',
    tagline: 'Пример альтернативного стиля мира',
  },
} as const

export type WorldThemeId = keyof typeof WORLD_THEMES

/** Server-provided theme ids that the client does not know fall back to the default. */
export function resolveWorldTheme(id: string | null | undefined): WorldThemeId {
  return id && id in WORLD_THEMES ? (id as WorldThemeId) : DEFAULT_WORLD_THEME
}
