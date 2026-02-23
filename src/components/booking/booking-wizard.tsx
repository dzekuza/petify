'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { petsApi } from '@/lib/pets'
import { providerApi } from '@/lib/providers'
import { useDeviceDetection } from '@/lib/device-detection'
import { BookingStep1 } from './booking-step-1'
import { BookingStep2 } from './booking-step-2'
import { BookingStep3 } from './booking-step-3'
import { BookingStep4 } from './booking-step-4'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface BookingWizardProps {
  provider: any
  services: any[]
  onStepChange?: (step: number) => void
}

export function BookingWizard({ provider, services, onStepChange }: BookingWizardProps) {
  const { user } = useAuth()
  const { isMobile } = useDeviceDetection()
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
    if (onStepChange) {
      onStepChange(currentStep)
    }
  }, [currentStep, onStepChange])

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

  const handleComplete = async () => {
    // Format date
    if (!selectedDate) return
    
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    
    const totalPrice = selectedService.price * selectedPets.length

    try {
      // Get auth session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('Please sign in to continue')
        return
      }

      // Create Stripe Checkout session
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          providerId: provider.id,
          serviceId: selectedService.id,
          pets: selectedPets,
          date: dateString,
          time: selectedTimeSlot,
          price: totalPrice
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error('Failed to start checkout')
    }
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
        return <BookingStep1 {...stepProps} onComplete={handleComplete} />
      case 2:
        return <BookingStep2 {...stepProps} onComplete={handleComplete} />
      case 3:
        return <BookingStep3 {...stepProps} onComplete={handleComplete} />
      case 4:
        return <BookingStep4 {...stepProps} onComplete={handleComplete} />
      default:
        return <BookingStep1 {...stepProps} onComplete={handleComplete} />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-4xl mx-auto ${isMobile ? 'pb-24' : ''}`}>
      {/* Step Content */}
      {renderStep()}
    </div>
  )
}
