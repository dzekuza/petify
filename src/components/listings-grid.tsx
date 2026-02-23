'use client'

import Link from 'next/link'
import { ServiceProvider } from '@/types'
import { cn } from '@/lib/utils'
import { ProviderCard } from './provider-card'

interface ListingsGridProps {
  title: string
  providers: ServiceProvider[]
  showViewAll?: boolean
  className?: string
  gridCols?: string
}

export const ListingsGrid = ({
  title,
  providers,
  showViewAll = true,
  className,
  gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
}: ListingsGridProps) => {
  if (providers.length === 0) {
    return null
  }

  return (
    <div className={cn("w-full", className)}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {showViewAll && (
            <Link
              href="/search"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Peržiūrėti visus →
            </Link>
          )}
        </div>
      )}

      <div className={cn("grid gap-2", gridCols)}>
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} variant="grid" />
        ))}
      </div>
    </div>
  )
}
