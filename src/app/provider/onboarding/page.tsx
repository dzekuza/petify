'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { providerApi } from '@/lib/providers'
import { OnboardingData } from '@/types/onboarding'
import WelcomeStep from '@/components/provider-onboarding/welcome-step'
import ServiceCategoryStep from '@/components/provider-onboarding/service-category-step'
import LocationSelectionStep from '@/components/provider-onboarding/location-selection-step'
import AddressInputStep from '@/components/provider-onboarding/address-input-step'
import ServicesStep from '@/components/provider-onboarding/services-step'
import DetailedServiceStep from '@/components/provider-onboarding/detailed-service-step'
import WorkingHoursStep from '@/components/provider-onboarding/working-hours-step'
import LogoCoverStep from '@/components/provider-onboarding/logo-cover-step'
import ProviderTypeStep from '@/components/provider-onboarding/provider-type-step'
import ServiceDetailsStep from '@/components/provider-onboarding/service-details-step'
import BusinessInfoStep from '@/components/provider-onboarding/business-info-step'
import ReviewStep from '@/components/provider-onboarding/review-step'

const onboardingSteps = [
  { id: 0, title: 'Welcome', component: 'welcome' },
  { id: 1, title: 'Service Category', component: 'service-category' },
  { id: 2, title: 'Location Selection', component: 'location-selection' },
  { id: 3, title: 'Address Input', component: 'address-input' },
  { id: 4, title: 'Services', component: 'services' },
  { id: 5, title: 'Detailed Services', component: 'detailed-services' },
  { id: 6, title: 'Working Hours', component: 'working-hours' },
  { id: 7, title: 'Logo and Cover', component: 'logo-cover' },
  { id: 8, title: 'Provider Type', component: 'provider-type' },
  { id: 9, title: 'Service Details', component: 'service-details' },
  { id: 10, title: 'Business Info', component: 'business-info' },
  { id: 11, title: 'Review', component: 'review' }
]

