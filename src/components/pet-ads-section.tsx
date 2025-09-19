'use client'

import { useState, useEffect, useRef } from 'react'
import { ServiceProvider } from '@/types'
import { providerApi } from '@/lib/providers'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronRightIcon, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {providers.map((provider) => (
          <Card key={provider.id} className="relative flex-shrink-0 w-64 hover:shadow-lg transition-shadow duration-200">
            <Link href={`/providers/${provider.id}`} className="block">
              {provider.images && provider.images.length > 0 && provider.images[0] && provider.images[0].trim() !== '' && (
                <div className="relative h-48 w-full">
                  <Image
                    src={provider.images[0]}
                    alt={provider.businessName}
                    fill
                    className="object-cover rounded-t-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">{provider.businessName}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {provider.businessType || 'Veislynas'}
                  </Badge>
                  {provider.rating > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      ⭐ {provider.rating.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {provider.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📍 {provider.location.city}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold">
                      {provider.priceRange.min}€ - {provider.priceRange.max}€
                    </span>
                  </div>

                  {provider.services && provider.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {provider.services.slice(0, 2).map((service) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {provider.services.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{provider.services.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Link>
            
            {/* Favorite Button */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleFavoriteToggle(provider.id)
                }}
                disabled={togglingFavorites.has(provider.id)}
              >
                <Heart 
                  className={`h-4 w-4 ${
                    isFavorited(provider.id) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-600'
                  }`} 
                />
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
