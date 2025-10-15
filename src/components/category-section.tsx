'use client'

import { useState, useEffect, useRef } from 'react'
import { ServiceProvider } from '@/types'
import { providerApi } from '@/lib/providers'
import { ServiceSlider } from '@/components/service-slider'
import { ProviderSlider } from '@/components/provider-slider'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronRightIcon } from 'lucide-react'

interface CategorySectionProps {
  title: string
  category: string
  limit?: number
  showViewAll?: boolean
  className?: string
  mode?: 'providers' | 'services'
}

export const CategorySection = ({ 
  title, 
  category, 
  limit = 8,
  showViewAll = true,
  className,
  mode = 'services'
}: CategorySectionProps) => {
  const [services, setServices] = useState<Array<{ service: any; provider: ServiceProvider }>>([])
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(4)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch providers by category
        const results = await providerApi.searchProviders({ 
          category: category,
          verifiedOnly: false 
        })
        
        if (mode === 'providers') {
          setProviders(results.map(r => r.provider))
        } else {
          // Flatten all services from all providers
          const allServices: Array<{ service: any; provider: ServiceProvider }> = []
          results.forEach(result => {
            if (result.services && result.services.length > 0) {
              result.services.forEach((service: any) => {
                allServices.push({ service, provider: result.provider })
              })
            }
          })
          setServices(allServices)
        }
      } catch (err) {
        // Error handling - could be logged to monitoring service in production
        setError('Failed to load services')
        setServices([])
        setProviders([])
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [category, limit, mode])

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
      const newIndex = Math.max(0, currentIndex - 1)
      setCurrentIndex(newIndex)
      scrollToIndex(newIndex)
    }
  }

  const scrollRight = () => {
    if (sliderRef.current) {
      const itemWidth = sliderRef.current.clientWidth / itemsPerView
      const maxIndex = Math.max(0, services.length - itemsPerView)
      const newIndex = Math.min(maxIndex, currentIndex + 1)
      setCurrentIndex(newIndex)
      scrollToIndex(newIndex)
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

  if (error || (mode === 'services' ? services.length === 0 : providers.length === 0)) {
    return null
  }

  return (
    <div className={cn("w-full max-w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center space-x-6 flex-1">
          <Link 
            href={`/search?category=${category}`}
            className="flex items-center space-x-2 text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors flex-1"
          >
            <span>{title}</span>
            <ChevronRightIcon className="h-5 w-5" />
          </Link>
          {/* Navigation Buttons - Only show if there are more items than can fit */}
          {services.length > itemsPerView && (
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

      {/* Slider */}
      {mode === 'providers' ? (
        <ProviderSlider providers={providers} showNavigation={false} ref={sliderRef} />
      ) : (
        <ServiceSlider services={services} showNavigation={false} ref={sliderRef} />
      )}

    </div>
  )
}
