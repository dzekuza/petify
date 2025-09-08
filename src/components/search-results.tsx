'use client'

import { useState, useEffect } from 'react'
import { ProviderCard } from '@/components/provider-card'
import { Button } from '@/components/ui/button'
import { SearchFilters as SearchFiltersType, SearchResult } from '@/types'
import { providerApi } from '@/lib/providers'


interface SearchResultsProps {
  filters: SearchFiltersType
}

export const SearchResults = ({ filters }: SearchResultsProps) => {
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
          date: filters.date,
          petId: filters.petId
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
            distance={result.distance}
          />
        ))}
      </div>
    </div>
  )
}
