'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
// Removed global Layout wrapper to use dashboard layout shell
import { AdminProtectedRoute } from '@/components/admin-protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Building2, Calendar, DollarSign, TrendingUp, Edit, Trash2, Eye, EyeOff, Key } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface AdminStats {
  totalUsers: number
  totalProviders: number
  totalBookings: number
  totalRevenue: number
  monthlyRevenue: number
  activeProviders: number
  pendingProviders: number
  totalPets: number
  totalServices: number
  businessTypeStats: Record<string, number>
}

interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: string
  created_at: string
  providers?: {
    business_name: string
    status: string
  }
}

interface Provider {
  id: string
  user_id: string
  business_name: string
  business_type: string
  description: string
  services: string[]
  location: {
    address: string
    city: string
    state: string
    zip: string
  }
  contact_info: {
    phone: string
    email: string
    website?: string
  }
  status: string
  is_verified: boolean
  created_at: string
  updated_at: string
  users: {
    id: string
    email: string
    full_name: string
    role: string
  }
}

interface Service {
  id: string
  name: string
  category: string
  description: string
  price: number
  duration_minutes: number
  max_pets: number
  requirements: string[]
  includes: string[]
  images: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  providers: {
    id: string
    business_name: string
    business_type: string
    status: string
    is_verified: boolean
    users: {
      id: string
      email: string
      full_name: string
    }
  }
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [editUserModal, setEditUserModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
  const [changePasswordModal, setChangePasswordModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
  const [editProviderModal, setEditProviderModal] = useState<{ open: boolean; provider: Provider | null }>({ open: false, provider: null })
  
  // Form states
  const [editUserForm, setEditUserForm] = useState({ full_name: '', email: '', phone: '' })
  const [newPassword, setNewPassword] = useState('')
  const [editProviderForm, setEditProviderForm] = useState({ status: '', is_verified: false })


  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('No authentication token found')
        return
      }

      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
      
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats', { headers })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      } else {
        console.error('Failed to fetch stats:', statsResponse.status, statsResponse.statusText)
      }

