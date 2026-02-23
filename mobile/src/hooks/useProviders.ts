import { useQuery } from '@tanstack/react-query'
import { searchProviders, getProviderById, getProviderServices, getFeaturedProviders } from '@/lib/api/providers'
import type { SearchFilters } from '@/types'

export function useSearchProviders(filters?: SearchFilters) {
  return useQuery({
    queryKey: ['providers', 'search', filters],
    queryFn: () => searchProviders(filters),
  })
}

export function useProvider(providerId: string | undefined) {
  return useQuery({
    queryKey: ['providers', providerId],
    queryFn: () => getProviderById(providerId!),
    enabled: !!providerId,
  })
}

export function useProviderServices(providerId: string | undefined) {
  return useQuery({
    queryKey: ['providers', providerId, 'services'],
    queryFn: () => getProviderServices(providerId!),
    enabled: !!providerId,
  })
}

export function useFeaturedProviders() {
  return useQuery({
    queryKey: ['providers', 'featured'],
    queryFn: getFeaturedProviders,
  })
}
