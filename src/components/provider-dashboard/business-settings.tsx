'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Scissors, 
  Stethoscope, 
  GraduationCap, 
  Heart, 
  Save
} from 'lucide-react'

interface GroomingPackage {
  name: string
  price: number
  duration: number
}

interface TrainingProgram {
  name: string
  price: number
  sessions: number
}

interface BusinessSettingsProps {
  businessType: string
  providerData: any
  onUpdate: (data: any) => void
}

export function GroomingSettings({ providerData, onUpdate }: BusinessSettingsProps) {
  const [settings, setSettings] = useState({
    appointmentDuration: providerData?.appointment_duration || 60,
    bufferTime: providerData?.buffer_time || 15,
    maxPetsPerAppointment: providerData?.max_pets_per_appointment || 1,
    groomingPackages: providerData?.grooming_packages || [
      { name: 'Basic Grooming', price: 25, duration: 45 },
      { name: 'Full Service', price: 45, duration: 90 },
      { name: 'Premium Package', price: 65, duration: 120 }
    ],
    equipment: providerData?.equipment || [],
    specializations: providerData?.specializations || []
  })

  const handleSave = () => {
    onUpdate(settings)
  }

  return null
}

export function VeterinarySettings({ providerData, onUpdate }: BusinessSettingsProps) {
  const [settings, setSettings] = useState({
    consultationDuration: providerData?.consultation_duration || 30,
    emergencyFee: providerData?.emergency_fee || 50,
    vaccinationReminders: providerData?.vaccination_reminders || true,
    prescriptionManagement: providerData?.prescription_management || true,
    medicalRecords: providerData?.medical_records || [],
    specialties: providerData?.specialties || []
  })

  const handleSave = () => {
    onUpdate(settings)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="h-5 w-5 mr-2 text-green-600" />
            Veterinary Settings
          </CardTitle>
          <CardDescription>
            Configure your veterinary practice parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="consultationDuration">Consultation Duration (minutes)</Label>
              <Input
                id="consultationDuration"
                type="number"
                value={settings.consultationDuration}
                onChange={(e) => setSettings(prev => ({ ...prev, consultationDuration: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="emergencyFee">Emergency Fee (€)</Label>
              <Input
                id="emergencyFee"
                type="number"
                value={settings.emergencyFee}
                onChange={(e) => setSettings(prev => ({ ...prev, emergencyFee: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Vaccination Reminders</Label>
                <p className="text-sm text-muted-foreground">Send automatic reminders for vaccinations</p>
              </div>
              <Switch
                checked={settings.vaccinationReminders}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, vaccinationReminders: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Prescription Management</Label>
                <p className="text-sm text-muted-foreground">Enable digital prescription tracking</p>
              </div>
              <Switch
                checked={settings.prescriptionManagement}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, prescriptionManagement: checked }))}
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Veterinary Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function TrainingSettings({ providerData, onUpdate }: BusinessSettingsProps) {
  const [settings, setSettings] = useState({
    sessionDuration: providerData?.session_duration || 60,
    groupSize: providerData?.group_size || 6,
    trainingPrograms: providerData?.training_programs || [
      { name: 'Basic Obedience', price: 80, sessions: 6 },
      { name: 'Behavior Modification', price: 120, sessions: 8 },
      { name: 'Advanced Training', price: 150, sessions: 10 }
    ],
    certifications: providerData?.certifications || []
  })

  const handleSave = () => {
    onUpdate(settings)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
            Training Settings
          </CardTitle>
          <CardDescription>
            Configure your training program parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionDuration">Session Duration (minutes)</Label>
              <Input
                id="sessionDuration"
                type="number"
                value={settings.sessionDuration}
                onChange={(e) => setSettings(prev => ({ ...prev, sessionDuration: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="groupSize">Max Group Size</Label>
              <Input
                id="groupSize"
                type="number"
                value={settings.groupSize}
                onChange={(e) => setSettings(prev => ({ ...prev, groupSize: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div>
            <Label>Training Programs</Label>
            <div className="space-y-2 mt-2">
              {settings.trainingPrograms.map((program: TrainingProgram, index: number) => (
                <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                  <Input
                    value={program.name}
                    onChange={(e) => {
                      const newPrograms = [...settings.trainingPrograms]
                      newPrograms[index].name = e.target.value
                      setSettings(prev => ({ ...prev, trainingPrograms: newPrograms }))
                    }}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={program.price}
                    onChange={(e) => {
                      const newPrograms = [...settings.trainingPrograms]
                      newPrograms[index].price = parseInt(e.target.value)
                      setSettings(prev => ({ ...prev, trainingPrograms: newPrograms }))
                    }}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">€</span>
                  <Input
                    type="number"
                    value={program.sessions}
                    onChange={(e) => {
                      const newPrograms = [...settings.trainingPrograms]
                      newPrograms[index].sessions = parseInt(e.target.value)
                      setSettings(prev => ({ ...prev, trainingPrograms: newPrograms }))
                    }}
                    className="w-16"
                  />
                  <span className="text-sm text-muted-foreground">sessions</span>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Training Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdoptionSettings({ providerData, onUpdate }: BusinessSettingsProps) {
  const [settings, setSettings] = useState({
    adoptionFee: providerData?.adoption_fee || 100,
    applicationProcess: providerData?.application_process || 'standard',
    homeVisitRequired: providerData?.home_visit_required || true,
    adoptionContract: providerData?.adoption_contract || true,
    followUpPeriod: providerData?.follow_up_period || 30
  })

  const handleSave = () => {
    onUpdate(settings)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-pink-600" />
            Breeding Settings
          </CardTitle>
          <CardDescription>
            Configure your breeding and sales process parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adoptionFee">Standard Sale Price (€)</Label>
              <Input
                id="adoptionFee"
                type="number"
                value={settings.adoptionFee}
                onChange={(e) => setSettings(prev => ({ ...prev, adoptionFee: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="followUpPeriod">Follow-up Period (days)</Label>
              <Input
                id="followUpPeriod"
                type="number"
                value={settings.followUpPeriod}
                onChange={(e) => setSettings(prev => ({ ...prev, followUpPeriod: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="applicationProcess">Application Process</Label>
            <Select
              value={settings.applicationProcess}
              onValueChange={(value) => setSettings(prev => ({ ...prev, applicationProcess: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Application</SelectItem>
                <SelectItem value="detailed">Detailed Application</SelectItem>
                <SelectItem value="interview">Interview Required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Home Visit Required</Label>
                <p className="text-sm text-muted-foreground">Require home visit before sale</p>
              </div>
              <Switch
                checked={settings.homeVisitRequired}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, homeVisitRequired: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Sales Contract</Label>
                <p className="text-sm text-muted-foreground">Require signed sales contract</p>
              </div>
              <Switch
                checked={settings.adoptionContract}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, adoptionContract: checked }))}
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Breeding Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function BusinessSettings({ businessType, providerData, onUpdate }: BusinessSettingsProps) {
  switch (businessType) {
    case 'grooming':
      return <GroomingSettings providerData={providerData} onUpdate={onUpdate} businessType={businessType} />
    case 'veterinary':
      return <VeterinarySettings providerData={providerData} onUpdate={onUpdate} businessType={businessType} />
    case 'training':
      return <TrainingSettings providerData={providerData} onUpdate={onUpdate} businessType={businessType} />
    case 'adoption':
      return <AdoptionSettings providerData={providerData} onUpdate={onUpdate} businessType={businessType} />
    default:
      return null
  }
}
