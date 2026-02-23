import { useQuery } from '@tanstack/react-query'
import { getProviderReviews } from '@/lib/api/reviews'

export function useProviderReviews(providerId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', providerId],
    queryFn: () => getProviderReviews(providerId!),
    enabled: !!providerId,
  })
}
