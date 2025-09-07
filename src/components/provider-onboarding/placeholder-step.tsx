'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface PlaceholderStepProps {
  title: string
  description: string
  onNext: () => void
  onPrevious: () => void
}

export function PlaceholderStep({ title, description, onNext, onPrevious }: PlaceholderStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
          <p className="text-sm text-muted-foreground mt-4">
            This step is coming soon...
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="px-8">
          Continue
        </Button>
      </div>
    </div>
  )
}