      // Fetch users
      const usersResponse = await fetch('/api/admin/users', { headers })
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      } else {
        console.error('Failed to fetch users:', usersResponse.status, usersResponse.statusText)
      }

      // Fetch providers
      const providersResponse = await fetch('/api/admin/providers', { headers })
      if (providersResponse.ok) {
        const providersData = await providersResponse.json()
        setProviders(providersData)
      } else {
        const errorText = await providersResponse.text()
        console.error('Failed to fetch providers:', providersResponse.status, providersResponse.statusText, errorText)
      }

      // Fetch services/listings
      const servicesResponse = await fetch('/api/admin/listings', { headers })
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        setServices(servicesData)
      } else {
        const errorText = await servicesResponse.text()
        console.error('Failed to fetch services:', servicesResponse.status, servicesResponse.statusText, errorText)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('No authentication token found')
        return
      }

      const response = await fetch('/api/admin/update-user-role', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (response.ok) {
        toast.success('User role updated successfully')
        fetchAdminData() // Refresh data
      } else {
        toast.error('Failed to update user role')
      }
    } catch (error) {
      toast.error('Error updating user role')
    }
  }

  const handleEditUser = (user: User) => {
    setEditUserForm({
      full_name: user.full_name || '',
      email: user.email,
      phone: user.phone || ''
    })
    setEditUserModal({ open: true, user })
  }

  const handleSaveUser = async () => {
    if (!editUserModal.user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('No authentication token found')
        return
      }

      const response = await fetch(`/api/admin/users/${editUserModal.user.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editUserForm),
      })

      if (response.ok) {
        toast.success('User updated successfully')
        setEditUserModal({ open: false, user: null })
        fetchAdminData()
      } else {
        toast.error('Failed to update user')
      }
    } catch (error) {
      toast.error('Error updating user')
    }
  }

  const handleChangePassword = (user: User) => {
    setNewPassword('')
    setChangePasswordModal({ open: true, user })
  }

  const handleSavePassword = async () => {
    if (!changePasswordModal.user || !newPassword) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('No authentication token found')
        return
      }

      const response = await fetch(`/api/admin/users/${changePasswordModal.user.id}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      })

      if (response.ok) {
        toast.success('Password updated successfully')
        setChangePasswordModal({ open: false, user: null })
        setNewPassword('')
      } else {
        toast.error('Failed to update password')
      }
    } catch (error) {
      toast.error('Error updating password')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('No authentication token found')
        return
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        toast.success('User deleted successfully')
        fetchAdminData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete user')
      }
    } catch (error) {
      toast.error('Error deleting user')
    }
  }

  const handleEditProvider = (provider: Provider) => {
    setEditProviderForm({
      status: provider.status,
      is_verified: provider.is_verified
    })
    setEditProviderModal({ open: true, provider })
  }

  const handleSaveProvider = async () => {
    if (!editProviderModal.provider) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('No authentication token found')
        return
      }

      const response = await fetch(`/api/admin/providers/${editProviderModal.provider.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editProviderForm),
      })

      if (response.ok) {
        toast.success('Provider updated successfully')
        setEditProviderModal({ open: false, provider: null })
        fetchAdminData()
      } else {
        toast.error('Failed to update provider')
      }
    } catch (error) {
      toast.error('Error updating provider')
    }
  }

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this provider and all related data? This action cannot be undone.')) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('No authentication token found')
        return
      }

      const response = await fetch(`/api/admin/providers/${providerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        toast.success('Provider deleted successfully')
        fetchAdminData()
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Failed to delete provider')
      }
    } catch (error) {
      toast.error('Error deleting provider')
    }
  }

  const handleToggleService = async (serviceId: string, isActive: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('No authentication token found')
        return
      }

      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (response.ok) {
        toast.success(`Service ${!isActive ? 'activated' : 'deactivated'} successfully`)
        fetchAdminData()
      } else {
        toast.error('Failed to update service')
      }
    } catch (error) {
      toast.error('Error updating service')
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('No authentication token found')
        return
      }

      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        toast.success('Service deleted successfully')
        fetchAdminData()
      } else {
        toast.error('Failed to delete service')
      }
    } catch (error) {
      toast.error('Error deleting service')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminProtectedRoute>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage users, providers, and system settings</p>
            </div>

          {/* Stats Cards */}
          {stats && (
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeProviders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Business Types</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(stats.businessTypeStats).length}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs removed; content moved to dedicated routes via sidebar */}
          {/* <div className="mx-auto max-w-7xl"> */}
          {/* <Tabs defaultValue="users" className="flex w-full flex-col justify-start gap-6"> */}
          {/*   <TabsList className="bg-muted text-muted-foreground h-9 w-fit items-center justify-center rounded-lg p-[3px] hidden @4xl/main:flex"> */}
          {/*     <TabsTrigger value="users">Users</TabsTrigger> */}
          {/*     <TabsTrigger value="providers">Providers</TabsTrigger> */}
          {/*     <TabsTrigger value="listings">Listings</TabsTrigger> */}
          {/*     <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
          {/*   </TabsList> */}

            {/* <TabsContent value="users" className="flex-1 outline-none space-y-4 px-4 lg:px-6"> */}
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-medium">{user.full_name || 'No name'}</h3>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'provider' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                            {user.providers && (
                              <Badge variant="outline">
                                {user.providers.business_name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangePassword(user)}
                          >
                            <Key className="h-4 w-4 mr-1" />
                            Password
                          </Button>
                          {user.role !== 'admin' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRoleUpdate(user.id, 'customer')}
                                disabled={user.role === 'customer'}
                              >
                                Make Customer
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRoleUpdate(user.id, 'provider')}
                                disabled={user.role === 'provider'}
                              >
                                Make Provider
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            {/* </TabsContent> */}

            {/* <TabsContent value="providers" className="flex-1 outline-none space-y-4 px-4 lg:px-6"> */}
              <Card>
                <CardHeader>
                  <CardTitle>Provider Management</CardTitle>
                  <CardDescription>
                    Manage service providers and their verification status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {providers.length === 0 ? (
                      <p className="text-gray-600 text-center py-8">No providers found</p>
                    ) : (
                      providers.map((provider) => (
                        <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <h3 className="font-medium">{provider.business_name}</h3>
                                <p className="text-sm text-gray-600">{provider.users.full_name} ({provider.users.email})</p>
                                <p className="text-sm text-gray-500">{provider.business_type} • {provider.location.city}, {provider.location.state}</p>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant={provider.status === 'active' ? 'default' : provider.status === 'pending_verification' ? 'secondary' : 'destructive'}>
                                  {provider.status}
                                </Badge>
                                {provider.is_verified && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">{provider.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Services: {provider.services.map(formatServiceName).join(', ')}
                              </p>
                              <p className="text-xs text-gray-500">
                                Created: {new Date(provider.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/providers/${provider.id}`, '_blank')}
                            >
                              View Profile
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProvider(provider)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProvider(provider.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            {/* </TabsContent> */}

            {/* <TabsContent value="listings" className="flex-1 outline-none space-y-4 px-4 lg:px-6"> */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Listings</CardTitle>
                  <CardDescription>
                    Manage all service listings from all businesses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.length === 0 ? (
                      <p className="text-gray-600 text-center py-8">No service listings found</p>
                    ) : (
                      services.map((service) => (
                        <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <h3 className="font-medium">{service.name}</h3>
                                <p className="text-sm text-gray-600">{service.providers.business_name} • {service.providers.business_type}</p>
                                <p className="text-sm text-gray-500">{service.category} • €{service.price} • {service.duration_minutes}min</p>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant={service.is_active ? 'default' : 'secondary'}>
                                  {service.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge variant={service.providers.is_verified ? 'outline' : 'destructive'}>
                                  {service.providers.is_verified ? 'Verified' : 'Unverified'}
                                </Badge>
                                <Badge variant="outline">
                                  {service.providers.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">{service.description}</p>
                              {service.requirements && service.requirements.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Requirements: {service.requirements.join(', ')}
                                </p>
                              )}
                              {service.includes && service.includes.length > 0 && (
                                <p className="text-xs text-gray-500">
                                  Includes: {service.includes.join(', ')}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Max pets: {service.max_pets} • Created: {new Date(service.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/providers/${service.providers.id}`, '_blank')}
                            >
                              View Provider
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleService(service.id, service.is_active)}
                            >
                              {service.is_active ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Show
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            {/* </TabsContent> */}

            {/* <TabsContent value="analytics" className="flex-1 outline-none space-y-4 px-4 lg:px-6"> */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Business Type Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Business Type Distribution</CardTitle>
                    <CardDescription>
                      Distribution of providers by business type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats && Object.keys(stats.businessTypeStats).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(stats.businessTypeStats).map(([type, count]) => {
                          const percentage = (count / stats.totalProviders) * 100
                          return (
                            <div key={type} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm font-medium capitalize">{type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">{count}</span>
                                <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-4">No business type data available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Revenue Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>
                      Revenue breakdown and trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Revenue</span>
                          <span className="text-lg font-bold">€{stats.totalRevenue.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">This Month</span>
                          <span className="text-lg font-bold text-green-600">€{stats.monthlyRevenue.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Average per Booking</span>
                          <span className="text-lg font-bold">
                            €{stats.totalBookings > 0 ? (stats.totalRevenue / stats.totalBookings).toFixed(2) : '0.00'}
                          </span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Monthly Growth</span>
                            <span className="text-green-600">
                              {stats.totalRevenue > 0 ? ((stats.monthlyRevenue / stats.totalRevenue) * 100).toFixed(1) : '0'}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Platform Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Activity</CardTitle>
                    <CardDescription>
                      Key platform metrics and activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                            <div className="text-xs text-blue-600">Total Users</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stats.activeProviders}</div>
                            <div className="text-xs text-green-600">Active Providers</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{stats.totalBookings}</div>
                            <div className="text-xs text-purple-600">Total Bookings</div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{stats.totalPets}</div>
                            <div className="text-xs text-orange-600">Registered Pets</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Service Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service Categories</CardTitle>
                    <CardDescription>
                      Distribution of services by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {services.length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(
                          services.reduce((acc, service) => {
                            acc[service.category] = (acc[service.category] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                        ).map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm font-medium capitalize">{category}</span>
                            </div>
                            <span className="text-sm text-gray-600">{count} services</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-4">No service data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            {/* </TabsContent> */}
          {/* </Tabs> */}
          {/* </div> */}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <Dialog open={editUserModal.open} onOpenChange={(open) => setEditUserModal({ open, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information for {editUserModal.user?.email}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserModal({ open: false, user: null })}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>Save Changes</Button>
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
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordModal({ open: false, user: null })}>
              Cancel
            </Button>
            <Button onClick={handleSavePassword} disabled={newPassword.length < 6}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Provider Modal */}
      <Dialog open={editProviderModal.open} onOpenChange={(open) => setEditProviderModal({ open, provider: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
            <DialogDescription>
              Update provider status and verification for {editProviderModal.provider?.business_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={editProviderForm.status} onValueChange={(value) => setEditProviderForm({ ...editProviderForm, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_verification">Pending Verification</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_verified"
                checked={editProviderForm.is_verified}
                onChange={(e) => setEditProviderForm({ ...editProviderForm, is_verified: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_verified">Verified Provider</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProviderModal({ open: false, provider: null })}>
              Cancel
            </Button>
            <Button onClick={handleSaveProvider}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminProtectedRoute>
  )
}

// Helper to map service IDs/slugs to human-friendly names
const formatServiceName = (id: string): string => {
  const known: Record<string, string> = {
    'basic-bath': 'Paprastas maudymas',
    'full-grooming': 'Pilnas kirpimas ir priežiūra',
    'nail-trimming': 'Nagų kirpimas',
    'ear-cleaning': 'Ausų valymas',
    'teeth-cleaning': 'Dantų valymas',
  }

  if (known[id]) return known[id]
  if (id.startsWith('custom-')) return 'Pasirinktinė paslauga'

  const pretty = id
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  return pretty
}
