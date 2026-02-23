import { t } from '@/lib/translations'
import type { ServiceCategory, NavigationItem } from './types'

export const serviceTypes: ServiceCategory[] = [
  { value: 'grooming', label: 'Gyvūnų šukavimo specialistas' },
  { value: 'veterinary', label: 'Veterinarijos gydytojas' },
  { value: 'boarding', label: 'Gyvūnų prieglauda' },
  { value: 'training', label: 'Gyvūnų treneris' },
  { value: 'adoption', label: 'Veislynai' },
  { value: 'sitting', label: 'Gyvūnų prižiūrėtojas' },
]

export const navigationItems: NavigationItem[] = [
  {
    name: t('landing.hero.categories.grooming'),
    href: '/search?category=grooming',
    icon: '/Animal_Care_Icon Background Removed.png',
    shortName: 'Kirpyklos',
  },
  {
    name: t('landing.hero.categories.training'),
    href: '/search?category=training',
    icon: '/Pet_Training_Icon Background Removed.png',
    shortName: 'Dresūra',
  },
  {
    name: t('landing.hero.categories.boarding'),
    href: '/search?category=boarding',
    icon: '/Pets_Pairing_Icon Background Removed.png',
    shortName: 'Poravimas',
  },
  {
    name: t('landing.hero.categories.veterinary'),
    href: '/search?category=veterinary',
    icon: '/Pet_Veterinary_Icon Background Removed.png',
    shortName: 'Veterinarijos',
  },
  {
    name: t('landing.hero.categories.adoption'),
    href: '/search?category=adoption',
    icon: '/Pet_Ads_Icon Background Removed.png',
    shortName: 'Veislynai',
  },
]
