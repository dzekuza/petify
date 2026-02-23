'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LocationSuggestion {
  id: string
  name: string
  city: string
  coordinates: {
    lat: number
    lng: number
  }
}

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onLocationSelect?: (location: LocationSuggestion) => void
  placeholder?: string
  label?: string
  className?: string
  suggestions?: LocationSuggestion[]
}

export const LocationAutocomplete = ({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Įveskite vietą",
  label,
  className,
  suggestions = []
}: LocationAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Compute filtered suggestions using useMemo to prevent infinite loops
  const filteredSuggestions = useMemo(() => {
    if (!value.trim()) {
      return suggestions.slice(0, 5) // Show top 5 suggestions when empty
    }

    const filtered = suggestions.filter(suggestion =>
      suggestion.name.toLowerCase().includes(value.toLowerCase()) ||
      suggestion.city.toLowerCase().includes(value.toLowerCase())
    )
    return filtered.slice(0, 8) // Limit to 8 suggestions
  }, [value, suggestions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    onChange(suggestion.name)
    onLocationSelect?.(suggestion)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredSuggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSuggestionClick(filteredSuggestions[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputBlur = () => {
    // Delay closing to allow for clicks on suggestions
    setTimeout(() => {
      setIsOpen(false)
      setSelectedIndex(-1)
    }, 150)
  }

  return (
    <div className={cn("relative", className)}>
      {label && <Label className="block mb-2">{label}</Label>}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("pl-10 pr-10", className)}
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={cn(
                "px-4 py-3 cursor-pointer border-b border-border/50 last:border-b-0 hover:bg-muted",
                index === selectedIndex && "bg-muted"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {suggestion.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {suggestion.city}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && value.trim() && filteredSuggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md">
          <div className="px-4 py-3 text-sm text-muted-foreground text-center">
            Nerasta vietų su "{value}"
          </div>
        </div>
      )}
    </div>
  )
}
