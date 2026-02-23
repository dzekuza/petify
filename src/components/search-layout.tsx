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
            <p className="text-muted-foreground mb-6">{error}</p>
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

  return (
    <div className="min-h-screen bg-neutral-50/60">
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
      <div className="hidden lg:flex h-[calc(100vh-4.5rem)]">
        {viewMode === 'list' ? (
          <>
            {/* Left Panel: Filters + Results */}
            <div className="w-[55%] xl:w-[50%] flex flex-col h-full overflow-hidden">
              {/* Filters Section */}
              <div className="shrink-0 px-6 pt-5 pb-4 bg-white border-b border-neutral-100">
                <SearchFilters
                  filters={filters}
                  onFiltersChange={onFiltersChange}
                  isMobile={!isDesktop}
                  resultsCount={
                    filters.category === 'pets' ? individualPets.length :
                    filters.category === 'adoption' ? petAds.length :
                    results.length
                  }
                />
              </div>

              {/* Scrollable Results */}
              <div className="flex-1 overflow-y-auto px-6 py-5 scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4d4d4 transparent' }}>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-neutral-200/60 rounded-2xl h-56 w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : filters.category === 'pets' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
                        {individualPets.length} Gyvūnai pardavimui
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {individualPets.map((pet) => (
                        <div key={pet.id} className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] p-4 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300">
                          <div className="flex gap-4">
                            {pet.gallery && pet.gallery.length > 0 && pet.gallery[0] && pet.gallery[0].trim() !== '' && (
                              <div className="w-24 h-24 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0">
                                <img
                                  src={pet.gallery[0]}
                                  alt={pet.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{pet.title}</h3>
                              <p className="text-neutral-500 text-sm">
                                {pet.sexType === 'male' ? 'Patinas' : 'Patelė'} &bull; {pet.age} sav.
                              </p>
                              <p className="text-lg font-bold text-emerald-600">{pet.price}&euro;</p>
                              <p className="text-sm text-neutral-400">
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
            </div>

            {/* Right: Map */}
            <div className="flex-1 h-full relative">
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
          </>
        ) : viewMode === 'grid' ? (
          /* Grid Only View */
          <div className="w-full overflow-y-auto px-6 py-5">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-neutral-100">
                <SearchFilters
                  filters={filters}
                  onFiltersChange={onFiltersChange}
                  isMobile={!isDesktop}
                  resultsCount={
                    filters.category === 'pets' ? individualPets.length :
                    filters.category === 'adoption' ? petAds.length :
                    results.length
                  }
                />
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-neutral-200/60 rounded-2xl h-64 w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : filters.category === 'pets' ? (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-neutral-900">
                      {individualPets.length} Gyvūnai pardavimui
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {individualPets.map((pet) => (
                        <div key={pet.id} className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] p-4">
                          <div className="flex gap-4">
                            {pet.gallery && pet.gallery.length > 0 && pet.gallery[0] && pet.gallery[0].trim() !== '' && (
                              <div className="w-24 h-24 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0">
                                <img
                                  src={pet.gallery[0]}
                                  alt={pet.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{pet.title}</h3>
                              <p className="text-neutral-500 text-sm">
                                {pet.sexType === 'male' ? 'Patinas' : 'Patelė'} &bull; {pet.age} sav.
                              </p>
                              <p className="text-lg font-bold text-emerald-600">{pet.price}&euro;</p>
                              <p className="text-sm text-neutral-400">
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
            className="w-full h-full"
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
          console.log('Applying filters:', { rating, providerType })
        }}
        resultsCount={results.length}
      />
    </div>
  )
}
