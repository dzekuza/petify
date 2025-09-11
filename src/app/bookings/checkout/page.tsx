'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, MapPin, CreditCard, ArrowLeft } from 'lucide-react'
import { ServiceProvider, Service, Pet } from '@/types'
import { providerApi } from '@/lib/providers'
import { serviceApi } from '@/lib/services'
import { petsApi } from '@/lib/pets'
import { useAuth } from '@/contexts/auth-context'
import { format } from 'date-fns'
import { toast } from 'sonner'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const loadingRef = useRef(false)
  
  // Get booking data from URL params
  const date = searchParams.get('date')
  const time = searchParams.get('time')
  const petIdsString = searchParams.get('pets')
  const petIds = petIdsString?.split(',') || []
  const serviceId = searchParams.get('service')

  useEffect(() => {
    const loadBookingData = async () => {
      if (!user || !serviceId || !date || !time || !petIdsString) {
        toast.error('Missing booking information')
        router.push('/search')
        return
      }

      if (loadingRef.current) {
        return // Prevent multiple simultaneous calls
      }

      try {
        loadingRef.current = true
        setLoading(true)
        
        // Load service data
        const serviceData = await serviceApi.getServiceById(serviceId)
        console.log('Service data:', serviceData)
        if (!serviceData) {
          toast.error('Service not found')
          router.push('/search')
          return
        }
        // Transform service data to match Service interface
        const transformedService: Service = {
          id: serviceData.id,
          providerId: serviceData.provider_id,
          category: serviceData.category,
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          duration: serviceData.duration_minutes,
          maxPets: serviceData.max_pets,
          requirements: serviceData.requirements || [],
          includes: serviceData.includes || [],
          images: serviceData.images || [],
          status: serviceData.is_active ? 'active' : 'inactive',
          createdAt: serviceData.created_at,
          updatedAt: serviceData.updated_at
        }
        setService(transformedService)
        
        // Load provider data
        const providerData = await providerApi.getProviderById(serviceData.provider_id)
        if (!providerData) {
          toast.error('Provider not found')
          router.push('/search')
          return
        }
        setProvider(providerData)
        
        // Load selected pets
        const allPets = await petsApi.getUserPets(user.id)
        const selectedPets = allPets.filter(pet => petIds.includes(pet.id))
        setPets(selectedPets)
        
      } catch (error) {
        console.error('Error loading booking data:', error)
        console.error('Service ID:', serviceId)
        console.error('Date:', date)
        console.error('Time:', time)
        console.error('Pet IDs:', petIds)
        toast.error('Failed to load booking information')
        router.push('/search')
      } finally {
        loadingRef.current = false
        setLoading(false)
      }
    }

    loadBookingData()
  }, [user, serviceId, date, time, petIdsString, router, petIds])

  const handleConfirmBooking = async () => {
    if (!user || !service || !provider || !date || !time || pets.length === 0) {
      return
    }

    setProcessing(true)
    
    try {
      // Calculate end time
      const startTime = new Date(`${date}T${time}`)
      const endTime = new Date(startTime.getTime() + service.duration * 60000)
      
      // Create booking
      const bookingData = {
        customerId: user.id,
        providerId: provider.id,
        serviceId: service.id,
        petIds: pets.map(pet => pet.id),
        bookingDate: date,
        startTime: time,
        endTime: endTime.toTimeString().slice(0, 5),
        totalPrice: service.price * pets.length,
        specialInstructions: ''
      }

      // Here you would typically call your booking API
      // const booking = await bookingsApi.createBooking(bookingData)
      
      // For now, simulate successful booking
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Booking confirmed!')
      router.push('/bookings')
      
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Failed to confirm booking')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="customer">
        <Layout>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-96 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (!provider || !service || pets.length === 0) {
    return (
      <ProtectedRoute requiredRole="customer">
        <Layout>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
                <p className="text-gray-600 mb-6">The booking information could not be loaded.</p>
                <Button onClick={() => router.push('/search')}>
                  Back to Search
                </Button>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  const totalPrice = service.price * pets.length

  return (
    <ProtectedRoute requiredRole="customer">
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Go back to cart with current parameters
                  const params = new URLSearchParams()
                  params.set('date', date!)
                  params.set('time', time!)
                  params.set('pets', petIdsString!)
                  params.set('service', serviceId!)
                  router.push(`/bookings/cart?${params.toString()}`)
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Cart
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Booking Details */}
              <div className="space-y-6">
                {/* Service Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Service Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{format(new Date(date!), 'PPP')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{service.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <span>€{service.price} per pet</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Provider Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Provider
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h3 className="font-semibold text-lg">{provider.businessName}</h3>
                      <p className="text-gray-600">{provider.location.address}</p>
                      <p className="text-gray-600">{provider.location.city}, {provider.location.state}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pets */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Selected Pets ({pets.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pets.map((pet) => (
                        <div key={pet.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{pet.name}</h4>
                            <p className="text-sm text-gray-600">
                              {pet.species} • {pet.age} years old
                              {pet.breed && ` • ${pet.breed}`}
                            </p>
                          </div>
                          <Badge variant="secondary">€{service.price}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{service.name} × {pets.length} {pets.length > 1 ? 'pets' : 'pet'}</span>
                        <span>€{totalPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Duration</span>
                        <span>{service.duration} minutes</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Date & Time</span>
                        <span>{format(new Date(date!), 'MMM d')} at {time}</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>€{totalPrice}</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button 
                        onClick={handleConfirmBooking}
                        disabled={processing}
                        className="w-full bg-black hover:bg-gray-800 text-white"
                        size="lg"
                      >
                        {processing ? 'Processing...' : 'Confirm Booking'}
                      </Button>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                      Secure booking • Payment not required in advance
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
