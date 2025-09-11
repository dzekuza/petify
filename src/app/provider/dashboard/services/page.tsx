'use client'

import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { dashboardApi } from '@/lib/dashboard'
import { serviceApi } from '@/lib/services'
import { Plus, Scissors } from 'lucide-react'

interface ServiceItem {
  id: string
  name: string
  description: string
  price: number
  images?: string[]
}

export default function ProviderServicesPage() {
  const { user } = useAuth()
  const [providerId, setProviderId] = useState<string | null>(null)
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return
      try {
        setError(null)
        setLoading(true)
        const provider = await dashboardApi.getProviderByUserId(user.id)
        if (!provider?.id) {
          setError('Provider not found')
          setLoading(false)
          return
        }
        setProviderId(provider.id)
        const list = await serviceApi.getServicesByProvider(provider.id)
        setServices((list || []) as ServiceItem[])
      } catch (e) {
        setError('Failed to load services')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  return (
    <ProtectedRoute requiredRole="provider">
      <>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Services</h1>
            <p className="text-gray-600 text-sm">Create and manage the services you offer</p>
          </div>
          <Button onClick={() => window.location.assign('/provider/dashboard/services') } className="gap-2">
            <Plus className="h-4 w-4" /> Add Service
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Services</CardTitle>
            <CardDescription>Services visible to customers when booking</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-gray-600">Loading...</div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : services.length === 0 ? (
              <div className="text-center py-10">
                <Scissors className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No services yet</p>
                <p className="text-sm text-gray-500">Create your first service to start receiving bookings.</p>
                <Button onClick={() => window.location.assign('/provider/dashboard/services') } className="mt-4 gap-2">
                  <Plus className="h-4 w-4" /> Add Service
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(svc => (
                  <div key={svc.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{svc.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{svc.description}</p>
                      </div>
                      <span className="text-sm font-semibold">€{(svc.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.location.assign(`/providers/${providerId}`)}>
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </>
    </ProtectedRoute>
  )
}

