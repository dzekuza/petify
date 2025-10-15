'use client'

import { OnboardingData } from '@/types/onboarding'
import OnboardingLayout from './onboarding-layout'
import BottomNavigation from './bottom-navigation'
import ExitButton from './exit-button'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Globe, Clock, Star, Euro } from 'lucide-react'
import Image from 'next/image'

interface ReviewStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  isEditMode?: boolean
  onSave?: () => void
  onExitEdit?: () => void
}

export default function ReviewStep({ data, onUpdate, onNext, onPrevious, isEditMode, onSave, onExitEdit }: ReviewStepProps) {
  const formatAddress = () => {
    const parts = [data.address, data.city, data.state, data.zipCode].filter(Boolean)
    return parts.join(', ')
  }

  const formatWorkingHours = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis', 'Sekmadienis']
    
    return days.map((day, index) => {
      const hours = data.workingHours?.[day as keyof typeof data.workingHours]
      if (hours?.enabled) {
        return `${dayNames[index]}: ${hours.startTime} - ${hours.endTime}`
      }
      return null
    }).filter(Boolean) as string[]
  }

  return (
    <OnboardingLayout
      bottom={
        <BottomNavigation
          currentStep={9}
          totalSteps={9}
          onNext={onNext}
          onPrevious={onPrevious}
          isNextDisabled={false}
          nextText="Baigti registraciją"
          isEditMode={isEditMode}
          onSave={onSave}
        />
      }
    >
      <ExitButton onExit={onExitEdit || (() => {})} isEditMode={isEditMode} />
      <div className="w-full max-w-[720px] mx-auto">
        <div className="flex flex-col gap-6">
            {/* Title */}
            <h1 className="text-3xl font-bold text-black w-full">
              Peržiūrėti informaciją
            </h1>
              
              <p className="text-gray-600 mb-6">
                Peržiūrėkite savo informaciją prieš baigiant registraciją
              </p>

              {/* Business Information */}
              <div className="w-full bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Verslo informacija</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Pavadinimas:</span>
                    <p className="text-gray-600">{data.businessName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Aprašymas:</span>
                    <p className="text-gray-600">{data.businessDescription}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{data.phone}</span>
                  </div>
                  {data.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{data.website}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="w-full bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Vieta</h2>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600">{formatAddress()}</p>
                    {data.addresses && data.addresses.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {data.addresses.length} papildoma adresas
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Services or Pet Types */}
              {data.services && data.services.length > 0 && (
                <div className="w-full bg-white p-6 rounded-lg border">
                  <h2 className="text-xl font-semibold mb-4">
                    {data.providerType === 'adoption' ? 'Gyvūnų tipai' : 'Paslaugos'}
                  </h2>
                  {data.providerType !== 'adoption' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.services.map((serviceIdOrName, index) => {
                        const details = (data.serviceDetails || []).find(d => d.id === serviceIdOrName || d.name === serviceIdOrName)
                        if (!details) {
                          return (
                            <Badge key={index} variant="secondary">{serviceIdOrName}</Badge>
                          )
                        }
                        const firstImage = (details.gallery && details.gallery.length > 0) ? details.gallery[0] : null
                        const imgSrc = firstImage ? URL.createObjectURL(firstImage as File) : null
                        return (
                          <div key={index} className="flex gap-3 items-start border rounded-lg p-3">
                            {imgSrc ? (
                              <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                                {/* Use next/image only when we have a string URL; Files need object URL */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imgSrc} alt="service" className="w-16 h-16 object-cover" />
                              </div>
                            ) : (
                              <div className="w-16 h-16 shrink-0 rounded-md bg-gray-100" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium truncate">{details.name}</h3>
                                {details.price && (
                                  <span className="text-sm text-gray-700 inline-flex items-center gap-1">
                                    <Euro className="h-3 w-3" />{details.price}
                                  </span>
                                )}
                              </div>
                              {details.description && (
                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{details.description}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {data.services.map((service, index) => (
                        <Badge key={index} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Detailed Services or Pet Type Details */}
              {data.providerType === 'adoption' && data.serviceDetails && data.serviceDetails.length > 0 ? (
                <div className="w-full bg-white p-6 rounded-lg border">
                  <h2 className="text-xl font-semibold mb-4">Gyvūnų tipų detalizacija</h2>
                  <div className="space-y-6">
                    {data.serviceDetails.map((service, index) => (
                      <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                        <h3 className="font-medium text-lg mb-3">{service.name}</h3>
                        
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {service.breed && (
                            <div>
                              <span className="font-medium text-sm text-gray-700">Veislė:</span>
                              <p className="text-gray-600 capitalize">{service.breed.replace('-', ' ')}</p>
                            </div>
                          )}
                          {service.generation && (
                            <div>
                              <span className="font-medium text-sm text-gray-700">Kartos tipas:</span>
                              <p className="text-gray-600">{service.generation}</p>
                            </div>
                          )}
                          {service.price && (
                            <div>
                              <span className="font-medium text-sm text-gray-700">Kainų diapazonas:</span>
                              <p className="text-gray-600">€{service.price}</p>
                            </div>
                          )}
                        </div>

                        {/* Litter Information */}
                        {(service.maleCount || service.femaleCount) && (
                          <div className="mb-4">
                            <span className="font-medium text-sm text-gray-700">Šuniukų skaičius:</span>
                            <p className="text-gray-600">
                              {service.maleCount && `${service.maleCount} patinų`}
                              {service.maleCount && service.femaleCount && ' / '}
                              {service.femaleCount && `${service.femaleCount} patelių`}
                            </p>
                          </div>
                        )}

                        {/* Age Information */}
                        {(service.ageWeeks || service.ageDays) && (
                          <div className="mb-4">
                            <span className="font-medium text-sm text-gray-700">Amžius:</span>
                            <p className="text-gray-600">
                              {service.ageWeeks && `${service.ageWeeks} savaitės`}
                              {service.ageWeeks && service.ageDays && ', '}
                              {service.ageDays && `${service.ageDays} dienos`}
                            </p>
                          </div>
                        )}

                        {/* Ready to Leave */}
                        {service.readyToLeave && (
                          <div className="mb-4">
                            <span className="font-medium text-sm text-gray-700">Paruošti išvežti:</span>
                            <p className="text-gray-600">{new Date(service.readyToLeave).toLocaleDateString('lt-LT')}</p>
                          </div>
                        )}

                        {/* Health Documents */}
                        {(service.microchipped || service.vaccinated || service.wormed || service.healthChecked || service.parentsTested || service.kcRegistered) && (
                          <div className="mb-4">
                            <span className="font-medium text-sm text-gray-700">Sveikatos dokumentai:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {service.microchipped && <Badge variant="outline" className="text-xs">Mikročipas</Badge>}
                              {service.vaccinated && <Badge variant="outline" className="text-xs">Skiepai</Badge>}
                              {service.wormed && <Badge variant="outline" className="text-xs">Parazitų valymas</Badge>}
                              {service.healthChecked && <Badge variant="outline" className="text-xs">Veterinarijos patikra</Badge>}
                              {service.parentsTested && <Badge variant="outline" className="text-xs">Tėvų sveikatos patikra</Badge>}
                              {service.kcRegistered && <Badge variant="outline" className="text-xs">KC registracija</Badge>}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {service.description && (
                          <div>
                            <span className="font-medium text-sm text-gray-700">Aprašymas:</span>
                            <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : data.detailedServices && data.detailedServices.length > 0 ? (
                <div className="w-full bg-white p-6 rounded-lg border">
                  <h2 className="text-xl font-semibold mb-4">Detalios paslaugos</h2>
                  <div className="space-y-4">
                    {data.detailedServices.map((service, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Euro className="h-3 w-3" />
                            €{service.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Pricing removed per requirements */}

              {/* Experience & Certifications - Hidden for breeders */}
              {data.providerType !== 'adoption' && (
                <div className="w-full bg-white p-6 rounded-lg border">
                  <h2 className="text-xl font-semibold mb-4">Patirtis ir sertifikatai</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Patirtis:</span>
                      <p className="text-gray-600">{data.experience}</p>
                    </div>
                    {data.certifications && data.certifications.length > 0 && (
                      <div>
                        <span className="font-medium">Sertifikatai:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {data.certifications.map((cert, index) => (
                            <Badge key={index} variant="outline">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Working Hours - Hidden for breeders */}
              {data.providerType !== 'adoption' && (
                <div className="w-full bg-white p-6 rounded-lg border">
                  <h2 className="text-xl font-semibold mb-4">Darbo laikas</h2>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                    <ul className="text-gray-600 space-y-1">
                      {formatWorkingHours().map((line, idx) => (
                        <li key={idx}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Terms Acceptance */}
              <div className="w-full bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-800">
                    Sutinkate su naudojimo sąlygomis ir privatumo politika
                  </span>
                </div>
              </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
