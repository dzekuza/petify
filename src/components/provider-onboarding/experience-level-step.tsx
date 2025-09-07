'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { OnboardingData } from '@/types/onboarding'

interface ExperienceLevelStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const experienceLevels = [
  { id: '0-1', name: 'Beginner', description: '0-1 years of experience', years: 1 },
  { id: '2-3', name: 'Intermediate', description: '2-3 years of experience', years: 3 },
  { id: '4-5', name: 'Experienced', description: '4-5 years of experience', years: 5 },
  { id: '6-10', name: 'Expert', description: '6-10 years of experience', years: 8 },
  { id: '10+', name: 'Master', description: '10+ years of experience', years: 12 }
]

export default function ExperienceLevelStep({ data, onUpdate, onNext, onPrevious }: ExperienceLevelStepProps) {
  const [selectedExperience, setSelectedExperience] = useState(data.experience || '')
  const [error, setError] = useState('')


  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Select the experience level that best describes your background
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {experienceLevels.map((level) => (
          <Card 
            key={level.id}
            className={`cursor-pointer transition-all hover:border-primary/50 ${
              selectedExperience === level.id
                ? 'ring-2 ring-primary border-primary bg-primary/5'
                : 'border-muted-foreground/25'
            }`}
            onClick={() => {
              setSelectedExperience(level.id)
              setError('')
              onUpdate({ experience: level.id })
            }}
          >
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">{level.years}+</div>
                <div className="font-medium">{level.name}</div>
                <div className="text-sm text-muted-foreground">{level.description}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
