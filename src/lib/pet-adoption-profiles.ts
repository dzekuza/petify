import { supabase } from './supabase'
import { 
  PetType, 
  IndividualPet, 
  CreatePetTypeForm,
  CreateIndividualPetForm
} from '@/types'
import { uploadPetAdImage, getPetAdImageUrl } from './storage'

// Helper function to get provider ID from user ID
async function getProviderId(userId: string): Promise<string> {
  const { data: providerData, error: providerError } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (providerError || !providerData) {
    console.error('Error finding provider:', providerError)
    throw new Error('Provider not found. Please complete your provider profile first.')
  }

  return providerData.id
}

export const petAdoptionApi = {
  // Get all pet types for a provider
  async getPetTypesByProvider(userId: string): Promise<PetType[]> {
    try {
      const providerId = await getProviderId(userId)
      
      const { data, error } = await supabase
        .from('pet_types')
        .select(`
          *,
          individual_pets (
            id,
            pet_type_id,
            title,
            price,
            gallery,
            sex_type,
            age,
            ready_to_leave,
            features,
            created_at,
            updated_at
          )
        `)
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pet types:', error)
        throw new Error('Failed to fetch pet types')
      }

      if (!data) {
        return []
      }

      return data.map(petType => ({
        id: petType.id,
        providerId: petType.provider_id,
        title: petType.title,
        description: petType.description,
        breedType: petType.breed_type,
        individualPets: petType.individual_pets?.map((ip: any) => ({
          id: ip.id,
          petTypeId: ip.pet_type_id,
          title: ip.title,
          price: ip.price,
          gallery: ip.gallery || [],
          sexType: ip.sex_type,
          age: ip.age,
          readyToLeave: ip.ready_to_leave,
          features: ip.features || [],
          createdAt: ip.created_at,
          updatedAt: ip.updated_at
        })) || [],
        isActive: petType.is_active,
        createdAt: petType.created_at,
        updatedAt: petType.updated_at
      }))
    } catch (error) {
      console.error('Error in getPetTypesByProvider:', error)
      throw error // Re-throw to let caller handle
    }
  },

  // Get all active pet types (for search page)
  async getActivePetTypes(): Promise<PetType[]> {
    try {
      const { data, error } = await supabase
        .from('pet_types')
        .select(`
          *,
          individual_pets (
            id,
            pet_type_id,
            title,
            price,
            gallery,
            sex_type,
            age,
            ready_to_leave,
            features,
            created_at,
            updated_at
          ),
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
        console.error('Error fetching active pet types:', error)
        throw new Error('Failed to fetch pet types')
      }

      if (!data) {
        return []
      }

      return data.map(petType => ({
        id: petType.id,
        providerId: petType.provider_id,
        title: petType.title,
        description: petType.description,
        breedType: petType.breed_type,
        individualPets: petType.individual_pets?.map((ip: any) => ({
          id: ip.id,
          petTypeId: ip.pet_type_id,
          title: ip.title,
          price: ip.price,
          gallery: ip.gallery || [],
          sexType: ip.sex_type,
          age: ip.age,
          readyToLeave: ip.ready_to_leave,
          features: ip.features || [],
          createdAt: ip.created_at,
          updatedAt: ip.updated_at
        })) || [],
        isActive: petType.is_active,
        createdAt: petType.created_at,
        updatedAt: petType.updated_at
      }))
    } catch (error) {
      console.error('Error in getActivePetTypes:', error)
      throw error
    }
  },

  // Create a new pet type
  async createPetType(userId: string, form: CreatePetTypeForm): Promise<PetType> {
    try {
      // Validate input
      if (!form.title || !form.description || !form.breedType) {
        throw new Error('Title, description, and breed type are required')
      }

      if (form.title.length > 100) {
        throw new Error('Title must be less than 100 characters')
      }

      if (form.description.length > 500) {
        throw new Error('Description must be less than 500 characters')
      }

      const providerId = await getProviderId(userId)

      // Create the pet type with the correct provider_id
      const { data: petTypeData, error: petTypeError } = await supabase
        .from('pet_types')
        .insert({
          provider_id: providerId,
          title: form.title.trim(),
          description: form.description.trim(),
          breed_type: form.breedType.trim(),
          is_active: true
        })
        .select()
        .single()

      if (petTypeError) {
        console.error('Error creating pet type:', petTypeError)
        throw new Error(`Failed to create pet type: ${petTypeError.message}`)
      }

      if (!petTypeData) {
        throw new Error('Failed to create pet type: No data returned')
      }

      // Create individual pets for this pet type
      for (const individualPetForm of form.individualPets) {
        // Validate individual pet data
        if (!individualPetForm.title || !individualPetForm.price || !individualPetForm.sexType || !individualPetForm.age) {
          throw new Error('Individual pet must have title, price, sex type, and age')
        }

        if (individualPetForm.price < 0 || individualPetForm.price > 10000) {
          throw new Error('Price must be between 0 and 10000')
        }

        if (individualPetForm.age < 0 || individualPetForm.age > 200) {
          throw new Error('Age must be between 0 and 200 weeks')
        }

        // Handle gallery images (files or URLs)
        let galleryUrls: string[] = []
        if (individualPetForm.gallery && individualPetForm.gallery.length > 0) {
          // Check if gallery contains files or URLs
          const firstItem = individualPetForm.gallery[0]
          if (typeof firstItem === 'string') {
            // Gallery contains URLs (from edit dialog or pre-uploaded)
            galleryUrls = individualPetForm.gallery as unknown as string[]
          } else {
            // Gallery contains files (from new upload)
            try {
              // Limit to 10 images per pet
              const limitedGallery = individualPetForm.gallery.slice(0, 10)
              
              const uploadPromises = limitedGallery.map(async (file: File) => {
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                  throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`)
                }

                // Validate file type
                if (!file.type.startsWith('image/')) {
                  throw new Error(`File ${file.name} is not an image.`)
                }

                const uploadResult = await uploadPetAdImage(file, `pet-${Date.now()}-${Math.random()}`)
                if (uploadResult.data) {
                  return getPetAdImageUrl(`pet-${Date.now()}-${Math.random()}`, uploadResult.data.path.split('/').pop() || '')
                }
                return null
              })

              const uploadedUrls = await Promise.all(uploadPromises)
              galleryUrls = uploadedUrls.filter((url): url is string => url !== null)
            } catch (uploadError) {
              console.error('Error uploading gallery images:', uploadError)
              throw new Error(`Failed to upload images: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
            }
          }
        }

        const { error: individualPetError } = await supabase
          .from('individual_pets')
          .insert({
            pet_type_id: petTypeData.id,
            title: individualPetForm.title.trim(),
            price: individualPetForm.price,
            gallery: galleryUrls,
            sex_type: individualPetForm.sexType,
            age: individualPetForm.age,
            ready_to_leave: individualPetForm.readyToLeave,
            features: individualPetForm.features || []
          })

        if (individualPetError) {
          console.error('Error creating individual pet:', individualPetError)
          throw new Error(`Failed to create individual pet: ${individualPetError.message}`)
        }
      }

      // Fetch the complete pet type with all related data
      const completePetType = await this.getPetTypeById(petTypeData.id)
      return completePetType

    } catch (error) {
      console.error('Error in createPetType:', error)
      throw error
    }
  },

  // Get a single pet type by ID
  async getPetTypeById(petTypeId: string): Promise<PetType> {
    const { data, error } = await supabase
      .from('pet_types')
      .select(`
        *,
        individual_pets (*)
      `)
      .eq('id', petTypeId)
      .single()

    if (error) {
      console.error('Error fetching pet type:', error)
      throw new Error('Failed to fetch pet type')
    }

    return {
      id: data.id,
      providerId: data.provider_id,
      title: data.title,
      description: data.description,
      breedType: data.breed_type,
      individualPets: data.individual_pets?.map((ip: any) => ({
        id: ip.id,
        petTypeId: ip.pet_type_id,
        title: ip.title,
        price: ip.price,
        gallery: ip.gallery || [],
        sexType: ip.sex_type,
        age: ip.age,
        readyToLeave: ip.ready_to_leave,
        features: ip.features || [],
        createdAt: ip.created_at,
        updatedAt: ip.updated_at
      })) || [],
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Update a pet type
  async updatePetType(petTypeId: string, form: Partial<CreatePetTypeForm>): Promise<PetType> {
    try {
      // Update the pet type
      const { error: petTypeError } = await supabase
        .from('pet_types')
        .update({
          title: form.title,
          description: form.description,
          breed_type: form.breedType,
          updated_at: new Date().toISOString()
        })
        .eq('id', petTypeId)

      if (petTypeError) {
        console.error('Error updating pet type:', petTypeError)
        throw new Error('Failed to update pet type')
      }

      // If individual pets are provided, update them
      if (form.individualPets) {
        // Delete existing individual pets
        const { error: deleteError } = await supabase
          .from('individual_pets')
          .delete()
          .eq('pet_type_id', petTypeId)

        if (deleteError) {
          console.error('Error deleting existing individual pets:', deleteError)
          throw new Error('Failed to update individual pets')
        }

        // Create new individual pets
        for (const individualPetForm of form.individualPets) {
          // Upload gallery images first
          let galleryUrls: string[] = []
          if (individualPetForm.gallery && individualPetForm.gallery.length > 0) {
            try {
              const uploadPromises = individualPetForm.gallery.map(async (file: File) => {
                const uploadResult = await uploadPetAdImage(file, `pet-${Date.now()}`)
                if (uploadResult.data) {
                  return getPetAdImageUrl(`pet-${Date.now()}`, uploadResult.data.path.split('/').pop() || '')
                }
                return null
              })

              const uploadedUrls = await Promise.all(uploadPromises)
              galleryUrls = uploadedUrls.filter((url): url is string => url !== null)
            } catch (uploadError) {
              console.error('Error uploading gallery images:', uploadError)
              // Continue without images
            }
          }

          const { error: individualPetError } = await supabase
            .from('individual_pets')
            .insert({
              pet_type_id: petTypeId,
              title: individualPetForm.title,
              price: individualPetForm.price,
              gallery: galleryUrls,
              sex_type: individualPetForm.sexType,
              age: individualPetForm.age,
              ready_to_leave: individualPetForm.readyToLeave,
              features: individualPetForm.features
            })

          if (individualPetError) {
            console.error('Error creating individual pet:', individualPetError)
            throw new Error('Failed to create individual pet')
          }
        }
      }

      // Fetch the complete updated pet type
      const updatedPetType = await this.getPetTypeById(petTypeId)
      return updatedPetType

    } catch (error) {
      console.error('Error in updatePetType:', error)
      throw error
    }
  },

  // Delete a pet type
  async deletePetType(petTypeId: string): Promise<void> {
    const { error } = await supabase
      .from('pet_types')
      .delete()
      .eq('id', petTypeId)

    if (error) {
      console.error('Error deleting pet type:', error)
      throw new Error('Failed to delete pet type')
    }
  },

  // Toggle pet type active status
  async togglePetTypeStatus(petTypeId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('pet_types')
      .update({ is_active: isActive })
      .eq('id', petTypeId)

    if (error) {
      console.error('Error toggling pet type status:', error)
      throw new Error('Failed to update pet type status')
    }
  },

  // Add individual pet to a pet type
  async addIndividualPetToType(petTypeId: string, pet: CreateIndividualPetForm): Promise<PetType> {
    // Insert the new individual pet into the individual_pets table
    const { data: newPet, error: insertError } = await supabase
      .from('individual_pets')
      .insert({
        pet_type_id: petTypeId,
        title: pet.title,
        price: pet.price,
        gallery: pet.gallery,
        sex_type: pet.sexType,
        age: pet.age,
        ready_to_leave: pet.readyToLeave,
        features: pet.features
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting individual pet:', insertError)
      throw new Error('Failed to add individual pet')
    }

    return await this.getPetTypeById(petTypeId)
  },

  // Update an individual pet
  async updateIndividualPet(petId: string, pet: CreateIndividualPetForm): Promise<IndividualPet> {
    const { data, error } = await supabase
      .from('individual_pets')
      .update({
        title: pet.title,
        price: pet.price,
        gallery: pet.gallery,
        sex_type: pet.sexType,
        age: pet.age,
        ready_to_leave: pet.readyToLeave,
        features: pet.features
      })
      .eq('id', petId)
      .select()
      .single()

    if (error) {
      console.error('Error updating individual pet:', error)
      throw new Error('Failed to update individual pet')
    }

    return {
      id: data.id,
      petTypeId: data.pet_type_id,
      title: data.title,
      price: data.price,
      gallery: data.gallery,
      sexType: data.sex_type,
      age: data.age,
      readyToLeave: data.ready_to_leave,
      features: data.features,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Delete an individual pet
  async deleteIndividualPet(petId: string): Promise<void> {
    const { error } = await supabase
      .from('individual_pets')
      .delete()
      .eq('id', petId)

    if (error) {
      console.error('Error deleting individual pet:', error)
      throw new Error('Failed to delete individual pet')
    }
  },

  // Get all individual pets for a provider
  async getIndividualPetsByProvider(providerUserId: string): Promise<IndividualPet[]> {
    const { data, error } = await supabase
      .from('individual_pets')
      .select(`
        *,
        pet_types!inner (
          id,
          provider_id,
          providers!inner (
            user_id
          )
        )
      `)
      .eq('pet_types.providers.user_id', providerUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching individual pets:', error)
      throw new Error('Failed to fetch individual pets')
    }

    return data.map((pet: any) => ({
      id: pet.id,
      petTypeId: pet.pet_type_id,
      title: pet.title,
      price: pet.price,
      gallery: pet.gallery,
      sexType: pet.sex_type,
      age: pet.age,
      readyToLeave: pet.ready_to_leave,
      features: pet.features,
      createdAt: pet.created_at,
      updatedAt: pet.updated_at
    }))
  },

  // Get public individual pets for landing page
  async getPublicIndividualPets(limit: number = 8): Promise<IndividualPet[]> {
    const { data, error } = await supabase
      .from('individual_pets')
      .select(`
        *,
        pet_types!inner (
          id,
          title,
          description,
          breed_type,
          provider_id,
          providers!inner (
            id,
            business_name,
            business_type,
            location
          )
        )
      `)
      .eq('pet_types.is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching public individual pets:', error)
      throw new Error('Failed to fetch public individual pets')
    }

    return data.map((pet: any) => ({
      id: pet.id,
      petTypeId: pet.pet_type_id,
      title: pet.title,
      price: pet.price,
      gallery: pet.gallery,
      sexType: pet.sex_type,
      age: pet.age,
      readyToLeave: pet.ready_to_leave,
      features: pet.features,
      createdAt: pet.created_at,
      updatedAt: pet.updated_at
    }))
  }
}