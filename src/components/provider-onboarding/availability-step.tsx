'use client'

import { useState } from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { OnboardingData } from '@/types/onboarding'

interface AvailabilityStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const daysOfWeek = [
  { id: 'monday', name: 'Monday', short: 'Mon' },
  { id: 'tuesday', name: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', name: 'Wednesday', short: 'Wed' },
  { id: 'thursday', name: 'Thursday', short: 'Thu' },
  { id: 'friday', name: 'Friday', short: 'Fri' },
  { id: 'saturday', name: 'Saturday', short: 'Sat' },
  { id: 'sunday', name: 'Sunday', short: 'Sun' }
]

export default function AvailabilityStep({ data, onUpdate, onNext, onPrevious }: AvailabilityStepProps) {
  const [availability, setAvailability] = useState(data.availability || {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  })
  const [error, setError] = useState('')


  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Select the days you're available to provide services
        </p>
      </div>

      <Card className="py-6">
        <CardContent>
          <CardTitle className="text-lg mb-4">Available Days</CardTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {daysOfWeek.map((day) => (
              <div key={day.id} className="flex items-center space-x-2">
                <Checkbox
                  id={day.id}
                  checked={availability[day.id as keyof typeof availability]}
                  onCheckedChange={() => {
                    const newAvailability = {
                      ...availability,
                      [day.id]: !availability[day.id as keyof typeof availability]
                    }
                    setAvailability(newAvailability)
                    setError('')
                    onUpdate({ availability: newAvailability })
                  }}
                />
                <label htmlFor={day.id} className="text-sm font-medium cursor-pointer">
                  {day.name}
                </label>
              </div>
            ))}
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
