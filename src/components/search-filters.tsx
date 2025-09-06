'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SearchFilters as SearchFiltersType, ServiceCategory } from '@/types'
import { MapPin, Filter, X } from 'lucide-react'

const serviceCategories: { value: ServiceCategory; label: string }[] = [
  { value: 'grooming', label: 'Pet Grooming' },
  { value: 'veterinary', label: 'Veterinary Care' },
  { value: 'boarding', label: 'Pet Boarding' },
  { value: 'training', label: 'Pet Training' },
  { value: 'walking', label: 'Dog Walking' },
  { value: 'sitting', label: 'Pet Sitting' },
]

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
}

export const SearchFilters = ({ filters, onFiltersChange }: SearchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

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
    })
  }

  const hasActiveFilters = filters.category || filters.location || (filters.rating && filters.rating > 0)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main Search Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Service Category */}
            <div>
              <Label htmlFor="category">Service Type</Label>
              <Select 
                value={filters.category || 'all'} 
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
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
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="Enter location"
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Distance */}
            <div>
              <Label htmlFor="distance">Distance</Label>
              <Select 
                value={filters.distance?.toString() || '25'} 
                onValueChange={(value) => handleFilterChange('distance', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Within 5 km</SelectItem>
                  <SelectItem value="10">Within 10 km</SelectItem>
                  <SelectItem value="25">Within 25 km</SelectItem>
                  <SelectItem value="50">Within 50 km</SelectItem>
                  <SelectItem value="100">Within 100 km</SelectItem>
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
                <span>More Filters</span>
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
                  <Label>Price Range</Label>
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
                      placeholder="Max"
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
                  <Label>Minimum Rating</Label>
                  <Select 
                    value={filters.rating?.toString() || '0'} 
                    onValueChange={(value) => handleFilterChange('rating', parseFloat(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any rating</SelectItem>
                      <SelectItem value="3">3+ stars</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <Label>Sort By</Label>
                  <Select value="relevance" onValueChange={() => {}}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="distance">Distance</SelectItem>
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
                  <span>Service: {serviceCategories.find(c => c.value === filters.category)?.label}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('category', 'all')}
                  />
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Location: {filters.location}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('location', '')}
                  />
                </Badge>
              )}
              {filters.rating && filters.rating > 0 && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Rating: {filters.rating}+ stars</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('rating', 0)}
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
