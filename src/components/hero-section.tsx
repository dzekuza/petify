'use client'

import { useState } from 'react'
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

export const HeroSection = () => {
  const [location, setLocation] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [showDateSuggestions, setShowDateSuggestions] = useState(false)

  // Business types/categories for dropdown
  const businessTypes = [
    { value: 'grooming', label: 'Kirpyklos' },
    { value: 'veterinary', label: 'Veterinarija' },
    { value: 'boarding', label: 'Prieglauda' },
    { value: 'training', label: 'Dresūra' },
    { value: 'sitting', label: 'Prižiūrėjimas' },
    { value: 'adoption', label: 'Skelbimai' },
  ]

  // Mock data for suggestions
  const citySuggestions = [
    'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena'
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


  const handleSearch = () => {
    const params = new URLSearchParams()
    
    // Add location if provided
    if (location.trim()) {
      params.set('location', location.trim())
    }
    
    // Add category if provided
    if (selectedCategory) {
      params.set('category', selectedCategory)
    }
    
    // Add date if provided
    if (selectedDate) {
      params.set('date', selectedDate.toISOString().split('T')[0])
    }
    
    // Navigate to search page with parameters
    window.location.href = `/search?${params.toString()}`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
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
                    onChange={(e) => {
                      setLocation(e.target.value)
                      setShowLocationSuggestions(e.target.value.length > 0)
                    }}
                    onFocus={() => setShowLocationSuggestions(location.length > 0)}
                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-lg px-0"
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
                    onClick={() => setShowDateSuggestions(!showDateSuggestions)}
                    onBlur={() => setTimeout(() => setShowDateSuggestions(false), 200)}
                  >
                    {selectedDate ? format(selectedDate, "MMM dd") : t('landing.hero.search.datePlaceholder')}
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
              <div className="w-full md:w-auto">
                <button
                  className="flex items-center justify-center w-full md:w-12 h-12 md:rounded-full rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                  onClick={handleSearch}
                >
                  <Search className="h-6 w-6 md:mr-0 mr-2" aria-hidden="true" />
                  <span className="md:hidden text-lg font-medium">Ieškoti</span>
                </button>
              </div>
            </div>
          </div>


          {/* Category Sections */}
          <div className="w-full space-y-12">
            <CategorySection
              title="Kirpyklos"
              category="grooming"
              limit={8}
            />
            
            <CategorySection
              title="Jūsų šuniui"
              category="boarding"
              limit={8}
            />
            
            <CategorySection
              title="Veterinarija"
              category="veterinary"
              limit={8}
            />
            
            <CategorySection
              title="Dresūra"
              category="training"
              limit={8}
            />
            
            <CategorySection
              title="Prižiūrėjimas"
              category="sitting"
              limit={8}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
