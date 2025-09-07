'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { ServiceProvider, Service } from '@/types'
import { cn } from '@/lib/utils'
import { t } from '@/lib/translations'
import Image from 'next/image'
import Link from 'next/link'

interface ProvidersGridProps {
  title: string
  providers: ServiceProvider[]
  services: Service[]
  showViewAll?: boolean
  className?: string
}

export const ProvidersGrid = ({ 
  title, 
  providers, 
  services, 
  showViewAll = true,
  className 
}: ProvidersGridProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const itemsPerView = 6
  const maxIndex = Math.max(0, providers.length - itemsPerView)

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const itemWidth = container.scrollWidth / providers.length
      container.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth'
      })
    }
    setCurrentIndex(index)
  }

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentIndex - 1)
    scrollToIndex(newIndex)
  }

  const handleNext = () => {
    const newIndex = Math.min(maxIndex, currentIndex + 1)
    scrollToIndex(newIndex)
  }

  const toggleFavorite = (providerId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(providerId)) {
        newFavorites.delete(providerId)
      } else {
        newFavorites.add(providerId)
      }
      return newFavorites
    })
  }

  const getServiceCategoryIcon = (category: string) => {
    switch (category) {
      case 'grooming':
        return '✂️'
      case 'veterinary':
        return '🏥'
      case 'boarding':
        return '🏠'
      case 'training':
        return '🎓'
      case 'walking':
        return '🚶'
      case 'sitting':
        return '💝'
      default:
        return '🐾'
    }
  }

  const getAvailabilityStatus = (provider: ServiceProvider) => {
    const now = new Date()
    const currentDay = now.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase() as keyof typeof provider.availability
    const todaySlots = provider.availability[currentDay] || []
    
    const hasAnyAvailability = Object.values(provider.availability).some(daySlots => 
      Array.isArray(daySlots) && daySlots.length > 0
    )
    
    if (!hasAnyAvailability) {
      return { status: 'unavailable', text: t('search.notSet') }
    }
    
    if (todaySlots.length === 0) {
      return { status: 'closed', text: t('search.closed') }
    }
    
    const currentTime = now.toTimeString().slice(0, 5)
    const isAvailable = todaySlots.some(slot => 
      slot.available && currentTime >= slot.start && currentTime <= slot.end
    )
    
    return isAvailable 
      ? { status: 'open', text: t('search.open') }
      : { status: 'closed', text: t('search.closed') }
  }

  if (providers.length === 0) {
    return null
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {showViewAll && (
          <Link 
            href="/search" 
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Peržiūrėti visus →
          </Link>
        )}
      </div>

      {/* Slider Container */}
      <div className="relative">
        {/* Navigation Arrows */}
        {providers.length > itemsPerView && (
          <>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl transition-all",
                currentIndex === 0 && "opacity-50 cursor-not-allowed"
              )}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl transition-all",
                currentIndex >= maxIndex && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Providers Grid */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-hidden scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {providers.map((provider) => {
            const availability = getAvailabilityStatus(provider)
            const isFavorite = favorites.has(provider.id)
            
            return (
              <div
                key={provider.id}
                className="flex-shrink-0 w-80 group cursor-pointer"
              >
                <Link href={`/providers/${provider.id}`}>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    {/* Image Section */}
                    <div className="relative overflow-hidden rounded-t-xl">
                      <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-100 to-blue-200 h-48">
                        {provider.images[0] ? (
                          <Image
                            src={provider.images[0]}
                            alt={provider.businessName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl">{getServiceCategoryIcon(provider.services[0])}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Guest Favorite Badge */}
                      <div className="absolute top-3 left-3">
                        <div className="bg-white/90 px-2 py-1 rounded-md text-xs font-medium text-gray-900">
                          Svečių favoritas
                        </div>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleFavorite(provider.id)
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        aria-label={isFavorite ? t('search.removeFromFavorites') : t('search.addToFavorites')}
                      >
                        <Heart 
                          className={cn(
                            "h-4 w-4",
                            isFavorite ? "text-red-500 fill-current" : "text-gray-400"
                          )} 
                        />
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-4">
                    {/* Business Name */}
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {provider.businessName}
                    </div>

                    {/* Service Type and Location */}
                    <div className="text-sm text-gray-600 mb-1">
                      {provider.services[0] === 'grooming' ? 'Kirpykla' :
                       provider.services[0] === 'veterinary' ? 'Veterinarija' :
                       provider.services[0] === 'boarding' ? 'Prieglauda' :
                       provider.services[0] === 'training' ? 'Dresūra' :
                       provider.services[0] === 'walking' ? 'Pasivaikščiojimas' :
                       'Paslaugos'} • {provider.location.city}
                    </div>

                    {/* Price and Rating */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">
                        €{provider.priceRange.min}-€{provider.priceRange.max}
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">★ {provider.rating}</span>
                        {provider.reviewCount > 0 && (
                          <span className="text-xs text-gray-500 ml-1">({provider.reviewCount})</span>
                        )}
                      </div>
                    </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>

        {/* Dots Indicator */}
        {providers.length > itemsPerView && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentIndex ? "bg-gray-900" : "bg-gray-300"
                )}
                onClick={() => scrollToIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
