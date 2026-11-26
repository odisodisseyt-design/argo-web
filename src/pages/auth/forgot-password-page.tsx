import { Link } from 'react-router'
import { Notice } from '@/components/ui/notice'

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Восстановление пароля</h1>
      <Notice tone="integration" title="Не поддерживается сервером">
        В ARGO вход по имени игрока и паролю. Восстановление по почте пока недоступно —
        обратись к оператору или создай новый аккаунт.
      </Notice>
      <Link to="/auth/login" className="text-sm text-primary hover:underline">
        Вернуться ко входу
      </Link>
    </div>
  )
}
