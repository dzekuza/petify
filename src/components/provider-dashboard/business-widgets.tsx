'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Scissors, 
  Stethoscope, 
  GraduationCap, 
  Heart, 
  Calendar, 
  Users, 
  Star,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface BusinessWidgetProps {
  businessType: string
  stats: any
  providerData: any
}

const getBusinessTypeInfo = (businessType: string) => {
  switch (businessType) {
    case 'grooming':
      return {
        icon: Scissors,
        title: 'Grooming Dashboard',
        description: 'Manage your grooming services and appointments',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      }
    case 'veterinary':
      return {
        icon: Stethoscope,
        title: 'Veterinary Dashboard',
        description: 'Manage patient care and medical records',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      }
    case 'training':
      return {
        icon: GraduationCap,
        title: 'Training Dashboard',
        description: 'Track training sessions and progress',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      }
    case 'adoption':
      return {
        icon: Heart,
        title: 'Adoption Dashboard',
        description: 'Manage pet listings and adoption applications',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-200'
      }
    case 'boarding':
      return {
        icon: Users,
        title: 'Boarding Dashboard',
        description: 'Manage overnight pet care and accommodation',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      }
    default:
      return {
        icon: Users,
        title: 'Service Dashboard',
        description: 'Manage your pet services',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      }
  }
}

export function BusinessTypeHeader({ businessType }: { businessType: string }) {
  const info = getBusinessTypeInfo(businessType)
  const Icon = info.icon

  return (
    <Card className={`${info.borderColor} ${info.bgColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${info.bgColor}`}>
            <Icon className={`h-6 w-6 ${info.color}`} />
          </div>
          <div>
            <CardTitle className={`text-xl ${info.color}`}>
              {info.title}
            </CardTitle>
            <CardDescription>
              {info.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

export function GroomingWidget({ stats, providerData }: BusinessWidgetProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Scissors className="h-5 w-5 mr-2 text-blue-600" />
            Today's Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Scheduled</span>
              <Badge variant="outline">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <Badge variant="outline" className="text-green-600">2</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <Badge variant="outline" className="text-yellow-600">1</Badge>
            </div>
          </div>
          <Button size="sm" className="w-full mt-4" asChild>
            <Link href="/provider/dashboard/calendar">
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Service Packages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Basic Grooming</span>
              <Badge variant="secondary">€25</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Full Service</span>
              <Badge variant="secondary">€45</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Premium Package</span>
              <Badge variant="secondary">€65</Badge>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full mt-4" asChild>
            <Link href="/provider/services">
              <Plus className="h-4 w-4 mr-2" />
              Manage Services
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function VeterinaryWidget({ stats, providerData }: BusinessWidgetProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Stethoscope className="h-5 w-5 mr-2 text-green-600" />
            Today's Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Appointments</span>
              <Badge variant="outline">5</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Emergency Cases</span>
              <Badge variant="outline" className="text-red-600">1</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Follow-ups</span>
              <Badge variant="outline" className="text-blue-600">2</Badge>
            </div>
          </div>
          <Button size="sm" className="w-full mt-4" asChild>
            <Link href="/provider/dashboard/calendar">
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Medical Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Patients</span>
              <Badge variant="secondary">24</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vaccinations Due</span>
              <Badge variant="outline" className="text-yellow-600">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Prescriptions</span>
              <Badge variant="outline" className="text-blue-600">7</Badge>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full mt-4" asChild>
            <Link href="/provider/patients">
              <Users className="h-4 w-4 mr-2" />
              View Patients
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function TrainingWidget({ stats, providerData }: BusinessWidgetProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
            Training Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Today's Sessions</span>
              <Badge variant="outline">4</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Group Classes</span>
              <Badge variant="outline" className="text-blue-600">2</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Private Sessions</span>
              <Badge variant="outline" className="text-green-600">2</Badge>
            </div>
          </div>
          <Button size="sm" className="w-full mt-4" asChild>
            <Link href="/provider/dashboard/calendar">
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Training Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Basic Obedience</span>
              <Badge variant="secondary">€80</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Behavior Modification</span>
              <Badge variant="secondary">€120</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Advanced Training</span>
              <Badge variant="secondary">€150</Badge>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full mt-4" asChild>
            <Link href="/provider/services">
              <Plus className="h-4 w-4 mr-2" />
              Manage Programs
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdoptionWidget({ stats, providerData }: BusinessWidgetProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Heart className="h-5 w-5 mr-2 text-pink-600" />
            Pet Listings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Listings</span>
              <Badge variant="outline">8</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Approval</span>
              <Badge variant="outline" className="text-yellow-600">2</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recently Adopted</span>
              <Badge variant="outline" className="text-green-600">3</Badge>
            </div>
          </div>
          <Button size="sm" className="w-full mt-4" asChild>
            <Link href="/provider/pet-ads">
              <Plus className="h-4 w-4 mr-2" />
              Manage Listings
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Adoption Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Applications</span>
              <Badge variant="outline" className="text-blue-600">5</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Under Review</span>
              <Badge variant="outline" className="text-yellow-600">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approved</span>
              <Badge variant="outline" className="text-green-600">2</Badge>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full mt-4" asChild>
            <Link href="/provider/applications">
              <CheckCircle className="h-4 w-4 mr-2" />
              Review Applications
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function BoardingWidget({ stats, providerData }: BusinessWidgetProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2 text-orange-600" />
            Current Guests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Check-ins Today</span>
              <Badge variant="outline">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Check-outs Today</span>
              <Badge variant="outline" className="text-green-600">2</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Guests</span>
              <Badge variant="outline" className="text-blue-600">6</Badge>
            </div>
          </div>
          <Button size="sm" className="w-full mt-4" asChild>
            <Link href="/provider/dashboard/calendar">
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-orange-600" />
            Boarding Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Standard Boarding</span>
              <Badge variant="secondary">€35/night</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Premium Suite</span>
              <Badge variant="secondary">€55/night</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Day Care</span>
              <Badge variant="secondary">€25/day</Badge>
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full mt-4" asChild>
            <Link href="/provider/services">
              <Plus className="h-4 w-4 mr-2" />
              Manage Services
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function BusinessSpecificWidget({ businessType, stats, providerData }: BusinessWidgetProps) {
  switch (businessType) {
    case 'grooming':
      return <GroomingWidget businessType={businessType} stats={stats} providerData={providerData} />
    case 'veterinary':
      return <VeterinaryWidget businessType={businessType} stats={stats} providerData={providerData} />
    case 'training':
      return <TrainingWidget businessType={businessType} stats={stats} providerData={providerData} />
    case 'adoption':
      return <AdoptionWidget businessType={businessType} stats={stats} providerData={providerData} />
    case 'boarding':
      return <BoardingWidget businessType={businessType} stats={stats} providerData={providerData} />
    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle>General Services</CardTitle>
            <CardDescription>Manage your pet services</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/provider/services">
                <Plus className="h-4 w-4 mr-2" />
                Manage Services
              </Link>
            </Button>
          </CardContent>
        </Card>
      )
  }
}
