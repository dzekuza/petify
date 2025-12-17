'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { ServiceProvider } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/translations'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/contexts/favorites-context'
import { useAuth } from '@/contexts/auth-context'

interface ProviderSliderProps {
  providers: ServiceProvider[]
  className?: string
  showNavigation?: boolean
  providerServices?: Map<string, any[]>
}

export const ProviderSlider = forwardRef<HTMLDivElement, ProviderSliderProps>(({ providers, className, showNavigation = true, providerServices }, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(4)
  const [isMobile, setIsMobile] = useState(false)
  const internalSliderRef = useRef<HTMLDivElement>(null)
  const sliderRef = (ref as React.RefObject<HTMLDivElement>) || internalSliderRef
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const { user } = useAuth()
  const { isFavorited, toggleFavorite } = useFavorites()
  const [togglingFavorites, setTogglingFavorites] = useState<Set<string>>(new Set())

  // Calculate items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth
      setIsMobile(width < 640)
      if (width < 640) {
        setItemsPerView(1)
      } else if (width < 768) {
        setItemsPerView(2)
      } else if (width < 1024) {
        setItemsPerView(3)
      } else {
        setItemsPerView(4)
      }
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  // Update scroll buttons state
  useEffect(() => {
    const updateScrollState = () => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
      }
    }

    updateScrollState()
    const slider = sliderRef.current
    if (slider) {
      slider.addEventListener('scroll', updateScrollState)
      return () => slider.removeEventListener('scroll', updateScrollState)
    }
  }, [providers])

  const scrollToIndex = (index: number) => {
    if (sliderRef.current) {
      const itemWidth = sliderRef.current.clientWidth / itemsPerView
      const scrollPosition = index * itemWidth
      sliderRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
    }
  }

  const scrollLeft = () => {
    if (sliderRef.current) {
      const itemWidth = sliderRef.current.clientWidth / itemsPerView
      const newIndex = Math.max(0, currentIndex - 1)
      setCurrentIndex(newIndex)
      scrollToIndex(newIndex)
    }
  }

  const scrollRight = () => {
    if (sliderRef.current) {
      const itemWidth = sliderRef.current.clientWidth / itemsPerView
      const maxIndex = Math.max(0, providers.length - itemsPerView)
      const newIndex = Math.min(maxIndex, currentIndex + 1)
      setCurrentIndex(newIndex)
      scrollToIndex(newIndex)
    }
  }

  const handleScroll = () => {
    if (sliderRef.current) {
      const itemWidth = sliderRef.current.clientWidth / itemsPerView
      const newIndex = Math.round(sliderRef.current.scrollLeft / itemWidth)
      setCurrentIndex(newIndex)
    }
  }

  const handleToggleFavorite = async (providerId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/auth/signin'
      return
    }

    setTogglingFavorites(prev => new Set([...prev, providerId]))
    try {
      await toggleFavorite(providerId)
    } catch (error) {
      // Error handling - could be logged to monitoring service in production
    } finally {
      setTogglingFavorites(prev => {
        const newSet = new Set(prev)
        newSet.delete(providerId)
        return newSet
      })
    }
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
      case 'adoption':
        return '🐾'
      case 'sitting':
        return '💝'
      default:
        return '🐾'
    }
  }

  if (providers.length === 0) {
    return null
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* Navigation Buttons - Only show if there are more items than can fit and showNavigation is true */}
      {showNavigation && providers.length > itemsPerView && (
        <div className="flex items-center justify-end mb-4 space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="h-8 w-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="h-8 w-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Slider Container */}
      <div
        ref={sliderRef as React.RefObject<HTMLDivElement>}
        onScroll={handleScroll}
        className={cn(
          "flex gap-4 scrollbar-hide scroll-smooth",
          providers.length > itemsPerView ? "overflow-x-auto" : "overflow-x-visible"
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {providers.map((provider) => {
          const isFavorite = isFavorited(provider.id)
          const isToggling = togglingFavorites.has(provider.id)

          // Get cover image - prioritize first service's first image
          const getCoverImage = () => {
            const services = providerServices?.get(provider.id)
            if (services && services.length > 0 && services[0].images && services[0].images.length > 0) {
              return services[0].images[0]
            }
            return provider.images && provider.images.length > 0 ? provider.images[0] : null
          }

          const coverImage = getCoverImage()

          return (
            <div
              key={provider.id}
              className="flex-shrink-0 group cursor-pointer w-[85%] sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)] lg:w-[calc(25%-0.75rem)]"
            >
              <Link href={`/providers/${provider.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden py-0 pb-6">
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 relative">
                      {coverImage ? (
                        <Image
                          src={coverImage}
                          alt={provider.businessName}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                        handleToggleFavorite(provider.id)
                      }}
                      disabled={isToggling}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors disabled:opacity-50"
                      aria-label={isFavorite ? t('search.removeFromFavorites') : t('search.addToFavorites')}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          isFavorite ? "text-red-500 fill-current" : "text-gray-400",
                          isToggling && "animate-pulse"
                        )}
                      />
                    </button>
                  </div>

                  {/* Card Content - No top/bottom padding */}
                  <CardContent className="px-4 pt-4 pb-0">
                    {/* Business Name */}
                    <CardTitle className="text-sm mb-1 truncate">
                      {provider.businessName}
                    </CardTitle>

                    {/* Service Type and Location */}
                    <CardDescription className="text-sm mb-1">
                      {(provider.businessType || provider.services?.[0]) === 'grooming' ? 'Kirpykla' :
                        (provider.businessType || provider.services?.[0]) === 'veterinary' ? 'Veterinarija' :
                          (provider.businessType || provider.services?.[0]) === 'boarding' ? 'Prieglauda' :
                            (provider.businessType || provider.services?.[0]) === 'training' ? 'Dresūra' :
                              (provider.businessType || provider.services?.[0]) === 'adoption' ? 'Veislynai' :
                                (provider.businessType || provider.services?.[0]) === 'sitting' ? 'Prižiūrėjimas' :
                                  'Paslaugos'} • {provider.location.city}
                    </CardDescription>

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
                  </CardContent>
                </Card>
              </Link>
            </div>
          )
        })}
      </div>

    </div>
  )
})

ProviderSlider.displayName = 'ProviderSlider'
