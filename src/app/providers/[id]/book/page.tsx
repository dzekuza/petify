'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { ServiceCard } from '@/components/ui/service-card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer'
import { InputWithLabel, SelectWithLabel, TextareaWithLabel } from '@/components/ui/input-with-label'
import BottomNavigation from '@/components/provider-onboarding/bottom-navigation'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { BreedSelector } from '@/components/ui/breed-selector'
import Image from 'next/image'
import { 
  Users
} from 'lucide-react'
import { format } from 'date-fns'
import { ServiceProvider, Service, Pet } from '@/types'
import { supabase } from '@/lib/supabase'
import { petsApi } from '@/lib/pets'
import { providerApi } from '@/lib/providers'
import { useAuth } from '@/contexts/auth-context'
import { t } from '@/lib/translations'
import { toast } from 'sonner'


export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedPets, setSelectedPets] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [currentStep, setCurrentStep] = useState(1)
  const [availabilityData, setAvailabilityData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [petsLoading, setPetsLoading] = useState(false)
  
  // Pet addition drawer state
  const [addPetDrawerOpen, setAddPetDrawerOpen] = useState(false)
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

  const fetchPets = useCallback(async () => {
    if (!user) return
    
    try {
      setPetsLoading(true)
      const userPets = await petsApi.getUserPets(user.id)
      setPets(userPets)
    } catch (error) {
      console.error('Error fetching pets:', error)
    } finally {
      setPetsLoading(false)
    }
  }, [user])

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setCurrentStep(2)
  }

  const handlePetSelect = (petId: string) => {
    setSelectedPets(prev => 
      prev.includes(petId) 
        ? prev.filter(id => id !== petId)
        : [...prev, petId]
    )
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
      setPets(prev => [...prev, newPet])
      setSelectedPets(prev => [...prev, newPet.id])
      
      // Reset form and close drawer
      setAddPetForm({
        name: '',
        species: 'dog',
        breed: '',
        age: '',
        weight: '',
        specialNeeds: '',
        medicalNotes: ''
      })
      setAddPetDrawerOpen(false)
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

  const handleNext = () => {
    if (currentStep < 4) {
      // If we have a pre-selected service and date, skip step 3 (date selection)
      if (currentStep === 2 && selectedService && selectedDate) {
        setCurrentStep(4) // Skip directly to confirmation
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      // If we're on step 4 and have a pre-selected service and date, go back to step 2
      if (currentStep === 4 && selectedService && selectedDate) {
        setCurrentStep(2)
      } else {
        setCurrentStep(currentStep - 1)
      }
    }
  }

  const fetchAvailabilityData = async (date: Date) => {
    if (!provider?.id) return
    
    try {
      const dateString = date.toISOString().split('T')[0]
      const availability = await providerApi.getProviderAvailability(provider.id, dateString)
      setAvailabilityData(availability)
    } catch (error) {
      console.error('Error fetching availability:', error)
      setAvailabilityData(null)
    }
  }

  const getAvailableTimeSlots = (): string[] => {
    if (!selectedDate || !provider) return []
    
    // If we have availability data from API, use it
    if (availabilityData?.available_slots) {
      if (Array.isArray(availabilityData.available_slots)) {
        return availabilityData.available_slots
      }
      return []
    }
    
    // Fallback to provider availability data
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof provider.availability
    
    // Check availability from provider data
    if (provider.availability && provider.availability[dayName]) {
      const dayAvailability = provider.availability[dayName]
      
      // Ensure dayAvailability is an array before calling map
      if (Array.isArray(dayAvailability)) {
        return dayAvailability.map(slot => slot.start) || []
      }
    }
    
    // Fallback to hardcoded time slots
    return [
      "09:00",
      "10:00", 
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00"
    ]
  }

  const calculateTotal = () => {
    if (!selectedService) return 0
    return selectedService.price * selectedPets.length
  }

  const canProceed = () => {
    const hasPreSelected = selectedService && selectedDate
    
    switch (currentStep) {
      case 1:
        if (hasPreSelected) {
          // Step 1 is pet selection when service and date are pre-selected
          return pets.length > 0 && selectedPets.length > 0 && selectedPets.length <= (selectedService?.maxPets || 0)
        } else {
          // Normal service selection
          return selectedService !== null
        }
      case 2:
        if (hasPreSelected) {
          // Step 2 is confirmation when service and date are pre-selected
          return selectedService && selectedDate && selectedTimeSlot && selectedPets.length > 0
        } else {
          // Normal pet selection
          return pets.length > 0 && selectedPets.length > 0 && selectedPets.length <= (selectedService?.maxPets || 0)
        }
      case 3:
        return selectedDate && selectedTimeSlot
      case 4:
        return selectedService && selectedDate && selectedTimeSlot && selectedPets.length > 0
      default:
        return false
    }
  }

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setLoading(true)
        
        // Fetch provider data
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('id', params.id)
          .eq('status', 'active')
          .single()

        if (providerError) {
          console.error('Error fetching provider:', providerError)
          setLoading(false)
          return
        }

        if (!providerData) {
          setLoading(false)
          return
        }

        // Transform provider data to match ServiceProvider interface
        const transformedProvider: ServiceProvider = {
          id: providerData.id,
          userId: providerData.user_id,
          businessName: providerData.business_name,
          description: providerData.description,
          services: providerData.services || [],
          location: {
            address: providerData.location?.address || '',
            city: providerData.location?.city || '',
            state: providerData.location?.state || '',
            zipCode: providerData.location?.zip || '',
            coordinates: {
              lat: providerData.location?.coordinates?.lat || 0,
              lng: providerData.location?.coordinates?.lng || 0
            }
          },
          rating: providerData.rating || 0,
          reviewCount: providerData.review_count || 0,
          priceRange: {
            min: providerData.price_range?.min || 0,
            max: providerData.price_range?.max || 100
          },
          availability: providerData.availability || {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
          },
          images: providerData.images || [],
          certifications: providerData.certifications || [],
          experience: providerData.experience_years || 0,
          status: providerData.status || 'active',
          createdAt: providerData.created_at,
          updatedAt: providerData.updated_at
        }

        setProvider(transformedProvider)

        // Fetch services for this provider
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('provider_id', params.id)
          .eq('is_active', true)

        if (servicesError) {
          console.error('Error fetching services:', servicesError)
        } else {
          // Transform services data
          const transformedServices: Service[] = (servicesData || []).map(service => ({
            id: service.id,
            providerId: service.provider_id,
            category: service.category,
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration_minutes,
            maxPets: service.max_pets,
            requirements: service.requirements || [],
            includes: service.includes || [],
            images: service.images || [],
            status: service.is_active ? 'active' : 'inactive',
            createdAt: service.created_at,
            updatedAt: service.updated_at
          }))
          setServices(transformedServices)
          
          // Check if a service is pre-selected from URL parameters
          const preSelectedServiceId = searchParams.get('service')
          if (preSelectedServiceId) {
            const preSelectedService = transformedServices.find(s => s.id === preSelectedServiceId)
            if (preSelectedService) {
              setSelectedService(preSelectedService)
              // For desktop users coming from "Book Service" button, skip to pet selection (step 2)
              // and also pre-select a default date (today or tomorrow) to skip date selection
              setCurrentStep(2)
              
              // Pre-select tomorrow's date to skip date selection step
              const tomorrow = new Date()
              tomorrow.setDate(tomorrow.getDate() + 1)
              setSelectedDate(tomorrow)
              
              // Fetch availability for the pre-selected date
              fetchAvailabilityData(tomorrow)
            }
          }
        }

      } catch (error) {
        console.error('Error fetching provider data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProviderData()
    }
  }, [params.id, searchParams])

  useEffect(() => {
    if (user) {
      fetchPets()
    }
  }, [user, fetchPets])

  if (loading) {
    return (
      <Layout>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-96 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  if (!provider) {
    return (
      <Layout>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider not found</h1>
                <p className="text-gray-600">The provider you're looking for doesn't exist.</p>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  const renderPetSelectionStep = () => (
    <div className="space-y-6 py-4">
      {/* Show selected service if pre-selected */}
      {selectedService && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('provider.selectService')}</h2>
          <ServiceCard
            service={selectedService}
            isSelected={true}
            showSelection={false}
          />
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('provider.selectPets')}</h2>
        <p className="text-gray-600 mb-4">
          {t('provider.selectPetsDescription', `Select which pets will receive the ${selectedService?.name} service`)}
        </p>
        
        {petsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-lg font-medium">{t('provider.noPetsFound')}</p>
              <p className="text-sm">{t('provider.addPetsFirst')}</p>
            </div>
            <Button 
              onClick={() => setAddPetDrawerOpen(true)}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {t('provider.addFirstPet')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {pets.map((pet) => (
              <div 
                key={pet.id} 
                className={`cursor-pointer transition-all rounded-lg border ${
                  selectedPets.includes(pet.id) 
                    ? 'border-black bg-gray-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handlePetSelect(pet.id)}
              >
                <div className="flex items-center space-x-3 p-4">
                  <Checkbox
                    checked={selectedPets.includes(pet.id)}
                    onCheckedChange={() => handlePetSelect(pet.id)}
                    className="w-5 h-5"
                  />
                  
                  {/* Pet Image */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {pet.profilePicture ? (
                      <Image
                        src={pet.profilePicture}
                        alt={pet.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Pet Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{pet.name}</h3>
                    <p className="text-xs text-gray-500 truncate">
                      {pet.breed ? `${pet.breed}, ` : ''}{pet.age} {t('common.yearsOld')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={() => setAddPetDrawerOpen(true)}
              className="w-full border-dashed border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800"
            >
              + Add another pet
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  const renderConfirmationStep = () => (
    <div className="space-y-6 py-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('provider.confirmYourBooking')}</h2>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 pt-6 pb-4">
            <h3 className="font-semibold text-lg text-gray-900">{selectedService?.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{selectedService?.description}</p>
          </div>
          <div className="px-6 space-y-4 pb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('bookings.confirmation.provider')}</span>
              <span className="font-medium">{provider.businessName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('bookings.confirmation.dateAndTime')}</span>
              <span className="font-medium">
                {selectedDate && format(selectedDate, "MMMM d, yyyy")} {selectedTimeSlot}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('bookings.confirmation.pets')}</span>
              <span className="font-medium">
                {selectedPets.map(petId => {
                  const pet = pets.find(p => p.id === petId)
                  return pet?.name
                }).filter(Boolean).join(', ')}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>{t('bookings.confirmation.total')}</span>
                <span>€{calculateTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    // If we have pre-selected service and date, map steps differently
    const hasPreSelected = selectedService && selectedDate
    
    switch (currentStep) {
      case 1:
        if (hasPreSelected) {
          // Step 1 becomes pet selection when service and date are pre-selected
          return renderPetSelectionStep()
        } else {
          // Normal service selection step
          return (
            <div className="space-y-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('provider.selectService')}</h2>
                <div className="space-y-3">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      isSelected={selectedService?.id === service.id}
                      onClick={() => handleServiceSelect(service)}
                      showSelection={true}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        }

      case 2:
        if (hasPreSelected) {
          // Step 2 becomes confirmation when service and date are pre-selected
          return renderConfirmationStep()
        } else {
          // Normal pet selection step
          return renderPetSelectionStep()
        }

      case 3:
        return (
          <div className="space-y-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('provider.selectDateAndTime')}</h2>
              
              <DateTimePicker
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  setSelectedDate(date)
                  if (date) {
                    fetchAvailabilityData(date)
                  }
                }}
                selectedTime={selectedTimeSlot}
                onTimeSelect={setSelectedTimeSlot}
                timeSlots={getAvailableTimeSlots().map(time => ({
                  time,
                  available: true
                }))}
                disabled={(date) => date < new Date()}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('provider.confirmYourBooking')}</h2>
              
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 pt-6 pb-4">
                  <h3 className="font-semibold text-lg text-gray-900">{selectedService?.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedService?.description}</p>
                </div>
                <div className="px-6 space-y-4 pb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('bookings.confirmation.provider')}</span>
                    <span className="font-medium">{provider.businessName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('bookings.confirmation.dateAndTime')}</span>
                    <span className="font-medium">
                      {selectedDate && format(selectedDate, "MMMM d, yyyy")} {selectedTimeSlot}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('bookings.confirmation.pets')}</span>
                    <span className="font-medium">
                      {selectedPets.length} {selectedPets.length === 1 ? t('bookings.confirmation.pet') : t('bookings.confirmation.petsPlural')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('bookings.confirmation.servicePrice')}</span>
                    <span className="font-medium">€{selectedService?.price} × {selectedPets.length}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">{t('bookings.confirmation.total')}</span>
                      <span className="text-xl font-bold text-gray-900">€{calculateTotal()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{t('common.bookThisService')}</h1>
              <p className="text-sm text-gray-600">{provider.businessName}</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
          >
            Atšaukti pirkimą
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-20">
        {renderStepContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentStep={selectedService && selectedDate ? (currentStep === 1 ? 1 : currentStep === 2 ? 2 : 3) : currentStep}
        totalSteps={selectedService && selectedDate ? 3 : 4}
        onPrevious={handleBack}
        onNext={(currentStep === 4 || (currentStep === 2 && selectedService && selectedDate)) ? () => {
          // Redirect to payment page with booking parameters
          const bookingParams = new URLSearchParams()
          if (selectedDate) {
            bookingParams.set('date', selectedDate.toISOString().split('T')[0])
          }
          if (selectedTimeSlot) {
            bookingParams.set('time', selectedTimeSlot)
          }
          if (selectedPets.length > 0) {
            bookingParams.set('pets', selectedPets.join(','))
          }
          if (selectedService) {
            bookingParams.set('service', selectedService.id)
          }
          router.push(`/providers/${params.id}/payment?${bookingParams.toString()}`)
        } : handleNext}
        isNextDisabled={!canProceed()}
        previousText={t('provider.back')}
        nextText={(currentStep === 4 || (currentStep === 2 && selectedService && selectedDate)) ? t('provider.confirmBookingButton') : t('provider.continue')}
      />

      {/* Add Pet Drawer */}
      <Drawer open={addPetDrawerOpen} onOpenChange={setAddPetDrawerOpen} direction="bottom">
        <DrawerContent className="h-[85vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-lg font-semibold text-gray-900">Add Your Pet</DrawerTitle>
            <DrawerDescription className="text-sm text-gray-600">
              Fill in your pet's information to add them to your profile
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="flex-1 overflow-y-auto px-4">
            <form onSubmit={handleAddPet} className="space-y-4 pb-4">
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
            </form>
          </div>

          <DrawerFooter className="pt-4">
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddPetDrawerOpen(false)}
                disabled={addPetLoading}
                className="flex-1"
              >
                {t('provider.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={addPetLoading || !addPetForm.name || !addPetForm.age}
                onClick={handleAddPet}
                className="flex-1"
              >
                {addPetLoading ? 'Adding...' : 'Add Pet'}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
