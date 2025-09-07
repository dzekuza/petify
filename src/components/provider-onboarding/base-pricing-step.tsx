'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OnboardingData } from '@/types/onboarding'

interface BasePricingStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

export function BasePricingStep({ data, onUpdate, onNext, onPrevious }: BasePricingStepProps) {
  const [error, setError] = useState('')


  const handlePriceChange = (value: string) => {
    const price = parseFloat(value) || 0
    onUpdate({ basePrice: price })
    if (error) setError('')
  }

  const handleCurrencyChange = (currency: string) => {
    onUpdate({ currency })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={data.basePrice || ''}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder={`Base Price (${data.currency}) *`}
            className={error ? 'border-red-500' : ''}
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>

        <div>
          <Select
            value={data.currency}
            onValueChange={handleCurrencyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        This is the minimum price for your main service. You can adjust this later based on demand and experience.
      </p>
    </div>
  )
}
