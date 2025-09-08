'use client'

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { ServiceProvider, Service, Review, Pet } from '@/types'
import { ProviderInfo } from './provider-info'
import { BookingWidget } from './booking-widget'

interface MobileDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  provider: ServiceProvider
  services: Service[]
  reviews: Review[]
  userPets: Pet[]
  onBookService: () => void
  onPetsUpdate: (pets: Pet[]) => void
}

export function MobileDrawer({
  isOpen,
  onOpenChange,
  provider,
  services,
  reviews,
  userPets,
  onBookService,
  onPetsUpdate
}: MobileDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-center text-lg font-semibold">
            {provider.businessName}
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <ProviderInfo 
            provider={provider} 
            services={services} 
            reviews={reviews} 
            isMobile={true} 
          />
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Book this service</h2>
            <BookingWidget
              provider={provider}
              services={services}
              userPets={userPets}
              onBookService={onBookService}
              onPetsUpdate={onPetsUpdate}
              isMobile={true}
            />
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-6">
          <div className="flex items-center justify-between max-w-md mx-auto">
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
      </DrawerContent>
    </Drawer>
  )
}
