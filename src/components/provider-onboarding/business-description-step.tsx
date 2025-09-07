'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { OnboardingData } from '@/app/provider/onboarding/page'
import { ArrowLeft } from 'lucide-react'

interface BusinessDescriptionStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

export function BusinessDescriptionStep({ data, onUpdate, onNext, onPrevious }: BusinessDescriptionStepProps) {
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!data.businessDescription.trim()) {
      setError('Business description is required')
      return
    }
    if (data.businessDescription.trim().length < 50) {
      setError('Please provide a more detailed description (at least 50 characters)')
      return
    }
    setError('')
    onNext()
  }

  const handleInputChange = (value: string) => {
    onUpdate({ businessDescription: value })
    if (error) setError('')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Textarea
            value={data.businessDescription}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Describe your business and what makes it special..."
            rows={6}
            className={error ? 'border-red-500' : ''}
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Tell customers about your business, your experience, and what makes you unique. This helps build trust and attract the right customers.</p>
          <p className="mt-2">Characters: {data.businessDescription.length}/500</p>
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
