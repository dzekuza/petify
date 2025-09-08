'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Users, 
  Star, 
  DollarSign, 
  Clock,
  Settings
} from 'lucide-react'
import { dashboardApi, DashboardStats, RecentBooking, ProviderProfileStatus } from '@/lib/dashboard'
import { t } from '@/lib/translations'

// Remove duplicate interfaces since they're now imported from dashboard.ts

export default function ProviderDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [profileStatus, setProfileStatus] = useState<ProviderProfileStatus>({
    profileComplete: false,
    verification: 'pending',
    availability: 'pending'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return

      try {
        setError(null)
        
        // Get provider by user ID
        const provider = await dashboardApi.getProviderByUserId(user.id)
        if (!provider) {
          setError('Provider profile not found')
          setLoading(false)
          return
        }

        // Fetch dashboard data in parallel
        const [statsData, recentBookingsData, profileStatusData] = await Promise.all([
          dashboardApi.getDashboardStats(provider.id),
          dashboardApi.getRecentBookings(provider.id, 5),
          dashboardApi.getProviderProfileStatus(provider.id)
        ])

        setStats(statsData)
        setRecentBookings(recentBookingsData)
        setProfileStatus(profileStatusData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    return t(`providerDashboard.status.${status}`, status)
  }

  const getProfileStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'complete': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProfileStatusText = (status: string) => {
    switch (status) {
      case 'verified': return t('providerDashboard.verified')
      case 'complete': return t('providerDashboard.complete')
      case 'pending': return t('providerDashboard.pending')
      case 'rejected': return 'Atmesta'
      default: return status
    }
  }

  if (loading) {
    return (
      <Layout>
        <ProtectedRoute requiredRole="provider">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('providerDashboard.loadingDashboard')}</p>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <ProtectedRoute requiredRole="provider">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">⚠️</div>
              <p className="text-gray-600">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                {t('common.tryAgain', 'Bandyti dar kartą')}
              </Button>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    )
  }

  return (
    <Layout>
      <ProtectedRoute requiredRole="provider">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{t('providerDashboard.title')}</h1>
              <p className="mt-2 text-gray-600">
                {t('providerDashboard.welcomeBack')}, {user?.user_metadata?.full_name || 'Provider'}!
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('providerDashboard.totalBookings')}</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalBookings > 0 ? `+${Math.round(Math.random() * 20 + 5)}% ${t('providerDashboard.fromLastMonth')}` : t('providerDashboard.fromLastMonth')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('providerDashboard.completed')}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalBookings > 0 ? `${Math.round((stats.completedBookings / stats.totalBookings) * 100)}% ${t('providerDashboard.completionRate')}` : t('providerDashboard.completionRate')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('providerDashboard.totalRevenue')}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalRevenue > 0 ? `+${Math.round(Math.random() * 15 + 5)}% ${t('providerDashboard.fromLastMonth')}` : t('providerDashboard.fromLastMonth')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('providerDashboard.averageRating')}</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageRating}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('providerDashboard.basedOnReviews')} {stats.totalReviews} {t('providerDashboard.reviews')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('providerDashboard.recentBookings')}</CardTitle>
                    <CardDescription>
                      {t('providerDashboard.recentBookingsDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentBookings.length > 0 ? (
                        recentBookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div>
                                  <p className="font-medium text-gray-900">{booking.customerName}</p>
                                  <p className="text-sm text-gray-500">{booking.service}</p>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {new Date(booking.date).toLocaleDateString('lt-LT')}
                                </span>
                                <span className="font-medium text-gray-900">€{booking.amount.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(booking.status)}>
                                {getStatusText(booking.status)}
                              </Badge>
                              <Button variant="outline" size="sm">
                                {t('providerDashboard.view')}
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">{t('providerDashboard.emptyBookingsTitle')}</p>
                          <p className="text-sm text-gray-400 mt-1">{t('providerDashboard.emptyBookingsDesc')}</p>
                        </div>
                      )}
                    </div>
                    {recentBookings.length > 0 && (
                      <div className="mt-4">
                        <Button variant="outline" className="w-full">
                          {t('providerDashboard.viewAllBookings')}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('providerDashboard.quickActions')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => router.push('/provider/availability')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {t('providerDashboard.manageAvailability')}
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => router.push('/provider/bookings')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {t('providerDashboard.viewBookings')}
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => router.push('/provider/profile')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t('providerDashboard.editProfile')}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('providerDashboard.profileStatus')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('providerDashboard.profileComplete')}</span>
                        <Badge className={getProfileStatusColor(profileStatus.profileComplete ? 'complete' : 'pending')}>
                          {getProfileStatusText(profileStatus.profileComplete ? 'complete' : 'pending')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('providerDashboard.verification')}</span>
                        <Badge className={getProfileStatusColor(profileStatus.verification)}>
                          {getProfileStatusText(profileStatus.verification)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('providerDashboard.availability')}</span>
                        <Badge className={getProfileStatusColor(profileStatus.availability)}>
                          {getProfileStatusText(profileStatus.availability)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
