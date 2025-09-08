'use client'

import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { t } from '@/lib/translations'
import type { Booking, Service } from '@/types'

type Props = {
  bookings: Booking[]
  services: Service[]
  onView: (b: Booking) => void
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onComplete: (id: string) => void
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
      return <Clock className="h-4 w-4 text-gray-500" />
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

export default function BookingsSection({ bookings, services, onView, onAccept, onReject, onComplete }: Props) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('providerDashboard.emptyBookingsTitle', 'No bookings yet')}</h3>
        <p className="text-gray-600">{t('providerDashboard.emptyBookingsDesc', "When customers book your services, they'll appear here.")}</p>
      </div>
    )
  }

  return (
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
                  <strong>{t('providerDashboard.notes', 'Notes')}:</strong> {booking.notes}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onView(booking)}>{t('providerDashboard.viewDetails', 'View Details')}</Button>
              {booking.status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => onAccept(booking.id)} className="bg-green-600 hover:bg-green-700">{t('providerDashboard.accept', 'Accept')}</Button>
                  <Button variant="destructive" size="sm" onClick={() => onReject(booking.id)}>{t('providerDashboard.reject', 'Reject')}</Button>
                </>
              )}
              {booking.status === 'confirmed' && (
                <Button size="sm" onClick={() => onComplete(booking.id)} className="bg-blue-600 hover:bg-blue-700">{t('providerDashboard.markComplete', 'Mark Complete')}</Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


