'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { OnboardingData } from '@/types/onboarding'
import { ArrowLeft, Plus, X, MapPin } from 'lucide-react'

interface ServiceAreasStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

export default function ServiceAreasStep({ data, onUpdate, onNext, onPrevious }: ServiceAreasStepProps) {
  const [serviceAreas, setServiceAreas] = useState<string[]>(data.services || [])
  const [newArea, setNewArea] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddArea = () => {
    if (newArea.trim() && !serviceAreas.includes(newArea.trim())) {
      setServiceAreas(prev => [...prev, newArea.trim()])
      setNewArea('')
      setShowAddForm(false)
    }
  }

  const handleRemoveArea = (areaToRemove: string) => {
    setServiceAreas(prev => prev.filter(area => area !== areaToRemove))
  }

  const handleNext = () => {
    onUpdate({ services: serviceAreas })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Where do you provide services?</h2>
        <p className="text-muted-foreground mt-2">
          Add the areas where you can provide your services
        </p>
      </div>

      {/* Service Areas List */}
      <div>
        <h3 className="text-lg font-medium mb-3">Service Areas</h3>
        
        {serviceAreas.length > 0 ? (
          <div className="space-y-2 mb-4">
            {serviceAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{area}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveArea(area)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No service areas added yet</p>
          </div>
        )}

        {!showAddForm ? (
          <Button 
            variant="outline" 
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service Area</span>
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Input
              placeholder="Enter city, neighborhood, or area"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddArea()}
            />
            <Button onClick={handleAddArea} disabled={!newArea.trim()}>
              Add
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <Button onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}
