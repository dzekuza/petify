'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import AddressAutocomplete from '@/components/address-autocomplete'

interface NavigationSearchProps {
  isMobile?: boolean
  className?: string
}

export function NavigationSearch({ isMobile = false, className }: NavigationSearchProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')

  const handleSearch = () => {
    if (!searchQuery.trim() && !selectedLocation.trim()) return

    const params = new URLSearchParams()
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    }
    if (selectedLocation.trim()) {
      params.set('location', selectedLocation.trim())
    }

    router.push(`/search?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  if (isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Ieškoti paslaugų..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        
        <AddressAutocomplete
          value={selectedLocation}
          onChange={setSelectedLocation}
          placeholder="Pasirinkite vietą..."
        />
        
        <Button onClick={handleSearch} className="w-full">
          Ieškoti
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Ieškoti paslaugų..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10"
        />
      </div>
      
      <AddressAutocomplete
        value={selectedLocation}
        onChange={setSelectedLocation}
        placeholder="Vieta..."
        className="w-48"
      />
      
      <Button onClick={handleSearch}>
        Ieškoti
      </Button>
    </div>
  )
}
