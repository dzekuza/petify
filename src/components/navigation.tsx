'use client'

import Link from 'next/link'
import { useState } from 'react'
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
import { Menu, X, Heart, User, Settings, LogOut, PawPrint, Calendar, Star, Dog } from 'lucide-react'
import Image from 'next/image'
import { NavigationSearch } from '@/components/navigation-search'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { t } from '@/lib/translations'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddressAutocomplete from '@/components/address-autocomplete'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer'

const serviceTypes = [
  { value: 'grooming', label: 'Gyvūnų šukavimo specialistas' },
  { value: 'veterinary', label: 'Veterinarijos gydytojas' },
  { value: 'boarding', label: 'Gyvūnų prieglauda' },
  { value: 'training', label: 'Gyvūnų treneris' },
  { value: 'walking', label: 'Šunų vedėjas' },
  { value: 'sitting', label: 'Gyvūnų prižiūrėtojas' },
]

interface NavigationProps {
  hideServiceCategories?: boolean
  onFiltersClick?: () => void
}

function NavigationContent({ hideServiceCategories = false, onFiltersClick }: NavigationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
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
      name: t('landing.hero.categories.walking'), 
      href: '/search?category=walking',
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
  const { user, signOut, signUp } = useAuth()

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
        window.location.href = '/provider/dashboard'
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

  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className={cn("flex items-center justify-between", showSearchBar ? "h-20" : "h-16")}>
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <PawPrint className="h-8 w-8 text-black" />
              <span className="text-xl font-bold text-gray-900">Petify</span>
            </Link>
          </div>

          {/* Search Bar - Show when on search page or category selected */}
          {showSearchBar && (
            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <NavigationSearch onFiltersClick={isSearchPage ? onFiltersClick : undefined} />
            </div>
          )}

          {/* Desktop Navigation */}
          {!hideServiceCategories && (
            <div className="hidden md:flex md:items-center md:space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-black transition-colors group"
                >
                  <div className="h-10 w-10 relative">
                    <Image
                      src={item.icon}
                      alt={item.shortName}
                      fill
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
                {user.user_metadata?.role !== 'provider' && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/favorites">
                      <Heart className="h-4 w-4 mr-2" />
                      {t('navigation.favorites')}
                    </Link>
                  </Button>
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
                        {user.user_metadata?.role === 'provider' && (
                          <Badge variant="secondary" className="w-fit text-xs">
                            {t('navigation.serviceProvider')}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>{t('navigation.profile')}</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* Customer-specific menu items */}
                    {user.user_metadata?.role !== 'provider' && (
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
                    
                    {/* Provider-specific menu items */}
                    {user.user_metadata?.role === 'provider' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/provider/dashboard">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>{t('navigation.providerManagement')}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/provider/bookings">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>{t('navigation.manageBookings')}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/provider/services">
                            <Star className="mr-2 h-4 w-4" />
                            <span>{t('navigation.myServices')}</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
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
                  aria-label={t('navigation.toggleMobileMenu')}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-full w-80">
                <DrawerHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <DrawerTitle className="flex items-center space-x-2">
                      <PawPrint className="h-6 w-6 text-black" />
                      <span className="text-lg font-bold text-gray-900">Petify</span>
                    </DrawerTitle>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="sm">
                        <X className="h-5 w-5" />
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>
                
                <div className="flex-1 overflow-y-auto">
                  {/* Mobile Search Bar */}
                  {showSearchBar && (
                    <div className="p-4 border-b border-gray-200">
                      <NavigationSearch onFiltersClick={isSearchPage ? onFiltersClick : undefined} />
                    </div>
                  )}
                  
                  <div className="p-4 space-y-4">
                    {!hideServiceCategories && (
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
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || 'User'} />
                            <AvatarFallback>
                              {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || <User className="h-5 w-5" />}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-base font-medium text-gray-800">
                              {user.user_metadata?.full_name || 'User'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <DrawerClose asChild>
                            <Link
                              href="/profile"
                              className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <User className="h-5 w-5" />
                              <span>{t('navigation.profileMobile')}</span>
                            </Link>
                          </DrawerClose>
                          
                          {/* Customer-specific mobile menu items */}
                          {user.user_metadata?.role !== 'provider' && (
                            <>
                              <DrawerClose asChild>
                                <Link
                                  href="/pets"
                                  className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                                >
                                  <Dog className="h-5 w-5" />
                                  <span>{t('navigation.myPetsMobile')}</span>
                                </Link>
                              </DrawerClose>
                              <DrawerClose asChild>
                                <Link
                                  href="/bookings"
                                  className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                                >
                                  <Calendar className="h-5 w-5" />
                                  <span>{t('navigation.myBookingsMobile')}</span>
                                </Link>
                              </DrawerClose>
                              <DrawerClose asChild>
                                <Link
                                  href="/favorites"
                                  className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                                >
                                  <Heart className="h-5 w-5" />
                                  <span>{t('navigation.favoritesMobile')}</span>
                                </Link>
                              </DrawerClose>
                            </>
                          )}
                          
                          {/* Provider-specific mobile menu items */}
                          {user.user_metadata?.role === 'provider' && (
                            <>
                              <DrawerClose asChild>
                                <Link
                                  href="/provider/dashboard"
                                  className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                                >
                                  <Settings className="h-5 w-5" />
                                  <span>{t('navigation.providerDashboardMobile')}</span>
                                </Link>
                              </DrawerClose>
                              <DrawerClose asChild>
                                <Link
                                  href="/provider/bookings"
                                  className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                                >
                                  <Calendar className="h-5 w-5" />
                                  <span>{t('navigation.manageBookingsMobile')}</span>
                                </Link>
                              </DrawerClose>
                              <DrawerClose asChild>
                                <Link
                                  href="/provider/services"
                                  className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                                >
                                  <Star className="h-5 w-5" />
                                  <span>{t('navigation.myServicesMobile')}</span>
                                </Link>
                              </DrawerClose>
                            </>
                          )}
                          
                          <div className="pt-2 border-t border-gray-200">
                            <button 
                              className="flex items-center space-x-3 w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
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

      {/* Provider Signup Modal */}
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
              <div>
                <Label htmlFor="fullName">{t('auth.signup.fullName')} *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={providerForm.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                  className="mt-1"
                  placeholder={t('auth.signup.enterFullName')}
                />
              </div>

              <div>
                <Label htmlFor="email">{t('auth.signup.emailAddress')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={providerForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="mt-1"
                  placeholder={t('auth.signup.enterEmail')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="serviceType">{t('auth.signup.serviceType')} *</Label>
              <Select 
                value={providerForm.serviceType} 
                onValueChange={(value) => handleInputChange('serviceType', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('auth.signup.selectServiceType')} />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">{t('auth.signup.businessName')} *</Label>
                <Input
                  id="businessName"
                  type="text"
                  value={providerForm.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  required
                  className="mt-1"
                  placeholder={t('auth.signup.enterBusinessName')}
                />
              </div>

              <div>
                <Label htmlFor="phone">{t('auth.signup.phoneNumber')} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={providerForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="mt-1"
                  placeholder="(555) 123-4567"
                />
              </div>
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
              <div>
                <Label htmlFor="city">{t('auth.signup.city')} *</Label>
                <Input
                  id="city"
                  type="text"
                  value={providerForm.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                  className="mt-1"
                  placeholder={t('auth.signup.enterCity')}
                />
              </div>

              <div>
                <Label htmlFor="state">{t('auth.signup.stateRegion')} *</Label>
                <Input
                  id="state"
                  type="text"
                  value={providerForm.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                  className="mt-1"
                  placeholder={t('auth.signup.enterStateRegion')}
                />
              </div>

              <div>
                <Label htmlFor="zipCode">{t('auth.signup.postalCode')} *</Label>
                <Input
                  id="zipCode"
                  type="text"
                  value={providerForm.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  required
                  className="mt-1"
                  placeholder={t('auth.signup.enterPostalCode')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">{t('auth.signup.createPassword')} *</Label>
                <Input
                  id="password"
                  type="password"
                  value={providerForm.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="mt-1"
                  placeholder={t('auth.signup.createPassword')}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('auth.signup.passwordMinLength')}
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t('auth.signup.confirmPassword')} *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={providerForm.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className="mt-1"
                  placeholder={t('auth.signup.confirmYourPassword')}
                />
              </div>
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
    </header>
  )
}

export const Navigation = ({ hideServiceCategories = false, onFiltersClick }: NavigationProps) => {
  return <NavigationContent hideServiceCategories={hideServiceCategories} onFiltersClick={onFiltersClick} />
}
