'use client'

import { useState } from 'react'
import { OnboardingData } from '@/types/onboarding'
import { OnboardingStepper } from './onboarding-stepper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface BusinessInfoStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

export default function BusinessInfoStep({ data, onUpdate, onNext, onPrevious }: BusinessInfoStepProps) {
  const [termsAccepted, setTermsAccepted] = useState(data.termsAccepted || false)
  const [privacyAccepted, setPrivacyAccepted] = useState(data.privacyAccepted || false)

  const handleTermsChange = (checked: boolean) => {
    setTermsAccepted(checked)
    onUpdate({ termsAccepted: checked })
  }

  const handlePrivacyChange = (checked: boolean) => {
    setPrivacyAccepted(checked)
    onUpdate({ privacyAccepted: checked })
  }

  const isFormValid = () => {
    return data.businessName && 
           data.businessDescription && 
           data.phone && 
           termsAccepted && 
           privacyAccepted
  }

  return (
    <div className="bg-neutral-50 relative size-full min-h-screen flex flex-col" data-name="Business Info">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-center min-h-full px-4 py-8 pb-20">
          <div className="w-full max-w-[522px]">
            <div className="flex flex-col gap-6 items-start justify-start">
              {/* Title */}
              <h1 className="text-3xl font-bold text-black w-full">
                Verslo informacija
              </h1>
              
              {/* Business Name */}
              <div className="w-full">
                <Label htmlFor="businessName">Verslo pavadinimas *</Label>
                <Input
                  id="businessName"
                  value={data.businessName}
                  onChange={(e) => onUpdate({ businessName: e.target.value })}
                  placeholder="Įveskite verslo pavadinimą"
                />
              </div>

              {/* Business Description */}
              <div className="w-full">
                <Label htmlFor="businessDescription">Verslo aprašymas *</Label>
                <Textarea
                  id="businessDescription"
                  value={data.businessDescription}
                  onChange={(e) => onUpdate({ businessDescription: e.target.value })}
                  placeholder="Aprašykite savo verslą ir paslaugas..."
                  rows={4}
                />
              </div>

              {/* Phone */}
              <div className="w-full">
                <Label htmlFor="phone">Telefono numeris *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => onUpdate({ phone: e.target.value })}
                  placeholder="+370 600 00000"
                />
              </div>

              {/* Website */}
              <div className="w-full">
                <Label htmlFor="website">Svetainė (neprivaloma)</Label>
                <Input
                  id="website"
                  type="url"
                  value={data.website}
                  onChange={(e) => onUpdate({ website: e.target.value })}
                  placeholder="https://www.example.com"
                />
              </div>

              {/* Terms and Privacy */}
              <div className="w-full space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={handleTermsChange}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    Sutinku su{' '}
                    <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
                      naudojimo sąlygomis
                    </a>
                    {' '}ir{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                      privatumo politika
                    </a>
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={privacyAccepted}
                    onCheckedChange={handlePrivacyChange}
                  />
                  <Label htmlFor="privacy" className="text-sm leading-relaxed">
                    Sutinku, kad mano duomenys būtų naudojami paslaugų teikimui ir klientų aptarnavimui
                  </Label>
                </div>
              </div>

              {/* Info Box */}
              <div className="w-full bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Ką toliau?</h3>
                <p className="text-sm text-blue-800">
                  Po registracijos jūsų profilis bus peržiūrėtas ir patvirtintas. 
                  Patvirtinus galėsite pradėti teikti paslaugas klientams.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Component */}
      <OnboardingStepper
        currentStep={10}
        totalSteps={12}
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!isFormValid()}
        nextText="Peržiūrėti"
      />
    </div>
  )
}
