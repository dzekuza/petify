'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit, Trash2, Eye, EyeOff, Key } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from './types'

interface UserManagementProps {
  users: User[]
  loading: boolean
  onUserUpdate: (userId: string, updates: Partial<User>) => Promise<void>
  onPasswordChange: (userId: string, newPassword: string) => Promise<void>
}

export function UserManagement({ users, loading, onUserUpdate, onPasswordChange }: UserManagementProps) {
  const [editUserModal, setEditUserModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
  const [changePasswordModal, setChangePasswordModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
  const [editUserForm, setEditUserForm] = useState({ full_name: '', email: '', phone: '', role: '' })
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEditUser = (user: User) => {
    setEditUserForm({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || ''
    })
    setEditUserModal({ open: true, user })
  }

  const handleChangePassword = (user: User) => {
    setNewPassword('')
    setChangePasswordModal({ open: true, user })
  }

  const handleSaveUser = async () => {
    if (!editUserModal.user) return
    
    setIsSubmitting(true)
    try {
      await onUserUpdate(editUserModal.user.id, editUserForm)
      setEditUserModal({ open: false, user: null })
      toast.success('User updated successfully')
    } catch (error) {
      toast.error('Failed to update user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSavePassword = async () => {
    if (!changePasswordModal.user || !newPassword) return
    
    setIsSubmitting(true)
    try {
      await onPasswordChange(changePasswordModal.user.id, newPassword)
      setChangePasswordModal({ open: false, user: null })
      setNewPassword('')
      toast.success('Password changed successfully')
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage platform users and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage platform users and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{user.full_name || 'No name'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      {user.providers && (
                        <Badge variant="outline">
                          Provider
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangePassword(user)}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={editUserModal.open} onOpenChange={(open) => setEditUserModal({ open, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={editUserForm.full_name}
                onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editUserForm.phone}
                onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={editUserForm.role}
                onValueChange={(value) => setEditUserForm({ ...editUserForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserModal({ open: false, user: null })}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={changePasswordModal.open} onOpenChange={(open) => setChangePasswordModal({ open, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {changePasswordModal.user?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordModal({ open: false, user: null })}>
              Cancel
            </Button>
            <Button onClick={handleSavePassword} disabled={isSubmitting || !newPassword}>
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
