import { ChevronRight, LogOut, Monitor, Moon, PlugZap, Sun } from 'lucide-react'
import { Link } from 'react-router'
import { Page, PageHeader } from '@/components/layout/page'
import { useSession } from '@/features/auth/use-session'
import { useUiStore, type ColorScheme } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

const SCHEMES: { id: ColorScheme; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Светлая', icon: Sun },
  { id: 'dark', label: 'Тёмная', icon: Moon },
  { id: 'system', label: 'Система', icon: Monitor },
]

export default function ProfilePage() {
  const { data: viewer } = useSession()
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  return (
    <Page className="max-w-2xl">
      <PageHeader eyebrow="Профиль" title={viewer ? `Игрок ${viewer.username}` : 'Игрок'} description={viewer?.role === 'operator' ? 'Оператор мира' : 'Участник ARGO'} />

      <section className="hud-panel flex flex-col gap-3 p-5" aria-labelledby="theme-h">
        <h2 id="theme-h" className="hud-label">Оформление</h2>
        <div role="radiogroup" aria-label="Тема" className="grid grid-cols-3 gap-2">
          {SCHEMES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="radio"
              aria-checked={theme === id}
              onClick={() => setTheme(id)}
              className={cn(
                'flex h-16 flex-col items-center justify-center gap-1.5 rounded-md border text-xs font-medium transition-colors',
                theme === id ? 'border-primary bg-primary/10 text-foreground' : 'bg-surface-raised text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-[18px]" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </section>

      <nav className="hud-panel flex flex-col divide-y overflow-hidden" aria-label="Профиль">
        <ProfileLink to="/profile/integration" icon={PlugZap} label="Интеграция с сервером" />
        <ProfileLink to="/auth/logout" icon={LogOut} label="Выйти из аккаунта" danger />
      </nav>
    </Page>
  )
}

function ProfileLink({ to, icon: Icon, label, danger }: { to: string; icon: typeof Sun; label: string; danger?: boolean }) {
  return (
    <Link to={to} className={cn('flex h-14 items-center gap-3 px-5 text-sm font-medium hover:bg-muted', danger && 'text-danger')}>
      <Icon className="size-[18px]" aria-hidden />
      <span className="flex-1">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
    </Link>
  )
}
