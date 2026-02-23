'use client'

import { useState } from 'react'
import { OnboardingData } from '@/types/onboarding'
import OnboardingLayout from './onboarding-layout'
import BottomNavigation from './bottom-navigation'
import ExitButton from './exit-button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface LocationSelectionStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  isEditMode?: boolean
  onSave?: () => void
  onExitEdit?: () => void
}

const locationOptions = [
  {
    id: 'single',
    name: 'Viena lokacija',
    description: 'Teikiu paslaugą vienintelėje lokacijoje'
  },
  {
    id: 'multiple',
    name: 'Kelios lokacijos',
    description: 'Teikiu paslaugą keliose lokacijose'
  }
]

export default function LocationSelectionStep({ data, onUpdate, onNext, onPrevious, isEditMode, onSave, onExitEdit }: LocationSelectionStepProps) {
  const [selectedLocationType, setSelectedLocationType] = useState(data.locationType || '')

  const handleLocationTypeSelect = (locationType: string) => {
    setSelectedLocationType(locationType)
    onUpdate({ locationType: locationType as 'single' | 'multiple' })
  }

  return (
    <OnboardingLayout
      bottom={
        <BottomNavigation
          currentStep={3}
          totalSteps={8}
          onNext={onNext}
          onPrevious={onPrevious}
          isNextDisabled={!selectedLocationType}
          isEditMode={isEditMode}
          onSave={onSave}
        />
      }
    >
      <ExitButton onExit={onExitEdit || (() => {})} isEditMode={isEditMode} />
      <div className="w-full max-w-[720px] mx-auto">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-black">Paslaugų teikimo lokacijos</h1>
          <div className="flex flex-col gap-2 w-full">
                {locationOptions.map((option) => (
                  <Card 
                    key={option.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedLocationType === option.id
                        ? 'border-2 border-black'
                        : 'border border-border'
                    }`}
                    onClick={() => handleLocationTypeSelect(option.id)}
                  >
                    <CardContent className="px-6 py-4">
                      <div className="flex gap-3 items-center">
                        <div className="flex flex-col gap-1 flex-1">
                          <CardTitle className="text-base">
                            {option.name}
                          </CardTitle>
                          <CardDescription>
                            {option.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
