'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OnboardingData, ProviderType } from '@/types/onboarding'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface ConditionalBusinessNameStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const getBusinessNamePlaceholder = (providerType: ProviderType): string => {
  switch (providerType) {
    case 'grooming':
      return "What's your grooming business name?"
    case 'training':
      return "What's your training business name?"
    case 'veterinary':
      return "What's your veterinary clinic name?"
    case 'ads':
      return "What's your business or personal name?"
    default:
      return "What's your business name?"
  }
}

const getBusinessNameLabel = (providerType: ProviderType): string => {
  switch (providerType) {
    case 'grooming':
      return "Grooming Business Name"
    case 'training':
      return "Training Business Name"
    case 'veterinary':
      return "Veterinary Clinic Name"
    case 'ads':
      return "Business or Personal Name"
    default:
      return "Business Name"
  }
}

export default function ConditionalBusinessNameStep({ data, onUpdate, onNext, onPrevious }: ConditionalBusinessNameStepProps) {
  const [businessName, setBusinessName] = useState(data.businessName || '')
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!businessName.trim()) {
      setError('Please enter your business name')
      return
    }

    onUpdate({ businessName: businessName.trim() })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{getBusinessNameLabel(data.providerType as ProviderType)}</h2>
        <p className="text-muted-foreground mt-2">
          {data.providerType === 'ads' 
            ? 'Enter your name or the name you\'d like to use for your services'
            : 'Enter the name that customers will see when booking your services'
          }
        </p>
      </div>

      <div className="max-w-md">
        <Input
          placeholder={getBusinessNamePlaceholder(data.providerType as ProviderType)}
          value={businessName}
          onChange={(e) => {
            setBusinessName(e.target.value)
            setError('')
          }}
          className="text-lg"
        />
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <Button onClick={handleNext} disabled={!businessName.trim()} className="flex items-center space-x-2">
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
