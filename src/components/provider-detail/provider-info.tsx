'use client'

import { Star, Clock, Users, PawPrint, Euro, Phone, Mail, Globe, MapPin } from 'lucide-react'
import { ServiceProvider, Service, Review, PetAd, PetType, IndividualPet } from '@/types'
import { t } from '@/lib/translations'
import { Button } from '@/components/ui/button'
import Map, { Marker } from 'react-map-gl/mapbox'
import { MAPBOX_CONFIG } from '@/lib/mapbox'
import { petAdoptionApi } from '@/lib/pet-adoption-profiles'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import 'mapbox-gl/dist/mapbox-gl.css'

// Function to calculate time since joining
const getTimeSinceJoining = (createdAt: string): string => {
  const now = new Date()
  const joinDate = new Date(createdAt)
  const diffInMs = now.getTime() - joinDate.getTime()
  
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  const diffInMonths = Math.floor(diffInDays / 30)
  const diffInYears = Math.floor(diffInMonths / 12)
  
  if (diffInYears > 0) {
    return `Prisijungė prieš ${diffInYears} ${diffInYears === 1 ? 'metus' : 'metus'}`
  } else if (diffInMonths > 0) {
    return `Prisijungė prieš ${diffInMonths} ${diffInMonths === 1 ? 'mėnesį' : 'mėnesius'}`
  } else if (diffInDays > 0) {
    return `Prisijungė prieš ${diffInDays} ${diffInDays === 1 ? 'dieną' : 'dienas'}`
  } else {
    return 'Prisijungė šiandien'
  }
}

interface ProviderInfoProps {
  provider: ServiceProvider
  services: Service[]
  reviews: Review[]
  petAd?: PetAd | null
  isMobile?: boolean
  onBookService?: (serviceId: string) => void
  preSelectedServiceId?: string | null
}

