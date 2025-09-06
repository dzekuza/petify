'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { User, Mail, Calendar, Shield, Bell, Lock, Eye, EyeOff } from 'lucide-react'

export default function ProfilePage() {
  const { user, resetPassword } = useAuth()
  const router = useRouter()
  
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

  // Handler functions
  const handleEditProfile = () => {
    setEditProfileOpen(true)
  }

  const handleSaveProfile = async () => {
    // TODO: Implement profile update logic
    console.log('Saving profile:', editForm)
    setEditProfileOpen(false)
  }

  const handleConfigureNotifications = () => {
    setNotificationsOpen(true)
  }

  const handleSaveNotifications = () => {
    // TODO: Implement notifications save logic
    console.log('Saving notifications:', notifications)
    setNotificationsOpen(false)
  }

  const handleManagePrivacy = () => {
    setPrivacyOpen(true)
  }

  const handleSavePrivacy = () => {
    // TODO: Implement privacy save logic
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
    } catch (error) {
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
    <Layout>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Your basic account information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || 'User'} />
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
                          <p className="text-sm font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Member Since</p>
                          <p className="text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Account Type</p>
                          <p className="text-sm text-gray-600 capitalize">
                            {user.user_metadata?.role || 'customer'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button onClick={handleEditProfile}>Edit Profile</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates about bookings and services</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleConfigureNotifications}>Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Privacy Settings</p>
                        <p className="text-sm text-gray-600">Control who can see your information</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleManagePrivacy}>Manage</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Change Password</p>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleChangePassword}>Change</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={handleMyBookings}>
                      My Bookings
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleFavorites}>
                      Favorites
                    </Button>
                    {user.user_metadata?.role === 'provider' && (
                      <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/provider/dashboard')}>
                        Provider Dashboard
                      </Button>
                    )}
                    <Button variant="outline" className="w-full justify-start" onClick={handleHelpSupport}>
                      Help & Support
                    </Button>
                  </CardContent>
                </Card>

                {/* Account Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Email Verified</span>
                        <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                          {user.email_confirmed_at ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Account Status</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your personal information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notifications Modal */}
        <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Email Notifications</DialogTitle>
              <DialogDescription>
                Configure your notification preferences
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Booking Updates</p>
                  <p className="text-sm text-gray-600">Get notified about booking confirmations and changes</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.bookingUpdates}
                  onChange={(e) => setNotifications(prev => ({ ...prev, bookingUpdates: e.target.checked }))}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Service Updates</p>
                  <p className="text-sm text-gray-600">Receive updates about new services and providers</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.serviceUpdates}
                  onChange={(e) => setNotifications(prev => ({ ...prev, serviceUpdates: e.target.checked }))}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing</p>
                  <p className="text-sm text-gray-600">Receive promotional emails and special offers</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.marketing}
                  onChange={(e) => setNotifications(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setNotificationsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveNotifications}>
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Privacy Settings Modal */}
        <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Privacy Settings</DialogTitle>
              <DialogDescription>
                Control who can see your information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                <select
                  id="profileVisibility"
                  value={privacy.profileVisibility}
                  onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Email</p>
                  <p className="text-sm text-gray-600">Allow others to see your email address</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.showEmail}
                  onChange={(e) => setPrivacy(prev => ({ ...prev, showEmail: e.target.checked }))}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Phone</p>
                  <p className="text-sm text-gray-600">Allow others to see your phone number</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.showPhone}
                  onChange={(e) => setPrivacy(prev => ({ ...prev, showPhone: e.target.checked }))}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setPrivacyOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePrivacy}>
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change Password Modal */}
        <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Update your account password
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
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
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
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
                  Cancel
                </Button>
                <Button onClick={handleSavePassword}>
                  Change Password
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </ProtectedRoute>
    </Layout>
  )
}
