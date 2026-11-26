import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { LoginInputSchema, type LoginInput } from '@/api/schemas/auth'
import { toUserMessage } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Notice } from '@/components/ui/notice'
import { useLogin } from '@/features/auth/use-session'
import { safeNext } from '@/lib/safe-next'

export default function LoginPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const login = useLogin()
  const { register, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, { onSuccess: () => navigate(safeNext(params.get('next')), { replace: true }) }),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold">Вход</h1>
        <p className="text-sm text-muted-foreground">Продолжи путь в живых мирах ARGO.</p>
      </div>

      {params.get('expired') && (
        <Notice tone="warning" title="Сессия истекла">
          Войди снова, чтобы продолжить с того же места.
        </Notice>
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Имя игрока" autoComplete="username" error={formState.errors.username?.message} {...register('username')} />
        <Field label="Пароль" type="password" autoComplete="current-password" error={formState.errors.password?.message} {...register('password')} />
        {login.isError && <Notice tone="danger">{toUserMessage(login.error)}</Notice>}
        <Button type="submit" size="lg" loading={login.isPending}>
          Войти
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Нет аккаунта?{' '}
        <Link to="/auth/register" className="font-medium text-primary hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  )
}
