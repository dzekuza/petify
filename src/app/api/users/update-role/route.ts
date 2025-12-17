import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { authenticateRequest, isValidSelfAssignableRole } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await authenticateRequest(request)
    if (authResult.error) {
      return authResult.error
    }

    const { role } = await request.json()

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }

    // Validate role - users can only self-assign 'customer' or 'provider', never 'admin'
    if (!isValidSelfAssignableRole(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Allowed roles: customer, provider' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdmin()
    const userId = authResult.user!.id

    // Update user role in the users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user role:', updateError)
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
    }

    // Also update the user metadata in Supabase Auth
    const { error: metadataError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role }
    })

    if (metadataError) {
      console.error('Error updating user metadata:', metadataError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User role update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
