'use client'

import { useState } from 'react'
import { MapboxMap } from '@/components/mapbox-map'
import { SearchFilters } from '@/components/search-filters'
import { ProviderCard } from '@/components/provider-card'
import { SearchResult, SearchFilters as SearchFiltersType } from '@/types'
import { Button } from '@/components/ui/button'
import { Map, List, Filter } from 'lucide-react'

interface SearchLayoutProps {
  results: SearchResult[]
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
  loading: boolean
  error?: string | null
}

export const SearchLayout = ({ results, filters, onFiltersChange, loading, error }: SearchLayoutProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list')
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>()
  const [showFilters, setShowFilters] = useState(false)

  const handleMarkerClick = (result: SearchResult) => {
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
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error ? (
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
        ) : viewMode === 'list' ? (
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
                      provider={result.provider}
                      services={result.services}
                      distance={result.distance}
                      className={selectedProviderId === result.provider.id ? 'ring-2 ring-blue-500' : ''}
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
                    provider={result.provider}
                    services={result.services}
                    distance={result.distance}
                    className={selectedProviderId === result.provider.id ? 'ring-2 ring-blue-500' : ''}
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

