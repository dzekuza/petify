'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import AddressAutocomplete from '@/components/address-autocomplete'
import { OnboardingData } from '@/types/onboarding'

interface BusinessAddressStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

export function BusinessAddressStep({ data, onUpdate, onNext, onPrevious }: BusinessAddressStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})


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

    </div>
  )
}
