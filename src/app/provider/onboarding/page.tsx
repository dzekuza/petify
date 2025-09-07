'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { providerApi } from '@/lib/providers'
import { PawPrint, Check, ArrowLeft, ArrowRight } from 'lucide-react'
// Import new step components
import ProviderTypeStep from '@/components/provider-onboarding/provider-type-step'
import ConditionalBusinessNameStep from '@/components/provider-onboarding/conditional-business-name-step'
import ConditionalBusinessDescriptionStep from '@/components/provider-onboarding/conditional-business-description-step'
import { ContactInformationStep } from '@/components/provider-onboarding/contact-information-step'
import { BusinessAddressStep } from '@/components/provider-onboarding/business-address-step'
import SpecificServicesStep from '@/components/provider-onboarding/specific-services-step'
import ExperienceLevelStep from '@/components/provider-onboarding/experience-level-step'
import ServiceAreasStep from '@/components/provider-onboarding/service-areas-step'
import { BasePricingStep } from '@/components/provider-onboarding/base-pricing-step'
import HourlyRateStep from '@/components/provider-onboarding/hourly-rate-step'
import AvailabilityStep from '@/components/provider-onboarding/availability-step'
import WorkingHoursStep from '@/components/provider-onboarding/working-hours-step'
import PhotosStep from '@/components/provider-onboarding/photos-step'
import ReviewStep from '@/components/provider-onboarding/review-step'
import { OnboardingData } from '@/types/onboarding'

const mainSteps = [
  { 
    id: 0, 
    title: 'Provider Type', 
    description: 'What type of provider are you?',
    subSteps: [
      { id: 1, title: 'Select Provider Type', description: 'Choose your provider type' }
    ]
  },
  { 
    id: 1, 
    title: 'Business Information', 
    description: 'Tell us about your business',
    subSteps: [
      { id: 1, title: 'Business Name', description: 'What\'s your business name?' },
      { id: 2, title: 'Business Description', description: 'Describe your business' },
      { id: 3, title: 'Contact Information', description: 'How can customers reach you?' },
      { id: 4, title: 'Business Address', description: 'Where is your business located?' }
    ]
  },
  { 
    id: 2, 
    title: 'Service Details', 
    description: 'What services do you offer?',
    subSteps: [
      { id: 1, title: 'Specific Services', description: 'Which specific services do you offer?' },
      { id: 2, title: 'Experience Level', description: 'How much experience do you have?' },
      { id: 3, title: 'Service Areas', description: 'Where do you provide services?' }
    ]
  },
  { 
    id: 3, 
    title: 'Pricing & Schedule', 
    description: 'Set your rates and availability',
    subSteps: [
      { id: 1, title: 'Base Pricing', description: 'Set your base service price' },
      { id: 2, title: 'Hourly Rate', description: 'Set your hourly rate' },
      { id: 3, title: 'Available Days', description: 'When are you available?' },
      { id: 4, title: 'Working Hours', description: 'What are your working hours?' }
    ]
  },
  { 
    id: 4, 
    title: 'Photos & Media', 
    description: 'Showcase your work',
    subSteps: [
      { id: 1, title: 'Upload Photos', description: 'Add photos to showcase your work' }
    ]
  },
  { 
    id: 5, 
    title: 'Review & Publish', 
    description: 'Review and publish your listing',
    subSteps: [
      { id: 1, title: 'Review Information', description: 'Review all your information' }
    ]
  }
]

