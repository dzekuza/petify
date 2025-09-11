'use client'

import { useState } from 'react'
import { OnboardingData } from '@/types/onboarding'
import { PageLayout, PageContent } from './page-layout'
import BottomNavigation from './bottom-navigation'
import ExitButton from './exit-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { TextareaField } from '@/components/ui/input-field'
import { InputField } from '@/components/ui/input-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'

interface ServicesStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  isEditMode?: boolean
  onSave?: () => void
  onExitEdit?: () => void
}

const getBusinessTypeServices = (businessType: string) => {
  switch (businessType) {
    case 'grooming':
      return [
        { id: 'basic-bath', name: 'Paprastas maudymas', description: 'Paprastas plovimas ir džiovinimas' },
        { id: 'full-grooming', name: 'Pilnas kirpimas ir priežiūra', description: 'Pilna kirpimo ir priežiūros paslauga' },
        { id: 'nail-trimming', name: 'Nagų kirpimas', description: 'Profesionali nagų priežiūra' },
        { id: 'ear-cleaning', name: 'Ausų valymas', description: 'Ausų higienos paslauga' },
        { id: 'teeth-cleaning', name: 'Dantų valymas', description: 'Dantų higienos paslauga' }
      ]
    case 'veterinary':
      return [
        { id: 'consultation', name: 'General Consultation', description: 'Health check-up and consultation' },
        { id: 'vaccination', name: 'Vaccination', description: 'Vaccination services' },
        { id: 'surgery', name: 'Surgery', description: 'Surgical procedures' },
        { id: 'emergency', name: 'Emergency Care', description: '24/7 emergency services' },
        { id: 'dental', name: 'Dental Care', description: 'Dental treatments' }
      ]
    case 'training':
      return [
        { id: 'basic-obedience', name: 'Basic Obedience', description: 'Basic training commands' },
        { id: 'behavior-modification', name: 'Behavior Modification', description: 'Correcting behavioral issues' },
        { id: 'advanced-training', name: 'Advanced Training', description: 'Advanced training programs' },
        { id: 'puppy-training', name: 'Puppy Training', description: 'Training for young dogs' },
        { id: 'agility-training', name: 'Agility Training', description: 'Agility and sports training' }
      ]
    case 'boarding':
      return [
        { id: 'overnight-boarding', name: 'Overnight Boarding', description: 'Overnight pet care' },
        { id: 'day-care', name: 'Day Care', description: 'Daytime pet care' },
        { id: 'extended-stay', name: 'Extended Stay', description: 'Long-term boarding' },
        { id: 'luxury-suite', name: 'Luxury Suite', description: 'Premium boarding experience' },
        { id: 'medical-boarding', name: 'Medical Boarding', description: 'Specialized medical care' }
      ]
    case 'adoption':
      return [
        { id: 'pet-adoption', name: 'Pet Adoption', description: 'Pet adoption services' },
        { id: 'foster-care', name: 'Foster Care', description: 'Temporary foster placement' },
        { id: 'rescue-services', name: 'Rescue Services', description: 'Animal rescue operations' },
        { id: 'rehoming', name: 'Rehoming', description: 'Pet rehoming assistance' }
      ]
    default:
      return [
        { id: 'general-service', name: 'General Service', description: 'General pet service' }
      ]
  }
}

