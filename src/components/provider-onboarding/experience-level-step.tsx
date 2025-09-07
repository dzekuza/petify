'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { OnboardingData } from '@/types/onboarding'
import { ArrowLeft } from 'lucide-react'

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

  const handleExperienceSelect = (experienceId: string) => {
    setSelectedExperience(experienceId)
    setError('')
  }

  const handleNext = () => {
    if (!selectedExperience) {
      setError('Please select your experience level')
      return
    }

    onUpdate({ experience: selectedExperience })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">How much experience do you have?</h2>
        <p className="text-muted-foreground mt-2">
          Select the experience level that best describes your background
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {experienceLevels.map((level) => (
          <Card 
            key={level.id}
            className={`cursor-pointer transition-all hover:border-primary/50 ${
              selectedExperience === level.id
                ? 'ring-2 ring-primary border-primary bg-primary/5'
                : 'border-muted-foreground/25'
            }`}
            onClick={() => handleExperienceSelect(level.id)}
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

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <Button onClick={handleNext} disabled={!selectedExperience}>
          Continue
        </Button>
      </div>
    </div>
  )
}
