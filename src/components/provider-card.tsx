'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Clock, Heart, Users, Award, Phone, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { ServiceProvider } from '@/types'
import { cn } from '@/lib/utils'
import { t } from '@/lib/translations'

interface ProviderCardProps {
  provider: ServiceProvider
  distance?: number
  showActions?: boolean
  className?: string
}

export const ProviderCard = ({ 
  provider, 
  distance, 
  showActions = true,
  className 
}: ProviderCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
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
      case 'walking':
        return '🚶'
      case 'sitting':
        return '💝'
      default:
        return '🐾'
    }
  }

  const getServiceTypeDisplayName = (serviceType: string) => {
    switch (serviceType) {
      case 'grooming':
        return 'Kirpykla'
      case 'veterinary':
        return 'Veterinarija'
      case 'boarding':
        return 'Prieglauda'
      case 'training':
        return 'Dresūra'
      case 'walking':
        return 'Šunų vedimas'
      case 'sitting':
        return 'Prižiūrėjimas'
      default:
        return 'Paslaugos'
    }
  }

  const getAvailabilityStatus = () => {
    const now = new Date()
    const currentDay = now.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase() as keyof typeof provider.availability
    const todaySlots = provider.availability[currentDay] || []
    
    // Check if provider has any availability set up
    const hasAnyAvailability = Object.values(provider.availability).some(daySlots => 
      Array.isArray(daySlots) && daySlots.length > 0
    )
    
    if (!hasAnyAvailability) {
      return { status: 'unavailable', text: t('search.notSet') }
    }
    
    if (todaySlots.length === 0) {
      return { status: 'closed', text: t('search.closed') }
    }
    
    const currentTime = now.toTimeString().slice(0, 5)
    const isAvailable = todaySlots.some(slot => 
      slot.available && currentTime >= slot.start && currentTime <= slot.end
    )
    
    return isAvailable 
      ? { status: 'open', text: t('search.open') }
      : { status: 'closed', text: t('search.closed') }
  }

  const availability = getAvailabilityStatus()

  return (
    <div className={cn("bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm group hover:shadow-lg transition-all duration-200 hover:-translate-y-1", className)}>
        {/* Image Section */}
        <div className="relative">
          <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-100 to-blue-200 h-48 overflow-hidden rounded-t-lg">
            {!imageError && provider.images[0] ? (
              <Image
                src={provider.images[0]}
                alt={provider.businessName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl">{getServiceCategoryIcon(provider.services[0])}</span>
              </div>
            )}
          </div>
          
          {/* Service Category Badge */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            <Badge variant="secondary" className="border-transparent bg-white/90 text-orange-700 text-xs">
              {getServiceTypeDisplayName(provider.services[0])}
            </Badge>
          </div>

          {/* Overlay Badges */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2">
            <Badge variant="secondary" className={`bg-white/90 ${
              availability.status === 'open' ? 'text-green-700' : 
              availability.status === 'unavailable' ? 'text-orange-700' : 
              'text-gray-900'
            }`}>
              {availability.status === 'open' ? t('search.open') : 
               availability.status === 'unavailable' ? t('search.notSet') : 
               t('search.closed')}
            </Badge>
            {provider.certifications && provider.certifications.length > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Award className="h-3 w-3 mr-1" />
                {t('search.certified')}
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            aria-label={isFavorite ? t('search.removeFromFavorites') : t('search.addToFavorites')}
          >
            <Heart 
              className={cn(
                "h-4 w-4",
                isFavorite ? "text-red-500 fill-current" : "text-gray-400"
              )} 
            />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 pt-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder-avatar.jpg" alt={provider.businessName} />
                <AvatarFallback>
                  {provider.businessName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  <Link href={`/providers/${provider.id}`}>
                    {provider.businessName}
                  </Link>
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900 ml-1">
                      {provider.rating}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({provider.reviewCount} {t('search.reviews')})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {provider.description}
          </p>

          {/* Services - Moved to overlay */}

          {/* Location and Distance */}
          <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {provider.location.city}, {provider.location.state}
            </div>
            {distance && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {distance} km {t('search.away')}
              </div>
            )}
          </div>

          {/* Experience and Availability */}
          <div className="flex items-center justify-between mb-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              {provider.experience} {t('search.yearsExperience')}
            </div>
            <div className={cn(
              "flex items-center text-sm",
              availability.status === 'open' ? "text-green-600" : "text-gray-500"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full mr-2",
                availability.status === 'open' ? "bg-green-500" : "bg-gray-400"
              )} />
              {availability.text}
            </div>
          </div>

          {/* Price Range */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-lg text-gray-900">
                €{provider.priceRange.min}-€{provider.priceRange.max}
              </span>
              <span className="ml-1">{t('search.perService')}</span>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/providers/${provider.id}`}>
                  {t('search.viewProfile')}
                </Link>
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <Link href={`/providers/${provider.id}/book`}>
                  {t('search.bookNow')}
                </Link>
              </Button>
            </div>
          )}

          {/* Quick Contact */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                {t('search.call')}
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                {t('search.message')}
              </Button>
            </div>
          </div>
        </div>
    </div>
  )
}
