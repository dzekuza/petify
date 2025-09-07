import { Navigation } from './navigation'
import { Footer } from './footer'

interface LayoutProps {
  children: React.ReactNode
  hideServiceCategories?: boolean
  onFiltersClick?: () => void
}

export const Layout = ({ children, hideServiceCategories = false, onFiltersClick }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation hideServiceCategories={hideServiceCategories} onFiltersClick={onFiltersClick} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
