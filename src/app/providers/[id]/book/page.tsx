'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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


export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
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
    
    const dayName = selectedDate.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase() as keyof typeof provider.availability
    const dayAvailability = provider.availability[dayName]
    
    if (!dayAvailability || !Array.isArray(dayAvailability)) return []
    
    const availableSlots = dayAvailability.filter(slot => slot.available)
    return availableSlots.map(slot => `${slot.start} - ${slot.end}`)
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
  }, [params.id])

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
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Service</h2>
              <div className="space-y-4">
                {services.map((service) => (
                  <Card 
                    key={service.id} 
                    className={`cursor-pointer transition-all ${
                      selectedService?.id === service.id 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleServiceSelect(service)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                            {selectedService?.id === service.id && (
                              <CheckCircle className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                          <p className="text-gray-600 mb-4">{service.description}</p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {service.duration} min
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              Up to {service.maxPets} {service.maxPets > 1 ? 'pets' : 'pet'}
                            </div>
                          </div>

                          {service.includes && service.includes.length > 0 && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-2">
                                {service.includes.map((item, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-gray-900">
                            €{service.price}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Assign pets to service</h2>
              <p className="text-gray-600 mb-4">
                Select which pets will receive the {selectedService?.name} service
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
                    <p className="text-lg font-medium">No pets found</p>
                    <p className="text-sm">You need to add pets to your profile before booking services.</p>
                  </div>
                  <Button 
                    onClick={() => router.push('/pets')}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Add Your First Pet
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {pets.map((pet) => (
                    <Card 
                      key={pet.id} 
                      className={`cursor-pointer transition-all ${
                        selectedPets.includes(pet.id) 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => handlePetSelect(pet.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedPets.includes(pet.id) 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {selectedPets.includes(pet.id) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select date and time</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Choose a date</h3>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Choose a time</h3>
                  <div className="space-y-2">
                    {getAvailableTimeSlots().length > 0 ? (
                      getAvailableTimeSlots().map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedTimeSlot === slot ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          {slot}
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        {selectedDate ? "No available time slots" : "Select a date first"}
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
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirm your booking</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedService?.name}</CardTitle>
                  <CardDescription>{selectedService?.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Book a service</h1>
              <p className="text-sm text-gray-600">{provider.businessName}</p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  currentStep >= step ? 'bg-blue-500' : 'bg-gray-300'
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
                Back
              </Button>
            )}
            <Button
              variant="gradient"
              size="lg"
              onClick={currentStep === 4 ? () => {
                // Handle booking confirmation
                alert('Booking confirmed!')
              } : handleNext}
              disabled={!canProceed()}
            >
              {currentStep === 4 ? 'Confirm booking' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