export default function ProviderOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    providerType: '',
    locationType: '',
    addresses: [],
    serviceDetails: [],
    detailedServices: [],
    coverImage: null,
    logoImage: null,
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
      monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      saturday: { enabled: false, startTime: '10:00', endTime: '15:00' },
      sunday: { enabled: false, startTime: '10:00', endTime: '15:00' }
    },
    photos: [],
    profilePhoto: '',
    termsAccepted: false,
    privacyAccepted: false
  })
  
  const { user, loading } = useAuth()
  const router = useRouter()

  // Handle navigation based on user state
  useEffect(() => {
    const checkUserStatus = async () => {
      if (loading) return
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      try {
        const hasProfile = await providerApi.hasProviderProfile(user.id)
        if (hasProfile) {
          router.push('/provider/dashboard')
          return
        }
      } catch (error) {
        console.error('Error checking provider profile:', error)
      }
    }

    checkUserStatus()
  }, [user, loading, router])

  const handleNext = () => {
    console.log('Next clicked, current step:', currentStep)
    console.log('Provider type:', onboardingData.providerType)
    
    let nextStep = currentStep + 1
    
    // Skip Services and Detailed Services steps if provider type is "Skelbimai" (ads)
    if (currentStep === 3 && onboardingData.providerType === 'ads') {
      console.log('Skipping Services and Detailed Services steps for ads provider')
      nextStep = currentStep + 3 // Skip services (4) and detailed-services (5) steps, go to logo-cover (6)
    }
    
    if (nextStep < onboardingSteps.length) {
      setCurrentStep(nextStep)
      console.log('Moving to step:', nextStep)
    } else {
      console.log('Completing onboarding')
      handleOnboardingComplete()
    }
  }

  const handlePrevious = () => {
    console.log('Previous clicked, current step:', currentStep)
    console.log('Provider type:', onboardingData.providerType)
    
    let prevStep = currentStep - 1
    
    // Skip Services and Detailed Services steps if provider type is "Skelbimai" (ads) when going back
    if (currentStep === 6 && onboardingData.providerType === 'ads') {
      console.log('Skipping Services and Detailed Services steps when going back for ads provider')
      prevStep = currentStep - 3 // Skip services (4) and detailed-services (5) steps, go to address-input (3)
    }
    
    if (prevStep >= 0) {
      setCurrentStep(prevStep)
      console.log('Moving to step:', prevStep)
    }
  }

  const handleDataUpdate = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }))
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
          coordinates: { lat: 0, lng: 0 }
        },
        contactInfo: {
          phone: onboardingData.phone || '',
          email: user?.email || '',
          website: onboardingData.website || ''
        },
        businessHours: {
          monday: { start: onboardingData.workingHours?.monday?.startTime || '09:00', end: onboardingData.workingHours?.monday?.endTime || '17:00', available: onboardingData.workingHours?.monday?.enabled || false },
          tuesday: { start: onboardingData.workingHours?.tuesday?.startTime || '09:00', end: onboardingData.workingHours?.tuesday?.endTime || '17:00', available: onboardingData.workingHours?.tuesday?.enabled || false },
          wednesday: { start: onboardingData.workingHours?.wednesday?.startTime || '09:00', end: onboardingData.workingHours?.wednesday?.endTime || '17:00', available: onboardingData.workingHours?.wednesday?.enabled || false },
          thursday: { start: onboardingData.workingHours?.thursday?.startTime || '09:00', end: onboardingData.workingHours?.thursday?.endTime || '17:00', available: onboardingData.workingHours?.thursday?.enabled || false },
          friday: { start: onboardingData.workingHours?.friday?.startTime || '09:00', end: onboardingData.workingHours?.friday?.endTime || '17:00', available: onboardingData.workingHours?.friday?.enabled || false },
          saturday: { start: onboardingData.workingHours?.saturday?.startTime || '09:00', end: onboardingData.workingHours?.saturday?.endTime || '17:00', available: onboardingData.workingHours?.saturday?.enabled || false },
          sunday: { start: onboardingData.workingHours?.sunday?.startTime || '09:00', end: onboardingData.workingHours?.sunday?.endTime || '17:00', available: onboardingData.workingHours?.sunday?.enabled || false }
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
      
      const newProvider = await providerApi.createProvider(providerData)
      console.log('Provider profile created:', newProvider)
      router.push('/provider/dashboard')
      
    } catch (error) {
      console.error('Error creating provider profile:', error)
      router.push('/provider/dashboard')
    }
  }

  const renderStep = () => {
    const currentStepData = onboardingSteps[currentStep]
    
    switch (currentStepData.component) {
      case 'welcome':
        return (
          <WelcomeStep
            data={onboardingData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 'service-category':
        return (
          <ServiceCategoryStep
            data={onboardingData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 'location-selection':
        return (
          <LocationSelectionStep
            data={onboardingData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 'address-input':
        return (
          <AddressInputStep
            data={onboardingData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 'services':
        return (
          <ServicesStep
            data={onboardingData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 'detailed-services':
        return (
          <DetailedServiceStep
            data={onboardingData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 'working-hours':
        return (
          <WorkingHoursStep
            data={onboardingData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 'logo-cover':
        return (
          <LogoCoverStep
            data={onboardingData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 'provider-type':
        return (
          <ProviderTypeStep
            data={onboardingData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 'service-details':
        return (
          <ServiceDetailsStep
            data={onboardingData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 'business-info':
        return (
          <BusinessInfoStep
            data={onboardingData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 'review':
        return (
          <ReviewStep
            data={onboardingData}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      default:
        return (
          <div className="bg-neutral-50 relative size-full min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">{currentStepData.title}</h2>
              <p className="text-gray-600 mb-8">This step is coming soon...</p>
              <button 
                onClick={handleNext}
                className="bg-black text-white px-6 py-2 rounded-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )
    }
  }

  // Show loading state while checking user authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading state if no user (will redirect to signin)
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {renderStep()}
    </div>
  )
}