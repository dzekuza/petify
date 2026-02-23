'use client'

import { useState } from 'react'
import { OnboardingData } from '@/types/onboarding'
import OnboardingLayout from './onboarding-layout'
import BottomNavigation from './bottom-navigation'
import ExitButton from './exit-button'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/input-field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'

interface ServiceDetailsStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  isEditMode?: boolean
  onSave?: () => void
  onExitEdit?: () => void
}

const experienceOptions = [
  { value: '0-1', label: '0-1 metai' },
  { value: '1-3', label: '1-3 metai' },
  { value: '3-5', label: '3-5 metai' },
  { value: '5-10', label: '5-10 metai' },
  { value: '10+', label: '10+ metai' }
]

const commonCertifications = [
  'Veterinarijos licencija',
  'Gyvūnų šukavimo sertifikatas',
  'Gyvūnų treniravimo sertifikatas',
  'Pirmosios pagalbos sertifikatas',
  'Gyvūnų elgsenos specialistas',
  'Gyvūnų psichologijos sertifikatas',
  'Gyvūnų masazo terapija',
  'Gyvūnų fizioterapija'
]

export default function ServiceDetailsStep({ data, onUpdate, onNext, onPrevious, isEditMode, onSave, onExitEdit }: ServiceDetailsStepProps) {
  const [newCertification, setNewCertification] = useState('')
  const [customCertifications, setCustomCertifications] = useState<string[]>(data.certifications || [])

  const handleCertificationAdd = (cert: string) => {
    if (cert && !customCertifications.includes(cert)) {
      const updated = [...customCertifications, cert]
      setCustomCertifications(updated)
      onUpdate({ certifications: updated })
    }
  }

  const handleCertificationRemove = (cert: string) => {
    const updated = customCertifications.filter(c => c !== cert)
    setCustomCertifications(updated)
    onUpdate({ certifications: updated })
  }

  const handleCommonCertificationToggle = (cert: string) => {
    if (customCertifications.includes(cert)) {
      handleCertificationRemove(cert)
    } else {
      handleCertificationAdd(cert)
    }
  }

  const isFormValid = () => {
    // Pricing is no longer required; only require experience to proceed
    return Boolean(data.experience)
  }

  return (
    <OnboardingLayout
      bottom={
        <BottomNavigation
          currentStep={9}
          totalSteps={12}
          onNext={onNext}
          onPrevious={onPrevious}
          isNextDisabled={!isFormValid()}
          isEditMode={isEditMode}
          onSave={onSave}
        />
      }
    >
      <ExitButton onExit={onExitEdit || (() => {})} isEditMode={isEditMode} />
      <div className="w-full max-w-[720px] mx-auto">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-black">Paslaugų detalės</h1>
              
              {/* Experience */}
              <div className="w-full">
                <Label htmlFor="experience">Patirtis</Label>
                <Select
                  value={data.experience}
                  onValueChange={(value) => onUpdate({ experience: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite savo patirtį" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing removed per requirements */}

              {/* Certifications */}
              <div className="w-full">
                <Label>Certifikatai ir licencijos</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Pasirinkite arba pridėkite savo sertifikatus ir licencijas
                </p>
                
                {/* Common Certifications */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Dažniausi sertifikatai:</h3>
                  <div className="flex flex-wrap gap-2">
                    {commonCertifications.map((cert) => (
                      <Badge
                        key={cert}
                        variant={customCertifications.includes(cert) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleCommonCertificationToggle(cert)}
                      >
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Custom Certifications */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Pridėkite savo sertifikatą"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleCertificationAdd(newCertification)
                          setNewCertification('')
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleCertificationAdd(newCertification)
                        setNewCertification('')
                      }}
                      disabled={!newCertification.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Display selected certifications */}
                  {customCertifications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customCertifications.map((cert) => (
                        <Badge key={cert} variant="default" className="flex items-center gap-1">
                          {cert}
                          <button
                            type="button"
                            onClick={() => handleCertificationRemove(cert)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
