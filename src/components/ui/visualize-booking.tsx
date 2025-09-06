'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Columns3, Grid } from 'lucide-react'
import { Booking } from '@/types'

export type DayType = {
  day: string
  classNames: string
  meetingInfo?: {
    date: string
    time: string
    title: string
    participants: string[]
    location: string
    bookingId: string
    status: string
  }[]
}

interface DayProps {
  classNames: string
  day: DayType
  onHover: (day: string | null) => void
  onBookingClick?: (bookingId: string) => void
}

const Day: React.FC<DayProps> = ({ classNames, day, onHover, onBookingClick }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <>
      <motion.div
        className={`relative flex items-center justify-center py-1 ${classNames}`}
        style={{ height: '4rem', borderRadius: 'var(--radius-lg)' }}
        onMouseEnter={() => {
          setIsHovered(true)
          onHover(day.day)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          onHover(null)
        }}
        id={`day-${day.day}`}
      >
        <motion.div className="flex flex-col items-center justify-center">
          {!(day.day[0] === '+' || day.day[0] === '-') && (
            <span className="text-sm text-foreground">{day.day}</span>
          )}
        </motion.div>
        {day.meetingInfo && (
          <motion.div
            className="absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full bg-muted p-1 text-[10px] font-bold text-muted-foreground"
            layoutId={`day-${day.day}-meeting-count`}
            style={{
              borderRadius: 999,
            }}
          >
            {day.meetingInfo.length}
          </motion.div>
        )}

        <AnimatePresence>
          {day.meetingInfo && isHovered && (
            <div className="absolute inset-0 flex size-full items-center justify-center">
              <motion.div
                className="flex size-10 items-center justify-center bg-muted p-1 text-xs font-bold text-muted-foreground"
                layoutId={`day-${day.day}-meeting-count`}
                style={{
                  borderRadius: 999,
                }}
              >
                {day.meetingInfo.length}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}

const CalendarGrid: React.FC<{ 
  onHover: (day: string | null) => void
  onBookingClick?: (bookingId: string) => void
  days: DayType[]
}> = ({ onHover, onBookingClick, days }) => {
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, index) => (
        <Day
          key={`${day.day}-${index}`}
          classNames={day.classNames}
          day={day}
          onHover={onHover}
          onBookingClick={onBookingClick}
        />
      ))}
    </div>
  )
}

interface InteractiveCalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  bookings?: Booking[]
  onBookingClick?: (bookingId: string) => void
  currentMonth?: number
  currentYear?: number
}

const InteractiveCalendar = React.forwardRef<
  HTMLDivElement,
  InteractiveCalendarProps
