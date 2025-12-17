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
      {/* Header - Only show if title is provided */}
      {title && (
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
      )}

      {/* Listings Grid */}
      <div className={cn("grid gap-2", gridCols)}>
        {providers.map((provider) => {
          const isFavorite = isFavorited(provider.id)
          const isToggling = togglingFavorites.has(provider.id)

          return (
            <div
              key={provider.id}
              className="group cursor-pointer"
            >
              <Link href={`/providers/${provider.id}`}>
                <div className="bg-card text-card-foreground space-y-4 flex flex-col rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden py-0 pb-6">
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 relative">
                      {provider.images[0] ? (
                        <>
                          <Image
                            src={provider.images[0]}
                            alt={provider.businessName}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {/* Gradient overlay for better badge visibility */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">{getServiceCategoryIcon(provider.services[0])}</span>
                        </div>
                      )}
                    </div>

                    {/* Guest Favorite Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="badge-modern shadow-lg">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-gray-900">Svečių favoritas</span>
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
                      className="absolute top-4 right-4 p-2.5 backdrop-blur-md bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 disabled:opacity-50"
                      aria-label={isFavorite ? t('search.removeFromFavorites') : t('search.addToFavorites')}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4 transition-all",
                          isFavorite ? "text-red-500 fill-current scale-110" : "text-gray-600",
                          isToggling && "animate-pulse"
                        )}
                      />
                    </button>
                  </div>

                  {/* Card Content - Enhanced design */}
                  <div className="px-5 pt-4 pb-0 space-y-3">
                    {/* Business Name */}
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors">
                      {provider.businessName}
                    </h3>

                    {/* Service Type and Location */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      <span className="text-sm">
                        {provider.services[0] === 'grooming' ? 'Kirpykla' :
                          provider.services[0] === 'veterinary' ? 'Veterinarija' :
                            provider.services[0] === 'boarding' ? 'Prieglauda' :
                              provider.services[0] === 'training' ? 'Dresūra' :
                                provider.services[0] === 'adoption' ? 'Veislynai' :
                                  provider.services[0] === 'sitting' ? 'Prižiūrėjimas' :
                                    'Paslaugos'} • {provider.location.city}
                      </span>
                    </div>

                    {/* Price and Rating - Enhanced visual separation */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Nuo</span>
                        <span className="text-lg font-bold text-gray-900">€{provider.priceRange.min}</span>
                      </div>

                      <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1.5 rounded-lg">
                        <span className="text-yellow-500 fill-current">★</span>
                        <span className="font-semibold text-gray-900">{provider.rating}</span>
                        {provider.reviewCount > 0 && (
                          <span className="text-xs text-gray-500">({provider.reviewCount})</span>
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
    </div>
  )
}
