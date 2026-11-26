import { Bell, Compass, Home, Map, Swords, UserRound } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Главная', icon: Home, end: true },
  { to: '/campaigns', label: 'Кампании', icon: Swords },
  { to: '/character', label: 'Персонаж', icon: Compass },
  { to: '/map', label: 'Карта', icon: Map },
  { to: '/notifications', label: 'События', fullLabel: 'Уведомления', icon: Bell },
  { to: '/profile', label: 'Профиль', icon: UserRound },
] as const
