'use client'

import Link from 'next/link'
import { navigationItems } from './constants'

interface ServiceCategoriesProps {
  isMobile?: boolean
  className?: string
}

export function ServiceCategories({ isMobile = false, className }: ServiceCategoriesProps) {
  if (isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold">Paslaugų kategorijos</h3>
        <div className="grid grid-cols-2 gap-4">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-center">{item.shortName}</span>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-xl font-semibold">Paslaugų kategorijos</h2>
      <div className="grid grid-cols-5 gap-6">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center p-6 border border-border rounded-xl hover:bg-muted hover:shadow-md transition-all duration-200 group"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted group-hover:bg-blue-50 transition-colors">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-center text-foreground group-hover:text-blue-600 transition-colors">
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
