import { supabase } from '@/lib/supabase'
import { transformProvider, transformService } from '@/lib/transforms'
import type { ServiceProvider, Service, SearchFilters } from '@/types'

export interface SearchResult {
  provider: ServiceProvider
  services: Service[]
  distance?: number
}

export async function searchProviders(filters?: SearchFilters): Promise<SearchResult[]> {
  let query = supabase
    .from('providers')
    .select('*')
    .eq('status', 'active')

  if (filters?.rating && filters.rating > 0) {
    query = query.gte('rating', filters.rating)
  }

  const { data: providers, error } = await query

  if (error) throw error

  let filtered = providers ?? []

  // Filter by category
  if (filters?.category) {
    if (filters.category === 'training' || filters.category === 'adoption') {
      const { data: categoryProviders } = await supabase
        .from('services')
        .select('provider_id')
        .eq('category', filters.category)
        .eq('is_active', true)
      const allowedIds = new Set((categoryProviders ?? []).map(p => p.provider_id))
      filtered = filtered.filter(p => allowedIds.has(p.id))
    } else {
      const cat = filters.category
      filtered = filtered.filter(p =>
        p.business_type === cat || (Array.isArray(p.services) && p.services.includes(cat))
      )
    }
  }

  // Filter by location (city text match)
  if (filters?.location?.trim()) {
    const loc = filters.location.toLowerCase().trim()
    filtered = filtered.filter(p => {
      const city = p.location?.city
      return typeof city === 'string' && city.toLowerCase().includes(loc)
    })
  }

  // Fetch services for each provider
  const results = await Promise.all(
    filtered.map(async (row) => {
      const { data: svcRows } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', row.id)
        .eq('is_active', true)

      const provider = transformProvider(row)
      const services = (svcRows ?? []).map(transformService)

      return { provider, services } as SearchResult
    })
  )

  return results
}

export async function getProviderById(providerId: string): Promise<ServiceProvider | null> {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('id', providerId)
    .single()

  if (error) throw error
  if (!data) return null

  return transformProvider(data)
}

export async function getProviderServices(providerId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', providerId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(transformService)
}

export async function getFeaturedProviders(): Promise<SearchResult[]> {
  const { data: providers, error } = await supabase
    .from('providers')
    .select('*')
    .eq('status', 'active')
    .order('rating', { ascending: false })
    .limit(10)

  if (error) throw error

  const results = await Promise.all(
    (providers ?? []).map(async (row) => {
      const { data: svcRows } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', row.id)
        .eq('is_active', true)

      return {
        provider: transformProvider(row),
        services: (svcRows ?? []).map(transformService),
      } as SearchResult
    })
  )

  return results
}
