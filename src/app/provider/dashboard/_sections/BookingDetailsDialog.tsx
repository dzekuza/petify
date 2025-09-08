'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { Service } from '@/types'

type TimeSlot = { start: string; end: string }
type Pet = { name: string; species?: string; breed?: string; age?: number; specialNeeds?: string[] }

export type BookingLite = {
  id: string
  date: string
  timeSlot: TimeSlot
  totalPrice: number
  status: string
  createdAt: string
  notes?: string
  customerId: string
  serviceId: string
  pet?: Pet
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

type Props = {
  open: boolean
  booking: BookingLite | null
  services: Service[]
  onClose: () => void
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onComplete: (id: string) => void
}

export default function BookingDetailsDialog({ open, booking, services, onClose, onAccept, onReject, onComplete }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Booking Details
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>View and manage booking details for your services.</DialogDescription>
        </DialogHeader>

        {booking && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-green-600">${booking.totalPrice}</div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-3">Service Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-medium">{services.find(s => s.id === booking.serviceId)?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium">{new Date(booking.date).toLocaleDateString()} at {booking.timeSlot.start} - {booking.timeSlot.end}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-3">Pet Information</h3>
              {booking.pet ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Pet Name</p>
                      <p className="font-medium">{booking.pet.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Species</p>
                      <p className="font-medium">{booking.pet.species}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Breed</p>
                      <p className="font-medium">{booking.pet.breed || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium">{booking.pet.age} months</p>
                    </div>
                  </div>
                  {booking.pet.specialNeeds && booking.pet.specialNeeds.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">Special Needs</p>
                      <p className="font-medium">{booking.pet.specialNeeds.join(', ')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No pet information available</p>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer ID</p>
                    <p className="font-medium">{booking.customerId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="font-medium">${booking.totalPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Booking Date</p>
                    <p className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Special Instructions</h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-gray-700">{booking.notes}</p>
                </div>
              </div>
            )}

            <div className="border-t pt-4 flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>Close</Button>
              {booking.status === 'pending' && (
                <>
                  <Button variant="destructive" onClick={() => onReject(booking.id)}>Reject Booking</Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => onAccept(booking.id)}>Accept Booking</Button>
                </>
              )}
              {booking.status === 'confirmed' && (
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => onComplete(booking.id)}>Mark as Complete</Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


