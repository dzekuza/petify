'use client'

import { useState } from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OnboardingData } from '@/types/onboarding'

interface WorkingHoursStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const timeSlots = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30'
]

export default function WorkingHoursStep({ data, onUpdate, onNext, onPrevious }: WorkingHoursStepProps) {
  const [workingHours, setWorkingHours] = useState(data.workingHours || {
    start: '09:00',
    end: '17:00'
  })
  const [error, setError] = useState('')

  const handleStartTimeChange = (startTime: string) => {
    const updatedHours = { ...workingHours, start: startTime }
    setWorkingHours(updatedHours)
    setError('')
    onUpdate({ workingHours: updatedHours })
  }

  const handleEndTimeChange = (endTime: string) => {
    const updatedHours = { ...workingHours, end: endTime }
    setWorkingHours(updatedHours)
    setError('')
    onUpdate({ workingHours: updatedHours })
  }


  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Set your typical working hours (you can adjust this later)
        </p>
      </div>

      <Card className="py-6">
        <CardContent>
          <CardTitle className="text-lg mb-4">Daily Schedule</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Select value={workingHours.start} onValueChange={handleStartTimeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Select value={workingHours.end} onValueChange={handleEndTimeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

    </div>
  )
}
