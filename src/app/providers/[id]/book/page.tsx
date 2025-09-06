'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { BookingModal } from '@/components/booking-modal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, MapPin, Clock, Users, ArrowLeft, MessageCircle, Phone } from 'lucide-react'
import { ServiceProvider, Service } from '@/types'

// Mock data
const mockProvider: ServiceProvider = {
  id: '1',
  userId: 'user1',
  businessName: 'Happy Paws Grooming',
  description: 'Professional pet grooming with 10+ years of experience.',
  services: ['grooming'],
  location: {
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    coordinates: { lat: 37.7749, lng: -122.4194 }
  },
  rating: 4.9,
  reviewCount: 127,
  priceRange: { min: 45, max: 85 },
  availability: {
    monday: [{ start: '09:00', end: '17:00', available: true }],
    tuesday: [{ start: '09:00', end: '17:00', available: true }],
    wednesday: [{ start: '09:00', end: '17:00', available: true }],
    thursday: [{ start: '09:00', end: '17:00', available: true }],
    friday: [{ start: '09:00', end: '17:00', available: true }],
    saturday: [{ start: '10:00', end: '16:00', available: true }],
    sunday: []
  },
  images: ['/placeholder-grooming.jpg'],
  certifications: ['Certified Pet Groomer', 'CPR Certified'],
  experience: 10,
  status: 'active',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

const mockServices: Service[] = [
  {
    id: '1',
    providerId: '1',
    category: 'grooming',
    name: 'Full Grooming Package',
    description: 'Complete grooming service including bath, brush, nail trim, and styling',
    price: 65,
    duration: 120,
    maxPets: 1,
    requirements: ['Vaccination records'],
    includes: ['Bath', 'Brush', 'Nail trim', 'Ear cleaning', 'Styling'],
    images: ['/placeholder-grooming.jpg'],
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    providerId: '1',
    category: 'grooming',
    name: 'Basic Bath & Brush',
    description: 'Essential cleaning and brushing service',
    price: 45,
    duration: 60,
    maxPets: 1,
    requirements: ['Vaccination records'],
    includes: ['Bath', 'Brush', 'Ear cleaning'],
    images: ['/placeholder-grooming.jpg'],
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProvider(mockProvider)
      setServices(mockServices)
      setLoading(false)
    }, 1000)
  }, [params.id])

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setShowBookingModal(true)
  }

  if (loading) {
    return (
      <Layout>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-96 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  if (!provider) {
    return (
      <Layout>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider not found</h1>
                <p className="text-gray-600">The provider you're looking for doesn't exist.</p>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  return (
    <Layout>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Book a Service
              </h1>
              <p className="text-gray-600">
                Choose a service and book with {provider.businessName}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Provider Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Provider Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="/placeholder-avatar.jpg" alt={provider.businessName} />
                        <AvatarFallback>
                          {provider.businessName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {provider.businessName}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium text-gray-900 ml-1">
                              {provider.rating}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              ({provider.reviewCount} reviews)
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {provider.location.city}, {provider.location.state}
                          </div>
                        </div>
                        <p className="text-gray-600 mt-2">{provider.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Services */}
                <Card>
                  <CardHeader>
                    <CardTitle>Available Services</CardTitle>
                    <CardDescription>
                      Select a service to book
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {services.map((service) => (
                        <div key={service.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {service.name}
                              </h4>
                              <p className="text-gray-600 mb-4">{service.description}</p>
                              
                              <div className="flex items-center space-x-6 mb-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {service.duration} minutes
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  Up to {service.maxPets} pet{service.maxPets > 1 ? 's' : ''}
                                </div>
                              </div>

                              {service.includes && service.includes.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Includes:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {service.includes.map((item, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {item}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {service.requirements && service.requirements.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {service.requirements.map((req, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {req}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right ml-6">
                              <div className="text-2xl font-bold text-gray-900 mb-2">
                                ${service.price}
                              </div>
                              <Button onClick={() => handleServiceSelect(service)}>
                                Book This Service
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Booking Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Process</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">1</span>
                        </div>
                        <span className="text-sm text-gray-600">Select a service</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">2</span>
                        </div>
                        <span className="text-sm text-gray-600">Choose date & time</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">3</span>
                        </div>
                        <span className="text-sm text-gray-600">Select your pets</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">4</span>
                        </div>
                        <span className="text-sm text-gray-600">Confirm booking</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Provider Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Provider</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Provider
                    </Button>
                  </CardContent>
                </Card>

                {/* Availability */}
                <Card>
                  <CardHeader>
                    <CardTitle>Availability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {Object.entries(provider.availability).map(([day, slots]) => (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize font-medium">{day}</span>
                          <span className="text-gray-600">
                            {slots.length > 0 ? `${slots[0].start}-${slots[0].end}` : 'Closed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {selectedService && (
          <BookingModal
            isOpen={showBookingModal}
            onClose={() => {
              setShowBookingModal(false)
              setSelectedService(null)
            }}
            provider={provider}
            service={selectedService}
          />
        )}
      </ProtectedRoute>
    </Layout>
  )
}
