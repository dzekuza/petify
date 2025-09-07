'use client'

import { useState } from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { OnboardingData } from '@/types/onboarding'
import Image from 'next/image'

interface ServiceTypeStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const serviceTypes = [
  { id: 'grooming', name: 'Kirpyklos', description: 'Pet grooming and beauty services', icon: '/Animal_Care_Icon Background Removed.png' },
  { id: 'training', name: 'Dresūra', description: 'Pet training and behavior services', icon: '/Pet_Training_Icon Background Removed.png' },
  { id: 'veterinary', name: 'Veterinarijos', description: 'Veterinary and medical services', icon: '/Pet_Veterinary_Icon Background Removed.png' },
  { id: 'ads', name: 'Skelbimai', description: 'Pet advertising and sales services', icon: '/Pet_Ads_Icon Background Removed.png' }
]

export function ServiceTypeStep({ data, onUpdate, onNext, onPrevious }: ServiceTypeStepProps) {
  const [error, setError] = useState('')


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
              className={`transition-all ${
                data.serviceType === service.id
                  ? 'ring-2 ring-primary border-primary bg-primary/5'
                  : 'border-muted-foreground/25 opacity-50'
              }`}
            >
              <CardContent className="py-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={service.icon}
                      alt={service.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                    <div className="text-left">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      {data.serviceType === service.id && (
                        <div className="text-sm text-primary font-medium mt-2">
                          ✓ Selected based on your provider type
                        </div>
                      )}
                    </div>
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

    </div>
  )
}

