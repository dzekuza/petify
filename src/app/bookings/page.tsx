'use client'

import { useState, useEffect, useCallback } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { bookingApi } from '@/lib/bookings'
import { Booking, BookingStatus } from '@/types'
import { t } from '@/lib/translations'
import { Calendar, Clock, User, X, Loader2, Mail, Phone } from 'lucide-react'

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null)
  const [selectedPetId, setSelectedPetId] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState<'all' | 'past' | 'future'>('all')

  const fetchBookings = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const userBookings = await bookingApi.getCustomerBookings(user.id)
      setBookings(userBookings)
    } catch (err) {
      setError(t('bookings.error', 'Failed to fetch bookings'))
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user, fetchBookings])

  if (!user) return null

  const getStatusColor = (status: BookingStatus) => {
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

  const getStatusText = (status: BookingStatus) => {
    return t(`bookings.status.${status}`, status.charAt(0).toUpperCase() + status.slice(1))
  }

  const toBookingDateTime = (b: Booking) => {
    try {
      const [h, m] = b.timeSlot.start.split(':').map(Number)
      const d = new Date(b.date)
      d.setHours(h || 0, m || 0, 0, 0)
      return d
    } catch {
      return new Date(b.date)
    }
  }

  const filteredBookings = bookings.filter(b => {
    if (selectedPetId !== 'all' && b.petId !== selectedPetId) return false
    if (timeFilter === 'all') return true
    const now = new Date()
    const dt = toBookingDateTime(b)
    return timeFilter === 'past' ? dt < now : dt >= now
  })

  const uniquePets = Array.from(
    new Map(
      bookings
        .filter(b => !!b.petId && !!b.pet)
        .map(b => [b.petId as string, { id: b.petId as string, name: b.pet!.name }])
    ).values()
  )


  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellingBooking(bookingId)
      await bookingApi.updateBookingStatus(bookingId, { 
        status: 'cancelled',
        reason: 'Cancelled by customer'
      })
      
      // Refresh bookings
      await fetchBookings()
    } catch (err) {
      console.error('Error cancelling booking:', err)
      alert(t('bookings.cancelError', 'Failed to cancel booking'))
    } finally {
      setCancellingBooking(null)
    }
  }

  return (
    <Layout hideFooter={true}>
      <ProtectedRoute>
        <div className="min-h-[calc(100vh-4rem)] md:min-h-screen bg-gray-50 pt-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{t('bookings.title')}</h1>
              <p className="text-gray-600">{t('bookings.subtitle')}</p>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Filtruoti pagal augintinį</label>
                <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Visi augintiniai" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Visi augintiniai</SelectItem>
                    {uniquePets.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Būsena pagal laiką</label>
                <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as 'all' | 'past' | 'future')}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Visi užsakymai</SelectItem>
                    <SelectItem value="future">Būsimi užsakymai</SelectItem>
                    <SelectItem value="past">Praėję užsakymai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bookings List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {loading ? (
                <Card className="lg:col-span-2">
                  <CardContent className="text-center py-8">
                    <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">{t('bookings.loadingBookings')}</p>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card className="lg:col-span-2">
                  <CardContent className="text-center py-8">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={fetchBookings}>{t('bookings.tryAgain')}</Button>
                  </CardContent>
                </Card>
              ) : filteredBookings.length === 0 ? (
                <Card className="lg:col-span-2">
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('bookings.noBookings')}</h3>
                    <p className="text-gray-600 mb-4">{t('bookings.noBookingsDesc')}</p>
                    <Button onClick={() => window.location.href = '/'}>
                      {t('bookings.findServices')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header with service name and status */}
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.service?.name || `Service ${booking.serviceId}`}
                          </h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </div>
                        
                        {/* Main booking details */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{booking.provider?.businessName || `${t('bookings.provider')} ${booking.providerId}`}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(booking.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{booking.timeSlot.start} - {booking.timeSlot.end}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <span className="font-medium">€{booking.totalPrice}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Pet information with image */}
                        {booking.pet && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              {booking.pet.profilePicture ? (
                                <img 
                                  src={booking.pet.profilePicture} 
                                  alt={booking.pet.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">{t('bookings.pet')}:</span> {booking.pet.name} ({booking.pet.species})
                                  {booking.pet.breed && ` - ${booking.pet.breed}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Notes */}
                        {booking.notes && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">{t('bookings.notes')}:</span> {booking.notes}
                            </p>
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {/* Contact Provider Buttons */}
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Email contact functionality will be implemented
                                window.open(`mailto:${booking.provider?.contactInfo?.email}`)
                              }}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              El. paštas
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Phone contact functionality
                                window.open(`tel:${booking.provider?.contactInfo?.phone}`)
                              }}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              Telefonas
                            </Button>
                          </div>
                          
                          {/* Cancel Button */}
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={cancellingBooking === booking.id}
                            >
                              {cancellingBooking === booking.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <X className='h-4 w-4 mr-1' />
                              )}
                              {t('bookings.cancel')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

      </ProtectedRoute>
    </Layout>
  )
}
