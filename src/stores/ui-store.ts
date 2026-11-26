import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorldThemeId } from '@/theme/worlds'

export type ColorScheme = 'light' | 'dark' | 'system'

interface UiState {
  theme: ColorScheme
  /** Local preview of a world style; real worlds supply their theme id from the server. */
  worldPreview: WorldThemeId | null
  setTheme: (theme: ColorScheme) => void
  setWorldPreview: (world: WorldThemeId | null) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'dark',
      worldPreview: null,
      setTheme: (theme) => set({ theme }),
      setWorldPreview: (worldPreview) => set({ worldPreview }),
    }),
    { name: 'argo-ui', partialize: (s) => ({ theme: s.theme, worldPreview: s.worldPreview }) },
  ),
)