>(({ className, bookings = [], onBookingClick, currentMonth = new Date().getMonth(), currentYear = new Date().getFullYear(), ...props }, ref) => {
  const [moreView, setMoreView] = useState(false)
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)

  const handleDayHover = (day: string | null) => {
    setHoveredDay(day)
  }

  // Convert bookings to calendar format
  const convertBookingsToCalendar = (bookings: Booking[]): DayType[] => {
    const days: DayType[] = []
    const today = new Date()
    const currentDate = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDayOfWeek = currentDate.getDay()

    // Add empty days for the beginning of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        day: `-${firstDayOfWeek - i}`,
        classNames: 'bg-muted/20'
      })
    }

    // Add days of the month
    for (let day = 1; day <= lastDay; day++) {
      const dayDate = new Date(currentYear, currentMonth, day)
      const dayString = day.toString().padStart(2, '0')
      
      // Find bookings for this day
      const dayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.date)
        return bookingDate.getDate() === day && 
               bookingDate.getMonth() === currentMonth && 
               bookingDate.getFullYear() === currentYear
      })

      const meetingInfo = dayBookings.map(booking => ({
        date: dayDate.toLocaleDateString('en-GB', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        }),
        time: `${booking.timeSlot.start} - ${booking.timeSlot.end}`,
        title: `Pet Service`,
        participants: ['Customer'], // Will be populated from customer data when available
        location: 'In-person',
        bookingId: booking.id,
        status: booking.status
      }))

      const isToday = dayDate.toDateString() === today.toDateString()
      const hasBookings = meetingInfo.length > 0

      days.push({
        day: dayString,
        classNames: `bg-card ${hasBookings ? 'cursor-pointer' : ''} ${isToday ? 'ring-2 ring-primary' : ''}`,
        meetingInfo: meetingInfo.length > 0 ? meetingInfo : undefined
      })
    }

    // Add empty days for the end of the month
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: `+${i}`,
        classNames: 'bg-muted/20'
      })
    }

    return days
  }

  const calendarDays = convertBookingsToCalendar(bookings)

  const sortedDays = React.useMemo(() => {
    if (!hoveredDay) return calendarDays
    return [...calendarDays].sort((a, b) => {
      if (a.day === hoveredDay) return -1
      if (b.day === hoveredDay) return 1
      return 0
    })
  }, [hoveredDay, calendarDays])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={ref}
        className="relative mx-auto my-10 flex w-full flex-col items-center justify-center gap-8 lg:flex-row"
      >
        <motion.div layout className="w-full max-w-lg">
          <motion.div
            key="calendar-view"
            className="flex w-full flex-col gap-4"
          >
            <div className="flex w-full items-center justify-between">
              <motion.h2 className="mb-2 text-4xl font-bold tracking-wider text-foreground">
                {monthNames[currentMonth]} <span className="opacity-50">{currentYear}</span>
              </motion.h2>
              <motion.button
                className="relative flex items-center gap-3 rounded-lg border border-border px-1.5 py-1 text-muted-foreground"
                onClick={() => setMoreView(!moreView)}
              >
                <Columns3 className="z-[2]" />
                <Grid className="z-[2]" />
                <div
                  className="absolute left-0 top-0 h-[85%] w-7 rounded-md bg-background transition-transform duration-300"
                  style={{
                    top: '50%',
                    transform: moreView
                      ? 'translateY(-50%) translateX(40px)'
                      : 'translateY(-50%) translateX(4px)',
                  }}
                ></div>
              </motion.button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="px-0/5 rounded-xl bg-muted py-1 text-center text-xs text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>
            <CalendarGrid 
              onHover={handleDayHover} 
              onBookingClick={onBookingClick}
              days={calendarDays}
            />
          </motion.div>
        </motion.div>
        {moreView && (
          <motion.div
            className="w-full max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              key="more-view"
              className="mt-4 flex w-full flex-col gap-4"
            >
              <div className="flex w-full flex-col items-start justify-between">
                <motion.h2 className="mb-2 text-4xl font-bold tracking-wider text-foreground">
                  Bookings
                </motion.h2>
                <p className="font-medium text-muted-foreground">
                  See upcoming and past events booked through your service listings.
                </p>
              </div>
              <motion.div
                className="flex h-[620px] flex-col items-start justify-start overflow-hidden overflow-y-scroll rounded-xl border-2 border-border shadow-md"
                layout
              >
                <AnimatePresence>
                  {sortedDays
                    .filter((day) => day.meetingInfo)
                    .map((day) => (
                      <motion.div
                        key={day.day}
                        className={`w-full border-b-2 border-border py-0 last:border-b-0`}
                        layout
                      >
                        {day.meetingInfo &&
                          day.meetingInfo.map((meeting, mIndex) => (
                            <motion.div
                              key={mIndex}
                              className="border-b border-border p-3 last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{
                                duration: 0.2,
                                delay: mIndex * 0.05,
                              }}
                              onClick={() => onBookingClick?.(meeting.bookingId)}
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm text-foreground">
                                  {meeting.date}
                                </span>
                                <span className="text-sm text-foreground">
                                  {meeting.time}
                                </span>
                              </div>
                              <h3 className="mb-1 text-lg font-semibold text-foreground">
                                {meeting.title}
                              </h3>
                              <p className="mb-1 text-sm text-muted-foreground">
                                {meeting.participants.join(', ')}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-primary">
                                  <svg
                                    className="mr-1 h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <span className="text-sm">
                                    {meeting.location}
                                  </span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  meeting.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                  meeting.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                  meeting.status === 'completed' ? 'bg-primary/20 text-primary' :
                                  'bg-destructive/20 text-destructive'
                                }`}>
                                  {meeting.status}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                      </motion.div>
                    ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
})

InteractiveCalendar.displayName = 'InteractiveCalendar'

export default InteractiveCalendar

const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
