'use client'

import { Button } from '@/components/ui/button'
import { Edit, Trash2, Star, Plus } from 'lucide-react'
import { t } from '@/lib/translations'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  maxPets: number
}

type Props = {
  services: Service[]
  onAdd: () => void
  onEdit: (s: Service) => void
  onDelete: (id: string) => void
}

export default function ServicesSection({ services, onAdd, onEdit, onDelete }: Props) {
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('providerDashboard.emptyServicesTitle', 'No services yet')}</h3>
        <p className="text-gray-600">{t('providerDashboard.emptyServicesDesc', 'Add your first service to start accepting bookings.')}</p>
        <Button className="mt-4" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          {t('providerDashboard.addFirstService', 'Add Your First Service')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div key={service.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">{service.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>€{service.price}</span>
                <span>{service.duration} min</span>
                <span>Max {service.maxPets} pet{service.maxPets > 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(service)}>
                <Edit className="h-4 w-4 mr-1" />
                {t('common.edit', 'Edit')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(service.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-1" />
                {t('common.delete', 'Delete')}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


