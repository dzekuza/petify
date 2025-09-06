'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { SearchLayout } from '@/components/search-layout'
import { ServiceCategory, SearchFilters, SearchResult } from '@/types'

function SearchPageContent() {
  const searchParams = useSearchParams()
  
  // Parse price parameters from URL
  const priceFrom = searchParams.get('priceFrom')
  const priceTo = searchParams.get('priceTo')
  const date = searchParams.get('date')
  
  const [filters, setFilters] = useState({
    category: (searchParams.get('category') as ServiceCategory) || undefined,
    location: searchParams.get('location') || '',
    priceRange: { 
      min: priceFrom ? parseInt(priceFrom) : 0, 
      max: priceTo ? parseInt(priceTo) : 1000 
    },
    rating: 0,
    distance: 25,
    date: date || undefined,
  } as SearchFilters)

  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - same as in map-view
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

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      let filteredResults = mockProviders

      // Apply category filter
      if (filters.category) {
        filteredResults = filteredResults.filter(result => 
          result.provider.services.includes(filters.category as any)
        )
      }

      // Apply location filter
      if (filters.location) {
        const locationFilter = filters.location.toLowerCase()
        filteredResults = filteredResults.filter(result => 
          result.provider.location.city.toLowerCase().includes(locationFilter) ||
          result.provider.location.address.toLowerCase().includes(locationFilter)
        )
      }

      // Apply price range filter
      if (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 1000)) {
        filteredResults = filteredResults.filter(result => 
          result.provider.priceRange.min >= filters.priceRange!.min &&
          result.provider.priceRange.max <= filters.priceRange!.max
        )
      }

      // Apply rating filter
      if (filters.rating && filters.rating > 0) {
        filteredResults = filteredResults.filter(result => 
          result.provider.rating >= filters.rating!
        )
      }

      // Apply date filter (check if provider is available on selected date)
      if (filters.date) {
        const selectedDate = new Date(filters.date)
        const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase() // 'mon', 'tue', etc.
        const dayKey = dayOfWeek === 'sun' ? 'sunday' : 
                      dayOfWeek === 'mon' ? 'monday' :
                      dayOfWeek === 'tue' ? 'tuesday' :
                      dayOfWeek === 'wed' ? 'wednesday' :
                      dayOfWeek === 'thu' ? 'thursday' :
                      dayOfWeek === 'fri' ? 'friday' : 'saturday'
        
        filteredResults = filteredResults.filter(result => {
          const availability = result.provider.availability[dayKey as keyof typeof result.provider.availability]
          return availability && availability.length > 0 && availability.some(slot => slot.available)
        })
      }

      setResults(filteredResults)
      setLoading(false)
    }, 1000)
  }, [filters])

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  return (
    <Layout>
      <SearchLayout
        results={results}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        loading={loading}
      />
    </Layout>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
