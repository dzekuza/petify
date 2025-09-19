'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { PetTypeCreateDialog } from '@/components/pet-type-create-dialog'
import { PetTypeCard } from '@/components/pet-type-card'
import { AddIndividualPetDialog } from '@/components/add-individual-pet-dialog'
import { petAdoptionApi } from '@/lib/pet-adoption-profiles'
import { PetType, CreatePetTypeForm, CreateIndividualPetForm } from '@/types'
import { 
  Plus, 
  Heart,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

export default function ProviderPetAdsPage() {
  const { user } = useAuth()
  const [petTypes, setPetTypes] = useState<PetType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAddPetDialog, setShowAddPetDialog] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchPetTypes = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError(null)
      const userPetTypes = await petAdoptionApi.getPetTypesByProvider(user.id)
      setPetTypes(userPetTypes)
    } catch (err) {
      console.error('Error fetching pet types:', err)
      setError('Failed to fetch pet types')
      toast.error('Failed to load pet types')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchPetTypes()
  }, [fetchPetTypes])

  const handleAddPetType = () => {
    setShowCreateDialog(true)
  }

  const handleAddIndividualPet = () => {
    if (petTypes.length === 0) {
      toast.error('Pirma sukurkite bent vieną gyvūno tipą')
      return
    }
    setShowAddPetDialog(true)
  }


  const handleCreatePetType = async (formData: CreatePetTypeForm) => {
    if (!user?.id) return

    try {
      setSaving(true)
      const newPetType = await petAdoptionApi.createPetType(user.id, formData)
      setPetTypes(prev => [newPetType, ...prev])
      toast.success('Gyvūnų tipas sukurtas sėkmingai')
      setShowCreateDialog(false)
    } catch (error) {
      console.error('Error creating pet type:', error)
      toast.error('Failed to create pet type')
    } finally {
      setSaving(false)
    }
  }


  const handleDeletePetType = async (petTypeId: string) => {
    if (!confirm('Are you sure you want to delete this pet type? This action cannot be undone.')) {
      return
    }

    try {
      await petAdoptionApi.deletePetType(petTypeId)
      setPetTypes(prev => prev.filter(pt => pt.id !== petTypeId))
      toast.success('Gyvūnų tipas ištrintas sėkmingai')
    } catch (error) {
      console.error('Error deleting pet type:', error)
      toast.error('Failed to delete pet type')
    }
  }

  const handleToggleStatus = async (petTypeId: string, isActive: boolean) => {
    try {
      await petAdoptionApi.togglePetTypeStatus(petTypeId, isActive)
      setPetTypes(prev => prev.map(pt => 
        pt.id === petTypeId ? { ...pt, isActive } : pt
      ))
      toast.success(`Pet type ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Error toggling pet type status:', error)
      toast.error('Failed to update pet type status')
    }
  }

  const handleSaveIndividualPet = async (pet: CreateIndividualPetForm, petTypeId: string) => {
    try {
      setSaving(true)
      const updatedPetType = await petAdoptionApi.addIndividualPetToType(petTypeId, pet)
      setPetTypes(prev => prev.map(pt => 
        pt.id === petTypeId ? updatedPetType : pt
      ))
      setShowAddPetDialog(false)
    } catch (error) {
      console.error('Error saving individual pet:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }


  if (!user) return null

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gyvūnų tipai</h1>
            <p className="text-gray-600">Valdykite savo gyvūnų tipus ir atskirus gyvūnus</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddPetType} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Pridėti tipą
            </Button>
            <Button onClick={handleAddIndividualPet} className="bg-black text-white hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Pridėti gyvūną
            </Button>
          </div>
        </div>

        {/* Pet Types List */}
        {loading ? (
          <Card>
            <CardContent className="text-center py-8">
              <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Kraunami gyvūnų tipai...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchPetTypes}>Bandyti dar kartą</Button>
            </CardContent>
          </Card>
        ) : petTypes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dar nėra gyvūnų tipų</h3>
              <p className="text-gray-600 mb-4">Sukurkite savo pirmą gyvūnų tipą</p>
              <Button onClick={handleAddPetType}>
                <Plus className="h-4 w-4 mr-2" />
                Pridėti tipą
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {petTypes.map((petType) => (
              <PetTypeCard
                key={petType.id}
                petType={petType}
                onToggleStatus={handleToggleStatus}
                onManagePets={() => {}} // Will be implemented later
                onDelete={handleDeletePetType}
              />
            ))}
          </div>
        )}

        {/* Create Pet Type Dialog */}
        <PetTypeCreateDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSave={handleCreatePetType}
          loading={saving}
        />

        {/* Add Individual Pet Dialog */}
        <AddIndividualPetDialog
          open={showAddPetDialog}
          onOpenChange={setShowAddPetDialog}
          petTypes={petTypes}
          onSave={handleSaveIndividualPet}
          loading={saving}
        />

      </div>
    </ProtectedRoute>
  )
}