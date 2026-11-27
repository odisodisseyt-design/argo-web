import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/app-shell'
import { AuthLayout } from '@/features/auth/auth-layout'
import { RequireAuth } from '@/features/auth/require-auth'
import { RouteError } from './route-error'

const HomePage = lazy(() => import('@/pages/app/home-page'))
const CampaignsPage = lazy(() => import('@/pages/app/campaigns-page'))
const CharacterPage = lazy(() => import('@/pages/app/character-page'))
const GamePage = lazy(() => import('@/pages/app/game-page'))
const MapPage = lazy(() => import('@/pages/app/map-page'))
const NotificationsPage = lazy(() => import('@/pages/app/notifications-page'))
const ProfilePage = lazy(() => import('@/pages/app/profile-page'))
const IntegrationPage = lazy(() => import('@/pages/app/integration-page'))
const NotFoundPage = lazy(() => import('@/pages/not-found-page'))
import LoginPage from '@/pages/auth/login-page'
import RegisterPage from '@/pages/auth/register-page'
import ForgotPasswordPage from '@/pages/auth/forgot-password-page'
import VerifyPage from '@/pages/auth/verify-page'
import LogoutPage from '@/pages/auth/logout-page'

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      {
        path: '/auth',
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'forgot', element: <ForgotPasswordPage /> },
          { path: 'verify', element: <VerifyPage /> },
          { path: 'logout', element: <LogoutPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <HomePage /> },
              { path: 'campaigns', element: <CampaignsPage /> },
              { path: 'play/:campaignId', element: <GamePage /> },
              { path: 'character', element: <CharacterPage /> },
              { path: 'map', element: <MapPage /> },
              { path: 'notifications', element: <NotificationsPage /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'profile/integration', element: <IntegrationPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
], { basename: import.meta.env.BASE_URL.replace(/\/$/, '') })
