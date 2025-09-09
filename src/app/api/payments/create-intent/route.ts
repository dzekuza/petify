import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent, calculateBookingTotal } from '@/lib/payments'
import { STRIPE_CONFIG } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Payment intent request body:', body)
    
    const { 
      amount, 
      currency = STRIPE_CONFIG.currency, 
      bookingId, 
      customerEmail,
      serviceFee = 0.1 
    } = body

    // Validate required fields
    if (!amount || !bookingId) {
      console.error('Missing required fields:', { amount, bookingId })
      return NextResponse.json(
        { error: 'Missing required fields: amount and bookingId' },
        { status: 400 }
      )
    }

    // Calculate total with service fee
    const totalAmount = calculateBookingTotal(amount, serviceFee)
    console.log('Calculated total amount:', totalAmount)

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount: totalAmount,
      currency,
      bookingId,
      customerEmail,
      metadata: {
        serviceFee: serviceFee.toString(),
        originalAmount: amount.toString(),
      },
    })

    console.log('Payment intent created successfully:', paymentIntent.paymentIntentId)

    return NextResponse.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      totalAmount,
    })
  } catch (error: unknown) {
    console.error('Error creating payment intent:', error)
    
    // Return more specific error messages
    const errorMessage = (error as Error)?.message || 'Failed to create payment intent'
    const statusCode = errorMessage.includes('API key') ? 401 : 500
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorMessage.includes('API key') 
          ? 'Please check your Stripe configuration in .env.local' 
          : undefined
      },
      { status: statusCode }
    )
  }
}
