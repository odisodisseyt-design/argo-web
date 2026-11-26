import { useEffect } from 'react'
import { useUiStore } from '@/stores/ui-store'
import { DEFAULT_WORLD_THEME } from './worlds'

export function ThemeSync() {
  const theme = useUiStore((s) => s.theme)
  const worldPreview = useUiStore((s) => s.worldPreview)

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.querySelector('meta[name="theme-color"]:not([media])')?.remove()
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#0a0c10'
      document.head.appendChild(meta)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme, worldPreview])

  useEffect(() => {
    document.documentElement.dataset.world = worldPreview ?? DEFAULT_WORLD_THEME
  }, [worldPreview])

  return null
}
