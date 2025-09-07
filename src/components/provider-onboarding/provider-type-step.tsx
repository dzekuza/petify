'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { OnboardingData, ProviderType } from '@/types/onboarding'
import { ArrowRight, Users, Building2, Home, Store } from 'lucide-react'

interface ProviderTypeStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
}

const providerTypes = [
  {
    id: 'individual',
    name: 'Individual Provider',
    description: 'I work independently and provide services directly to pet owners',
    icon: Users,
    features: [
      'Set your own schedule',
      'Direct client relationships',
      'Keep 100% of your earnings',
      'Flexible service offerings'
    ]
  },
  {
    id: 'business',
    name: 'Business/Company',
    description: 'I represent a business or company that provides pet services',
    icon: Building2,
    features: [
      'Multiple service providers',
      'Business branding',
      'Team management',
      'Corporate partnerships'
    ]
  },
  {
    id: 'home_based',
    name: 'Home-Based Business',
    description: 'I operate a pet service business from my home',
    icon: Home,
    features: [
      'Home-based operations',
      'Lower overhead costs',
      'Personalized service',
      'Local community focus'
    ]
  },
  {
    id: 'franchise',
    name: 'Franchise Owner',
    description: 'I own or operate a franchise of a pet service brand',
    icon: Store,
    features: [
      'Established brand recognition',
      'Proven business model',
      'Marketing support',
      'Training programs'
    ]
  }
]

export default function ProviderTypeStep({ data, onUpdate, onNext }: ProviderTypeStepProps) {
  const [selectedType, setSelectedType] = useState(data.providerType || '')
  const [error, setError] = useState('')

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
    setError('')
  }

  const handleNext = () => {
    if (!selectedType) {
      setError('Please select your provider type')
      return
    }

    onUpdate({ providerType: selectedType as ProviderType })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">What type of provider are you?</h2>
        <p className="text-muted-foreground mt-2">
          This helps us customize your onboarding experience and show you relevant information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providerTypes.map((type) => {
          const IconComponent = type.icon
          return (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                selectedType === type.id
                  ? 'ring-2 ring-primary border-primary bg-primary/5'
                  : 'border-muted-foreground/25'
              }`}
              onClick={() => handleTypeSelect(type.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedType === type.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{type.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {type.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-muted-foreground rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end pt-6">
        <Button onClick={handleNext} disabled={!selectedType} className="flex items-center space-x-2">
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
