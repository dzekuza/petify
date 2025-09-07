'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { OnboardingData } from '@/types/onboarding'
import { ArrowLeft, Upload, X, Camera, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface Step4PhotosProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

export function Step4Photos({ data, onUpdate, onNext, onPrevious }: Step4PhotosProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    )
    
    if (newFiles.length > 0) {
      // Convert files to URLs
      const newFileUrls = newFiles.map(file => URL.createObjectURL(file))
      onUpdate({
        photos: [...data.photos, ...newFileUrls]
      })
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleProfilePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const fileUrl = URL.createObjectURL(file)
      onUpdate({
        profilePhoto: fileUrl
      })
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = data.photos.filter((_, i) => i !== index)
    onUpdate({ photos: newPhotos })
  }

  const removeProfilePhoto = () => {
    onUpdate({ profilePhoto: undefined })
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openProfileDialog = () => {
    profileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      {/* Profile Photo Section */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Profile Photo</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Add a professional photo of yourself (optional but recommended)
          </p>
        </div>

        <Card className="py-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {data.profilePhoto ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden">
                    <Image
                      src={data.profilePhoto}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={removeProfilePhoto}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Button
                  variant="outline"
                  onClick={openProfileDialog}
                  className="mb-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {data.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG up to 10MB
                </p>
              </div>
            </div>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePhoto}
              className="hidden"
            />
          </CardContent>
        </Card>
      </div>

      {/* Service Photos Section */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Service Photos</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Add photos that showcase your work and facilities (minimum 3 photos)
          </p>
        </div>

        {/* Upload Area */}
        <Card className="py-6">
          <CardContent className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Drag and drop photos here
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse files
              </p>
              <Button onClick={openFileDialog} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Choose Photos
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG up to 10MB each
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Photo Grid */}
        {data.photos.length > 0 && (
          <Card className="py-6">
            <CardContent>
              <CardTitle className="text-lg mb-4">
                Uploaded Photos ({data.photos.length})
              </CardTitle>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={photo}
                        alt={`Service photo ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200 py-6">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">Photo Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use good lighting and clear, high-quality images</li>
            <li>• Show your workspace, equipment, and happy pets</li>
            <li>• Include before/after photos if applicable</li>
            <li>• Avoid blurry or dark photos</li>
            <li>• Photos help customers trust your services</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onNext} 
          className="px-8"
          disabled={data.photos.length < 3}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
