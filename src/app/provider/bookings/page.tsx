'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Calendar, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  Filter,
  Search
} from 'lucide-react'
import InteractiveCalendar from '@/components/ui/visualize-booking'
import { ServiceProvider, Service, Booking } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { useNotifications } from '@/contexts/notifications-context'
import { bookingApi } from '@/lib/bookings'

export default function ProviderBookings() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadBookingsData = async () => {
      try {
        setLoading(true)
        
        // TODO: Replace with actual API calls
        // const providerBookings = await bookingApi.getProviderBookings(user?.id)
        // const providerServices = await serviceApi.getProviderServices(user?.id)
        
        // Mock data for demonstration
        const mockBookings: Booking[] = [
          {
            id: 'booking-1',
            customerId: 'customer-1',
            providerId: user?.id || '',
            serviceId: 'service-1',
            date: '2024-01-15',
            timeSlot: { start: '10:00', end: '11:00', available: false },
            pets: [
              {
                id: 'pet-1',
                ownerId: 'customer-1',
                name: 'Buddy',
                species: 'dog',
                breed: 'Golden Retriever',
                age: 24,
                weight: 30,
                specialNeeds: ['Anxiety'],
                medicalNotes: 'Friendly but nervous around new people',
                images: [],
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01'
              }
            ],
            totalPrice: 75,
            status: 'pending',
            notes: 'Please be gentle with Buddy, he gets anxious during grooming',
            createdAt: '2024-01-10',
            updatedAt: '2024-01-10'
          },
          {
            id: 'booking-2',
            customerId: 'customer-2',
            providerId: user?.id || '',
            serviceId: 'service-2',
            date: '2024-01-16',
            timeSlot: { start: '14:00', end: '15:30', available: false },
            pets: [
              {
                id: 'pet-2',
                ownerId: 'customer-2',
                name: 'Whiskers',
                species: 'cat',
                breed: 'Persian',
                age: 36,
                weight: 4,
                specialNeeds: [],
                medicalNotes: 'Healthy cat, regular checkups',
                images: [],
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01'
              }
            ],
            totalPrice: 120,
            status: 'confirmed',
            notes: 'Regular grooming appointment',
            createdAt: '2024-01-11',
            updatedAt: '2024-01-12'
          }
        ]

        const mockServices: Service[] = [
          {
            id: 'service-1',
            providerId: user?.id || '',
            category: 'grooming',
            name: 'Full Grooming Service',
            description: 'Complete grooming including bath, trim, and nail clipping',
            price: 75,
            duration: 60,
            maxPets: 1,
            requirements: ['Up-to-date vaccinations'],
            includes: ['Bath', 'Haircut', 'Nail trimming', 'Ear cleaning'],
            images: [],
            status: 'active',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          },
          {
            id: 'service-2',
            providerId: user?.id || '',
            category: 'grooming',
            name: 'Premium Grooming Package',
            description: 'Luxury grooming with spa treatments',
            price: 120,
            duration: 90,
            maxPets: 1,
            requirements: ['Up-to-date vaccinations', 'Health certificate'],
            includes: ['Bath', 'Haircut', 'Nail trimming', 'Ear cleaning', 'Spa treatment', 'Teeth brushing'],
            images: [],
            status: 'active',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          }
        ]
        
        setBookings(mockBookings)
        setServices(mockServices)
        
      } catch (error) {
        console.error('Error loading bookings data:', error)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load bookings data. Please try again.'
        })
      } finally {
        setLoading(false)
      }
    }

    loadBookingsData()
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

  // Filter bookings based on status and search term
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      booking.pets.some(pet => pet.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      services.find(s => s.id === booking.serviceId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <Layout>
        <ProtectedRoute requiredRole="provider">
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[1, 2, 3].map((i) => (
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
                Manage Bookings
              </h1>
              <p className="text-gray-600">
                View and manage all your service bookings
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {bookings.filter(b => b.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Confirmed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {bookings.filter(b => b.status === 'confirmed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {bookings.filter(b => b.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="grid" className="space-y-6">
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="space-y-6">
                {/* Filters and Search */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <input
                            type="text"
                            placeholder="Search by pet name or service..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bookings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBookings.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                      <p className="text-gray-600">
                        {searchTerm || filterStatus !== 'all' 
                          ? 'Try adjusting your search or filter criteria.'
                          : 'When customers book your services, they\'ll appear here.'
                        }
                      </p>
                    </div>
                  ) : (
                    filteredBookings.map((booking) => (
                      <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(booking.status)}
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              ${booking.totalPrice}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {booking.pets[0]?.name} - {services.find(s => s.id === booking.serviceId)?.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.date).toLocaleDateString()} at {booking.timeSlot.start} - {booking.timeSlot.end}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-2" />
                              <span>{booking.pets.length} pet{booking.pets.length > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{services.find(s => s.id === booking.serviceId)?.duration} min</span>
                            </div>
                          </div>

                          {booking.notes && (
                            <div className="bg-yellow-50 p-3 rounded-md">
                              <p className="text-sm text-yellow-800">
                                <strong>Notes:</strong> {booking.notes}
                              </p>
                            </div>
                          )}

                          <div className="flex space-x-2 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewBookingDetails(booking)}
                              className="flex-1"
                            >
                              View Details
                            </Button>
                            {booking.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm"
                                  onClick={() => handleAcceptBooking(booking.id)}
                                  className="bg-green-600 hover:bg-green-700 flex-1"
                                >
                                  Accept
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleRejectBooking(booking.id)}
                                  className="flex-1"
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <Button 
                                size="sm"
                                onClick={() => handleCompleteBooking(booking.id)}
                                className="bg-blue-600 hover:bg-blue-700 flex-1"
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

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
      </ProtectedRoute>
    </Layout>
  )
}
