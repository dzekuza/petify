'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon, PawPrint, Clock } from 'lucide-react'
import { Service, Pet } from '@/types'
import { petsApi } from '@/lib/pets'
import { useAuth } from '@/contexts/auth-context'
import { t } from '@/lib/translations'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface QuickBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service
  userPets: Pet[]
  onPetsUpdate: (pets: Pet[]) => void
  onBook: (bookingData: {
    serviceId: string
    date: Date
    time: string
    petIds: string[]
  }) => void
}

export function QuickBookingDialog({
  open,
  onOpenChange,
  service,
  userPets,
  onPetsUpdate,
  onBook
}: QuickBookingDialogProps) {
  const { user } = useAuth()
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedPets, setSelectedPets] = useState<string[]>([])
  
  // Add pet dialog state
  const [addPetDialogOpen, setAddPetDialogOpen] = useState(false)
  const [addPetForm, setAddPetForm] = useState({
    name: '',
    species: 'dog' as 'dog' | 'cat' | 'bird' | 'rabbit' | 'other',
    breed: '',
    age: '',
    weight: '',
    specialNeeds: '',
    medicalNotes: ''
  })
  const [addPetLoading, setAddPetLoading] = useState(false)

  // Time slots based on service duration
  const timeSlots = [
    { value: "09:00", label: "9:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "13:00", label: "1:00 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "16:00", label: "4:00 PM" },
    { value: "17:00", label: "5:00 PM" },
    { value: "18:00", label: "6:00 PM" }
  ]

  const handlePetSelection = (petId: string, checked: boolean) => {
    if (checked) {
      setSelectedPets(prev => [...prev, petId])
    } else {
      setSelectedPets(prev => prev.filter(id => id !== petId))
    }
  }

  const getPetIcon = (species: string) => {
    switch (species) {
      case 'dog':
        return <PawPrint className="h-4 w-4" />
      case 'cat':
        return <PawPrint className="h-4 w-4" />
      default:
        return <PawPrint className="h-4 w-4" />
    }
  }

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
        medicalNotes: addPetForm.medicalNotes || undefined
      }

      const newPet = await petsApi.createPet(petData, user.id)
      
      // Add the new pet to the list and select it
      onPetsUpdate([...userPets, newPet])
      setSelectedPets(prev => [...prev, newPet.id])
      
      // Reset form and close dialog
      setAddPetForm({
        name: '',
        species: 'dog',
        breed: '',
        age: '',
        weight: '',
        specialNeeds: '',
        medicalNotes: ''
      })
      setAddPetDialogOpen(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add pet'
      toast.error(errorMessage)
    } finally {
      setAddPetLoading(false)
    }
  }

  const handleBook = () => {
    if (!selectedDate || !selectedTime || selectedPets.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    onBook({
      serviceId: service.id,
      date: selectedDate,
      time: selectedTime,
      petIds: selectedPets
    })

    // Reset form
    setSelectedDate(undefined)
    setSelectedTime('')
    setSelectedPets([])
    onOpenChange(false)
  }

  const canBook = selectedDate && selectedTime && selectedPets.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Book Service</span>
            <span className="text-lg font-semibold text-muted-foreground">€{service.price}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Service Info */}
          <div className="bg-muted p-3 rounded-lg">
            <h3 className="font-medium text-foreground">{service.name}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {service.duration} min
              </span>
              <span>Up to {service.maxPets} {service.maxPets > 1 ? 'pets' : 'pet'}</span>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Service Date *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Service Time *
            </label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pet Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Pets *
            </label>
            {userPets.length > 0 ? (
              <div className="space-y-2">
                <div className="max-h-32 overflow-y-auto border border-border rounded-md p-3 space-y-2">
                  {userPets.map((pet) => (
                    <div key={pet.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`quick-pet-${pet.id}`}
                        checked={selectedPets.includes(pet.id)}
                        onCheckedChange={(checked) => handlePetSelection(pet.id, checked as boolean)}
                      />
                      <label
                        htmlFor={`quick-pet-${pet.id}`}
                        className="flex items-center space-x-2 cursor-pointer flex-1"
                      >
                        {getPetIcon(pet.species)}
                        <span className="text-sm text-foreground">{pet.name}</span>
                        <span className="text-xs text-muted-foreground">({pet.species}, {pet.age}y)</span>
                      </label>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setAddPetDialogOpen(true)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground py-2 border border-dashed border-border rounded-md hover:border-border transition-colors"
                >
                  + Add another pet
                </button>
              </div>
            ) : (
              <div className="border border-border rounded-md p-3 text-center">
                <p className="text-sm text-muted-foreground mb-2">No pets added yet</p>
                <button 
                  onClick={() => setAddPetDialogOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Add your first pet
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBook}
            disabled={!canBook}
            className="bg-black hover:bg-foreground"
          >
            Book Service
          </Button>
        </div>

        {/* Add Pet Dialog */}
        <Dialog open={addPetDialogOpen} onOpenChange={setAddPetDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Your Pet</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Pet Name *</label>
                <input
                  type="text"
                  value={addPetForm.name}
                  onChange={(e) => setAddPetForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter pet name"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Species *</label>
                <Select 
                  value={addPetForm.species} 
                  onValueChange={(value: any) => setAddPetForm(prev => ({ ...prev, species: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="rabbit">Rabbit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Age (years) *</label>
                  <input
                    type="number"
                    value={addPetForm.age}
                    onChange={(e) => setAddPetForm(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="0"
                    min={0}
                    max={30}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={addPetForm.weight}
                    onChange={(e) => setAddPetForm(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="0.0"
                    min={0}
                    step={0.1}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddPetDialogOpen(false)}
                  disabled={addPetLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addPetLoading || !addPetForm.name || !addPetForm.age}
                >
                  {addPetLoading ? 'Adding...' : 'Add Pet'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
