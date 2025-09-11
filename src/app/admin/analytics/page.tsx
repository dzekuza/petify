"use client"

import { AdminProtectedRoute } from '@/components/admin-protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AdminStats {
  totalUsers: number
  totalProviders: number
  totalBookings: number
  totalRevenue: number
  monthlyRevenue: number
  activeProviders: number
  pendingProviders: number
  totalPets: number
  totalServices: number
  businessTypeStats: Record<string, number>
}

export default function AdminAnalyticsPage() {
  // In a full implementation, fetch stats here or accept as props via RSC
  const stats: AdminStats | null = null as AdminStats | null

  return (
    <AdminProtectedRoute>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="mt-1 text-muted-foreground text-sm">Platform analytics and metrics</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Type Distribution</CardTitle>
                <CardDescription>Distribution of providers by business type</CardDescription>
              </CardHeader>
              <CardContent>
                {!stats || Object.keys(stats?.businessTypeStats || {}).length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No business type data available</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(stats?.businessTypeStats || {}).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm font-medium capitalize">{type}</span>
                        </div>
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Revenue breakdown and trends</CardDescription>
              </CardHeader>
              <CardContent>
                {!stats ? (
                  <p className="text-gray-600 text-center py-4">No revenue data available</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Revenue</span>
                      <span className="text-lg font-bold">€{stats.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">This Month</span>
                      <span className="text-lg font-bold text-green-600">€{stats.monthlyRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average per Booking</span>
                      <span className="text-lg font-bold">
                        €{stats.totalBookings > 0 ? (stats.totalRevenue / stats.totalBookings).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  )
}
