export type ProviderType = 'grooming' | 'training' | 'veterinary' | 'ads'

export interface OnboardingData {
  // Step 0: Provider Type
  providerType: ProviderType | ''
  
  // Step 1: Location Type
  locationType: 'single' | 'multiple' | ''
  
  // Step 2: Addresses
  addresses: Array<{
    id: string
    address: string
    city: string
    zipCode: string
  }>
  
  // Step 3: Services (only for non-ads providers)
  serviceDetails: Array<{
    id: string
    name: string
    description: string
    price: string
  }>
  
  // Step 4: Detailed Services (only for non-ads providers)
  detailedServices: Array<{
    id: string
    name: string
    description: string
    duration: string
    price: string
    gallery: File[]
  }>
  
  // Step 5: Logo and Cover (for all providers)
  coverImage: File | null
  logoImage: File | null
  
  // Step 6: Business Details
  businessName: string
  businessDescription: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  website?: string
  
  // Step 2: Service Type
  serviceType: string
  services: string[]
  experience: string
  certifications: string[]
  
  // Step 3: Pricing
  basePrice: number
  pricePerHour: number
  currency: string
  availability: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
  workingHours: {
    monday: { enabled: boolean; startTime: string; endTime: string }
    tuesday: { enabled: boolean; startTime: string; endTime: string }
    wednesday: { enabled: boolean; startTime: string; endTime: string }
    thursday: { enabled: boolean; startTime: string; endTime: string }
    friday: { enabled: boolean; startTime: string; endTime: string }
    saturday: { enabled: boolean; startTime: string; endTime: string }
    sunday: { enabled: boolean; startTime: string; endTime: string }
  }
  
  // Step 4: Photos
  photos: string[] // Changed to string array for image URLs
  profilePhoto?: string // Changed to string for image URL
  
  // Step 5: Review
  termsAccepted: boolean
  privacyAccepted: boolean
}
