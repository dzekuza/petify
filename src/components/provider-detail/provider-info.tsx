'use client'

import { Star, Clock, Users, PawPrint } from 'lucide-react'
import { ServiceProvider, Service, Review } from '@/types'
import { t } from '@/lib/translations'
import { Button } from '@/components/ui/button'

interface ProviderInfoProps {
  provider: ServiceProvider
  services: Service[]
  reviews: Review[]
  isMobile?: boolean
  onBookService?: (serviceId: string) => void
}

export function ProviderInfo({ provider, services, reviews, isMobile = false, onBookService }: ProviderInfoProps) {
  const containerClass = isMobile ? 'space-y-6' : 'space-y-6'
  const titleClass = isMobile ? 'text-lg font-semibold' : 'text-xl font-semibold'
  const descriptionClass = isMobile ? 'text-gray-600 leading-relaxed' : 'text-gray-600 leading-relaxed text-lg'

  return (
    <div className={containerClass}>
      {/* Header Info */}
      <div className="mb-6">
        <div className="mb-4">
          <div>
            <p className="text-gray-600 mb-2">
              {t('provider.petServiceIn')} {provider.location.city}, {provider.location.state}
            </p>
            <p className="text-gray-600 text-sm">
              {services.length > 0 ? `${services.length} ${t('provider.servicesAvailable')}` : t('provider.servicesAvailable')} • {provider.experience} {t('provider.yearsExperience')}
            </p>
          </div>
        </div>
        
        {/* Reviews */}
        <div className="flex items-center space-x-2 mb-4">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">{provider.rating}</span>
          <span className="text-sm text-gray-500">({provider.reviewCount} {t('provider.reviews')})</span>
        </div>
      </div>

      {/* Host Information */}
      <div className="border-t border-gray-200 pt-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gray-300 rounded-full flex items-center justify-center`}>
            <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-600`}>
              {provider.businessName.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className={`${isMobile ? 'font-semibold' : 'text-lg font-semibold'} text-gray-900`}>
              {t('provider.hostedBy')} {provider.businessName}
            </h2>
            <p className="text-sm text-gray-600">{provider.experience} {t('provider.yearsHosting')}</p>
          </div>
        </div>
      </div>

      {/* Pet Policy */}
      <div className="border-t border-gray-200 pt-6 mb-6">
        <div className="flex items-start space-x-3">
          <PawPrint className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-gray-600 mt-0.5`} />
          <div>
            <h3 className={`${titleClass} text-gray-900`}>{t('provider.petFriendlyServices')}</h3>
            <p className="text-sm text-gray-600">{t('provider.professionalCare')}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="border-t border-gray-200 pt-6 mb-6">
        <p className={descriptionClass}>{provider.description}</p>
      </div>

      {/* Services */}
      {services.length > 0 && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className={`${titleClass} text-gray-900 mb-4`}>{t('provider.servicesAndPricing')}</h2>
          <div className="space-y-4">
            {services.slice(0, isMobile ? 3 : services.length).map((service) => (
              <div key={service.id} className={`border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-6 rounded-xl'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`${isMobile ? 'font-medium' : 'text-lg font-medium'} text-gray-900 ${isMobile ? '' : 'mb-2'}`}>
                      {service.name}
                    </h4>
                    <p className={`text-sm text-gray-600 ${isMobile ? 'mt-1' : 'mb-3'}`}>
                      {service.description}
                    </p>
                    <div className={`flex items-center space-x-4 text-sm text-gray-500 ${isMobile ? 'mt-2' : ''}`}>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration} {t('provider.minutes')}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {t('provider.upTo')} {service.maxPets} {service.maxPets > 1 ? t('provider.pets') : t('provider.pet')}
                      </span>
                    </div>
                  </div>
                  <div className={`text-right ${isMobile ? 'ml-4' : 'ml-6'}`}>
                    <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold text-gray-900`}>
                      €{service.price}
                    </div>
                    <Button
                      onClick={() => onBookService?.(service.id)}
                      className={`mt-2 bg-black hover:bg-gray-800 text-white ${isMobile ? 'w-full' : 'w-auto px-4'}`}
                      size="sm"
                    >
                      {t('provider.bookService')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {isMobile && services.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                +{services.length - 3} {t('provider.moreServices')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className={`${titleClass} text-gray-900 mb-4`}>{t('provider.reviews')} ({provider.reviewCount})</h2>
          <div className="space-y-4">
            {reviews.slice(0, isMobile ? 2 : 3).map((review) => (
              <div key={review.id} className={`border-b border-gray-100 pb-4 last:border-b-0 ${isMobile ? '' : 'pb-6'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
