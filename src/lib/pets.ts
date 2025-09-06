import { supabase } from './supabase'
import { Pet } from '@/types'

export interface CreatePetRequest {
  name: string
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
  breed?: string
  age: number // years
  weight?: number // kg
  specialNeeds?: string[]
  medicalNotes?: string
  profilePicture?: string
  galleryImages?: string[]
}

export interface UpdatePetRequest extends Partial<CreatePetRequest> {
  id: string
}

export const petsApi = {
  // Get all pets for a user
  async getUserPets(userId: string): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch pets: ${error.message}`)
    }

    return data.map(pet => ({
      id: pet.id,
      ownerId: pet.owner_id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      specialNeeds: pet.special_needs || [],
      medicalNotes: pet.medical_notes,
      profilePicture: pet.profile_picture,
      galleryImages: pet.gallery_images || [],
      createdAt: pet.created_at,
      updatedAt: pet.updated_at
    }))
  },

  // Get a specific pet by ID
  async getPet(petId: string): Promise<Pet> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch pet: ${error.message}`)
    }

    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      species: data.species,
      breed: data.breed,
      age: data.age,
      weight: data.weight,
      specialNeeds: data.special_needs || [],
      medicalNotes: data.medical_notes,
      profilePicture: data.profile_picture,
      galleryImages: data.gallery_images || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Create a new pet
  async createPet(petData: CreatePetRequest, userId: string): Promise<Pet> {
    const { data, error } = await supabase
      .from('pets')
      .insert({
        owner_id: userId,
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        age: petData.age,
        weight: petData.weight,
        special_needs: petData.specialNeeds,
        medical_notes: petData.medicalNotes,
        profile_picture: petData.profilePicture,
        gallery_images: petData.galleryImages || []
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create pet: ${error.message}`)
    }

    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      species: data.species,
      breed: data.breed,
      age: data.age,
      weight: data.weight,
      specialNeeds: data.special_needs || [],
      medicalNotes: data.medical_notes,
      profilePicture: data.profile_picture,
      galleryImages: data.gallery_images || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Update a pet
  async updatePet(petData: UpdatePetRequest): Promise<Pet> {
    const { data, error } = await supabase
      .from('pets')
      .update({
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        age: petData.age,
        weight: petData.weight,
        special_needs: petData.specialNeeds,
        medical_notes: petData.medicalNotes,
        profile_picture: petData.profilePicture,
        gallery_images: petData.galleryImages,
        updated_at: new Date().toISOString()
      })
      .eq('id', petData.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update pet: ${error.message}`)
    }

    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      species: data.species,
      breed: data.breed,
      age: data.age,
      weight: data.weight,
      specialNeeds: data.special_needs || [],
      medicalNotes: data.medical_notes,
      profilePicture: data.profile_picture,
      galleryImages: data.gallery_images || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  // Delete a pet
  async deletePet(petId: string): Promise<void> {
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId)

    if (error) {
      throw new Error(`Failed to delete pet: ${error.message}`)
    }
  }
}
