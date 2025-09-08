import { Navigation } from './navigation'
import { Suspense } from 'react'
import { Footer } from './footer'
import { MobileBottomNav } from './mobile-bottom-nav'

interface LayoutProps {
  children: React.ReactNode
  hideServiceCategories?: boolean
  onFiltersClick?: () => void
}

export const Layout = ({ children, hideServiceCategories = false, onFiltersClick }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="px-4 py-2 text-sm text-gray-500">Loading...</div>}>
        <Navigation hideServiceCategories={hideServiceCategories} onFiltersClick={onFiltersClick} />
      </Suspense>
      {/* Add bottom padding on mobile to avoid overlap with bottom nav */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <Suspense fallback={<div className="h-16 bg-white border-t"></div>}>
        <MobileBottomNav />
      </Suspense>
      <Footer />
    </div>
  )
}
