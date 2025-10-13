'use client'

import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { dashboardApi } from '@/lib/dashboard'
import { serviceApi } from '@/lib/services'
import { t } from '@/lib/translations'
import { Plus, Scissors, X, Upload } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { uploadServiceImages } from '@/lib/image-upload'
import Image from 'next/image'


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
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)


  // Add service form state (optimized for groomers)
  const [category, setCategory] = useState<'grooming' | 'training' | 'veterinary' | 'boarding' | 'sitting' | 'adoption'>('grooming')
  const [businessType, setBusinessType] = useState<string>('grooming')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [duration, setDuration] = useState<number>(60)
  const [maxPets, setMaxPets] = useState<number>(1)
  const [requirements, setRequirements] = useState('')
  const [includes, setIncludes] = useState('')
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  // Pet type form state
  const [isAddPetTypeOpen, setIsAddPetTypeOpen] = useState(false)
  const [editingPetType, setEditingPetType] = useState<any>(null)
  const [petTypeTitle, setPetTypeTitle] = useState('')
  const [petTypeDescription, setPetTypeDescription] = useState('')
  const [petTypeBreedType, setPetTypeBreedType] = useState('')

  // Individual pet form state
  const [isAddIndividualPetOpen, setIsAddIndividualPetOpen] = useState(false)
  const [editingIndividualPet, setEditingIndividualPet] = useState<any>(null)
  const [individualPetTitle, setIndividualPetTitle] = useState('')
  const [individualPetPrice, setIndividualPetPrice] = useState<number>(0)
  const [individualPetSexType, setIndividualPetSexType] = useState<'male' | 'female'>('male')
  const [individualPetAge, setIndividualPetAge] = useState<number>(0)
  const [individualPetReadyToLeave, setIndividualPetReadyToLeave] = useState('')
  const [individualPetFeatures, setIndividualPetFeatures] = useState<string[]>([])

  // Pet feature options
  const PET_FEATURE_OPTIONS = [
    { value: 'microchipped', label: 'Mikročipas' },
    { value: 'vaccinated', label: 'Vakcinos' },
    { value: 'wormed', label: 'Išvaryti parazitai' },
    { value: 'health_checked', label: 'Sveikatos patikra' },
    { value: 'parents_tested', label: 'Tėvai patikrinti' },
    { value: 'kc_registered', label: 'KC registruotas' }
  ]


  const loadServices = async () => {
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
      const bt = (provider as any).business_type || 'grooming'
      setBusinessType(bt)
      // Map business type to service category
      const mapped = ['grooming','training','veterinary','boarding','sitting','adoption'].includes(bt) ? bt : 'grooming'
      setCategory(mapped as any)
      const list = await serviceApi.getServicesByProvider(provider.id)
      setServices((list || []) as ServiceItem[])
    } catch (e) {
      setError('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [user?.id])

  const handleCreateService = async () => {
    if (!providerId) return
    if (!name || !description || price <= 0 || duration <= 0) {
      setFormError('Please fill all required fields correctly')
      return
    }
    try {
      setFormError(null)
      setIsSubmitting(true)
      
      // Upload gallery images first if any
      let uploadedImageUrls: string[] = []
      if (galleryImages.length > 0 && user?.id) {
        setUploadingImages(true)
        uploadedImageUrls = await uploadServiceImages(user.id, galleryImages)
        setUploadingImages(false)
      }
      
      const created = await serviceApi.createService({
        providerId,
        category,
        name,
        description,
        price,
        duration,
        maxPets,
        requirements: requirements
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        includes: includes
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        images: uploadedImageUrls
      })
      
      // Optimistically update list
      if (created) {
        setServices(prev => [
          {
            id: (created as any).id,
            name,
            description,
            price,
            images: uploadedImageUrls,
          },
          ...prev,
        ])
      }
      
      // Reset and close
      setIsAddOpen(false)
      setName('')
      setDescription('')
      setPrice(0)
      setDuration(60)
      setMaxPets(1)
      setRequirements('')
      setIncludes('')
      setGalleryImages([])
      setExistingImages([])
    } catch (e) {
      setFormError('Failed to create service')
    } finally {
      setIsSubmitting(false)
      setUploadingImages(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + galleryImages.length + existingImages.length > 10) {
      setFormError('Maximum 10 images allowed')
      return
    }
    setGalleryImages(prev => [...prev, ...files])
  }

  const handleRemoveNewImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages(prev => prev.filter(url => url !== imageUrl))
  }

  const handleEditService = (service: ServiceItem) => {
    setEditingService(service)
    setName(service.name)
    setDescription(service.description)
    setExistingImages(service.images || [])
    setPrice(service.price)
    setDuration(60) // Default duration
    setMaxPets(1) // Default max pets
    setRequirements('')
    setIncludes('')
    setIsEditOpen(true)
  }

  // Pet type handlers
  const handleAddPetType = async () => {
    if (!petTypeTitle || !petTypeDescription || !petTypeBreedType) {
      setFormError('Please fill all required fields')
      return
    }
    try {
      setFormError(null)
      setIsSubmitting(true)
      // TODO: Implement pet type creation
      console.log('Creating pet type:', { petTypeTitle, petTypeDescription, petTypeBreedType })
      setIsAddPetTypeOpen(false)
      setPetTypeTitle('')
      setPetTypeDescription('')
      setPetTypeBreedType('')
    } catch (e) {
      setFormError('Failed to create pet type')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Individual pet handlers
  const handleAddIndividualPet = async () => {
    if (!individualPetTitle || !individualPetPrice || !individualPetAge) {
      setFormError('Please fill all required fields')
      return
    }
    try {
      setFormError(null)
      setIsSubmitting(true)
      // TODO: Implement individual pet creation
      console.log('Creating individual pet:', { 
        individualPetTitle, 
        individualPetPrice, 
        individualPetSexType, 
        individualPetAge, 
        individualPetReadyToLeave,
        individualPetFeatures 
      })
      setIsAddIndividualPetOpen(false)
      setIndividualPetTitle('')
      setIndividualPetPrice(0)
      setIndividualPetSexType('male')
      setIndividualPetAge(0)
      setIndividualPetReadyToLeave('')
      setIndividualPetFeatures([])
    } catch (e) {
      setFormError('Failed to create individual pet')
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePetFeature = (feature: string) => {
    setIndividualPetFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const handleUpdateService = async () => {
    if (!editingService) return
    
    try {
      setIsSubmitting(true)
      setFormError(null)
      
      // Upload new gallery images if any
      let uploadedImageUrls: string[] = []
      if (galleryImages.length > 0 && user?.id) {
        setUploadingImages(true)
        uploadedImageUrls = await uploadServiceImages(user.id, galleryImages)
        setUploadingImages(false)
      }
      
      // Combine existing images with newly uploaded ones
      const allImages = [...existingImages, ...uploadedImageUrls]
      
      // Update service data
      const serviceData = {
        id: editingService.id,
        name,
        description,
        price,
        duration,
        maxPets,
        requirements: requirements.split(',').map(r => r.trim()).filter(Boolean),
        includes: includes.split(',').map(i => i.trim()).filter(Boolean),
        images: allImages
      }
      
      // Call API to update service
      await serviceApi.updateService(editingService.id, serviceData)
      
      // Reset form and close modal
      setIsEditOpen(false)
      setEditingService(null)
      setName('')
      setDescription('')
      setPrice(0)
      setDuration(60)
      setMaxPets(1)
      setRequirements('')
      setIncludes('')
      setGalleryImages([])
      setExistingImages([])
      
      // Reload services
      await loadServices()
    } catch (e) {
      setFormError('Failed to update service')
    } finally {
      setIsSubmitting(false)
      setUploadingImages(false)
    }
  }



  return (
    <ProtectedRoute requiredRole="provider">
      <>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Paslaugos
            </h1>
            <p className="text-gray-600 text-sm">
              Kurkite ir tvarkykite paslaugas, kurias teikiate
            </p>
          </div>
          <div className="flex justify-start md:justify-end">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> 
                  {t('providerDashboard.addNewService')}
                </Button>
              </DialogTrigger>
                <DialogContent aria-describedby="add-service-desc">
              <DialogHeader>
                <DialogTitle>
                  {t('providerDashboard.addNewService')}
                </DialogTitle>
              </DialogHeader>
              <p id="add-service-desc" className="sr-only">{t('providerDashboard.fillServiceDetails')}</p>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>{t('providerDashboard.category')}</Label>
                  <Input value={businessType === 'adoption' ? t('providerDashboard.adoption') : businessType} readOnly aria-readonly />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('common.name')}</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('providerDashboard.namePlaceholder')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t('common.description')}</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('providerDashboard.descriptionPlaceholder')} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="price">{t('common.price')} (€)</Label>
                    <Input id="price" type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder={t('providerDashboard.pricePlaceholder')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">{t('common.duration')} (min)</Label>
                    <Input id="duration" type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} placeholder={t('providerDashboard.durationPlaceholder')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxPets">{t('common.maxPets')}</Label>
                    <Input id="maxPets" type="number" min={1} value={maxPets} onChange={(e) => setMaxPets(Number(e.target.value))} placeholder={t('providerDashboard.maxPetsPlaceholder')} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="requirements">{t('common.requirements')} ({t('common.commaSeparated')})</Label>
                  <Input id="requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder={t('providerDashboard.requirementsPlaceholder')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="includes">{t('common.includes')} ({t('common.commaSeparated')})</Label>
                  <Input id="includes" value={includes} onChange={(e) => setIncludes(e.target.value)} placeholder={t('providerDashboard.includesPlaceholder')} />
                </div>

                {/* Gallery Upload */}
                <div className="grid gap-2">
                  <Label htmlFor="gallery">Galerija (iki 10 nuotraukų)</Label>
                  <div className="space-y-3">
                    {/* Upload Button */}
                    <div className="flex items-center gap-2">
                      <Input
                        id="gallery"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('gallery')?.click()}
                        disabled={galleryImages.length + existingImages.length >= 10}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Įkelti nuotraukas
                      </Button>
                      <span className="text-xs text-gray-500">
                        {galleryImages.length + existingImages.length}/10
                      </span>
                    </div>

                    {/* Image Previews */}
                    {(galleryImages.length > 0 || existingImages.length > 0) && (
                      <div className="grid grid-cols-3 gap-2">
                        {/* Existing Images */}
                        {existingImages.map((imageUrl, index) => (
                          <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border">
                            <Image
                              src={imageUrl}
                              alt={`Service image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(imageUrl)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        
                        {/* New Images */}
                        {galleryImages.map((file, index) => (
                          <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {formError && (
                  <p className="text-sm text-red-600">{formError}</p>
                )}
                {uploadingImages && (
                  <p className="text-sm text-blue-600">Įkeliamos nuotraukos...</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>{t('providerDashboard.cancel')}</Button>
                <Button onClick={handleCreateService} disabled={isSubmitting || !providerId}>{isSubmitting ? t('providerDashboard.saving') : t('providerDashboard.saveService')}</Button>
              </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Edit Service Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent aria-describedby="edit-service-desc">
            <DialogHeader>
              <DialogTitle>
                {businessType === 'adoption' ? t('providerDashboard.addNewAnimalType') : t('providerDashboard.addNewService')}
              </DialogTitle>
            </DialogHeader>
            <p id="edit-service-desc" className="sr-only">{t('providerDashboard.fillServiceDetails')}</p>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>{t('providerDashboard.category')}</Label>
                <Input value={businessType === 'adoption' ? t('providerDashboard.adoption') : businessType} readOnly aria-readonly />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">{t('common.name')}</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('providerDashboard.namePlaceholder')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">{t('common.description')}</Label>
                <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('providerDashboard.descriptionPlaceholder')} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">{t('common.price')} (€)</Label>
                  <Input id="edit-price" type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder={t('providerDashboard.pricePlaceholder')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-duration">{t('common.duration')} (min)</Label>
                  <Input id="edit-duration" type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} placeholder={t('providerDashboard.durationPlaceholder')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-maxPets">{t('common.maxPets')}</Label>
                  <Input id="edit-maxPets" type="number" min={1} value={maxPets} onChange={(e) => setMaxPets(Number(e.target.value))} placeholder={t('providerDashboard.maxPetsPlaceholder')} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-requirements">{t('common.requirements')} ({t('common.commaSeparated')})</Label>
                <Input id="edit-requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder={t('providerDashboard.requirementsPlaceholder')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-includes">{t('common.includes')} ({t('common.commaSeparated')})</Label>
                <Input id="edit-includes" value={includes} onChange={(e) => setIncludes(e.target.value)} placeholder={t('providerDashboard.includesPlaceholder')} />
              </div>

              {/* Gallery Upload for Edit */}
              <div className="grid gap-2">
                <Label htmlFor="edit-gallery">Galerija (iki 10 nuotraukų)</Label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-gallery"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('edit-gallery')?.click()}
                      disabled={galleryImages.length + existingImages.length >= 10}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Įkelti nuotraukas
                    </Button>
                    <span className="text-xs text-gray-500">
                      {galleryImages.length + existingImages.length}/10
                    </span>
                  </div>

                  {/* Image Previews */}
                  {(galleryImages.length > 0 || existingImages.length > 0) && (
                    <div className="grid grid-cols-3 gap-2">
                      {/* Existing Images */}
                      {existingImages.map((imageUrl, index) => (
                        <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border">
                          <Image
                            src={imageUrl}
                            alt={`Service image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(imageUrl)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      {/* New Images */}
                      {galleryImages.map((file, index) => (
                        <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
              {uploadingImages && (
                <p className="text-sm text-blue-600">Įkeliamos nuotraukos...</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>{t('providerDashboard.cancel')}</Button>
              <Button onClick={handleUpdateService} disabled={isSubmitting}>{isSubmitting ? t('providerDashboard.saving') : t('providerDashboard.saveService')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>



        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : services.length === 0 ? (
          <div className="text-center py-10">
            <Scissors className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">
              {businessType === 'adoption' ? 'Dar nėra gyvūnų tipų' : 'Dar nėra paslaugų'}
            </p>
            <p className="text-sm text-gray-500">
              {businessType === 'adoption' 
                ? 'Sukurkite pirmąjį gyvūnų tipą, kad pradėtumėte gauti užklausas.' 
                : 'Sukurkite pirmąją paslaugą, kad pradėtumėte gauti rezervacijas.'
              }
            </p>
            <Button onClick={() => setIsAddOpen(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> 
              {businessType === 'adoption' ? 'Pridėti gyvūnų tipą' : 'Pridėti paslaugą'}
            </Button>
          </div>
        ) : (
          // Regular Services Display
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
                    {t('providerDashboard.view')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditService(svc)}>
                    {t('providerDashboard.edit')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    </ProtectedRoute>
  )
}

