'use client'

import { useState } from 'react'
import { OnboardingData, ProviderType } from '@/types/onboarding'
import { PageLayout, PageContent } from './page-layout'
import BottomNavigation from './bottom-navigation'
import ExitButton from './exit-button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Image from 'next/image'

interface ProviderTypeStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  isEditMode?: boolean
  onSave?: () => void
  onExitEdit?: () => void
}

const providerTypes = [
  {
    id: 'grooming',
    name: 'Kirpyklos',
    description: 'Pet grooming and beauty services',
    icon: '/image (8).png',
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
    icon: '/image (8).png',
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
    icon: '/image (8).png',
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
    icon: '/image (8).png',
    features: [
      'Pet adoption listings',
      'Pet sales advertisements',
      'Breeding announcements',
      'Pet rehoming services'
    ]
  }
]

export default function ProviderTypeStep({ data, onUpdate, onNext, onPrevious, isEditMode, onSave, onExitEdit }: ProviderTypeStepProps) {
  const [selectedType, setSelectedType] = useState(data.providerType || '')
  const [error, setError] = useState('')

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
    setError('')
    onUpdate({ providerType: typeId as ProviderType })
  }

  return (
    <PageLayout>
      {/* Exit Button */}
      <ExitButton onExit={onExitEdit || (() => {})} isEditMode={isEditMode} />
      
      {/* Main Content */}
      <PageContent>
        <div className="w-full max-w-[522px]">
          <div className="flex flex-col gap-6 items-start justify-start">
            {/* Title */}
            <h1 className="text-3xl font-bold text-black w-full">
              Pasirinkite verslo tipą
            </h1>
            
            <div className="space-y-6 w-full">
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
            </div>
          </div>
        </div>
      </PageContent>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentStep={8}
        totalSteps={8}
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!selectedType}
        nextText="Baigti"
        isEditMode={isEditMode}
        onSave={onSave}
      />
    </PageLayout>
  )
}
