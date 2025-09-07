'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Clock, 
  Heart, 
  Share2, 
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Home,
  PawPrint
} from 'lucide-react'
import Image from 'next/image'
import { ServiceProvider, Service, Review } from '@/types'
import { supabase } from '@/lib/supabase'
import { t } from '@/lib/translations'


export default function ProviderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handlePreviousImage = () => {
    if (provider?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? provider.images.length - 1 : prev - 1
      )
    }
  }

  const handleNextImage = () => {
    if (provider?.images) {
      setCurrentImageIndex((prev) => 
        prev === provider.images.length - 1 ? 0 : prev + 1
      )
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
                  <div className="flex gap-2 overflow-hidden rounded-3xl">
                    <div className="flex-1 aspect-square bg-gray-200 rounded-3xl"></div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                      <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                      <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                      <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                    </div>
                  </div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
                <div className="h-32 bg-gray-200 rounded"></div>
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
    <div className="min-h-screen bg-white">
      {/* Image Section */}
      <div className="relative">
        {/* Image with overlay controls */}
        {provider.images && provider.images.length > 0 ? (
          <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh]">
            <Image
              src={provider.images[currentImageIndex]}
              alt={`${provider.businessName} - Image ${currentImageIndex + 1}`}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                if (fallback) {
                  fallback.style.display = 'flex'
                }
              }}
            />
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200" style={{ display: 'none' }}>
              <span className="text-6xl">✂️</span>
            </div>
            
            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-black/20">
              {/* Top Controls */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <button
                  onClick={() => router.back()}
                  className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
                  </button>
                  <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                    <Share2 className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
              
              {/* Image Counter */}
              {provider.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {provider.images.length}
                </div>
              )}
              
              {/* Navigation Arrows */}
              {provider.images.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="h-[50vh] sm:h-[60vh] lg:h-[70vh] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <span className="text-6xl">✂️</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="relative -mt-8 bg-white rounded-t-3xl">
        <div className="px-6 pt-8 pb-24">
          {/* Header Info */}
          <div className="mb-6">
            <div className="flex items-start space-x-3 mb-4">
              <Home className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {provider.businessName}
                </h1>
                <p className="text-gray-600 mb-2">
                  Pet service in {provider.location.city}, {provider.location.state}
                </p>
                <p className="text-gray-600 text-sm">
                  {services.length > 0 ? `${services.length} services available` : 'Services available'} • {provider.experience} years experience
                </p>
              </div>
            </div>
            
            {/* Reviews */}
            <div className="flex items-center space-x-2 mb-4">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{provider.rating}</span>
              <span className="text-sm text-gray-500">({provider.reviewCount} reviews)</span>
            </div>
          </div>

          {/* Host Information */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-600">
                  {provider.businessName.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Hosted by {provider.businessName}</h3>
                <p className="text-sm text-gray-600">{provider.experience} years hosting</p>
              </div>
            </div>
          </div>

          {/* Pet Policy */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex items-start space-x-3">
              <PawPrint className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Pet-friendly services</h3>
                <p className="text-sm text-gray-600">Professional care for your beloved pets.</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <p className="text-gray-600 leading-relaxed">{provider.description}</p>
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Services & Pricing</h2>
              <div className="space-y-4">
                {services.slice(0, 3).map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.duration} min
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            Up to {service.maxPets} {service.maxPets > 1 ? 'pets' : 'pet'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-semibold text-gray-900">
                          €{service.price}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {services.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{services.length - 3} more services available
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews ({provider.reviewCount})</h2>
              <div className="space-y-4">
                {reviews.slice(0, 2).map((review) => (
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
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              €{provider.priceRange.min}-€{provider.priceRange.max}
            </div>
            <div className="text-sm text-gray-600">per service</div>
          </div>
          <Button 
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-8 py-3 rounded-lg font-semibold"
            asChild
          >
            <Link href={`/providers/${params.id}/book`}>
              Book
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
