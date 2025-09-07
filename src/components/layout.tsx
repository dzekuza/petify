import { Navigation } from './navigation'
import { Suspense } from 'react'
import { Footer } from './footer'

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
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
