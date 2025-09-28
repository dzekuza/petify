'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle, PawPrint } from 'lucide-react'
import { format } from 'date-fns'
import { lt } from 'date-fns/locale'
import { useDeviceDetection } from '@/lib/device-detection'
import type { BookingStepProps } from './types'

export function BookingStep4({ 
  provider, 
  selectedService, 
  selectedPets, 
  selectedDate, 
  selectedTimeSlot, 
  pets, 
  onPrev, 
  onComplete,
  loading = false 
}: BookingStepProps) {
  const { isMobile } = useDeviceDetection()
  const selectedPetsData = pets.filter(pet => selectedPets.includes(pet.id))
  
  const totalPrice = selectedService ? selectedService.price * selectedPets.length : 0


  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Patvirtinkite užsakymą
        </h2>
        <p className="text-gray-600">
          Peržiūrėkite užsakymo detales ir patvirtinkite
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Užsakymo santrauka</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Service Provider */}
            <div>
              <h4 className="font-medium text-gray-900">Paslaugos tiekėjas</h4>
              <p className="text-gray-600">{provider.businessName}</p>
              <p className="text-sm text-gray-500">
                {provider.location?.city}, {provider.location?.state}
              </p>
            </div>

            {/* Service */}
            {selectedService && (
              <div>
                <h4 className="font-medium text-gray-900">Paslauga</h4>
                <p className="text-gray-600">{selectedService.name}</p>
                <p className="text-sm text-gray-500">{selectedService.description}</p>
              </div>
            )}

            {/* Date and Time */}
            <div>
              <h4 className="font-medium text-gray-900">Data ir laikas</h4>
              {selectedDate && (
                <p className="text-gray-600">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy', { locale: lt })}
                </p>
              )}
              {selectedTimeSlot && (
                <p className="text-gray-600">{selectedTimeSlot}</p>
              )}
            </div>

            {/* Selected Pets */}
            <div>
              <h4 className="font-medium text-gray-900">Augintiniai</h4>
              <div className="space-y-2">
                {selectedPetsData.map((pet) => (
                  <div key={pet.id} className="flex items-center space-x-2">
                    <PawPrint className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">{pet.name}</span>
                    <span className="text-sm text-gray-500">
                      ({pet.species}, {pet.age} metai)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Iš viso:</span>
                <span className="text-xl font-bold text-green-600">
                  €{totalPrice.toFixed(2)}
                </span>
              </div>
              {selectedPets.length > 1 && (
                <p className="text-sm text-gray-500">
                  €{selectedService?.price} × {selectedPets.length} augintiniai
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Mokėjimo informacija</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Mokėjimo būdas</h4>
              <p className="text-sm text-yellow-700">
                Mokėjimas bus apdorojamas saugiai per Stripe. Jūsų kortelės duomenys yra šifruojami ir saugomi.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Atšaukimo politika</h4>
              <p className="text-sm text-blue-700">
                Užsakymą galite atšaukti iki 24 valandų iki paslaugos pradžios be mokesčio.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Patvirtinimas</h4>
              <p className="text-sm text-green-700">
                Užsakymo patvirtinimas bus išsiųstas el. paštu.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={`flex justify-between pt-6 ${isMobile ? 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-[100] space-x-3' : ''}`}>
        <Button 
          variant="outline" 
          onClick={onPrev}
          className={isMobile ? 'flex-1' : ''}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Atgal
        </Button>
        <Button 
          size="lg"
          disabled={loading}
          onClick={onComplete}
          className={`flex items-center space-x-2 bg-green-600 hover:bg-green-700 ${isMobile ? 'flex-1' : ''}`}
        >
          <span>Patvirtinti ir mokėti</span>
          <CheckCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
