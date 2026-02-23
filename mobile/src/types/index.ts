// Pagrindiniai tipai gyvunu paslaugu rinkai (mobile)

export type ServiceCategory =
  | 'grooming'
  | 'veterinary'
  | 'boarding'
  | 'training'
  | 'sitting'
  | 'adoption'
  | 'pets'

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
  businessType?: string
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
  contactInfo?: {
    phone: string
    email: string
    website?: string
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
  experience: number
  status: ServiceStatus
  createdAt: string
  updatedAt: string
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export interface Service {
  id: string
  providerId: string
  category: ServiceCategory
  name: string
  description: string
  price: number
  duration: number
  maxPets: number
  requirements?: string[]
  includes?: string[]
  images: string[]
  status: ServiceStatus
  createdAt: string
  updatedAt: string
  maleCount?: number
  femaleCount?: number
  breed?: string
  generation?: string
  ageWeeks?: number
  ageDays?: number
  readyToLeave?: string
  microchipped?: boolean
  vaccinated?: boolean
  wormed?: boolean
  healthChecked?: boolean
  parentsTested?: boolean
  kcRegistered?: boolean
}

export interface Booking {
  id: string
  customerId: string
  providerId: string
  serviceId: string
  petId?: string
  date: string
  timeSlot: TimeSlot
  totalPrice: number
  status: BookingStatus
  notes?: string
  createdAt: string
  updatedAt: string
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
  age: number
  weight?: number
  specialNeeds?: string[]
  medicalNotes?: string
  profilePicture?: string
  galleryImages: string[]
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  bookingId: string
  customerId: string
  providerId: string
  rating: number
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
  date?: string
  distance?: number
}

export interface Conversation {
  id: string
  customerId: string
  providerId: string
  lastMessage?: string
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
  provider?: ServiceProvider
  customer?: User
  unreadCount?: number
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

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

export interface CreateBookingForm {
  serviceId: string
  date: string
  timeSlot: TimeSlot
  pets: string[]
  notes?: string
}

export interface CreateReviewForm {
  bookingId: string
  rating: number
  comment: string
  images?: string[] // URIs instead of File[]
}

export interface UpdateProfileForm {
  fullName: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
}
