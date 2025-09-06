'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, Clock, Users, CreditCard, CheckCircle } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { ServiceProvider, Service, Pet, CreateBookingForm } from '@/types'
import { useAuth } from '@/contexts/auth-context'

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
    age: 24,
    weight: 30,
    specialNeeds: ['Anxiety medication'],
    medicalNotes: 'Allergic to certain shampoos',
    images: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    ownerId: 'user1',
    name: 'Whiskers',
    species: 'cat',
    breed: 'Persian',
    age: 36,
    weight: 4,
    specialNeeds: [],
    medicalNotes: 'Very calm and friendly',
    images: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

export const BookingModal = ({ isOpen, onClose, provider, service }: BookingModalProps) => {
  const { user } = useAuth()
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

  const handleInputChange = (field: keyof CreateBookingForm, value: any) => {
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

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return []
    
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof provider.availability
    const dayAvailability = provider.availability[dayName]
    
    if (!dayAvailability) return []
    
    // Handle different availability data structures
    if (Array.isArray(dayAvailability)) {
      return dayAvailability.filter(slot => slot.available)
    } else if (typeof dayAvailability === 'object' && dayAvailability !== null) {
      // Handle object format like { start: '09:00', end: '17:00', available: true }
      if ('available' in dayAvailability && dayAvailability.available) {
        return [dayAvailability]
      }
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
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
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
              <Label>Select Time</Label>
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
                  <SelectValue placeholder={selectedDate ? "Choose a time slot" : "Select a date first"} />
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
                      {selectedDate ? "No available time slots" : "Select a date first"}
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
              <Label>Select Pets</Label>
              <p className="text-sm text-gray-600 mb-4">
                Choose which pets will receive this service (max {service.maxPets})
              </p>
              <div className="space-y-3">
                {mockPets.map((pet) => (
                  <Card 
                    key={pet.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedPets.includes(pet.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handlePetSelection(pet.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded border-2 ${
                          selectedPets.includes(pet.id) 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedPets.includes(pet.id) && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{pet.name}</h4>
                          <p className="text-sm text-gray-600">
                            {pet.breed} • {pet.age} months • {pet.weight}kg
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
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special instructions or requests..."
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Provider</span>
                    <span className="font-medium">{provider.businessName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date & Time</span>
                    <span className="font-medium">
                      {new Date(formData.date).toLocaleDateString()} at {formData.timeSlot.start}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pets</span>
                    <span className="font-medium">
                      {selectedPets.length} pet{selectedPets.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Service Price</span>
                    <span className="font-medium">${service.price} × {selectedPets.length}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">${calculateTotal()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Method</h4>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Payment will be processed after service completion</span>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600">
                Your booking has been confirmed. You'll receive a confirmation email shortly.
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={onClose} className="w-full">
                Close
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
          <DialogTitle>Book {service.name}</DialogTitle>
          <DialogDescription>
            Complete your booking for {provider.businessName}
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
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button
              onClick={step === 3 ? handleSubmit : handleNext}
              disabled={
                loading ||
                (step === 1 && (!formData.date || !formData.timeSlot.start)) ||
                (step === 2 && selectedPets.length === 0)
              }
            >
              {loading ? 'Processing...' : step === 3 ? 'Confirm Booking' : 'Next'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
