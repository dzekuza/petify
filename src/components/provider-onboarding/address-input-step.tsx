'use client'

import { useState } from 'react'
import { OnboardingData } from '@/types/onboarding'
import { OnboardingStepper } from './onboarding-stepper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AddressAutocomplete from '@/components/address-autocomplete'
import Map, { Marker } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

interface AddressInputStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

interface Address {
  id: string
  address: string
  city: string
  zipCode: string
  coordinates?: { lat: number; lng: number }
}

export default function AddressInputStep({ data, onUpdate, onNext, onPrevious }: AddressInputStepProps) {
  const [addresses, setAddresses] = useState<Address[]>(
    data.addresses && data.addresses.length > 0 
      ? data.addresses 
      : [{ id: '1', address: '', city: '', zipCode: '' }]
  )
  const [currentAddressIndex, setCurrentAddressIndex] = useState(0)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)

  const handleAddressChange = (index: number, field: keyof Address, value: string) => {
    const newAddresses = [...addresses]
    newAddresses[index] = { ...newAddresses[index], [field]: value }
    setAddresses(newAddresses)
    
    // Update onboarding data
    onUpdate({ 
      addresses: newAddresses,
      address: newAddresses[0]?.address || '',
      city: newAddresses[0]?.city || '',
      zipCode: newAddresses[0]?.zipCode || ''
    })
  }

  const handleAddressAutocomplete = async (index: number, fullAddress: string, city: string, zipCode: string) => {
    const newAddresses = [...addresses]
    newAddresses[index] = { 
      ...newAddresses[index], 
      address: fullAddress,
      city: city,
      zipCode: zipCode
    }
    setAddresses(newAddresses)
    
    // Geocode the address to get coordinates
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&country=LT&limit=1`
      )
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center
        newAddresses[index].coordinates = { lat, lng }
        setAddresses(newAddresses)
        
        // Update map center if this is the current address being edited
        if (index === currentAddressIndex) {
          setMapCenter({ lat, lng })
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
    
    // Update onboarding data
    onUpdate({ 
      addresses: newAddresses,
      address: newAddresses[0]?.address || '',
      city: newAddresses[0]?.city || '',
      zipCode: newAddresses[0]?.zipCode || ''
    })
  }

  const addAnotherAddress = () => {
    const newAddress: Address = {
      id: (addresses.length + 1).toString(),
      address: '',
      city: '',
      zipCode: ''
    }
    setAddresses([...addresses, newAddress])
    setCurrentAddressIndex(addresses.length) // Set to the new address
  }

  const selectAddressForEditing = (index: number) => {
    setCurrentAddressIndex(index)
    if (addresses[index].coordinates) {
      setMapCenter(addresses[index].coordinates!)
    }
  }

  const removeAddress = (index: number) => {
    if (addresses.length > 1) {
      const newAddresses = addresses.filter((_, i) => i !== index)
      setAddresses(newAddresses)
    }
  }

  const isFormValid = () => {
    return addresses.every(addr => addr.address && addr.city && addr.zipCode)
  }

  return (
    <div className="bg-neutral-50 relative size-full min-h-screen flex flex-col" data-name="Address Input">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-center min-h-full px-4 py-8 pb-20">
          <div className="w-full max-w-6xl">
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-start">
              {/* Left Side - Address Forms */}
              <div className="flex-1 max-w-[522px]">
                <div className="flex flex-col gap-6 items-start justify-start">
                  {/* Title */}
                  <h1 className="text-3xl font-bold text-black w-full">
                    Kur klientai jus gali surasti?
                  </h1>
                  
                  {/* Address Forms */}
                  <div className="flex flex-col gap-4 w-full">
                    {addresses.map((address, index) => (
                      <div key={address.id} className="w-full">
                        {index > 0 && (
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Adresas {index + 1}</h3>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeAddress(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Pašalinti
                            </Button>
                          </div>
                        )}
                        
                        {/* Show summary for completed addresses, full form for current */}
                        {address.address && address.city && address.zipCode && index !== currentAddressIndex ? (
                          <div 
                            className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-gray-300 transition-colors"
                            onClick={() => selectAddressForEditing(index)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{address.address}</p>
                                <p className="text-sm text-gray-600">{address.city}, {address.zipCode}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                Redaguoti
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 w-full">
                            {/* Address Input */}
                            <div className="space-y-2">
                              <AddressAutocomplete
                                value={address.address}
                                onChange={(value) => handleAddressChange(index, 'address', value)}
                                onAddressSelect={(suggestion) => handleAddressAutocomplete(index, suggestion.address, suggestion.city, suggestion.zipCode)}
                                placeholder="Įveskite adresą"
                                label=""
                                className="w-full"
                              />
                            </div>
                            
                            {/* City and Zip Code */}
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Input
                                  id={`zipCode-${index}`}
                                  value={address.zipCode}
                                  onChange={(e) => handleAddressChange(index, 'zipCode', e.target.value)}
                                  placeholder="Pašto kodas"
                                />
                              </div>
                              <div className="flex-1">
                                <Input
                                  id={`city-${index}`}
                                  value={address.city}
                                  onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                                  placeholder="Miestas"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Add Another Address Button */}
                    <Button 
                      variant="default"
                      onClick={addAnotherAddress}
                      className="bg-black hover:bg-gray-800 w-fit"
                    >
                      Pridėti dar vieną adresą
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Map */}
              <div className="flex-1 max-w-[500px]">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: '400px' }}>
                  {mapCenter ? (
                    <Map
                      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                      initialViewState={{
                        longitude: mapCenter.lng,
                        latitude: mapCenter.lat,
                        zoom: 15
                      }}
                      style={{ width: '100%', height: '100%' }}
                      mapStyle="mapbox://styles/mapbox/streets-v12"
                    >
                      <Marker longitude={mapCenter.lng} latitude={mapCenter.lat}>
                        <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </Marker>
                    </Map>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <p className="text-lg font-medium">Žemėlapis</p>
                        <p className="text-sm">Įveskite adresą, kad pamatytumėte vietą žemėlapyje</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Component */}
      <OnboardingStepper
        currentStep={4}
        totalSteps={7}
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!isFormValid()}
      />
    </div>
  )
}
