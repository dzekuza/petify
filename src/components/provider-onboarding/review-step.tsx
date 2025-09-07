'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { OnboardingData } from '@/types/onboarding'
import { ArrowLeft, Check, MapPin, Phone, Globe, Clock, Euro } from 'lucide-react'
import Image from 'next/image'

interface ReviewStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const serviceTypeLabels: { [key: string]: string } = {
  grooming: 'Pet Grooming',
  veterinary: 'Veterinary Services',
  training: 'Pet Training',
  care: 'Pet Care',
  pairing: 'Pet Pairing',
  ads: 'Pet Ads'
}

const experienceLabels: { [key: string]: string } = {
  '0-1': 'Beginner (0-1 years)',
  '2-3': 'Intermediate (2-3 years)',
  '4-5': 'Experienced (4-5 years)',
  '6-10': 'Expert (6-10 years)',
  '10+': 'Master (10+ years)'
}

export default function ReviewStep({ data, onUpdate, onNext, onPrevious }: ReviewStepProps) {
  const [termsAccepted, setTermsAccepted] = useState(data.termsAccepted || false)
  const [privacyAccepted, setPrivacyAccepted] = useState(data.privacyAccepted || false)
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!termsAccepted || !privacyAccepted) {
      setError('Please accept the terms and conditions and privacy policy')
      return
    }

    onUpdate({ 
      termsAccepted,
      privacyAccepted
    })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Review your information</h2>
        <p className="text-muted-foreground mt-2">
          Please review all your information before publishing your listing
        </p>
      </div>

      {/* Business Information */}
      <Card className="py-6">
        <CardContent className="space-y-3">
          <CardTitle className="text-lg flex items-center mb-4">
            <Check className="w-5 h-5 mr-2 text-green-500" />
            Business Information
          </CardTitle>
          <div>
            <h4 className="font-medium">{data.businessName}</h4>
            <p className="text-sm text-muted-foreground">{data.businessDescription}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{data.address}, {data.city}, {data.state} {data.zipCode}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Information */}
      <Card className="py-6">
        <CardContent className="space-y-3">
          <CardTitle className="text-lg flex items-center mb-4">
            <Check className="w-5 h-5 mr-2 text-green-500" />
            Service Information
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{serviceTypeLabels[data.serviceType]}</Badge>
            <Badge variant="outline">{experienceLabels[data.experience]}</Badge>
          </div>
          <div>
            <h4 className="font-medium mb-2">Services Offered:</h4>
            <div className="flex flex-wrap gap-2">
              {data.services.map((service, index) => (
                <Badge key={index} variant="outline">{service}</Badge>
              ))}
            </div>
          </div>
          {data.certifications.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Certifications:</h4>
              <div className="flex flex-wrap gap-2">
                {data.certifications.map((cert, index) => (
                  <Badge key={index} variant="secondary">{cert}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing & Availability */}
      <Card className="py-6">
        <CardContent className="space-y-3">
          <CardTitle className="text-lg flex items-center mb-4">
            <Check className="w-5 h-5 mr-2 text-green-500" />
            Pricing & Availability
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Euro className="w-4 h-4 text-muted-foreground" />
              <span>Base Price: {data.currency} {data.basePrice}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Hourly Rate: {data.currency} {data.pricePerHour}</span>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Available Days:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.availability).map(([day, available]) => (
                available && (
                  <Badge key={day} variant="outline" className="capitalize">
                    {day}
                  </Badge>
                )
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Working Hours:</h4>
            <span className="text-sm text-muted-foreground">
              {data.workingHours.start} - {data.workingHours.end}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card className="py-6">
        <CardContent>
          <CardTitle className="text-lg flex items-center mb-4">
            <Check className="w-5 h-5 mr-2 text-green-500" />
            Photos ({data.photos.length})
          </CardTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.photos.slice(0, 4).map((photo, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                <Image
                  src={photo}
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

      {/* Terms and Conditions */}
      <Card className="py-6">
        <CardContent className="space-y-4">
          <CardTitle className="text-lg mb-4">Terms and Conditions</CardTitle>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(!!checked)}
              />
              <label htmlFor="terms" className="text-sm leading-relaxed">
                I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and 
                understand that I am responsible for providing quality services to customers.
              </label>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(!!checked)}
              />
              <label htmlFor="privacy" className="text-sm leading-relaxed">
                I agree to the <a href="#" className="text-primary hover:underline">Privacy Policy</a> and 
                consent to the processing of my personal data.
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <Button onClick={handleSubmit} disabled={!termsAccepted || !privacyAccepted}>
          Complete Registration
        </Button>
      </div>
    </div>
  )
}
