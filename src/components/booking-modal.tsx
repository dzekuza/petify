'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, CreditCard, CheckCircle } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ServiceProvider, Service, Pet, CreateBookingForm, TimeSlot } from '@/types'
import { t } from '@/lib/translations'
import Image from 'next/image'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  provider: ServiceProvider
  service: Service
}

// Mock pets data
const mockPets: Pet[] = [
  {
    id: '1',
    ownerId: 'user1',
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 2,
    weight: 30,
    specialNeeds: ['Anxiety medication'],
    medicalNotes: 'Allergic to certain shampoos',
    profilePicture: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&crop=face',
    galleryImages: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    ownerId: 'user1',
    name: 'Whiskers',
    species: 'cat',
    breed: 'Persian',
    age: 3,
    weight: 4,
    specialNeeds: [],
    medicalNotes: 'Very calm and friendly',
    profilePicture: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150&h=150&fit=crop&crop=face',
    galleryImages: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

export const BookingModal = ({ isOpen, onClose, provider, service }: BookingModalProps) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CreateBookingForm>({
    serviceId: service.id,
    date: '',
    timeSlot: { start: '', end: '', available: true },
    pets: [],
    notes: ''
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [selectedPets, setSelectedPets] = useState<string[]>([])

  const handleInputChange = (field: keyof CreateBookingForm, value: string | Date | TimeSlot) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePetSelection = (petId: string) => {
    setSelectedPets(prev => 
      prev.includes(petId) 
        ? prev.filter(id => id !== petId)
        : [...prev, petId]
    )
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setStep(4) // Success step
    }, 2000)
  }

  const getAvailableTimeSlots = (): TimeSlot[] => {
    if (!selectedDate) return []
    
    const dayName = selectedDate.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase() as keyof typeof provider.availability
    const dayAvailability = provider.availability[dayName]
    
    // Debug logging
    console.log('Selected date:', selectedDate)
    console.log('Day name:', dayName)
    console.log('Provider availability:', provider.availability)
    console.log('Day availability:', dayAvailability)
    
    if (!dayAvailability) return []
    
    // The availability should be an array of TimeSlot objects
    if (Array.isArray(dayAvailability)) {
      const availableSlots = dayAvailability.filter(slot => slot.available)
      console.log('Available slots:', availableSlots)
      return availableSlots
    }
    
    return []
  }

  const calculateTotal = () => {
    return service.price * selectedPets.length
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : t('provider.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      if (date) {
                        handleInputChange('date', date.toISOString().split('T')[0])
                      }
                    }}
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>{t('provider.selectTime')}</Label>
              <Select 
                value={formData.timeSlot.start} 
                onValueChange={(value) => {
                  const slot = getAvailableTimeSlots().find(s => s.start === value)
                  if (slot) {
                    handleInputChange('timeSlot', slot)
                  }
                }}
                disabled={!selectedDate}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={selectedDate ? t('provider.selectTimeSlot') : t('provider.selectTimeSlotFirst')} />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableTimeSlots().length > 0 ? (
                    getAvailableTimeSlots().map((slot, index) => (
                      <SelectItem key={index} value={slot.start}>
                        {slot.start} - {slot.end}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-slots" disabled>
                      {selectedDate ? t('provider.noAvailableTimeSlots') : t('provider.selectTimeSlotFirst')}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>{t('provider.selectPets')}</Label>
              <p className="text-sm text-gray-600 mb-4">
                {t('provider.selectPetsDescription', 'Pasirinkite, kurie gyvūnai gaus šią paslaugą (maks. {maxPets})').replace('{maxPets}', service.maxPets.toString())}
              </p>
              <div className="space-y-3">
                {mockPets.map((pet) => (
                  <Card 
                    key={pet.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedPets.includes(pet.id) 
                        ? 'border-black bg-gray-50' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handlePetSelection(pet.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded border-2 ${
                          selectedPets.includes(pet.id) 
                            ? 'border-black bg-black' 
                            : 'border-gray-300'
                        }`}>
                          {selectedPets.includes(pet.id) && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big w-3 h-3 text-white" aria-hidden="true">
                              <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                              <path d="m9 11 3 3L22 4"></path>
                            </svg>
                          )}
                        </div>
                        
                        {/* Pet Image */}
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {pet.profilePicture ? (
                            <Image
                              src={pet.profilePicture}
                              alt={pet.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-gray-500 text-lg font-medium">
                                {pet.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{pet.name}</h4>
                          <p className="text-sm text-gray-600">
                            {pet.breed} • {pet.age} years • {pet.weight}kg
                          </p>
                          {pet.specialNeeds && pet.specialNeeds.length > 0 && (
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                Special needs
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Papildomi komentarai (neprivaloma)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder={t('provider.specialInstructionsPlaceholder')}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('provider.bookingSummary')}</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('provider.serviceProvider')}</span>
                    <span className="font-medium">{provider.businessName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Data ir laikas</span>
                    <span className="font-medium">
                      {new Date(formData.date).toLocaleDateString()} {formData.timeSlot.start}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('provider.pets')}</span>
                    <span className="font-medium">
                      {selectedPets.length} {selectedPets.length === 1 ? t('provider.pet') : t('provider.petsPlural')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Paslaugos kaina</span>
                    <span className="font-medium">€{service.price} × {selectedPets.length}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{t('provider.total')}</span>
                      <span className="text-lg font-bold text-gray-900">€{calculateTotal()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">{t('provider.paymentMethod')}</h4>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{t('provider.paymentAfterService')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('provider.bookingConfirmed')}</h3>
              <p className="text-gray-600">
                {t('provider.bookingConfirmedDesc')}
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={onClose} className="w-full">
                {t('provider.close')}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('provider.bookService', 'Užsakyti {serviceName}').replace('{serviceName}', service.name)}</DialogTitle>
          <DialogDescription>
            {t('provider.completeBooking', 'Užbaikite savo užsakymą pas {providerName}').replace('{providerName}', provider.businessName)}
          </DialogDescription>
        </DialogHeader>

        {step < 4 && (
          <div className="mb-6">
            <div className="flex items-center w-full">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Date & Time</span>
              <span>Pets & Notes</span>
              <span>Confirmation</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {renderStepContent()}
        </div>

        {step < 4 && (
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={step === 1 ? onClose : handleBack}
              disabled={loading}
            >
              {step === 1 ? t('provider.cancel') : t('provider.back')}
            </Button>
            <Button
              onClick={step === 3 ? handleSubmit : handleNext}
              disabled={
                loading ||
                (step === 1 && (!formData.date || !formData.timeSlot.start)) ||
                (step === 2 && selectedPets.length === 0)
              }
            >
              {loading ? t('provider.processing') : step === 3 ? t('provider.confirmBookingFinal') : t('provider.next')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
