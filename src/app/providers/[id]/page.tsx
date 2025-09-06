'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Layout } from '@/components/layout'
import { ProviderCard } from '@/components/provider-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Heart, 
  Share2, 
  Award,
  Users,
  Calendar,
  Shield,
  CheckCircle
} from 'lucide-react'
import { ServiceProvider, Service, Review } from '@/types'
import { providerApi } from '@/lib/providers'
import { supabase } from '@/lib/supabase'
import { t } from '@/lib/translations'


export default function ProviderDetailPage() {
  const params = useParams()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

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

        // Fetch reviews for this provider
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('provider_id', params.id)
          .order('created_at', { ascending: false })

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError)
        } else {
          // Transform reviews data
          const transformedReviews: Review[] = (reviewsData || []).map(review => ({
            id: review.id,
            bookingId: review.booking_id,
            customerId: review.customer_id,
            providerId: review.provider_id,
            rating: review.rating,
            comment: review.comment,
            images: review.images || [],
            createdAt: review.created_at,
            updatedAt: review.updated_at
          }))
          setReviews(transformedReviews)
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!provider) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('provider.notFound')}</h1>
              <p className="text-gray-600">{t('provider.notFoundDescription')}</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {provider.businessName}
                </h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-medium text-gray-900 ml-1">
                      {provider.rating}
                    </span>
                    <span className="text-gray-500 ml-1">
                      ({provider.reviewCount} {t('search.reviews')})
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {provider.location.city}, {provider.location.state}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'text-red-500 fill-current' : ''}`} />
                  {isFavorite ? t('provider.saved') : t('provider.save')}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('provider.share')}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card className="py-0">
                <CardContent className="p-0">
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-100 to-blue-200 h-64 rounded-lg overflow-hidden">
                    {provider.images && provider.images.length > 0 ? (
                      <img
                        src={provider.images[0]}
                        alt={provider.businessName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement
                          if (fallback) {
                            fallback.style.display = 'flex'
                          }
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center" style={{ display: provider.images && provider.images.length > 0 ? 'none' : 'flex' }}>
                      <span className="text-6xl">✂️</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('provider.about')} {provider.businessName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{provider.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t('provider.experience')}</p>
                        <p className="text-sm text-gray-600">{provider.experience} {t('provider.years')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t('provider.certifications')}</p>
                        <p className="text-sm text-gray-600">{provider.certifications?.length || 0} {t('provider.certified')}</p>
                      </div>
                    </div>
                  </div>

                  {provider.certifications && provider.certifications.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">{t('provider.certifications')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {provider.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center">
                            <Award className="h-3 w-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('provider.servicesAndPricing')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {service.duration} {t('provider.min')}
                              </span>
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {t('provider.upTo')} {service.maxPets} {service.maxPets > 1 ? t('provider.pets') : t('provider.pet')}
                              </span>
                            </div>
                            {service.includes && service.includes.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700 mb-1">{t('provider.includes')}</p>
                                <div className="flex flex-wrap gap-1">
                                  {service.includes.map((item, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-semibold text-gray-900">
                              €{service.price}
                            </div>
                            <Button size="sm" className="mt-2" asChild>
                              <Link href={`/providers/${params.id}/book`}>
                                {t('search.bookNow')}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('provider.reviews')} ({provider.reviewCount})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('provider.contactAndBooking')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      €{provider.priceRange.min}-€{provider.priceRange.max}
                    </div>
                    <div className="text-sm text-gray-600">{t('search.perService')}</div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" asChild>
                      <Link href={`/providers/${params.id}/book`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {t('search.bookNow')}
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {t('search.message')}
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      {t('search.call')}
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{t('provider.workingHours')}</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // Navigate to booking page where customers can see full availability
                          window.location.href = `/providers/${params.id}/book`
                        }}
                        className="text-xs"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Book Now
                      </Button>
                    </div>
                    <div className="space-y-1 text-sm">
                      {Object.entries(provider.availability)
                        .filter(([day]) => {
                          // Only show full day names, filter out abbreviated ones
                          const fullDayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                          return fullDayNames.includes(day.toLowerCase())
                        })
                        .map(([day, slots]) => {
                        // Handle different availability data structures
                        let hasAvailability = false
                        let startTime = ''
                        let endTime = ''
                        
                        if (Array.isArray(slots) && slots.length > 0) {
                          // Check if slots have available property (time slot format)
                          if (slots[0] && typeof slots[0] === 'object' && 'available' in slots[0]) {
                            const availableSlots = slots.filter((slot: any) => slot.available)
                            hasAvailability = availableSlots.length > 0
                            if (hasAvailability) {
                              startTime = availableSlots[0].start
                              endTime = availableSlots[availableSlots.length - 1].end
                            }
                          } else if (slots[0] && typeof slots[0] === 'object' && 'start' in slots[0]) {
                            // Direct time slot format without available property
                            hasAvailability = true
                            startTime = (slots[0] as any).start
                            endTime = (slots[slots.length - 1] as any).end
                          } else if (typeof slots[0] === 'string') {
                            // Simple string format
                            hasAvailability = true
                            startTime = slots[0] as string
                            endTime = slots[slots.length - 1] as unknown as string
                          }
                        } else if (typeof slots === 'object' && slots !== null && 'start' in slots) {
                          // Single time range object
                          hasAvailability = true
                          startTime = (slots as any).start
                          endTime = (slots as any).end
                        } else if (typeof slots === 'boolean') {
                          // Simple boolean availability
                          hasAvailability = slots
                          if (hasAvailability) {
                            startTime = '9:00'
                            endTime = '17:00'
                          }
                        }
                        
                        return (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize">{day}</span>
                            <span className="text-gray-600">
                              {hasAvailability ? `${startTime} - ${endTime}` : t('provider.closed')}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 text-center">
                        Click "Book Now" to see detailed availability and make a booking
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('provider.location')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{provider.location.address}</p>
                        <p className="text-gray-600">
                          {provider.location.city}, {provider.location.state} {provider.location.zipCode}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      {t('provider.getDirections')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
