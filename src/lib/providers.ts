import { supabase } from './supabase'
import { ServiceProvider } from '@/types'

export interface CreateProviderData {
  userId: string
  businessName: string
  businessType?: string
  description: string
  services: string[]
  location: {
    address: string
    city: string
    state: string
    zip: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  contactInfo: {
    phone: string
    email: string
    website?: string
  }
  businessHours: Record<string, { start: string; end: string; available: boolean }>
  priceRange: {
    min: number
    max: number
    currency: string
  }
  availability: Record<string, boolean>
  certifications: string[]
  experienceYears: number
}

export interface UpdateProviderData {
  businessName?: string
  businessType?: string
  description?: string
  services?: string[]
  location?: {
    address: string
    city: string
    state: string
    zip: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  contactInfo?: {
    phone: string
    email: string
    website?: string
  }
  businessHours?: Record<string, { start: string; end: string; available: boolean }>
  priceRange?: {
    min: number
    max: number
    currency: string
  }
  availability?: Record<string, boolean>
  certifications?: string[]
  experienceYears?: number
  images?: string[]
}

export const providerApi = {
  // Create a new provider profile
  async createProvider(data: CreateProviderData) {
    try {
      const { data: provider, error } = await supabase
        .from('providers')
        .insert([
          {
            user_id: data.userId,
            business_name: data.businessName,
            business_type: data.businessType || 'individual',
            description: data.description,
            services: data.services,
            location: data.location,
            contact_info: data.contactInfo,
            business_hours: data.businessHours,
            price_range: data.priceRange,
            availability: data.availability,
            certifications: data.certifications,
            experience_years: data.experienceYears,
            status: 'active',
            is_verified: false
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating provider:', error)
        throw error
      }

      return provider
    } catch (error) {
      console.error('Error in createProvider:', error)
      throw error
    }
  },

  // Get provider by user ID
  async getProviderByUserId(userId: string) {
    try {
      const { data: provider, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching provider:', error)
        throw error
      }

      return provider
    } catch (error) {
      console.error('Error in getProviderByUserId:', error)
      throw error
    }
  },

  // Update provider profile
  async updateProvider(providerId: string, data: UpdateProviderData) {
    try {
      const { data: provider, error } = await supabase
        .from('providers')
        .update(data)
        .eq('id', providerId)
        .select()
        .single()

      if (error) {
        console.error('Error updating provider:', error)
        throw error
      }

      return provider
    } catch (error) {
      console.error('Error in updateProvider:', error)
      throw error
    }
  },

  // Update provider by user ID
  async updateProviderByUserId(userId: string, data: UpdateProviderData) {
    try {
      const { data: provider, error } = await supabase
        .from('providers')
        .update(data)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating provider by user ID:', error)
        throw error
      }

      return provider
    } catch (error) {
      console.error('Error in updateProviderByUserId:', error)
      throw error
    }
  },

  // Get all providers with filters
  async getProviders(filters?: {
    location?: { lat: number; lng: number; radius: number }
    services?: string[]
    status?: string
    minRating?: number
  }) {
    try {
      let query = supabase
        .from('providers')
        .select(`
          *,
          users!inner(id, full_name, email, avatar_url)
        `)
        .eq('status', 'active')

      if (filters?.services && filters.services.length > 0) {
        query = query.overlaps('services', filters.services)
      }

      if (filters?.minRating) {
        query = query.gte('rating', filters.minRating)
      }

      const { data: providers, error } = await query

      if (error) {
        console.error('Error fetching providers:', error)
        throw error
      }

      return providers
    } catch (error) {
      console.error('Error in getProviders:', error)
      throw error
    }
  },

  // Delete provider profile
  async deleteProvider(providerId: string) {
    try {
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', providerId)

      if (error) {
        console.error('Error deleting provider:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Error in deleteProvider:', error)
      throw error
    }
  },

  // Check if user is a provider
  async isProvider(userId: string) {
    try {
      const { data: provider, error } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking provider status:', error)
        throw error
      }

      return !!provider
    } catch (error) {
      console.error('Error in isProvider:', error)
      throw error
    }
  }
}
