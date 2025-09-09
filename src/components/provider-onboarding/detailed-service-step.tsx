'use client'

import { useState } from 'react'
import { OnboardingData } from '@/types/onboarding'
import { PageLayout, PageContent } from './page-layout'
import BottomNavigation from './bottom-navigation'
import ExitButton from './exit-button'
import { Button } from '@/components/ui/button'
import { InputField, TextareaField } from '@/components/ui/input-field'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DetailedServiceStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  isEditMode?: boolean
  onSave?: () => void
  onExitEdit?: () => void
}

interface DetailedService {
  id: string
  name: string
  description: string
  duration: string
  price: string
  gallery: File[]
}

const serviceDurations = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 val.' },
  { value: '90', label: '1.5 val.' },
  { value: '120', label: '2 val.' },
  { value: '180', label: '3 val.' },
  { value: '240', label: '4 val.' },
  { value: '480', label: '8 val.' }
]

export default function DetailedServiceStep({ data, onUpdate, onNext, onPrevious, isEditMode, onSave, onExitEdit }: DetailedServiceStepProps) {
  const [services, setServices] = useState<DetailedService[]>(
    data.detailedServices && data.detailedServices.length > 0 
      ? data.detailedServices 
      : [{ id: '1', name: '', description: '', duration: '', price: '', gallery: [] }]
  )

  const handleServiceChange = (index: number, field: keyof DetailedService, value: string | File[]) => {
    const newServices = [...services]
    newServices[index] = { ...newServices[index], [field]: value }
    setServices(newServices)
    
    // Update onboarding data
    onUpdate({ 
      detailedServices: newServices
    })
  }

  const addAnotherService = () => {
    const newService: DetailedService = {
      id: (services.length + 1).toString(),
      name: '',
      description: '',
      duration: '',
      price: '',
      gallery: []
    }
    setServices([...services, newService])
  }

  const removeService = (index: number) => {
    if (services.length > 1) {
      const newServices = services.filter((_, i) => i !== index)
      setServices(newServices)
    }
  }

  const handleFileUpload = (index: number, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      handleServiceChange(index, 'gallery', [...services[index].gallery, ...fileArray])
    }
  }

  const removeFile = (serviceIndex: number, fileIndex: number) => {
    const newServices = [...services]
    newServices[serviceIndex].gallery.splice(fileIndex, 1)
    setServices(newServices)
    onUpdate({ detailedServices: newServices })
  }

  const isFormValid = () => {
    return services.every(service => 
      service.name && 
      service.description && 
      service.duration && 
      service.price
    )
  }

  return (
    <PageLayout>
      {/* Exit Button */}
      <ExitButton onExit={onExitEdit || (() => {})} isEditMode={isEditMode} />
      
      {/* Main Content */}
      <PageContent>
        <div className="w-full max-w-[522px]">
          <div className="flex flex-col gap-6 items-start justify-start">
            {/* Title */}
            <h1 className="text-3xl font-bold text-black w-full">
              Pridėkite paslaugą
            </h1>
              
              {/* Services Forms */}
              <div className="flex flex-col gap-6 w-full">
                {services.map((service, index) => (
                  <div key={service.id} className="flex flex-col gap-4 w-full">
                    {index > 0 && (
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Paslauga {index + 1}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeService(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Pašalinti
                        </Button>
                      </div>
                    )}
                    
                    {/* Service Name */}
                    <InputField
                      id={`serviceName-${index}`}
                      label="Paslaugos pavadinimas"
                      value={service.name}
                      onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                      placeholder="Įveskite paslaugos pavadinimą"
                      required
                    />
                    
                    {/* Service Description */}
                    <TextareaField
                      id={`serviceDescription-${index}`}
                      label="Paslaugos aprašymas"
                      value={service.description}
                      onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                      placeholder="Aprašykite paslaugą..."
                      rows={3}
                      required
                    />
                    
                    {/* Duration and Price */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select
                          value={service.duration}
                          onValueChange={(value) => handleServiceChange(index, 'duration', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Paslaugos teikimo laikas" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceDurations.map((duration) => (
                              <SelectItem key={duration.value} value={duration.value}>
                                {duration.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <InputField
                          id={`servicePrice-${index}`}
                          label="Kaina (€)"
                          type="number"
                          value={service.price}
                          onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                          placeholder="20.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Gallery Upload */}
                    <div className="space-y-2">
                      <Label>Pridėkite darbų galeriją</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleFileUpload(index, e.target.files)}
                          className="hidden"
                          id={`gallery-${index}`}
                        />
                        <label
                          htmlFor={`gallery-${index}`}
                          className="cursor-pointer block"
                        >
                          <div className="text-gray-600 mb-2">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600">
                            Paspauskite arba nuvilkite nuotraukas čia
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF iki 10MB
                          </p>
                        </label>
                      </div>
                      
                      {/* Display uploaded files */}
                      {service.gallery.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {service.gallery.map((file, fileIndex) => (
                            <div key={fileIndex} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${fileIndex + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeFile(index, fileIndex)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add Another Service Button */}
                <Button 
                  variant="default"
                  onClick={addAnotherService}
                  className="bg-black hover:bg-gray-800 w-fit"
                >
                  Pridėti naują paslaugą
                </Button>
              </div>
            </div>
          </div>
      </PageContent>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentStep={5}
        totalSteps={8}
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!isFormValid()}
        isEditMode={isEditMode}
        onSave={onSave}
      />
    </PageLayout>
  )
}