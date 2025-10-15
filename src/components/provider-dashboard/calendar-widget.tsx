'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { bookingApi } from '@/lib/bookings'
import { useAuth } from '@/contexts/auth-context'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Phone, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { t } from '@/lib/translations'

// Booking type with joined data from API
interface BookingWithDetails {
  id: string
  customerId: string
  providerId: string
  serviceId: string
  petId?: string
  date: string
  timeSlot: { start: string; end: string }
  totalPrice: number
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  // Joined data from API
  customer?: {
    id: string
    fullName?: string
    email?: string
    phone?: string
  }
  provider?: {
    id: string
    business_name?: string
    user_id?: string
  }
  service?: {
    id: string
    name?: string
    price?: number
    description?: string
  }
  pet?: {
    id: string
    name?: string
    species?: string
    breed?: string
    age?: number
    profile_picture?: string
  }
}

interface CalendarWidgetProps {
  className?: string
}

export function CalendarWidget({ className }: CalendarWidgetProps) {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthNames = [
    'Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė', 'Birželis',
    'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis'
  ]

  const daysOfWeek = ['SK', 'PR', 'AN', 'TR', 'KT', 'PN', 'ŠT']

  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        const providerBookings = await bookingApi.getProviderBookings(user.id)
        setBookings(providerBookings as BookingWithDetails[])
      } catch (error) {
        console.error('Error loading bookings:', error)
        toast.error('Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [user?.id])

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date)
      return bookingDate.toDateString() === date.toDateString()
    })
  }

  const generateCalendarDays = () => {
    const days = []
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      days.push({
        day: date.getMonth() === currentMonth ? date.getDate() : null,
        date: date
      })
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
    setSelectedDate(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    return t(`providerDashboard.status.${status}`, status)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('lt-LT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const calendarDays = generateCalendarDays()
  const today = new Date()

  if (loading) {
    return (
      <Card className={`bg-transparent border-0 shadow-none ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : []

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <CardTitle>{t('providerDashboard.calendarTitle')}</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>{t('providerDashboard.upcomingAppointments')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => {
                if (!day.day) {
                  return <div key={index} className="p-2"></div>
                }

                const dayBookings = getBookingsForDate(day.date!)
                const isToday = day.date!.toDateString() === today.toDateString()
                const isSelected = selectedDate?.toDateString() === day.date!.toDateString()

                return (
                  <div
                    key={index}
                    className={`
                      p-2 min-h-[60px] cursor-pointer border rounded-lg
                      ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
                      ${isSelected ? 'ring-2 ring-blue-500' : ''}
                      hover:bg-gray-50
                    `}
                    onClick={() => setSelectedDate(day.date!)}
                  >
                    <div className="text-sm font-medium mb-1">{day.day}</div>
                    {dayBookings.length > 0 && (
                      <div className="space-y-1">
                        {dayBookings.slice(0, 2).map((booking, idx) => (
                          <div
                            key={idx}
                            className={`
                              text-xs px-1 py-0.5 rounded truncate
                              ${getStatusColor(booking.status)}
                            `}
                            title={`${booking.timeSlot.start} - ${booking.timeSlot.end} - ${booking.service?.name}`}
                          >
                            {booking.timeSlot.start}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayBookings.length - 2} {t('providerDashboard.more')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Bookings */}
      <div>
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 inline mr-2" />
              {selectedDate ? formatDate(selectedDate) : t('providerDashboard.selectDate')}
            </CardTitle>
            <CardDescription>
              {selectedDate ? `${selectedDateBookings.length} ${t('providerDashboard.appointments')}` : t('providerDashboard.selectDateToView')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              {selectedDateBookings.length > 0 ? (
                selectedDateBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusText(booking.status)}
                      </Badge>
                      <span className="text-sm font-medium text-gray-600">€{booking.totalPrice}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{booking.timeSlot.start} - {booking.timeSlot.end}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {booking.customer?.fullName || t('providerDashboard.customer')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {booking.customer?.phone || t('providerDashboard.noPhone')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{booking.customer?.email}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium">{booking.service?.name}</p>
                      {booking.pet && (
                        <p className="text-sm text-gray-600">
                          {t('providerDashboard.pet')}: {booking.pet.name} ({booking.pet.species})
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : selectedDate ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">{t('providerDashboard.noBookingsForDate')}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">{t('providerDashboard.clickDateToView')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
