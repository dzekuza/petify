'use client'

import { Button } from '@/components/ui/button'
import { ServiceProvider, Service, Review, Pet } from '@/types'
import { ImageGallery } from './image-gallery'
import { ProviderInfo } from './provider-info'

interface MobileLayoutProps {
  provider: ServiceProvider
  services: Service[]
  reviews: Review[]
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
  isFavorite,
  onToggleFavorite,
  onShare,
  onBack,
  onBookService
}: MobileLayoutProps) {
  return (
    <div className="lg:hidden">
      {/* Fixed Image Gallery */}
      <div className="fixed top-0 left-0 right-0 z-40">
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
      <div className="pt-[50vh] sm:pt-[60vh]">
        <div className="bg-white rounded-t-3xl shadow-lg relative z-10">
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
          <div className="px-6 py-4 pb-24">
            <ProviderInfo 
              provider={provider} 
              services={services} 
              reviews={reviews} 
              isMobile={true}
              onBookService={(serviceId) => onBookService(serviceId)}
            />
          </div>

          {/* Fixed Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  €{provider.priceRange.min}-€{provider.priceRange.max}
                </div>
                <div className="text-sm text-gray-600">per service</div>
              </div>
              <Button 
                variant="gradient"
                size="lg"
                onClick={onBookService}
              >
                Book
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
