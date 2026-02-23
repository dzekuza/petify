'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { BookingWizard } from '@/components/booking/booking-wizard'
import { Button } from '@/components/ui/button'
import { ServiceProvider, Service } from '@/types'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useDeviceDetection } from '@/lib/device-detection'
import { X } from 'lucide-react'

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { isMobile } = useDeviceDetection()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)

  const handleCancel = () => {
    router.back()
  }

  const getProgressWidth = () => {
    return `${(currentStep / 4) * 100}%`
  }

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setLoading(true)
        
        // Fetch provider data
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('id', params.id)
          .eq('status', 'active')
          .single()

        if (providerError) {
          console.error('Error fetching provider:', providerError)
          toast.error('Provider not found')
          return
        }

        if (!providerData) {
          toast.error('Provider not found')
          return
        }

        // Transform provider data to match ServiceProvider interface
        const transformedProvider: ServiceProvider = {
          id: providerData.id,
          userId: providerData.user_id,
          businessName: providerData.business_name,
          businessType: providerData.business_type,
          description: providerData.description,
          services: providerData.services || [],
          location: {
            address: providerData.location?.address || '',
            city: providerData.location?.city || '',
            state: providerData.location?.state || '',
            zipCode: providerData.location?.zip || '',
            coordinates: {
              lat: providerData.location?.coordinates?.lat || 0,
              lng: providerData.location?.coordinates?.lng || 0
            }
          },
          rating: providerData.rating || 0,
          reviewCount: providerData.review_count || 0,
          priceRange: {
            min: providerData.price_range?.min || 0,
            max: providerData.price_range?.max || 100
          },
          availability: providerData.availability || {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
          },
          contactInfo: {
            phone: providerData.contact_info?.phone || '',
            email: providerData.contact_info?.email || '',
            website: providerData.contact_info?.website || ''
          },
          images: providerData.images || [],
          avatarUrl: providerData.avatar_url || null,
          certifications: providerData.certifications || [],
          experience: providerData.experience_years || 0,
          status: providerData.status || 'active',
          createdAt: providerData.created_at,
          updatedAt: providerData.updated_at
        }

        setProvider(transformedProvider)

        // Fetch services for this provider
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('provider_id', params.id)
          .eq('is_active', true)

        if (servicesError) {
          console.error('Error fetching services:', servicesError)
        } else {
          // Transform services data
          const transformedServices: Service[] = (servicesData || []).map(service => ({
            id: service.id,
            providerId: service.provider_id,
            category: service.category,
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration_minutes,
            maxPets: service.max_pets,
            requirements: service.requirements || [],
            includes: service.includes || [],
            images: service.images || [],
            status: service.is_active ? 'active' : 'inactive',
            createdAt: service.created_at,
            updatedAt: service.updated_at
          }))
          setServices(transformedServices)
        }

      } catch (error) {
        console.error('Error fetching provider data:', error)
        toast.error('Failed to load provider data')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProviderData()
    }
  }, [params.id])

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout hideFooter={isMobile}>
          <div className="min-h-screen bg-muted py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-32 bg-muted rounded"></div>
                    <div className="h-64 bg-muted rounded"></div>
                  </div>
                  <div className="h-96 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (!provider) {
    return (
      <ProtectedRoute>
        <Layout hideFooter={isMobile}>
          <div className="min-h-screen bg-muted py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-4">Provider not found</h1>
                <p className="text-muted-foreground">The provider you're looking for doesn't exist.</p>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout hideFooter={isMobile}>
        <div className="min-h-screen bg-white">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-lg font-semibold text-foreground">{provider.businessName}</h1>
                  <p className="text-sm text-muted-foreground">Užsakymo formos užpildymas</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Atšaukti rezervaciją</span>
              </Button>
            </div>
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: getProgressWidth() }}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto px-6 py-8">
            <BookingWizard 
              provider={provider} 
              services={services} 
              onStepChange={setCurrentStep}
            />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}