'use client'

import { useState } from 'react'
import { OnboardingData } from '@/types/onboarding'
import { PageLayout, PageContent } from './page-layout'
import BottomNavigation from './bottom-navigation'
import ExitButton from './exit-button'
import { Button } from '@/components/ui/button'
import { InputField, TextareaField } from '@/components/ui/input-field'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface BusinessInfoStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  isEditMode?: boolean
  onSave?: () => void
  onExitEdit?: () => void
}

export default function BusinessInfoStep({ data, onUpdate, onNext, onPrevious, isEditMode, onSave, onExitEdit }: BusinessInfoStepProps) {
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
    const basicValidation = data.businessName && 
           data.businessDescription && 
           data.phone
    
    // For adoption/ads providers, don't require pricing
    if (data.providerType === 'adoption') {
      const adoptionValidation = basicValidation
      
      // In edit mode, don't require terms and privacy acceptance
      if (isEditMode) {
        return adoptionValidation
      }
      
      // In new onboarding mode, require terms and privacy acceptance
      return adoptionValidation && termsAccepted && privacyAccepted
    }
    
    // For other providers, require pricing
    const pricingValidation = basicValidation && 
           data.basePrice > 0 &&
           data.pricePerHour > 0
    
    // In edit mode, don't require terms and privacy acceptance
    if (isEditMode) {
      return pricingValidation
    }
    
    // In new onboarding mode, require terms and privacy acceptance
    return pricingValidation && termsAccepted && privacyAccepted
  }

  return (
    <PageLayout>
      {/* Exit Button */}
      <ExitButton onExit={onExitEdit || (() => {})} isEditMode={isEditMode} />
      
      {/* Main Content */}
      <PageContent>
        <div className="w-full max-w-[522px]">
          <div className="flex flex-col gap-6 items-start justify-start">
              {/* Title */}
              <h1 className="text-3xl font-bold text-black w-full">
                Verslo informacija
              </h1>
              
              {/* Business Name */}
              <InputField
                id="businessName"
                label="Verslo pavadinimas"
                value={data.businessName}
                onChange={(e) => onUpdate({ businessName: e.target.value })}
                placeholder="Įveskite verslo pavadinimą"
                required
              />

              {/* Business Description */}
              <TextareaField
                id="businessDescription"
                label="Verslo aprašymas"
                value={data.businessDescription}
                onChange={(e) => onUpdate({ businessDescription: e.target.value })}
                placeholder="Aprašykite savo verslą ir paslaugas..."
                rows={4}
                required
              />

              {/* Phone */}
              <InputField
                id="phone"
                label="Telefono numeris"
                type="tel"
                value={data.phone}
                onChange={(e) => onUpdate({ phone: e.target.value })}
                placeholder="+370 600 00000"
                required
              />

              {/* Website */}
              <InputField
                id="website"
                label="Svetainė"
                type="url"
                value={data.website}
                onChange={(e) => onUpdate({ website: e.target.value })}
                placeholder="https://www.example.com"
                helperText="Neprivaloma"
              />

              {/* Pricing - Only show for non-adoption providers */}
              {data.providerType !== 'adoption' && (
                <div className="w-full space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      id="basePrice"
                      label="Minimali kaina (€)"
                      type="number"
                      value={data.basePrice || ''}
                      onChange={(e) => onUpdate({ basePrice: parseFloat(e.target.value) || 0 })}
                      placeholder="20"
                      min="0"
                      step="0.01"
                      required
                    />
                    <InputField
                      id="pricePerHour"
                      label="Maksimali kaina (€)"
                      type="number"
                      value={data.pricePerHour || ''}
                      onChange={(e) => onUpdate({ pricePerHour: parseFloat(e.target.value) || 0 })}
                      placeholder="50"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Terms and Privacy - Only show in new onboarding, not in edit mode */}
              {!isEditMode && (
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
              )}

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
      </PageContent>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentStep={5}
        totalSteps={8}
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!isFormValid()}
        isEditMode={isEditMode}
        onSave={onSave}
      />
    </PageLayout>
  )
}
