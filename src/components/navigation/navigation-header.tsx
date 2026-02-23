'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, X, Heart } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserMenu } from './user-menu'
import { useAuth } from '@/contexts/auth-context'

interface NavigationHeaderProps {
  isMobile: boolean
  mobileMenuOpen: boolean
  onMobileMenuToggle: () => void
  showSearchBar?: boolean
  isProviderRoute: boolean
  provider?: any
  onSignOut: () => void
}

export function NavigationHeader({
  isMobile,
  mobileMenuOpen,
  onMobileMenuToggle,
  showSearchBar = false,
  isProviderRoute,
  provider,
  onSignOut
}: NavigationHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  return (
    <header className="fixed top-0 z-50 w-full backdrop-blur-xl">
      <div className="w-full flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/PetiFy.svg"
            alt="Petify"
            width={32}
            height={32}
            className="h-8 w-auto transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Navigation - Desktop only */}
        <nav className="hidden md:flex items-center gap-2">
          {[
            { id: 'simple_bath', label: 'Paprastas maudymas' },
            { id: 'full_grooming', label: 'Pilnas kirpimas ir priežiūra' },
            { id: 'nail_trimming', label: 'Nagų kirpimas' },
            { id: 'ear_cleaning', label: 'Ausų valymas' },
            { id: 'teeth_cleaning', label: 'Dantų valymas' },
          ].map((service) => (
            <Link
              key={service.id}
              href={`/search?category=grooming&serviceType=${service.id}`}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                pathname.includes(`serviceType=${service.id}`)
                  ? "bg-red-50 text-red-600"
                  : "text-foreground hover:bg-gray-100"
              )}
            >
              {service.label}
            </Link>
          ))}

          {!isProviderRoute && (
            <Link
              href="/favorites"
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                pathname === '/favorites'
                  ? "bg-red-50 text-red-600"
                  : "text-foreground hover:bg-gray-100"
              )}
            >
              <Heart className="h-4 w-4" />
              Mėgstami
            </Link>
          )}
        </nav>

        {/* Search Bar - Desktop */}
        {!isMobile && showSearchBar && (
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            {/* Search component will be rendered here */}
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <UserMenu
            isProviderRoute={isProviderRoute}
            provider={provider}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </header>
  )
}