export function ProviderInfo({ provider, services, reviews, petAd, isMobile = false, onBookService, preSelectedServiceId }: ProviderInfoProps) {
  const [petTypes, setPetTypes] = useState<PetType[]>([])
  const [individualPets, setIndividualPets] = useState<IndividualPet[]>([])
  const [loadingPets, setLoadingPets] = useState(false)
  
  // Check if this is an adoption provider
  const isAdoptionProvider = provider.businessType === 'adoption' || 
    services.some(service => service.category === 'adoption')
  
  // Fetch pet types and individual pets for adoption providers
  useEffect(() => {
    if (isAdoptionProvider && provider.userId) {
      const fetchPetData = async () => {
        try {
          setLoadingPets(true)
          const [petTypesData, individualPetsData] = await Promise.all([
            petAdoptionApi.getPetTypesByProvider(provider.userId),
            petAdoptionApi.getIndividualPetsByProvider(provider.userId)
          ])
          setPetTypes(petTypesData)
          setIndividualPets(individualPetsData)
        } catch (error) {
          console.error('Error fetching pet data:', error)
        } finally {
          setLoadingPets(false)
        }
      }
      
      fetchPetData()
    }
  }, [isAdoptionProvider, provider.userId])
  
  // List of scraped provider user IDs (from BookitNow.lt import)
  const scrapedProviderUserIds = [
    'a6558eeb-8dac-44e6-a196-faaf93eef966', // Dresūros centras | Nemirseta
    '0dcedfce-dca7-4911-8320-8de3c7232b25', // Dresūros centras | Palanga
    '947814d9-60b8-4de5-aea7-04ade3168f30', // Fracco dresūros mokykla
    '024f9da0-a579-4f6b-9ff5-3121996e2767', // OH MY DOG šunų ir kačių kirpykla
    '52077fbe-293a-4888-876e-4f753d719819', // Reksas - Šunų pamokos Vilniuje
    '7bab2720-a543-4b1b-b42e-9a57d5108915', // Šunų ir kačių kirpykla „Keturkojų stilius"
    'c93d2cfd-914f-43e5-82a5-eb230aac1d46', // Tauro Grooming & Skin Care
    '7024c980-0616-4266-8cf1-1f2c64abf9fc', // Vanilos salonas – gyvūnų kirpykla
    '5cb11b91-ee79-4fc2-bfe6-d44d598c85fa', // Zoohotel – naminių gyvūnų grožio salonas Lazdynuose
    '470f752b-915b-404e-a3bf-965f070c11f8', // Zoohotel – naminių gyvūnų grožio salonas Naujojoje Vilnioje
    '8fc776c6-d413-4250-ba52-058b4e2e7dc8'  // Zoohotel – naminių gyvūnų grožio salonas Pavilnyje
  ]
  
  // Check if this is a scraped provider
  const isScrapedProvider = scrapedProviderUserIds.includes(provider.userId)
  
  const containerClass = isMobile ? 'space-y-6' : 'space-y-6'
  const titleClass = isMobile ? 'text-lg font-semibold' : 'text-xl font-semibold'

  const handleServiceBooking = (service: Service) => {
    // Instead of opening dialog, redirect to booking page with service pre-selected
    if (onBookService) {
      onBookService(service.id)
    }
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
            <p className="text-gray-600 leading-relaxed mb-2">
              {provider.description}
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
              {provider.businessName}
            </h2>
            <p className="text-sm text-gray-600">{getTimeSinceJoining(provider.createdAt)}</p>
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

      {/* Services - Hide for breeders */}
      {services.length > 0 && provider.businessType !== 'adoption' && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className={`${titleClass} text-gray-900 mb-4`}>{t('provider.servicesAndPricing')}</h2>
          <div className="space-y-4">
            {services.slice(0, isMobile ? 3 : services.length).map((service) => (
              <div key={service.id} className={`border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-6 rounded-xl'}`}>
                <div>
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
                <div className="mt-4 flex items-center justify-between">
                  <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold text-gray-900`}>
                    €{service.price}
                  </div>
                  {!isScrapedProvider && provider.businessType !== 'adoption' && (
                    <Button
                      onClick={() => handleServiceBooking(service)}
                      className={preSelectedServiceId === service.id 
                        ? "bg-gray-400 text-white w-auto px-4 cursor-not-allowed" 
                        : "bg-black hover:bg-gray-800 text-white w-auto px-4"
                      }
                      size="sm"
                      disabled={preSelectedServiceId === service.id}
                    >
                      {preSelectedServiceId === service.id ? "Paslauga pridėta" : t('provider.bookService')}
                    </Button>
                  )}
                  {provider.businessType === 'adoption' && (
                    <div className="text-sm text-gray-600 font-medium">
                      Šiuo metu prieinama
                    </div>
                  )}
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

      {/* Pet Types and Individual Pets for Adoption Providers */}
      {isAdoptionProvider && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className={`${titleClass} text-gray-900 mb-4`}>Gyvūnų tipai ir sąrašas</h2>
          
          {loadingPets ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-32 w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Provider Profile Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Veislyno informacija</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Business Information Card */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Verslo informacija</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-gray-900">Pavadinimas:</span>
                          <p className="text-gray-600">{provider.businessName}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Tipas:</span>
                          <p className="text-gray-600">{provider.businessType}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Aprašymas:</span>
                          <p className="text-gray-600 text-sm line-clamp-3">{provider.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {provider.rating > 0 ? `⭐ ${provider.rating.toFixed(1)}` : 'Naujas'}
                          </Badge>
                          <Badge variant={provider.availability ? "default" : "secondary"} className="text-xs">
                            {provider.availability ? "Prieinamas" : "Neprieinamas"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Information Card */}
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Kontaktinė informacija</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-gray-900">El. paštas:</span>
                          <p className="text-gray-600">{provider.contactInfo?.email || 'Nenurodyta'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Telefonas:</span>
                          <p className="text-gray-600">{provider.contactInfo?.phone || 'Nenurodyta'}</p>
                        </div>
                        {provider.contactInfo?.website && (
                          <div>
                            <span className="font-medium text-gray-900">Svetainė:</span>
                            <p className="text-gray-600">
                              <a 
                                href={provider.contactInfo.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {provider.contactInfo.website}
                              </a>
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-900">Adresas:</span>
                          <p className="text-gray-600">
                            {provider.location?.address || 'Nenurodyta'}, {provider.location?.city || 'Nenurodyta'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Pet Types Section */}
              {petTypes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Gyvūnų tipai</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {petTypes.map((petType) => (
                      <Card key={petType.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{petType.title}</CardTitle>
                          <p className="text-sm text-gray-600 line-clamp-2">{petType.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {petType.breedType}
                            </Badge>
                            <Badge variant={petType.isActive ? "default" : "secondary"} className="text-xs">
                              {petType.isActive ? "Aktyvus" : "Neaktyvus"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Pets Section */}
              {individualPets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Atskiri gyvūnai</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {individualPets.map((pet) => (
                      <Card key={pet.id} className="hover:shadow-md transition-shadow">
                        {pet.gallery && pet.gallery.length > 0 && pet.gallery[0] && pet.gallery[0].trim() !== '' && (
                          <div className="relative h-48 w-full">
                            <Image
                              src={pet.gallery[0]}
                              alt={pet.title}
                              fill
                              className="object-cover rounded-t-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg line-clamp-1">{pet.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {pet.sexType === 'male' ? 'Patinas' : 'Patelė'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {pet.age} sav.
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Euro className="h-4 w-4" />
                              <span className="font-semibold text-lg">{pet.price}€</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>Paruoštas: {new Date(pet.readyToLeave).toLocaleDateString('lt-LT')}</span>
                            </div>

                            {pet.features && pet.features.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {pet.features.slice(0, 2).map((feature) => (
                                  <Badge key={feature} variant="secondary" className="text-xs">
                                    {feature === 'microchipped' ? 'Mikročipas' :
                                     feature === 'vaccinated' ? 'Vakcinuotas' :
                                     feature === 'wormed' ? 'Nuparazitintas' :
                                     feature === 'health_checked' ? 'Sveikatos patikra' :
                                     feature === 'parents_tested' ? 'Tėvai patikrinti' : feature}
                                  </Badge>
                                ))}
                                {pet.features.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{pet.features.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {petTypes.length === 0 && individualPets.length === 0 && (
                <div className="text-center py-8">
                  <PawPrint className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Šiuo metu nėra gyvūnų pardavimui.</p>
                </div>
              )}
            </div>
          )}
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
