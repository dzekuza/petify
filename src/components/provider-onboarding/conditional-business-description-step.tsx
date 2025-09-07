'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { OnboardingData, ProviderType } from '@/types/onboarding'

interface ConditionalBusinessDescriptionStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const getBusinessDescriptionPlaceholder = (providerType: ProviderType): string => {
  switch (providerType) {
    case 'grooming':
      return "Tell us about your grooming services and experience..."
    case 'training':
      return "Describe your training methods and expertise..."
    case 'veterinary':
      return "Tell us about your veterinary services and qualifications..."
    case 'ads':
      return "Describe your pet advertising services..."
    default:
      return "Describe your business..."
  }
}

const getBusinessDescriptionLabel = (providerType: ProviderType): string => {
  switch (providerType) {
    case 'grooming':
      return "About Your Grooming Services"
    case 'training':
      return "About Your Training Services"
    case 'veterinary':
      return "About Your Veterinary Services"
    case 'ads':
      return "About Your Advertising Services"
    default:
      return "Business Description"
  }
}

const getBusinessDescriptionHint = (providerType: ProviderType): string => {
  switch (providerType) {
    case 'grooming':
      return "Share your grooming experience, techniques, and what makes your services special"
    case 'training':
      return "Describe your training methods, certifications, and success stories"
    case 'veterinary':
      return "Explain your medical expertise, equipment, and approach to pet care"
    case 'ads':
      return "Describe how you help with pet adoption, sales, and advertising"
    default:
      return "Help customers understand what makes your business special"
  }
}

export default function ConditionalBusinessDescriptionStep({ data, onUpdate, onNext, onPrevious }: ConditionalBusinessDescriptionStepProps) {
  const [businessDescription, setBusinessDescription] = useState(data.businessDescription || '')
  const [error, setError] = useState('')


  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          {getBusinessDescriptionHint(data.providerType as ProviderType)}
        </p>
      </div>

      <div className="max-w-2xl">
        <Textarea
          placeholder={getBusinessDescriptionPlaceholder(data.providerType as ProviderType)}
          value={businessDescription}
          onChange={(e) => {
            const value = e.target.value
            setBusinessDescription(value)
            setError('')
            onUpdate({ businessDescription: value })
          }}
          className="min-h-32 text-base"
          maxLength={500}
        />
        <div className="text-sm text-muted-foreground mt-2">
          {businessDescription.length}/500 characters
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
