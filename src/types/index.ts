// Core types for PetServices marketplace

export type ServiceCategory = 
  | 'grooming'
  | 'veterinary'
  | 'boarding'
  | 'training'
  | 'walking'
  | 'sitting'
  | 'adoption'

export type ServiceStatus = 'active' | 'inactive' | 'pending'

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type UserRole = 'customer' | 'provider' | 'admin'

export interface User {
  id: string
  email: string
  fullName: string
  avatar?: string
  role: UserRole
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  createdAt: string
  updatedAt: string
}

export interface ServiceProvider {
  id: string
  userId: string
  businessName: string
  description: string
  services: ServiceCategory[]
  location: {
    address: string
    city: string
    state: string
    zipCode: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  rating: number
  reviewCount: number
  priceRange: {
    min: number
    max: number
  }
  availability: {
    monday: TimeSlot[]
    tuesday: TimeSlot[]
    wednesday: TimeSlot[]
    thursday: TimeSlot[]
    friday: TimeSlot[]
    saturday: TimeSlot[]
    sunday: TimeSlot[]
  }
  images: string[]
  avatarUrl?: string
  certifications?: string[]
  experience: number // years
  status: ServiceStatus
  createdAt: string
  updatedAt: string
}

export interface TimeSlot {
  start: string // HH:MM format
  end: string // HH:MM format
  available: boolean
}

export interface Service {
  id: string
  providerId: string
  category: ServiceCategory
  name: string
  description: string
  price: number
  duration: number // minutes
  maxPets: number
  requirements?: string[]
  includes?: string[]
  images: string[]
  status: ServiceStatus
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  customerId: string
  providerId: string
  serviceId: string
  petId?: string // Single pet per booking
  date: string // YYYY-MM-DD
  timeSlot: TimeSlot
  totalPrice: number
  status: BookingStatus
  notes?: string
  createdAt: string
  updatedAt: string
  // Populated fields (not in database)
  pet?: Pet
  service?: Service
  provider?: ServiceProvider
}

export interface Pet {
  id: string
  ownerId: string
  name: string
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
  breed?: string
  age: number // months
  weight?: number // kg
  specialNeeds?: string[]
  medicalNotes?: string
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  bookingId: string
  customerId: string
  providerId: string
  rating: number // 1-5
  comment: string
  images?: string[]
  createdAt: string
  updatedAt: string
}

export interface SearchFilters {
  category?: ServiceCategory
  location?: string
  priceRange?: {
    min: number
    max: number
  }
  rating?: number
  date?: string // YYYY-MM-DD format
  availability?: {
    date: string
    timeSlot?: TimeSlot
  }
  distance?: number // km
}

export interface SearchResult {
  provider: ServiceProvider
  services: Service[]
  distance?: number
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface CreateBookingForm {
  serviceId: string
  date: string
  timeSlot: TimeSlot
  pets: string[] // pet IDs
  notes?: string
}

export interface CreateReviewForm {
  bookingId: string
  rating: number
  comment: string
  images?: File[]
}

export interface UpdateProfileForm {
  fullName: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

export interface CreateServiceForm {
  category: ServiceCategory
  name: string
  description: string
  price: number
  duration: number
  maxPets: number
  requirements?: string[]
  includes?: string[]
  images?: File[]
}
