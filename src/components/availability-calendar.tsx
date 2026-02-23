'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ServiceProvider } from '@/types'
import { toast } from 'sonner'

interface TimeSlot {
  start: string
  end: string
  available: boolean
}

interface WorkingHours {
  start: string
  end: string
  available: boolean
}

interface DayAvailability {
  [key: string]: TimeSlot[] | TimeSlot | WorkingHours | boolean
}

interface AvailabilityCalendarProps {
  provider: ServiceProvider
  onAvailabilityUpdate?: (availability: DayAvailability) => void
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ 
  provider, 
  onAvailabilityUpdate 
}) => {
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [availability, setAvailability] = useState<DayAvailability>(provider.availability || {})

  const monthNames = [
    'Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė', 'Birželis',
    'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis'
  ]

  const daysOfWeek = ['SK', 'PR', 'AN', 'TR', 'KT', 'PN', 'ŠT']

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = []
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const firstDayOfWeek = firstDay.getDay()

    // Add empty days for the beginning of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, date: null })
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day)
      days.push({ day, date })
    }

    return days
  }

  const getDayAvailability = (dayName: string) => {
    const dayAvailability = availability[dayName]
    
    // Default: day is available and slots are generated from working hours
    if (!dayAvailability) {
      const working = getWorkingHours(dayName)
      return { available: true, slots: generateTimeSlots(working.start, working.end) }
    }
    
    if (Array.isArray(dayAvailability)) {
      return { available: dayAvailability.length > 0, slots: dayAvailability }
    } else if (typeof dayAvailability === 'object' && dayAvailability !== null) {
      return { available: dayAvailability.available, slots: [dayAvailability] }
    } else {
      // If stored as simple boolean, default to generating slots regardless of true/false
      const working = getWorkingHours(dayName)
      return { available: true, slots: generateTimeSlots(working.start, working.end) }
    }
  }

  const getWorkingHours = (dayName: string) => {
    const dayAvailability = availability[dayName]
    
    if (!dayAvailability) return { start: '09:00', end: '17:00' }
    
    if (typeof dayAvailability === 'object' && dayAvailability !== null && 'start' in dayAvailability && 'end' in dayAvailability) {
      return { start: dayAvailability.start, end: dayAvailability.end }
    }
    
    return { start: '09:00', end: '17:00' }
  }

  // Generate 15-minute time slots based on working hours
  const generateTimeSlots = (startTime: string, endTime: string): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    
    let current = new Date(start)
    
    while (current < end) {
      const slotEnd = new Date(current.getTime() + 15 * 60000) // Add 15 minutes
      
      // Don't create a slot that goes beyond the end time
      if (slotEnd <= end) {
        slots.push({
          start: current.toTimeString().slice(0, 5), // Format as HH:MM
          end: slotEnd.toTimeString().slice(0, 5),
          available: true
        })
      }
      
      current = slotEnd
    }
    
    return slots
  }

  // Get existing time slots for a day, or generate default ones based on working hours
  const getTimeSlotsForDay = (dayName: string): TimeSlot[] => {
    const dayAvailability = availability[dayName]
    
    // If nothing stored, generate defaults using working hours
    if (!dayAvailability) {
      const working = getWorkingHours(dayName)
      return generateTimeSlots(working.start, working.end)
    }
    
    // If stored as a simple boolean, generate default slots for both true and false
    if (typeof dayAvailability === 'boolean') {
      const working = getWorkingHours(dayName)
      return generateTimeSlots(working.start, working.end)
    }

    if (Array.isArray(dayAvailability)) {
      return dayAvailability
    } else if (typeof dayAvailability === 'object' && dayAvailability !== null && 'start' in dayAvailability && 'end' in dayAvailability) {
      // If it's working hours format, generate slots
      return generateTimeSlots(dayAvailability.start, dayAvailability.end)
    }
    
    return []
  }

  const getDateAvailability = (date: Date) => {
    const dayName = date.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase()
    return getDayAvailability(dayName)
  }

  const handleDateClick = (date: Date) => {
    const dayName = date.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase()
    setSelectedDay(dayName)
    
    const dayAvailability = getDayAvailability(dayName)
    
    // If no existing slots, generate them based on working hours
    if (dayAvailability.slots.length === 0 && dayAvailability.available) {
      const workingHours = getWorkingHours(dayName)
      const generatedSlots = generateTimeSlots(workingHours.start, workingHours.end)
      setTimeSlots(generatedSlots)
    } else {
      setTimeSlots(dayAvailability.slots)
    }
    
    setShowTimeModal(true)
  }


  const handleToggleTimeSlot = (index: number) => {
    setTimeSlots(prev => prev.map((slot, i) => 
      i === index ? { ...slot, available: !slot.available } : slot
    ))
  }

  const handleSaveAvailability = () => {
    const updatedAvailability = {
      ...availability,
      [selectedDay]: timeSlots.length > 0 ? timeSlots : false
    }
    
    setAvailability(updatedAvailability)
    onAvailabilityUpdate?.(updatedAvailability)
    setShowTimeModal(false)
    
    toast.success(`${selectedDay} prieinamumas sėkmingai atnaujintas.`)
  }

  // Removed direct day toggle and working-hours editor UI; availability is managed via calendar slots

  const calendarDays = generateCalendarDays()

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11)
                setCurrentYear(currentYear - 1)
              } else {
                setCurrentMonth(currentMonth - 1)
              }
            }}
          >
            ←
          </Button>
          <h2 className="text-2xl font-bold">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0)
                setCurrentYear(currentYear + 1)
              } else {
                setCurrentMonth(currentMonth + 1)
              }
            }}
          >
            →
          </Button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map(({ day, date }, index) => {
          if (!day || !date) {
            return <div key={index} className="h-16" />
          }

          const dayAvailability = getDateAvailability(date)
          const dayName = date.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase()
          const isToday = date.toDateString() === new Date().toDateString()
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const isPast = date < today

          return (
            <motion.div
              key={day}
              className={`
                h-16 border rounded-lg cursor-pointer transition-all duration-200
                ${isPast ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                ${dayAvailability.available ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}
              `}
              whileHover={!isPast ? { scale: 1.02 } : {}}
              whileTap={!isPast ? { scale: 0.98 } : {}}
              onClick={() => !isPast && handleDateClick(date)}
            >
              <div className="flex flex-col items-center justify-center h-full p-2">
                <span className={`text-sm font-medium ${isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {day}
                </span>
                {dayAvailability.available && dayName && (() => {
                  try {
                    const slots = getTimeSlotsForDay(dayName)
                    return (
                      <div className="flex items-center space-x-1 mt-1">
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">
                          {slots.length} slot{slots.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )
                  } catch (error) {
                    console.error('Error getting time slots for day:', dayName, error)
                    return null
                  }
                })()}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Working Hours Settings removed */}

      {/* Time Slots Modal */}
      <Dialog open={showTimeModal} onOpenChange={setShowTimeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Valdyti prieinamumą - {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}</DialogTitle>
            <DialogDescription>
              Laiko intervalai automatiškai generuojami 15 minučių intervalais pagal jūsų darbo valandas. Spustelėkite blokus, kad perjungtumėte prieinamumą.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Time Slots grid only */}
            {timeSlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Šiai dienai laiko intervalų nenustatyta</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                {timeSlots.map((slot, index) => (
                  <motion.button
                    key={index}
                    className={`
                      p-3 border rounded-lg text-sm font-medium transition-all duration-200
                      ${slot.available 
                        ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 border-gray-300 text-muted-foreground hover:bg-gray-200'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleTimeSlot(index)}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{slot.start}</div>
                      <div className="text-xs opacity-75">- {slot.end}</div>
                      <div className={`text-xs mt-1 ${slot.available ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {slot.available ? 'Prieinama' : 'Neprieinama'}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
            <div className="text-sm text-muted-foreground text-center">
              Spustelėkite laiko blokus, kad perjungtumėte prieinamumą. Kiekvienas blokas reiškia 15 minučių intervalą.
            </div>
          </div>


            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowTimeModal(false)}>
                Atšaukti
              </Button>
              <Button onClick={handleSaveAvailability}>
                Išsaugoti prieinamumą
              </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AvailabilityCalendar
