'use client'

import { useState, useEffect, useCallback } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { bookingApi } from '@/lib/bookings'
import { Booking, BookingStatus } from '@/types'
import { t } from '@/lib/translations'
import { Calendar, Clock, User, X, Loader2, Mail, Phone, ChevronDown, Search, CalendarDays } from 'lucide-react'
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

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    confirmed: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    cancelled: { bg: 'bg-red-50 border-red-200', text: 'text-red-600', dot: 'bg-red-400' },
    completed: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
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
        <div className="min-h-[calc(100vh-4rem)] md:min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/30 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-20 -right-32 w-80 h-80 rounded-full bg-blue-100/30 blur-3xl" />
            <div className="absolute bottom-20 -left-20 w-72 h-72 rounded-full bg-amber-100/20 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-8">
            {/* Header */}
            <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-400">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{t('bookings.title')}</h1>
              <p className="text-muted-foreground text-sm mt-1">{t('bookings.subtitle')}</p>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-2 gap-3 animate-in fade-in duration-300">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('bookings.filterByPet')}</label>
                <div className="relative mt-1.5">
                  <select
                    className="flex h-10 w-full items-center rounded-xl border border-border/60 bg-white/80 backdrop-blur-sm px-3 py-2 pr-8 text-sm outline-none focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-100 hover:border-border disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all"
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                  >
                    <option value="all">Visi augintiniai</option>
                    {uniquePets.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('bookings.statusByTime')}</label>
                <div className="relative mt-1.5">
                  <select
                    className="flex h-10 w-full items-center rounded-xl border border-border/60 bg-white/80 backdrop-blur-sm px-3 py-2 pr-8 text-sm outline-none focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-100 hover:border-border disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as 'all' | 'past' | 'future')}
                  >
                    <option value="all">{t('bookings.allBookings')}</option>
                    <option value="future">{t('bookings.futureBookings')}</option>
                    <option value="past">{t('bookings.pastBookings')}</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Bookings List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-full border-[3px] border-blue-200 border-t-blue-500 animate-spin" />
                <p className="text-sm text-muted-foreground mt-4">{t('bookings.loadingBookings')}</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 rounded-2xl bg-white/60 backdrop-blur-sm border border-border/40 animate-in fade-in duration-300">
                <p className="text-red-600 mb-4 text-sm">{error}</p>
                <Button onClick={fetchBookings} variant="outline" className="rounded-xl">{t('bookings.tryAgain')}</Button>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-white/60 backdrop-blur-sm border border-border/40 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{t('bookings.noBookings')}</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">{t('bookings.noBookingsDesc')}</p>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="rounded-xl bg-foreground hover:bg-foreground/90 text-background"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {t('bookings.findServices')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-400">
                  {filteredBookings.map((booking) => {
                    const sc = statusConfig[booking.status] || statusConfig.completed
                    return (
                      <div
                        key={booking.id}
                        className="rounded-2xl bg-white/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                      >
                        {/* Top accent bar */}
                        <div className={cn(
                          "h-1",
                          booking.status === 'confirmed' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
                          booking.status === 'pending' ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                          booking.status === 'cancelled' ? 'bg-gradient-to-r from-red-300 to-red-400' :
                          'bg-gradient-to-r from-blue-400 to-indigo-400'
                        )} />

                        <div className="p-5">
                          {/* Header: service name + status */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <h3 className="text-base font-semibold text-foreground leading-tight">
                              {booking.service?.name || `Service ${booking.serviceId}`}
                            </h3>
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0",
                              sc.bg, sc.text
                            )}>
                              <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
                              {getStatusText(booking.status)}
                            </span>
                          </div>

                          {/* Details grid */}
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center shrink-0">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-foreground truncate">
                                {booking.provider?.businessName || `${t('bookings.provider')} ${booking.providerId}`}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center shrink-0">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-muted-foreground">{new Date(booking.date).toLocaleDateString()}</span>
                              <span className="text-muted-foreground/40">|</span>
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">{booking.timeSlot.start} - {booking.timeSlot.end}</span>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-muted-foreground">&euro;</span>
                              </div>
                              <span className="font-semibold text-foreground">&euro;{booking.totalPrice}</span>
                            </div>
                          </div>

                          {/* Pet info */}
                          {(booking.pet || booking.petId) && (
                            <div className="mt-4 flex items-center gap-3 py-2.5 px-3 rounded-xl bg-muted/40">
                              {booking.pet?.profilePicture ? (
                                <img
                                  src={booking.pet.profilePicture}
                                  alt={booking.pet.name}
                                  className="w-9 h-9 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                                  <span className="text-sm">🐾</span>
                                </div>
                              )}
                              <div className="min-w-0">
                                {booking.pet ? (
                                  <p className="text-sm text-foreground truncate">
                                    <span className="font-medium">{booking.pet.name}</span>
                                    <span className="text-muted-foreground"> · {booking.pet.species}</span>
                                    {booking.pet.breed && <span className="text-muted-foreground"> · {booking.pet.breed}</span>}
                                  </p>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">Augintinio informacija neprieinama</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {booking.notes && !booking.notes.startsWith('Pets:') && (
                            <div className="mt-3 py-2 px-3 rounded-xl bg-muted/40">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">Pastabos:</span> {booking.notes}
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 rounded-lg text-xs hover:bg-muted/60"
                              onClick={() => window.open(`mailto:${booking.provider?.contactInfo?.email}`)}
                            >
                              <Mail className="h-3.5 w-3.5 mr-1.5" />
                              El. paštas
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 rounded-lg text-xs hover:bg-muted/60"
                              onClick={() => window.open(`tel:${booking.provider?.contactInfo?.phone}`)}
                            >
                              <Phone className="h-3.5 w-3.5 mr-1.5" />
                              Telefonas
                            </Button>

                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 rounded-lg text-xs text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={cancellingBooking === booking.id}
                              >
                                {cancellingBooking === booking.id ? (
                                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                ) : (
                                  <X className="h-3.5 w-3.5 mr-1.5" />
                                )}
                                Atšaukti
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
