'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { IndividualPet, PetFeature } from '@/types'
import { Calendar as CalendarIcon, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUploadService, extractPathFromUrl } from '@/lib/image-upload'
import { useAuth } from '@/contexts/auth-context'

interface EditIndividualPetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pet: IndividualPet | null
  onSave: (petId: string, updatedPet: Partial<IndividualPet>) => Promise<void>
  loading?: boolean
}

const PET_FEATURES: { value: PetFeature; label: string }[] = [
  { value: 'microchipped', label: 'Mikročipas iki surinkimo datos' },
  { value: 'vaccinated', label: 'Vakcinos iki datos' },
  { value: 'wormed', label: 'Išvaryti parazitai ir blusos' },
  { value: 'health_checked', label: 'Sveikatos patikra veterinarijos' },
  { value: 'parents_tested', label: 'Tėvai sveikatos patikrinti' }
]

export function EditIndividualPetDialog({
  open,
  onOpenChange,
  pet,
  onSave,
  loading = false
}: EditIndividualPetDialogProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    price: 0,
    sexType: 'male' as 'male' | 'female',
    age: 0,
    readyToLeave: '',
    features: [] as PetFeature[]
  })
  const [gallery, setGallery] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update form data when pet changes
  useEffect(() => {
    if (pet) {
      // Ensure date is in YYYY-MM-DD format for the calendar
      let formattedDate = pet.readyToLeave
      if (pet.readyToLeave) {
        try {
          const date = new Date(pet.readyToLeave)
          if (!isNaN(date.getTime())) {
            formattedDate = date.toISOString().split('T')[0]
          }
        } catch (error) {
          console.error('Error formatting date:', error)
        }
      }
      
      setFormData({
        title: pet.title,
        price: pet.price,
        sexType: pet.sexType,
        age: pet.age,
        readyToLeave: formattedDate,
        features: pet.features || []
      })
      setGallery(pet.gallery || [])
    } else {
      // Reset form when no pet is selected
      setFormData({
        title: '',
        price: 0,
        sexType: 'male',
        age: 0,
        readyToLeave: '',
        features: []
      })
      setGallery([])
    }
  }, [pet])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        title: '',
        price: 0,
        sexType: 'male',
        age: 0,
        readyToLeave: '',
        features: []
      })
      setGallery([])
    }
  }, [open])

  const handleFeatureChange = (feature: PetFeature, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: checked 
        ? [...prev.features, feature]
        : prev.features.filter(f => f !== feature)
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !user) return

    try {
      setUploading(true)
      const fileArray = Array.from(files)
      const uploadResults = await ImageUploadService.uploadMultipleImages(
        fileArray,
        'individual-pets',
        user.id
      )
      
      const newUrls = uploadResults.map(result => result.url)
      setGallery(prev => [...prev, ...newUrls])
      toast.success(`${files.length} nuotraukos pridėtos`)
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Nepavyko įkelti nuotraukų')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async (index: number) => {
    const imageUrl = gallery[index]
    const imagePath = extractPathFromUrl(imageUrl)
    
    try {
      if (imagePath) {
        await ImageUploadService.deleteImage(imagePath)
      }
      setGallery(prev => prev.filter((_, i) => i !== index))
      toast.success('Nuotrauka ištrinta')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Nepavyko ištrinti nuotraukos')
    }
  }

  const handleSave = async () => {
    if (!pet) return

    try {
      await onSave(pet.id, {
        title: formData.title,
        price: formData.price,
        sexType: formData.sexType,
        age: formData.age,
        readyToLeave: formData.readyToLeave,
        features: formData.features,
        gallery: gallery
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving pet:', error)
    }
  }

  if (!pet) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Redaguoti gyvūną</DialogTitle>
          <DialogDescription>
            Atnaujinkite gyvūno informaciją
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pet Name and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Gyvūno pavadinimas *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Pvz., Šuniukas #1"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Kaina (€) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>

          {/* Sex and Age */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Lytis *</Label>
              <Select
                value={formData.sexType}
                onValueChange={(value: 'male' | 'female') => 
                  setFormData(prev => ({ ...prev, sexType: value }))
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
            <div>
              <Label>Amžius (savaitės) *</Label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: Number(e.target.value) }))}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>

          {/* Ready to Leave Date */}
          <div>
            <Label>Paruoštas išvežti *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal mt-1"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.readyToLeave ? new Date(formData.readyToLeave).toLocaleDateString('lt-LT') : 'Pasirinkite datą'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.readyToLeave ? new Date(formData.readyToLeave) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setFormData(prev => ({ ...prev, readyToLeave: date.toISOString().split('T')[0] }))
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Features */}
          <div>
            <Label>Savybės/opcijos</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {PET_FEATURES.map((feature) => (
                <div key={feature.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-${feature.value}`}
                    checked={formData.features.includes(feature.value)}
                    onCheckedChange={(checked) => 
                      handleFeatureChange(feature.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={`edit-${feature.value}`} className="text-sm">
                    {feature.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Images */}
          <div>
            <Label>Galerijos paveikslėliai</Label>
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mb-3"
                disabled={uploading}
              >
                <Camera className="h-4 w-4 mr-2" />
                {uploading ? 'Įkeliama...' : 'Pridėti nuotraukas'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {gallery.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {gallery.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Pet image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                        <div className="w-full h-full items-center justify-center hidden">
                          <span className="text-xs text-muted-foreground">Image {index + 1}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Atšaukti
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading || !formData.title || !formData.readyToLeave}
            className="bg-black text-white hover:bg-foreground"
          >
            {loading ? 'Išsaugoma...' : 'Išsaugoti'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
