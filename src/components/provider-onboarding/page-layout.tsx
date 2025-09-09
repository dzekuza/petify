'use client'

import { ReactNode } from 'react'

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`bg-white relative size-full min-h-screen flex flex-col ${className}`}>
      {children}
    </div>
  )
}

interface PageContentProps {
  children: ReactNode
  className?: string
}

export function PageContent({ children, className = '' }: PageContentProps) {
  return (
    <div className={`flex-1 overflow-y-auto ${className}`}>
      <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 py-8 pb-20">
        {children}
      </div>
    </div>
  )
}
