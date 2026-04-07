'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6">The page you are looking for does not exist.</p>
        <Link href="/" className="inline-flex items-center rounded-md bg-black px-4 py-2 text-white hover:bg-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
          Go home
        </Link>
      </div>
    </div>
  )
}


