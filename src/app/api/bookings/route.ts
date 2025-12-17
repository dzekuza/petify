import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { sendBookingConfirmationEmail, sendOrderDetailsEmail, sendProviderNotificationEmail } from '@/lib/email'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await authenticateRequest(request)
    if (authResult.error) {
      return authResult.error
    }

    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('provider_id')
    const customerId = searchParams.get('customer_id')
    const status = searchParams.get('status')

    const supabaseAdmin = createSupabaseAdmin()
    const userId = authResult.user!.id
    const userRole = authResult.user!.role

    // Authorization: Users can only view their own bookings unless they're admin
    // Providers can view bookings for their provider profile
    if (userRole !== 'admin') {
      // If customerId is specified, it must match the authenticated user
      if (customerId && customerId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // If providerId is specified, verify user owns that provider profile
      if (providerId) {
        const { data: providerData } = await supabaseAdmin
          .from('providers')
          .select('user_id')
          .or(`id.eq.${providerId},user_id.eq.${providerId}`)
          .single()

        if (!providerData || providerData.user_id !== userId) {
          // If not the provider, must be viewing as customer
          if (!customerId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
          }
        }
      }

      // If no filters specified, default to user's own bookings
      if (!customerId && !providerId) {
        // Will be filtered below
      }
    }
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

    // Get all unique pet IDs that we need to fetch
    const petIdsToFetch = new Set<string>()
    bookings?.forEach(booking => {
      let petId = booking.pet_id
      if (!booking.pet_id && booking.special_instructions?.startsWith('Pets: ')) {
        const petIdMatch = booking.special_instructions.match(/Pets: ([a-f0-9-]+)/)
        if (petIdMatch) {
          petId = petIdMatch[1]
        }
      }
      if (petId && !booking.pet) {
        petIdsToFetch.add(petId)
      }
    })

    // Fetch missing pet data
    let petsData: Record<string, any> = {}
    if (petIdsToFetch.size > 0) {
      const { data: pets } = await supabaseAdmin
        .from('pets')
        .select('id, name, species, breed, age, profile_picture')
        .in('id', Array.from(petIdsToFetch))
      
      if (pets) {
        petsData = pets.reduce((acc, pet) => {
          acc[pet.id] = pet
          return acc
        }, {} as Record<string, any>)
      }
    }

    // Transform the data to match frontend expectations
    const transformedBookings = bookings?.map(booking => {
      // Extract pet ID from special_instructions if pet_id is null
      let extractedPetId = booking.pet_id
      let cleanNotes = booking.special_instructions
      
      if (!booking.pet_id && booking.special_instructions?.startsWith('Pets: ')) {
        const petIdMatch = booking.special_instructions.match(/Pets: ([a-f0-9-]+)/)
        if (petIdMatch) {
          extractedPetId = petIdMatch[1]
          cleanNotes = null // Don't show pet ID in notes
        }
      }

      // Get pet data from booking.pet or fetched petsData
      const petData = booking.pet || (extractedPetId ? petsData[extractedPetId] : null)

      return {
        id: booking.id,
        customerId: booking.customer_id,
        providerId: booking.provider_id,
        serviceId: booking.service_id,
        petId: extractedPetId,
        date: booking.booking_date, // Transform booking_date to date
        timeSlot: {
          start: booking.start_time,
          end: booking.end_time,
          available: true
        },
        status: booking.status,
        totalPrice: parseFloat(booking.total_price),
        notes: cleanNotes,
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
        pet: petData ? {
          id: petData.id,
          name: petData.name,
          species: petData.species,
          breed: petData.breed,
          age: petData.age,
          profilePicture: petData.profile_picture
        } : null
      }
    }) || []

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
    // Require authentication
    const authResult = await authenticateRequest(request)
    if (authResult.error) {
      return authResult.error
    }

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
    const userId = authResult.user!.id

    // Authorization: Users can only create bookings for themselves
    if (customer_id !== userId && authResult.user!.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Cannot create bookings for other users' }, { status: 403 })
    }

    // Verify user owns the pet
    const { data: pet, error: petError } = await supabaseAdmin
      .from('pets')
      .select('owner_id')
      .eq('id', pet_id)
      .single()

    if (petError || !pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    if (pet.owner_id !== userId && authResult.user!.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Cannot book with a pet you do not own' }, { status: 403 })
    }

    // Verify service exists and get actual price for validation
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('id, price, provider_id')
      .eq('id', service_id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Verify service belongs to the specified provider
    if (service.provider_id !== provider_id) {
      return NextResponse.json({ error: 'Service does not belong to this provider' }, { status: 400 })
    }

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
