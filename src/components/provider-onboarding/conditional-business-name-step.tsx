'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { OnboardingData, ProviderType } from '@/types/onboarding'

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


  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
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
            const value = e.target.value
            setBusinessName(value)
            setError('')
            onUpdate({ businessName: value })
          }}
          className="text-lg"
        />
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
