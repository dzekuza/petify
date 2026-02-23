'use client'

import { PetAd } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PawPrint, Euro } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface PetAdsGridProps {
  petAds: PetAd[]
  title?: string
  showViewAll?: boolean
  gridCols?: string
}

export const PetAdsGrid = ({ petAds, title, showViewAll = true, gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" }: PetAdsGridProps) => {
  const router = useRouter()
  
  const getSpeciesLabel = (species: string) => {
    const labels: Record<string, string> = {
      dog: 'Šuo',
      cat: 'Katė',
      bird: 'Paukštis',
      rabbit: 'Triušis',
      other: 'Kita'
    }
    return labels[species] || species
  }

  const getGenderLabel = (gender?: string) => {
    if (!gender) return 'Nepasakyta'
    return gender === 'male' ? 'Patinas' : 'Patelė'
  }

  const handlePetAdClick = (petAd: PetAd) => {
    // Navigate to provider detail page with pet ad data
    // We'll use the providerId as the route parameter and pass pet ad info via state
    router.push(`/providers/${petAd.providerId}?petAdId=${petAd.id}`)
  }

  if (petAds.length === 0) {
    return (
      <div className="text-center py-12">
        <PawPrint className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No pets available</h3>
        <p className="text-muted-foreground">No pets are currently available for sale.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {showViewAll && (
            <Button variant="outline" size="sm">
              View All
            </Button>
          )}
        </div>
      )}
      
      <div className={`grid gap-6 ${gridCols}`}>
        {petAds.map((petAd) => (
          <div key={petAd.id} className="group cursor-pointer" onClick={() => handlePetAdClick(petAd)}>
            <Card className="transition-all duration-200 hover:-translate-y-1 overflow-hidden py-0 pb-6">
              {/* Image Section */}
              <div className="relative overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 relative">
                  {petAd.images.length > 0 ? (
                    <Image
                      src={petAd.images[0]}
                      alt={petAd.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PawPrint className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="absolute top-3 left-3">
                  <Badge variant="default" className="bg-green-600 text-white">
                    For Sale
                  </Badge>
                </div>
              </div>
            
              
              {/* Card Content */}
              <div className="px-4 pt-4 pb-0">
                <div className="font-semibold text-sm mb-1">{petAd.name}</div>
                <div className="text-muted-foreground text-sm mb-1">
                  {getSpeciesLabel(petAd.species)}
                  {petAd.breed && ` • ${petAd.breed}`}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-foreground">
                    <Euro className="h-3 w-3 inline mr-1" />
                    {petAd.price}
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-foreground">
                      {getGenderLabel(petAd.gender)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
