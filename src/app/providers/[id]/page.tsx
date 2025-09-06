'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Layout } from '@/components/layout'
import { ProviderCard } from '@/components/provider-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Heart, 
  Share2, 
  Award,
  Users,
  Calendar,
  Shield,
  CheckCircle
} from 'lucide-react'
import { ServiceProvider, Service, Review } from '@/types'

// Mock data for demonstration
const mockProvider: ServiceProvider = {
  id: '1',
  userId: 'user1',
  businessName: 'Happy Paws Grooming',
  description: 'Professional pet grooming with 10+ years of experience. We specialize in all breeds and offer premium grooming services including full-service grooming, nail trimming, teeth cleaning, and specialized treatments for sensitive pets.',
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
  certifications: ['Certified Pet Groomer', 'CPR Certified', 'Animal Behavior Specialist'],
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

const mockReviews: Review[] = [
  {
    id: '1',
    bookingId: '1',
    customerId: 'customer1',
    providerId: '1',
    rating: 5,
    comment: 'Excellent service! My dog came out looking amazing and was so happy. The staff was professional and caring.',
    images: [],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    bookingId: '2',
    customerId: 'customer2',
    providerId: '1',
    rating: 5,
    comment: 'Highly recommend! They took great care of my anxious cat and made the whole experience stress-free.',
    images: [],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  }
]

export default function ProviderDetailPage() {
  const params = useParams()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProvider(mockProvider)
      setServices(mockServices)
      setReviews(mockReviews)
      setLoading(false)
    }, 1000)
  }, [params.id])

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!provider) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider not found</h1>
              <p className="text-gray-600">The provider you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {provider.businessName}
                </h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-medium text-gray-900 ml-1">
                      {provider.rating}
                    </span>
                    <span className="text-gray-500 ml-1">
                      ({provider.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {provider.location.city}, {provider.location.state}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'text-red-500 fill-current' : ''}`} />
                  {isFavorite ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-100 to-blue-200 h-64 rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">✂️</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>About {provider.businessName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{provider.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Experience</p>
                        <p className="text-sm text-gray-600">{provider.experience} years</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Certifications</p>
                        <p className="text-sm text-gray-600">{provider.certifications?.length || 0} certified</p>
                      </div>
                    </div>
                  </div>

                  {provider.certifications && provider.certifications.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {provider.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center">
                            <Award className="h-3 w-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Services & Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {service.duration} min
                              </span>
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                Up to {service.maxPets} pet{service.maxPets > 1 ? 's' : ''}
                              </span>
                            </div>
                            {service.includes && service.includes.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700 mb-1">Includes:</p>
                                <div className="flex flex-wrap gap-1">
                                  {service.includes.map((item, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-semibold text-gray-900">
                              ${service.price}
                            </div>
                            <Button size="sm" className="mt-2">
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Reviews ({provider.reviewCount})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact & Booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      ${provider.priceRange.min}-${provider.priceRange.max}
                    </div>
                    <div className="text-sm text-gray-600">per service</div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Availability</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(provider.availability).map(([day, slots]) => (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize">{day}</span>
                          <span className="text-gray-600">
                            {slots.length > 0 ? `${slots[0].start}-${slots[0].end}` : 'Closed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{provider.location.address}</p>
                        <p className="text-gray-600">
                          {provider.location.city}, {provider.location.state} {provider.location.zipCode}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
