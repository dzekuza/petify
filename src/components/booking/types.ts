import { ServiceProvider, Service, Pet } from '@/types'

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
  provider: ServiceProvider
  services: Service[]
  pets: Pet[]
  selectedService: Service | null
  selectedPets: string[]
  selectedDate: Date | undefined
  selectedTimeSlot: string
  availabilityData: Record<string, unknown> | null
  onServiceSelect: (service: Service) => void
  onPetSelect: (petId: string) => void
  onDateSelect: (date: Date | undefined) => void
  onTimeSelect: (time: string) => void
  onNext: () => void
  onPrev: () => void
  onComplete: () => void
  loading?: boolean
}

export interface BookingContextType {
  provider: ServiceProvider
  services: Service[]
  pets: Pet[]
  selectedService: Service | null
  selectedPets: string[]
  selectedDate: Date | undefined
  selectedTimeSlot: string
  currentStep: number
  loading: boolean
  onServiceSelect: (service: Service) => void
  onPetSelect: (petId: string) => void
  onDateSelect: (date: Date | undefined) => void
  onTimeSelect: (time: string) => void
  onNext: () => void
  onPrev: () => void
  onComplete: () => void
}
