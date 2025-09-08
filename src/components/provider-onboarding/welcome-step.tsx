'use client'

import { OnboardingData } from '@/types/onboarding'
import { OnboardingStepper } from './onboarding-stepper'

interface WelcomeStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const videoPetFamily = "/A dog breathing, a cat wagging its tail and turning its head, a parrot walking side to side and flapping its wings, a horse twitching its ears and swinging its tail, and a person subtly bouncing..mp4"

export default function WelcomeStep({ data, onUpdate, onNext, onPrevious }: WelcomeStepProps) {
  return (
    <div className="bg-neutral-50 relative size-full min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="flex items-center justify-center h-full px-4 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-[1200px] gap-8">
            {/* Mobile: Video on top */}
            <div className="lg:hidden w-full max-w-[400px]">
              <video
                src={videoPetFamily}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto rounded-lg"
                aria-label="Pet Family Video"
              />
            </div>

            {/* Text Content */}
            <div className="w-full lg:w-[522px] text-center lg:text-left">
              <div className="flex flex-col gap-3.5 items-center lg:items-start justify-start text-black">
                <div className="text-sm text-gray-600 w-full">
                  Pirmas žingsnis
                </div>
                <h1 className="text-3xl font-bold w-full">
                  Papasakokite apie savo paslaugas
                </h1>
                <p className="text-base text-gray-600 w-full">
                  Netrukus paklausime jusu papasakoti placiau apie savo teikiamas paslaugas, lokacijas, kainas ir kita
                </p>
              </div>
            </div>

            {/* Desktop: Pet Family Video */}
            <div className="hidden lg:block">
              <video
                src={videoPetFamily}
                autoPlay
                loop
                muted
                playsInline
                className="w-[500px] h-[500px] object-cover rounded-lg"
                aria-label="Pet Family Video"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Component */}
      <OnboardingStepper
        currentStep={1}
        totalSteps={7}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    </div>
  )
}
