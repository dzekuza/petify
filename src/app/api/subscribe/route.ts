import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()
  const { error } = await supabase
    .from('waitlist_subscriptions')
    .insert({ email: email.trim().toLowerCase() })

  // Ignore duplicate — treat it as success so we don't leak info
  if (error && !error.message.includes('duplicate')) {
    console.error('[subscribe] insert error:', error.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
