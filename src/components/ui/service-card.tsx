'use client'

import { Clock, Users, CheckCircle } from 'lucide-react'
import { Service } from '@/types'
import { Badge } from './badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './card'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
  service: Service
  isSelected?: boolean
  onClick?: () => void
  showSelection?: boolean
}

export function ServiceCard({ 
  service, 
  isSelected = false, 
  onClick, 
  showSelection = true 
}: ServiceCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all",
        isSelected
          ? "border-black bg-gray-50"
          : "border-gray-200 hover:border-gray-300"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{service.name}</CardTitle>
          {isSelected && showSelection && (
            <CheckCircle className="w-5 h-5 text-black" />
          )}
        </div>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {service.duration} min
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Up to {service.maxPets} {service.maxPets > 1 ? 'pets' : 'pet'}
          </div>
        </div>

        {service.includes && service.includes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {service.includes.map((item, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="text-2xl font-bold text-foreground w-full text-right">
          €{service.price}
        </div>
      </CardFooter>
    </Card>
  )
}
