import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin(request)
    if (authResult.error) {
      return authResult.error
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user role to admin
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to update user role:', updateError)
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
    }

    // Also update the user metadata in Supabase Auth
    const { error: metadataError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { role: 'admin' }
    })

    if (metadataError) {
      console.error('Failed to update user metadata:', metadataError)
    }

    return NextResponse.json({
      success: true,
      message: `User ${user.full_name} (${user.email}) has been promoted to admin`,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: 'admin'
      }
    })

  } catch (error) {
    console.error('Error in promote-to-admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
