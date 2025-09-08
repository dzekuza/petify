'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import AddressAutocomplete from '@/components/address-autocomplete'
import { 
  Award,
  CheckCircle,
  Star,
  Users,
  DollarSign
} from 'lucide-react'
import { t } from '@/lib/translations'

const serviceCategories = [
  { value: 'grooming', label: 'Pet Grooming' },
  { value: 'veterinary', label: 'Veterinary Care' },
  { value: 'boarding', label: 'Pet Boarding' },
  { value: 'training', label: 'Pet Training' },
  { value: 'walking', label: 'Dog Walking' },
  { value: 'sitting', label: 'Pet Sitting' },
]

const benefits = [
  {
    icon: Users,
    title: 'Reach More Customers',
    description: 'Connect with pet owners in your area looking for your services'
  },
  {
    icon: DollarSign,
    title: 'Increase Revenue',
    description: 'Grow your business with our platform and marketing tools'
  },
  {
    icon: Star,
    title: 'Build Your Reputation',
    description: 'Collect reviews and build trust with the pet owner community'
  },
  {
    icon: Award,
    title: 'Professional Tools',
    description: 'Access booking management, scheduling, and customer communication tools'
  }
]

export default function ProviderSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    services: [] as string[],
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    experience: '',
    certifications: [] as string[],
    priceRange: { min: '', max: '' },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    }
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: string, value: string | number | boolean | object) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // For demo purposes, we'll simulate the signup process
      // In a real app, you'd call your API to create the provider profile
      // and update the user's role in the database
      
      // Simulate API call to create provider profile
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In a real app, you would:
      // 1. Create the provider profile in your database with proper geocoding
      // 2. Update the user's role to 'provider'
      // 3. Set up their initial services and availability
      
      // For demo, we'll just redirect to dashboard
      // The protected route will allow access since we bypassed the role check
      router.push('/provider/dashboard')
    } catch (error) {
      console.error('Error creating provider account:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Enter your business name"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Business Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell us about your business and services..."
                className="mt-1"
                rows={4}
                required
              />
            </div>

            <div>
              <Label>Services You Offer *</Label>
              <p className="text-sm text-gray-600 mb-3">Select all services you provide</p>
              <div className="grid grid-cols-2 gap-3">
                {serviceCategories.map((category) => (
                  <div
                    key={category.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.services.includes(category.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleServiceToggle(category.value)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.services.includes(category.value)}
                        onChange={() => handleServiceToggle(category.value)}
                      />
                      <span className="text-sm font-medium">{category.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <AddressAutocomplete
              value={formData.address}
              onChange={(address) => handleInputChange('address', address)}
              onAddressSelect={(suggestion) => {
                handleInputChange('address', suggestion.address)
                handleInputChange('city', suggestion.city)
                handleInputChange('state', suggestion.state)
                handleInputChange('zipCode', suggestion.zipCode)
              }}
              placeholder="Enter your business address"
              label="Business Address"
              required
              className="mt-1"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State/Region *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State/Region"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="zipCode">Postal Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="Postal Code"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="experience">Years of Experience *</Label>
              <Select 
                value={formData.experience} 
                onValueChange={(value) => handleInputChange('experience', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0-1 years</SelectItem>
                  <SelectItem value="2-5">2-5 years</SelectItem>
                  <SelectItem value="6-10">6-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Price Range ({t('common.perService')})</Label>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <div>
                  <Input
                    type="number"
                    placeholder="Min price"
                    value={formData.priceRange.min}
                    onChange={(e) => handleInputChange('priceRange', { ...formData.priceRange, min: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Max price"
                    value={formData.priceRange.max}
                    onChange={(e) => handleInputChange('priceRange', { ...formData.priceRange, max: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Availability</Label>
              <p className="text-sm text-gray-600 mb-3">Select the days you&apos;re available</p>
              <div className="space-y-3">
                {Object.entries(formData.availability).map(([day, available]) => (
                  <div key={day} className="flex items-center space-x-3">
                    <Checkbox
                      checked={available}
                      onCheckedChange={(checked) => 
                        handleInputChange('availability', {
                          ...formData.availability,
                          [day]: checked
                        })
                      }
                    />
                    <span className="capitalize font-medium">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Certifications (Optional)</Label>
              <p className="text-sm text-gray-600 mb-3">Add any relevant certifications</p>
              <div className="space-y-2">
                <Input placeholder="Certification name" />
                <Button variant="outline" size="sm">Add Certification</Button>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Ready to Start!</h4>
              <p className="text-sm text-green-800">
                Once you submit your application, you&apos;ll have immediate access to your provider dashboard 
                and can start accepting bookings right away.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Become a Petify Provider
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Join our network of trusted pet care professionals and grow your business
            </p>
          </div>
        </div>
      </section>

      <div className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Provider Application</CardTitle>
                      <CardDescription>
                        Step {step} of 3: {step === 1 ? 'Business Information' : step === 2 ? 'Location & Contact' : 'Availability & Certifications'}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      {[1, 2, 3].map((stepNumber) => (
                        <div
                          key={stepNumber}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {stepNumber}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderStepContent()}

                  <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
                    <Button
                      variant="outline"
                      onClick={step === 1 ? () => router.back() : handleBack}
                      disabled={loading}
                    >
                      {step === 1 ? 'Cancel' : 'Back'}
                    </Button>
                    <Button
                      onClick={step === 3 ? handleSubmit : handleNext}
                      disabled={
                        loading ||
                        (step === 1 && (!formData.businessName || !formData.description || formData.services.length === 0)) ||
                        (step === 2 && (!formData.address || !formData.city || !formData.state || !formData.phone))
                      }
                    >
                      {loading ? 'Submitting...' : step === 3 ? 'Submit Application' : 'Next'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Why Join Petify?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{benefit.title}</h4>
                          <p className="text-xs text-gray-600">{benefit.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Valid business information
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Service area coverage
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Professional experience
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Contact information
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
