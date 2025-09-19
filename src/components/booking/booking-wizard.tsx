'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { petsApi } from '@/lib/pets'
import { providerApi } from '@/lib/providers'
import { BookingStep1 } from './booking-step-1'
import { BookingStep2 } from './booking-step-2'
import { BookingStep3 } from './booking-step-3'
import { BookingStep4 } from './booking-step-4'
import { toast } from 'sonner'

interface BookingWizardProps {
  provider: any
  services: any[]
}

export function BookingWizard({ provider, services }: BookingWizardProps) {
  const { user } = useAuth()
  const params = useParams()
  const searchParams = useSearchParams()
  
  const [pets, setPets] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedPets, setSelectedPets] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [currentStep, setCurrentStep] = useState(1)
  const [availabilityData, setAvailabilityData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [petsLoading, setPetsLoading] = useState(false)

  const fetchPets = useCallback(async () => {
    if (!user) return
    
    try {
      setPetsLoading(true)
      const userPets = await petsApi.getUserPets(user.id)
      setPets(userPets)
    } catch (error) {
      console.error('Error fetching pets:', error)
    } finally {
      setPetsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setLoading(true)
        
        // Check if a service is pre-selected from URL parameters
        const preSelectedServiceId = searchParams?.get('service')
        if (preSelectedServiceId) {
          const preSelectedService = services.find(s => s.id === preSelectedServiceId)
          if (preSelectedService) {
            setSelectedService(preSelectedService)
            setCurrentStep(2)
            
            // Pre-select tomorrow's date to skip date selection step
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            setSelectedDate(tomorrow)
            
            // Fetch availability for the pre-selected date
            // fetchAvailabilityData(tomorrow)
          }
        }
      } catch (error) {
        console.error('Error fetching provider data:', error)
        toast.error('Failed to load provider data')
      } finally {
        setLoading(false)
      }
    }

    if (services.length > 0) {
      fetchProviderData()
    }
  }, [services, searchParams])

  const handleServiceSelect = (service: any) => {
    setSelectedService(service)
    setCurrentStep(2)
  }

  const handlePetSelect = (petId: string) => {
    setSelectedPets(prev => 
      prev.includes(petId) 
        ? prev.filter(id => id !== petId)
        : [...prev, petId]
    )
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTimeSlot(time)
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Handle booking completion
    toast.success('Booking completed successfully!')
  }

  const stepProps = {
    provider,
    services,
    pets,
    selectedService,
    selectedPets,
    selectedDate,
    selectedTimeSlot,
    availabilityData,
    onServiceSelect: handleServiceSelect,
    onPetSelect: handlePetSelect,
    onDateSelect: handleDateSelect,
    onTimeSelect: handleTimeSelect,
    onNext: handleNext,
    onPrev: handlePrev,
    loading: loading || petsLoading
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BookingStep1 {...stepProps} />
      case 2:
        return <BookingStep2 {...stepProps} />
      case 3:
        return <BookingStep3 {...stepProps} />
      case 4:
        return <BookingStep4 {...stepProps} onComplete={handleComplete} />
      default:
        return <BookingStep1 {...stepProps} />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Paslauga</span>
          <span>Augintiniai</span>
          <span>Data/Laikas</span>
          <span>Patvirtinimas</span>
        </div>
      </div>

      {/* Step Content */}
      {renderStep()}
    </div>
  )
}
