'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OnboardingData } from '@/types/onboarding'

interface HourlyRateStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

export default function HourlyRateStep({ data, onUpdate, onNext, onPrevious }: HourlyRateStepProps) {
  const [pricePerHour, setPricePerHour] = useState(data.pricePerHour || 0)
  const [currency, setCurrency] = useState(data.currency || 'EUR')
  const [error, setError] = useState('')


  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Set your hourly rate for extended services or consultations
        </p>
      </div>

      <div className="max-w-md space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Hourly Rate</label>
          <div className="flex space-x-2">
            <Select value={currency} onValueChange={(value) => {
              setCurrency(value)
              onUpdate({ pricePerHour, currency: value })
            }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0"
              value={pricePerHour || ''}
              onChange={(e) => {
                const value = Number(e.target.value)
                setPricePerHour(value)
                setError('')
                onUpdate({ pricePerHour: value, currency })
              }}
              className="flex-1"
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>This rate applies to:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Extended consultations</li>
            <li>Additional services beyond base price</li>
            <li>Training sessions</li>
            <li>Emergency services</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

    </div>
  )
}
