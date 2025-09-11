import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Clock } from 'lucide-react'
import { t } from '@/lib/translations'

// Mock data for featured providers
const featuredProviders = [
  {
    id: '1',
    businessName: 'Happy Paws Grooming',
    description: 'Professional pet grooming with 10+ years of experience',
    rating: 4.9,
    reviewCount: 127,
    location: 'Downtown',
    priceRange: { min: 45, max: 85 },
    services: ['grooming', 'nail trimming', 'teeth cleaning'],
    image: '/placeholder-grooming.jpg',
    avatar: '/placeholder-avatar-1.jpg',
  },
  {
    id: '2',
    businessName: 'Dr. Sarah\'s Veterinary Clinic',
    description: 'Comprehensive veterinary care for all pets',
    rating: 4.8,
    reviewCount: 89,
    location: 'Midtown',
    priceRange: { min: 75, max: 200 },
    services: ['veterinary', 'checkups', 'emergency care'],
    image: '/placeholder-vet.jpg',
    avatar: '/placeholder-avatar-2.jpg',
  },
  {
    id: '3',
    businessName: 'Paws & Play Boarding',
    description: 'Luxury pet boarding with 24/7 care',
    rating: 4.7,
    reviewCount: 156,
    location: 'Suburbs',
    priceRange: { min: 60, max: 120 },
    services: ['boarding', 'daycare', 'training'],
    image: '/placeholder-boarding.jpg',
    avatar: '/placeholder-avatar-3.jpg',
  },
]

export const FeaturedProviders = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('landing.featuredProviders.title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t('landing.featuredProviders.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProviders.map((provider) => (
            <Card key={provider.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="relative">
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Provider Image</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90">
                    {t('landing.featuredProviders.featured')}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={provider.avatar} alt={provider.businessName} />
                    <AvatarFallback>
                      {provider.businessName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {provider.businessName}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900 ml-1">
                          {provider.rating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({provider.reviewCount} {t('landing.featuredProviders.reviews')})
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {provider.description}
                </p>

                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {provider.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    €{provider.priceRange.min}-€{provider.priceRange.max}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.services.slice(0, 3).map((service) => (
                    <Badge key={service} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {provider.services.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{provider.services.length - 3} {t('landing.featuredProviders.more')}
                    </Badge>
                  )}
                </div>

                <Button asChild className="w-full">
                  <Link href={`/providers/${provider.id}`}>
                    {t('landing.featuredProviders.viewProfile')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link href="/search">
              {t('landing.featuredProviders.viewAllProviders')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
