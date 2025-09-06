'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { bookingApi } from '@/lib/bookings'
import { Booking, BookingStatus } from '@/types'
import { Calendar, Clock, MapPin, User, Edit, X, Loader2 } from 'lucide-react'

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [editForm, setEditForm] = useState({
    date: '',
    time: '',
    notes: ''
  })
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null)

  if (!user) return null

  useEffect(() => {
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const userBookings = await bookingApi.getCustomerBookings(user.id)
      setBookings(userBookings)
    } catch (err) {
      setError('Failed to fetch bookings')
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

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

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking)
    setEditForm({
      date: booking.date,
      time: booking.timeSlot.start,
      notes: booking.notes || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editingBooking) return

    try {
      // TODO: Implement booking update API call
      console.log('Updating booking:', editingBooking.id, editForm)
      
      // For now, just close the modal
      setEditingBooking(null)
      // Refresh bookings
      await fetchBookings()
    } catch (err) {
      console.error('Error updating booking:', err)
      alert('Failed to update booking')
    }
  }

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
      alert('Failed to cancel booking')
    } finally {
      setCancellingBooking(null)
    }
  }

  return (
    <Layout>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600">View and manage your service bookings</p>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Loading your bookings...</p>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={fetchBookings}>Try Again</Button>
                  </CardContent>
                </Card>
              ) : bookings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-4">Start by booking a service for your pet</p>
                    <Button onClick={() => window.location.href = '/'}>
                      Find Services
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.service?.name || `Service ${booking.serviceId}`}
                            </h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{booking.provider?.businessName || `Provider ${booking.providerId}`}</span>
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
                          
                          {booking.pet && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                Pet: {booking.pet.name} ({booking.pet.species})
                              </p>
                            </div>
                          )}
                          
                          {booking.notes && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                Notes: {booking.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditBooking(booking)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
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
                                <X className="h-4 w-4 mr-1" />
                              )}
                              Cancel
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

        {/* Edit Booking Modal */}
        <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Booking</DialogTitle>
              <DialogDescription>
                Update your booking details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editDate">Date</Label>
                <Input
                  id="editDate"
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editTime">Time</Label>
                <Input
                  id="editTime"
                  type="time"
                  value={editForm.time}
                  onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special instructions..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingBooking(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </ProtectedRoute>
    </Layout>
  )
}
