'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { OnboardingData } from '@/types/onboarding'
import { ArrowLeft } from 'lucide-react'

interface ServiceTypeStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const serviceTypes = [
  { id: 'grooming', name: 'Pet Grooming', description: 'Bathing, brushing, nail trimming, and styling', icon: '✂️' },
  { id: 'veterinary', name: 'Veterinary Care', description: 'Health checkups, vaccinations, and medical care', icon: '🏥' },
  { id: 'training', name: 'Pet Training', description: 'Behavioral training and obedience classes', icon: '🎓' },
  { id: 'boarding', name: 'Pet Boarding', description: 'Overnight care and pet sitting services', icon: '🏠' },
  { id: 'walking', name: 'Dog Walking', description: 'Exercise and outdoor activities for dogs', icon: '🚶' },
  { id: 'pairing', name: 'Pet Pairing', description: 'Breeding and pet adoption services', icon: '💕' }
]

export function ServiceTypeStep({ data, onUpdate, onNext, onPrevious }: ServiceTypeStepProps) {
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!data.serviceType) {
      setError('Please select a service type')
      return
    }
    setError('')
    onNext()
  }

  const handleServiceTypeSelect = (serviceType: string) => {
    onUpdate({ serviceType })
    if (error) setError('')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceTypes.map((service) => (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                data.serviceType === service.id
                  ? 'ring-2 ring-primary border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleServiceTypeSelect(service.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{service.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>Choose the main type of service you provide. You can add more specific services in the next step.</p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} className="px-8">
          Continue
        </Button>
      </div>
    </div>
  )
}
