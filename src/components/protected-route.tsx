'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { Loading } from '@/components/ui/loading'
import { Layout } from '@/components/layout'

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

  // Stable memoized checks to avoid changing hook order
  const roleMismatch = useMemo(() => {
    if (!requiredRole) return false
    if (!user) return false
    // Demo bypass: allow provider pages even if user role is not 'provider'
    if (requiredRole === 'provider') return false
    return user.user_metadata?.role !== requiredRole
  }, [requiredRole, user])

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace('/auth/signin')
      return
    }

    if (roleMismatch) {
      const target = requiredRole === 'provider' ? '/provider/onboarding' : '/'
      router.replace(target)
    }
  }, [loading, user, roleMismatch, requiredRole, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-50" style={{ minHeight: '100vh' }}>
        <Loading />
      </div>
    )
  }

  // During redirects, render nothing to prevent UI flicker and hook churn
  if (!user || roleMismatch) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}
