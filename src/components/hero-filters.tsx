'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Search, ChevronDown } from 'lucide-react'
import { t } from '@/lib/translations'
import { format } from 'date-fns'

export const HeroFilters = () => {
    const router = useRouter()
    const [location, setLocation] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
    const [showDateSuggestions, setShowDateSuggestions] = useState(false)

    // Memoize static data
    const businessTypes = useMemo(() => [
        { value: 'grooming', label: 'Kirpyklos' }
        // Other business types hidden - only showing grooming
    ], [])

    const citySuggestions = useMemo(() => [
        'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė', 'Mažeikiai', 'Jonava', 'Utena'
    ], [])

    // Memoize date suggestions
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

    // Memoize event handlers
    const handleSearch = useCallback(() => {
        const params = new URLSearchParams()
        if (location.trim()) params.set('location', location.trim())
        if (selectedCategory) {
            if (selectedCategory === 'pets') {
                router.push('/search?category=pets')
                return
            }
            params.set('category', selectedCategory)
        }
        if (selectedDate) params.set('date', selectedDate.toISOString().split('T')[0])
        router.push(`/search?${params.toString()}`)
    }, [location, selectedCategory, selectedDate, router])

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch()
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
        <div className="glass md:rounded-full rounded-2xl border border-white/20 md:p-2 p-6 w-full max-w-4xl backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-center w-full md:space-y-0 space-y-4">
                {/* Location */}
                <div className="flex-1 px-2 py-1 hover:bg-gray-50 md:rounded-l-full rounded-lg transition-colors duration-200 w-full md:w-auto relative group">
                    <Label htmlFor="address-input" className="items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-sm font-semibold text-foreground block cursor-pointer">
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
                            className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-neutral-200 h-9 w-full min-w-0 rounded-md py-1 transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-neutral-400 aria-invalid:border-destructive border-0 bg-transparent focus-visible:ring-0 text-sm px-0"
                            aria-describedby="location-suggestions"
                        />

                        {/* Location Suggestions */}
                        {showLocationSuggestions && (
                            <div
                                id="location-suggestions"
                                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg z-50 mt-1 max-h-48 overflow-y-auto"
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
                <div className="flex-1 px-2 py-1 hover:bg-gray-50 md:rounded-none rounded-lg transition-colors duration-200 w-full md:w-auto relative group">
                    <Label htmlFor="category-select" className="items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-sm font-semibold text-foreground block cursor-pointer">
                        Paslaugos
                    </Label>
                    <div className="relative">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger
                                id="category-select"
                                className="flex items-center justify-between gap-2 rounded-md border-neutral-200 outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 border-0 bg-transparent focus-visible:ring-0 text-sm px-0 h-auto py-0 w-full"
                            >
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
                <div className="flex-1 px-2 py-1 hover:bg-gray-50 md:rounded-r-full rounded-lg transition-colors duration-200 w-full md:w-auto relative group">
                    <Label htmlFor="date-input" className="items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-sm font-semibold text-foreground block cursor-pointer">
                        {t('landing.hero.search.date')}
                    </Label>
                    <div className="relative">
                        <Button
                            id="date-input"
                            variant="ghost"
                            className="inline-flex items-center gap-2 whitespace-nowrap rounded-md transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-neutral-400 aria-invalid:border-destructive hover:bg-accent dark:hover:bg-accent/50 has-[>svg]:px-3 w-full text-sm text-left text-muted-foreground hover:text-foreground bg-transparent border-0 h-auto p-0 justify-start font-normal"
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
                                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg z-50 mt-1"
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
                        className="flex items-center justify-center w-full md:w-12 h-12 md:rounded-full rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-all duration-300 focus:outline-none focus-visible:border-neutral-400 hover:-translate-y-0.5"
                        onClick={handleSearch}
                        onKeyDown={handleKeyPress}
                        aria-label="Search for services"
                        type="button"
                    >
                        <Search className="h-6 w-6 md:mr-0 mr-2" aria-hidden="true" />
                        <span className="md:hidden text-sm font-medium">Ieškoti</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
