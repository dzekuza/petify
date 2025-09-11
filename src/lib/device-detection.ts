'use client'

import { useState, useEffect, useMemo } from 'react'

export const useDeviceDetection = () => {
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    const checkDevice = () => {
      setWindowWidth(window.innerWidth)
    }

    // Check on mount
    checkDevice()

    // Add event listener for window resize with throttling
    let timeoutId: NodeJS.Timeout
    const throttledResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkDevice, 100)
    }

    window.addEventListener('resize', throttledResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', throttledResize)
      clearTimeout(timeoutId)
    }
  }, [])

  // Memoize device detection to prevent unnecessary re-renders
  const deviceInfo = useMemo(() => {
    if (windowWidth === 0) {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isMobileOrTablet: false
      }
    }

    const isMobile = windowWidth < 768
    const isTablet = windowWidth >= 768 && windowWidth < 1024
    const isDesktop = windowWidth >= 1024

    return {
      isMobile,
      isTablet,
      isDesktop,
      isMobileOrTablet: isMobile || isTablet
    }
  }, [windowWidth])

  return deviceInfo
}

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 1024 // lg breakpoint
}
