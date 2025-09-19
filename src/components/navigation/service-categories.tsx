'use client'

import Link from 'next/link'
import Image from 'next/image'
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
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Image
                src={item.icon}
                alt={item.name}
                width={40}
                height={40}
                className="mb-2"
              />
              <span className="text-sm font-medium text-center">{item.shortName}</span>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-xl font-semibold">Paslaugų kategorijos</h2>
      <div className="grid grid-cols-5 gap-6">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200 group"
          >
            <div className="mb-4 p-4 bg-gray-50 rounded-full group-hover:bg-blue-50 transition-colors">
              <Image
                src={item.icon}
                alt={item.name}
                width={48}
                height={48}
              />
            </div>
            <span className="text-sm font-medium text-center text-gray-900 group-hover:text-blue-600 transition-colors">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
