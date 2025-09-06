'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import AvailabilityCalendar from '@/components/availability-calendar'
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
    profilePicture: null as File | null
  })
  const [editProfileLoading, setEditProfileLoading] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)

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
        profilePicture: null
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
        images: coverImageUrl ? [coverImageUrl] : [],
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
      <Layout>
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
    <Layout>
      <ProtectedRoute requiredRole="provider">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Provider Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your services, bookings, and business
              </p>
            </div>

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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => new Date(b.date).toDateString() === new Date().toDateString()).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Customers</p>
                      <p className="text-2xl font-bold text-gray-900">{new Set(bookings.map(b => b.customerId)).size}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-gray-900">${bookings.reduce((sum, b) => sum + b.totalPrice, 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Star className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{provider?.rating || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="calendar" className="space-y-6">
              <TabsList>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Availability</CardTitle>
                    <CardDescription>
                      Manage your availability and time slots for bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {provider ? (
                      <AvailabilityCalendar 
                        provider={provider}
                        onAvailabilityUpdate={async (updatedAvailability) => {
                          try {
                            // Convert DayAvailability to the format expected by the database
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

                            // Update provider availability in database
                            await providerApi.updateProvider(provider.id, {
                              availability: dbAvailability
                            })
                            
                            // Update local state - convert back to ServiceProvider format
                            const convertedAvailability = {
                              monday: Array.isArray(updatedAvailability.monday) ? updatedAvailability.monday : [],
                              tuesday: Array.isArray(updatedAvailability.tuesday) ? updatedAvailability.tuesday : [],
                              wednesday: Array.isArray(updatedAvailability.wednesday) ? updatedAvailability.wednesday : [],
                              thursday: Array.isArray(updatedAvailability.thursday) ? updatedAvailability.thursday : [],
                              friday: Array.isArray(updatedAvailability.friday) ? updatedAvailability.friday : [],
                              saturday: Array.isArray(updatedAvailability.saturday) ? updatedAvailability.saturday : [],
                              sunday: Array.isArray(updatedAvailability.sunday) ? updatedAvailability.sunday : []
                            }
                            
                            setProvider(prev => prev ? {
                              ...prev,
                              availability: convertedAvailability
                            } : null)
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bookings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>
                      Manage your upcoming and past bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                        <p className="text-gray-600">When customers book your services, they'll appear here.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {booking.pet?.name} - {services.find(s => s.id === booking.serviceId)?.name}
                                </h4>
                                <Badge className={getStatusColor(booking.status)}>
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(booking.status)}
                                    <span className="capitalize">{booking.status}</span>
                                  </div>
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>{new Date(booking.date).toLocaleDateString()}</span>
                                <span>{booking.timeSlot.start} - {booking.timeSlot.end}</span>
                                <span>${booking.totalPrice}</span>
                              </div>
                              {booking.notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <strong>Notes:</strong> {booking.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewBookingDetails(booking)}
                              >
                                View Details
                              </Button>
                              {booking.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleAcceptBooking(booking.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Accept
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleRejectBooking(booking.id)}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleCompleteBooking(booking.id)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Mark Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Your Services</CardTitle>
                        <CardDescription>
                          Manage your service offerings
                        </CardDescription>
                      </div>
                      <Button onClick={() => setShowAddServiceModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {services.length === 0 ? (
                      <div className="text-center py-12">
                        <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
                        <p className="text-gray-600">Add your first service to start accepting bookings.</p>
                        <Button className="mt-4" onClick={() => setShowAddServiceModal(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Service
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {services.map((service) => (
                        <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-2">{service.name}</h4>
                              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>€{service.price}</span>
                                <span>{service.duration} min</span>
                                <span>Max {service.maxPets} pet{service.maxPets > 1 ? 's' : ''}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditService(service)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteService(service.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <Card className="overflow-hidden py-0">
                  {/* Cover Image Section */}
                  <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                    {provider?.images && provider.images.length > 0 ? (
                      <img 
                        src={provider.images[0]} 
                        alt="Business cover" 
                        className="w-full h-full object-cover"
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
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>
                      View your business performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="text-gray-500">Analytics dashboard coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Booking Details Modal */}
        <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Booking Details
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBookingModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            {selectedBooking && (
              <div className="space-y-6">
                {/* Booking Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedBooking.status)}
                    <span className="font-medium">Status: </span>
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ${selectedBooking.totalPrice}
                  </div>
                </div>

                {/* Service Information */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-3">Service Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Service</p>
                      <p className="font-medium">
                        {services.find(s => s.id === selectedBooking.serviceId)?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-medium">
                        {new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.timeSlot.start} - {selectedBooking.timeSlot.end}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pet Information */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-3">Pet Information</h3>
                  {selectedBooking.pet ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Pet Name</p>
                          <p className="font-medium">{selectedBooking.pet.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Species</p>
                          <p className="font-medium">{selectedBooking.pet.species}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Breed</p>
                          <p className="font-medium">{selectedBooking.pet.breed || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Age</p>
                          <p className="font-medium">{selectedBooking.pet.age} months</p>
                        </div>
                      </div>
                      {selectedBooking.pet.specialNeeds && selectedBooking.pet.specialNeeds.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">Special Needs</p>
                          <p className="font-medium">{selectedBooking.pet.specialNeeds.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No pet information available</p>
                  )}
                </div>

                {/* Customer Information */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Customer ID</p>
                        <p className="font-medium">{selectedBooking.customerId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Service</p>
                        <p className="font-medium">
                          {services.find(s => s.id === selectedBooking.serviceId)?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Price</p>
                        <p className="font-medium">${selectedBooking.totalPrice}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Booking Date</p>
                        <p className="font-medium">
                          {new Date(selectedBooking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                {selectedBooking.notes && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-3">Special Instructions</h3>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedBooking.notes}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t pt-4 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowBookingModal(false)}
                  >
                    Close
                  </Button>
                  {selectedBooking.status === 'pending' && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleRejectBooking(selectedBooking.id)
                          setShowBookingModal(false)
                        }}
                      >
                        Reject Booking
                      </Button>
                      <Button
                        onClick={() => {
                          handleAcceptBooking(selectedBooking.id)
                          setShowBookingModal(false)
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept Booking
                      </Button>
                    </>
                  )}
                  {selectedBooking.status === 'confirmed' && (
                    <Button
                      onClick={() => {
                        handleCompleteBooking(selectedBooking.id)
                        setShowBookingModal(false)
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Mark as Complete
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Complete Profile Modal */}
        <Dialog open={showCompleteProfileModal} onOpenChange={setShowCompleteProfileModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Complete Your Provider Profile</DialogTitle>
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
            </DialogHeader>
            
            <form onSubmit={handleEditProfile} className="space-y-6">
              {/* Cover Image Upload */}
              <div>
                <Label>Cover Image</Label>
                <p className="text-sm text-gray-600 mb-3">Upload a cover image for your business profile</p>
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
                        {editProfileForm.coverImage ? editProfileForm.coverImage.name : 'Click to upload cover image'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div>
                <Label>Profile Picture</Label>
                <p className="text-sm text-gray-600 mb-3">Upload a profile picture for your business</p>
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
                        {editProfileForm.profilePicture ? editProfileForm.profilePicture.name : 'Click to upload profile picture'}
                      </p>
                    </div>
                  </label>
                </div>
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

              <div>
                <Label>Availability Management</Label>
                <p className="text-sm text-gray-600 mb-3">Manage your working hours and availability</p>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Working Hours & Availability</p>
                      <p className="text-sm text-gray-600">Set your detailed availability schedule</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Navigate to availability page
                        window.location.href = '/provider/availability'
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Availability
                    </Button>
                  </div>
                </div>
              </div>

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
