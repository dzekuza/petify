'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { BusinessSettings } from '@/components/provider-dashboard/business-settings'
import { GeneralBusinessInfo } from '@/components/provider-dashboard/general-business-info'
import { dashboardApi } from '@/lib/dashboard'
import { useAuth } from '@/contexts/auth-context'
import { CheckCircle, Settings } from 'lucide-react'
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
    if (!user?.id || !providerData?.id) return

    try {
      setSaving(true)
      
      // Prepare the data for saving
      const updateData: any = {
        business_name: newSettings.businessName,
        description: newSettings.businessDescription,
        contact_info: {
          phone: newSettings.phone,
          email: newSettings.email,
          website: newSettings.website
        },
        location: {
          address: newSettings.address,
          city: newSettings.city,
          state: newSettings.state,
          zip_code: newSettings.zipCode,
          country: newSettings.country
        },
        business_hours: newSettings.business_hours
      }

      // Handle media uploads if they exist
      if (newSettings.logo) {
        // TODO: Upload logo to storage and get URL
        // For now, we'll just update the avatar_url field
        updateData.avatar_url = newSettings.logo_url
      }

      if (newSettings.cover_image) {
        // TODO: Upload cover image to storage and get URL
        // For now, we'll update the images array
        const existingImages = providerData.images || []
        const newImages = [newSettings.cover_image_url, ...existingImages.slice(1)]
        updateData.images = newImages
      }

      if (newSettings.gallery_images && newSettings.gallery_images.length > 0) {
        // TODO: Upload gallery images to storage and get URLs
        // For now, we'll update the images array
        const existingImages = providerData.images || []
        const newImages = [existingImages[0], ...newSettings.gallery_image_urls]
        updateData.images = newImages
      }

      // Save to database
      const { data, error } = await dashboardApi.updateProvider(providerData.id, updateData)
      
      if (error) {
        throw error
      }

      // Update local state
      setProviderData((prev: Record<string, any> | null) => ({ ...prev, ...updateData }))
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
      <ProtectedRoute requiredRole="provider">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="provider">
      <>
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

        {/* General Business Information */}
        {providerData && (
          <div className="mt-8">
            <GeneralBusinessInfo
              providerData={providerData}
              onUpdate={handleUpdate}
            />
          </div>
        )}
      </>
    </ProtectedRoute>
  )
}
