'use client'

import { useState, useEffect, useMemo } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Star, 
  Plus, 
  Edit, 
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Phone,
  MapPin,
  PawPrint
} from 'lucide-react'
import { t } from '@/lib/translations'
import AvailabilityCalendar from '@/components/availability-calendar'
import BookingsSection from './_sections/BookingsSection'
import ServicesSection from './_sections/ServicesSection'
import AnalyticsSection from './_sections/AnalyticsSection'
import StatsCards from './_sections/StatsCards'
import BookingDetailsDialog, { BookingLite } from './_sections/BookingDetailsDialog'
import { ServiceProvider, Service, Booking, CreateServiceForm, ServiceCategory } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { useNotifications } from '@/contexts/notifications-context'
import { bookingApi } from '@/lib/bookings'
import { providerApi } from '@/lib/providers'
import { serviceApi } from '@/lib/services'
import { uploadCoverImage, uploadProfilePicture, getPublicUrl, validateFile } from '@/lib/storage'
import { geocodeAddress } from '@/lib/geocoding'
import AddressAutocomplete from '@/components/address-autocomplete'


export default function ProviderDashboard() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const pathname = usePathname()
  const router = useRouter()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showCompleteProfile, setShowCompleteProfile] = useState(false)
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [profileForm, setProfileForm] = useState({
    businessDescription: '',
    priceRange: { min: '', max: '' },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    certifications: [] as string[],
    experience: '',
    serviceAreas: [] as string[]
  })
  const [serviceForm, setServiceForm] = useState<CreateServiceForm>({
    category: 'grooming',
    name: '',
    description: '',
    price: 0,
    duration: 60,
    maxPets: 1,
    requirements: [],
    includes: [],
    images: []
  })
  const [serviceFormLoading, setServiceFormLoading] = useState(false)
  const [editProfileForm, setEditProfileForm] = useState({
    businessName: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    coordinates: { lat: 0, lng: 0 },
    experience: '',
    priceRange: { min: '', max: '' },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    certifications: [] as string[],
    coverImage: null as File | null,
    profilePicture: null as File | null,
    galleryImages: [] as File[]
  })
  const [editProfileLoading, setEditProfileLoading] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)
  const currentTab = useMemo(() => {
    const parts = (pathname || '').split('/').filter(Boolean)
    const dashboardIndex = parts.indexOf('dashboard')
    const seg = dashboardIndex >= 0 ? parts[dashboardIndex + 1] : ''
    const allowed = ['calendar', 'bookings', 'services', 'profile', 'analytics']
    return allowed.includes(seg) ? seg : 'calendar'
  }, [pathname])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        if (user?.id) {
          // Load provider data from database
          const providerData = await providerApi.getProviderByUserId(user.id)
          
          if (providerData) {
            // Convert database format to our ServiceProvider type
            const serviceProvider: ServiceProvider = {
              id: providerData.id,
              userId: providerData.user_id,
              businessName: providerData.business_name,
              description: providerData.description || '',
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
                max: providerData.price_range?.max || 0
              },
              availability: providerData.availability || {},
              images: providerData.images || [],
              certifications: providerData.certifications || [],
              experience: providerData.experience_years || 0,
              status: providerData.status || 'active',
              createdAt: providerData.created_at,
              updatedAt: providerData.updated_at
            }
            
            setProvider(serviceProvider)
            setShowCompleteProfile(false)
          } else {
            // No provider profile found, show complete profile section
            setProvider(null)
            setShowCompleteProfile(true)
          }
          
          // Load services from database
          if (providerData) {
            const providerServices = await serviceApi.getServicesByProvider(providerData.id)
            setServices(providerServices)
          }
          
          // TODO: Load bookings from API
          // const providerBookings = await bookingApi.getProviderBookings(user.id)
          setBookings([])
        }
        
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load dashboard data. Please try again.'
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user, addNotification])

  const handleViewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowBookingModal(true)
  }


  const handleAcceptBooking = async (bookingId: string) => {
    try {
      // Update booking status via API
      const updatedBooking = await bookingApi.acceptBooking(bookingId)
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ))
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Booking Accepted',
        message: 'The booking has been successfully accepted.'
      })
    } catch (error) {
      console.error('Error accepting booking:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to accept booking. Please try again.'
      })
    }
  }

  const handleRejectBooking = async (bookingId: string) => {
    try {
      // Update booking status via API
      const updatedBooking = await bookingApi.rejectBooking(bookingId, 'Booking rejected by provider')
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ))
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Booking Rejected',
        message: 'The booking has been rejected.'
      })
    } catch (error) {
      console.error('Error rejecting booking:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to reject booking. Please try again.'
      })
    }
  }

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      // Update booking status via API
      const updatedBooking = await bookingApi.completeBooking(bookingId)
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ))
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Booking Completed',
        message: 'The booking has been marked as completed.'
      })
    } catch (error) {
      console.error('Error completing booking:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to complete booking. Please try again.'
      })
    }
  }

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()
    setServiceFormLoading(true)

    try {
      if (!provider?.id) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Provider profile not found'
        })
        return
      }

      // Get the provider's service category from their profile
      const providerCategory = provider.services?.[0] || 'grooming'
      
      // Create service in database
      const newService = await serviceApi.createService({
        providerId: provider.id,
        category: providerCategory as ServiceCategory,
        name: serviceForm.name,
        description: serviceForm.description,
        price: serviceForm.price,
        duration: serviceForm.duration,
        maxPets: serviceForm.maxPets,
        requirements: serviceForm.requirements,
        includes: serviceForm.includes,
        images: []
      })

      // Convert database format to our Service type
      const service: Service = {
        id: newService.id,
        providerId: newService.provider_id,
        category: newService.category,
        name: newService.name,
        description: newService.description,
        price: newService.price,
        duration: newService.duration_minutes,
        maxPets: newService.max_pets,
        requirements: newService.requirements,
        includes: newService.includes,
        images: newService.images,
        status: newService.is_active ? 'active' : 'inactive',
        createdAt: newService.created_at,
        updatedAt: newService.updated_at
      }

      // Update local state
      setServices(prev => [...prev, service])
      
      // Reset form
      setServiceForm({
        category: 'grooming',
        name: '',
        description: '',
        price: 0,
        duration: 60,
        maxPets: 1,
        requirements: [],
        includes: [],
        images: []
      })
      
      // Close modal
      setShowAddServiceModal(false)
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Service Created',
        message: 'Your service has been created successfully!'
      })
    } catch (error) {
      console.error('Error creating service:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create service. Please try again.'
      })
    } finally {
      setServiceFormLoading(false)
    }
  }

  const handleServiceFormChange = (field: keyof CreateServiceForm, value: string | number | string[]) => {
    setServiceForm(prev => ({ ...prev, [field]: value }))
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setServiceForm({
      category: service.category,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      maxPets: service.maxPets,
      requirements: service.requirements || [],
      includes: service.includes || [],
      images: []
    })
    setShowEditServiceModal(true)
  }

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault()
    setServiceFormLoading(true)

    try {
      if (!editingService) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No service selected for editing'
        })
        return
      }

      // Update service in database
      const updatedService = await serviceApi.updateService(editingService.id, {
        name: serviceForm.name,
        description: serviceForm.description,
        price: serviceForm.price,
        duration: serviceForm.duration,
        maxPets: serviceForm.maxPets,
        requirements: serviceForm.requirements,
        includes: serviceForm.includes,
        images: [] // TODO: Handle file uploads
      })

      // Convert database format to our Service type
      const service: Service = {
        id: updatedService.id,
        providerId: updatedService.provider_id,
        category: updatedService.category,
        name: updatedService.name,
        description: updatedService.description,
        price: updatedService.price,
        duration: updatedService.duration_minutes,
        maxPets: updatedService.max_pets,
        requirements: updatedService.requirements,
        includes: updatedService.includes,
        images: updatedService.images,
        status: updatedService.is_active ? 'active' : 'inactive',
        createdAt: updatedService.created_at,
        updatedAt: updatedService.updated_at
      }

      // Update local state
      setServices(prev => prev.map(s => s.id === editingService.id ? service : s))
      
      // Reset form and close modal
      setEditingService(null)
      setShowEditServiceModal(false)
      setServiceForm({
        category: 'grooming',
        name: '',
        description: '',
        price: 0,
        duration: 60,
        maxPets: 1,
        requirements: [],
        includes: [],
        images: []
      })
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Service Updated',
        message: 'Your service has been updated successfully!'
      })
    } catch (error) {
      console.error('Error updating service:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update service. Please try again.'
      })
    } finally {
      setServiceFormLoading(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return
    }

    try {
      await serviceApi.deleteService(serviceId)
      
      // Update local state
      setServices(prev => prev.filter(s => s.id !== serviceId))
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Service Deleted',
        message: 'Your service has been deleted successfully.'
      })
    } catch (error) {
      console.error('Error deleting service:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete service. Please try again.'
      })
    }
  }

  const handleOpenEditProfile = () => {
    if (provider) {
      setEditProfileForm({
        businessName: provider.businessName || '',
        description: provider.description || '',
        phone: provider.location?.address || '', // This should be contact info
        email: user?.email || '',
        address: provider.location?.address || '',
        city: provider.location?.city || '',
        state: provider.location?.state || '',
        zipCode: provider.location?.zipCode || '',
        coordinates: {
          lat: provider.location?.coordinates?.lat || 0,
          lng: provider.location?.coordinates?.lng || 0
        },
        experience: provider.experience?.toString() || '',
        priceRange: {
          min: provider.priceRange?.min?.toString() || '',
          max: provider.priceRange?.max?.toString() || ''
        },
        availability: {
          monday: Array.isArray(provider.availability?.monday) ? provider.availability.monday.length > 0 : provider.availability?.monday || true,
          tuesday: Array.isArray(provider.availability?.tuesday) ? provider.availability.tuesday.length > 0 : provider.availability?.tuesday || true,
          wednesday: Array.isArray(provider.availability?.wednesday) ? provider.availability.wednesday.length > 0 : provider.availability?.wednesday || true,
          thursday: Array.isArray(provider.availability?.thursday) ? provider.availability.thursday.length > 0 : provider.availability?.thursday || true,
          friday: Array.isArray(provider.availability?.friday) ? provider.availability.friday.length > 0 : provider.availability?.friday || true,
          saturday: Array.isArray(provider.availability?.saturday) ? provider.availability.saturday.length > 0 : provider.availability?.saturday || false,
          sunday: Array.isArray(provider.availability?.sunday) ? provider.availability.sunday.length > 0 : provider.availability?.sunday || false
        },
        certifications: provider.certifications || [],
        coverImage: null,
        profilePicture: null,
        galleryImages: []
      })
    }
    setShowEditProfileModal(true)
  }

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditProfileLoading(true)

    try {
      if (!user?.id || !provider?.id) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'User or provider not found'
        })
        return
      }

      let coverImageUrl = provider.images?.[0] || ''
      let profilePictureUrl = provider.avatarUrl || ''

      // Handle cover image upload if a new file is selected
      if (editProfileForm.coverImage) {
        // Validate the file
        const validation = validateFile(editProfileForm.coverImage, 5)
        if (!validation.valid) {
          addNotification({
            type: 'error',
            title: 'Invalid File',
            message: validation.error || 'Please select a valid image file'
          })
          return
        }

        // Upload the image
        const uploadResult = await uploadCoverImage(editProfileForm.coverImage, provider.id)
        if (uploadResult.error) {
          addNotification({
            type: 'error',
            title: 'Upload Failed',
            message: 'Failed to upload cover image. Please try again.'
          })
          return
        }

        // Get the public URL
        coverImageUrl = getPublicUrl('profile-images', uploadResult.data!.path)
      }

      // Handle profile picture upload if a new file is selected
      if (editProfileForm.profilePicture) {
        // Validate the file
        const validation = validateFile(editProfileForm.profilePicture, 5)
        if (!validation.valid) {
          addNotification({
            type: 'error',
            title: 'Invalid File',
            message: validation.error || 'Please select a valid image file'
          })
          return
        }

        // Upload the image
        const uploadResult = await uploadProfilePicture(editProfileForm.profilePicture, provider.id)
        if (uploadResult.error) {
          addNotification({
            type: 'error',
            title: 'Upload Failed',
            message: 'Failed to upload profile picture. Please try again.'
          })
          return
        }

        // Get the public URL
        profilePictureUrl = getPublicUrl('profile-images', uploadResult.data!.path)
      }

      // Handle gallery images upload
      const galleryImageUrls: string[] = []
      if (editProfileForm.galleryImages.length > 0) {
        for (const file of editProfileForm.galleryImages) {
          // Validate the file
          const validation = validateFile(file, 5)
          if (!validation.valid) {
            addNotification({
              type: 'error',
              title: 'Invalid File',
              message: validation.error || 'Please select valid image files'
            })
            return
          }

          // Upload the image
          const uploadResult = await uploadCoverImage(file, provider.id)
          if (uploadResult.error) {
            addNotification({
              type: 'error',
              title: 'Upload Failed',
              message: 'Failed to upload gallery image. Please try again.'
            })
            return
          }

          // Get the public URL
          galleryImageUrls.push(getPublicUrl('profile-images', uploadResult.data!.path))
        }
      }

      // Prepare update data
      const updateData = {
        businessName: editProfileForm.businessName,
        description: editProfileForm.description,
        location: {
          address: editProfileForm.address,
          city: editProfileForm.city,
          state: editProfileForm.state,
          zip: editProfileForm.zipCode,
          coordinates: {
            lat: editProfileForm.coordinates.lat,
            lng: editProfileForm.coordinates.lng
          }
        },
        contactInfo: {
          phone: editProfileForm.phone,
          email: editProfileForm.email
        },
        priceRange: {
          min: parseFloat(editProfileForm.priceRange.min),
          max: parseFloat(editProfileForm.priceRange.max),
          currency: 'EUR'
        },
        availability: editProfileForm.availability,
        certifications: editProfileForm.certifications,
        experienceYears: parseInt(editProfileForm.experience) || 0,
        images: [...(coverImageUrl ? [coverImageUrl] : []), ...galleryImageUrls],
        avatarUrl: profilePictureUrl
      }

      // Update provider in database
      const updatedProvider = await providerApi.updateProvider(provider.id, updateData)
      
      // Update local state
      const serviceProvider: ServiceProvider = {
        id: updatedProvider.id,
        userId: updatedProvider.user_id,
        businessName: updatedProvider.business_name,
        description: updatedProvider.description || '',
        services: updatedProvider.services || [],
        location: {
          address: updatedProvider.location?.address || '',
          city: updatedProvider.location?.city || '',
          state: updatedProvider.location?.state || '',
          zipCode: updatedProvider.location?.zip || '',
          coordinates: {
            lat: updatedProvider.location?.coordinates?.lat || 0,
            lng: updatedProvider.location?.coordinates?.lng || 0
          }
        },
        rating: updatedProvider.rating || 0,
        reviewCount: updatedProvider.review_count || 0,
        priceRange: {
          min: updatedProvider.price_range?.min || 0,
          max: updatedProvider.price_range?.max || 0
        },
        availability: updatedProvider.availability || {},
        images: updatedProvider.images || [],
        certifications: updatedProvider.certifications || [],
        experience: updatedProvider.experience_years || 0,
        status: updatedProvider.status || 'active',
        createdAt: updatedProvider.created_at,
        updatedAt: updatedProvider.updated_at
      }
      
      setProvider(serviceProvider)
      setShowEditProfileModal(false)
      
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your business profile has been updated successfully!'
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update profile. Please try again.'
      })
    } finally {
      setEditProfileLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Layout hideServiceCategories={true}>
        <ProtectedRoute requiredRole="provider">
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  return (
    <Layout hideServiceCategories={true}>
      <ProtectedRoute requiredRole="provider">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header - dynamic per section; show only on main dashboard sections */}
            {currentTab === 'calendar' && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('providerDashboard.calendar')}</h1>
                <p className="text-gray-600">{t('calendarHeader.manageAvailability', 'Tvarkykite savo prieinamumą')}</p>
              </div>
            )}
            {currentTab === 'bookings' && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('providerDashboard.bookings')}</h1>
                <p className="text-gray-600">{t('bookings.subtitle')}</p>
              </div>
            )}
            {currentTab === 'services' && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('providerDashboard.services')}</h1>
                <p className="text-gray-600">{t('providerDashboard.manageServices', 'Kurkite ir valdykite savo paslaugas')}</p>
              </div>
            )}
            {currentTab === 'profile' && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('providerDashboard.profile')}</h1>
                <p className="text-gray-600">{t('profile.subtitle')}</p>
              </div>
            )}
            {currentTab === 'analytics' && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('providerDashboard.analytics')}</h1>
                <p className="text-gray-600">{t('providerDashboard.analyticsSubtitle', 'Verslo našumo rodikliai')}</p>
              </div>
            )}

            {/* Complete Profile Section */}
            {showCompleteProfile && (
              <div className="mb-8">
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-orange-900 mb-2">
                          Complete Your Provider Profile
                        </h3>
                        <p className="text-orange-800 mb-4">
                          Add the missing information to start accepting bookings and grow your business.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm text-orange-800">Business description and services</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm text-orange-800">Pricing and availability</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm text-orange-800">Service areas and contact info</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm text-orange-800">Certifications and experience</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button 
                          onClick={() => setShowCompleteProfileModal(true)}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          Complete Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Stats Cards - only on main dashboard (calendar) */}
            {currentTab === 'calendar' && (
              <StatsCards bookings={bookings as any} provider={provider} />
            )}

            {/* Main Content */}
            <Tabs value={currentTab} className="space-y-6" onValueChange={(val) => router.push(`/provider/dashboard/${val}`)}>
              <TabsList className="hidden" />

              <TabsContent value="calendar" className="space-y-6">
                {provider ? (
                  <AvailabilityCalendar 
                    provider={provider}
                    onAvailabilityUpdate={async (updatedAvailability) => {
                      try {
                        // Convert DayAvailability to DB format
                        const dbAvailability: Record<string, boolean> = {}
                        Object.entries(updatedAvailability).forEach(([day, value]) => {
                          if (typeof value === 'boolean') {
                            dbAvailability[day] = value
                          } else if (Array.isArray(value)) {
                            dbAvailability[day] = value.length > 0
                          } else if (typeof value === 'object' && value !== null) {
                            dbAvailability[day] = true
                          } else {
                            dbAvailability[day] = Boolean(value)
                          }
                        })

                        await providerApi.updateProvider(provider.id, {
                          availability: dbAvailability
                        })

                        const convertedAvailability = {
                          monday: Array.isArray(updatedAvailability.monday) ? updatedAvailability.monday : [],
                          tuesday: Array.isArray(updatedAvailability.tuesday) ? updatedAvailability.tuesday : [],
                          wednesday: Array.isArray(updatedAvailability.wednesday) ? updatedAvailability.wednesday : [],
                          thursday: Array.isArray(updatedAvailability.thursday) ? updatedAvailability.thursday : [],
                          friday: Array.isArray(updatedAvailability.friday) ? updatedAvailability.friday : [],
                          saturday: Array.isArray(updatedAvailability.saturday) ? updatedAvailability.saturday : [],
                          sunday: Array.isArray(updatedAvailability.sunday) ? updatedAvailability.sunday : []
                        }

                        setProvider(prev => prev ? { ...prev, availability: convertedAvailability } : null)
                      } catch (error) {
                        console.error('Error updating availability:', error)
                        addNotification({
                          type: 'error',
                          title: 'Error',
                          message: 'Failed to update availability. Please try again.'
                        })
                      }
                    }}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Complete your profile first</h3>
                    <p className="text-gray-600">You need to complete your provider profile before managing availability.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bookings" className="space-y-6">
                <BookingsSection
                  bookings={bookings as any}
                  services={services as any}
                  onView={(b) => handleViewBookingDetails(b as any)}
                  onAccept={handleAcceptBooking}
                  onReject={handleRejectBooking}
                  onComplete={handleCompleteBooking}
                />
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <ServicesSection
                  services={services as any}
                  onAdd={() => setShowAddServiceModal(true)}
                  onEdit={handleEditService as any}
                  onDelete={handleDeleteService}
                />
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <Card className="overflow-hidden py-0">
                  {/* Cover Image Section */}
                  <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                    {provider?.images && provider.images.length > 0 ? (
                      <Image 
                        src={provider.images[0]} 
                        alt="Business cover" 
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white">
                          <PawPrint className="h-16 w-16 mx-auto mb-2 opacity-50" />
                          <p className="text-lg font-medium">No cover image</p>
                          <p className="text-sm opacity-75">Add a cover image to make your profile stand out</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={handleOpenEditProfile}
                        className="bg-white/90 hover:bg-white"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Cover
                      </Button>
                    </div>
                  </div>

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">{provider?.businessName || 'My Business'}</CardTitle>
                        <CardDescription className="mt-2">
                          {provider?.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <Button onClick={handleOpenEditProfile} variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Business Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <MapPin className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Location</p>
                              <p className="text-sm text-gray-600">
                                {provider?.location.city && provider?.location.state 
                                  ? `${provider.location.city}, ${provider.location.state}`
                                  : 'Not specified'
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Clock className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Experience</p>
                              <p className="text-sm text-gray-600">{provider?.experience || 0} years</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                              <Star className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Rating</p>
                              <p className="text-sm text-gray-600">{provider?.rating || 0} stars</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <DollarSign className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Price Range</p>
                              <p className="text-sm text-gray-600">
                                €{provider?.priceRange.min || 0} - €{provider?.priceRange.max || 0}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <Phone className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Contact</p>
                              <p className="text-sm text-gray-600">{user?.email || 'Not provided'}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                              <Users className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Reviews</p>
                              <p className="text-sm text-gray-600">{provider?.reviewCount || 0} reviews</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {provider?.certifications && provider.certifications.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Certifications</h4>
                          <div className="flex flex-wrap gap-2">
                            {provider.certifications.map((cert, index) => (
                              <Badge key={index} variant="secondary">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Availability</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(provider?.availability || {}).map(([day, available]) => (
                            <div key={day} className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${available ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className="text-sm capitalize">{day}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <AnalyticsSection />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Booking Details Modal */}
        <BookingDetailsDialog
          open={showBookingModal}
          booking={selectedBooking as unknown as BookingLite}
          services={services}
          onClose={() => setShowBookingModal(false)}
          onAccept={(id) => { handleAcceptBooking(id); setShowBookingModal(false) }}
          onReject={(id) => { handleRejectBooking(id); setShowBookingModal(false) }}
          onComplete={(id) => { handleCompleteBooking(id); setShowBookingModal(false) }}
        />

        {/* Complete Profile Modal */}
        <Dialog open={showCompleteProfileModal} onOpenChange={setShowCompleteProfileModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Complete Your Provider Profile</DialogTitle>
              <DialogDescription>
                Fill out your business information to start accepting bookings and grow your business.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Almost there!</h4>
                <p className="text-sm text-blue-800">
                  Complete these final details to start accepting bookings and grow your business.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="businessDescription">Business Description *</Label>
                  <Textarea
                    id="businessDescription"
                    value={profileForm.businessDescription}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, businessDescription: e.target.value }))}
                    placeholder="Tell customers about your business and services..."
                    className="mt-1"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Select 
                    value={profileForm.experience} 
                    onValueChange={(value) => setProfileForm(prev => ({ ...prev, experience: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Price Range (per service) *</Label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div>
                    <Input
                      type="number"
                      placeholder="Min price ($)"
                      value={profileForm.priceRange.min}
                      onChange={(e) => setProfileForm(prev => ({ 
                        ...prev, 
                        priceRange: { ...prev.priceRange, min: e.target.value } 
                      }))}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Max price ($)"
                      value={profileForm.priceRange.max}
                      onChange={(e) => setProfileForm(prev => ({ 
                        ...prev, 
                        priceRange: { ...prev.priceRange, max: e.target.value } 
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Availability *</Label>
                <p className="text-sm text-gray-600 mb-3">Select the days you're available</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(profileForm.availability).map(([day, available]) => (
                    <div key={day} className="flex items-center space-x-3">
                      <Checkbox
                        checked={available}
                        onCheckedChange={(checked) => 
                          setProfileForm(prev => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              [day]: checked
                            }
                          }))
                        }
                      />
                      <span className="capitalize font-medium">{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Certifications (Optional)</Label>
                <p className="text-sm text-gray-600 mb-3">Add any relevant certifications</p>
                <div className="space-y-2">
                  <Input placeholder="Certification name" />
                  <Button variant="outline" size="sm">Add Certification</Button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowCompleteProfileModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      if (!user?.id) {
                        addNotification({
                          type: 'error',
                          title: 'Error',
                          message: 'User not authenticated'
                        })
                        return
                      }

                      // Get user data from auth context
                      const userEmail = user.email || ''

                      // Create provider data
                      const providerData = {
                        userId: user.id,
                        businessName: user.user_metadata?.business_name || 'My Business',
                        businessType: 'individual',
                        description: profileForm.businessDescription,
                        services: [user.user_metadata?.service_type || 'grooming'],
                        location: {
                          address: user.user_metadata?.address || '',
                          city: user.user_metadata?.city || '',
                          state: user.user_metadata?.state || '',
                          zip: user.user_metadata?.zip_code || '',
                          coordinates: {
                            lat: 0, // Will be updated with geocoding
                            lng: 0
                          }
                        },
                        contactInfo: {
                          phone: user.user_metadata?.phone || '',
                          email: userEmail
                        },
                        businessHours: {
                          monday: { start: '09:00', end: '17:00', available: profileForm.availability.monday },
                          tuesday: { start: '09:00', end: '17:00', available: profileForm.availability.tuesday },
                          wednesday: { start: '09:00', end: '17:00', available: profileForm.availability.wednesday },
                          thursday: { start: '09:00', end: '17:00', available: profileForm.availability.thursday },
                          friday: { start: '09:00', end: '17:00', available: profileForm.availability.friday },
                          saturday: { start: '09:00', end: '17:00', available: profileForm.availability.saturday },
                          sunday: { start: '09:00', end: '17:00', available: profileForm.availability.sunday }
                        },
                        priceRange: {
                          min: parseFloat(profileForm.priceRange.min),
                          max: parseFloat(profileForm.priceRange.max),
                          currency: 'EUR'
                        },
                        availability: profileForm.availability,
                        certifications: profileForm.certifications,
                        experienceYears: parseInt(profileForm.experience.split('-')[0]) || 0
                      }

                      // Geocode the address to get proper coordinates
                      const fullAddress = `${providerData.location.address}, ${providerData.location.city}, ${providerData.location.state}, ${providerData.location.zip}`
                      const geocodingResult = await geocodeAddress(fullAddress)
                      
                      if ('lat' in geocodingResult && 'lng' in geocodingResult) {
                        // Update coordinates with geocoded values
                        providerData.location.coordinates.lat = geocodingResult.lat
                        providerData.location.coordinates.lng = geocodingResult.lng
                        
                        // Update address components with geocoded values if they're more accurate
                        if (geocodingResult.city) providerData.location.city = geocodingResult.city
                        if (geocodingResult.state) providerData.location.state = geocodingResult.state
                        if (geocodingResult.zipCode) providerData.location.zip = geocodingResult.zipCode
                        if (geocodingResult.address) providerData.location.address = geocodingResult.address
                      } else {
                        console.warn('Geocoding failed:', geocodingResult.message)
                        addNotification({
                          type: 'warning',
                          title: 'Geocoding Warning',
                          message: 'Address geocoding failed. Location may not be accurate on the map.'
                        })
                      }

                      // Save to database
                      const newProvider = await providerApi.createProvider(providerData)
                      
                      // Update local state
                      const serviceProvider: ServiceProvider = {
                        id: newProvider.id,
                        userId: newProvider.user_id,
                        businessName: newProvider.business_name,
                        description: newProvider.description || '',
                        services: newProvider.services || [],
                        location: {
                          address: newProvider.location?.address || '',
                          city: newProvider.location?.city || '',
                          state: newProvider.location?.state || '',
                          zipCode: newProvider.location?.zip || '',
                          coordinates: {
                            lat: newProvider.location?.coordinates?.lat || 0,
                            lng: newProvider.location?.coordinates?.lng || 0
                          }
                        },
                        rating: newProvider.rating || 0,
                        reviewCount: newProvider.review_count || 0,
                        priceRange: {
                          min: newProvider.price_range?.min || 0,
                          max: newProvider.price_range?.max || 0
                        },
                        availability: newProvider.availability || {},
                        images: newProvider.images || [],
                        certifications: newProvider.certifications || [],
                        experience: newProvider.experience_years || 0,
                        status: newProvider.status || 'active',
                        createdAt: newProvider.created_at,
                        updatedAt: newProvider.updated_at
                      }
                      
                      setProvider(serviceProvider)
                      setShowCompleteProfileModal(false)
                      setShowCompleteProfile(false)
                      
                      addNotification({
                        type: 'success',
                        title: 'Profile Created',
                        message: 'Your provider profile has been created successfully!'
                      })
                    } catch (error) {
                      console.error('Error creating provider profile:', error)
                      addNotification({
                        type: 'error',
                        title: 'Error',
                        message: 'Failed to create provider profile. Please try again.'
                      })
                    }
                  }}
                  disabled={!profileForm.businessDescription || !profileForm.experience || !profileForm.priceRange.min || !profileForm.priceRange.max}
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Service Modal */}
        <Dialog open={showAddServiceModal} onOpenChange={setShowAddServiceModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Create a new service offering for your customers to book.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateService} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceName">Service Name *</Label>
                  <Input
                    id="serviceName"
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => handleServiceFormChange('name', e.target.value)}
                    placeholder="e.g., Dog Grooming, Pet Sitting"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="serviceCategory">Service Category</Label>
                  <Input
                    id="serviceCategory"
                    type="text"
                    value={provider?.services?.[0] ? provider.services[0].charAt(0).toUpperCase() + provider.services[0].slice(1) : 'Grooming'}
                    disabled
                    className="mt-1 bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Category is set based on your provider profile</p>
                </div>
              </div>

              <div>
                <Label htmlFor="serviceDescription">Service Description *</Label>
                <Textarea
                  id="serviceDescription"
                  value={serviceForm.description}
                  onChange={(e) => handleServiceFormChange('description', e.target.value)}
                  placeholder="Describe what your service includes and what makes it special..."
                  className="mt-1"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="servicePrice">Price ($) *</Label>
                  <Input
                    id="servicePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => handleServiceFormChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="serviceDuration">Duration (minutes) *</Label>
                  <Input
                    id="serviceDuration"
                    type="number"
                    min="15"
                    step="15"
                    value={serviceForm.duration}
                    onChange={(e) => handleServiceFormChange('duration', parseInt(e.target.value) || 60)}
                    placeholder="60"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maxPets">Max Pets *</Label>
                  <Input
                    id="maxPets"
                    type="number"
                    min="1"
                    value={serviceForm.maxPets}
                    onChange={(e) => handleServiceFormChange('maxPets', parseInt(e.target.value) || 1)}
                    placeholder="1"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Service Includes (Optional)</Label>
                <p className="text-sm text-gray-600 mb-3">What's included in this service?</p>
                <div className="space-y-2">
                  <Input 
                    placeholder="e.g., Bath, Nail trimming, Ear cleaning"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value && !serviceForm.includes?.includes(value)) {
                          handleServiceFormChange('includes', [...(serviceForm.includes || []), value])
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                  {serviceForm.includes && serviceForm.includes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {serviceForm.includes.map((item, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {item}
                          <button
                            type="button"
                            onClick={() => {
                              const newIncludes = serviceForm.includes?.filter((_, i) => i !== index) || []
                              handleServiceFormChange('includes', newIncludes)
                            }}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Requirements (Optional)</Label>
                <p className="text-sm text-gray-600 mb-3">Any special requirements for this service?</p>
                <div className="space-y-2">
                  <Input 
                    placeholder="e.g., Up-to-date vaccinations, Pet must be friendly"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value && !serviceForm.requirements?.includes(value)) {
                          handleServiceFormChange('requirements', [...(serviceForm.requirements || []), value])
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                  {serviceForm.requirements && serviceForm.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {serviceForm.requirements.map((item, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {item}
                          <button
                            type="button"
                            onClick={() => {
                              const newRequirements = serviceForm.requirements?.filter((_, i) => i !== index) || []
                              handleServiceFormChange('requirements', newRequirements)
                            }}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Ready to Launch!</h4>
                <p className="text-sm text-blue-800">
                  Once you create this service, it will be available for customers to book immediately.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddServiceModal(false)}
                  disabled={serviceFormLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={serviceFormLoading || !serviceForm.name || !serviceForm.description || serviceForm.price <= 0}
                >
                  {serviceFormLoading ? 'Creating Service...' : 'Create Service'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Modal */}
        <Dialog open={showEditProfileModal} onOpenChange={setShowEditProfileModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Business Profile</DialogTitle>
              <DialogDescription>
                Update your business information and profile details.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleEditProfile} className="space-y-6">
              {/* Cover Image Upload */}
              <div>
                <Label>Cover Image</Label>
                <p className="text-sm text-gray-600 mb-3">Upload a cover image for your business profile</p>
                
                {/* Show current cover image if exists */}
                {provider?.images?.[0] && !editProfileForm.coverImage && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Current cover image:</p>
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={provider.images[0]}
                        alt="Current cover image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {/* Show preview of new cover image */}
                {editProfileForm.coverImage && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">New cover image preview:</p>
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={URL.createObjectURL(editProfileForm.coverImage)}
                        alt="Cover image preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditProfileForm(prev => ({ ...prev, coverImage: null }))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setEditProfileForm(prev => ({ ...prev, coverImage: file }))
                      }
                    }}
                    className="hidden"
                    id="cover-image-upload"
                  />
                  <label htmlFor="cover-image-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">
                        {editProfileForm.coverImage ? 'Click to change cover image' : 'Click to upload cover image'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div>
                <Label>Profile Picture</Label>
                <p className="text-sm text-gray-600 mb-3">Upload a profile picture for your business</p>
                
                {/* Show current profile picture if exists */}
                {provider?.avatarUrl && !editProfileForm.profilePicture && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Current profile picture:</p>
                    <div className="relative w-24 h-24 bg-gray-100 rounded-full overflow-hidden">
                      <Image
                        src={provider.avatarUrl}
                        alt="Current profile picture"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {/* Show preview of new profile picture */}
                {editProfileForm.profilePicture && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">New profile picture preview:</p>
                    <div className="relative w-24 h-24 bg-gray-100 rounded-full overflow-hidden">
                      <Image
                        src={URL.createObjectURL(editProfileForm.profilePicture)}
                        alt="Profile picture preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditProfileForm(prev => ({ ...prev, profilePicture: null }))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setEditProfileForm(prev => ({ ...prev, profilePicture: file }))
                      }
                    }}
                    className="hidden"
                    id="profile-picture-upload"
                  />
                  <label htmlFor="profile-picture-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">
                        {editProfileForm.profilePicture ? 'Click to change profile picture' : 'Click to upload profile picture'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Gallery Images Upload */}
              <div>
                <Label>Gallery Images</Label>
                <p className="text-sm text-gray-600 mb-3">Upload additional images to showcase your business (up to 10 images)</p>
                
                {/* Show current gallery images if exist */}
                {provider?.images && provider.images.length > 1 && editProfileForm.galleryImages.length === 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Current gallery images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {provider.images.slice(1).map((image, index) => (
                        <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={image}
                            alt={`Current gallery image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      if (files.length > 0) {
                        setEditProfileForm(prev => ({ 
                          ...prev, 
                          galleryImages: [...prev.galleryImages, ...files].slice(0, 10) // Limit to 10 images
                        }))
                      }
                    }}
                    className="hidden"
                    id="gallery-images-upload"
                  />
                  <label htmlFor="gallery-images-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">
                        {editProfileForm.galleryImages.length > 0 
                          ? `${editProfileForm.galleryImages.length} new image(s) selected` 
                          : 'Click to upload new gallery images'
                        }
                      </p>
                    </div>
                  </label>
                </div>
                
                {/* Show selected gallery images */}
                {editProfileForm.galleryImages.length > 0 && (
                  <div className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {editProfileForm.galleryImages.map((file, index) => (
                        <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Gallery image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEditProfileForm(prev => ({
                                ...prev,
                                galleryImages: prev.galleryImages.filter((_, i) => i !== index)
                              }))
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="editBusinessName">Business Name *</Label>
                  <Input
                    id="editBusinessName"
                    type="text"
                    value={editProfileForm.businessName}
                    onChange={(e) => setEditProfileForm(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Enter your business name"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="editExperience">Years of Experience *</Label>
                  <Input
                    id="editExperience"
                    type="number"
                    min="0"
                    value={editProfileForm.experience}
                    onChange={(e) => setEditProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="0"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editDescription">Business Description *</Label>
                <Textarea
                  id="editDescription"
                  value={editProfileForm.description}
                  onChange={(e) => setEditProfileForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your business and services..."
                  className="mt-1"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="editPhone">Phone Number</Label>
                  <Input
                    id="editPhone"
                    type="tel"
                    value={editProfileForm.phone}
                    onChange={(e) => setEditProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="editEmail">Email Address</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editProfileForm.email}
                    onChange={(e) => setEditProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>
              </div>

              <AddressAutocomplete
                value={editProfileForm.address}
                onChange={(address) => setEditProfileForm(prev => ({ ...prev, address }))}
                onAddressSelect={(suggestion) => {
                  setEditProfileForm(prev => ({
                    ...prev,
                    address: suggestion.address,
                    city: suggestion.city,
                    state: suggestion.state,
                    zipCode: suggestion.zipCode,
                    coordinates: {
                      lat: suggestion.coordinates.lat,
                      lng: suggestion.coordinates.lng
                    }
                  }))
                }}
                placeholder="Enter your business address"
                label="Business Address"
                className="mt-1"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editCity">City</Label>
                  <Input
                    id="editCity"
                    type="text"
                    value={editProfileForm.city}
                    onChange={(e) => setEditProfileForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="editState">State/Region</Label>
                  <Input
                    id="editState"
                    type="text"
                    value={editProfileForm.state}
                    onChange={(e) => setEditProfileForm(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State/Region"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="editZipCode">Postal Code</Label>
                  <Input
                    id="editZipCode"
                    type="text"
                    value={editProfileForm.zipCode}
                    onChange={(e) => setEditProfileForm(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="Postal Code"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Price Range (per service) *</Label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div>
                    <Input
                      type="number"
                      placeholder="Min price ($)"
                      value={editProfileForm.priceRange.min}
                      onChange={(e) => setEditProfileForm(prev => ({ 
                        ...prev, 
                        priceRange: { ...prev.priceRange, min: e.target.value } 
                      }))}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Max price ($)"
                      value={editProfileForm.priceRange.max}
                      onChange={(e) => setEditProfileForm(prev => ({ 
                        ...prev, 
                        priceRange: { ...prev.priceRange, max: e.target.value } 
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Availability section removed - managed via calendar slots */}

              <div>
                <Label>Certifications (Optional)</Label>
                <p className="text-sm text-gray-600 mb-3">Add any relevant certifications</p>
                <div className="space-y-2">
                  <Input 
                    placeholder="Certification name" 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value && !editProfileForm.certifications.includes(value)) {
                          setEditProfileForm(prev => ({
                            ...prev,
                            certifications: [...prev.certifications, value]
                          }))
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                  {editProfileForm.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editProfileForm.certifications.map((cert, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {cert}
                          <button
                            type="button"
                            onClick={() => {
                              setEditProfileForm(prev => ({
                                ...prev,
                                certifications: prev.certifications.filter((_, i) => i !== index)
                              }))
                            }}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditProfileModal(false)}
                  disabled={editProfileLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editProfileLoading || !editProfileForm.businessName || !editProfileForm.description || !editProfileForm.experience}
                >
                  {editProfileLoading ? 'Updating Profile...' : 'Update Profile'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Service Modal */}
        <Dialog open={showEditServiceModal} onOpenChange={setShowEditServiceModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>
                Update the details of your service offering.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUpdateService} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editServiceName">Service Name *</Label>
                  <Input
                    id="editServiceName"
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => handleServiceFormChange('name', e.target.value)}
                    placeholder="e.g., Dog Grooming, Pet Sitting"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="editServiceCategory">Service Category</Label>
                  <Input
                    id="editServiceCategory"
                    type="text"
                    value={provider?.services?.[0] ? provider.services[0].charAt(0).toUpperCase() + provider.services[0].slice(1) : 'Grooming'}
                    disabled
                    className="mt-1 bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Category is set based on your provider profile</p>
                </div>
              </div>

              <div>
                <Label htmlFor="editServiceDescription">Service Description *</Label>
                <Textarea
                  id="editServiceDescription"
                  value={serviceForm.description}
                  onChange={(e) => handleServiceFormChange('description', e.target.value)}
                  placeholder="Describe what your service includes and what makes it special..."
                  className="mt-1"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editServicePrice">Price ($) *</Label>
                  <Input
                    id="editServicePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => handleServiceFormChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="editServiceDuration">Duration (minutes) *</Label>
                  <Input
                    id="editServiceDuration"
                    type="number"
                    min="15"
                    step="15"
                    value={serviceForm.duration}
                    onChange={(e) => handleServiceFormChange('duration', parseInt(e.target.value) || 60)}
                    placeholder="60"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="editMaxPets">Max Pets *</Label>
                  <Input
                    id="editMaxPets"
                    type="number"
                    min="1"
                    value={serviceForm.maxPets}
                    onChange={(e) => handleServiceFormChange('maxPets', parseInt(e.target.value) || 1)}
                    placeholder="1"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Service Includes (Optional)</Label>
                <p className="text-sm text-gray-600 mb-3">What's included in this service?</p>
                <div className="space-y-2">
                  <Input 
                    placeholder="e.g., Bath, Nail trimming, Ear cleaning"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value && !serviceForm.includes?.includes(value)) {
                          handleServiceFormChange('includes', [...(serviceForm.includes || []), value])
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                  {serviceForm.includes && serviceForm.includes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {serviceForm.includes.map((item, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {item}
                          <button
                            type="button"
                            onClick={() => {
                              const newIncludes = serviceForm.includes?.filter((_, i) => i !== index) || []
                              handleServiceFormChange('includes', newIncludes)
                            }}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Requirements (Optional)</Label>
                <p className="text-sm text-gray-600 mb-3">Any special requirements for this service?</p>
                <div className="space-y-2">
                  <Input 
                    placeholder="e.g., Up-to-date vaccinations, Pet must be friendly"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value && !serviceForm.requirements?.includes(value)) {
                          handleServiceFormChange('requirements', [...(serviceForm.requirements || []), value])
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                  {serviceForm.requirements && serviceForm.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {serviceForm.requirements.map((item, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {item}
                          <button
                            type="button"
                            onClick={() => {
                              const newRequirements = serviceForm.requirements?.filter((_, i) => i !== index) || []
                              handleServiceFormChange('requirements', newRequirements)
                            }}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditServiceModal(false)
                    setEditingService(null)
                  }}
                  disabled={serviceFormLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={serviceFormLoading || !serviceForm.name || !serviceForm.description || serviceForm.price <= 0}
                >
                  {serviceFormLoading ? 'Updating Service...' : 'Update Service'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </ProtectedRoute>
    </Layout>
  )
}
