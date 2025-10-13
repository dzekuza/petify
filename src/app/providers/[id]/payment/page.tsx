'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ServiceProvider, Service } from '@/types'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useDeviceDetection } from '@/lib/device-detection'
import { ArrowLeft, CreditCard, Lock, CheckCircle } from 'lucide-react'

export default function PaymentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isMobile } = useDeviceDetection()
  
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  // Payment form state
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  
  // Booking data from URL params
  const [bookingData, setBookingData] = useState({
    providerId: '',
    serviceId: '',
    pets: [] as string[],
    date: '',
    time: '',
    price: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get booking data from URL params
        const providerId = params.id as string
        const serviceId = searchParams?.get('service') || searchParams?.get('serviceId') || ''
        const pets = searchParams?.get('pets')?.split(',') || []
        const date = searchParams?.get('date') || ''
        const time = searchParams?.get('time') || ''
        const price = parseFloat(searchParams?.get('price') || '0')
        
        setBookingData({
          providerId,
          serviceId,
          pets,
          date,
          time,
          price
        })
        
        // Fetch provider data
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('id', providerId)
          .single()

        if (providerError) {
          console.error('Error fetching provider:', providerError)
          toast.error('Provider not found')
          return
        }

        setProvider(providerData)

        // Fetch service data only if serviceId is provided
        if (serviceId) {
          const { data: serviceData, error: serviceError } = await supabase
            .from('services')
            .select('*')
            .eq('id', serviceId)
            .single()

          if (serviceError) {
            console.error('Error fetching service:', serviceError)
            toast.error('Service not found')
            return
          }

          setService(serviceData)
        }

      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load payment data')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id, searchParams])

  const handlePayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      toast.error('Please fill in all payment details')
      return
    }

    setProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create booking record
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          provider_id: bookingData.providerId,
          service_id: bookingData.serviceId,
          customer_id: (await supabase.auth.getUser()).data.user?.id,
          booking_date: bookingData.date,
          booking_time: bookingData.time,
          total_price: bookingData.price,
          status: 'confirmed',
          payment_status: 'paid'
        })
        .select()
        .single()

      if (bookingError) {
        throw bookingError
      }

      toast.success('Payment successful! Booking confirmed.')
      router.push(`/bookings/${booking.id}`)
      
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout hideFooter={isMobile}>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="space-y-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (!provider || !service) {
    return (
      <ProtectedRoute>
        <Layout hideFooter={isMobile}>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment data not found</h1>
                <p className="text-gray-600">Unable to load payment information.</p>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout hideFooter={isMobile}>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Atgal</span>
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Mokėjimas</h1>
                  <p className="text-sm text-gray-600">Saugus mokėjimas per Stripe</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="space-y-6">
              {/* Booking Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Užsakymo santrauka</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Paslaugos tiekėjas</h4>
                    <p className="text-gray-600">{provider.businessName}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Paslauga</h4>
                    <p className="text-gray-600">{service.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Data ir laikas</h4>
                    <p className="text-gray-600">
                      {new Date(bookingData.date).toLocaleDateString('lt-LT')} - {bookingData.time}
                    </p>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Iš viso:</span>
                      <span className="text-xl font-bold text-green-600">
                        €{bookingData.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span>Mokėjimo informacija</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardholder">Kortelės savininkas</Label>
                    <Input
                      id="cardholder"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="Vardas Pavardė"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardNumber">Kortelės numeris</Label>
                    <Input
                      id="cardNumber"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="1234 5678 9012 3456"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Galiojimo data</Label>
                      <Input
                        id="expiry"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d{2})/, '$1/$2'))}
                        placeholder="MM/YY"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="123"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Saugus mokėjimas</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Jūsų mokėjimo duomenys yra šifruojami ir saugomi saugiai per Stripe.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Button */}
              <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-[100]' : ''}`}>
                <Button
                  onClick={handlePayment}
                  disabled={processing || !cardNumber || !expiryDate || !cvv || !cardholderName}
                  className={`w-full bg-green-600 hover:bg-green-700 text-white ${isMobile ? '' : 'max-w-md mx-auto'}`}
                  size="lg"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Apdorojama...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Mokėti €{bookingData.price.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}