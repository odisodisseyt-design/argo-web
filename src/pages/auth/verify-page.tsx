import { Link } from 'react-router'
import { Notice } from '@/components/ui/notice'

export default function VerifyPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Подтверждение аккаунта</h1>
      <Notice tone="integration" title="Не требуется">
        ARGO не отправляет письма с подтверждением: аккаунт готов сразу после регистрации.
      </Notice>
      <Link to="/auth/login" className="text-sm text-primary hover:underline">
        Перейти ко входу
      </Link>
    </div>
  )
}
