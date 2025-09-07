'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OnboardingData } from '@/app/provider/onboarding/page'

interface BusinessNameStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
}

export function BusinessNameStep({ data, onUpdate, onNext }: BusinessNameStepProps) {
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!data.businessName.trim()) {
      setError('Business name is required')
      return
    }
    setError('')
    onNext()
  }

  const handleInputChange = (value: string) => {
    onUpdate({ businessName: value })
    if (error) setError('')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Input
            value={data.businessName}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter your business name"
            className={error ? 'border-red-500' : ''}
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>This is the name that customers will see when they book your services.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} className="px-8">
          Continue
        </Button>
      </div>
    </div>
  )
}
