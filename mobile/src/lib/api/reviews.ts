import { supabase } from '@/lib/supabase'
import { transformReview } from '@/lib/transforms'
import type { Review } from '@/types'

export async function getProviderReviews(providerId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(transformReview)
}
