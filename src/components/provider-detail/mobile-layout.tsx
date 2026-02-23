'use client'

import { Button } from '@/components/ui/button'
import { ServiceProvider, Service, Review, PetAd, Pet } from '@/types'
import { t } from '@/lib/translations'
import { ImageGallery } from './image-gallery'
import { ProviderInfo } from './provider-info'

interface MobileLayoutProps {
  provider: ServiceProvider
  services: Service[]
  reviews: Review[]
  petAd?: PetAd | null
  userPets: Pet[]
  onPetsUpdate: (pets: Pet[]) => void
  isFavorite: boolean
  onToggleFavorite: () => void
  onShare: () => void
  onBack: () => void
  onBookService: (serviceId?: string) => void
}

export function MobileLayout({
  provider,
  services,
  reviews,
  petAd,
  userPets,
  onPetsUpdate,
  isFavorite,
  onToggleFavorite,
  onShare,
  onBack,
  onBookService
}: MobileLayoutProps) {
  // List of scraped provider user IDs (from BookitNow.lt import)
  const scrapedProviderUserIds = [
    'a6558eeb-8dac-44e6-a196-faaf93eef966', // Dresūros centras | Nemirseta
    '0dcedfce-dca7-4911-8320-8de3c7232b25', // Dresūros centras | Palanga
    '947814d9-60b8-4de5-aea7-04ade3168f30', // Fracco dresūros mokykla
    '024f9da0-a579-4f6b-9ff5-3121996e2767', // OH MY DOG šunų ir kačių kirpykla
    '52077fbe-293a-4888-876e-4f753d719819', // Reksas - Šunų pamokos Vilniuje
    'b5a8b8b8-8dac-44e6-a196-faaf93eef966', // Šunų dresūros centras "Bėgantis šuo"
    'c6c9c9c9-8dac-44e6-a196-faaf93eef966', // Šunų dresūros centras "Geras šuo"
    '470f752b-915b-404e-a3bf-965f070c11f8', // Zoohotel – naminių gyvūnų grožio salonas Naujojoje Vilnioje
    '8fc776c6-d413-4250-ba52-058b4e2e7dc8'  // Zoohotel – naminių gyvūnų grožio salonas Pavilnyje
  ]
  
  // Check if this is a scraped provider that hasn't been claimed yet
  // A provider is considered "unclaimed" if:
  // 1. It's in the scraped provider list AND
  // 2. It doesn't have active services (meaning it hasn't been properly set up by the owner)
  const isUnclaimedScrapedProvider = scrapedProviderUserIds.includes(provider.userId) && 
    (services.length === 0 || services.every(service => !service.status || service.status === 'inactive'))

  return (
    <div className="lg:hidden">
      {/* Fixed Image Gallery */}
      <div className="fixed top-0 left-0 right-0 z-30 h-[40vh] sm:h-[60vh] overflow-hidden">
        <ImageGallery
          provider={provider}
          services={services}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onShare={onShare}
          onBack={onBack}
          isMobile={true}
        />
      </div>

      {/* Content Section with top padding to account for fixed gallery */}
      <div className="pt-[30vh] sm:pt-[60vh]">
        <div className="bg-white rounded-t-3xl relative z-[50]">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-secondary rounded-full"></div>
          </div>

          {/* Header */}
          <div className="px-6 pb-4 border-b border-border/50">
            <h1 className="text-xl font-bold text-foreground">{provider.businessName}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {provider.location.city}, {provider.location.state}
            </p>
          </div>

          {/* Scrollable Content */}
          <div className={`px-6 py-4 ${isUnclaimedScrapedProvider ? 'pb-4' : 'pb-32'}`}>
            <ProviderInfo 
              provider={provider} 
              services={services} 
              reviews={reviews} 
              petAd={petAd}
              isMobile={true}
              onBookService={(serviceId) => onBookService(serviceId)}
            />
          </div>

          {/* Fixed Bottom Bar - Only show for claimed providers (not unclaimed scraped providers) */}
          {!isUnclaimedScrapedProvider && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-[70]">
              {provider.businessType === 'adoption' ? (
                // Breeder interface
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-semibold text-foreground">
                      Šiuo metu prieinama
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Pasirinkite gyvūną ir siųskite užklausą
                    </div>
                  </div>
                  <Button 
                    variant="gradient"
                    size="sm"
                    onClick={() => onBookService()}
                    className="shrink-0 px-4 text-sm"
                  >
                    Siųsti užklausą
                  </Button>
                </div>
              ) : (
                // Regular service provider interface
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-semibold text-foreground">
                      {petAd ? `€${petAd.price}` : `€${provider.priceRange.min}-€${provider.priceRange.max}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {petAd ? 'Kaina' : t('common.perService')}
                    </div>
                  </div>
                  <Button 
                    variant="gradient"
                    size="sm"
                    onClick={() => onBookService()}
                    className="shrink-0 px-4 text-sm"
                  >
                    {petAd ? 'Teirautis' : t('common.book')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
