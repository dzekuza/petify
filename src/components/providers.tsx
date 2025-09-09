'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/query-client'
import { AuthProvider } from '@/contexts/auth-context'
import { NotificationsProvider } from '@/contexts/notifications-context'
import { FavoritesProvider } from '@/contexts/favorites-context'
// import { Notifications } from '@/components/notifications'

interface ProvidersProps {
  children: React.ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoritesProvider>
          <NotificationsProvider>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </NotificationsProvider>
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
