'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { providerApi } from '@/lib/providers'

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
  const [providerCheck, setProviderCheck] = useState<'idle' | 'checking' | 'is_provider' | 'not_provider'>('idle')

  const userRole = user?.user_metadata?.role

  // When requiredRole is 'provider' but metadata says otherwise, check the providers table
  useEffect(() => {
    if (!user || loading) return
    if (requiredRole !== 'provider') return
    if (userRole === 'provider' || userRole === 'admin') return

    // Metadata role doesn't match — check database for provider profile
    setProviderCheck('checking')
    providerApi.hasProviderProfile(user.id)
      .then((hasProfile) => {
        setProviderCheck(hasProfile ? 'is_provider' : 'not_provider')
      })
      .catch(() => {
        setProviderCheck('not_provider')
      })
  }, [user, loading, requiredRole, userRole])

  // Determine if there's a role mismatch
  const roleMismatch = (() => {
    if (!requiredRole || !user) return false
    if (userRole === 'admin') return false
    if (userRole === requiredRole) return false
    // For provider role, wait for DB check
    if (requiredRole === 'provider') {
      if (providerCheck === 'is_provider') return false
      if (providerCheck === 'not_provider') return true
      // Still checking or idle — don't mismatch yet
      return false
    }
    return true
  })()

  // Whether we're still resolving access
  const resolving = loading || (requiredRole === 'provider' && userRole !== 'provider' && userRole !== 'admin' && (providerCheck === 'idle' || providerCheck === 'checking'))

  useEffect(() => {
    if (resolving) return

    if (!user) {
      router.replace('/auth/signin')
      return
    }

    if (roleMismatch) {
      const target = requiredRole === 'provider' ? '/provider/onboarding' : '/'
      router.replace(target)
    }
  }, [resolving, user, roleMismatch, requiredRole, router])

  if (resolving) {
    return null
  }

  // During redirects, render nothing to prevent UI flicker
  if (!user || roleMismatch) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}
