'use client'

import { useState, useEffect } from 'react'

export const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      
      if (width < 768) {
        setIsMobile(true)
        setIsTablet(false)
        setIsDesktop(false)
      } else if (width >= 768 && width < 1024) {
        setIsMobile(false)
        setIsTablet(true)
        setIsDesktop(false)
      } else {
        setIsMobile(false)
        setIsTablet(false)
        setIsDesktop(true)
      }
    }

    // Check on mount
    checkDevice()

    // Add event listener for window resize
    window.addEventListener('resize', checkDevice)

    // Cleanup
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

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
