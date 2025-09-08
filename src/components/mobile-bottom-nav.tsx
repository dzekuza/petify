'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// Fixed bottom navigation for mobile with service categories
export function MobileBottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCategory = searchParams?.get('category')

  // Hide on provider routes and certain flows where bottom nav is undesirable
  const isProviderRoute = pathname?.startsWith('/provider')
  if (isProviderRoute) return null

  const items = [
    { id: 'grooming', name: 'Kirpyklos', href: '/search?category=grooming', icon: '/Animal_Care_Icon Background Removed.png' },
    { id: 'training', name: 'Dresūra', href: '/search?category=training', icon: '/Pet_Training_Icon Background Removed.png' },
    { id: 'boarding', name: 'Poravimas', href: '/search?category=boarding', icon: '/Pets_Pairing_Icon Background Removed.png' },
    { id: 'veterinary', name: 'Veterinarijos', href: '/search?category=veterinary', icon: '/Pet_Veterinary_Icon Background Removed.png' },
    { id: 'adoption', name: 'Skelbimai', href: '/search?category=adoption', icon: '/Pet_Ads_Icon Background Removed.png' },
  ]

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t bg-white md:hidden"
      role="navigation"
      aria-label="Service categories"
    >
      <ul className="grid grid-cols-5 items-stretch">
        {items.map(item => {
          const isActive = activeCategory === item.id
          return (
            <li key={item.id} className="min-w-0">
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2.5 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black',
                  isActive ? 'text-black' : 'text-gray-600 hover:text-black'
                )}
                aria-label={item.name}
              >
                <span className={cn('relative h-10 w-10', isActive ? '' : 'opacity-80')}>
                  <Image src={item.icon} alt={item.name} fill sizes="24px" className="object-contain" />
                </span>
                <span className={cn('truncate', isActive ? 'font-semibold' : 'font-medium')}>{item.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}


