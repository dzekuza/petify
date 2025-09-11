import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createSupabaseAdmin()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all providers first
    const { data: providers, error: providersError } = await supabase
      .from('providers')
      .select(`
        id,
        user_id,
        business_name,
        business_type,
        description,
        services,
        location,
        contact_info,
        business_hours,
        price_range,
        availability,
        images,
        certifications,
        experience_years,
        status,
        is_verified,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (providersError) {
      console.error('Providers query error:', providersError)
      return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
    }

    // Get user info for each provider
    const providersWithUsers = await Promise.all(
      (providers || []).map(async (provider) => {
        const { data: userData } = await supabase
          .from('users')
          .select('id, email, full_name, role')
          .eq('id', provider.user_id)
          .single()

        return {
          ...provider,
          users: userData
        }
      })
    )

    return NextResponse.json(providersWithUsers)

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
