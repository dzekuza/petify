'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Map, Grid3X3, List, Star } from 'lucide-react'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  viewMode: 'list' | 'grid' | 'map'
  onViewModeChange: (mode: 'list' | 'grid' | 'map') => void
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  rating: number
  onRatingChange: (rating: number) => void
  providerType: string
  onProviderTypeChange: (type: string) => void
  onApplyFilters: () => void
  onClearAll: () => void
  resultsCount: number
}

const providerTypes = [
  { id: 'any', label: 'Bet koks tipas' },
  { id: 'grooming', label: 'Gyvūnų šukavimo specialistas' },
  { id: 'veterinary', label: 'Veterinarijos gydytojas' },
  { id: 'boarding', label: 'Gyvūnų prieglauda' },
  { id: 'training', label: 'Gyvūnų treneris' },
  { id: 'walking', label: 'Šunų vedėjas' },
  { id: 'sitting', label: 'Gyvūnų prižiūrėtojas' },
]

export const FilterModal = ({
  isOpen,
  onClose,
  viewMode,
  onViewModeChange,
  priceRange,
  onPriceRangeChange,
  rating,
  onRatingChange,
  providerType,
  onProviderTypeChange,
  onApplyFilters,
  onClearAll,
  resultsCount
}: FilterModalProps) => {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(priceRange)
  const [localRating, setLocalRating] = useState(rating)
  const [localProviderType, setLocalProviderType] = useState(providerType)

  const handleApplyFilters = () => {
    onPriceRangeChange(localPriceRange)
    onRatingChange(localRating)
    onProviderTypeChange(localProviderType)
    onApplyFilters()
    onClose()
  }

  const handleClearAll = () => {
    setLocalPriceRange([0, 5000])
    setLocalRating(0)
    setLocalProviderType('any')
    onClearAll()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Filtrai</DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* View Mode Selection */}
          <div>
            <h3 className="text-lg font-medium mb-4">Peržiūros būdas</h3>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="flex items-center space-x-2"
              >
                <List className="h-4 w-4" />
                <span>Sąrašas</span>
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="flex items-center space-x-2"
              >
                <Grid3X3 className="h-4 w-4" />
                <span>Tinklelis</span>
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('map')}
                className="flex items-center space-x-2"
              >
                <Map className="h-4 w-4" />
                <span>Žemėlapis</span>
              </Button>
            </div>
          </div>

          {/* Provider Type */}
          <div>
            <h3 className="text-lg font-medium mb-4">Paslaugų teikėjo tipas</h3>
            <div className="flex flex-wrap gap-2">
              {providerTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={localProviderType === type.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLocalProviderType(type.id)}
                  className="rounded-full"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-lg font-medium mb-2">Kainų diapazonas</h3>
            <p className="text-sm text-gray-600 mb-4">Nakties kainos, įskaitant mokesčius</p>
            
            {/* Price histogram */}
            <div className="h-16 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-200 rounded-lg mb-4 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xs text-gray-600">Kainų pasiskirstymas</div>
              </div>
              {/* Price distribution bars - more realistic distribution */}
              <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between px-2">
                {Array.from({ length: 20 }, (_, i) => {
                  // Create a more realistic price distribution curve
                  const normalizedPosition = i / 19
                  const height = Math.sin(normalizedPosition * Math.PI) * 40 + 20 + Math.random() * 10
                  return (
                    <div
                      key={i}
                      className="bg-pink-400 rounded-t-sm opacity-70"
                      style={{
                        width: '3px',
                        height: `${height}%`,
                        marginRight: i < 19 ? '1px' : '0'
                      }}
                    />
                  )
                })}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="px-2">
                <Slider
                  value={localPriceRange}
                  onValueChange={(value) => setLocalPriceRange(value as [number, number])}
                  max={5000}
                  min={0}
                  step={10}
                  className="w-full"
                  minStepsBetweenThumbs={1}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Minimali €{localPriceRange[0]}</span>
                <span>Maksimali €{localPriceRange[1]}+</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-lg font-medium mb-4">Reitingas</h3>
            <div className="flex space-x-2">
              {[4, 4.5, 5].map((ratingValue) => (
                <Button
                  key={ratingValue}
                  variant={localRating === ratingValue ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLocalRating(localRating === ratingValue ? 0 : ratingValue)}
                  className="flex items-center space-x-1"
                >
                  <Star className="h-4 w-4 fill-current" />
                  <span>{ratingValue}+</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="px-6"
          >
            Išvalyti viską
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="px-6 bg-black hover:bg-gray-800 text-white"
          >
            Rodyti {resultsCount}+ vietų
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
