'use client'

import { useState } from 'react'
import { MapboxMap } from '@/components/mapbox-map'
import { ProvidersGridStatic } from '@/components/providers-grid-static'
import { FilterModal } from '@/components/filter-modal'
import { SearchResult, SearchFilters as SearchFiltersType } from '@/types'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/translations'

interface SearchLayoutProps {
  results: SearchResult[]
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
  loading: boolean
  error?: string | null
  onFiltersClick?: () => void
  showFilterModal?: boolean
  onFilterModalClose?: () => void
}

export const SearchLayout = ({ results, filters, onFiltersChange, loading, error, onFiltersClick, showFilterModal, onFilterModalClose }: SearchLayoutProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list')
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>()
  const [rating, setRating] = useState(0)
  const [providerType, setProviderType] = useState('any')

  const handleMarkerClick = (result: SearchResult) => {
    setSelectedProviderId(result.provider.id)
  }


  const handleSearchClick = () => {
    console.log('Search clicked')
  }

  const handleFiltersClick = () => {
    onFiltersClick?.()
  }

  const handleFilterModalClose = () => {
    onFilterModalClose?.()
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">{t('search.errorLoadingProviders')}</div>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              {t('search.tryAgain')}
            </Button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left: Provider Grid */}
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <ProvidersGridStatic
                  title={`${results.length} ${t('search.providersFound')}`}
                  providers={results.map(result => result.provider)}
                  showViewAll={false}
                  gridCols="grid-cols-1 md:grid-cols-2"
                />
              )}
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
            {loading ? (
              <div className="provider-grid">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <ProvidersGridStatic
                title={`${results.length} ${t('search.providersFound')}`}
                providers={results.map(result => result.provider)}
                showViewAll={false}
              />
            )}
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

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal || false}
        onClose={handleFilterModalClose}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        priceRange={[filters.priceRange?.min || 0, filters.priceRange?.max || 5000]}
        onPriceRangeChange={(range) => onFiltersChange({
          ...filters,
          priceRange: { min: range[0], max: range[1] }
        })}
        rating={rating}
        onRatingChange={setRating}
        providerType={providerType}
        onProviderTypeChange={setProviderType}
        onApplyFilters={() => {
          // Apply filters logic here
          console.log('Applying filters:', { rating, providerType })
        }}
        onClearAll={() => {
          setRating(0)
          setProviderType('any')
          onFiltersChange({
            ...filters,
            priceRange: { min: 0, max: 5000 }
          })
        }}
        resultsCount={results.length}
      />
    </div>
  )
}

