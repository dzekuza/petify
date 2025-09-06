'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Star, Clock } from 'lucide-react'
import { SearchFilters as SearchFiltersType, SearchResult, ServiceCategory } from '@/types'
import { MapboxMap } from '@/components/mapbox-map'

// Mock data - same as search results
const mockProviders: SearchResult[] = [
  {
    provider: {
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
      certifications: ['Certified Pet Groomer'],
      experience: 10,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    services: [],
    distance: 2.3
  },
  {
    provider: {
      id: '2',
      userId: 'user2',
      businessName: 'Dr. Sarah\'s Veterinary Clinic',
      description: 'Comprehensive veterinary care for all pets.',
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
      certifications: ['DVM'],
      experience: 15,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    services: [],
    distance: 4.1
  },
  {
    provider: {
      id: '3',
      userId: 'user3',
      businessName: 'Paws & Play Boarding',
      description: 'Luxury pet boarding with 24/7 care.',
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
      certifications: ['Pet Care Certified'],
      experience: 8,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    services: [],
    distance: 1.8
  }
]

interface MapViewProps {
  filters: SearchFiltersType
}

export const MapView = ({ filters }: MapViewProps) => {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>()

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      let filteredResults = mockProviders

      // Apply filters
      if (filters.category) {
        filteredResults = filteredResults.filter(result => 
          result.provider.services.includes(filters.category as ServiceCategory)
        )
      }

      if (filters.rating && filters.rating > 0) {
        filteredResults = filteredResults.filter(result => 
          result.provider.rating >= filters.rating!
        )
      }

      setResults(filteredResults)
      setLoading(false)
    }, 1000)
  }, [filters])

  const handleMarkerClick = (result: SearchResult) => {
    setSelectedProviderId(result.provider.id)
  }

  const handleSearchClick = () => {
    // TODO: Implement search functionality
    console.log('Search clicked')
  }

  const handleFiltersClick = () => {
    // TODO: Implement filters functionality
    console.log('Filters clicked')
  }

  if (loading) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Interactive Mapbox Map */}
      <div className="h-96 rounded-lg overflow-hidden">
        <MapboxMap
          results={results}
          onMarkerClick={handleMarkerClick}
          selectedProviderId={selectedProviderId}
          onSearchClick={handleSearchClick}
          onFiltersClick={handleFiltersClick}
          showControls={true}
          className="h-full"
        />
      </div>

      {/* Provider List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result) => (
          <Card 
            key={result.provider.id} 
            className={`hover:shadow-md transition-all cursor-pointer ${
              selectedProviderId === result.provider.id 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleMarkerClick(result)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {result.provider.businessName}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs font-medium text-gray-900 ml-1">
                        {result.provider.rating}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      ({result.provider.reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {result.distance} km away
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {result.provider.services[0]}
                    </Badge>
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                      View
                    </Button>
                    <Button size="sm" className="text-xs px-2 py-1">
                      Book
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
