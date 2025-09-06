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
  Mail,
  MapPin
} from 'lucide-react'
import InteractiveCalendar from '@/components/ui/visualize-booking'
import { ServiceProvider, Service, Booking, CreateServiceForm, ServiceCategory } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { useNotifications } from '@/contexts/notifications-context'
import { bookingApi } from '@/lib/bookings'
import { providerApi } from '@/lib/providers'


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
          
          // TODO: Load services and bookings from API
          // const providerServices = await serviceApi.getProviderServices(user.id)
          // const providerBookings = await bookingApi.getProviderBookings(user.id)
          setServices([])
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

  const handleCalendarBookingClick = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (booking) {
      handleViewBookingDetails(booking)
    }
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
      // TODO: Replace with actual API call
      // const newService = await serviceApi.createService(serviceForm)
      
      // For now, create a mock service
      const newService: Service = {
        id: `service-${Date.now()}`,
        providerId: user?.id || '',
        category: serviceForm.category,
        name: serviceForm.name,
        description: serviceForm.description,
        price: serviceForm.price,
        duration: serviceForm.duration,
        maxPets: serviceForm.maxPets,
        requirements: serviceForm.requirements,
        includes: serviceForm.includes,
        images: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Update local state
      setServices(prev => [...prev, newService])
      
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

  const handleServiceFormChange = (field: keyof CreateServiceForm, value: any) => {
    setServiceForm(prev => ({ ...prev, [field]: value }))
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                    <CardTitle>Booking Calendar</CardTitle>
                    <CardDescription>
                      Visualize and manage your bookings in calendar view
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-card rounded-lg p-4 border">
                      <InteractiveCalendar 
                        bookings={bookings}
                        onBookingClick={handleCalendarBookingClick}
                      />
                    </div>
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
                                  {booking.pets[0]?.name} - {services.find(s => s.id === booking.serviceId)?.name}
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
                                <span>${service.price}</span>
                                <span>{service.duration} min</span>
                                <span>Max {service.maxPets} pet{service.maxPets > 1 ? 's' : ''}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
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
                <Card>
                  <CardHeader>
                    <CardTitle>Business Profile</CardTitle>
                    <CardDescription>
                      Manage your business information and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Business Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Business Name
                            </label>
                            <p className="text-sm text-gray-600">{provider?.businessName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Experience
                            </label>
                            <p className="text-sm text-gray-600">{provider?.experience} years</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Location
                            </label>
                            <p className="text-sm text-gray-600">
                              {provider?.location.city}, {provider?.location.state}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Rating
                            </label>
                            <p className="text-sm text-gray-600">{provider?.rating} stars</p>
                          </div>
                        </div>
                      </div>
                      <Button>Edit Profile</Button>
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
                  {selectedBooking.pets.map((pet, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Pet Name</p>
                          <p className="font-medium">{pet.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Species</p>
                          <p className="font-medium">{pet.species}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Breed</p>
                          <p className="font-medium">{pet.breed || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Age</p>
                          <p className="font-medium">{pet.age} months</p>
                        </div>
                      </div>
                      {pet.specialNeeds && pet.specialNeeds.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">Special Needs</p>
                          <p className="font-medium">{pet.specialNeeds.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  ))}
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
                      const userName = user.user_metadata?.full_name || ''

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
                            lat: 0, // TODO: Get from geocoding
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
                          currency: 'USD'
                        },
                        availability: profileForm.availability,
                        certifications: profileForm.certifications,
                        experienceYears: parseInt(profileForm.experience.split('-')[0]) || 0
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
                  <Label htmlFor="serviceCategory">Service Category *</Label>
                  <Select 
                    value={serviceForm.category} 
                    onValueChange={(value: ServiceCategory) => handleServiceFormChange('category', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grooming">Pet Grooming</SelectItem>
                      <SelectItem value="veterinary">Veterinary</SelectItem>
                      <SelectItem value="boarding">Pet Boarding</SelectItem>
                      <SelectItem value="training">Pet Training</SelectItem>
                      <SelectItem value="walking">Dog Walking</SelectItem>
                      <SelectItem value="sitting">Pet Sitting</SelectItem>
                      <SelectItem value="adoption">Adoption Services</SelectItem>
                    </SelectContent>
                  </Select>
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
      </ProtectedRoute>
    </Layout>
  )
}
