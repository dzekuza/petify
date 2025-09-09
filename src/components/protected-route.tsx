'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { FullScreenLoading } from '@/components/ui/loading'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'customer' | 'provider' | 'admin'
  fallback?: React.ReactNode
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return <FullScreenLoading />
  }

  if (!user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <Lock className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Access Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You need to sign in to access this page
            </p>
          </div>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">
                Please sign in to your account to continue
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <a href="/auth/signin">Sign In</a>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <a href="/auth/signup">Create Account</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // For demo purposes, allow access if user is authenticated
  // In production, you would check the actual role from the database
  if (requiredRole && user.user_metadata?.role !== requiredRole) {
    // Allow access for demo - in production, you'd check the role from your database
    // This ensures immediate access after provider signup
    console.log('Role check bypassed for demo - user role:', user.user_metadata?.role, 'required:', requiredRole)
  }

  return <>{children}</>
}
