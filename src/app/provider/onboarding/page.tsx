'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { providerApi } from '@/lib/providers'
import { OnboardingData } from '@/types/onboarding'
import { serviceApi } from '@/lib/services'
import { uploadServiceImage, getPublicUrl } from '@/lib/storage'
import { toast } from 'sonner'
import Image from 'next/image'
import WelcomeStep from '@/components/provider-onboarding/welcome-step'
import ServiceCategoryStep from '@/components/provider-onboarding/service-category-step'
import LocationSelectionStep from '@/components/provider-onboarding/location-selection-step'
import AddressInputStep from '@/components/provider-onboarding/address-input-step'
import ServicesStep from '@/components/provider-onboarding/services-step'
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
  { id: 4, title: 'Business Info', component: 'business-info' },
  { id: 5, title: 'Services', component: 'services' },
  { id: 6, title: 'Working Hours', component: 'working-hours' },
  { id: 7, title: 'Logo and Cover', component: 'logo-cover' },
  { id: 8, title: 'Review', component: 'review' }
]

function ProviderOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editProviderId, setEditProviderId] = useState<string | null>(null)
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
  const searchParams = useSearchParams()

  // Handle navigation based on user state and edit mode
  useEffect(() => {
    const checkUserStatus = async () => {
      if (loading) return
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Check if we're in edit mode
      const editParam = searchParams.get('edit')
      if (editParam === 'true') {
        setIsEditMode(true)
        
        // Load existing provider data from sessionStorage
        const editData = sessionStorage.getItem('editProviderData')
        const providerId = sessionStorage.getItem('editProviderId')
        
        if (editData && providerId) {
          setEditProviderId(providerId)
          const parsedData = JSON.parse(editData)
          
          // Pre-fill the onboarding data with existing provider data
          setOnboardingData(prev => ({
            ...prev,
            providerType: parsedData.serviceType || parsedData.services?.[0]?.category || 'grooming', // Set provider type from edit data
            locationType: parsedData.locationType || 'single', // Set location type from edit data
            businessName: parsedData.businessName || '',
            businessDescription: parsedData.businessDescription || parsedData.description || '',
            phone: parsedData.phone || '',
            email: parsedData.email || '',
            website: parsedData.website || '',
            address: parsedData.address || '',
            city: parsedData.city || '',
            state: parsedData.state || '',
            zipCode: parsedData.zipCode || '',
            coordinates: parsedData.coordinates || { lat: 0, lng: 0 }, // Include coordinates
            experience: parsedData.experience || '',
            basePrice: parsedData.basePrice || parseFloat(parsedData.priceRange?.min || '0'),
            pricePerHour: parsedData.pricePerHour || parseFloat(parsedData.priceRange?.max || '0'),
            availability: parsedData.availability || prev.availability,
            certifications: parsedData.certifications || [],
            services: parsedData.services || [],
            photos: parsedData.photos || parsedData.images || [],
            profilePhoto: parsedData.profilePhoto || parsedData.avatarUrl || '',
            // Pre-fill cover and logo images if available
            coverImageUrl: parsedData.coverImageUrl || '',
            logoImageUrl: parsedData.logoImageUrl || ''
          }))
          
          // Skip to business info step (step 4) in edit mode
          setCurrentStep(4)
        }
        return
      }

      // For new onboarding, check if user already has a profile
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
  }, [user, loading, router, searchParams])

  const handleNext = () => {
    // Navigate to next step
    
    let nextStep = currentStep + 1
    
    // Skip Services step if provider type is "Skelbimai" (adoption)
    if (currentStep === 5 && onboardingData.providerType === 'adoption') {
      // Skip Services step for adoption provider
      nextStep = currentStep + 2 // Skip services (5) step, go to working-hours (6)
    }
    
    if (nextStep < onboardingSteps.length) {
      setCurrentStep(nextStep)
      // Move to next step
    } else {
      // Complete onboarding
      handleOnboardingComplete()
    }
  }

  const handlePrevious = () => {
    // Navigate to previous step
    
    let prevStep = currentStep - 1
    
    // Skip Services step if provider type is "Skelbimai" (adoption) when going back
    if (currentStep === 6 && onboardingData.providerType === 'adoption') {
      // Skip Services step when going back for adoption provider
      prevStep = currentStep - 2 // Skip services (5) step, go to business-info (4)
    }
    
    if (prevStep >= 0) {
      setCurrentStep(prevStep)
      // Move to previous step
    }
  }

  const handleDataUpdate = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }))
  }

  const handleExitEdit = () => {
    // Clear session storage
    sessionStorage.removeItem('editProviderData')
    sessionStorage.removeItem('editProviderId')
    
    // Redirect back to provider profile
    router.push('/provider/profile')
  }

  const handleSave = async () => {
    if (!user?.id) return
    
    try {
      // Prepare the provider data (same as in handleOnboardingComplete)
      const providerData = {
        userId: user?.id || '',
        businessName: onboardingData.businessName || '',
        businessType: onboardingData.providerType || 'individual',
        description: onboardingData.businessDescription || '',
        services: onboardingData.services || [],
        location: {
          address: onboardingData.addresses?.[0]?.address || onboardingData.address || '',
          city: onboardingData.addresses?.[0]?.city || onboardingData.city || '',
          state: onboardingData.state || '',
          zip: onboardingData.addresses?.[0]?.zipCode || onboardingData.zipCode || '',
          coordinates: onboardingData.coordinates || { lat: 0, lng: 0 }
        },
        serviceAreas: onboardingData.addresses?.map(addr => ({
          address: addr.address,
          city: addr.city,
          zipCode: addr.zipCode
        })) || [],
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
          min: Math.min(onboardingData.basePrice || 0, onboardingData.pricePerHour || 0),
          max: Math.max(onboardingData.basePrice || 0, onboardingData.pricePerHour || 0),
          currency: onboardingData.currency || 'EUR'
        },
        availability: onboardingData.availability || {},
        certifications: onboardingData.certifications || [],
        experienceYears: parseInt(onboardingData.experience) || 0,
        images: onboardingData.photos || [],
        avatarUrl: onboardingData.profilePhoto || ''
      }
      
      if (isEditMode && editProviderId) {
        // Update existing provider
        await providerApi.updateProvider(editProviderId, providerData)

        // Persist service details (create new services if needed)
        if (onboardingData.serviceDetails && onboardingData.serviceDetails.length > 0) {
          for (const detail of onboardingData.serviceDetails) {
            try {
              const created = await serviceApi.createService({
                providerId: editProviderId,
                category: (onboardingData.providerType as any),
                name: detail.name,
                description: detail.description || '',
                price: parseFloat(detail.price || '0') || 0,
                duration: 60,
                maxPets: 1,
                images: [],
                serviceLocation: detail.locationId ? (onboardingData.addresses || []).find(a => a.id === detail.locationId) : undefined
              })

              // Upload gallery images and attach URLs
              const imageUrls: string[] = []
              for (const file of (detail.gallery || [])) {
                const { data, error } = await uploadServiceImage(file, created.id)
                if (!error && data) {
                  imageUrls.push(getPublicUrl('service-images', data.path))
                }
              }
              if (imageUrls.length > 0) {
                await serviceApi.updateService(created.id, { images: imageUrls })
              }
            } catch (e) {
              // Non-blocking service creation failure
            }
          }
        }
        
        // Clear session storage
        sessionStorage.removeItem('editProviderData')
        sessionStorage.removeItem('editProviderId')
        
        toast.success('Provider profile updated successfully!')
      }
    } catch (error) {
      console.error('Error saving provider:', error)
      toast.error('Failed to save provider profile. Please try again.')
    }
  }

  const handleOnboardingComplete = async () => {
    try {
      // Prepare the provider data
      const providerData = {
        userId: user?.id || '',
        businessName: onboardingData.businessName || '',
        businessType: onboardingData.providerType || 'individual',
        description: onboardingData.businessDescription || '',
        services: onboardingData.services || [],
        location: {
          address: onboardingData.addresses?.[0]?.address || onboardingData.address || '',
          city: onboardingData.addresses?.[0]?.city || onboardingData.city || '',
          state: onboardingData.state || '',
          zip: onboardingData.addresses?.[0]?.zipCode || onboardingData.zipCode || '',
          coordinates: onboardingData.coordinates || { lat: 0, lng: 0 }
        },
        serviceAreas: onboardingData.addresses?.map(addr => ({
          address: addr.address,
          city: addr.city,
          zipCode: addr.zipCode
        })) || [],
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
          min: Math.min(onboardingData.basePrice || 0, onboardingData.pricePerHour || 0),
          max: Math.max(onboardingData.basePrice || 0, onboardingData.pricePerHour || 0),
          currency: onboardingData.currency || 'EUR'
        },
        availability: onboardingData.availability || {},
        certifications: onboardingData.certifications || [],
        experienceYears: parseInt(onboardingData.experience) || 0,
        images: onboardingData.photos || [],
        avatarUrl: onboardingData.profilePhoto || ''
      }
      
      if (isEditMode && editProviderId) {
        // Update existing provider
        await providerApi.updateProvider(editProviderId, providerData)
        
        // Clear session storage
        sessionStorage.removeItem('editProviderData')
        sessionStorage.removeItem('editProviderId')
        
        // Redirect to profile page
        router.push('/provider/profile')
      } else {
        // Create new provider
        const provider = await providerApi.createProvider(providerData)

        // Persist service details for new provider
        if (provider?.id && onboardingData.serviceDetails && onboardingData.serviceDetails.length > 0) {
          for (const detail of onboardingData.serviceDetails) {
            try {
              const created = await serviceApi.createService({
                providerId: provider.id,
                category: (onboardingData.providerType as any),
                name: detail.name,
                description: detail.description || '',
                price: parseFloat(detail.price || '0') || 0,
                duration: 60,
                maxPets: 1,
                images: [],
                serviceLocation: detail.locationId ? (onboardingData.addresses || []).find(a => a.id === detail.locationId) : undefined
              })

              const imageUrls: string[] = []
              for (const file of (detail.gallery || [])) {
                const { data, error } = await uploadServiceImage(file, created.id)
                if (!error && data) {
                  imageUrls.push(getPublicUrl('service-images', data.path))
                }
              }
              if (imageUrls.length > 0) {
                await serviceApi.updateService(created.id, { images: imageUrls })
              }
            } catch (e) {
              // Ignore single service failures to not block onboarding
            }
          }
        }
        router.push('/provider/dashboard')
      }
      
    } catch (error) {
      console.error('Error saving provider profile:', error)
      router.push('/provider/dashboard')
    }
  }

  const renderStep = () => {
    const currentStepData = onboardingSteps[currentStep]
    
    // Common props for all steps
    const commonProps = {
      data: onboardingData,
      onUpdate: handleDataUpdate,
      onNext: handleNext,
      onPrevious: handlePrevious,
      isEditMode,
      onSave: handleSave,
      onExitEdit: handleExitEdit
    }
    
    switch (currentStepData.component) {
      case 'welcome':
        return (
          <WelcomeStep
            {...commonProps}
          />
        )
      case 'service-category':
        return (
          <ServiceCategoryStep
            {...commonProps}
          />
        )
      case 'location-selection':
        return (
          <LocationSelectionStep
            {...commonProps}
          />
        )
      case 'address-input':
        return (
          <AddressInputStep
            {...commonProps}
          />
        )
      case 'business-info':
        return (
          <BusinessInfoStep
            {...commonProps}
          />
        )
      case 'services':
        return (
          <ServicesStep
            {...commonProps}
          />
        )
      case 'working-hours':
        return (
          <WorkingHoursStep
            {...commonProps}
          />
        )
      case 'logo-cover':
        return (
          <LogoCoverStep
            {...commonProps}
          />
        )
      case 'provider-type':
        return (
          <ProviderTypeStep
            {...commonProps}
          />
        )
      case 'service-details':
        return (
          <ServiceDetailsStep
            {...commonProps}
          />
        )
      case 'review':
        return (
          <ReviewStep
            {...commonProps}
          />
        )
      default:
        return (
          <div className="bg-white relative size-full min-h-screen flex items-center justify-center">
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Image
            src="/PetiFy.svg"
            alt="PetiFy"
            width={120}
            height={40}
            className="mx-auto mb-4 animate-pulse"
            priority
          />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading state if no user (will redirect to signin)
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Image
            src="/PetiFy.svg"
            alt="PetiFy"
            width={120}
            height={40}
            className="mx-auto mb-4 animate-pulse"
            priority
          />
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {renderStep()}
    </div>
  )
}

// Wrapper component with Suspense boundary
function OnboardingPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ProviderOnboardingPage />
    </Suspense>
  )
}

export default OnboardingPageWithSuspense