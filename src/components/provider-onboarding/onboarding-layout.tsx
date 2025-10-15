'use client'

import { ReactNode } from 'react'

interface OnboardingLayoutProps {
  children: ReactNode
  bottom: ReactNode
  maxWidth?: 'narrow' | 'wide'
}

export default function OnboardingLayout({ children, bottom, maxWidth = 'narrow' }: OnboardingLayoutProps) {
  const containerWidth = maxWidth === 'wide' ? 'max-w-4xl' : 'max-w-[720px]'
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <main className="flex-1 overflow-y-auto">
        <section className={`mx-auto w-full ${containerWidth} px-4 py-10`}>{children}</section>
      </main>
      <div className="fixed bottom-0 left-0 right-0">
        {bottom}
      </div>
    </div>
  )
}


