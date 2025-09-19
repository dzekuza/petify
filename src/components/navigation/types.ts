export interface NavigationProps {
  hideServiceCategories?: boolean
  onFiltersClick?: () => void
}

export interface ServiceCategory {
  value: string
  label: string
}

export interface NavigationItem {
  name: string
  href: string
  icon: string
  shortName: string
}

export interface ProviderForm {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  serviceType: string
  businessName: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
}
