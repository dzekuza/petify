'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Search, Heart, Calendar, User, MessageCircle } from 'lucide-react'

// Mobile bottom navigation with main app sections
export function MobileBottomNav() {
  const pathname = usePathname()

  // Hide on provider routes and certain flows where bottom nav is undesirable
  const isProviderRoute = pathname?.startsWith('/provider')
  if (isProviderRoute) return null

  const items = [
    { id: 'home', name: 'Pradžia', href: '/', icon: Home },
    { id: 'search', name: 'Paieška', href: '/search', icon: Search },
    { id: 'favorites', name: 'Mėgstami', href: '/favorites', icon: Heart },
    { id: 'chat', name: 'Pokalbiai', href: '/chat', icon: MessageCircle },
    { id: 'bookings', name: 'Rezervacijos', href: '/bookings', icon: Calendar },
    { id: 'profile', name: 'Profilis', href: '/profile', icon: User },
  ]

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-[100] border-t bg-white md:hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      <ul className="grid grid-cols-6 items-stretch px-4 py-2">
        {items.map(item => {
          const isActive = pathname === item.href || 
            (item.id === 'search' && pathname?.startsWith('/search')) ||
            (item.id === 'home' && pathname === '/') ||
            (item.id === 'chat' && pathname?.startsWith('/chat'))
          const IconComponent = item.icon
          return (
            <li key={item.id} className="min-w-0">
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2.5 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black transition-colors',
                  isActive ? 'text-black' : 'text-gray-600 hover:text-black'
                )}
                aria-label={item.name}
              >
                <IconComponent className={cn('h-6 w-6', isActive ? '' : 'opacity-80')} />
                <span className={cn('truncate', isActive ? 'font-semibold' : 'font-medium')}>{item.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}


