import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { sendBookingUpdateEmail, sendOrderDetailsEmail } from '@/lib/email'
import { authenticateRequest } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const authResult = await authenticateRequest(request)
    if (authResult.error) {
      return authResult.error
    }

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

    const supabaseAdmin = createSupabaseAdmin()
    const userId = authResult.user!.id
    const userRole = authResult.user!.role

    // Fetch the booking first to check authorization
    const { data: existingBooking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('customer_id, provider_id, provider:providers(user_id)')
      .eq('id', id)
      .single()

    if (fetchError || !existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Authorization: Only the customer, provider, or admin can update the booking
    const isCustomer = existingBooking.customer_id === userId
    const isProvider = (existingBooking.provider as unknown as { user_id: string } | null)?.user_id === userId
    const isAdmin = userRole === 'admin'

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Customers can only cancel their own bookings
    if (isCustomer && !isProvider && !isAdmin) {
      if (status !== 'cancelled') {
        return NextResponse.json(
          { error: 'Customers can only cancel bookings' },
          { status: 403 }
        )
      }
    }

    // Update booking status
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
        provider:providers(id, business_name, user_id, contact_phone, contact_email, address),
        service:services(id, name, price, description),
        pet:pets(id, name, species, breed, age)
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

    // Create notification for provider about status change
    if (booking.provider?.user_id) {
      let providerMessage = ''
      let providerType = 'booking_update'
      
      switch (status) {
        case 'confirmed':
          providerMessage = `You confirmed the booking for ${booking.service?.name}`
          providerType = 'booking_completed'
          break
        case 'cancelled':
          providerMessage = `You cancelled the booking for ${booking.service?.name}`
          providerType = 'booking_cancelled'
          break
        case 'completed':
          providerMessage = `You marked the booking for ${booking.service?.name} as completed`
          providerType = 'booking_completed'
          break
        default:
          providerMessage = `Booking status updated to ${status}`
      }

      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: booking.provider.user_id,
          title: `Booking ${status}`,
          message: providerMessage,
          type: providerType,
          data: {
            booking_id: id,
            status,
            customer_name: booking.customer?.full_name,
            service_name: booking.service?.name
          }
        })
    }

    // Send email notifications to customer
    if (booking.customer.email && booking.provider && booking.service) {
      try {
        // Send booking update notification
        await sendBookingUpdateEmail({
          customerEmail: booking.customer.email,
          customerName: booking.customer.full_name || 'Valued Customer',
          providerName: booking.provider.business_name,
          serviceName: booking.service.name,
          bookingDate: new Date(booking.booking_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          bookingTime: `${booking.start_time} - ${booking.end_time}`,
          status: status as 'confirmed' | 'cancelled' | 'completed',
          reason: status === 'cancelled' ? reason : undefined,
          bookingId: id
        })

        // Send comprehensive order details email with updated status
        if (booking.pet) {
          await sendOrderDetailsEmail({
            customerEmail: booking.customer.email,
            customerName: booking.customer.full_name || 'Valued Customer',
            providerName: booking.provider.business_name,
            providerEmail: booking.provider.contact_email || '',
            serviceName: booking.service.name,
            serviceDescription: booking.service.description || '',
            bookingDate: new Date(booking.booking_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            bookingTime: `${booking.start_time} - ${booking.end_time}`,
            totalPrice: parseFloat(booking.total_price),
            petName: booking.pet.name,
            petSpecies: booking.pet.species || '',
            petBreed: booking.pet.breed || '',
            notes: booking.special_instructions,
            bookingId: id,
            status: status as 'pending' | 'confirmed' | 'cancelled' | 'completed',
            providerContact: {
              phone: booking.provider.contact_phone || '',
              email: booking.provider.contact_email || '',
              address: booking.provider.address || ''
            }
          })
        }
      } catch (emailError) {
        console.error('Failed to send booking update emails:', emailError)
        // Don't fail the entire request if email fails
      }
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
    // Require authentication
    const authResult = await authenticateRequest(request)
    if (authResult.error) {
      return authResult.error
    }

    const { id } = await params
    const supabaseAdmin = createSupabaseAdmin()
    const userId = authResult.user!.id
    const userRole = authResult.user!.role

    // First fetch booking to check authorization
    const { data: bookingCheck, error: checkError } = await supabaseAdmin
      .from('bookings')
      .select('customer_id, provider_id, provider:providers(user_id)')
      .eq('id', id)
      .single()

    if (checkError || !bookingCheck) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Authorization: Only the customer, provider, or admin can view the booking
    const isCustomer = bookingCheck.customer_id === userId
    const isProvider = (bookingCheck.provider as unknown as { user_id: string } | null)?.user_id === userId
    const isAdmin = userRole === 'admin'

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch full booking details
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
