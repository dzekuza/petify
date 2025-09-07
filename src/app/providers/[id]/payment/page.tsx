'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StripePaymentForm } from '@/components/stripe-payment-form'
import { 
  ArrowLeft, 
  Calendar,
  Clock,
  Users,
  CreditCard,
  Shield,
} from 'lucide-react'
import { ServiceProvider, Service, Pet } from '@/types'
import { supabase } from '@/lib/supabase'
import { petsApi } from '@/lib/pets'
import { useAuth } from '@/contexts/auth-context'
import { getStripe } from '@/lib/stripe'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { t } from '@/lib/translations'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedPets, setSelectedPets] = useState<Pet[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Stripe payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true)
        
        // Get booking parameters from URL
        const date = searchParams.get('date')
        const time = searchParams.get('time')
        const petsParam = searchParams.get('pets')
        const serviceParam = searchParams.get('service')
        
        if (!date || !time || !petsParam || !serviceParam) {
          router.push(`/providers/${params.id}`)
          return
        }
        
        setSelectedDate(date)
        setSelectedTime(time)
        
        // Fetch provider data
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('id', params.id)
          .eq('status', 'active')
          .single()

        if (providerError || !providerData) {
          router.push(`/providers/${params.id}`)
          return
        }

        // Transform provider data
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

        // Fetch service data
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceParam)
          .eq('is_active', true)
          .single()

        if (serviceError || !serviceData) {
          router.push(`/providers/${params.id}`)
          return
        }

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

        setSelectedService(transformedService)

        // Fetch selected pets
        if (user && petsParam) {
          const petIds = petsParam.split(',')
          const userPets = await petsApi.getUserPets(user.id)
          const pets = userPets.filter(pet => petIds.includes(pet.id))
          setSelectedPets(pets)
        }

      } catch (error) {
        console.error('Error fetching booking data:', error)
        router.push(`/providers/${params.id}`)
      } finally {
        setLoading(false)
      }
    }

    if (params.id && user) {
      fetchBookingData()
    }
  }, [params.id, searchParams, user, router])

  const calculateTotal = () => {
    if (!selectedService) return 0
    return selectedService.price * selectedPets.length
  }

  const calculateServiceFee = () => {
    const total = calculateTotal()
    return Math.round(total * 0.15 * 100) / 100 // 15% service fee
  }

  const calculateGrandTotal = () => {
    return calculateTotal() + calculateServiceFee()
  }

  // Create Stripe payment intent
  const createPaymentIntent = async () => {
    if (!selectedService || !provider || !user) return

    setIsCreatingPayment(true)
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: calculateTotal(),
          currency: 'eur',
          bookingId: `temp_${Date.now()}`, // Temporary ID until booking is created
          customerEmail: user.email,
          serviceFee: 0.15,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (error) {
      console.error('Error creating payment intent:', error)
      toast.error(t('payment.failedToInitialize'))
    } finally {
      setIsCreatingPayment(false)
    }
  }

  // Handle successful payment
  const handlePaymentSuccess = async (paymentIntent: any) => {
    if (!user || !selectedService || !provider) return
    
    try {
      // Warn if multiple pets are selected (database only supports single pet per booking)
      if (selectedPets.length > 1) {
        console.warn('Multiple pets selected but database schema only supports single pet per booking. Using first pet:', selectedPets[0]?.name)
      }

      // Calculate end time based on service duration
      const startTime = new Date(`2000-01-01T${selectedTime}`)
      const endTime = new Date(startTime.getTime() + (selectedService.duration || 60) * 60000)
      const endTimeString = endTime.toTimeString().slice(0, 5)

      // Create booking record using the correct database schema
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: user.id,
          provider_id: provider.id,
          service_id: selectedService.id,
          pet_id: selectedPets[0]?.id, // Database schema only supports single pet_id - using first selected pet
          booking_date: selectedDate,
          start_time: selectedTime,
          end_time: endTimeString,
          duration_minutes: selectedService.duration || 60,
          total_price: calculateGrandTotal(), // Use grand total including service fee
          status: 'confirmed',
          payment_status: 'paid',
          payment_id: paymentIntent.id // Store Stripe payment intent ID
        })
        .select()
        .single()

      if (bookingError) {
        console.error('Booking creation error details:', bookingError)
        throw new Error(`Failed to create booking: ${bookingError.message}`)
      }

      toast.success(t('payment.paymentSuccessful'))
      
      // Redirect to confirmation page
      router.push(`/bookings/${bookingData.id}`)
      
    } catch (error) {
      console.error('Booking creation error:', error)
      toast.error(t('payment.paymentSucceededButBookingFailed'))
    }
  }

  // Handle payment error
  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    toast.error(`Payment failed: ${error}`)
  }

  // Initialize payment intent when component is ready
  useEffect(() => {
    if (selectedService && provider && user && !clientSecret && !isCreatingPayment) {
      createPaymentIntent()
    }
  }, [selectedService, provider, user, clientSecret, isCreatingPayment])

  if (loading) {
    return (
      <Layout>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
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

  if (!provider || !selectedService) {
    return (
      <Layout>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('payment.bookingNotFound')}</h1>
                <p className="text-gray-600">{t('payment.bookingNotFoundDesc')}</p>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
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
              <h1 className="text-lg font-semibold text-gray-900">{t('payment.confirmAndPay')}</h1>
              <p className="text-sm text-gray-600">{provider.businessName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Form */}
          {isCreatingPayment ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">{t('payment.initializingPayment')}</p>
              </div>
            </div>
          ) : clientSecret ? (
            <Elements
              stripe={getStripe()}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#3b82f6',
                    colorBackground: '#ffffff',
                    colorText: '#1f2937',
                    colorDanger: '#ef4444',
                    fontFamily: 'system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <StripePaymentForm
                clientSecret={clientSecret}
                amount={calculateGrandTotal() * 100} // Convert to cents
                currency="eur"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                bookingDetails={{
                  serviceName: selectedService?.name || '',
                  providerName: provider?.businessName || '',
                  date: format(new Date(selectedDate), 'MMM d, yyyy'),
                  time: selectedTime,
                }}
              />
            </Elements>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Failed to initialize payment. Please refresh the page.</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Refresh Page
              </Button>
            </div>
          )}

          {/* Right Column - Booking Summary */}
          <div>
            <div className="sticky top-24">
              <Card>
                <CardHeader className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">✂️</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{provider.businessName}</CardTitle>
                      <CardDescription>{t('payment.petServiceBooking')}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pb-6">
                  <div className="text-sm text-gray-600">
                    {t('payment.nonRefundableReservation')} <span className="text-blue-600 underline cursor-pointer">{t('payment.fullPolicy')}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{t('payment.date')}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {format(new Date(selectedDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{t('payment.time')}</span>
                      </div>
                      <div className="text-sm font-medium">{selectedTime}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{t('payment.pets')}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {selectedPets.length} {selectedPets.length === 1 ? 'pet' : 'pets'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {selectedPets.length} {selectedPets.length === 1 ? 'pet' : 'pets'} × €{selectedService.price}
                      </span>
                      <span className="font-medium">€{calculateTotal()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('payment.petifyServiceFee')}</span>
                      <span className="font-medium">€{calculateServiceFee()}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">{t('payment.totalEUR')}</span>
                      <span className="text-xl font-bold text-gray-900">
                        €{(calculateTotal() + calculateServiceFee()).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{t('payment.paymentMethod')}</span>
                      </div>
                      <div className="text-sm font-medium">{t('payment.creditDebitCard')}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{t('payment.security')}</span>
                      </div>
                      <div className="text-sm font-medium text-green-600">{t('payment.securedByStripe')}</div>
                    </div>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">
                    {t('payment.completePaymentInstruction')}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
