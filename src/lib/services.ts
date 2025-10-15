import { supabase } from './supabase'
import { ServiceCategory } from '@/types'

export interface CreateServiceData {
  providerId: string
  category: ServiceCategory
  name: string
  description: string
  price: number
  duration: number
  durationMin?: number
  durationMax?: number
  maxPets: number
  requirements?: string[]
  includes?: string[]
  images?: string[]
  serviceLocation?: Record<string, unknown>
  // Breeding-specific fields
  maleCount?: number
  femaleCount?: number
  breed?: string
  generation?: string
  ageWeeks?: number
  ageDays?: number
  readyToLeave?: string
  microchipped?: boolean
  vaccinated?: boolean
  wormed?: boolean
  healthChecked?: boolean
  parentsTested?: boolean
  kcRegistered?: boolean
}

export interface UpdateServiceData {
  name?: string
  description?: string
  price?: number
  duration?: number
  durationMin?: number
  durationMax?: number
  maxPets?: number
  requirements?: string[]
  includes?: string[]
  images?: string[]
  isActive?: boolean
  serviceLocation?: Record<string, unknown>
  // Breeding-specific fields
  maleCount?: number
  femaleCount?: number
  breed?: string
  generation?: string
  ageWeeks?: number
  ageDays?: number
  readyToLeave?: string
  microchipped?: boolean
  vaccinated?: boolean
  wormed?: boolean
  healthChecked?: boolean
  parentsTested?: boolean
  kcRegistered?: boolean
}

export const serviceApi = {
  // Create a new service
  async createService(data: CreateServiceData) {
    try {
      // Build base payload
      const basePayload: any = {
        provider_id: data.providerId,
        category: data.category,
        name: data.name,
        description: data.description,
        price: data.price,
        duration_minutes: data.duration,
        duration_min_minutes: data.durationMin,
        duration_max_minutes: data.durationMax,
        max_pets: data.maxPets,
        requirements: data.requirements || [],
        includes: data.includes || [],
        images: data.images || [],
        is_active: true,
        // Breeding-specific fields
        male_count: data.maleCount,
        female_count: data.femaleCount,
        breed: data.breed,
        generation: data.generation,
        age_weeks: data.ageWeeks,
        age_days: data.ageDays,
        ready_to_leave: data.readyToLeave,
        microchipped: data.microchipped,
        vaccinated: data.vaccinated,
        wormed: data.wormed,
        health_checked: data.healthChecked,
        parents_tested: data.parentsTested,
        kc_registered: data.kcRegistered
      }

      // Try including service_location if provided
      let payload = basePayload
      if (data.serviceLocation) {
        payload = { ...basePayload, service_location: data.serviceLocation }
      }

      let { data: service, error } = await supabase
        .from('services')
        .insert([payload])
        .select()
        .single()

      // If schema not updated yet, retry without optional columns that might not exist
      if (error) {
        const retryPayload = { ...basePayload }
        if (data.serviceLocation) delete (retryPayload as any).service_location
        if (data.durationMin === undefined) delete (retryPayload as any).duration_min_minutes
        if (data.durationMax === undefined) delete (retryPayload as any).duration_max_minutes
        const retry = await supabase
          .from('services')
          .insert([retryPayload])
          .select()
          .single()
        service = retry.data
        error = retry.error as any
      }

      if (error) {
        console.error('Error creating service:', error)
        throw error
      }

      return service
    } catch (error) {
      console.error('Error in createService:', error)
      throw error
    }
  },

  // Get services by provider ID
  async getServicesByProvider(providerId: string) {
    try {
      const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', providerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching services:', error)
        throw error
      }

      return services
    } catch (error) {
      console.error('Error in getServicesByProvider:', error)
      throw error
    }
  },

  // Get service by ID
  async getServiceById(serviceId: string) {
    try {
      const { data: service, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single()

      if (error) {
        console.error('Error fetching service:', error)
        throw error
      }

      return service
    } catch (error) {
      console.error('Error in getServiceById:', error)
      throw error
    }
  },

  // Update service
  async updateService(serviceId: string, data: UpdateServiceData) {
    try {
      const updatePayload: any = {
        name: data.name,
        description: data.description,
        price: data.price,
        duration_minutes: data.duration,
        duration_min_minutes: data.durationMin,
        duration_max_minutes: data.durationMax,
        max_pets: data.maxPets,
        requirements: data.requirements,
        includes: data.includes,
        images: data.images,
        is_active: data.isActive,
        updated_at: new Date().toISOString(),
        // Breeding-specific fields
        male_count: data.maleCount,
        female_count: data.femaleCount,
        breed: data.breed,
        generation: data.generation,
        age_weeks: data.ageWeeks,
        age_days: data.ageDays,
        ready_to_leave: data.readyToLeave,
        microchipped: data.microchipped,
        vaccinated: data.vaccinated,
        wormed: data.wormed,
        health_checked: data.healthChecked,
        parents_tested: data.parentsTested,
        kc_registered: data.kcRegistered
      }
      if (data.serviceLocation) updatePayload.service_location = data.serviceLocation

      let { data: service, error } = await supabase
        .from('services')
        .update(updatePayload)
        .eq('id', serviceId)
        .select()
        .single()

      if (error) {
        // Retry removing optional columns that might not exist in DB
        const retryPayload = { ...updatePayload }
        delete (retryPayload as any).duration_min_minutes
        delete (retryPayload as any).duration_max_minutes
        const retry = await supabase
          .from('services')
          .update(retryPayload)
          .eq('id', serviceId)
          .select()
          .single()
        service = retry.data
        error = retry.error as any
      }

      if (error) {
        console.error('Error updating service:', error)
        throw error
      }

      return service
    } catch (error) {
      console.error('Error in updateService:', error)
      throw error
    }
  },

  // Delete service (soft delete by setting is_active to false)
  async deleteService(serviceId: string) {
    try {
      const { error } = await supabase
        .from('services')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId)

      if (error) {
        console.error('Error deleting service:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Error in deleteService:', error)
      throw error
    }
  },

  // Get all services with filters
  async getServices(filters?: {
    category?: ServiceCategory
    location?: { lat: number; lng: number; radius: number }
    minPrice?: number
    maxPrice?: number
    providerId?: string
  }) {
    try {
      let query = supabase
        .from('services')
        .select(`
          *,
          provider:providers(
            id,
            business_name,
            location,
            rating,
            review_count,
            user_id
          )
        `)
        .eq('is_active', true)

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice)
      }

      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice)
      }

      if (filters?.providerId) {
        query = query.eq('provider_id', filters.providerId)
      }

      const { data: services, error } = await query

      if (error) {
        console.error('Error fetching services:', error)
        throw error
      }

      return services
    } catch (error) {
      console.error('Error in getServices:', error)
      throw error
    }
  }
}
