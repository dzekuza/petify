'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ServiceProvider, Service, Review, Pet, PetAd } from '@/types'
import { supabase } from '@/lib/supabase'
import { petsApi } from '@/lib/pets'
import { useAuth } from '@/contexts/auth-context'
import { useFavorites } from '@/contexts/favorites-context'
import { t } from '@/lib/translations'
import { ImageGallery } from '@/components/provider-detail/image-gallery'
import { ProviderInfo } from '@/components/provider-detail/provider-info'
import { BookingWidget } from '@/components/provider-detail/booking-widget'
import { MobileLayout } from '@/components/provider-detail/mobile-layout'
import { DesktopHeader } from '@/components/provider-detail/desktop-header'
import { ReviewDialog } from '@/components/review-dialog'
import { ChatButton } from '@/components/ui/chat-button'
import Navigation from '@/components/navigation'
import { Footer } from '@/components/footer'
import { toast } from 'sonner'

export default function ProviderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { isFavorited, toggleFavorite } = useFavorites()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [userPets, setUserPets] = useState<Pet[]>([])
  const [petAd, setPetAd] = useState<PetAd | null>(null)
  const [preSelectedServiceId, setPreSelectedServiceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  
  // Check if we're viewing a pet ad
  const petAdId = searchParams.get('petAdId')
  
  // Check if we should open review dialog
  const shouldOpenReview = searchParams.get('review') === 'true'
  const reviewBookingId = searchParams.get('bookingId')
  
  // Check if we should preselect a service
  const serviceParam = searchParams.get('service')
  

  const isFavorite = provider ? isFavorited(provider.id) : false

  const handleToggleFavorite = async () => {
    if (!provider || !user) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/signin'
      return
    }

    setIsTogglingFavorite(true)
    try {
      await toggleFavorite(provider.id)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsTogglingFavorite(false)
    }
  }

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
        // Handle sharing error
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
      // Handle clipboard error
      alert(`${t('provider.shareLink')}: ${window.location.href}`)
    }
  }

  const handleBookService = (serviceId?: string) => {
    try {
      if (!provider) {
        toast.error('Provider not loaded')
        return
      }
      if ((services || []).length === 0) {
        toast.error('No services available for this provider')
        return
      }

      // Check if we're on mobile
      const isMobile = window.innerWidth < 1024
      
      if (isMobile) {
        // For mobile, redirect to the booking page
        const bookingUrl = serviceId 
          ? `/providers/${provider.id}/book?service=${serviceId}`
          : `/providers/${provider.id}/book`
        
        router.push(bookingUrl)
      } else {
        // For desktop, set the pre-selected service (existing behavior)
        if (serviceId) {
          setPreSelectedServiceId(serviceId)
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start booking'
      toast.error(message)
    }
  }

  const handlePetsUpdate = (pets: Pet[]) => {
    setUserPets(pets)
  }

  const fetchReviews = async (providerId: string) => {
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', providerId)
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
      console.error('Error fetching reviews:', error)
    }
  }

  const handleReviewSubmitted = () => {
    // Refresh reviews after submission
    if (provider) {
      fetchReviews(provider.id)
    }
  }

  // Open review dialog if URL parameters indicate it
  useEffect(() => {
    if (shouldOpenReview && provider && !loading) {
      setReviewDialogOpen(true)
    }
  }, [shouldOpenReview, provider, loading])

  // Preselect service if URL parameter is provided
  useEffect(() => {
    if (serviceParam && services.length > 0 && !loading) {
      // Find the service by ID
      const service = services.find(s => s.id === serviceParam)
      if (service) {
        setPreSelectedServiceId(serviceParam)
        // Scroll to booking widget on desktop
        if (window.innerWidth >= 1024) {
          setTimeout(() => {
            const bookingWidget = document.getElementById('booking-widget')
            if (bookingWidget) {
              bookingWidget.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }, 100)
        }
      }
    }
  }, [serviceParam, services, loading])

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
          businessType: providerData.business_type,
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
          contactInfo: {
            phone: providerData.contact_info?.phone || '',
            email: providerData.contact_info?.email || '',
            website: providerData.contact_info?.website || ''
          },
          images: providerData.images || [],
          avatarUrl: providerData.avatar_url || null,
          certifications: providerData.certifications || [],
          experience: providerData.experience_years || 0,
          status: providerData.status || 'active',
          createdAt: providerData.created_at,
          updatedAt: providerData.updated_at
        }

        setProvider(transformedProvider)

        // Fetch pet ad data if petAdId is provided
        if (petAdId) {
          const { data: petAdData, error: petAdError } = await supabase
            .from('pet_ads')
            .select('*')
            .eq('id', petAdId)
            .eq('is_active', true)
            .single()

          if (petAdError) {
            console.error('Error fetching pet ad:', petAdError)
          } else {
            setPetAd(petAdData)
          }
        }

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
        await fetchReviews(params.id as string)

      } catch (error) {
        console.error('Error fetching provider data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProviderData()
    }
  }, [params.id, petAdId])

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
      {/* Navigation */}
      <Navigation />
      
      {/* Mobile Layout */}
      <MobileLayout
        provider={provider}
        services={services}
        reviews={reviews}
        petAd={petAd}
        userPets={userPets}
        onPetsUpdate={setUserPets}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        onShare={handleShare}
        onBack={() => router.back()}
        onBookService={handleBookService}
      />

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <DesktopHeader
            onBack={() => router.back()}
            onShare={handleShare}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Main content grid */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left column - Image gallery and content */}
            <div className="col-span-2 space-y-8">
              <ImageGallery
                provider={provider}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
                onShare={handleShare}
                onBack={() => router.back()}
                isMobile={false}
              />

              <ProviderInfo
                provider={provider}
                services={services}
                reviews={reviews}
                petAd={petAd}
                isMobile={false}
                onBookService={handleBookService}
                preSelectedServiceId={preSelectedServiceId}
              />
            </div>

            {/* Right column - Booking widget */}
            <div className="col-span-1">
              <div className="sticky top-24 space-y-4">
                <BookingWidget
                  provider={provider}
                  services={services}
                  petAd={petAd}
                  userPets={userPets}
                  onBookService={handleBookService}
                  onPetsUpdate={handlePetsUpdate}
                  isMobile={false}
                  preSelectedService={preSelectedServiceId || undefined}
                />
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      {provider && (
        <ReviewDialog
          isOpen={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          providerId={provider.id}
          providerName={provider.businessName}
          bookingId={reviewBookingId || undefined}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Floating Chat Button */}
      {provider && (
        <div className="fixed bottom-24 lg:bottom-6 right-6 z-50">
          <ChatButton
            chatName={provider.businessName}
            providerId={provider.id}
            variant="default"
          />
        </div>
      )}

      {/* Footer - Hidden on mobile */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  )
}
