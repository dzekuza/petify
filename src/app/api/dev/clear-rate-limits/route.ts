import { NextRequest, NextResponse } from 'next/server'
import { clearAllRateLimits } from '@/lib/sanitization'

// Development-only endpoint to clear rate limits
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    clearAllRateLimits()
    return NextResponse.json({ message: 'Rate limits cleared successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error clearing rate limits:', error)
    return NextResponse.json({ error: 'Failed to clear rate limits' }, { status: 500 })
  }
}
