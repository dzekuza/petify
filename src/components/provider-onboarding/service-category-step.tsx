'use client'

import { useState } from 'react'
import { OnboardingData } from '@/types/onboarding'
import { OnboardingStepper } from './onboarding-stepper'

interface ServiceCategoryStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const serviceCategories = [
  {
    id: 'training',
    name: 'Dresūra',
    description: 'Profesionalūs treniruotės ir elgesio modifikavimas',
    icon: '/Pet_Training_Icon Background Removed.png'
  },
  {
    id: 'grooming',
    name: 'Kirpyklos',
    description: 'Profesionalūs šukavimo paslaugos jūsų kailuotų draugų',
    icon: '/Animal_Care_Icon Background Removed.png'
  },
  {
    id: 'veterinary',
    name: 'Veterinarijos',
    description: 'Ekspertinė medicinos priežiūra ir sveikatos patikrinimai',
    icon: '/Pet_Veterinary_Icon Background Removed.png'
  },
  {
    id: 'boarding',
    name: 'Prieglauda',
    description: 'Saugūs ir patogūs nakvynės',
    icon: '/Pets_Pairing_Icon Background Removed.png'
  },
  {
    id: 'walking',
    name: 'Šunų vedimas',
    description: 'Kasdienės mankštos ir lauko nuotykiai',
    icon: '/Pet_Ads_Icon Background Removed.png'
  }
]

export default function ServiceCategoryStep({ data, onUpdate, onNext, onPrevious }: ServiceCategoryStepProps) {
  const [selectedCategory, setSelectedCategory] = useState(data.providerType || '')

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    onUpdate({ providerType: categoryId as any })
  }

  return (
    <div className="bg-white relative size-full min-h-screen flex flex-col" data-name="Choose type">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="flex flex-col items-center justify-center h-full px-4 py-8">
          <div className="w-full max-w-4xl">
            <div className="flex flex-col gap-8 items-center justify-center">
              {/* Title */}
              <h1 className="text-3xl font-bold text-black text-center">
                Pasirinkite teikiamos paslaugos tipą
              </h1>
              
              {/* Service Categories Grid - 2x1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {serviceCategories.map((category) => (
                  <div 
                    key={category.id}
                    className={`bg-white rounded-xl shadow-sm py-6 cursor-pointer transition-all hover:shadow-md ${
                      selectedCategory === category.id
                        ? 'border-2 border-black'
                        : 'border border-gray-200'
                    }`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <div className="flex flex-row gap-4 items-center text-left px-6">
                      <div 
                        className="bg-center bg-cover bg-no-repeat w-16 h-16 flex-shrink-0" 
                        style={{ backgroundImage: `url('${category.icon}')` }} 
                      />
                      <div className="flex flex-col gap-2">
                        <h3 className="font-semibold text-lg text-black">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {category.description}
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
        currentStep={2}
        totalSteps={8}
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!selectedCategory}
      />
    </div>
  )
}
