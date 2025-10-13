'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Heart, User, Settings, LogOut, Calendar, Star, Dog, Briefcase } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { t } from '@/lib/translations'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

interface UserMenuProps {
  isProviderRoute: boolean
  provider?: any
  onSignOut: () => void
  className?: string
}

export function UserMenu({ isProviderRoute, provider, onSignOut, className }: UserMenuProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isProvider, setIsProvider] = useState(false)

  // Check if user is a provider
  useEffect(() => {
    const checkProviderStatus = async () => {
      if (!user) return
      
      const { data } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      setIsProvider(!!data)
    }
    
    checkProviderStatus()
  }, [user])

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await onSignOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button variant="ghost" asChild>
          <Link href="/auth/signin">Prisijungti</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/signup">Registruotis</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Notifications */}
      <div className="hidden md:block">
        {/* Notifications component will be rendered here */}
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={user.user_metadata?.full_name || ''} />
              <AvatarFallback>
                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {isProviderRoute && provider ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/provider/dashboard">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/provider/dashboard/bookings">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Užsakymai</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/provider/dashboard/services">
                  <Star className="mr-2 h-4 w-4" />
                  <span>Paslaugos</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/bookings">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Mano užsakymai</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/favorites">
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Mėgstami</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/pets">
                  <Dog className="mr-2 h-4 w-4" />
                  <span>Mano augintiniai</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* Provider Options */}
              {isProvider ? (
                <DropdownMenuItem asChild>
                  <Link href="/provider/dashboard">
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>Tiekėjo skydelis</span>
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/provider/onboarding">
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>Tapti tiekėju</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profilis</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Nustatymai</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleSignOut}
            disabled={isLoading}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Atsijungti</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
