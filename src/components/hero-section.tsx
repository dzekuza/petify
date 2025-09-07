'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Search } from 'lucide-react'
import { t } from '@/lib/translations'
import AddressAutocomplete from '@/components/address-autocomplete'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ProvidersGrid } from '@/components/providers-grid'
import { providerApi } from '@/lib/providers'

export const HeroSection = () => {
  const [location, setLocation] = useState('')
  const [providerName, setProviderName] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [latestProviders, setLatestProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all providers for hero section
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true)
        
        // Fetch all providers (latest first)
        const allResults = await providerApi.searchProviders({})
        setLatestProviders(allResults.slice(0, 12)) // Limit to 12 for display
        
      } catch (error) {
        console.error('Error fetching providers for hero:', error)
        // Fallback to empty array if there's an error
        setLatestProviders([])
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [])

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
    
    // Navigate to search page with parameters
    window.location.href = `/search?${params.toString()}`
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <section className="bg-white py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 items-center justify-center">
          {/* Main Heading */}
          <div className="text-center">
            <h1 
              className="text-4xl font-bold text-black leading-tight sm:text-5xl lg:text-6xl"
              dangerouslySetInnerHTML={{ __html: t('landing.hero.title') }}
            />
          </div>

          {/* Search Form - Clean Style */}
          <div className="bg-white rounded-full shadow-lg p-2 w-full max-w-4xl">
            <div className="flex items-center">
              {/* Location */}
              <div className="flex-1 px-6 py-4 hover:bg-gray-50 rounded-l-full transition-colors duration-200">
                <div className="text-xs font-semibold text-gray-900 mb-1">
                  {t('landing.hero.search.where')}
                </div>
                <AddressAutocomplete
                  value={location}
                  onChange={setLocation}
                  placeholder={t('landing.hero.search.wherePlaceholder')}
                  label=""
                  className="[&_label]:hidden [&_input]:border-0 [&_input]:p-0 [&_input]:h-auto [&_input]:text-sm [&_input]:font-normal [&_input]:focus:ring-0 [&_input]:focus:outline-none [&_input]:bg-transparent [&_input]:shadow-none"
                />
              </div>

              {/* Provider Name */}
              <div className="flex-1 px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="text-xs font-semibold text-gray-900 mb-1">
                  {t('landing.hero.search.provider')}
                </div>
                <Input
                  type="text"
                  placeholder={t('landing.hero.search.providerPlaceholder')}
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="border-0 p-0 h-auto text-sm font-normal focus:ring-0 focus:outline-none bg-transparent shadow-none"
                />
              </div>

              {/* Date */}
              <div className="flex-1 px-6 py-4 hover:bg-gray-50 rounded-r-full transition-colors duration-200">
                <div className="text-xs font-semibold text-gray-900 mb-1">
                  {t('landing.hero.search.date')}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left font-normal p-0 h-auto text-sm hover:bg-transparent",
                        !selectedDate && "text-gray-500"
                      )}
                    >
                      {selectedDate ? format(selectedDate, "MMM dd") : t('landing.hero.search.datePlaceholder')}
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

              {/* Search Button */}
              <div className="px-2">
                <Button 
                  onClick={handleSearch}
                  className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white p-0 transition-colors duration-200"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Latest Providers Grid */}
          {!loading && latestProviders.length > 0 && (
            <ProvidersGrid
              title="Latest"
              providers={latestProviders.map(result => result.provider)}
              services={latestProviders.flatMap(result => result.services)}
            />
          )}
        </div>
      </div>
    </section>
  )
}
