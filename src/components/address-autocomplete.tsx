'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MAPBOX_CONFIG } from '@/lib/mapbox'
import { MapPin, Loader2 } from 'lucide-react'

interface AddressSuggestion {
  id: string
  place_name: string
  address: string
  city: string
  state: string
  zipCode: string
  coordinates: {
    lat: number
    lng: number
  }
}

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string) => void
  onAddressSelect?: (suggestion: AddressSuggestion) => void
  placeholder?: string
  label?: string
  required?: boolean
  className?: string
  disabled?: boolean
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter your address",
  label = "Address",
  required = false,
  className = "",
  disabled = false
}) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Debounced search function
  const searchAddresses = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_CONFIG.accessToken}&` +
        `country=${MAPBOX_CONFIG.defaultCountry}&` +
        `types=address,poi&` +
        `limit=5&` +
        `language=en`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch address suggestions')
      }

      const data = await response.json()
      
      const formattedSuggestions: AddressSuggestion[] = data.features.map((feature: any) => {
        const context = feature.context || []
        const address = feature.properties?.address || ''
        const placeName = feature.place_name || ''
        
        // Extract city, state, and zip code from context
        let city = ''
        let state = ''
        let zipCode = ''
        
        context.forEach((item: any) => {
          if (item.id.startsWith('place.')) {
            city = item.text
          } else if (item.id.startsWith('region.')) {
            state = item.text
          } else if (item.id.startsWith('postcode.')) {
            zipCode = item.text
          }
        })

        return {
          id: feature.id,
          place_name: placeName,
          address: address || placeName,
          city,
          state,
          zipCode,
          coordinates: {
            lat: feature.center[1],
            lng: feature.center[0]
          }
        }
      })

      setSuggestions(formattedSuggestions)
      setShowSuggestions(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Error fetching address suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      searchAddresses(newValue)
    }, 300)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.address)
    onAddressSelect?.(suggestion)
    setShowSuggestions(false)
    setSuggestions([])
    setSelectedIndex(-1)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      <Label htmlFor="address-input">{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="address-input"
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="mt-1 pr-10"
          autoComplete="off"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
        
        {/* Map pin icon when not loading */}
        {!isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleSuggestionSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.address}
                  </div>
                  {(suggestion.city || suggestion.state || suggestion.zipCode) && (
                    <div className="text-xs text-gray-500 mt-1">
                      {[suggestion.city, suggestion.state, suggestion.zipCode]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AddressAutocomplete
