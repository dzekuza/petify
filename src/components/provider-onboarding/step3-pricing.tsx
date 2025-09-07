'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OnboardingData } from '@/app/provider/onboarding/page'
import { ArrowLeft } from 'lucide-react'

interface Step3PricingProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const daysOfWeek = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' }
]

const timeSlots = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
]

export function Step3Pricing({ data, onUpdate, onNext, onPrevious }: Step3PricingProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (data.basePrice <= 0) {
      newErrors.basePrice = 'Base price must be greater than 0'
    }

    if (data.pricePerHour <= 0) {
      newErrors.pricePerHour = 'Hourly rate must be greater than 0'
    }

    const hasAvailableDay = Object.values(data.availability).some(available => available)
    if (!hasAvailableDay) {
      newErrors.availability = 'Please select at least one available day'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      onNext()
    }
  }

  const handlePriceChange = (field: 'basePrice' | 'pricePerHour', value: string) => {
    const numValue = parseFloat(value) || 0
    onUpdate({ [field]: numValue })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    onUpdate({
      availability: {
        ...data.availability,
        [day]: checked
      }
    })
    if (errors.availability) {
      setErrors(prev => ({ ...prev, availability: '' }))
    }
  }

  const handleWorkingHoursChange = (field: 'start' | 'end', value: string) => {
    onUpdate({
      workingHours: {
        ...data.workingHours,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Pricing Section */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Set Your Pricing</Label>
          <p className="text-sm text-muted-foreground mt-1">
            You can adjust these prices later in your provider dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="py-6">
            <CardHeader>
              <CardTitle className="text-lg">Base Service Price</CardTitle>
              <CardDescription>
                The minimum price for your main service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.basePrice || ''}
                    onChange={(e) => handlePriceChange('basePrice', e.target.value)}
                    placeholder={`Base Price (${data.currency}) *`}
                    className={errors.basePrice ? 'border-red-500' : ''}
                  />
                </div>
                {errors.basePrice && (
                  <p className="text-sm text-red-500">{errors.basePrice}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="py-6">
            <CardHeader>
              <CardTitle className="text-lg">Hourly Rate</CardTitle>
              <CardDescription>
                Additional charges for extended services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="pricePerHour"
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.pricePerHour || ''}
                    onChange={(e) => handlePriceChange('pricePerHour', e.target.value)}
                    placeholder={`Per Hour (${data.currency}) *`}
                    className={errors.pricePerHour ? 'border-red-500' : ''}
                  />
                </div>
                {errors.pricePerHour && (
                  <p className="text-sm text-red-500">{errors.pricePerHour}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Availability Section */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">When are you available? *</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Select the days you're available to provide services
          </p>
        </div>

        <Card className="py-6">
          <CardHeader>
            <CardTitle className="text-lg">Available Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {daysOfWeek.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.id}
                    checked={data.availability[day.id as keyof typeof data.availability]}
                    onCheckedChange={(checked) => handleAvailabilityChange(day.id, checked as boolean)}
                  />
                  <Label htmlFor={day.id} className="text-sm font-normal cursor-pointer">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.availability && (
              <p className="text-sm text-red-500 mt-2">{errors.availability}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Working Hours Section */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Working Hours</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Set your typical working hours (you can adjust this later)
          </p>
        </div>

        <Card className="py-6">
          <CardHeader>
            <CardTitle className="text-lg">Daily Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Select
                  value={data.workingHours.start}
                  onValueChange={(value) => handleWorkingHoursChange('start', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Start Time" />
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
                <Select
                  value={data.workingHours.end}
                  onValueChange={(value) => handleWorkingHoursChange('end', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="End Time" />
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
      </div>

      {/* Currency Selection */}
      <div className="space-y-4">
        <div className="w-48">
          <Select
            value={data.currency}
            onValueChange={(value) => onUpdate({ currency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} className="px-8">
          Continue
        </Button>
      </div>
    </div>
  )
}
