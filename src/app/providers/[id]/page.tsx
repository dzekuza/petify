'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ServiceProvider, Service, Review, Pet } from '@/types'
import { supabase } from '@/lib/supabase'
import { petsApi } from '@/lib/pets'
import { useAuth } from '@/contexts/auth-context'
import { t } from '@/lib/translations'
import { ImageGallery } from '@/components/provider-detail/image-gallery'
import { ProviderInfo } from '@/components/provider-detail/provider-info'
import { BookingWidget } from '@/components/provider-detail/booking-widget'
import { MobileLayout } from '@/components/provider-detail/mobile-layout'
import { DesktopHeader } from '@/components/provider-detail/desktop-header'

export default function ProviderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [userPets, setUserPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  const handleShare = async () => {
    const shareData = {
      title: provider?.businessName || t('provider.petServiceProvider'),
      text: `Check out ${provider?.businessName} - Professional pet services in ${provider?.location.city}, ${provider?.location.state}`,
      url: window.location.href
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
        fallbackShare()
      }
    } else {
      fallbackShare()
    }
  }

  const fallbackShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert(t('provider.linkCopied'))
    } catch (error) {
      console.log('Failed to copy to clipboard:', error)
      alert(`${t('provider.shareLink')}: ${window.location.href}`)
    }
  }

  const handleBookService = (serviceId?: string) => {
    const isMobile = window.innerWidth < 1024
    const queryParams = new URLSearchParams()
    
    if (serviceId) {
      queryParams.set('service', serviceId)
    }
    
    if (isMobile) {
      router.push(`/providers/${params.id}/book?${queryParams.toString()}`)
    } else {
      router.push(`/providers/${params.id}/payment?${queryParams.toString()}`)
    }
  }

  const handlePetsUpdate = (pets: Pet[]) => {
    setUserPets(pets)
  }

  // Fetch user pets
  const fetchUserPets = async () => {
    if (!user) return
    
    try {
      const pets = await petsApi.getUserPets(user.id)
      setUserPets(pets)
    } catch (error) {
      console.error('Error fetching user pets:', error)
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

  // Fetch user pets when user changes
  useEffect(() => {
    if (user) {
      fetchUserPets()
    }
  }, [user])

  if (loading) {
    return (
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
    )
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('provider.notFound')}</h1>
            <p className="text-gray-600">{t('provider.notFoundDescription')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Layout */}
      <MobileLayout
        provider={provider}
        services={services}
        reviews={reviews}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite(!isFavorite)}
        onShare={handleShare}
        onBack={() => router.back()}
        onBookService={handleBookService}
      />

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DesktopHeader
            onBack={() => router.back()}
            onShare={handleShare}
            isFavorite={isFavorite}
            onToggleFavorite={() => setIsFavorite(!isFavorite)}
          />

          {/* Main content grid */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left column - Image gallery and content */}
            <div className="col-span-2 space-y-8">
              <ImageGallery
                provider={provider}
                isFavorite={isFavorite}
                onToggleFavorite={() => setIsFavorite(!isFavorite)}
                onShare={handleShare}
                onBack={() => router.back()}
                isMobile={false}
              />

              <ProviderInfo
                provider={provider}
                services={services}
                reviews={reviews}
                isMobile={false}
              />
            </div>

            {/* Right column - Booking widget */}
            <div className="col-span-1">
              <div className="sticky top-8">
                <BookingWidget
                  provider={provider}
                  services={services}
                  userPets={userPets}
                  onBookService={handleBookService}
                  onPetsUpdate={handlePetsUpdate}
                  isMobile={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
