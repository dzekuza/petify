import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('provider_id')
    const customerId = searchParams.get('customer_id')
    const status = searchParams.get('status')
    
    const supabaseAdmin = createSupabaseAdmin()
    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        customer:users!customer_id(id, full_name, email, phone),
        provider:providers(id, business_name, user_id),
        service:services(id, name, price, description),
        pet:pets(id, name, species, breed, age, profile_picture)
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

    console.log('Supabase query result:', { bookings, error, customerId })

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    // Transform the data to match frontend expectations
    const transformedBookings = bookings?.map(booking => ({
      id: booking.id,
      customerId: booking.customer_id,
      providerId: booking.provider_id,
      serviceId: booking.service_id,
      petId: booking.pet_id,
      date: booking.booking_date, // Transform booking_date to date
      timeSlot: {
        start: booking.start_time,
        end: booking.end_time,
        available: true
      },
      status: booking.status,
      totalPrice: parseFloat(booking.total_price),
      notes: booking.special_instructions,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      // Include related data with proper names
      customer: booking.customer ? {
        id: booking.customer.id,
        fullName: booking.customer.full_name,
        email: booking.customer.email,
        phone: booking.customer.phone
      } : null,
      provider: booking.provider ? {
        id: booking.provider.id,
        businessName: booking.provider.business_name,
        userId: booking.provider.user_id
      } : null,
      service: booking.service ? {
        id: booking.service.id,
        name: booking.service.name,
        price: booking.service.price,
        description: booking.service.description
      } : null,
      pet: booking.pet ? {
        id: booking.pet.id,
        name: booking.pet.name,
        species: booking.pet.species,
        breed: booking.pet.breed,
        age: booking.pet.age,
        profilePicture: booking.pet.profile_picture
      } : null
    })) || []

    console.log('Transformed bookings:', transformedBookings)
    return NextResponse.json({ bookings: transformedBookings })

  } catch (error) {
    console.error('Error in bookings API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
