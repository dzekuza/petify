"use client"

import { AdminProtectedRoute } from '@/components/admin-protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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
  }
}

export default function AdminListingsPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return
        const res = await fetch('/api/admin/listings', { headers: { Authorization: `Bearer ${session.access_token}` } })
        if (res.ok) setServices(await res.json())
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [])

  if (loading) return <div className="px-4 py-6">Loading...</div>

  return (
    <AdminProtectedRoute>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl font-bold">Listings</h1>
            <p className="mt-1 text-muted-foreground text-sm">Manage all service listings from all businesses</p>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Service Listings</CardTitle>
                <CardDescription>Manage all service listings from all businesses</CardDescription>
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
                              <Badge variant={service.is_active ? 'default' : 'secondary'}>{service.is_active ? 'Active' : 'Inactive'}</Badge>
                              <Badge variant={service.providers.is_verified ? 'outline' : 'destructive'}>
                                {service.providers.is_verified ? 'Verified' : 'Unverified'}
                              </Badge>
                              <Badge variant="outline">{service.providers.status}</Badge>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">{service.description}</p>
                            {service.requirements?.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">Requirements: {service.requirements.join(', ')}</p>
                            )}
                            {service.includes?.length > 0 && (
                              <p className="text-xs text-gray-500">Includes: {service.includes.join(', ')}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Max pets: {service.max_pets} • Created: {new Date(service.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            {service.is_active ? (<><EyeOff className="h-4 w-4 mr-1" /> Hide</>) : (<><Eye className="h-4 w-4 mr-1" /> Show</>)}
                          </Button>
                          <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  )
}
