'use client'

import { Button } from '@/components/ui/button'

interface BottomNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  isNextDisabled?: boolean
  previousText?: string
  nextText?: string
  isEditMode?: boolean
  onSave?: () => void
  isSaveDisabled?: boolean
}

export default function BottomNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isNextDisabled = false,
  previousText = 'Atgal',
  nextText = 'Kitas',
  isEditMode = false,
  onSave,
  isSaveDisabled = false
}: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 h-20 left-0 right-0 bg-white">
      {/* Progress Bar */}
      <div className="absolute flex gap-2.5 items-center justify-start left-0 top-0 w-full px-4">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`basis-0 grow h-2 min-h-px min-w-px shrink-0 rounded-full ${
              index < currentStep ? 'bg-black' : 'bg-[#ebebeb]'
            }`}
          />
        ))}
      </div>
      
      {/* Navigation Buttons */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <Button 
          variant="ghost"
          onClick={onPrevious}
          className="text-black hover:bg-gray-100"
        >
          {previousText}
        </Button>
      </div>
      
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
        {isEditMode && onSave && (
          <Button 
            variant="outline"
            onClick={onSave}
            disabled={isSaveDisabled}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Išsaugoti
          </Button>
        )}
        <Button 
          variant="default"
          onClick={onNext}
          disabled={isNextDisabled}
          className="bg-black hover:bg-gray-800 text-white"
        >
          {nextText}
        </Button>
      </div>
    </div>
  )
}
