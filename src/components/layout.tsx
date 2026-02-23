import Navigation from './navigation'
import { Suspense } from 'react'
import { Footer } from './footer'
import { MobileBottomNav } from './mobile-bottom-nav'

interface LayoutProps {
  children: React.ReactNode
  hideServiceCategories?: boolean
  onFiltersClick?: () => void
  hideFooter?: boolean
}

export const Layout = ({ children, hideServiceCategories = false, onFiltersClick, hideFooter = false }: LayoutProps) => {
  return (
    <div className="flex flex-col">
      <Suspense fallback={<div className="px-4 py-2 text-sm text-muted-foreground">Loading...</div>}>
        <Navigation hideServiceCategories={hideServiceCategories} onFiltersClick={onFiltersClick} />
      </Suspense>
      {/* Add padding for fixed header and bottom nav */}
      <main className="flex-1 pt-28 md:pb-0">
        {children}
      </main>
      <Suspense fallback={<div className="h-16 bg-white border-t"></div>}>
        <MobileBottomNav />
      </Suspense>
      {!hideFooter && <Footer />}
    </div>
  )
}
