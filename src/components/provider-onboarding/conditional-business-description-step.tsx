'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { OnboardingData, ProviderType } from '@/types/onboarding'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface ConditionalBusinessDescriptionStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const getBusinessDescriptionPlaceholder = (providerType: ProviderType): string => {
  switch (providerType) {
    case 'individual':
      return "Tell us about yourself and your experience with pets..."
    case 'business':
      return "Describe your company and the services you provide..."
    case 'home_based':
      return "Describe your home-based business and what makes it special..."
    case 'franchise':
      return "Tell us about your franchise location and services..."
    default:
      return "Describe your business..."
  }
}

const getBusinessDescriptionLabel = (providerType: ProviderType): string => {
  switch (providerType) {
    case 'individual':
      return "About You"
    case 'business':
      return "About Your Company"
    case 'home_based':
      return "About Your Home-Based Business"
    case 'franchise':
      return "About Your Franchise Location"
    default:
      return "Business Description"
  }
}

const getBusinessDescriptionHint = (providerType: ProviderType): string => {
  switch (providerType) {
    case 'individual':
      return "Share your background, experience, and what makes you passionate about pet care"
    case 'business':
      return "Describe your company's mission, team, and the quality of services you provide"
    case 'home_based':
      return "Explain what makes your home-based business unique and why customers should choose you"
    case 'franchise':
      return "Describe your franchise location, team, and how you maintain brand standards"
    default:
      return "Help customers understand what makes your business special"
  }
}

export default function ConditionalBusinessDescriptionStep({ data, onUpdate, onNext, onPrevious }: ConditionalBusinessDescriptionStepProps) {
  const [businessDescription, setBusinessDescription] = useState(data.businessDescription || '')
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!businessDescription.trim()) {
      setError('Please provide a description')
      return
    }

    if (businessDescription.trim().length < 50) {
      setError('Please provide a more detailed description (at least 50 characters)')
      return
    }

    onUpdate({ businessDescription: businessDescription.trim() })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{getBusinessDescriptionLabel(data.providerType as ProviderType)}</h2>
        <p className="text-muted-foreground mt-2">
          {getBusinessDescriptionHint(data.providerType as ProviderType)}
        </p>
      </div>

      <div className="max-w-2xl">
        <Textarea
          placeholder={getBusinessDescriptionPlaceholder(data.providerType as ProviderType)}
          value={businessDescription}
          onChange={(e) => {
            setBusinessDescription(e.target.value)
            setError('')
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

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <Button onClick={handleNext} disabled={!businessDescription.trim() || businessDescription.trim().length < 50} className="flex items-center space-x-2">
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
