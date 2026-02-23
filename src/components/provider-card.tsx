'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PawPrint, Heart, Star, MapPin, BadgeCheck } from 'lucide-react'
import { ServiceProvider, Service } from '@/types'
import { cn } from '@/lib/utils'
import { t } from '@/lib/translations'
import { useFavorites } from '@/contexts/favorites-context'
import { useAuth } from '@/contexts/auth-context'

interface ProviderCardProps {
  provider: ServiceProvider
  variant?: 'grid' | 'horizontal'
  services?: Service[]
  distance?: number
  className?: string
}

const SERVICE_LABELS: Record<string, string> = {
  grooming: 'Kirpykla',
  veterinary: 'Veterinarija',
  boarding: 'Prieglauda',
  training: 'Dresūra',
  adoption: 'Veislynai',
  sitting: 'Prižiūrėjimas',
  pets: 'Gyvūnai',
}

function getServiceLabel(serviceType: string): string {
  return SERVICE_LABELS[serviceType] ?? 'Paslaugos'
}

function getStartingPrice(provider: ServiceProvider, services?: Service[]): number | null {
  if (services && services.length > 0) {
    const prices = services.map((s) => s.price).filter((p) => typeof p === 'number' && p > 0)
    if (prices.length > 0) return Math.min(...prices)
  }
  if (provider.priceRange?.min > 0) return provider.priceRange.min
  return null
}

function getCoverImage(provider: ServiceProvider, services?: Service[]): string | null {
  if (services && services.length > 0 && services[0].images && services[0].images.length > 0) {
    return services[0].images[0]
  }
  return provider.images && provider.images.length > 0 ? provider.images[0] : null
}

function ImagePlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-light to-muted">
      <PawPrint className="h-12 w-12 text-muted-foreground/50" />
    </div>
  )
}

interface FavoriteButtonProps {
  isFavorite: boolean
  isToggling: boolean
  onToggle: (e: React.MouseEvent) => void
}

function FavoriteButton({ isFavorite, isToggling, onToggle }: FavoriteButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={isToggling}
      className="absolute top-3 right-3 p-2 backdrop-blur-xl bg-white/90 hover:bg-white rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 z-10"
      aria-label={isFavorite ? t('search.removeFromFavorites') : t('search.addToFavorites')}
    >
      <Heart
        className={cn(
          'h-[15px] w-[15px] transition-all duration-300',
          isFavorite ? 'text-red-500 fill-red-500 scale-110' : 'text-neutral-600',
          isToggling && 'animate-pulse'
        )}
      />
    </button>
  )
}

interface GridCardProps {
  provider: ServiceProvider
  services?: Service[]
  coverImage: string | null
  startingPrice: number | null
  isFavorite: boolean
  isToggling: boolean
  onToggleFavorite: (e: React.MouseEvent) => void
  className?: string
}

function GridCard({
  provider,
  coverImage,
  startingPrice,
  isFavorite,
  isToggling,
  onToggleFavorite,
  className,
}: GridCardProps) {
  const [imageError, setImageError] = useState(false)
  const serviceTags = provider.services.slice(0, 3)
  const extraCount = provider.services.length - serviceTags.length

  return (
    <div className={cn('group cursor-pointer', className)}>
      <Link href={`/providers/${provider.id}`}>
        <article className="relative flex flex-col rounded-[20px] bg-card border border-border overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:-translate-y-[3px]">
          <div className="relative overflow-hidden">
            <div className="aspect-[3/2] relative bg-muted">
              {!imageError && coverImage ? (
                <>
                  <Image
                    src={coverImage}
                    alt={provider.businessName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                </>
              ) : (
                <ImagePlaceholder />
              )}
            </div>

            {provider.certifications && provider.certifications.length > 0 && (
              <div className="absolute top-3 left-3 z-10">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide backdrop-blur-xl bg-white/95 shadow-[0_2px_12px_rgba(0,0,0,0.08)] text-emerald-700">
                  <BadgeCheck className="h-3 w-3" />
                  <span>Verified</span>
                </div>
              </div>
            )}

            <FavoriteButton
              isFavorite={isFavorite}
              isToggling={isToggling}
              onToggle={onToggleFavorite}
            />

            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent" />
          </div>

          <div className="px-4 pt-3 pb-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-[15px] leading-snug text-foreground line-clamp-1 group-hover:text-brand transition-colors duration-300">
                {provider.businessName}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span className="text-foreground text-[13px] font-semibold">{provider.rating}</span>
                {provider.reviewCount > 0 && (
                  <span className="text-[11px] text-muted-foreground">({provider.reviewCount})</span>
                )}
              </div>
            </div>

            <p className="text-[13px] text-muted-foreground leading-tight">
              {getServiceLabel(provider.services[0])}
              <span className="text-muted-foreground/40 mx-1">·</span>
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="h-3 w-3 inline-block" />
                {provider.location.city}
              </span>
            </p>

            {serviceTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {serviceTags.map((service) => (
                  <span
                    key={service}
                    className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs"
                  >
                    {getServiceLabel(service)}
                  </span>
                ))}
                {extraCount > 0 && (
                  <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs">
                    +{extraCount}
                  </span>
                )}
              </div>
            )}

            {startingPrice !== null && (
              <p className="text-[13px] text-muted-foreground">
                nuo{' '}
                <span className="text-foreground font-bold text-[15px]">€{startingPrice}</span>
              </p>
            )}
          </div>
        </article>
      </Link>
    </div>
  )
}

