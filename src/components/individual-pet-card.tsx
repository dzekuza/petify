'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IndividualPet } from '@/types'
import { 
  Edit, 
  Trash2, 
  Euro,
  Calendar,
  User
} from 'lucide-react'

interface IndividualPetCardProps {
  pet: IndividualPet
  onEdit?: (pet: IndividualPet) => void
  onDelete?: (petId: string) => void
}

export function IndividualPetCard({ 
  pet, 
  onEdit, 
  onDelete 
}: IndividualPetCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('lt-LT')
  }

  const getSexLabel = (sexType: string) => {
    return sexType === 'male' ? 'Patinas' : 'Patelė'
  }

  const getFeatureLabel = (feature: string) => {
    const featureLabels: Record<string, string> = {
      microchipped: 'Mikročipas',
      vaccinated: 'Vakcinos',
      wormed: 'Išvaryti parazitai',
      health_checked: 'Sveikatos patikra',
      parents_tested: 'Tėvai patikrinti'
    }
    return featureLabels[feature] || feature
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Content Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{pet.title}</h3>
              <Badge variant="outline" className="text-xs">
                {getSexLabel(pet.sexType)}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                <span className="font-medium">{pet.price}€</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Paruoštas: {formatDate(pet.readyToLeave)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Amžius: {pet.age} sav.</span>
              </div>
            </div>

            {pet.features && pet.features.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {pet.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {getFeatureLabel(feature)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buttons Section */}
          <div className="flex items-center gap-2 pt-2 border-t">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(pet)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Redaguoti
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(pet.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Ištrinti
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
