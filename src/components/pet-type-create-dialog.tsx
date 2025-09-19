'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreatePetTypeForm } from '@/types'
import { getBreedsBySpecies } from '@/lib/breeds'
import { Loader2 } from 'lucide-react'

interface PetTypeCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (petType: CreatePetTypeForm) => Promise<void>
  loading?: boolean
}

export function PetTypeCreateDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  loading = false 
}: PetTypeCreateDialogProps) {
  const [formData, setFormData] = useState<CreatePetTypeForm>({
    title: '',
    description: '',
    breedType: '',
    individualPets: []
  })
  const [selectedSpecies, setSelectedSpecies] = useState<'dog' | 'cat' | 'bird' | 'rabbit' | 'other'>('dog')

  const handleSave = async () => {
    try {
      await onSave(formData)
      onOpenChange(false)
      // Reset form
      setFormData({
        title: '',
        description: '',
        breedType: '',
        individualPets: []
      })
      setSelectedSpecies('dog')
    } catch (error) {
      console.error('Error saving pet type:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Sukurti naują gyvūnų tipą
          </DialogTitle>
          <DialogDescription>
            Sukurkite naują gyvūnų tipą (pvz., Toy Poodle, French Bulldog)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pet Type Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="petTypeTitle">Tipas pavadinimas *</Label>
              <Input
                id="petTypeTitle"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Pvz., Toy Poodle"
                className="mt-2"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="species">Gyvūno rūšis *</Label>
                <Select value={selectedSpecies} onValueChange={(value: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other') => {
                  setSelectedSpecies(value)
                  setFormData(prev => ({ ...prev, breedType: '' })) // Reset breed when species changes
                }}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Pasirinkite rūšį" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Šuo</SelectItem>
                    <SelectItem value="cat">Katė</SelectItem>
                    <SelectItem value="bird">Paukštis</SelectItem>
                    <SelectItem value="rabbit">Triušis</SelectItem>
                    <SelectItem value="other">Kita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="breedType">Veislės tipas *</Label>
                <Select 
                  value={formData.breedType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, breedType: value }))}
                  disabled={!selectedSpecies}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={selectedSpecies ? "Pasirinkite veislę" : "Pirmiausia pasirinkite rūšį"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getBreedsBySpecies(selectedSpecies).map((breed) => (
                      <SelectItem key={breed.name} value={breed.name}>
                        {breed.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="petTypeDescription">Aprašymas *</Label>
              <Textarea
                id="petTypeDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Aprašykite šį gyvūnų tipą..."
                rows={3}
                className="mt-2"
              />
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
              disabled={loading || !formData.title || !formData.description || !formData.breedType || !selectedSpecies}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sukurti tipą
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
