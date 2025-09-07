'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { OnboardingData } from '@/types/onboarding'
import { ArrowLeft } from 'lucide-react'

interface Step2ServiceTypeProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const serviceTypes = [
  { 
    id: 'grooming', 
    name: 'Pet Grooming', 
    description: 'Bathing, brushing, nail trimming, and styling services',
    icon: '✂️'
  },
  { 
    id: 'veterinary', 
    name: 'Veterinary Care', 
    description: 'Medical care, checkups, vaccinations, and treatments',
    icon: '🏥'
  },
  { 
    id: 'boarding', 
    name: 'Pet Boarding', 
    description: 'Overnight care and accommodation for pets',
    icon: '🏠'
  },
  { 
    id: 'training', 
    name: 'Pet Training', 
    description: 'Behavioral training, obedience, and socialization',
    icon: '🎓'
  },
  { 
    id: 'walking', 
    name: 'Dog Walking', 
    description: 'Regular walks and exercise for dogs',
    icon: '🚶'
  },
  { 
    id: 'sitting', 
    name: 'Pet Sitting', 
    description: 'In-home pet care and companionship',
    icon: '🛋️'
  }
]

const commonServices = {
  grooming: [
    'Bath and brush',
    'Nail trimming',
    'Ear cleaning',
    'Teeth brushing',
    'Haircut and styling',
    'Flea treatment',
    'De-shedding treatment'
  ],
  veterinary: [
    'Health checkups',
    'Vaccinations',
    'Dental care',
    'Surgery',
    'Emergency care',
    'Medication administration',
    'Microchipping'
  ],
  boarding: [
    'Overnight stays',
    'Daily walks',
    'Feeding and medication',
    'Playtime and socialization',
    'Grooming services',
    'Pickup and delivery',
    'Special diet accommodation'
  ],
  training: [
    'Basic obedience',
    'Behavioral modification',
    'Puppy training',
    'Socialization',
    'House training',
    'Leash training',
    'Advanced commands'
  ],
  walking: [
    'Regular walks',
    'Exercise sessions',
    'Group walks',
    'Puppy walks',
    'Senior dog care',
    'Medication administration',
    'Feeding and water'
  ],
  sitting: [
    'In-home visits',
    'Overnight stays',
    'Feeding and medication',
    'Playtime and exercise',
    'Basic grooming',
    'House sitting',
    'Emergency care'
  ]
}

const experienceLevels = [
  { value: 'beginner', label: 'Less than 1 year' },
  { value: 'intermediate', label: '1-3 years' },
  { value: 'experienced', label: '3-5 years' },
  { value: 'expert', label: '5+ years' }
]

const commonCertifications = [
  'Veterinary Technician License',
  'Pet Grooming Certification',
  'Animal Behavior Certification',
  'Pet First Aid & CPR',
  'Dog Training Certification',
  'Pet Nutrition Certification',
  'Animal Welfare Certification'
]

export function Step2ServiceType({ data, onUpdate, onNext, onPrevious }: Step2ServiceTypeProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (!data.serviceType) {
      newErrors.serviceType = 'Please select a service type'
    }

    if (data.services.length === 0) {
      newErrors.services = 'Please select at least one service'
    }

    if (!data.experience) {
      newErrors.experience = 'Please select your experience level'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      onNext()
    }
  }

  const handleServiceTypeSelect = (serviceType: string) => {
    onUpdate({ serviceType })
    // Reset services when service type changes
    onUpdate({ services: [] })
    if (errors.serviceType) {
      setErrors(prev => ({ ...prev, serviceType: '' }))
    }
  }

  const handleServiceToggle = (service: string) => {
    const newServices = data.services.includes(service)
      ? data.services.filter(s => s !== service)
      : [...data.services, service]
    
    onUpdate({ services: newServices })
    if (errors.services) {
      setErrors(prev => ({ ...prev, services: '' }))
    }
  }

  const handleExperienceChange = (experience: string) => {
    onUpdate({ experience })
    if (errors.experience) {
      setErrors(prev => ({ ...prev, experience: '' }))
    }
  }

  const handleCertificationToggle = (certification: string) => {
    const newCertifications = data.certifications.includes(certification)
      ? data.certifications.filter(c => c !== certification)
      : [...data.certifications, certification]
    
    onUpdate({ certifications: newCertifications })
  }

  return (
    <div className="space-y-6">
      {/* Service Type Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">What type of service do you provide? *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {serviceTypes.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-md py-6 ${
                  data.serviceType === type.id
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleServiceTypeSelect(type.id)}
              >
                <CardContent className="pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {errors.serviceType && (
            <p className="text-sm text-red-500 mt-2">{errors.serviceType}</p>
          )}
        </div>

        {/* Services Selection */}
        {data.serviceType && (
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Which specific services do you offer? *
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {commonServices[data.serviceType as keyof typeof commonServices]?.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={data.services.includes(service)}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <Label htmlFor={service} className="text-sm font-normal cursor-pointer">
                    {service}
                  </Label>
                </div>
              ))}
            </div>
            {errors.services && (
              <p className="text-sm text-red-500 mt-2">{errors.services}</p>
            )}
          </div>
        )}

        {/* Experience Level */}
        <div className="space-y-4">
          <Label className="text-base font-medium">How many years of experience do you have? *</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {experienceLevels.map((level) => (
              <Card
                key={level.value}
                className={`cursor-pointer transition-all hover:shadow-md py-6 ${
                  data.experience === level.value
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleExperienceChange(level.value)}
              >
                <CardContent className="p-4 text-center">
                  <div className="font-medium text-sm">{level.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          {errors.experience && (
            <p className="text-sm text-red-500 mt-2">{errors.experience}</p>
          )}
        </div>

        {/* Certifications */}
        <div className="space-y-4">
          <Label className="text-base font-medium">
            Do you have any certifications or licenses? (Optional)
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonCertifications.map((certification) => (
              <div key={certification} className="flex items-center space-x-2">
                <Checkbox
                  id={certification}
                  checked={data.certifications.includes(certification)}
                  onCheckedChange={() => handleCertificationToggle(certification)}
                />
                <Label htmlFor={certification} className="text-sm font-normal cursor-pointer">
                  {certification}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
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
