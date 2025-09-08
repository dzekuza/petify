'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Users, DollarSign, Star } from 'lucide-react'
import { t } from '@/lib/translations'

type Booking = { id: string; date: string; totalPrice: number; customerId: string }
type Provider = { rating?: number }

type Props = { bookings: Booking[]; provider: Provider | null }

export default function StatsCards({ bookings, provider }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('bookings.today', "Today's Bookings")}</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => new Date(b.date).toDateString() === new Date().toDateString()).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('providerDashboard.totalCustomers', 'Iš viso klientų')}</p>
              <p className="text-2xl font-bold text-gray-900">{new Set(bookings.map(b => (b as any).customerId)).size}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('providerDashboard.thisMonth', 'Šį mėnesį')}</p>
              <p className="text-2xl font-bold text-gray-900">${bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('providerDashboard.rating', 'Įvertinimas')}</p>
              <p className="text-2xl font-bold text-gray-900">{provider?.rating || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


