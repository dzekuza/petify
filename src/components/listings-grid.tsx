'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { ServiceProvider } from '@/types'
import { cn } from '@/lib/utils'
import { t } from '@/lib/translations'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/contexts/favorites-context'
import { useAuth } from '@/contexts/auth-context'

interface ListingsGridProps {
  title: string
  providers: ServiceProvider[]
  showViewAll?: boolean
  className?: string
  gridCols?: string
}

export const ListingsGrid = ({ 
  title, 
  providers, 
  showViewAll = true,
  className,
  gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
}: ListingsGridProps) => {
  const { user } = useAuth()
  const { isFavorited, toggleFavorite } = useFavorites()
  const [togglingFavorites, setTogglingFavorites] = useState<Set<string>>(new Set())

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

      {/* Listings Grid */}
      <div className={cn("grid gap-6", gridCols)}>
        {providers.map((provider) => {
          const isFavorite = isFavorited(provider.id)
          const isToggling = togglingFavorites.has(provider.id)
          
          return (
            <div
              key={provider.id}
              className="group cursor-pointer"
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
    </div>
  )
}
