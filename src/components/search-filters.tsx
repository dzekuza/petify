'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { SearchFilters as SearchFiltersType, ServiceCategory, Pet } from '@/types'
import { Filter, X, User, ChevronDown, ChevronUp, SlidersHorizontal, MapPin, Scissors, Ruler, PawPrint } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { petsApi } from '@/lib/pets'

// Grooming-specific service types (since only groomers can use the app currently)
const groomingServiceTypes: { value: string; label: string }[] = [
  { value: 'basic-bath', label: 'Paprastas maudymas' },
  { value: 'full-grooming', label: 'Pilnas kirpimas ir priežiūra' },
  { value: 'nail-trimming', label: 'Nagų kirpimas' },
  { value: 'ear-cleaning', label: 'Ausų valymas' },
  { value: 'teeth-cleaning', label: 'Dantų valymas' },
]

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
  isMobile?: boolean
  resultsCount?: number
  mobileFiltersExpanded?: boolean
}

export const SearchFilters = ({ filters, onFiltersChange, isMobile = false, resultsCount, mobileFiltersExpanded }: SearchFiltersProps) => {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false)

  // Use controlled state if provided, otherwise internal state
  const isExpanded = mobileFiltersExpanded !== undefined ? mobileFiltersExpanded : internalIsExpanded
  const setIsExpanded = (value: boolean) => setInternalIsExpanded(value)

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

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category) count++
    if (filters.location) count++
    if (filters.rating && filters.rating > 0) count++
    if (filters.petId) count++
    return count
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex items-end space-x-2 col-span-1">
            <div className="w-full space-y-4">
              {mobileFiltersExpanded === undefined && (
                <div className="flex items-center justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={isExpanded ? "bg-accent" : ""}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {isExpanded && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label>Paslaugos tipas</Label>
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

                  <div className="space-y-2">
                    <Label>Vieta</Label>
                    <Select
                      value={filters.location || 'all'}
                      onValueChange={(value) => handleFilterChange('location', value === 'all' ? '' : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Visos vietovės" />
                      </SelectTrigger>
                      <SelectContent className="z-[200]">
                        <SelectItem value="all">Visos vietovės</SelectItem>
                        <SelectItem value="Vilnius">Vilnius</SelectItem>
                        <SelectItem value="Kaunas">Kaunas</SelectItem>
                        <SelectItem value="Klaipėda">Klaipėda</SelectItem>
                        <SelectItem value="Šiauliai">Šiauliai</SelectItem>
                        <SelectItem value="Panevėžys">Panevėžys</SelectItem>
                        <SelectItem value="Alytus">Alytus</SelectItem>
                        <SelectItem value="Marijampolė">Marijampolė</SelectItem>
                        <SelectItem value="Mažeikiai">Mažeikiai</SelectItem>
                        <SelectItem value="Jonava">Jonava</SelectItem>
                        <SelectItem value="Utena">Utena</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Gyvūnas</Label>
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
                              <span className="text-xs text-muted-foreground capitalize">({pet.species})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4 space-y-4">
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <Badge variant="secondary" className="flex items-center space-x-1 [&>svg]:pointer-events-auto">
                <span>Paslauga: {groomingServiceTypes.find(c => c.value === filters.category)?.label}</span>
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('category', 'all')} />
              </Badge>
            )}
            {filters.location && (
              <Badge variant="secondary" className="flex items-center space-x-1 [&>svg]:pointer-events-auto">
                <span>Vieta: {filters.location}</span>
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('location', '')} />
              </Badge>
            )}
            {filters.rating && filters.rating > 0 && (
              <Badge variant="secondary" className="flex items-center space-x-1 [&>svg]:pointer-events-auto">
                <span>Įvertinimas: {filters.rating}+ žvaigždutės</span>
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('rating', 0)} />
              </Badge>
            )}
            {filters.petId && (
              <Badge variant="secondary" className="flex items-center space-x-1 [&>svg]:pointer-events-auto">
                <span>Gyvūnas: {userPets.find(pet => pet.id === filters.petId)?.name || 'Pasirinktas'}</span>
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('petId', undefined)} />
              </Badge>
            )}
          </div>
        )}
      </div>
    )
  }

  // Desktop layout - compact inline filters for sidebar
  return (
    <div className="space-y-3">
      {/* Primary Filters Row */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Service Category */}
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => handleFilterChange('category', value)}
        >
          <SelectTrigger className="w-auto min-w-[160px] h-9 rounded-full border-neutral-200 bg-neutral-50/80 hover:bg-neutral-100 text-[13px] font-medium transition-colors px-3.5 gap-1.5">
            <Scissors className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
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

        {/* Location */}
        <Select
          value={filters.location || 'all'}
          onValueChange={(value) => handleFilterChange('location', value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-auto min-w-[140px] h-9 rounded-full border-neutral-200 bg-neutral-50/80 hover:bg-neutral-100 text-[13px] font-medium transition-colors px-3.5 gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            <SelectValue placeholder="Visos vietovės" />
          </SelectTrigger>
          <SelectContent className="z-[200]">
            <SelectItem value="all">Visos vietovės</SelectItem>
            <SelectItem value="Vilnius">Vilnius</SelectItem>
            <SelectItem value="Kaunas">Kaunas</SelectItem>
            <SelectItem value="Klaipėda">Klaipėda</SelectItem>
            <SelectItem value="Šiauliai">Šiauliai</SelectItem>
            <SelectItem value="Panevėžys">Panevėžys</SelectItem>
            <SelectItem value="Alytus">Alytus</SelectItem>
            <SelectItem value="Marijampolė">Marijampolė</SelectItem>
            <SelectItem value="Mažeikiai">Mažeikiai</SelectItem>
            <SelectItem value="Jonava">Jonava</SelectItem>
            <SelectItem value="Utena">Utena</SelectItem>
          </SelectContent>
        </Select>

        {/* Distance */}
        <Select
          value={filters.distance?.toString() || '25'}
          onValueChange={(value) => handleFilterChange('distance', parseInt(value))}
        >
          <SelectTrigger className="w-auto min-w-[120px] h-9 rounded-full border-neutral-200 bg-neutral-50/80 hover:bg-neutral-100 text-[13px] font-medium transition-colors px-3.5 gap-1.5">
            <Ruler className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
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

        {/* Pet Selection */}
        <Select
          value={filters.petId || 'all'}
          onValueChange={(value) => handleFilterChange('petId', value === 'all' ? undefined : value)}
          disabled={loadingPets || !user}
        >
          <SelectTrigger className="w-auto min-w-[140px] h-9 rounded-full border-neutral-200 bg-neutral-50/80 hover:bg-neutral-100 text-[13px] font-medium transition-colors px-3.5 gap-1.5">
            <PawPrint className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            <SelectValue placeholder={loadingPets ? "Kraunama..." : user ? "Gyvūnas" : "Prisijunkite"} />
          </SelectTrigger>
          <SelectContent className="z-[200]">
            <SelectItem value="all">Visi gyvūnai</SelectItem>
            {userPets.map((pet) => (
              <SelectItem key={pet.id} value={pet.id}>
                <div className="flex items-center space-x-2">
                  <span>{pet.name}</span>
                  <span className="text-xs text-neutral-400 capitalize">({pet.species})</span>
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

        {/* More Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`h-9 rounded-full border-neutral-200 text-[13px] font-medium px-3.5 gap-1.5 transition-colors ${isExpanded ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800 hover:text-white' : 'bg-neutral-50/80 hover:bg-neutral-100'}`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filtrai</span>
          {hasActiveFilters && getActiveFiltersCount() > 0 && (
            <span className={`text-[11px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center ${isExpanded ? 'text-white' : 'text-neutral-900'}`}>
              {getActiveFiltersCount()}
            </span>
          )}
        </Button>

        {/* Clear All */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="h-9 px-3 text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors underline underline-offset-2 decoration-neutral-300 hover:decoration-neutral-500"
          >
            Išvalyti
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="pt-3 pb-1 border-t border-neutral-100 animate-in slide-in-from-top-1 duration-200">
          <div className="grid grid-cols-3 gap-3">
            {/* Price Range */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-neutral-500 uppercase tracking-wider">Kainų intervalas</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    min: parseInt(e.target.value) || 0
                  })}
                  className="h-9 rounded-lg text-[13px] border-neutral-200"
                />
                <span className="text-neutral-300 text-sm">&ndash;</span>
                <Input
                  type="number"
                  placeholder="Maks"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    max: parseInt(e.target.value) || 5000
                  })}
                  className="h-9 rounded-lg text-[13px] border-neutral-200"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-neutral-500 uppercase tracking-wider">Minimalus įvertinimas</Label>
              <Select
                value={filters.rating?.toString() || '0'}
                onValueChange={(value) => handleFilterChange('rating', parseFloat(value))}
              >
                <SelectTrigger className="w-full h-9 rounded-lg text-[13px] border-neutral-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="0">Bet koks</SelectItem>
                  <SelectItem value="3">3+ žvaigždutės</SelectItem>
                  <SelectItem value="4">4+ žvaigždutės</SelectItem>
                  <SelectItem value="4.5">4.5+ žvaigždutės</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-neutral-500 uppercase tracking-wider">Rūšiuoti pagal</Label>
              <Select value="relevance" onValueChange={() => { }}>
                <SelectTrigger className="w-full h-9 rounded-lg text-[13px] border-neutral-200">
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
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-medium bg-neutral-100 hover:bg-neutral-200 transition-colors [&>svg]:pointer-events-auto">
              <span>{groomingServiceTypes.find(c => c.value === filters.category)?.label}</span>
              <X className="h-3 w-3 cursor-pointer text-neutral-400 hover:text-neutral-700" onClick={() => handleFilterChange('category', 'all')} />
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-medium bg-neutral-100 hover:bg-neutral-200 transition-colors [&>svg]:pointer-events-auto">
              <span>{filters.location}</span>
              <X className="h-3 w-3 cursor-pointer text-neutral-400 hover:text-neutral-700" onClick={() => handleFilterChange('location', '')} />
            </Badge>
          )}
          {filters.rating && filters.rating > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-medium bg-neutral-100 hover:bg-neutral-200 transition-colors [&>svg]:pointer-events-auto">
              <span>{filters.rating}+ žvaigždutės</span>
              <X className="h-3 w-3 cursor-pointer text-neutral-400 hover:text-neutral-700" onClick={() => handleFilterChange('rating', 0)} />
            </Badge>
          )}
          {filters.petId && (
            <Badge variant="secondary" className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-medium bg-neutral-100 hover:bg-neutral-200 transition-colors [&>svg]:pointer-events-auto">
              <span>{userPets.find(pet => pet.id === filters.petId)?.name || 'Pasirinktas'}</span>
              <X className="h-3 w-3 cursor-pointer text-neutral-400 hover:text-neutral-700" onClick={() => handleFilterChange('petId', undefined)} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
