import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppMode = 'live' | 'demo'

interface ModeState {
  mode: AppMode
  setMode: (mode: AppMode) => void
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: 'live',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'argo-mode' },
  ),
)
