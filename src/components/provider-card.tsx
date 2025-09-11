'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Star, MapPin, Clock, Heart, Users, Award, Phone, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { ServiceProvider } from '@/types'
import { cn } from '@/lib/utils'
import { t } from '@/lib/translations'
import { useFavorites } from '@/contexts/favorites-context'
import { useAuth } from '@/contexts/auth-context'

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
        return '🏠'
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
      case 'adoption':
        return 'Skelbimai'
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
    <Card className={cn("group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden", className)}>
      {/* Image Section */}
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
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
      </div>

      {/* Card Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder-avatar.jpg" alt={provider.businessName} />
            <AvatarFallback>
              {provider.businessName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
              <Link href={`/providers/${provider.id}`}>
                {provider.businessName}
              </Link>
            </CardTitle>
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
      </CardHeader>

      {/* Card Content */}
      <CardContent className="space-y-4">
        {/* Description */}
        <CardDescription className="line-clamp-2">
          {provider.description}
        </CardDescription>

        {/* Location and Distance */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
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
        <div className="flex items-center justify-between text-sm">
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
        <div className="text-sm text-gray-600">
          <span className="font-medium text-lg text-gray-900">
            €{provider.priceRange.min}-€{provider.priceRange.max}
          </span>
          <span className="ml-1">{t('search.perService')}</span>
        </div>
      </CardContent>

      {/* Card Footer */}
      <CardFooter className="flex-col space-y-3 pt-0">
        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 w-full">
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
        <div className="flex space-x-2 w-full pt-2 border-t border-gray-100">
          <Button variant="ghost" size="sm" className="flex-1">
            <Phone className="h-4 w-4 mr-2" />
            {t('search.call')}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            {t('search.message')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
