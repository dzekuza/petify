'use client'

import { useState } from 'react'
import { OnboardingData, ProviderType } from '@/types/onboarding'
import { OnboardingStepper } from './onboarding-stepper'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Image from 'next/image'

interface ProviderTypeStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const providerTypes = [
  {
    id: 'grooming',
    name: 'Kirpyklos',
    description: 'Pet grooming and beauty services',
    icon: '/Animal_Care_Icon Background Removed.png',
    features: [
      'Pet grooming and styling',
      'Bath and hygiene services',
      'Nail trimming and care',
      'Professional pet beauty'
    ]
  },
  {
    id: 'training',
    name: 'Dresūra',
    description: 'Pet training and behavior services',
    icon: '/Pet_Training_Icon Background Removed.png',
    features: [
      'Obedience training',
      'Behavior modification',
      'Puppy training programs',
      'Specialized training services'
    ]
  },
  {
    id: 'veterinary',
    name: 'Veterinarijos',
    description: 'Veterinary and medical services',
    icon: '/Pet_Veterinary_Icon Background Removed.png',
    features: [
      'Health checkups and exams',
      'Vaccinations and treatments',
      'Emergency care services',
      'Medical consultations'
    ]
  },
  {
    id: 'ads',
    name: 'Skelbimai',
    description: 'Pet advertising and sales services',
    icon: '/Pet_Ads_Icon Background Removed.png',
    features: [
      'Pet adoption listings',
      'Pet sales advertisements',
      'Breeding announcements',
      'Pet rehoming services'
    ]
  }
]

export default function ProviderTypeStep({ data, onUpdate, onNext, onPrevious }: ProviderTypeStepProps) {
  const [selectedType, setSelectedType] = useState(data.providerType || '')
  const [error, setError] = useState('')

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
    setError('')
    onUpdate({ providerType: typeId as ProviderType })
  }


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {providerTypes.map((type) => (
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
              <div className="flex items-center space-x-4">
                <Image
                  src={type.icon}
                  alt={type.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
                <div className="text-left">
                  <CardTitle className="text-lg mb-2">{type.name}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stepper Component */}
      <OnboardingStepper
        currentStep={8}
        totalSteps={8}
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!selectedType}
        nextText="Baigti"
      />
    </div>
  )
}
