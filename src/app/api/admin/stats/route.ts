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

    // Get comprehensive stats
    const [
      { count: totalUsers },
      { count: totalProviders },
      { count: totalBookings },
      { data: revenueData },
      { count: activeProviders },
      { count: pendingProviders },
      { data: businessTypeData },
      { data: monthlyRevenueData },
      { count: totalPets },
      { count: totalServices }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('providers').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('total_price').eq('payment_status', 'paid'),
      supabase.from('providers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('providers').select('*', { count: 'exact', head: true }).eq('status', 'pending_verification'),
      supabase.from('providers').select('business_type').not('business_type', 'is', null),
      supabase.from('bookings').select('total_price, created_at').eq('payment_status', 'paid').gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      supabase.from('pets').select('*', { count: 'exact', head: true }),
      supabase.from('services').select('*', { count: 'exact', head: true })
    ])

    const totalRevenue = revenueData?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0
    const monthlyRevenue = monthlyRevenueData?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0

    // Calculate business type distribution
    const businessTypeStats = businessTypeData?.reduce((acc, provider) => {
      const type = provider.business_type || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalProviders: totalProviders || 0,
      totalBookings: totalBookings || 0,
      totalRevenue,
      monthlyRevenue,
      activeProviders: activeProviders || 0,
      pendingProviders: pendingProviders || 0,
      totalPets: totalPets || 0,
      totalServices: totalServices || 0,
      businessTypeStats
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
