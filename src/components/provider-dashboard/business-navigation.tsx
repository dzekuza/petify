'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Scissors, 
  Stethoscope, 
  GraduationCap, 
  Heart, 
  Users,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  Bell,
  User
} from 'lucide-react'
import { dashboardApi } from '@/lib/dashboard'
import { useAuth } from '@/contexts/auth-context'

interface BusinessNavigationProps {
  businessType: string
}

const getBusinessNavigation = (businessType: string) => {
  const baseItems = [
    { href: '/provider/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/provider/dashboard/bookings', label: 'Bookings', icon: Calendar },
    { href: '/provider/notifications', label: 'Notifications', icon: Bell },
    { href: '/provider/dashboard/profile', label: 'Profile', icon: User },
    { href: '/provider/dashboard/services', label: 'Services', icon: Settings }
  ]

  switch (businessType) {
    case 'grooming':
      return [
        { href: '/provider/dashboard', label: 'Dashboard', icon: BarChart3 },
        { href: '/provider/dashboard/bookings', label: 'Appointments', icon: Calendar },
        { href: '/provider/dashboard/services', label: 'Grooming Services', icon: Scissors },
        { href: '/provider/dashboard/calendar', label: 'Schedule', icon: Calendar },
        { href: '/provider/equipment', label: 'Equipment', icon: Settings },
        { href: '/provider/notifications', label: 'Notifications', icon: Bell },
        { href: '/provider/dashboard/settings', label: 'Settings', icon: Settings },
        { href: '/provider/dashboard/profile', label: 'Profile', icon: User }
      ]
    case 'veterinary':
      return [
        { href: '/provider/dashboard', label: 'Dashboard', icon: BarChart3 },
        { href: '/provider/patients', label: 'Patients', icon: Users },
        { href: '/provider/dashboard/bookings', label: 'Appointments', icon: Calendar },
        { href: '/provider/medical-records', label: 'Medical Records', icon: FileText },
        { href: '/provider/prescriptions', label: 'Prescriptions', icon: FileText },
        { href: '/provider/dashboard/services', label: 'Services', icon: Stethoscope },
        { href: '/provider/notifications', label: 'Notifications', icon: Bell },
        { href: '/provider/dashboard/settings', label: 'Settings', icon: Settings },
        { href: '/provider/dashboard/profile', label: 'Profile', icon: User }
      ]
    case 'training':
      return [
        { href: '/provider/dashboard', label: 'Dashboard', icon: BarChart3 },
        { href: '/provider/sessions', label: 'Training Sessions', icon: Calendar },
        { href: '/provider/programs', label: 'Training Programs', icon: GraduationCap },
        { href: '/provider/progress', label: 'Progress Reports', icon: FileText },
        { href: '/provider/clients', label: 'Clients', icon: Users },
        { href: '/provider/dashboard/services', label: 'Services', icon: Settings },
        { href: '/provider/notifications', label: 'Notifications', icon: Bell },
        { href: '/provider/dashboard/settings', label: 'Settings', icon: Settings },
        { href: '/provider/dashboard/profile', label: 'Profile', icon: User }
      ]
      case 'adoption':
        return [
          { href: '/provider/dashboard', label: 'Dashboard', icon: BarChart3 },
          { href: '/provider/pet-ads', label: 'Pet Listings', icon: Heart },
          { href: '/provider/applications', label: 'Applications', icon: FileText },
          { href: '/provider/adoption-process', label: 'Breeding Process', icon: Users },
          { href: '/provider/dashboard/services', label: 'Pet Types', icon: Settings },
          { href: '/provider/notifications', label: 'Notifications', icon: Bell },
          { href: '/provider/dashboard/settings', label: 'Settings', icon: Settings },
          { href: '/provider/dashboard/profile', label: 'Profile', icon: User }
        ]
    case 'boarding':
      return [
        { href: '/provider/dashboard', label: 'Dashboard', icon: BarChart3 },
        { href: '/provider/guests', label: 'Current Guests', icon: Users },
        { href: '/provider/dashboard/bookings', label: 'Reservations', icon: Calendar },
        { href: '/provider/facilities', label: 'Facilities', icon: Settings },
        { href: '/provider/dashboard/services', label: 'Services', icon: Settings },
        { href: '/provider/notifications', label: 'Notifications', icon: Bell },
        { href: '/provider/dashboard/settings', label: 'Settings', icon: Settings },
        { href: '/provider/dashboard/profile', label: 'Profile', icon: User }
      ]
    default:
      return baseItems
  }
}

export function BusinessNavigation({ businessType }: BusinessNavigationProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [providerData, setProviderData] = useState<any>(null)

  useEffect(() => {
    const fetchProviderData = async () => {
      if (user?.id) {
        try {
          const provider = await dashboardApi.getProviderByUserId(user.id)
          setProviderData(provider)
        } catch (error) {
          console.error('Error fetching provider data:', error)
        }
      }
    }
    fetchProviderData()
  }, [user?.id])

  const navigationItems = getBusinessNavigation(businessType)

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Business Type Badge */}
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="capitalize">
              {businessType} Provider
            </Badge>
            {providerData?.business_name && (
              <span className="text-sm text-muted-foreground">
                {providerData.business_name}
              </span>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={isActive ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-foreground"}
                >
                  <Link href={item.href} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="outline" size="sm">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BusinessQuickActions({ businessType }: BusinessNavigationProps) {
  const getQuickActions = (businessType: string) => {
    switch (businessType) {
      case 'grooming':
        return [
          { href: '/provider/dashboard/calendar', label: 'Schedule Appointment', icon: Calendar },
          { href: '/provider/dashboard/services', label: 'Add Service', icon: Scissors },
          { href: '/provider/equipment', label: 'Manage Equipment', icon: Settings }
        ]
      case 'veterinary':
        return [
          { href: '/provider/patients', label: 'Add Patient', icon: Users },
          { href: '/provider/medical-records', label: 'New Record', icon: FileText },
          { href: '/provider/bookings', label: 'Schedule Visit', icon: Calendar }
        ]
      case 'training':
        return [
          { href: '/provider/sessions', label: 'New Session', icon: Calendar },
          { href: '/provider/programs', label: 'Create Program', icon: GraduationCap },
          { href: '/provider/clients', label: 'Add Client', icon: Users }
        ]
      case 'adoption':
        return [
          { href: '/provider/pet-ads', label: 'List Pet', icon: Heart },
          { href: '/provider/applications', label: 'Review Applications', icon: FileText },
          { href: '/provider/adoption-process', label: 'Process Sales', icon: Users }
        ]
      case 'boarding':
        return [
          { href: '/provider/guests', label: 'Check-in Guest', icon: Users },
          { href: '/provider/bookings', label: 'New Reservation', icon: Calendar },
          { href: '/provider/facilities', label: 'Manage Facilities', icon: Settings }
        ]
      default:
        return [
          { href: '/provider/dashboard/services', label: 'Manage Services', icon: Settings },
          { href: '/provider/dashboard/bookings', label: 'View Bookings', icon: Calendar }
        ]
    }
  }

  const quickActions = getQuickActions(businessType)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {quickActions.map((action) => {
        const Icon = action.icon
        return (
          <Button key={action.href} variant="outline" asChild className="h-auto p-4">
            <Link href={action.href} className="flex flex-col items-center space-y-2">
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
