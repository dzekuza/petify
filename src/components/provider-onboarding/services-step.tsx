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
        { id: 'basic-bath', name: 'Basic Bath', description: 'Basic washing and drying' },
        { id: 'full-grooming', name: 'Full Grooming', description: 'Complete grooming service' },
        { id: 'nail-trimming', name: 'Nail Trimming', description: 'Professional nail care' },
        { id: 'ear-cleaning', name: 'Ear Cleaning', description: 'Ear hygiene service' },
        { id: 'teeth-cleaning', name: 'Teeth Cleaning', description: 'Dental hygiene service' }
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
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={() => handleServiceToggle(service.id)}
                          className="h-4 w-4 text-blue-600"
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
