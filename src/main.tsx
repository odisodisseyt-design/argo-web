import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { ApiError } from '@/api/errors'
import { router } from '@/app/router'
import { ThemeSync } from '@/theme/theme-sync'
import '@/styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: (count, error) => error instanceof ApiError && error.isRetryable && count < 3,
    },
    mutations: { retry: false },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
