'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { CategorySection } from '@/components/category-section'

// Import the images from the Figma design
const imgAnimalCareIcon = '/images/da178ce5d9e0efbaa63f916c95100c2daf751dac.png'
const imgPetTrainingIcon = '/images/abf5832628a6acaf2c4259ad14de133d3866577f.png'
const imgPetsPairingIcon = '/images/dad9cde557f42c866425d0fe77924deee8551656.png'
const imgPetVeterinaryIcon = '/images/1ad308669bee0a61d08eb85cb050afe5af94b466.png'
const imgPetAdsIcon = '/images/e9e2b26d5bf286f094c7cdffe862fc917fbe23f6.png'

interface ServiceCategory {
  id: string
  label: string
  icon: string
  value: string
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'grooming',
    label: 'Kirpyklos',
    icon: imgAnimalCareIcon,
    value: 'grooming'
  },
  {
    id: 'training',
    label: 'Dresura',
    icon: imgPetTrainingIcon,
    value: 'training'
  },
  {
    id: 'pairing',
    label: 'Poravimas',
    icon: imgPetsPairingIcon,
    value: 'adoption'
  },
  {
    id: 'veterinary',
    label: 'Veterinarijos',
    icon: imgPetVeterinaryIcon,
    value: 'veterinary'
  },
  {
    id: 'ads',
    label: 'Veislynai',
    icon: imgPetAdsIcon,
    value: 'adoption'
  }
]

export const MobileHeroSection = () => {
  const [location, setLocation] = useState('')
  const router = useRouter()

  const handleLocationSubmit = () => {
    if (location.trim()) {
      router.push(`/search?location=${encodeURIComponent(location.trim())}`)
    } else {
      router.push('/search')
    }
  }

  const handleCategoryClick = (categoryValue: string) => {
    const params = new URLSearchParams()
    if (location.trim()) {
      params.set('location', location.trim())
    }
    params.set('category', categoryValue)
    router.push(`/search?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLocationSubmit()
    }
  }

  return (
    <section className="bg-white pt-8 [&_.pagination-dots]:hidden [&_[class*='pagination']]:hidden [&_[class*='dots']]:hidden [&_.carousel-indicators]:hidden [&_.slider-dots]:hidden">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 items-center justify-center">
          {/* Mobile Hero Content */}
          <div className="w-full max-w-md mx-auto">
            <div className="flex flex-col gap-[19px] items-start justify-start">
             

              {/* Main Heading */}
              <div className="text-[24px] font-bold text-black leading-tight w-full">
                <p>Pasirinkite iš 400+ paslaugų teikėjų savo gyvūnui aplink jus</p>
              </div>

              {/* Location Input */}
              <div className="bg-neutral-50 flex gap-2.5 items-center justify-start p-[10px] relative rounded-[8px] w-full border border-[#ebebeb]">
                <input
                  type="text"
                  placeholder="Iveskite lokacija"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-[16px] text-gray-500 bg-transparent border-none outline-none w-full font-medium"
                />
                <button
                  onClick={handleLocationSubmit}
                  className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              {/* Service Categories */}
              <div className="flex gap-1 items-start justify-start relative w-full overflow-x-auto">
                {serviceCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.value)}
                    className="bg-neutral-50 flex gap-2.5 items-center justify-center px-4 py-2 relative rounded-[8px] shrink-0 hover:bg-neutral-100 transition-colors"
                  >
                    <div className="text-[16px] text-black text-nowrap font-medium">
                      <p className="whitespace-pre">{category.label}</p>
                    </div>
                    <div 
                      className="bg-center bg-cover bg-no-repeat shrink-0 size-8"
                      style={{ backgroundImage: `url('${category.icon}')` }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Sections - Same as desktop */}
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
