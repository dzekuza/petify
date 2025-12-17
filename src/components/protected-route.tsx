'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loading } from '@/components/ui/loading'

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
    // Check user role from metadata
    const userRole = user.user_metadata?.role
    // Admin can access all roles
    if (userRole === 'admin') return false
    return userRole !== requiredRole
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
    return null
  }

  // During redirects, render nothing to prevent UI flicker and hook churn
  if (!user || roleMismatch) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}
