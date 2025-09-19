'use client'

import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react'
import type { BookingStepProps } from './types'

export function BookingStep3({ 
  selectedDate, 
  selectedTimeSlot, 
  availabilityData, 
  onDateSelect, 
  onTimeSelect, 
  onNext, 
  onPrev, 
  loading = false 
}: BookingStepProps) {
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pasirinkite datą ir laiką
        </h2>
        <p className="text-gray-600">
          Pasirinkite patogų laiką paslaugai
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Date Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Pasirinkite datą</h3>
          </div>
          
          <DateTimePicker
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            selectedTime={selectedTimeSlot}
            onTimeSelect={onTimeSelect}
            disabled={(date) => date < new Date()}
          />
        </div>

        {/* Time Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Pasirinkite laiką</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={selectedTimeSlot === time ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeSelect(time)}
                disabled={loading}
                className="text-sm"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Information */}
      {(selectedDate || selectedTimeSlot) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Pasirinkta:</h4>
          <div className="space-y-1 text-sm text-blue-700">
            {selectedDate && (
              <p>📅 Data: {selectedDate.toLocaleDateString('lt-LT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            )}
            {selectedTimeSlot && (
              <p>🕐 Laikas: {selectedTimeSlot}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Atgal
        </Button>
        <Button 
          onClick={onNext}
          disabled={!selectedDate || !selectedTimeSlot || loading}
          className="flex items-center space-x-2"
        >
          <span>Tęsti</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
