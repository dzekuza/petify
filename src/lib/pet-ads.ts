import { supabase } from './supabase'
import { PetAd, PetAdRequest, CreatePetAdForm } from '@/types'

export const petAdsApi = {
  // Get all pet ads for a provider
  async getPetAdsByProvider(providerId: string): Promise<PetAd[]> {
    const { data, error } = await supabase
      .from('pet_ads')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pet ads:', error)
      throw new Error('Failed to fetch pet ads')
    }

    return data.map(ad => ({
      id: ad.id,
      providerId: ad.provider_id,
      name: ad.name,
      description: ad.description,
      price: ad.price,
      species: ad.species,
      breed: ad.breed,
      age: ad.age,
      gender: ad.gender,
      size: ad.size,
      color: ad.color,
      weight: ad.weight,
      vaccinationStatus: ad.vaccination_status,
      medicalNotes: ad.medical_notes,
      behavioralNotes: ad.behavioral_notes,
      specialNeeds: ad.special_needs || [],
      images: ad.images || [],
      isActive: ad.is_active,
      createdAt: ad.created_at,
      updatedAt: ad.updated_at
    }))
  },

  // Get all active pet ads (for search page)
  async getActivePetAds(): Promise<PetAd[]> {
    const { data, error } = await supabase
      .from('pet_ads')
      .select(`
        *,
        providers!inner(
          id,
          business_name,
          location,
          contact_info,
          rating,
          review_count,
          images
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching active pet ads:', error)
      throw new Error('Failed to fetch pet ads')
    }

    return data.map(ad => ({
      id: ad.id,
      providerId: ad.provider_id,
      name: ad.name,
      description: ad.description,
      price: ad.price,
      species: ad.species,
      breed: ad.breed,
      age: ad.age,
      gender: ad.gender,
      size: ad.size,
      color: ad.color,
      weight: ad.weight,
      vaccinationStatus: ad.vaccination_status,
      medicalNotes: ad.medical_notes,
      behavioralNotes: ad.behavioral_notes,
      specialNeeds: ad.special_needs || [],
      images: ad.images || [],
      isActive: ad.is_active,
      createdAt: ad.created_at,
      updatedAt: ad.updated_at
    }))
  },

  // Create a new pet ad
  async createPetAd(providerId: string, form: CreatePetAdForm): Promise<PetAd> {
    const { data, error } = await supabase
      .from('pet_ads')
      .insert({
        provider_id: providerId,
        name: form.name,
        description: form.description,
        price: form.price,
        species: form.species,
        breed: form.breed,
        age: form.age,
        gender: form.gender,
        size: form.size,
        color: form.color,
        weight: form.weight,
        vaccination_status: form.vaccinationStatus,
        medical_notes: form.medicalNotes,
        behavioral_notes: form.behavioralNotes,
        special_needs: form.specialNeeds || [],
        images: [] // TODO: Handle image upload
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating pet ad:', error)
      throw new Error('Failed to create pet ad')
    }

    return {
      id: data.id,
      providerId: data.provider_id,
      name: data.name,
      description: data.description,
      price: data.price,
      species: data.species,
      breed: data.breed,
      age: data.age,
      gender: data.gender,
      size: data.size,
      color: data.color,
      weight: data.weight,
      vaccinationStatus: data.vaccination_status,
      medicalNotes: data.medical_notes,
      behavioralNotes: data.behavioral_notes,
      specialNeeds: data.special_needs || [],
      images: data.images || [],
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Update a pet ad
  async updatePetAd(adId: string, form: Partial<CreatePetAdForm>): Promise<PetAd> {
    const { data, error } = await supabase
      .from('pet_ads')
      .update({
        name: form.name,
        description: form.description,
        price: form.price,
        species: form.species,
        breed: form.breed,
        age: form.age,
        gender: form.gender,
        size: form.size,
        color: form.color,
        weight: form.weight,
        vaccination_status: form.vaccinationStatus,
        medical_notes: form.medicalNotes,
        behavioral_notes: form.behavioralNotes,
        special_needs: form.specialNeeds || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', adId)
      .select()
      .single()

    if (error) {
      console.error('Error updating pet ad:', error)
      throw new Error('Failed to update pet ad')
    }

    return {
      id: data.id,
      providerId: data.provider_id,
      name: data.name,
      description: data.description,
      price: data.price,
      species: data.species,
      breed: data.breed,
      age: data.age,
      gender: data.gender,
      size: data.size,
      color: data.color,
      weight: data.weight,
      vaccinationStatus: data.vaccination_status,
      medicalNotes: data.medical_notes,
      behavioralNotes: data.behavioral_notes,
      specialNeeds: data.special_needs || [],
      images: data.images || [],
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Delete a pet ad
  async deletePetAd(adId: string): Promise<void> {
    const { error } = await supabase
      .from('pet_ads')
      .delete()
      .eq('id', adId)

    if (error) {
      console.error('Error deleting pet ad:', error)
      throw new Error('Failed to delete pet ad')
    }
  },

  // Toggle pet ad active status
  async togglePetAdStatus(adId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('pet_ads')
      .update({ is_active: isActive })
      .eq('id', adId)

    if (error) {
      console.error('Error toggling pet ad status:', error)
      throw new Error('Failed to update pet ad status')
    }
  },

  // Get pet ad requests for a provider
  async getPetAdRequests(providerId: string): Promise<PetAdRequest[]> {
    const { data, error } = await supabase
      .from('pet_ad_requests')
      .select(`
        *,
        pet_ads!inner(
          id,
          name,
          provider_id
        ),
        users!inner(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('pet_ads.provider_id', providerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pet ad requests:', error)
      throw new Error('Failed to fetch pet ad requests')
    }

    return data.map(request => ({
      id: request.id,
      petAdId: request.pet_ad_id,
      customerId: request.customer_id,
      message: request.message,
      status: request.status,
      createdAt: request.created_at,
      updatedAt: request.updated_at,
      petAd: {
        id: request.pet_ads.id,
        name: request.pet_ads.name,
        providerId: request.pet_ads.provider_id
      } as any,
      customer: {
        id: request.users.id,
        fullName: request.users.full_name,
        email: request.users.email,
        avatar: request.users.avatar_url
      } as any
    }))
  },

  // Create a pet ad request
  async createPetAdRequest(petAdId: string, customerId: string, message?: string): Promise<PetAdRequest> {
    const { data, error } = await supabase
      .from('pet_ad_requests')
      .insert({
        pet_ad_id: petAdId,
        customer_id: customerId,
        message: message
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating pet ad request:', error)
      throw new Error('Failed to create pet ad request')
    }

    return {
      id: data.id,
      petAdId: data.pet_ad_id,
      customerId: data.customer_id,
      message: data.message,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Update pet ad request status
  async updatePetAdRequestStatus(requestId: string, status: 'pending' | 'approved' | 'rejected' | 'completed'): Promise<void> {
    const { error } = await supabase
      .from('pet_ad_requests')
      .update({ status })
      .eq('id', requestId)

    if (error) {
      console.error('Error updating pet ad request status:', error)
      throw new Error('Failed to update pet ad request status')
    }
  }
}
