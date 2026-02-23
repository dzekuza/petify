import { Scissors, GraduationCap, HeartHandshake, Stethoscope, Home } from 'lucide-react'
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
    icon: Scissors,
    shortName: 'Kirpyklos',
  },
  {
    name: t('landing.hero.categories.training'),
    href: '/search?category=training',
    icon: GraduationCap,
    shortName: 'Dresūra',
  },
  {
    name: t('landing.hero.categories.boarding'),
    href: '/search?category=boarding',
    icon: HeartHandshake,
    shortName: 'Poravimas',
  },
  {
    name: t('landing.hero.categories.veterinary'),
    href: '/search?category=veterinary',
    icon: Stethoscope,
    shortName: 'Veterinarijos',
  },
  {
    name: t('landing.hero.categories.adoption'),
    href: '/search?category=adoption',
    icon: Home,
    shortName: 'Veislynai',
  },
]
