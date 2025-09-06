'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Calendar } from 'lucide-react'
import { ServiceCategory } from '@/types'
import Image from 'next/image'

// Service category icons
const imgAnimalCareIcon = '/da178ce5d9e0efbaa63f916c95100c2daf751dac.png'
const imgPetTrainingIcon = '/abf5832628a6acaf2c4259ad14de133d3866577f.png'
const imgPetsPairingIcon = '/dad9cde557f42c866425d0fe77924deee8551656.png'
const imgPetVeterinaryIcon = '/1ad308669bee0a61d08eb85cb050afe5af94b466.png'
const imgPetAdsIcon = '/e9e2b26d5bf286f094c7cdffe862fc917fbe23f6.png'
const imgLine3 = '/141f5c9733757f90f60bd082ddd02094f142af43.svg'

const serviceCategories: { value: ServiceCategory; label: string; icon: string }[] = [
  { value: 'grooming', label: 'Kirpyklos', icon: imgAnimalCareIcon },
  { value: 'training', label: 'Dresura', icon: imgPetTrainingIcon },
  { value: 'boarding', label: 'Poravimas', icon: imgPetsPairingIcon },
  { value: 'veterinary', label: 'Veterinarijos', icon: imgPetVeterinaryIcon },
  { value: 'walking', label: 'Skelbimai', icon: imgPetAdsIcon },
]

export const HeroSection = () => {
  const [location, setLocation] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    // Add location if provided
    if (location.trim()) {
      params.set('location', location.trim())
    }
    
    // Add price range if provided
    if (priceFrom.trim() && !isNaN(Number(priceFrom))) {
      params.set('priceFrom', priceFrom.trim())
    }
    if (priceTo.trim() && !isNaN(Number(priceTo))) {
      params.set('priceTo', priceTo.trim())
    }
    
    // Add date if provided
    if (selectedDate) {
      params.set('date', selectedDate)
    }
    
    // Add category if selected
    if (selectedCategory) {
      params.set('category', selectedCategory)
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
    <section className="bg-neutral-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 items-center justify-center">
          {/* Main Heading */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black leading-tight sm:text-5xl lg:text-6xl">
              Choose from 400+ service providers for your pet around your
            </h1>
          </div>

          {/* Service Category Chips */}
          <div className="flex flex-wrap gap-4 items-center justify-center w-full">
            {serviceCategories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(selectedCategory === category.value ? null : category.value)}
                className={`flex gap-3 items-center justify-center px-6 py-3 rounded-lg border transition-all ${
                  selectedCategory === category.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-black border-black hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 relative">
                  <Image
                    src={category.icon}
                    alt={category.label}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-bold text-base whitespace-nowrap">
                  {category.label}
                </span>
              </button>
            ))}
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-start">
              {/* Location */}
              <div className="flex flex-col gap-1 w-full lg:w-28">
                <label className="font-bold text-sm text-black">
                  Kur ieskote?
                </label>
                <Input
                  variant="hero"
                  placeholder="Iveskite lokacija"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* Divider */}
              <div className="hidden lg:flex items-center justify-center h-14">
                <Image
                  src={imgLine3}
                  alt=""
                  width={1}
                  height={57}
                  className="rotate-90"
                />
              </div>

              {/* Price From */}
              <div className="flex flex-col gap-1 w-full lg:w-28">
                <label className="font-bold text-sm text-black">
                  Kaina nuo
                </label>
                <Input
                  variant="hero"
                  type="number"
                  placeholder="Iveskite kaina"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  onKeyPress={handleKeyPress}
                  min="0"
                  step="1"
                  aria-label="Kaina nuo"
                />
              </div>

              {/* Divider */}
              <div className="hidden lg:flex items-center justify-center h-14">
                <Image
                  src={imgLine3}
                  alt=""
                  width={1}
                  height={57}
                  className="rotate-90"
                />
              </div>

              {/* Price To */}
              <div className="flex flex-col gap-1 w-full lg:w-28">
                <label className="font-bold text-sm text-black">
                  Kaina iki
                </label>
                <Input
                  variant="hero"
                  type="number"
                  placeholder="Iveskite kaina"
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  onKeyPress={handleKeyPress}
                  min="0"
                  step="1"
                  aria-label="Kaina iki"
                />
              </div>

              {/* Divider */}
              <div className="hidden lg:flex items-center justify-center h-14">
                <Image
                  src={imgLine3}
                  alt=""
                  width={1}
                  height={57}
                  className="rotate-90"
                />
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1 w-full lg:w-28">
                <label className="font-bold text-sm text-black">
                  Data
                </label>
                <Input
                  variant="hero"
                  type="date"
                  placeholder="Pasirinkite data"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  onKeyPress={handleKeyPress}
                  aria-label="Data"
                />
              </div>

              {/* Search Button */}
              <div className="w-full lg:w-auto">
                <Button 
                  onClick={handleSearch}
                  className="w-full lg:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
