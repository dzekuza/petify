'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { SearchLayout } from '@/components/search-layout'
import { ServiceCategory, SearchFilters, SearchResult, PetAd, IndividualPet } from '@/types'
import { providerApi } from '@/lib/providers'
import { petAdsApi } from '@/lib/pet-ads'
import { petAdoptionApi } from '@/lib/pet-adoption-profiles'
import { t } from '@/lib/translations'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Filter } from 'lucide-react'
import { useDeviceDetection } from '@/lib/device-detection'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
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
  const [individualPets, setIndividualPets] = useState<IndividualPet[]>([])
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

        if (debouncedFilters.category === 'pets') {
          // Fetch individual pets for sale
          const pets = await petAdoptionApi.getPublicIndividualPets(50)
          setIndividualPets(pets)
          setResults([])
          setPetAds([])
        } else {
          // For other categories, show providers
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
          setPetAds([])
          setIndividualPets([])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(t('search.errorLoadingProviders'))
        setResults([])
        setPetAds([])
        setIndividualPets([])
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
      <>
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
              individualPets={individualPets}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              loading={loading}
              error={error}
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
                        <DrawerTitle className="text-lg font-semibold text-foreground">
                          {loading ? (
                            <div className="animate-pulse bg-gray-200 h-6 w-32 rounded mx-auto"></div>
                          ) : filters.category === 'pets' ? (
                            `${individualPets.length} Gyvūnai pardavimui`
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
              <DrawerHeader className="flex flex-row items-center justify-between p-4 pb-4">
                <div className="flex flex-col gap-0.5 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left">
                  <DrawerTitle className="text-foreground font-semibold">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
                    ) : filters.category === 'pets' ? (
                      `${individualPets.length} Gyvūnai pardavimui`
                    ) : filters.category === 'adoption' ? (
                      `${petAds.length} Pets Available`
                    ) : (
                      `Daugiau nei ${results.length} teikėjų`
                    )}
                  </DrawerTitle>
                </div>

                {/* Nested Drawer for Filters */}
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="h-[80vh] z-[120]">
                    <DrawerHeader>
                      <DrawerTitle>Filtras</DrawerTitle>
                    </DrawerHeader>
                    <div className="flex-1 px-4 overflow-y-auto">
                      <SearchFiltersComponent
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        isMobile={true}
                        mobileFiltersExpanded={true}
                        resultsCount={
                          filters.category === 'pets' ? individualPets.length :
                            filters.category === 'adoption' ? petAds.length :
                              results.length
                        }
                      />
                    </div>
                    <DrawerFooter className="pt-2">
                      <DrawerClose asChild>
                        <Button className="w-full">Rodyti rezultatus</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto px-4 pb-32">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : filters.category === 'pets' ? (
                  individualPets.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {individualPets.map((pet) => (
                        <div key={pet.id} className="bg-white rounded-lg border border-gray-200 p-4">
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
                              <p className="text-muted-foreground text-sm">
                                {pet.sexType === 'male' ? 'Patinas' : 'Patelė'} • {pet.age} sav.
                              </p>
                              <p className="text-lg font-bold text-green-600">{pet.price}€</p>
                              <p className="text-sm text-muted-foreground">
                                Paruoštas: {new Date(pet.readyToLeave).toLocaleDateString('lt-LT')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Šiuo metu nėra gyvūnų pardavimui.</p>
                    </div>
                  )
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
                      <p className="text-muted-foreground">No pets available at the moment.</p>
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
                      <p className="text-muted-foreground">No providers found in this area.</p>
                    </div>
                  )
                )}
              </div>
            </DrawerContent>
          </Drawer>

        </div>

      </>
    )
  }

  // Desktop layout with full navigation
  return (
    <Layout hideServiceCategories={true} onFiltersClick={handleFiltersClick} hideFooter={true}>
      <SearchLayout
        results={results}
        petAds={petAds}
        individualPets={individualPets}
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
