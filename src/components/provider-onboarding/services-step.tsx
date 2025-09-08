'use client'

import { OnboardingData } from '@/types/onboarding'
import { OnboardingStepper } from './onboarding-stepper'
import Image from 'next/image'

interface ServicesStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

export default function ServicesStep({ data, onUpdate, onNext, onPrevious }: ServicesStepProps) {
  const isFormValid = () => {
    return true // Always valid since we removed the form
  }

  return (
    <div className="bg-white relative size-full min-h-screen flex flex-col">
      {/* Main Content - Full Canvas Height */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="flex items-center justify-center h-full px-4 py-8">
          <div className="w-full max-w-6xl">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Mobile: Image on top */}
              <div className="lg:hidden w-full max-w-[400px]">
                <Image
                  src="/image (7) 2.png"
                  alt="Pet Family"
                  width={400}
                  height={400}
                  className="w-full h-auto"
                />
              </div>

              {/* Left Side - Text Content */}
              <div className="flex-1 max-w-[522px] text-center lg:text-left">
                <div className="flex flex-col gap-6 items-center lg:items-start justify-start">
                  {/* Title */}
                  <div className="text-sm text-gray-600 w-full">
                    Ketvirtas žingsnis
                  </div>
                  <h1 className="text-3xl font-bold text-black w-full">
                    Pridėkite paslaugas
                  </h1>
                  <p className="text-base text-gray-600 w-full">
                    Netrukus paklausime jusu papasakoti placiau apie savo teikiamas paslaugas, lokacijas, kainas ir kita
                  </p>
                </div>
              </div>
              
              {/* Desktop: Right Side - Image */}
              <div className="hidden lg:flex flex-1 justify-center">
                <Image
                  src="/image (7) 2.png"
                  alt="Pet Family"
                  width={400}
                  height={400}
                  className="w-full max-w-md h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Component */}
      <OnboardingStepper
        currentStep={6}
        totalSteps={8}
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!isFormValid()}
      />
    </div>
  )
}
