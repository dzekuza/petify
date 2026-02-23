'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { ServiceProvider } from '@/types'
import { cn } from '@/lib/utils'
import { t } from '@/lib/translations'
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
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {showViewAll && (
            <Link
              href="/search"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
                <article className="relative flex flex-col rounded-[20px] bg-white overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] border border-neutral-200 hover:-translate-y-[3px]">
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    <div className="aspect-[4/3] bg-neutral-100 relative">
                      {provider.images[0] ? (
                        <>
                          <Image
                            src={provider.images[0]}
                            alt={provider.businessName}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                          />
                          {/* Soft vignette for depth */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
                          <span className="text-5xl drop-shadow-sm">{getServiceCategoryIcon(provider.services[0])}</span>
                        </div>
                      )}
                    </div>

                    {/* Guest Favorite Badge */}
                    <div className="absolute top-3.5 left-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase backdrop-blur-xl bg-white/95">
                        <span className="text-amber-500 text-xs">★</span>
                        <span className="text-neutral-800">Favoritas</span>
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

                    {/* Bottom fade for seamless content blend */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
                  </div>

                  {/* Card Content */}
                  <div className="px-4 pt-3 pb-4 flex flex-col gap-2.5">
                    {/* Top row: Name + Rating */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-[15px] leading-snug text-neutral-900 line-clamp-1 group-hover:text-red-600 transition-colors duration-300">
                        {provider.businessName}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-neutral-900 text-[13px] font-semibold">{provider.rating}</span>
                        <span className="text-amber-400 text-xs">★</span>
                        {provider.reviewCount > 0 && (
                          <span className="text-[11px] text-neutral-400 font-medium">({provider.reviewCount})</span>
                        )}
                      </div>
                    </div>

                    {/* Service Type and Location */}
                    <p className="text-[13px] text-neutral-500 leading-tight">
                      {provider.services[0] === 'grooming' ? 'Kirpykla' :
                        provider.services[0] === 'veterinary' ? 'Veterinarija' :
                          provider.services[0] === 'boarding' ? 'Prieglauda' :
                            provider.services[0] === 'training' ? 'Dresūra' :
                              provider.services[0] === 'adoption' ? 'Veislynai' :
                                provider.services[0] === 'sitting' ? 'Prižiūrėjimas' :
                                  'Paslaugos'}{' '}
                      <span className="text-neutral-300 mx-0.5">·</span>{' '}
                      {provider.location.city}
                    </p>

                    {/* Price */}
                    <p className="text-[13px] text-neutral-500">
                      nuo <span className="text-neutral-900 font-bold text-[15px]">€{provider.priceRange.min}</span>
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
}
