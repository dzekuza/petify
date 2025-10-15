'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { InputField, TextareaField } from '@/components/ui/input-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { BreedSelector } from '@/components/ui/breed-selector'
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from '@/components/ui/drawer'
import { ArrowLeft, ArrowRight, Plus, PawPrint } from 'lucide-react'
import { petsApi } from '@/lib/pets'
import { useAuth } from '@/contexts/auth-context'
import { useDeviceDetection } from '@/lib/device-detection'
import { toast } from 'sonner'
import type { BookingStepProps, BookingFormData } from './types'

export function BookingStep2({ 
  pets, 
  selectedPets, 
  onPetSelect, 
  onNext, 
  onPrev, 
  loading = false 
}: BookingStepProps) {
  const { user } = useAuth()
  const { isMobile } = useDeviceDetection()
  const [addPetDrawerOpen, setAddPetDrawerOpen] = useState(false)
  const [addPetForm, setAddPetForm] = useState<BookingFormData>({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    weight: '',
    specialNeeds: '',
    medicalNotes: '',
    profilePicture: '',
    galleryImages: []
  })
  const [addPetLoading, setAddPetLoading] = useState(false)
  const [petsLoading, setPetsLoading] = useState(false)

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setAddPetLoading(true)

    try {
      const petData = {
        name: addPetForm.name,
        species: addPetForm.species,
        breed: addPetForm.breed || undefined,
        age: parseInt(addPetForm.age),
        weight: addPetForm.weight ? parseFloat(addPetForm.weight) : undefined,
        specialNeeds: addPetForm.specialNeeds ? addPetForm.specialNeeds.split(',').map(s => s.trim()) : undefined,
        medicalNotes: addPetForm.medicalNotes || undefined,
        profilePicture: addPetForm.profilePicture || undefined,
        galleryImages: addPetForm.galleryImages
      }

      const newPet = await petsApi.createPet(petData, user.id)
      
      // Reset form and close drawer
      setAddPetForm({
        name: '',
        species: 'dog',
        breed: '',
        age: '',
        weight: '',
        specialNeeds: '',
        medicalNotes: '',
        profilePicture: '',
        galleryImages: []
      })
      setAddPetDrawerOpen(false)
      
      // Refresh pets list
      setPetsLoading(true)
      const userPets = await petsApi.getUserPets(user.id)
      // Note: This would need to be passed up to parent component
      setPetsLoading(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add pet'
      toast.error(errorMessage)
    } finally {
      setAddPetLoading(false)
    }
  }

  const handleAddPetFormChange = (field: keyof BookingFormData, value: string) => {
    setAddPetForm(prev => ({ ...prev, [field]: value }))
  }

  const getPetIcon = (species: string) => {
    switch (species) {
      case 'dog':
        return <PawPrint className="h-4 w-4 text-blue-600" />
      case 'cat':
        return <PawPrint className="h-4 w-4 text-purple-600" />
      case 'bird':
        return <PawPrint className="h-4 w-4 text-green-600" />
      case 'rabbit':
        return <PawPrint className="h-4 w-4 text-pink-600" />
      default:
        return <PawPrint className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pasirinkite augintinį
        </h2>
        <p className="text-gray-600">
          Pasirinkite augintinį, kuriam užsakysite paslaugą
        </p>
      </div>

      <div className="space-y-4">
        {petsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : pets.length > 0 ? (
          pets.map((pet) => {
            const isSelected = selectedPets.includes(pet.id)
            return (
              <div 
                key={pet.id} 
                className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onPetSelect(pet.id)}
              >
                <div className="flex-shrink-0">
                  {getPetIcon(pet.species)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{pet.name}</div>
                  <div className="text-sm text-gray-500">
                    {pet.species} • {pet.age} metai
                    {pet.breed && ` • ${pet.breed}`}
                  </div>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <PawPrint className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Neturite pridėtų augintinių</p>
            <Button onClick={() => setAddPetDrawerOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Pridėti augintinį
            </Button>
          </div>
        )}

        {pets.length > 0 && (
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setAddPetDrawerOpen(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Pridėti naują augintinį</span>
            </Button>
          </div>
        )}
      </div>

      <div className={`flex justify-between pt-6 ${isMobile ? 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 space-x-3' : ''}`}>
        <Button 
          variant="outline" 
          onClick={onPrev}
          className={isMobile ? 'flex-1' : ''}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Atgal
        </Button>
        <Button 
          onClick={onNext}
          disabled={selectedPets.length === 0 || loading}
          className={`flex items-center space-x-2 ${isMobile ? 'flex-1' : ''}`}
        >
          <span>Tęsti</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Add Pet Drawer */}
      <Drawer open={addPetDrawerOpen} onOpenChange={setAddPetDrawerOpen}>
        <DrawerContent className="h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Pridėti augintinį</DrawerTitle>
          </DrawerHeader>
          
          <form onSubmit={handleAddPet} className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
            <InputField
              id="petName"
              label="Augintinio vardas"
              value={addPetForm.name}
              onChange={(e) => handleAddPetFormChange('name', e.target.value)}
              placeholder="Įveskite augintinio vardą"
              required
            />

            <div className="space-y-2">
              <Label htmlFor="petSpecies">
                Augintinio tipas
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={addPetForm.species}
                onValueChange={(value) => handleAddPetFormChange('species', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pasirinkite tipą" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Šuo</SelectItem>
                  <SelectItem value="cat">Katė</SelectItem>
                  <SelectItem value="bird">Paukštis</SelectItem>
                  <SelectItem value="rabbit">Triušis</SelectItem>
                  <SelectItem value="other">Kitas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Veislė (neprivaloma)
              </label>
              <BreedSelector
                value={addPetForm.breed}
                onValueChange={(value) => handleAddPetFormChange('breed', value)}
                species={addPetForm.species}
                placeholder="Pasirinkite veislę (neprivaloma)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="petAge"
                label="Amžius (metai)"
                type="number"
                value={addPetForm.age}
                onChange={(e) => handleAddPetFormChange('age', e.target.value)}
                placeholder="0"
                required
                min={0}
                max={30}
              />
              <InputField
                id="petWeight"
                label="Svoris (kg)"
                type="number"
                value={addPetForm.weight}
                onChange={(e) => handleAddPetFormChange('weight', e.target.value)}
                placeholder="0.0"
                min={0}
                step={0.1}
              />
            </div>

            <InputField
              id="specialNeeds"
              label="Ypatingi poreikiai"
              value={addPetForm.specialNeeds}
              onChange={(e) => handleAddPetFormChange('specialNeeds', e.target.value)}
              placeholder="Kableliu atskirti sąrašas (neprivaloma)"
            />

            <TextareaField
              id="medicalNotes"
              label="Medicinos informacija"
              value={addPetForm.medicalNotes}
              onChange={(e) => handleAddPetFormChange('medicalNotes', e.target.value)}
              placeholder="Bet kokia medicinos informacija (neprivaloma)"
              rows={3}
            />
          </form>

          <DrawerFooter>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddPetDrawerOpen(false)}
                disabled={addPetLoading}
                className="flex-1"
              >
                Atšaukti
              </Button>
              <Button
                type="submit"
                disabled={addPetLoading || !addPetForm.name || !addPetForm.age}
                onClick={handleAddPet}
                className="flex-1"
              >
                {addPetLoading ? 'Pridedama...' : 'Pridėti augintinį'}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
