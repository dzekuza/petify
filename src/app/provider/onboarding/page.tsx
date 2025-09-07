'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { PawPrint, Check } from 'lucide-react'
// Import new step components
import ProviderTypeStep from '@/components/provider-onboarding/provider-type-step'
import ConditionalBusinessNameStep from '@/components/provider-onboarding/conditional-business-name-step'
import ConditionalBusinessDescriptionStep from '@/components/provider-onboarding/conditional-business-description-step'
import { ContactInformationStep } from '@/components/provider-onboarding/contact-information-step'
import { BusinessAddressStep } from '@/components/provider-onboarding/business-address-step'
import { ServiceTypeStep } from '@/components/provider-onboarding/service-type-step'
import SpecificServicesStep from '@/components/provider-onboarding/specific-services-step'
import ExperienceLevelStep from '@/components/provider-onboarding/experience-level-step'
import CertificationsStep from '@/components/provider-onboarding/certifications-step'
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
      { id: 1, title: 'Service Type', description: 'What type of service do you provide?' },
      { id: 2, title: 'Specific Services', description: 'Which specific services do you offer?' },
      { id: 3, title: 'Experience Level', description: 'How much experience do you have?' },
      { id: 4, title: 'Certifications', description: 'Do you have any certifications?' },
      { id: 5, title: 'Service Areas', description: 'Where do you provide services?' }
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

    if (user.user_metadata?.role === 'provider') {
      console.log('User is already a provider, redirecting to dashboard')
      router.push('/provider/dashboard')
      return
    }
    
    console.log('User authenticated, proceeding with onboarding')
  }, [user, loading, router])

  const handleNext = () => {
    const currentMainStepData = mainSteps.find(step => step.id === currentMainStep)
    if (currentSubStep < currentMainStepData!.subSteps.length) {
      setCurrentSubStep(currentSubStep + 1)
    } else if (currentMainStep < mainSteps.length) {
      setCurrentMainStep(currentMainStep + 1)
      setCurrentSubStep(1)
    }
  }

  const handlePrevious = () => {
    if (currentSubStep > 1) {
      setCurrentSubStep(currentSubStep - 1)
    } else if (currentMainStep > 1) {
      setCurrentMainStep(currentMainStep - 1)
      const previousMainStepData = mainSteps.find(step => step.id === currentMainStep - 1)
      setCurrentSubStep(previousMainStepData!.subSteps.length)
    }
  }

  const handleDataUpdate = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }))
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
            <ServiceTypeStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
        case 2:
          return (
            <SpecificServicesStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
        case 3:
          return (
            <ExperienceLevelStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
        case 4:
          return (
            <CertificationsStep
              data={onboardingData}
              onUpdate={handleDataUpdate}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )
        case 5:
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
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Steps Overview */}
          <div className="lg:col-span-1">
            <Card className="py-6">
              <CardContent className="space-y-4">
                <CardTitle className="text-lg mb-4">Getting Started</CardTitle>
                {mainSteps.map((step) => (
                  <div key={step.id} className="space-y-2">
                    <div
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        currentMainStep === step.id
                          ? 'bg-primary/10 border border-primary/20'
                          : currentMainStep > step.id
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                          currentMainStep === step.id
                            ? 'bg-primary text-primary-foreground'
                            : currentMainStep > step.id
                            ? 'bg-green-500 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {currentMainStep > step.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    
                    {/* Sub-steps */}
                    {currentMainStep === step.id && (
                      <div className="ml-4 space-y-1">
                        {step.subSteps.map((subStep) => (
                          <div
                            key={subStep.id}
                            className={`flex items-center space-x-2 p-2 rounded text-xs ${
                              currentSubStep === subStep.id
                                ? 'bg-primary/5 text-primary'
                                : currentSubStep > subStep.id
                                ? 'bg-green-50 text-green-700'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                currentSubStep === subStep.id
                                  ? 'bg-primary text-white'
                                  : currentSubStep > subStep.id
                                  ? 'bg-green-500 text-white'
                                  : 'bg-muted'
                              }`}
                            >
                              {currentSubStep > subStep.id ? (
                                <Check className="w-2 h-2" />
                              ) : (
                                subStep.id
                              )}
                            </div>
                            <span>{subStep.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Step Content */}
          <div className="lg:col-span-2">
            <Card className="py-6">
              <CardContent>
                <CardTitle className="text-2xl mb-6">
                  {currentMainStepData?.subSteps[currentSubStep - 1]?.title}
                </CardTitle>
                {renderStep()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fixed Progress Bar at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentMainStep + 1} of {mainSteps.length} - {mainSteps.find(step => step.id === currentMainStep)?.title}</span>
              <span>{Math.round((currentMainStep * 100 + (currentSubStep - 1) * 20) / mainSteps.length)}% complete</span>
            </div>
            <div className="bg-primary/20 relative w-full overflow-hidden rounded-full h-2">
              <div 
                className="bg-primary h-full w-full flex-1 transition-all" 
                style={{ 
                  transform: `translateX(-${100 - (currentMainStep * 100 + (currentSubStep - 1) * 20) / mainSteps.length}%)` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sub-step {currentSubStep} of {mainSteps.find(step => step.id === currentMainStep)?.subSteps.length}</span>
              <span>{(currentMainStep * 4 + currentSubStep)} of {mainSteps.reduce((total, step) => total + step.subSteps.length, 0)} completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
