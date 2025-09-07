import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent, calculateBookingTotal } from '@/lib/payments'
import { STRIPE_CONFIG } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      amount, 
      currency = STRIPE_CONFIG.currency, 
      bookingId, 
      customerEmail,
      serviceFee = 0.1 
    } = body

    // Validate required fields
    if (!amount || !bookingId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount and bookingId' },
        { status: 400 }
      )
    }

    // Calculate total with service fee
    const totalAmount = calculateBookingTotal(amount, serviceFee)

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

    return NextResponse.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      totalAmount,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
