'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { OnboardingData } from '@/types/onboarding'

interface SpecificServicesStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const specificServices = {
  grooming: [
    { id: 'basic-bath', name: 'Basic Bath & Dry', description: 'Shampoo, condition, and dry your pet' },
    { id: 'full-grooming', name: 'Full Grooming', description: 'Complete grooming including haircut and styling' },
    { id: 'nail-trimming', name: 'Nail Trimming', description: 'Professional nail trimming and filing' },
    { id: 'ear-cleaning', name: 'Ear Cleaning', description: 'Ear cleaning and maintenance' },
    { id: 'teeth-brushing', name: 'Teeth Brushing', description: 'Dental hygiene and teeth cleaning' },
    { id: 'flea-treatment', name: 'Flea & Tick Treatment', description: 'Flea and tick prevention treatment' }
  ],
  veterinary: [
    { id: 'health-checkup', name: 'Health Checkup', description: 'General health examination' },
    { id: 'vaccinations', name: 'Vaccinations', description: 'Core and non-core vaccinations' },
    { id: 'dental-care', name: 'Dental Care', description: 'Dental cleaning and oral health' },
    { id: 'surgery', name: 'Surgery', description: 'Minor and major surgical procedures' },
    { id: 'emergency-care', name: 'Emergency Care', description: '24/7 emergency veterinary services' },
    { id: 'diagnostics', name: 'Diagnostics', description: 'Lab tests, X-rays, and imaging' }
  ],
  training: [
    { id: 'basic-obedience', name: 'Basic Obedience', description: 'Sit, stay, come, and basic commands' },
    { id: 'puppy-training', name: 'Puppy Training', description: 'Early socialization and basic training' },
    { id: 'behavior-modification', name: 'Behavior Modification', description: 'Addressing behavioral issues' },
    { id: 'agility-training', name: 'Agility Training', description: 'Agility and obstacle course training' },
    { id: 'service-dog-training', name: 'Service Dog Training', description: 'Specialized service dog training' },
    { id: 'group-classes', name: 'Group Classes', description: 'Training in group settings' }
  ],
  care: [
    { id: 'pet-sitting', name: 'Pet Sitting', description: 'In-home pet care and supervision' },
    { id: 'dog-walking', name: 'Dog Walking', description: 'Regular exercise and outdoor time' },
    { id: 'overnight-care', name: 'Overnight Care', description: 'Extended care and overnight stays' },
    { id: 'medication-administration', name: 'Medication Administration', description: 'Administering prescribed medications' },
    { id: 'special-needs-care', name: 'Special Needs Care', description: 'Care for pets with special requirements' },
    { id: 'elderly-pet-care', name: 'Elderly Pet Care', description: 'Specialized care for senior pets' }
  ],
  pairing: [
    { id: 'breeding-services', name: 'Breeding Services', description: 'Professional breeding and reproduction' },
    { id: 'mating-arrangement', name: 'Mating Arrangement', description: 'Arranging suitable breeding partners' },
    { id: 'pregnancy-care', name: 'Pregnancy Care', description: 'Prenatal and postnatal care' },
    { id: 'genetic-testing', name: 'Genetic Testing', description: 'Health and genetic screening' },
    { id: 'puppy-care', name: 'Puppy Care', description: 'Newborn and young puppy care' },
    { id: 'breeding-consultation', name: 'Breeding Consultation', description: 'Expert breeding advice and guidance' }
  ],
  ads: [
    { id: 'pet-adoption', name: 'Pet Adoption', description: 'Finding loving homes for pets' },
    { id: 'pet-sales', name: 'Pet Sales', description: 'Selling healthy, well-cared-for pets' },
    { id: 'breeding-advertisement', name: 'Breeding Advertisement', description: 'Promoting breeding services' },
    { id: 'pet-fostering', name: 'Pet Fostering', description: 'Temporary care and fostering services' },
    { id: 'pet-rehoming', name: 'Pet Rehoming', description: 'Helping pets find new homes' },
    { id: 'pet-rescue', name: 'Pet Rescue', description: 'Rescue and rehabilitation services' }
  ]
}

export default function SpecificServicesStep({ data, onUpdate, onNext, onPrevious }: SpecificServicesStepProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(data.services || [])
  const [error, setError] = useState('')

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId)
      } else {
        return [...prev, serviceId]
      }
    })
    setError('')
  }


  const currentServiceType = data.serviceType
  const availableServices = specificServices[currentServiceType as keyof typeof specificServices] || []

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Select all the specific services you provide for {currentServiceType}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableServices.map((service) => (
          <Card 
            key={service.id}
            className={`cursor-pointer transition-all hover:border-primary/50 ${
              selectedServices.includes(service.id)
                ? 'ring-2 ring-primary border-primary bg-primary/5'
                : 'border-muted-foreground/25'
            }`}
            onClick={() => {
              const newServices = selectedServices.includes(service.id)
                ? selectedServices.filter(id => id !== service.id)
                : [...selectedServices, service.id]
              setSelectedServices(newServices)
              setError('')
              onUpdate({ services: newServices })
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={selectedServices.includes(service.id)}
                  onChange={() => {
                    const newServices = selectedServices.includes(service.id)
                      ? selectedServices.filter(id => id !== service.id)
                      : [...selectedServices, service.id]
                    setSelectedServices(newServices)
                    setError('')
                    onUpdate({ services: newServices })
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{service.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
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
  )
}
