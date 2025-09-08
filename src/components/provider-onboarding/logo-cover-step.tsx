'use client'

import { useState } from 'react'
import { OnboardingData } from '@/types/onboarding'
import { OnboardingStepper } from './onboarding-stepper'

interface LogoCoverStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

export default function LogoCoverStep({ data, onUpdate, onNext, onPrevious }: LogoCoverStepProps) {
  const [coverImage, setCoverImage] = useState<File | null>(data.coverImage || null)
  const [logoImage, setLogoImage] = useState<File | null>(data.logoImage || null)

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
    onUpdate({ coverImage: null })
  }

  const removeLogoImage = () => {
    setLogoImage(null)
    onUpdate({ logoImage: null })
  }

  const isFormValid = () => {
    return coverImage && logoImage
  }

  return (
    <div className="bg-neutral-50 relative size-full min-h-screen flex flex-col" data-name="Logo and Cover">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-center min-h-full px-4 py-8 pb-20">
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
                      {coverImage ? (
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(coverImage)}
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
                      {logoImage ? (
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(logoImage)}
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
        </div>
      </div>

      {/* Stepper Component */}
      <OnboardingStepper
        currentStep={7}
        totalSteps={8}
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!isFormValid()}
      />
    </div>
  )
}
