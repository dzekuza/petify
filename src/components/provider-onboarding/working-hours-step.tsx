'use client'

import { useState } from 'react'
import { OnboardingData } from '@/types/onboarding'
import { OnboardingStepper } from './onboarding-stepper'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface WorkingHoursStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

interface DayHours {
  enabled: boolean
  startTime: string
  endTime: string
}

interface WorkingHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

const defaultWorkingHours: WorkingHours = {
  monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  saturday: { enabled: false, startTime: '10:00', endTime: '15:00' },
  sunday: { enabled: false, startTime: '10:00', endTime: '15:00' }
}

const dayNames = [
  { key: 'monday', label: 'Pirmadienis' },
  { key: 'tuesday', label: 'Antradienis' },
  { key: 'wednesday', label: 'Trečiadienis' },
  { key: 'thursday', label: 'Ketvirtadienis' },
  { key: 'friday', label: 'Penktadienis' },
  { key: 'saturday', label: 'Šeštadienis' },
  { key: 'sunday', label: 'Sekmadienis' }
]

export default function WorkingHoursStep({ data, onUpdate, onNext, onPrevious }: WorkingHoursStepProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    data.workingHours || defaultWorkingHours
  )

  const handleDayToggle = (day: keyof WorkingHours, enabled: boolean) => {
    const newWorkingHours = {
      ...workingHours,
      [day]: {
        ...workingHours[day],
        enabled
      }
    }
    setWorkingHours(newWorkingHours)
    onUpdate({ workingHours: newWorkingHours })
  }

  const handleTimeChange = (day: keyof WorkingHours, field: 'startTime' | 'endTime', value: string) => {
    const newWorkingHours = {
      ...workingHours,
      [day]: {
        ...workingHours[day],
        [field]: value
      }
    }
    setWorkingHours(newWorkingHours)
    onUpdate({ workingHours: newWorkingHours })
  }

  const isFormValid = () => {
    return Object.values(workingHours).some(day => day.enabled)
  }

  return (
    <div className="bg-neutral-50 relative size-full min-h-screen flex flex-col" data-name="Working Hours">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-center min-h-full px-4 py-8 pb-20">
          <div className="w-full max-w-2xl">
            <div className="flex flex-col gap-8 items-center justify-center">
              {/* Title */}
              <h1 className="text-3xl font-bold text-black text-center">
                Darbo valandos
              </h1>
              
              {/* Description */}
              <p className="text-base text-gray-600 text-center max-w-md">
                Nurodykite, kada esate prieinamas klientams kiekvieną savaitės dieną
              </p>
              
              {/* Working Hours Form */}
              <div className="w-full space-y-4">
                {dayNames.map(({ key, label }) => {
                  const dayKey = key as keyof WorkingHours
                  const dayData = workingHours[dayKey]
                  
                  return (
                    <div key={dayKey} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={dayKey}
                            checked={dayData.enabled}
                            onCheckedChange={(checked) => handleDayToggle(dayKey, checked as boolean)}
                          />
                          <Label htmlFor={dayKey} className="text-base font-medium text-gray-900">
                            {label}
                          </Label>
                        </div>
                        
                        {dayData.enabled && (
                          <div className="flex items-center space-x-3">
                            <Input
                              id={`${dayKey}-start`}
                              type="time"
                              value={dayData.startTime}
                              onChange={(e) => handleTimeChange(dayKey, 'startTime', e.target.value)}
                              className="w-24"
                            />
                            <span className="text-sm text-gray-600">-</span>
                            <Input
                              id={`${dayKey}-end`}
                              type="time"
                              value={dayData.endTime}
                              onChange={(e) => handleTimeChange(dayKey, 'endTime', e.target.value)}
                              className="w-24"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    const weekdaysHours = {
                      ...defaultWorkingHours,
                      monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                      tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                      wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                      thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                      friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                      saturday: { enabled: false, startTime: '10:00', endTime: '15:00' },
                      sunday: { enabled: false, startTime: '10:00', endTime: '15:00' }
                    }
                    setWorkingHours(weekdaysHours)
                    onUpdate({ workingHours: weekdaysHours })
                  }}
                  className="text-sm"
                >
                  Tik darbo dienos
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const allDaysHours = {
                      ...defaultWorkingHours,
                      monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                      tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                      wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                      thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                      friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
                      saturday: { enabled: true, startTime: '10:00', endTime: '15:00' },
                      sunday: { enabled: true, startTime: '10:00', endTime: '15:00' }
                    }
                    setWorkingHours(allDaysHours)
                    onUpdate({ workingHours: allDaysHours })
                  }}
                  className="text-sm"
                >
                  Visą savaitę
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Component */}
      <OnboardingStepper
        currentStep={6}
        totalSteps={8}
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!isFormValid()}
      />
    </div>
  )
}
