'use client'

import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { dashboardApi } from '@/lib/dashboard'
import { serviceApi } from '@/lib/services'
import { t } from '@/lib/translations'
import { Plus, Scissors, X, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { uploadServiceImages } from '@/lib/image-upload'
import Image from 'next/image'
import { ImageMultiUpload } from '@/components/ui/image-multi-upload'


interface ServiceItem {
  id: string
  name: string
  description: string
  price: number
  images?: string[]
  duration?: number
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
  const [imageIndexByService, setImageIndexByService] = useState<Record<string, number>>({})
  const [includesList, setIncludesList] = useState<string[]>([])
  const [includeInput, setIncludeInput] = useState('')
  const [durationFrom, setDurationFrom] = useState<number | ''>('')
  const [durationTo, setDurationTo] = useState<number | ''>('')


  // Add service form state (optimized for groomers)
  const [category, setCategory] = useState<'grooming' | 'training' | 'veterinary' | 'boarding' | 'sitting' | 'adoption'>('grooming')
  const [businessType, setBusinessType] = useState<string>('grooming')
  const [serviceCategory, setServiceCategory] = useState<string>('')
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

  // Service subcategory options per business type (LT labels)
  const SERVICE_OPTIONS_BY_TYPE: Record<string, string[]> = {
    grooming: [
      'Plovimas',
      'Kirpimas',
      'Šukavimas',
      'Nagai',
      'Ausų valymas',
      'Dantų valymas',
      'Lietas kailis',
      'Kiti darbai'
    ],
    veterinary: [
      'Sveikatos patikra',
      'Vakcinos',
      'Skubi pagalba',
      'Tyrimai',
      'Chirurgija'
    ],
    training: [
      'Pagrindinis paklusnumas',
      'Elgsenos korekcija',
      'Specializuotas mokymas'
    ],
    boarding: [
      'Dienos priežiūra',
      'Nakvynė'
    ],
    sitting: [
      'Apsilankymas namuose',
      'Vedžiojimas',
      'Maitinimas'
    ],
    adoption: [
      'Gyvūnų tipas'
    ]
  }

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
      const mappedBt = ['grooming','training','veterinary','boarding','sitting','adoption'].includes(bt) ? bt : 'grooming'
      setCategory(mappedBt as any)
      const list = await serviceApi.getServicesByProvider(provider.id)
      const mappedServices: ServiceItem[] = (list || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: s.price,
        images: s.images || [],
        duration: s.duration_minutes
      }))
      setServices(mappedServices)
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
        includes: includesList,
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

  const handleNextImage = (serviceId: string, images: string[]) => {
    if (!images || images.length === 0) return
    setImageIndexByService(prev => {
      const current = prev[serviceId] ?? 0
      const next = (current + 1) % images.length
      return { ...prev, [serviceId]: next }
    })
  }

  const handlePrevImage = (serviceId: string, images: string[]) => {
    if (!images || images.length === 0) return
    setImageIndexByService(prev => {
      const current = prev[serviceId] ?? 0
      const next = (current - 1 + images.length) % images.length
      return { ...prev, [serviceId]: next }
    })
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
    setIncludesList((service as any).includes || [])
    setIncludeInput('')
    setDurationFrom(typeof service.duration === 'number' ? service.duration : '')
    setDurationTo('')
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
        durationMin: typeof durationFrom === 'number' ? durationFrom : undefined,
        durationMax: typeof durationTo === 'number' ? durationTo : undefined,
        maxPets,
        requirements: requirements.split(',').map(r => r.trim()).filter(Boolean),
        includes: includesList,
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
      setIncludesList([])
      setIncludeInput('')
      setDurationFrom('')
      setDurationTo('')
      
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
            <p className="text-muted-foreground text-sm">
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
                <DialogContent aria-describedby="add-service-desc" className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {t('providerDashboard.addNewService')}
                </DialogTitle>
              </DialogHeader>
              <p id="add-service-desc" className="sr-only">{t('providerDashboard.fillServiceDetails')}</p>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>{t('providerDashboard.category')}</Label>
                  <Select value={serviceCategory} onValueChange={(value) => setServiceCategory(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pasirinkite paslaugos kategoriją" />
                    </SelectTrigger>
                    <SelectContent>
                      {(SERVICE_OPTIONS_BY_TYPE[businessType] || []).map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

                {/* Gallery Upload (Drag & Drop) */}
                <div className="grid gap-2">
                  <Label htmlFor="gallery">Galerija (iki 10 nuotraukų)</Label>
                  <ImageMultiUpload
                    files={galleryImages}
                    onChange={setGalleryImages}
                    existingImages={existingImages}
                    onRemoveExisting={handleRemoveExistingImage}
                    onReorder={(nextExisting, nextFiles) => {
                      setExistingImages(nextExisting)
                      setGalleryImages(nextFiles)
                    }}
                    maxFiles={10}
                    accept="image/*"
                    className="space-y-3"
                  />
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
          <DialogContent aria-describedby="edit-service-desc" className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {businessType === 'adoption' ? t('providerDashboard.addNewAnimalType') : t('providerDashboard.addNewService')}
              </DialogTitle>
            </DialogHeader>
            <p id="edit-service-desc" className="sr-only">{t('providerDashboard.fillServiceDetails')}</p>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>{t('providerDashboard.category')}</Label>
                <Select value={serviceCategory} onValueChange={(value) => setServiceCategory(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pasirinkite paslaugos kategoriją" />
                  </SelectTrigger>
                  <SelectContent>
                    {(SERVICE_OPTIONS_BY_TYPE[businessType] || []).map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">{t('common.name')}</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('providerDashboard.namePlaceholder')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">{t('common.description')}</Label>
                <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('providerDashboard.descriptionPlaceholder')} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">{t('common.price')} (€)</Label>
                  <Input id="edit-price" type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder={t('providerDashboard.pricePlaceholder')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-maxPets">{t('common.maxPets')}</Label>
                  <Input id="edit-maxPets" type="number" min={1} value={maxPets} onChange={(e) => setMaxPets(Number(e.target.value))} placeholder={t('providerDashboard.maxPetsPlaceholder')} />
                </div>
              </div>

              {/* Duration Row */}
              <div className="grid gap-2">
                <Label htmlFor="edit-duration-from">{t('common.duration')} (min)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input id="edit-duration-from" type="number" min={1} value={durationFrom} onChange={(e) => setDurationFrom(e.target.value ? Number(e.target.value) : '')} placeholder={t('providerDashboard.durationPlaceholder')} />
                  <Input id="edit-duration-to" type="number" min={1} value={durationTo} onChange={(e) => setDurationTo(e.target.value ? Number(e.target.value) : '')} placeholder={t('providerDashboard.durationPlaceholder')} />
                </div>
                <p className="text-xs text-muted-foreground">Nurodykite intervalą (nuo–iki)</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-includes">{t('common.includes')}</Label>
                {includesList.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {includesList.map((inc, i) => (
                      <span key={`${inc}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
                        {inc}
                        <button
                          type="button"
                          aria-label="Remove"
                          className="rounded-full p-0.5 hover:bg-white/70"
                          onClick={() => setIncludesList(prev => prev.filter((_, idx) => idx !== i))}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <Input
                  id="edit-includes"
                  value={includeInput}
                  onChange={(e) => setIncludeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const val = includeInput.trim()
                      if (!val) return
                      setIncludesList(prev => prev.includes(val) ? prev : [...prev, val])
                      setIncludeInput('')
                    }
                  }}
                  placeholder={t('providerDashboard.includesPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">Spauskite Enter, kad pridėtumėte</p>
              </div>

              {/* Gallery Upload for Edit (Drag & Drop) */}
              <div className="grid gap-2">
                <Label htmlFor="edit-gallery">Galerija (iki 10 nuotraukų)</Label>
                <ImageMultiUpload
                  files={galleryImages}
                  onChange={setGalleryImages}
                  existingImages={existingImages}
                  onRemoveExisting={handleRemoveExistingImage}
                  onReorder={(nextExisting, nextFiles) => {
                    setExistingImages(nextExisting)
                    setGalleryImages(nextFiles)
                  }}
                  maxFiles={10}
                  accept="image/*"
                  className="space-y-3"
                />
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



        {error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : services.length === 0 ? (
          <div className="text-center py-10">
            <Scissors className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {businessType === 'adoption' ? 'Dar nėra gyvūnų tipų' : 'Dar nėra paslaugų'}
            </p>
            <p className="text-sm text-muted-foreground">
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
            {services.map(svc => {
              const images = svc.images || []
              const idx = imageIndexByService[svc.id] ?? 0
              const currentImage = images[idx]
              return (
                <div key={svc.id} className="p-4 border rounded-lg bg-white">
                  {/* Cover/Gallery */}
                  {images.length > 0 && (
                    <div className="relative w-full overflow-hidden rounded-md aspect-video bg-muted">
                      {currentImage && (
                        <Image src={currentImage} alt={svc.name} fill className="object-cover" />
                      )}
                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            aria-label="Previous image"
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow"
                            onClick={() => handlePrevImage(svc.id, images)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Next image"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow"
                            onClick={() => handleNextImage(svc.id, images)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {images.map((_, i) => (
                              <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === idx ? 'bg-white' : 'bg-white/60'}`} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex items-end justify-between mt-3">
                    <div>
                      <h3 className="font-medium">{svc.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{svc.description}</p>
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
              )
            })}
          </div>
        )}
      </>
    </ProtectedRoute>
  )
}

