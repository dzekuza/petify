import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('provider_id')
    const customerId = searchParams.get('customer_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('bookings')
      .select(`
        *,
        customer:users!bookings_customer_id_fkey(id, full_name, email, phone),
        provider:providers(id, business_name, user_id),
        service:services(id, name, price, description),
        pet:pets(id, name, species, breed, age, special_needs)
      `)
      .order('created_at', { ascending: false })

    // Filter by provider
    if (providerId) {
      query = query.eq('provider_id', providerId)
    }

    // Filter by customer
    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status)
    }

    const { data: bookings, error } = await query

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookings })

  } catch (error) {
    console.error('Error in bookings API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
