'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Search } from 'lucide-react'
import { t } from '@/lib/translations'
import { format } from 'date-fns'
import { CategorySection } from '@/components/category-section'
import { PetAdsSection } from '@/components/pet-ads-section'
import { MobileHeroSection } from '@/components/mobile-hero-section'

export const HeroSection = () => {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [showDateSuggestions, setShowDateSuggestions] = useState(false)

  // Memoize static data to prevent unnecessary re-renders
  const businessTypes = useMemo(() => [
    { value: 'grooming', label: 'Kirpyklos' },
    { value: 'veterinary', label: 'Veterinarija' },
    { value: 'boarding', label: 'Prieglauda' },
    { value: 'training', label: 'Dresūra' },
    { value: 'sitting', label: 'Prižiūrėjimas' },
    { value: 'adoption', label: 'Veislynai' },
    { value: 'pets', label: 'Gyvūnai pardavimui' },
  ], [])

  const citySuggestions = useMemo(() => [
    'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena'
  ], [])


  // Memoize date suggestions to prevent recalculation on every render
  const dateSuggestions = useMemo(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const getNextWeekend = () => {
      const dayOfWeek = today.getDay()
      const daysUntilSaturday = (6 - dayOfWeek) % 7
      const nextSaturday = new Date(today)
      nextSaturday.setDate(today.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday))
      return nextSaturday
    }

    const getNextWeek = () => {
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)
      return nextWeek
    }

    const getNextMonth = () => {
      const nextMonth = new Date(today)
      nextMonth.setMonth(today.getMonth() + 1)
      return nextMonth
    }

    return [
      { label: 'Šiandien', value: today },
      { label: 'Rytoj', value: tomorrow },
      { label: 'Šį savaitgalį', value: getNextWeekend() },
      { label: 'Kitą savaitę', value: getNextWeek() },
      { label: 'Kitą mėnesį', value: getNextMonth() }
    ]
  }, [])


  // Memoize event handlers to prevent unnecessary re-renders
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams()
    
    // Add location if provided
    if (location.trim()) {
      params.set('location', location.trim())
    }
    
    // Add category if provided
    if (selectedCategory) {
      if (selectedCategory === 'pets') {
        // Redirect to pet ads page for pet sales
        router.push('/search?category=pets')
        return
      }
      params.set('category', selectedCategory)
    }
    
    // Add date if provided
    if (selectedDate) {
      params.set('date', selectedDate.toISOString().split('T')[0])
    }
    
    // Use Next.js router for better performance
    router.push(`/search?${params.toString()}`)
  }, [location, selectedCategory, selectedDate, router])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])

  const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value)
    setShowLocationSuggestions(e.target.value.length > 0)
  }, [])

  const handleLocationFocus = useCallback(() => {
    setShowLocationSuggestions(location.length > 0)
  }, [location])

  const handleLocationBlur = useCallback(() => {
    setTimeout(() => setShowLocationSuggestions(false), 200)
  }, [])

  const handleDateFocus = useCallback(() => {
    setShowDateSuggestions(!showDateSuggestions)
  }, [showDateSuggestions])

  const handleDateBlur = useCallback(() => {
    setTimeout(() => setShowDateSuggestions(false), 200)
  }, [])

  const handleCitySelect = useCallback((city: string) => {
    setLocation(city)
    setShowLocationSuggestions(false)
  }, [])

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setShowDateSuggestions(false)
    }
  }, [])

  return (
    <>
      
      
      {/* Desktop Hero Section - Hidden on mobile */}
      <div className=" md:block">
    <section className="bg-white pt-20">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 items-center justify-center">
          {/* Main Heading */}
          <div className="text-center">
            <h1 
              className="text-4xl font-bold text-black leading-tight sm:text-5xl lg:text-6xl"
              dangerouslySetInnerHTML={{ __html: t('landing.hero.title') }}
            />
          </div>

          {/* Search Form - Responsive Layout */}
          <div className="bg-white md:rounded-full rounded-lg shadow-lg md:p-2 p-6 w-full max-w-4xl">
            <div className="flex flex-col md:flex-row items-center w-full md:space-y-0 space-y-4">
              {/* Location */}
              <div className="flex-1 px-4 py-4 hover:bg-gray-50 md:rounded-l-full rounded-lg transition-colors duration-200 w-full md:w-auto relative">
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
                    onChange={handleLocationChange}
                    onFocus={handleLocationFocus}
                    onBlur={handleLocationBlur}
                    onKeyDown={handleKeyPress}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-lg px-0"
                    aria-describedby="location-suggestions"
                  />
                  
                  {/* Location Suggestions */}
                  {showLocationSuggestions && (
                    <div 
                      id="location-suggestions"
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-48 overflow-y-auto"
                      role="listbox"
                      aria-label="City suggestions"
                    >
                      {citySuggestions
                        .filter(city => city.toLowerCase().includes(location.toLowerCase()))
                        .map((city, index) => (
                          <button
                            key={city}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors focus:bg-gray-50 focus:outline-none"
                            onClick={() => handleCitySelect(city)}
                            role="option"
                            aria-selected={false}
                          >
                            {city}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Service Category */}
              <div className="flex-1 px-4 py-4 hover:bg-gray-50 md:rounded-none rounded-lg transition-colors duration-200 w-full md:w-auto relative">
                <Label htmlFor="category-select" className="text-sm font-semibold text-gray-900 mb-2 block">
                  Paslaugos
                </Label>
                <div className="relative">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-lg px-0 h-auto py-0">
                      <SelectValue placeholder="Pasirinkite paslaugą" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date */}
              <div className="flex-1 px-4 py-4  hover:bg-gray-50 md:rounded-r-full rounded-lg transition-colors duration-200 w-full md:w-auto relative">
                <Label htmlFor="date-input" className="text-sm font-semibold text-gray-900 mb-2 block">
                  {t('landing.hero.search.date')}
                </Label>
                <div className="relative">
                  <Button
                    id="date-input"
                    variant="ghost"
                    className="w-full text-lg text-left text-gray-500 hover:text-gray-700 bg-transparent border-0 h-auto p-0 justify-start font-normal"
                    onClick={handleDateFocus}
                    onBlur={handleDateBlur}
                    aria-describedby="date-suggestions"
                    aria-expanded={showDateSuggestions}
                  >
                    {selectedDate ? format(selectedDate, "MMM dd") : t('landing.hero.search.datePlaceholder')}
                  </Button>
                  
                  {/* Date Suggestions */}
                  {showDateSuggestions && (
                    <div 
                      id="date-suggestions"
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1"
                      role="listbox"
                      aria-label="Date suggestions"
                    >
                      {dateSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.label}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors focus:bg-gray-50 focus:outline-none"
                          onClick={() => handleDateSelect(suggestion.value)}
                          role="option"
                          aria-selected={false}
                        >
                          {suggestion.label}
                        </button>
                      ))}
                      
                      {/* Calendar Option */}
                      <div className="border-t border-gray-200">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button 
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors focus:bg-gray-50 focus:outline-none"
                              aria-label="Open calendar to select custom date"
                            >
                              Pasirinkti datą iš kalendoriaus
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleDateSelect}
                              disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                              initialFocus
                              required={false}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <div className="w-full md:w-auto">
                <button
                  className="flex items-center justify-center w-full md:w-12 h-12 md:rounded-full rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={handleSearch}
                  onKeyDown={handleKeyPress}
                  aria-label="Search for services"
                  type="button"
                >
                  <Search className="h-6 w-6 md:mr-0 mr-2" aria-hidden="true" />
                  <span className="md:hidden text-lg font-medium">Ieškoti</span>
                </button>
              </div>
            </div>
          </div>


          {/* Category Sections */}
          <div className="w-full space-y-12">
            {useMemo(() => [
              { title: "Kirpyklos", category: "grooming" },
              { title: "Jūsų šuniui", category: "boarding" },
              { title: "Veterinarija", category: "veterinary" },
              { title: "Dresūra", category: "training" },
              { title: "Prižiūrėjimas", category: "sitting" },
              { title: "Veislynai", category: "adoption" }
            ].map((section) => (
              <CategorySection
                key={section.category}
                title={section.title}
                category={section.category}
                limit={8}
              />
            )), [])}
            
            {/* Pet Ads Section */}
            <PetAdsSection
              title="Gyvūnai pardavimui"
              limit={8}
            />
          </div>
        </div>
      </div>
    </section>
      </div>
    </>
  )
}
