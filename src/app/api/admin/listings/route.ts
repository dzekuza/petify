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

    // Get all services with provider and business info
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select(`
        id,
        name,
        category,
        description,
        price,
        duration_minutes,
        max_pets,
        requirements,
        includes,
        images,
        is_active,
        created_at,
        updated_at,
        providers!inner (
          id,
          business_name,
          business_type,
          status,
          is_verified,
          users!inner (
            id,
            email,
            full_name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (servicesError) {
      console.error('Services query error:', servicesError)
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }

    return NextResponse.json(services || [])

  } catch (error) {
    console.error('Admin listings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
