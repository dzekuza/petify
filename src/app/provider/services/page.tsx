'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Edit, 
  Trash2,
  X,
  Clock,
  DollarSign,
  Users,
  PawPrint
} from 'lucide-react'
import { ServiceProvider, Service, CreateServiceForm, ServiceCategory } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { useNotifications } from '@/contexts/notifications-context'
import { providerApi } from '@/lib/providers'
import { serviceApi } from '@/lib/services'
import { useDeviceDetection } from '@/lib/device-detection'

export default function ProviderServicesPage() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const { isMobile } = useDeviceDetection()
  const router = useRouter()
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceFormLoading, setServiceFormLoading] = useState(false)
  const [serviceForm, setServiceForm] = useState<CreateServiceForm>({
    category: 'grooming',
    name: '',
    description: '',
    price: 0,
    duration: 60,
    maxPets: 1,
    requirements: [],
    includes: [],
    images: []
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        if (user?.id) {
          // Load provider data
          const providerData = await providerApi.getProviderByUserId(user.id)
          
          if (providerData) {
            const serviceProvider: ServiceProvider = {
              id: providerData.id,
              userId: providerData.user_id,
              businessName: providerData.business_name,
              description: providerData.description || '',
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
              contactInfo: {
                phone: providerData.contact_info?.phone || '',
                email: providerData.contact_info?.email || user?.email || '',
                website: providerData.contact_info?.website || ''
              },
              rating: providerData.rating || 0,
              reviewCount: providerData.review_count || 0,
              priceRange: {
                min: providerData.price_range?.min || 0,
                max: providerData.price_range?.max || 0
              },
              availability: providerData.availability || {},
              images: providerData.images || [],
              certifications: providerData.certifications || [],
              experience: providerData.experience_years || 0,
              status: providerData.status || 'active',
              createdAt: providerData.created_at,
              updatedAt: providerData.updated_at
            }
            
            setProvider(serviceProvider)
            
            // Load services
            const providerServices = await serviceApi.getServicesByProvider(providerData.id)
            setServices(providerServices)
          }
        }
        
      } catch (error) {
        console.error('Error loading data:', error)
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load services data. Please try again.'
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, addNotification])

  const handleServiceFormChange = (field: keyof CreateServiceForm, value: string | number | string[]) => {
    setServiceForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()
    setServiceFormLoading(true)

    try {
      if (!provider?.id) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Provider profile not found'
        })
        return
      }

      // Get the provider's service category from their profile
      const providerCategory = provider.services?.[0] || 'grooming'
      
      // Create service in database
      const newService = await serviceApi.createService({
        providerId: provider.id,
        category: providerCategory as ServiceCategory,
        name: serviceForm.name,
        description: serviceForm.description,
        price: serviceForm.price,
        duration: serviceForm.duration,
        maxPets: serviceForm.maxPets,
        requirements: serviceForm.requirements,
        includes: serviceForm.includes,
        images: []
      })

      // Convert database format to our Service type
      const service: Service = {
        id: newService.id,
        providerId: newService.provider_id,
        category: newService.category,
        name: newService.name,
        description: newService.description,
        price: newService.price,
        duration: newService.duration_minutes,
        maxPets: newService.max_pets,
        requirements: newService.requirements,
        includes: newService.includes,
        images: newService.images,
        status: newService.is_active ? 'active' : 'inactive',
        createdAt: newService.created_at,
        updatedAt: newService.updated_at
      }

      // Update local state
      setServices(prev => [...prev, service])
      
      // Reset form
      setServiceForm({
        category: 'grooming',
        name: '',
        description: '',
        price: 0,
        duration: 60,
        maxPets: 1,
        requirements: [],
        includes: [],
        images: []
      })
      
      // Close modal
      setShowAddServiceModal(false)
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Service Created',
        message: 'Your service has been created successfully!'
      })
    } catch (error) {
      console.error('Error creating service:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create service. Please try again.'
      })
    } finally {
      setServiceFormLoading(false)
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setServiceForm({
      category: service.category,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      maxPets: service.maxPets,
      requirements: service.requirements || [],
      includes: service.includes || [],
      images: []
    })
    setShowEditServiceModal(true)
  }

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault()
    setServiceFormLoading(true)

    try {
      if (!editingService) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'No service selected for editing'
        })
        return
      }

      // Update service in database
      const updatedService = await serviceApi.updateService(editingService.id, {
        name: serviceForm.name,
        description: serviceForm.description,
        price: serviceForm.price,
        duration: serviceForm.duration,
        maxPets: serviceForm.maxPets,
        requirements: serviceForm.requirements,
        includes: serviceForm.includes,
        images: [] // TODO: Handle file uploads
      })

      // Convert database format to our Service type
      const service: Service = {
        id: updatedService.id,
        providerId: updatedService.provider_id,
        category: updatedService.category,
        name: updatedService.name,
        description: updatedService.description,
        price: updatedService.price,
        duration: updatedService.duration_minutes,
        maxPets: updatedService.max_pets,
        requirements: updatedService.requirements,
        includes: updatedService.includes,
        images: updatedService.images,
        status: updatedService.is_active ? 'active' : 'inactive',
        createdAt: updatedService.created_at,
        updatedAt: updatedService.updated_at
      }

      // Update local state
      setServices(prev => prev.map(s => s.id === editingService.id ? service : s))
      
      // Reset form and close modal
      setEditingService(null)
      setShowEditServiceModal(false)
      setServiceForm({
        category: 'grooming',
        name: '',
        description: '',
        price: 0,
        duration: 60,
        maxPets: 1,
        requirements: [],
        includes: [],
        images: []
      })
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Service Updated',
        message: 'Your service has been updated successfully!'
      })
    } catch (error) {
      console.error('Error updating service:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update service. Please try again.'
      })
    } finally {
      setServiceFormLoading(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return
    }

    try {
      await serviceApi.deleteService(serviceId)
      
      // Update local state
      setServices(prev => prev.filter(s => s.id !== serviceId))
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Service Deleted',
        message: 'Your service has been deleted successfully.'
      })
    } catch (error) {
      console.error('Error deleting service:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete service. Please try again.'
      })
    }
  }

  if (loading) {
    return (
      <Layout hideServiceCategories={true}>
        <ProtectedRoute requiredRole="provider">
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  if (!provider) {
    return (
      <Layout hideServiceCategories={true}>
        <ProtectedRoute requiredRole="provider">
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-12">
                <PawPrint className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Found</h3>
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
    <Layout hideServiceCategories={true}>
      <ProtectedRoute requiredRole="provider">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Services</h1>
                  <p className="text-gray-600">Create and manage your service offerings</p>
                </div>
                <Button onClick={() => setShowAddServiceModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </div>

            {/* Services Grid */}
            {services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {service.description}
                          </CardDescription>
                        </div>
                        <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                          {service.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">€{service.price}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>{service.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span>{service.maxPets} pet{service.maxPets > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {service.includes && service.includes.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Includes:</p>
                          <div className="flex flex-wrap gap-1">
                            {service.includes.slice(0, 3).map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                            {service.includes.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{service.includes.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditService(service)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <PawPrint className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Yet</h3>
                <p className="text-gray-600 mb-6">Create your first service to start accepting bookings</p>
                <Button onClick={() => setShowAddServiceModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Service
                </Button>
              </div>
            )}

            {/* Add Service Modal */}
            <Dialog open={showAddServiceModal} onOpenChange={setShowAddServiceModal}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Service</DialogTitle>
                  <DialogDescription>
                    Create a new service offering for your customers to book.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateService} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serviceName">Service Name *</Label>
                      <Input
                        id="serviceName"
                        type="text"
                        value={serviceForm.name}
                        onChange={(e) => handleServiceFormChange('name', e.target.value)}
                        placeholder="e.g., Dog Grooming, Pet Sitting"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="serviceCategory">Service Category</Label>
                      <Input
                        id="serviceCategory"
                        type="text"
                        value={provider?.services?.[0] ? provider.services[0].charAt(0).toUpperCase() + provider.services[0].slice(1) : 'Grooming'}
                        disabled
                        className="mt-1 bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Category is set based on your provider profile</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="serviceDescription">Service Description *</Label>
                    <Textarea
                      id="serviceDescription"
                      value={serviceForm.description}
                      onChange={(e) => handleServiceFormChange('description', e.target.value)}
                      placeholder="Describe what your service includes and what makes it special..."
                      className="mt-1"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="servicePrice">Price (€) *</Label>
                      <Input
                        id="servicePrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceForm.price}
                        onChange={(e) => handleServiceFormChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="serviceDuration">Duration (minutes) *</Label>
                      <Input
                        id="serviceDuration"
                        type="number"
                        min="15"
                        step="15"
                        value={serviceForm.duration}
                        onChange={(e) => handleServiceFormChange('duration', parseInt(e.target.value) || 60)}
                        placeholder="60"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxPets">Max Pets *</Label>
                      <Input
                        id="maxPets"
                        type="number"
                        min="1"
                        value={serviceForm.maxPets}
                        onChange={(e) => handleServiceFormChange('maxPets', parseInt(e.target.value) || 1)}
                        placeholder="1"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Service Includes (Optional)</Label>
                    <p className="text-sm text-gray-600 mb-3">What's included in this service?</p>
                    <div className="space-y-2">
                      <Input 
                        placeholder="e.g., Bath, Nail trimming, Ear cleaning"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const value = e.currentTarget.value.trim()
                            if (value && !serviceForm.includes?.includes(value)) {
                              handleServiceFormChange('includes', [...(serviceForm.includes || []), value])
                              e.currentTarget.value = ''
                            }
                          }
                        }}
                      />
                      {serviceForm.includes && serviceForm.includes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {serviceForm.includes.map((item, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {item}
                              <button
                                type="button"
                                onClick={() => {
                                  const newIncludes = serviceForm.includes?.filter((_, i) => i !== index) || []
                                  handleServiceFormChange('includes', newIncludes)
                                }}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Requirements (Optional)</Label>
                    <p className="text-sm text-gray-600 mb-3">Any special requirements for this service?</p>
                    <div className="space-y-2">
                      <Input 
                        placeholder="e.g., Up-to-date vaccinations, Pet must be friendly"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const value = e.currentTarget.value.trim()
                            if (value && !serviceForm.requirements?.includes(value)) {
                              handleServiceFormChange('requirements', [...(serviceForm.requirements || []), value])
                              e.currentTarget.value = ''
                            }
                          }
                        }}
                      />
                      {serviceForm.requirements && serviceForm.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {serviceForm.requirements.map((item, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              {item}
                              <button
                                type="button"
                                onClick={() => {
                                  const newRequirements = serviceForm.requirements?.filter((_, i) => i !== index) || []
                                  handleServiceFormChange('requirements', newRequirements)
                                }}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Ready to Launch!</h4>
                    <p className="text-sm text-blue-800">
                      Once you create this service, it will be available for customers to book immediately.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddServiceModal(false)}
                      disabled={serviceFormLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={serviceFormLoading || !serviceForm.name || !serviceForm.description || serviceForm.price <= 0}
                    >
                      {serviceFormLoading ? 'Creating Service...' : 'Create Service'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Service Modal */}
            <Dialog open={showEditServiceModal} onOpenChange={setShowEditServiceModal}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Service</DialogTitle>
                  <DialogDescription>
                    Update the details of your service offering.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleUpdateService} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editServiceName">Service Name *</Label>
                      <Input
                        id="editServiceName"
                        type="text"
                        value={serviceForm.name}
                        onChange={(e) => handleServiceFormChange('name', e.target.value)}
                        placeholder="e.g., Dog Grooming, Pet Sitting"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="editServiceCategory">Service Category</Label>
                      <Input
                        id="editServiceCategory"
                        type="text"
                        value={provider?.services?.[0] ? provider.services[0].charAt(0).toUpperCase() + provider.services[0].slice(1) : 'Grooming'}
                        disabled
                        className="mt-1 bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Category is set based on your provider profile</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="editServiceDescription">Service Description *</Label>
                    <Textarea
                      id="editServiceDescription"
                      value={serviceForm.description}
                      onChange={(e) => handleServiceFormChange('description', e.target.value)}
                      placeholder="Describe what your service includes and what makes it special..."
                      className="mt-1"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="editServicePrice">Price (€) *</Label>
                      <Input
                        id="editServicePrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceForm.price}
                        onChange={(e) => handleServiceFormChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="editServiceDuration">Duration (minutes) *</Label>
                      <Input
                        id="editServiceDuration"
                        type="number"
                        min="15"
                        step="15"
                        value={serviceForm.duration}
                        onChange={(e) => handleServiceFormChange('duration', parseInt(e.target.value) || 60)}
                        placeholder="60"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="editMaxPets">Max Pets *</Label>
                      <Input
                        id="editMaxPets"
                        type="number"
                        min="1"
                        value={serviceForm.maxPets}
                        onChange={(e) => handleServiceFormChange('maxPets', parseInt(e.target.value) || 1)}
                        placeholder="1"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Service Includes (Optional)</Label>
                    <p className="text-sm text-gray-600 mb-3">What's included in this service?</p>
                    <div className="space-y-2">
                      <Input 
                        placeholder="e.g., Bath, Nail trimming, Ear cleaning"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const value = e.currentTarget.value.trim()
                            if (value && !serviceForm.includes?.includes(value)) {
                              handleServiceFormChange('includes', [...(serviceForm.includes || []), value])
                              e.currentTarget.value = ''
                            }
                          }
                        }}
                      />
                      {serviceForm.includes && serviceForm.includes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {serviceForm.includes.map((item, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {item}
                              <button
                                type="button"
                                onClick={() => {
                                  const newIncludes = serviceForm.includes?.filter((_, i) => i !== index) || []
                                  handleServiceFormChange('includes', newIncludes)
                                }}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Requirements (Optional)</Label>
                    <p className="text-sm text-gray-600 mb-3">Any special requirements for this service?</p>
                    <div className="space-y-2">
                      <Input 
                        placeholder="e.g., Up-to-date vaccinations, Pet must be friendly"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const value = e.currentTarget.value.trim()
                            if (value && !serviceForm.requirements?.includes(value)) {
                              handleServiceFormChange('requirements', [...(serviceForm.requirements || []), value])
                              e.currentTarget.value = ''
                            }
                          }
                        }}
                      />
                      {serviceForm.requirements && serviceForm.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {serviceForm.requirements.map((item, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              {item}
                              <button
                                type="button"
                                onClick={() => {
                                  const newRequirements = serviceForm.requirements?.filter((_, i) => i !== index) || []
                                  handleServiceFormChange('requirements', newRequirements)
                                }}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowEditServiceModal(false)
                        setEditingService(null)
                      }}
                      disabled={serviceFormLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={serviceFormLoading || !serviceForm.name || !serviceForm.description || serviceForm.price <= 0}
                    >
                      {serviceFormLoading ? 'Updating Service...' : 'Update Service'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
