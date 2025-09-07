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
  { id: 'grooming', name: 'Kirpyklos', description: 'Pet grooming and beauty services', icon: '✂️' },
  { id: 'training', name: 'Dresūra', description: 'Pet training and behavior services', icon: '🎓' },
  { id: 'veterinary', name: 'Veterinarijos', description: 'Veterinary and medical services', icon: '🏥' },
  { id: 'ads', name: 'Skelbimai', description: 'Pet advertising and sales services', icon: '📢' }
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
      <div>
        <h2 className="text-2xl font-semibold">Service Type</h2>
        <p className="text-muted-foreground mt-2">
          Your service type has been automatically selected based on your provider type
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceTypes.map((service) => (
            <Card
              key={service.id}
              className={`transition-all ${
                data.serviceType === service.id
                  ? 'ring-2 ring-primary border-primary bg-primary/5'
                  : 'border-muted-foreground/25 opacity-50'
              }`}
            >
              <CardContent className="py-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{service.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                {data.serviceType === service.id && (
                  <div className="mt-3 text-sm text-primary font-medium">
                    ✓ Selected based on your provider type
                  </div>
                )}
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

