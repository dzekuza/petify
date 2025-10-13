import { supabase } from './supabase'

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
  certifications?: string[]
  experienceYears?: number
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
  avatarUrl?: string
}

export const providerApi = {
  // Create a new provider profile
  async createProvider(data: CreateProviderData) {
    try {
      // First, check if a provider already exists for this user
      const existingProvider = await this.getProviderByUserId(data.userId)
      
      if (existingProvider) {
        // If provider exists, update it instead of creating a new one
        return await this.updateProvider(existingProvider.id, data)
      }

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
        // Error creating provider
        throw error
      }

      // Update user role to 'provider' after creating provider profile
      const { error: roleError } = await supabase
        .from('users')
        .update({ role: 'provider' })
        .eq('id', data.userId)

      if (roleError) {
        // Error updating user role
        // Don't throw error here as provider was created successfully
      }

      return provider
    } catch (error) {
      // Error in createProvider
      throw error
    }
  },

  // Get provider by user ID
  async getProviderByUserId(userId: string) {
    try {
      const { data: providers, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }) // Get the most recent one first

      if (error) {
        // Error fetching provider
        throw error
      }

      // If no providers found, return null
      if (!providers || providers.length === 0) {
        return null
      }

      // Return the most recent provider (first in the ordered list)
      const provider = providers[0]

      // Transform snake_case to camelCase for frontend compatibility
      return {
        ...provider,
        businessName: provider.business_name,
        businessType: provider.business_type,
        contactInfo: provider.contact_info,
        businessHours: provider.business_hours,
        priceRange: provider.price_range,
        experienceYears: provider.experience_years,
        isVerified: provider.is_verified,
        verificationDocuments: provider.verification_documents,
        avatarUrl: provider.avatar_url,
        createdAt: provider.created_at,
        updatedAt: provider.updated_at
      }
    } catch (error) {
      // Error in getProviderByUserId
      throw error
    }
  },

  // Update provider profile
  async updateProvider(providerId: string, data: UpdateProviderData) {
    try {
      // Transform camelCase to snake_case for database
      const dbData: Record<string, unknown> = {}
      if (data.businessName) dbData.business_name = data.businessName
      if (data.businessType) dbData.business_type = data.businessType
      if (data.contactInfo) dbData.contact_info = data.contactInfo
      if (data.businessHours) dbData.business_hours = data.businessHours
      if (data.priceRange) dbData.price_range = data.priceRange
      if (data.experienceYears) dbData.experience_years = data.experienceYears
      if (data.certifications) dbData.certifications = data.certifications
      if (data.images) dbData.images = data.images
      if (data.description) dbData.description = data.description
      if (data.services) dbData.services = data.services
      if (data.location) dbData.location = data.location
      if (data.availability) dbData.availability = data.availability
      if (data.avatarUrl) dbData.avatar_url = data.avatarUrl

      const { data: provider, error } = await supabase
        .from('providers')
        .update(dbData)
        .eq('id', providerId)
        .select()
        .single()

      if (error) {
        // Error updating provider
        throw error
      }

      // Transform snake_case to camelCase for frontend compatibility
      if (provider) {
        return {
          ...provider,
          businessName: provider.business_name,
          businessType: provider.business_type,
          contactInfo: provider.contact_info,
          businessHours: provider.business_hours,
          priceRange: provider.price_range,
          experienceYears: provider.experience_years,
          isVerified: provider.is_verified,
          verificationDocuments: provider.verification_documents,
          avatarUrl: provider.avatar_url,
          createdAt: provider.created_at,
          updatedAt: provider.updated_at
        }
      }

      return provider
    } catch (error) {
      // Error in updateProvider
      throw error
    }
  },

  // Update provider by user ID
  async updateProviderByUserId(userId: string, data: UpdateProviderData) {
    try {
      // Transform camelCase to snake_case for database
      const dbData: Record<string, unknown> = {}
      if (data.businessName) dbData.business_name = data.businessName
      if (data.businessType) dbData.business_type = data.businessType
      if (data.contactInfo) dbData.contact_info = data.contactInfo
      if (data.businessHours) dbData.business_hours = data.businessHours
      if (data.priceRange) dbData.price_range = data.priceRange
      if (data.experienceYears) dbData.experience_years = data.experienceYears
      if (data.certifications) dbData.certifications = data.certifications
      if (data.images) dbData.images = data.images
      if (data.description) dbData.description = data.description
      if (data.services) dbData.services = data.services
      if (data.location) dbData.location = data.location
      if (data.availability) dbData.availability = data.availability
      if (data.avatarUrl) dbData.avatar_url = data.avatarUrl

      const { data: provider, error } = await supabase
        .from('providers')
        .update(dbData)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        // Error updating provider by user ID
        throw error
      }

      // Transform snake_case to camelCase for frontend compatibility
      if (provider) {
        return {
          ...provider,
          businessName: provider.business_name,
          businessType: provider.business_type,
          contactInfo: provider.contact_info,
          businessHours: provider.business_hours,
          priceRange: provider.price_range,
          experienceYears: provider.experience_years,
          isVerified: provider.is_verified,
          verificationDocuments: provider.verification_documents,
          avatarUrl: provider.avatar_url,
          createdAt: provider.created_at,
          updatedAt: provider.updated_at
        }
      }

      return provider
    } catch (error) {
      // Error in updateProviderByUserId
      throw error
    }
  },

  // Update user role to provider (for existing providers who completed onboarding)
  async updateUserRoleToProvider(userId: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'provider' })
        .eq('id', userId)

      if (error) {
        // Error updating user role to provider
        throw error
      }

      return true
    } catch (error) {
      // Error in updateUserRoleToProvider
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
          users(id, full_name, email, avatar_url)
        `)
        .eq('status', 'active')
        .eq('business_type', 'grooming') // Only show grooming providers

      if (filters?.services && filters.services.length > 0) {
        query = query.overlaps('services', filters.services)
      }

      if (filters?.minRating) {
        query = query.gte('rating', filters.minRating)
      }

      const { data: providers, error } = await query

      if (error) {
        // Error fetching providers
        throw error
      }

      // Transform snake_case to camelCase for frontend compatibility
      return providers?.map(provider => ({
        ...provider,
        businessName: provider.business_name,
        businessType: provider.business_type,
        contactInfo: provider.contact_info,
        businessHours: provider.business_hours,
        priceRange: provider.price_range,
        experienceYears: provider.experience_years,
        isVerified: provider.is_verified,
        verificationDocuments: provider.verification_documents,
        createdAt: provider.created_at,
        updatedAt: provider.updated_at
      })) || []
    } catch (error) {
      // Error in getProviders
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
        // Error deleting provider
        throw error
      }

      return true
    } catch (error) {
      // Error in deleteProvider
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
        // Error checking provider status
        throw error
      }

      return !!provider
    } catch (error) {
      // Error in isProvider
      throw error
    }
  },

  // Check if user has completed provider registration
  async hasProviderProfile(userId: string) {
    try {
      const { data: provider, error } = await supabase
        .from('providers')
        .select('id, status')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // Error checking provider profile
        throw error
      }

      return !!provider
    } catch (error) {
      // Error in hasProviderProfile
      throw error
    }
  },

  // Get provider by ID
  async getProviderById(providerId: string) {
    try {
      console.log('Fetching provider with ID:', providerId)
      const { data: provider, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single()

      if (error) {
        console.error('Error fetching provider:', error)
        console.error('Provider ID that failed:', providerId)
        throw error
      }

      console.log('Provider data fetched:', provider)
      
      if (!provider) {
        console.error('Provider not found for ID:', providerId)
        return null
      }

      // Transform provider data to match ServiceProvider interface
      return {
        id: provider.id,
        userId: provider.user_id,
        businessName: provider.business_name,
        description: provider.description,
        services: provider.services || [],
        location: {
          address: provider.location?.address || '',
          city: provider.location?.city || '',
          state: provider.location?.state || '',
          zipCode: provider.location?.zip || '',
          coordinates: {
            lat: provider.location?.coordinates?.lat || 0,
            lng: provider.location?.coordinates?.lng || 0
          }
        },
        rating: provider.rating || 0,
        reviewCount: provider.review_count || 0,
        priceRange: {
          min: provider.price_range?.min || 0,
          max: provider.price_range?.max || 100
        },
        availability: provider.availability || {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: []
        },
        certifications: provider.certifications || [],
        experience: provider.experience_years || 0,
        images: provider.images || [],
        avatarUrl: provider.avatar_url,
        isVerified: provider.is_verified || false,
        status: provider.status || 'active',
        businessType: provider.business_type || 'individual',
        contactInfo: provider.contact_info || {},
        businessHours: provider.business_hours || {},
        createdAt: provider.created_at,
        updatedAt: provider.updated_at
      }
    } catch (error) {
      console.error('Error in getProviderById:', error)
      throw error
    }
  },

  // Search providers with filters and services
  async searchProviders(filters?: {
    category?: string
    location?: string
    priceRange?: { min: number; max: number }
    rating?: number
    distance?: number
    date?: string
    petId?: string
    verifiedOnly?: boolean
  }) {
    try {
      
      // Start with a simple query to get all providers
      let query = supabase
        .from('providers')
        .select('*')
        .eq('status', 'active')
        .eq('business_type', 'grooming') // Only show grooming providers
      
      // Only filter by verification if explicitly requested (default to show all active providers)
      if (filters?.verifiedOnly === true) {
        query = query.eq('is_verified', true)
      }

      // Apply category filter
      if (filters?.category && filters.category !== 'all') {
        // For training and adoption categories, we need to check the services table
        if (filters.category === 'training' || filters.category === 'adoption') {
          // Get providers that have services in this category
          const { data: categoryProviders } = await supabase
            .from('services')
            .select('provider_id')
            .eq('category', filters.category)
            .eq('is_active', true)
          
          if (categoryProviders && categoryProviders.length > 0) {
            const providerIds = categoryProviders.map(p => p.provider_id)
            query = query.in('id', providerIds)
          } else {
            // No providers found for this category, return empty result
            query = query.eq('id', '00000000-0000-0000-0000-000000000000')
          }
        } else {
          // Use overlaps to check if any service in the array matches the category
          query = query.overlaps('services', [filters.category])
        }
      }

      // Apply rating filter
      if (filters?.rating && filters.rating > 0) {
        query = query.gte('rating', filters.rating)
      }

      // Apply price range filter
      if (filters?.priceRange) {
        query = query.gte('price_range->min', filters.priceRange.min)
        query = query.lte('price_range->max', filters.priceRange.max)
      }

      const { data: providers, error } = await query

      if (error) {
        // Error searching providers
        throw error
      }

      // Apply location filter after getting providers
      let filteredProviders = providers || []
      
      if (filters?.location && filters.location.trim()) {
        const searchLocation = filters.location.toLowerCase().trim()
        filteredProviders = filteredProviders.filter(provider => {
          if (!provider.location?.city) return false
          return provider.location.city.toLowerCase().includes(searchLocation)
        })
      }

      // Found providers

      // Transform snake_case to camelCase and add services
      const transformedProviders = await Promise.all(
        filteredProviders.map(async (provider) => {
          // Fetch services for this provider from the services table (if any)
          const { data: services } = await supabase
            .from('services')
            .select('*')
            .eq('provider_id', provider.id)
            .eq('is_active', true)

          // Transform provider data to match ServiceProvider interface
          const transformedProvider = {
            id: provider.id,
            userId: provider.user_id,
            businessName: provider.business_name,
            businessType: provider.business_type,
            description: provider.description,
            services: provider.services || [],
            location: {
              address: provider.location?.address || '',
              city: provider.location?.city || '',
              state: provider.location?.state || '',
              zipCode: provider.location?.zip || '',
              coordinates: {
                lat: provider.location?.coordinates?.lat || 0,
                lng: provider.location?.coordinates?.lng || 0
              }
            },
            rating: provider.rating || 0,
            reviewCount: provider.review_count || 0,
            priceRange: {
              min: provider.price_range?.min || 0,
              max: provider.price_range?.max || 100
            },
            availability: provider.availability || {
              monday: [],
              tuesday: [],
              wednesday: [],
              thursday: [],
              friday: [],
              saturday: [],
              sunday: []
            },
            images: provider.images || [],
            certifications: provider.certifications || [],
            experience: provider.experience_years || 0,
            status: (provider.status || 'active') as 'active' | 'inactive' | 'pending',
            createdAt: provider.created_at,
            updatedAt: provider.updated_at
          }

          // Transform services data to match Service interface
          // Use services from the services table if available, otherwise create mock services from provider.services array
          const transformedServices = (services && services.length > 0) 
            ? services.map(service => ({
                id: service.id,
                providerId: service.provider_id,
                category: service.category,
                name: service.name,
                description: service.description,
                price: service.price,
                duration: service.duration_minutes,
                maxPets: service.max_pets,
                requirements: service.requirements || [],
                includes: service.includes || [],
                images: service.images || [],
                status: service.is_active ? 'active' as const : 'inactive' as const,
                createdAt: service.created_at,
                updatedAt: service.updated_at
              }))
            : (provider.services || []).map((serviceName: string, index: number) => ({
                id: `mock-${provider.id}-${index}`,
                providerId: provider.id,
                category: serviceName,
                name: serviceName,
                description: `${serviceName} service`,
                price: 50,
                duration: 60,
                maxPets: 1,
                requirements: [],
                includes: [],
                images: [],
                status: 'active' as const,
                createdAt: provider.created_at,
                updatedAt: provider.updated_at
              }))

          return {
            provider: transformedProvider,
            services: transformedServices,
            distance: Math.random() * 10 + 1 // Mock distance for now
          }
        })
      )

      return transformedProviders
    } catch (error) {
      // Error in searchProviders
      throw error
    }
  },

  // Get provider availability for a specific date
  async getProviderAvailability(providerId: string, date: string) {
    try {
      const { data, error } = await supabase.rpc('get_provider_availability', {
        provider_uuid: providerId,
        check_date: date
      })

      if (error) {
        // Error getting provider availability
        throw error
      }

      return data?.[0] || { is_available: false, available_slots: null }
    } catch (error) {
      // Error in getProviderAvailability
      throw error
    }
  },

  // Get unique locations from all providers for autocomplete
  async getProviderLocations() {
    try {
      const { data: providers, error } = await supabase
        .from('providers')
        .select('location')
        .eq('status', 'active')

      if (error) {
        throw error
      }

      // Extract unique cities and create location suggestions
      const locationMap = new Map<string, { name: string; city: string; coordinates: { lat: number; lng: number } }>()
      
      providers?.forEach(provider => {
        if (provider.location?.city && provider.location?.coordinates) {
          const city = provider.location.city
          const key = city.toLowerCase()
          
          if (!locationMap.has(key)) {
            locationMap.set(key, {
              name: city,
              city: city,
              coordinates: {
                lat: provider.location.coordinates.lat,
                lng: provider.location.coordinates.lng
              }
            })
          }
        }
      })

      // Convert to array and sort alphabetically
      return Array.from(locationMap.values())
        .map((location, index) => ({
          id: `location-${index}`,
          ...location
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Error getting provider locations:', error)
      return []
    }
  }
}
