'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Dog, Plus, Edit, Trash2, Loader2, Upload } from 'lucide-react'

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
    images: [] as string[]
  })

  if (!user) return null

  useEffect(() => {
    fetchPets()
  }, [user])

  const fetchPets = async () => {
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
  }

  const handleAddPet = () => {
    setPetForm({
      name: '',
      species: 'dog',
      breed: '',
      age: '',
      weight: '',
      specialNeeds: '',
      medicalNotes: '',
      images: []
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
      images: pet.images
    })
    setEditingPet(pet)
  }

  const handleSavePet = async () => {
    try {
      const petData = {
        name: petForm.name,
        species: petForm.species,
        breed: petForm.breed || undefined,
        age: parseInt(petForm.age),
        weight: petForm.weight ? parseFloat(petForm.weight) : undefined,
        specialNeeds: petForm.specialNeeds ? petForm.specialNeeds.split(',').map(s => s.trim()) : [],
        medicalNotes: petForm.medicalNotes || undefined,
        images: petForm.images
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

  const getAgeText = (ageInMonths: number) => {
    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''} old`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      if (months === 0) {
        return `${years} year${years !== 1 ? 's' : ''} old`
      } else {
        return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''} old`
      }
    }
  }

  return (
    <Layout>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Pets</h1>
                <p className="text-gray-600">Manage your pet profiles</p>
              </div>
              <Button onClick={handleAddPet}>
                <Plus className="h-4 w-4 mr-2" />
                Add Pet
              </Button>
            </div>

            {/* Pets List */}
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Loading your pets...</p>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={fetchPets}>Try Again</Button>
                  </CardContent>
                </Card>
              ) : pets.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Dog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pets yet</h3>
                    <p className="text-gray-600 mb-4">Add your first pet to get started</p>
                    <Button onClick={handleAddPet}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Pet
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                pets.map((pet) => (
                  <Card key={pet.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={pet.images[0]} alt={pet.name} />
                          <AvatarFallback className="text-lg">
                            {getSpeciesIcon(pet.species)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                {pet.name}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="capitalize">{pet.species}</span>
                                {pet.breed && <span>{pet.breed}</span>}
                                <span>{getAgeText(pet.age)}</span>
                                {pet.weight && <span>{pet.weight} kg</span>}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditPet(pet)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeletePet(pet.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                          
                          {pet.specialNeeds && pet.specialNeeds.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-900 mb-1">Special Needs:</p>
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
                              <p className="text-sm font-medium text-gray-900 mb-1">Medical Notes:</p>
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPet ? 'Edit Pet' : 'Add New Pet'}</DialogTitle>
              <DialogDescription>
                {editingPet ? 'Update your pet information' : 'Add a new pet to your profile'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="petName">Pet Name *</Label>
                  <Input
                    id="petName"
                    value={petForm.name}
                    onChange={(e) => setPetForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter pet name"
                  />
                </div>
                <div>
                  <Label htmlFor="petSpecies">Species *</Label>
                  <Select
                    value={petForm.species}
                    onValueChange={(value: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other') => 
                      setPetForm(prev => ({ ...prev, species: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="rabbit">Rabbit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="petBreed">Breed</Label>
                  <Input
                    id="petBreed"
                    value={petForm.breed}
                    onChange={(e) => setPetForm(prev => ({ ...prev, breed: e.target.value }))}
                    placeholder="Enter breed"
                  />
                </div>
                <div>
                  <Label htmlFor="petAge">Age (months) *</Label>
                  <Input
                    id="petAge"
                    type="number"
                    value={petForm.age}
                    onChange={(e) => setPetForm(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Enter age in months"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="petWeight">Weight (kg)</Label>
                <Input
                  id="petWeight"
                  type="number"
                  step="0.1"
                  value={petForm.weight}
                  onChange={(e) => setPetForm(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="Enter weight in kg"
                />
              </div>
              
              <div>
                <Label htmlFor="petSpecialNeeds">Special Needs</Label>
                <Input
                  id="petSpecialNeeds"
                  value={petForm.specialNeeds}
                  onChange={(e) => setPetForm(prev => ({ ...prev, specialNeeds: e.target.value }))}
                  placeholder="Enter special needs (comma separated)"
                />
              </div>
              
              <div>
                <Label htmlFor="petMedicalNotes">Medical Notes</Label>
                <Textarea
                  id="petMedicalNotes"
                  value={petForm.medicalNotes}
                  onChange={(e) => setPetForm(prev => ({ ...prev, medicalNotes: e.target.value }))}
                  placeholder="Enter any medical notes or allergies"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAddPetOpen(false)
                    setEditingPet(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSavePet}>
                  {editingPet ? 'Update Pet' : 'Add Pet'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </ProtectedRoute>
    </Layout>
  )
}
