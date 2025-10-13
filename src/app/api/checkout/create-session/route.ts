import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { providerId, serviceId, pets, date, time, price } = await request.json()

    // Validate required fields
    if (!providerId || !pets || !date || !time || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch provider data
    const { data: providerData, error: providerError } = await supabase
      .from('providers')
      .select('business_name, id')
      .eq('id', providerId)
      .single()

    if (providerError || !providerData) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // Fetch service data if serviceId is provided
    let serviceName = 'Grooming Service'
    if (serviceId) {
      const { data: serviceData } = await supabase
        .from('services')
        .select('name')
        .eq('id', serviceId)
        .single()
      
      if (serviceData) {
        serviceName = serviceData.name
      }
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: serviceName,
              description: `${providerData.business_name} - ${date} at ${time}`,
            },
            unit_amount: formatAmountForStripe(price, 'eur'),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/providers/${providerId}/book?canceled=true`,
      metadata: {
        providerId,
        serviceId: serviceId || '',
        pets: pets.join(','),
        date,
        time,
        userId: user.id,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

