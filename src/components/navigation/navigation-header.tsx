'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserMenu } from './user-menu'

interface NavigationHeaderProps {
  scrolled: boolean
  isMobile: boolean
  mobileMenuOpen: boolean
  onMobileMenuToggle: () => void
  showSearchBar?: boolean
  isProviderRoute: boolean
  provider?: any
  onSignOut: () => void
}

export function NavigationHeader({
  scrolled,
  isMobile,
  mobileMenuOpen,
  onMobileMenuToggle,
  showSearchBar = false,
  isProviderRoute,
  provider,
  onSignOut
}: NavigationHeaderProps) {
  const pathname = usePathname()

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent"
      )}
    >
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

        {/* Search Bar - Desktop */}
        {!isMobile && showSearchBar && (
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            {/* Search component will be rendered here */}
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {!isProviderRoute && (
            <Link
              href="/favorites"
              className={cn(
                "hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                pathname === '/favorites'
                  ? "bg-brand-light text-brand"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className="h-4 w-4" />
              Mėgstami
            </Link>
          )}
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
