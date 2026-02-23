import { supabase } from '@/lib/supabase'
import { transformService } from '@/lib/transforms'
import type { Service } from '@/types'

export async function getServiceById(serviceId: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single()

  if (error) throw error
  if (!data) return null
  return transformService(data)
}

export async function getServicesByProvider(providerId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', providerId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(transformService)
}
