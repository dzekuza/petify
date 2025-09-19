'use client'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { PetType } from '@/types'
import { 
  Trash2, 
  Eye, 
  EyeOff, 
  Heart,
  Euro,
  Edit
} from 'lucide-react'

interface PetTypeCardProps {
  petType: PetType
  onToggleStatus: (petTypeId: string, isActive: boolean) => void
  onManagePets: (petType: PetType) => void
  onDelete: (petTypeId: string) => void
  onEdit?: (petType: PetType) => void
}

export function PetTypeCard({ 
  petType, 
  onToggleStatus, 
  onManagePets, 
  onDelete,
  onEdit
}: PetTypeCardProps) {

  const getTotalPets = (petType: PetType) => {
    return petType.individualPets.length
  }

  const getPriceRange = (petType: PetType) => {
    const allPrices = petType.individualPets.map(ip => ip.price)
    if (allPrices.length === 0) return 'No pets'
    
    const min = Math.min(...allPrices)
    const max = Math.max(...allPrices)
    
    if (min === max) return `${min}€`
    return `${min}€ - ${max}€`
  }



  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{petType.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{petType.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={petType.isActive}
            onCheckedChange={(checked) => onToggleStatus(petType.id, checked)}
          />
          {petType.isActive ? (
            <Eye className="h-4 w-4 text-green-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {getTotalPets(petType)} gyvūnai
          </span>
          <span className="flex items-center gap-1">
            <Euro className="h-4 w-4" />
            {getPriceRange(petType)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManagePets(petType)}
          >
            Valdyti gyvūnus
          </Button>
          
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(petType)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Redaguoti
            </Button>
          )}
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(petType.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Ištrinti
          </Button>
        </div>
      </div>
    </div>
  )
}
