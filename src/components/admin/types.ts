export interface AdminStats {
  totalUsers: number
  totalProviders: number
  totalBookings: number
  totalRevenue: number
  monthlyRevenue: number
  activeProviders: number
  pendingProviders: number
  totalPets: number
  totalServices: number
  businessTypeStats: Record<string, number>
}

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: string
  created_at: string
  providers?: {
    business_name: string
    status: string
  }
}

export interface Provider {
  id: string
  user_id: string
  business_name: string
  business_type: string
  description: string
  services: string[]
  location: {
    address: string
    city: string
    state: string
    zip: string
  }
  contact_info: {
    phone: string
    email: string
    website?: string
  }
  status: string
  is_verified: boolean
  created_at: string
  updated_at: string
  users: {
    id: string
    email: string
    full_name: string
    role: string
  }
}

export interface Service {
  id: string
  name: string
  category: string
  description: string
  price: number
  duration_minutes: number
  max_pets: number
  requirements: string[]
  includes: string[]
  images: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  providers: {
    id: string
    business_name: string
    business_type: string
    status: string
    is_verified: boolean
    users: {
      id: string
      email: string
      full_name: string
    }
  }
}
