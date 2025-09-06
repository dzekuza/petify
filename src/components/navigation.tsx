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
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddressAutocomplete from '@/components/address-autocomplete'

const navigation = [
  { name: 'Find Services', href: '/search' },
  { name: 'How it Works', href: '/how-it-works' },
]

const serviceTypes = [
  { value: 'grooming', label: 'Pet Groomer' },
  { value: 'veterinary', label: 'Veterinarian' },
  { value: 'boarding', label: 'Pet Boarding' },
  { value: 'training', label: 'Pet Trainer' },
  { value: 'walking', label: 'Dog Walker' },
  { value: 'sitting', label: 'Pet Sitter' },
]

export const Navigation = () => {
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

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleProviderSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (providerForm.password !== providerForm.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (providerForm.password.length < 6) {
      setError('Password must be at least 6 characters')
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
      setError('An error occurred. Please try again.')
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
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <PawPrint className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">PetServices</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                {/* Customer-specific actions */}
                {user.user_metadata?.role !== 'provider' && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/favorites">
                      <Heart className="h-4 w-4 mr-2" />
                      Favorites
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
                            Provider
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* Customer-specific menu items */}
                    {user.user_metadata?.role !== 'provider' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/pets">
                            <Dog className="mr-2 h-4 w-4" />
                            <span>My Pets</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/bookings">
                            <span>My Bookings</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/favorites">
                            <Heart className="mr-2 h-4 w-4" />
                            <span>Favorites</span>
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
                            <span>Provider Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/provider/bookings">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Manage Bookings</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/provider/services">
                            <Star className="mr-2 h-4 w-4" />
                            <span>My Services</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
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
                  Join as Provider
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
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm">?</span>
                        </div>
                        <span>Help Center</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/auth/signin">
                        <span>Log in or sign up</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/how-it-works">
                        <span>How it works</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/help">
                        <span>Help Center</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMobileMenuToggle}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          'md:hidden',
          mobileMenuOpen ? 'block' : 'hidden'
        )}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || 'User'} />
                      <AvatarFallback>
                        {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user.user_metadata?.full_name || 'User'}
                    </div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  {/* Customer-specific mobile menu items */}
                  {user.user_metadata?.role !== 'provider' && (
                    <>
                      <Link
                        href="/pets"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Pets
                      </Link>
                      <Link
                        href="/bookings"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Bookings
                      </Link>
                      <Link
                        href="/favorites"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Favorites
                      </Link>
                    </>
                  )}
                  
                  {/* Provider-specific mobile menu items */}
                  {user.user_metadata?.role === 'provider' && (
                    <>
                      <Link
                        href="/provider/dashboard"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Provider Dashboard
                      </Link>
                      <Link
                        href="/provider/bookings"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Manage Bookings
                      </Link>
                      <Link
                        href="/provider/services"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Services
                      </Link>
                    </>
                  )}
                  
                  <button 
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                  >
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="px-2 space-y-1">
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Provider Signup Modal */}
      <Dialog open={providerSignupOpen} onOpenChange={setProviderSignupOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Join as a Pet Service Provider</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleProviderSignup} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={providerForm.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={providerForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select 
                value={providerForm.serviceType} 
                onValueChange={(value) => handleInputChange('serviceType', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your service type" />
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
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  type="text"
                  value={providerForm.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
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
              placeholder="Enter your business address"
              label="Business Address"
              required
              className="mt-1"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  type="text"
                  value={providerForm.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Enter your city"
                />
              </div>

              <div>
                <Label htmlFor="state">State/Region *</Label>
                <Input
                  id="state"
                  type="text"
                  value={providerForm.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Enter your state/region"
                />
              </div>

              <div>
                <Label htmlFor="zipCode">Postal Code *</Label>
                <Input
                  id="zipCode"
                  type="text"
                  value={providerForm.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Enter postal code"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={providerForm.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Create a password"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={providerForm.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Ready to Start!</h4>
              <p className="text-sm text-blue-800">
                Once you create your account, you'll have immediate access to your provider dashboard 
                and can start accepting bookings right away.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setProviderSignupOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !providerForm.fullName || !providerForm.email || !providerForm.serviceType || !providerForm.businessName || !providerForm.phone || !providerForm.address || !providerForm.city || !providerForm.state || !providerForm.zipCode || !providerForm.password || !providerForm.confirmPassword}
              >
                {loading ? 'Creating Account...' : 'Create Provider Account'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}
