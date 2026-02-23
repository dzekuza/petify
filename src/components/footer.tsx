import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'
import { t } from '@/lib/translations'

const footerLinks = {
  services: [
    { name: t('serviceCategories.grooming'), href: '/search?category=grooming' },
    { name: t('serviceCategories.veterinary'), href: '/search?category=veterinary' },
    { name: t('serviceCategories.boarding'), href: '/search?category=boarding' },
    { name: t('serviceCategories.training'), href: '/search?category=training' },
    { name: t('serviceCategories.adoption'), href: '/search?category=adoption' },
    { name: t('serviceCategories.sitting'), href: '/search?category=sitting' },
  ],
  company: [
    { name: t('navigation.howItWorksNav'), href: '/how-it-works' },
    { name: t('navigation.joinAsProvider'), href: '/provider/signup' },
    { name: 'Karjera', href: '/careers' },
    { name: 'Spauda', href: '/press' },
  ],
  support: [
    { name: t('navigation.helpCenter'), href: '/help' },
    { name: 'Saugumas', href: '/safety' },
    { name: 'Naudojimosi sąlygos', href: '/terms' },
    { name: 'Privatumo politika', href: '/privacy' },
    { name: 'Susisiekite', href: '/contact' },
  ],
}

export const Footer = () => {
  return (
    <footer className="bg-white text-foreground z-90">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <p className="text-muted-foreground mb-4">
              {t('landing.featuredProviders.subtitle')}
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@petify.lt</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+37067312315</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Vilnius, Lietuva</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('landing.serviceCategories.title')}</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Įmonė</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pagalba</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© 2024 Petify. Visos teisės saugomos.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Sąlygos
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Privatumas
              </Link>
              <Link
                href="/cookies"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Slapukai
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
