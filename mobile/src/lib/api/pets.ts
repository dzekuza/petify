import { supabase } from '@/lib/supabase'
import { transformPet } from '@/lib/transforms'
import type { Pet } from '@/types'

export async function getUserPets(userId: string): Promise<Pet[]> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(transformPet)
}

export async function getPetById(petId: string): Promise<Pet | null> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .single()

  if (error) throw error
  if (!data) return null
  return transformPet(data)
}

export async function createPet(pet: {
  ownerId: string
  name: string
  species: Pet['species']
  breed?: string
  age: number
  weight?: number
  specialNeeds?: string[]
  medicalNotes?: string
}): Promise<Pet> {
  const { data, error } = await supabase
    .from('pets')
    .insert({
      owner_id: pet.ownerId,
      name: pet.name,
      species: pet.species,
      breed: pet.breed || null,
      age: pet.age,
      weight: pet.weight || null,
      special_needs: pet.specialNeeds || null,
      medical_notes: pet.medicalNotes || null,
    })
    .select()
    .single()

  if (error) throw error
  return transformPet(data)
}
