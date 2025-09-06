'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ServiceProvider } from '@/types'
import { useNotifications } from '@/contexts/notifications-context'

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
  const { addNotification } = useNotifications()
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
    
    if (!dayAvailability) return { available: false, slots: [] }
    
    if (Array.isArray(dayAvailability)) {
      return { available: dayAvailability.length > 0, slots: dayAvailability }
    } else if (typeof dayAvailability === 'object' && dayAvailability !== null) {
      return { available: dayAvailability.available, slots: [dayAvailability] }
    } else {
      return { available: Boolean(dayAvailability), slots: [] }
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
    
    if (!dayAvailability) return []
    
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
    
    addNotification({
      type: 'success',
      title: 'Prieinamumas atnaujintas',
      message: `${selectedDay} prieinamumas sėkmingai atnaujintas.`
    })
  }

  const handleToggleDayAvailability = (dayName: string) => {
    const currentAvailability = getDayAvailability(dayName)
    const workingHours = getWorkingHours(dayName)
    
    let updatedAvailability
    
    if (!currentAvailability.available) {
      // Enable the day and generate time slots based on working hours
      const generatedSlots = generateTimeSlots(workingHours.start, workingHours.end)
      updatedAvailability = {
        ...availability,
        [dayName]: generatedSlots
      }
    } else {
      // Disable the day
      updatedAvailability = {
        ...availability,
        [dayName]: false
      }
    }
    
    setAvailability(updatedAvailability)
    onAvailabilityUpdate?.(updatedAvailability)
    
    addNotification({
      type: 'success',
      title: 'Prieinamumas atnaujintas',
      message: `${dayName} prieinamumas ${!currentAvailability.available ? 'įjungtas' : 'išjungtas'}.`
    })
  }

  const handleUpdateWorkingHours = (dayName: string, field: 'start' | 'end', value: string) => {
    const currentAvailability = getDayAvailability(dayName)
    const workingHours = getWorkingHours(dayName)
    
    const newStart = field === 'start' ? value : workingHours.start
    const newEnd = field === 'end' ? value : workingHours.end
    
    // Generate new time slots based on updated working hours
    const newTimeSlots = generateTimeSlots(newStart, newEnd)
    
    const updatedAvailability = {
      ...availability,
      [dayName]: newTimeSlots.length > 0 ? newTimeSlots : {
        start: newStart,
        end: newEnd,
        available: currentAvailability.available
      }
    }
    
    setAvailability(updatedAvailability)
    onAvailabilityUpdate?.(updatedAvailability)
  }

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
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
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
                <span className={`text-sm font-medium ${isPast ? 'text-gray-400' : 'text-gray-900'}`}>
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

      {/* Working Hours Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Darbo valandos</CardTitle>
          <CardDescription>
            Nustatykite savo darbo valandas kiekvienai savaitės dienai
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {daysOfWeek.map((day) => {
              const dayName = day.toLowerCase()
              const dayAvailability = getDayAvailability(dayName)
              const workingHours = getWorkingHours(dayName)
              
              return (
                <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{day}</span>
                      <Button
                        variant={dayAvailability.available ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleDayAvailability(dayName)}
                      >
                        {dayAvailability.available ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Prieinama
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Neprieinama
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {dayAvailability.available && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <Label htmlFor={`${dayName}-start`} className="text-xs text-gray-500">Nuo</Label>
                            <Input
                              id={`${dayName}-start`}
                              type="time"
                              value={workingHours.start}
                              onChange={(e) => handleUpdateWorkingHours(dayName, 'start', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={`${dayName}-end`} className="text-xs text-gray-500">Iki</Label>
                            <Input
                              id={`${dayName}-end`}
                              type="time"
                              value={workingHours.end}
                              onChange={(e) => handleUpdateWorkingHours(dayName, 'end', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          {generateTimeSlots(workingHours.start, workingHours.end).length} intervalai (po 15 min)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

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
            {/* Current Time Slots */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium">Dabartiniai laiko intervalai ({timeSlots.length} intervalai)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const workingHours = getWorkingHours(selectedDay)
                    const regeneratedSlots = generateTimeSlots(workingHours.start, workingHours.end)
                    setTimeSlots(regeneratedSlots)
                    addNotification({
                      type: 'success',
                      title: 'Laiko intervalai atnaujinti',
                      message: `Sugeneruota ${regeneratedSlots.length} intervalų pagal darbo valandas (${workingHours.start} - ${workingHours.end})`
                    })
                  }}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Atnaujinti pagal darbo valandas
                </Button>
              </div>
              {timeSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Šiai dienai laiko intervalų nenustatyta</p>
                  <p className="text-sm mt-1">Spustelėkite "Atnaujinti pagal darbo valandas", kad sukurtumėte intervalus</p>
                </div>
              ) : (
                <div className="mt-3">
                  <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                    {timeSlots.map((slot, index) => (
                      <motion.button
                        key={index}
                        className={`
                          p-3 border rounded-lg text-sm font-medium transition-all duration-200
                          ${slot.available 
                            ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleToggleTimeSlot(index)}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{slot.start}</div>
                          <div className="text-xs opacity-75">- {slot.end}</div>
                          <div className={`text-xs mt-1 ${slot.available ? 'text-green-600' : 'text-gray-500'}`}>
                            {slot.available ? 'Prieinama' : 'Neprieinama'}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-gray-600 text-center">
                    Spustelėkite laiko blokus, kad perjungtumėte prieinamumą. Kiekvienas blokas reiškia 15 minučių intervalą.
                  </div>
                </div>
              )}
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AvailabilityCalendar
