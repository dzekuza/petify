'use client'

import { PetAd } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PawPrint, Euro, MapPin, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { petAdsApi } from '@/lib/pet-ads'

interface PetAdsGridProps {
  petAds: PetAd[]
  title?: string
  showViewAll?: boolean
  gridCols?: string
}

export const PetAdsGrid = ({ petAds, title, showViewAll = true, gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" }: PetAdsGridProps) => {
  const { user } = useAuth()
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

  const getSizeLabel = (size?: string) => {
    if (!size) return 'Nepasakyta'
    const labels: Record<string, string> = {
      small: 'Mažas',
      medium: 'Vidutinis',
      large: 'Didelis'
    }
    return labels[size] || size
  }

  const handleRequestPet = async (petAdId: string) => {
    if (!user) {
      toast.error('Please sign in to request a pet')
      router.push('/auth/signin')
      return
    }

    try {
      await petAdsApi.createPetAdRequest(petAdId, user.id, 'I am interested in this pet. Please contact me for more information.')
      toast.success('Your request has been sent to the seller!')
    } catch (error) {
      console.error('Error creating pet ad request:', error)
      toast.error('Failed to send request. Please try again.')
    }
  }

  if (petAds.length === 0) {
    return (
      <div className="text-center py-12">
        <PawPrint className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No pets available</h3>
        <p className="text-gray-600">No pets are currently available for sale.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {showViewAll && (
            <Button variant="outline" size="sm">
              View All
            </Button>
          )}
        </div>
      )}
      
      <div className={`grid ${gridCols} gap-6`}>
        {petAds.map((petAd) => (
          <Card key={petAd.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square relative bg-gray-100">
              {petAd.images.length > 0 ? (
                <Image
                  src={petAd.images[0]}
                  alt={petAd.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <PawPrint className="h-16 w-16 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant="default" className="bg-green-600">
                  For Sale
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-gray-900">{petAd.name}</h3>
                <div className="flex items-center text-green-600 font-semibold">
                  <Euro className="h-4 w-4 mr-1" />
                  {petAd.price}
                </div>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <p><span className="font-medium">Species:</span> {getSpeciesLabel(petAd.species)}</p>
                {petAd.breed && <p><span className="font-medium">Breed:</span> {petAd.breed}</p>}
                {petAd.age && <p><span className="font-medium">Age:</span> {petAd.age} months</p>}
                <p><span className="font-medium">Gender:</span> {getGenderLabel(petAd.gender)}</p>
                <p><span className="font-medium">Size:</span> {getSizeLabel(petAd.size)}</p>
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {petAd.description}
              </p>

              <div className="flex items-center justify-between">
                <Button
                  onClick={() => handleRequestPet(petAd.id)}
                  className="flex-1 mr-2"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Request Pet
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/providers/${petAd.providerId}`)}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                Listed {new Date(petAd.createdAt).toLocaleDateString('lt-LT')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
