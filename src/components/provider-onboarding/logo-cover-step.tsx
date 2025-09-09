'use client'

import { useState } from 'react'
import { OnboardingData } from '@/types/onboarding'
import { PageLayout, PageContent } from './page-layout'
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
    <PageLayout>
      {/* Exit Button */}
      <ExitButton onExit={onExitEdit || (() => {})} isEditMode={isEditMode} />
      
      {/* Main Content */}
      <PageContent>
        <div className="w-full max-w-[522px]">
            <div className="flex flex-col gap-6 items-start justify-start">
              {/* Title */}
              <h1 className="text-3xl font-bold text-black w-full">
                Pridėkite viršelio nuotrauką ir įmonės logotipą
              </h1>
              
              {/* Upload Forms */}
              <div className="flex flex-col gap-4 w-full">
                {/* Cover Image Upload */}
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCoverUpload(e.target.files)}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="cursor-pointer block"
                    >
                      {(coverImage || coverImageUrl) ? (
                        <div className="relative">
                          <img
                            src={coverImage ? URL.createObjectURL(coverImage) : coverImageUrl}
                            alt="Cover preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              removeCoverImage()
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-gray-600 mb-2">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600">
                            Paspauskite arba nuvilkite viršelio nuotrauką čia
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF iki 10MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e.target.files)}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer block"
                    >
                      {(logoImage || logoImageUrl) ? (
                        <div className="relative">
                          <img
                            src={logoImage ? URL.createObjectURL(logoImage) : logoImageUrl}
                            alt="Logo preview"
                            className="w-24 h-24 object-contain rounded-lg mx-auto"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              removeLogoImage()
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-gray-600 mb-2">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600">
                            Paspauskite arba nuvilkite logotipą čia
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, SVG iki 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </PageContent>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentStep={8}
        totalSteps={8}
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!isFormValid()}
        nextText="Baigti"
        isEditMode={isEditMode}
        onSave={onSave}
      />
    </PageLayout>
  )
}
