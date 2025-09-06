'use client'

import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { Heart, Star, MapPin, Phone, Mail } from 'lucide-react'

export default function FavoritesPage() {
  const { user } = useAuth()

  if (!user) return null

  // Mock favorites data
  const favorites = [
    {
      id: 1,
      name: 'Happy Paws Grooming',
      service: 'Dog Grooming',
      rating: 4.8,
      reviews: 124,
      distance: '2.3 km',
      address: '123 Main St, Vilnius',
      phone: '+370 600 12345',
      email: 'info@happypaws.lt',
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      name: 'City Vet Clinic',
      service: 'Veterinary Services',
      rating: 4.9,
      reviews: 89,
      distance: '1.8 km',
      address: '456 Oak Ave, Vilnius',
      phone: '+370 600 54321',
      email: 'contact@cityvet.lt',
      image: '/api/placeholder/300/200'
    }
  ]

  return (
    <Layout>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600">Your saved service providers</p>
            </div>

            {/* Favorites List */}
            <div className="space-y-4">
              {favorites.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding providers to your favorites</p>
                    <Button onClick={() => window.location.href = '/'}>
                      Find Services
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                favorites.map((provider) => (
                  <Card key={provider.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🏥</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {provider.name}
                              </h3>
                              <p className="text-gray-600 mb-2">{provider.service}</p>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span>{provider.rating}</span>
                                  <span>({provider.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{provider.distance}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                View Profile
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                Remove
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{provider.address}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>{provider.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
