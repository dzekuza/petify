'use client'

import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProviderAnalyticsPage() {
  return (
    <ProtectedRoute requiredRole="provider">
      <>
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Key business metrics and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">Analytics coming soon.</div>
          </CardContent>
        </Card>
      </>
    </ProtectedRoute>
  )
}

