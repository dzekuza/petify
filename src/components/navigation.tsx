'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, X, Heart, User, Settings, LogOut, Calendar, Star, Dog, Clock } from 'lucide-react'
import { NotificationsDropdown } from '@/components/notifications'
import Image from 'next/image'
import { NavigationSearch } from '@/components/navigation-search'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { t } from '@/lib/translations'
import { providerApi } from '@/lib/providers'
import { useDeviceDetection } from '@/lib/device-detection'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InputWithLabel, SelectWithLabel } from '@/components/ui/input-with-label'
import AddressAutocomplete from '@/components/address-autocomplete'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from '@/components/ui/drawer'

const serviceTypes = [
  { value: 'grooming', label: 'Gyvūnų šukavimo specialistas' },
  { value: 'veterinary', label: 'Veterinarijos gydytojas' },
  { value: 'boarding', label: 'Gyvūnų prieglauda' },
  { value: 'training', label: 'Gyvūnų treneris' },
  { value: 'adoption', label: 'Skelbimai' },
  { value: 'sitting', label: 'Gyvūnų prižiūrėtojas' },
]

interface NavigationProps {
  hideServiceCategories?: boolean
  onFiltersClick?: () => void
}

function NavigationContent({ hideServiceCategories = false, onFiltersClick }: NavigationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isMobile } = useDeviceDetection()
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Ensure consistent rendering between server and client
  const isProviderRoute = typeof pathname === 'string' && pathname.startsWith('/provider')
  const isSearchPage = pathname === '/search'
  const hasCategory = searchParams?.get('category')
  const showSearchBar = isSearchPage || hasCategory

  const navigation = [
    { 
      name: t('landing.hero.categories.grooming'), 
      href: '/search?category=grooming',
      icon: '/Animal_Care_Icon Background Removed.png',
      shortName: 'Kirpyklos'
    },
    { 
      name: t('landing.hero.categories.training'), 
      href: '/search?category=training',
      icon: '/Pet_Training_Icon Background Removed.png',
      shortName: 'Dresūra'
    },
    { 
      name: t('landing.hero.categories.boarding'), 
      href: '/search?category=boarding',
      icon: '/Pets_Pairing_Icon Background Removed.png',
      shortName: 'Poravimas'
    },
    { 
      name: t('landing.hero.categories.veterinary'), 
      href: '/search?category=veterinary',
      icon: '/Pet_Veterinary_Icon Background Removed.png',
      shortName: 'Veterinarijos'
    },
    { 
      name: t('landing.hero.categories.adoption'), 
      href: '/search?category=adoption',
      icon: '/Pet_Ads_Icon Background Removed.png',
      shortName: 'Skelbimai'
    },
  ]
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [providerSignupOpen, setProviderSignupOpen] = useState(false)
  const [customerMenuOpen, setCustomerMenuOpen] = useState(false)
  const [providerForm, setProviderForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    serviceType: '',
    businessName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [provider, setProvider] = useState<any>(null)
  const { user, signOut, signUp } = useAuth()

  // Load provider data when in provider mode
  useEffect(() => {
    const loadProviderData = async () => {
      if (user?.id && isProviderRoute) {
        try {
          const providerData = await providerApi.getProviderByUserId(user.id)
          setProvider(providerData)
        } catch (error) {
          console.error('Error loading provider data:', error)
        }
      }
    }

    loadProviderData()
  }, [user?.id, isProviderRoute])

  const handleSignOut = async () => {
    await signOut()
  }

  const handleProviderSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (providerForm.password !== providerForm.confirmPassword) {
      setError(t('auth.signup.passwordsDoNotMatch'))
      setLoading(false)
      return
    }

    if (providerForm.password.length < 6) {
      setError(t('auth.signup.passwordTooShort'))
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(
        providerForm.email, 
        providerForm.password, 
        providerForm.fullName, 
        'provider',
        {
          business_name: providerForm.businessName,
          service_type: providerForm.serviceType,
          phone: providerForm.phone,
          address: providerForm.address,
          city: providerForm.city,
          state: providerForm.state,
          zip_code: providerForm.zipCode
        }
      )
      
      if (error) {
        setError(error.message)
      } else {
        // Close modal and redirect to provider dashboard
        setProviderSignupOpen(false)
        // Redirect to provider dashboard where they can complete their profile
        router.push('/provider/dashboard')
      }
    } catch {
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProviderForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSwitchToProvider = async () => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    try {
      // Check if user already has a provider profile
      const hasProfile = await providerApi.hasProviderProfile(user.id)
      
      if (hasProfile) {
        // User already has a provider profile, redirect to dashboard
        router.push('/provider/dashboard')
      } else {
        // User doesn't have a provider profile, redirect to onboarding
        router.push('/provider/onboarding')
      }
    } catch (error) {
      console.error('Error checking provider status:', error)
      // On error, default to onboarding
      router.push('/provider/onboarding')
    }
  }

  return (
    <header className="bg-white border-b">
      <nav className="mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className={cn("flex items-center justify-between", showSearchBar ? "h-20" : "h-16")}>
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/PetiFy.svg"
                alt="PetiFy"
                width={86}
                height={29}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>


          {/* Desktop Navigation */}
          {!hideServiceCategories && isMounted && !isProviderRoute && (
            <div className="hidden md:flex md:items-center md:space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-black transition-colors group"
                >
                  <div className="h-8 w-8 relative">
                    <Image
                      src={item.icon}
                      alt={item.shortName}
                      fill
                      sizes="40px"
                      className="object-contain group-hover:opacity-80 transition-opacity"
                    />
                  </div>
                  <span>{item.shortName}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                {/* Customer-specific actions */}
                {isMounted && !isProviderRoute && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => router.push('/favorites')}
                    aria-label={t('navigation.favorites') || 'Mėgstami'}
                    title={t('navigation.favorites') || 'Mėgstami'}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                )}

                {/* Provider-specific navigation items */}
                {isMounted && isProviderRoute && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-3 text-sm font-medium transition-colors",
                        pathname === '/provider/dashboard' 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => router.push('/provider/dashboard')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      {t('navigation.dashboard')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-3 text-sm font-medium transition-colors",
                        pathname === '/provider/dashboard/bookings' 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => router.push('/provider/dashboard/bookings')}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('navigation.bookings')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-3 text-sm font-medium transition-colors",
                        pathname === '/provider/dashboard/services' 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => router.push(provider?.business_type === 'adoption' ? '/provider/pet-ads' : '/provider/dashboard/services')}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      {provider?.business_type === 'adoption' ? 'Skelbimai' : t('navigation.services')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-3 text-sm font-medium transition-colors",
                        pathname === '/provider/profile' 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => router.push('/provider/profile')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {t('navigation.profile')}
                    </Button>
                    {provider?.business_type !== 'adoption' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 px-3 text-sm font-medium transition-colors",
                          pathname === '/provider/availability' 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => router.push('/provider/availability')}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {t('navigation.calendar')}
                      </Button>
                    )}
                  </>
                )}
                
                {/* Provider Notifications - positioned before avatar */}
                {isMounted && isProviderRoute && (
                  <NotificationsDropdown />
                )}
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || 'User'} />
                        <AvatarFallback>
                          {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || <User className="h-4 w-4" />}
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
                        {isMounted && isProviderRoute && (
                          <Badge variant="secondary" className="w-fit text-xs">
                            {t('navigation.serviceProvider')}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={isProviderRoute ? "/provider/dashboard/profile" : "/profile"}>
                        <User className="mr-2 h-4 w-4" />
                        <span>{t('navigation.profile')}</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* Environment switcher */}
                    {isProviderRoute ? (
                      <DropdownMenuItem onClick={() => router.push('/')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t('navigation.exitProvider')}</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={handleSwitchToProvider}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t('navigation.switchToProvider')}</span>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    {/* Customer-specific menu items (shown in customer environment) */}
                    {isMounted && !isProviderRoute && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/pets">
                            <Dog className="mr-2 h-4 w-4" />
                            <span>{t('navigation.myPets')}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/bookings">
                            <span>{t('navigation.myBookings')}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/favorites">
                            <Heart className="mr-2 h-4 w-4" />
                            <span>{t('navigation.favorites')}</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {/* Provider-specific menu items (shown in provider environment) */}
                    {isMounted && isProviderRoute && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/provider/dashboard">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>{t('navigation.providerManagement')}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/provider/dashboard/bookings">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>{t('navigation.manageBookings')}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/provider/dashboard/services">
                            <Star className="mr-2 h-4 w-4" />
                            <span>{t('navigation.myServices')}</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {/* Admin menu item */}
                    {user.user_metadata?.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('navigation.signOut')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Join as Provider Button */}
                <Button 
                  variant="outline" 
                  onClick={() => setProviderSignupOpen(true)}
                >
                  {t('navigation.joinAsProvider')}
                </Button>
                
                {/* Customer Menu */}
                <DropdownMenu open={customerMenuOpen} onOpenChange={setCustomerMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-black text-sm">?</span>
                        </div>
                        <span>{t('navigation.helpCenter')}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/auth/signin">
                        <span>{t('navigation.logInOrSignUp')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/how-it-works">
                        <span>{t('navigation.howItWorksNav')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/help">
                        <span>{t('navigation.helpCenterNav')}</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile menu button with Drawer */}
          <div className="md:hidden">
            <Drawer direction="right" open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t('navigation.toggleMobileMenu') || 'Perjungti mobiliąjį meniu'}
                  className="h-10 w-10 p-0"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-full w-80 max-w-sm bg-white">
                <DrawerHeader className="border-b bg-white">
                  <div className="flex items-center justify-between">
                    <DrawerTitle className="flex items-center">
                      <Image
                        src="/PetiFy.svg"
                        alt="PetiFy"
                        width={86}
                        height={29}
                        className="h-6 w-auto"
                        priority
                      />
                    </DrawerTitle>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <X className="h-5 w-5" />
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>
                
                <div className="flex-1 overflow-y-auto bg-gray-50">
                  {/* Mobile Search Bar */}
                  {showSearchBar && (
                    <div className="p-4 border-b border-gray-200 bg-white">
                      <NavigationSearch onFiltersClick={isSearchPage ? onFiltersClick : undefined} />
                    </div>
                  )}
                  
                  <div className="p-4 space-y-6">
                    {/* Categories moved to MobileBottomNav, keep hidden in drawer */}
                    {!hideServiceCategories && false && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          {t('navigation.serviceCategories')}
                        </h3>
                        {navigation.map((item) => (
                          <DrawerClose asChild key={item.name}>
                            <Link
                              href={item.href}
                              className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <div className="h-5 w-5 relative">
                                <Image
                                  src={item.icon}
                                  alt={item.shortName}
                                  fill
                                  sizes="20px"
                                  className="object-contain"
                                />
                              </div>
                              <span>{item.shortName}</span>
                            </Link>
                          </DrawerClose>
                        ))}
                      </div>
                    )}
                    
                    {user ? (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || 'User'} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || <User className="h-6 w-6" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-base font-semibold text-gray-900">
                              {user.user_metadata?.full_name || 'User'}
                            </div>
                            <div className="text-sm text-gray-500 truncate">{user.email}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <DrawerClose asChild>
                            <Link
                              href="/profile"
                              className="flex items-center space-x-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            >
                              <User className="h-5 w-5" />
                              <span>{t('navigation.profileMobile')}</span>
                            </Link>
                          </DrawerClose>
                          
                          {/* Dynamic environment switcher - always visible when authenticated (mobile) */}
                          {isProviderRoute ? (
                            <button
                              onClick={() => {
                                router.push('/')
                                setMobileMenuOpen(false)
                              }}
                              className="flex items-center space-x-3 w-full px-3 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            >
                              <Settings className="h-5 w-5" />
                              <span>{t('navigation.exitProvider')}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                handleSwitchToProvider()
                                setMobileMenuOpen(false)
                              }}
                              className="flex items-center space-x-3 w-full px-3 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            >
                              <Settings className="h-5 w-5" />
                              <span>{t('navigation.switchToProvider')}</span>
                            </button>
                          )}

                          {/* Customer-specific mobile menu items (customer environment) */}
                          {isMounted && !isProviderRoute && (
                            <>
                              <DrawerClose asChild>
                                <Link
                                  href="/pets"
                                  className="flex items-center space-x-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                >
                                  <Dog className="h-5 w-5" />
                                  <span>{t('navigation.myPetsMobile')}</span>
                                </Link>
                              </DrawerClose>
                              <DrawerClose asChild>
                                <Link
                                  href="/bookings"
                                  className="flex items-center space-x-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                >
                                  <Calendar className="h-5 w-5" />
                                  <span>{t('navigation.myBookingsMobile')}</span>
                                </Link>
                              </DrawerClose>
                              <DrawerClose asChild>
                                <Link
                                  href="/favorites"
                                  className="flex items-center space-x-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                >
                                  <Heart className="h-5 w-5" />
                                  <span>{t('navigation.favoritesMobile')}</span>
                                </Link>
                              </DrawerClose>
                            </>
                          )}
                          
                          {/* Provider-specific mobile menu items (provider environment) */}
                          {isMounted && isProviderRoute && (
                            <>
                              <DrawerClose asChild>
                                <Link
                                  href="/provider/dashboard"
                                  className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                                >
                                  <Settings className="h-5 w-5" />
                                  <span>{t('navigation.dashboard')}</span>
                                </Link>
                              </DrawerClose>
                              <DrawerClose asChild>
                                <Link
                                  href="/provider/dashboard/bookings"
                                  className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                                >
                                  <Calendar className="h-5 w-5" />
                                  <span>{t('navigation.bookings')}</span>
                                </Link>
                              </DrawerClose>
                              <DrawerClose asChild>
                                <Link
                                  href={provider?.business_type === 'adoption' ? '/provider/pet-ads' : '/provider/dashboard/services'}
                                  className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                                >
                                  <Star className="h-5 w-5" />
                                  <span>{provider?.business_type === 'adoption' ? 'Skelbimai' : t('navigation.services')}</span>
                                </Link>
                              </DrawerClose>
                              <DrawerClose asChild>
                                <Link
                                  href="/provider/profile"
                                  className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                                >
                                  <User className="h-5 w-5" />
                                  <span>{t('navigation.profile')}</span>
                                </Link>
                              </DrawerClose>
                              {provider?.business_type !== 'adoption' && (
                                <DrawerClose asChild>
                                  <Link
                                    href="/provider/availability"
                                    className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                                  >
                                    <Clock className="h-5 w-5" />
                                    <span>{t('navigation.calendar')}</span>
                                  </Link>
                                </DrawerClose>
                              )}
                            </>
                          )}
                          
                          <div className="pt-4 border-t border-gray-200">
                            <button 
                              className="flex items-center space-x-3 w-full px-3 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() => {
                                handleSignOut()
                                setMobileMenuOpen(false)
                              }}
                            >
                              <LogOut className="h-5 w-5" />
                              <span>{t('navigation.logOut')}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="space-y-2">
                          <DrawerClose asChild>
                            <Link
                              href="/auth/signin"
                              className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <User className="h-5 w-5" />
                              <span>{t('navigation.signIn')}</span>
                            </Link>
                          </DrawerClose>
                          <DrawerClose asChild>
                            <Link
                              href="/auth/signup"
                              className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <User className="h-5 w-5" />
                              <span>{t('navigation.signUp')}</span>
                            </Link>
                          </DrawerClose>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200">
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                            {t('navigation.helpCenter')}
                          </h3>
                          <div className="space-y-2">
                            <DrawerClose asChild>
                              <Link
                                href="/how-it-works"
                                className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                              >
                                <span>{t('navigation.howItWorksNav')}</span>
                              </Link>
                            </DrawerClose>
                            <DrawerClose asChild>
                              <Link
                                href="/help"
                                className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                              >
                                <span>{t('navigation.helpCenterNav')}</span>
                              </Link>
                            </DrawerClose>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </nav>

      {/* Provider Signup Modal/Drawer */}
      {isMobile ? (
        <Drawer open={providerSignupOpen} onOpenChange={setProviderSignupOpen} direction="bottom">
          <DrawerContent className="h-[90vh]">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="text-center text-lg font-semibold">
                {t('auth.signup.joinAsProvider')}
              </DrawerTitle>
            </DrawerHeader>
            
            <div className="flex-1 overflow-y-auto px-4 pb-4">
          
          <form onSubmit={handleProviderSignup} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputWithLabel
                id="fullName"
                label={t('auth.signup.fullName')}
                type="text"
                value={providerForm.fullName}
                onChange={(value) => handleInputChange('fullName', value)}
                required
                placeholder={t('auth.signup.enterFullName')}
              />

              <InputWithLabel
                id="email"
                label={t('auth.signup.emailAddress')}
                type="email"
                value={providerForm.email}
                onChange={(value) => handleInputChange('email', value)}
                required
                placeholder={t('auth.signup.enterEmail')}
              />
            </div>

            <SelectWithLabel
              id="serviceType"
              label={t('auth.signup.serviceType')}
              value={providerForm.serviceType} 
              onValueChange={(value) => handleInputChange('serviceType', value)}
              required
              placeholder={t('auth.signup.selectServiceType')}
              options={serviceTypes}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputWithLabel
                id="businessName"
                label={t('auth.signup.businessName')}
                type="text"
                value={providerForm.businessName}
                onChange={(value) => handleInputChange('businessName', value)}
                required
                placeholder={t('auth.signup.enterBusinessName')}
              />

              <InputWithLabel
                id="phone"
                label={t('auth.signup.phoneNumber')}
                type="tel"
                value={providerForm.phone}
                onChange={(value) => handleInputChange('phone', value)}
                required
                placeholder="(555) 123-4567"
              />
            </div>

            <AddressAutocomplete
              value={providerForm.address}
              onChange={(address) => handleInputChange('address', address)}
              onAddressSelect={(suggestion) => {
                handleInputChange('address', suggestion.address)
                handleInputChange('city', suggestion.city)
                handleInputChange('state', suggestion.state)
                handleInputChange('zipCode', suggestion.zipCode)
              }}
              placeholder={t('auth.signup.enterBusinessAddress')}
              label={t('auth.signup.businessAddress')}
              required
              className="mt-1"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputWithLabel
                id="city"
                label={t('auth.signup.city')}
                type="text"
                value={providerForm.city}
                onChange={(value) => handleInputChange('city', value)}
                required
                placeholder={t('auth.signup.enterCity')}
              />

              <InputWithLabel
                id="state"
                label={t('auth.signup.stateRegion')}
                type="text"
                value={providerForm.state}
                onChange={(value) => handleInputChange('state', value)}
                required
                placeholder={t('auth.signup.enterStateRegion')}
              />

              <InputWithLabel
                id="zipCode"
                label={t('auth.signup.postalCode')}
                type="text"
                value={providerForm.zipCode}
                onChange={(value) => handleInputChange('zipCode', value)}
                required
                placeholder={t('auth.signup.enterPostalCode')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputWithLabel
                  id="password"
                  label={t('auth.signup.createPassword')}
                  type="password"
                  value={providerForm.password}
                  onChange={(value) => handleInputChange('password', value)}
                  required
                  placeholder={t('auth.signup.createPassword')}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('auth.signup.passwordMinLength')}
                </p>
              </div>

              <InputWithLabel
                id="confirmPassword"
                label={t('auth.signup.confirmPassword')}
                type="password"
                value={providerForm.confirmPassword}
                onChange={(value) => handleInputChange('confirmPassword', value)}
                required
                placeholder={t('auth.signup.confirmYourPassword')}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{t('auth.signup.readyToStart')}</h4>
              <p className="text-sm text-gray-800">
                {t('auth.signup.readyToStartDesc')}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setProviderSignupOpen(false)}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading || !providerForm.fullName || !providerForm.email || !providerForm.serviceType || !providerForm.businessName || !providerForm.phone || !providerForm.address || !providerForm.city || !providerForm.state || !providerForm.zipCode || !providerForm.password || !providerForm.confirmPassword}
              >
                {loading ? t('auth.signup.creatingAccount') : t('auth.signup.createProviderAccount')}
              </Button>
            </div>
          </form>
            </div>
            
            <DrawerFooter className="pt-4">
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProviderSignupOpen(false)}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !providerForm.fullName || !providerForm.email || !providerForm.serviceType || !providerForm.businessName || !providerForm.phone || !providerForm.address || !providerForm.city || !providerForm.state || !providerForm.zipCode || !providerForm.password || !providerForm.confirmPassword}
                >
                  {loading ? t('auth.signup.creatingAccount') : t('auth.signup.createProviderAccount')}
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={providerSignupOpen} onOpenChange={setProviderSignupOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('auth.signup.joinAsProvider')}</DialogTitle>
            </DialogHeader>
          
          <form onSubmit={handleProviderSignup} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputWithLabel
                id="fullName"
                label={t('auth.signup.fullName')}
                type="text"
                value={providerForm.fullName}
                onChange={(value) => handleInputChange('fullName', value)}
                required
                placeholder={t('auth.signup.enterFullName')}
              />

              <InputWithLabel
                id="email"
                label={t('auth.signup.emailAddress')}
                type="email"
                value={providerForm.email}
                onChange={(value) => handleInputChange('email', value)}
                required
                placeholder={t('auth.signup.enterEmail')}
              />
            </div>

            <SelectWithLabel
              id="serviceType"
              label={t('auth.signup.serviceType')}
              value={providerForm.serviceType} 
              onValueChange={(value) => handleInputChange('serviceType', value)}
              required
              placeholder={t('auth.signup.selectServiceType')}
              options={serviceTypes}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputWithLabel
                id="businessName"
                label={t('auth.signup.businessName')}
                type="text"
                value={providerForm.businessName}
                onChange={(value) => handleInputChange('businessName', value)}
                required
                placeholder={t('auth.signup.enterBusinessName')}
              />

              <InputWithLabel
                id="phone"
                label={t('auth.signup.phoneNumber')}
                type="tel"
                value={providerForm.phone}
                onChange={(value) => handleInputChange('phone', value)}
                required
                placeholder="(555) 123-4567"
              />
            </div>

            <AddressAutocomplete
              value={providerForm.address}
              onChange={(address) => handleInputChange('address', address)}
              onAddressSelect={(suggestion) => {
                handleInputChange('address', suggestion.address)
                handleInputChange('city', suggestion.city)
                handleInputChange('state', suggestion.state)
                handleInputChange('zipCode', suggestion.zipCode)
              }}
              placeholder={t('auth.signup.enterBusinessAddress')}
              label={t('auth.signup.businessAddress')}
              required
              className="mt-1"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputWithLabel
                id="city"
                label={t('auth.signup.city')}
                type="text"
                value={providerForm.city}
                onChange={(value) => handleInputChange('city', value)}
                required
                placeholder={t('auth.signup.enterCity')}
              />

              <InputWithLabel
                id="state"
                label={t('auth.signup.stateRegion')}
                type="text"
                value={providerForm.state}
                onChange={(value) => handleInputChange('state', value)}
                required
                placeholder={t('auth.signup.enterStateRegion')}
              />

              <InputWithLabel
                id="zipCode"
                label={t('auth.signup.postalCode')}
                type="text"
                value={providerForm.zipCode}
                onChange={(value) => handleInputChange('zipCode', value)}
                required
                placeholder={t('auth.signup.enterPostalCode')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputWithLabel
                  id="password"
                  label={t('auth.signup.createPassword')}
                  type="password"
                  value={providerForm.password}
                  onChange={(value) => handleInputChange('password', value)}
                  required
                  placeholder={t('auth.signup.createPassword')}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('auth.signup.passwordMinLength')}
                </p>
              </div>

              <InputWithLabel
                id="confirmPassword"
                label={t('auth.signup.confirmPassword')}
                type="password"
                value={providerForm.confirmPassword}
                onChange={(value) => handleInputChange('confirmPassword', value)}
                required
                placeholder={t('auth.signup.confirmYourPassword')}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{t('auth.signup.readyToStart')}</h4>
              <p className="text-sm text-gray-800">
                {t('auth.signup.readyToStartDesc')}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setProviderSignupOpen(false)}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading || !providerForm.fullName || !providerForm.email || !providerForm.serviceType || !providerForm.businessName || !providerForm.phone || !providerForm.address || !providerForm.city || !providerForm.state || !providerForm.zipCode || !providerForm.password || !providerForm.confirmPassword}
              >
                {loading ? t('auth.signup.creatingAccount') : t('auth.signup.createProviderAccount')}
              </Button>
            </div>
          </form>
          </DialogContent>
        </Dialog>
      )}
    </header>
  )
}

export const Navigation = ({ hideServiceCategories = false, onFiltersClick }: NavigationProps) => {
  return <NavigationContent hideServiceCategories={hideServiceCategories} onFiltersClick={onFiltersClick} />
}
