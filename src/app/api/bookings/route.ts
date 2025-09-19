import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { sendBookingConfirmationEmail, sendOrderDetailsEmail, sendProviderNotificationEmail } from '@/lib/email'

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

    // Filter by provider - if providerId is actually a user_id, we need to join with providers table
    if (providerId) {
      // First check if this is a user_id by looking for a provider with this user_id
      const { data: providerData } = await supabaseAdmin
        .from('providers')
        .select('id')
        .eq('user_id', providerId)
        .single()
      
      if (providerData) {
        // It's a user_id, use the provider's actual ID
        query = query.eq('provider_id', providerData.id)
      } else {
        // It's already a provider_id, use it directly
        query = query.eq('provider_id', providerId)
      }
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customer_id,
      provider_id,
      service_id,
      pet_id,
      booking_date,
      start_time,
      end_time,
      total_price,
      special_instructions
    } = body

    // Validate required fields
    if (!customer_id || !provider_id || !service_id || !pet_id || !booking_date || !start_time || !end_time || !total_price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createSupabaseAdmin()

    // Create the booking
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        customer_id,
        provider_id,
        service_id,
        pet_id,
        booking_date,
        start_time,
        end_time,
        total_price,
        special_instructions,
        status: 'pending'
      })
      .select(`
        *,
        customer:users!customer_id(id, full_name, email, phone),
        provider:providers(id, business_name, user_id, contact_phone, contact_email, address),
        service:services(id, name, price, description),
        pet:pets(id, name, species, breed, age)
      `)
      .single()

    if (error) {
      console.error('Error creating booking:', error)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Send comprehensive order details email to customer
    if (booking.customer?.email && booking.provider && booking.service && booking.pet) {
      try {
        // Send the detailed order confirmation email
        await sendBookingConfirmationEmail({
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
          totalPrice: parseFloat(booking.total_price),
          petName: booking.pet.name,
          notes: booking.special_instructions,
          bookingId: booking.id
        })

        // Send comprehensive order details email
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
          bookingId: booking.id,
          status: 'pending' as const,
          providerContact: {
            phone: booking.provider.contact_phone || '',
            email: booking.provider.contact_email || '',
            address: booking.provider.address || ''
          }
        })
      } catch (emailError) {
        console.error('Failed to send customer emails:', emailError)
        // Don't fail the entire request if email fails
      }
    }

    // Send notification email to provider
    if (booking.provider?.contact_email && booking.customer && booking.service && booking.pet) {
      try {
        await sendProviderNotificationEmail({
          providerEmail: booking.provider.contact_email,
          providerName: booking.provider.business_name,
          customerName: booking.customer.full_name || 'Valued Customer',
          customerEmail: booking.customer.email,
          customerPhone: booking.customer.phone || '',
          serviceName: booking.service.name,
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
          bookingId: booking.id
        })
      } catch (emailError) {
        console.error('Failed to send provider notification email:', emailError)
        // Don't fail the entire request if email fails
      }
    }

    // Create notification for customer
    if (booking.customer) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: booking.customer.id,
          title: 'Booking Created',
          message: `Your booking for ${booking.service?.name} has been created and is pending confirmation`,
          type: 'booking_update',
          data: {
            booking_id: booking.id,
            provider_name: booking.provider?.business_name
          }
        })
    }

    // Create notification for provider
    if (booking.provider?.user_id) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: booking.provider.user_id,
          title: 'New Booking Received',
          message: `You have received a new booking for ${booking.service?.name} from ${booking.customer?.full_name || 'a customer'}`,
          type: 'new_booking',
          data: {
            booking_id: booking.id,
            customer_name: booking.customer?.full_name,
            service_name: booking.service?.name,
            booking_date: booking.booking_date,
            booking_time: `${booking.start_time} - ${booking.end_time}`
          }
        })
    }

    // Transform the response to match frontend expectations
    const transformedBooking = {
      id: booking.id,
      customerId: booking.customer_id,
      providerId: booking.provider_id,
      serviceId: booking.service_id,
      petId: booking.pet_id,
      date: booking.booking_date,
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
      customer: booking.customer,
      provider: booking.provider,
      service: booking.service,
      pet: booking.pet
    }

    return NextResponse.json({ 
      success: true, 
      booking: transformedBooking 
    })

  } catch (error) {
    console.error('Error in booking creation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
