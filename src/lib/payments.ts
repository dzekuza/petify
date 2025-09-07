import { stripe, formatAmountForStripe, STRIPE_CONFIG } from './stripe'
import type { Booking } from '@/types'

export interface PaymentIntentData {
  amount: number
  currency: string
  bookingId: string
  customerEmail?: string
  metadata?: Record<string, string>
}

export interface CreatePaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
}

/**
 * Create a payment intent for a booking
 */
export const createPaymentIntent = async (
  data: PaymentIntentData
): Promise<CreatePaymentIntentResponse> => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(data.amount, data.currency),
      currency: data.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: data.bookingId,
        ...data.metadata,
      },
      receipt_email: data.customerEmail,
    })

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    
    // Provide more specific error messages
    if (error?.type === 'StripeAuthenticationError') {
      throw new Error('Invalid Stripe API key. Please check your STRIPE_SECRET_KEY in .env.local')
    }
    
    if (error?.code === 'invalid_request_error') {
      throw new Error(`Stripe request error: ${error.message}`)
    }
    
    throw new Error(`Failed to create payment intent: ${error?.message || 'Unknown error'}`)
  }
}

/**
 * Retrieve a payment intent by ID
 */
export const getPaymentIntent = async (paymentIntentId: string) => {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    throw new Error('Failed to retrieve payment intent')
  }
}

/**
 * Cancel a payment intent
 */
export const cancelPaymentIntent = async (paymentIntentId: string) => {
  try {
    return await stripe.paymentIntents.cancel(paymentIntentId)
  } catch (error) {
    console.error('Error canceling payment intent:', error)
    throw new Error('Failed to cancel payment intent')
  }
}

/**
 * Create a refund for a successful payment
 */
export const createRefund = async (
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
) => {
  try {
    const refundData: any = {
      payment_intent: paymentIntentId,
    }

    if (amount) {
      refundData.amount = formatAmountForStripe(amount, STRIPE_CONFIG.currency)
    }

    if (reason) {
      refundData.reason = reason
    }

    return await stripe.refunds.create(refundData)
  } catch (error) {
    console.error('Error creating refund:', error)
    throw new Error('Failed to create refund')
  }
}

/**
 * Calculate booking total with fees
 */
export const calculateBookingTotal = (baseAmount: number, serviceFee: number = 0.1): number => {
  const fee = baseAmount * serviceFee
  return Math.round((baseAmount + fee) * 100) / 100 // Round to 2 decimal places
}

/**
 * Validate webhook signature
 */
export const validateWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
) => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw new Error('Invalid webhook signature')
  }
}

/**
 * Handle successful payment webhook
 */
export const handlePaymentSucceeded = async (paymentIntent: any) => {
  try {
    const bookingId = paymentIntent.metadata?.bookingId
    if (!bookingId) {
      throw new Error('No booking ID found in payment intent metadata')
    }

    // Here you would typically update your database to mark the booking as paid
    // For now, we'll just log the successful payment
    console.log(`Payment succeeded for booking ${bookingId}:`, {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    })

    return { success: true, bookingId }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
    throw error
  }
}

/**
 * Handle failed payment webhook
 */
export const handlePaymentFailed = async (paymentIntent: any) => {
  try {
    const bookingId = paymentIntent.metadata?.bookingId
    if (!bookingId) {
      throw new Error('No booking ID found in payment intent metadata')
    }

    // Here you would typically update your database to mark the booking as failed
    console.log(`Payment failed for booking ${bookingId}:`, {
      paymentIntentId: paymentIntent.id,
      lastPaymentError: paymentIntent.last_payment_error,
    })

    return { success: true, bookingId }
  } catch (error) {
    console.error('Error handling payment failed:', error)
    throw error
  }
}
