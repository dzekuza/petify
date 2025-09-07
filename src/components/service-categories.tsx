import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Scissors, 
  Stethoscope, 
  Home, 
  GraduationCap, 
  Footprints, 
  Heart
} from 'lucide-react'
import { ServiceCategory } from '@/types'
import { t } from '@/lib/translations'

export const ServiceCategories = () => {
  const categories = [
    {
      id: 'grooming' as ServiceCategory,
      name: t('landing.serviceCategories.grooming.name'),
      description: t('landing.serviceCategories.grooming.description'),
      icon: Scissors,
      color: 'bg-pink-100 text-pink-600',
      href: '/search?category=grooming',
      popular: true,
    },
    {
      id: 'veterinary' as ServiceCategory,
      name: t('landing.serviceCategories.veterinary.name'),
      description: t('landing.serviceCategories.veterinary.description'),
      icon: Stethoscope,
      color: 'bg-red-100 text-red-600',
      href: '/search?category=veterinary',
      popular: true,
    },
    {
      id: 'boarding' as ServiceCategory,
      name: t('landing.serviceCategories.boarding.name'),
      description: t('landing.serviceCategories.boarding.description'),
      icon: Home,
      color: 'bg-green-100 text-green-600',
      href: '/search?category=boarding',
      popular: false,
    },
    {
      id: 'training' as ServiceCategory,
      name: t('landing.serviceCategories.training.name'),
      description: t('landing.serviceCategories.training.description'),
      icon: GraduationCap,
      color: 'bg-blue-100 text-blue-600',
      href: '/search?category=training',
      popular: true,
    },
    {
      id: 'walking' as ServiceCategory,
      name: t('landing.serviceCategories.walking.name'),
      description: t('landing.serviceCategories.walking.description'),
      icon: Footprints,
      color: 'bg-yellow-100 text-yellow-600',
      href: '/search?category=walking',
      popular: false,
    },
    {
      id: 'sitting' as ServiceCategory,
      name: t('landing.serviceCategories.sitting.name'),
      description: t('landing.serviceCategories.sitting.description'),
      icon: Heart,
      color: 'bg-purple-100 text-purple-600',
      href: '/search?category=sitting',
      popular: false,
    },
  ]
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('landing.serviceCategories.title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t('landing.serviceCategories.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link key={category.id} href={category.href}>
                <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h3>
                          {category.popular && (
                            <Badge variant="secondary" className="text-xs">
                              {t('landing.serviceCategories.popular')}
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('landing.serviceCategories.cta.title')}
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('landing.serviceCategories.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  {t('landing.serviceCategories.cta.browseAll')}
                </button>
              </Link>
              <Link href="/contact">
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  {t('landing.serviceCategories.cta.requestService')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
