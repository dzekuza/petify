'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/ui/image-upload'
import { useAuth } from '@/contexts/auth-context'
import { useDeviceDetection } from '@/lib/device-detection'
import { User, Mail, Calendar, MapPin, Phone, Building, Star, CheckCircle } from 'lucide-react'

interface ProviderProfile {
  id: string
  businessName: string
  businessType: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  avatarUrl: string
  verificationStatus: 'pending' | 'verified' | 'rejected'
  profileComplete: boolean
  rating: number
  totalReviews: number
  joinedDate: string
}

export default function ProviderProfilePage() {
  const { user } = useAuth()
  const { isMobile } = useDeviceDetection()
  const router = useRouter()
  
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProviderProfile | null>(null)
  
  const [editForm, setEditForm] = useState({
    businessName: '',
    businessType: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  })
  
  const [profileImage, setProfileImage] = useState<File | null>(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return

      try {
        setError(null)
        
        // Create mock data based on user info
        const mockProfile: ProviderProfile = {
          id: user.id,
          businessName: user.user_metadata?.business_name || user.user_metadata?.full_name || 'Verslo pavadinimas',
          businessType: user.user_metadata?.business_type || 'Paslaugų teikėjas',
          description: user.user_metadata?.description || 'Profesionalūs gyvūnų priežiūros sprendimai',
          address: user.user_metadata?.address || 'Vilnius, Lietuva',
          phone: user.user_metadata?.phone || '+370 600 00000',
          email: user.email || '',
          website: user.user_metadata?.website || '',
          avatarUrl: user.user_metadata?.avatar_url || '',
          verificationStatus: 'pending',
          profileComplete: false,
          rating: 4.5,
          totalReviews: 12,
          joinedDate: user.created_at || new Date().toISOString()
        }
        
        setProfile(mockProfile)
        
        setEditForm({
          businessName: mockProfile.businessName,
          businessType: mockProfile.businessType,
          description: mockProfile.description,
          address: mockProfile.address,
          phone: mockProfile.phone,
          email: mockProfile.email,
          website: mockProfile.website
        })
      } catch (error) {
        console.error('Error fetching profile data:', error)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user?.id, user?.email])

  const handleEditProfile = () => {
    setEditProfileOpen(true)
  }

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData()
      formData.append('businessName', editForm.businessName)
      formData.append('businessType', editForm.businessType)
      formData.append('description', editForm.description)
      formData.append('address', editForm.address)
      formData.append('phone', editForm.phone)
      formData.append('email', editForm.email)
      formData.append('website', editForm.website)
      
      if (profileImage) {
        formData.append('profileImage', profileImage)
      }

      // Update profile via API
      const response = await fetch('/api/providers/update-profile', {
        method: 'PUT',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      
      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setEditProfileOpen(false)
      setProfileImage(null)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    }
  }

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerificationStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Patvirtinta'
      case 'pending': return 'Laukianti'
      case 'rejected': return 'Atmesta'
      default: return status
    }
  }

  if (loading) {
    return (
      <Layout>
        <ProtectedRoute requiredRole="provider">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Kraunama...</p>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <ProtectedRoute requiredRole="provider">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">⚠️</div>
              <p className="text-gray-600">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Bandyti dar kartą
              </Button>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  if (!profile) {
    return (
      <Layout>
        <ProtectedRoute requiredRole="provider">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-gray-600 text-xl mb-4">👤</div>
              <p className="text-gray-600">Profilis nerastas</p>
              <Button 
                onClick={() => router.push('/provider/onboarding')} 
                className="mt-4"
              >
                Sukurti profilį
              </Button>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  return (
    <Layout hideFooter={true}>
      <ProtectedRoute requiredRole="provider">
        <div className="min-h-[calc(100vh-4rem)] md:min-h-screen bg-gray-50 pt-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Profilis</h1>
                  <p className="text-gray-600">Tvarkykite savo verslo profilio informaciją</p>
                </div>
                <Button onClick={handleEditProfile}>
                  Redaguoti profilį
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Verslo informacija</CardTitle>
                    <CardDescription>
                      Jūsų verslo pagrindinė informacija
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile.avatarUrl} alt={profile.businessName} />
                        <AvatarFallback className="text-lg">
                          {profile.businessName?.charAt(0) || <Building className="h-8 w-8" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {profile.businessName}
                        </h3>
                        <p className="text-gray-600">{profile.businessType}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getVerificationStatusColor(profile.verificationStatus)}>
                            {getVerificationStatusText(profile.verificationStatus)}
                          </Badge>
                          {profile.profileComplete && (
                            <Badge variant="secondary">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Pilnas profilis
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {profile.description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Aprašymas</h4>
                        <p className="text-gray-600">{profile.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">El. paštas</p>
                          <p className="text-sm text-gray-600">{profile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Telefonas</p>
                          <p className="text-sm text-gray-600">{profile.phone || 'Nenurodyta'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Adresas</p>
                          <p className="text-sm text-gray-600">{profile.address || 'Nenurodyta'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Narystė nuo</p>
                          <p className="text-sm text-gray-600">
                            {new Date(profile.joinedDate).toLocaleDateString('lt-LT')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Verslo statistika</CardTitle>
                    <CardDescription>
                      Jūsų verslo veiklos rodikliai
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Vidutinis įvertinimas</p>
                          <p className="text-sm text-gray-600">{profile.rating.toFixed(1)} / 5.0</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Atsiliepimai</p>
                          <p className="text-sm text-gray-600">{profile.totalReviews} atsiliepimų</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Profile Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profilio būsena</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Profilio užbaigimas</span>
                        <Badge className={profile.profileComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {profile.profileComplete ? 'Pilnas' : 'Nepilnas'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Verifikacija</span>
                        <Badge className={getVerificationStatusColor(profile.verificationStatus)}>
                          {getVerificationStatusText(profile.verificationStatus)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Greiti veiksmai</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/provider/services')}>
                      Mano paslaugos
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/provider/bookings')}>
                      Užsakymai
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/provider/availability')}>
                      Prieinamumas
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal/Drawer */}
        {isMobile ? (
          <Drawer open={editProfileOpen} onOpenChange={setEditProfileOpen} direction="bottom">
            <DrawerContent className="h-[80vh]">
              <DrawerHeader className="pb-2">
                <DrawerTitle className="text-center text-lg font-semibold">
                  Redaguoti profilį
                </DrawerTitle>
              </DrawerHeader>
              
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <Label>Profilio nuotrauka</Label>
                    <ImageUpload
                      value={profileImage}
                      onChange={setProfileImage}
                      placeholder="Click or drag and drop profile image here"
                      description="PNG, JPG, GIF up to 5MB"
                      previewClassName="w-20 h-20 object-cover rounded-full"
                      maxSize={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessName">Verslo pavadinimas</Label>
                    <Input
                      id="businessName"
                      value={editForm.businessName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, businessName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Verslo tipas</Label>
                    <Input
                      id="businessType"
                      value={editForm.businessType}
                      onChange={(e) => setEditForm(prev => ({ ...prev, businessType: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Aprašymas</Label>
                    <Input
                      id="description"
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Adresas</Label>
                    <Input
                      id="address"
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefonas</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">El. paštas</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Svetainė</Label>
                    <Input
                      id="website"
                      value={editForm.website}
                      onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <DrawerFooter className="pt-4">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
                    Atšaukti
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    Išsaugoti pakeitimus
                  </Button>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Redaguoti profilį</DialogTitle>
                <DialogDescription>
                  Atnaujinkite savo verslo profilio informaciją
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Profilio nuotrauka</Label>
                  <ImageUpload
                    value={profileImage}
                    onChange={setProfileImage}
                    placeholder="Click or drag and drop profile image here"
                    description="PNG, JPG, GIF up to 5MB"
                    previewClassName="w-20 h-20 object-cover rounded-full"
                    maxSize={5}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Verslo pavadinimas</Label>
                    <Input
                      id="businessName"
                      value={editForm.businessName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, businessName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Verslo tipas</Label>
                    <Input
                      id="businessType"
                      value={editForm.businessType}
                      onChange={(e) => setEditForm(prev => ({ ...prev, businessType: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Aprašymas</Label>
                  <Input
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adresas</Label>
                  <Input
                    id="address"
                    value={editForm.address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefonas</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">El. paštas</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Svetainė</Label>
                  <Input
                    id="website"
                    value={editForm.website}
                    onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
                    Atšaukti
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    Išsaugoti pakeitimus
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </ProtectedRoute>
    </Layout>
  )
}
