import { Suspense } from 'react'
import { NavLink, Outlet, Link } from 'react-router'
import { Logo } from '@/components/brand/logo'
import { cn } from '@/lib/utils'
import { useSession } from '@/features/auth/use-session'
import { ConnectionIndicator } from './connection-indicator'
import { ModeBanner } from './mode-banner'
import { NAV_ITEMS } from './nav-items'
import { ThemeToggle } from './theme-toggle'
import { PageSkeleton } from '@/components/feedback/page-skeleton'

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ModeBanner />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar />
          <main id="main" className="flex-1 pb-24 lg:pb-0">
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

function Sidebar() {
  const { data: viewer } = useSession()
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-surface lg:flex">
      <div className="flex h-16 items-center px-5">
        <Link to="/" aria-label="ARGO — на главную">
          <Logo />
        </Link>
      </div>
      <nav aria-label="Основная навигация" className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink
            key={to}
            to={to}
            end={'end' in rest}
            className={({ isActive }) =>
              cn(
                'group relative flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                isActive ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <Icon className={cn('size-[18px]', isActive && 'text-primary')} aria-hidden />
                {'fullLabel' in rest ? rest.fullLabel : label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="flex flex-col gap-3 border-t p-4">
        <div className="flex items-center justify-between">
          <ConnectionIndicator />
          <ThemeToggle />
        </div>
        {viewer && (
          <Link to="/profile" className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary/15 font-display font-bold text-primary">
              {viewer.username.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{viewer.username}</span>
            </span>
          </Link>
        )}
      </div>
    </aside>
  )
}

function MobileTopBar() {
  return (
    <header className="safe-top sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link to="/" aria-label="ARGO — на главную">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <ConnectionIndicator />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

function BottomNav() {
  return (
    <nav
      aria-label="Основная навигация"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t bg-surface/95 backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex max-w-xl">
        {NAV_ITEMS.map(({ to, label, icon: Icon, ...rest }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={'end' in rest}
              className={({ isActive }) =>
                cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground active:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                      isActive && 'bg-primary/15',
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
