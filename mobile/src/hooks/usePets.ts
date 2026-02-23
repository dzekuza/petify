import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserPets, getPetById, createPet } from '@/lib/api/pets'
import type { Pet } from '@/types'

export function useUserPets(userId: string | undefined) {
  return useQuery({
    queryKey: ['pets', userId],
    queryFn: () => getUserPets(userId!),
    enabled: !!userId,
  })
}

export function usePet(petId: string | undefined) {
  return useQuery({
    queryKey: ['pets', 'detail', petId],
    queryFn: () => getPetById(petId!),
    enabled: !!petId,
  })
}

export function useCreatePet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pet: {
      ownerId: string
      name: string
      species: Pet['species']
      breed?: string
      age: number
      weight?: number
      specialNeeds?: string[]
      medicalNotes?: string
    }) => createPet(pet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
    },
  })
}
