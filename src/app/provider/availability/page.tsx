'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AvailabilityCalendar from '@/components/availability-calendar'
import { ServiceProvider } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { providerApi } from '@/lib/providers'

export default function ProviderAvailabilityPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProviderData = async () => {
      if (!user) return

      try {
        setLoading(true)
        const providerData = await providerApi.getProviderByUserId(user.id)
        setProvider(providerData)
      } catch (error) {
        console.error('Error fetching provider data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProviderData()
  }, [user])

  const handleAvailabilityUpdate = async (updatedAvailability: Record<string, unknown>) => {
    if (!provider) return

    try {
      // Convert to boolean format for API
      const availabilityBoolean: Record<string, boolean> = {}
      Object.entries(updatedAvailability).forEach(([day, value]) => {
        if (Array.isArray(value)) {
          availabilityBoolean[day] = value.length > 0
        } else if (typeof value === 'boolean') {
          availabilityBoolean[day] = value
        } else {
          availabilityBoolean[day] = false
        }
      })
      
      await providerApi.updateProvider(provider.id, {
        availability: availabilityBoolean
      })
      
      // Update local state - convert back to proper format
      setProvider(prev => prev ? {
        ...prev,
        availability: {
          monday: Array.isArray(updatedAvailability.monday) ? updatedAvailability.monday as any[] : [],
          tuesday: Array.isArray(updatedAvailability.tuesday) ? updatedAvailability.tuesday as any[] : [],
          wednesday: Array.isArray(updatedAvailability.wednesday) ? updatedAvailability.wednesday as any[] : [],
          thursday: Array.isArray(updatedAvailability.thursday) ? updatedAvailability.thursday as any[] : [],
          friday: Array.isArray(updatedAvailability.friday) ? updatedAvailability.friday as any[] : [],
          saturday: Array.isArray(updatedAvailability.saturday) ? updatedAvailability.saturday as any[] : [],
          sunday: Array.isArray(updatedAvailability.sunday) ? updatedAvailability.sunday as any[] : []
        }
      } : null)
    } catch (error) {
      console.error('Error updating availability:', error)
    }
  }

  if (loading) {
    return (
      <Layout>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  if (!provider) {
    return (
      <Layout>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider Not Found</h1>
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
    <Layout>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/provider/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Availability Management</h1>
              <p className="text-gray-600 mt-2">
                Manage your working hours and availability for {provider.businessName}
              </p>
            </div>

            {/* Availability Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Working Hours & Availability</CardTitle>
                <CardDescription>
                  Set your working hours and manage your availability for each day of the week.
                  Customers will only be able to book during your available time slots.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AvailabilityCalendar
                  provider={provider}
                  onAvailabilityUpdate={handleAvailabilityUpdate}
                />
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>How to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Setting Working Hours</h4>
                    <p>Click on any day to set your working hours. You can set different hours for each day of the week.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Managing Time Slots</h4>
                    <p>Once you set working hours, time slots will be automatically generated in 15-minute intervals. Click on individual slots to mark them as available or unavailable.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Blocking Time</h4>
                    <p>You can block specific time slots for breaks, personal appointments, or any other reason. Blocked slots will not be available for customer bookings.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Saving Changes</h4>
                    <p>All changes are automatically saved. Your availability will be updated immediately and visible to customers on your public profile.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
