'use client'

import { useState } from 'react'
import { MapboxMap } from '@/components/mapbox-map'
import { ListingsGrid } from '@/components/listings-grid'
import { PetAdsGrid } from '@/components/pet-ads-grid'
import { FilterModal } from '@/components/filter-modal'
import { SearchResult, SearchFilters as SearchFiltersType, PetAd } from '@/types'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/translations'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerPortal,
  DrawerOverlay,
} from '@/components/ui/drawer'
import * as DrawerPrimitive from 'vaul'
import { ChevronUp } from 'lucide-react'
import { useDeviceDetection } from '@/lib/device-detection'

interface SearchLayoutProps {
  results: SearchResult[]
  petAds?: PetAd[]
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
  loading: boolean
  error?: string | null
  onFiltersClick?: () => void
  showFilterModal?: boolean
  onFilterModalClose?: () => void
}

export const SearchLayout = ({ results, petAds = [], filters, onFiltersChange, loading, error, onFiltersClick, showFilterModal, onFilterModalClose }: SearchLayoutProps) => {
  const { isDesktop } = useDeviceDetection()
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list')
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>()
  const [rating, setRating] = useState(0)
  const [providerType, setProviderType] = useState('any')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleMarkerClick = (result: SearchResult) => {
    setSelectedProviderId(result.provider.id)
    // Only open drawer on mobile devices
    if (!isDesktop) {
      setIsDrawerOpen(true)
    }
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

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Layout - Map First, Drawer for Listings */}
      <div className="lg:hidden">
        {/* Map Section - Full screen when drawer minimized */}
        <div className={`transition-all duration-300 ${isDrawerOpen ? 'h-[calc(100vh-80vh)]' : 'h-[calc(100vh-12vh)]'}`}>
          <MapboxMap
            results={results}
            onMarkerClick={handleMarkerClick}
            selectedProviderId={selectedProviderId}
            onSearchClick={handleSearchClick}
            onFiltersClick={handleFiltersClick}
            showControls={false}
            className="h-full"
          />
        </div>

        {/* Drawer for Listings - Only on mobile */}
        {!isDesktop && (
          <Drawer 
            open={isDrawerOpen} 
            onOpenChange={setIsDrawerOpen} 
            direction="bottom"
          >
            <DrawerPortal>
              {/* Only show overlay when drawer is open */}
              {isDrawerOpen && <DrawerOverlay />}
              <DrawerPrimitive.Content
                className={`transition-all duration-300 ${isDrawerOpen ? 'h-[80vh] z-50' : 'h-[12vh] max-h-[12vh] z-30'} group/drawer-content bg-background fixed flex h-auto flex-col data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-16 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t`}
              >
                <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
                <DrawerHeader 
                  className="pb-2 cursor-pointer" 
                  onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                >
                  {/* Results Summary */}
                  <div className="text-center">
                    <DrawerTitle className="text-lg font-semibold text-gray-900">
                      {loading ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-32 rounded mx-auto"></div>
                      ) : (
                        t('search.overProviders', 'Over {count} providers').replace('{count}', results.length.toString())
                      )}
                    </DrawerTitle>
                    <DrawerDescription className="text-sm text-gray-600 mt-1 flex items-center justify-center">
                      {loading ? (
                        <span className="inline-block animate-pulse bg-gray-200 h-4 w-48 rounded"></span>
                      ) : (
                        <>
                          {t('search.showingProviders', 'Showing {count} providers').replace('{count}', Math.min(results.length, 12).toString())}
                          {!isDrawerOpen && (
                            <>
                              <ChevronUp className="w-4 h-4 ml-2" />
                              <span className="text-xs text-gray-500 ml-1">{t('search.tapToViewListings')}</span>
                            </>
                          )}
                        </>
                      )}
                    </DrawerDescription>
                  </div>
                </DrawerHeader>
                
                {isDrawerOpen && (
                  <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
                          </div>
                        ))}
                      </div>
                    ) : filters.category === 'adoption' ? (
                      <PetAdsGrid
                        title=""
                        petAds={petAds}
                        showViewAll={false}
                        gridCols="grid-cols-1"
                      />
                    ) : (
                      <ListingsGrid
                        title=""
                        providers={results.map(result => result.provider)}
                        showViewAll={false}
                        gridCols="grid-cols-1"
                      />
                    )}
                  </div>
                )}
              </DrawerPrimitive.Content>
            </DrawerPortal>
          </Drawer>
        )}
      </div>

      {/* Desktop Layout - Side by Side */}
      <div className="hidden lg:block">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {viewMode === 'list' ? (
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
                ) : filters.category === 'adoption' ? (
                  <PetAdsGrid
                    title={`${petAds.length} Pets Available`}
                    petAds={petAds}
                    showViewAll={false}
                    gridCols="grid-cols-1 md:grid-cols-2"
                  />
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
              <div className="sticky top-24 h-[calc(100vh-8rem)]">
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
                <ListingsGrid
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

