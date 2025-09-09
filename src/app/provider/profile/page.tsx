'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Edit, 
  Plus,
  Phone,
  MapPin,
  PawPrint,
  Star,
  DollarSign,
  Clock,
  Users,
  Trash2
} from 'lucide-react'
import { ServiceProvider } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { providerApi } from '@/lib/providers'

export default function ProviderProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProviderData = async () => {
      try {
        setLoading(true)
        
        if (user?.id) {
          const providerData = await providerApi.getProviderByUserId(user.id)
          
          if (providerData) {
            const serviceProvider: ServiceProvider = {
              id: providerData.id,
              userId: providerData.user_id,
              businessName: providerData.business_name,
              description: providerData.description || '',
              services: providerData.services || [],
              location: {
                address: providerData.location?.address || '',
                city: providerData.location?.city || '',
                state: providerData.location?.state || '',
                zipCode: providerData.location?.zip || '',
                coordinates: {
                  lat: providerData.location?.coordinates?.lat || 0,
                  lng: providerData.location?.coordinates?.lng || 0
                }
              },
              contactInfo: {
                phone: providerData.contact_info?.phone || '',
                email: providerData.contact_info?.email || user?.email || '',
                website: providerData.contact_info?.website || ''
              },
              rating: providerData.rating || 0,
              reviewCount: providerData.review_count || 0,
              priceRange: {
                min: providerData.price_range?.min || 0,
                max: providerData.price_range?.max || 0
              },
              availability: providerData.availability || {},
              images: providerData.images || [],
              certifications: providerData.certifications || [],
              experience: providerData.experience_years || 0,
              status: providerData.status || 'active',
              avatarUrl: providerData.avatar_url || '',
              createdAt: providerData.created_at,
              updatedAt: providerData.updated_at
            }
            
            setProviders([serviceProvider])
          }
        }
        
      } catch (error) {
        console.error('Error loading provider data:', error)
        toast.error('Failed to load profile data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadProviderData()
  }, [user])

  const handleEditProvider = (provider: ServiceProvider) => {
    // Store the provider data in sessionStorage to pre-fill the onboarding form
    const editData = {
      businessName: provider.businessName,
      businessDescription: provider.description, // Map description to businessDescription
      phone: provider.contactInfo?.phone || '',
      email: provider.contactInfo?.email || '',
      website: provider.contactInfo?.website || '',
      address: provider.location?.address || '',
      city: provider.location?.city || '',
      state: provider.location?.state || '',
      zipCode: provider.location?.zipCode || '',
      coordinates: provider.location?.coordinates || { lat: 0, lng: 0 }, // Include coordinates
      experience: provider.experience?.toString() || '',
      basePrice: provider.priceRange?.min || 0, // Map to basePrice
      pricePerHour: provider.priceRange?.max || 0, // Map to pricePerHour
      availability: provider.availability,
      certifications: provider.certifications || [],
      photos: provider.images || [], // Map images to photos
      profilePhoto: provider.avatarUrl || '', // Map avatarUrl to profilePhoto
      services: provider.services || [],
      serviceType: provider.services?.[0] || 'grooming', // Extract service type from first service
      // Determine location type based on services (assuming multiple services means multiple locations)
      locationType: provider.services && provider.services.length > 1 ? 'multiple' : 'single',
      // Add cover image if available (first image from images array)
      coverImageUrl: provider.images?.[0] || '',
      // Add logo image if available (avatarUrl)
      logoImageUrl: provider.avatarUrl || ''
    }
    
    sessionStorage.setItem('editProviderData', JSON.stringify(editData))
    sessionStorage.setItem('editProviderId', provider.id)
    
    // Redirect to onboarding page in edit mode
    router.push('/provider/onboarding?edit=true')
  }

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this business profile? This action cannot be undone.')) {
      return
    }

    try {
      await providerApi.deleteProvider(providerId)
      setProviders(prev => prev.filter(p => p.id !== providerId))
      toast.success('Business profile deleted successfully')
    } catch (error) {
      console.error('Error deleting provider:', error)
      toast.error('Failed to delete business profile. Please try again.')
    }
  }

  const handleAddNewBusiness = () => {
    // Clear any existing edit data
    sessionStorage.removeItem('editProviderData')
    sessionStorage.removeItem('editProviderId')
    
    // Redirect to onboarding page for new business
    router.push('/provider/onboarding')
  }

  if (loading) {
    return (
      <Layout hideServiceCategories={true}>
        <ProtectedRoute requiredRole="provider">
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  return (
    <Layout hideServiceCategories={true} hideFooter={true}>
      <ProtectedRoute requiredRole="provider">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Businesses</h1>
                <p className="text-gray-600">Manage your business profiles and information</p>
              </div>
              <Button onClick={handleAddNewBusiness} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Business
              </Button>
            </div>

            {/* Business Grid */}
            {providers.length === 0 ? (
              <div className="text-center py-12">
                <PawPrint className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Businesses Found</h3>
                <p className="text-gray-600 mb-4">You haven't created any business profiles yet.</p>
                <Button onClick={handleAddNewBusiness} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Business
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <Card key={provider.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Cover Image Section */}
                    <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                      {provider.images && provider.images.length > 0 ? (
                        <Image 
                          src={provider.images[0]} 
                          alt="Business cover" 
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center text-white">
                            <PawPrint className="h-16 w-16 mx-auto mb-2 opacity-50" />
                            <p className="text-lg font-medium">No cover image</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={() => handleEditProvider(provider)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600"
                          onClick={() => handleDeleteProvider(provider.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <CardHeader className="pb-4">
                      <div className="text-center">
                        <CardTitle className="text-xl">{provider.businessName}</CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {provider.description || 'No description provided'}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">Location</p>
                            <p className="text-xs text-gray-600">
                              {provider.location.city && provider.location.state 
                                ? `${provider.location.city}, ${provider.location.state}`
                                : 'Not specified'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Clock className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">Experience</p>
                            <p className="text-xs text-gray-600">{provider.experience || 0} years</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Star className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">Rating</p>
                            <p className="text-xs text-gray-600">{provider.rating || 0} stars</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <DollarSign className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">Price Range</p>
                            <p className="text-xs text-gray-600">
                              €{provider.priceRange.min || 0} - €{provider.priceRange.max || 0}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <Phone className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">Contact</p>
                            <p className="text-xs text-gray-600">{provider.contactInfo?.phone || 'Not provided'}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Users className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">Reviews</p>
                            <p className="text-xs text-gray-600">{provider.reviewCount || 0} reviews</p>
                          </div>
                        </div>
                      </div>

                      {provider.certifications && provider.certifications.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs font-medium text-gray-900 mb-2">Certifications</h4>
                          <div className="flex flex-wrap gap-1">
                            {provider.certifications.slice(0, 3).map((cert, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                            {provider.certifications.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{provider.certifications.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleEditProvider(provider)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Business
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
