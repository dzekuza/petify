import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json()
    
    // Get the user from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Update user role in the users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user role:', updateError)
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
    }

    // Also update the user metadata in Supabase Auth
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { role }
    })

    if (metadataError) {
      console.error('Error updating user metadata:', metadataError)
      // Don't fail the request if metadata update fails, as the main role update succeeded
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User role update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
