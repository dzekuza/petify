'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { SearchFilters as SearchFiltersType, ServiceCategory, Pet } from '@/types'
import { Filter, X, User, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer'

// Grooming-specific service types (since only groomers can use the app currently)
const groomingServiceTypes: { value: string; label: string }[] = [
  { value: 'basic-bath', label: 'Paprastas maudymas' },
  { value: 'full-grooming', label: 'Pilnas kirpimas ir priežiūra' },
  { value: 'nail-trimming', label: 'Nagų kirpimas' },
  { value: 'ear-cleaning', label: 'Ausų valymas' },
  { value: 'teeth-cleaning', label: 'Dantų valymas' },
]

interface MobileFilterDrawerProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
  userPets: Pet[]
  loadingPets: boolean
}

export const MobileFilterDrawer = ({ 
  filters, 
  onFiltersChange, 
  userPets, 
  loadingPets
}: MobileFilterDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

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
  
  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category) count++
    if (filters.location) count++
    if (filters.rating && filters.rating > 0) count++
    if (filters.petId) count++
    return count
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="bottom">
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center space-x-2 w-full justify-center h-9"
        >
          <Filter className="h-4 w-4" />
          <span>Daugiau filtrų</span>
          {hasActiveFilters && getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[90vh] z-[100] border-t-2 border-primary/20">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </DrawerClose>
            <div>
              <DrawerTitle>Filtrai</DrawerTitle>
              <DrawerDescription>
                Tinkinkite savo paiešką
              </DrawerDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                <span className="ml-1">Išvalyti</span>
              </Button>
            )}
          </div>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Service Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Paslaugos tipas</Label>
            <Select 
              value={filters.category || 'all'} 
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Visos paslaugos" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">Visos paslaugos</SelectItem>
                {groomingServiceTypes.map((serviceType) => (
                  <SelectItem key={serviceType.value} value={serviceType.value}>
                    {serviceType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Vieta</Label>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <Input
                className="pl-10 pr-10"
                placeholder="Įveskite vietą"
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true">
                <path d="m21 21-4.34-4.34"></path>
                <circle cx="11" cy="11" r="8"></circle>
              </svg>
            </div>
          </div>

          {/* Distance */}
          <div className="space-y-2">
            <Label htmlFor="distance">Atstumas</Label>
            <Select 
              value={filters.distance?.toString() || '25'} 
              onValueChange={(value) => handleFilterChange('distance', parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="5">Per 5 km</SelectItem>
                <SelectItem value="10">Per 10 km</SelectItem>
                <SelectItem value="25">Per 25 km</SelectItem>
                <SelectItem value="50">Per 50 km</SelectItem>
                <SelectItem value="100">Per 100 km</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pet Selection */}
          <div className="space-y-2">
            <Label htmlFor="pet">Gyvūnas</Label>
            <Select 
              value={filters.petId || 'all'} 
              onValueChange={(value) => handleFilterChange('petId', value === 'all' ? undefined : value)}
              disabled={loadingPets || !user}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingPets ? "Kraunama..." : user ? "Pasirinkite gyvūną" : "Prisijunkite"} />
              </SelectTrigger>
              <SelectContent className="z-[200]">
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

          {/* Price Range */}
          <div className="space-y-2">
            <Label>Kainų intervalas</Label>
            <div className="flex space-x-2">
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
          <div className="space-y-2">
            <Label>Minimalus įvertinimas</Label>
            <Select 
              value={filters.rating?.toString() || '0'} 
              onValueChange={(value) => handleFilterChange('rating', parseFloat(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="0">Bet koks įvertinimas</SelectItem>
                <SelectItem value="3">3+ žvaigždutės</SelectItem>
                <SelectItem value="4">4+ žvaigždutės</SelectItem>
                <SelectItem value="4.5">4.5+ žvaigždutės</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Rūšiuoti pagal</Label>
            <Select value="relevance" onValueChange={() => {}}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="relevance">Reikšmingumą</SelectItem>
                <SelectItem value="rating">Įvertinimą</SelectItem>
                <SelectItem value="price-low">Kainą: nuo žemiausios</SelectItem>
                <SelectItem value="price-high">Kainą: nuo aukščiausios</SelectItem>
                <SelectItem value="distance">Atstumą</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="space-y-2">
              <Label>Aktyvūs filtrai</Label>
              <div className="flex flex-wrap gap-2">
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center space-x-1 [&>svg]:pointer-events-auto">
                    <span>Paslauga: {groomingServiceTypes.find(c => c.value === filters.category)?.label}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('category', 'all')}
                    />
                  </Badge>
                )}
                {filters.location && (
                  <Badge variant="secondary" className="flex items-center space-x-1 [&>svg]:pointer-events-auto">
                    <span>Vieta: {filters.location}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('location', '')}
                    />
                  </Badge>
                )}
                {filters.rating && filters.rating > 0 && (
                  <Badge variant="secondary" className="flex items-center space-x-1 [&>svg]:pointer-events-auto">
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
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
