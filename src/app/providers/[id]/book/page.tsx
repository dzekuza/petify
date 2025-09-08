'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { ServiceCard } from '@/components/ui/service-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer'
import { InputWithLabel, SelectWithLabel, TextareaWithLabel } from '@/components/ui/input-with-label'
import { BreedSelector } from '@/components/ui/breed-selector'
import { 
  Clock, 
  Users, 
  ArrowLeft, 
  Calendar as CalendarIcon,
  CheckCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ServiceProvider, Service, Pet } from '@/types'
import { supabase } from '@/lib/supabase'
import { petsApi } from '@/lib/pets'
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
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getAvailableTimeSlots = (): string[] => {
    if (!selectedDate || !provider) return []
    
    // Get day name from selected date
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof provider.availability
    
    // Use hardcoded time slots for now (same as desktop)
    // Check availability from provider data
    if (provider.availability && provider.availability[dayName]) {
      const dayAvailability = provider.availability[dayName]
      // dayAvailability is TimeSlot[], so we need to extract time slots differently
      return dayAvailability.map(slot => slot.start) || []
    }
    return []
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
    switch (currentStep) {
      case 1:
        return selectedService !== null
      case 2:
        return pets.length > 0 && selectedPets.length > 0 && selectedPets.length <= (selectedService?.maxPets || 0)
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
              setCurrentStep(2) // Skip service selection step
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('provider.selectService')}</h2>
              <div className="space-y-4">
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

      case 2:
        return (
          <div className="space-y-6 py-4">
            {/* Show selected service if pre-selected */}
            {selectedService && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Service</h2>
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
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{pet.name}</h4>
                          <p className="text-sm text-gray-600">
                            {pet.breed && `${pet.breed} • `}{pet.age} years{pet.weight && ` • ${pet.weight}kg`}
                          </p>
                          {pet.specialNeeds && pet.specialNeeds.length > 0 && (
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                Special needs
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add another pet button */}
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

      case 3:
        return (
          <div className="space-y-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('provider.selectDateAndTime')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">{t('provider.chooseDate')}</h3>
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

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">{t('provider.chooseTime')}</h3>
                  <div className="space-y-2">
                    {getAvailableTimeSlots().length > 0 ? (
                      getAvailableTimeSlots().map((slot, index) => (
                        <button
                          key={index}
                          className={`w-full px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                            selectedTimeSlot === slot 
                              ? 'bg-black text-white border-black' 
                              : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          {slot}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        {selectedDate ? t('provider.noAvailableTimeSlots') : t('provider.selectDateFirst')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
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
                    <span className="text-gray-600">Provider</span>
                    <span className="font-medium">{provider.businessName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date & Time</span>
                    <span className="font-medium">
                      {selectedDate && format(selectedDate, "PPP")} {selectedTimeSlot}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pets</span>
                    <span className="font-medium">
                      {selectedPets.length} {selectedPets.length === 1 ? 'pet' : 'pets'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Service price</span>
                    <span className="font-medium">€{selectedService?.price} × {selectedPets.length}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
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
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  currentStep >= step ? 'bg-black' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24">
        {renderStepContent()}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            {currentStep === 4 && (
              <div className="text-lg font-semibold text-gray-900">
                €{calculateTotal()}
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="px-6"
              >
{t('provider.back')}
              </Button>
            )}
            <Button
              variant="gradient"
              size="lg"
              onClick={currentStep === 4 ? () => {
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
              disabled={!canProceed()}
            >
              {currentStep === 4 ? t('provider.confirmBookingButton') : t('provider.continue')}
            </Button>
          </div>
        </div>
      </div>

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