export default function ProviderOnboardingPage() {
  const [currentMainStep, setCurrentMainStep] = useState(0)
  const [currentSubStep, setCurrentSubStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    providerType: '',
    businessName: '',
    businessDescription: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    serviceType: '',
    services: [],
    experience: '',
    certifications: [],
    basePrice: 0,
    pricePerHour: 0,
    currency: 'EUR',
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    photos: [],
    profilePhoto: '',
    termsAccepted: false,
    privacyAccepted: false
  })
  
  const { user, loading } = useAuth()
  const router = useRouter()

  const currentMainStepData = mainSteps.find(step => step.id === currentMainStep)

  // Handle navigation based on user state
  useEffect(() => {
    const checkUserStatus = async () => {
      console.log('Auth state changed:', { user: !!user, loading, userRole: user?.user_metadata?.role })
      
      // Don't redirect if we're still loading
      if (loading) {
        console.log('Still loading, waiting...')
        return
      }
      
      if (!user) {
        console.log('No user found, redirecting to signin')
        router.push('/auth/signin')
        return
      }

      // Check if user already has a provider profile
      try {
        const hasProfile = await providerApi.hasProviderProfile(user.id)
        
        if (hasProfile) {
          console.log('User already has a provider profile, redirecting to dashboard')
          router.push('/provider/dashboard')
          return
        }
      } catch (error) {
        console.error('Error checking provider profile:', error)
        // Continue with onboarding on error
      }
      
      console.log('User authenticated, proceeding with onboarding')
    }

    checkUserStatus()
  }, [user, loading, router])

  const handleNext = () => {
    // Validation logic based on current step
    if (currentMainStep === 0 && currentSubStep === 1) {
      // Provider type step - must select a provider type
      if (!onboardingData.providerType) {
        return // Don't proceed if no provider type selected
      }
    }
    
    if (currentMainStep === 1 && currentSubStep === 1) {
      // Business name step - must enter a business name
      if (!onboardingData.businessName || !onboardingData.businessName.trim()) {
        return // Don't proceed if no business name entered
      }
    }
    
    const currentMainStepData = mainSteps.find(step => step.id === currentMainStep)
    
    // Check if we've reached the end of the onboarding
    if (!currentMainStepData) {
      // Handle completion - redirect to dashboard or show success message
      handleOnboardingComplete()
      return
    }
    
    if (currentSubStep < currentMainStepData.subSteps.length) {
      setCurrentSubStep(currentSubStep + 1)
    } else if (currentMainStep < mainSteps.length - 1) {
      setCurrentMainStep(currentMainStep + 1)
      setCurrentSubStep(1)
    } else {
      // We've reached the end of the onboarding
      console.log('Onboarding completed!', onboardingData)
      // Here you would typically redirect to the provider dashboard
      // or show a success message
      handleOnboardingComplete()
    }
  }

  const handlePrevious = () => {
    if (currentSubStep > 1) {
      setCurrentSubStep(currentSubStep - 1)
    } else if (currentMainStep > 0) {
      setCurrentMainStep(currentMainStep - 1)
      const previousMainStepData = mainSteps.find(step => step.id === currentMainStep - 1)
      if (previousMainStepData) {
        setCurrentSubStep(previousMainStepData.subSteps.length)
      }
    }
  }

  const handleDataUpdate = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => {
      const updatedData = { ...prev, ...stepData }
      
      // Auto-set service type based on provider type
      if (stepData.providerType && stepData.providerType !== prev.providerType) {
        updatedData.serviceType = stepData.providerType
      }
      
      return updatedData
    })
  }

  const handleOnboardingComplete = async () => {
    try {
      console.log('Onboarding completed successfully!', onboardingData)
      
      // Save the onboarding data to create a provider profile
      const providerData = {
        userId: user?.id || '',
        businessName: onboardingData.businessName || '',
        businessType: onboardingData.providerType || 'individual',
        description: onboardingData.businessDescription || '',
        services: onboardingData.services || [],
        location: {
          address: onboardingData.address || '',
          city: onboardingData.city || '',
          state: onboardingData.state || '',
          zip: onboardingData.zipCode || '',
          coordinates: {
            lat: 0, // Will be geocoded later
            lng: 0
          }
        },
        contactInfo: {
          phone: onboardingData.phone || '',
          email: user?.email || '',
          website: onboardingData.website || ''
        },
        businessHours: {
          monday: { start: onboardingData.workingHours?.start || '09:00', end: onboardingData.workingHours?.end || '17:00', available: onboardingData.availability?.monday || false },
          tuesday: { start: onboardingData.workingHours?.start || '09:00', end: onboardingData.workingHours?.end || '17:00', available: onboardingData.availability?.tuesday || false },
          wednesday: { start: onboardingData.workingHours?.start || '09:00', end: onboardingData.workingHours?.end || '17:00', available: onboardingData.availability?.wednesday || false },
          thursday: { start: onboardingData.workingHours?.start || '09:00', end: onboardingData.workingHours?.end || '17:00', available: onboardingData.availability?.thursday || false },
          friday: { start: onboardingData.workingHours?.start || '09:00', end: onboardingData.workingHours?.end || '17:00', available: onboardingData.availability?.friday || false },
          saturday: { start: onboardingData.workingHours?.start || '09:00', end: onboardingData.workingHours?.end || '17:00', available: onboardingData.availability?.saturday || false },
          sunday: { start: onboardingData.workingHours?.start || '09:00', end: onboardingData.workingHours?.end || '17:00', available: onboardingData.availability?.sunday || false }
        },
        priceRange: {
          min: onboardingData.basePrice || 0,
          max: onboardingData.pricePerHour || 0,
          currency: onboardingData.currency || 'EUR'
        },
        availability: onboardingData.availability || {},
        certifications: onboardingData.certifications || [],
        experienceYears: parseInt(onboardingData.experience?.split('-')[0] || '0')
      }
      
      // Import the provider API
      const { providerApi } = await import('@/lib/providers')
      
      // Create the provider profile
      const newProvider = await providerApi.createProvider(providerData)
      
      console.log('Provider profile created:', newProvider)
      
      // Redirect to the provider dashboard
      router.push('/provider/dashboard')
      
    } catch (error) {
      console.error('Error creating provider profile:', error)
      // Still redirect to dashboard - the user can complete their profile there
      router.push('/provider/dashboard')
    }
  }

  const handleSubmit = async () => {
    
    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Prepare the data for database insertion
      const providerData = {
        user_id: user.id,
        business_name: onboardingData.businessName,
        business_type: 'individual', // Default to individual, can be updated later
        description: onboardingData.businessDescription,
        services: [onboardingData.serviceType], // Convert to array
        location: {
          address: onboardingData.address,
          city: onboardingData.city,
          state: onboardingData.state,
          zip: onboardingData.zipCode,
          coordinates: null // Will be populated by geocoding service
        },
        contact_info: {
          phone: onboardingData.phone,
          email: user.email,
          website: onboardingData.website || null
        },
        business_hours: {
          monday: onboardingData.availability.monday ? { start: onboardingData.workingHours.start, end: onboardingData.workingHours.end } : null,
          tuesday: onboardingData.availability.tuesday ? { start: onboardingData.workingHours.start, end: onboardingData.workingHours.end } : null,
          wednesday: onboardingData.availability.wednesday ? { start: onboardingData.workingHours.start, end: onboardingData.workingHours.end } : null,
          thursday: onboardingData.availability.thursday ? { start: onboardingData.workingHours.start, end: onboardingData.workingHours.end } : null,
          friday: onboardingData.availability.friday ? { start: onboardingData.workingHours.start, end: onboardingData.workingHours.end } : null,
          saturday: onboardingData.availability.saturday ? { start: onboardingData.workingHours.start, end: onboardingData.workingHours.end } : null,
          sunday: onboardingData.availability.sunday ? { start: onboardingData.workingHours.start, end: onboardingData.workingHours.end } : null
        },
        price_range: {
          min: onboardingData.basePrice,
          max: onboardingData.basePrice + (onboardingData.pricePerHour * 8), // Assuming 8-hour day
          currency: onboardingData.currency
        },
        availability: onboardingData.availability,
        images: onboardingData.photos,
        certifications: onboardingData.certifications,
        experience_years: parseInt(onboardingData.experience) || 0,
        status: 'pending_verification',
        is_verified: false
      }

      // Get the session token for API calls
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      // Save to database
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(providerData)
      })

      if (!response.ok) {
        throw new Error('Failed to save provider data')
      }

      // Update user role to provider
      const updateUserResponse = await fetch('/api/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ role: 'provider' })
      })

      if (!updateUserResponse.ok) {
        throw new Error('Failed to update user role')
      }
      
      // Redirect to provider dashboard
      router.push('/provider/dashboard')
    } catch (err) {
      console.error('Onboarding error:', err)
    } finally {
      // Handle completion
    }
  }

  const renderStep = () => {
    const currentMainStepData = mainSteps.find(step => step.id === currentMainStep)
    const currentSubStepData = currentMainStepData?.subSteps.find(subStep => subStep.id === currentSubStep)
    
    if (!currentMainStepData || !currentSubStepData) return null

    // Provider Type Step
    if (currentMainStep === 0) {
      switch (currentSubStep) {
        case 1:
          return (
            <ProviderTypeStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
            />
          )
      }
    }

    // Business Information Steps
    if (currentMainStep === 1) {
      switch (currentSubStep) {
        case 1:
          return (
            <ConditionalBusinessNameStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
        case 2:
          return (
            <ConditionalBusinessDescriptionStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
        case 3:
          return (
            <ContactInformationStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
        case 4:
          return (
            <BusinessAddressStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
      }
    }

    // Service Details Steps
    if (currentMainStep === 2) {
      switch (currentSubStep) {
        case 1:
          return (
            <SpecificServicesStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
        case 2:
          return (
            <ExperienceLevelStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
        case 3:
          return (
            <ServiceAreasStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
      }
    }

    // Pricing & Schedule Steps
    if (currentMainStep === 3) {
      switch (currentSubStep) {
        case 1:
          return (
            <BasePricingStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
        case 2:
          return (
            <HourlyRateStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
        case 3:
          return (
            <AvailabilityStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
        case 4:
          return (
            <WorkingHoursStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
      }
    }

    // Photos & Media Steps
    if (currentMainStep === 4) {
      switch (currentSubStep) {
        case 1:
          return (
            <PhotosStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
      }
    }

    // Review & Publish Steps
    if (currentMainStep === 5) {
      switch (currentSubStep) {
        case 1:
          return (
            <ReviewStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
      }
    }

    return null
  }

  // Show loading state while checking user authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading state if no user (will redirect to signin)
  if (!user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  // Show loading state if user is already a provider (will redirect)
  if (user.user_metadata?.role === 'provider') {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                <PawPrint className="size-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Petify</h1>
                <p className="text-sm text-muted-foreground">Provider Onboarding</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              Exit
            </Button>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
        <div className="py-6">
          <div className="px-6">
            <div className="font-semibold text-2xl mb-6">
              {currentMainStepData?.subSteps[currentSubStep - 1]?.title}
            </div>
            {renderStep()}
          </div>
        </div>
      </div>

      {/* Progress Bar Above Bottom Navigation */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t z-40">
        <div className="w-full px-4 py-3">
          <div className="bg-primary/20 relative w-full overflow-hidden rounded-full h-2">
            <div 
              className="bg-primary h-full w-full flex-1 transition-all" 
              style={{ 
                transform: `translateX(-${100 - (currentMainStep * 100 + (currentSubStep - 1) * 20) / mainSteps.length}%)` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentMainStep === 0 && currentSubStep === 1}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none h-9 px-4 py-2 border-black text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={
                (currentMainStep === 0 && currentSubStep === 1 && !onboardingData.providerType) ||
                (currentMainStep === 1 && currentSubStep === 1 && (!onboardingData.businessName || !onboardingData.businessName.trim()))
              }
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none h-9 px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
