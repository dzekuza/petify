'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Star, MapPin, Clock, Heart, Users, Award, Phone, MessageCircle, Euro } from 'lucide-react'
import Image from 'next/image'
import { Service } from '@/types'
import { ServiceProvider } from '@/types'
import { cn } from '@/lib/utils'
import { t } from '@/lib/translations'
import { useFavorites } from '@/contexts/favorites-context'
import { useAuth } from '@/contexts/auth-context'

interface ServiceCardProps {
  service: Service
  provider: ServiceProvider
  distance?: number
  showActions?: boolean
  className?: string
}

export const ServiceCard = ({ 
  service, 
  provider, 
  distance, 
  showActions = true,
  className 
}: ServiceCardProps) => {
  const { user } = useAuth()
  const { isFavorited, toggleFavorite } = useFavorites()
  const [imageError, setImageError] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const isFavorite = isFavorited(provider.id)

  const handleToggleFavorite = async () => {
    if (!user) {
      // Redirect to login or show login modal
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

  const handleImageError = () => {
    setImageError(true)
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

  const getServiceTypeDisplayName = (category: string) => {
    switch (category) {
      case 'grooming':
        return 'Kirpykla'
      case 'veterinary':
        return 'Veterinarija'
      case 'boarding':
        return 'Prieglauda'
      case 'training':
        return 'Treniruotės'
      case 'adoption':
        return 'Veislynas'
      case 'sitting':
        return 'Prižiūrėjimas'
      default:
        return 'Paslaugos'
    }
  }

  // Get the cover image - prioritize service images, fallback to provider image
  const getCoverImage = () => {
    if (service.images && service.images.length > 0) {
      return service.images[0]
    }
    return provider.images && provider.images.length > 0 ? provider.images[0] : null
  }

  const coverImage = getCoverImage()

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden", className)}>
      {/* Image Section */}
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
          {!imageError && coverImage ? (
            <Image
              src={coverImage}
              alt={service.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">{getServiceCategoryIcon(service.category)}</span>
            </div>
          )}
        </div>
        
        {/* Service Category Badge */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          <Badge variant="secondary" className="border-transparent bg-white/90 text-orange-700 text-xs">
            {getServiceTypeDisplayName(service.category)}
          </Badge>
        </div>

        {/* Favorite Button */}
        {showActions && (
          <button
            onClick={handleToggleFavorite}
            disabled={isToggling}
            className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors disabled:opacity-50"
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
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Service Name */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-1 text-gray-900">
              {service.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-1">
              {provider.businessName}
            </p>
          </div>

          {/* Service Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {service.description}
          </p>

          {/* Location and Distance */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">
              {provider.location.city}
            </span>
            {distance && (
              <span className="text-xs text-gray-500">
                • {distance.toFixed(1)} km
              </span>
            )}
          </div>

          {/* Price and Duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <Euro className="h-4 w-4" />
              <span>€{service.price}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{service.duration} min</span>
            </div>
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-900">
                {provider.rating || 0}
              </span>
              <span className="text-xs text-gray-500">
                ({provider.reviewCount || 0})
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Action Buttons */}
      {showActions && (
        <CardFooter className="p-4 pt-0">
          <div className="flex gap-2 w-full">
            <Button asChild className="flex-1" size="sm">
              <Link href={`/providers/${provider.id}/book?service=${service.id}`}>
                {t('search.bookNow')}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/providers/${provider.id}`}>
                {t('search.viewProfile')}
              </Link>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
