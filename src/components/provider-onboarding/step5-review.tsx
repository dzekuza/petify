'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OnboardingData } from '@/app/provider/onboarding/page'
import { ArrowLeft, Check, MapPin, Phone, Globe, Clock, Euro } from 'lucide-react'
import Image from 'next/image'

interface Step5ReviewProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onSubmit: () => void
  onPrevious: () => void
  loading: boolean
  error: string
}

const serviceTypeLabels: Record<string, string> = {
  grooming: 'Pet Grooming',
  veterinary: 'Veterinary Care',
  boarding: 'Pet Boarding',
  training: 'Pet Training',
  walking: 'Dog Walking',
  sitting: 'Pet Sitting'
}

const experienceLabels: Record<string, string> = {
  beginner: 'Less than 1 year',
  intermediate: '1-3 years',
  experienced: '3-5 years',
  expert: '5+ years'
}

export function Step5Review({ data, onUpdate, onSubmit, onPrevious, loading, error }: Step5ReviewProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (!data.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the Terms of Service'
    }

    if (!data.privacyAccepted) {
      newErrors.privacyAccepted = 'You must accept the Privacy Policy'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateStep()) {
      onSubmit()
    }
  }

  const handleTermsChange = (checked: boolean) => {
    onUpdate({ termsAccepted: checked })
    if (errors.termsAccepted) {
      setErrors(prev => ({ ...prev, termsAccepted: '' }))
    }
  }

  const handlePrivacyChange = (checked: boolean) => {
    onUpdate({ privacyAccepted: checked })
    if (errors.privacyAccepted) {
      setErrors(prev => ({ ...prev, privacyAccepted: '' }))
    }
  }

  const availableDays = Object.entries(data.availability)
    .filter(([_, available]) => available)
    .map(([day, _]) => day.charAt(0).toUpperCase() + day.slice(1))

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Review Your Information</h3>
          <p className="text-sm text-muted-foreground">
            Please review all your information before publishing your listing
          </p>
        </div>

        {/* Business Information */}
        <Card className="py-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Check className="w-5 h-5 mr-2 text-green-500" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium">{data.businessName}</h4>
              <p className="text-sm text-muted-foreground">{data.businessDescription}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{data.address}, {data.city}, {data.state} {data.zipCode}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{data.phone}</span>
              </div>
              {data.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span>{data.website}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Information */}
        <Card className="py-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Check className="w-5 h-5 mr-2 text-green-500" />
              Service Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{serviceTypeLabels[data.serviceType]}</Badge>
              <Badge variant="outline">{experienceLabels[data.experience]}</Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">Services Offered:</h4>
              <div className="flex flex-wrap gap-2">
                {data.services.map((service) => (
                  <Badge key={service} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
            {data.certifications.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Certifications:</h4>
                <div className="flex flex-wrap gap-2">
                  {data.certifications.map((cert) => (
                    <Badge key={cert} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing & Availability */}
        <Card className="py-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Check className="w-5 h-5 mr-2 text-green-500" />
              Pricing & Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Euro className="w-4 h-4 text-muted-foreground" />
                <span>Base Price: {data.currency} {data.basePrice}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Euro className="w-4 h-4 text-muted-foreground" />
                <span>Hourly Rate: {data.currency} {data.pricePerHour}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Available: {availableDays.join(', ')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Hours: {data.workingHours.start} - {data.workingHours.end}</span>
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card className="py-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Check className="w-5 h-5 mr-2 text-green-500" />
              Photos ({data.photos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.photos.slice(0, 4).map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={URL.createObjectURL(photo)}
                    alt={`Service photo ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {data.photos.length > 4 && (
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">
                    +{data.photos.length - 4} more
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terms and Conditions */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle className="text-lg">Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={data.termsAccepted}
                onCheckedChange={handleTermsChange}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I agree to the{' '}
                  <a href="/terms" className="text-primary hover:underline" target="_blank">
                    Terms of Service
                  </a>{' '}
                  and understand my responsibilities as a service provider
                </Label>
                {errors.termsAccepted && (
                  <p className="text-sm text-red-500 mt-1">{errors.termsAccepted}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacy"
                checked={data.privacyAccepted}
                onCheckedChange={handlePrivacyChange}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="privacy" className="text-sm cursor-pointer">
                  I agree to the{' '}
                  <a href="/privacy" className="text-primary hover:underline" target="_blank">
                    Privacy Policy
                  </a>{' '}
                  and consent to the processing of my personal data
                </Label>
                {errors.privacyAccepted && (
                  <p className="text-sm text-red-500 mt-1">{errors.privacyAccepted}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 py-6">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={loading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          className="px-8"
          disabled={loading || !data.termsAccepted || !data.privacyAccepted}
        >
          {loading ? 'Publishing...' : 'Publish Listing'}
        </Button>
      </div>
    </div>
  )
}
