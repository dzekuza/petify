'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { AdminProtectedRoute } from '@/components/admin-protected-route'
import { AdminStats } from '@/components/admin/admin-stats'
import { UserManagement } from '@/components/admin/user-management'
import { ProviderManagement } from '@/components/admin/provider-management'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { AdminStats as AdminStatsType, User, Provider, Service } from '@/components/admin/types'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStatsType | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

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
        console.error('Failed to fetch providers:', providersResponse.status, providersResponse.statusText)
      }

      // Fetch services
      const servicesResponse = await fetch('/api/admin/services', { headers })
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        setServices(servicesData)
      } else {
        console.error('Failed to fetch services:', servicesResponse.status, servicesResponse.statusText)
      }

    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      // Refresh users data
      await fetchAdminData()
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  const handlePasswordChange = async (userId: string, newPassword: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/admin/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      })

      if (!response.ok) {
        throw new Error('Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }

  const handleProviderUpdate = async (providerId: string, updates: Partial<Provider>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/admin/providers/${providerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update provider')
      }

      // Refresh providers data
      await fetchAdminData()
    } catch (error) {
      console.error('Error updating provider:', error)
      throw error
    }
  }

  return (
    <AdminProtectedRoute>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        </div>

        {/* Stats Overview */}
        <AdminStats stats={stats} loading={loading} />

        {/* Management Sections */}
        <div className="grid gap-6">
          <UserManagement
            users={users}
            loading={loading}
            onUserUpdate={handleUserUpdate}
            onPasswordChange={handlePasswordChange}
          />

          <ProviderManagement
            providers={providers}
            loading={loading}
            onProviderUpdate={handleProviderUpdate}
          />
        </div>
      </div>
    </AdminProtectedRoute>
  )
}
