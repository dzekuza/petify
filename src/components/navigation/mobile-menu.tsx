'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Heart, User, Settings, LogOut, Calendar, Star } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { NavigationSearch } from './navigation-search'
import { ServiceCategories } from './service-categories'
import { providerApi } from '@/lib/providers'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  isProviderRoute: boolean
  provider?: any
  onSignOut: () => void
}

export function MobileMenu({ 
  isOpen, 
  onClose, 
  isProviderRoute, 
  provider, 
  onSignOut 
}: MobileMenuProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await onSignOut()
      router.push('/')
      onClose()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-full w-full">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-center text-lg font-semibold">
            Meniu
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          {/* Search */}
          <NavigationSearch isMobile className="mt-4" />
          
          {/* Service Categories */}
          <ServiceCategories isMobile />
          
          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Navigacija</h3>
            <div className="space-y-2">
              <Button variant="ghost" asChild className="w-full justify-start">
                <Link href="/search">Paieška</Link>
              </Button>
              <Button variant="ghost" asChild className="w-full justify-start">
                <Link href="/providers">Tiekėjai</Link>
              </Button>
              <Button variant="ghost" asChild className="w-full justify-start">
                <Link href="/how-it-works">Kaip tai veikia</Link>
              </Button>
            </div>
          </div>

          {/* User Section */}
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={user.user_metadata?.full_name || ''} />
                  <AvatarFallback>
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.user_metadata?.full_name || 'User'}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                {isProviderRoute && provider ? (
                  <>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/provider/dashboard">
                        <Calendar className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/provider/dashboard/bookings">
                        <Calendar className="mr-2 h-4 w-4" />
                        Užsakymai
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/provider/dashboard/services">
                        <Star className="mr-2 h-4 w-4" />
                        Paslaugos
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/bookings">
                        <Calendar className="mr-2 h-4 w-4" />
                        Mano užsakymai
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/favorites">
                        <Heart className="mr-2 h-4 w-4" />
                        Mėgstami
                      </Link>
                    </Button>
                  </>
                )}
                
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profilis
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/profile/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Nustatymai
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="w-full justify-start text-red-600 hover:text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Atsijungti
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/signin">Prisijungti</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/signup">Registruotis</Link>
              </Button>
            </div>
          )}
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Uždaryti</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
