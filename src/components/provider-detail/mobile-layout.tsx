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
  return (
    <div className="lg:hidden">
      {/* Fixed Image Gallery */}
      <div className="fixed top-0 left-0 right-0 z-40 h-[40vh] sm:h-[60vh] overflow-hidden">
        <ImageGallery
          provider={provider}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onShare={onShare}
          onBack={onBack}
          isMobile={true}
        />
      </div>

      {/* Content Section with top padding to account for fixed gallery */}
      <div className="pt-[40vh] sm:pt-[60vh]">
        <div className="bg-white rounded-t-3xl shadow-lg relative z-[60]">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="px-6 pb-4 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">{provider.businessName}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {provider.location.city}, {provider.location.state}
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="px-6 py-4 pb-32">
            <ProviderInfo 
              provider={provider} 
              services={services} 
              reviews={reviews} 
              petAd={petAd}
              userPets={userPets}
              onPetsUpdate={onPetsUpdate}
              isMobile={true}
              onBookService={(serviceId) => onBookService(serviceId)}
            />
          </div>

          {/* Fixed Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-[60]">
            {provider.businessType === 'adoption' ? (
              // Breeder interface
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-semibold text-gray-900">
                    Šiuo metu prieinama
                  </div>
                  <div className="text-sm text-gray-600">
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
                  <div className="text-lg font-semibold text-gray-900">
                    {petAd ? `€${petAd.price}` : `€${provider.priceRange.min}-€${provider.priceRange.max}`}
                  </div>
                  <div className="text-sm text-gray-600">
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
        </div>
      </div>
    </div>
  )
}
