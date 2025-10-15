'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon, PawPrint } from 'lucide-react'
import { ServiceProvider, Service, Pet, PetAd } from '@/types'
import { petsApi } from '@/lib/pets'
import { useAuth } from '@/contexts/auth-context'
import { t } from '@/lib/translations'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ClaimBusinessWidget } from './claim-business-widget'

// Breeder Request Widget Component
function BreederRequestWidget({ 
  provider, 
  services, 
  userPets, 
  onPetsUpdate,
  isMobile = false 
}: {
  provider: ServiceProvider
  services: Service[]
  userPets: Pet[]
  onPetsUpdate: (pets: Pet[]) => void
  isMobile?: boolean
}) {
  const { user } = useAuth()
  const [selectedService, setSelectedService] = useState<string>('')
  const [requestMessage, setRequestMessage] = useState('')
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)

  const handleSendRequest = () => {
    if (!selectedService) {
      toast.error('Please select a pet type')
      return
    }
    setRequestDialogOpen(true)
  }

  const handleSubmitRequest = () => {
    // Here you would implement the request submission logic
    toast.success('Request sent successfully!')
    setRequestDialogOpen(false)
    setRequestMessage('')
    setSelectedService('')
  }


  const RequestDialog = () => (
    <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Siųsti užklausą</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Žinutė</label>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Papasakokite veislininkui apie savo susidomėjimą jų gyvūnais..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRequestDialogOpen(false)}
              className="flex-1"
            >
              Atšaukti
            </Button>
            <Button
              onClick={handleSubmitRequest}
              className="flex-1"
            >
              Siųsti užklausą
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="text-2xl font-bold text-gray-900 mb-2">
        Šiuo metu prieinama
      </div>
      <div className="text-gray-600 mb-6">Pasirinkite gyvūną ir siųskite užklausą</div>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pasirinkti gyvūnų tipą</label>
          {services.length > 0 ? (
            <div className="space-y-2">
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id={`service-${service.id}`}
                      name="selectedService"
                      value={service.id}
                      checked={selectedService === service.id}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <label
                      htmlFor={`service-${service.id}`}
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                    >
                      <PawPrint className="h-4 w-4" />
                      <span className="text-sm text-gray-900">{service.name}</span>
                      <span className="text-xs text-gray-500">
                        {service.breed && `(${service.breed})`}
                        {service.ageWeeks && ` - ${service.ageWeeks} sav.`}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-md p-3 text-center">
              <p className="text-sm text-gray-500 mb-2">Šiuo metu nėra prieinamų gyvūnų</p>
            </div>
          )}
        </div>
      </div>

      <Button 
        variant="gradient"
        size="lg"
        className="w-full mb-4"
        onClick={handleSendRequest}
        disabled={!selectedService}
      >
        Siųsti užklausą
      </Button>
      
      <RequestDialog />
    </div>
  )
}

interface BookingWidgetProps {
  provider: ServiceProvider
  services: Service[]
  petAd?: PetAd | null
  userPets: Pet[]
  onBookService: () => void
  onPetsUpdate: (pets: Pet[]) => void
  isMobile?: boolean
  preSelectedService?: string
}

