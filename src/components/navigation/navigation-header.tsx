'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
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
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="w-full flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/PetiFy.svg"
            alt="Petify"
            width={24}
            height={24}
            className="h-6 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/search" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === '/search' ? "text-primary" : "text-muted-foreground"
              )}
            >
              Paieška
            </Link>
            <Link 
              href="/providers" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith('/providers') ? "text-primary" : "text-muted-foreground"
              )}
            >
              Tiekėjai
            </Link>
            <Link 
              href="/how-it-works" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === '/how-it-works' ? "text-primary" : "text-muted-foreground"
              )}
            >
              Kaip tai veikia
            </Link>
            {user && !isProviderRoute && (
              <Link 
                href="/favorites" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === '/favorites' ? "text-primary" : "text-muted-foreground"
                )}
              >
                Mėgstami
              </Link>
            )}
          </nav>
        )}

        {/* Search Bar - Desktop */}
        {!isMobile && showSearchBar && (
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            {/* Search component will be rendered here */}
          </div>
        )}

        {/* Desktop Actions */}
        {!isMobile && (
          <div className="flex items-center space-x-4">
            <UserMenu 
              isProviderRoute={isProviderRoute}
              provider={provider}
              onSignOut={onSignOut}
            />
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>
    </header>
  )
}
