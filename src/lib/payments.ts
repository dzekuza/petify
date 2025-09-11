import { stripe, formatAmountForStripe, STRIPE_CONFIG } from './stripe'
import { createSupabaseAdmin } from './supabase'
import { sendPaymentConfirmationEmail } from './email'
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
    console.log('Creating payment intent with data:', {
      amount: data.amount,
      currency: data.currency,
      formattedAmount: formatAmountForStripe(data.amount, data.currency),
      bookingId: data.bookingId,
      customerEmail: data.customerEmail
    })

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

    console.log('Stripe payment intent created:', paymentIntent.id)

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error: unknown) {
    console.error('Error creating payment intent:', error)
    
    // Provide more specific error messages
    if ((error as any)?.type === 'StripeAuthenticationError') {
      throw new Error('Invalid Stripe API key. Please check your STRIPE_SECRET_KEY in .env.local')
    }
    
    if ((error as any)?.code === 'invalid_request_error') {
      throw new Error(`Stripe request error: ${(error as any).message}`)
    }
    
    throw new Error(`Failed to create payment intent: ${(error as Error)?.message || 'Unknown error'}`)
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
export const handlePaymentSucceeded = async (paymentIntent: { id: string; status: string; metadata: Record<string, string> }) => {
  try {
    const bookingId = paymentIntent.metadata?.bookingId
    if (!bookingId) {
      throw new Error('No booking ID found in payment intent metadata')
    }

    console.log(`Payment succeeded for booking ${bookingId}:`, {
      paymentIntentId: paymentIntent.id,
      amount: (paymentIntent as any).amount,
      currency: (paymentIntent as any).currency,
    })

    // Update booking status to paid and get booking details
    const supabaseAdmin = createSupabaseAdmin()
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .update({ 
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select(`
        *,
        customer:users!customer_id(id, full_name, email, phone),
        provider:providers(id, business_name, user_id, contact_phone, contact_email, address),
        service:services(id, name, price, description),
        pet:pets(id, name, species, breed, age)
      `)
      .single()

    if (bookingError) {
      console.error('Error updating booking payment status:', bookingError)
      // Don't fail the webhook if we can't update the booking
    }

    // Send payment confirmation email to customer
    if (booking?.customer?.email && booking.provider && booking.service && booking.pet) {
      try {
        const amount = (paymentIntent as any).amount / 100 // Convert from cents
        const currency = (paymentIntent as any).currency
        
        await sendPaymentConfirmationEmail(booking.customer.email, {
          customerName: booking.customer.full_name || 'Valued Customer',
          serviceName: booking.service.name,
          providerName: booking.provider.business_name,
          providerId: booking.provider.id,
          bookingDate: new Date(booking.booking_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          bookingTime: `${booking.start_time} - ${booking.end_time}`,
          totalAmount: amount,
          paymentMethod: 'Card Payment', // You could get this from payment intent if needed
          transactionId: paymentIntent.id,
          bookingId: booking.id,
          petName: booking.pet.name
        })

        console.log(`Payment confirmation email sent to ${booking.customer.email}`)
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError)
        // Don't fail the webhook if email fails
      }
    }

    return { success: true, bookingId }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
    throw error
  }
}

/**
 * Handle failed payment webhook
 */
export const handlePaymentFailed = async (paymentIntent: { id: string; status: string; metadata: Record<string, string> }) => {
  try {
    const bookingId = paymentIntent.metadata?.bookingId
    if (!bookingId) {
      throw new Error('No booking ID found in payment intent metadata')
    }

    // Here you would typically update your database to mark the booking as failed
    console.log(`Payment failed for booking ${bookingId}:`, {
      paymentIntentId: paymentIntent.id,
      lastPaymentError: (paymentIntent as any).last_payment_error,
    })

    return { success: true, bookingId }
  } catch (error) {
    console.error('Error handling payment failed:', error)
    throw error
  }
}
