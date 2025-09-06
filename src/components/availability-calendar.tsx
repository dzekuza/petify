'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, Check, X, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [newTimeSlot, setNewTimeSlot] = useState({ start: '09:00', end: '17:00' })
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [availability, setAvailability] = useState<DayAvailability>(provider.availability || {})

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

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
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    return getDayAvailability(dayName)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
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

  const handleAddTimeSlot = () => {
    const newSlot: TimeSlot = {
      start: newTimeSlot.start,
      end: newTimeSlot.end,
      available: true
    }
    
    setTimeSlots(prev => [...prev, newSlot])
    setNewTimeSlot({ start: '09:00', end: '17:00' })
  }

  const handleRemoveTimeSlot = (index: number) => {
    setTimeSlots(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateTimeSlot = (index: number, field: keyof TimeSlot, value: string | boolean) => {
    setTimeSlots(prev => prev.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
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
      title: 'Availability Updated',
      message: `Availability for ${selectedDay} has been updated successfully.`
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
      title: 'Availability Updated',
      message: `${dayName} availability has been ${!currentAvailability.available ? 'enabled' : 'disabled'}.`
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
          const isToday = date.toDateString() === new Date().toDateString()
          const isPast = date < new Date().setHours(0, 0, 0, 0)

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
                {dayAvailability.available && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">
                      {getTimeSlotsForDay(dayName).length} slot{getTimeSlotsForDay(dayName).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Working Hours Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Working Hours</CardTitle>
          <CardDescription>
            Set your working hours for each day of the week
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
                            Available
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Unavailable
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {dayAvailability.available && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <Label htmlFor={`${dayName}-start`} className="text-xs text-gray-500">From</Label>
                            <Input
                              id={`${dayName}-start`}
                              type="time"
                              value={workingHours.start}
                              onChange={(e) => handleUpdateWorkingHours(dayName, 'start', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={`${dayName}-end`} className="text-xs text-gray-500">To</Label>
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
                          {generateTimeSlots(workingHours.start, workingHours.end).length} slots (15 min each)
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
            <DialogTitle>Manage Availability - {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}</DialogTitle>
            <DialogDescription>
              Time slots are automatically generated in 15-minute intervals based on your working hours. You can modify individual slots or add custom ones.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Time Slots */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium">Current Time Slots ({timeSlots.length} slots)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const workingHours = getWorkingHours(selectedDay)
                    const regeneratedSlots = generateTimeSlots(workingHours.start, workingHours.end)
                    setTimeSlots(regeneratedSlots)
                    addNotification({
                      type: 'success',
                      title: 'Time Slots Regenerated',
                      message: `Generated ${regeneratedSlots.length} slots based on working hours (${workingHours.start} - ${workingHours.end})`
                    })
                  }}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Regenerate from Working Hours
                </Button>
              </div>
              {timeSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No time slots set for this day</p>
                  <p className="text-sm mt-1">Click "Regenerate from Working Hours" to create slots</p>
                </div>
              ) : (
                <div className="space-y-3 mt-3 max-h-60 overflow-y-auto">
                  {timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`start-${index}`}>Start Time</Label>
                          <Input
                            id={`start-${index}`}
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleUpdateTimeSlot(index, 'start', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`end-${index}`}>End Time</Label>
                          <Input
                            id={`end-${index}`}
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleUpdateTimeSlot(index, 'end', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${slot.available ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateTimeSlot(index, 'available', !slot.available)}
                          className={slot.available ? 'text-green-600' : 'text-gray-600'}
                        >
                          {slot.available ? 'Available' : 'Unavailable'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveTimeSlot(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Time Slot */}
            <div>
              <Label className="text-base font-medium">Add New Time Slot</Label>
              <div className="flex items-end space-x-3 mt-3">
                <div className="flex-1">
                  <Label htmlFor="new-start">Start Time</Label>
                  <Input
                    id="new-start"
                    type="time"
                    value={newTimeSlot.start}
                    onChange={(e) => setNewTimeSlot(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="new-end">End Time</Label>
                  <Input
                    id="new-end"
                    type="time"
                    value={newTimeSlot.end}
                    onChange={(e) => setNewTimeSlot(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddTimeSlot} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowTimeModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAvailability}>
                Save Availability
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AvailabilityCalendar
