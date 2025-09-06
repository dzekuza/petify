import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ 
        status,
        ...(status === 'cancelled' && reason && { cancellation_reason: reason }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        customer:customers(id, full_name, email, phone),
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
      await supabase
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

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(id, full_name, email, phone, address),
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

    return NextResponse.json({ booking })

  } catch (error) {
    console.error('Error in booking fetch API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
