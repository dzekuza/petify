'use client'

import { useState, useEffect, useCallback } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { bookingApi } from '@/lib/bookings'
import { Booking, BookingStatus } from '@/types'
import { t } from '@/lib/translations'
import { Calendar, Clock, User, X, Loader2, Mail, Phone, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      setError(null)
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
        return 'bg-muted text-foreground'
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
        <div className="min-h-[calc(100vh-4rem)] md:min-h-screen bg-muted pt-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">{t('bookings.title')}</h1>
              <p className="text-muted-foreground">{t('bookings.subtitle')}</p>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">{t('bookings.filterByPet')}</label>
                <div className="relative mt-2">
                  <select
                    className="flex h-9 w-full items-center justify-between rounded-md border border-neutral-200 bg-transparent px-3 py-2 pr-8 text-sm placeholder:text-muted-foreground outline-none focus-visible:border-neutral-400 hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-colors"
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                  >
                    <option value="all">Visi augintiniai</option>
                    {uniquePets.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t('bookings.statusByTime')}</label>
                <div className="relative mt-2">
                  <select
                    className="flex h-9 w-full items-center justify-between rounded-md border border-neutral-200 bg-transparent px-3 py-2 pr-8 text-sm placeholder:text-muted-foreground outline-none focus-visible:border-neutral-400 hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-colors"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as 'all' | 'past' | 'future')}
                  >
                    <option value="all">{t('bookings.allBookings')}</option>
                    <option value="future">{t('bookings.futureBookings')}</option>
                    <option value="past">{t('bookings.pastBookings')}</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {loading ? (
                <Card className="lg:col-span-2">
                  <CardContent className="text-center py-8">
                    <Loader2 className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">{t('bookings.loadingBookings')}</p>
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
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">{t('bookings.noBookings')}</h3>
                    <p className="text-muted-foreground mb-4">{t('bookings.noBookingsDesc')}</p>
                    <Button onClick={() => window.location.href = '/'}>
                      {t('bookings.findServices')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="bg-card text-card-foreground space-y-4 flex flex-col rounded-xl border border-neutral-200">
                    <div className="p-6">
                      <div className="space-y-4">
                        {/* Header with service name and status */}
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-foreground">
                            {booking.service?.name || `Service ${booking.serviceId}`}
                          </h3>
                          <span
                            className={cn(
                              "inline-flex items-center justify-center rounded-md border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0",
                              booking.status === 'confirmed' ? "bg-green-100 text-green-800" :
                                booking.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                                  booking.status === 'cancelled' ? "bg-red-100 text-red-800" :
                                    "bg-blue-100 text-blue-800"
                            )}
                          >
                            {getStatusText(booking.status)}
                          </span>
                        </div>

                        {/* Main booking details */}
                        <div className="bg-muted rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <User className="h-4 w-4" aria-hidden="true" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {booking.provider?.businessName || `${t('bookings.provider')} ${booking.providerId}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" aria-hidden="true" />
                              <span className="text-sm">{new Date(booking.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Clock className="h-4 w-4" aria-hidden="true" />
                              <span className="text-sm">{booking.timeSlot.start} - {booking.timeSlot.end}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <span className="text-sm font-medium">&euro;{booking.totalPrice}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pet information with image */}
                        {(booking.pet || booking.petId) && (
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              {booking.pet?.profilePicture ? (
                                <img
                                  src={booking.pet.profilePicture}
                                  alt={booking.pet.name}
                                  className="w-12 h-12 rounded-full object-cover aspect-square"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                                </div>
                              )}
                              <div>
                                {booking.pet ? (
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">Augintinis:</span> {booking.pet.name} ({booking.pet.species})
                                    {booking.pet.breed && ` - ${booking.pet.breed}`}
                                  </p>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">Augintinis:</span>
                                    <span className="text-muted-foreground italic">Augintinio informacija neprieinama</span>
                                    {booking.petId && (
                                      <span className="text-xs text-muted-foreground ml-1">(ID: {booking.petId})</span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {booking.notes && !booking.notes.startsWith('Pets:') && (
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Pastabos:</span> {booking.notes}
                            </p>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`mailto:${booking.provider?.contactInfo?.email}`)}
                            >
                              <Mail className="h-4 w-4 mr-1" aria-hidden="true" />
                              El. paštas
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`tel:${booking.provider?.contactInfo?.phone}`)}
                            >
                              <Phone className="h-4 w-4 mr-1" aria-hidden="true" />
                              Telefonas
                            </Button>
                          </div>

                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={cancellingBooking === booking.id}
                            >
                              {cancellingBooking === booking.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" aria-hidden="true" />
                              ) : (
                                <X className="h-4 w-4 mr-1" aria-hidden="true" />
                              )}
                              Atšaukti
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </ProtectedRoute>
    </Layout>
  )
}
