'use client'

import { useState, useEffect } from 'react'
import { ProviderCard } from '@/components/provider-card'
import { Button } from '@/components/ui/button'
import { SearchFilters as SearchFiltersType, SearchResult } from '@/types'
import { providerApi } from '@/lib/providers'

// Mock data for demonstration
const mockProviders: SearchResult[] = [
  {
    provider: {
      id: '1',
      userId: 'user1',
      businessName: 'Happy Paws Grooming',
      description: 'Professional pet grooming with 10+ years of experience. We specialize in all breeds and offer premium grooming services.',
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
    },
    services: [
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
        includes: ['Bath', 'Brush', 'Nail trim', 'Ear cleaning'],
        images: ['/placeholder-grooming.jpg'],
        status: 'active',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ],
    distance: 2.3
  },
  {
    provider: {
      id: '2',
      userId: 'user2',
      businessName: 'Dr. Sarah\'s Veterinary Clinic',
      description: 'Comprehensive veterinary care for all pets. Emergency services available 24/7.',
      services: ['veterinary'],
      location: {
        address: '456 Oak Ave',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        coordinates: { lat: 37.7849, lng: -122.4094 }
      },
      rating: 4.8,
      reviewCount: 89,
      priceRange: { min: 75, max: 200 },
      availability: {
        monday: [{ start: '08:00', end: '18:00', available: true }],
        tuesday: [{ start: '08:00', end: '18:00', available: true }],
        wednesday: [{ start: '08:00', end: '18:00', available: true }],
        thursday: [{ start: '08:00', end: '18:00', available: true }],
        friday: [{ start: '08:00', end: '18:00', available: true }],
        saturday: [{ start: '09:00', end: '15:00', available: true }],
        sunday: []
      },
      images: ['/placeholder-vet.jpg'],
      certifications: ['DVM', 'Emergency Medicine Certified'],
      experience: 15,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    services: [
      {
        id: '2',
        providerId: '2',
        category: 'veterinary',
        name: 'Wellness Checkup',
        description: 'Comprehensive health examination and vaccination updates',
        price: 95,
        duration: 60,
        maxPets: 1,
        requirements: ['Previous medical records'],
        includes: ['Physical exam', 'Vaccinations', 'Health certificate'],
        images: ['/placeholder-vet.jpg'],
        status: 'active',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ],
    distance: 4.1
  },
  {
    provider: {
      id: '3',
      userId: 'user3',
      businessName: 'Paws & Play Boarding',
      description: 'Luxury pet boarding with 24/7 care and supervised playtime.',
      services: ['boarding'],
      location: {
        address: '789 Pine St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94104',
        coordinates: { lat: 37.7949, lng: -122.3994 }
      },
      rating: 4.7,
      reviewCount: 156,
      priceRange: { min: 60, max: 120 },
      availability: {
        monday: [{ start: '00:00', end: '23:59', available: true }],
        tuesday: [{ start: '00:00', end: '23:59', available: true }],
        wednesday: [{ start: '00:00', end: '23:59', available: true }],
        thursday: [{ start: '00:00', end: '23:59', available: true }],
        friday: [{ start: '00:00', end: '23:59', available: true }],
        saturday: [{ start: '00:00', end: '23:59', available: true }],
        sunday: [{ start: '00:00', end: '23:59', available: true }]
      },
      images: ['/placeholder-boarding.jpg'],
      certifications: ['Pet Care Certified', 'CPR Certified'],
      experience: 8,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    services: [
      {
        id: '3',
        providerId: '3',
        category: 'boarding',
        name: 'Overnight Boarding',
        description: 'Comfortable overnight stay with daily walks and playtime',
        price: 80,
        duration: 1440, // 24 hours
        maxPets: 2,
        requirements: ['Vaccination records', 'Health certificate'],
        includes: ['Daily walks', 'Playtime', 'Feeding', 'Medication administration'],
        images: ['/placeholder-boarding.jpg'],
        status: 'active',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ],
    distance: 1.8
  }
]

interface SearchResultsProps {
  filters: SearchFiltersType
}

export const SearchResults = ({ filters }: SearchResultsProps) => {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const searchResults = await providerApi.searchProviders({
          category: filters.category,
          location: filters.location,
          priceRange: filters.priceRange,
          rating: filters.rating,
          distance: filters.distance,
          date: filters.date
        })

        setResults(searchResults)
      } catch (err) {
        console.error('Error fetching providers:', err)
        setError('Failed to load providers. Please try again.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [filters])

  const toggleFavorite = (providerId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(providerId)) {
        newFavorites.delete(providerId)
      } else {
        newFavorites.add(providerId)
      }
      return newFavorites
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-96"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">Error loading providers</div>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">No providers found</div>
        <p className="text-gray-400 mb-6">
          Try adjusting your search filters or expanding your search area.
        </p>
        <Button variant="outline">Clear Filters</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="text-sm text-gray-600 mb-6">
        {results.length} provider{results.length !== 1 ? 's' : ''} found
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => (
          <ProviderCard
            key={result.provider.id}
            provider={result.provider}
            services={result.services}
            distance={result.distance}
          />
        ))}
      </div>
    </div>
  )
}
