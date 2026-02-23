'use client'

import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react'
import { useDeviceDetection } from '@/lib/device-detection'
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
  const { isMobile } = useDeviceDetection()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Pasirinkite datą ir laiką
        </h2>
        <p className="text-muted-foreground">
          Pasirinkite patogų laiką paslaugai
        </p>
      </div>

      <div className="space-y-4">
        <DateTimePicker
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          selectedTime={selectedTimeSlot}
          onTimeSelect={onTimeSelect}
          disabled={(date) => date < new Date()}
        />
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

      <div className={`flex justify-between pt-6 ${isMobile ? 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 space-x-3' : ''}`}>
        <Button 
          variant="outline" 
          onClick={onPrev}
          className={isMobile ? 'flex-1' : ''}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Atgal
        </Button>
        <Button 
          onClick={onNext}
          disabled={!selectedDate || !selectedTimeSlot || loading}
          className={`flex items-center space-x-2 ${isMobile ? 'flex-1' : ''}`}
        >
          <span>Tęsti</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
