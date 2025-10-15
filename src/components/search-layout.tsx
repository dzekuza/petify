'use client'

import { useState } from 'react'
import { MapboxMap } from '@/components/mapbox-map'
import { ListingsGrid } from '@/components/listings-grid'
import { PetAdsGrid } from '@/components/pet-ads-grid'
import { FilterModal } from '@/components/filter-modal'
import { SearchFilters } from '@/components/search-filters'
import { SearchResult, SearchFilters as SearchFiltersType, PetAd, IndividualPet } from '@/types'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/translations'
import { useDeviceDetection } from '@/lib/device-detection'

interface SearchLayoutProps {
  results: SearchResult[]
  petAds?: PetAd[]
  individualPets?: IndividualPet[]
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
  loading: boolean
  error?: string | null
  onFiltersClick?: () => void
  showFilterModal?: boolean
  onFilterModalClose?: () => void
  onMarkerClick?: (result: SearchResult) => void
  selectedProviderId?: string
  isDrawerOpen?: boolean
}

export const SearchLayout = ({ results, petAds = [], individualPets = [], filters, onFiltersChange, loading, error, onFiltersClick, showFilterModal, onFilterModalClose, onMarkerClick, selectedProviderId, isDrawerOpen }: SearchLayoutProps) => {
  const { isDesktop } = useDeviceDetection()
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list')
  const [rating, setRating] = useState(0)
  const [providerType, setProviderType] = useState('any')

  const handleSearchClick = () => {
    console.log('Search clicked')
  }

  const handleFiltersClick = () => {
    onFiltersClick?.()
  }

  const handleFilterModalClose = () => {
    onFilterModalClose?.()
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
        </div>
      </div>
    )
  }

  // Calculate map height based on drawer state
  const mapHeight = isDrawerOpen ? 'h-[20vh]' : 'h-[84vh]'

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Layout - Full Screen Map */}
      <div className="lg:hidden h-screen">
        <MapboxMap
          results={results}
          onMarkerClick={onMarkerClick}
          selectedProviderId={selectedProviderId}
          onSearchClick={handleSearchClick}
          onFiltersClick={handleFiltersClick}
          showControls={false}
          className="w-full h-full"
        />
      </div>

      {/* Desktop Layout - Side by Side */}
      <div className="hidden lg:block mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'list' ? (
          <div className="space-y-6 h-[calc(100vh-8rem)]">
            {/* Filters */}
            <SearchFilters 
              filters={filters} 
              onFiltersChange={onFiltersChange}
              isMobile={!isDesktop}
            />
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
              {/* Left: Provider Grid */}
              <div className="space-y-4 overflow-y-auto pr-2">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : filters.category === 'pets' ? (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {individualPets.length} Gyvūnai pardavimui
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {individualPets.map((pet) => (
                        <div key={pet.id} className="bg-white rounded-lg shadow-md p-4">
                          <div className="flex gap-4">
                            {pet.gallery && pet.gallery.length > 0 && pet.gallery[0] && pet.gallery[0].trim() !== '' && (
                              <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={pet.gallery[0]}
                                  alt={pet.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{pet.title}</h3>
                              <p className="text-gray-600 text-sm">
                                {pet.sexType === 'male' ? 'Patinas' : 'Patelė'} • {pet.age} sav.
                              </p>
                              <p className="text-lg font-bold text-green-600">{pet.price}€</p>
                              <p className="text-sm text-gray-500">
                                Paruoštas: {new Date(pet.readyToLeave).toLocaleDateString('lt-LT')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ListingsGrid
                    title={`${results.length} ${t('search.providersFound')}`}
                    providers={results.map(result => result.provider)}
                    showViewAll={false}
                    gridCols="grid-cols-1 md:grid-cols-2"
                  />
                )}
              </div>

              {/* Right: Map */}
              <MapboxMap
                results={results}
                onMarkerClick={onMarkerClick}
                selectedProviderId={selectedProviderId}
                onSearchClick={handleSearchClick}
                onFiltersClick={handleFiltersClick}
                showControls={false}
                className="sticky top-24 h-[calc(100vh-8rem)] rounded-lg"
              />
            </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid Only View */
            <div className="space-y-6">
              {/* Filters */}
              <SearchFilters 
                filters={filters} 
                onFiltersChange={onFiltersChange}
                isMobile={!isDesktop}
              />
              <div className="space-y-4">
              {loading ? (
                <div className="provider-grid">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
                    </div>
                  ))}
                </div>
              ) : filters.category === 'pets' ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {individualPets.length} Gyvūnai pardavimui
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {individualPets.map((pet) => (
                      <div key={pet.id} className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex gap-4">
                          {pet.gallery && pet.gallery.length > 0 && pet.gallery[0] && pet.gallery[0].trim() !== '' && (
                            <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={pet.gallery[0]}
                                alt={pet.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{pet.title}</h3>
                            <p className="text-gray-600 text-sm">
                              {pet.sexType === 'male' ? 'Patinas' : 'Patelė'} • {pet.age} sav.
                            </p>
                            <p className="text-lg font-bold text-green-600">{pet.price}€</p>
                            <p className="text-sm text-gray-500">
                              Paruoštas: {new Date(pet.readyToLeave).toLocaleDateString('lt-LT')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <ListingsGrid
                  title={`${results.length} ${t('search.providersFound')}`}
                  providers={results.map(result => result.provider)}
                  showViewAll={false}
                />
              )}
              </div>
            </div>
          ) : (
            /* Map Only View */
            <MapboxMap
              results={results}
              onMarkerClick={onMarkerClick}
              selectedProviderId={selectedProviderId}
              onSearchClick={handleSearchClick}
              onFiltersClick={handleFiltersClick}
              showControls={true}
              className="h-[calc(100vh-8rem)] rounded-lg"
            />
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
        resultsCount={results.length}
      />
    </div>
  )
}

