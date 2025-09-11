'use client'

import { Star, Clock, Users, PawPrint, Euro, Phone, Mail, Globe, MapPin } from 'lucide-react'
import { ServiceProvider, Service, Review, PetAd, Pet } from '@/types'
import { t } from '@/lib/translations'
import { Button } from '@/components/ui/button'
import { QuickBookingDialog } from './quick-booking-dialog'
import { useState } from 'react'
import Map, { Marker } from 'react-map-gl/mapbox'
import { MAPBOX_CONFIG } from '@/lib/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

interface ProviderInfoProps {
  provider: ServiceProvider
  services: Service[]
  reviews: Review[]
  petAd?: PetAd | null
  userPets: Pet[]
  onPetsUpdate: (pets: Pet[]) => void
  isMobile?: boolean
  onBookService?: (serviceId: string) => void
}

export function ProviderInfo({ provider, services, reviews, petAd, userPets, onPetsUpdate, isMobile = false, onBookService }: ProviderInfoProps) {
  const [quickBookingDialogOpen, setQuickBookingDialogOpen] = useState(false)
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null)
  
  const containerClass = isMobile ? 'space-y-6' : 'space-y-6'
  const titleClass = isMobile ? 'text-lg font-semibold' : 'text-xl font-semibold'
  const descriptionClass = isMobile ? 'text-gray-600 leading-relaxed' : 'text-gray-600 leading-relaxed text-lg'

  const handleServiceBooking = (service: Service) => {
    setSelectedServiceForBooking(service)
    setQuickBookingDialogOpen(true)
  }

  const handleQuickBook = (bookingData: {
    serviceId: string
    date: Date
    time: string
    petIds: string[]
  }) => {
    // Redirect to checkout with booking data
    const params = new URLSearchParams()
    params.set('date', bookingData.date.toISOString().split('T')[0])
    params.set('time', bookingData.time)
    params.set('pets', bookingData.petIds.join(','))
    params.set('service', bookingData.serviceId)
    
    window.location.href = `/bookings/checkout?${params.toString()}`
  }

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
          {provider.avatarUrl ? (
            <img 
              src={provider.avatarUrl} 
              alt={provider.businessName}
              className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full object-cover`}
            />
          ) : (
            <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gray-300 rounded-full flex items-center justify-center`}>
              <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-600`}>
                {provider.businessName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h2 className={`${isMobile ? 'font-semibold' : 'text-lg font-semibold'} text-gray-900`}>
              {t('provider.hostedBy')} {provider.businessName}
            </h2>
            <p className="text-sm text-gray-600">{provider.experience} {t('provider.yearsHosting')}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      {(provider.contactInfo?.phone || provider.contactInfo?.email || provider.contactInfo?.website) && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className={`${titleClass} text-gray-900 mb-4`}>Kontaktinė informacija</h3>
          <div className="flex flex-wrap items-center gap-6">
            {provider.contactInfo?.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <a 
                  href={`tel:${provider.contactInfo.phone}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {provider.contactInfo.phone}
                </a>
              </div>
            )}
            {provider.contactInfo?.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <a 
                  href={`mailto:${provider.contactInfo.email}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {provider.contactInfo.email}
                </a>
              </div>
            )}
            {provider.contactInfo?.website && (
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-600" />
                <a 
                  href={provider.contactInfo.website.startsWith('http') ? provider.contactInfo.website : `https://${provider.contactInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {provider.contactInfo.website}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location */}
      {provider.location.address && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className={`${titleClass} text-gray-900 mb-4`}>Vieta</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-600">
                <div>{provider.location.address}, {provider.location.city}, {provider.location.state} {provider.location.zipCode}</div>
              </div>
            </div>
            
            {/* Mapbox Map */}
            <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200">
              <Map
                mapboxAccessToken={MAPBOX_CONFIG.accessToken}
                initialViewState={{
                  longitude: provider.location.coordinates.lng,
                  latitude: provider.location.coordinates.lat,
                  zoom: 15
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle={MAPBOX_CONFIG.style}
              >
                <Marker
                  longitude={provider.location.coordinates.lng}
                  latitude={provider.location.coordinates.lat}
                  color="#ef4444"
                />
              </Map>
            </div>
          </div>
        </div>
      )}

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

      {/* Pet Ad Information */}
      {petAd && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className={`${titleClass} text-gray-900 mb-4`}>Produktas</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{petAd.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center">
                    <PawPrint className="h-4 w-4 mr-1" />
                    {petAd.species === 'dog' ? 'Šuo' : 
                     petAd.species === 'cat' ? 'Katė' : 
                     petAd.species === 'bird' ? 'Paukštis' : 
                     petAd.species === 'rabbit' ? 'Triušis' : 'Kita'}
                    {petAd.breed && ` • ${petAd.breed}`}
                  </span>
                  {petAd.age && (
                    <span>{petAd.age} mėn.</span>
                  )}
                  {petAd.gender && (
                    <span>{petAd.gender === 'male' ? 'Patinas' : 'Patelė'}</span>
                  )}
                </div>
                {petAd.description && (
                  <p className="text-gray-600 text-sm mb-3">{petAd.description}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 flex items-center">
                  <Euro className="h-5 w-5 mr-1" />
                  {petAd.price}
                </div>
                <div className="text-sm text-gray-600">Kaina</div>
              </div>
            </div>
            
            {/* Pet Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {petAd.weight && (
                <div>
                  <span className="font-medium text-gray-900">Svoris:</span>
                  <span className="text-gray-600 ml-2">{petAd.weight} kg</span>
                </div>
              )}
              {petAd.color && (
                <div>
                  <span className="font-medium text-gray-900">Spalva:</span>
                  <span className="text-gray-600 ml-2">{petAd.color}</span>
                </div>
              )}
              {petAd.vaccinationStatus && (
                <div>
                  <span className="font-medium text-gray-900">Vakcinacija:</span>
                  <span className="text-gray-600 ml-2">
                    {petAd.vaccinationStatus === 'vaccinated' ? 'Vakcinuotas' : 
                     petAd.vaccinationStatus === 'not_vaccinated' ? 'Nevakcinuotas' : 'Nežinoma'}
                  </span>
                </div>
              )}
              {petAd.size && (
                <div>
                  <span className="font-medium text-gray-900">Dydis:</span>
                  <span className="text-gray-600 ml-2">
                    {petAd.size === 'small' ? 'Mažas' : 
                     petAd.size === 'medium' ? 'Vidutinis' : 'Didelis'}
                  </span>
                </div>
              )}
            </div>

            {/* Special Needs */}
            {petAd.specialNeeds && petAd.specialNeeds.length > 0 && (
              <div className="mt-4">
                <span className="font-medium text-gray-900 text-sm">Specialūs poreikiai:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {petAd.specialNeeds.map((need, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Notes */}
            {petAd.medicalNotes && (
              <div className="mt-4">
                <span className="font-medium text-gray-900 text-sm">Medicinos pastabos:</span>
                <p className="text-gray-600 text-sm mt-1">{petAd.medicalNotes}</p>
              </div>
            )}

            {/* Behavioral Notes */}
            {petAd.behavioralNotes && (
              <div className="mt-4">
                <span className="font-medium text-gray-900 text-sm">Elgesio pastabos:</span>
                <p className="text-gray-600 text-sm mt-1">{petAd.behavioralNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

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
                      onClick={() => handleServiceBooking(service)}
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

      {/* Quick Booking Dialog */}
      {selectedServiceForBooking && (
        <QuickBookingDialog
          open={quickBookingDialogOpen}
          onOpenChange={setQuickBookingDialogOpen}
          service={selectedServiceForBooking}
          userPets={userPets}
          onPetsUpdate={onPetsUpdate}
          onBook={handleQuickBook}
        />
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
