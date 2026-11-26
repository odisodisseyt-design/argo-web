import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="hud-label text-primary">Ошибка 404</p>
      <h1 className="text-3xl font-bold">Локация не найдена</h1>
      <p className="max-w-sm text-sm text-muted-foreground">Этой области нет на карте. Возможно, путь изменился.</p>
      <Link to="/" className={buttonVariants()}>
        На главную
      </Link>
    </div>
  )
}
