'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
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
import { supabase } from '@/lib/supabase'
import { Dog, Plus, Edit, Trash2, Loader2, X, Camera, Image as ImageIcon, PawPrint, Heart } from 'lucide-react'
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
  }, [user, fetchPets])

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
    const petData = {
      name: petForm.name,
      species: petForm.species,
      breed: petForm.breed || undefined,
      age: parseFloat(petForm.age),
      weight: petForm.weight ? parseFloat(petForm.weight) : undefined,
      specialNeeds: petForm.specialNeeds ? petForm.specialNeeds.split(',').map(s => s.trim()) : [],
      medicalNotes: petForm.medicalNotes || undefined,
      profilePicture: petForm.profilePicture || undefined,
      galleryImages: petForm.galleryImages
    }

    try {
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
    } catch (err: any) {
      console.error('Error saving pet:', err)

      if (err.message && err.message.includes('foreign key constraint')) {
        try {
          console.log('Attempting to fix missing user record...')
          const { error: userError } = await supabase.from('users').upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: user.user_metadata?.role || 'customer',
            updated_at: new Date().toISOString()
          })

          if (!userError) {
            console.log('User record fixed, retrying pet creation...')
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
            return
          } else {
            console.error('Failed to fix user record:', userError)
          }
        } catch (retryErr) {
          console.error('Retry failed:', retryErr)
        }
      }

      alert('Failed to save pet: ' + (err.message || 'Unknown error'))
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

  const speciesColors: Record<string, { bg: string; border: string }> = {
    dog: { bg: 'bg-amber-50', border: 'border-amber-200' },
    cat: { bg: 'bg-purple-50', border: 'border-purple-200' },
    bird: { bg: 'bg-sky-50', border: 'border-sky-200' },
    rabbit: { bg: 'bg-pink-50', border: 'border-pink-200' },
    other: { bg: 'bg-gray-50', border: 'border-gray-200' },
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
      breed: ''
    }))
  }

  const getAgeText = (ageInYears: number) => {
    if (ageInYears < 1) {
      const months = Math.round(ageInYears * 12)
      return `${months} mėn.`
    } else {
      return `${ageInYears} m.`
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
      if (editingPet) {
        const result = await uploadPetProfilePicture(file, editingPet.id)
        if (result.error) {
          throw result.error
        }
        const publicUrl = getPublicUrl('pet-images', result.data!.path)
        setPetForm(prev => ({ ...prev, profilePicture: publicUrl }))
      } else {
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
        <div className="min-h-[calc(100vh-4rem)] md:min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-10 -right-24 w-72 h-72 rounded-full bg-amber-100/30 blur-3xl" />
            <div className="absolute bottom-32 -left-16 w-64 h-64 rounded-full bg-rose-100/20 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-8">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-2 duration-400">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Mano gyvūnai</h1>
                <p className="text-muted-foreground text-sm mt-1">Valdykite savo gyvūnų profilius</p>
              </div>
              <div>
                <Button
                  onClick={handleAddPet}
                  className="rounded-xl bg-foreground hover:bg-foreground/90 text-background shadow-sm h-10 px-5"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Pridėti gyvūną
                </Button>
              </div>
            </div>

            {/* Pets List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-full border-[3px] border-amber-200 border-t-amber-500 animate-spin" />
                <p className="text-sm text-muted-foreground mt-4">Kraunami jūsų gyvūnai...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 rounded-2xl bg-white/60 backdrop-blur-sm border border-border/40 animate-in fade-in duration-300">
                <p className="text-red-600 mb-4 text-sm">{error}</p>
                <Button onClick={fetchPets} variant="outline" className="rounded-xl">Bandyti dar kartą</Button>
              </div>
            ) : pets.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-white/60 backdrop-blur-sm border border-border/40 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <PawPrint className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Dar nėra gyvūnų</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">Pridėkite savo pirmą gyvūną, kad pradėtumėte</p>
                <Button
                  onClick={handleAddPet}
                  className="rounded-xl bg-foreground hover:bg-foreground/90 text-background"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Pridėti gyvūną
                </Button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-400">
                {pets.map((pet) => {
                  const sc = speciesColors[pet.species] || speciesColors.other
                  return (
                    <div
                      key={pet.id}
                      className="rounded-2xl bg-white/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <div className="p-5 sm:p-6">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-2 ring-border/20 ring-offset-2">
                              <AvatarImage src={pet.profilePicture || pet.galleryImages[0]} alt={pet.name} />
                              <AvatarFallback className={`text-2xl ${sc.bg}`}>
                                {getSpeciesIcon(pet.species)}
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                                  {pet.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mt-0.5">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${sc.bg} ${sc.border}`}>
                                    {getSpeciesIcon(pet.species)} {pet.species === 'dog' ? 'Šuo' : pet.species === 'cat' ? 'Katė' : pet.species === 'bird' ? 'Paukštis' : pet.species === 'rabbit' ? 'Triušis' : 'Kita'}
                                  </span>
                                  {pet.breed && <span>{getTranslatedBreedName(pet.breed)}</span>}
                                  <span>{getAgeText(pet.age)}</span>
                                  {pet.weight && <span>{pet.weight} kg</span>}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-muted/60"
                                  onClick={() => handleEditPet(pet)}
                                >
                                  <Edit className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600"
                                  onClick={() => handleDeletePet(pet.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Special needs */}
                            {pet.specialNeeds && pet.specialNeeds.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {pet.specialNeeds.map((need, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium"
                                  >
                                    <Heart className="h-3 w-3" />
                                    {need}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Medical notes */}
                            {pet.medicalNotes && (
                              <div className="mt-3 py-2 px-3 rounded-xl bg-muted/40">
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium text-foreground">Medicinos pastabos:</span> {pet.medicalNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
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