interface HorizontalCardProps {
  provider: ServiceProvider
  services?: Service[]
  coverImage: string | null
  startingPrice: number | null
  isFavorite: boolean
  isToggling: boolean
  onToggleFavorite: (e: React.MouseEvent) => void
  className?: string
}

function HorizontalCard({
  provider,
  coverImage,
  startingPrice,
  isFavorite,
  isToggling,
  onToggleFavorite,
  className,
}: HorizontalCardProps) {
  const [imageError, setImageError] = useState(false)
  const serviceTags = provider.services.slice(0, 2)

  return (
    <div className={cn('group cursor-pointer', className)}>
      <Link href={`/providers/${provider.id}`}>
        <article className="relative flex flex-row rounded-xl bg-card border border-border overflow-hidden transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-[2px]">
          <div className="relative w-[120px] shrink-0 bg-muted self-stretch">
            {!imageError && coverImage ? (
              <Image
                src={coverImage}
                alt={provider.businessName}
                fill
                sizes="120px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                onError={() => setImageError(true)}
              />
            ) : (
              <ImagePlaceholder />
            )}
            <FavoriteButton
              isFavorite={isFavorite}
              isToggling={isToggling}
              onToggle={onToggleFavorite}
            />
          </div>

          <div className="flex flex-col gap-1.5 px-3 py-3 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-[14px] leading-snug text-foreground line-clamp-1 group-hover:text-brand transition-colors duration-300">
                {provider.businessName}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                <span className="text-foreground text-[12px] font-semibold">{provider.rating}</span>
                {provider.reviewCount > 0 && (
                  <span className="text-[11px] text-muted-foreground">({provider.reviewCount})</span>
                )}
              </div>
            </div>

            <p className="text-[12px] text-muted-foreground leading-tight flex items-center gap-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              {provider.location.city}
              {provider.location.state ? `, ${provider.location.state}` : ''}
            </p>

            {serviceTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {serviceTags.map((service) => (
                  <span
                    key={service}
                    className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs"
                  >
                    {getServiceLabel(service)}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-auto pt-0.5">
              {provider.certifications && provider.certifications.length > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </span>
              ) : (
                <span />
              )}
              {startingPrice !== null && (
                <p className="text-[12px] text-muted-foreground">
                  nuo <span className="text-foreground font-bold">€{startingPrice}</span>
                </p>
              )}
            </div>
          </div>
        </article>
      </Link>
    </div>
  )
}

export const ProviderCard = ({
  provider,
  variant = 'grid',
  services,
  distance: _distance,
  className,
}: ProviderCardProps) => {
  const { user } = useAuth()
  const { isFavorited, toggleFavorite } = useFavorites()
  const [isToggling, setIsToggling] = useState(false)

  const isFavorite = isFavorited(provider.id)
  const coverImage = getCoverImage(provider, services)
  const startingPrice = getStartingPrice(provider, services)

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      window.location.href = '/auth/signin'
      return
    }

    setIsToggling(true)
    try {
      await toggleFavorite(provider.id)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsToggling(false)
    }
  }

  const sharedProps = {
    provider,
    services,
    coverImage,
    startingPrice,
    isFavorite,
    isToggling,
    onToggleFavorite: handleToggleFavorite,
    className,
  }

  if (variant === 'horizontal') {
    return <HorizontalCard {...sharedProps} />
  }

  return <GridCard {...sharedProps} />
}
