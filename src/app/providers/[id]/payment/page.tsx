'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InputWithLabel, SelectWithLabel } from '@/components/ui/input-with-label'
import { 
  ArrowLeft, 
  CreditCard, 
  Lock,
  Calendar,
  Clock,
  Users,
} from 'lucide-react'
import { ServiceProvider, Service, Pet } from '@/types'
import { supabase } from '@/lib/supabase'
import { petsApi } from '@/lib/pets'
import { useAuth } from '@/contexts/auth-context'
import { format } from 'date-fns'

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
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    apt: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Lithuania'
  })
  const [isProcessing, setIsProcessing] = useState(false)

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

  const handlePayment = async () => {
    if (!user || !selectedService || !provider) return
    
    setIsProcessing(true)
    
    try {
      // Here you would integrate with your payment processor (Stripe, etc.)
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create booking record
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: user.id,
          provider_id: provider.id,
          service_id: selectedService.id,
          pet_ids: selectedPets.map(pet => pet.id),
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          total_amount: calculateTotal(),
          service_fee: calculateServiceFee(),
          status: 'confirmed',
          payment_status: 'paid',
          payment_method: paymentMethod
        })
        .select()
        .single()

      if (bookingError) {
        throw new Error('Failed to create booking')
      }

      // Redirect to confirmation page
      router.push(`/bookings/${bookingData.id}`)
      
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

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
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking not found</h1>
                <p className="text-gray-600">The booking information is missing or invalid.</p>
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
              <h1 className="text-lg font-semibold text-gray-900">Confirm and pay</h1>
              <p className="text-sm text-gray-600">{provider.businessName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Form */}
          <div className="space-y-6">
            {/* Payment Method Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Add a payment method</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg">
                  <input
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="card" className="flex items-center space-x-2 cursor-pointer">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Credit or debit card</span>
                  </label>
                </div>
                
                <div className="flex items-center space-x-4 ml-7">
                  <div className="text-xs text-gray-500">VISA</div>
                  <div className="text-xs text-gray-500">MASTERCARD</div>
                  <div className="text-xs text-gray-500">AMEX</div>
                </div>
              </div>
            </div>

            {/* Card Details */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <InputWithLabel
                  id="cardNumber"
                  label="Card number"
                  value={cardNumber}
                  onChange={(value) => setCardNumber(formatCardNumber(value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <InputWithLabel
                    id="expiryDate"
                    label="Expiration"
                    value={expiryDate}
                    onChange={(value) => setExpiryDate(formatExpiryDate(value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                  <InputWithLabel
                    id="cvv"
                    label="CVV"
                    value={cvv}
                    onChange={setCvv}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
                
                <InputWithLabel
                  id="cardholderName"
                  label="Name on card"
                  value={cardholderName}
                  onChange={setCardholderName}
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            {/* Billing Address */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Billing address</h3>
              <div className="space-y-4">
                <InputWithLabel
                  id="street"
                  label="Street address"
                  value={billingAddress.street}
                  onChange={(value) => setBillingAddress(prev => ({ ...prev, street: value }))}
                  placeholder="123 Main St"
                  required
                />
                
                <InputWithLabel
                  id="apt"
                  label="Apt or suite number"
                  value={billingAddress.apt}
                  onChange={(value) => setBillingAddress(prev => ({ ...prev, apt: value }))}
                  placeholder="Apt 4B (optional)"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <InputWithLabel
                    id="city"
                    label="City"
                    value={billingAddress.city}
                    onChange={(value) => setBillingAddress(prev => ({ ...prev, city: value }))}
                    placeholder="Vilnius"
                    required
                  />
                  <InputWithLabel
                    id="state"
                    label="State"
                    value={billingAddress.state}
                    onChange={(value) => setBillingAddress(prev => ({ ...prev, state: value }))}
                    placeholder="Vilnius County"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <InputWithLabel
                    id="zipCode"
                    label="ZIP code"
                    value={billingAddress.zipCode}
                    onChange={(value) => setBillingAddress(prev => ({ ...prev, zipCode: value }))}
                    placeholder="01234"
                    required
                  />
                  <SelectWithLabel
                    id="country"
                    label="Country/region"
                    value={billingAddress.country}
                    onValueChange={(value) => setBillingAddress(prev => ({ ...prev, country: value }))}
                    options={[
                      { value: 'Lithuania', label: 'Lithuania' },
                      { value: 'Latvia', label: 'Latvia' },
                      { value: 'Estonia', label: 'Estonia' },
                      { value: 'Poland', label: 'Poland' }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div>
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">✂️</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{provider.businessName}</CardTitle>
                      <CardDescription>Pet service booking</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    This reservation is non-refundable. <span className="text-blue-600 underline cursor-pointer">Full policy</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Date</span>
                      </div>
                      <div className="text-sm font-medium">
                        {format(new Date(selectedDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Time</span>
                      </div>
                      <div className="text-sm font-medium">{selectedTime}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Pets</span>
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
                      <span className="text-gray-600">Petify service fee</span>
                      <span className="font-medium">€{calculateServiceFee()}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total EUR</span>
                      <span className="text-xl font-bold text-gray-900">
                        €{(calculateTotal() + calculateServiceFee()).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      variant="gradient"
                      size="lg"
                      className="w-full"
                      onClick={handlePayment}
                      disabled={isProcessing || !cardNumber || !expiryDate || !cvv || !cardholderName || !billingAddress.street || !billingAddress.city || !billingAddress.state || !billingAddress.zipCode}
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4" />
                          <span>Confirm and pay</span>
                        </div>
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">
                    Secure payment • Your payment information is encrypted
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
