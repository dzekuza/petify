import type { ServiceCategory } from '@/types'

export interface CategoryItem {
  id: ServiceCategory
  label: string
  icon: string // emoji for simplicity in MVP
  color: string
}

export const categories: CategoryItem[] = [
  { id: 'grooming', label: 'Kirpyklos', icon: '✂️', color: '#ec4899' },
  { id: 'veterinary', label: 'Veterinarija', icon: '🏥', color: '#3b82f6' },
  { id: 'boarding', label: 'Prieglauda', icon: '🏠', color: '#f59e0b' },
  { id: 'training', label: 'Dresūra', icon: '🎓', color: '#10b981' },
  { id: 'sitting', label: 'Priežiūra', icon: '🐾', color: '#8b5cf6' },
  { id: 'adoption', label: 'Veislynai', icon: '🐕', color: '#ef4444' },
]
