'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { InputWithLabel, SelectWithLabel, TextareaWithLabel } from '@/components/ui/input-with-label'
import { BreedSelector } from '@/components/ui/breed-selector'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon, PawPrint } from 'lucide-react'
import { ServiceProvider, Service, Pet, PetAd } from '@/types'
import { petsApi } from '@/lib/pets'
import { useAuth } from '@/contexts/auth-context'
import { t } from '@/lib/translations'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface BookingWidgetProps {
  provider: ServiceProvider
  services: Service[]
  petAd?: PetAd | null
  userPets: Pet[]
  onBookService: () => void
  onPetsUpdate: (pets: Pet[]) => void
  isMobile?: boolean
}

export function BookingWidget({ 
  provider, 
  services, 
  petAd,
  userPets, 
  onBookService, 
  onPetsUpdate,
  isMobile = false 
}: BookingWidgetProps) {
  const { user } = useAuth()
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedPets, setSelectedPets] = useState<string[]>([])
  const [selectedService, setSelectedService] = useState('')
  
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

  // Pet selection handlers
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

  // Add pet handlers
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

  const handleAddPetFormChange = (field: string, value: string) => {
    setAddPetForm(prev => ({ ...prev, [field]: value }))
  }

  const handleBookService = () => {
    // For mobile, allow booking without pre-selections (will be made in next step)
    // For desktop, require all selections
    const isMobileDevice = window.innerWidth < 1024
    if (!isMobileDevice && (!selectedDate || !selectedTime || !selectedService || selectedPets.length === 0)) {
      return
    }

    const bookingParams = new URLSearchParams()
    
    // Only add parameters if they exist (for mobile compatibility)
    if (selectedDate) {
      bookingParams.set('date', selectedDate.toISOString().split('T')[0])
    }
    if (selectedTime) {
      bookingParams.set('time', selectedTime)
    }
    if (selectedPets.length > 0) {
      bookingParams.set('pets', selectedPets.join(','))
    }
    if (selectedService) {
      bookingParams.set('service', selectedService)
    }

    onBookService()
  }

  const AddPetDialog = () => (
    <Dialog open={addPetDialogOpen} onOpenChange={setAddPetDialogOpen}>
      <DialogTrigger asChild>
        <button className="w-full text-sm text-black hover:text-gray-800 py-2 border border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
          {userPets.length > 0 ? t('provider.addAnotherPet') : 'Add your first pet'}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Your Pet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddPet} className="space-y-4">
          <InputWithLabel
            id="petName"
            label={t('provider.petName')}
            value={addPetForm.name}
            onChange={(value) => handleAddPetFormChange('name', value)}
            placeholder="Enter pet name"
            required
          />

          <SelectWithLabel
            id="petSpecies"
            label={t('provider.species')}
            value={addPetForm.species}
            onValueChange={(value) => handleAddPetFormChange('species', value)}
            required
            options={[
              { value: "dog", label: t('provider.dog') },
              { value: "cat", label: t('provider.cat') },
              { value: "bird", label: t('provider.bird') },
              { value: "rabbit", label: t('provider.rabbit') },
              { value: "other", label: t('provider.other') }
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.breed')}</label>
            <BreedSelector
              value={addPetForm.breed}
              onValueChange={(value) => handleAddPetFormChange('breed', value)}
              species={addPetForm.species}
              placeholder="Select breed (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputWithLabel
              id="petAge"
              label="Age (years)"
              type="number"
              value={addPetForm.age}
              onChange={(value) => handleAddPetFormChange('age', value)}
              placeholder="0"
              required
              min={0}
              max={30}
            />
            <InputWithLabel
              id="petWeight"
              label="Weight (kg)"
              type="number"
              value={addPetForm.weight}
              onChange={(value) => handleAddPetFormChange('weight', value)}
              placeholder="0.0"
              min={0}
              step={0.1}
            />
          </div>

          <InputWithLabel
            id="specialNeeds"
            label={t('provider.specialNeeds')}
            value={addPetForm.specialNeeds}
            onChange={(value) => handleAddPetFormChange('specialNeeds', value)}
            placeholder="Comma-separated list (optional)"
          />

          <TextareaWithLabel
            id="medicalNotes"
            label={t('provider.medicalNotes')}
            value={addPetForm.medicalNotes}
            onChange={(value) => handleAddPetFormChange('medicalNotes', value)}
            placeholder="Any medical information (optional)"
            rows={3}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddPetDialogOpen(false)}
              disabled={addPetLoading}
            >
              {t('provider.cancel')}
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
  )

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.serviceDate')}</label>
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
                {selectedDate ? format(selectedDate, "PPP") : t('provider.selectDate')}
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.serviceTime')}</label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger>
              <SelectValue placeholder={t('provider.selectTime')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="09:00">9:00 AM</SelectItem>
              <SelectItem value="10:00">10:00 AM</SelectItem>
              <SelectItem value="11:00">11:00 AM</SelectItem>
              <SelectItem value="12:00">12:00 PM</SelectItem>
              <SelectItem value="13:00">1:00 PM</SelectItem>
              <SelectItem value="14:00">2:00 PM</SelectItem>
              <SelectItem value="15:00">3:00 PM</SelectItem>
              <SelectItem value="16:00">4:00 PM</SelectItem>
              <SelectItem value="17:00">5:00 PM</SelectItem>
              <SelectItem value="18:00">6:00 PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.selectPets')}</label>
          {userPets.length > 0 ? (
            <div className="space-y-2">
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                {userPets.map((pet) => (
                  <div key={pet.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`mobile-pet-${pet.id}`}
                      checked={selectedPets.includes(pet.id)}
                      onCheckedChange={(checked) => handlePetSelection(pet.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`mobile-pet-${pet.id}`}
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                    >
                      {getPetIcon(pet.species)}
                      <span className="text-sm text-gray-900">{pet.name}</span>
                      <span className="text-xs text-gray-500">({pet.species}, {pet.age}y)</span>
                    </label>
                  </div>
                ))}
              </div>
              <AddPetDialog />
            </div>
          ) : (
            <div className="border border-gray-300 rounded-md p-3 text-center">
              <p className="text-sm text-gray-500 mb-2">No pets added yet</p>
              <AddPetDialog />
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.serviceType')}</label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder={t('provider.selectService')} />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} - €{service.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  // Desktop layout
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="text-2xl font-bold text-gray-900 mb-2">
        €{provider.priceRange.min}-€{provider.priceRange.max}
      </div>
      <div className="text-gray-600 mb-6">{t('provider.perService')}</div>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.serviceDate')}</label>
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
                {selectedDate ? format(selectedDate, "PPP") : t('provider.selectDate')}
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
        
        <SelectWithLabel
          id="serviceTime"
          label={t('provider.serviceTime')}
          value={selectedTime}
          onValueChange={setSelectedTime}
          placeholder={t('provider.selectTime')}
          required
          options={[
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
          ]}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.selectPets')}</label>
          {userPets.length > 0 ? (
            <div className="space-y-2">
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                {userPets.map((pet) => (
                  <div key={pet.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`pet-${pet.id}`}
                      checked={selectedPets.includes(pet.id)}
                      onCheckedChange={(checked) => handlePetSelection(pet.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`pet-${pet.id}`}
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                    >
                      {getPetIcon(pet.species)}
                      <span className="text-sm text-gray-900">{pet.name}</span>
                      <span className="text-xs text-gray-500">({pet.species}, {pet.age}y)</span>
                    </label>
                  </div>
                ))}
              </div>
              <AddPetDialog />
            </div>
          ) : (
            <div className="border border-gray-300 rounded-md p-3 text-center">
              <p className="text-sm text-gray-500 mb-2">No pets added yet</p>
              <AddPetDialog />
            </div>
          )}
        </div>
        
        <SelectWithLabel
          id="serviceType"
          label={t('provider.serviceType')}
          value={selectedService}
          onValueChange={setSelectedService}
          placeholder={t('provider.selectService')}
          required
          options={services.map((service) => ({
            value: service.id,
            label: `${service.name} - €${service.price}`
          }))}
        />
      </div>

      <Button 
        variant="gradient"
        size="lg"
        className="w-full mb-4"
        onClick={handleBookService}
        disabled={petAd ? false : (!selectedDate || !selectedTime || !selectedService || selectedPets.length === 0)}
      >
        {petAd ? 'Teirautis' : t('provider.bookService')}
      </Button>
      
      <div className="text-center text-sm text-gray-600">
        {t('provider.secureBooking')}
      </div>
    </div>
  )
}
