'use client'

import { ServiceCard } from '@/components/ui/service-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useDeviceDetection } from '@/lib/device-detection'
import type { BookingStepProps } from './types'

export function BookingStep1({ 
  provider, 
  services, 
  selectedService, 
  onServiceSelect, 
  onNext, 
  loading = false 
}: BookingStepProps) {
  const { isMobile } = useDeviceDetection()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pasirinkite paslaugą
        </h2>
        <p className="text-gray-600">
          Pasirinkite norimą paslaugą iš {provider.businessName}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedService?.id === service.id}
            onClick={() => onServiceSelect(service)}
          />
        ))}
      </div>

      <div className={`flex justify-center pt-6 ${isMobile ? 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50' : ''}`}>
        <Button 
          onClick={onNext}
          disabled={!selectedService || loading}
          className={`flex items-center space-x-2 ${isMobile ? 'w-full' : ''}`}
        >
          <span>Tęsti</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
