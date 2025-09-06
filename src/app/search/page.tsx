'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { SearchLayout } from '@/components/search-layout'
import { ServiceCategory, SearchFilters, SearchResult } from '@/types'
import { providerApi } from '@/lib/providers'

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
      max: priceTo ? parseInt(priceTo) : 5000 
    },
    rating: 0,
    distance: 25,
    date: date || undefined,
  } as SearchFilters)

  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        error={error}
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
