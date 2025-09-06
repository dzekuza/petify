import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Scissors, 
  Stethoscope, 
  Home, 
  GraduationCap, 
  Footprints, 
  Heart,
  PawPrint
} from 'lucide-react'
import { ServiceCategory } from '@/types'

const categories = [
  {
    id: 'grooming' as ServiceCategory,
    name: 'Pet Grooming',
    description: 'Professional grooming services for your furry friends',
    icon: Scissors,
    color: 'bg-pink-100 text-pink-600',
    href: '/search?category=grooming',
    popular: true,
  },
  {
    id: 'veterinary' as ServiceCategory,
    name: 'Veterinary Care',
    description: 'Expert medical care and health checkups',
    icon: Stethoscope,
    color: 'bg-red-100 text-red-600',
    href: '/search?category=veterinary',
    popular: true,
  },
  {
    id: 'boarding' as ServiceCategory,
    name: 'Pet Boarding',
    description: 'Safe and comfortable overnight stays',
    icon: Home,
    color: 'bg-green-100 text-green-600',
    href: '/search?category=boarding',
    popular: false,
  },
  {
    id: 'training' as ServiceCategory,
    name: 'Pet Training',
    description: 'Professional training and behavior modification',
    icon: GraduationCap,
    color: 'bg-blue-100 text-blue-600',
    href: '/search?category=training',
    popular: true,
  },
  {
    id: 'walking' as ServiceCategory,
    name: 'Dog Walking',
    description: 'Daily exercise and outdoor adventures',
    icon: Footprints,
    color: 'bg-yellow-100 text-yellow-600',
    href: '/search?category=walking',
    popular: false,
  },
  {
    id: 'sitting' as ServiceCategory,
    name: 'Pet Sitting',
    description: 'In-home care while you\'re away',
    icon: Heart,
    color: 'bg-purple-100 text-purple-600',
    href: '/search?category=sitting',
    popular: false,
  },
]

export const ServiceCategories = () => {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Pet Services We Offer
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Find the perfect care for your pet with our comprehensive range of services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link key={category.id} href={category.href}>
                <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h3>
                          {category.popular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <PawPrint className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Don't see what you're looking for?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're constantly expanding our network of service providers. 
              Let us know what specific care your pet needs, and we'll help you find it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Browse All Services
                </button>
              </Link>
              <Link href="/contact">
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Request a Service
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
