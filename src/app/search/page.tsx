'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { SearchLayout } from '@/components/search-layout'
import { ServiceCategory, SearchFilters, SearchResult, PetAd } from '@/types'
import { providerApi } from '@/lib/providers'
import { petAdsApi } from '@/lib/pet-ads'
import { t } from '@/lib/translations'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useDeviceDetection } from '@/lib/device-detection'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ListingsGrid } from '@/components/listings-grid'
import { PetAdsGrid } from '@/components/pet-ads-grid'
import { SearchFilters as SearchFiltersComponent } from '@/components/search-filters'
import { useDebounce } from '@/hooks/use-debounce'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isDesktop } = useDeviceDetection()
  
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
    petId: searchParams.get('petId') || undefined,
  } as SearchFilters)

  const [results, setResults] = useState<SearchResult[]>([])
  const [petAds, setPetAds] = useState<PetAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>()

  // Debounce filters to prevent excessive API calls
  const debouncedFilters = useDebounce(filters, 300)

  // Update filters when URL parameters change
  useEffect(() => {
    const newFilters = {
      category: (searchParams.get('category') as ServiceCategory) || undefined,
      location: searchParams.get('location') || '',
      priceRange: { 
        min: priceFrom ? parseInt(priceFrom) : 0, 
        max: priceTo ? parseInt(priceTo) : 5000 
      },
      rating: 0,
      distance: 25,
      date: date || undefined,
      petId: searchParams.get('petId') || undefined,
    } as SearchFilters
    
    setFilters(newFilters)
    
    // Clear selected provider when category changes
    setSelectedProviderId(undefined)
    
    // Auto-open drawer when category changes (on mobile)
    if (!isDesktop && newFilters.category) {
      setIsDrawerOpen(true)
    }
  }, [searchParams, priceFrom, priceTo, date, isDesktop])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Check if searching for adoption category (pet ads)
        if (debouncedFilters.category === 'adoption') {
          const petAdsResults = await petAdsApi.getActivePetAds()
          setPetAds(petAdsResults)
          setResults([]) // Clear service results
        } else {
          const searchResults = await providerApi.searchProviders({
            category: debouncedFilters.category,
            location: debouncedFilters.location,
            priceRange: debouncedFilters.priceRange,
            rating: debouncedFilters.rating,
            distance: debouncedFilters.distance,
            date: debouncedFilters.date,
            petId: debouncedFilters.petId,
            verifiedOnly: false // Include both verified and unverified providers
          })
          setResults(searchResults)
          setPetAds([]) // Clear pet ads results
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(t('search.errorLoadingProviders'))
        setResults([])
        setPetAds([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [debouncedFilters])

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const handleFiltersClick = () => {
    setShowFilterModal(!showFilterModal)
  }

  const handleMarkerClick = (result: SearchResult) => {
    setSelectedProviderId(result.provider.id)
    // Only open drawer on mobile devices
    if (!isDesktop) {
      setIsDrawerOpen(true)
    }
  }

  // Mobile layout with custom header
  if (!isDesktop) {
    return (
      <div className="h-screen flex flex-col relative overflow-hidden">
        {/* Custom mobile header with back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="lg:hidden absolute top-4 left-4 z-[100] h-12 w-12 p-0 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <main className="flex-1 h-full">
          <SearchLayout
            results={results}
            petAds={petAds}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            loading={loading}
            error={error}
            onFiltersClick={handleFiltersClick}
            showFilterModal={showFilterModal}
            onFilterModalClose={() => setShowFilterModal(false)}
            onMarkerClick={handleMarkerClick}
            selectedProviderId={selectedProviderId}
            isDrawerOpen={isDrawerOpen}
          />
        </main>
        
        {/* Mobile bottom navigation */}
        <MobileBottomNav />

        {/* Mobile Drawer - shadcn implementation */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="bottom">
          {/* Fixed trigger button - only show when drawer is closed */}
          {!isDrawerOpen && (
            <div className="fixed bottom-16 left-0 right-0 h-24 bg-background border-t shadow-lg pointer-events-auto z-[90] rounded-t-3xl">
              <DrawerTrigger asChild>
                <button
                  className="w-full h-full cursor-pointer"
                  aria-label="Toggle search results"
                >
                  <DrawerHeader className="pb-2 h-full flex items-center justify-center">
                    <div className="text-center">
                      <DrawerTitle className="text-lg font-semibold text-gray-900">
                        {loading ? (
                          <div className="animate-pulse bg-gray-200 h-6 w-32 rounded mx-auto"></div>
                        ) : filters.category === 'adoption' ? (
                          `${petAds.length} Pets Available`
                        ) : (
                          t('search.overProviders', 'Over {count} providers').replace('{count}', results.length.toString())
                        )}
                      </DrawerTitle>
                    </div>
                  </DrawerHeader>
                </button>
              </DrawerTrigger>
            </div>
          )}
          
          <DrawerContent className="max-h-[90vh] h-[90vh]">
            <DrawerHeader>
              <DrawerTitle>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-6 w-32 rounded mx-auto"></div>
                ) : filters.category === 'adoption' ? (
                  `${petAds.length} Pets Available`
                ) : (
                  t('search.overProviders', 'Over {count} providers').replace('{count}', results.length.toString())
                )}
              </DrawerTitle>
            </DrawerHeader>
            
            {/* Mobile Filters */}
            <div className="px-4 pb-4">
              <SearchFiltersComponent 
                filters={filters} 
                onFiltersChange={handleFiltersChange}
                isMobile={true}
              />
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 pb-32">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
                    </div>
                  ))}
                </div>
              ) : filters.category === 'adoption' ? (
                petAds.length > 0 ? (
                  <PetAdsGrid
                    title=""
                    petAds={petAds}
                    showViewAll={false}
                    gridCols="grid-cols-1"
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No pets available at the moment.</p>
                  </div>
                )
              ) : (
                results.length > 0 ? (
                  <ListingsGrid
                    title=""
                    providers={results.map(result => result.provider)}
                    showViewAll={false}
                    gridCols="grid-cols-1"
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No providers found in this area.</p>
                  </div>
                )
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    )
  }

  // Desktop layout with full navigation
  return (
    <Layout hideServiceCategories={true} onFiltersClick={handleFiltersClick} hideFooter={true}>
      <SearchLayout
        results={results}
        petAds={petAds}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        loading={loading}
        error={error}
        onFiltersClick={handleFiltersClick}
        showFilterModal={showFilterModal}
        onFilterModalClose={() => setShowFilterModal(false)}
      />
    </Layout>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>{t('common.loading')}</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
