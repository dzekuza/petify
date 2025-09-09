'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, CalendarIcon, Filter, User } from 'lucide-react'
import { t } from '@/lib/translations'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/auth-context'
import { petsApi } from '@/lib/pets'
import { Pet } from '@/types'

interface NavigationSearchProps {
  className?: string
  onFiltersClick?: () => void
}

export const NavigationSearch = ({ className, onFiltersClick }: NavigationSearchProps) => {
  const [location, setLocation] = useState('')
  const [providerName, setProviderName] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedPetId, setSelectedPetId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [userPets, setUserPets] = useState<Pet[]>([])
  const [loadingPets, setLoadingPets] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [showProviderSuggestions, setShowProviderSuggestions] = useState(false)
  const [showDateSuggestions, setShowDateSuggestions] = useState(false)
  const { user } = useAuth()

  // Mock data for suggestions
  const citySuggestions = [
    'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena'
  ]

  const providerSuggestions = [
    'Pet Care Vilnius', 'Kaunas Vet Clinic', 'Dog Training Center', 'Cat Grooming Studio', 'Pet Hotel Klaipėda',
    'Veterinary Clinic', 'Pet Spa & Wellness', 'Animal Hospital', 'Pet Services', 'Dog Walking Service'
  ]

  const dateSuggestions = [
    { label: 'Šiandien', value: new Date() },
    { label: 'Rytoj', value: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { label: 'Šį savaitgalį', value: getNextWeekend() },
    { label: 'Kitą savaitę', value: getNextWeek() },
    { label: 'Kitą mėnesį', value: getNextMonth() }
  ]

  function getNextWeekend() {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilSaturday = (6 - dayOfWeek) % 7
    const nextSaturday = new Date(today)
    nextSaturday.setDate(today.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday))
    return nextSaturday
  }

  function getNextWeek() {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    return nextWeek
  }

  function getNextMonth() {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return nextMonth
  }

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

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    // Add location if provided
    if (location.trim()) {
      params.set('location', location.trim())
    }
    
    // Add provider name if provided
    if (providerName.trim()) {
      params.set('provider', providerName.trim())
    }
    
    // Add date if provided
    if (selectedDate) {
      params.set('date', selectedDate.toISOString().split('T')[0])
    }
    
    // Add pet if selected (but not "all")
    if (selectedPetId && selectedPetId !== 'all') {
      params.set('petId', selectedPetId)
    }
    
    // Navigate to search page with parameters
    window.location.href = `/search?${params.toString()}`
    setIsOpen(false)
  }


  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            {/* Responsive Layout: Vertical on mobile, horizontal on desktop */}
            <div className="flex flex-col md:flex-row items-center w-full md:space-y-0 space-y-4">
              {/* Location */}
              <div className="flex-1 px-6 py-4 hover:bg-gray-50 md:rounded-l-full rounded-lg transition-colors duration-200 w-full md:w-auto relative">
                <Label htmlFor="address-input" className="text-sm font-semibold text-gray-900 mb-2 block">
                  {t('landing.hero.search.where')}
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    id="address-input"
                    placeholder={t('landing.hero.search.wherePlaceholder')}
                    autoComplete="off"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value)
                      setShowLocationSuggestions(e.target.value.length > 0)
                    }}
                    onFocus={() => setShowLocationSuggestions(location.length > 0)}
                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-lg"
                  />
                  
                  {/* Location Suggestions */}
                  {showLocationSuggestions && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-48 overflow-y-auto">
                      {citySuggestions
                        .filter(city => city.toLowerCase().includes(location.toLowerCase()))
                        .map((city, index) => (
                          <button
                            key={index}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              setLocation(city)
                              setShowLocationSuggestions(false)
                            }}
                          >
                            {city}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Provider */}
              <div className="flex-1 px-6 py-4 hover:bg-gray-50 rounded-lg md:rounded-none transition-colors duration-200 w-full md:w-auto relative">
                <Label htmlFor="provider-input" className="text-sm font-semibold text-gray-900 mb-2 block">
                  Teikėjas
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    id="provider-input"
                    placeholder="Pridėkite teikėją"
                    value={providerName}
                    onChange={(e) => {
                      setProviderName(e.target.value)
                      setShowProviderSuggestions(e.target.value.length > 0)
                    }}
                    onFocus={() => setShowProviderSuggestions(providerName.length > 0)}
                    onBlur={() => setTimeout(() => setShowProviderSuggestions(false), 200)}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-lg"
                  />
                  
                  {/* Provider Suggestions */}
                  {showProviderSuggestions && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-48 overflow-y-auto">
                      {providerSuggestions
                        .filter(provider => provider.toLowerCase().includes(providerName.toLowerCase()))
                        .map((provider, index) => (
                          <button
                            key={index}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              setProviderName(provider)
                              setShowProviderSuggestions(false)
                            }}
                          >
                            {provider}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="flex-1 px-6 py-4 hover:bg-gray-50 md:rounded-r-full rounded-lg transition-colors duration-200 w-full md:w-auto relative">
                <Label htmlFor="date-input" className="text-sm font-semibold text-gray-900 mb-2 block">
                  {t('landing.hero.search.date')}
                </Label>
                <div className="relative">
                  <Button
                    id="date-input"
                    variant="ghost"
                    className="w-full text-lg text-left text-gray-500 hover:text-gray-700 bg-transparent border-0 h-auto p-0 justify-start font-normal"
                    onClick={() => setShowDateSuggestions(!showDateSuggestions)}
                    onBlur={() => setTimeout(() => setShowDateSuggestions(false), 200)}
                  >
                    {selectedDate ? format(selectedDate, "MMM dd") : "Pridėkite datas"}
                  </Button>
                  
                  {/* Date Suggestions */}
                  {showDateSuggestions && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
                      {dateSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            setSelectedDate(suggestion.value)
                            setShowDateSuggestions(false)
                          }}
                        >
                          {suggestion.label}
                        </button>
                      ))}
                      
                      {/* Calendar Option */}
                      <div className="border-t border-gray-200">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors">
                              Pasirinkti datą iš kalendoriaus
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                setSelectedDate(date)
                                setShowDateSuggestions(false)
                              }}
                              disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <div className="px-2 w-full md:w-auto">
                <button
                  className="flex items-center justify-center w-full md:w-12 h-12 md:rounded-full rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                  onClick={handleSearch}
                >
                  <Search className="h-6 w-6 md:mr-0 mr-2" aria-hidden="true" />
                  <span className="md:hidden text-lg font-medium">Ieškoti</span>
                </button>
              </div>
            </div>
          </Button>
        </PopoverTrigger>

        {/* Filters Button - Outside the PopoverTrigger */}
        {onFiltersClick && (
          <>
            <div className="w-px h-6 bg-gray-300 ml-2"></div>
            <button
              onClick={onFiltersClick}
              className="ml-2 p-2 pr-2 rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
              aria-label="Filters"
            >
              <Filter className="h-[22px] w-[22px] text-gray-600" />
            </button>
          </>
        )}
        
        <PopoverContent 
          className="w-96 p-0" 
          align="start"
          sideOffset={8}
        >
          <div className="p-4 space-y-4">
            {/* Location */}
            <div>
              <Label htmlFor="popover-address-input" className="text-sm font-semibold text-gray-900 mb-2 block">
                {t('landing.hero.search.where')}
              </Label>
              <Input
                id="popover-address-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('landing.hero.search.wherePlaceholder')}
                className="text-lg"
              />
            </div>

            {/* Date */}
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-2">
                {t('landing.hero.search.date')}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-normal p-2 h-auto text-sm border border-gray-200 rounded-md",
                      !selectedDate && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "MMM dd, yyyy") : t('landing.hero.search.datePlaceholder')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Pet Selection */}
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-2">
                Gyvūnai
              </div>
              <Select 
                value={selectedPetId} 
                onValueChange={setSelectedPetId}
                disabled={loadingPets || !user}
              >
                <SelectTrigger className="w-full">
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

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              <Search className="h-4 w-4 mr-2" />
              Ieškoti
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
