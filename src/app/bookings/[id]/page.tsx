'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Booking, ServiceProvider, Service, Pet } from '@/types'
import { Calendar, Clock, MapPin, CreditCard, CheckCircle, ArrowLeft, CalendarPlus, Users } from 'lucide-react'
import { format } from 'date-fns'
import { t } from '@/lib/translations'
import Image from 'next/image'

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
          totalPrice: parseFloat(bookingData.total_price),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-pulse">
              <Image
                src="/PetiFy.svg"
                alt="PetiFy"
                width={120}
                height={40}
                className="mb-8"
              />
            </div>
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="space-y-6 mt-8">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-white">
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
    )
  }

  return (
    <div className="min-h-screen bg-white">
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
            <Card className="py-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  {t('bookings.confirmation.bookingDetails')}
                </CardTitle>
                <CardDescription>
                  {t('bookings.confirmation.bookingDetailsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">{t('bookings.confirmation.provider')}</p>
                      <p className="font-medium">{provider?.businessName || t('bookings.confirmation.myBusiness')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">{t('bookings.confirmation.dateAndTime')}</p>
                      <p className="font-medium">{format(new Date(booking.date), 'MMMM d, yyyy')} {booking.timeSlot.start}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">{t('bookings.confirmation.pets')}</p>
                      <p className="font-medium">1 {t('bookings.confirmation.pet')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">{t('bookings.confirmation.servicePrice')}</p>
                      <p className="font-medium">€{service?.price || 0} × 1</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">{t('bookings.confirmation.total')}</span>
                    <span className="text-xl font-bold text-gray-900">€{booking.totalPrice}</span>
                  </div>
                </div>

                {pet && (
                  <div className="border-t pt-4 pb-8">
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
                <div className="border-t pt-4 pb-8">
                  <h4 className="font-medium mb-3">{t('bookings.confirmation.addToCalendar')}</h4>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const startDate = new Date(`${booking.date}T${booking.timeSlot.start}`)
                        const endDate = new Date(`${booking.date}T${booking.timeSlot.end}`)
                        
                        const title = `${service?.name || 'Pet Service'} - ${provider?.businessName || 'Provider'}`
                        const description = `Pet service appointment${pet ? ` for ${pet.name}` : ''}${booking.notes ? `\n\nSpecial instructions: ${booking.notes}` : ''}`
                        const location = provider?.location ? `${provider.location.address}, ${provider.location.city}` : ''
                        
                        // Apple Calendar URL
                        const appleUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(
                          `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Petify//Pet Service Booking//EN
BEGIN:VEVENT
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`
                        )}`
                        
                        const link = document.createElement('a')
                        link.href = appleUrl
                        link.download = 'pet-service-booking.ics'
                        link.click()
                      }}
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Apple Calendar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const startDate = new Date(`${booking.date}T${booking.timeSlot.start}`)
                        const endDate = new Date(`${booking.date}T${booking.timeSlot.end}`)
                        
                        const title = `${service?.name || 'Pet Service'} - ${provider?.businessName || 'Provider'}`
                        const description = `Pet service appointment${pet ? ` for ${pet.name}` : ''}${booking.notes ? `\n\nSpecial instructions: ${booking.notes}` : ''}`
                        const location = provider?.location ? `${provider.location.address}, ${provider.location.city}` : ''
                        
                        // Google Calendar URL
                        const googleUrl = new URL('https://calendar.google.com/calendar/render')
                        googleUrl.searchParams.set('action', 'TEMPLATE')
                        googleUrl.searchParams.set('text', title)
                        googleUrl.searchParams.set('dates', `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`)
                        googleUrl.searchParams.set('details', description)
                        googleUrl.searchParams.set('location', location)
                        
                        window.open(googleUrl.toString(), '_blank')
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Google Calendar
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
              <Card className="py-0">
                <CardHeader className="pb-4">
                  <CardTitle>{t('bookings.confirmation.provider')}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-8">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🏢</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{provider.businessName}</h4>
                      </div>
                    </div>
                    {provider.location && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
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
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        {t('bookings.confirmation.getDirections')}
                      </Button>
                    )}
                    {/* Provider rating removed per request */}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
