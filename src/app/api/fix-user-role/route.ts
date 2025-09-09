import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    
    // Update user role to provider
    const { error } = await supabase
      .from('users')
      .update({ role: 'provider' })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user role:', error)
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'User role updated to provider' })
  } catch (error) {
    console.error('Error in fix-user-role API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
