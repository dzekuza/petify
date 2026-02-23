'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { supabase } from '@/lib/supabase'
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

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      console.log('Session token:', session.access_token ? 'Present' : 'Missing')
      console.log('User ID:', session.user?.id)

      // Update profile via API
      const response = await fetch('/api/providers/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }
      
      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setEditProfileOpen(false)
      setProfileImage(null)
      
      // Show success message
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to update profile: ${errorMessage}`)
    }
  }

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-foreground'
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
      <ProtectedRoute requiredRole="provider">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Kraunama...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="provider">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️</div>
            <p className="text-muted-foreground">{error}</p>
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
    )
  }

  if (!profile) {
    return (
      <ProtectedRoute requiredRole="provider">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-muted-foreground text-xl mb-4">👤</div>
            <p className="text-muted-foreground">Profilis nerastas</p>
            <Button 
              onClick={() => router.push('/provider/onboarding')} 
              className="mt-4"
            >
              Sukurti profilį
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="provider">
      <>
          {/* Header */}
         
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Profilis</h1>
                <p className="text-muted-foreground">Tvarkykite savo verslo profilio informaciją</p>
              </div>
              <div className="flex justify-start md:justify-end">
                <Button onClick={handleEditProfile}>Redaguoti profilį</Button>
              </div>
            </div>
        

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className=" shadow-none">
                <CardHeader className="p-0">
                  <CardTitle>Verslo informacija</CardTitle>
                  <CardDescription>
                    Jūsų verslo pagrindinė informacija
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-0">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.avatarUrl} alt={profile.businessName} />
                      <AvatarFallback className="text-lg">
                        {profile.businessName?.charAt(0) || <Building className="h-8 w-8" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {profile.businessName}
                      </h3>
                      <p className="text-muted-foreground">{profile.businessType}</p>
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
                      <h4 className="font-medium text-foreground mb-2">Aprašymas</h4>
                      <p className="text-muted-foreground">{profile.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">El. paštas</p>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Telefonas</p>
                        <p className="text-sm text-muted-foreground">{profile.phone || 'Nenurodyta'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Adresas</p>
                        <p className="text-sm text-muted-foreground">{profile.address || 'Nenurodyta'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Narystė nuo</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(profile.joinedDate).toLocaleDateString('lt-LT')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Stats */}
              <Card className=" shadow-none">
                <CardHeader className="p-0">
                  <CardTitle>Verslo statistika</CardTitle>
                  <CardDescription>
                    Jūsų verslo veiklos rodikliai
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Vidutinis įvertinimas</p>
                        <p className="text-sm text-muted-foreground">{profile.rating.toFixed(1)} / 5.0</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Atsiliepimai</p>
                        <p className="text-sm text-muted-foreground">{profile.totalReviews} atsiliepimų</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Status */}
              <Card className=" shadow-none">
                <CardHeader className="p-0">
                  <CardTitle>Profilio būsena</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Profilio užbaigimas</span>
                      <Badge className={profile.profileComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {profile.profileComplete ? 'Pilnas' : 'Nepilnas'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Verifikacija</span>
                      <Badge className={getVerificationStatusColor(profile.verificationStatus)}>
                        {getVerificationStatusText(profile.verificationStatus)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className=" shadow-none">
                <CardHeader className="p-0">
                  <CardTitle>Greiti veiksmai</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/provider/dashboard/services')}>
                    Mano paslaugos
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/provider/dashboard/bookings')}>
                    Užsakymai
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/provider/availability')}>
                    Prieinamumas
                  </Button>
                </CardContent>
              </Card>
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
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Verslo pavadinimas</Label>
                      <Input
                        id="businessName"
                        value={editForm.businessName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, businessName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Verslo tipas</Label>
                      <Input
                        id="businessType"
                        value={editForm.businessType}
                        onChange={(e) => setEditForm(prev => ({ ...prev, businessType: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Aprašymas</Label>
                      <Input
                        id="description"
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresas</Label>
                      <Input
                        id="address"
                        value={editForm.address}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefonas</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">El. paštas</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
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
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Verslo pavadinimas</Label>
                      <Input
                        id="businessName"
                        value={editForm.businessName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, businessName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Verslo tipas</Label>
                      <Input
                        id="businessType"
                        value={editForm.businessType}
                        onChange={(e) => setEditForm(prev => ({ ...prev, businessType: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Aprašymas</Label>
                    <Input
                      id="description"
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresas</Label>
                    <Input
                      id="address"
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefonas</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">El. paštas</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
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
        </>
    </ProtectedRoute>
  )
}
