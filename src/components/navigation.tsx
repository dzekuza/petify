'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useDeviceDetection } from '@/lib/device-detection'
import { useAuth } from '@/contexts/auth-context'
import { providerApi } from '@/lib/providers'
import { NavigationHeader } from './navigation/navigation-header'
import { MobileMenu } from './navigation/mobile-menu'
import type { NavigationProps } from './navigation/types'

export default function Navigation({ hideServiceCategories = false, onFiltersClick }: NavigationProps) {
  const pathname = usePathname()
  const { isMobile } = useDeviceDetection()
  const { user, signOut } = useAuth()
  
  const [isMounted, setIsMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [provider, setProvider] = useState<any>(null)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Ensure consistent rendering between server and client
  const isProviderRoute = typeof pathname === 'string' && pathname.startsWith('/provider/')

  // Load provider data when in provider mode
  useEffect(() => {
    const loadProviderData = async () => {
      if (user?.id && isProviderRoute) {
        try {
          const providerData = await providerApi.getProviderByUserId(user.id)
          setProvider(providerData)
        } catch (error) {
          console.error('Error loading provider data:', error)
        }
      }
    }

    loadProviderData()
  }, [user?.id, isProviderRoute])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <NavigationHeader
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        isProviderRoute={isProviderRoute}
        provider={provider}
        onSignOut={signOut}
      />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isProviderRoute={isProviderRoute}
        provider={provider}
        onSignOut={signOut}
      />

    </>
  )
}
