'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InputWithLabel, TextareaWithLabel, SelectWithLabel } from '@/components/ui/input-with-label'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/ui/image-upload'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  EyeOff,
  PawPrint,
  Euro
} from 'lucide-react'
import { PetAd, CreatePetAdForm } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { providerApi } from '@/lib/providers'
import { petAdsApi } from '@/lib/pet-ads'
import Image from 'next/image'

export default function ProviderPetAdsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [provider, setProvider] = useState<any>(null)
  const [petAds, setPetAds] = useState<PetAd[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPetAdModal, setShowAddPetAdModal] = useState(false)
  const [showEditPetAdModal, setShowEditPetAdModal] = useState(false)
  const [editingPetAd, setEditingPetAd] = useState<PetAd | null>(null)
  const [petAdFormLoading, setPetAdFormLoading] = useState(false)
  const [petAdForm, setPetAdForm] = useState<CreatePetAdForm>({
    name: '',
    description: '',
    price: 0,
    species: 'dog',
    breed: '',
    age: undefined,
    gender: undefined,
    size: undefined,
    color: '',
    weight: undefined,
    vaccinationStatus: undefined,
    medicalNotes: '',
    behavioralNotes: '',
    specialNeeds: [],
    images: []
  })
  const [uploadedImages, setUploadedImages] = useState<File[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        if (user?.id) {
          // Load provider data
          const providerData = await providerApi.getProviderByUserId(user.id)
          
          if (providerData) {
            setProvider(providerData)
            
            // Check if provider is adoption type
            if (providerData.business_type === 'adoption') {
              // Load pet ads
              const providerPetAds = await petAdsApi.getPetAdsByProvider(providerData.id)
              setPetAds(providerPetAds)
            } else {
              // Redirect to services page if not adoption provider
              router.push('/provider/dashboard/services')
              return
            }
          }
        }
        
      } catch (error) {
        // Error handling - could be logged to monitoring service in production
        toast.error('Failed to load pet ads data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, router])

  const handlePetAdFormChange = (field: keyof CreatePetAdForm, value: string | number | string[] | undefined) => {
    setPetAdForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCreatePetAd = async (e: React.FormEvent) => {
    e.preventDefault()
    setPetAdFormLoading(true)

    try {
      if (!provider?.id) {
        toast.error('Provider profile not found')
        return
      }

      // Create pet ad in database with uploaded images
      const formWithImages = { ...petAdForm, images: uploadedImages }
      const newPetAd = await petAdsApi.createPetAd(provider.id, formWithImages)

      // Update local state
      setPetAds(prev => [...prev, newPetAd])
      
      // Reset form
      setPetAdForm({
        name: '',
        description: '',
        price: 0,
        species: 'dog',
        breed: '',
        age: undefined,
        gender: undefined,
        size: undefined,
        color: '',
        weight: undefined,
        vaccinationStatus: undefined,
        medicalNotes: '',
        behavioralNotes: '',
        specialNeeds: [],
        images: []
      })
      setUploadedImages([])
      
      // Close modal
      setShowAddPetAdModal(false)
      
      // Show success notification
      toast.success('Pet ad has been created successfully!')
    } catch (error) {
      // Error handling - could be logged to monitoring service in production
      toast.error('Failed to create pet ad. Please try again.')
    } finally {
      setPetAdFormLoading(false)
    }
  }

  const handleEditPetAd = (petAd: PetAd) => {
    setEditingPetAd(petAd)
    setPetAdForm({
      name: petAd.name,
      description: petAd.description,
      price: petAd.price,
      species: petAd.species,
      breed: petAd.breed || '',
      age: petAd.age,
      gender: petAd.gender,
      size: petAd.size,
      color: petAd.color || '',
      weight: petAd.weight,
      vaccinationStatus: petAd.vaccinationStatus,
      medicalNotes: petAd.medicalNotes || '',
      behavioralNotes: petAd.behavioralNotes || '',
      specialNeeds: petAd.specialNeeds || [],
      images: []
    })
    setShowEditPetAdModal(true)
  }

  const handleUpdatePetAd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPetAd) return

    setPetAdFormLoading(true)

    try {
      const formWithImages = { ...petAdForm, images: uploadedImages }
      const updatedPetAd = await petAdsApi.updatePetAd(editingPetAd.id, formWithImages)

      // Update local state
      setPetAds(prev => prev.map(ad => ad.id === editingPetAd.id ? updatedPetAd : ad))
      
      // Close modal
      setShowEditPetAdModal(false)
      setEditingPetAd(null)
      setUploadedImages([])
      
      // Show success notification
      toast.success('Pet ad has been updated successfully!')
    } catch (error) {
      // Error handling - could be logged to monitoring service in production
      toast.error('Failed to update pet ad. Please try again.')
    } finally {
      setPetAdFormLoading(false)
    }
  }

  const handleDeletePetAd = async (petAdId: string) => {
    if (!confirm('Are you sure you want to delete this pet ad?')) return

    try {
      await petAdsApi.deletePetAd(petAdId)
      setPetAds(prev => prev.filter(ad => ad.id !== petAdId))
      toast.success('Pet ad has been deleted successfully!')
    } catch (error) {
      // Error handling - could be logged to monitoring service in production
      toast.error('Failed to delete pet ad. Please try again.')
    }
  }

  const handleTogglePetAdStatus = async (petAdId: string, isActive: boolean) => {
    try {
      await petAdsApi.togglePetAdStatus(petAdId, !isActive)
      setPetAds(prev => prev.map(ad => 
        ad.id === petAdId ? { ...ad, isActive: !isActive } : ad
      ))
      toast.success(`Pet ad has been ${!isActive ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      // Error handling - could be logged to monitoring service in production
      toast.error('Failed to update pet ad status. Please try again.')
    }
  }

  const getSpeciesLabel = (species: string) => {
    const labels: Record<string, string> = {
      dog: 'Šuo',
      cat: 'Katė',
      bird: 'Paukštis',
      rabbit: 'Triušis',
      other: 'Kita'
    }
    return labels[species] || species
  }

  const getGenderLabel = (gender?: string) => {
    if (!gender) return 'Nepasakyta'
    return gender === 'male' ? 'Patinas' : 'Patelė'
  }

  const getSizeLabel = (size?: string) => {
    if (!size) return 'Nepasakyta'
    const labels: Record<string, string> = {
      small: 'Mažas',
      medium: 'Vidutinis',
      large: 'Didelis'
    }
    return labels[size] || size
  }

  if (loading) {
    return (
      <Layout>
        <ProtectedRoute requiredRole="provider">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading pet ads...</p>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  return (
    <Layout>
      <ProtectedRoute requiredRole="provider">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Pet Ads Management</h1>
                  <p className="mt-2 text-muted-foreground">
                    Manage your pet listings for sale
                  </p>
                </div>
                <Button onClick={() => setShowAddPetAdModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Pet Ad
                </Button>
              </div>
            </div>

            {/* Pet Ads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {petAds.length > 0 ? (
                petAds.map((petAd) => (
                  <Card key={petAd.id} className="overflow-hidden">
                    <div className="aspect-square relative bg-gray-100">
                      {petAd.images.length > 0 ? (
                        <Image
                          src={petAd.images[0]}
                          alt={petAd.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <PawPrint className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant={petAd.isActive ? "default" : "secondary"}>
                          {petAd.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-foreground">{petAd.name}</h3>
                        <div className="flex items-center text-green-600 font-semibold">
                          <Euro className="h-4 w-4 mr-1" />
                          {petAd.price}
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground mb-3">
                        <p><span className="font-medium">Species:</span> {getSpeciesLabel(petAd.species)}</p>
                        {petAd.breed && <p><span className="font-medium">Breed:</span> {petAd.breed}</p>}
                        {petAd.age && <p><span className="font-medium">Age:</span> {petAd.age} months</p>}
                        <p><span className="font-medium">Gender:</span> {getGenderLabel(petAd.gender)}</p>
                        <p><span className="font-medium">Size:</span> {getSizeLabel(petAd.size)}</p>
                      </div>

                      <p className="text-sm text-foreground mb-4 line-clamp-2">
                        {petAd.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPetAd(petAd)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePetAdStatus(petAd.id, petAd.isActive)}
                          >
                            {petAd.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePetAd(petAd.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(petAd.createdAt).toLocaleDateString('lt-LT')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <PawPrint className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No pet ads yet</h3>
                  <p className="text-muted-foreground mb-6">Start by creating your first pet ad to begin selling pets.</p>
                  <Button onClick={() => setShowAddPetAdModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Pet Ad
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Pet Ad Modal */}
        <Dialog open={showAddPetAdModal} onOpenChange={setShowAddPetAdModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Pet Ad</DialogTitle>
              <DialogDescription>
                Create a new pet listing for sale
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreatePetAd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWithLabel
                  id="name"
                  label="Pet Name"
                  value={petAdForm.name}
                  onChange={(value) => handlePetAdFormChange('name', value)}
                  required
                  placeholder="Enter pet name"
                />
                
                <InputWithLabel
                  id="price"
                  label="Price (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={petAdForm.price.toString()}
                  onChange={(value) => handlePetAdFormChange('price', parseFloat(value) || 0)}
                  required
                  placeholder="0.00"
                />
              </div>

              <TextareaWithLabel
                id="description"
                label="Description"
                value={petAdForm.description}
                onChange={(value) => handlePetAdFormChange('description', value)}
                required
                placeholder="Describe the pet, its personality, health status, etc."
                rows={3}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectWithLabel
                  id="species"
                  label="Species"
                  value={petAdForm.species}
                  onValueChange={(value) => handlePetAdFormChange('species', value)}
                  required
                  options={[
                    { value: 'dog', label: 'Dog' },
                    { value: 'cat', label: 'Cat' },
                    { value: 'bird', label: 'Bird' },
                    { value: 'rabbit', label: 'Rabbit' },
                    { value: 'other', label: 'Other' }
                  ]}
                />

                <InputWithLabel
                  id="breed"
                  label="Breed"
                  value={petAdForm.breed || ''}
                  onChange={(value) => handlePetAdFormChange('breed', value)}
                  placeholder="Enter breed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputWithLabel
                  id="age"
                  label="Age (months)"
                  type="number"
                  min="0"
                  value={petAdForm.age?.toString() || ''}
                  onChange={(value) => handlePetAdFormChange('age', parseInt(value) || undefined)}
                  placeholder="Age in months"
                />

                <SelectWithLabel
                  id="gender"
                  label="Gender"
                  value={petAdForm.gender || ''}
                  onValueChange={(value) => handlePetAdFormChange('gender', value || undefined)}
                  placeholder="Select gender"
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' }
                  ]}
                />

                <SelectWithLabel
                  id="size"
                  label="Size"
                  value={petAdForm.size || ''}
                  onValueChange={(value) => handlePetAdFormChange('size', value || undefined)}
                  placeholder="Select size"
                  options={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWithLabel
                  id="color"
                  label="Color"
                  value={petAdForm.color || ''}
                  onChange={(value) => handlePetAdFormChange('color', value)}
                  placeholder="Enter color"
                />

                <InputWithLabel
                  id="weight"
                  label="Weight (kg)"
                  type="number"
                  min="0"
                  step="0.1"
                  value={petAdForm.weight?.toString() || ''}
                  onChange={(value) => handlePetAdFormChange('weight', parseFloat(value) || undefined)}
                  placeholder="Weight in kg"
                />
              </div>

              <SelectWithLabel
                id="vaccinationStatus"
                label="Vaccination Status"
                value={petAdForm.vaccinationStatus || ''}
                onValueChange={(value) => handlePetAdFormChange('vaccinationStatus', value || undefined)}
                placeholder="Select vaccination status"
                options={[
                  { value: 'vaccinated', label: 'Vaccinated' },
                  { value: 'not_vaccinated', label: 'Not Vaccinated' },
                  { value: 'unknown', label: 'Unknown' }
                ]}
              />

              <TextareaWithLabel
                id="medicalNotes"
                label="Medical Notes"
                value={petAdForm.medicalNotes || ''}
                onChange={(value) => handlePetAdFormChange('medicalNotes', value)}
                placeholder="Any medical conditions, treatments, etc."
                rows={2}
              />

              <TextareaWithLabel
                id="behavioralNotes"
                label="Behavioral Notes"
                value={petAdForm.behavioralNotes || ''}
                onChange={(value) => handlePetAdFormChange('behavioralNotes', value)}
                placeholder="Temperament, training level, etc."
                rows={2}
              />

              <div className="space-y-2">
                <Label htmlFor="images">Pet Images</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <ImageUpload
                        value={image}
                        onChange={(file) => {
                          const newImages = [...uploadedImages]
                          newImages[index] = file || new File([], '')
                          setUploadedImages(newImages.filter(img => img.size > 0))
                        }}
                        placeholder="Upload pet image"
                        description="PNG, JPG, GIF up to 5MB"
                        previewClassName="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                  {uploadedImages.length < 5 && (
                    <div className="relative">
                      <ImageUpload
                        value={null}
                        onChange={(file) => {
                          if (file) {
                            setUploadedImages(prev => [...prev, file])
                          }
                        }}
                        placeholder="Add another image"
                        description="PNG, JPG, GIF up to 5MB"
                        previewClassName="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload up to 5 images of your pet. The first image will be used as the main photo.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddPetAdModal(false)}
                  disabled={petAdFormLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={petAdFormLoading || !petAdForm.name || !petAdForm.description || petAdForm.price <= 0}
                >
                  {petAdFormLoading ? 'Creating...' : 'Create Pet Ad'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Pet Ad Modal */}
        <Dialog open={showEditPetAdModal} onOpenChange={setShowEditPetAdModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Pet Ad</DialogTitle>
              <DialogDescription>
                Update the pet listing information
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUpdatePetAd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWithLabel
                  id="edit-name"
                  label="Pet Name"
                  value={petAdForm.name}
                  onChange={(value) => handlePetAdFormChange('name', value)}
                  required
                  placeholder="Enter pet name"
                />
                
                <InputWithLabel
                  id="edit-price"
                  label="Price (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={petAdForm.price.toString()}
                  onChange={(value) => handlePetAdFormChange('price', parseFloat(value) || 0)}
                  required
                  placeholder="0.00"
                />
              </div>

              <TextareaWithLabel
                id="edit-description"
                label="Description"
                value={petAdForm.description}
                onChange={(value) => handlePetAdFormChange('description', value)}
                required
                placeholder="Describe the pet, its personality, health status, etc."
                rows={3}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectWithLabel
                  id="edit-species"
                  label="Species"
                  value={petAdForm.species}
                  onValueChange={(value) => handlePetAdFormChange('species', value)}
                  required
                  options={[
                    { value: 'dog', label: 'Dog' },
                    { value: 'cat', label: 'Cat' },
                    { value: 'bird', label: 'Bird' },
                    { value: 'rabbit', label: 'Rabbit' },
                    { value: 'other', label: 'Other' }
                  ]}
                />

                <InputWithLabel
                  id="edit-breed"
                  label="Breed"
                  value={petAdForm.breed || ''}
                  onChange={(value) => handlePetAdFormChange('breed', value)}
                  placeholder="Enter breed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputWithLabel
                  id="edit-age"
                  label="Age (months)"
                  type="number"
                  min="0"
                  value={petAdForm.age?.toString() || ''}
                  onChange={(value) => handlePetAdFormChange('age', parseInt(value) || undefined)}
                  placeholder="Age in months"
                />

                <SelectWithLabel
                  id="edit-gender"
                  label="Gender"
                  value={petAdForm.gender || ''}
                  onValueChange={(value) => handlePetAdFormChange('gender', value || undefined)}
                  placeholder="Select gender"
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' }
                  ]}
                />

                <SelectWithLabel
                  id="edit-size"
                  label="Size"
                  value={petAdForm.size || ''}
                  onValueChange={(value) => handlePetAdFormChange('size', value || undefined)}
                  placeholder="Select size"
                  options={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWithLabel
                  id="edit-color"
                  label="Color"
                  value={petAdForm.color || ''}
                  onChange={(value) => handlePetAdFormChange('color', value)}
                  placeholder="Enter color"
                />

                <InputWithLabel
                  id="edit-weight"
                  label="Weight (kg)"
                  type="number"
                  min="0"
                  step="0.1"
                  value={petAdForm.weight?.toString() || ''}
                  onChange={(value) => handlePetAdFormChange('weight', parseFloat(value) || undefined)}
                  placeholder="Weight in kg"
                />
              </div>

              <SelectWithLabel
                id="edit-vaccinationStatus"
                label="Vaccination Status"
                value={petAdForm.vaccinationStatus || ''}
                onValueChange={(value) => handlePetAdFormChange('vaccinationStatus', value || undefined)}
                placeholder="Select vaccination status"
                options={[
                  { value: 'vaccinated', label: 'Vaccinated' },
                  { value: 'not_vaccinated', label: 'Not Vaccinated' },
                  { value: 'unknown', label: 'Unknown' }
                ]}
              />

              <TextareaWithLabel
                id="edit-medicalNotes"
                label="Medical Notes"
                value={petAdForm.medicalNotes || ''}
                onChange={(value) => handlePetAdFormChange('medicalNotes', value)}
                placeholder="Any medical conditions, treatments, etc."
                rows={2}
              />

              <TextareaWithLabel
                id="edit-behavioralNotes"
                label="Behavioral Notes"
                value={petAdForm.behavioralNotes || ''}
                onChange={(value) => handlePetAdFormChange('behavioralNotes', value)}
                placeholder="Temperament, training level, etc."
                rows={2}
              />

              <div className="space-y-2">
                <Label htmlFor="edit-images">Pet Images</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <ImageUpload
                        value={image}
                        onChange={(file) => {
                          const newImages = [...uploadedImages]
                          newImages[index] = file || new File([], '')
                          setUploadedImages(newImages.filter(img => img.size > 0))
                        }}
                        placeholder="Upload pet image"
                        description="PNG, JPG, GIF up to 5MB"
                        previewClassName="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                  {uploadedImages.length < 5 && (
                    <div className="relative">
                      <ImageUpload
                        value={null}
                        onChange={(file) => {
                          if (file) {
                            setUploadedImages(prev => [...prev, file])
                          }
                        }}
                        placeholder="Add another image"
                        description="PNG, JPG, GIF up to 5MB"
                        previewClassName="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload up to 5 images of your pet. The first image will be used as the main photo.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditPetAdModal(false)}
                  disabled={petAdFormLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={petAdFormLoading || !petAdForm.name || !petAdForm.description || petAdForm.price <= 0}
                >
                  {petAdFormLoading ? 'Updating...' : 'Update Pet Ad'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </ProtectedRoute>
    </Layout>
  )
}
