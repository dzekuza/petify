import { NextRequest, NextResponse } from 'next/server'
import { validateWebhookSignature, handlePaymentSucceeded, handlePaymentFailed } from '@/lib/payments'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Validate webhook signature
    const event = validateWebhookSignature(body, signature, webhookSecret)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        await handlePaymentSucceeded(paymentIntent)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        await handlePaymentFailed(failedPayment)
        break

      case 'payment_intent.canceled':
        console.log('Payment canceled:', event.data.object.id)
        break

      case 'payment_intent.requires_action':
        console.log('Payment requires action:', event.data.object.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
