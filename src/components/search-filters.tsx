'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SearchFilters as SearchFiltersType, ServiceCategory, Pet } from '@/types'
import { MapPin, Filter, X, User } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { petsApi } from '@/lib/pets'

const serviceCategories: { value: ServiceCategory; label: string }[] = [
  { value: 'grooming', label: 'Gyvūnų šukavimas' },
  { value: 'veterinary', label: 'Veterinarijos paslaugos' },
  { value: 'boarding', label: 'Gyvūnų prieglauda' },
  { value: 'training', label: 'Gyvūnų treniruotės' },
  { value: 'walking', label: 'Šunų vedimas' },
  { value: 'sitting', label: 'Gyvūnų prižiūrėjimas' },
]

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
}

export const SearchFilters = ({ filters, onFiltersChange }: SearchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [userPets, setUserPets] = useState<Pet[]>([])
  const [loadingPets, setLoadingPets] = useState(false)
  const { user } = useAuth()

  // Fetch user pets when component mounts
  useEffect(() => {
    const fetchUserPets = async () => {
      if (!user) return
      
      try {
        setLoadingPets(true)
        const pets = await petsApi.getUserPets(user.id)
        setUserPets(pets)
      } catch (error) {
        console.error('Error fetching user pets:', error)
        setUserPets([])
      } finally {
        setLoadingPets(false)
      }
    }

    fetchUserPets()
  }, [user])

  const handleFilterChange = (key: keyof SearchFiltersType, value: string | number | undefined | { min: number; max?: number } | { max: number; min?: number }) => {
    // Convert "all" to undefined for category filter
    const processedValue = key === 'category' && value === 'all' ? undefined : value
    onFiltersChange({
      ...filters,
      [key]: processedValue,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      category: undefined,
      location: '',
      priceRange: { min: 0, max: 5000 },
      rating: 0,
      distance: 25,
      petId: undefined,
    })
  }

  const hasActiveFilters = filters.category || filters.location || (filters.rating && filters.rating > 0) || filters.petId

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main Search Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Service Category */}
            <div>
              <Label htmlFor="category">Paslaugos tipas</Label>
              <Select 
                value={filters.category || 'all'} 
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Visos paslaugos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Visos paslaugos</SelectItem>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Vieta</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="Įveskite vietą"
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Distance */}
            <div>
              <Label htmlFor="distance">Atstumas</Label>
              <Select 
                value={filters.distance?.toString() || '25'} 
                onValueChange={(value) => handleFilterChange('distance', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Per 5 km</SelectItem>
                  <SelectItem value="10">Per 10 km</SelectItem>
                  <SelectItem value="25">Per 25 km</SelectItem>
                  <SelectItem value="50">Per 50 km</SelectItem>
                  <SelectItem value="100">Per 100 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pet Selection */}
            <div>
              <Label htmlFor="pet">Gyvūnas</Label>
              <Select 
                value={filters.petId || 'all'} 
                onValueChange={(value) => handleFilterChange('petId', value === 'all' ? undefined : value)}
                disabled={loadingPets || !user}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPets ? "Kraunama..." : user ? "Pasirinkite gyvūną" : "Prisijunkite"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Visi gyvūnai</SelectItem>
                  {userPets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{pet.name}</span>
                        <span className="text-xs text-gray-500 capitalize">({pet.species})</span>
                      </div>
                    </SelectItem>
                  ))}
                  {user && userPets.length === 0 && !loadingPets && (
                    <SelectItem value="no-pets" disabled>
                      Nėra pridėtų gyvūnų
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Daugiau filtrų</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    {Object.values(filters).filter(Boolean).length}
                  </Badge>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price Range */}
                <div>
                  <Label>Kainų intervalas</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange?.min || ''}
                      onChange={(e) => handleFilterChange('priceRange', {
                        ...filters.priceRange,
                        min: parseInt(e.target.value) || 0
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="Maks"
                      value={filters.priceRange?.max || ''}
                      onChange={(e) => handleFilterChange('priceRange', {
                        ...filters.priceRange,
                        max: parseInt(e.target.value) || 5000
                      })}
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <Label>Minimalus įvertinimas</Label>
                  <Select 
                    value={filters.rating?.toString() || '0'} 
                    onValueChange={(value) => handleFilterChange('rating', parseFloat(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Bet koks įvertinimas</SelectItem>
                      <SelectItem value="3">3+ žvaigždutės</SelectItem>
                      <SelectItem value="4">4+ žvaigždutės</SelectItem>
                      <SelectItem value="4.5">4.5+ žvaigždutės</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <Label>Rūšiuoti pagal</Label>
                  <Select value="relevance" onValueChange={() => {}}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Reikšmingumą</SelectItem>
                      <SelectItem value="rating">Įvertinimą</SelectItem>
                      <SelectItem value="price-low">Kainą: nuo žemiausios</SelectItem>
                      <SelectItem value="price-high">Kainą: nuo aukščiausios</SelectItem>
                      <SelectItem value="distance">Atstumą</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Paslauga: {serviceCategories.find(c => c.value === filters.category)?.label}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('category', 'all')}
                  />
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Vieta: {filters.location}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('location', '')}
                  />
                </Badge>
              )}
              {filters.rating && filters.rating > 0 && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Įvertinimas: {filters.rating}+ žvaigždutės</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('rating', 0)}
                  />
                </Badge>
              )}
              {filters.petId && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Gyvūnas: {userPets.find(pet => pet.id === filters.petId)?.name || 'Pasirinktas'}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('petId', undefined)}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