export default function ServicesStep({ data, onUpdate, onNext, onPrevious, isEditMode, onSave, onExitEdit }: ServicesStepProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(data.services || [])
  const [customServices, setCustomServices] = useState<Array<{id: string, name: string}>>([])
  const [newCustomService, setNewCustomService] = useState('')

  const availableServices = getBusinessTypeServices(data.providerType)

  const handleServiceToggle = (serviceId: string) => {
    const newSelected = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId]
    
    setSelectedServices(newSelected)
    onUpdate({ services: newSelected })

    // Ensure serviceDetails entry exists when selecting
    if (!selectedServices.includes(serviceId)) {
      const details = data.serviceDetails || []
      if (!details.find(d => d.id === serviceId)) {
        const serviceName = availableServices.find(s => s.id === serviceId)?.name ||
          customServices.find(s => s.id === serviceId)?.name || serviceId
        onUpdate({
          serviceDetails: [...details, { id: serviceId, name: serviceName, description: '', price: '', locationId: undefined, gallery: [] }]
        })
      }
    } else {
      // If deselected, remove from serviceDetails
      const details = (data.serviceDetails || []).filter(d => d.id !== serviceId)
      onUpdate({ serviceDetails: details })
    }
  }

  const handleAddCustomService = () => {
    if (newCustomService.trim()) {
      const customId = `custom-${Date.now()}`
      const newCustom = { id: customId, name: newCustomService.trim() }
      setCustomServices(prev => [...prev, newCustom])
      setSelectedServices(prev => [...prev, customId])
      onUpdate({ services: [...selectedServices, customId] })
      setNewCustomService('')
    }
  }

  const handleRemoveCustomService = (serviceId: string) => {
    setCustomServices(prev => prev.filter(s => s.id !== serviceId))
    setSelectedServices(prev => prev.filter(id => id !== serviceId))
    onUpdate({ services: selectedServices.filter(id => id !== serviceId) })
  }

  const isFormValid = () => {
    return selectedServices.length > 0
  }

  const getServiceName = (serviceId: string) => {
    return availableServices.find(s => s.id === serviceId)?.name ||
      customServices.find(s => s.id === serviceId)?.name || serviceId
  }

  const getServiceDetailsById = (serviceId: string) => {
    return (data.serviceDetails || []).find(d => d.id === serviceId)
  }

  const updateServiceDetails = (serviceId: string, patch: Partial<{ description: string; price: string; locationId?: string; gallery: File[] }>) => {
    const details = [...(data.serviceDetails || [])]
    const idx = details.findIndex(d => d.id === serviceId)
    const existing = idx >= 0 ? details[idx] : { id: serviceId, name: getServiceName(serviceId), description: '', price: '', locationId: undefined, gallery: [] }
    const updated = { ...existing, ...patch }
    if (idx >= 0) details[idx] = updated
    else details.push(updated)
    onUpdate({ serviceDetails: details })
  }

  return (
    <PageLayout>
      {/* Exit Button */}
      <ExitButton onExit={onExitEdit || (() => {})} isEditMode={isEditMode} />
      
      {/* Main Content */}
      <PageContent>
        <div className="w-full max-w-4xl">
          <div className="flex flex-col gap-6 items-start justify-start">
            {/* Title */}
            <h1 className="text-3xl font-bold text-black">
              Pasirinkite paslaugas
            </h1>
            <p className="text-gray-600">
              Pasirinkite paslaugas, kurias teikiate savo klientams
            </p>

            {/* Available Services */}
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-4">Galimos paslaugos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableServices.map((service) => (
                  <Card 
                    key={service.id}
                    className={`cursor-pointer transition-all ${
                      selectedServices.includes(service.id)
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-black'
                    }`}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={() => handleServiceToggle(service.id)}
                          className="h-4 w-4 text-black accent-black"
                        />
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Service details editor for selected services */}
            {selectedServices.length > 0 && (
              <div className="w-full mt-8">
                <h2 className="text-xl font-semibold mb-4">Paslaugų detalizacija</h2>
                <div className="space-y-6">
                  {selectedServices.map((serviceId) => {
                    const details = getServiceDetailsById(serviceId)
                    return (
                      <Card key={`details-${serviceId}`} className="border-gray-200">
                        <CardHeader>
                          <CardTitle>{getServiceName(serviceId)}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                              <TextareaField
                                label="Aprašymas"
                                value={details?.description || ''}
                                onChange={(e) => updateServiceDetails(serviceId, { description: e.target.value })}
                                placeholder="Trumpai apibūdinkite paslaugą"
                              />
                              <InputField
                                label="Kaina (€)"
                                type="number"
                                value={details?.price || ''}
                                min="0"
                                step="0.01"
                                onChange={(e) => updateServiceDetails(serviceId, { price: e.target.value })}
                                placeholder="Įveskite kainą"
                              />
                              {data.addresses?.length > 0 && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Vieta</Label>
                                  <Select
                                    value={details?.locationId || ''}
                                    onValueChange={(v) => updateServiceDetails(serviceId, { locationId: v })}
                                  >
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Priskirti vietą" /></SelectTrigger>
                                    <SelectContent>
                                      {data.addresses.map((addr) => (
                                        <SelectItem key={addr.id} value={addr.id}>{addr.address}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Galerija</Label>
                              <div className="flex flex-wrap gap-3 mt-2">
                                {(details?.gallery || []).map((file, idx) => (
                                  <div key={idx} className="relative">
                                    <img src={URL.createObjectURL(file)} alt="" className="w-24 h-24 object-cover rounded-lg" />
                                    <button
                                      type="button"
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                      onClick={() => {
                                        const next = [...(details?.gallery || [])]
                                        next.splice(idx, 1)
                                        updateServiceDetails(serviceId, { gallery: next })
                                      }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                                <ImageUpload
                                  value={null}
                                  onChange={(file) => {
                                    if (!file) return
                                    const next = [ ...(details?.gallery || []), file ]
                                    updateServiceDetails(serviceId, { gallery: next })
                                  }}
                                  placeholder="Įkelti nuotrauką"
                                  description="PNG/JPG iki 5MB"
                                  previewClassName="w-full h-full object-cover rounded-lg"
                                  className="w-full h-full"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Custom Services */}
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-4">Pridėti savo paslaugą</h2>
              <div className="flex space-x-2">
                <Input
                  value={newCustomService}
                  onChange={(e) => setNewCustomService(e.target.value)}
                  placeholder="Įveskite paslaugos pavadinimą"
                  className="flex-1"
                />
                <Button onClick={handleAddCustomService} disabled={!newCustomService.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Pridėti
                </Button>
              </div>
            </div>

            {/* Selected Custom Services */}
            {customServices.length > 0 && (
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-4">Jūsų paslaugos</h2>
                <div className="space-y-2">
                  {customServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{service.name}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCustomService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Services Summary */}
            {selectedServices.length > 0 && (
              <div className="w-full bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">
                  Pasirinktos paslaugos ({selectedServices.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((serviceId) => {
                    const service = availableServices.find(s => s.id === serviceId) || 
                                   customServices.find(s => s.id === serviceId)
                    return service ? (
                      <span key={serviceId} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {service.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContent>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentStep={6}
        totalSteps={9}
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!isFormValid()}
        isEditMode={isEditMode}
        onSave={onSave}
      />
    </PageLayout>
  )
}
