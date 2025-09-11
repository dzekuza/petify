'use client'

import { useState, useEffect } from 'react'

export const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const checkDevice = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768)
      }
    }

    // Check on mount
    checkDevice()

    // Add event listener for window resize with throttling
    let timeoutId: NodeJS.Timeout
    const throttledResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkDevice, 100)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', throttledResize)
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', throttledResize)
      }
      clearTimeout(timeoutId)
    }
  }, [])

  // During SSR or before hydration, assume desktop to prevent hydration mismatch
  if (!isClient) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isMobileOrTablet: false
    }
  }

  const isTablet = !isMobile && typeof window !== 'undefined' && window.innerWidth < 1024
  const isDesktop = !isMobile && !isTablet

  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet: isMobile || isTablet
  }
}

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 1024 // lg breakpoint
}
