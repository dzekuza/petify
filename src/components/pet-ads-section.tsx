'use client'

import { useState, useEffect, useRef } from 'react'
import { ServiceProvider } from '@/types'
import { providerApi } from '@/lib/providers'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronRightIcon, Heart } from 'lucide-react'
import Image from 'next/image'
import { useFavorites } from '@/contexts/favorites-context'
import { useAuth } from '@/contexts/auth-context'

interface PetAdsSectionProps {
  title: string
  limit?: number
  showViewAll?: boolean
  className?: string
}

export const PetAdsSection = ({ 
  title, 
  limit = 8,
  showViewAll = true,
  className 
}: PetAdsSectionProps) => {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(4)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { isFavorited, toggleFavorite } = useFavorites()
  const [togglingFavorites, setTogglingFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch providers with adoption category (pet breeders/sellers)
        const results = await providerApi.searchProviders({ 
          category: 'adoption',
          verifiedOnly: false 
        })
        
        // Transform and limit results
        const transformedProviders = results
          .map(result => result.provider)
          .slice(0, limit)
        
        setProviders(transformedProviders)
      } catch (err) {
        console.error('Error fetching providers:', err)
        setError('Failed to load providers')
        setProviders([])
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [limit])

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

  const handleFavoriteToggle = async (providerId: string) => {
    if (!user) return
    
    setTogglingFavorites(prev => new Set(prev).add(providerId))
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

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="flex gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-64">
              <div className="bg-gray-200 animate-pulse rounded-xl h-48"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || providers.length === 0) {
    return null
  }

  return (
    <div className={cn("w-full max-w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center space-x-6 flex-1">
          <Link 
            href="/search?category=adoption"
            className="flex items-center space-x-2 text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors flex-1"
          >
            <span>{title}</span>
            <ChevronRightIcon className="h-5 w-5" />
          </Link>
          {/* Navigation Buttons - Only show if there are more items than can fit */}
          {providers.length > itemsPerView && (
            <div className="flex items-center space-x-2">
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
        </div>
      </div>

      {/* Provider Cards Slider */}
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {providers.map((provider) => {
          const isFavorite = isFavorited(provider.id)
          const isToggling = togglingFavorites.has(provider.id)
          const hasImage = provider.images && provider.images.length > 0 && provider.images[0] && provider.images[0].trim() !== ''

          return (
            <div
              key={provider.id}
              className="flex-shrink-0 group cursor-pointer w-[85%] sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)] lg:w-[calc(25%-0.75rem)]"
            >
              <Link href={`/providers/${provider.id}`}>
                <article className="relative flex flex-col rounded-[20px] bg-white overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:-translate-y-[3px]">
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    <div className="aspect-[4/3] bg-neutral-100 relative">
                      {hasImage ? (
                        <>
                          <Image
                            src={provider.images[0]}
                            alt={provider.businessName}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
                          <span className="text-5xl drop-shadow-sm">🐾</span>
                        </div>
                      )}
                    </div>

                    {/* Badge */}
                    <div className="absolute top-3.5 left-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase backdrop-blur-xl bg-white/95 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                        <span className="text-neutral-800">{provider.businessType || 'Veislynas'}</span>
                      </div>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleFavoriteToggle(provider.id)
                      }}
                      disabled={isToggling}
                      className="absolute top-3.5 right-3.5 p-2 backdrop-blur-xl bg-white/90 hover:bg-white rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50"
                      aria-label={isFavorite ? 'Pašalinti iš mėgstamų' : 'Pridėti prie mėgstamų'}
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
                  <div className="px-4 pt-3 pb-4 flex flex-col gap-2.5">
                    {/* Name + Rating */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-[15px] leading-snug text-neutral-900 line-clamp-1 group-hover:text-red-600 transition-colors duration-300">
                        {provider.businessName}
                      </h3>
                      {provider.rating > 0 && (
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-neutral-900 text-[13px] font-semibold">{provider.rating.toFixed(1)}</span>
                          <span className="text-amber-400 text-xs">★</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {provider.description && (
                      <p className="text-[13px] text-neutral-500 leading-relaxed line-clamp-2">
                        {provider.description}
                      </p>
                    )}

                    {/* Location + Price */}
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] text-neutral-500">
                        {provider.location.city}
                      </p>
                      <p className="text-[13px] text-neutral-500">
                        nuo <span className="text-neutral-900 font-bold text-[15px]">€{provider.priceRange.min}</span>
                      </p>
                    </div>
                  </div>
                </article>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
