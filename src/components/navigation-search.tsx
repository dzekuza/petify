'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Search, CalendarIcon, Users, Filter } from 'lucide-react'
import { t } from '@/lib/translations'
import AddressAutocomplete from '@/components/address-autocomplete'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface NavigationSearchProps {
  className?: string
  onFiltersClick?: () => void
}

export const NavigationSearch = ({ className, onFiltersClick }: NavigationSearchProps) => {
  const [location, setLocation] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [guests, setGuests] = useState(1)
  const [isOpen, setIsOpen] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    // Add location if provided
    if (location.trim()) {
      params.set('location', location.trim())
    }
    
    // Add date if provided
    if (selectedDate) {
      params.set('date', selectedDate.toISOString().split('T')[0])
    }
    
    // Navigate to search page with parameters
    window.location.href = `/search?${params.toString()}`
    setIsOpen(false)
  }


  return (
    <div className={cn("relative flex items-center", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center space-x-4 px-6 py-3 h-12 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            {/* Location */}
            <div className="flex items-center space-x-2">
              <div className="text-sm font-semibold text-gray-900">
                {t('landing.hero.search.where')}
              </div>
              <div className="text-sm text-gray-500">
                {location || t('landing.hero.search.wherePlaceholder')}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* Date */}
            <div className="flex items-center space-x-2">
              <div className="text-sm font-semibold text-gray-900">
                {t('landing.hero.search.date')}
              </div>
              <div className="text-sm text-gray-500">
                {selectedDate ? format(selectedDate, "MMM dd") : t('landing.hero.search.datePlaceholder')}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* Guests */}
            <div className="flex items-center space-x-2">
              <div className="text-sm font-semibold text-gray-900">
                Gyvūnai
              </div>
              <div className="text-sm text-gray-500">
                {guests} {guests === 1 ? 'gyvūnas' : 'gyvūnai'}
              </div>
            </div>

            {/* Search Button */}
            <div className="ml-2">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <Search className="h-4 w-4 text-white" />
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
              <div className="text-sm font-semibold text-gray-900 mb-2">
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

            {/* Guests */}
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-2">
                Gyvūnai
              </div>
              <div className="flex items-center justify-between border border-gray-200 rounded-md p-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {guests} {guests === 1 ? 'gyvūnas' : 'gyvūnai'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-8 h-8 p-0"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{guests}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGuests(guests + 1)}
                    className="w-8 h-8 p-0"
                  >
                    +
                  </Button>
                </div>
              </div>
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
