import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status, reason } = await request.json()

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid booking status' },
        { status: 400 }
      )
    }

    // Update booking status
    const supabaseAdmin = createSupabaseAdmin()
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .update({ 
        status,
        ...(status === 'cancelled' && reason && { cancellation_reason: reason }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        customer:users!customer_id(id, full_name, email, phone),
        provider:providers(id, business_name, user_id),
        service:services(id, name, price)
      `)
      .single()

    if (error) {
      console.error('Error updating booking:', error)
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      )
    }

    // Create notification for customer
    if (booking.customer) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: booking.customer.id,
          title: `Booking ${status}`,
          message: `Your booking has been ${status}`,
          type: 'booking_update',
          data: {
            booking_id: id,
            status,
            provider_name: booking.provider?.business_name
          }
        })
    }

    return NextResponse.json({ 
      success: true, 
      booking 
    })

  } catch (error) {
    console.error('Error in booking update API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabaseAdmin = createSupabaseAdmin()
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        customer:users!customer_id(id, full_name, email, phone),
        provider:providers(id, business_name, user_id),
        service:services(id, name, price, description),
        pets:pets(id, name, species, breed, age, special_needs)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching booking:', error)
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Transform the data to match frontend expectations
    const transformedBooking = {
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
      // Include related data
      customer: booking.customer,
      provider: booking.provider,
      service: booking.service,
      pet: booking.pets // Note: the query uses 'pets' not 'pet'
    }

    return NextResponse.json({ booking: transformedBooking })

  } catch (error) {
    console.error('Error in booking fetch API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
