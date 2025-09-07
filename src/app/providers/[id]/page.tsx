'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { InputWithLabel, SelectWithLabel, TextareaWithLabel } from '@/components/ui/input-with-label'
import { BreedSelector } from '@/components/ui/breed-selector'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Star, 
  Clock, 
  Heart, 
  Share2, 
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  PawPrint,
  Calendar as CalendarIcon
} from 'lucide-react'
import Image from 'next/image'
import { ServiceProvider, Service, Review, Pet } from '@/types'
import { supabase } from '@/lib/supabase'
import { petsApi } from '@/lib/pets'
import { useAuth } from '@/contexts/auth-context'
import { t } from '@/lib/translations'
import { useDeviceDetection } from '@/lib/device-detection'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'


export default function ProviderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { isDesktop } = useDeviceDetection()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [userPets, setUserPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedPets, setSelectedPets] = useState<string[]>([])
  const [selectedService, setSelectedService] = useState('')
  
  // Add pet dialog state
  const [addPetDialogOpen, setAddPetDialogOpen] = useState(false)
  const [addPetForm, setAddPetForm] = useState({
    name: '',
    species: 'dog' as 'dog' | 'cat' | 'bird' | 'rabbit' | 'other',
    breed: '',
    age: '',
    weight: '',
    specialNeeds: '',
    medicalNotes: ''
  })
  const [addPetLoading, setAddPetLoading] = useState(false)
  const [addPetError, setAddPetError] = useState('')

  const handleShare = async () => {
    const shareData = {
      title: provider?.businessName || 'Pet Service Provider',
      text: `Check out ${provider?.businessName} - Professional pet services in ${provider?.location.city}, ${provider?.location.state}`,
      url: window.location.href
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
        // Fallback to clipboard
        fallbackShare()
      }
    } else {
      // Fallback to clipboard
      fallbackShare()
    }
  }

  const fallbackShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      // You could add a toast notification here
      alert('Link copied to clipboard!')
    } catch (error) {
      console.log('Failed to copy to clipboard:', error)
      // Final fallback - show the URL
      alert(`${t('provider.share')} this link: ${window.location.href}`)
    }
  }

  const handlePreviousImage = () => {
    if (provider?.images && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentImageIndex((prev) => 
        prev === 0 ? provider.images.length - 1 : prev - 1
      )
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  const handleNextImage = () => {
    if (provider?.images && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentImageIndex((prev) => 
        prev === provider.images.length - 1 ? 0 : prev + 1
      )
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  // Keyboard navigation for image gallery
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (provider?.images && provider.images.length > 1 && !isTransitioning) {
        if (event.key === 'ArrowLeft') {
          handlePreviousImage()
        } else if (event.key === 'ArrowRight') {
          handleNextImage()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [provider?.images, isTransitioning])

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

  // Pet selection handlers
  const handlePetSelection = (petId: string, checked: boolean) => {
    if (checked) {
      setSelectedPets(prev => [...prev, petId])
    } else {
      setSelectedPets(prev => prev.filter(id => id !== petId))
    }
  }

  const getPetIcon = (species: string) => {
    switch (species) {
      case 'dog':
        return <PawPrint className="h-4 w-4" />
      case 'cat':
        return <PawPrint className="h-4 w-4" />
      default:
        return <PawPrint className="h-4 w-4" />
    }
  }

  // Add pet handlers
  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setAddPetLoading(true)
    setAddPetError('')

    try {
      const petData = {
        name: addPetForm.name,
        species: addPetForm.species,
        breed: addPetForm.breed || undefined,
        age: parseInt(addPetForm.age),
        weight: addPetForm.weight ? parseFloat(addPetForm.weight) : undefined,
        specialNeeds: addPetForm.specialNeeds ? addPetForm.specialNeeds.split(',').map(s => s.trim()) : undefined,
        medicalNotes: addPetForm.medicalNotes || undefined
      }

      const newPet = await petsApi.createPet(petData, user.id)
      
      // Add the new pet to the list and select it
      setUserPets(prev => [...prev, newPet])
      setSelectedPets(prev => [...prev, newPet.id])
      
      // Reset form and close dialog
      setAddPetForm({
        name: '',
        species: 'dog',
        breed: '',
        age: '',
        weight: '',
        specialNeeds: '',
        medicalNotes: ''
      })
      setAddPetDialogOpen(false)
    } catch (error) {
      setAddPetError(error instanceof Error ? error.message : 'Failed to add pet')
    } finally {
      setAddPetLoading(false)
    }
  }

  const handleAddPetFormChange = (field: string, value: string) => {
    setAddPetForm(prev => ({ ...prev, [field]: value }))
  }

  const handleBookService = () => {
    // For mobile, allow booking without pre-selections (will be made in next step)
    // For desktop, require all selections
    const isMobile = window.innerWidth < 1024
    if (!isMobile && (!selectedDate || !selectedTime || !selectedService || selectedPets.length === 0)) {
      return
    }

    const bookingParams = new URLSearchParams()
    
    // Only add parameters if they exist (for mobile compatibility)
    if (selectedDate) {
      bookingParams.set('date', selectedDate.toISOString().split('T')[0])
    }
    if (selectedTime) {
      bookingParams.set('time', selectedTime)
    }
    if (selectedPets.length > 0) {
      bookingParams.set('pets', selectedPets.join(','))
    }
    if (selectedService) {
      bookingParams.set('service', selectedService)
    }

    if (isDesktop) {
      // Desktop: redirect directly to payment page
      router.push(`/providers/${params.id}/payment?${bookingParams.toString()}`)
    } else {
      // Mobile: redirect to booking flow
      router.push(`/providers/${params.id}/book?${bookingParams.toString()}`)
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
          
          // Set default service if none selected
          if (transformedServices.length > 0 && !selectedService) {
            setSelectedService(transformedServices[0].id)
          }
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
      <Navigation />
      {/* Mobile Layout (default) */}
      <div className="lg:hidden">
        {/* Image Section */}
        <div className="relative">
          {/* Image with overlay controls */}
          {provider.images && provider.images.length > 0 ? (
            <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
              <div className="relative w-full h-full">
                {provider.images.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                      index === currentImageIndex
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-105'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${provider.businessName} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
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
                  </div>
                ))}
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
                    <button 
                      onClick={handleShare}
                      className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    >
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
                      disabled={isTransitioning}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      disabled={isTransitioning}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}
                
                {/* Pagination Dots */}
                {provider.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {provider.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (!isTransitioning) {
                            setIsTransitioning(true)
                            setCurrentImageIndex(index)
                            setTimeout(() => setIsTransitioning(false), 300)
                          }
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? 'bg-white scale-125'
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[50vh] sm:h-[60vh] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <span className="text-6xl">✂️</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="relative -mt-8 bg-white rounded-t-3xl">
          <div className="px-6 pt-8 pb-24">
            {/* Header Info */}
            <div className="mb-6">
              <div className="mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {provider.businessName}
                  </h1>
                  <p className="text-gray-600 mb-2">
                    {t('provider.petServiceIn')} {provider.location.city}, {provider.location.state}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {services.length > 0 ? `${services.length} ${t('provider.servicesAvailable')}` : t('provider.servicesAvailable')} • {provider.experience} {t('provider.yearsExperience')}
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
                  <h3 className="font-semibold text-gray-900">{t('provider.hostedBy')} {provider.businessName}</h3>
                  <p className="text-sm text-gray-600">{provider.experience} {t('provider.yearsHosting')}</p>
                </div>
              </div>
            </div>

            {/* Pet Policy */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="flex items-start space-x-3">
                <PawPrint className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">{t('provider.petFriendlyServices')}</h3>
                  <p className="text-sm text-gray-600">{t('provider.professionalCare')}</p>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('provider.servicesAndPricing')}</h2>
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
                      +{services.length - 3} {t('provider.moreServices')}
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

            {/* Mobile Booking Form */}
            <div className="hidden lg:block border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Book this service</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.serviceDate')}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : t('provider.selectDate')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.serviceTime')}</label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('provider.selectTime')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="17:00">5:00 PM</SelectItem>
                      <SelectItem value="18:00">6:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.selectPets')}</label>
                  {userPets.length > 0 ? (
                    <div className="space-y-2">
                      <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                        {userPets.map((pet) => (
                          <div key={pet.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`mobile-pet-${pet.id}`}
                              checked={selectedPets.includes(pet.id)}
                              onCheckedChange={(checked) => handlePetSelection(pet.id, checked as boolean)}
                            />
                            <label
                              htmlFor={`mobile-pet-${pet.id}`}
                              className="flex items-center space-x-2 cursor-pointer flex-1"
                            >
                              {getPetIcon(pet.species)}
                              <span className="text-sm text-gray-900">{pet.name}</span>
                              <span className="text-xs text-gray-500">({pet.species}, {pet.age}y)</span>
                            </label>
                          </div>
                        ))}
                      </div>
                      <Dialog open={addPetDialogOpen} onOpenChange={setAddPetDialogOpen}>
                        <DialogTrigger asChild>
                          <button className="w-full text-sm text-black hover:text-gray-800 py-2 border border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                            {t('provider.addAnotherPet')}
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Add Your Pet</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleAddPet} className="space-y-4">
                            {addPetError && (
                              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                                {addPetError}
                              </div>
                            )}
                            
                            <InputWithLabel
                              id="mobilePetName"
                              label={t('provider.petName')}
                              value={addPetForm.name}
                              onChange={(value) => handleAddPetFormChange('name', value)}
                              placeholder="Enter pet name"
                              required
                            />

                            <SelectWithLabel
                              id="mobilePet{t('provider.species')}"
                              label={t('provider.species')}
                              value={addPetForm.species}
                              onValueChange={(value) => handleAddPetFormChange('species', value)}
                              required
                              options={[
                                { value: "dog", label: t('provider.dog') },
                                { value: "cat", label: t('provider.cat') },
                                { value: "bird", label: t('provider.bird') },
                                { value: "rabbit", label: t('provider.rabbit') },
                                { value: "other", label: t('provider.other') }
                              ]}
                            />

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.breed')}</label>
                              <BreedSelector
                                value={addPetForm.breed}
                                onValueChange={(value) => handleAddPetFormChange('breed', value)}
                                species={addPetForm.species}
                                placeholder="Select breed (optional)"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <InputWithLabel
                                id="mobilePetAge"
                                label="Age (years)"
                                type="number"
                                value={addPetForm.age}
                                onChange={(value) => handleAddPetFormChange('age', value)}
                                placeholder="0"
                                required
                                min={0}
                                max={30}
                              />
                              <InputWithLabel
                                id="mobilePetWeight"
                                label="Weight (kg)"
                                type="number"
                                value={addPetForm.weight}
                                onChange={(value) => handleAddPetFormChange('weight', value)}
                                placeholder="0.0"
                                min={0}
                                step={0.1}
                              />
                            </div>

                            <InputWithLabel
                              id="mobileSpecialNeeds"
                              label={t('provider.specialNeeds')}
                              value={addPetForm.specialNeeds}
                              onChange={(value) => handleAddPetFormChange('specialNeeds', value)}
                              placeholder="Comma-separated list (optional)"
                            />

                            <TextareaWithLabel
                              id="mobileMedicalNotes"
                              label={t('provider.medicalNotes')}
                              value={addPetForm.medicalNotes}
                              onChange={(value) => handleAddPetFormChange('medicalNotes', value)}
                              placeholder="Any medical information (optional)"
                              rows={3}
                            />

                            <div className="flex justify-end space-x-3 pt-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddPetDialogOpen(false)}
                                disabled={addPetLoading}
                              >
                                {t('provider.cancel')}
                              </Button>
                              <Button
                                type="submit"
                                disabled={addPetLoading || !addPetForm.name || !addPetForm.age}
                              >
                                {addPetLoading ? 'Adding...' : 'Add Pet'}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-md p-3 text-center">
                      <p className="text-sm text-gray-500 mb-2">No pets added yet</p>
                      <Dialog open={addPetDialogOpen} onOpenChange={setAddPetDialogOpen}>
                        <DialogTrigger asChild>
                          <button className="text-sm text-black hover:text-gray-800">
                            Add your first pet
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Add Your Pet</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleAddPet} className="space-y-4">
                            {addPetError && (
                              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                                {addPetError}
                              </div>
                            )}
                            
                            <InputWithLabel
                              id="mobilePetName2"
                              label={t('provider.petName')}
                              value={addPetForm.name}
                              onChange={(value) => handleAddPetFormChange('name', value)}
                              placeholder="Enter pet name"
                              required
                            />

                            <SelectWithLabel
                              id="mobilePet{t('provider.species')}2"
                              label={t('provider.species')}
                              value={addPetForm.species}
                              onValueChange={(value) => handleAddPetFormChange('species', value)}
                              required
                              options={[
                                { value: "dog", label: t('provider.dog') },
                                { value: "cat", label: t('provider.cat') },
                                { value: "bird", label: t('provider.bird') },
                                { value: "rabbit", label: t('provider.rabbit') },
                                { value: "other", label: t('provider.other') }
                              ]}
                            />

                            <InputWithLabel
                              id="mobilePet{t('provider.breed')}2"
                              label={t('provider.breed')}
                              value={addPetForm.breed}
                              onChange={(value) => handleAddPetFormChange('breed', value)}
                              placeholder="Enter breed (optional)"
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <InputWithLabel
                                id="mobilePetAge2"
                                label="Age (years)"
                                type="number"
                                value={addPetForm.age}
                                onChange={(value) => handleAddPetFormChange('age', value)}
                                placeholder="0"
                                required
                                min={0}
                                max={30}
                              />
                              <InputWithLabel
                                id="mobilePetWeight2"
                                label="Weight (kg)"
                                type="number"
                                value={addPetForm.weight}
                                onChange={(value) => handleAddPetFormChange('weight', value)}
                                placeholder="0.0"
                                min={0}
                                step={0.1}
                              />
                            </div>

                            <InputWithLabel
                              id="mobileSpecialNeeds2"
                              label={t('provider.specialNeeds')}
                              value={addPetForm.specialNeeds}
                              onChange={(value) => handleAddPetFormChange('specialNeeds', value)}
                              placeholder="Comma-separated list (optional)"
                            />

                            <TextareaWithLabel
                              id="mobileMedicalNotes2"
                              label={t('provider.medicalNotes')}
                              value={addPetForm.medicalNotes}
                              onChange={(value) => handleAddPetFormChange('medicalNotes', value)}
                              placeholder="Any medical information (optional)"
                              rows={3}
                            />

                            <div className="flex justify-end space-x-3 pt-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddPetDialogOpen(false)}
                                disabled={addPetLoading}
                              >
                                {t('provider.cancel')}
                              </Button>
                              <Button
                                type="submit"
                                disabled={addPetLoading || !addPetForm.name || !addPetForm.age}
                              >
                                {addPetLoading ? 'Adding...' : 'Add Pet'}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.serviceType')}</label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('provider.selectService')} />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - €{service.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                €{provider.priceRange.min}-€{provider.priceRange.max}
              </div>
              <div className="text-sm text-gray-600">{t('provider.perService')}</div>
            </div>
            <Button 
              variant="gradient"
              size="lg"
              onClick={handleBookService}
            >
              Book
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout (lg and above) */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with back button and actions */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('provider.back')}</span>
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{t('provider.share')}</span>
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                <span>{t('provider.save')}</span>
              </button>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left column - Image gallery and content */}
            <div className="col-span-2 space-y-8">
              {/* Image Gallery */}
              {provider.images && provider.images.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 h-[400px]">
                  {/* Main large image */}
                  <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl">
                    <Image
                      src={provider.images[currentImageIndex]}
                      alt={`${provider.businessName} - Image ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  {/* Smaller images */}
                  {provider.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="relative overflow-hidden rounded-xl">
                      <Image
                        src={image}
                        alt={`${provider.businessName} - Image ${index + 2}`}
                        fill
                        className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setCurrentImageIndex(index + 1)}
                      />
                    </div>
                  ))}
                  {provider.images.length > 5 && (
                    <div className="relative overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl font-semibold text-gray-600">+{provider.images.length - 5}</div>
                        <div className="text-sm text-gray-500">{t('provider.moreImages')}</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[400px] bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                  <span className="text-6xl">✂️</span>
                </div>
              )}

              {/* Provider Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {provider.businessName}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">
                    {t('provider.petServiceIn')} {provider.location.city}, {provider.location.state}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{services.length} {t('provider.servicesAvailable')}</span>
                    <span>•</span>
                    <span>{provider.experience} {t('provider.yearsExperience')}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{provider.rating}</span>
                      <span>({provider.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Host Information */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xl font-semibold text-gray-600">
                        {provider.businessName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{t('provider.hostedBy')} {provider.businessName}</h3>
                      <p className="text-gray-600">{provider.experience} {t('provider.yearsHosting')}</p>
                    </div>
                  </div>
                </div>

                {/* Pet Policy */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-start space-x-4">
                    <PawPrint className="w-6 h-6 text-gray-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{t('provider.petFriendlyServices')}</h3>
                      <p className="text-gray-600">{t('provider.professionalCare')}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t border-gray-200 pt-6">
                  <p className="text-gray-600 leading-relaxed text-lg">{provider.description}</p>
                </div>

                {/* Services */}
                {services.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('provider.servicesAndPricing')}</h2>
                    <div className="space-y-4">
                      {services.map((service) => (
                        <div key={service.id} className="border border-gray-200 rounded-xl p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900 mb-2">{service.name}</h4>
                              <p className="text-gray-600 mb-3">{service.description}</p>
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2" />
                                  {service.duration} min
                                </span>
                                <span className="flex items-center">
                                  <Users className="h-4 w-4 mr-2" />
                                  Up to {service.maxPets} {service.maxPets > 1 ? 'pets' : 'pet'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right ml-6">
                              <div className="text-2xl font-bold text-gray-900">
                                €{service.price}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews */}
                {reviews.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Reviews ({provider.reviewCount})</h2>
                    <div className="space-y-6">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Booking widget */}
            <div className="col-span-1">
              <div className="sticky top-8">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    €{provider.priceRange.min}-€{provider.priceRange.max}
                  </div>
                  <div className="text-gray-600 mb-6">{t('provider.perService')}</div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.serviceDate')}</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : t('provider.selectDate')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <SelectWithLabel
                      id="serviceTime"
                      label={t('provider.serviceTime')}
                      value={selectedTime}
                      onValueChange={setSelectedTime}
                      placeholder={t('provider.selectTime')}
                      required
                      options={[
                        { value: "09:00", label: "9:00 AM" },
                        { value: "10:00", label: "10:00 AM" },
                        { value: "11:00", label: "11:00 AM" },
                        { value: "12:00", label: "12:00 PM" },
                        { value: "13:00", label: "1:00 PM" },
                        { value: "14:00", label: "2:00 PM" },
                        { value: "15:00", label: "3:00 PM" },
                        { value: "16:00", label: "4:00 PM" },
                        { value: "17:00", label: "5:00 PM" },
                        { value: "18:00", label: "6:00 PM" }
                      ]}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.selectPets')}</label>
                      {userPets.length > 0 ? (
                        <div className="space-y-2">
                          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                            {userPets.map((pet) => (
                              <div key={pet.id} className="flex items-center space-x-3">
                                <Checkbox
                                  id={`pet-${pet.id}`}
                                  checked={selectedPets.includes(pet.id)}
                                  onCheckedChange={(checked) => handlePetSelection(pet.id, checked as boolean)}
                                />
                                <label
                                  htmlFor={`pet-${pet.id}`}
                                  className="flex items-center space-x-2 cursor-pointer flex-1"
                                >
                                  {getPetIcon(pet.species)}
                                  <span className="text-sm text-gray-900">{pet.name}</span>
                                  <span className="text-xs text-gray-500">({pet.species}, {pet.age}y)</span>
                                </label>
                              </div>
                            ))}
                          </div>
                          <Dialog open={addPetDialogOpen} onOpenChange={setAddPetDialogOpen}>
                            <DialogTrigger asChild>
                              <button className="w-full text-sm text-black hover:text-gray-800 py-2 border border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                                {t('provider.addAnotherPet')}
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Add Your Pet</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleAddPet} className="space-y-4">
                                {addPetError && (
                                  <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                                    {addPetError}
                                  </div>
                                )}
                                
                                <InputWithLabel
                                  id="petName"
                                  label={t('provider.petName')}
                                  value={addPetForm.name}
                                  onChange={(value) => handleAddPetFormChange('name', value)}
                                  placeholder="Enter pet name"
                                  required
                                />

                                <SelectWithLabel
                                  id="pet{t('provider.species')}"
                                  label={t('provider.species')}
                                  value={addPetForm.species}
                                  onValueChange={(value) => handleAddPetFormChange('species', value)}
                                  required
                                  options={[
                                    { value: "dog", label: t('provider.dog') },
                                    { value: "cat", label: t('provider.cat') },
                                    { value: "bird", label: t('provider.bird') },
                                    { value: "rabbit", label: t('provider.rabbit') },
                                    { value: "other", label: t('provider.other') }
                                  ]}
                                />

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.breed')}</label>
                                  <BreedSelector
                                    value={addPetForm.breed}
                                    onValueChange={(value) => handleAddPetFormChange('breed', value)}
                                    species={addPetForm.species}
                                    placeholder="Select breed (optional)"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <InputWithLabel
                                    id="petAge"
                                    label="Age (years)"
                                    type="number"
                                    value={addPetForm.age}
                                    onChange={(value) => handleAddPetFormChange('age', value)}
                                    placeholder="0"
                                    required
                                    min={0}
                                    max={30}
                                  />
                                  <InputWithLabel
                                    id="petWeight"
                                    label="Weight (kg)"
                                    type="number"
                                    value={addPetForm.weight}
                                    onChange={(value) => handleAddPetFormChange('weight', value)}
                                    placeholder="0.0"
                                    min={0}
                                    step={0.1}
                                  />
                                </div>

                                <InputWithLabel
                                  id="specialNeeds"
                                  label={t('provider.specialNeeds')}
                                  value={addPetForm.specialNeeds}
                                  onChange={(value) => handleAddPetFormChange('specialNeeds', value)}
                                  placeholder="Comma-separated list (optional)"
                                />

                                <TextareaWithLabel
                                  id="medicalNotes"
                                  label={t('provider.medicalNotes')}
                                  value={addPetForm.medicalNotes}
                                  onChange={(value) => handleAddPetFormChange('medicalNotes', value)}
                                  placeholder="Any medical information (optional)"
                                  rows={3}
                                />

                                <div className="flex justify-end space-x-3 pt-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setAddPetDialogOpen(false)}
                                    disabled={addPetLoading}
                                  >
                                    {t('provider.cancel')}
                                  </Button>
                                  <Button
                                    type="submit"
                                    disabled={addPetLoading || !addPetForm.name || !addPetForm.age}
                                  >
                                    {addPetLoading ? 'Adding...' : 'Add Pet'}
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ) : (
                        <div className="border border-gray-300 rounded-md p-3 text-center">
                          <p className="text-sm text-gray-500 mb-2">No pets added yet</p>
                          <Dialog open={addPetDialogOpen} onOpenChange={setAddPetDialogOpen}>
                            <DialogTrigger asChild>
                              <button className="text-sm text-black hover:text-gray-800">
                                Add your first pet
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Add Your Pet</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleAddPet} className="space-y-4">
                                {addPetError && (
                                  <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                                    {addPetError}
                                  </div>
                                )}
                                
                                <InputWithLabel
                                  id="petName"
                                  label={t('provider.petName')}
                                  value={addPetForm.name}
                                  onChange={(value) => handleAddPetFormChange('name', value)}
                                  placeholder="Enter pet name"
                                  required
                                />

                                <SelectWithLabel
                                  id="pet{t('provider.species')}"
                                  label={t('provider.species')}
                                  value={addPetForm.species}
                                  onValueChange={(value) => handleAddPetFormChange('species', value)}
                                  required
                                  options={[
                                    { value: "dog", label: t('provider.dog') },
                                    { value: "cat", label: t('provider.cat') },
                                    { value: "bird", label: t('provider.bird') },
                                    { value: "rabbit", label: t('provider.rabbit') },
                                    { value: "other", label: t('provider.other') }
                                  ]}
                                />

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('provider.breed')}</label>
                                  <BreedSelector
                                    value={addPetForm.breed}
                                    onValueChange={(value) => handleAddPetFormChange('breed', value)}
                                    species={addPetForm.species}
                                    placeholder="Select breed (optional)"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <InputWithLabel
                                    id="petAge"
                                    label="Age (years)"
                                    type="number"
                                    value={addPetForm.age}
                                    onChange={(value) => handleAddPetFormChange('age', value)}
                                    placeholder="0"
                                    required
                                    min={0}
                                    max={30}
                                  />
                                  <InputWithLabel
                                    id="petWeight"
                                    label="Weight (kg)"
                                    type="number"
                                    value={addPetForm.weight}
                                    onChange={(value) => handleAddPetFormChange('weight', value)}
                                    placeholder="0.0"
                                    min={0}
                                    step={0.1}
                                  />
                                </div>

                                <InputWithLabel
                                  id="specialNeeds"
                                  label={t('provider.specialNeeds')}
                                  value={addPetForm.specialNeeds}
                                  onChange={(value) => handleAddPetFormChange('specialNeeds', value)}
                                  placeholder="Comma-separated list (optional)"
                                />

                                <TextareaWithLabel
                                  id="medicalNotes"
                                  label={t('provider.medicalNotes')}
                                  value={addPetForm.medicalNotes}
                                  onChange={(value) => handleAddPetFormChange('medicalNotes', value)}
                                  placeholder="Any medical information (optional)"
                                  rows={3}
                                />

                                <div className="flex justify-end space-x-3 pt-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setAddPetDialogOpen(false)}
                                    disabled={addPetLoading}
                                  >
                                    {t('provider.cancel')}
                                  </Button>
                                  <Button
                                    type="submit"
                                    disabled={addPetLoading || !addPetForm.name || !addPetForm.age}
                                  >
                                    {addPetLoading ? 'Adding...' : 'Add Pet'}
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                    <SelectWithLabel
                      id="serviceType"
                      label={t('provider.serviceType')}
                      value={selectedService}
                      onValueChange={setSelectedService}
                      placeholder={t('provider.selectService')}
                      required
                      options={services.map((service) => ({
                        value: service.id,
                        label: `${service.name} - €${service.price}`
                      }))}
                    />
                  </div>

                  <Button 
                    variant="gradient"
                    size="lg"
                    className="w-full mb-4"
                    onClick={handleBookService}
                    disabled={!selectedDate || !selectedTime || !selectedService || selectedPets.length === 0}
                  >
                    {t('provider.bookService')}
                  </Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    {t('provider.secureBooking')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
