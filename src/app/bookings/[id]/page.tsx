'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Booking, ServiceProvider, Service, Pet } from '@/types'
import { Calendar, Clock, User, MapPin, CreditCard, CheckCircle, ArrowLeft, CalendarPlus } from 'lucide-react'
import { format } from 'date-fns'
import { t } from '@/lib/translations'

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!params.id || !user) return

      try {
        setLoading(true)

        // Fetch booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', params.id)
          .eq('customer_id', user.id)
          .single()

        if (bookingError || !bookingData) {
          setError(t('bookings.confirmation.bookingNotFound'))
          return
        }

        // Transform booking data
        const transformedBooking: Booking = {
          id: bookingData.id,
          customerId: bookingData.customer_id,
          providerId: bookingData.provider_id,
          serviceId: bookingData.service_id,
          petId: bookingData.pet_id,
          date: bookingData.booking_date,
          timeSlot: {
            start: bookingData.start_time,
            end: bookingData.end_time,
            available: true
          },
          status: bookingData.status,
          totalPrice: bookingData.total_price,
          notes: bookingData.special_instructions,
          createdAt: bookingData.created_at,
          updatedAt: bookingData.updated_at
        }

        setBooking(transformedBooking)

        // Fetch provider details
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('id', bookingData.provider_id)
          .single()

        if (!providerError && providerData) {
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
        }

        // Fetch service details
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('*')
          .eq('id', bookingData.service_id)
          .single()

        if (!serviceError && serviceData) {
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
        }

        // Fetch pet details
        if (bookingData.pet_id) {
          const { data: petData, error: petError } = await supabase
            .from('pets')
            .select('*')
            .eq('id', bookingData.pet_id)
            .single()

          if (!petError && petData) {
            const transformedPet: Pet = {
              id: petData.id,
              ownerId: petData.owner_id,
              name: petData.name,
              species: petData.species,
              breed: petData.breed,
              age: petData.age,
              weight: petData.weight,
              specialNeeds: petData.special_needs || [],
              medicalNotes: petData.medical_notes,
              profilePicture: petData.images?.[0],
              galleryImages: petData.images || [],
              createdAt: petData.created_at,
              updatedAt: petData.updated_at
            }
            setPet(transformedPet)
          }
        }

      } catch (err) {
        console.error('Error fetching booking details:', err)
        setError(t('bookings.error'))
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [params.id, user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const generateCalendarEvent = () => {
    if (!booking || !service || !provider) return null

    const startDate = new Date(`${booking.date}T${booking.timeSlot.start}`)
    const endDate = new Date(`${booking.date}T${booking.timeSlot.end}`)
    
    const title = `${service.name} - ${provider.businessName}`
    const description = `${service.description}\n\nProvider: ${provider.businessName}\nPet: ${pet?.name || 'N/A'}\nLocation: ${provider.location?.address || 'TBD'}`
    const location = provider.location?.address || ''

    return {
      title: encodeURIComponent(title),
      description: encodeURIComponent(description),
      location: encodeURIComponent(location),
      startDate: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      endDate: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }
  }

  const addToGoogleCalendar = () => {
    const event = generateCalendarEvent()
    if (!event) return

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${event.title}&dates=${event.startDate}/${event.endDate}&details=${event.description}&location=${event.location}`
    window.open(googleUrl, '_blank')
  }

  const addToAppleCalendar = () => {
    const event = generateCalendarEvent()
    if (!event) return

    const appleUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${event.startDate}
DTEND:${event.endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([appleUrl], { type: 'text/calendar' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'booking.ics'
    link.click()
    window.URL.revokeObjectURL(url)
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
                <div className="space-y-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  if (error || !booking) {
    return (
      <Layout>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('bookings.confirmation.bookingNotFound')}</h1>
                <p className="text-gray-600 mb-6">{error || t('bookings.confirmation.bookingNotFoundDesc')}</p>
                <Button onClick={() => router.push('/bookings')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('bookings.confirmation.backToBookings')}
                </Button>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  return (
    <Layout>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/bookings')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('bookings.confirmation.backToBookings')}
              </Button>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex space-x-2 mb-2">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">{t('bookings.confirmation.title')}</h1>
                  <p className="text-gray-600">{t('bookings.confirmation.subtitle')}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Booking Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      {t('bookings.confirmation.bookingDetails')}
                    </CardTitle>
                    <CardDescription>
                      {t('bookings.confirmation.bookingDetailsDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">{t('bookings.confirmation.date')}</p>
                          <p className="font-medium">{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">{t('bookings.confirmation.time')}</p>
                          <p className="font-medium">{booking.timeSlot.start} - {booking.timeSlot.end}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <User className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">{t('bookings.confirmation.service')}</p>
                          <p className="font-medium">{service?.name || t('bookings.confirmation.service')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">{t('bookings.confirmation.totalPaid')}</p>
                          <p className="font-medium">€{booking.totalPrice}</p>
                        </div>
                      </div>
                    </div>

                    {pet && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">{t('bookings.confirmation.petInformation')}</h4>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🐕</span>
                          </div>
                          <div>
                            <p className="font-medium">{pet.name}</p>
                            <p className="text-sm text-gray-600">{pet.species} • {pet.breed}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {booking.notes && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">{t('bookings.confirmation.specialInstructions')}</h4>
                        <p className="text-gray-600">{booking.notes}</p>
                      </div>
                    )}

                    {/* Add to Calendar */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3 flex items-center">
                        <CalendarPlus className="h-5 w-5 mr-2" />
                        {t('bookings.confirmation.addToCalendar')}
                      </h4>
                      <div className="space-y-2">
                        <Button
                          onClick={addToGoogleCalendar}
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          {t('bookings.confirmation.addToGoogleCalendar')}
                        </Button>
                        <Button
                          onClick={addToAppleCalendar}
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                          {t('bookings.confirmation.addToAppleCalendar')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Provider Information */}
                {provider && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('bookings.confirmation.provider')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🏢</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{provider.businessName}</h4>
                            <p className="text-sm text-gray-600">{provider.description}</p>
                          </div>
                        </div>
                        {provider.location && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{provider.location.address}, {provider.location.city}</span>
                          </div>
                        )}
                        {provider.location && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              const address = encodeURIComponent(`${provider.location.address}, ${provider.location.city}`)
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank')
                            }}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            {t('bookings.confirmation.getDirections')}
                          </Button>
                        )}
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">{t('bookings.confirmation.rating')}:</span>
                          <span className="font-medium">{provider.rating}/5</span>
                          <span className="text-gray-600">({provider.reviewCount} {t('bookings.confirmation.reviews')})</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
