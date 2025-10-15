import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get user session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Extract metadata
    const { providerId, serviceId, pets, date, time, userId } = session.metadata || {}

    if (!providerId || !pets || !date || !time) {
      return NextResponse.json(
        { error: 'Invalid session metadata' },
        { status: 400 }
      )
    }

    // Verify user matches
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'User mismatch' },
        { status: 403 }
      )
    }

    // Check if booking already exists for this session
    const { data: existingBooking } = await supabaseClient
      .from('bookings')
      .select('id')
      .eq('payment_id', session.payment_intent as string)
      .single()

    if (existingBooking) {
      // Booking already created, return it
      const { data: booking } = await supabaseClient
        .from('bookings')
        .select('*')
        .eq('id', existingBooking.id)
        .single()

      return NextResponse.json({ booking, alreadyExists: true })
    }

    // Parse the time to get start and end times
    // Assuming time is in format "HH:MM" or "HH:MM-HH:MM"
    let startTime, endTime
    if (time.includes('-')) {
      const [start, end] = time.split('-')
      startTime = start.trim()
      endTime = end.trim()
    } else {
      // If only start time provided, assume 1 hour duration
      startTime = time.trim()
      const [hours, minutes] = startTime.split(':').map(Number)
      const endHours = hours + 1
      endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }

    // Parse pets from comma-separated string and get the first pet ID
    const petIds = pets.split(',').map(id => id.trim()).filter(id => id)
    const primaryPetId = petIds[0] || null

    // Create the booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        customer_id: user.id,
        provider_id: providerId,
        service_id: serviceId || null,
        pet_id: primaryPetId,
        booking_date: date,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: 60, // Default to 60 minutes, can be calculated from start/end times
        total_price: (session.amount_total || 0) / 100, // Convert from cents
        status: 'confirmed',
        payment_status: 'paid',
        payment_id: session.payment_intent as string,
        special_instructions: petIds.length > 1 ? `Multiple pets: ${pets}` : null
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({ booking, alreadyExists: false })
  } catch (error) {
    console.error('Error verifying session:', error)
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    )
  }
}

