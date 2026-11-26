import { Link, useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'
import { toUserMessage } from '@/api/errors'
import { Button, buttonVariants } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'
import { useLogout, useSession } from '@/features/auth/use-session'

export default function LogoutPage() {
  const { data: viewer } = useSession()
  const logout = useLogout()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      <span className="flex size-12 items-center justify-center rounded-md border bg-surface">
        <LogOut className="size-6 text-danger" aria-hidden />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold">Выход</h1>
        <p className="text-sm text-muted-foreground">
          {viewer ? `Завершить сессию ${viewer.username} на этом устройстве?` : 'Вы уже вышли из аккаунта.'}
        </p>
      </div>
      {logout.isError && <Notice tone="danger">{toUserMessage(logout.error)}</Notice>}
      {viewer ? (
        <div className="flex flex-col gap-3">
          <Button
            variant="danger"
            size="lg"
            loading={logout.isPending}
            onClick={() => logout.mutate(undefined, { onSettled: () => navigate('/auth/login', { replace: true }) })}
          >
            Выйти
          </Button>
          <Link to="/" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
            Остаться
          </Link>
        </div>
      ) : (
        <Link to="/auth/login" className={buttonVariants({ size: 'lg' })}>
          Ко входу
        </Link>
      )}
    </div>
  )
}
