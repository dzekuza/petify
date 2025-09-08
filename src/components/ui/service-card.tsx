'use client'

import { Clock, Users, CheckCircle } from 'lucide-react'
import { Service } from '@/types'
import { Badge } from './badge'
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
    <div
      className={cn(
        "bg-white border rounded-xl p-6 cursor-pointer transition-all",
        isSelected 
          ? "border-black bg-gray-50 shadow-md" 
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
        onClick && "hover:shadow-md"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
            {isSelected && showSelection && (
              <CheckCircle className="w-5 h-5 text-black" />
            )}
          </div>
          <p className="text-gray-600 mb-4">{service.description}</p>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
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
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {service.includes.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-right ml-6">
          <div className="text-2xl font-bold text-gray-900">
            €{service.price}
          </div>
        </div>
      </div>
    </div>
  )
}
