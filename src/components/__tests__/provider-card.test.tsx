import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/utils'
import { ProviderCard } from '../provider-card'
import { ServiceProvider, Service } from '../../types'

const mockProvider: ServiceProvider = {
  id: '1',
  userId: 'user1',
  businessName: 'Happy Paws Grooming',
  description: 'Professional pet grooming with 10+ years of experience.',
  services: ['grooming'],
  location: {
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    coordinates: { lat: 37.7749, lng: -122.4194 }
  },
  rating: 4.9,
  reviewCount: 127,
  priceRange: { min: 45, max: 85 },
  availability: {
    monday: [{ start: '09:00', end: '17:00', available: true }],
    tuesday: [{ start: '09:00', end: '17:00', available: true }],
    wednesday: [{ start: '09:00', end: '17:00', available: true }],
    thursday: [{ start: '09:00', end: '17:00', available: true }],
    friday: [{ start: '09:00', end: '17:00', available: true }],
    saturday: [{ start: '10:00', end: '16:00', available: true }],
    sunday: []
  },
  images: ['/placeholder-grooming.jpg'],
  certifications: ['Certified Pet Groomer', 'CPR Certified'],
  experience: 10,
  status: 'active',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

const mockServices: Service[] = [
  {
    id: '1',
    providerId: '1',
    category: 'grooming',
    name: 'Full Grooming Package',
    description: 'Complete grooming service including bath, brush, nail trim, and styling',
    price: 65,
    duration: 120,
    maxPets: 1,
    requirements: ['Vaccination records'],
    includes: ['Bath', 'Brush', 'Nail trim', 'Ear cleaning', 'Styling'],
    images: ['/placeholder-grooming.jpg'],
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

describe('ProviderCard', () => {
  it('renders provider information correctly', () => {
    render(<ProviderCard provider={mockProvider} services={mockServices} />)
    
    expect(screen.getByText('Happy Paws Grooming')).toBeInTheDocument()
    expect(screen.getByText('Professional pet grooming with 10+ years of experience.')).toBeInTheDocument()
    expect(screen.getByText('4.9')).toBeInTheDocument()
    expect(screen.getByText('(127 reviews)')).toBeInTheDocument()
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
    // Price range is displayed in the component
    expect(screen.getByText('$45-$85')).toBeInTheDocument()
  })

  it('displays service categories', () => {
    render(<ProviderCard provider={mockProvider} services={mockServices} />)
    
    expect(screen.getByText('✂️ grooming')).toBeInTheDocument()
  })

  it('shows availability status', () => {
    render(<ProviderCard provider={mockProvider} services={mockServices} />)
    
    expect(screen.getByText('Closed')).toBeInTheDocument()
  })

  it('displays certifications when available', () => {
    render(<ProviderCard provider={mockProvider} services={mockServices} />)
    
    expect(screen.getByText('Certified')).toBeInTheDocument()
  })

  it('shows experience information', () => {
    render(<ProviderCard provider={mockProvider} services={mockServices} />)
    
    expect(screen.getByText('10 years experience')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<ProviderCard provider={mockProvider} services={mockServices} />)
    
    expect(screen.getByText('View Profile')).toBeInTheDocument()
    expect(screen.getByText('Book Now')).toBeInTheDocument()
  })

  it('displays distance when provided', () => {
    render(<ProviderCard provider={mockProvider} services={mockServices} distance={5.2} />)
    
    expect(screen.getByText('5.2 km away')).toBeInTheDocument()
  })
})
