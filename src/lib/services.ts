import { supabase } from './supabase'
import { Service, CreateServiceForm, ServiceCategory } from '@/types'

export interface CreateServiceData {
  providerId: string
  category: ServiceCategory
  name: string
  description: string
  price: number
  duration: number
  maxPets: number
  requirements?: string[]
  includes?: string[]
  images?: string[]
}

export interface UpdateServiceData {
  name?: string
  description?: string
  price?: number
  duration?: number
  maxPets?: number
  requirements?: string[]
  includes?: string[]
  images?: string[]
  isActive?: boolean
}

export const serviceApi = {
  // Create a new service
  async createService(data: CreateServiceData) {
    try {
      const { data: service, error } = await supabase
        .from('services')
        .insert([
          {
            provider_id: data.providerId,
            category: data.category,
            name: data.name,
            description: data.description,
            price: data.price,
            duration_minutes: data.duration,
            max_pets: data.maxPets,
            requirements: data.requirements || [],
            includes: data.includes || [],
            images: data.images || [],
            is_active: true
          }
        ])
        .select()
        .single()

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
      const { data: service, error } = await supabase
        .from('services')
        .update({
          name: data.name,
          description: data.description,
          price: data.price,
          duration_minutes: data.duration,
          max_pets: data.maxPets,
          requirements: data.requirements,
          includes: data.includes,
          images: data.images,
          is_active: data.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId)
        .select()
        .single()

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
