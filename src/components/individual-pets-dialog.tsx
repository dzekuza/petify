'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  IndividualPet, 
  PetFeature, 
  CreateIndividualPetForm
} from '@/types'
import { 
  Trash2, 
  Edit, 
  Camera, 
  X, 
  Loader2,
  Euro,
  Heart
} from 'lucide-react'
import Image from 'next/image'

interface IndividualPetsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  petTypeId: string
  petTypeTitle: string
  existingPets: IndividualPet[]
  onSave: (pets: CreateIndividualPetForm[]) => Promise<void>
  loading?: boolean
  autoAddPet?: boolean
}

const PET_FEATURES: { value: PetFeature; label: string }[] = [
  { value: 'microchipped', label: 'Mikročipas iki surinkimo datos' },
  { value: 'vaccinated', label: 'Vakcinos iki datos' },
  { value: 'wormed', label: 'Išvaryti parazitai ir blusos' },
  { value: 'health_checked', label: 'Sveikatos patikra veterinarijos' },
  { value: 'parents_tested', label: 'Tėvai sveikatos patikrinti' }
]

export function IndividualPetsDialog({ 
  open, 
  onOpenChange, 
  petTypeId,
  petTypeTitle,
  existingPets,
  onSave, 
  loading = false,
  autoAddPet = false
}: IndividualPetsDialogProps) {
  const [pets, setPets] = useState<CreateIndividualPetForm[]>(
    existingPets.map(pet => ({
      title: pet.title,
      price: pet.price,
      gallery: [],
      sexType: pet.sexType,
      age: 0,
      readyToLeave: '',
      features: pet.features
    }))
  )
  const [editingPet, setEditingPet] = useState<number | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)

  const galleryRefs = useRef<(HTMLInputElement | null)[]>([])

  // Auto-add pet when dialog opens with autoAddPet flag
  useEffect(() => {
    if (open && autoAddPet && pets.length === 0) {
      const newPet: CreateIndividualPetForm = {
        title: '',
        price: 0,
        gallery: [],
        sexType: 'male',
        age: 0,
        readyToLeave: '',
        features: []
      }
      setPets([newPet])
      setEditingPet(0) // Start editing the new pet immediately
    }
  }, [open, autoAddPet, pets.length])

  const handleSave = async () => {
    try {
      await onSave(pets)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving individual pets:', error)
    }
  }

  const addPet = () => {
    setPets(prev => [
      ...prev,
      {
        title: '',
        price: 0,
        gallery: [],
        sexType: 'male',
        age: 0,
        readyToLeave: '',
        features: []
      }
    ])
    setEditingPet(pets.length)
  }

  const addPetWithType = () => {
    setPets(prev => [
      ...prev,
      {
        title: '',
        price: 0,
        gallery: [],
        sexType: 'male',
        age: 0,
        readyToLeave: '',
        features: []
      }
    ])
    setEditingPet(pets.length)
    // TODO: Add logic to show type selection dialog
  }

  const updatePet = (index: number, updates: Partial<CreateIndividualPetForm>) => {
    setPets(prev => prev.map((pet, i) => 
      i === index ? { ...pet, ...updates } : pet
    ))
  }

  const removePet = (index: number) => {
    setPets(prev => prev.filter((_, i) => i !== index))
    setEditingPet(null)
  }

  const handleGalleryUpload = async (petIndex: number, files: FileList) => {
    setUploadingImages(true)
    try {
      const newFiles: File[] = []
      for (const file of Array.from(files)) {
        newFiles.push(file)
      }
      
      updatePet(petIndex, {
        gallery: [...pets[petIndex].gallery, ...newFiles]
      })
    } catch (error) {
      console.error('Error uploading gallery images:', error)
    } finally {
      setUploadingImages(false)
    }
  }

  const removeGalleryImage = (petIndex: number, imageIndex: number) => {
    const currentPet = pets[petIndex]
    const newGallery = currentPet.gallery.filter((_, i) => i !== imageIndex)
    updatePet(petIndex, { gallery: newGallery })
  }

  const toggleFeature = (petIndex: number, feature: PetFeature) => {
    const currentPet = pets[petIndex]
    const newFeatures = currentPet.features.includes(feature)
      ? currentPet.features.filter(f => f !== feature)
      : [...currentPet.features, feature]
    
    updatePet(petIndex, { features: newFeatures })
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                Valdyti gyvūnus - {petTypeTitle}
              </DialogTitle>
              <DialogDescription>
                Pridėkite ir valdykite atskirus gyvūnus šiam tipui
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Add logic to edit pet type
                console.log('Edit pet type:', petTypeId)
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Redaguoti tipą
            </Button>
          </div>
        </DialogHeader>

        {/* Add Pet Buttons */}
        <div className="flex justify-end gap-2">
          <Button onClick={addPet} size="sm">
            Pridėti gyvūną
          </Button>
          <Button onClick={addPetWithType} size="sm" className="bg-black text-white hover:bg-gray-800">
            Pridėti tipą
          </Button>
        </div>

        {/* Individual Pets */}
        <div className="space-y-4">
          {pets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Dar nėra atskirų gyvūnų</p>
              <p className="text-sm">Pridėkite pirmą gyvūną</p>
            </div>
          ) : (
              pets.map((pet, petIndex) => (
                <div key={petIndex} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{pet.title || 'Nepavadinotas gyvūnas'}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {pet.sexType === 'male' ? 'Patinas' : 'Patelė'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPet(
                          editingPet === petIndex ? null : petIndex
                        )}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Redaguoti
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removePet(petIndex)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Ištrinti
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Euro className="h-4 w-4 mr-1" />
                        {pet.price}€
                      </div>
                      {pet.features.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">Savybės: {pet.features.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {editingPet === petIndex && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Gyvūno pavadinimas *</Label>
                          <Input
                            value={pet.title}
                            onChange={(e) => updatePet(petIndex, { title: e.target.value })}
                            placeholder="Pvz., Šuniukas #1"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Kaina (€) *</Label>
                          <Input
                            type="number"
                            value={pet.price}
                            onChange={(e) => updatePet(petIndex, { price: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Lytis *</Label>
                          <Select
                            value={pet.sexType}
                            onValueChange={(value: 'male' | 'female') => 
                              updatePet(petIndex, { sexType: value })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Patinas</SelectItem>
                              <SelectItem value="female">Patelė</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <Label className="text-sm font-medium">Savybės/opcijos</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {PET_FEATURES.map((feature) => (
                            <div key={feature.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${petIndex}-${feature.value}`}
                                checked={pet.features.includes(feature.value)}
                                onCheckedChange={() => toggleFeature(petIndex, feature.value)}
                              />
                              <Label 
                                htmlFor={`${petIndex}-${feature.value}`}
                                className="text-sm"
                              >
                                {feature.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Gallery */}
                      <div>
                        <Label className="text-sm font-medium">Galerijos paveikslėliai</Label>
                        <div className="mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => galleryRefs.current[petIndex]?.click()}
                            disabled={uploadingImages}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Pridėti nuotraukas
                          </Button>
                          <input
                            ref={(el) => {
                              galleryRefs.current[petIndex] = el
                            }}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = e.target.files
                              if (files) handleGalleryUpload(petIndex, files)
                            }}
                          />
                          
                          {pet.gallery.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-3">
                              {pet.gallery.map((image, imageIndex) => (
                                <div key={imageIndex} className="relative group">
                                  {image instanceof File ? (
                                    <div className="w-full h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                      <span className="text-xs text-gray-500">
                                        {image.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <Image
                                      src={image}
                                      alt={`Gallery ${imageIndex + 1}`}
                                      width={80}
                                      height={80}
                                      className="w-full h-20 object-cover rounded-lg"
                                    />
                                  )}
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-1 right-1 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeGalleryImage(petIndex, imageIndex)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Atšaukti
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Išsaugoti gyvūnus
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
