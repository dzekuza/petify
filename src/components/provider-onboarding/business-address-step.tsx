'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AddressAutocomplete from '@/components/address-autocomplete'
import { OnboardingData } from '@/app/provider/onboarding/page'
import { ArrowLeft } from 'lucide-react'

interface BusinessAddressStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

export function BusinessAddressStep({ data, onUpdate, onNext, onPrevious }: BusinessAddressStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNext = () => {
    const newErrors: Record<string, string> = {}

    if (!data.address.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!data.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!data.state.trim()) {
      newErrors.state = 'State/Region is required'
    }
    if (!data.zipCode.trim()) {
      newErrors.zipCode = 'Postal code is required'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      onNext()
    }
  }

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    onUpdate({ [field]: value })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <AddressAutocomplete
            value={data.address}
            onChange={(address) => handleInputChange('address', address)}
            onAddressSelect={(suggestion) => {
              handleInputChange('address', suggestion.address)
              handleInputChange('city', suggestion.city)
              handleInputChange('state', suggestion.state)
              handleInputChange('zipCode', suggestion.zipCode)
            }}
            placeholder="Business Address *"
            required
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && (
            <p className="text-sm text-red-500 mt-1">{errors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              value={data.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="City *"
              className={errors.city ? 'border-red-500' : ''}
            />
            {errors.city && (
              <p className="text-sm text-red-500 mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <Input
              value={data.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="State/Region *"
              className={errors.state ? 'border-red-500' : ''}
            />
            {errors.state && (
              <p className="text-sm text-red-500 mt-1">{errors.state}</p>
            )}
          </div>

          <div>
            <Input
              value={data.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              placeholder="Postal Code *"
              className={errors.zipCode ? 'border-red-500' : ''}
            />
            {errors.zipCode && (
              <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>
            )}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>This address will be shown to customers so they can find your business location.</p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} className="px-8">
          Continue
        </Button>
      </div>
    </div>
  )
}
