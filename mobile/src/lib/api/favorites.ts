import { supabase } from '@/lib/supabase'
import { transformProvider } from '@/lib/transforms'
import type { ServiceProvider } from '@/types'

export async function getFavoriteProviders(userId: string): Promise<ServiceProvider[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('provider_id, providers(*)')
    .eq('user_id', userId)

  if (error) throw error

  return (data ?? [])
    .filter(f => f.providers)
    .map(f => transformProvider(f.providers))
}
