'use client'

import { useState } from 'react'
import { OnboardingData } from '@/types/onboarding'
import { OnboardingStepper } from './onboarding-stepper'

interface LocationSelectionStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
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

export default function LocationSelectionStep({ data, onUpdate, onNext, onPrevious }: LocationSelectionStepProps) {
  const [selectedLocationType, setSelectedLocationType] = useState(data.locationType || '')

  const handleLocationTypeSelect = (locationType: string) => {
    setSelectedLocationType(locationType)
    onUpdate({ locationType: locationType as 'single' | 'multiple' })
  }

  return (
    <div className="bg-neutral-50 relative size-full min-h-screen flex flex-col" data-name="Location Selection">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-center min-h-full px-4 py-8 pb-20">
          <div className="w-full max-w-[522px]">
            <div className="flex flex-col gap-6 items-start justify-start">
              {/* Title */}
              <h1 className="text-3xl font-bold text-black w-full">
                Paslaugų teikimo lokacijos
              </h1>
              
              {/* Location Options */}
              <div className="flex flex-col gap-2 w-full">
                {locationOptions.map((option) => (
                  <div 
                    key={option.id}
                    className={`bg-card text-card-foreground rounded-xl shadow-sm py-6 cursor-pointer transition-all hover:shadow-md ${
                      selectedLocationType === option.id
                        ? 'border-2 border-black'
                        : 'border border-gray-200'
                    }`}
                    onClick={() => handleLocationTypeSelect(option.id)}
                  >
                    <div className="flex gap-3 items-center px-6">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-semibold text-base text-black">
                          {option.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Component */}
      <OnboardingStepper
        currentStep={3}
        totalSteps={7}
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!selectedLocationType}
      />
    </div>
  )
}
