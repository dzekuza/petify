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
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from '@/components/ui/image-upload'
import { useAuth } from '@/contexts/auth-context'
import { t } from '@/lib/translations'
import { useDeviceDetection } from '@/lib/device-detection'
import { supabase } from '@/lib/supabase'
import { User, Mail, Calendar, Shield, Eye, EyeOff, MapPin, Phone } from 'lucide-react'

export default function ProfilePage() {
  const { user, resetPassword } = useAuth()
  const { isMobile } = useDeviceDetection()
  const router = useRouter()
  
  // If the user is a provider, route this page into the provider dashboard profile tab
  useEffect(() => {
    if (!user) return
    const role = user.user_metadata?.role
    if (role === 'provider') {
      router.replace('/provider/dashboard/profile')
    }
  }, [user, router])

  // State for modals and forms
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  
  // Form states
  const [editForm, setEditForm] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || ''
  })
  
  const [profileImage, setProfileImage] = useState<File | null>(null)
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [notifications, setNotifications] = useState({
    bookingUpdates: true,
    serviceUpdates: true,
    marketing: false
  })
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false
  })

  if (!user) return null

  // Debug: Log user data to see what we have
  console.log('Current user data:', {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
    avatar_url: user.user_metadata?.avatar_url
  })

  // Handler functions
  const handleEditProfile = () => {
    setEditProfileOpen(true)
  }

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData()
      formData.append('fullName', editForm.fullName)
      formData.append('email', editForm.email)
      
      if (profileImage) {
        formData.append('profileImage', profileImage)
      }

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session found')
      }

      // Update profile via API
      const response = await fetch('/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update profile`)
      }
      
      const result = await response.json()
      console.log('Profile updated successfully:', result)
      
      // Refresh user data to show updated profile
      const { data: { user: updatedUser } } = await supabase.auth.getUser()
      if (updatedUser) {
        // Trigger auth state change to refresh the UI
        await supabase.auth.refreshSession()
      }
      
      setEditProfileOpen(false)
      setProfileImage(null)
      
      // Show success message
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile. Please try again.'
      alert(errorMessage)
    }
  }

  const handleConfigureNotifications = () => {
    setNotificationsOpen(true)
  }

  const handleSaveNotifications = async () => {
    // Save notifications preferences
    const response = await fetch('/api/users/update-notifications', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notifications),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update notifications')
    }
    console.log('Saving notifications:', notifications)
    setNotificationsOpen(false)
  }

  const handleManagePrivacy = () => {
    setPrivacyOpen(true)
  }

  const handleSavePrivacy = async () => {
    // Save privacy settings
    const response = await fetch('/api/users/update-privacy', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(privacy),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update privacy settings')
    }
    console.log('Saving privacy:', privacy)
    setPrivacyOpen(false)
  }

  const handleChangePassword = () => {
    setChangePasswordOpen(true)
  }

  const handleSavePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    try {
      if (!user.email) {
        alert('No email address found')
        return
      }
      
      const { error } = await resetPassword(user.email)
      if (error) {
        alert('Error updating password: ' + error.message)
      } else {
        alert('Password reset email sent! Check your inbox.')
        setChangePasswordOpen(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch {
      alert('Error updating password')
    }
  }

  const handleMyBookings = () => {
    router.push('/bookings')
  }

  const handleFavorites = () => {
    router.push('/favorites')
  }

  const handleHelpSupport = () => {
    router.push('/help')
  }

  return (
    <Layout hideFooter={true}>
      <ProtectedRoute>
        <div className="min-h-[calc(100vh-4rem)] md:min-h-screen bg-gray-50 pt-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
              <p className="text-gray-600">{t('profile.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.personalInformation')}</CardTitle>
                    <CardDescription>
                      {t('profile.personalInformationDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage 
                          src={user.user_metadata?.avatar_url} 
                          alt={user.user_metadata?.full_name || 'User'} 
                          onError={(e) => {
                            console.log('Avatar image failed to load:', user.user_metadata?.avatar_url)
                            e.currentTarget.style.display = 'none'
                          }}
                          onLoad={() => {
                            console.log('Avatar image loaded successfully:', user.user_metadata?.avatar_url)
                          }}
                        />
                        <AvatarFallback className="text-lg">
                          {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || <User className="h-8 w-8" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {user.user_metadata?.full_name || 'User'}
                        </h3>
                        <p className="text-gray-600">{user.email}</p>
                        <Badge variant="secondary" className="mt-2">
                          {user.user_metadata?.role || 'customer'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{t('profile.email')}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{t('profile.memberSince')}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{t('profile.accountType')}</p>
                          <p className="text-sm text-gray-600 capitalize">
                            {user.user_metadata?.role || 'customer'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button onClick={handleEditProfile}>{t('profile.editProfile')}</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.accountSettings')}</CardTitle>
                    <CardDescription>
                      {t('profile.accountSettingsDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{t('profile.emailNotifications')}</p>
                        <p className="text-sm text-gray-600">{t('profile.emailNotificationsDesc')}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleConfigureNotifications}>{t('profile.configure')}</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{t('profile.privacySettings')}</p>
                        <p className="text-sm text-gray-600">{t('profile.privacySettingsDesc')}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleManagePrivacy}>{t('profile.manage')}</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{t('profile.changePassword')}</p>
                        <p className="text-sm text-gray-600">{t('profile.changePasswordDesc')}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleChangePassword}>{t('profile.change')}</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.quickActions')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={handleMyBookings}>
                      {t('profile.myBookings')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleFavorites}>
                      {t('profile.favorites')}
                    </Button>
                    {user.user_metadata?.role === 'provider' && (
                      <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/provider/dashboard')}>
                        {t('profile.providerDashboard')}
                      </Button>
                    )}
                    <Button variant="outline" className="w-full justify-start" onClick={handleHelpSupport}>
                      {t('profile.helpSupport')}
                    </Button>
                  </CardContent>
                </Card>

                {/* Account Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.accountStatus')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('profile.emailVerified')}</span>
                        <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                          {user.email_confirmed_at ? t('profile.verified') : t('profile.pending')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('profile.accountStatus')}</span>
                        <Badge variant="default">{t('profile.active')}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Location and Contact Information */}
            <div className="mt-8">
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>V. Mykolaičio-Putino G., Vilnius 03106, Lietuva</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal/Drawer */}
        {isMobile ? (
          <Drawer open={editProfileOpen} onOpenChange={setEditProfileOpen} direction="bottom">
            <DrawerContent className="h-[60vh]">
              <DrawerHeader className="pb-2">
                <DrawerTitle className="text-center text-lg font-semibold">
                  {t('profile.editProfileTitle')}
                </DrawerTitle>
              </DrawerHeader>
              
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <Label>{t('profile.profileImage')}</Label>
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
                    <Label htmlFor="fullName">{t('profile.fullName')}</Label>
                    <Input
                      id="fullName"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('profile.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <DrawerFooter className="pt-4">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    {t('profile.saveChanges')}
                  </Button>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('profile.editProfileTitle')}</DialogTitle>
                <DialogDescription>
                  {t('profile.editProfileDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t('profile.profileImage')}</Label>
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
                  <Label htmlFor="fullName">{t('profile.fullName')}</Label>
                  <Input
                    id="fullName"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t('profile.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    {t('profile.saveChanges')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Notifications Modal */}
        <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('profile.emailNotificationsTitle')}</DialogTitle>
              <DialogDescription>
                {t('profile.emailNotificationsDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('profile.bookingUpdates')}</p>
                  <p className="text-sm text-gray-600">{t('profile.bookingUpdatesDesc')}</p>
                </div>
                <Checkbox
                  checked={notifications.bookingUpdates}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, bookingUpdates: checked as boolean }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('profile.serviceUpdates')}</p>
                  <p className="text-sm text-gray-600">{t('profile.serviceUpdatesDesc')}</p>
                </div>
                <Checkbox
                  checked={notifications.serviceUpdates}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, serviceUpdates: checked as boolean }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('profile.marketing')}</p>
                  <p className="text-sm text-gray-600">{t('profile.marketingDesc')}</p>
                </div>
                <Checkbox
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked as boolean }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setNotificationsOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSaveNotifications}>
                  {t('profile.saveSettings')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Privacy Settings Modal */}
        <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('profile.privacySettingsTitle')}</DialogTitle>
              <DialogDescription>
                {t('profile.privacySettingsDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="profileVisibility">{t('profile.profileVisibility')}</Label>
                <select
                  id="profileVisibility"
                  value={privacy.profileVisibility}
                  onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="public">{t('profile.public')}</option>
                  <option value="private">{t('profile.private')}</option>
                  <option value="friends">{t('profile.friendsOnly')}</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('profile.showEmail')}</p>
                  <p className="text-sm text-gray-600">{t('profile.showEmailDesc')}</p>
                </div>
                <Checkbox
                  checked={privacy.showEmail}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showEmail: checked as boolean }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('profile.showPhone')}</p>
                  <p className="text-sm text-gray-600">{t('profile.showPhoneDesc')}</p>
                </div>
                <Checkbox
                  checked={privacy.showPhone}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showPhone: checked as boolean }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setPrivacyOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSavePrivacy}>
                  {t('profile.saveSettings')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change Password Modal */}
        <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('profile.changePasswordTitle')}</DialogTitle>
              <DialogDescription>
                {t('profile.changePasswordDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t('profile.confirmNewPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSavePassword}>
                  {t('profile.changePasswordButton')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </ProtectedRoute>
    </Layout>
  )
}
