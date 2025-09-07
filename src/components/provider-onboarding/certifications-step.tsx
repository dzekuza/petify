'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { OnboardingData } from '@/types/onboarding'
import { ArrowLeft, Plus, X } from 'lucide-react'

interface CertificationsStepProps {
  data: OnboardingData
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onPrevious: () => void
}

const commonCertifications = [
  'CPDT-KA (Certified Professional Dog Trainer)',
  'CPDT-KSA (Certified Professional Dog Trainer - Knowledge and Skills Assessed)',
  'CBCC-KA (Certified Behavior Consultant Canine)',
  'KPA-CTP (Karen Pryor Academy Certified Training Partner)',
  'IAABC (International Association of Animal Behavior Consultants)',
  'AVSAB (American Veterinary Society of Animal Behavior)',
  'Fear Free Certified Professional',
  'Low Stress Handling Certified',
  'Pet First Aid & CPR Certified',
  'Animal Behavior College Graduate',
  'Professional Grooming Certification',
  'Veterinary Assistant Certification',
  'Pet Care Professional Certification'
]

export default function CertificationsStep({ data, onUpdate, onNext, onPrevious }: CertificationsStepProps) {
  const [certifications, setCertifications] = useState<string[]>(data.certifications || [])
  const [newCertification, setNewCertification] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications(prev => [...prev, newCertification.trim()])
      setNewCertification('')
      setShowAddForm(false)
    }
  }

  const handleRemoveCertification = (certToRemove: string) => {
    setCertifications(prev => prev.filter(cert => cert !== certToRemove))
  }

  const handleSelectCommonCert = (cert: string) => {
    if (!certifications.includes(cert)) {
      setCertifications(prev => [...prev, cert])
    }
  }

  const handleNext = () => {
    onUpdate({ certifications })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Do you have any certifications?</h2>
        <p className="text-muted-foreground mt-2">
          Add your professional certifications and qualifications (optional)
        </p>
      </div>

      {/* Common Certifications */}
      <div>
        <h3 className="text-lg font-medium mb-3">Common Certifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {commonCertifications.map((cert) => (
            <Card 
              key={cert}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                certifications.includes(cert)
                  ? 'ring-2 ring-primary border-primary bg-primary/5'
                  : 'border-muted-foreground/25'
              }`}
              onClick={() => handleSelectCommonCert(cert)}
            >
              <CardContent className="p-3">
                <div className="text-sm">{cert}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Custom Certification */}
      <div>
        <h3 className="text-lg font-medium mb-3">Your Certifications</h3>
        
        {certifications.length > 0 && (
          <div className="space-y-2 mb-4">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">{cert}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCertification(cert)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {!showAddForm ? (
          <Button 
            variant="outline" 
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Certification</span>
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Input
              placeholder="Enter certification name"
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCertification()}
            />
            <Button onClick={handleAddCertification} disabled={!newCertification.trim()}>
              Add
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <Button onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}