export function BookingWidget({ 
  provider, 
  services, 
  petAd,
  userPets, 
  onBookService, 
  onPetsUpdate,
  isMobile = false,
  preSelectedService
}: BookingWidgetProps) {
  const { user } = useAuth()
  
  // List of scraped provider user IDs (from BookitNow.lt import)
  const scrapedProviderUserIds = [
    'a6558eeb-8dac-44e6-a196-faaf93eef966', // Dresūros centras | Nemirseta
    '0dcedfce-dca7-4911-8320-8de3c7232b25', // Dresūros centras | Palanga
    '947814d9-60b8-4de5-aea7-04ade3168f30', // Fracco dresūros mokykla
    '024f9da0-a579-4f6b-9ff5-3121996e2767', // OH MY DOG šunų ir kačių kirpykla
    '52077fbe-293a-4888-876e-4f753d719819', // Reksas - Šunų pamokos Vilniuje
    '7bab2720-a543-4b1b-b42e-9a57d5108915', // Šunų ir kačių kirpykla „Keturkojų stilius"
    'c93d2cfd-914f-43e5-82a5-eb230aac1d46', // Tauro Grooming & Skin Care
    '7024c980-0616-4266-8cf1-1f2c64abf9fc', // Vanilos salonas – gyvūnų kirpykla
    '5cb11b91-ee79-4fc2-bfe6-d44d598c85fa', // Zoohotel – naminių gyvūnų grožio salonas Lazdynuose
    '470f752b-915b-404e-a3bf-965f070c11f8', // Zoohotel – naminių gyvūnų grožio salonas Naujojoje Vilnioje
    '8fc776c6-d413-4250-ba52-058b4e2e7dc8'  // Zoohotel – naminių gyvūnų grožio salonas Pavilnyje
  ]
  
  // Check if this is a scraped provider that hasn't been claimed yet
  // A provider is considered "unclaimed" if:
  // 1. It's in the scraped provider list AND
  // 2. It doesn't have active services (meaning it hasn't been properly set up by the owner)
  const isUnclaimedScrapedProvider = scrapedProviderUserIds.includes(provider.userId) && 
    (services.length === 0 || services.every(service => !service.status || service.status === 'inactive'))
  
  // Booking form state - always declare hooks at the top level
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedPets, setSelectedPets] = useState<string[]>([])
  const [selectedService, setSelectedService] = useState('')
  
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

  // Auto-select service when preSelectedService is provided
  useEffect(() => {
    if (preSelectedService && services.length > 0) {
      const serviceExists = services.find(service => service.id === preSelectedService)
      if (serviceExists) {
        setSelectedService(preSelectedService)
      }
    }
  }, [preSelectedService, services])

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

  const handleBookService = async () => {
    // For mobile, allow booking without pre-selections (will be made in next step)
    // For desktop, require all selections and redirect to checkout
    const isMobileDevice = window.innerWidth < 1024
    
    if (!isMobileDevice) {
      // Desktop: require all selections and redirect to Stripe Checkout
      if (!selectedDate || !selectedTime || !selectedService || selectedPets.length === 0) {
        toast.error('Please fill in all required fields')
        return
      }

      // Format date in local timezone to avoid UTC conversion issues
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}`

      // Get price - use a default price since services are categories, not individual services
      const price = 50 // Default price - individual service prices would need to be fetched separately

      try {
        // Get auth session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          toast.error('Please sign in to continue')
          return
        }

        // Create Stripe Checkout session
        const response = await fetch('/api/checkout/create-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            providerId: provider.id,
            serviceId: selectedService,
            pets: selectedPets,
            date: dateString,
            time: selectedTime,
            price: price
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create checkout session')
        }

        const { url } = await response.json()
        
        // Redirect to Stripe Checkout
        window.location.href = url
      } catch (error) {
        console.error('Error creating checkout session:', error)
        toast.error('Failed to start checkout')
      }
      return
    }

    // Mobile: use existing flow
    const bookingParams = new URLSearchParams()
    
    // Only add parameters if they exist (for mobile compatibility)
    if (selectedDate) {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}`
      bookingParams.set('date', dateString)
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

  // If it's an unclaimed scraped provider, show claim business widget instead
  if (isUnclaimedScrapedProvider) {
    return <ClaimBusinessWidget provider={provider} isMobile={isMobile} />
  }

  // If it's a breeder (adoption business type), show different interface
  console.log('Provider business type:', provider.businessType)
  if (provider.businessType === 'adoption') {
    console.log('Rendering BreederRequestWidget for adoption provider')
    return <BreederRequestWidget provider={provider} services={services} userPets={userPets} onPetsUpdate={onPetsUpdate} isMobile={isMobile} />
  }


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
            <SelectTrigger className="w-full">
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
            </div>
          ) : (
            <div className="border border-gray-300 rounded-md p-3 text-center">
                <p className="text-sm text-gray-500 mb-2">Šiuo metu nėra prieinamų gyvūnų</p>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.serviceType')}</label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-full">
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
        
        <div className="space-y-2">
          <Label htmlFor="serviceTime">
            {t('provider.serviceTime')}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={selectedTime}
            onValueChange={setSelectedTime}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('provider.selectTime')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="09:00">9:00 AM</SelectItem>
              <SelectItem value="09:30">9:30 AM</SelectItem>
              <SelectItem value="10:00">10:00 AM</SelectItem>
              <SelectItem value="10:30">10:30 AM</SelectItem>
              <SelectItem value="11:00">11:00 AM</SelectItem>
              <SelectItem value="11:30">11:30 AM</SelectItem>
              <SelectItem value="12:00">12:00 PM</SelectItem>
              <SelectItem value="12:30">12:30 PM</SelectItem>
              <SelectItem value="13:00">1:00 PM</SelectItem>
              <SelectItem value="13:30">1:30 PM</SelectItem>
              <SelectItem value="14:00">2:00 PM</SelectItem>
              <SelectItem value="14:30">2:30 PM</SelectItem>
              <SelectItem value="15:00">3:00 PM</SelectItem>
              <SelectItem value="15:30">3:30 PM</SelectItem>
              <SelectItem value="16:00">4:00 PM</SelectItem>
              <SelectItem value="16:30">4:30 PM</SelectItem>
              <SelectItem value="17:00">5:00 PM</SelectItem>
              <SelectItem value="17:30">5:30 PM</SelectItem>
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
            </div>
          ) : (
            <div className="border border-gray-300 rounded-md p-3 text-center">
                <p className="text-sm text-gray-500">Šiuo metu nėra prieinamų gyvūnų</p>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="serviceType">
            {t('provider.serviceType')}
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={selectedService}
            onValueChange={setSelectedService}
            required
          >
            <SelectTrigger className="w-full">
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

      <Button 
        variant="gradient"
        size="lg"
        className="w-full mb-4"
        onClick={handleBookService}
        disabled={petAd ? false : (!selectedDate || !selectedTime || !selectedService || selectedPets.length === 0)}
      >
        {petAd ? 'Teirautis' : t('provider.bookService')}
      </Button>
      
    </div>
  )
}
