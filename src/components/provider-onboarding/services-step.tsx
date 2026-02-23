'use client'

import { useState } from 'react'
import { OnboardingData } from '@/types/onboarding'
import OnboardingLayout from './onboarding-layout'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

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
        { id: 'dogs', name: 'Šunys', description: 'Šunų veisimas ir pardavimas' },
        { id: 'cats', name: 'Katės', description: 'Kačių veisimas ir pardavimas' },
        { id: 'birds', name: 'Paukščiai', description: 'Paukščių veisimas ir pardavimas' },
        { id: 'small-animals', name: 'Smulkūs gyvūnai', description: 'Triušių, žiurkių ir kitų smulkių gyvūnų veisimas' },
        { id: 'exotic', name: 'Egzotiniai gyvūnai', description: 'Egzotinių gyvūnų veisimas ir pardavimas' }
      ]
    default:
      return [
        { id: 'general-service', name: 'General Service', description: 'General pet service' }
      ]
  }
}

export default function ServicesStep({ data, onUpdate, onNext, onPrevious, isEditMode, onSave, onExitEdit }: ServicesStepProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(data.services || [])
  const [customServices, setCustomServices] = useState<Array<{ id: string, name: string }>>([])
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

  const updateServiceDetails = (serviceId: string, patch: Partial<OnboardingData['serviceDetails'][0]>) => {
    const details = [...(data.serviceDetails || [])]
    const idx = details.findIndex(d => d.id === serviceId)
    const existing = idx >= 0 ? details[idx] : { id: serviceId, name: getServiceName(serviceId), description: '', price: '', locationId: undefined, gallery: [] }
    const updated = { ...existing, ...patch }
    if (idx >= 0) details[idx] = updated
    else details.push(updated)
    onUpdate({ serviceDetails: details })
  }

  const bottomNode = (
    <BottomNavigation
      currentStep={6}
      totalSteps={9}
      onNext={onNext}
      onPrevious={onPrevious}
      isNextDisabled={!isFormValid()}
      isEditMode={isEditMode}
      onSave={onSave}
    />
  )

  return (
    <OnboardingLayout maxWidth="wide" bottom={bottomNode}>
      <ExitButton onExit={onExitEdit || (() => { })} isEditMode={isEditMode} />
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-black">
            {data.providerType === 'adoption' ? 'Pasirinkite gyvūnų tipus' : 'Pasirinkite paslaugas'}
          </h1>
          <p className="text-muted-foreground">
            {data.providerType === 'adoption'
              ? 'Pasirinkite gyvūnų tipus, kuriuos veisiate ir parduosite'
              : 'Pasirinkite paslaugas, kurias teikiate savo klientams'
            }
          </p>

          {/* Available Services */}
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">
              {data.providerType === 'adoption' ? 'Galimi gyvūnų tipai' : 'Galimos paslaugos'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableServices.map((service) => (
                <div
                  key={service.id}
                  data-slot="card"
                  className={`bg-card text-card-foreground space-y-4 flex flex-col rounded-xl border duration-300 cursor-pointer transition-all ${selectedServices.includes(service.id)
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-black'
                    }`}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  <div data-slot="card-content" className="p-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="h-4 w-4 text-black accent-black"
                      />
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service details editor for selected services */}
          {selectedServices.length > 0 && (
            <div className="w-full mt-8">
              <h2 className="text-xl font-semibold mb-4">
                {data.providerType === 'adoption' ? 'Gyvūnų tipų detalizacija' : 'Paslaugų detalizacija'}
              </h2>
              <div className="space-y-6">
                {selectedServices.map((serviceId) => {
                  const details = getServiceDetailsById(serviceId)
                  return (
                    <div key={`details-${serviceId}`} data-slot="card" className="bg-card text-card-foreground space-y-4 flex flex-col rounded-xl transition-all duration-300 border-0">
                      <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-0">
                        <div data-slot="card-title" className="leading-none font-semibold">{getServiceName(serviceId)}</div>
                      </div>
                      <div data-slot="card-content" className="space-y-6 p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-6 p-0">
                            <div className="w-full space-y-2">
                              <label data-slot="label" className="flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-sm font-medium text-foreground">Aprašymas</label>
                              <textarea
                                data-slot="textarea"
                                className="border-neutral-200 placeholder:text-muted-foreground focus-visible:border-neutral-400 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 rounded-md border bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full resize-none"
                                placeholder={data.providerType === 'adoption' ? 'Trumpai apibūdinkite gyvūnų tipą ir veisimo ypatumus' : 'Trumpai apibūdinkite paslaugą'}
                                value={details?.description || ''}
                                onChange={(e) => updateServiceDetails(serviceId, { description: e.target.value })}
                              />
                            </div>

                            <div className="w-full space-y-2">
                              <label data-slot="label" className="flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-sm font-medium text-foreground">
                                {data.providerType === 'adoption' ? 'Kainų diapazonas (€)' : 'Kaina (€)'}
                              </label>
                              <input
                                data-slot="input"
                                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-neutral-200 h-10 min-w-0 rounded-lg border-2 bg-white px-4 py-2 text-base transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-neutral-400 hover:border-neutral-300 aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-full"
                                placeholder={data.providerType === 'adoption' ? 'pvz: 500-800' : 'Įveskite kainą'}
                                type="text"
                                value={details?.price || ''}
                                onChange={(e) => updateServiceDetails(serviceId, { price: e.target.value })}
                              />
                            </div>

                            {/* Breeding-specific fields */}
                            {data.providerType === 'adoption' && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <InputField
                                    label="Šuniukų skaičius (patinų)"
                                    type="number"
                                    value={details?.maleCount || ''}
                                    onChange={(e) => updateServiceDetails(serviceId, { maleCount: parseInt(e.target.value) || 0 })}
                                    placeholder="4"
                                  />
                                  <InputField
                                    label="Šuniukų skaičius (patelių)"
                                    type="number"
                                    value={details?.femaleCount || ''}
                                    onChange={(e) => updateServiceDetails(serviceId, { femaleCount: parseInt(e.target.value) || 0 })}
                                    placeholder="4"
                                  />
                                </div>

                                <Select
                                  value={details?.breed || ''}
                                  onValueChange={(v) => updateServiceDetails(serviceId, { breed: v })}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pasirinkite veislę" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="labradoodle">Labradoodle</SelectItem>
                                    <SelectItem value="goldendoodle">Goldendoodle</SelectItem>
                                    <SelectItem value="cockapoo">Cockapoo</SelectItem>
                                    <SelectItem value="maltipoo">Maltipoo</SelectItem>
                                    <SelectItem value="yorkipoo">Yorkipoo</SelectItem>
                                    <SelectItem value="schnoodle">Schnoodle</SelectItem>
                                    <SelectItem value="bernadoodle">Bernadoodle</SelectItem>
                                    <SelectItem value="australian-labradoodle">Australian Labradoodle</SelectItem>
                                    <SelectItem value="cavapoo">Cavapoo</SelectItem>
                                    <SelectItem value="shihpoo">Shihpoo</SelectItem>
                                    <SelectItem value="havanese">Havanese</SelectItem>
                                    <SelectItem value="bichon-frise">Bichon Frise</SelectItem>
                                    <SelectItem value="poodle">Poodle</SelectItem>
                                    <SelectItem value="labrador-retriever">Labrador Retriever</SelectItem>
                                    <SelectItem value="golden-retriever">Golden Retriever</SelectItem>
                                    <SelectItem value="cocker-spaniel">Cocker Spaniel</SelectItem>
                                    <SelectItem value="maltese">Maltese</SelectItem>
                                    <SelectItem value="yorkshire-terrier">Yorkshire Terrier</SelectItem>
                                    <SelectItem value="schnauzer">Schnauzer</SelectItem>
                                    <SelectItem value="bernese-mountain-dog">Bernese Mountain Dog</SelectItem>
                                    <SelectItem value="cavalier-king-charles-spaniel">Cavalier King Charles Spaniel</SelectItem>
                                    <SelectItem value="shih-tzu">Shih Tzu</SelectItem>
                                    <SelectItem value="french-bulldog">French Bulldog</SelectItem>
                                    <SelectItem value="english-bulldog">English Bulldog</SelectItem>
                                    <SelectItem value="pug">Pug</SelectItem>
                                    <SelectItem value="beagle">Beagle</SelectItem>
                                    <SelectItem value="german-shepherd">German Shepherd</SelectItem>
                                    <SelectItem value="rottweiler">Rottweiler</SelectItem>
                                    <SelectItem value="husky">Husky</SelectItem>
                                    <SelectItem value="border-collie">Border Collie</SelectItem>
                                    <SelectItem value="australian-shepherd">Australian Shepherd</SelectItem>
                                    <SelectItem value="jack-russell-terrier">Jack Russell Terrier</SelectItem>
                                    <SelectItem value="chihuahua">Chihuahua</SelectItem>
                                    <SelectItem value="dachshund">Dachshund</SelectItem>
                                    <SelectItem value="boxer">Boxer</SelectItem>
                                    <SelectItem value="doberman">Doberman</SelectItem>
                                    <SelectItem value="great-dane">Great Dane</SelectItem>
                                    <SelectItem value="mastiff">Mastiff</SelectItem>
                                    <SelectItem value="saint-bernard">Saint Bernard</SelectItem>
                                    <SelectItem value="newfoundland">Newfoundland</SelectItem>
                                    <SelectItem value="akita">Akita</SelectItem>
                                    <SelectItem value="shiba-inu">Shiba Inu</SelectItem>
                                    <SelectItem value="samoyed">Samoyed</SelectItem>
                                    <SelectItem value="malamute">Malamute</SelectItem>
                                    <SelectItem value="chow-chow">Chow Chow</SelectItem>
                                    <SelectItem value="dalmatian">Dalmatian</SelectItem>
                                    <SelectItem value="weimaraner">Weimaraner</SelectItem>
                                    <SelectItem value="vizsla">Vizsla</SelectItem>
                                    <SelectItem value="pointer">Pointer</SelectItem>
                                    <SelectItem value="setter">Setter</SelectItem>
                                    <SelectItem value="spaniel">Spaniel</SelectItem>
                                    <SelectItem value="retriever">Retriever</SelectItem>
                                    <SelectItem value="terrier">Terrier</SelectItem>
                                    <SelectItem value="hound">Hound</SelectItem>
                                    <SelectItem value="working-dog">Working Dog</SelectItem>
                                    <SelectItem value="herding-dog">Herding Dog</SelectItem>
                                    <SelectItem value="sporting-dog">Sporting Dog</SelectItem>
                                    <SelectItem value="non-sporting-dog">Non-Sporting Dog</SelectItem>
                                    <SelectItem value="toy-dog">Toy Dog</SelectItem>
                                    <SelectItem value="mixed-breed">Mixed Breed</SelectItem>
                                    <SelectItem value="other">Kita</SelectItem>
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={details?.generation || ''}
                                  onValueChange={(v) => updateServiceDetails(serviceId, { generation: v })}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Kartos tipas" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="f1">F1</SelectItem>
                                    <SelectItem value="f1b">F1B</SelectItem>
                                    <SelectItem value="f2">F2</SelectItem>
                                    <SelectItem value="f2b">F2B</SelectItem>
                                    <SelectItem value="multigen">Multigen</SelectItem>
                                    <SelectItem value="purebred">Grynakraujis</SelectItem>
                                  </SelectContent>
                                </Select>

                                <div className="grid grid-cols-2 gap-4">
                                  <InputField
                                    label="Amžius (savaitės)"
                                    type="number"
                                    value={details?.ageWeeks || ''}
                                    onChange={(e) => updateServiceDetails(serviceId, { ageWeeks: parseInt(e.target.value) || 0 })}
                                    placeholder="5"
                                  />
                                  <InputField
                                    label="Amžius (dienos)"
                                    type="number"
                                    value={details?.ageDays || ''}
                                    onChange={(e) => updateServiceDetails(serviceId, { ageDays: parseInt(e.target.value) || 0 })}
                                    placeholder="4"
                                  />
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-foreground">Paruošti išvežti</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {details?.readyToLeave ? format(new Date(details.readyToLeave), 'PPP') : 'Pasirinkite datą'}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={details?.readyToLeave ? new Date(details.readyToLeave) : undefined}
                                        onSelect={(date) => updateServiceDetails(serviceId, { readyToLeave: date?.toISOString() })}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-foreground mb-3 block">Sveikatos dokumentai</Label>
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`microchipped-${serviceId}`}
                                        checked={details?.microchipped || false}
                                        onCheckedChange={(checked) => updateServiceDetails(serviceId, { microchipped: checked === true })}
                                      />
                                      <Label htmlFor={`microchipped-${serviceId}`} className="text-sm">
                                        Mikročipas iki išvežimo
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`vaccinated-${serviceId}`}
                                        checked={details?.vaccinated || false}
                                        onCheckedChange={(checked) => updateServiceDetails(serviceId, { vaccinated: checked === true })}
                                      />
                                      <Label htmlFor={`vaccinated-${serviceId}`} className="text-sm">
                                        Skiepai atnaujinti
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`wormed-${serviceId}`}
                                        checked={details?.wormed || false}
                                        onCheckedChange={(checked) => updateServiceDetails(serviceId, { wormed: checked === true })}
                                      />
                                      <Label htmlFor={`wormed-${serviceId}`} className="text-sm">
                                        Išvaryti parazitai ir blusos
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`health-checked-${serviceId}`}
                                        checked={details?.healthChecked || false}
                                        onCheckedChange={(checked) => updateServiceDetails(serviceId, { healthChecked: checked === true })}
                                      />
                                      <Label htmlFor={`health-checked-${serviceId}`} className="text-sm">
                                        Veterinarijos sveikatos patikra
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`parents-tested-${serviceId}`}
                                        checked={details?.parentsTested || false}
                                        onCheckedChange={(checked) => updateServiceDetails(serviceId, { parentsTested: checked === true })}
                                      />
                                      <Label htmlFor={`parents-tested-${serviceId}`} className="text-sm">
                                        Tėvai sveikatos patikros
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`kc-registered-${serviceId}`}
                                        checked={details?.kcRegistered || false}
                                        onCheckedChange={(checked) => updateServiceDetails(serviceId, { kcRegistered: checked === true })}
                                      />
                                      <Label htmlFor={`kc-registered-${serviceId}`} className="text-sm">
                                        KC registracija iki išvežimo
                                      </Label>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                            {data.addresses?.length > 0 && (
                              <div className="space-y-2">
                                <label data-slot="label" className="flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-sm font-medium text-foreground">Vieta</label>
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

                          <div className="p-0">
                            <label data-slot="label" className="flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-sm font-medium text-foreground">Galerija</label>
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
                              <div className="w-full h-full">
                                <ImageUpload
                                  value={null}
                                  onChange={(file) => {
                                    if (!file) return
                                    const next = [...(details?.gallery || []), file]
                                    updateServiceDetails(serviceId, { gallery: next })
                                  }}
                                  placeholder="Įkelti nuotrauką"
                                  description="PNG/JPG iki 5MB"
                                  previewClassName="w-full h-full object-cover rounded-lg"
                                  className="w-full h-full border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer border-gray-300 hover:border-black"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Custom Services */}
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">
              {data.providerType === 'adoption' ? 'Pridėti kitą gyvūnų tipą' : 'Pridėti savo paslaugą'}
            </h2>
            <div className="flex space-x-2">
              <input
                data-slot="input"
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-neutral-200 h-10 w-full min-w-0 rounded-lg border-2 bg-white px-4 py-2 text-base transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-neutral-400 hover:border-neutral-300 aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex-1"
                value={newCustomService}
                onChange={(e) => setNewCustomService(e.target.value)}
                placeholder={data.providerType === 'adoption' ? 'Įveskite gyvūnų tipo pavadinimą' : 'Įveskite paslaugos pavadinimą'}
              />
              <button
                data-slot="button"
                data-variant="default"
                data-size="default"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-neutral-400 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3"
                onClick={handleAddCustomService}
                disabled={!newCustomService.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Pridėti
              </button>
            </div>
          </div>

          {/* Selected Custom Services */}
          {customServices.length > 0 && (
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-4">
                {data.providerType === 'adoption' ? 'Jūsų gyvūnų tipai' : 'Jūsų paslaugos'}
              </h2>
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
                {data.providerType === 'adoption'
                  ? `Pasirinkti gyvūnų tipai (${selectedServices.length})`
                  : `Pasirinktos paslaugos (${selectedServices.length})`
                }
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
    </OnboardingLayout>
  )
}
