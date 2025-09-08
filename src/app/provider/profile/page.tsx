'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Edit, 
  X,
  Phone,
  MapPin,
  PawPrint,
  Star,
  DollarSign,
  Clock,
  Users
} from 'lucide-react'
import { ServiceProvider } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { useNotifications } from '@/contexts/notifications-context'
import { providerApi } from '@/lib/providers'
import { uploadCoverImage, uploadProfilePicture, getPublicUrl, validateFile } from '@/lib/storage'
import AddressAutocomplete from '@/components/address-autocomplete'

export default function ProviderProfilePage() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const router = useRouter()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [loading, setLoading] = useState(true)
  const [editProfileLoading, setEditProfileLoading] = useState(false)
  const [editProfileForm, setEditProfileForm] = useState({
    businessName: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    coordinates: { lat: 0, lng: 0 },
    experience: '',
    priceRange: { min: '', max: '' },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    certifications: [] as string[],
    coverImage: null as File | null,
    profilePicture: null as File | null,
    galleryImages: [] as File[]
  })

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
            
            setProvider(serviceProvider)
            
            // Populate edit form with current data
            setEditProfileForm({
              businessName: serviceProvider.businessName || '',
              description: serviceProvider.description || '',
              phone: serviceProvider.contactInfo?.phone || '',
              email: user?.email || '',
              website: serviceProvider.contactInfo?.website || '',
              address: serviceProvider.location?.address || '',
              city: serviceProvider.location?.city || '',
              state: serviceProvider.location?.state || '',
              zipCode: serviceProvider.location?.zipCode || '',
              coordinates: {
                lat: serviceProvider.location?.coordinates?.lat || 0,
                lng: serviceProvider.location?.coordinates?.lng || 0
              },
              experience: serviceProvider.experience?.toString() || '',
              priceRange: {
                min: serviceProvider.priceRange?.min?.toString() || '',
                max: serviceProvider.priceRange?.max?.toString() || ''
              },
              availability: {
                monday: Array.isArray(serviceProvider.availability?.monday) ? serviceProvider.availability.monday.length > 0 : serviceProvider.availability?.monday || true,
                tuesday: Array.isArray(serviceProvider.availability?.tuesday) ? serviceProvider.availability.tuesday.length > 0 : serviceProvider.availability?.tuesday || true,
                wednesday: Array.isArray(serviceProvider.availability?.wednesday) ? serviceProvider.availability.wednesday.length > 0 : serviceProvider.availability?.wednesday || true,
                thursday: Array.isArray(serviceProvider.availability?.thursday) ? serviceProvider.availability.thursday.length > 0 : serviceProvider.availability?.thursday || true,
                friday: Array.isArray(serviceProvider.availability?.friday) ? serviceProvider.availability.friday.length > 0 : serviceProvider.availability?.friday || true,
                saturday: Array.isArray(serviceProvider.availability?.saturday) ? serviceProvider.availability.saturday.length > 0 : serviceProvider.availability?.saturday || false,
                sunday: Array.isArray(serviceProvider.availability?.sunday) ? serviceProvider.availability.sunday.length > 0 : serviceProvider.availability?.sunday || false
              },
              certifications: serviceProvider.certifications || [],
              coverImage: null,
              profilePicture: null,
              galleryImages: []
            })
          }
        }
        
      } catch (error) {
        console.error('Error loading provider data:', error)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load profile data. Please try again.'
        })
      } finally {
        setLoading(false)
      }
    }

    loadProviderData()
  }, [user, addNotification])

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditProfileLoading(true)

    try {
      if (!user?.id || !provider?.id) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'User or provider not found'
        })
        return
      }

      let coverImageUrl = provider.images?.[0] || ''
      let profilePictureUrl = provider.avatarUrl || ''

      // Handle cover image upload if a new file is selected
      if (editProfileForm.coverImage) {
        const validation = validateFile(editProfileForm.coverImage, 5)
        if (!validation.valid) {
          addNotification({
            type: 'error',
            title: 'Invalid File',
            message: validation.error || 'Please select a valid image file'
          })
          return
        }

        const uploadResult = await uploadCoverImage(editProfileForm.coverImage, provider.id)
        if (uploadResult.error) {
          addNotification({
            type: 'error',
            title: 'Upload Failed',
            message: 'Failed to upload cover image. Please try again.'
          })
          return
        }

        coverImageUrl = getPublicUrl('provider-images', uploadResult.data!.path)
      }

      // Handle profile picture upload if a new file is selected
      if (editProfileForm.profilePicture) {
        const validation = validateFile(editProfileForm.profilePicture, 5)
        if (!validation.valid) {
          addNotification({
            type: 'error',
            title: 'Invalid File',
            message: validation.error || 'Please select a valid image file'
          })
          return
        }

        const uploadResult = await uploadProfilePicture(editProfileForm.profilePicture, provider.id)
        if (uploadResult.error) {
          addNotification({
            type: 'error',
            title: 'Upload Failed',
            message: 'Failed to upload profile picture. Please try again.'
          })
          return
        }

        profilePictureUrl = getPublicUrl('provider-images', uploadResult.data!.path)
      }

      // Handle gallery images upload
      const galleryImageUrls: string[] = []
      if (editProfileForm.galleryImages.length > 0) {
        for (const file of editProfileForm.galleryImages) {
          const validation = validateFile(file, 5)
          if (!validation.valid) {
            addNotification({
              type: 'error',
              title: 'Invalid File',
              message: validation.error || 'Please select valid image files'
            })
            return
          }

          const uploadResult = await uploadCoverImage(file, provider.id)
          if (uploadResult.error) {
            addNotification({
              type: 'error',
              title: 'Upload Failed',
              message: 'Failed to upload gallery image. Please try again.'
            })
            return
          }

          galleryImageUrls.push(getPublicUrl('provider-images', uploadResult.data!.path))
        }
      }

      // Prepare update data
      const updateData = {
        businessName: editProfileForm.businessName,
        description: editProfileForm.description,
        location: {
          address: editProfileForm.address,
          city: editProfileForm.city,
          state: editProfileForm.state,
          zip: editProfileForm.zipCode,
          coordinates: {
            lat: editProfileForm.coordinates.lat,
            lng: editProfileForm.coordinates.lng
          }
        },
        contactInfo: {
          phone: editProfileForm.phone,
          email: editProfileForm.email,
          website: editProfileForm.website
        },
        priceRange: {
          min: parseFloat(editProfileForm.priceRange.min),
          max: parseFloat(editProfileForm.priceRange.max),
          currency: 'EUR'
        },
        availability: editProfileForm.availability,
        certifications: editProfileForm.certifications,
        experienceYears: parseInt(editProfileForm.experience) || 0,
        images: [...(coverImageUrl ? [coverImageUrl] : []), ...galleryImageUrls],
        avatarUrl: profilePictureUrl
      }

      // Update provider in database
      const updatedProvider = await providerApi.updateProvider(provider.id, updateData)
      
      // Update local state
      const serviceProvider: ServiceProvider = {
        id: updatedProvider.id,
        userId: updatedProvider.user_id,
        businessName: updatedProvider.business_name,
        description: updatedProvider.description || '',
        services: updatedProvider.services || [],
        location: {
          address: updatedProvider.location?.address || '',
          city: updatedProvider.location?.city || '',
          state: updatedProvider.location?.state || '',
          zipCode: updatedProvider.location?.zip || '',
          coordinates: {
            lat: updatedProvider.location?.coordinates?.lat || 0,
            lng: updatedProvider.location?.coordinates?.lng || 0
          }
        },
        contactInfo: {
          phone: updatedProvider.contact_info?.phone || '',
          email: updatedProvider.contact_info?.email || user?.email || '',
          website: updatedProvider.contact_info?.website || ''
        },
        rating: updatedProvider.rating || 0,
        reviewCount: updatedProvider.review_count || 0,
        priceRange: {
          min: updatedProvider.price_range?.min || 0,
          max: updatedProvider.price_range?.max || 0
        },
        availability: updatedProvider.availability || {},
        images: updatedProvider.images || [],
        certifications: updatedProvider.certifications || [],
        experience: updatedProvider.experience_years || 0,
        status: updatedProvider.status || 'active',
        avatarUrl: updatedProvider.avatar_url || '',
        createdAt: updatedProvider.created_at,
        updatedAt: updatedProvider.updated_at
      }
      
      setProvider(serviceProvider)
      
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your business profile has been updated successfully!'
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update profile. Please try again.'
      })
    } finally {
      setEditProfileLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout hideServiceCategories={true}>
        <ProtectedRoute requiredRole="provider">
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  if (!provider) {
    return (
      <Layout hideServiceCategories={true}>
        <ProtectedRoute requiredRole="provider">
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-12">
                <PawPrint className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Found</h3>
                <p className="text-gray-600 mb-4">You need to complete your provider profile first.</p>
                <Button onClick={() => router.push('/provider/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  return (
    <Layout hideServiceCategories={true}>
      <ProtectedRoute requiredRole="provider">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Profile</h1>
              <p className="text-gray-600">Manage your business information and profile details</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Preview */}
              <div className="lg:col-span-1">
                <Card className="overflow-hidden">
                  {/* Cover Image Section */}
                  <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                    {provider?.images && provider.images.length > 0 ? (
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
                          <p className="text-sm opacity-75">Add a cover image to make your profile stand out</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-4">
                    <div className="text-center">
                      <CardTitle className="text-2xl">{provider?.businessName || 'My Business'}</CardTitle>
                      <CardDescription className="mt-2">
                        {provider?.description || 'No description provided'}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Location</p>
                          <p className="text-sm text-gray-600">
                            {provider?.location.city && provider?.location.state 
                              ? `${provider.location.city}, ${provider.location.state}`
                              : 'Not specified'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Clock className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Experience</p>
                          <p className="text-sm text-gray-600">{provider?.experience || 0} years</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Star className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Rating</p>
                          <p className="text-sm text-gray-600">{provider?.rating || 0} stars</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <DollarSign className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Price Range</p>
                          <p className="text-sm text-gray-600">
                            €{provider?.priceRange.min || 0} - €{provider?.priceRange.max || 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Phone className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Contact</p>
                          <p className="text-sm text-gray-600">{provider?.contactInfo?.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Users className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Reviews</p>
                          <p className="text-sm text-gray-600">{provider?.reviewCount || 0} reviews</p>
                        </div>
                      </div>
                    </div>

                    {provider?.certifications && provider.certifications.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-3">Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {provider.certifications.map((cert, index) => (
                            <Badge key={index} variant="secondary">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Edit Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>
                      Update your business information and profile details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleEditProfile} className="space-y-6">
                      {/* Cover Image Upload */}
                      <div>
                        <Label>Cover Image</Label>
                        <p className="text-sm text-gray-600 mb-3">Upload a cover image for your business profile</p>
                        
                        {/* Show current cover image if exists */}
                        {provider?.images?.[0] && !editProfileForm.coverImage && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Current cover image:</p>
                            <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={provider.images[0]}
                                alt="Current cover image"
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Show preview of new cover image */}
                        {editProfileForm.coverImage && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">New cover image preview:</p>
                            <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={URL.createObjectURL(editProfileForm.coverImage)}
                                alt="Cover image preview"
                                fill
                                className="object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setEditProfileForm(prev => ({ ...prev, coverImage: null }))}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setEditProfileForm(prev => ({ ...prev, coverImage: file }))
                              }
                            }}
                            className="hidden"
                            id="cover-image-upload"
                          />
                          <label htmlFor="cover-image-upload" className="cursor-pointer">
                            <div className="space-y-2">
                              <div className="mx-auto h-12 w-12 text-gray-400">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <p className="text-sm text-gray-600">
                                {editProfileForm.coverImage ? 'Click to change cover image' : 'Click to upload cover image'}
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Profile Picture Upload */}
                      <div>
                        <Label>Profile Picture</Label>
                        <p className="text-sm text-gray-600 mb-3">Upload a profile picture for your business</p>
                        
                        {/* Show current profile picture if exists */}
                        {provider?.avatarUrl && !editProfileForm.profilePicture && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Current profile picture:</p>
                            <div className="relative w-24 h-24 bg-gray-100 rounded-full overflow-hidden">
                              <Image
                                src={provider.avatarUrl}
                                alt="Current profile picture"
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Show preview of new profile picture */}
                        {editProfileForm.profilePicture && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">New profile picture preview:</p>
                            <div className="relative w-24 h-24 bg-gray-100 rounded-full overflow-hidden">
                              <Image
                                src={URL.createObjectURL(editProfileForm.profilePicture)}
                                alt="Profile picture preview"
                                fill
                                className="object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setEditProfileForm(prev => ({ ...prev, profilePicture: null }))}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setEditProfileForm(prev => ({ ...prev, profilePicture: file }))
                              }
                            }}
                            className="hidden"
                            id="profile-picture-upload"
                          />
                          <label htmlFor="profile-picture-upload" className="cursor-pointer">
                            <div className="space-y-2">
                              <div className="mx-auto h-12 w-12 text-gray-400">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <p className="text-sm text-gray-600">
                                {editProfileForm.profilePicture ? 'Click to change profile picture' : 'Click to upload profile picture'}
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="editBusinessName">Business Name *</Label>
                          <Input
                            id="editBusinessName"
                            type="text"
                            value={editProfileForm.businessName}
                            onChange={(e) => setEditProfileForm(prev => ({ ...prev, businessName: e.target.value }))}
                            placeholder="Enter your business name"
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="editExperience">Years of Experience *</Label>
                          <Input
                            id="editExperience"
                            type="number"
                            min="0"
                            value={editProfileForm.experience}
                            onChange={(e) => setEditProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                            placeholder="0"
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="editDescription">Business Description *</Label>
                        <Textarea
                          id="editDescription"
                          value={editProfileForm.description}
                          onChange={(e) => setEditProfileForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your business and services..."
                          className="mt-1"
                          rows={4}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="editPhone">Phone Number</Label>
                          <Input
                            id="editPhone"
                            type="tel"
                            value={editProfileForm.phone}
                            onChange={(e) => setEditProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="(555) 123-4567"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="editEmail">Email Address</Label>
                          <Input
                            id="editEmail"
                            type="email"
                            value={editProfileForm.email}
                            onChange={(e) => setEditProfileForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="your@email.com"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editWebsite">Website (Optional)</Label>
                          <Input
                            id="editWebsite"
                            type="url"
                            value={editProfileForm.website}
                            onChange={(e) => setEditProfileForm(prev => ({ ...prev, website: e.target.value }))}
                            placeholder="https://www.example.com"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <AddressAutocomplete
                        value={editProfileForm.address}
                        onChange={(address) => setEditProfileForm(prev => ({ ...prev, address }))}
                        onAddressSelect={(suggestion) => {
                          setEditProfileForm(prev => ({
                            ...prev,
                            address: suggestion.address,
                            city: suggestion.city,
                            state: suggestion.state,
                            zipCode: suggestion.zipCode,
                            coordinates: {
                              lat: suggestion.coordinates.lat,
                              lng: suggestion.coordinates.lng
                            }
                          }))
                        }}
                        placeholder="Enter your business address"
                        label="Business Address"
                        className="mt-1"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="editCity">City</Label>
                          <Input
                            id="editCity"
                            type="text"
                            value={editProfileForm.city}
                            onChange={(e) => setEditProfileForm(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="City"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="editState">State/Region</Label>
                          <Input
                            id="editState"
                            type="text"
                            value={editProfileForm.state}
                            onChange={(e) => setEditProfileForm(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="State/Region"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="editZipCode">Postal Code</Label>
                          <Input
                            id="editZipCode"
                            type="text"
                            value={editProfileForm.zipCode}
                            onChange={(e) => setEditProfileForm(prev => ({ ...prev, zipCode: e.target.value }))}
                            placeholder="Postal Code"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push('/provider/dashboard')}
                          disabled={editProfileLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={editProfileLoading || !editProfileForm.businessName || !editProfileForm.description || !editProfileForm.experience}
                        >
                          {editProfileLoading ? 'Updating Profile...' : 'Update Profile'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
