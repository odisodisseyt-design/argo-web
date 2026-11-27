import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { RegisterInputSchema, type RegisterInput } from '@/api/schemas/auth'
import { toUserMessage } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Notice } from '@/components/ui/notice'
import { useGateway, sessionKey } from '@/features/auth/use-session'

export default function RegisterPage() {
  const gateway = useGateway()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { register, handleSubmit, formState } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterInputSchema),
    defaultValues: { username: '', password: '', confirmPassword: '' },
  })
  const mutation = useMutation({
    mutationFn: ({ username, password }: RegisterInput) =>
      gateway.auth.register({ username, password, confirmPassword: password }),
  })

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: (res) => {
        queryClient.setQueryData(sessionKey(gateway.mode), res.viewer)
        navigate('/', { replace: true })
      },
    }),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold">Регистрация</h1>
        <p className="text-sm text-muted-foreground">Создай аккаунт — мир «Арго» уже ждёт.</p>
      </div>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Имя игрока" autoComplete="username" error={formState.errors.username?.message} {...register('username')} />
        <Field label="Пароль" type="password" autoComplete="new-password" hint="Не менее 6 символов" error={formState.errors.password?.message} {...register('password')} />
        <Field label="Повтори пароль" type="password" autoComplete="new-password" error={formState.errors.confirmPassword?.message} {...register('confirmPassword')} />
        {mutation.isError && <Notice tone="danger">{toUserMessage(mutation.error)}</Notice>}
        <Button type="submit" size="lg" loading={mutation.isPending}>
          Создать аккаунт
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{' '}
        <Link to="/auth/login" className="font-medium text-primary hover:underline">
          Войти
        </Link>
      </p>
    </div>
  )
}
