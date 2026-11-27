import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Logo } from '@/components/brand/logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { ModeBanner } from '@/components/layout/mode-banner'
import { FullscreenLoader } from '@/components/feedback/fullscreen-loader'

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ModeBanner />
      <div className="flex flex-1">
        <section className="relative hidden flex-1 overflow-hidden lg:flex" aria-hidden>
          <img src={`${import.meta.env.BASE_URL}images/auth-world.png`} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="relative mt-auto flex max-w-lg flex-col gap-3 p-12">
            <p className="hud-label text-primary">Система активирована</p>
            <p className="font-display text-4xl font-bold leading-tight text-balance">
              Мир изменился. Ваши решения — тоже часть его истории.
            </p>
          </div>
        </section>
        <div className="relative flex w-full flex-col lg:max-w-xl">
          <img
            src={`${import.meta.env.BASE_URL}images/auth-world.png`}
            alt=""
            className="absolute inset-x-0 top-0 h-56 w-full object-cover opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)] lg:hidden"
          />
          <header className="safe-top relative flex h-16 items-center justify-between px-5">
            <Logo />
            <ThemeToggle />
          </header>
          <main className="relative flex flex-1 items-center justify-center px-5 pb-10 pt-6">
            <div className="w-full max-w-sm">
              <Suspense fallback={<FullscreenLoader />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
