'use client'

import { useState } from 'react'
import { MapboxMap } from '@/components/mapbox-map'
import { ProvidersGridStatic } from '@/components/providers-grid-static'
import { FilterModal } from '@/components/filter-modal'
import { SearchResult, SearchFilters as SearchFiltersType } from '@/types'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/translations'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { ChevronUp, ChevronDown, List } from 'lucide-react'

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

  const handleMarkerClick = (result: SearchResult) => {
    setSelectedProviderId(result.provider.id)
    // Open drawer when marker is clicked on mobile
    if (window.innerWidth < 1024) {
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
        <div className={`transition-all duration-300 ${isDrawerOpen ? 'h-[calc(100vh-320px)]' : 'h-screen'}`}>
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

        {/* Drawer Preview when closed - Overlay on map */}
        {!isDrawerOpen && (
          <div 
            className="absolute bottom-4 left-4 right-4 h-16 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg z-10 flex items-center justify-center cursor-pointer hover:bg-white transition-colors shadow-lg"
            onClick={() => setIsDrawerOpen(true)}
          >
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {results.length} providers found
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center justify-center">
                <ChevronUp className="w-4 h-4 mr-1" />
                Tap to view listings
              </div>
            </div>
          </div>
        )}

        {/* Drawer for Listings */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="bottom">
          <DrawerContent className="h-[80vh]">
            <DrawerHeader className="pb-2">
              {/* Results Summary */}
              <div className="text-center">
                <DrawerTitle className="text-lg font-semibold text-gray-900">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-32 rounded mx-auto"></div>
                  ) : (
                    `Over ${results.length} providers`
                  )}
                </DrawerTitle>
                <DrawerDescription className="text-sm text-gray-600 mt-1">
                  {loading ? (
                    <span className="inline-block animate-pulse bg-gray-200 h-4 w-48 rounded"></span>
                  ) : (
                    `Showing ${Math.min(results.length, 12)} providers`
                  )}
                </DrawerDescription>
              </div>
            </DrawerHeader>
            
            <div className="flex-1 overflow-y-auto px-4 pb-4">
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
                  title=""
                  providers={results.map(result => result.provider)}
                  showViewAll={false}
                  gridCols="grid-cols-1"
                />
              )}
            </div>
          </DrawerContent>
        </Drawer>
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

