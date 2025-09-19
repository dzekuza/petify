export interface BookingFormData {
  name: string
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
  breed: string
  age: string
  weight: string
  specialNeeds: string
  medicalNotes: string
  profilePicture: string
  galleryImages: string[]
}

export interface BookingStepProps {
  provider: any
  services: any[]
  pets: any[]
  selectedService: any
  selectedPets: string[]
  selectedDate: Date | undefined
  selectedTimeSlot: string
  availabilityData: Record<string, unknown> | null
  onServiceSelect: (service: any) => void
  onPetSelect: (petId: string) => void
  onDateSelect: (date: Date | undefined) => void
  onTimeSelect: (time: string) => void
  onNext: () => void
  onPrev: () => void
  onComplete: () => void
  loading?: boolean
}

export interface BookingContextType {
  provider: any
  services: any[]
  pets: any[]
  selectedService: any
  selectedPets: string[]
  selectedDate: Date | undefined
  selectedTimeSlot: string
  currentStep: number
  loading: boolean
  onServiceSelect: (service: any) => void
  onPetSelect: (petId: string) => void
  onDateSelect: (date: Date | undefined) => void
  onTimeSelect: (time: string) => void
  onNext: () => void
  onPrev: () => void
  onComplete: () => void
}
