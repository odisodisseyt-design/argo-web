import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/stores/ui-store'

export function ThemeToggle() {
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)
  const isDark =
    theme === 'dark' || (theme === 'system' && typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
