'use client'

import { OnboardingData } from '@/types/onboarding'
import { PageLayout, PageContent } from './page-layout'
import BottomNavigation from './bottom-navigation'
import ExitButton from './exit-button'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Globe, Clock, Star, Euro } from 'lucide-react'

interface ReviewStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  isEditMode?: boolean
  onSave?: () => void
  onExitEdit?: () => void
}

export default function ReviewStep({ data, onUpdate, onNext, onPrevious, isEditMode, onSave, onExitEdit }: ReviewStepProps) {
  const formatAddress = () => {
    const parts = [data.address, data.city, data.state, data.zipCode].filter(Boolean)
    return parts.join(', ')
  }

  const formatWorkingHours = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis', 'Sekmadienis']
    
    return days.map((day, index) => {
      const hours = data.workingHours?.[day as keyof typeof data.workingHours]
      if (hours?.enabled) {
        return `${dayNames[index]}: ${hours.startTime} - ${hours.endTime}`
      }
      return null
    }).filter(Boolean).join(', ')
  }

  return (
    <PageLayout>
      {/* Exit Button */}
      <ExitButton onExit={onExitEdit || (() => {})} isEditMode={isEditMode} />
      
      {/* Main Content */}
      <PageContent>
        <div className="w-full max-w-[522px]">
          <div className="flex flex-col gap-6 items-start justify-start">
            {/* Title */}
            <h1 className="text-3xl font-bold text-black w-full">
              Peržiūrėti informaciją
            </h1>
              
              <p className="text-gray-600 mb-6">
                Peržiūrėkite savo informaciją prieš baigiant registraciją
              </p>

              {/* Business Information */}
              <div className="w-full bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Verslo informacija</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Pavadinimas:</span>
                    <p className="text-gray-600">{data.businessName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Aprašymas:</span>
                    <p className="text-gray-600">{data.businessDescription}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{data.phone}</span>
                  </div>
                  {data.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{data.website}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="w-full bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Vieta</h2>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600">{formatAddress()}</p>
                    {data.addresses && data.addresses.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {data.addresses.length} papildoma adresas
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Services */}
              {data.services && data.services.length > 0 && (
                <div className="w-full bg-white p-6 rounded-lg border">
                  <h2 className="text-xl font-semibold mb-4">Paslaugos</h2>
                  <div className="flex flex-wrap gap-2">
                    {data.services.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Services */}
              {data.detailedServices && data.detailedServices.length > 0 && (
                <div className="w-full bg-white p-6 rounded-lg border">
                  <h2 className="text-xl font-semibold mb-4">Detalios paslaugos</h2>
                  <div className="space-y-4">
                    {data.detailedServices.map((service, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Euro className="h-3 w-3" />
                            €{service.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="w-full bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Kainodara</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Bazinė kaina: €{data.basePrice}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Kaina už valandą: €{data.pricePerHour}</span>
                  </div>
                </div>
              </div>

              {/* Experience & Certifications */}
              <div className="w-full bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Patirtis ir sertifikatai</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Patirtis:</span>
                    <p className="text-gray-600">{data.experience}</p>
                  </div>
                  {data.certifications && data.certifications.length > 0 && (
                    <div>
                      <span className="font-medium">Sertifikatai:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {data.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Working Hours */}
              <div className="w-full bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Darbo laikas</h2>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                  <p className="text-gray-600">{formatWorkingHours()}</p>
                </div>
              </div>

              {/* Terms Acceptance */}
              <div className="w-full bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-800">
                    Sutinkate su naudojimo sąlygomis ir privatumo politika
                  </span>
                </div>
              </div>
            </div>
          </div>
      </PageContent>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentStep={11}
        totalSteps={12}
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={false}
        nextText="Baigti registraciją"
        isEditMode={isEditMode}
        onSave={onSave}
      />
    </PageLayout>
  )
}
