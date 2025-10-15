'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { petsApi } from '@/lib/pets'
import { Pet } from '@/types'
import { uploadPetProfilePicture, uploadPetGalleryImage, validateFile, getPublicUrl } from '@/lib/storage'
import { getBreedsBySpecies } from '@/lib/breeds'
import { translations } from '@/lib/translations'
import { Dog, Plus, Edit, Trash2, Loader2, X, Camera, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

export default function PetsPage() {
  const { user } = useAuth()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addPetOpen, setAddPetOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [petForm, setPetForm] = useState({
    name: '',
    species: 'dog' as 'dog' | 'cat' | 'bird' | 'rabbit' | 'other',
    breed: '',
    age: '',
    weight: '',
    specialNeeds: '',
    medicalNotes: '',
    profilePicture: '',
    galleryImages: [] as string[]
  })
  const [uploadingImages, setUploadingImages] = useState(false)
  const profilePictureRef = useRef<HTMLInputElement>(null)
  const galleryImagesRef = useRef<HTMLInputElement>(null)

  const fetchPets = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const userPets = await petsApi.getUserPets(user.id)
      setPets(userPets)
    } catch (err) {
      setError('Failed to fetch pets')
      console.error('Error fetching pets:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchPets()
    }
  }, [user, fetchPets]) // Include fetchPets but it's memoized with useCallback

  if (!user) return null

  const handleAddPet = () => {
    setPetForm({
      name: '',
      species: 'dog',
      breed: '',
      age: '',
      weight: '',
      specialNeeds: '',
      medicalNotes: '',
      profilePicture: '',
      galleryImages: []
    })
    setAddPetOpen(true)
  }

  const handleEditPet = (pet: Pet) => {
    setPetForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age: pet.age.toString(),
      weight: pet.weight?.toString() || '',
      specialNeeds: pet.specialNeeds?.join(', ') || '',
      medicalNotes: pet.medicalNotes || '',
      profilePicture: pet.profilePicture || '',
      galleryImages: pet.galleryImages
    })
    setEditingPet(pet)
  }

  const handleSavePet = async () => {
    try {
      const petData = {
        name: petForm.name,
        species: petForm.species,
        breed: petForm.breed || undefined,
        age: parseFloat(petForm.age), // Now in years
        weight: petForm.weight ? parseFloat(petForm.weight) : undefined,
        specialNeeds: petForm.specialNeeds ? petForm.specialNeeds.split(',').map(s => s.trim()) : [],
        medicalNotes: petForm.medicalNotes || undefined,
        profilePicture: petForm.profilePicture || undefined,
        galleryImages: petForm.galleryImages
      }

      if (editingPet) {
        const updatedPet = await petsApi.updatePet({
          id: editingPet.id,
          ...petData
        })
        setPets(prev => prev.map(pet => 
          pet.id === editingPet.id ? updatedPet : pet
        ))
        setEditingPet(null)
      } else {
        const newPet = await petsApi.createPet(petData, user.id)
        setPets(prev => [...prev, newPet])
        setAddPetOpen(false)
      }
    } catch (err) {
      console.error('Error saving pet:', err)
      alert('Failed to save pet')
    }
  }

  const handleDeletePet = async (petId: string) => {
    if (!confirm('Are you sure you want to delete this pet?')) return

    try {
      await petsApi.deletePet(petId)
      setPets(prev => prev.filter(pet => pet.id !== petId))
    } catch (err) {
      console.error('Error deleting pet:', err)
      alert('Failed to delete pet')
    }
  }

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'dog': return '🐕'
      case 'cat': return '🐱'
      case 'bird': return '🐦'
      case 'rabbit': return '🐰'
      default: return '🐾'
    }
  }

  const getTranslatedBreedName = (breedName: string) => {
    const breedsMap = (translations as unknown as { provider?: { breeds?: Record<string, string> } }).provider?.breeds || {}
    return breedsMap[breedName] || breedName
  }

  const getAvailableBreeds = () => {
    return getBreedsBySpecies(petForm.species)
  }

  const handleSpeciesChange = (species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other') => {
    setPetForm(prev => ({ 
      ...prev, 
      species,
      breed: '' // Reset breed when species changes
    }))
  }

  const getAgeText = (ageInYears: number) => {
    if (ageInYears < 1) {
      const months = Math.round(ageInYears * 12)
      return `${months} month${months !== 1 ? 's' : ''} old`
    } else {
      return `${ageInYears} year${ageInYears !== 1 ? 's' : ''} old`
    }
  }

  const handleProfilePictureUpload = async (file: File) => {
    const validation = validateFile(file, 5)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    setUploadingImages(true)
    try {
      // For new pets, we'll upload after creating the pet
      // For existing pets, upload immediately
      if (editingPet) {
        const result = await uploadPetProfilePicture(file, editingPet.id)
        if (result.error) {
          throw result.error
        }
        const publicUrl = getPublicUrl('pet-images', result.data!.path)
        setPetForm(prev => ({ ...prev, profilePicture: publicUrl }))
      } else {
        // Store file for later upload
        const reader = new FileReader()
        reader.onload = (e) => {
          setPetForm(prev => ({ ...prev, profilePicture: e.target?.result as string }))
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      alert('Failed to upload profile picture')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleGalleryImageUpload = async (files: FileList) => {
    setUploadingImages(true)
    try {
      const newImages: string[] = []
      
      for (const file of Array.from(files)) {
        const validation = validateFile(file, 5)
        if (!validation.valid) {
          alert(validation.error)
          continue
        }

        if (editingPet) {
          const result = await uploadPetGalleryImage(file, editingPet.id)
          if (result.error) {
            throw result.error
          }
          const publicUrl = getPublicUrl('pet-images', result.data!.path)
          newImages.push(publicUrl)
        } else {
          // Read files as data URLs and wait for all to finish
          const readAsDataUrl = (f: File) => new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = () => reject(new Error('Failed to read file'))
            reader.readAsDataURL(f)
          })
          const dataUrl = await readAsDataUrl(file)
          newImages.push(dataUrl)
        }
      }
      
      setPetForm(prev => ({ 
        ...prev, 
        galleryImages: [...prev.galleryImages, ...newImages] 
      }))
    } catch (error) {
      console.error('Error uploading gallery images:', error)
      alert('Failed to upload gallery images')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    setPetForm(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }))
  }

  return (
    <Layout hideFooter={true}>
      <ProtectedRoute>
        <div className="min-h-[calc(100vh-4rem)] md:min-h-screen bg-gray-50 pt-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mano gyvūnai</h1>
                <p className="text-gray-600">Valdykite savo gyvūnų profilius</p>
              </div>
              <div className="flex justify-start md:justify-end">
                <Button onClick={handleAddPet}>
                  <Plus className="h-4 w-4 mr-2" />
                  Pridėti gyvūną
                </Button>
              </div>
            </div>

            {/* Pets List */}
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Kraunami jūsų gyvūnai...</p>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={fetchPets}>Bandyti dar kartą</Button>
                  </CardContent>
                </Card>
              ) : pets.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Dog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Dar nėra gyvūnų</h3>
                    <p className="text-gray-600 mb-4">Pridėkite savo pirmą gyvūną, kad pradėtumėte</p>
                    <Button onClick={handleAddPet}>
                      <Plus className="h-4 w-4 mr-2" />
                      Pridėti gyvūną
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                pets.map((pet) => (
                  <Card key={pet.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={pet.profilePicture || pet.galleryImages[0]} alt={pet.name} />
                          <AvatarFallback className="text-lg">
                            {getSpeciesIcon(pet.species)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {pet.name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <span className="capitalize">{pet.species}</span>
                              {pet.breed && <span>{getTranslatedBreedName(pet.breed)}</span>}
                              <span>{getAgeText(pet.age)}</span>
                              {pet.weight && <span>{pet.weight} kg</span>}
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditPet(pet)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Redaguoti
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeletePet(pet.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Ištrinti
                              </Button>
                            </div>
                          </div>
                          
                          {pet.specialNeeds && pet.specialNeeds.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-900 mb-1">Specialūs poreikiai:</p>
                              <div className="flex flex-wrap gap-1">
                                {pet.specialNeeds.map((need, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {need}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {pet.medicalNotes && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-900 mb-1">Medicinos pastabos:</p>
                              <p className="text-sm text-gray-600">{pet.medicalNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Pet Modal */}
        <Dialog open={addPetOpen || !!editingPet} onOpenChange={() => {
          setAddPetOpen(false)
          setEditingPet(null)
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPet ? 'Redaguoti gyvūną' : 'Pridėti naują gyvūną'}</DialogTitle>
              <DialogDescription>
                {editingPet ? 'Atnaujinkite savo gyvūno informaciją' : 'Pridėkite naują gyvūną į savo profilį'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Profile Picture Section */}
              <div>
                <Label className="text-base font-medium">Profilio nuotrauka</Label>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={petForm.profilePicture} alt="Profile preview" />
                      <AvatarFallback className="text-lg">
                        {getSpeciesIcon(petForm.species)}
                      </AvatarFallback>
                    </Avatar>
                    {petForm.profilePicture && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => setPetForm(prev => ({ ...prev, profilePicture: '' }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => profilePictureRef.current?.click()}
                      disabled={uploadingImages}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {petForm.profilePicture ? 'Keisti nuotrauką' : 'Pridėti nuotrauką'}
                    </Button>
                    <input
                      ref={profilePictureRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleProfilePictureUpload(file)
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="petName" className="text-base font-medium">Gyvūno vardas *</Label>
                  <Input
                    id="petName"
                    value={petForm.name}
                    onChange={(e) => setPetForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Įveskite gyvūno vardą"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="petSpecies" className="text-base font-medium">Rūšis *</Label>
                  <Select
                    value={petForm.species}
                    onValueChange={handleSpeciesChange}
                  >
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Šuo</SelectItem>
                      <SelectItem value="cat">Katė</SelectItem>
                      <SelectItem value="bird">Paukštis</SelectItem>
                      <SelectItem value="rabbit">Triušis</SelectItem>
                      <SelectItem value="other">Kita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="petBreed" className="text-base font-medium">Veislė</Label>
                  <Select
                    value={petForm.breed || undefined}
                    onValueChange={(value) => setPetForm(prev => ({ ...prev, breed: value }))}
                  >
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue placeholder="Pasirinkti veislę" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableBreeds().map((breed) => (
                        <SelectItem key={breed.name} value={breed.name}>
                          {getTranslatedBreedName(breed.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="petAge" className="text-base font-medium">Amžius (metai) *</Label>
                  <Input
                    id="petAge"
                    type="number"
                    step="0.1"
                    value={petForm.age}
                    onChange={(e) => setPetForm(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Įveskite amžių metais"
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="petWeight" className="text-base font-medium">Svoris (kg)</Label>
                <Input
                  id="petWeight"
                  type="number"
                  step="0.1"
                  value={petForm.weight}
                  onChange={(e) => setPetForm(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="Įveskite svorį kg"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="petSpecialNeeds" className="text-base font-medium">Specialūs poreikiai</Label>
                <Input
                  id="petSpecialNeeds"
                  value={petForm.specialNeeds}
                  onChange={(e) => setPetForm(prev => ({ ...prev, specialNeeds: e.target.value }))}
                  placeholder="Įveskite specialius poreikius (atskirtus kableliais)"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="petMedicalNotes" className="text-base font-medium">Medicinos pastabos</Label>
                <Textarea
                  id="petMedicalNotes"
                  value={petForm.medicalNotes}
                  onChange={(e) => setPetForm(prev => ({ ...prev, medicalNotes: e.target.value }))}
                  placeholder="Įveskite medicinos pastabas ar alergijas"
                  rows={3}
                  className="mt-2"
                />
              </div>

              {/* Gallery Images Section */}
              <div>
                <Label className="text-base font-medium">Galerijos paveikslėliai</Label>
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => galleryImagesRef.current?.click()}
                    disabled={uploadingImages}
                    className="mb-4"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Pridėti galerijos paveikslėlius
                  </Button>
                  <input
                    ref={galleryImagesRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files
                      if (files) handleGalleryImageUpload(files)
                    }}
                  />
                  
                  {petForm.galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {petForm.galleryImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={image}
                            alt={`Gallery ${index + 1}`}
                            width={96}
                            height={96}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeGalleryImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAddPetOpen(false)
                    setEditingPet(null)
                  }}
                >
                  Atšaukti
                </Button>
                <Button onClick={handleSavePet}>
                  {editingPet ? 'Atnaujinti gyvūną' : 'Pridėti gyvūną'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </ProtectedRoute>
    </Layout>
  )
}
