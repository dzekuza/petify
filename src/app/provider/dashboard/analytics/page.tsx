'use client'

import { useMemo } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Point = { x: number; y: number }

function MiniLineChart ({ values, color = '#111827' }: { values: number[]; color?: string }) {
  const points: Point[] = useMemo(() => {
    if (!values.length) return []
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = Math.max(1, max - min)
    return values.map((v, i) => ({
      x: (i / (values.length - 1)) * 100,
      y: 100 - ((v - min) / range) * 100
    }))
  }, [values])

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox="0 0 100 100" className="w-full h-16">
      <path d={path} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  )
}

export default function ProviderAnalyticsPage() {
  // Mock metrics for a quick at-a-glance dashboard
  const metrics = {
    totalRevenue: 4280.45,
    totalBookings: 123,
    avgOrderValue: 34.8,
    completionRate: 0.91
  }

  const bookingsTrend = [12, 9, 14, 11, 16, 13, 18, 22, 19, 24, 21, 26]
  const revenueTrend = [210, 340, 280, 360, 420, 390, 520, 610, 580, 720, 680, 840]

  const topServices = [
    { name: 'Pilnas kirpimas', bookings: 64, revenue: 1820 },
    { name: 'Nagų kirpimas', bookings: 38, revenue: 420 },
    { name: 'Maudymas', bookings: 21, revenue: 610 }
  ]

  return (
    <ProtectedRoute requiredRole="provider">
      <>
        <h1 className="text-2xl font-bold mb-6">Analitika</h1>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pajamos (30 d.)</CardTitle>
              <CardDescription>€{metrics.totalRevenue.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <MiniLineChart values={revenueTrend} color="#16a34a" />
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rezervacijos (30 d.)</CardTitle>
              <CardDescription>{metrics.totalBookings}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <MiniLineChart values={bookingsTrend} color="#2563eb" />
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vid. užsakymo suma</CardTitle>
              <CardDescription>€{metrics.avgOrderValue.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <MiniLineChart values={[28, 30, 31, 33, 32, 35, 34]} color="#7c3aed" />
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Įvykdymo rodiklis</CardTitle>
              <CardDescription>{Math.round(metrics.completionRate * 100)}%</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <MiniLineChart values={[80, 82, 83, 85, 86, 90, 91]} color="#f59e0b" />
            </CardContent>
          </Card>
        </div>

        {/* Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-none lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Pajamų dinamika</CardTitle>
              <CardDescription>Paskutinių 12 savaičių</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <MiniLineChart values={revenueTrend} color="#16a34a" />
              <div className="text-xs text-muted-foreground mt-2">Bendra: €{revenueTrend.reduce((a, b) => a + b, 0).toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Top paslaugos</CardTitle>
              <CardDescription>Pagal pajamas ir rezervacijas</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {topServices.map((s) => (
                  <div key={s.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.bookings} rezerv.</div>
                    </div>
                    <div className="text-sm font-semibold">€{s.revenue.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    </ProtectedRoute>
  )
}

