'use client'

import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { dashboardApi, RecentBooking } from '@/lib/dashboard'
import { Clock } from 'lucide-react'

export default function ProviderBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return
      try {
        setError(null)
        setLoading(true)
        const provider = await dashboardApi.getProviderByUserId(user.id)
        if (!provider?.id) {
          setError('Provider not found')
          setLoading(false)
          return
        }
        const list = await dashboardApi.getRecentBookings(provider.id, 25)
        setBookings(list)
      } catch (e) {
        setError('Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  const getBadgeVariant = (s: RecentBooking['status']) => {
    switch (s) {
      case 'confirmed': return 'default' as const
      case 'completed': return 'outline' as const
      case 'cancelled': return 'destructive' as const
      default: return 'secondary' as const
    }
  }

  const getStatusLabelLt = (s: RecentBooking['status']) => {
    switch (s) {
      case 'pending': return 'Laukiama'
      case 'confirmed': return 'Patvirtinta'
      case 'completed': return 'Įvykdyta'
      case 'cancelled': return 'Atšaukta'
      default: return s
    }
  }

  return (
    <ProtectedRoute requiredRole="provider">
      <>
        <h1 className="text-2xl font-bold mb-6">Rezervacijos</h1>
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader className="p-0">
            <CardTitle>Naujausios rezervacijos</CardTitle>
            <CardDescription>Naujausi klientų užsakymai</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-sm text-muted-foreground">Įkeliama...</div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">Dar nėra rezervacijų</div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div>
                      <div className="font-medium">{b.customerName}</div>
                      <div className="text-sm text-muted-foreground">{b.service}</div>
                      <div className="mt-1 text-sm text-muted-foreground flex items-center">
                        <Clock className="h-4 w-4 mr-1" /> {new Date(b.date).toLocaleString('lt-LT')}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-semibold">€{b.amount.toFixed(2)}</div>
                      <Badge variant={getBadgeVariant(b.status)}>{getStatusLabelLt(b.status)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </>
    </ProtectedRoute>
  )
}

