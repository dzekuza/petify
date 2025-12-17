'use client'

import { ReactNode } from 'react'

interface OnboardingLayoutProps {
  children: ReactNode
  bottom: ReactNode
  maxWidth?: 'narrow' | 'wide' | 'xl'
}

export default function OnboardingLayout({ children, bottom, maxWidth = 'narrow' }: OnboardingLayoutProps) {
  let containerWidth = 'max-w-[720px]'
  if (maxWidth === 'wide') containerWidth = 'max-w-4xl'
  if (maxWidth === 'xl') containerWidth = 'max-w-6xl'
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <main className="flex-1 overflow-y-auto">
        <section className={`mx-auto w-full ${containerWidth} px-4 py-10 min-h-[calc(100vh-100px)]`}>{children}</section>
      </main>
      <div className="fixed bottom-0 left-0 right-0">
        {bottom}
      </div>
    </div>
  )
}


