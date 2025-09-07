'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OnboardingData } from '@/types/onboarding'
import { ArrowLeft } from 'lucide-react'

interface ContactInformationStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

export function ContactInformationStep({ data, onUpdate, onNext, onPrevious }: ContactInformationStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNext = () => {
    const newErrors: Record<string, string> = {}

    if (!data.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      onNext()
    }
  }

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    onUpdate({ [field]: value })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Input
            type="tel"
            value={data.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Phone Number *"
            className={errors.phone ? 'border-red-500' : ''}
            autoFocus
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <Input
            type="url"
            value={data.website || ''}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="Website (Optional)"
          />
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Customers will use this information to contact you directly if needed.</p>
        </div>
      </div>

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
