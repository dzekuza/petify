'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import AddressAutocomplete from '@/components/address-autocomplete'
import { OnboardingData } from '@/types/onboarding'

interface Step1BusinessDetailsProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
}

export function Step1BusinessDetails({ data, onUpdate, onNext }: Step1BusinessDetailsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (!data.businessName.trim()) {
      newErrors.businessName = 'Business name is required'
    }

    if (!data.businessDescription.trim()) {
      newErrors.businessDescription = 'Business description is required'
    }

    if (!data.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

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
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      onNext()
    }
  }

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    onUpdate({ [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Input
            id="businessName"
            value={data.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="Business Name *"
            className={errors.businessName ? 'border-red-500' : ''}
          />
          {errors.businessName && (
            <p className="text-sm text-red-500 mt-1">{errors.businessName}</p>
          )}
        </div>

        <div>
          <Textarea
            id="businessDescription"
            value={data.businessDescription}
            onChange={(e) => handleInputChange('businessDescription', e.target.value)}
            placeholder="Business Description *"
            rows={4}
            className={errors.businessDescription ? 'border-red-500' : ''}
          />
          {errors.businessDescription && (
            <p className="text-sm text-red-500 mt-1">{errors.businessDescription}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Phone Number *"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <Input
              id="website"
              type="url"
              value={data.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="Website (Optional)"
            />
          </div>
        </div>

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
              id="city"
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
              id="state"
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
              id="zipCode"
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
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} className="px-8">
          Continue
        </Button>
      </div>
    </div>
  )
}
