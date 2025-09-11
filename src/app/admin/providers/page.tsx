"use client"

import { AdminProtectedRoute } from '@/components/admin-protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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
  const pretty = id.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return pretty
}

interface Provider {
  id: string
  user_id: string
  business_name: string
  business_type: string
  description: string
  services: string[]
  location: { address: string; city: string; state: string; zip: string }
  contact_info: { phone: string; email: string; website?: string }
  status: string
  is_verified: boolean
  created_at: string
  updated_at: string
  users: { id: string; email: string; full_name: string; role: string }
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return
        const res = await fetch('/api/admin/providers', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setProviders(data)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProviders()
  }, [])

  if (loading) return <div className="px-4 py-6">Loading...</div>

  return (
    <AdminProtectedRoute>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl font-bold">Providers</h1>
            <p className="mt-1 text-muted-foreground text-sm">Manage service providers and their verification status</p>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Provider Management</CardTitle>
                <CardDescription>Manage service providers and their verification status</CardDescription>
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
                                <Badge variant="outline" className="text-green-600 border-green-600">Verified</Badge>
                              )}
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">{provider.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Services: {provider.services.map(formatServiceName).join(', ')}</p>
                            <p className="text-xs text-gray-500">Created: {new Date(provider.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => window.open(`/providers/${provider.id}`, '_blank')}>View Profile</Button>
                          <Button size="sm" variant="outline"><Edit className="h-4 w-4 mr-1" /> Edit</Button>
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
