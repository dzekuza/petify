'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MAPBOX_CONFIG } from '@/lib/mapbox'
import { Loader2 } from 'lucide-react'

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
  const debounceRef = useRef<NodeJS.Timeout | null>(null)


  // Popular Lithuanian cities and districts
  const popularLocations = useMemo(() => [
    // Major cities
    'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė', 'Mažeikiai',
    'Jonava', 'Utena', 'Kėdainiai', 'Telšiai', 'Visaginas', 'Tauragė', 'Ukmergė', 'Plungė',
    'Šilutė', 'Kretinga', 'Radviliškis', 'Palanga', 'Druskininkai', 'Rokiškis', 'Biržai', 'Gargždai',
    'Kuršėnai', 'Garliava', 'Vilkaviškis', 'Raseiniai', 'Anykščiai', 'Lentvaris', 'Grigiškės',
    'Naujoji Akmenė', 'Kazlų Rūda', 'Joniškis', 'Kelmė', 'Varėna', 'Kaišiadorys', 'Pasvalys',
    'Kupiškis', 'Zarasai', 'Skuodas', 'Širvintos', 'Pakruojis', 'Švenčionys', 'Ignalina',
    'Molėtai', 'Šalčininkai', 'Vievis', 'Lazdijai', 'Kalvarija', 'Rietavas', 'Žiežmariai',
    'Elektrėnai', 'Šakiai', 'Šilalė', 'Jurbarkas', 'Raudondvaris', 'Viešintos', 'Neringa',
    'Pagėgiai', 'Vilkija', 'Žagarė', 'Viekšniai', 'Seda', 'Subačius', 'Baltoji Vokė',
    'Daugai', 'Simnas', 'Gelgaudiškis', 'Kudirkos Naumiestis', 'Šeduva', 'Pandėlys',
    'Dusetos', 'Užventis', 'Kavarskas', 'Smalininkai', 'Joniškėlis', 'Linkuva', 'Veisiejai',
    // Vilnius districts
    'Justiniškės', 'Karoliniškės', 'Antakalnis', 'Žvėrynas', 'Senamiestis', 'Naujamiestis',
    'Šnipiškės', 'Pašilaičiai', 'Fabijoniškės', 'Pilaitė', 'Lazdynai', 'Viršuliškės',
    'Šeškinė', 'Naujininkai', 'Rasos', 'Užupis', 'Markučiai', 'Santariškės', 'Verkių',
    'Baltupiai', 'Jeruzalė', 'Grigiškės', 'Vilkpėdė', 'Naujoji Vilnia', 'Paneriai',
    // Kaunas districts
    'Centras', 'Žaliakalnis', 'Šančiai', 'Aleksotas', 'Dainava', 'Petrašiūnai',
    'Šilainiai', 'Vilijampolė', 'Panemunė', 'Kalniečiai', 'Raudondvaris'
  ], [])

  // Debounced search function
  const searchAddresses = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_CONFIG.accessToken}&` +
        `country=LT&` +
        `types=address,place,locality,neighborhood&` +
        `limit=8&` +
        `language=lt`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch address suggestions')
      }

      const data = await response.json()
      
      const formattedSuggestions: AddressSuggestion[] = data.features.map((feature: Record<string, unknown>) => {
        const context = (feature.context as Record<string, unknown>[]) || []
        const placeName = feature.place_name || ''
        const featureText = feature.text || ''
        const properties = (feature.properties as Record<string, unknown>) || {}
        
        // Extract city, region, postal code, and district from context
        let city = ''
        let region = ''
        let district = ''
        let zipCode = ''
        
        context.forEach((item: Record<string, unknown>) => {
          if (item.id && typeof item.id === 'string') {
            if (item.id.startsWith('place.')) {
              city = item.text as string
            } else if (item.id.startsWith('region.')) {
              region = item.text as string
            } else if (item.id.startsWith('neighborhood.')) {
              district = item.text as string
            } else if (item.id.startsWith('postcode.')) {
              zipCode = item.text as string
            }
          }
        })

        // Extract postal code from properties if available
        if (!zipCode && properties.address) {
          const addressStr = properties.address as string
          const postalMatch = addressStr.match(/\b\d{5}\b/)
          if (postalMatch) {
            zipCode = postalMatch[0]
          }
        }

        // For full addresses, use the complete place name
        // For cities/districts, use the main text
        const placeType = feature.place_type as string[] || []
        const address = placeType.includes('address') ? placeName : featureText as string

        return {
          id: feature.id,
          place_name: placeName,
          address: address,
          city: city || (featureText as string),
          state: region,
          zipCode: zipCode,
          coordinates: {
            lat: (feature.center as number[])[1],
            lng: (feature.center as number[])[0]
          }
        }
      })

      // If we have few API results, add popular locations that match the query
      if (formattedSuggestions.length < 5) {
        const matchingPopular = popularLocations
          .filter(location => 
            location.toLowerCase().includes(query.toLowerCase()) &&
            !formattedSuggestions.some(s => s.address.toLowerCase() === location.toLowerCase())
          )
          .slice(0, 5 - formattedSuggestions.length)
          .map(location => ({
            id: `popular-${location}`,
            place_name: location,
            address: location,
            city: location,
            state: 'Lietuva',
            zipCode: '',
            coordinates: { lat: 0, lng: 0 }
          }))
        
        formattedSuggestions.push(...matchingPopular)
      }

      setSuggestions(formattedSuggestions)
      setShowSuggestions(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Error fetching address suggestions:', error)
      // Fallback to popular locations on error
      const matchingPopular = popularLocations
        .filter(location => location.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8)
        .map(location => ({
          id: `popular-${location}`,
          place_name: location,
          address: location,
          city: location,
          state: 'Lietuva',
          zipCode: '',
          coordinates: { lat: 0, lng: 0 }
        }))
      
      setSuggestions(matchingPopular)
      setShowSuggestions(true)
      setSelectedIndex(-1)
    } finally {
      setIsLoading(false)
    }
  }, [popularLocations])

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
      {label && <Label htmlFor="address-input">{label}</Label>}
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
          className="mt-1"
          autoComplete="off"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md max-h-60 overflow-y-auto"
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
              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {suggestion.address}
                  </div>
                  {(suggestion.state || suggestion.zipCode) && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {[suggestion.state, suggestion.zipCode]
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
