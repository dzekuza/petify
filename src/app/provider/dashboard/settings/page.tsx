'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { BusinessSettings } from '@/components/provider-dashboard/business-settings'
import { BusinessNavigation } from '@/components/provider-dashboard/business-navigation'
import { dashboardApi } from '@/lib/dashboard'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Save, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function BusinessSettingsPage() {
  const { user } = useAuth()
  const [businessType, setBusinessType] = useState<string>('')
  const [providerData, setProviderData] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    const fetchProviderData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        const provider = await dashboardApi.getProviderByUserId(user.id)
        if (provider) {
          setBusinessType(provider.business_type || 'individual')
          setProviderData(provider)
        }
      } catch (error) {
        console.error('Error fetching provider data:', error)
        toast.error('Failed to load provider data')
      } finally {
        setLoading(false)
      }
    }

    fetchProviderData()
  }, [user?.id])

  const handleUpdate = async (newSettings: Record<string, any>) => {
    if (!user?.id) return

    try {
      setSaving(true)
      
      // Here you would typically save to your API
      // For now, we'll just update the local state
      setProviderData((prev: Record<string, any> | null) => ({ ...prev, ...newSettings }))
      setLastSaved(new Date())
      
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <ProtectedRoute requiredRole="provider">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading settings...</p>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  return (
    <Layout hideFooter={true}>
      <ProtectedRoute requiredRole="provider">
        <div className="min-h-screen bg-gray-50">
          {/* Business Navigation */}
          {businessType && (
            <BusinessNavigation businessType={businessType} />
          )}
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Settings className="h-8 w-8 mr-3 text-blue-600" />
                    Business Settings
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Configure your {businessType} business parameters and preferences
                  </p>
                </div>
                
                {lastSaved && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>

            {/* Business Settings */}
            {businessType && providerData && (
              <BusinessSettings
                businessType={businessType}
                providerData={providerData}
                onUpdate={handleUpdate}
              />
            )}

            {/* Additional Settings */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>General Business Information</CardTitle>
                  <CardDescription>
                    Update your basic business information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Name
                        </label>
                        <input
                          type="text"
                          defaultValue={providerData?.business_name || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Type
                        </label>
                        <input
                          type="text"
                          value={businessType}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Description
                      </label>
                      <textarea
                        defaultValue={providerData?.description || ''}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <Button 
                      disabled={saving}
                      className="w-full md:w-auto"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save General Settings
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
