export type ProviderType = 'grooming' | 'training' | 'veterinary' | 'ads'

export interface OnboardingData {
  // Step 0: Provider Type
  providerType: ProviderType | ''
  
  // Step 1: Business Details
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
    start: string
    end: string
  }
  
  // Step 4: Photos
  photos: string[] // Changed to string array for image URLs
  profilePhoto?: string // Changed to string for image URL
  
  // Step 5: Review
  termsAccepted: boolean
  privacyAccepted: boolean
}
