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
}

export const ProviderSlider = forwardRef<HTMLDivElement, ProviderSliderProps>(({ providers, className, showNavigation = true }, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(4)
  const internalSliderRef = useRef<HTMLDivElement>(null)
  const sliderRef = ref || internalSliderRef
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const { user } = useAuth()
  const { isFavorited, toggleFavorite } = useFavorites()
  const [togglingFavorites, setTogglingFavorites] = useState<Set<string>>(new Set())

  // Calculate items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1)
      } else if (window.innerWidth < 768) {
        setItemsPerView(2)
      } else if (window.innerWidth < 1024) {
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
      console.error('Error toggling favorite:', error)
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
          "flex gap-6 scrollbar-hide scroll-smooth",
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
          
          return (
            <div
              key={provider.id}
              className="flex-shrink-0 group cursor-pointer"
              style={{ width: `calc((100% - ${(itemsPerView - 1) * 1.5}rem) / ${itemsPerView})` }}
            >
              <Link href={`/providers/${provider.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden py-0 pb-6">
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 relative">
                      {provider.images[0] ? (
                        <Image
                          src={provider.images[0]}
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
                    <CardTitle className="text-sm mb-1">
                      {provider.businessName}
                    </CardTitle>

                    {/* Service Type and Location */}
                    <CardDescription className="text-sm mb-1">
                      {provider.services[0] === 'grooming' ? 'Kirpykla' :
                       provider.services[0] === 'veterinary' ? 'Veterinarija' :
                       provider.services[0] === 'boarding' ? 'Prieglauda' :
                       provider.services[0] === 'training' ? 'Dresūra' :
                       provider.services[0] === 'adoption' ? 'Skelbimai' :
                       provider.services[0] === 'sitting' ? 'Prižiūrėjimas' :
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

      {/* Dots Indicator */}
      {providers.length > itemsPerView && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(providers.length / itemsPerView) }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                scrollToIndex(index)
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                currentIndex === index ? "bg-gray-900" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
})

ProviderSlider.displayName = 'ProviderSlider'
