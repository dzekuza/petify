'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { Service } from '@/types'
import { ServiceProvider } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/translations'
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/contexts/favorites-context'
import { useAuth } from '@/contexts/auth-context'

interface ServiceSliderProps {
  services: Array<{ service: Service; provider: ServiceProvider }>
  className?: string
  showNavigation?: boolean
}

export const ServiceSlider = forwardRef<HTMLDivElement, ServiceSliderProps>(({ services, className, showNavigation = true }, ref) => {
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
  }, [services])

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
      const currentScroll = sliderRef.current.scrollLeft
      const targetScroll = Math.max(0, currentScroll - itemWidth)
      sliderRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    if (sliderRef.current) {
      const itemWidth = sliderRef.current.clientWidth / itemsPerView
      const currentScroll = sliderRef.current.scrollLeft
      const maxScroll = sliderRef.current.scrollWidth - sliderRef.current.clientWidth
      const targetScroll = Math.min(maxScroll, currentScroll + itemWidth)
      sliderRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      })
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

  if (services.length === 0) {
    return null
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* Navigation Buttons - Only show if there are more items than can fit and showNavigation is true */}
      {showNavigation && services.length > itemsPerView && (
        <div className="flex items-center justify-end mb-4 space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="h-8 w-8 rounded-full transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="h-8 w-8 rounded-full transition-all duration-200"
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
          services.length > itemsPerView ? "overflow-x-auto" : "overflow-x-visible"
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {services.map(({ service, provider }) => {
          const isFavorite = isFavorited(provider.id)
          const isToggling = togglingFavorites.has(provider.id)

          // Get cover image - prioritize service images
          const getCoverImage = () => {
            if (service.images && service.images.length > 0) {
              return service.images[0]
            }
            return provider.images && provider.images.length > 0 ? provider.images[0] : null
          }

          const coverImage = getCoverImage()

          return (
            <div
              key={service.id}
              className="flex-shrink-0 group cursor-pointer w-[85%] sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)] lg:w-[calc(25%-0.75rem)]"
            >
              <Link href={`/providers/${provider.id}?service=${service.id}`}>
                <article className="relative flex flex-col rounded-[20px] bg-white overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] border border-neutral-200 hover:-translate-y-[3px]">
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    <div className="aspect-[4/3] bg-neutral-100 relative">
                      {coverImage ? (
                        <>
                          <Image
                            src={coverImage}
                            alt={service.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
                          <span className="text-5xl drop-shadow-sm">{getServiceCategoryIcon(service.category)}</span>
                        </div>
                      )}
                    </div>

                    {/* Service Category Badge */}
                    <div className="absolute top-3.5 left-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase backdrop-blur-xl bg-white/95">
                        <span className="text-neutral-800">
                          {service.category === 'grooming' ? 'Kirpykla' :
                            service.category === 'veterinary' ? 'Veterinarija' :
                              service.category === 'boarding' ? 'Prieglauda' :
                                service.category === 'training' ? 'Dresūra' :
                                  service.category === 'adoption' ? 'Veislynas' :
                                    service.category === 'sitting' ? 'Prižiūrėjimas' :
                                      'Paslauga'}
                        </span>
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
                      className="absolute top-3.5 right-3.5 p-2 backdrop-blur-xl bg-white/90 hover:bg-white rounded-full transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50"
                      aria-label={isFavorite ? t('search.removeFromFavorites') : t('search.addToFavorites')}
                    >
                      <Heart
                        className={cn(
                          "h-[15px] w-[15px] transition-all duration-300",
                          isFavorite ? "text-red-500 fill-red-500 scale-110" : "text-neutral-600",
                          isToggling && "animate-pulse"
                        )}
                      />
                    </button>

                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
                  </div>

                  {/* Card Content */}
                  <div className="px-4 pt-3 pb-4 flex flex-col gap-2">
                    {/* Service Name + Rating */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-[15px] leading-snug text-neutral-900 line-clamp-1 group-hover:text-red-600 transition-colors duration-300">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-neutral-900 text-[13px] font-semibold">{provider.rating || 0}</span>
                        <span className="text-amber-400 text-xs">★</span>
                        {(provider.reviewCount || 0) > 0 && (
                          <span className="text-[11px] text-neutral-400 font-medium">({provider.reviewCount})</span>
                        )}
                      </div>
                    </div>

                    {/* Provider + Location */}
                    <p className="text-[13px] text-neutral-500 leading-tight line-clamp-1">
                      {provider.businessName}
                      <span className="text-neutral-300 mx-0.5">·</span>
                      {provider.location.city}
                    </p>

                    {/* Price */}
                    <p className="text-[13px] text-neutral-500">
                      nuo <span className="text-neutral-900 font-bold text-[15px]">€{service.price}</span>
                    </p>
                  </div>
                </article>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
})

ServiceSlider.displayName = 'ServiceSlider'
