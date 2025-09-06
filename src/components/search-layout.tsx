'use client'

import { useState } from 'react'
import { MapboxMap } from '@/components/mapbox-map'
import { SearchFilters } from '@/components/search-filters'
import { SearchResult } from '@/types'
import { Button } from '@/components/ui/button'
import { Map, List, Filter } from 'lucide-react'

interface SearchLayoutProps {
  results: SearchResult[]
  filters: any
  onFiltersChange: (filters: any) => void
  loading: boolean
}

export const SearchLayout = ({ results, filters, onFiltersChange, loading }: SearchLayoutProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list')
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>()
  const [showFilters, setShowFilters] = useState(false)

  const handleMarkerClick = (result: SearchResult) => {
    setSelectedProviderId(result.provider.id)
  }

  const handleProviderClick = (result: SearchResult) => {
    setSelectedProviderId(result.provider.id)
  }

  const handleSearchClick = () => {
    console.log('Search clicked')
  }

  const handleFiltersClick = () => {
    setShowFilters(!showFilters)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with filters and view toggle */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFiltersClick}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
              
              {showFilters && (
                <div className="absolute top-16 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-30">
                  <SearchFilters
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                  />
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center space-x-2"
              >
                <List className="h-4 w-4" />
                <span>List</span>
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Grid</span>
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="flex items-center space-x-2"
              >
                <Map className="h-4 w-4" />
                <span>Map</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left: Provider Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {results.length} providers found
                </h2>
              </div>
              
              <div className="provider-grid-split">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
                    </div>
                  ))
                ) : (
                  results.map((result) => (
                    <ProviderCard
                      key={result.provider.id}
                      result={result}
                      isSelected={selectedProviderId === result.provider.id}
                      onClick={() => handleProviderClick(result)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right: Map */}
            <div className="sticky top-24 h-[calc(100vh-8rem)] hidden xl:block">
              <MapboxMap
                results={results}
                onMarkerClick={handleMarkerClick}
                selectedProviderId={selectedProviderId}
                onSearchClick={handleSearchClick}
                onFiltersClick={handleFiltersClick}
                showControls={false}
                className="h-full rounded-lg"
              />
            </div>
            
            {/* Mobile Map - Shows below grid on smaller screens */}
            <div className="xl:hidden mt-6">
              <div className="h-96 rounded-lg">
                <MapboxMap
                  results={results}
                  onMarkerClick={handleMarkerClick}
                  selectedProviderId={selectedProviderId}
                  onSearchClick={handleSearchClick}
                  onFiltersClick={handleFiltersClick}
                  showControls={true}
                  className="h-full rounded-lg"
                />
              </div>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid Only View */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {results.length} providers found
              </h2>
            </div>
            
            <div className="provider-grid">
              {loading ? (
                [...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
                  </div>
                ))
              ) : (
                results.map((result) => (
                  <ProviderCard
                    key={result.provider.id}
                    result={result}
                    isSelected={selectedProviderId === result.provider.id}
                    onClick={() => handleProviderClick(result)}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          /* Map Only View */
          <div className="h-[calc(100vh-8rem)]">
            <MapboxMap
              results={results}
              onMarkerClick={handleMarkerClick}
              selectedProviderId={selectedProviderId}
              onSearchClick={handleSearchClick}
              onFiltersClick={handleFiltersClick}
              showControls={true}
              className="h-full rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Provider Card Component (Airbnb style)
interface ProviderCardProps {
  result: SearchResult
  isSelected: boolean
  onClick: () => void
}

const ProviderCard = ({ result, isSelected, onClick }: ProviderCardProps) => {
  const formatPrice = (priceRange: { min: number; max: number }) => {
    if (priceRange.min === priceRange.max) {
      return `$${priceRange.min}`
    }
    return `$${priceRange.min}-${priceRange.max}`
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'grooming':
        return '🐕'
      case 'veterinary':
        return '🏥'
      case 'boarding':
        return '🏠'
      case 'training':
        return '🎓'
      default:
        return '🐾'
    }
  }

  return (
    <div
      className={`cursor-pointer rounded-lg overflow-hidden border transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-green-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl">
            {getServiceIcon(result.provider.services[0])}
          </span>
        </div>
        
        {/* Heart Icon */}
        <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              {result.provider.businessName}
            </h3>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {result.provider.description}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <svg className="h-3 w-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-medium text-gray-900">
            {result.provider.rating}
          </span>
          <span className="text-xs text-gray-500">
            ({result.provider.reviewCount})
          </span>
        </div>

        {/* Service Badge */}
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
            {result.provider.services[0]}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(result.provider.priceRange)}
            </span>
            <span className="text-xs text-gray-500 ml-1">per service</span>
          </div>
          <div className="text-xs text-gray-500">
            {result.distance} km away
          </div>
        </div>
      </div>
    </div>
  )
}
