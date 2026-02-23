'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  PetFeature, 
  CreateIndividualPetForm,
  PetType
} from '@/types'
import { 
  X, 
  Camera,
  Loader2,
  Calendar as CalendarIcon
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { ImageUploadService, extractPathFromUrl } from '@/lib/image-upload'
import { useAuth } from '@/contexts/auth-context'

const PET_FEATURES: { value: PetFeature; label: string }[] = [
  { value: 'microchipped', label: 'Mikročipas iki surinkimo datos' },
  { value: 'vaccinated', label: 'Vakcinos iki datos' },
  { value: 'wormed', label: 'Išvaryti parazitai ir blusos' },
  { value: 'health_checked', label: 'Sveikatos patikra veterinarijos' },
  { value: 'parents_tested', label: 'Tėvai sveikatos patikrinti' }
]

interface AddIndividualPetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  petTypes: PetType[]
  onSave: (pet: CreateIndividualPetForm, petTypeId: string) => Promise<void>
  loading?: boolean
}

export function AddIndividualPetDialog({
  open,
  onOpenChange,
  petTypes,
  onSave,
  loading = false
}: AddIndividualPetDialogProps) {
  const { user } = useAuth()
  const [selectedPetTypeId, setSelectedPetTypeId] = useState<string>('')
  const [pet, setPet] = useState<CreateIndividualPetForm>({
    title: '',
    price: 0,
    gallery: [],
    sexType: 'male',
    age: 0,
    readyToLeave: '',
    features: []
  })
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const galleryRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    if (!selectedPetTypeId) {
      toast.error('Prašome pasirinkti gyvūno tipą')
      return
    }

    if (!pet.title.trim()) {
      toast.error('Prašome įvesti gyvūno pavadinimą')
      return
    }

    if (pet.price <= 0) {
      toast.error('Prašome įvesti teisingą kainą')
      return
    }

    try {
      // Create a modified pet object with URLs instead of files
      const petWithUrls = {
        ...pet,
        gallery: uploadedUrls // Pass URLs instead of files
      }
      await onSave(petWithUrls as any, selectedPetTypeId)
      toast.success('Gyvūnas pridėtas sėkmingai')
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error('Error saving individual pet:', error)
      toast.error('Nepavyko išsaugoti gyvūno')
    }
  }

  const resetForm = () => {
    setSelectedPetTypeId('')
    setPet({
      title: '',
      price: 0,
      gallery: [],
      sexType: 'male',
      age: 0,
      readyToLeave: '',
      features: []
    })
    setUploadedUrls([])
  }

  const updatePet = (updates: Partial<CreateIndividualPetForm>) => {
    setPet(prev => ({ ...prev, ...updates }))
  }

  const toggleFeature = (feature: PetFeature) => {
    setPet(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleGalleryUpload = async (files: FileList) => {
    if (!user) return
    
    setUploadingImages(true)
    try {
      const fileArray = Array.from(files)
      const uploadResults = await ImageUploadService.uploadMultipleImages(
        fileArray,
        'individual-pets',
        user.id
      )
      
      const newUrls = uploadResults.map(result => result.url)
      setUploadedUrls(prev => [...prev, ...newUrls])
      toast.success(`${files.length} nuotraukos pridėtos`)
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Nepavyko įkelti nuotraukų')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeGalleryImage = async (index: number) => {
    const imageUrl = uploadedUrls[index]
    const imagePath = extractPathFromUrl(imageUrl)
    
    try {
      if (imagePath) {
        await ImageUploadService.deleteImage(imagePath)
      }
      setUploadedUrls(prev => prev.filter((_, i) => i !== index))
      toast.success('Nuotrauka ištrinta')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Nepavyko ištrinti nuotraukos')
    }
  }


  const selectedPetType = petTypes.find(pt => pt.id === selectedPetTypeId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pridėti naują gyvūną</DialogTitle>
          <DialogDescription>
            Pridėkite naują atskirą gyvūną prie pasirinkto tipo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pet Type Selection */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label>Gyvūno tipas *</Label>
              <Select value={selectedPetTypeId} onValueChange={setSelectedPetTypeId}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Pasirinkite gyvūno tipą" />
                </SelectTrigger>
                <SelectContent>
                  {petTypes.map((petType) => (
                    <SelectItem key={petType.id} value={petType.id}>
                      {petType.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPetType && (
                <p className="text-sm text-muted-foreground mt-1">
                  Pasirinktas tipas: {selectedPetType.title} - {selectedPetType.description}
                </p>
              )}
            </div>
          </div>

          {/* Pet Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Gyvūno pavadinimas *</Label>
              <Input
                value={pet.title}
                onChange={(e) => updatePet({ title: e.target.value })}
                placeholder="Pvz., Šuniukas #1"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Kaina (€) *</Label>
              <Input
                type="number"
                value={pet.price}
                onChange={(e) => updatePet({ price: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>
          
          {/* Sex and Ready to Leave in same grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label>Lytis *</Label>
              <Select
                value={pet.sexType}
                onValueChange={(value: 'male' | 'female') => 
                  updatePet({ sexType: value })
                }
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Patinas</SelectItem>
                  <SelectItem value="female">Patelė</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Paruoštas išvežti *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {pet.readyToLeave ? new Date(pet.readyToLeave).toLocaleDateString('lt-LT') : 'Pasirinkite datą'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={pet.readyToLeave ? new Date(pet.readyToLeave) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        updatePet({ readyToLeave: date.toISOString().split('T')[0] })
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Features */}
          <div>
            <Label className="text-sm font-medium">Savybės/opcijos</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {PET_FEATURES.map((feature) => (
                <div key={feature.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature.value}
                    checked={pet.features.includes(feature.value)}
                    onCheckedChange={() => toggleFeature(feature.value)}
                  />
                  <Label htmlFor={feature.value} className="text-sm">
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
                onClick={() => galleryRef.current?.click()}
                disabled={uploadingImages}
              >
                <Camera className="h-4 w-4 mr-2" />
                Pridėti nuotraukas
              </Button>
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files
                  if (files) handleGalleryUpload(files)
                }}
              />
              
              {uploadedUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {uploadedUrls.map((image, imageIndex) => (
                    <div key={imageIndex} className="relative group">
                      <div className="w-full h-20 bg-gray-200 rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`Gallery ${imageIndex + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-20 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                        <div className="w-full h-full items-center justify-center hidden">
                          <span className="text-xs text-muted-foreground">Image {imageIndex + 1}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeGalleryImage(imageIndex)}
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
            Pridėti gyvūną
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
