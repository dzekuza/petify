'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { OnboardingData } from '@/types/onboarding'
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface PhotosStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

export default function PhotosStep({ data, onUpdate, onNext, onPrevious }: PhotosStepProps) {
  const [photos, setPhotos] = useState<string[]>(data.photos || [])
  const [profilePhoto, setProfilePhoto] = useState(data.profilePhoto || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (files: FileList | null, isProfile = false) => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          if (isProfile) {
            setProfilePhoto(result)
            onUpdate({ profilePhoto: result })
          } else {
            const updatedPhotos = [...photos, result]
            setPhotos(updatedPhotos)
            onUpdate({ photos: updatedPhotos })
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index)
    setPhotos(updatedPhotos)
    onUpdate({ photos: updatedPhotos })
  }

  const handleRemoveProfilePhoto = () => {
    setProfilePhoto('')
    onUpdate({ profilePhoto: '' })
  }


  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Upload photos that showcase your services and help customers understand what you offer
        </p>
      </div>

      {/* Profile Photo */}
      <Card className="py-6">
        <CardContent>
          <CardTitle className="text-lg mb-4">Profile Photo</CardTitle>
          <div className="flex items-center space-x-4">
            {profilePhoto ? (
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={profilePhoto}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveProfilePhoto}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <Button
                variant="outline"
                onClick={() => profileInputRef.current?.click()}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>{profilePhoto ? 'Change Photo' : 'Upload Photo'}</span>
              </Button>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files, true)}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Photos */}
      <Card className="py-6">
        <CardContent>
          <CardTitle className="text-lg mb-4">Service Photos</CardTitle>
          
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Upload photos</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop images here, or click to select files
            </p>
            <Button variant="outline" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Choose Files</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Photo Grid */}
          {photos.length > 0 && (
            <div className="mt-6">
              <CardTitle className="text-lg mb-4">
                Uploaded Photos ({photos.length})
              </CardTitle>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={photo}
                        alt={`Service photo ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Tips */}
      <Card className="py-6">
        <CardContent>
          <CardTitle className="text-lg mb-4">Photo Tips</CardTitle>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Use high-quality, well-lit photos</p>
            <p>• Show your workspace, equipment, or before/after results</p>
            <p>• Include photos of happy pets and satisfied customers</p>
            <p>• Upload at least 3-5 photos to showcase your services</p>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
