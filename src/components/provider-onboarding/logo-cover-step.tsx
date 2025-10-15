'use client'

import { useState } from 'react'
import { ImageUpload } from '@/components/ui/image-upload'
import { OnboardingData } from '@/types/onboarding'
import OnboardingLayout from './onboarding-layout'
import BottomNavigation from './bottom-navigation'
import ExitButton from './exit-button'

interface LogoCoverStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
  isEditMode?: boolean
  onSave?: () => void
  onExitEdit?: () => void
}

export default function LogoCoverStep({ data, onUpdate, onNext, onPrevious, isEditMode, onSave, onExitEdit }: LogoCoverStepProps) {
  const [coverImage, setCoverImage] = useState<File | null>(data.coverImage || null)
  const [logoImage, setLogoImage] = useState<File | null>(data.logoImage || null)
  const [coverImageUrl, setCoverImageUrl] = useState<string>(data.coverImageUrl || '')
  const [logoImageUrl, setLogoImageUrl] = useState<string>(data.logoImageUrl || '')

  const handleCoverUpload = (files: FileList | null) => {
    if (files && files[0]) {
      setCoverImage(files[0])
      onUpdate({ coverImage: files[0] })
    }
  }

  const handleLogoUpload = (files: FileList | null) => {
    if (files && files[0]) {
      setLogoImage(files[0])
      onUpdate({ logoImage: files[0] })
    }
  }

  const removeCoverImage = () => {
    setCoverImage(null)
    setCoverImageUrl('')
    onUpdate({ coverImage: null, coverImageUrl: '' })
  }

  const removeLogoImage = () => {
    setLogoImage(null)
    setLogoImageUrl('')
    onUpdate({ logoImage: null, logoImageUrl: '' })
  }

  const isFormValid = () => {
    // In edit mode, allow existing URLs or new files
    if (isEditMode) {
      return (coverImage || coverImageUrl) && (logoImage || logoImageUrl)
    }
    // In new mode, require files
    return coverImage && logoImage
  }

  return (
    <OnboardingLayout
      bottom={
        <BottomNavigation
          currentStep={8}
          totalSteps={9}
          onNext={onNext}
          onPrevious={onPrevious}
          isNextDisabled={!isFormValid()}
          nextText="Baigti"
          isEditMode={isEditMode}
          onSave={onSave}
        />
      }
    >
        <div className="w-full max-w-[720px] mx-auto">
            <div className="flex flex-col gap-6">
              {/* Title */}
              <h1 className="text-3xl font-bold text-black w-full">
                Pridėkite viršelio nuotrauką ir įmonės logotipą
              </h1>
              
              {/* Upload Forms */}
              <div className="flex flex-col gap-4 w-full">
                {/* Cover Image Upload */}
                <div>
                  <ImageUpload
                    value={coverImage || null}
                    onChange={(file) => {
                      if (!file) {
                        removeCoverImage()
                        return
                      }
                      setCoverImage(file)
                      onUpdate({ coverImage: file })
                    }}
                    placeholder="Įkelti viršelio nuotrauką"
                    description="PNG/JPG iki 10MB"
                    previewClassName="w-full h-32 object-cover rounded-lg"
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <ImageUpload
                    value={logoImage || null}
                    onChange={(file) => {
                      if (!file) {
                        removeLogoImage()
                        return
                      }
                      setLogoImage(file)
                      onUpdate({ logoImage: file })
                    }}
                    placeholder="Įkelti logotipą"
                    description="PNG/JPG/SVG iki 5MB"
                    previewClassName="w-24 h-24 object-contain rounded-lg mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
    </OnboardingLayout>
  )
}
